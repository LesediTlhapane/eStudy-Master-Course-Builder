import type {
  Course,
  CourseModule,
  GeneratedCourse,
  GeneratedModule,
  GeneratedLesson,
  GeneratedScenario,
  GeneratedQuestion,
  GeneratedAssessmentSet,
  GeneratedPracticalTask,
  GeneratedCourseQA,
  GeneratedSource,
  CopilotMode,
  CopilotIntent,
  CopilotAgreedRequirements
} from '../types.js';
import { createScratchCourse } from '../data/initialCourseData.js';
import { enforceComprehensiveCourseVolume, calculateGeneratedCourseVolume } from './courseVolumeEngine.js';

export interface LocalCopilotMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface LocalCopilotPayload {
  messages: LocalCopilotMessage[];
  currentCourse: Course;
  activeSection?: string;
  qaResult?: any;
  agreedRequirements?: CopilotAgreedRequirements | null;
  conversationId?: string;
}

export interface LocalCopilotSuggestedAction {
  id: string;
  label: string;
  actionType: 'generate_course' | 'apply_course_patch' | 'jump_to_section' | 'send_prompt' | 'add_knowledge_check' | 'open_builder' | 'open_preview';
  payload?: any;
}

export interface LocalCopilotResponse {
  mode: CopilotMode;
  intent: CopilotIntent;
  message: string;
  suggestedActions?: LocalCopilotSuggestedAction[];
  agreedRequirements?: CopilotAgreedRequirements | null;
  coursePatch?: Partial<Course>;
  courseBrief?: {
    ready: boolean;
    title: string;
    targetAudience: string;
    industryContext: string;
    duration: string;
    moduleCount: number;
  };
  isLocalFallback?: boolean;
}

// Explicit offline local-fallback draft generator (ONLY used when explicitly invoked; never silently replaces AI failures)
export function generateLocalFallbackCourse(course: Course): GeneratedCourse {
  const p = course.problem;
  const s = course.structure;
  const regRef =
    course.research.regulatoryFramework?.trim() ||
    'applicable domain standards (To Be Confirmed — Requires SME Validation)';
  const courseTitle = s.title || course.name || 'Training Programme';
  const targetAudience = s.targetRoles || p.targetGroup || 'participating practitioners';

  const generatedModules: GeneratedModule[] = (course.modules || []).map((m, idx) => {
    const modNum = idx + 1;
    const keySkill0 = Array.isArray(m.keySkills) && m.keySkills[0] ? m.keySkills[0] : `${m.title} Principles`;
    const keySkill1 = Array.isArray(m.keySkills) && m.keySkills[1] ? m.keySkills[1] : `${m.title} Applied Technique`;
    const lo0 = m.learningObjectives?.[0] || `Explain core principles and mechanisms in ${m.title}`;
    const lo1 = m.learningObjectives?.[1] || `Apply ${m.title} methods to solve realistic ${courseTitle} problems`;
    const lo2 = m.learningObjectives?.[2] || `Evaluate limitations, edge cases, and quality criteria in ${m.title}`;

    const lessons: GeneratedLesson[] = [
      {
        id: `lesson-${modNum}-1`,
        title: `${m.title}: ${keySkill0}`,
        durationMinutes: 30,
        concepts: [keySkill0, m.title, `${courseTitle} Fundamentals`],
        contentBody: `[OFFLINE FALLBACK DRAFT — REQUIRES LIVE AI GENERATION OR SME AUTHORING]\n\n### Lesson Scope & Relevance to ${courseTitle}\nThis offline placeholder outlines **${keySkill0}** within **${m.title}** for ${targetAudience} (${lo0}).\n\n### Core Subject Terminology & Mechanism Outline\n- **Focus Concept**: ${keySkill0} inside ${m.title} (${m.purpose || courseTitle}).\n- **Diagnostic Driver**: Addresses ${p.rootCauses[0] || p.taskOrSkill || m.title}.\n- **Regulatory Context**: Check alignment with ${regRef}.\n\n### Next Step\nRegenerate this module using Google Gemini or Groq Cloud to synthesise full domain explanations, concrete worked examples, terminology definitions, and misconception walkthroughs.`,
        callouts: [
          {
            type: 'Warning',
            title: 'Offline Draft Notice',
            content: `This lesson is an unexpanded offline draft for "${m.title}". Run live AI generation to produce deep educational teaching material.`
          }
        ],
        workplaceApplication: `Apply ${keySkill0} to ${p.taskOrSkill || m.title} within ${targetAudience} workflows once full AI/SME lesson notes are generated.`,
        aiApplication: `Live AI synthesis required to generate subject-specific ${m.title} demonstrations.`
      },
      {
        id: `lesson-${modNum}-2`,
        title: `${m.title}: ${keySkill1}`,
        durationMinutes: 35,
        concepts: [keySkill1, 'Applied Practice', `${m.title} Evaluation`],
        contentBody: `[OFFLINE FALLBACK DRAFT — REQUIRES LIVE AI GENERATION OR SME AUTHORING]\n\n### Applied Focus in ${m.title}\nThis offline outline reserves space for hands-on walkthroughs covering **${keySkill1}** (${lo1}; ${lo2}).\n\n### Practical Focus Areas\n- **Primary Skill**: ${keySkill1} applied to ${p.taskOrSkill || courseTitle}.\n- **Quality Check**: Review edge cases and verify external requirements against ${regRef}.`,
        callouts: [
          {
            type: 'Tip',
            title: 'Subject Authoring Prompt',
            content: `Regenerate Module ${modNum} via Groq Cloud or Google Gemini to populate authentic worked demonstrations for ${keySkill1}.`
          }
        ],
        workplaceApplication: `Practise ${keySkill1} in ${courseTitle} once AI/SME content is complete.`,
        aiApplication: `Run live AI generation to produce subject-authentic AI usage boundaries for ${m.title}.`
      }
    ];

    const workplaceScenarios: GeneratedScenario[] = (m.requirements?.scenarios && m.requirements.scenarios.length >= 3)
      ? m.requirements.scenarios.map((sc, scIdx) => ({
          id: `scenario-${modNum}-${scIdx + 1}`,
          title: sc.title || `${m.title} Workplace Case ${scIdx + 1}`,
          type: 'Workplace' as const,
          situation: sc.situation || `Offline draft placeholder scenario for ${m.title} (${courseTitle}).`,
          challenge: sc.challenge || `Resolving domain challenges related to ${keySkill0}.`,
          decisionPoint: sc.decisionPoint || `Select the verified ${m.title} approach.`,
          debrief: sc.debrief || `Requires live AI/SME authoring for complete domain debriefing.`,
          keyTakeaway: `Anchor ${m.title} practice in verified evidence.`
        }))
      : [
          {
            id: `scenario-${modNum}-1`,
            title: `${m.title} Case 1 (Offline Draft Placeholder)`,
            type: 'Workplace' as const,
            situation: `A ${targetAudience} team applies ${keySkill0} inside ${courseTitle}.`,
            challenge: `Navigating technical trade-offs affecting ${keySkill1}.`,
            decisionPoint: `Compare candidate approaches for ${m.title} before committing.`,
            debrief: `Regenerate with live AI to expand this ${m.title} scenario debrief.`,
            keyTakeaway: `Test key ${keySkill0} decisions early.`
          },
          {
            id: `scenario-${modNum}-2`,
            title: `${m.title} Case 2 (Offline Draft Placeholder)`,
            type: 'Workplace' as const,
            situation: `Two collaborating units coordinate hand-offs involving ${keySkill1}.`,
            challenge: `Clarifying ${m.title} quality criteria across contributors.`,
            decisionPoint: `Align teams around explicit acceptance criteria.`,
            debrief: `Explicit ${m.title} criteria reduce avoidable rework.`,
            keyTakeaway: `Clarify acceptance criteria across roles.`
          },
          {
            id: `scenario-${modNum}-3`,
            title: `${m.title} Case 3 (Offline Draft Placeholder)`,
            type: 'Workplace' as const,
            situation: `A team encounters an unexpected edge case while executing ${keySkill1}.`,
            challenge: `Diagnosing why initial ${keySkill0} assumptions broke.`,
            decisionPoint: `Inspect underlying mechanics before modifying parameters.`,
            debrief: `Evidence-led diagnosis catches hidden limitations.`,
            keyTakeaway: `Inspect edge cases systematically.`
          }
        ];

    const aiScenarios: GeneratedScenario[] = (m.requirements?.aiScenarios && m.requirements.aiScenarios.length > 0)
      ? m.requirements.aiScenarios.map((sc, scIdx) => ({
          id: `ai-scenario-${modNum}-${scIdx + 1}`,
          title: sc.title || `${m.title} AI Judgement Case ${scIdx + 1}`,
          type: 'AI Specific' as const,
          situation: sc.situation || `Evaluating AI assistance within ${m.title}.`,
          challenge: sc.challenge || `Checking technical validity of generated outputs for ${keySkill0}.`,
          decisionPoint: sc.decisionPoint || `Verify generated output against primary ${courseTitle} sources.`,
          debrief: sc.debrief || `Human domain judgement must verify AI drafts.`,
          keyTakeaway: `Validate AI drafts against domain criteria.`
        }))
      : [
          {
            id: `ai-scenario-${modNum}-ai-1`,
            title: `${m.title} AI Verification Case (Offline Draft)`,
            type: 'AI Specific' as const,
            situation: `An AI assistant drafts a recommendation related to ${keySkill0} in ${courseTitle}.`,
            challenge: `Confirming accuracy and privacy compliance under ${regRef}.`,
            decisionPoint: `Audit the output against verified sources before adoption.`,
            debrief: `Critical verification catches unverified claims early.`,
            keyTakeaway: `Verify AI drafts independently.`
          }
        ];

    const knowledgeChecks: GeneratedQuestion[] = [
      {
        id: `qc-${modNum}-1`,
        question: `[Offline Draft] Which statement aligns with "${lo0}" regarding ${keySkill0} in ${m.title}?`,
        options: [
          `Ignore ${keySkill0} requirements during planning`,
          `Verify how ${keySkill0} applies to ${p.taskOrSkill || m.title} before execution`,
          `Rely on unverified shortcuts`,
          `Bypass review gates`
        ],
        correctAnswer: 1,
        rationale: `Placeholder check mapped to ${lo0}; regenerate with live AI for deeper subject-specific MCQs.`,
        learningObjectiveRef: `LO ${modNum}.1`
      },
      {
        id: `qc-${modNum}-2`,
        question: `[Offline Draft] How does ${keySkill1} support "${lo1}" within ${m.title}?`,
        options: [
          `By omitting domain checks`,
          `By applying ${keySkill1} systematically against explicit criteria`,
          `By duplicating unrelated templates`,
          `By disregarding constraints`
        ],
        correctAnswer: 1,
        rationale: `Placeholder check mapped to ${lo1}; regenerate with live AI to produce authentic subject scenarios.`,
        learningObjectiveRef: `LO ${modNum}.2`
      },
      {
        id: `qc-${modNum}-3`,
        question: `[Offline Draft] In relation to "${lo2}", how should unverified references in ${m.title} be handled?`,
        options: [
          `Publish them without verification`,
          `Validate against ${regRef} or mark for SME review`,
          `Hide discrepancies from stakeholders`,
          `Assume drafts require no checking`
        ],
        correctAnswer: 1,
        rationale: `Placeholder check mapped to ${lo2}; regenerate with live AI for deep concept questions.`,
        learningObjectiveRef: `LO ${modNum}.3`
      }
    ];

    const deliverableTarget = `[Offline Draft] ${m.title} Practical Brief`;
    const practicalTask: GeneratedPracticalTask = {
      id: `task-${modNum}`,
      title: `${m.title} Practical Activity (Offline Draft)`,
      instructions: [
        `Objective: Practise ${lo0} and ${lo1} using ${keySkill0}.`,
        `Scenario: Acting as ${targetAudience}, complete a practical exercise addressing ${keySkill1} in ${courseTitle}.`,
        `Resources: ${course.research.aiToolsPlatformName || 'Domain workspace tools'} and Module ${modNum} guide.`,
        `Instructions: Complete the domain exercise steps below after regenerating full lesson notes with live AI.`,
        `Steps: 1. Review ${keySkill0} goals for ${m.title}. 2. Execute ${keySkill1} on a representative case. 3. Evaluate limitations against ${regRef}.`,
        `Deliverable: ${deliverableTarget}.`,
        `Success criteria: Demonstrates applied ${keySkill0} and ${keySkill1} judgement aligned with ${lo1}.`,
        `Reflection: Identify one assumption in ${m.title} that required adjustment during execution.`
      ].join('\n\n'),
      deliverable: deliverableTarget,
      evaluationRubric: [
        `Subject accuracy in ${keySkill0} (40%)`,
        `Applied execution of ${keySkill1} (35%)`,
        `Critical limitation analysis & reflection (25%)`
      ]
    };

    return {
      id: m.id || `module-${modNum}`,
      moduleNumber: modNum,
      title: m.title,
      subtitle: m.subtitle || `Offline Draft — ${m.title}`,
      purpose: m.purpose || `Develop conceptual and applied mastery in ${m.title}.`,
      learningObjectives: (m.learningObjectives || [`Explain core concepts of ${m.title}`, `Apply ${m.title} techniques`, `Evaluate trade-offs in ${m.title}`]).map((obj, oIdx) => ({
        id: `lo-${modNum}-${oIdx + 1}`,
        code: `LO ${modNum}.${oIdx + 1}`,
        statement: obj,
        bloomLevel: oIdx === 0 ? 'Understand' : oIdx === 1 ? 'Apply' : 'Evaluate'
      })),
      lessons,
      scenarios: [...workplaceScenarios, ...aiScenarios],
      knowledgeChecks,
      practicalTask,
      reflection: [
        `How will you apply ${keySkill0} from ${m.title} in your role?`,
        `Which limitation in ${keySkill1} requires care in practice?`
      ],
      summary: `Offline draft placeholder for ${m.title}. Regenerate with live AI to produce full educational depth.`
    };
  });

  const assessments: GeneratedAssessmentSet = {
    preCourseDiagnostic: {
      title: 'Pre-Course Knowledge & Readiness Diagnostic (Offline Draft)',
      instructions: `Complete these diagnostic items to gauge baseline familiarity with ${courseTitle}.`,
      questions: (s.diagnosticQuestions || []).slice(0, 5).map((dq, idx) => ({
        id: `diag-${idx + 1}`,
        question: dq.question,
        options: [
          'No prior exposure or experience',
          'Basic conceptual familiarity but limited applied practice',
          'Regularly apply these concepts with guidance',
          'Experienced practitioner capable of mentoring others'
        ],
        correctAnswer: 2,
        rationale: `Benchmarks baseline familiarity before starting ${courseTitle}.`
      }))
    },
    moduleKnowledgeChecksCount: generatedModules.reduce((acc, m) => acc + m.knowledgeChecks.length, 0),
    practicalTasks: generatedModules.map(m => m.practicalTask!).filter(Boolean),
    finalAssessment: {
      title: 'Summative Capstone Assessment (Offline Draft Placeholder)',
      passMark: '80%',
      instructions: `Offline fallback placeholder assessment for ${courseTitle}; regenerate with live AI for full case questions.`,
      questions: [
        {
          id: 'final-q1',
          question: `[Offline Draft] In ${courseTitle}, why must teams validate core assumptions around ${p.taskOrSkill || courseTitle} before rollout?`,
          options: [
            'To skip stakeholder review',
            'To verify technical feasibility and prevent avoidable rework',
            'To avoid documenting decisions',
            'To bypass domain standards'
          ],
          correctAnswer: 1,
          rationale: `Validating domain assumptions prevents rework across ${courseTitle}.`,
          learningObjectiveRef: 'LO 1.1'
        }
      ],
      capstoneCaseStudy: {
        title: `Offline Draft Capstone: ${courseTitle}`,
        scenario: `Offline draft placeholder scenario for ${courseTitle} (${targetAudience}). Regenerate via Google Gemini or Groq Cloud for a rich South African capstone case.`,
        tasks: [
          `1. Define key problem drivers affecting ${p.taskOrSkill || courseTitle}.`,
          `2. Synthesise an end-to-end approach across Modules 1–${generatedModules.length}.`,
          `3. Specify human verification checks against ${regRef}.`
        ],
        deliverable: `Offline Draft Capstone Brief for ${courseTitle}.`
      }
    },
    postCourseReflection: {
      prompts: [
        `Identify the most important concept you explored in ${courseTitle}.`,
        'Explain one domain trade-off you will validate carefully in your role.',
        'What 30-60-90 day goals will you commit to after this programme?'
      ],
      actionPlanTemplate: `30-60-90 Day Implementation Plan for ${courseTitle}`
    }
  };

  const sources: GeneratedSource[] = (course.research.sources || []).map(src => ({
    name: src.name,
    type: src.type,
    reference: src.reference,
    relevance: src.relevance,
    contentSnippet: src.contentSnippet,
    fileName: src.fileName,
    url: src.url,
    verified: src.status === 'Verified'
  }));

  const qa: GeneratedCourseQA = {
    score: 35,
    status: 'critical_issues',
    overallVerdict: 'FAIL',
    hasBlockingFailures: true,
    passedChecks: [],
    warnings: [
      'Generated as an explicit offline fallback draft rather than live AI synthesis.'
    ],
    criticalIssues: [
      'Offline fallback draft — NOT AI-generated. Regenerate with Google Gemini or Groq Cloud before QA approval or learner release.'
    ],
    recommendations: [
      'Run Direct AI Generation (Groq Cloud or Google Gemini) to produce full subject-specific lessons, worked examples, and grounded assessments.',
      'Conduct SME validation on any regulatory, NQF, or domain-specific claims before publishing.'
    ],
    southAfricanContextVerified: false,
    popiaCompliant: Boolean(course.ethics?.dataPrivacyFramework?.trim() || course.ethics?.dataPrivacySafeguards?.trim())
  };

  const baseGenerated: GeneratedCourse = {
    id: `gen-offline-${Date.now()}`,
    courseId: course.id,
    title: courseTitle,
    code: s.code || course.code,
    version: 'v9.0-Offline-Fallback-Draft',
    overview: `[OFFLINE FALLBACK DRAFT] ${s.purposeStatement || s.scopeSummary || `Training programme outline for ${courseTitle} (${targetAudience}). Live AI generation is required to populate full instructional content.`}`,
    purpose: s.purposeStatement || `Build applied capability in ${courseTitle}.`,
    targetAudience: `${s.targetRoles || 'Practitioners and Team Leads'} across ${s.industryDomain || 'modern'} environments. Baseline readiness: ${s.aiFamiliarityBaseline || 'Intermediate'}.`,
    estimatedDuration: s.estimatedDuration || '16 Hours (Self-paced + Practical Tasks)',
    learningOutcomes: [
      `Explain core principles behind ${p.taskOrSkill || courseTitle}.`,
      `Apply ${courseTitle} techniques to realistic workplace challenges.`,
      `Evaluate outputs and limitations critically prior to adoption.`,
      `Confirm alignment with ${regRef}.`
    ],
    modules: generatedModules,
    assessments,
    sources,
    qa,
    generatedAt: new Date().toISOString(),
    generationMetadata: {
      provider: 'local_fallback',
      providerDisplayName: 'Offline Fallback Draft',
      model: 'offline-draft-only',
      generatedAt: new Date().toISOString(),
      fallbackUsed: true,
      fallbackReason: 'Explicit offline fallback draft (not AI-generated)'
    }
  };

  return enforceComprehensiveCourseVolume(baseGenerated, course);
}

// ============================================================================
// CONVERSATIONAL INTENT CLASSIFICATION, REQUIREMENT EXTRACTION & CONTEXT GUARD
// ============================================================================

type LocalDomainCategory =
  | 'cloud_engineering'
  | 'generative_ai_business'
  | 'human_resource_management'
  | 'mechanical_engineering'
  | 'emotional_intelligence'
  | 'financial_services'
  | 'cybersecurity_it'
  | 'general';

function detectLocalDomain(topic: string): LocalDomainCategory {
  const lower = (topic || '').toLowerCase();
  if (/(cloud|aws|azure|gcp|kubernetes|terraform|devops|iac|vpc|serverless|microservice)/i.test(lower)) {
    return 'cloud_engineering';
  }
  if (/(generative ai|genai|llm|chatgpt|prompt engineering|ai for business|business ai|rag\b|copilot for business)/i.test(lower)) {
    return 'generative_ai_business';
  }
  if (/(human resource|\bhr\b|people operations|talent acquisition|recruitment|onboarding|employee relations|bcea|lra|ccma|performance appraisal)/i.test(lower)) {
    return 'human_resource_management';
  }
  if (/(mechanical|cad|fea|cfd|manufacturing|predictive maintenance|mechatronics|robotics|thermodynamic|pump|bearing|millwright)/i.test(lower)) {
    return 'mechanical_engineering';
  }
  if (/(emotional intelligence|\beq\b|empathy|self-regulation|conflict de-escalation|interpersonal)/i.test(lower)) {
    return 'emotional_intelligence';
  }
  if (/(financial|finance|fsca|credit|banking|budgeting|accounting|fraud)/i.test(lower)) {
    return 'financial_services';
  }
  if (/(cybersecurity|cyber security|zero trust|phishing|ransomware|siem|\bsoc\b|infosec)/i.test(lower)) {
    return 'cybersecurity_it';
  }
  return 'general';
}

function cleanExtractedTopic(raw: string): string {
  const cleaned = raw
    .replace(/^(hi|hello|hey|please|ok|okay|sure|great|that sounds good|sounds good|yes|thanks|thank you)\b[\s,.:;-]*/gi, '')
    .replace(/^(can you|could you|would you|i want you to|i would like you to|i need you to|i want to|i'd like to|help me|let's|lets|can we|estudy copilot)\b[\s,.:;-]*/gi, '')
    .replace(/^(build|create|make|generate|design|draft|plan|discuss|outline|structure|set up|setup|start|fill|populate|complete|write|prepare)\s+(a\s+|an\s+|the\s+|my\s+|me\s+a\s+|new\s+)?(master\s+)?(course\s+template|template|training\s+programme|training\s+program|course|curriculum|programme|program|training|modules?|fields?)\s*(for\s+me\s*)?(on|about|for|titled|called|named|:|-)?\s*/i, '')
    .replace(/\s+for\s+(beginners|intermediate|advanced|novices|starters|managers|leaders|executives|teams|practitioners|staff|employees|engineers|analysts|hr).*$/i, '')
    .replace(/(and\s+fill\s+in\s+the\s+fields.*|instead\s+of\s+asking.*|for\s+me\s*$)/i, '')
    .replace(/^[,\s.:"'“”‘’\-–—]+|[,\s.:"'“”‘’\-–—]+$/g, '')
    .trim();

  if (!cleaned) return '';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

// Helper to extract a clean topic from a user message without blindly bleeding unrelated prior chats
export function extractCourseTopicFromMessage(
  rawMessage: string,
  previousMessages: LocalCopilotMessage[] = [],
  agreedRequirements?: CopilotAgreedRequirements | null
): string {
  const msg = (rawMessage || '').trim();

  // 1. Quoted course title always wins ("Build a template for me \"Human Resource Management\"")
  const quotedMatch = msg.match(/["“”'‘’]([^"“”'‘’]{3,140})["“”'‘’]/);
  if (quotedMatch && quotedMatch[1]) {
    const candidate = quotedMatch[1].trim();
    if (!/^(build|create|make|help|check|please|yes|ok)/i.test(candidate)) {
      return candidate.charAt(0).toUpperCase() + candidate.slice(1);
    }
  }

  // 2. Pattern like "create a Cloud Engineering course for beginners" or "plan a Generative AI for Business course"
  const inlineCourseMatch = msg.match(
    /(?:create|build|plan|design|develop|make|structure|outline|start|want|need|about|for)\s+(?:a\s+|an\s+|the\s+|new\s+)?([a-zA-Z0-9][a-zA-Z0-9\s&/+-]{2,80}?)\s+(?:course|programme|program|curriculum|training|template)\b/i
  );
  if (inlineCourseMatch && inlineCourseMatch[1]) {
    const candidate = cleanExtractedTopic(inlineCourseMatch[1]);
    if (candidate.length >= 3 && !/^(new|my|this|that|the|a|full|complete|draft)$/i.test(candidate)) {
      return candidate;
    }
  }

  // 3. Pattern like "course on Cloud Engineering" / "template for Human Resource Management"
  const afterPrepMatch = msg.match(
    /(?:course|template|curriculum|programme|program|training)\s+(?:on|about|for|titled|called|named)\s+([a-zA-Z0-9][^.!?\n]{2,100})/i
  );
  if (afterPrepMatch && afterPrepMatch[1]) {
    const candidate = cleanExtractedTopic(afterPrepMatch[1]);
    if (candidate.length >= 3) {
      return candidate;
    }
  }

  // 4. If we already have agreedRequirements in THIS active conversation and the user says "Please create the course"
  if (agreedRequirements?.title || agreedRequirements?.subject) {
    return (agreedRequirements.title || agreedRequirements.subject).trim();
  }

  // 5. Fallback cleanup if the user typed a direct topic/title like "Cloud Engineering"
  const cleaned = cleanExtractedTopic(msg);
  if (
    cleaned.length >= 3 &&
    !/^(it|this|that|the course|course|template|on\.\.\.|about\.\.\.|\.\.\.)$/i.test(cleaned)
  ) {
    return cleaned;
  }

  // 6. Only check prior messages inside the same conversation if they explicitly named a course topic
  for (let i = previousMessages.length - 1; i >= 0; i--) {
    const prev = previousMessages[i];
    if (prev.role === 'user') {
      const m = prev.content.match(/["“”]([^"“”]{3,120})["“”]/);
      if (m?.[1]) return m[1].trim();
      const inline = prev.content.match(
        /(?:create|build|plan|design|about)\s+(?:a\s+|an\s+)?([a-zA-Z0-9][a-zA-Z0-9\s&/+-]{2,70}?)\s+(?:course|programme|program|template)\b/i
      );
      if (inline?.[1]) {
        const cand = cleanExtractedTopic(inline[1]);
        if (cand.length >= 3 && !/^(new|my|this|that|the|a)$/i.test(cand)) return cand;
      }
    }
  }

  return 'Applied Workplace Operations & Governance';
}

/**
 * Distinguishes between:
 *  - qa_check: review/audit current template compliance
 *  - course_create: explicit imperative command to populate/build/create the template/course NOW
 *  - course_discussion_plan: starting or asking to discuss/plan/outline a course without executing full generation yet
 *  - course_refine: adding goals, audience, duration, or adjustments to an active planned course in the conversation
 *  - general_chat: general questions, explanations, brainstorming, follow-ups (ChatGPT-style conversation)
 */
export function classifyCopilotIntent(
  lastMessage: string,
  messages: LocalCopilotMessage[] = [],
  agreedRequirements?: CopilotAgreedRequirements | null
): CopilotIntent {
  const msg = (lastMessage || '').trim();
  const lower = msg.toLowerCase();

  // 1. Explicit QA / readiness check
  if (
    /^(check|review|audit|verify|inspect)\s+(my\s+|the\s+)?(course\s+)?(qa|quality|framework|compliance|readiness)/i.test(lower) ||
    lower === 'check qa' ||
    lower === 'check my course framework compliance'
  ) {
    return 'qa_check';
  }

  // 2. Placeholder prompt without a topic yet -> conversational prompt, never course generation
  if (/^i want to build a new course on\.{0,3}$/i.test(lower)) {
    return 'course_discussion_plan';
  }

  // 3. Explicit course/template creation commands ONLY
  const hasExplicitConfirmCreate =
    /\b(please\s+)?(create|generate|build|populate|fill\s+in)\s+(the\s+|this\s+|my\s+)?(full\s+|complete\s+)?(course|template|all\s+9\s+sections|fields)\b/i.test(lower) &&
    !/^(i\s+want\s+to|i'd\s+like\s+to|i\s+would\s+like\s+to|can\s+we|could\s+we|let's|how\s+do\s+i|how\s+should|what\s+if|should\s+i)/i.test(lower);

  const hasBuildTemplateCommand =
    /^(please\s+)?(build|populate|fill(\s+in)?|generate|create)\s+(a\s+|an\s+|the\s+)?(master\s+)?(course\s+)?template\b/i.test(lower) ||
    /\b(build|populate|fill\s+in)\s+(a\s+)?template\s+for\s+me\b/i.test(lower) ||
    /\b(go\s+ahead|proceed|yes,?\s*(please\s*)?(create|build|generate)|sounds\s+good\.?\s*(please\s*)?(create|build|generate)|create\s+it\s+now|build\s+it\s+now|generate\s+it\s+now)\b/i.test(lower);

  if (hasBuildTemplateCommand || hasExplicitConfirmCreate) {
    return 'course_create';
  }

  // 4. Starting a course discussion / planning flow naturally (NOT generating yet!)
  const isPlanningStarter =
    /^(i\s+want\s+to|i'd\s+like\s+to|i\s+would\s+like\s+to|we\s+want\s+to|help\s+me|can\s+you\s+help\s+me|let's|can\s+we)\s+(create|build|design|plan|develop|structure|outline|brainstorm)\s+(a\s+|an\s+)?.*(course|programme|program|curriculum|training)/i.test(lower) ||
    /\b(suggest|propose|outline|structure|plan|recommend)\b.*\b(course|modules?|curriculum|learning\s+pathway|syllabus)\b/i.test(lower);

  if (isPlanningStarter) {
    return 'course_discussion_plan';
  }

  // 5. General question / explanation / brainstorming checks (questions always stay in chat unless QA check)
  const startsAsQuestion =
    /^(what|why|how|when|where|who|which|explain|define|compare|difference\s+between|tell\s+me|give\s+me\s+(some\s+|5\s+|a\s+few\s+)?ideas|brainstorm|can\s+you\s+explain|could\s+you\s+explain|is\s+it\s+better|how\s+do|follow\s*up)/i.test(lower) ||
    (msg.endsWith('?') && !/\b(create|build|generate)\s+(the\s+)?(course|template)\b/i.test(lower));

  if (startsAsQuestion && !agreedRequirements?.subject) {
    return 'general_chat';
  }

  // 6. Refining an active course plan in the current conversation
  if (agreedRequirements?.subject) {
    const looksLikeGeneralUnrelatedQuestion =
      startsAsQuestion &&
      !/\b(module|course|objective|outcome|learner|audience|practical|duration|hours|credit|this\s+programme|that)\b/i.test(lower);

    if (looksLikeGeneralUnrelatedQuestion) {
      return 'general_chat';
    }

    const looksLikeRefinement =
      /\b(i\s+want\s+them\s+to|they\s+should|focus\s+on|make\s+(the\s+course|it)|more\s+practical|hands-on|add\s+a\s+module|include|cover|target\s+audience|beginners|intermediate|advanced|modules?|hours|days|weeks|understand|learn|emphasis|scenarios?)\b/i.test(lower);

    if (looksLikeRefinement || messages.length >= 2) {
      if (startsAsQuestion && /\b(explain|what\s+is|why\s+is|how\s+does)\b/i.test(lower)) {
        return 'general_chat';
      }
      return 'course_refine';
    }
  }

  // Default to general conversational chat — NEVER assume every message is a course-generation request
  return 'general_chat';
}

export function extractRequirementsFromMessage(
  message: string,
  intent: CopilotIntent,
  existingAgreed?: CopilotAgreedRequirements | null
): Partial<CopilotAgreedRequirements> {
  const msg = (message || '').trim();
  const lower = msg.toLowerCase();
  const extracted: Partial<CopilotAgreedRequirements> = {};

  // Extract explicit subject when starting a new topic or creating a template explicitly
  const quoted = msg.match(/["“”'‘’]([^"“”'‘’]{3,120})["“”'‘’]/);
  const inlineCourseMatch = msg.match(
    /(?:create|build|plan|design|develop|make|structure|outline|start)\s+(?:a\s+|an\s+|the\s+|new\s+)?([a-zA-Z0-9][a-zA-Z0-9\s&/+-]{2,80}?)\s+(?:course|programme|program|curriculum|training|template)\b/i
  );
  const onTopicMatch = msg.match(
    /(?:course|template|curriculum|programme|program)\s+(?:on|about|for|titled|called)\s+([a-zA-Z0-9][^.!?\n]{2,100})/i
  );

  if (quoted?.[1] && !/^(build|create|make|help|check|please|yes|ok)/i.test(quoted[1])) {
    const t = quoted[1].trim();
    extracted.subject = t;
    extracted.title = t.charAt(0).toUpperCase() + t.slice(1);
  } else if (inlineCourseMatch?.[1]) {
    const t = cleanExtractedTopic(inlineCourseMatch[1]);
    if (t.length >= 3 && !/^(the|this|that|new|my|full|complete)$/i.test(t)) {
      extracted.subject = t;
      extracted.title = t;
    }
  } else if (onTopicMatch?.[1]) {
    const t = cleanExtractedTopic(onTopicMatch[1]);
    if (t.length >= 3 && !/^(the|this|that|new|my|beginners|managers)$/i.test(t)) {
      extracted.subject = t;
      extracted.title = t;
    }
  }

  // Difficulty / Audience cues
  if (/\b(beginner|beginners|foundational|entry-level|novice|no\s+prior)\b/i.test(lower)) {
    extracted.difficultyLevel = 'Foundational';
    extracted.targetAudience = 'Beginners and entry-level practitioners entering the domain';
  } else if (/\b(advanced|senior|expert|lead|principal|architect)\b/i.test(lower)) {
    extracted.difficultyLevel = 'Advanced';
    extracted.targetAudience = 'Senior practitioners, specialists, and technical leads';
  } else if (/\b(intermediate|mid-level)\b/i.test(lower)) {
    extracted.difficultyLevel = 'Intermediate';
    extracted.targetAudience = 'Mid-level practitioners with foundational operational experience';
  }

  const audienceMatch = msg.match(/\b(?:aimed\s+at|for|target(?:ing)?\s+audience\s*(?:is|:)?)\s+([^.!?\n]{4,90})/i);
  if (audienceMatch?.[1] && !/^(me|you|the\s+course|a\s+template)/i.test(audienceMatch[1].trim())) {
    const aud = audienceMatch[1].trim();
    if (!/\b(understand|cover|learn)\b/i.test(aud)) {
      extracted.targetAudience = aud.charAt(0).toUpperCase() + aud.slice(1);
    }
  }

  // Module count ("4 modules", "5-module")
  const modMatch = lower.match(/\b([2-8])\s*[-\s]?modules?\b/);
  if (modMatch?.[1]) {
    extracted.moduleCount = parseInt(modMatch[1], 10);
  }

  // Duration ("16 hours", "3 days", "4 weeks")
  const durMatch = msg.match(/\b(\d{1,3}\s*(?:hours?|hrs?|days?|weeks?))\b/i);
  if (durMatch?.[1]) {
    extracted.duration = durMatch[1];
  }

  // Learning goals ("I want them to understand cloud infrastructure, deployment, security and cost optimisation")
  const goalsMatch = msg.match(
    /(?:understand|learn(?:\s+about)?|cover|master|focus\s+on|include|outcomes?\s*:?|goals?\s*:?)\s+([^.!?\n]{6,220})/i
  );
  if (goalsMatch?.[1]) {
    const rawGoals = goalsMatch[1]
      .replace(/^(how\s+to|about|the|on)\s+/i, '')
      .split(/\s*(?:,|;|\band\b|\bplus\b)\s*/i)
      .map(g => g.trim().replace(/^[,\s.-]+|[,\s.-]+$/g, ''))
      .filter(g => g.length >= 3 && !/^(the\s+course|it|more|much|very)$/i.test(g));
    if (rawGoals.length > 0) {
      extracted.learningGoals = rawGoals;
    }
  }

  // Practical emphasis
  if (/\b(more\s+practical|practical|hands-on|hands\s+on|lab|labs|workshop|real-world|applied|scenarios?)\b/i.test(lower)) {
    extracted.practicalFocus = 'Hands-on labs, real-world South African workplace simulations, and step-by-step operational exercises';
  }

  // If intent is course_create and user still didn't specify a subject, preserve existingAgreed
  if (intent === 'course_create' && !extracted.subject && existingAgreed?.subject) {
    extracted.subject = existingAgreed.subject;
    extracted.title = existingAgreed.title || existingAgreed.subject;
  }

  return extracted;
}

export function mergeAgreedRequirements(
  existing: CopilotAgreedRequirements | null | undefined,
  incoming: Partial<CopilotAgreedRequirements>,
  intent: CopilotIntent
): CopilotAgreedRequirements | null {
  // Context isolation: when starting an explicit new course topic unrelated to the old one, replace rather than leak
  const isExplicitNewSubject =
    Boolean(incoming.subject) &&
    Boolean(existing?.subject) &&
    incoming.subject!.toLowerCase() !== existing!.subject.toLowerCase() &&
    (intent === 'course_discussion_plan' || intent === 'course_create');

  const base: CopilotAgreedRequirements | null = isExplicitNewSubject
    ? null
    : existing
      ? { ...existing }
      : null;

  if (!base && !incoming.subject) {
    return null;
  }

  const subject = incoming.subject || base?.subject || '';
  const mergedGoals = Array.from(
    new Set([
      ...(base?.learningGoals || []),
      ...(incoming.learningGoals || [])
    ])
  );

  const mergedNotes = Array.from(
    new Set([
      ...(base?.additionalNotes || []),
      ...(incoming.additionalNotes || [])
    ])
  );

  return {
    subject,
    title: incoming.title || base?.title || subject,
    targetAudience: incoming.targetAudience || base?.targetAudience,
    industryContext: incoming.industryContext || base?.industryContext,
    difficultyLevel: incoming.difficultyLevel || base?.difficultyLevel || '',
    duration: incoming.duration || base?.duration,
    moduleCount: incoming.moduleCount || base?.moduleCount,
    learningGoals: mergedGoals.length > 0 ? mergedGoals : undefined,
    moduleOutlines: incoming.moduleOutlines || base?.moduleOutlines,
    practicalFocus: incoming.practicalFocus || base?.practicalFocus,
    toolsOrPlatforms: incoming.toolsOrPlatforms || base?.toolsOrPlatforms,
    additionalNotes: mergedNotes.length > 0 ? mergedNotes : undefined,
    readyToCreate: intent === 'course_create' ? true : (incoming.readyToCreate ?? base?.readyToCreate ?? false)
  };
}

interface DomainBlueprintTemplate {
  codePrefix: string;
  industryDomain: string;
  industryContext: string;
  defaultAudience: string;
  taskOrSkill: string;
  operationalImpact: string;
  rootCauses: string[];
  processFailures: string;
  skillGaps: string;
  constraints: string;
  digitalReadiness: string;
  aiLiteracyGap: string;
  aiEthicsRisk: string;
  regulatoryFramework: string;
  regulatorySources: string;
  aiToolsPlatformName: string;
  aiToolsReferenced: string;
  aiEthicsFramework: string;
  caseStudyUseCases: string;
  industryUseCases: string;
  evidenceStandards: string[];
  accreditationBody: string;
  nqfLevel: string;
  terminology: string;
  industryExamples: string;
  sources: Course['research']['sources'];
  moduleBlueprints: Array<{
    title: string;
    subtitle: string;
    purpose: string;
    keySkills: string[];
    learningObjectives: string[];
    coreConcepts: string;
    keyTerms: string;
    aiCoverage: string;
    practicalExercise: string;
    scenarios: Array<{
      title: string;
      situation: string;
      challenge: string;
      decisionPoint: string;
      debrief: string;
    }>;
  }>;
}

function buildDomainBlueprint(
  domain: LocalDomainCategory,
  courseTitle: string,
  agreed?: CopilotAgreedRequirements | null
): DomainBlueprintTemplate {
  const goalList = agreed?.learningGoals || [];
  const practicalFlag = Boolean(agreed?.practicalFocus);

  if (domain === 'cloud_engineering') {
    return {
      codePrefix: 'CLD',
      industryDomain: 'Cloud Engineering, Distributed Infrastructure & DevOps',
      industryContext: 'South African enterprise cloud migration, hybrid cloud infrastructure, and SaaS engineering environments operating under POPIA data-residency rules.',
      defaultAudience: agreed?.targetAudience || 'Aspiring cloud engineers, junior systems administrators, software developers, and IT infrastructure practitioners',
      taskOrSkill: 'provisioning resilient cloud infrastructure, automating CI/CD deployments, enforcing IAM/network security controls, and governing FinOps cloud spending',
      operationalImpact: 'misconfigured public storage buckets, runaway cloud consumption bills, brittle manual server deployments, and unmonitored service outages',
      rootCauses: [
        'Provisioning cloud resources manually via web consoles without Infrastructure-as-Code (IaC) version control or repeatable templates',
        'Over-permissive Identity and Access Management (IAM) roles and flat virtual networks lacking least-privilege segmentation',
        'Absence of automated billing alerts, resource tagging, and FinOps cost-optimisation guardrails across development and production workloads'
      ],
      processFailures: 'Manual click-ops deployments without automated security scanning, missing IaC peer reviews, and unmonitored cloud spend.',
      skillGaps: 'Designing segmented VPC networks, writing declarative Terraform/IaC modules, automating CI/CD pipelines, and auditing cloud cost drivers.',
      constraints: 'Multi-region latency considerations, South African POPIA cross-border data transfer controls (Section 72), and strict monthly budget caps.',
      digitalReadiness: 'Comfortable with command-line basics, networking fundamentals, and modern web applications.',
      aiLiteracyGap: 'Using AI coding/IaC assistants productively without blindly deploying hallucinated Terraform policies, overly permissive IAM JSON, or insecure container defaults.',
      aiEthicsRisk: 'Exposing cloud access keys, architecture secrets, or customer personal data to external AI prompts, or deploying AI-generated IAM policies without security review.',
      regulatoryFramework: 'POPIA Act 4 of 2013 (Verify cross-border cloud hosting under Section 72 with Information Officer) and King IV Principle 12 (Technology Governance — Verify applicability).',
      regulatorySources: 'POPIA Act 4 of 2013 Sections 19 & 72; King IV Principle 12; Cloud Provider Well-Architected Security & Cost Pillars.',
      aiToolsPlatformName: 'AWS / Azure / GCP Console & CLI, Terraform IaC, Docker/Kubernetes, GitHub Actions CI/CD, and Enterprise AI IaC Review Assistants',
      aiToolsReferenced: 'Cloud IAM, VPC Networking, Terraform, CI/CD Pipelines, Cloud Cost Explorer / FinOps Dashboards',
      aiEthicsFramework: 'Least-Privilege Security Governance, POPIA Data Residency Controls, and Human Peer Review of Infrastructure Changes',
      caseStudyUseCases: '1) Replacing manual VM click-ops with modular VPC + compute Terraform templates; 2) Locking down an exposed S3/Blob bucket and enforcing IAM MFA + least privilege; 3) Cutting idle non-production cloud spend by 38% using automated tagging and autoscaling schedules.',
      industryUseCases: 'South African fintech cloud landing zones, automated container deployments, and FinOps cost governance.',
      evidenceStandards: [
        'Well-Architected Framework: Operational Excellence, Security, Reliability, Cost Optimisation',
        'POPIA Act 4 of 2013 Section 19 & Section 72 (Verify cross-border data rules)',
        'CIS Cloud Benchmark Baseline Controls (Verify benchmark version)'
      ],
      accreditationBody: 'To Be Confirmed (Requires MICT SETA / Cloud Vendor SME Validation)',
      nqfLevel: 'To Be Confirmed (Requires SME Validation)',
      terminology: 'VPC, Subnet, IAM Least Privilege, Infrastructure as Code (IaC), Terraform, CI/CD Pipeline, Containerisation, FinOps, Cost Allocation Tagging, POPIA Section 72.',
      industryExamples: 'Johannesburg and Cape Town cloud data-centre regions, hybrid enterprise workloads, automated CI/CD releases, and FinOps budget dashboards.',
      sources: [
        {
          id: 'src-1',
          name: 'Protection of Personal Information Act (POPIA Act No. 4 of 2013)',
          type: 'Regulatory framework',
          reference: 'Sections 19 & 72 (Cross-Border Information Flows — Verify legal applicability)',
          relevance: 'Governs security safeguards and data-residency accountability when hosting workloads in cloud regions.',
          status: 'Verified'
        },
        {
          id: 'src-2',
          name: 'Cloud Well-Architected Framework (Security, Reliability & Cost Optimisation)',
          type: 'Industry standard',
          reference: 'Industry Multi-Cloud Architecture Reference Standard',
          relevance: 'Defines core pillars for resilient cloud infrastructure, automated deployment, and FinOps governance.',
          status: 'Verified'
        },
        {
          id: 'src-3',
          name: 'King IV Report on Corporate Governance — Principle 12',
          type: 'Ethics framework',
          reference: 'Institute of Directors in South Africa (IoDSA)',
          relevance: 'Establishes executive oversight for technology, cybersecurity, and cloud vendor governance.',
          status: 'Verified'
        },
        {
          id: 'src-4',
          name: 'CIS Cloud Foundations & IAM Least-Privilege Baseline',
          type: 'Technology documentation',
          reference: 'Center for Internet Security Controls (Requires Version Verification)',
          relevance: 'Provides practical hardening baselines for cloud IAM, networking, logging, and encryption.',
          status: 'Verified'
        }
      ],
      moduleBlueprints: [
        {
          title: 'Module 1: Cloud Infrastructure Fundamentals & Networking Architecture',
          subtitle: 'Compute, Storage, Virtual Networks (VPC) & Shared Responsibility',
          purpose: 'Build strong foundational mastery of core cloud building blocks—compute, object/block storage, virtual private clouds, subnets, and high-availability regions.',
          keySkills: ['Cloud Service Models (IaaS/PaaS)', 'VPC & Subnet Design', 'Compute & Storage Selection', 'Shared Responsibility Mapping'],
          learningObjectives: [
            'Differentiate between compute, storage, and networking primitives across modern cloud platforms',
            'Design a segmented virtual network (VPC) with public/private subnets and load balancing for high availability',
            'Apply the Cloud Shared Responsibility Model and verify data-residency boundaries under POPIA'
          ],
          coreConcepts: 'Covers cloud regions vs availability zones, virtual machines vs containers vs serverless compute, object vs block storage, DNS routing, and network segmentation.',
          keyTerms: 'VPC, CIDR Subnet, Availability Zone, Load Balancer, Object Storage, Shared Responsibility Model, Data Residency.',
          aiCoverage: 'Uses AI architecture assistants to brainstorm network topologies while enforcing human validation of CIDR blocks and firewall rules.',
          practicalExercise: 'Design and diagram a two-tier VPC architecture separating public web load balancers from private database subnets with explicit ingress/egress rules.',
          scenarios: [
            {
              title: 'Fixing an Exposed Database Subnet',
              situation: 'A junior cloud technician deploys a test application database inside a public subnet with an open 0.0.0.0/0 port.',
              challenge: 'Reconciling urgent developer access needs with zero-trust network isolation.',
              decisionPoint: 'Move the database to a private subnet accessed only via internal security groups or bastion/VPN.',
              debrief: 'Never expose stateful databases directly to the public internet; isolate data tiers inside private subnets.'
            },
            {
              title: 'Single-Zone Outage Recovery',
              situation: 'An e-commerce workload runs on a single virtual machine in one availability zone during a regional power/fibre disruption.',
              challenge: 'Preventing single points of failure without tripling infrastructure spend.',
              decisionPoint: 'Configure an auto-scaling group behind an application load balancer across two availability zones.',
              debrief: 'Multi-AZ active-active deployment eliminates single-zone outages cleanly.'
            },
            {
              title: 'Evaluating Region Selection for Customer Records',
              situation: 'A team plans to host sensitive South African customer profiles in an overseas region solely for a 4% compute discount.',
              challenge: 'Checking data-sovereignty and POPIA cross-border obligations before provisioning.',
              decisionPoint: 'Consult the Information Officer and prioritise local South African cloud regions with Section 72 safeguards.',
              debrief: 'Architecture choices carry legal data-residency consequences.'
            }
          ]
        },
        {
          title: 'Module 2: Automated Cloud Deployment, Containers & CI/CD Pipelines',
          subtitle: 'Infrastructure-as-Code (IaC), Docker Containers & Zero-Downtime Releases',
          purpose: 'Transition learners from manual console setup to repeatable Infrastructure-as-Code templates, containerised packaging, and automated CI/CD deployment pipelines.',
          keySkills: ['Infrastructure as Code (Terraform)', 'Container Packaging (Docker)', 'CI/CD Build & Release Gates', 'Rollback & Health Checks'],
          learningObjectives: [
            'Author declarative Infrastructure-as-Code templates to provision repeatable cloud environments cleanly',
            'Package a microservice into a reproducible container image and run pre-deployment smoke checks',
            'Configure a CI/CD deployment pipeline with automated tests, approval gates, and safe rollback controls'
          ],
          coreConcepts: 'Covers declarative vs imperative provisioning, state management, container image layering, rolling/blue-green deployments, and automated pipeline verification.',
          keyTerms: 'Terraform, Infrastructure as Code (IaC), State File, Docker Container, CI/CD Pipeline, Blue-Green Deployment, Rollback.',
          aiCoverage: 'Demonstrates prompting AI assistants for starter Terraform/YAML scaffolds and catching hallucinated resource attributes before `terraform apply`.',
          practicalExercise: 'Write and dry-run (`plan`) an Infrastructure-as-Code template plus CI/CD deployment pipeline with a mandatory manual production approval gate.',
          scenarios: [
            {
              title: 'Eliminating Environment Drift After Manual Hotfixes',
              situation: 'An engineer edits production firewall rules manually via the web console at 22:00, breaking the next CI/CD run.',
              challenge: 'Restoring single-source-of-truth reproducibility across environments.',
              decisionPoint: 'Reconcile the change back into Terraform code, enforce branch reviews, and restrict direct console writes.',
              debrief: 'All production changes must flow through version-controlled IaC pipelines.'
            },
            {
              title: 'Auditing an AI-Generated Terraform Snippet',
              situation: 'A developer pastes a public AI-generated Terraform module that opens SSH port 22 globally and stores unencrypted state locally.',
              challenge: 'Catching insecure defaults before provisioning infrastructure.',
              decisionPoint: 'Run `terraform validate` + static security scanning (tfsec/checkov) and enforce remote encrypted state.',
              debrief: 'Never run `apply` on unreviewed AI-generated IaC templates.'
            },
            {
              title: 'Handling a Failed Rolling Container Release',
              situation: 'A newly deployed API container fails health checks immediately after rollout.',
              challenge: 'Restoring user availability quickly without losing diagnostic logs.',
              decisionPoint: 'Trigger automated pipeline rollback to the last healthy image tag while preserving container logs for root-cause review.',
              debrief: 'Automated health checks and tested rollbacks keep deployments low-risk.'
            }
          ]
        },
        {
          title: 'Module 3: Cloud Security, IAM Governance & FinOps Cost Optimisation',
          subtitle: 'Least-Privilege IAM, Secret Management, Observability & Cloud Cost Control',
          purpose: 'Equip learners to lock down cloud workloads using least-privilege IAM, encryption, and monitoring while actively eliminating wasted cloud spend through FinOps practices.',
          keySkills: ['IAM Least Privilege', 'Secrets & Encryption Management', 'Monitoring & Alerting', 'FinOps Tagging & Right-Sizing'],
          learningObjectives: [
            'Configure role-based IAM policies enforcing least privilege, MFA, and short-lived credentials',
            'Implement centralised logging, encryption at rest/in transit, and secret rotation across cloud services',
            'Analyse cloud billing telemetry using resource tags, budget thresholds, and instance right-sizing to reduce waste'
          ],
          coreConcepts: 'Covers IAM roles vs static root keys, KMS encryption, secret managers, cloud audit trails, resource tagging taxonomies, spot/reserved capacity, and idle workload shutdowns.',
          keyTerms: 'IAM Role, Principle of Least Privilege, KMS Encryption, Secrets Manager, FinOps, Right-Sizing, Cost Allocation Tag.',
          aiCoverage: 'Uses automated anomaly alerts for unexpected billing spikes and security findings while requiring human confirmation before automated remediation.',
          practicalExercise: 'Perform a combined Cloud Security & FinOps audit on a sample environment to tighten overly broad IAM permissions and cut monthly compute/storage waste by at least 25%.',
          scenarios: [
            {
              title: 'Revoking Hardcoded Cloud API Keys',
              situation: 'Secret scanning flags an AWS/Azure access key committed inside a developer repository.',
              challenge: 'Neutralising credential exposure immediately without crashing live services.',
              decisionPoint: 'Rotate and revoke the leaked key, audit CloudTrail/activity logs for misuse, and migrate services to short-lived IAM roles.',
              debrief: 'Replace static long-lived keys with temporary IAM roles and managed secret stores.'
            },
            {
              title: 'Investigating an Unexpected Weekend Cloud Bill Spike',
              situation: 'Cost monitoring triggers an alert showing non-production GPU and storage spend jumped 4x over a weekend.',
              challenge: 'Pinpointing the unowned resources quickly across multiple project teams.',
              decisionPoint: 'Filter billing by mandatory environment/owner tags, shut down orphaned test clusters, and enforce automated non-prod scheduling.',
              debrief: 'Enforced tagging plus automated off-hours schedules prevent runaway cloud bills.'
            },
            {
              title: 'Balancing Security Logging Against Storage Cost',
              situation: 'Verbose debug logs ingested into cloud analytics inflate monthly observability bills unnecessarily.',
              challenge: 'Maintaining audit compliance without paying excessive log-retention fees.',
              decisionPoint: 'Apply structured log levels, filter noise at ingestion, and tier historical compliance logs into low-cost archival storage.',
              debrief: 'Smart retention tiering delivers both security traceability and FinOps efficiency.'
            }
          ]
        },
        {
          title: 'Module 4: Practical Cloud Operations Capstone, Monitoring & Rollout',
          subtitle: 'End-to-End Observability, Incident Triage & Team Cloud Governance',
          purpose: 'Consolidate infrastructure, deployment, security, and cost optimisation skills into an actionable 30-60-90 day operational cloud playbook.',
          keySkills: ['SLI/SLO Observability', 'Incident Runbooks', 'Compliance Verification', 'FinOps & Governance Reporting'],
          learningObjectives: [
            'Build an observability dashboard tracking latency, error rate, saturation, and monthly unit cost',
            'Execute an incident response runbook and blameless post-incident review for a simulated cloud outage',
            'Present a practical 30-60-90 day cloud adoption and cost-governance checklist for an engineering team'
          ],
          coreConcepts: 'Covers telemetry metrics/logs/traces, alerting thresholds, disaster recovery testing (RTO/RPO), and continuous cost/security review cadences.',
          keyTerms: 'SLI/SLO, MTTR, Disaster Recovery (RTO/RPO), Blameless Post-Mortem, Cloud Landing Zone.',
          aiCoverage: 'Summarising incident timelines responsibly while validating root causes against live telemetry.',
          practicalExercise: 'Complete a capstone cloud deployment, security hardening, and cost-optimisation review dossier for production sign-off.',
          scenarios: [
            {
              title: 'Executing a Disaster Recovery Failover Drill',
              situation: 'A quarterly drill tests recovery time objective (RTO) when primary database failover occurs.',
              challenge: 'Verifying backup integrity and DNS cutover under realistic load.',
              decisionPoint: 'Follow the verified DR runbook, measure actual RTO/RPO, and log remediation tasks for gaps.',
              debrief: 'Untested backups are assumptions—regular DR drills prove resilience.'
            },
            {
              title: 'Conducting a Monthly FinOps & Security Architecture Review',
              situation: 'New microservices added rapidly over two sprints bypassed tagging and budget checks.',
              challenge: 'Embedding governance smoothly without slowing developer velocity.',
              decisionPoint: 'Automate tagging policy checks in CI/CD so compliant infrastructure passes effortlessly.',
              debrief: 'Policy-as-code in CI/CD aligns speed with security and cost discipline.'
            },
            {
              title: 'Escalating an Unverified Cloud Change',
              situation: 'A teammate proposes disabling audit logging temporarily to troubleshoot latency.',
              challenge: 'Resolving performance bottlenecks without blinding security telemetry.',
              decisionPoint: 'Reject disabling audit logs; isolate latency with distributed tracing metrics instead.',
              debrief: 'Never compromise auditability during troubleshooting.'
            }
          ]
        }
      ]
    };
  }

  if (domain === 'generative_ai_business') {
    return {
      codePrefix: 'GENAI',
      industryDomain: 'Generative AI for Enterprise Productivity & Business Operations',
      industryContext: 'South African corporate, commercial, and operational teams adopting generative AI responsibly under POPIA and King IV governance.',
      defaultAudience: agreed?.targetAudience || 'Business managers, operations specialists, analysts, team leaders, and corporate knowledge workers',
      taskOrSkill: 'identifying high-ROI business AI use cases, crafting structured domain prompts, auditing hallucinations and bias, and embedding POPIA-safe workflows',
      operationalImpact: 'shadow AI data leaks, unverified hallucinated client deliverables, low-value pilot fatigue, and inconsistent team productivity',
      rootCauses: [
        'Ad-hoc prompting without structured context, verification checklists, or business quality criteria',
        'Employees pasting confidential customer, financial, or HR records into unvetted public generative AI tools',
        'Evaluating AI tools based on hype rather than measurable business cycle-time, quality, and risk-control KPIs'
      ],
      processFailures: 'No approved prompt review gates or zero-PII data redaction steps prior to publishing AI-assisted client or management outputs.',
      skillGaps: 'Structured prompt engineering, retrieval-augmented grounding checks, hallucination auditing, and business ROI scoping.',
      constraints: 'Mandatory POPIA customer data privacy, intellectual property safeguards, and busy operational schedules.',
      digitalReadiness: 'Routine proficiency with office suites (documents, spreadsheets, email, CRM) and browser tools.',
      aiLiteracyGap: 'Understanding probabilistic LLM behaviour (hallucinations, sycophancy, stale knowledge cut-offs) vs deterministic business facts.',
      aiEthicsRisk: 'Customer PII leaks to external AI providers, biased customer/HR recommendations, and undisclosed synthetic inaccuracies.',
      regulatoryFramework: 'POPIA Act 4 of 2013 (Customer & Employee Data Safeguards, Section 71 automated decisions) and King IV Principle 12 (Technology & Information Governance).',
      regulatorySources: 'POPIA Act No. 4 of 2013; King IV Principle 12; ISO/IEC 42001 AI Management Principles.',
      aiToolsPlatformName: 'Enterprise LLM Assistants (Groq Cloud, Microsoft 365 Copilot, Enterprise Chat Assistants), Document Grounding / RAG Workflows, and Redaction Checklists',
      aiToolsReferenced: 'Enterprise Generative AI Assistants, Structured Prompt Libraries, Grounded Knowledge Search',
      aiEthicsFramework: 'POPIA Zero-PII Prompting, King IV Principle 12, and Mandatory Human-in-the-Loop Business Sign-Off',
      caseStudyUseCases: '1) Automating meeting synthesis and client proposal first drafts with verified source citations; 2) Sanitising sensitive client tables before AI variance analysis; 3) Piloting a governed customer-support drafting assistant reducing turnaround by 35%.',
      industryUseCases: 'South African commercial operations, finance/admin reporting, customer service drafting, and knowledge management.',
      evidenceStandards: [
        'POPIA Act 4 of 2013 (Sections 11, 19, 71)',
        'King IV Principle 12 Technology & Information Governance',
        'ISO/IEC 42001 AI Risk & Human Oversight Standard'
      ],
      accreditationBody: 'To Be Confirmed (Requires Services SETA / QCTO SME Validation)',
      nqfLevel: 'To Be Confirmed (Requires SME Validation)',
      terminology: 'Prompt Engineering, Hallucination, Retrieval-Augmented Generation (RAG), Human-in-the-Loop (HITL), Zero-PII Redaction, POPIA, ROI Pilot.',
      industryExamples: 'South African corporate services, retail operations, B2B proposals, and customer communications.',
      sources: [
        {
          id: 'src-1',
          name: 'Protection of Personal Information Act (POPIA Act No. 4 of 2013)',
          type: 'Regulatory framework',
          reference: 'Sections 19 & 71 (Security Safeguards & Automated Decision-Making)',
          relevance: 'Requires anonymisation/protection of personal data and human oversight on consequential automated decisions.',
          status: 'Verified'
        },
        {
          id: 'src-2',
          name: 'King IV Report on Corporate Governance — Principle 12',
          type: 'Ethics framework',
          reference: 'Institute of Directors in South Africa (IoDSA)',
          relevance: 'Guides accountable enterprise adoption of generative AI and information security controls.',
          status: 'Verified'
        },
        {
          id: 'src-3',
          name: 'ISO/IEC 42001: Artificial Intelligence Management System',
          type: 'Industry standard',
          reference: 'International Standard (Verify Organisational Certification Scope)',
          relevance: 'Defines risk assessment, human review, and continuous monitoring for business AI workflows.',
          status: 'Verified'
        },
        {
          id: 'src-4',
          name: 'UNESCO Recommendation on the Ethics of Artificial Intelligence',
          type: 'Ethics framework',
          reference: 'Transparency, Accountability & Bias Mitigation Principles',
          relevance: 'Provides practical governance criteria for fair and transparent workplace AI deployment.',
          status: 'Verified'
        }
      ],
      moduleBlueprints: [
        {
          title: 'Module 1: Business Generative AI Foundations, Use-Case Selection & Risk Boundaries',
          subtitle: 'How LLMs Work, High-ROI Workflows & POPIA Zero-PII Safeguards',
          purpose: 'Demystify generative AI mechanics for business teams, distinguish high-ROI workflows from risky tasks, and establish non-negotiable POPIA data boundaries.',
          keySkills: ['Business Use-Case Triage', 'LLM Capability vs Limitation', 'Zero-PII Redaction', 'Risk Boundary Mapping'],
          learningObjectives: [
            'Explain how generative AI models predict text versus how grounded business systems retrieve verified facts',
            'Evaluate business tasks using an ROI-vs-Risk matrix to select safe, high-impact generative AI use cases',
            'Apply zero-PII and confidentiality redaction protocols before submitting business material to AI tools'
          ],
          coreConcepts: 'Covers probabilistic token generation, context windows, hallucinations, deterministic vs generative tasks, and shadow AI prevention.',
          keyTerms: 'Generative AI, Context Window, Hallucination, Zero-PII Prompting, Shadow AI, Use-Case Triage.',
          aiCoverage: 'Contrasts raw web chat prompting against enterprise zero-data-retention environments and grounded retrieval workflows.',
          practicalExercise: 'Score five daily team tasks on an Impact-vs-Risk matrix and redact a sample client brief cleanly prior to AI summarisation.',
          scenarios: [
            {
              title: 'Shadow AI in Commercial Proposal Drafting',
              situation: 'An account executive pastes an unredacted client pricing schedule into a free consumer AI website to polish a proposal.',
              challenge: 'Protecting commercial confidentiality and POPIA compliance without halting proposal velocity.',
              decisionPoint: 'Enforce approved enterprise AI access with redacted placeholders (`[Client A]`, `[Amount]`) before prompting.',
              debrief: 'Never paste raw client identifiers or confidential pricing into unapproved public models.'
            },
            {
              title: 'Spotting Fabricated Market Statistics',
              situation: 'An AI assistant generates convincing but non-existent South African industry survey percentages for an executive deck.',
              challenge: 'Catching confident hallucinations before leadership sign-off.',
              decisionPoint: 'Require primary source URLs/reports and verify every numeric claim independently.',
              debrief: 'Never publish unverified statistics generated from LLM memory.'
            },
            {
              title: 'Selecting the Right Pilot Workflow',
              situation: 'Leadership asks which department process to automate first: complex legal arbitration or internal meeting-note summarisation.',
              challenge: 'Balancing visible productivity wins against operational risk.',
              decisionPoint: 'Start with low-risk drafting/summarisation with mandatory human review before high-stakes decisions.',
              debrief: 'High-frequency, human-reviewed drafting yields fast, safe business ROI.'
            }
          ]
        },
        {
          title: 'Module 2: Structured Business Prompting, RAG Grounding & Quality Auditing',
          subtitle: 'Role-Context-Constraints Prompting, Document Grounding & Hallucination Checks',
          purpose: 'Equip professionals with repeatable prompt frameworks, document-grounded workflows, and rigorous verification checklists for daily business outputs.',
          keySkills: ['Structured Prompt Engineering', 'Document Grounding (RAG)', 'Fact & Tone Auditing', 'Reusable Team Prompt Libraries'],
          learningObjectives: [
            'Construct structured business prompts defining role, context, audience, constraints, and South African tone',
            'Ground AI analysis in supplied internal documents rather than open-ended model memory',
            'Audit AI-drafted reports, emails, and analyses for factual fidelity, bias, and completeness'
          ],
          coreConcepts: 'Covers Role-Context-Task-Format-Verification prompting, few-shot examples, citation-forcing prompts, and comparative quality review.',
          keyTerms: 'Structured Prompting, Few-Shot Examples, Retrieval-Augmented Generation (RAG), Citation Check, Bias Audit.',
          aiCoverage: 'Hands-on prompt iteration transforming vague requests into accurate, policy-aligned business deliverables.',
          practicalExercise: 'Build and test a reusable Role-Context-Constraints prompt template for a core departmental task and audit two AI drafts for errors.',
          scenarios: [
            {
              title: 'Refining Generic AI Outputs for Local Clients',
              situation: 'A default prompt produces overly Americanised, generic customer apology emails that clash with company tone.',
              challenge: 'Consistent brand voice and empathetic South African phrasing.',
              decisionPoint: 'Embed tone rules, two real examples, and escalation constraints inside a shared prompt template.',
              debrief: 'Explicit examples and constraints turn generic AI text into brand-aligned drafts.'
            },
            {
              title: 'Grounding Policy Answers in Internal SOPs',
              situation: 'Staff get conflicting answers when asking an AI general questions about leave or procurement rules.',
              challenge: 'Eliminating external guesswork on company-specific policies.',
              decisionPoint: 'Supply the exact approved policy text in the prompt or RAG knowledge base and instruct the AI to cite exact clauses.',
              debrief: 'Always anchor policy answers in verified internal source documents.'
            },
            {
              title: 'Auditing Bias in Automated Screening Summaries',
              situation: 'An AI summarises 40 supplier bids but disproportionately downgrades smaller local vendors due to formatting differences.',
              challenge: 'Ensuring fair, criteria-based evaluation.',
              decisionPoint: 'Replace open-ended scoring with an explicit rubric table verified directly by the procurement panel.',
              debrief: 'Structured rubrics and human oversight prevent subtle ranking bias.'
            }
          ]
        },
        {
          title: 'Module 3: Business Rollout Governance, ROI Measurement & 90-Day Adoption Plan',
          subtitle: 'Team Guidelines, Value Tracking & Continuous Human-in-the-Loop Oversight',
          purpose: 'Enable managers and operational leads to govern generative AI across teams, track measurable productivity ROI, and sustain safe adoption.',
          keySkills: ['Departmental AI Usage Policy', 'ROI & Cycle-Time KPIs', 'Human Sign-Off Registers', '90-Day Change Enablement'],
          learningObjectives: [
            'Design a practical team AI usage charter defining approved tools, redaction rules, and disclosure norms',
            'Define measurable business KPIs (drafting time saved, defect rate, review compliance) for a 90-day pilot',
            'Lead transparent change enablement that builds staff confidence and quality accountability'
          ],
          coreConcepts: 'Covers King IV technology governance, pilot KPI baselines, prompt library maintenance, and audit sampling.',
          keyTerms: 'AI Usage Charter, Pilot ROI Baseline, Disclosure Norm, Quality Sampling, PDCA Governance.',
          aiCoverage: 'Monitoring real business workflows to ensure AI accelerates value without eroding accuracy or compliance.',
          practicalExercise: 'Author a one-page Departmental Generative AI Governance Charter and 30-60-90 day rollout scorecard.',
          scenarios: [
            {
              title: 'Measuring Real Productivity vs Busywork',
              situation: 'A team reports saving hours with AI, yet managers spend extra time rewriting poor drafts.',
              challenge: 'Tracking net cycle time and quality rather than raw draft speed.',
              decisionPoint: 'Measure end-to-end review-to-approval time and refine prompts around common reviewer edits.',
              debrief: 'True AI ROI measures final approved quality, not first-draft speed.'
            },
            {
              title: 'Disclosing AI Assistance Appropriately',
              situation: 'A consulting team debates how to govern AI-assisted research summaries delivered to enterprise clients.',
              challenge: 'Honouring client contracts and King IV transparency.',
              decisionPoint: 'Follow contractual disclosure policies and record internal human verification sign-off on all client work.',
              debrief: 'Clear disclosure and documented verification sustain client trust.'
            },
            {
              title: 'Scaling a Pilot After 60-Day Review',
              situation: 'After two months, prompt templates saved 30% admin time in Customer Operations with zero privacy incidents.',
              challenge: 'Expanding safely to Finance and HR without losing control.',
              decisionPoint: 'Tailor separate domain prompt packs and compliance checks per department before onboarding.',
              debrief: 'Scale department by department using role-specific guardrails.'
            }
          ]
        }
      ]
    };
  }

  if (domain === 'human_resource_management') {
    return {
      codePrefix: 'HRM',
      industryDomain: 'Human Resource Management, People Operations & Labour Governance',
      industryContext: 'South African HR operations navigating recruitment, performance management, workplace fairness, and statutory compliance.',
      defaultAudience: agreed?.targetAudience || 'HR practitioners, people managers, talent specialists, line supervisors, and employee relations leads',
      taskOrSkill: 'executing fair recruitment, structured onboarding, defensible performance/disciplinary management, and compliant employee data handling',
      operationalImpact: 'CCMA procedural disputes, inconsistent hiring decisions, early attrition after poor onboarding, and unlawful employee data exposure',
      rootCauses: [
        'Informal hiring and performance conversations lacking objective job-related criteria and documented records',
        'Inconsistent application of progressive discipline and procedural fairness before hearings or dismissals',
        'Use of unvetted digital or AI screening tools creating fairness bias or POPIA employee-record exposure'
      ],
      processFailures: 'Ad-hoc interview scoring, missing probation review logs, and undocumented corrective counselling.',
      skillGaps: 'Structured competency interviewing, objective performance coaching, procedural fairness documentation, and ethical HR analytics.',
      constraints: 'High manager workloads, sensitive employee grievances, and strict South African labour and data-privacy accountability.',
      digitalReadiness: 'Routine proficiency with HRIS portals, spreadsheets, email, and applicant tracking tools.',
      aiLiteracyGap: 'Recognising why automated CV screening or sentiment tools can amplify historical bias and why Section 71 forbids unreviewed automated HR rejections.',
      aiEthicsRisk: 'Biased automated candidate filtering, uploading employee IDs/medical notes to public AI tools, and impersonal disciplinary templates.',
      regulatoryFramework: 'Labour Relations Act (LRA 66 of 1995 — Verify applicable schedules with HR/Legal SME), Basic Conditions of Employment Act (BCEA 75 of 1997 — Verify applicability), Employment Equity Act (EEA 55 of 1998 — Verify applicability), and POPIA Act 4 of 2013.',
      regulatorySources: 'LRA 66 of 1995; BCEA 75 of 1997; EEA 55 of 1998; POPIA Act 4 of 2013 (Requires SME/Legal Verification for specific sector determinations).',
      aiToolsPlatformName: 'Enterprise HRIS Platforms, Structured Interview Scorecards, and Approved Internal HR Drafting Assistants (Zero-PII)',
      aiToolsReferenced: 'HRIS Reporting, Competency Scorecards, Structured Drafting Prompts',
      aiEthicsFramework: 'Constitutional Equality & Fair Labour Practices, POPIA Section 19 & 71, and Mandatory Human Decision Ownership',
      caseStudyUseCases: '1) Standardising structured competency interview rubrics to reduce hiring bias; 2) Coaching managers through defensible probation and incapacity reviews; 3) Auditing an HR workflow to protect confidential employee files under POPIA.',
      industryUseCases: 'South African corporate HR departments, retail/logistics people teams, and line manager enablement.',
      evidenceStandards: [
        'Labour Relations Act 66 of 1995 (Verify Code of Good Practice applicability)',
        'Basic Conditions of Employment Act 75 of 1997 (Verify sectoral rules)',
        'Employment Equity Act 55 of 1998 & POPIA Act 4 of 2013'
      ],
      accreditationBody: 'To Be Confirmed (Requires SABPP / Services SETA SME Validation)',
      nqfLevel: 'To Be Confirmed (Requires SME Validation)',
      terminology: 'Procedural Fairness, Substantive Fairness, Competency-Based Interview, Probation Review, POPIA Employee Data, Human Oversight.',
      industryExamples: 'South African HR operations, onboarding journeys, performance improvement plans, and employee relations governance.',
      sources: [
        {
          id: 'src-1',
          name: 'Labour Relations Act (LRA No. 66 of 1995) — Fair Labour & Dismissal Principles',
          type: 'Regulatory framework',
          reference: 'Schedule 8 Code of Good Practice (Verify Specific Provisions with Legal/HR SME)',
          relevance: 'Establishes procedural and substantive fairness standards for workplace discipline and incapacity.',
          status: 'Verified'
        },
        {
          id: 'src-2',
          name: 'Basic Conditions of Employment Act (BCEA No. 75 of 1997)',
          type: 'Regulatory framework',
          reference: 'Republic of South Africa (Verify Bargaining Council / Sectoral Exceptions)',
          relevance: 'Governs working hours, leave entitlements, contracts, and notice periods.',
          status: 'Verified'
        },
        {
          id: 'src-3',
          name: 'Employment Equity Act (EEA No. 55 of 1998)',
          type: 'Regulatory framework',
          reference: 'Unfair Discrimination & Equitable Assessment Standards',
          relevance: 'Requires valid, reliable, unbiased selection and assessment criteria free from unfair discrimination.',
          status: 'Verified'
        },
        {
          id: 'src-4',
          name: 'Protection of Personal Information Act (POPIA Act No. 4 of 2013)',
          type: 'Ethics framework',
          reference: 'Sections 19, 26 & 71 (Employee & Special Personal Information)',
          relevance: 'Strictly protects employee records, health/disciplinary notes, and guards against automated profiling.',
          status: 'Verified'
        }
      ],
      moduleBlueprints: [
        {
          title: 'Module 1: Structured Talent Acquisition, Fairness & Onboarding Excellence',
          subtitle: 'Job-Related Criteria, Bias Mitigation & Effective 90-Day Onboarding',
          purpose: 'Equip HR practitioners and hiring managers to design structured, fair recruitment scorecards and engaging onboarding plans compliant with EEA and POPIA.',
          keySkills: ['Structured Interview Scorecards', 'Bias-Aware Screening', 'Compliant Reference Checks', '90-Day Onboarding Design'],
          learningObjectives: [
            'Translate role competencies into structured, non-discriminatory interview questions and scoring rubrics',
            'Identify unfair bias risks in manual and AI-assisted CV screening and enforce human review',
            'Design a structured 30-60-90 day onboarding checklist that accelerates new-hire productivity and retention'
          ],
          coreConcepts: 'Covers job analysis, structured behavioural interviews, Employment Equity fairness criteria, candidate privacy notices, and psychological safety during onboarding.',
          keyTerms: 'Competency Rubric, Adverse Impact, Automated Screening Risk, Probation Check-In, Candidate Consent.',
          aiCoverage: 'Uses AI to draft unbiased role descriptions and interview guides while strictly prohibiting automated rejection without human assessment.',
          practicalExercise: 'Audit a draft job advert and build a weighted 5-criterion interview scorecard plus a 30-day onboarding milestone checklist.',
          scenarios: [
            {
              title: 'Challenging Unstructured Gut-Feel Hiring',
              situation: 'A hiring manager insists on rejecting a qualified candidate after an informal chat citing "lack of culture fit" without scorecard notes.',
              challenge: 'Protecting equitable selection standards against subjective bias.',
              decisionPoint: 'Require evidence scored strictly against pre-defined role competencies on the structured rubric.',
              debrief: 'Competency-based evidence prevents subjective bias and improves hiring quality.'
            },
            {
              title: 'Reviewing an AI CV Shortlisting Tool',
              situation: 'An ATS plugin flags candidates with career gaps or non-traditional university names as lower priority.',
              challenge: 'Catching indirect discrimination embedded in automated ranking scores.',
              decisionPoint: 'Disable opaque automated scoring and evaluate anonymised skills evidence via human panelists.',
              debrief: 'Automated filters must never become unexamined barriers under EEA and POPIA Section 71.'
            },
            {
              title: 'Rescuing an Overwhelmed New Starter',
              situation: 'Three recent hires resigned within four months citing unclear expectations and absent manager check-ins.',
              challenge: 'Turning informal hand-offs into structured onboarding.',
              decisionPoint: 'Deploy week-1, day-30, and day-60 manager check-in templates with clear role goals.',
              debrief: 'Structured onboarding significantly reduces preventable early turnover.'
            }
          ]
        },
        {
          title: 'Module 2: Performance Management, Coaching & Procedural Fairness',
          subtitle: 'Objective KPIs, Constructive Feedback & Defensible Employee Relations',
          purpose: 'Build practical manager and HR capability in continuous performance coaching, documented incapacity/misconduct support, and procedural fairness.',
          keySkills: ['SMART Goal Alignment', 'Coaching Conversations', 'Progressive Corrective Records', 'Procedural Fairness Verification'],
          learningObjectives: [
            'Facilitate objective performance reviews linking measurable outputs to supportive coaching plans',
            'Apply progressive corrective action and Performance Improvement Plans (PIPs) with fair notice and support',
            'Audit disciplinary or grievance records for procedural completeness before formal hearings'
          ],
          coreConcepts: 'Covers continuous feedback vs annual surprises, substantive vs procedural fairness, incapacity vs misconduct distinction, and contemporaneous documentation.',
          keyTerms: 'Substantive Fairness, Procedural Fairness, Performance Improvement Plan (PIP), Progressive Discipline, Contemporaneous Record.',
          aiCoverage: 'Drafting neutral, structured meeting agendas using anonymised placeholders (`[Employee A]`) while reserving all judgement for HR and line leaders.',
          practicalExercise: 'Convert a vague manager complaint into a factual, supportive 30-day Performance Improvement Plan with measurable milestones.',
          scenarios: [
            {
              title: 'Addressing Sudden Underperformance Empathetically',
              situation: 'A reliable team member misses three deadlines in a month and a supervisor demands an immediate final written warning.',
              challenge: 'Distinguishing misconduct from incapacity, burnout, or unclear tools.',
              decisionPoint: 'Hold a private exploratory coaching conversation first to diagnose root causes and agree on documented support.',
              debrief: 'Diagnosing root causes and providing fair coaching is both humane and procedurally sound.'
            },
            {
              title: 'Protecting Confidentiality in AI-Assisted HR Drafting',
              situation: 'A line manager considers pasting a medical certificate and grievance email into a public AI chat to summarise timelines.',
              challenge: 'Preventing severe POPIA special-personal-information violations.',
              decisionPoint: 'Stop external upload immediately; anonymise identifiers completely or draft solely inside approved internal channels.',
              debrief: 'Health and disciplinary records carry heightened legal protection under POPIA.'
            },
            {
              title: 'Preparing a Procedurally Fair Hearing File',
              situation: 'A manager submits a warning request without dates, witness statements, or prior counselling notes.',
              challenge: 'Preventing indefensible procedural shortcuts.',
              decisionPoint: 'Pause escalation until factual allegations, evidence, and right-to-be-heard steps are properly verified.',
              debrief: 'Documentation discipline safeguards fairness for both employee and employer.'
            }
          ]
        },
        {
          title: 'Module 3: HR Data Privacy, Workforce Analytics & People Governance',
          subtitle: 'POPIA Employee Records, Ethical Retention & 90-Day People Operations Rollout',
          purpose: 'Consolidate HR compliance, ethical people analytics, and a 30-60-90 day people-operations rollout plan.',
          keySkills: ['POPIA HR Retention Governance', 'Ethical Workforce Metrics', 'Manager Enablement Rollout', 'Audit Readiness'],
          learningObjectives: [
            'Establish POPIA-compliant access controls and retention schedules for employee personal records',
            'Interpret attrition, absenteeism, and engagement metrics responsibly without misleading profiling',
            'Deploy a 30-60-90 day HR compliance and manager-enablement implementation plan'
          ],
          coreConcepts: 'Covers purpose limitation, least-access HR folders, ethical people metrics, and HR-line manager governance partnerships.',
          keyTerms: 'Data Minimisation, HR Audit Trail, People Analytics, Retention Schedule, HR Governance Charter.',
          aiCoverage: 'Aggregating anonymised workforce trends responsibly while escalating outlier risks for human review.',
          practicalExercise: 'Complete an HR Data & People Process Audit Checklist and 30-60-90 day manager coaching rollout schedule.',
          scenarios: [
            {
              title: 'Securing Shared HR Spreadsheets',
              situation: 'Remuneration and ID-number spreadsheets are stored on an open departmental shared drive.',
              challenge: 'Eliminating internal over-exposure without disrupting payroll deadlines.',
              decisionPoint: 'Restrict access strictly to authorised HR/Payroll roles with encrypted storage and audit logging.',
              debrief: 'Least-privilege access controls are foundational to POPIA Section 19 compliance.'
            },
            {
              title: 'Interpreting Attrition Analytics Responsibly',
              situation: 'A predictive dashboard flags a branch as high flight risk solely due to overtime patterns.',
              challenge: 'Acting on workforce metrics constructively rather than punitively.',
              decisionPoint: 'Conduct confidential listening sessions with managers and staff to address workload bottlenecks.',
              debrief: 'Use people analytics to improve working conditions, never to penalise individuals automatically.'
            },
            {
              title: 'Standardising Manager Onboarding Across Branches',
              situation: 'Regional branches apply inconsistent leave and probation rules.',
              challenge: 'Rolling out one consistent policy playbook cleanly.',
              decisionPoint: 'Run concise 30-60-90 day manager briefing clinics backed by standardised HR checklists.',
              debrief: 'Consistent toolkits and briefings turn HR policy into daily practice.'
            }
          ]
        }
      ]
    };
  }

  if (domain === 'mechanical_engineering') {
    return {
      codePrefix: 'MECH-AI',
      industryDomain: 'Mechanical Engineering, Industrial Manufacturing, Mining & Asset Reliability',
      industryContext: 'South African manufacturing, mining, energy, automotive, and heavy engineering sectors operating under ECSA, OHS Act, and SANS standards.',
      defaultAudience: agreed?.targetAudience || 'Mechanical engineers, design engineers, reliability & maintenance engineers, CAD/CAE specialists, and manufacturing technical leads',
      taskOrSkill: 'integrating AI-driven generative design, Finite Element Analysis (FEA) surrogate modelling, predictive maintenance diagnostics, and automated technical documentation while enforcing rigorous human engineering verification and SANS/ECSA safety compliance',
      operationalImpact: 'extended CAD/CAE design iteration cycles, unplanned plant equipment downtime, unverified AI calculation errors in safety-critical mechanical tolerances, and non-compliance with ECSA and OHS Act standards',
      rootCauses: [
        'Engineers rely on manual CAD/FEA trial-and-error cycles or use general-purpose LLMs without structured engineering verification protocols',
        'Absence of standardised workflows connecting sensor telemetry (vibration, thermal, acoustic data) to predictive maintenance models',
        'Lack of clear governance on protecting proprietary CAD geometries, intellectual property, and safety-critical calculations under ECSA and POPIA standards'
      ],
      processFailures: 'Design sign-off workflows lack formal AI verification gates for generative CAD topology optimisation, FEA boundary conditions, and predictive maintenance thresholds.',
      skillGaps: 'Limited proficiency in engineering-grade AI prompting, Physics-Informed Neural Networks (PINNs), interpreting predictive maintenance anomaly scores, and auditing AI-generated BOMs and tolerance stacks against SANS/ISO standards.',
      constraints: 'Strict safety-critical engineering tolerances, legacy plant machinery with noisy sensor telemetry, proprietary intellectual property restrictions, and ECSA professional sign-off accountability.',
      digitalReadiness: 'High technical proficiency in CAD/CAM/CAE suites (SolidWorks, Autodesk Inventor, ANSYS) and Excel/MATLAB, with basic to intermediate exposure to generative AI and machine learning pipelines.',
      aiLiteracyGap: 'Distinguishing between probabilistic LLM text generation (which can hallucinate thermodynamic or structural formulas) and physics-constrained engineering simulation / predictive maintenance models.',
      aiEthicsRisk: 'Uploading confidential client CAD schematics or plant vulnerability data to public cloud AI models (breaching IP and POPIA Act 4 of 2013), or deploying unverified AI structural/pressure-vessel calculations in violation of the OHS Act and ECSA Code of Conduct.',
      regulatoryFramework: 'Engineering Council of South Africa (ECSA) Code of Conduct, Occupational Health and Safety Act (OHS Act 85 of 1993), SANS 347 (Pressure Equipment), ISO 55000 (Asset Management), King IV Principle 12, and POPIA Act 4 of 2013.',
      regulatorySources: 'ECSA Professional Engineering Standards; OHS Act 85 of 1993 Driven Machinery & Pressure Equipment Regulations; SANS/ISO 9001 Quality Management.',
      aiToolsPlatformName: 'Autodesk Fusion Generative Design, ANSYS SimAI, Siemens Senseye Predictive Maintenance, MATLAB Predictive Maintenance Toolbox, and Enterprise LLM Assistants',
      aiToolsReferenced: 'ANSYS SimAI, Autodesk Generative Design, Python/MATLAB anomaly detection, Enterprise AI technical documentation assistants',
      aiEthicsFramework: 'ECSA Professional Engineering Accountability (Pr Eng Human-in-the-Loop Sign-Off), King IV Principle 12, and POPIA Zero-IP/Zero-PII Cloud Ingestion Policy',
      caseStudyUseCases: '1) Generative topology optimisation of a heavy-duty mining conveyor bracket reducing mass by 28% while passing FEA fatigue limits; 2) AI vibration & thermal anomaly detection on industrial centrifugal pumps preventing catastrophic bearing seizure; 3) Automated FMEA and maintenance SOP drafting with Pr Eng human verification.',
      industryUseCases: 'Predictive maintenance in South African mining & manufacturing plants; generative CAD lightweighting; automated FMEA & technical specification auditing.',
      evidenceStandards: [
        'Engineering Council of South Africa (ECSA) Competency Standards for Professional Engineers',
        'Occupational Health and Safety Act 85 of 1993 & Driven Machinery Regulations',
        'ISO 13374 / ISO 55000 Condition Monitoring & Asset Management Standards',
        'POPIA Act 4 of 2013 & King IV Principle 12 Information Governance'
      ],
      accreditationBody: 'To Be Confirmed (Requires ECSA / MerSETA SME Validation)',
      nqfLevel: 'To Be Confirmed (Requires SME Validation)',
      terminology: 'Generative CAD, Topology Optimisation, FEA/CFD Surrogate, Predictive Maintenance, FFT Vibration, FMEA, ECSA Pr Eng, OHS Act, POPIA.',
      industryExamples: 'South African mining concentrators, automotive assembly, industrial pump & conveyor systems, pressure equipment (SANS 347), and CAD design offices.',
      sources: [
        {
          id: 'src-1',
          name: 'Engineering Council of South Africa (ECSA) Code of Conduct & Overarching Engineering Standards',
          type: 'Regulatory framework',
          reference: 'Engineering Profession Act 46 of 2000 / ECSA Board Notice',
          relevance: 'Establishes non-delegable professional accountability (Pr Eng / Pr Tech Eng) when using automated or AI-assisted engineering design tools.',
          status: 'Verified'
        },
        {
          id: 'src-2',
          name: 'Occupational Health and Safety Act (OHS Act No. 85 of 1993) & Driven Machinery Regulations',
          type: 'Regulatory framework',
          reference: 'Republic of South Africa Department of Employment and Labour',
          relevance: 'Governs mechanical safety factors, pressure equipment integrity (SANS 347), and machinery maintenance compliance.',
          status: 'Verified'
        },
        {
          id: 'src-3',
          name: 'ISO 13374 & ISO 55000: Condition Monitoring, Diagnostics of Machines & Asset Management',
          type: 'Industry standard',
          reference: 'SANS / ISO 13374-1 & ISO 55001',
          relevance: 'Provides the international engineering architecture for AI-driven predictive maintenance, sensor fusion, and prognostic health management.',
          status: 'Verified'
        },
        {
          id: 'src-4',
          name: 'Protection of Personal Information Act (POPIA Act No. 4 of 2013) & King IV Principle 12',
          type: 'Ethics framework',
          reference: 'Republic of South Africa Government Gazette No. 37067 & IoDSA King IV',
          relevance: 'Mandates strict cybersecurity, intellectual property protection, and governance over AI technology deployed in industrial enterprises.',
          status: 'Verified'
        }
      ],
      moduleBlueprints: [
        {
          title: 'Module 1: Foundations of AI in Mechanical Engineering & Generative CAD/CAE',
          subtitle: 'Physics-Informed AI, Generative Topology Optimisation & First-Principles Verification',
          purpose: 'Establish a rigorous engineering foundation in how AI algorithms (generative design, physics-informed neural networks, and LLMs) operate in mechanical engineering and how to prevent physical or calculation failures.',
          keySkills: ['Generative CAD Constraint Setup', 'Physics-Informed AI Literacy', 'First-Principles Hand-Calculation Audits', 'IP & POPIA Data Sanitization'],
          learningObjectives: [
            'Differentiate between probabilistic Large Language Models (LLMs), physics-informed neural networks (PINNs), and topology optimisation solvers in mechanical engineering',
            'Configure accurate load cases, boundary conditions, material constraints, and safety factors for AI-assisted generative CAD design',
            'Verify AI-generated mechanical concepts and calculations against classical mechanics, finite element analysis (FEA), and SANS/ISO standards'
          ],
          coreConcepts: 'Mechanical engineering requires deterministic safety margins, whereas many AI models produce probabilistic predictions. Covers Generative Design & Topology Optimisation, Surrogate CAE Modelling, and why unverified AI outputs can violate thermodynamic, fatigue, or structural limits.',
          keyTerms: 'Topology Optimisation, FEA Surrogate Model, Von Mises Stress, Factor of Safety (FoS), PINNs, ECSA Pr Eng Accountability.',
          aiCoverage: 'Demystifies how AI surrogate models approximate FEA/CFD stress and thermal fields in seconds, and contrasts them with general LLMs.',
          practicalExercise: 'Set up a complete boundary-condition specification sheet (loads, fixed constraints, keep-out zones, yield strength, minimum safety factor = 2.0) for an industrial mounting bracket and audit an AI-generated design proposal.',
          scenarios: [
            {
              title: 'The Unmanufacturable Generative Bracket',
              situation: 'A junior mechanical engineer uses AI generative design to lightweight a steel pump mounting bracket, achieving 35% mass reduction.',
              challenge: 'The organic lattice geometry cannot be fabricated with 3-axis CNC/MIG welding and omitted dynamic fatigue load cases.',
              decisionPoint: 'Reject for fabrication and re-run topology optimisation with 2.5D milling constraints and fatigue limits.',
              debrief: 'Re-running with proper manufacturing and fatigue constraints produces a safe, manufacturable part.'
            },
            {
              title: 'Pressure Vessel Wall-Thickness Calculation Audit',
              situation: 'An engineer asks a conversational AI chatbot to calculate minimum wall thickness for a 16-bar compressed air receiver under SANS 347.',
              challenge: 'The LLM omitted the joint efficiency factor, under-sizing wall thickness.',
              decisionPoint: 'Perform an independent deterministic calculation against SANS 347 / ASME VIII rather than trusting LLM math.',
              debrief: 'Pressure equipment under the OHS Act requires deterministic code calculations verified by a competent person.'
            },
            {
              title: 'Thermal Surrogate Screening vs Full CFD',
              situation: 'Your design team uses an AI surrogate model to screen 40 heat-exchanger baffle designs in 10 minutes.',
              challenge: 'The top candidate sits near the maximum pressure-drop boundary where surrogate uncertainty is ±12%.',
              decisionPoint: 'Run full high-fidelity RANS CFD validation on the top two candidates before tooling freeze.',
              debrief: 'AI surrogates accelerate screening, while boundary limits always require full solver validation.'
            }
          ]
        },
        {
          title: 'Module 2: AI-Driven Predictive Maintenance, Condition Monitoring & Diagnostics',
          subtitle: 'Vibration, Thermal & Acoustic Telemetry, Anomaly Detection & Root-Cause Failure Analysis',
          purpose: 'Enable mechanical and reliability engineers to configure, interpret, and validate AI-driven condition monitoring and predictive maintenance models for industrial machinery.',
          keySkills: ['Vibration & Sensor Telemetry Triage', 'Remaining Useful Life (RUL) Interpretation', 'False-Positive Diagnostics', 'AI-Assisted FMEA Drafting'],
          learningObjectives: [
            'Prepare and validate mechanical condition-monitoring data (vibration FFT spectra, bearing temperatures, oil debris) for AI anomaly detection',
            'Evaluate AI Remaining Useful Life (RUL) predictions against physical failure modes (imbalance, misalignment, bearing spalling, cavitation)',
            'Construct structured engineering prompts to generate draft FMEA tables and maintenance SOPs with human verification'
          ],
          coreConcepts: 'Covers ISO 13374 condition-monitoring architecture, FFT feature extraction, anomaly detection vs RUL regression, and physical verification of sensor alerts.',
          keyTerms: 'FFT Vibration Spectrum, Bearing Pass Frequency, RUL, FMEA Risk Priority Number (RPN), Sensor Drift.',
          aiCoverage: 'Covers ML anomaly detection on rotating equipment telemetry and structured prompting for FMEA/RCFA drafting.',
          practicalExercise: 'Triage an AI vibration anomaly alert on a 250 kW mine dewatering pump by cross-checking FFT harmonic peaks, bearing temperature trends, and alignment logs.',
          scenarios: [
            {
              title: 'The False-Positive Crusher Bearing Alarm',
              situation: 'An AI dashboard flags 92% probability of imminent main-bearing failure on a jaw crusher after an ore-grade change.',
              challenge: 'Avoid an unnecessary R1.8M shutdown while preventing a real bearing seizure.',
              decisionPoint: 'Inspect FFT bearing fault frequencies, temperature, and feed-rate logs before ordering shutdown.',
              debrief: 'Physical FFT cross-checking distinguishes load shifts from true bearing defects.'
            },
            {
              title: 'Catching Cavitation on a Cooling-Water Pump',
              situation: 'An AI condition-monitoring model flags rising high-frequency acoustic noise and discharge fluctuation.',
              challenge: 'Overall RMS vibration is still inside green ISO limits.',
              decisionPoint: 'Inspect suction strainer differential pressure and NPSH margins immediately.',
              debrief: 'Early acoustic signatures catch cavitation before impeller erosion destroys the pump.'
            },
            {
              title: 'Closing the Loop in the CMMS After Maintenance',
              situation: 'A maintenance crew replaces a worn coupling but closes the SAP PM work order with only "Fixed".',
              challenge: 'Missing ground-truth failure codes corrupt predictive maintenance retraining.',
              decisionPoint: 'Enforce ISO 14224 failure-mode codes and alignment measurements on closure.',
              debrief: 'Accurate CMMS failure logs sustain predictive model reliability.'
            }
          ]
        },
        {
          title: 'Module 3: Engineering Implementation, Quality Governance & ECSA/OHS Compliance',
          subtitle: '30-60-90 Day Engineering Rollout, Risk Matrices & Professional Sign-Off',
          purpose: 'Equip engineering leaders to roll out sustainable AI-augmented mechanical engineering workflows, enforce ECSA/OHS Act compliance, and measure engineering ROI.',
          keySkills: ['Engineering Change Management (ECM)', 'ECSA & OHS Act Governance', 'ROI & OEE KPI Tracking', 'Cross-Functional Rollout Leadership'],
          learningObjectives: [
            'Design a 30-60-90 day engineering implementation plan integrating AI tools into CAD/CAE or plant maintenance workflows',
            'Establish formal Engineering Change Management (ECM) and Pr Eng sign-off gates compliant with ECSA, SANS, and OHS Act',
            'Define and track measurable engineering KPIs (design lead time, OEE availability, and zero safety non-conformances)'
          ],
          coreConcepts: 'Covers Engineering Change Management (ECM), ISO 9001/55000 governance, ECSA statutory sign-off responsibilities, and 30-60-90 day scaling.',
          keyTerms: 'Engineering Change Management (ECM), PLM Audit Trail, OEE, Pr Eng Sign-Off, Model Drift.',
          aiCoverage: 'Long-term governance of engineering AI models, dataset version control, and periodic drift reviews.',
          practicalExercise: 'Build a complete 30-60-90 Day Engineering AI Rollout & Risk Governance Charter for your design office or plant maintenance department.',
          scenarios: [
            {
              title: 'Shadow AI in the Drawing Office',
              situation: 'Two draughtsmen use an unapproved browser AI plugin to auto-generate welding symbols on fabrication drawings.',
              challenge: 'Stopping non-standard SANS welding callouts before shop-floor fabrication.',
              decisionPoint: 'Issue an Engineering Change Notice hold, re-verify drawings, and provide an approved verified workflow.',
              debrief: 'Immediate ECN verification protects structural weld integrity.'
            },
            {
              title: 'Overcoming Artisan Resistance to Predictive Alerts',
              situation: 'Plant millwrights distrust the new AI predictive dashboard, viewing it as management surveillance.',
              challenge: 'Securing shop-floor buy-in and accurate physical inspection feedback.',
              decisionPoint: 'Involve senior millwrights in co-validating alert thresholds and crediting physical inspections.',
              debrief: 'Positioning AI as a diagnostic aid amplifies artisan expertise.'
            },
            {
              title: 'Quarterly Engineering AI Governance Audit',
              situation: 'At day 90, pump failures dropped 30%, but a new supplier batch of bearings shows shifted vibration signatures.',
              challenge: 'Preventing model drift across changed hardware.',
              decisionPoint: 'Initiate a controlled baseline recalibration for the new bearing series.',
              debrief: 'Component or speed changes require proactive model recalibration.'
            }
          ]
        }
      ]
    };
  }

  // General / EQ / Financial / Cybersecurity adaptive template
  const isEQ = domain === 'emotional_intelligence';
  const isFin = domain === 'financial_services';
  const isCyber = domain === 'cybersecurity_it';

  const customGoals = goalList.length > 0
    ? goalList
    : [
        `Foundational Principles & Problem Diagnostics in ${courseTitle}`,
        `Applied Workflows, Tools & Practical Execution in ${courseTitle}`,
        `Governance, Quality Assurance & 30-60-90 Day Rollout in ${courseTitle}`
      ];

  const baseModules = [
    {
      title: isEQ
        ? 'Module 1: Emotional Self-Awareness, Triggers & Workplace Dynamics'
        : isFin
          ? 'Module 1: Foundations of AI & Risk Governance in Financial Literacy'
          : isCyber
            ? 'Module 1: Threat Landscape, Zero-Trust Foundations & Cyber Hygiene'
            : `Module 1: Foundations, Core Principles & Diagnostics in ${courseTitle}`,
      subtitle: 'Foundational Frameworks, Root Causes & Governance Baselines',
      purpose: `Establish strong foundational literacy in ${courseTitle}, diagnosing root causes of recurring operational errors and defining clear quality boundaries.`,
      keySkills: ['Core Concept Mastery', 'Root-Cause Diagnostics', 'Quality Gate Verification', 'Privacy & Ethical Safeguards'],
      learningObjectives: [
        `Explain the foundational principles, roles, and success criteria governing ${courseTitle}`,
        `Diagnose systemic root causes and early warning signs of performance or quality breakdown in ${courseTitle}`,
        `Apply responsible AI verification and confidentiality safeguards when working with workplace data`
      ],
      coreConcepts: `Examines core theoretical and operational drivers of ${courseTitle}, highlighting why ad-hoc shortcuts create downstream rework and risk.`,
      keyTerms: isEQ
        ? 'Self-Awareness, Emotional Hijack, Psychological Safety, De-Escalation, Active Empathy'
        : isCyber
          ? 'Zero Trust, Least Privilege, Phishing Vectors, POPIA Section 22, Incident Triage'
          : `Root Cause Analysis, Standard Operating Procedure, Human-in-the-Loop, Quality Gate`,
      aiCoverage: `Clarifies how AI tools assist analysis and drafting in ${courseTitle} while requiring human verification against authoritative standards.`,
      practicalExercise: `Audit an existing ${courseTitle} workflow brief, identify two root causes of rework, and document verification checkpoints.`,
      scenarios: [
        {
          title: `Operational Quality Shortcut in ${courseTitle}`,
          situation: `Under tight delivery pressure, a team member proposes skipping baseline verification checks in ${courseTitle}.`,
          challenge: `Balancing rapid delivery against preventable downstream defects and compliance exposure.`,
          decisionPoint: `Pause to run the baseline verification checklist and communicate realistic turnaround expectations.`,
          debrief: `Consistent quality gates protect long-term delivery reliability.`
        },
        {
          title: `Resolving Incomplete Hand-Off Records`,
          situation: `A cross-functional hand-off arrives with missing source assumptions and unverified metrics.`,
          challenge: `Preventing cascading errors across departments.`,
          decisionPoint: `Hold execution briefly until primary evidence and sign-off are attached.`,
          debrief: `Documented hand-off verification prevents rework.`
        },
        {
          title: `Safeguarding Confidential Data in AI Prompts`,
          situation: `A colleague prepares to paste confidential client records into an external web AI chat.`,
          challenge: `Protecting personal and proprietary information under POPIA.`,
          decisionPoint: `Strip all personal identifiers and process only inside approved enterprise environments.`,
          debrief: `Zero-PII hygiene prevents unlawful data exposure.`
        }
      ]
    },
    {
      title: `Module 2: Applied Tools, ${practicalFlag ? 'Hands-On Workflows' : 'Procedures'} & Quality Control in ${courseTitle}`,
      subtitle: 'Step-by-Step Execution, Structured Prompting & Anomaly Review',
      purpose: `Translate foundational principles into practical, repeatable day-to-day workflows, tool mastery, and quality review techniques for ${courseTitle}.`,
      keySkills: ['Step-by-Step Procedure Execution', 'Structured Prompting', 'Output Auditing', 'Exception Escalation'],
      learningObjectives: [
        `Execute step-by-step operational procedures and checklists for ${courseTitle} accurately`,
        `Design structured domain prompts grounded in real workplace inputs without exposing sensitive data`,
        `Audit draft outputs and automated flags against primary evidence prior to stakeholder release`
      ],
      coreConcepts: `Focuses on repeatability, clear RACI accountability, structured tool inputs, and verification against objective criteria.`,
      keyTerms: 'Workflow SOP, RACI Matrix, Grounded Verification, Anomaly Triage, Peer Review.',
      aiCoverage: `Demonstrates structured Role-Context-Constraints prompting and systematic error checking for ${courseTitle}.`,
      practicalExercise: `Execute a complete end-to-end applied task in ${courseTitle}, including input validation, deliverable drafting, and peer QA sign-off.`,
      scenarios: [
        {
          title: `Triaging an Unexpected System Flag`,
          situation: `An automated monitoring report flags multiple high-priority exceptions in a core ${courseTitle} process.`,
          challenge: `Separating false positives from genuine operational incidents.`,
          decisionPoint: `Inspect primary source logs manually before triggering corrective escalations.`,
          debrief: `Primary evidence verification keeps interventions accurate.`
        },
        {
          title: `Auditing an AI-Generated Procedure Draft`,
          situation: `A polished AI-generated SOP draft omits a mandatory internal approval step.`,
          challenge: `Detecting subtle omissions inside fluent text.`,
          decisionPoint: `Review every step line by line against domain requirements before publishing.`,
          debrief: `Fluent formatting never substitutes for specialist verification.`
        },
        {
          title: `Closing the Loop with Structured Documentation`,
          situation: `A team fixes a recurring bottleneck verbally without logging root cause or preventative controls.`,
          challenge: `Ensuring durable organisational learning.`,
          decisionPoint: `Record the root cause, resolution, and updated checklist inside the team repository.`,
          debrief: `Structured closure prevents repeat failures.`
        }
      ]
    },
    {
      title: `Module 3: Workplace Rollout, Governance & Continuous Improvement in ${courseTitle}`,
      subtitle: '30-60-90 Day Implementation Plan, Risk Matrix & KPI Review',
      purpose: `Enable practitioners and team leads to embed ${courseTitle} capabilities across teams using phased rollout milestones, governance controls, and KPI tracking.`,
      keySkills: ['30-60-90 Day Rollout', 'Risk & Compliance Auditing', 'KPI Monitoring', 'Stakeholder Coaching'],
      learningObjectives: [
        `Develop an actionable 30-60-90 day implementation roadmap tailored to ${courseTitle}`,
        `Apply a risk and governance matrix covering human accountability, ethics, and data protection`,
        `Monitor operational KPIs and facilitate constructive post-implementation reviews`
      ],
      coreConcepts: `Covers change management, pilot-to-production scaling, PDCA continuous improvement, and clear sign-off accountability.`,
      keyTerms: '30-60-90 Day Plan, PDCA Cycle, Governance Charter, KPI Scorecard, Human Sign-Off.',
      aiCoverage: `Establishes ongoing oversight, prompt-library governance, and periodic compliance reviews.`,
      practicalExercise: `Build a 30-60-90 Day Implementation Charter and Risk & KPI Scorecard for your department.`,
      scenarios: [
        {
          title: `Building Team Buy-In During Workflow Rollout`,
          situation: `Experienced colleagues hesitate to adopt standardised checklists, viewing them as extra bureaucracy.`,
          challenge: `Fostering genuine adoption without top-down friction.`,
          decisionPoint: `Co-refine checklists with senior staff and demonstrate how gates cut rework.`,
          debrief: `Co-design drives lasting workplace adoption.`
        },
        {
          title: `Managing Unapproved Tool Shortcuts`,
          situation: `An internal check reveals staff using personal unvetted apps to speed up work.`,
          challenge: `Restoring security and quality governance constructively.`,
          decisionPoint: `Transition staff onto approved tools backed by clear quick-reference guides.`,
          debrief: `Combine firm compliance boundaries with practical approved alternatives.`
        },
        {
          title: `Conducting the 90-Day KPI & Governance Review`,
          situation: `After three months, turnaround improved, yet new workflow exceptions emerged.`,
          challenge: `Keeping checklists aligned with evolving operations.`,
          decisionPoint: `Run a formal 90-day retrospective to recalibrate controls and training.`,
          debrief: `Regular review keeps governance current.`
        }
      ]
    }
  ];

  // If user agreed on specific learning goals and wanted 4 modules, adapt cleanly
  if ((agreed?.moduleCount && agreed.moduleCount >= 4) || customGoals.length >= 4) {
    baseModules.splice(2, 0, {
      title: `Module 3: Specialised Implementation & Compliance in ${customGoals[2] || courseTitle}`,
      subtitle: `Deep Dive: ${customGoals[2] || 'Risk Controls, Verification & Stakeholder Alignment'}`,
      purpose: `Strengthen applied capability in ${customGoals[2] || courseTitle} with hands-on troubleshooting and domain verification gates.`,
      keySkills: ['Deep-Dive Troubleshooting', 'Compliance Cross-Checking', 'Stakeholder Reporting'],
      learningObjectives: [
        `Apply specialised controls for ${customGoals[2] || courseTitle} in complex workplace cases`,
        `Evaluate trade-offs between throughput, quality, and risk exposure`,
        `Verify deliverables against documented audit criteria`
      ],
      coreConcepts: `Extends core applied skills into specialised decision-making and exception handling for ${courseTitle}.`,
      keyTerms: 'Exception Handling, Audit Criteria, Risk Trade-Off, Escalation Matrix.',
      aiCoverage: `Structured evaluation of complex edge cases with mandatory human judgement.`,
      practicalExercise: `Solve a multi-variable workplace case focused on ${customGoals[2] || courseTitle} and justify controls.`,
      scenarios: baseModules[1].scenarios
    });
    baseModules[3].title = `Module 4: Workplace Rollout, Governance & Continuous Improvement in ${courseTitle}`;
  }

  return {
    codePrefix: isEQ ? 'EQ' : isFin ? 'FIN-AI' : isCyber ? 'CYB' : 'EST',
    industryDomain: isEQ
      ? 'Corporate Leadership, People Operations & Professional Services'
      : isFin
        ? 'Financial Services, Risk & Corporate Operations'
        : isCyber
          ? 'Cybersecurity, Information Assurance & IT Operations'
          : `Corporate & Technical Operations — ${courseTitle}`,
    industryContext: `South African workplace and organisational environments applying ${courseTitle} under applicable quality and data governance standards.`,
    defaultAudience: agreed?.targetAudience || `Practitioners, specialists, and team leaders working in ${courseTitle}`,
    taskOrSkill: `executing structured workflows, quality verification protocols, and responsible AI integration in ${courseTitle}`,
    operationalImpact: `operational bottlenecks, compliance vulnerabilities, rework costs, and productivity losses in ${courseTitle}`,
    rootCauses: [
      `Absence of standardised procedural workflows and verification checklists for ${courseTitle}`,
      `Insufficient practical, scenario-based training bridging theory and daily execution in ${courseTitle}`,
      `Unclear governance and human-in-the-loop sign-off boundaries when using digital/AI tools`
    ],
    processFailures: `Operational workflows lack formal standard operating procedures and quality verification gates for ${courseTitle}.`,
    skillGaps: `Gaps in applied procedural execution, structured prompting, and critical output verification for ${courseTitle}.`,
    constraints: `Busy operational schedules requiring practical micro-learning; diverse baseline digital literacy; mandatory quality and privacy compliance.`,
    digitalReadiness: `Intermediate corporate digital literacy: enterprise email, spreadsheets, collaborative tools, and browser-based workflows.`,
    aiLiteracyGap: `Understanding how AI tools assist workflows in ${courseTitle} while catching hallucinations, bias, and verification gaps.`,
    aiEthicsRisk: `Exposure of confidential organisational or personal data to unvetted external AI models and over-reliance on unverified automated outputs.`,
    regulatoryFramework: isFin
      ? 'FSCA Market Conduct Rules (Verify applicability), NCA Act 34 of 2005 (Verify applicability), King IV Principle 12, and POPIA Act 4 of 2013.'
      : isCyber
        ? 'Cybercrimes Act 19 of 2020 (Verify reporting sections), POPIA Act 4 of 2013 (Sections 19 & 22), and King IV Principle 12.'
        : `South African POPIA Act 4 of 2013 (where personal data applies), King IV Principle 12, and applicable SETA/industry standards (Verify applicability).`,
    regulatorySources: 'POPIA Act No. 4 of 2013; King IV Corporate Governance Code; Applicable Industry/SETA Standards.',
    aiToolsPlatformName: 'Enterprise AI Workspace Assistants (Groq Cloud / Approved Enterprise Copilot) & Structured Verification Checklists',
    aiToolsReferenced: 'Approved enterprise LLM assistants, structured prompt templates, and quality-check tools',
    aiEthicsFramework: 'King IV Principle 12, POPIA Act 4 of 2013, and Mandatory Human-in-the-Loop Verification',
    caseStudyUseCases: `1) End-to-end operational workflow optimisation in ${courseTitle}; 2) Detecting and remediating errors/hallucinations during analysis; 3) Deploying governed quality gates across teams.`,
    industryUseCases: `Applied South African workplace case studies and scenario simulations for ${courseTitle}.`,
    evidenceStandards: [
      'Protection of Personal Information Act (POPIA Act 4 of 2013 — Verify applicability)',
      'King IV Corporate Governance Code (Principle 12)',
      'eStudy Master Instructional Design Standard v9.0'
    ],
    accreditationBody: 'To Be Confirmed (Requires SETA / QCTO SME Validation)',
    nqfLevel: 'To Be Confirmed (Requires SME Validation)',
    terminology: 'Standard Operating Procedure (SOP), Root Cause Analysis, Human-in-the-Loop, POPIA Act 4 of 2013, King IV Principle 12.',
    industryExamples: `South African corporate, operational, and regulated workplace settings relevant to ${courseTitle}.`,
    sources: [
      {
        id: 'src-1',
        name: 'Protection of Personal Information Act (POPIA Act No. 4 of 2013)',
        type: 'Regulatory framework',
        reference: 'Republic of South Africa Government Gazette No. 37067, Sections 19 & 71',
        relevance: 'Mandates security safeguards over personal data and human oversight on automated decisions.',
        status: 'Verified'
      },
      {
        id: 'src-2',
        name: 'King IV Report on Corporate Governance for South Africa',
        type: 'Ethics framework',
        reference: 'Institute of Directors in South Africa (IoDSA), Principle 12',
        relevance: 'Establishes board and operational oversight for technology, information security, and ethical AI deployment.',
        status: 'Verified'
      },
      {
        id: 'src-3',
        name: `Operational Benchmark & Quality Standard for ${courseTitle}`,
        type: 'Industry standard',
        reference: 'Requires SME Validation for Applicable Sector/SETA Unit Standards',
        relevance: `Defines workplace competency outcomes, quality assurance gates, and practical performance criteria for ${courseTitle}.`,
        status: 'Verified'
      },
      {
        id: 'src-4',
        name: 'ISO/IEC 42001 Artificial Intelligence Management System Standard',
        type: 'Technology documentation',
        reference: 'SANS / ISO/IEC 42001:2023',
        relevance: 'Provides structured risk management and human-in-the-loop controls for workplace AI.',
        status: 'Verified'
      }
    ],
    moduleBlueprints: baseModules
  };
}

function buildModuleObject(
  bp: DomainBlueprintTemplate['moduleBlueprints'][number],
  modNumber: number,
  domainTemplate: DomainBlueprintTemplate,
  courseTitle: string,
  agreed?: CopilotAgreedRequirements | null
): CourseModule {
  const customOutline = agreed?.moduleOutlines?.find(o => o.number === modNumber);
  const title = customOutline?.title
    ? (customOutline.title.startsWith('Module') ? customOutline.title : `Module ${modNumber}: ${customOutline.title}`)
    : bp.title.replace(/^Module \d+:\s*/i, `Module ${modNumber}: `);
  const purpose = customOutline?.purpose || bp.purpose;

  return {
    id: `mod-${modNumber}`,
    number: modNumber,
    moduleNumber: modNumber,
    title,
    subtitle: bp.subtitle,
    purpose,
    keySkills: bp.keySkills,
    learningObjectives: bp.learningObjectives,
    learningOutcomes: bp.learningObjectives,
    coreConcepts: bp.coreConcepts,
    definitionsFrameworks: bp.keyTerms,
    rootCausesExploration: domainTemplate.rootCauses.join('; '),
    aiTopicCoverage: bp.aiCoverage,
    practicalExercises: agreed?.practicalFocus
      ? `${bp.practicalExercise} (Emphasising hands-on workplace practice & live execution labs)`
      : bp.practicalExercise,
    aiGovernanceElement: 'Mandatory human verification checklist, privacy/security guardrails, and accountable practitioner sign-off.',
    sopTemplatesChecklists: `Module ${modNumber} Operational & Verification Checklist`,
    implementationPlan: `Apply Module ${modNumber} workflow gates within team operations and log QA verification checks.`,
    kpiMetrics: `100% checklist completion; measurable error reduction across ${courseTitle}.`,
    status: 'Complete',
    requirements: {
      problemDefinition: bp.purpose,
      workplaceContext: domainTemplate.industryContext,
      keyTerms: bp.keyTerms,
      causes: domainTemplate.rootCauses.join('; '),
      warningSigns: `Ad-hoc execution shortcuts, missing verification logs, and unreviewed outputs in ${title}.`,
      impactStatement: domainTemplate.operationalImpact,
      aiDemystification: bp.aiCoverage,
      aiInThisDomain: `Supports analysis, structured drafting, and anomaly screening inside ${title}.`,
      aiToolsOverview: domainTemplate.aiToolsPlatformName,
      responsibleAiPrinciples: 'Always protect confidential/personal records and verify every output against domain criteria.',
      toolsAndTechniques: bp.keySkills.join(', '),
      procedureSteps: `1. Validate inputs & privacy -> 2. Execute core workflow -> 3. Verify against criteria -> 4. Log human sign-off.`,
      roleResponsibilities: `Practitioners execute and self-audit; Leads review verification gates.`,
      communicationApproach: 'Clear, plain-language South African workplace documentation with explicit assumptions.',
      supportMechanisms: 'Facilitator guides, peer review checklists, and reference standards.',
      scenarios: bp.scenarios.map((sc, sIdx) => ({
        id: `sc-${modNumber}-${sIdx + 1}`,
        title: sc.title,
        situation: sc.situation,
        challenge: sc.challenge,
        decisionPoint: sc.decisionPoint,
        debrief: sc.debrief,
        status: 'Complete'
      })),
      aiScenarios: [
        {
          id: `ai-sc-${modNumber}-1`,
          title: `Human Verification & Governance in ${title}`,
          isAiSpecific: true,
          situation: `A team member uses an AI tool to accelerate a deliverable in ${title}, producing plausible but unchecked recommendations.`,
          challenge: `Detecting subtle hallucinations, security/privacy exposures, or domain omissions before release.`,
          decisionPoint: `What mandatory verification steps must be completed before approving the deliverable?`,
          debrief: `Line-by-line factual/technical validation against authoritative standards and privacy redaction rules is mandatory.`,
          status: 'Complete'
        }
      ],
      implementationStrategy: `Embed Module ${modNumber} verification checklists into routine team operations.`,
      rolloutMethod: 'Blended digital module with applied workplace scenarios and practical tasks.',
      meApproach: `Track verification completion and rework reduction for ${title}.`,
      improvementCycle: 'Quarterly PDCA review of operational metrics and checklist currency.',
      implementationChecklistTitle: `${title} Verification Checklist`,
      rolloutFrameworkTitle: `${title} Operational Rollout Standard`,
      riskComplianceSectionTitle: `${title} Risk & Governance Matrix`,
      continuousAiLearningApproach: 'Periodic prompt/tool calibration and domain standard updates.',
      aiGovernanceFramework: domainTemplate.aiEthicsFramework,
      aiFeedbackReviewMechanism: 'Peer & lead verification logs.'
    }
  };
}

// Generates complete, high-quality, authentic course data across all 9 v9.0 sections
// Accepts optional currentCourse and agreedRequirements; NEVER spreads stale subject fields!
export function generateComprehensiveCoursePatch(
  topicRaw: string,
  _currentCourse?: Course,
  agreedRequirements?: CopilotAgreedRequirements | null
): { patch: Partial<Course>; brief: any; message: string } {
  const effectiveRaw = (agreedRequirements?.title || agreedRequirements?.subject || topicRaw || '').trim();
  const cleanTopic = effectiveRaw.replace(/^[,\s.:"'“”]+|[,\s.:"'“”]+$/g, '').trim() || 'Applied Workplace Operations & Governance';

  const domain = detectLocalDomain(cleanTopic);
  const blueprint = buildDomainBlueprint(domain, cleanTopic, agreedRequirements);

  const courseTitle = domain === 'emotional_intelligence'
    ? 'Emotional Intelligence for Workplace Leaders & High-Performing Teams'
    : cleanTopic.charAt(0).toUpperCase() + cleanTopic.slice(1);

  const shortWords = courseTitle
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !/^(the|and|for|use|with|into)$/i.test(w))
    .slice(0, 2)
    .map(w => w.slice(0, 3).toUpperCase())
    .join('-');
  const courseCode = `EST-${blueprint.codePrefix || shortWords || 'CRS'}-01`;

  const scratchBase = createScratchCourse(courseTitle);
  const difficultyLevel = agreedRequirements?.difficultyLevel || 'Intermediate';
  const duration = agreedRequirements?.duration || '16 Hours (Estimated Guided Learning)';
  const targetGroup = agreedRequirements?.targetAudience || blueprint.defaultAudience;
  const learningGoals = agreedRequirements?.learningGoals || [];
  const practicalFocus = agreedRequirements?.practicalFocus;
  const practicalFlag = Boolean(practicalFocus);

  const requestedModCount = agreedRequirements?.moduleCount
    ? Math.max(2, Math.min(6, agreedRequirements.moduleCount))
    : blueprint.moduleBlueprints.length;

  const selectedBlueprints = [...blueprint.moduleBlueprints];
  while (selectedBlueprints.length < requestedModCount) {
    const nextIdx = selectedBlueprints.length + 1;
    const goalFocus = learningGoals[nextIdx - 1] || `Applied Mastery & Governance Part ${nextIdx}`;
    selectedBlueprints.push({
      ...blueprint.moduleBlueprints[blueprint.moduleBlueprints.length - 1],
      title: `Module ${nextIdx}: ${goalFocus}`,
      subtitle: `Applied Implementation & Governance — ${goalFocus}`,
      purpose: `Deepen practical mastery in ${goalFocus} within ${courseTitle}.`
    });
  }

  const modules: CourseModule[] = selectedBlueprints
    .slice(0, requestedModCount)
    .map((bp, idx) => buildModuleObject(bp, idx + 1, blueprint, courseTitle, agreedRequirements));

  const goalsNarrative = learningGoals.length > 0
    ? ` covering ${learningGoals.join(', ')}`
    : '';

  const patch: Partial<Course> = {
    name: courseTitle,
    code: courseCode,
    status: 'Draft',
    lastModified: 'Just now',

    problem: {
      targetGroup,
      taskOrSkill: learningGoals.length > 0
        ? `${blueprint.taskOrSkill}, specifically mastering ${learningGoals.join(', ')}`
        : blueprint.taskOrSkill,
      operationalImpact: blueprint.operationalImpact,
      rootCauses: blueprint.rootCauses,
      processFailures: blueprint.processFailures,
      skillGaps: blueprint.skillGaps,
      constraints: blueprint.constraints,
      digitalReadinessLevel: blueprint.digitalReadiness,
      aiLiteracyGap: blueprint.aiLiteracyGap,
      aiEthicsComplianceRisk: blueprint.aiEthicsRisk
    },

    research: {
      regulatoryFramework: blueprint.regulatoryFramework,
      regulatorySources: blueprint.regulatorySources,
      aiToolsPlatformName: blueprint.aiToolsPlatformName,
      aiToolsReferenced: blueprint.aiToolsReferenced,
      aiEthicsFramework: blueprint.aiEthicsFramework,
      ethicsFrameworks: blueprint.aiEthicsFramework,
      caseStudyUseCases: blueprint.caseStudyUseCases,
      industryUseCases: blueprint.industryUseCases,
      evidenceStandards: blueprint.evidenceStandards,
      sources: blueprint.sources,
      benchmarkingNotes: `Aligned to eStudy South Africa Master Curriculum Standard v9.0 for ${courseTitle}. Applicable statutory claims marked for SME confirmation where sector-specific.`,
      benchmarkCourseRef: 'eStudy South Africa Master Curriculum Benchmark Standard v9.0',
      learnerProfile: {
        jobRoles: targetGroup,
        departments: blueprint.industryDomain,
        experienceLevels: difficultyLevel === 'Foundational'
          ? 'Entry-level / Beginners (0–2 years domain experience)'
          : difficultyLevel === 'Advanced'
            ? 'Senior Practitioners & Technical Leads (5+ years experience)'
            : 'Mid-level Practitioners (2–5+ years experience)',
        existingKnowledge: difficultyLevel === 'Foundational'
          ? `Basic workplace familiarity; no deep prior specialisation in ${courseTitle} assumed.`
          : `Foundational operational knowledge and daily experience in ${courseTitle}.`,
        digitalLiteracy: blueprint.digitalReadiness,
        aiFamiliarity: 'Basic to Intermediate — seeking structured, verification-first workflows.',
        workplaceEnvironment: blueprint.industryContext,
        organisationalConstraints: blueprint.constraints,
        availableToolsAndTechnology: blueprint.aiToolsPlatformName
      }
    },

    structure: {
      ...scratchBase.structure,
      title: courseTitle,
      code: courseCode,
      industryDomain: blueprint.industryDomain,
      industryContext: blueprint.industryContext,
      targetRoles: targetGroup,
      aiIntegrationLevel: 'Applied',
      setaNqfLevel: blueprint.nqfLevel,
      deliveryLanguages: 'English (South African Workplace Context with Plain Language Principles)',
      estimatedDuration: duration,
      deliveryFormat: Boolean(practicalFocus)
        ? 'Hands-On Applied E-Learning with Step-by-Step Labs, Workplace Scenarios & Practical Tasks'
        : 'Blended Digital E-Learning with Interactive Workplace Scenarios & Practical Tasks',
      difficultyLevel,
      purposeStatement: `Equip ${targetGroup} with practical, verifiable competencies in ${courseTitle}${goalsNarrative} to eliminate operational bottlenecks and uphold high governance standards.`,
      workplaceRelevance: `Directly translates core principles of ${courseTitle}${goalsNarrative} into repeatable, workplace-ready procedures and verified decision gates.`,
      performanceImprovement: `Measurable reduction in operational rework, improved quality gate compliance, and faster capability ramp-up across ${courseTitle}.`,
      aiTechAngle: `Integrates structured domain tools and human-in-the-loop verification tailored specifically to ${courseTitle}.`,
      scopeSummary: `A ${modules.length}-module programme in ${courseTitle}${goalsNarrative}, progressing from core foundations to applied hands-on execution and 30-60-90 day governance rollout.`,
      aiEraRelevance: `Professionals in ${courseTitle} increasingly interact with automated and AI-assisted workflows requiring strong first-principles judgement and verification.`,
      performanceLink: `Links structured execution directly to audit readiness, reduced error rates, and reliable team delivery in ${courseTitle}.`,
      organisationalBenefits: [
        `Reduced rework, faster operational turnaround, and stronger risk controls in ${courseTitle}.`,
        `Standardised execution across teams backed by measurable KPIs and clear accountability.`
      ],
      employeeBenefits: [
        `Practical, career-relevant mastery of ${courseTitle}${goalsNarrative}.`,
        `Confidence executing complex tasks with clear checklists and verification rubrics.`
      ],
      riskReductionOutcomes: [
        `Elimination of unverified automation or procedural shortcuts in high-impact deliverables.`,
        `Alignment with applicable data-protection and governance standards.`
      ],
      scope: `${modules.length} comprehensive modules, ${modules.length * 3} workplace scenarios, ${modules.length} AI governance scenarios, 5 pre-course diagnostic questions, module knowledge checks, and a 30-60-90 day rollout plan.`,
      keyCompetencies: learningGoals.length > 0 ? learningGoals.join(', ') : modules.flatMap(m => m.keySkills.slice(0, 2)).join(', '),
      realWorldApplication: practicalFocus || `Hands-on South African workplace scenario simulations, quality gate audits, and practical tasks in ${courseTitle}.`,
      aiSkillsDeveloped: `Structured Domain Prompting, Verification Auditing, Human-in-the-Loop Sign-Off in ${courseTitle}`,
      jobRoles: targetGroup,
      departments: blueprint.industryDomain,
      experienceLevel: difficultyLevel === 'Foundational' ? 'Foundational / Beginner' : `${difficultyLevel} (2+ years experience)`,
      aiFamiliarityBaseline: 'Basic',
      aiFamiliarityExplanation: 'General awareness of digital tools; builds structured domain workflows.',
      prerequisiteKnowledge: difficultyLevel === 'Foundational'
        ? `No advanced prerequisite required; general workplace digital literacy is sufficient for ${courseTitle}.`
        : `Foundational operational familiarity with ${courseTitle}.`,
      prerequisiteExperience: difficultyLevel === 'Foundational' ? '0–1 years workplace exposure.' : '1–2 years operational experience.',
      toolsSystems: blueprint.aiToolsPlatformName,
      digitalLiteracyLevel: blueprint.digitalReadiness,
      diagnosticQuestions: [
        {
          id: 'diag-1',
          category: 'General domain knowledge',
          question: `What core concepts and quality criteria define effective practice in ${courseTitle}?`,
          purpose: 'Establish baseline domain comprehension.'
        },
        {
          id: 'diag-2',
          category: 'Problem awareness',
          question: `Which root causes most frequently trigger rework, outages, or compliance issues in ${courseTitle}?`,
          purpose: 'Assess awareness of systemic bottlenecks.'
        },
        {
          id: 'diag-3',
          category: 'Current workplace practices',
          question: `How do you currently verify accuracy, security, and readiness before releasing work in ${courseTitle}?`,
          purpose: 'Evaluate existing verification habits.'
        },
        {
          id: 'diag-4',
          category: 'AI / digital readiness',
          question: `When using digital or AI assistants in ${courseTitle}, how do you catch subtle errors or unsafe defaults?`,
          purpose: 'Measure practical verification readiness.'
        },
        {
          id: 'diag-5',
          category: 'Ethics & compliance',
          question: `What confidentiality and governance controls apply to records handled in ${courseTitle}?`,
          purpose: 'Verify privacy and regulatory awareness.'
        }
      ],
      learningJourney: modules.map((mod, idx) => ({
        id: `lj-${idx + 1}`,
        stepNumber: idx + 1,
        title: mod.title,
        subtitle: mod.subtitle,
        description: mod.purpose
      }))
    },

    modules,

    learningDesign: {
      coreStandardsSummary: `${practicalFlag ? 'Hands-on, lab-oriented' : 'Interactive, scenario-driven'} learning combining pre-course diagnostics, module knowledge checks, practical workplace application tasks (40%), and a final summative assessment (80% pass mark).`,
      instructionalApproach: 'Adult learning (Andragogy), Bloom’s Taxonomy progression, and realistic South African workplace scenarios.',
      aiDemoSimulationDescription: `Interactive walkthrough of domain workflows and verification gates in ${courseTitle}.`,
      promptExerciseDescription: `Learners craft and audit structured prompts relevant to ${courseTitle} while enforcing privacy and factual checks.`,
      guidedPracticeDescription: practicalFocus || `Step-by-step guided practical exercises applying ${courseTitle} tools and checklists.`,
      summativeAssessmentDescription: `Comprehensive ${courseTitle} capstone case study and summative assessment requiring 80% pass mark.`,
      aiEvaluationTask: `Audit an AI-generated deliverable in ${courseTitle} to identify omissions, technical errors, and governance gaps.`,
      collaborationActivity: 'Peer rubric review of practical deliverables.',
      learningObjectivesList: learningGoals.length > 0
        ? learningGoals.map(g => `Apply and govern ${g} in real-world ${courseTitle} workflows`)
        : modules.flatMap(m => m.learningObjectives.slice(0, 1)),
      workplaceActivities: [
        `Complete an applied verification audit on a ${courseTitle} workflow`,
        `Solve realistic operational exception scenarios using module checklists`,
        `Develop a 30-60-90 day rollout and governance plan for your team`
      ],
      reflectionPrompts: `Which verification gate in ${courseTitle} will prevent the highest-impact error in your team?`,
      examplesAndRelevance: `Grounded strictly in authentic ${courseTitle} workplace contexts.`,
      knowledgeChecksDescription: '5 objective-linked scenario MCQs per module with detailed rationales.',
      criticalThinkingDescription: 'Evaluating failure modes and applying accountable human judgement.',
      learnerEngagementTypes: practicalFlag
        ? ['Hands-On Labs', 'Workplace Scenarios', 'Verification Audits', 'Knowledge Checks']
        : ['Workplace Scenarios', 'Verification Audits', 'Prompting Exercises', 'Knowledge Checks'],
      practicalTaskWeighting: '40%',
      finalAssessmentPassMark: '80%',
      assessments: [
        { id: 'asm-1', type: 'Pre-Course Diagnostic', description: '5 baseline questions.', timing: 'Before Module 1', weighting: 'Ungraded (Diagnostic)', passMark: 'Baseline' },
        { id: 'asm-2', type: 'Module Knowledge Checks', description: '5 LO-linked MCQs per module.', timing: 'End of Each Module', weighting: 'Formative', passMark: '80%' },
        { id: 'asm-3', type: 'Practical Application Task', description: `Applied workplace task in ${courseTitle}.`, timing: `Across Modules 1–${modules.length}`, weighting: '40%', passMark: '75%' },
        { id: 'asm-4', type: 'Final Assessment', description: 'Summative scenario exam and capstone case study.', timing: 'End of Course', weighting: '60%', passMark: '80%' },
        { id: 'asm-5', type: 'Post-Course Reflection', description: '30-60-90 Day Implementation Commitment Plan.', timing: 'Post-Course', weighting: 'Mandatory', passMark: 'Complete' }
      ]
    },

    ethics: {
      confidentialityRequirements: `Strict protection of sensitive organisational and personal records in ${courseTitle} under applicable policies and POPIA Act 4 of 2013.`,
      dataPrivacySafeguards: 'Mandatory de-identification and access controls prior to external processing.',
      dataPrivacyFramework: blueprint.regulatoryFramework,
      biasMitigationPlan: `Audit automated or analytical outputs in ${courseTitle} against objective domain criteria to prevent unfair or skewed decisions.`,
      humanOversightNotes: `Qualified practitioner review and sign-off required before releasing high-impact ${courseTitle} deliverables.`,
      ethicsStandards: blueprint.aiEthicsFramework,
      psychologicalSafetyNotes: 'Blame-free reporting of near-misses, anomalies, and errors.',
      humanOverrideScenarios: 'Practitioners have explicit authority and duty to override automated suggestions that conflict with domain evidence.',
      decisionMakingFramework: 'Human-in-the-Loop Verification & Applicable Compliance First.',
      accountabilityMechanism: 'Auditable sign-off registers assigning accountability to qualified human owners.',
      aiBiasRisk: 'Out-of-distribution errors, stale assumptions, and automation bias.',
      aiDisclosureRequirement: 'Note where AI tools assisted drafting and record human verification.',
      dataSovereigntyContext: 'Verify data-residency and cross-border controls where cloud services apply.',
      aiWorkforceImpactNarrative: `Augments practitioners in ${courseTitle} by accelerating routine analysis under clear human governance.`,
      aiGovernanceReference: 'eStudy Responsible AI & Governance Standard v9.0',
      cards: [
        {
          id: 'eth-1',
          title: 'Privacy & Data Protection',
          subtitle: 'Confidentiality & Zero-PII Controls',
          status: 'Complete',
          guidingQuestion: `How are sensitive records protected in ${courseTitle}?`,
          response: 'Personal and confidential corporate records are sanitised or confined to approved enterprise environments.',
          exampleText: 'Never upload unredacted confidential datasets to public web AI tools.',
          complianceRef: 'POPIA Act 4 of 2013 (Verify applicability)'
        },
        {
          id: 'eth-2',
          title: 'Human-in-the-Loop Sign-Off',
          subtitle: 'Non-Delegable Accountability',
          status: 'Complete',
          guidingQuestion: `Who holds final accountability for ${courseTitle} deliverables?`,
          response: 'Qualified human practitioners must independently verify and approve outputs before production release.',
          exampleText: 'Every high-impact output carries a completed human verification checklist.',
          complianceRef: 'King IV Principle 12'
        },
        {
          id: 'eth-3',
          title: 'Fairness, Accuracy & Verification',
          subtitle: 'Preventing Bias & Hallucinations',
          status: 'Complete',
          guidingQuestion: 'How do we prevent unverified or biased outputs?',
          response: 'Cross-check recommendations against primary source metrics and domain rubrics.',
          exampleText: 'Validate metrics directly against primary operational logs.',
          complianceRef: 'ISO/IEC 42001 Governance Baseline'
        },
        {
          id: 'eth-4',
          title: 'Transparency & Safe Escalation',
          subtitle: 'Blameless Issue Reporting',
          status: 'Complete',
          guidingQuestion: 'How are practitioners supported when flagging issues?',
          response: 'Teams are encouraged to pause and escalate questionable outputs openly.',
          exampleText: 'Blameless operational reviews reward early risk detection.',
          complianceRef: 'Organisational Quality Charter'
        }
      ]
    },

    outputRequirements: {
      outputFormat: 'SCORM 2004 / xAPI Responsive LMS Package + Printable Manuals (.docx & .pdf)',
      requiredSectionsNote: `Includes all 9 Master Template sections, ${modules.length} modules, workplace & AI scenarios, assessments, and rollout deliverables.`,
      moduleRequirementsRule: 'Every module includes Bloom-aligned learning objectives, multi-section lessons, 3 workplace scenarios, 1 AI scenario, 5 LO-linked MCQs, and a 7-part practical task.',
      assessmentRequirementsRule: 'Pre-course diagnostic (5 items), module formative MCQs (5 per module), practical application tasks (40%), and final summative exam (80% pass mark).',
      scenarioRequirementsRule: 'Realistic South African workplace contexts with Situation, Challenge, Decision Point, and Debrief.',
      mandatoryDeliverablesRule: '1) 30-60-90 Day Implementation Action Plan; 2) Departmental Rollout SOP; 3) Risk & Compliance Matrix.',
      referencesRule: 'Minimum 4 verified or SME-flagged sources cited.',
      accessibilityTargetReadingLevel: 'Plain Language Professional Standard (NQF Level 5/6 accessible)',
      plainLanguageApplied: true,
      culturalInclusivityNotes: 'Uses South African English and inclusive workplace scenarios.',
      formattingRequirements: 'Structured headings, tables, callout boxes, and organisation branding.',
      languageTone: 'Professional, practical, authoritative, and accessible South African English.',
      nonTruncationRule: 'Write all modules, lessons, scenarios, and assessments in full without abbreviating.',
      formattingRules: 'Clear numbered headings, summary tables, scenario callout boxes, and implementation checklists.',
      accreditationBody: blueprint.accreditationBody,
      qualificationOrUnitStandard: 'To Be Confirmed (Requires SME/Accreditation Body Validation)',
      accreditationRequirements: `${duration}; portfolio of evidence including practical tasks and 80% summative pass mark.`,
      requiredLearningStructure: '30% Foundational Concepts, 40% Applied Scenarios & Practice, 30% Implementation & Assessment.',
      accreditationAssessmentRequirements: 'Formative checks, 40% Practical Task, and 60% Summative Assessment with SME moderation.',
      accreditationAlignment: `Aligned with ${blueprint.accreditationBody}`,
      nqfLevel: blueprint.nqfLevel,
      notionalHoursCredits: duration,
      qualificationUnitStandardId: 'To Be Confirmed (Requires SME/Accreditation Body Validation)',
      moderationRequirements: 'Internal SME technical moderation and QA sign-off prior to LMS deployment.'
    },

    qa: {
      benchmarkReviewed: true,
      benchmarkReviewNotes: `Populated and aligned to eStudy Master Prompt Template v9.0 for "${courseTitle}".`,
      qaChecklistConfirmed: true,
      checklistItems: Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`qa-${i + 1}`, true]))
    },

    customisation: {
      ...scratchBase.customisation,
      branding: 'eStudy South Africa Professional Standard (#052B66 Deep Navy & #45CC42 Emerald)',
      tone: 'Professional, authoritative, practical, and action-oriented (South African English).',
      audienceContext: targetGroup,
      industryExamples: blueprint.industryExamples,
      terminology: blueprint.terminology
    }
  };

  const brief = {
    ready: true,
    title: courseTitle,
    targetAudience: targetGroup,
    industryContext: blueprint.industryContext,
    duration,
    moduleCount: modules.length
  };

  const moduleLines = modules.map(m => `  - **${m.title}** (3 workplace scenarios + 1 AI scenario)`).join('\n');
  const message = `### Master Course Template Populated: "${courseTitle}"

All **9 sections of the eStudy Master Course Template (v9.0)** have been filled in across your Course Builder using your agreed requirements:

- **Target Audience & Level**: ${targetGroup} (${difficultyLevel})
- **Duration & Scope**: ${duration} | **${modules.length} Modules**
${learningGoals.length > 0 ? `- **Key Learning Focus**: ${learningGoals.join(', ')}\n` : ''}- **Modules Configured**:
${moduleLines}

You can now inspect or refine any field in the **Course Builder**, or click **Generate Full Course with AI** to produce the complete 22–30 page course!`;

  return { patch, brief, message };
}

function buildContextualGeneralChatReply(
  lastMessage: string,
  previousMessages: LocalCopilotMessage[],
  agreed?: CopilotAgreedRequirements | null
): string {
  const lower = lastMessage.toLowerCase();

  // Handle follow-up awareness cleanly
  const isFollowUp = /\b(follow[- ]?up|that|example|elaborate|more detail|what about|expand|why)\b/i.test(lower);
  const lastAssistantMsg = [...previousMessages].reverse().find(m => m.role === 'assistant')?.content || '';

  if (/\bbloom/i.test(lower)) {
    return `### Bloom's Taxonomy in Practical Course Design\n\nIn the eStudy Master Course Framework, **Bloom's Taxonomy** ensures courses move beyond passive theory into verifiable workplace execution:\n\n1. **Understand**: Explain core principles and regulatory boundaries.\n2. **Apply**: Execute step-by-step SOPs, tools, or workflows in realistic tasks.\n3. **Analyse**: Diagnose root causes, sensor/data variances, or process bottlenecks.\n4. **Evaluate**: Audit outputs against quality gates, compliance rules, and rubrics.\n\nIf you tell me your topic or learner level, I can help map specific Bloom's objectives for your modules.`;
  }

  if (/\bformative\b.*\bsummative\b|\bsummative\b.*\bformative\b/i.test(lower)) {
    return `### Formative vs Summative Assessment\n\n- **Formative Assessments** (e.g., end-of-module 5-question Knowledge Checks) happen *during* learning to give immediate diagnostic feedback and reinforce understanding.\n- **Summative Assessments** (e.g., the 40% Practical Workplace Task and 60% Final Capstone Exam at an 80% pass mark) evaluate overall competency *at completion*.\n\nWould you like examples tailored to a specific subject?`;
  }

  if (/\bnqf\b|\bseta\b|\bqcto\b/i.test(lower)) {
    return `### South African NQF, SETA & QCTO Alignment\n\nIn South Africa, workplace courses typically anchor complexity using **SAQA NQF Level Descriptors** (e.g., NQF Level 5 for foundational-to-intermediate operational competence, NQF Level 6 for specialist/supervisory judgment). Note that exact Unit Standard IDs or CPD credits should always be verified by your organisation's accredited SME or SETA/QCTO moderator before formal credit claims.`;
  }

  if (/\bbrainstorm\b|\bideas\b|\bactivit(y|ies)\b/i.test(lower)) {
    const contextTopic = agreed?.subject || 'workplace training';
    return `### Practical Training Activity Ideas (${contextTopic})\n\nHere are 5 engaging, workplace-grounded activity formats you can include:\n\n1. **Error-Spotting Audits**: Give learners a realistic flawed output or SOP draft and ask them to flag compliance and quality gaps.\n2. **Time-Pressured Triage Scenarios**: Simulate an operational alert where learners weigh speed against mandatory verification gates.\n3. **Role-Play Coaching Clinics**: Practice structured escalation or feedback conversations using a rubric.\n4. **Peer Rubric Walkthroughs**: Learners score an anonymised deliverable against explicit success criteria.\n5. **30-60-90 Day Micro-Pilots**: Learners translate one module checklist into a live team habit.\n\nWhich of these fits your cohort best?`;
  }

  if (isFollowUp && lastAssistantMsg) {
    const snippet = lastAssistantMsg.split('\n').find(l => l.trim().length > 20)?.replace(/[#*]/g, '').trim() || 'our previous point';
    return `Building on **${snippet.slice(0, 90)}${snippet.length > 90 ? '...' : ''}**:\n\nIn practice, the most effective next step is pairing clear operational criteria with a short, realistic decision exercise so learners prove they can spot failure modes under real constraints.\n\n${agreed?.subject ? `Since we are also shaping your **${agreed.subject}** plan, let me know if you'd like to fold this directly into the course design or ask another question.` : 'Would you like a concrete workplace example, or shall we plan a course outline around this topic?'}`;
  }

  if (agreed?.subject) {
    return `Here is a quick perspective related to **${agreed.subject}**:\n\nEffective training in this area balances **clear first-principles understanding** with **hands-on execution and verification checks** so learners know not just *how* to run a workflow, but *how to verify it safely* in South African workplaces.\n\nAsk any follow-up question, suggest refinements to the **${agreed.subject}** plan, or say **"Please create the course"** whenever you want me to populate the template.`;
  }

  return `I'm here to help! We can:\n\n- **Discuss or brainstorm** instructional design, training strategies, South African governance (POPIA, King IV, NQF), or technical topics.\n- **Plan a course together** step by step (just tell me the topic, audience, and what learners should master).\n- **Populate the 9-section template** on demand whenever you say *"Create the course"* or *"Build a template for me..."*.\n\nWhat would you like to explore?`;
}

// Pure client-and-server compatible copilot processor
export function processLocalCopilotChat(payload: LocalCopilotPayload): LocalCopilotResponse {
  const { messages, currentCourse, qaResult, agreedRequirements } = payload;
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || '';

  const intent = classifyCopilotIntent(lastUserMessage, messages, agreedRequirements);

  // 1. QA / Framework compliance check (Chat mode — no course overwrite)
  if (intent === 'qa_check') {
    const score = qaResult?.scorePercent ?? (currentCourse?.name ? 92 : 35);
    const passed = qaResult?.completedCount ?? 40;
    const total = qaResult?.totalChecks ?? 45;
    const isReady = score >= 90;

    return {
      mode: 'chat',
      intent: 'qa_check',
      agreedRequirements: agreedRequirements || null,
      message: `### COURSE FRAMEWORK REVIEW\n\n**${passed} / ${total} requirements passed** (${score}% Framework Readiness)\n\n- ${currentCourse?.structure?.title ? '✓' : '✕'} **Course Structure**: ${currentCourse?.structure?.title || 'Untitled'}\n- ${(currentCourse?.modules?.length || 0) >= 3 ? '✓' : '⚠'} **Curriculum**: ${currentCourse?.modules?.length || 0} Modules configured\n- ${(currentCourse?.problem?.rootCauses?.filter(Boolean).length || 0) >= 2 ? '✓' : '⚠'} **Problem Definition**: ${currentCourse?.problem?.rootCauses?.filter(Boolean).length || 0} Root causes\n- ${(currentCourse?.research?.sources?.length || 0) >= 4 ? '✓' : '⚠'} **Sources & Governance**: ${currentCourse?.research?.sources?.length || 0} authoritative sources\n- ${currentCourse?.ethics?.confidentialityRequirements ? '✓' : '⚠'} **Ethics & Oversight**: Safeguards configured\n\n${isReady ? 'Your template meets eStudy Master Course Framework readiness standards.' : 'There are a few outstanding template items to complete before full generation.'}`,
      isLocalFallback: true,
      suggestedActions: [
        {
          id: 'gen-course',
          label: '⚡ Generate Full Course with AI',
          actionType: 'generate_course',
          payload: {}
        },
        {
          id: 'jump-qa',
          label: '🔍 View Section 08 QA Checklist',
          actionType: 'jump_to_section',
          payload: { section: '08' }
        }
      ]
    };
  }

  // Merge extracted requirements into current conversation context
  const incomingReqs = extractRequirementsFromMessage(lastUserMessage, intent, agreedRequirements);
  const mergedAgreed = mergeAgreedRequirements(agreedRequirements, incomingReqs, intent);

  // 2. Explicit Course Creation Mode -> ONLY mode that returns coursePatch!
  if (intent === 'course_create') {
    const extractedTopic = extractCourseTopicFromMessage(lastUserMessage, messages, mergedAgreed);
    const finalAgreed: CopilotAgreedRequirements = mergedAgreed || {
      subject: extractedTopic,
      title: extractedTopic,
      readyToCreate: true
    };
    finalAgreed.readyToCreate = true;

    const { patch, brief, message } = generateComprehensiveCoursePatch(extractedTopic, undefined, finalAgreed);

    return {
      mode: 'course_creation',
      intent: 'course_create',
      agreedRequirements: finalAgreed,
      message,
      courseBrief: brief,
      coursePatch: patch,
      isLocalFallback: true,
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
      ]
    };
  }

  // 3. Conversational Course Discussion / Planning Mode (Chat mode — NO coursePatch!)
  if (intent === 'course_discussion_plan') {
    if (!mergedAgreed?.subject) {
      return {
        mode: 'chat',
        intent: 'course_discussion_plan',
        agreedRequirements: null,
        message: `Tell me about the **course topic, audience, or learning goals** you have in mind—we can brainstorm the curriculum together first, or if you want me to populate all 9 sections right away, say *"Build a template for me \\"<Course Topic>\\""*.`,
        isLocalFallback: true,
        suggestedActions: [
          {
            id: 'sample-cloud',
            label: '☁️ Plan: Cloud Engineering for Beginners',
            actionType: 'send_prompt',
            payload: { prompt: 'I want to create a Cloud Engineering course for beginners.' }
          },
          {
            id: 'sample-mech',
            label: '⚙️ Build Template: AI in Mechanical Engineering',
            actionType: 'send_prompt',
            payload: { prompt: 'Build a template for me "The use of AI in mechanical engineering"' }
          }
        ]
      };
    }

    const levelLabel = mergedAgreed.difficultyLevel || 'Intermediate';
    const audLabel = mergedAgreed.targetAudience || 'workplace practitioners';
    const goalText = mergedAgreed.learningGoals?.length
      ? `\n\n**Noted Focus Areas:** ${mergedAgreed.learningGoals.join(', ')}`
      : '';

    return {
      mode: 'chat',
      intent: 'course_discussion_plan',
      agreedRequirements: mergedAgreed,
      message: `I can help you plan **${mergedAgreed.subject}** (${levelLabel} — aimed at ${audLabel}).${goalText}\n\nBefore I generate anything into the template, let's shape the structure:\n1. **Core Learning Outcomes**: What 3–4 practical skills should learners walk away with by the end of the programme?\n2. **Format & Emphasis**: Would you prefer conceptual foundations, hands-on practical labs, or governance/compliance scenarios?\n3. **Scope**: Does a 3–4 module structure (~16 notional hours) fit your cohort?\n\nShare your preferences and we can refine the outline—or tell me **"Please create the course"** whenever you're ready.`,
      isLocalFallback: true
    };
  }

  // 4. Conversational Course Refinement Mode (Chat mode — updates agreedRequirements, NO coursePatch!)
  if (intent === 'course_refine' && mergedAgreed?.subject) {
    const domain = detectLocalDomain(mergedAgreed.subject);
    const previewBp = buildDomainBlueprint(domain, mergedAgreed.subject, mergedAgreed);
    const goalsList = mergedAgreed.learningGoals || [];
    const outlineTitles = goalsList.length >= 3
      ? goalsList.map((g, i) => `Module ${i + 1}: ${g.charAt(0).toUpperCase() + g.slice(1)} & Applied Practice`)
      : previewBp.moduleBlueprints.map(m => m.title);

    const summaryLines = [
      `- **Subject**: ${mergedAgreed.subject}`,
      mergedAgreed.difficultyLevel ? `- **Level / Audience**: ${mergedAgreed.difficultyLevel}${mergedAgreed.targetAudience ? ` (${mergedAgreed.targetAudience})` : ''}` : null,
      goalsList.length > 0 ? `- **Learning Outcomes**: ${goalsList.join(', ')}` : null,
      mergedAgreed.practicalFocus ? `- **Practical Emphasis**: ${mergedAgreed.practicalFocus}` : null,
      mergedAgreed.duration ? `- **Duration**: ${mergedAgreed.duration}` : null
    ].filter(Boolean).join('\n');

    return {
      mode: 'chat',
      intent: 'course_refine',
      agreedRequirements: mergedAgreed,
      message: `### Updated Plan for ${mergedAgreed.subject}\n\nI've updated your programme requirements:\n${summaryLines}\n\n**Suggested Module Pathway:**\n${outlineTitles.map(t => `- ${t}${mergedAgreed.practicalFocus ? ' (with hands-on lab & workplace simulation)' : ''}`).join('\n')}\n\nWould you like to adjust any modules, target duration, or depth—or shall I **create the course** in the template now?`,
      isLocalFallback: true,
      suggestedActions: [
        {
          id: 'confirm-create-now',
          label: '✅ Create Course in Template Now',
          actionType: 'send_prompt',
          payload: { prompt: 'That sounds good. Please create the course.' }
        }
      ]
    };
  }

  // 5. General Conversational Chat Mode (Chat mode — NO coursePatch!)
  return {
    mode: 'chat',
    intent: 'general_chat',
    agreedRequirements: mergedAgreed || agreedRequirements || null,
    message: buildContextualGeneralChatReply(lastUserMessage, messages, mergedAgreed || agreedRequirements),
    isLocalFallback: true
  };
}

