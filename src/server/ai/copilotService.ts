import type { Course, AIProvider } from '../../types.js';
import { aiRouter } from './aiRouter.js';
import { getDefaultModelForProvider } from './modelRegistry.js';
import { extractAndParseJSON } from './courseValidator.js';
import {
  processLocalCopilotChat,
  extractCourseTopicFromMessage,
  generateComprehensiveCoursePatch
} from '../../utils/localCourseEngine.js';

export interface CopilotMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CopilotChatPayload {
  messages: CopilotMessage[];
  currentCourse: Course;
  activeSection?: string;
  qaResult?: any;
  provider?: AIProvider;
  model?: string;
}

export interface CopilotChatResponse {
  message: string;
  suggestedActions?: Array<{
    id: string;
    label: string;
    actionType: string;
    payload?: any;
  }>;
  coursePatch?: Partial<Course>;
  courseBrief?: {
    ready: boolean;
    title: string;
    targetAudience: string;
    industryContext: string;
    duration: string;
    moduleCount: number;
  };
  providerUsed?: string;
  modelUsed?: string;
  fallbackUsed?: boolean;
}

function deepMergePatch<T extends Record<string, any>>(base: T, override: any): T {
  if (!override || typeof override !== 'object') return base;
  const result: any = Array.isArray(base) ? [...base] : { ...base };

  for (const key of Object.keys(override)) {
    const overVal = override[key];
    const baseVal = result[key];

    if (overVal === undefined || overVal === null || overVal === '') continue;

    if (Array.isArray(overVal)) {
      if (overVal.length === 0) continue;
      if (key === 'modules' && Array.isArray(baseVal) && baseVal.length > 0) {
        // Merge each module with the base module so requirements/scenarios are never lost
        result[key] = overVal.map((mod: any, idx: number) => {
          const fallbackMod = baseVal[idx] || baseVal[0];
          const mergedMod = deepMergePatch(fallbackMod, mod);
          // Sync learningObjectives and learningOutcomes
          if (Array.isArray(mod.learningObjectives) && mod.learningObjectives.length > 0 && !mod.learningOutcomes) {
            mergedMod.learningOutcomes = mod.learningObjectives;
          }
          // Sync coreConcepts with requirements.problemDefinition
          if (mergedMod.requirements) {
            if (mod.coreConcepts && !mod.requirements?.problemDefinition) {
              mergedMod.requirements.problemDefinition = mod.coreConcepts;
            }
            if (mod.definitionsFrameworks && !mod.requirements?.keyTerms) {
              mergedMod.requirements.keyTerms = mod.definitionsFrameworks;
            }
            if (mod.practicalExercises && !mod.requirements?.procedureSteps) {
              mergedMod.requirements.procedureSteps = mod.practicalExercises;
            }
            if (mod.aiTopicCoverage && !mod.requirements?.aiDemystification) {
              mergedMod.requirements.aiDemystification = mod.aiTopicCoverage;
            }
          }
          return mergedMod;
        });
      } else {
        result[key] = overVal;
      }
    } else if (typeof overVal === 'object') {
      result[key] = deepMergePatch(baseVal || {}, overVal);
    } else {
      result[key] = overVal;
    }
  }

  return result;
}

export async function processAIAssistedCopilotChat(
  payload: CopilotChatPayload
): Promise<CopilotChatResponse> {
  const provider: AIProvider = 'groq';
  // For Groq Copilot template building, use the fast 20B model bucket so we preserve 120B/70B TPM rate-limit quota for full Course Generation
  const model =
    payload.model && !payload.model.toLowerCase().includes('gemini')
      ? payload.model
      : 'openai/gpt-oss-20b';

  const { messages, currentCourse, activeSection = '01', qaResult } = payload;
  const lastUserMsg = (messages[messages.length - 1]?.content || '').trim();
  const lowerMsg = lastUserMsg.toLowerCase();

  // Check if user clicked the generic placeholder "I want to build a new course on..." without a topic yet
  if (/^i want to build a new course on\.{0,3}$/i.test(lowerMsg)) {
    return processLocalCopilotChat({
      messages,
      currentCourse,
      activeSection,
      qaResult
    });
  }

  // Check if this is purely a QA / compliance check request
  const isPureQACheck =
    /^(check|review|audit|verify|inspect)\s+(my\s+)?(course\s+)?(qa|quality|framework|compliance|readiness)/i.test(lowerMsg) ||
    lowerMsg === 'check qa' ||
    lowerMsg === 'check my course framework compliance';

  if (isPureQACheck) {
    return processLocalCopilotChat({
      messages,
      currentCourse,
      activeSection,
      qaResult
    });
  }

  // Determine whether the user is asking to build/populate/fill a template/course or giving a course topic
  const extractedTopic = extractCourseTopicFromMessage(lastUserMsg, messages);
  const baseGenerated = generateComprehensiveCoursePatch(extractedTopic, currentCourse);

  const systemInstruction = `You are eStudy South Africa's Master Course Architect Copilot (v9.0).
CRITICAL NON-NEGOTIABLE RULE:
- NEVER ask the user clarifying questions!
- NEVER ask "What is your target audience?", "What modules would you like?", or "Could you provide more details?".
- When the user gives you a course topic, title, or asks you to build/populate a template or course (for example: "${extractedTopic}"), you MUST IMMEDIATELY populate all 9 sections of the eStudy Master Course Template v9.0 by returning a comprehensive JSON "coursePatch" object.
- Use South African English spelling and terminology throughout (e.g., Organisation, Programme, Customisation, Analyse, POPIA Act 4 of 2013, King IV, ECSA/SANS/NQF/SETA where relevant).

Return ONLY a valid JSON object matching this exact structure:
{
  "message": "A clear markdown summary confirming that all 9 sections of the Master Course Template have been populated for '${extractedTopic}' and are ready in the Course Builder.",
  "courseBrief": {
    "ready": true,
    "title": "Full Course Title",
    "targetAudience": "Specific target roles",
    "industryContext": "South African industry & regulatory context",
    "duration": "16 Hours / 2 CPD Credits",
    "moduleCount": 3
  },
  "coursePatch": {
    "name": "Full Course Title",
    "code": "EST-XXX-01",
    "problem": {
      "targetGroup": "Specific target roles and practitioners in South Africa",
      "taskOrSkill": "Specific technical and operational skills they struggle to perform",
      "operationalImpact": "Concrete operational, financial, safety, compliance, or productivity impact",
      "rootCauses": ["Root Cause 1", "Root Cause 2", "Root Cause 3"],
      "processFailures": "Specific process or system failures",
      "skillGaps": "Specific skills or knowledge gaps",
      "constraints": "Organisational or environmental constraints",
      "aiLiteracyGap": "Specific AI literacy gap in this domain",
      "digitalReadinessLevel": "Data and digital readiness level",
      "aiEthicsComplianceRisk": "Ethical, IP, safety, or POPIA compliance risks introduced by AI use"
    },
    "research": {
      "regulatoryFramework": "Applicable South African regulations and industry standards",
      "aiToolsPlatformName": "Specific AI tools and platforms used in this domain",
      "aiEthicsFramework": "Governance and ethics framework (POPIA, King IV, domain body)",
      "caseStudyUseCases": "3 specific industry use cases or case studies",
      "learnerProfile": {
        "jobRoles": "Target job roles",
        "departments": "Target departments",
        "experienceLevels": "Experience levels",
        "existingKnowledge": "Existing domain knowledge",
        "digitalLiteracy": "Digital literacy baseline",
        "aiFamiliarity": "AI familiarity baseline",
        "workplaceEnvironment": "Workplace environment",
        "organisationalConstraints": "Organisational constraints",
        "availableToolsAndTechnology": "Available tools and technology"
      }
    },
    "structure": {
      "title": "Full Course Title",
      "code": "EST-XXX-01",
      "industryDomain": "Industry / Domain",
      "industryContext": "Industry context in South Africa",
      "targetRoles": "Target roles",
      "aiIntegrationLevel": "Applied",
      "setaNqfLevel": "NQF Level & SETA/professional alignment",
      "estimatedDuration": "16 Hours / 2 CPD Credits",
      "deliveryFormat": "Blended Digital E-Learning with Interactive Scenarios",
      "difficultyLevel": "Intermediate",
      "purposeStatement": "Clear purpose statement",
      "workplaceRelevance": "Direct workplace relevance",
      "performanceImprovement": "Expected measurable performance improvement",
      "scopeSummary": "Summary of course scope",
      "aiEraRelevance": "Why this course matters in the AI era",
      "performanceLink": "How it links to workplace performance",
      "organisationalBenefits": ["Benefit 1", "Benefit 2"],
      "employeeBenefits": ["Benefit 1", "Benefit 2"],
      "riskReductionOutcomes": ["Risk reduction 1", "Risk reduction 2"],
      "scope": "Detailed scope",
      "keyCompetencies": "Key competencies developed",
      "realWorldApplication": "Real-world workplace application",
      "aiSkillsDeveloped": "Specific AI skills developed",
      "experienceLevel": "Intermediate (2+ years experience)",
      "aiFamiliarityBaseline": "Basic",
      "aiFamiliarityExplanation": "Has heard of or casually used consumer AI with no structured workplace method.",
      "prerequisiteKnowledge": "Required prior knowledge",
      "prerequisiteExperience": "Required prior experience",
      "toolsSystems": "Required tools and systems"
    },
    "modules": [
      {
        "id": "mod-1",
        "number": 1,
        "moduleNumber": 1,
        "title": "Module 1 Title",
        "subtitle": "Module 1 Subtitle",
        "purpose": "Module 1 Purpose",
        "keySkills": ["Skill 1", "Skill 2", "Skill 3"],
        "learningObjectives": ["Objective 1", "Objective 2", "Objective 3"],
        "coreConcepts": "Detailed problem definition & core concepts",
        "definitionsFrameworks": "Key terms, definitions & frameworks",
        "rootCausesExploration": "Root causes, warning signs & impact",
        "aiTopicCoverage": "AI demystification & domain AI applications",
        "practicalExercises": "Step-by-step procedures, tools & techniques",
        "aiGovernanceElement": "Responsible AI principles & human oversight"
      },
      {
        "id": "mod-2",
        "number": 2,
        "moduleNumber": 2,
        "title": "Module 2 Title",
        "subtitle": "Module 2 Subtitle",
        "purpose": "Module 2 Purpose",
        "keySkills": ["Skill 1", "Skill 2", "Skill 3"],
        "learningObjectives": ["Objective 1", "Objective 2", "Objective 3"],
        "coreConcepts": "Core applied concepts",
        "definitionsFrameworks": "Key terms & frameworks",
        "rootCausesExploration": "Operational failure modes",
        "aiTopicCoverage": "Applied AI tools & workflows",
        "practicalExercises": "Step-by-step execution procedures",
        "aiGovernanceElement": "Human-in-the-loop verification rules"
      },
      {
        "id": "mod-3",
        "number": 3,
        "moduleNumber": 3,
        "title": "Module 3 Title",
        "subtitle": "Module 3 Subtitle",
        "purpose": "Module 3 Purpose",
        "keySkills": ["Skill 1", "Skill 2", "Skill 3"],
        "learningObjectives": ["Objective 1", "Objective 2", "Objective 3"],
        "coreConcepts": "Departmental implementation & governance",
        "definitionsFrameworks": "Rollout & compliance frameworks",
        "rootCausesExploration": "Change management & adoption barriers",
        "aiTopicCoverage": "Ongoing AI governance & model monitoring",
        "practicalExercises": "30-60-90 day rollout plan & risk matrix",
        "aiGovernanceElement": "Final professional sign-off accountability"
      }
    ]
  }
}`;

  const prompt = `User request: "${lastUserMsg}"
Extracted Course Topic: "${extractedTopic}"

Immediately generate the complete 9-section eStudy Master Course Template v9.0 specification for "${extractedTopic}". Do NOT ask any questions. Populate all fields in "coursePatch".`;

  try {
    const aiResponse = await aiRouter.execute({
      provider,
      model,
      prompt,
      systemInstruction,
      responseFormat: 'json',
      timeoutMs: 28000
    });

    const parsed = extractAndParseJSON(aiResponse.text);

    // Deep-merge AI's coursePatch on top of our complete 9-section base patch so NO field is ever left blank!
    const mergedPatch = deepMergePatch(baseGenerated.patch, parsed?.coursePatch || {});
    const finalBrief = {
      ...baseGenerated.brief,
      ...(parsed?.courseBrief || {}),
      ready: true,
      title: mergedPatch.structure?.title || mergedPatch.name || baseGenerated.brief.title
    };

    // If the AI returned a message that looks like it's asking clarifying questions instead of confirming completion, use the confirmation message
    const aiMessageText = typeof parsed?.message === 'string' ? parsed.message : '';
    const looksLikeQuestionOnly =
      !parsed?.coursePatch ||
      /\?\s*$/.test(aiMessageText.trim()) ||
      /(could you share|what is your target|can you tell me|please clarify|before i build)/i.test(aiMessageText);

    const finalMessage = looksLikeQuestionOnly ? baseGenerated.message : aiMessageText;

    return {
      message: finalMessage,
      suggestedActions: [
        {
          id: 'open-builder',
          label: '📝 View Populated Template (Sections 1–9)',
          actionType: 'open_builder',
          payload: { section: '01' }
        },
        {
          id: 'jump-sec-03',
          label: '📐 View Section 3 (Course Structure)',
          actionType: 'jump_to_section',
          payload: { section: '03' }
        },
        {
          id: 'jump-sec-04',
          label: '📂 View Section 4 (3 Modules & Scenarios)',
          actionType: 'jump_to_section',
          payload: { section: '04' }
        },
        {
          id: 'gen-full-course',
          label: '⚡ Generate Full 22–30 Page Course with AI',
          actionType: 'generate_course',
          payload: {}
        }
      ],
      coursePatch: mergedPatch,
      courseBrief: finalBrief,
      providerUsed: provider,
      modelUsed: model,
      fallbackUsed: false
    };
  } catch (err: any) {
    console.warn(`Copilot chat using ${provider}/${model} failed, engaging complete domain template generator:`, err?.message || err);

    const localResponse = processLocalCopilotChat({
      messages,
      currentCourse,
      activeSection,
      qaResult
    });

    return {
      ...localResponse,
      providerUsed: 'local_fallback',
      modelUsed: 'local-copilot-engine',
      fallbackUsed: true
    };
  }
}
