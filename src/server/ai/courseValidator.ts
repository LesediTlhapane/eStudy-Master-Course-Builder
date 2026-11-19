import type { Course, GeneratedCourse, GeneratedModule, GeneratedLesson, GeneratedScenario, GeneratedQuestion, GeneratedAssessmentSet, GeneratedCourseQA, GenerationMetadata } from '../../types.js';
import { countWordsInText, enforceComprehensiveCourseVolume } from '../../utils/courseVolumeEngine.js';

export interface ValidationResult {
  success: boolean;
  course?: GeneratedCourse;
  errors: string[];
}

export interface CourseQualityRepairTarget {
  moduleId: string;
  moduleTitle: string;
  lessonId?: string;
  lessonTitle?: string;
  questionId?: string;
  questionLocation?: 'module' | 'final';
  currentQuestion?: GeneratedQuestion;
  availableObjectives?: Array<{ code: string; statement: string }>;
  concepts?: string[];
  contentBody?: string;
  workplaceApplication?: string;
  aiApplication?: string;
  taskInstructions?: string;
  taskDeliverable?: string;
  taskRubric?: string[];
  issues: string[];
}

export interface CourseQualityReview {
  qa: GeneratedCourseQA;
  repairTargets: CourseQualityRepairTarget[];
}

const PRACTICAL_TASK_SECTIONS: Array<{ label: string; pattern: RegExp }> = [
  { label: 'Objective', pattern: /objective\s*:/i },
  { label: 'Scenario', pattern: /scenario\s*:/i },
  { label: 'Resources', pattern: /resources?\s*:/i },
  { label: 'Numbered steps', pattern: /steps?\s*:\s*(?:\d+[.)]|\n\s*\d+[.)])/i },
  { label: 'Deliverable', pattern: /deliverable\s*:/i },
  { label: 'Success criteria', pattern: /success\s+criteria\s*:/i },
  { label: 'Reflection', pattern: /reflection\s*:/i }
];

function contentNgrams(text: string): Set<string> {
  const words = text.toLowerCase().match(/[a-z0-9']+/g) || [];
  const shingles = new Set<string>();
  for (let i = 0; i <= words.length - 4; i++) {
    shingles.add(words.slice(i, i + 4).join(' '));
  }
  return shingles;
}

function contentOverlap(left: string, right: string): number {
  const leftShingles = contentNgrams(left);
  const rightShingles = contentNgrams(right);
  if (!leftShingles.size || !rightShingles.size) return 0;
  let shared = 0;
  for (const shingle of leftShingles) {
    if (rightShingles.has(shingle)) shared++;
  }
  return shared / Math.min(leftShingles.size, rightShingles.size);
}

export function reviewGeneratedCourseQuality(
  course: GeneratedCourse,
  sourceCourse: Course
): CourseQualityReview {
  const lessonEntries = course.modules.flatMap(module =>
    module.lessons.map(lesson => ({ module, lesson }))
  );
  const repairTargets: CourseQualityRepairTarget[] = [];
  const taskRepairTargets: CourseQualityRepairTarget[] = [];
  const questionRepairTargets: CourseQualityRepairTarget[] = [];
  const duplicatedLessons = new Set<string>();
  const contentTargets = new Map<string, CourseQualityRepairTarget>();

  for (const { module, lesson } of lessonEntries) {
    const issues: string[] = [];
    if (countWordsInText(lesson.contentBody) < 120) {
      issues.push('The lesson is too brief to explain its stated concepts and provide a worked example.');
    }
    if (lesson.concepts.length < 2) {
      issues.push('Identify at least two specific concepts taught in the lesson.');
    }
    if (countWordsInText(lesson.workplaceApplication) < 8) {
      issues.push('Provide a concrete workplace application relevant to the lesson subject.');
    }

    for (const other of lessonEntries) {
      if (other.lesson.id === lesson.id) continue;
      if (contentOverlap(lesson.contentBody, other.lesson.contentBody) >= 0.72) {
        issues.push(`The lesson substantially repeats "${other.lesson.title}".`);
        duplicatedLessons.add(lesson.id);
        break;
      }
    }

    if (issues.length) {
      contentTargets.set(lesson.id, {
        moduleId: module.id,
        moduleTitle: module.title,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        contentBody: lesson.contentBody,
        workplaceApplication: lesson.workplaceApplication,
        aiApplication: lesson.aiApplication,
        concepts: lesson.concepts,
        issues
      });
    }
  }

  repairTargets.push(...Array.from(contentTargets.values()).slice(0, 3));

  let completedTaskSections = 0;
  let possibleTaskSections = 0;
  for (const module of course.modules) {
    if (!module.practicalTask) continue;
    const task = module.practicalTask;
    const instructions = task.instructions || '';
    const missingSections = PRACTICAL_TASK_SECTIONS.filter(section => !section.pattern.test(instructions));
    const weights = (task.evaluationRubric || [])
      .map(criterion => criterion.match(/(\d+(?:\.\d+)?)\s*%/))
      .filter((match): match is RegExpMatchArray => Boolean(match))
      .map(match => Number(match[1]));
    const rubricComplete =
      (task.evaluationRubric?.length || 0) >= 2 &&
      weights.length === (task.evaluationRubric?.length || 0) &&
      Math.abs(weights.reduce((total, weight) => total + weight, 0) - 100) <= 1;
    possibleTaskSections += PRACTICAL_TASK_SECTIONS.length;
    completedTaskSections += PRACTICAL_TASK_SECTIONS.length - missingSections.length;
    possibleTaskSections++;
    if (rubricComplete) completedTaskSections++;

    if (missingSections.length || !rubricComplete) {
      taskRepairTargets.push({
        moduleId: module.id,
        moduleTitle: module.title,
        taskInstructions: instructions,
        taskDeliverable: task.deliverable,
        taskRubric: task.evaluationRubric,
        issues: [
          ...(missingSections.length
            ? [`The practical task is missing these learner guidance sections: ${missingSections
                .map(section => section.label)
                .join(', ')}.`]
            : []),
          ...(!rubricComplete ? ['Provide a weighted evaluation rubric with at least two criteria totaling 100%.'] : [])
        ]
      });
    }
  }

  const objectiveCodes = new Set(
    course.modules.flatMap(module => module.learningObjectives.map(objective => objective.code))
  );
  const questionEntries = [
    ...course.modules.flatMap(module =>
      module.knowledgeChecks.map(question => ({ question, module, location: 'module' as const }))
    ),
    ...course.assessments.finalAssessment.questions.map(question => ({
      question,
      module: course.modules[0],
      location: 'final' as const
    }))
  ];
  const questionKeys = questionEntries.map(({ question }) =>
    question.question.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  );
  const duplicateQuestionIds = new Set<string>();
  const encounteredQuestions = new Set<string>();
  for (const [index, questionKey] of questionKeys.entries()) {
    if (encounteredQuestions.has(questionKey)) {
      duplicateQuestionIds.add(questionEntries[index].question.id);
    }
    encounteredQuestions.add(questionKey);
  }
  const alignedQuestions = questionEntries.filter(({ question }) =>
    Boolean(question.learningObjectiveRef && objectiveCodes.has(question.learningObjectiveRef))
  ).length;
  const completeQuestions = questionEntries.filter(({ question }) =>
    Boolean(
      question.question.trim() &&
        question.options.length >= 2 &&
        question.correctAnswer >= 0 &&
        question.correctAnswer < question.options.length &&
        question.rationale.trim()
    )
  ).length;
  const referenceScore = questionEntries.length
    ? alignedQuestions / questionEntries.length
    : 0;
  const uniquenessScore = questionEntries.length
    ? (questionEntries.length - duplicateQuestionIds.size) / questionEntries.length
    : 0;
  const completenessScore = questionEntries.length
    ? completeQuestions / questionEntries.length
    : 0;
  const alignmentScore = Math.round(
    (referenceScore * 0.55 + uniquenessScore * 0.2 + completenessScore * 0.25) * 100
  );
  for (const entry of questionEntries) {
    const hasObjectiveRef = Boolean(
      entry.question.learningObjectiveRef && objectiveCodes.has(entry.question.learningObjectiveRef)
    );
    const isComplete = Boolean(
      entry.question.question.trim() &&
        entry.question.options.length >= 2 &&
        entry.question.correctAnswer >= 0 &&
        entry.question.correctAnswer < entry.question.options.length &&
        entry.question.rationale.trim()
    );
    if (!hasObjectiveRef || duplicateQuestionIds.has(entry.question.id) || !isComplete) {
      questionRepairTargets.push({
        moduleId: entry.module?.id || '',
        moduleTitle: entry.module?.title || 'Final assessment',
        questionId: entry.question.id,
        questionLocation: entry.location,
        currentQuestion: entry.question,
        availableObjectives: (entry.location === 'final'
          ? course.modules.flatMap(module => module.learningObjectives)
          : entry.module?.learningObjectives || []
        ).map(objective => ({ code: objective.code, statement: objective.statement })),
        issues: [
          ...(!hasObjectiveRef ? ['Reference a learning objective actually taught in the course.'] : []),
          ...(duplicateQuestionIds.has(entry.question.id) ? ['Replace this duplicate question with a distinct assessment item.'] : []),
          ...(!isComplete ? ['Provide a complete question, at least two answer options, a valid correct-answer index, and a rationale.'] : [])
        ]
      });
    }
  }

  const lessonDepthScore = lessonEntries.length
    ? Math.round(
        (lessonEntries.filter(({ lesson }) =>
          countWordsInText(lesson.contentBody) >= 120 &&
          lesson.concepts.length >= 2 &&
          countWordsInText(lesson.workplaceApplication) >= 8
        ).length /
          lessonEntries.length) *
          100
      )
    : 0;
  const scenarioEntries = course.modules.flatMap(module =>
    module.scenarios.map(scenario => ({ module, scenario }))
  );
  const duplicatedScenarios = new Set<string>();
  for (const { scenario } of scenarioEntries) {
    const scenarioText = [
      scenario.title,
      scenario.situation,
      scenario.challenge,
      scenario.decisionPoint,
      scenario.debrief
    ].join(' ');
    for (const other of scenarioEntries) {
      if (other.scenario.id === scenario.id) continue;
      const otherText = [
        other.scenario.title,
        other.scenario.situation,
        other.scenario.challenge,
        other.scenario.decisionPoint,
        other.scenario.debrief
      ].join(' ');
      if (contentOverlap(scenarioText, otherText) >= 0.72) {
        duplicatedScenarios.add(scenario.id);
        break;
      }
    }
  }
  const distinctContentCount = lessonEntries.length + scenarioEntries.length;
  const repeatedContentCount = duplicatedLessons.size + duplicatedScenarios.size;
  const distinctnessScore = distinctContentCount
    ? Math.max(0, Math.round(100 - (repeatedContentCount / distinctContentCount) * 100))
    : 0;
  const taskScore = possibleTaskSections
    ? Math.round((completedTaskSections / possibleTaskSections) * 100)
    : 0;
  const verifiedSourceCount = (sourceCourse.research?.sources || []).filter(
    source => source.status === 'Verified'
  ).length;
  const evidenceScore = Math.min(100, verifiedSourceCount * 25);
  const score = Math.min(
    80,
    Math.round(
      lessonDepthScore * 0.2 +
        distinctnessScore * 0.2 +
        taskScore * 0.25 +
        alignmentScore * 0.2 +
        evidenceScore * 0.15
    )
  );

  const warnings: string[] = [];
  if (lessonDepthScore < 100) {
    warnings.push('Some lessons may lack sufficient teaching text, distinct concepts, or a concrete workplace application.');
  }
  if (duplicatedLessons.size) {
    warnings.push(`${duplicatedLessons.size} lesson(s) substantially overlap with another lesson.`);
  }
  if (duplicatedScenarios.size) {
    warnings.push(`${duplicatedScenarios.size} workplace scenario(s) substantially overlap with another scenario.`);
  }
  if (taskScore < 100) {
    warnings.push('One or more practical tasks are missing explicit learner guidance sections.');
  }
  if (questionEntries.length === 0) {
    warnings.push('No module knowledge-check or final-assessment questions were returned.');
  } else if (referenceScore < 1) {
    warnings.push('Some knowledge-check or final-assessment questions do not reference a valid learning objective.');
  }
  if (completenessScore < 1) {
    warnings.push('Some assessment questions are missing a question, answer options, a valid answer, or a rationale.');
  }
  if (duplicateQuestionIds.size) {
    warnings.push(`${duplicateQuestionIds.size} assessment question(s) repeat another question.`);
  }
  if (verifiedSourceCount === 0) {
    warnings.push('No user-marked verified sources were supplied; technical, factual, and legal claims require source or SME review.');
  }
  if (!course.assessments.finalAssessment.capstoneCaseStudy) {
    warnings.push('The final assessment has no configured capstone case study.');
  }
  if (
    course.assessments.preCourseDiagnostic.questions.length < 5 ||
    course.assessments.preCourseDiagnostic.questions.length > 10
  ) {
    warnings.push('The pre-course diagnostic does not contain the configured 5–10 question range.');
  }
  if (!course.learningOutcomes.length) {
    warnings.push('No course-level learning outcomes were returned.');
  }
  const sourceModuleCount = sourceCourse.modules?.length || 0;
  if (sourceModuleCount && sourceModuleCount !== course.modules.length) {
    warnings.push(
      `The generated ${course.modules.length}-module course does not match the ${sourceModuleCount}-module user plan.`
    );
  }
  warnings.push('Automated checks cannot verify factual accuracy, legal interpretation, or subject-matter correctness; human review is required.');

  const criticalIssues = lessonEntries.length === 0
    ? ['The generated course contains no lessons.']
    : [];
  const passedChecks = [
    'Generated response was parsed and mapped to the existing course schema.',
    ...(sourceModuleCount && sourceModuleCount === course.modules.length
      ? [`Preserved all ${sourceModuleCount} user-defined modules.`]
      : [])
  ];
  if (lessonDepthScore === 100) passedChecks.push('Every lesson passes the minimum content-presence check.');
  if (distinctnessScore === 100) passedChecks.push('No substantial overlap among lesson or scenario text was detected.');
  if (taskScore === 100 && possibleTaskSections > 0) passedChecks.push('Practical task guidance includes all required sections and weighted rubrics.');
  if (alignmentScore === 100 && questionEntries.length > 0) passedChecks.push('Knowledge checks and final questions reference configured learning objectives without duplicate stems.');
  const selectedRepairTargets = [
    ...repairTargets.slice(0, 2),
    ...taskRepairTargets.slice(0, 2),
    ...questionRepairTargets.slice(0, 1)
  ].slice(0, 5);

  return {
    qa: {
      score,
      status: criticalIssues.length ? 'critical_issues' : 'review_required',
      passedChecks,
      warnings,
      criticalIssues,
      recommendations: [
        ...(repairTargets.length + taskRepairTargets.length + questionRepairTargets.length
          ? ['Review the flagged lesson, practical-task, or assessment improvements before delivery.']
          : []),
        'Verify technical, factual, and legal claims against authoritative sources and subject-matter experts.',
        'Review assessment answers and objective alignment before learner use.'
      ],
      southAfricanContextVerified: false,
      popiaCompliant: false
    },
    repairTargets: selectedRepairTargets
  };
}

/**
 * Extracts and parses JSON from raw LLM text, stripping markdown codeblocks if present.
 */
export function extractAndParseJSON(rawText: string): any {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Empty or non-string response received from AI model.');
  }

  let cleaned = rawText.trim();

  // Strip markdown code fences if wrapped in ```json ... ``` or ``` ... ```
  if (cleaned.startsWith('```')) {
    const firstLineEnd = cleaned.indexOf('\n');
    const lastFence = cleaned.lastIndexOf('```');
    if (firstLineEnd !== -1 && lastFence > firstLineEnd) {
      cleaned = cleaned.substring(firstLineEnd + 1, lastFence).trim();
    }
  }

  // Look for the first outer curly bracket if there is preamble text
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (err: any) {
    throw new Error(`Failed to parse AI JSON response: ${err.message}. Raw preview: ${cleaned.slice(0, 150)}...`);
  }
}

/**
 * Validates and repairs a parsed course object against the GeneratedCourse schema.
 */
export function validateAndSanitizeGeneratedCourse(
  raw: any,
  sourceCourse: Course,
  metadata: GenerationMetadata
): ValidationResult {
  const errors: string[] = [];

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {
      success: false,
      errors: ['Root response is not a valid JSON object.']
    };
  }

  const s = sourceCourse.structure || ({} as any);
  const p = sourceCourse.problem || ({} as any);

  // 1. Basic Course Identity
  const title = typeof raw.title === 'string' && raw.title.trim().length > 0
    ? raw.title.trim()
    : (s.title || sourceCourse.name || 'Untitled Course');

  const code = typeof raw.code === 'string' && raw.code.trim().length > 0
    ? raw.code.trim()
    : (s.code || sourceCourse.code || 'EST-COURSE-01');

  const version = typeof raw.version === 'string' && raw.version.trim().length > 0
    ? raw.version.trim()
    : 'v9.0-Universal';

  const overview = typeof raw.overview === 'string' && raw.overview.trim().length > 0
    ? raw.overview.trim()
    : (s.scopeSummary || s.purposeStatement || 'Structured operational training program.');

  const purpose = typeof raw.purpose === 'string' && raw.purpose.trim().length > 0
    ? raw.purpose.trim()
    : (s.purposeStatement || `Equip learners with practical tools and compliance mastery.`);

  const targetAudience = typeof raw.targetAudience === 'string' && raw.targetAudience.trim().length > 0
    ? raw.targetAudience.trim()
    : (s.targetRoles || p.targetGroup || '');

  const estimatedDuration = typeof raw.estimatedDuration === 'string' && raw.estimatedDuration.trim().length > 0
    ? raw.estimatedDuration.trim()
    : (s.estimatedDuration || '4 - 6 Hours (Self-paced + Practical Tasks)');

  // 2. Learning Outcomes
  let learningOutcomes: string[] = [];
  if (Array.isArray(raw.learningOutcomes) && raw.learningOutcomes.length > 0) {
    learningOutcomes = raw.learningOutcomes.map((lo: any) => String(lo).trim()).filter(Boolean);
  }
  // 3. Modules Validation
  if (!Array.isArray(raw.modules) || raw.modules.length === 0) {
    errors.push('Course must contain at least one module.');
  }

  const rawModules = Array.isArray(raw.modules) ? raw.modules : [];
  const sanitizedModules: GeneratedModule[] = [];

  rawModules.forEach((m: any, mIdx: number) => {
    const modNumber = typeof m.moduleNumber === 'number' ? m.moduleNumber : mIdx + 1;
    const modTitle = typeof m.title === 'string' && m.title.trim().length > 0
      ? m.title.trim()
      : '';

    // Lessons validation
    const lessons: GeneratedLesson[] = [];
    if (Array.isArray(m.lessons)) {
      m.lessons.forEach((l: any, lIdx: number) => {
        lessons.push({
          id: l.id || `lesson-${modNumber}-${lIdx + 1}`,
          title: typeof l.title === 'string' && l.title.trim().length > 0
            ? l.title.trim()
            : '',
          durationMinutes: typeof l.durationMinutes === 'number' ? l.durationMinutes : 30,
          concepts: Array.isArray(l.concepts) ? l.concepts.map(String) : [],
          contentBody: typeof l.contentBody === 'string' ? l.contentBody : '',
          callouts: Array.isArray(l.callouts) ? l.callouts : [],
          workplaceApplication: typeof l.workplaceApplication === 'string'
            ? l.workplaceApplication
            : '',
          aiApplication: typeof l.aiApplication === 'string'
            ? l.aiApplication
            : ''
        });
      });
    }

    // Scenarios validation
    const scenarios: GeneratedScenario[] = [];
    if (Array.isArray(m.scenarios)) {
      m.scenarios.forEach((sc: any, scIdx: number) => {
        scenarios.push({
          id: sc.id || `scenario-${modNumber}-${scIdx + 1}`,
          title: sc.title || '',
          type: sc.type === 'AI Specific' ? 'AI Specific' : 'Workplace',
          situation: sc.situation || '',
          challenge: sc.challenge || '',
          decisionPoint: sc.decisionPoint || '',
          debrief: sc.debrief || '',
          keyTakeaway: sc.keyTakeaway || ''
        });
      });
    }

    // Knowledge checks
    const knowledgeChecks: GeneratedQuestion[] = [];
    if (Array.isArray(m.knowledgeChecks)) {
      m.knowledgeChecks.forEach((q: any, qIdx: number) => {
        const options = Array.isArray(q.options) && q.options.length >= 2
          ? q.options.map(String)
          : [];
        const correctAnswer = typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer < options.length
          ? q.correctAnswer
          : 0;

        knowledgeChecks.push({
          id: q.id || `kc-${modNumber}-${qIdx + 1}`,
          question: q.question || '',
          options,
          correctAnswer,
          rationale: q.rationale || '',
          learningObjectiveRef: typeof q.learningObjectiveRef === 'string' ? q.learningObjectiveRef : undefined
        });
      });
    }

    sanitizedModules.push({
      id: m.id || `module-${modNumber}`,
      moduleNumber: modNumber,
      title: modTitle,
      subtitle: m.subtitle || '',
      purpose: m.purpose || '',
      learningObjectives: Array.isArray(m.learningObjectives) && m.learningObjectives.length > 0
        ? m.learningObjectives.map((lo: any, oIdx: number) => ({
            id: lo.id || `lo-${modNumber}-${oIdx + 1}`,
            code: lo.code || `LO ${modNumber}.${oIdx + 1}`,
            statement: typeof lo === 'string' ? lo : (lo.statement || ''),
            bloomLevel: lo.bloomLevel || (oIdx === 0 ? 'Understand' : oIdx === 1 ? 'Apply' : 'Evaluate')
          }))
        : [],
      lessons,
      scenarios,
      knowledgeChecks,
      practicalTask: m.practicalTask || {
        id: `task-${modNumber}`,
        title: '',
        instructions: '',
        deliverable: '',
        evaluationRubric: []
      },
      reflection: Array.isArray(m.reflection) ? m.reflection.map(String) : [],
      summary: m.summary || ''
    });
  });

  // 4. Assessments Validation
  const rawAssessments = raw.assessments || {};
  const preCourseQuestions: GeneratedQuestion[] = Array.isArray(rawAssessments.preCourseDiagnostic?.questions)
    ? rawAssessments.preCourseDiagnostic.questions.map((q: any, i: number) => ({
        id: q.id || `diag-${i + 1}`,
        question: q.question || '',
        options: Array.isArray(q.options) && q.options.length >= 2 ? q.options.map(String) : [],
        correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
        rationale: q.rationale || '',
        learningObjectiveRef: typeof q.learningObjectiveRef === 'string' ? q.learningObjectiveRef : undefined
      }))
    : [];

  const finalQuestions: GeneratedQuestion[] = Array.isArray(rawAssessments.finalAssessment?.questions)
    ? rawAssessments.finalAssessment.questions.map((q: any, i: number) => ({
        id: q.id || `final-q${i + 1}`,
        question: q.question || '',
        options: Array.isArray(q.options) && q.options.length >= 2 ? q.options.map(String) : [],
        correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
        rationale: q.rationale || '',
        learningObjectiveRef: typeof q.learningObjectiveRef === 'string' ? q.learningObjectiveRef : undefined
      }))
    : [];

  const assessments: GeneratedAssessmentSet = {
    preCourseDiagnostic: {
      title: rawAssessments.preCourseDiagnostic?.title || 'Pre-Course Knowledge & Readiness Diagnostic',
      instructions: rawAssessments.preCourseDiagnostic?.instructions || 'Complete these baseline questions to tailor your learning trajectory.',
      questions: preCourseQuestions
    },
    moduleKnowledgeChecksCount: sanitizedModules.reduce((acc, m) => acc + m.knowledgeChecks.length, 0),
    practicalTasks: sanitizedModules.map(m => m.practicalTask!).filter(Boolean),
    finalAssessment: {
      title: rawAssessments.finalAssessment?.title || 'Summative Capstone Assessment',
      passMark: rawAssessments.finalAssessment?.passMark || '80%',
      instructions: rawAssessments.finalAssessment?.instructions || 'Demonstrate comprehensive mastery across all modules through scenario-based evaluation.',
      questions: finalQuestions,
      capstoneCaseStudy: rawAssessments.finalAssessment?.capstoneCaseStudy
    },
    postCourseReflection: {
      prompts: [
        'What was the most transformative competency acquired in this course?',
        'How will you enforce Human-in-the-Loop oversight in your departmental duties?',
        'What 90-day action commitments will you set for continuous improvement?'
      ],
      actionPlanTemplate: '30-60-90 Day Professional Action & AI Governance Implementation Plan'
    }
  };

  // 5. Sources mapping
  const sources = (sourceCourse.research?.sources || []).map(src => ({
    name: src.name,
    type: src.type,
    reference: src.reference,
    relevance: src.relevance,
    contentSnippet: src.contentSnippet,
    fileName: src.fileName,
    url: src.url,
    verified: src.status === 'Verified'
  }));

  // 6. QA scorecard
  const qa: GeneratedCourseQA = {
    score: 0,
    status: 'review_required' as const,
    passedChecks: [],
    warnings: [],
    criticalIssues: [],
    recommendations: [],
    southAfricanContextVerified: false,
    popiaCompliant: false
  };

  const baseCourse: GeneratedCourse = {
    id: raw.id || `gen-${Date.now()}`,
    courseId: sourceCourse.id,
    title,
    code,
    version,
    overview,
    purpose,
    targetAudience,
    estimatedDuration,
    learningOutcomes,
    modules: sanitizedModules,
    assessments,
    sources,
    qa,
    generatedAt: new Date().toISOString(),
    generationMetadata: metadata
  };

  // Preserve the local fallback volume behaviour; Groq-generated courses are not padded.
  const finalCourse = enforceComprehensiveCourseVolume(baseCourse, sourceCourse);
  finalCourse.qa = reviewGeneratedCourseQuality(finalCourse, sourceCourse).qa;

  return {
    success: errors.length === 0,
    course: finalCourse,
    errors
  };
}
