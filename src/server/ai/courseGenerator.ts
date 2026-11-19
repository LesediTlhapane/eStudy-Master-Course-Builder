import type { Course, GeneratedCourse, AIProvider, GenerationMetadata } from '../../types.js';
import { generateMasterPrompt } from '../../utils/promptGenerator.js';
import { sanitizeCourse } from '../../utils/courseSanitizer.js';
import { aiRouter } from './aiRouter.js';
import { extractAndParseJSON, reviewGeneratedCourseQuality, validateAndSanitizeGeneratedCourse } from './courseValidator.js';
import { getDefaultModelForProvider, getModelMeta } from './modelRegistry.js';

export interface CourseGenerationResult {
  success: boolean;
  course?: GeneratedCourse;
  error?: string;
}

async function attemptTargetedQualityRepair(
  generatedCourse: GeneratedCourse,
  targets: ReturnType<typeof reviewGeneratedCourseQuality>['repairTargets'],
  sourceCourse: Course,
  provider: AIProvider,
  model: string
): Promise<{ applied: number; inputTokens?: number; outputTokens?: number }> {
  const prompt = `Revise only the flagged lesson content, practical-task instructions, and assessment questions below. Keep all IDs, titles, module structure, and the existing GeneratedCourse schema unchanged. Do not invent facts, legal claims, statistics, or source citations. Return only JSON:
{
  "lessons": [
    { "id": "existing-lesson-id", "concepts": ["Specific concept"], "contentBody": "Revised lesson teaching text", "workplaceApplication": "Specific application", "aiApplication": "Relevant AI application or Not applicable for this subject" }
  ],
  "tasks": [
    { "moduleId": "existing-module-id", "instructions": "Objective: ...\\nScenario: ...\\nResources: ...\\nSteps: 1. ... 2. ...\\nDeliverable: ...\\nSuccess criteria: ...\\nReflection: ...", "deliverable": "Expected learner artefact", "evaluationRubric": ["Criterion 1 (50%)", "Criterion 2 (50%)"] }
  ],
  "questions": [
    { "id": "existing-question-id", "questionLocation": "module or final", "question": "Distinct question", "options": ["Option A", "Option B"], "correctAnswer": 0, "rationale": "Why the answer is correct", "learningObjectiveRef": "Exact objective code" }
  ]
}

Lessons and tasks to improve:
${JSON.stringify(
  targets.map(target => {
    const module = generatedCourse.modules.find(candidate => candidate.id === target.moduleId);
    return {
      moduleId: target.moduleId,
      moduleTitle: target.moduleTitle,
      moduleObjectives: module?.learningObjectives.map(objective => objective.statement),
      otherLessonsToAvoidRepeating: module?.lessons
        .filter(lesson => lesson.id !== target.lessonId)
        .map(lesson => ({ title: lesson.title, concepts: lesson.concepts })),
      lessonId: target.lessonId,
      lessonTitle: target.lessonTitle,
      questionId: target.questionId,
      questionLocation: target.questionLocation,
      currentQuestion: target.currentQuestion,
      availableObjectives: target.availableObjectives,
      currentContent: target.contentBody?.slice(0, 5000),
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
      excerpt: source.contentSnippet?.slice(0, 1200)
    }))
)}`;

  const response = await aiRouter.execute({
    provider,
    model,
    prompt,
    systemInstruction:
      'You are an instructional editor. Improve only the specified course content. Teach the actual subject, avoid repetition and generic filler, and do not claim facts are verified unless supported by the supplied course sources.',
    responseFormat: 'json',
    maxTokens: 4096,
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
  modelInput?: string
): Promise<CourseGenerationResult> {
  const startTime = Date.now();
  const course = sanitizeCourse(rawCourse);
  const provider: AIProvider = 'groq';
  const requestedModel = modelInput?.trim();
  const model: string =
    requestedModel && !requestedModel.toLowerCase().includes('gemini')
      ? requestedModel
      : getDefaultModelForProvider(provider, 'course_generation');
  const modelInfo = getModelMeta(provider, model);

  // Validate core compulsory fields before calling the AI service
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

  const masterPrompt = generateMasterPrompt(course);

  const systemInstruction = `You are an experienced subject-matter educator and instructional designer. Develop a course that teaches the specified subject, not a generic corporate compliance manual.

EDUCATIONAL QUALITY RULES:
1. Use clear South African English. Match technical depth to the specified learner level and explain specialist terms on first use.
2. Treat the completed eStudy Master Course Template v9.0 as the source of scope, audience, module plan, and required fields. Keep its module count, titles, order, and learning objectives; do not add, remove, or rename modules. Where the template specifies lesson names or lesson counts, preserve them.
3. Give each lesson a distinct purpose and a clear progression from prerequisite concepts to application. Explain the core concepts, how or why they work, when they apply, relevant limitations, and at least one subject-specific example. A lesson must teach new knowledge; do not repeat objectives, summaries, or generic procedures as a substitute for teaching.
4. Vary examples and workplace contexts across the course. Use South African legal, regulatory, or compliance content only when relevant to the subject and supported by supplied verified sources. Do not invent legal requirements, interpretations, statistics, performance results, accreditations, or citations. Mark unsupported claims for SME/source verification; never represent generated content as legal advice.
5. Practical task instructions must include labelled Objective, Scenario, Resources, Steps, Deliverable, Success criteria, and Reflection sections. Give enough concrete information for a learner to complete the task. Use a weighted rubric tied to the module objectives.
6. Every knowledge-check and final assessment question must measure a taught concept or skill. Set learningObjectiveRef to the exact code of the relevant objective. Mix recall, explanation, and application; avoid duplicate questions and provide a correct answer with a defensible rationale.
7. Before returning the course, review the entire draft against subject depth, accuracy and source support, lesson distinctness, activity usability, example variety, objective-assessment alignment, and audience relevance. Revise any generic, repetitive, unsupported, or non-actionable lesson, activity, or question. Do not pad content to meet a word or page target.
8. Return only valid JSON matching the existing GeneratedCourse schema. Preserve the existing field names and structure, including modules, lessons, scenarios, practical tasks, assessments, and the capstone. Do not add a separate report or markdown fences.`;

  const prompt = `Use the following completed eStudy Master Course Template v9.0 as the course specification. Preserve its structure and user-defined module plan. Treat any unsourced legal, technical, accreditation, or statistical claims as unverified, not as facts.\n\n${masterPrompt}\n\nGenerate the course with meaningful subject teaching, practical activities learners can complete, varied examples, and assessments aligned to the stated objectives. Prioritise accuracy, clarity, and learning value over length.`;

  const aiResponse = await aiRouter.execute({
    provider,
    model,
    prompt,
    systemInstruction,
    responseFormat: 'json',
    maxTokens: 8192,
    timeoutMs: 95000
  });

  if (!aiResponse.text || aiResponse.text.trim().length < 100) {
    throw new Error('The Groq Cloud API returned an empty or incomplete response.');
  }

  const parsedJson = extractAndParseJSON(aiResponse.text);
  if (!parsedJson || typeof parsedJson !== 'object') {
    throw new Error(
      `The AI provider (Groq Cloud - ${model}) returned invalid JSON that could not be parsed. Please retry generation or select another Groq model.`
    );
  }

  const metadata: GenerationMetadata = {
    provider,
    providerDisplayName: 'Groq Cloud',
    model: aiResponse.model || model,
    modelDisplayName: modelInfo?.displayName || aiResponse.model || model,
    generatedAt: new Date().toISOString(),
    generationDurationMs: Date.now() - startTime,
    fallbackUsed: false,
    tokensUsed: aiResponse.usage
      ? {
          input: aiResponse.usage.inputTokens,
          output: aiResponse.usage.outputTokens
        }
      : undefined
  };

  const validation = validateAndSanitizeGeneratedCourse(parsedJson, course, metadata);

  if (validation.course) {
    let qualityReview = reviewGeneratedCourseQuality(validation.course, course);
    if (qualityReview.repairTargets.length) {
      const targets = qualityReview.repairTargets;
      try {
        const repair = await attemptTargetedQualityRepair(validation.course, targets, course, provider, model);
        metadata.tokensUsed = {
          input: (metadata.tokensUsed?.input || 0) + (repair.inputTokens || 0),
          output: (metadata.tokensUsed?.output || 0) + (repair.outputTokens || 0)
        };
        qualityReview = reviewGeneratedCourseQuality(validation.course, course);
        qualityReview.qa.recommendations.unshift(
          `An automatic revision was applied to ${repair.applied} flagged lesson/task item(s), then heuristic checks were rerun.`
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
