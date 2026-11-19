import type {
  Course,
  AIProvider,
  CopilotMode,
  CopilotIntent,
  CopilotAgreedRequirements
} from '../../types.js';
import type { AIRequest, AIResponse } from './types.js';
import { aiRouter } from './aiRouter.js';
import { extractAndParseJSON } from './courseValidator.js';
import {
  processLocalCopilotChat,
  extractCourseTopicFromMessage,
  generateComprehensiveCoursePatch,
  classifyCopilotIntent,
  extractRequirementsFromMessage,
  mergeAgreedRequirements
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
  agreedRequirements?: CopilotAgreedRequirements | null;
  conversationId?: string;
}

export interface CopilotChatResponse {
  mode: CopilotMode;
  intent: CopilotIntent;
  message: string;
  agreedRequirements?: CopilotAgreedRequirements | null;
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
        result[key] = overVal.map((mod: any, idx: number) => {
          const fallbackMod = baseVal[idx] || baseVal[0];
          const mergedMod = deepMergePatch(fallbackMod, mod);
          if (Array.isArray(mod.learningObjectives) && mod.learningObjectives.length > 0 && !mod.learningOutcomes) {
            mergedMod.learningOutcomes = mod.learningObjectives;
          }
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

function formatConversationTranscript(messages: CopilotMessage[]): string {
  const recent = messages.slice(-12);
  return recent
    .map((m, idx) => `[Turn ${idx + 1} - ${m.role.toUpperCase()}]: ${m.content.trim()}`)
    .join('\n\n');
}

import { getDefaultModelForProvider } from './modelRegistry.js';

export async function processAIAssistedCopilotChat(
  payload: CopilotChatPayload,
  options?: { aiExecute?: (req: AIRequest) => Promise<AIResponse> }
): Promise<CopilotChatResponse> {
  const provider: AIProvider = payload.provider === 'gemini' ? 'gemini' : 'groq';
  const requestedModel = payload.model?.trim();
  const isCompatible =
    requestedModel &&
    (provider === 'gemini'
      ? requestedModel.toLowerCase().includes('gemini')
      : !requestedModel.toLowerCase().includes('gemini'));
  const model = isCompatible
    ? requestedModel
    : getDefaultModelForProvider(provider, 'copilot');

  const executeAI = options?.aiExecute || ((req: AIRequest) => aiRouter.execute(req));

  const {
    messages,
    currentCourse,
    activeSection = '01',
    qaResult,
    agreedRequirements: incomingStoredAgreed
  } = payload;

  const lastUserMsg = ([...messages].reverse().find(m => m.role === 'user')?.content || '').trim();
  const intent = classifyCopilotIntent(lastUserMsg, messages, incomingStoredAgreed);

  // 1. QA / compliance review stays lightweight and fast
  if (intent === 'qa_check') {
    return processLocalCopilotChat({
      messages,
      currentCourse,
      activeSection,
      qaResult,
      agreedRequirements: incomingStoredAgreed
    });
  }

  // Merge user's latest message into agreedRequirements for this conversation
  const extractedReqs = extractRequirementsFromMessage(lastUserMsg, intent, incomingStoredAgreed);
  const mergedAgreed = mergeAgreedRequirements(incomingStoredAgreed, extractedReqs, intent);

  // 2. CONVERSATIONAL CHAT, BRAINSTORMING, PLANNING & REFINEMENT (NO premature course generation!)
  if (intent === 'general_chat' || intent === 'course_discussion_plan' || intent === 'course_refine') {
    const systemInstruction = `You are the eStudy South Africa AI Course Co-pilot — a helpful, knowledgeable conversational AI assistant and instructional design architect (similar to ChatGPT).

CRITICAL CONVERSATIONAL RULES:
1. You are currently in CHAT & PLANNING MODE (NOT full course generation mode).
2. Answer natural questions about education, training, technology, instructional design, brainstorming, or South African workplace standards directly, clearly, and conversationally.
3. Read the entire conversation transcript and current "agreedRequirements" JSON carefully so you answer follow-up questions accurately and NEVER forget prior user requirements (e.g., beginner level, specific topics, or "make it more practical").
4. If the user is planning or refining a course:
   - Help shape clear learning objectives, suggest realistic module outlines, or ask focused clarifying questions ONLY if critical info is missing.
   - Refine the plan iteratively when they give feedback.
   - Do NOT populate or overwrite the 9-section template yet, and do NOT generate a full course until the user explicitly confirms (e.g., "Please create the course").
5. Never invent fake NQF unit standard numbers or statistics. Use South African English (Organisation, Programme, Customisation, Analyse).

Return ONLY a valid JSON object matching this schema:
{
  "message": "Your helpful, well-formatted Markdown response to the user (natural conversation, explanations, brainstormed ideas, or suggested module outline).",
  "updatedRequirements": {
    "subject": "Active course subject if discussing/planning a course, else empty string",
    "title": "Proposed course title if applicable",
    "targetAudience": "Target learner profile if known",
    "difficultyLevel": "Foundational | Intermediate | Advanced | ''",
    "duration": "Estimated duration if discussed",
    "moduleCount": 4,
    "learningGoals": ["Goal 1", "Goal 2"],
    "practicalFocus": "Practical/hands-on emphasis if discussed",
    "moduleOutlines": [
      { "number": 1, "title": "Suggested Module 1 Title", "purpose": "Brief focus" }
    ]
  }
}`;

    const prompt = `Conversation Transcript:
${formatConversationTranscript(messages)}

Current Agreed Course Requirements State (from THIS conversation only):
${mergedAgreed ? JSON.stringify(mergedAgreed, null, 2) : 'None yet (general conversation or fresh topic).'}

Current Detected Intent: ${intent}
Active Course Builder Context (only reference if user asks about their workspace): "${currentCourse?.structure?.title || currentCourse?.name || 'Untitled Course'}" (Section ${activeSection})

Respond naturally to the user's latest message: "${lastUserMsg}"`;

    try {
      const aiResponse = await executeAI({
        provider,
        model,
        prompt,
        systemInstruction,
        responseFormat: 'json',
        timeoutMs: 22000,
        maxTokens: 2048
      });

      const parsed = extractAndParseJSON(aiResponse.text);
      const replyMessage =
        typeof parsed?.message === 'string' && parsed.message.trim().length > 0
          ? parsed.message.trim()
          : aiResponse.text.trim();

      let finalAgreed = mergedAgreed;
      if (parsed?.updatedRequirements && typeof parsed.updatedRequirements === 'object') {
        const cleanedAIReqs: Partial<CopilotAgreedRequirements> = {};
        if (typeof parsed.updatedRequirements.subject === 'string' && parsed.updatedRequirements.subject.trim()) {
          cleanedAIReqs.subject = parsed.updatedRequirements.subject.trim();
        }
        if (typeof parsed.updatedRequirements.title === 'string' && parsed.updatedRequirements.title.trim()) {
          cleanedAIReqs.title = parsed.updatedRequirements.title.trim();
        }
        if (typeof parsed.updatedRequirements.targetAudience === 'string' && parsed.updatedRequirements.targetAudience.trim()) {
          cleanedAIReqs.targetAudience = parsed.updatedRequirements.targetAudience.trim();
        }
        if (['Foundational', 'Intermediate', 'Advanced'].includes(parsed.updatedRequirements.difficultyLevel)) {
          cleanedAIReqs.difficultyLevel = parsed.updatedRequirements.difficultyLevel;
        }
        if (typeof parsed.updatedRequirements.duration === 'string' && parsed.updatedRequirements.duration.trim()) {
          cleanedAIReqs.duration = parsed.updatedRequirements.duration.trim();
        }
        if (typeof parsed.updatedRequirements.moduleCount === 'number' && parsed.updatedRequirements.moduleCount >= 2) {
          cleanedAIReqs.moduleCount = Math.min(6, parsed.updatedRequirements.moduleCount);
        }
        if (Array.isArray(parsed.updatedRequirements.learningGoals) && parsed.updatedRequirements.learningGoals.length > 0) {
          cleanedAIReqs.learningGoals = parsed.updatedRequirements.learningGoals.filter((g: any) => typeof g === 'string' && g.trim());
        }
        if (typeof parsed.updatedRequirements.practicalFocus === 'string' && parsed.updatedRequirements.practicalFocus.trim()) {
          cleanedAIReqs.practicalFocus = parsed.updatedRequirements.practicalFocus.trim();
        }
        if (Array.isArray(parsed.updatedRequirements.moduleOutlines) && parsed.updatedRequirements.moduleOutlines.length > 0) {
          cleanedAIReqs.moduleOutlines = parsed.updatedRequirements.moduleOutlines;
        }
        if (Object.keys(cleanedAIReqs).length > 0) {
          finalAgreed = mergeAgreedRequirements(mergedAgreed, cleanedAIReqs, intent);
        }
      }

      const suggestedActions = finalAgreed?.subject
        ? [
            {
              id: 'confirm-create-from-plan',
              label: '✅ Create Course in Template Now',
              actionType: 'send_prompt',
              payload: { prompt: 'That sounds good. Please create the course.' }
            }
          ]
        : undefined;

      return {
        mode: 'chat',
        intent,
        message: replyMessage,
        agreedRequirements: finalAgreed,
        suggestedActions,
        providerUsed: aiResponse.provider || provider,
        modelUsed: aiResponse.model || model,
        fallbackUsed: false
      };
    } catch (err: any) {
      console.warn(`Conversational Copilot AI error, falling back cleanly:`, err?.message || err);
      const localResponse = processLocalCopilotChat({
        messages,
        currentCourse,
        activeSection,
        qaResult,
        agreedRequirements: incomingStoredAgreed
      });
      return {
        ...localResponse,
        providerUsed: 'local_fallback',
        modelUsed: 'local-copilot-engine',
        fallbackUsed: true
      };
    }
  }

  // 3. EXPLICIT COURSE CREATION MODE (User explicitly asked to build/populate/create the course or template)
  const extractedTopic = extractCourseTopicFromMessage(lastUserMsg, messages, mergedAgreed);
  const finalAgreed: CopilotAgreedRequirements = mergedAgreed || {
    subject: extractedTopic,
    title: extractedTopic,
    readyToCreate: true
  };
  finalAgreed.readyToCreate = true;

  const baseGenerated = generateComprehensiveCoursePatch(extractedTopic, undefined, finalAgreed);

  const systemInstruction = `You are eStudy South Africa's Master Course Architect Copilot (v9.0).
The user has EXPLICITLY requested to build/create the 9-section Master Course Template for: "${extractedTopic}".

CRITICAL NON-NEGOTIABLE RULES:
1. Honour ALL agreed requirements from this conversation:
   ${JSON.stringify(finalAgreed, null, 2)}
2. Immediately populate all 9 sections in "coursePatch" cleanly without asking any more clarifying questions.
3. Keep 100% subject fidelity to "${extractedTopic}" — ZERO drift into unrelated industries!
4. Do NOT fabricate South African NQF unit standard numbers or statistics; mark unverified accreditation specifics as "To Be Confirmed (Requires SME Validation)".
5. Use South African English spelling (Organisation, Programme, Customisation, Analyse).

Return ONLY a valid JSON object matching this exact structure:
{
  "message": "Markdown confirmation summarising the populated 9 sections and how agreed requirements were applied.",
  "courseBrief": {
    "ready": true,
    "title": "Full Course Title",
    "targetAudience": "Specific target roles",
    "industryContext": "South African industry context",
    "duration": "${finalAgreed.duration || '16 Hours / 2 CPD Credits'}",
    "moduleCount": ${baseGenerated.patch.modules?.length || 3}
  },
  "coursePatch": {
    "name": "Full Course Title",
    "code": "EST-XXX-01",
    "problem": {
      "targetGroup": "...",
      "taskOrSkill": "...",
      "operationalImpact": "...",
      "rootCauses": ["...", "...", "..."],
      "processFailures": "...",
      "skillGaps": "...",
      "constraints": "...",
      "aiLiteracyGap": "...",
      "digitalReadinessLevel": "...",
      "aiEthicsComplianceRisk": "..."
    },
    "research": {
      "regulatoryFramework": "...",
      "aiToolsPlatformName": "...",
      "aiEthicsFramework": "...",
      "caseStudyUseCases": "...",
      "learnerProfile": {
        "jobRoles": "...",
        "departments": "...",
        "experienceLevels": "...",
        "existingKnowledge": "...",
        "digitalLiteracy": "...",
        "aiFamiliarity": "...",
        "workplaceEnvironment": "...",
        "organisationalConstraints": "...",
        "availableToolsAndTechnology": "..."
      }
    },
    "structure": {
      "title": "...",
      "code": "...",
      "industryDomain": "...",
      "industryContext": "...",
      "targetRoles": "...",
      "aiIntegrationLevel": "Applied",
      "setaNqfLevel": "...",
      "estimatedDuration": "${finalAgreed.duration || '16 Hours / 2 CPD Credits'}",
      "deliveryFormat": "...",
      "difficultyLevel": "${finalAgreed.difficultyLevel || 'Intermediate'}",
      "purposeStatement": "...",
      "workplaceRelevance": "...",
      "performanceImprovement": "...",
      "scopeSummary": "...",
      "aiEraRelevance": "...",
      "performanceLink": "...",
      "organisationalBenefits": ["...", "..."],
      "employeeBenefits": ["...", "..."],
      "riskReductionOutcomes": ["...", "..."],
      "scope": "...",
      "keyCompetencies": "...",
      "realWorldApplication": "...",
      "aiSkillsDeveloped": "...",
      "experienceLevel": "...",
      "aiFamiliarityBaseline": "Basic",
      "aiFamiliarityExplanation": "...",
      "prerequisiteKnowledge": "...",
      "prerequisiteExperience": "...",
      "toolsSystems": "..."
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
        "coreConcepts": "...",
        "definitionsFrameworks": "...",
        "rootCausesExploration": "...",
        "aiTopicCoverage": "...",
        "practicalExercises": "...",
        "aiGovernanceElement": "..."
      }
    ]
  }
}`;

  const prompt = `Conversation Context:
${formatConversationTranscript(messages)}

Agreed Course Requirements:
${JSON.stringify(finalAgreed, null, 2)}

Target Course Topic: "${extractedTopic}"

Populate the complete 9-section eStudy Master Course Template v9.0 now, incorporating every agreed requirement.`;

  try {
    const aiResponse = await executeAI({
      provider,
      model,
      prompt,
      systemInstruction,
      responseFormat: 'json',
      timeoutMs: 28000,
      maxTokens: 3600
    });

    const parsed = extractAndParseJSON(aiResponse.text);
    const mergedPatch = deepMergePatch(baseGenerated.patch, parsed?.coursePatch || {});

    // Enforce explicitly agreed requirements so AI never drops them
    if (finalAgreed.difficultyLevel && mergedPatch.structure) {
      mergedPatch.structure.difficultyLevel = finalAgreed.difficultyLevel;
    }
    if (finalAgreed.targetAudience && mergedPatch.problem && mergedPatch.structure) {
      if (!mergedPatch.problem.targetGroup) mergedPatch.problem.targetGroup = finalAgreed.targetAudience;
      if (!mergedPatch.structure.targetRoles) mergedPatch.structure.targetRoles = finalAgreed.targetAudience;
    }

    const finalBrief = {
      ...baseGenerated.brief,
      ...(parsed?.courseBrief || {}),
      ready: true,
      title: mergedPatch.structure?.title || mergedPatch.name || baseGenerated.brief.title,
      moduleCount: mergedPatch.modules?.length || baseGenerated.brief.moduleCount
    };

    const aiMessageText = typeof parsed?.message === 'string' ? parsed.message : '';
    const looksLikeQuestionOnly =
      !parsed?.coursePatch ||
      /\?\s*$/.test(aiMessageText.trim()) ||
      /(could you share|what is your target|can you tell me|please clarify|before i build)/i.test(aiMessageText);

    const finalMessage = looksLikeQuestionOnly ? baseGenerated.message : aiMessageText;

    return {
      mode: 'course_creation',
      intent: 'course_create',
      agreedRequirements: finalAgreed,
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
          label: '📂 View Section 4 (Modules & Scenarios)',
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
      providerUsed: aiResponse.provider || provider,
      modelUsed: aiResponse.model || model,
      fallbackUsed: false
    };
  } catch (err: any) {
    console.warn(`Copilot course creation with ${provider}/${model} failed, engaging local domain template generator:`, err?.message || err);

    const localResponse = processLocalCopilotChat({
      messages,
      currentCourse,
      activeSection,
      qaResult,
      agreedRequirements: finalAgreed
    });

    return {
      ...localResponse,
      providerUsed: 'local_fallback',
      modelUsed: 'local-copilot-engine',
      fallbackUsed: true
    };
  }
}

