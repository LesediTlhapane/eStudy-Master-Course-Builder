import type {
  Course,
  GeneratedCourse,
  GeneratedModule,
  AIProvider,
  GenerationMetadata
} from '../../types.js';
import type { AIRequest, AIResponse } from './types.js';
import { generateMasterPrompt } from '../../utils/promptGenerator.js';
import { sanitizeCourse } from '../../utils/courseSanitizer.js';
import { aiRouter } from './aiRouter.js';
import {
  extractAndParseJSON,
  reviewGeneratedCourseQuality,
  validateAndSanitizeGeneratedCourse
} from './courseValidator.js';
import {
  generateCurriculumBlueprint,
  type CurriculumBlueprint,
  type BlueprintModulePlan
} from './curriculumBlueprint.js';
import { getDefaultModelForProvider, getModelMeta } from './modelRegistry.js';

export interface CourseGenerationResult {
  success: boolean;
  course?: GeneratedCourse;
  error?: string;
}

export interface CourseGenerationOptions {
  aiExecute?: (req: AIRequest) => Promise<AIResponse>;
  skipRepair?: boolean;
}

function accumulateUsage(
  acc: { input: number; output: number },
  usage?: { inputTokens?: number; outputTokens?: number }
) {
  if (!usage) return;
  acc.input += usage.inputTokens || 0;
  acc.output += usage.outputTokens || 0;
}

async function generateModuleFromBlueprint(
  modPlan: BlueprintModulePlan,
  blueprint: CurriculumBlueprint,
  sourceCourse: Course,
  provider: AIProvider,
  model: string,
  aiExecute: (req: AIRequest) => Promise<AIResponse>
): Promise<{ module: Partial<GeneratedModule>; usage?: { inputTokens?: number; outputTokens?: number } }> {
  const verifiedSources = (sourceCourse.research?.sources || [])
    .filter(src => src.status === 'Verified')
    .map(src => ({
      name: src.name,
      reference: src.reference,
      excerpt: src.contentSnippet?.slice(0, 600)
    }));

  const forbiddenTermsList = blueprint.outOfScopeDomains
    .flatMap(d => d.forbiddenTerms.slice(0, 5))
    .slice(0, 20);

  const systemInstruction = `You are a senior subject-matter educator and instructional designer writing Module ${modPlan.moduleNumber} of "${blueprint.subjectTitle}" (${blueprint.domainLabel}).
NON-NEGOTIABLE EDUCATIONAL RULES:
1. STRICT SUBJECT LOCK: Teach ONLY "${blueprint.subjectTitle}" for "${blueprint.targetAudience}" (${blueprint.learnerLevel}).
   FORBIDDEN OFF-TOPIC CONCEPTS (NEVER include): ${forbiddenTermsList.join(', ') || 'None'}.
   APPLICABLE SA REGULATORY CONTEXT: ${blueprint.regulatoryGrounding.applicableFrameworks.join('; ')}.
2. Keep the EXACT module number (${modPlan.moduleNumber}), title ("${modPlan.title}"), learning objectives, and lesson count/titles (${modPlan.lessonPlans.length} lessons).
3. Use ALL 7 planning dimensions provided in each lesson's blueprint plan:
   - knowledgeToAcquire, conceptsToExplain, keyTerminology, subjectExamples, practicalSkills, commonMisconceptions, demonstrationMethod.
   Each lesson MUST be substantial (250–400 words), genuinely educational, distinct from every other lesson, and structured to explain:
   - What the concept/principle means and why it matters in "${blueprint.subjectTitle}"
   - Core mechanisms / how it works in practice (using the planned keyTerminology)
   - One concrete, subject-authentic worked example from lessonPlans.subjectExamples
   - Common misconceptions and limitations/edge cases learners must avoid
   NEVER inject generic five-stage SOP boilerplate, filler operational protocols, or repetitive phrasing across lessons.
4. Vary South African scenarios distinctly across the planned settings (${modPlan.scenarioContexts.map(s => `${s.cityOrSetting}: ${s.organisationType}`).join('; ')}). Include authentic Workplace challenges and an AI Specific scenario (or state how AI applies/fails carefully).
5. Practical task MUST honour all 10 elements of modPlan.practicalTaskSpec cleanly:
   Include labelled sections in instructions:
   "Objective:", "Scenario:", "Resources:", "Instructions:", "Steps: 1. ... 2. ... 3. ...", "Deliverable:", "Success criteria:", "Reflection:"
   AND an "evaluationRubric" array whose percentages sum to 100%.
   Do NOT turn technical/creative/leadership modules into generic "audit workflow failures / corrective action checklist / human sign-off" exercises unless the module genuinely teaches compliance auditing.
6. Knowledge checks: 5 distinct concept/application MCQs testing concepts explicitly taught in this module's lessons, 4 plausible options each, misconception-addressing rationale, and "learningObjectiveRef" set to an exact LO code from this module (${modPlan.learningObjectives.map(o => o.code).join(', ')}). Never insert generic POPIA/SOP/sign-off MCQs if unrelated to the module.
7. Accuracy & Source Grounding: ${blueprint.regulatoryGrounding.strictTruthRule}
Return ONLY valid JSON matching the GeneratedModule schema.`;

  const prompt = `Author complete Module ${modPlan.moduleNumber} JSON for course "${blueprint.subjectTitle}" (${blueprint.courseCode}).

MODULE BLUEPRINT SPECIFICATION (WITH 7 LESSON DIMENSIONS & 10-ELEMENT PRACTICAL TASK SPEC):
${JSON.stringify(
  {
    id: modPlan.moduleId,
    moduleNumber: modPlan.moduleNumber,
    title: modPlan.title,
    purpose: modPlan.purpose,
    learningObjectives: modPlan.learningObjectives,
    lessonPlans: modPlan.lessonPlans.map(lp => ({
      id: lp.id,
      title: lp.title,
      purpose: lp.purpose,
      progressionStage: lp.progressionStage,
      knowledgeToAcquire: lp.knowledgeToAcquire,
      conceptsToExplain: lp.conceptsToExplain,
      keyTerminology: lp.keyTerminology,
      subjectExamples: lp.subjectExamples,
      practicalSkills: lp.practicalSkills,
      commonMisconceptions: lp.commonMisconceptions,
      demonstrationMethod: lp.demonstrationMethod,
      avoidRepeating: lp.avoidRepeating
    })),
    scenarioContexts: modPlan.scenarioContexts,
    practicalTaskSpec: modPlan.practicalTaskSpec,
    assessmentTargets: modPlan.assessmentTargets
  },
  null,
  2
)}

VERIFIED SOURCES:
${JSON.stringify(verifiedSources)}

Return a single JSON object:
{
  "id": "${modPlan.moduleId}",
  "moduleNumber": ${modPlan.moduleNumber},
  "title": "${modPlan.title}",
  "subtitle": "Concise module subtitle",
  "purpose": "${modPlan.purpose}",
  "learningObjectives": ${JSON.stringify(modPlan.learningObjectives)},
  "lessons": [
    {
      "id": "lesson-${modPlan.moduleNumber}-1",
      "title": "Exact lesson title from lessonPlans",
      "durationMinutes": 35,
      "concepts": ["Concept from conceptsToExplain", "Key terminology", "Applied skill"],
      "contentBody": "Deep, multi-paragraph subject teaching (250-400 words) explaining conceptsToExplain, keyTerminology, worked example from subjectExamples, practicalSkills, and commonMisconceptions",
      "callouts": [{ "type": "Tip", "title": "Domain Practice Tip", "content": "Actionable subject insight addressing commonMisconceptions" }],
      "workplaceApplication": "Concrete application aligned to practicalSkills & demonstrationMethod",
      "aiApplication": "Relevant AI workflow or state 'Not applicable' where inappropriate"
    }
  ],
  "scenarios": [
    {
      "id": "scenario-${modPlan.moduleNumber}-1",
      "title": "Distinct scenario title",
      "type": "Workplace",
      "situation": "Realistic domain situation",
      "challenge": "Specific technical/conceptual constraint",
      "decisionPoint": "Concrete choice the learner must make",
      "debrief": "Domain-grounded reasoning explaining the right choice",
      "keyTakeaway": "Memorable principle"
    }
  ],
  "knowledgeChecks": [
    {
      "id": "kc-${modPlan.moduleNumber}-1",
      "question": "Distinct question testing a concept taught in this module's lessons",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 1,
      "rationale": "Why correct answer is right and why the common misconception/distractor is wrong",
      "learningObjectiveRef": "LO ${modPlan.moduleNumber}.1"
    }
  ],
  "practicalTask": {
    "id": "task-${modPlan.moduleNumber}",
    "title": "${modPlan.practicalTaskSpec.title}",
    "instructions": "Objective: ${modPlan.practicalTaskSpec.learningObjective}\\nScenario: ${modPlan.practicalTaskSpec.scenarioOrTask}\\nResources: ...\\nInstructions: ${modPlan.practicalTaskSpec.clearInstructions}\\nSteps: 1. ... 2. ... 3. ...\\nDeliverable: ${modPlan.practicalTaskSpec.expectedDeliverable}\\nSuccess criteria: ...\\nReflection: ${modPlan.practicalTaskSpec.reflectionPrompt}",
    "deliverable": "${modPlan.practicalTaskSpec.expectedDeliverable}",
    "evaluationRubric": ${JSON.stringify(modPlan.practicalTaskSpec.rubricCriteria)}
  },
  "reflection": ["${modPlan.practicalTaskSpec.reflectionPrompt}", "Domain reflection prompt 2"],
  "summary": "Concise synthesis of Module ${modPlan.moduleNumber}"
}`;

  const res = await aiExecute({
    provider,
    model,
    prompt,
    systemInstruction,
    responseFormat: 'json',
    temperature: 0.25,
    maxTokens: 3900,
    timeoutMs: 65000
  });

  const parsed = extractAndParseJSON(res.text);
  // Enforce module structural integrity from blueprint
  parsed.id = modPlan.moduleId;
  parsed.moduleNumber = modPlan.moduleNumber;
  parsed.title = modPlan.title;
  if (!Array.isArray(parsed.learningObjectives) || parsed.learningObjectives.length === 0) {
    parsed.learningObjectives = modPlan.learningObjectives;
  }
  if (Array.isArray(parsed.lessons)) {
    parsed.lessons = parsed.lessons.map((l: any, lIdx: number) => {
      const bpLesson = modPlan.lessonPlans[lIdx];
      return {
        ...l,
        id: bpLesson?.id || l.id || `lesson-${modPlan.moduleNumber}-${lIdx + 1}`,
        title: bpLesson?.title || l.title
      };
    });
  }

  return {
    module: parsed,
    usage: res.usage
  };
}

async function generateCourseWrapperAndAssessments(
  blueprint: CurriculumBlueprint,
  synthesizedModules: Partial<GeneratedModule>[],
  sourceCourse: Course,
  provider: AIProvider,
  model: string,
  aiExecute: (req: AIRequest) => Promise<AIResponse>
): Promise<{
  overview: string;
  purpose: string;
  targetAudience: string;
  estimatedDuration: string;
  learningOutcomes: string[];
  assessments: any;
  usage?: { inputTokens?: number; outputTokens?: number };
}> {
  const allObjectiveCodes = synthesizedModules.flatMap(m =>
    (m.learningObjectives || []).map((o: any) => `${o.code}: ${o.statement}`)
  );

  const systemInstruction = `You are authoring the Executive Overview, Course Outcomes, Pre-Course Diagnostic, Final Summative Exam, and Capstone Case Study for "${blueprint.subjectTitle}" (${blueprint.domainLabel}).
STRICT RULES:
- Stay 100% faithful to "${blueprint.subjectTitle}" and ONLY assess concepts actually taught in the synthesized modules below.
- Do NOT introduce unrelated domains (${blueprint.outOfScopeDomains.map(d => d.domain).join(', ') || 'None'}).
- NEVER insert generic POPIA/SOP/sign-off MCQs unless POPIA/SOP compliance is genuinely taught in the synthesized modules.
- Pre-course diagnostic: 5 realistic baseline questions (4 options each) probing prior familiarity with "${blueprint.subjectTitle}".
- Final assessment: 10 distinct scenario/application questions mapped via "learningObjectiveRef" to exact LO codes below, plus a domain-authentic Capstone Case Study with 4 sequential tasks and deliverable.
- ${blueprint.regulatoryGrounding.strictTruthRule}
Return ONLY valid JSON.`;

  const prompt = `Create Overview, Outcomes, Diagnostic, and Final Summative Assessment for "${blueprint.subjectTitle}" (${blueprint.courseCode}).
Audience: ${blueprint.targetAudience} (${blueprint.learnerLevel})
Duration: ${blueprint.estimatedDuration}
Regulatory Context: ${blueprint.regulatoryGrounding.applicableFrameworks.join('; ')}

Synthesized Modules, Taught Concepts & Objectives:
${JSON.stringify(
  synthesizedModules.map(m => ({
    moduleNumber: m.moduleNumber,
    title: m.title,
    lessons: (m.lessons || []).map((l: any) => ({
      title: l.title,
      concepts: l.concepts || []
    })),
    objectives: m.learningObjectives
  })),
  null,
  2
)}

Available Learning Objective Codes: ${allObjectiveCodes.join(' | ')}

Return ONLY valid JSON:
{
  "overview": "2 cohesive paragraphs describing this programme and learner journey",
  "purpose": "Clear workplace capability purpose statement",
  "targetAudience": "${blueprint.targetAudience}",
  "estimatedDuration": "${blueprint.estimatedDuration}",
  "learningOutcomes": ["Outcome 1", "Outcome 2", "Outcome 3", "Outcome 4", "Outcome 5", "Outcome 6"],
  "assessments": {
    "preCourseDiagnostic": {
      "title": "Pre-Course Knowledge & Readiness Diagnostic",
      "instructions": "Complete these 5 baseline diagnostic questions.",
      "questions": [
        { "id": "diag-1", "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": 1, "rationale": "..." }
      ]
    },
    "finalAssessment": {
      "title": "Summative Capstone & Final Knowledge Assessment",
      "passMark": "80%",
      "instructions": "Complete all 10 scenario-based questions and the capstone case study.",
      "questions": [
        { "id": "final-q1", "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": 1, "rationale": "...", "learningObjectiveRef": "LO 1.1" }
      ],
      "capstoneCaseStudy": {
        "title": "Capstone title specific to ${blueprint.subjectTitle}",
        "scenario": "Realistic South African scenario specific to ${blueprint.subjectTitle} (80-130 words)",
        "tasks": ["1. ...", "2. ...", "3. ...", "4. ..."],
        "deliverable": "Concrete capstone deliverable"
      }
    }
  }
}`;

  const res = await aiExecute({
    provider,
    model,
    prompt,
    systemInstruction,
    responseFormat: 'json',
    temperature: 0.25,
    maxTokens: 3800,
    timeoutMs: 60000
  });

  const parsed = extractAndParseJSON(res.text);
  return {
    overview: parsed.overview || sourceCourse.structure?.scopeSummary || '',
    purpose: parsed.purpose || sourceCourse.structure?.purposeStatement || '',
    targetAudience: parsed.targetAudience || blueprint.targetAudience,
    estimatedDuration: parsed.estimatedDuration || blueprint.estimatedDuration,
    learningOutcomes: Array.isArray(parsed.learningOutcomes) ? parsed.learningOutcomes : [],
    assessments: parsed.assessments || {},
    usage: res.usage
  };
}

async function attemptTargetedQualityRepair(
  generatedCourse: GeneratedCourse,
  targets: ReturnType<typeof reviewGeneratedCourseQuality>['repairTargets'],
  sourceCourse: Course,
  provider: AIProvider,
  model: string,
  aiExecute: (req: AIRequest) => Promise<AIResponse>
): Promise<{ applied: number; inputTokens?: number; outputTokens?: number }> {
  const prompt = `Revise only the flagged lesson content, practical-task instructions, and assessment questions below for "${generatedCourse.title}". Keep all IDs, titles, module structure, and the existing GeneratedCourse schema unchanged. Teach ONLY "${generatedCourse.title}" with genuine educational mechanisms, terminology, worked examples, and misconception prevention—eliminating paraphrased repetition, generic SOP/checklist boilerplate, and off-topic filler. Return only JSON:
{
  "lessons": [
    { "id": "existing-lesson-id", "concepts": ["Specific concept"], "contentBody": "Revised deep educational teaching text", "workplaceApplication": "Specific application", "aiApplication": "Relevant AI application or Not applicable" }
  ],
  "tasks": [
    { "moduleId": "existing-module-id", "instructions": "Objective: ...\\nScenario: ...\\nResources: ...\\nInstructions: ...\\nSteps: 1. ... 2. ...\\nDeliverable: ...\\nSuccess criteria: ...\\nReflection: ...", "deliverable": "Expected learner artefact", "evaluationRubric": ["Criterion 1 (50%)", "Criterion 2 (50%)"] }
  ],
  "questions": [
    { "id": "existing-question-id", "questionLocation": "module or final", "question": "Distinct question aligned to taught concepts", "options": ["Option A", "Option B", "Option C", "Option D"], "correctAnswer": 0, "rationale": "Why the answer is correct and misconception is wrong", "learningObjectiveRef": "Exact objective code" }
  ]
}

Items to improve:
${JSON.stringify(
  targets.map(target => {
    const module = generatedCourse.modules.find(candidate => candidate.id === target.moduleId);
    return {
      moduleId: target.moduleId,
      moduleTitle: target.moduleTitle,
      moduleObjectives: module?.learningObjectives.map(objective => `${objective.code}: ${objective.statement}`),
      otherLessonsToAvoidRepeating: module?.lessons
        .filter(lesson => lesson.id !== target.lessonId)
        .map(lesson => ({ title: lesson.title, concepts: lesson.concepts })),
      lessonId: target.lessonId,
      lessonTitle: target.lessonTitle,
      questionId: target.questionId,
      questionLocation: target.questionLocation,
      currentQuestion: target.currentQuestion,
      availableObjectives: target.availableObjectives,
      currentContent: target.contentBody?.slice(0, 2500),
      currentWorkplaceApplication: target.workplaceApplication,
      currentAIApplication: target.aiApplication,
      currentConcepts: target.concepts,
      currentTaskInstructions: target.taskInstructions,
      currentTaskDeliverable: target.taskDeliverable,
      currentTaskRubric: target.taskRubric,
      issues: target.issues
    };
  })
)}

Verified user sources:
${JSON.stringify(
  (sourceCourse.research?.sources || [])
    .filter(source => source.status === 'Verified')
    .map(source => ({
      name: source.name,
      reference: source.reference,
      excerpt: source.contentSnippet?.slice(0, 800)
    }))
)}`;

  const response = await aiExecute({
    provider,
    model,
    prompt,
    systemInstruction:
      'You are an instructional editor. Improve only the specified course items. Teach the actual subject cleanly, eliminate repetition and cross-domain bleed, and mark unverified claims for SME review.',
    responseFormat: 'json',
    maxTokens: 3800,
    timeoutMs: 55000
  });
  const patch = extractAndParseJSON(response.text);
  if (!patch || typeof patch !== 'object') {
    throw new Error('The quality-revision response was not a JSON object.');
  }

  let applied = 0;
  for (const revised of Array.isArray(patch.lessons) ? patch.lessons : []) {
    if (!revised || typeof revised.id !== 'string') continue;
    const lesson = generatedCourse.modules
      .flatMap(module => module.lessons)
      .find(candidate => candidate.id === revised.id);
    if (!lesson) continue;

    let updated = false;
    if (Array.isArray(revised.concepts) && revised.concepts.every((concept: unknown) => typeof concept === 'string')) {
      lesson.concepts = revised.concepts;
      updated = true;
    }
    if (typeof revised.contentBody === 'string' && revised.contentBody.trim()) {
      lesson.contentBody = revised.contentBody.trim();
      updated = true;
    }
    if (typeof revised.workplaceApplication === 'string' && revised.workplaceApplication.trim()) {
      lesson.workplaceApplication = revised.workplaceApplication.trim();
      updated = true;
    }
    if (typeof revised.aiApplication === 'string' && revised.aiApplication.trim()) {
      lesson.aiApplication = revised.aiApplication.trim();
      updated = true;
    }
    if (updated) applied++;
  }

  for (const revised of Array.isArray(patch.tasks) ? patch.tasks : []) {
    if (!revised || typeof revised.moduleId !== 'string') continue;
    const module = generatedCourse.modules.find(candidate => candidate.id === revised.moduleId);
    if (!module?.practicalTask) continue;

    let updated = false;
    if (typeof revised.instructions === 'string' && revised.instructions.trim()) {
      module.practicalTask.instructions = revised.instructions.trim();
      updated = true;
    }
    if (typeof revised.deliverable === 'string' && revised.deliverable.trim()) {
      module.practicalTask.deliverable = revised.deliverable.trim();
      updated = true;
    }
    if (
      Array.isArray(revised.evaluationRubric) &&
      revised.evaluationRubric.every((criterion: unknown) => typeof criterion === 'string')
    ) {
      module.practicalTask.evaluationRubric = revised.evaluationRubric;
      updated = true;
    }
    if (updated) applied++;
  }

  for (const revised of Array.isArray(patch.questions) ? patch.questions : []) {
    if (!revised || typeof revised.id !== 'string') continue;
    const moduleQuestion = generatedCourse.modules
      .flatMap(module => module.knowledgeChecks)
      .find(question => question.id === revised.id);
    const question = revised.questionLocation === 'final'
      ? generatedCourse.assessments.finalAssessment.questions.find(candidate => candidate.id === revised.id)
      : moduleQuestion;
    if (!question) continue;

    let updated = false;
    if (typeof revised.question === 'string' && revised.question.trim()) {
      question.question = revised.question.trim();
      updated = true;
    }
    if (Array.isArray(revised.options) && revised.options.length >= 2 && revised.options.every((option: unknown) => typeof option === 'string')) {
      question.options = revised.options;
      updated = true;
    }
    if (typeof revised.correctAnswer === 'number' && revised.correctAnswer >= 0 && revised.correctAnswer < question.options.length) {
      question.correctAnswer = revised.correctAnswer;
      updated = true;
    }
    if (typeof revised.rationale === 'string' && revised.rationale.trim()) {
      question.rationale = revised.rationale.trim();
      updated = true;
    }
    if (typeof revised.learningObjectiveRef === 'string' && revised.learningObjectiveRef.trim()) {
      question.learningObjectiveRef = revised.learningObjectiveRef.trim();
      updated = true;
    }
    if (updated) applied++;
  }

  if (applied === 0) {
    throw new Error('The quality-revision response did not contain any applicable lesson or task updates.');
  }
  return {
    applied,
    inputTokens: response.usage?.inputTokens,
    outputTokens: response.usage?.outputTokens
  };
}

export async function generateCourseWithAIEngine(
  rawCourse: Course,
  providerInput?: AIProvider,
  modelInput?: string,
  options?: CourseGenerationOptions
): Promise<CourseGenerationResult> {
  const startTime = Date.now();
  const course = sanitizeCourse(rawCourse);
  const provider: AIProvider = providerInput === 'gemini' ? 'gemini' : 'groq';
  const defaultModel = getDefaultModelForProvider(provider, 'course_generation');
  const requestedModel = modelInput?.trim();
  const requestedMeta = requestedModel ? getModelMeta(provider, requestedModel) : undefined;
  const model: string = requestedMeta ? requestedMeta.id : defaultModel;
  const modelInfo = getModelMeta(provider, model);
  const aiExecute: (req: AIRequest) => Promise<AIResponse> =
    options?.aiExecute || (req => aiRouter.execute(req));

  // Validate core compulsory fields before calling AI
  const missingCompulsory: string[] = [];
  if (!course.structure?.title?.trim() && (!course.name?.trim() || course.name === 'Untitled Course')) {
    missingCompulsory.push('Course Name (Section 3.1)');
  }
  if (!course.problem?.targetGroup?.trim()) {
    missingCompulsory.push('Target Group (Section 1.1)');
  }
  if (!course.problem?.taskOrSkill?.trim()) {
    missingCompulsory.push('Task or Skill (Section 1.1)');
  }
  if (!course.problem?.operationalImpact?.trim()) {
    missingCompulsory.push('Operational / Financial / Compliance Impact (Section 1.1)');
  }

  if (missingCompulsory.length > 0) {
    throw new Error(
      `Please complete the following compulsory fields before generating the course: ${missingCompulsory.join(', ')}.`
    );
  }

  const tokenUsage = { input: 0, output: 0 };

  // STAGE 1: Subject & Curriculum Blueprint Generation + Alignment Validation
  const { blueprint, tokensUsed: bpTokens } = await generateCurriculumBlueprint(
    course,
    provider,
    model,
    aiExecute
  );
  accumulateUsage(tokenUsage, {
    inputTokens: bpTokens?.input,
    outputTokens: bpTokens?.output
  });

  // Ensure Master Prompt is still compiled (used for traceability/single-shot fallback)
  const masterPrompt = generateMasterPrompt(course);

  let parsedRawCourse: any = null;

  // STAGE 2: Multi-stage deep synthesis within Groq's safe ~4096 token ceiling per call
  if (blueprint.modules.length > 0) {
    const synthesizedModules: Partial<GeneratedModule>[] = [];

    for (const modPlan of blueprint.modules) {
      const modResult = await generateModuleFromBlueprint(
        modPlan,
        blueprint,
        course,
        provider,
        model,
        aiExecute
      );
      accumulateUsage(tokenUsage, modResult.usage);
      synthesizedModules.push(modResult.module);
    }

    const wrapper = await generateCourseWrapperAndAssessments(
      blueprint,
      synthesizedModules,
      course,
      provider,
      model,
      aiExecute
    );
    accumulateUsage(tokenUsage, wrapper.usage);

    parsedRawCourse = {
      id: `gen-${Date.now()}`,
      title: blueprint.subjectTitle,
      code: blueprint.courseCode,
      version: 'v9.0-Universal',
      overview: wrapper.overview,
      purpose: wrapper.purpose,
      targetAudience: wrapper.targetAudience,
      estimatedDuration: wrapper.estimatedDuration,
      learningOutcomes: wrapper.learningOutcomes,
      modules: synthesizedModules,
      assessments: wrapper.assessments
    };
  } else {
    // Edge fallback if zero modules were in course
    const aiResponse = await aiExecute({
      provider,
      model,
      prompt: `Generate a complete GeneratedCourse JSON from this template:\n\n${masterPrompt}`,
      systemInstruction: `Teach "${blueprint.subjectTitle}" cleanly without generic filler or off-topic domains. Return only valid JSON.`,
      responseFormat: 'json',
      maxTokens: 4096,
      timeoutMs: 90000
    });
    accumulateUsage(tokenUsage, aiResponse.usage);
    parsedRawCourse = extractAndParseJSON(aiResponse.text);
  }

  const metadata: GenerationMetadata = {
    provider,
    providerDisplayName: provider === 'gemini' ? 'Google Gemini' : 'Groq Cloud',
    model,
    modelDisplayName: modelInfo?.displayName || model,
    generatedAt: new Date().toISOString(),
    generationDurationMs: Date.now() - startTime,
    fallbackUsed: false,
    tokensUsed:
      tokenUsage.input > 0 || tokenUsage.output > 0
        ? { input: tokenUsage.input, output: tokenUsage.output }
        : undefined
  };

  const validation = validateAndSanitizeGeneratedCourse(
    parsedRawCourse,
    course,
    metadata,
    blueprint
  );

  if (validation.course) {
    let qualityReview = reviewGeneratedCourseQuality(validation.course, course, blueprint);

    if (qualityReview.repairTargets.length && !options?.skipRepair) {
      const targets = qualityReview.repairTargets;
      try {
        const repair = await attemptTargetedQualityRepair(
          validation.course,
          targets,
          course,
          provider,
          model,
          aiExecute
        );
        accumulateUsage(tokenUsage, {
          inputTokens: repair.inputTokens,
          outputTokens: repair.outputTokens
        });
        if (metadata.tokensUsed) {
          metadata.tokensUsed = { input: tokenUsage.input, output: tokenUsage.output };
        }
        qualityReview = reviewGeneratedCourseQuality(validation.course, course, blueprint);
        qualityReview.qa.recommendations.unshift(
          `Automatic targeted revision improved ${repair.applied} flagged item(s) before final QA scoring.`
        );
      } catch (error) {
        const reason = error instanceof Error ? error.message : 'Unknown model response error';
        console.warn('Automatic course quality revision could not be completed:', reason);
        qualityReview.qa.warnings.push(
          'Automatic revision of flagged content could not be completed; the original draft is retained for human review.'
        );
      } finally {
        metadata.generationDurationMs = Date.now() - startTime;
      }
    }

    validation.course.qa = qualityReview.qa;
    return {
      success: true,
      course: validation.course
    };
  }

  throw new Error(
    `Generated course validation failed: ${validation.errors.join(', ') || 'Incomplete course structure returned by AI.'}`
  );
}
