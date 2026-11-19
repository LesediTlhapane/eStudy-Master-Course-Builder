import type {
  Course,
  GeneratedCourse,
  GeneratedModule,
  GeneratedLesson,
  GeneratedScenario,
  GeneratedQuestion,
  GeneratedAssessmentSet,
  GeneratedCourseQA,
  GeneratedQACheckDetail,
  GenerationMetadata,
  AIProvider
} from '../../types.js';
import type { AIRequest, AIResponse } from './types.js';
import { countWordsInText, enforceComprehensiveCourseVolume } from '../../utils/courseVolumeEngine.js';
import {
  buildDeterministicBlueprint,
  detectCrossDomainBleed,
  type CurriculumBlueprint
} from './curriculumBlueprint.js';

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

const BOILERPLATE_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: 'five-stage operational protocol filler', pattern: /five-stage operational protocol/i },
  { label: 'Johannesburg 48-hour unit filler', pattern: /johannesburg operational unit.*48-hour deadline/i },
  { label: 'pre-execution readiness SOP filler', pattern: /stage\s*1\s*[—\-–:]\s*pre-execution readiness\s*&\s*scope verification/i },
  { label: 'placeholder continuation token', pattern: /\[continue\.{0,3}\]|\bTBD\b|\blorem ipsum\b/i }
];

function contentNgrams(text: string): Set<string> {
  const words = (text || '').toLowerCase().match(/[a-z0-9']+/g) || [];
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

function extractModuleText(mod: GeneratedModule): string {
  return [
    mod.title,
    mod.subtitle,
    mod.purpose,
    mod.summary,
    ...mod.learningObjectives.map(o => o.statement),
    ...mod.lessons.map(l => `${l.title} ${l.concepts.join(' ')} ${l.contentBody} ${l.workplaceApplication} ${l.aiApplication}`),
    ...mod.scenarios.map(s => `${s.title} ${s.situation} ${s.challenge} ${s.decisionPoint} ${s.debrief}`),
    ...(mod.practicalTask ? [`${mod.practicalTask.title} ${mod.practicalTask.instructions} ${mod.practicalTask.deliverable}`] : []),
    ...mod.knowledgeChecks.map(q => `${q.question} ${q.options.join(' ')} ${q.rationale}`)
  ].join(' ');
}

export function reviewGeneratedCourseQuality(
  course: GeneratedCourse,
  sourceCourse: Course,
  providedBlueprint?: CurriculumBlueprint
): CourseQualityReview {
  const blueprint = providedBlueprint || buildDeterministicBlueprint(sourceCourse);
  const lessonEntries = course.modules.flatMap(module =>
    module.lessons.map(lesson => ({ module, lesson }))
  );
  const repairTargets: CourseQualityRepairTarget[] = [];
  const taskRepairTargets: CourseQualityRepairTarget[] = [];
  const questionRepairTargets: CourseQualityRepairTarget[] = [];
  const duplicatedLessons = new Set<string>();
  const highOverlapPairs: string[] = [];
  const contentTargets = new Map<string, CourseQualityRepairTarget>();

  const criticalIssues: string[] = [];
  const warnings: string[] = [];
  const passedChecks: string[] = [
    'Generated course parsed and validated against the eStudy v9.0 schema.'
  ];
  const recommendations: string[] = [];
  const qaChecks: GeneratedQACheckDetail[] = [];

  // ===========================================================================
  // CHECK 1: SUBJECT & DOMAIN ALIGNMENT (WITH CROSS-DOMAIN BLEED DETECTION)
  // ===========================================================================
  const subjectEvidence: string[] = [];
  const bleedFindings: string[] = [];
  const unalignedModules: string[] = [];

  const requiredConcepts = blueprint.requiredDomainConcepts.map(c => c.toLowerCase());
  const fullCourseText = [
    course.title,
    course.overview,
    course.purpose,
    course.targetAudience,
    ...course.learningOutcomes,
    ...course.modules.map(extractModuleText),
    course.assessments.finalAssessment.title,
    course.assessments.finalAssessment.capstoneCaseStudy?.scenario || '',
    ...course.assessments.finalAssessment.questions.map(q => `${q.question} ${q.rationale}`)
  ].join(' ');

  const overallBleed = detectCrossDomainBleed(fullCourseText, blueprint.outOfScopeDomains);
  if (overallBleed.length > 0) {
    for (const hit of overallBleed) {
      const msg = `Cross-domain bleed from "${hit.domain}" detected (off-topic terms: ${hit.matchedTerms.slice(0, 6).join(', ')}).`;
      bleedFindings.push(msg);
      criticalIssues.push(msg);
    }
  }

  let matchedConceptHits = 0;
  for (const concept of requiredConcepts) {
    if (fullCourseText.toLowerCase().includes(concept)) matchedConceptHits++;
  }
  const globalConceptCoverage = requiredConcepts.length
    ? Math.min(1, matchedConceptHits / Math.min(requiredConcepts.length, 6))
    : 1;

  for (const mod of course.modules) {
    const modText = extractModuleText(mod);
    const modBleed = detectCrossDomainBleed(modText, blueprint.outOfScopeDomains);
    if (modBleed.length > 0) {
      unalignedModules.push(
        `Module ${mod.moduleNumber} ("${mod.title}") contains off-topic ${modBleed.map(b => b.domain).join(', ')} terms: ${modBleed
          .flatMap(b => b.matchedTerms)
          .slice(0, 5)
          .join(', ')}.`
      );
    }
    const modWords = (mod.title || '')
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3 && !/^(module|with|from|into|that|and|the|for)$/.test(w));
    const titleKeywordsMatched = [...modWords, ...requiredConcepts.slice(0, 6)].filter(k =>
      modText.toLowerCase().includes(k)
    );
    if (modText.trim().length > 0 && titleKeywordsMatched.length === 0) {
      unalignedModules.push(`Module ${mod.moduleNumber} ("${mod.title}") shows minimal subject-concept alignment.`);
    }
  }

  if (unalignedModules.length > 0) {
    for (const um of unalignedModules) {
      if (!criticalIssues.includes(um)) criticalIssues.push(um);
    }
  }

  const titleLower = (course.title || '').toLowerCase();
  const expectedTitleLower = (blueprint.subjectTitle || '').toLowerCase();
  const expectedTitleWords = expectedTitleLower
    .split(/\s+/)
    .filter(w => w.length > 3 && !/^(the|and|for|with|course|into)$/.test(w));
  const titleMatchCount = expectedTitleWords.filter(w => titleLower.includes(w)).length;
  const titleAligned = expectedTitleWords.length === 0 || titleMatchCount >= Math.max(1, Math.ceil(expectedTitleWords.length * 0.5));
  if (!titleAligned) {
    criticalIssues.push(
      `Generated course title ("${course.title}") drifted away from configured subject ("${blueprint.subjectTitle}").`
    );
  }

  const subjectAlignmentScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        (titleAligned ? 35 : 0) +
          globalConceptCoverage * 40 +
          (course.modules.length > 0
            ? ((course.modules.length - Math.min(course.modules.length, unalignedModules.length)) /
                course.modules.length) *
              25
            : 0) -
          overallBleed.length * 35
      )
    )
  );

  const subjectStatus: 'PASS' | 'WARNING' | 'FAIL' =
    overallBleed.length > 0 || !titleAligned || subjectAlignmentScore < 60
      ? 'FAIL'
      : subjectAlignmentScore < 80
        ? 'WARNING'
        : 'PASS';

  if (subjectStatus === 'PASS') {
    subjectEvidence.push(
      `Course title, overview, modules, and assessments align consistently with "${blueprint.subjectTitle}" (${blueprint.domainLabel}).`
    );
    passedChecks.push(`Subject alignment verified for "${blueprint.subjectTitle}" (${subjectAlignmentScore}% alignment, zero cross-domain bleed).`);
  } else if (subjectStatus === 'WARNING') {
    subjectEvidence.push(`Partial subject keyword coverage (${subjectAlignmentScore}%); review domain depth.`);
    warnings.push(`Subject alignment score is ${subjectAlignmentScore}%; verify terminology depth for "${blueprint.subjectTitle}".`);
  } else {
    subjectEvidence.push(...bleedFindings, ...unalignedModules);
  }

  qaChecks.push({
    id: 'subject_alignment',
    label: 'Subject & Domain Alignment',
    status: subjectStatus,
    score: subjectAlignmentScore,
    summary:
      subjectStatus === 'PASS'
        ? `Strong alignment with "${blueprint.subjectTitle}" and zero off-topic contamination.`
        : `Detected subject drift or cross-domain bleed impacting "${blueprint.subjectTitle}".`,
    evidence: subjectEvidence.slice(0, 6)
  });

  // ===========================================================================
  // CHECK 2: STRUCTURE & METADATA CONSISTENCY
  // ===========================================================================
  const structureEvidence: string[] = [];
  let structureIssuesCount = 0;
  let structureWarningsCount = 0;

  if (course.modules.length === 0 || lessonEntries.length === 0) {
    criticalIssues.push('Generated course contains no modules or lessons.');
    structureEvidence.push('Missing modules or lessons in generated output.');
    structureIssuesCount++;
  }

  const sourceModuleCount = sourceCourse.modules?.length || 0;
  if (sourceModuleCount > 0 && sourceModuleCount !== course.modules.length) {
    const msg = `Module count mismatch: template specified ${sourceModuleCount} module(s), generated output has ${course.modules.length}.`;
    criticalIssues.push(msg);
    structureEvidence.push(msg);
    structureIssuesCount++;
  } else if (sourceModuleCount > 0) {
    passedChecks.push(`Preserved exact user-defined ${sourceModuleCount}-module structure.`);
  }

  // Verify module titles and configured lesson titles
  for (let i = 0; i < Math.min(sourceModuleCount, course.modules.length); i++) {
    const srcMod = sourceCourse.modules[i] as any;
    const genMod = course.modules[i];
    if (srcMod.title?.trim()) {
      const srcNorm = srcMod.title.toLowerCase().trim();
      const genNorm = (genMod.title || '').toLowerCase().trim();
      if (srcNorm !== genNorm && !genNorm.includes(srcNorm) && !srcNorm.includes(genNorm)) {
        const msg = `Module ${i + 1} title ("${genMod.title}") changed from template title ("${srcMod.title}").`;
        warnings.push(msg);
        structureEvidence.push(msg);
        structureWarningsCount++;
      }
    }
    if (Array.isArray(srcMod.lessons) && srcMod.lessons.length > 0) {
      if (genMod.lessons.length !== srcMod.lessons.length) {
        const msg = `Module ${i + 1} lesson count (${genMod.lessons.length}) differs from configured template (${srcMod.lessons.length}).`;
        warnings.push(msg);
        structureEvidence.push(msg);
        structureWarningsCount++;
      }
    }
  }

  const expectedCode = (sourceCourse.structure?.code || sourceCourse.code || '').trim();
  if (expectedCode && course.code && course.code.trim() !== expectedCode) {
    const msg = `Course code mismatch: template uses "${expectedCode}", generated output has "${course.code}".`;
    warnings.push(msg);
    structureEvidence.push(msg);
    structureWarningsCount++;
  }

  if (!course.learningOutcomes?.length) {
    warnings.push('No course-level learning outcomes were returned.');
    structureEvidence.push('Missing course-level learningOutcomes.');
    structureWarningsCount++;
  }
  if (
    course.assessments.preCourseDiagnostic.questions.length < 5 ||
    course.assessments.preCourseDiagnostic.questions.length > 10
  ) {
    warnings.push('The pre-course diagnostic does not contain the configured 5–10 question range.');
    structureEvidence.push(
      `Pre-course diagnostic has ${course.assessments.preCourseDiagnostic.questions.length} question(s) (expected 5–10).`
    );
    structureWarningsCount++;
  }
  if (!course.assessments.finalAssessment.capstoneCaseStudy) {
    warnings.push('The final assessment has no configured capstone case study.');
    structureEvidence.push('Missing final capstone case study.');
    structureWarningsCount++;
  }

  const structureScore = Math.max(0, 100 - structureIssuesCount * 40 - structureWarningsCount * 10);
  const structureStatus: 'PASS' | 'WARNING' | 'FAIL' =
    structureIssuesCount > 0 ? 'FAIL' : structureWarningsCount > 0 ? 'WARNING' : 'PASS';

  if (structureStatus === 'PASS') {
    structureEvidence.push(
      `Title, code (${course.code}), ${course.modules.length} modules, ${lessonEntries.length} lessons, diagnostic, and capstone structure match template.`
    );
  }

  qaChecks.push({
    id: 'structure_consistency',
    label: 'Structure & Metadata Consistency',
    status: structureStatus,
    score: structureScore,
    summary:
      structureStatus === 'PASS'
        ? `All template structural constraints preserved (${course.modules.length} modules, ${lessonEntries.length} lessons).`
        : 'Structural or metadata deviations found compared to the user template.',
    evidence: structureEvidence.slice(0, 6)
  });

  // ===========================================================================
  // CHECK 3: LESSON DEPTH, REPETITION & BOILERPLATE SCANNER
  // ===========================================================================
  const boilerplateHits: string[] = [];

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

    for (const bp of BOILERPLATE_PATTERNS) {
      if (bp.pattern.test(`${lesson.contentBody} ${lesson.workplaceApplication}`)) {
        const hitMsg = `Module ${module.moduleNumber} "${lesson.title}" contains ${bp.label}.`;
        boilerplateHits.push(hitMsg);
        issues.push(`Contains generic ${bp.label}.`);
      }
    }

    for (const other of lessonEntries) {
      if (other.lesson.id === lesson.id) continue;
      const overlap = contentOverlap(lesson.contentBody, other.lesson.contentBody);
      if (overlap >= 0.6) {
        issues.push(`Substantially repeats "${other.lesson.title}" (${Math.round(overlap * 100)}% overlap).`);
        duplicatedLessons.add(lesson.id);
        highOverlapPairs.push(
          `Lesson "${lesson.title}" overlaps ${Math.round(overlap * 100)}% with "${other.lesson.title}".`
        );
        break;
      } else if (overlap >= 0.42) {
        highOverlapPairs.push(
          `Lesson "${lesson.title}" shares moderate phrasing (${Math.round(overlap * 100)}%) with "${other.lesson.title}".`
        );
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
      if (contentOverlap(scenarioText, otherText) >= 0.6) {
        duplicatedScenarios.add(scenario.id);
        break;
      }
    }
  }

  // Check practical task duplication across modules
  const duplicatedTasks: string[] = [];
  const moduleTasks = course.modules.filter(m => m.practicalTask?.instructions);
  for (let i = 0; i < moduleTasks.length; i++) {
    for (let j = i + 1; j < moduleTasks.length; j++) {
      const tOverlap = contentOverlap(
        moduleTasks[i].practicalTask!.instructions,
        moduleTasks[j].practicalTask!.instructions
      );
      if (tOverlap >= 0.65) {
        duplicatedTasks.push(
          `Module ${moduleTasks[i].moduleNumber} and Module ${moduleTasks[j].moduleNumber} practical tasks are near-identical (${Math.round(tOverlap * 100)}% overlap).`
        );
      }
    }
  }

  const distinctContentCount = Math.max(1, lessonEntries.length + scenarioEntries.length);
  const repeatedContentCount = duplicatedLessons.size + duplicatedScenarios.size;
  const repetitionPenalty =
    (repeatedContentCount / distinctContentCount) * 85 +
    boilerplateHits.length * 14 +
    duplicatedTasks.length * 20;
  const originalityScore = Math.max(0, Math.min(100, Math.round(100 - repetitionPenalty)));

  const repetitionEvidence = Array.from(
    new Set([...highOverlapPairs, ...boilerplateHits, ...duplicatedTasks])
  );

  if (duplicatedLessons.size >= 2 || boilerplateHits.length >= 2 || duplicatedTasks.length > 0) {
    criticalIssues.push(
      `Significant content repetition or generic template boilerplate detected (${repetitionEvidence[0] || 'duplicated modules/lessons'}).`
    );
  } else {
    if (duplicatedLessons.size > 0 || highOverlapPairs.length > 0) {
      warnings.push(`${duplicatedLessons.size || highOverlapPairs.length} lesson pair(s) share high text overlap.`);
    }
    if (duplicatedScenarios.size > 0) {
      warnings.push(`${duplicatedScenarios.size} workplace scenario(s) substantially overlap with another scenario.`);
    }
    if (boilerplateHits.length > 0) {
      warnings.push(boilerplateHits[0]);
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
  if (lessonEntries.length > 0 && lessonDepthScore < 100) {
    warnings.push('Some lessons are brief (< 120 words) or lack specific workplace application.');
  }

  const repetitionStatus: 'PASS' | 'WARNING' | 'FAIL' =
    duplicatedLessons.size >= 2 || boilerplateHits.length >= 2 || duplicatedTasks.length > 0
      ? 'FAIL'
      : duplicatedLessons.size > 0 || duplicatedScenarios.size > 0 || boilerplateHits.length > 0 || lessonDepthScore < 100
        ? 'WARNING'
        : 'PASS';

  if (repetitionStatus === 'PASS') {
    passedChecks.push('All lessons, scenarios, and tasks are original with zero generic SOP boilerplate.');
  }

  qaChecks.push({
    id: 'repetition_boilerplate',
    label: 'Originality & Anti-Boilerplate',
    status: repetitionStatus,
    score: Math.round(originalityScore * 0.65 + lessonDepthScore * 0.35),
    summary:
      repetitionStatus === 'PASS'
        ? `Lessons, scenarios, and tasks are distinct and domain-specific (${originalityScore}% originality).`
        : 'Detected repetitive phrasing, duplicated tasks, thin lessons, or generic SOP boilerplate.',
    evidence:
      repetitionEvidence.length > 0
        ? repetitionEvidence.slice(0, 6)
        : [`${lessonEntries.length} lessons and ${scenarioEntries.length} scenarios checked with ${originalityScore}% originality.`]
  });

  // ===========================================================================
  // CHECK 4: PRACTICAL TASK EXECUTABILITY & RUBRICS
  // ===========================================================================
  let completedTaskSections = 0;
  let possibleTaskSections = 0;
  const taskEvidence: string[] = [];

  for (const module of course.modules) {
    if (!module.practicalTask) {
      taskEvidence.push(`Module ${module.moduleNumber} ("${module.title}") is missing a practical task.`);
      possibleTaskSections += PRACTICAL_TASK_SECTIONS.length + 1;
      continue;
    }
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

    possibleTaskSections += PRACTICAL_TASK_SECTIONS.length + 1;
    completedTaskSections += PRACTICAL_TASK_SECTIONS.length - missingSections.length + (rubricComplete ? 1 : 0);

    if (missingSections.length || !rubricComplete) {
      if (missingSections.length) {
        taskEvidence.push(
          `Module ${module.moduleNumber} task missing: ${missingSections.map(s => s.label).join(', ')}.`
        );
      }
      if (!rubricComplete) {
        taskEvidence.push(`Module ${module.moduleNumber} task rubric must total 100% across at least 2 weighted criteria.`);
      }
      taskRepairTargets.push({
        moduleId: module.id,
        moduleTitle: module.title,
        taskInstructions: instructions,
        taskDeliverable: task.deliverable,
        taskRubric: task.evaluationRubric,
        issues: [
          ...(missingSections.length
            ? [`Missing practical task sections: ${missingSections.map(s => s.label).join(', ')}.`]
            : []),
          ...(!rubricComplete ? ['Provide a weighted evaluation rubric totaling 100%.'] : [])
        ]
      });
    }
  }

  const taskScore = possibleTaskSections
    ? Math.round((completedTaskSections / possibleTaskSections) * 100)
    : 0;
  if (taskScore < 100) {
    warnings.push('One or more practical tasks are missing required learner sections or 100%-weighted rubric criteria.');
  } else if (possibleTaskSections > 0) {
    passedChecks.push('Practical tasks include Objective, Scenario, Resources, Numbered Steps, Deliverable, Success Criteria, Reflection, and 100% rubrics.');
  }

  qaChecks.push({
    id: 'practical_tasks',
    label: 'Practical Task Executability',
    status: taskScore === 100 ? 'PASS' : taskScore >= 60 ? 'WARNING' : 'FAIL',
    score: taskScore,
    summary:
      taskScore === 100
        ? 'All module practical tasks are executable with complete steps and 100%-weighted rubrics.'
        : 'Some practical tasks lack complete learner guidance or 100% weighted rubrics.',
    evidence:
      taskEvidence.length > 0
        ? taskEvidence.slice(0, 6)
        : [`Verified ${course.modules.length} module practical task(s) with complete 7-section instructions and rubrics.`]
  });

  // ===========================================================================
  // CHECK 5: ASSESSMENT & OBJECTIVE ALIGNMENT
  // ===========================================================================
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

  const referenceScore = questionEntries.length ? alignedQuestions / questionEntries.length : 0;
  const uniquenessScore = questionEntries.length
    ? (questionEntries.length - duplicateQuestionIds.size) / questionEntries.length
    : 0;
  const completenessScore = questionEntries.length ? completeQuestions / questionEntries.length : 0;
  const alignmentScore = Math.round(
    (referenceScore * 0.5 + uniquenessScore * 0.25 + completenessScore * 0.25) * 100
  );

  const assessmentEvidence: string[] = [];
  if (questionEntries.length === 0) {
    criticalIssues.push('No module knowledge-check or final assessment questions were generated.');
    assessmentEvidence.push('Missing knowledge checks and final exam questions.');
  } else {
    if (referenceScore < 1) {
      warnings.push(
        `${questionEntries.length - alignedQuestions} of ${questionEntries.length} assessment question(s) lack a matching course learningObjectiveRef.`
      );
      assessmentEvidence.push(`${alignedQuestions}/${questionEntries.length} questions linked to exact LO codes.`);
    }
    if (completenessScore < 1) {
      warnings.push('Some assessment questions are missing options, valid answer index, or rationale.');
      assessmentEvidence.push(`${completeQuestions}/${questionEntries.length} questions structurally complete.`);
    }
    if (duplicateQuestionIds.size > 0) {
      warnings.push(`${duplicateQuestionIds.size} duplicate assessment question(s) detected.`);
      assessmentEvidence.push(`${duplicateQuestionIds.size} duplicate question stem(s) found.`);
    }
  }

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
          ...(duplicateQuestionIds.has(entry.question.id)
            ? ['Replace this duplicate question with a distinct assessment item.']
            : []),
          ...(!isComplete
            ? ['Provide a complete question, answer options, a valid correct-answer index, and a rationale.']
            : [])
        ]
      });
    }
  }

  const assessmentStatus: 'PASS' | 'WARNING' | 'FAIL' =
    questionEntries.length === 0 ? 'FAIL' : alignmentScore >= 95 ? 'PASS' : 'WARNING';

  if (assessmentStatus === 'PASS') {
    passedChecks.push(
      `All ${questionEntries.length} knowledge check and final exam questions align to taught LO codes without duplicates.`
    );
  }

  qaChecks.push({
    id: 'assessment_alignment',
    label: 'Assessment & Objective Alignment',
    status: assessmentStatus,
    score: alignmentScore,
    summary:
      assessmentStatus === 'PASS'
        ? `All ${questionEntries.length} assessment items trace cleanly to module learning objectives.`
        : 'One or more assessment items have missing LO links, duplicates, or incomplete fields.',
    evidence:
      assessmentEvidence.length > 0
        ? assessmentEvidence
        : [`${alignedQuestions}/${questionEntries.length} questions matched LO codes; 0 duplicate stems.`]
  });

  // ===========================================================================
  // CHECK 6: SOUTH AFRICAN CONTEXT & SOURCE GROUNDING HONESTY
  // ===========================================================================
  const verifiedSourceCount = (sourceCourse.research?.sources || []).filter(
    source => source.status === 'Verified'
  ).length;
  const mentionsPopia = /popia|protection of personal information/i.test(fullCourseText);
  const popiaSourceVerified = (sourceCourse.research?.sources || []).some(
    src => src.status === 'Verified' && /popia|personal information/i.test(`${src.name} ${src.reference}`)
  );

  // Detect unsupported regulatory hallucinations (e.g. invented NQF IDs or random Act citations without verified sources)
  const groundingEvidence: string[] = [];
  let southAfricanContextVerified = false;
  let popiaCompliant = false;

  if (verifiedSourceCount > 0) {
    southAfricanContextVerified = subjectStatus !== 'FAIL';
    popiaCompliant = !mentionsPopia || popiaSourceVerified || Boolean(sourceCourse.ethics?.dataPrivacySafeguards?.trim());
    groundingEvidence.push(
      `${verifiedSourceCount} verified user source(s) supplied and linked in course metadata.`
    );
    passedChecks.push(`${verifiedSourceCount} verified source(s) incorporated into regulatory & technical grounding.`);
  } else {
    warnings.push(
      'No user-marked verified sources were supplied; regulatory, NQF, and factual claims require SME verification.'
    );
    groundingEvidence.push('0 verified sources attached in Section 02; claims flagged for SME confirmation.');
  }

  const groundingScore = verifiedSourceCount >= 2 ? 95 : verifiedSourceCount === 1 ? 80 : 60;
  const groundingStatus: 'PASS' | 'WARNING' | 'FAIL' =
    verifiedSourceCount >= 1 && subjectStatus !== 'FAIL' ? 'PASS' : 'WARNING';

  qaChecks.push({
    id: 'source_grounding',
    label: 'SA Context & Source Grounding',
    status: groundingStatus,
    score: groundingScore,
    summary:
      groundingStatus === 'PASS'
        ? 'South African context and compliance claims grounded in user-verified references.'
        : 'User-verified references missing; facilitator/SME verification required before formal sign-off.',
    evidence: groundingEvidence
  });

  // ===========================================================================
  // COMPOSITE SCORE & OVERALL VERDICT
  // ===========================================================================
  const weightedScore = Math.round(
    subjectAlignmentScore * 0.3 +
      structureScore * 0.15 +
      originalityScore * 0.2 +
      taskScore * 0.15 +
      alignmentScore * 0.1 +
      groundingScore * 0.1
  );

  const hasCheckFail = qaChecks.some(c => c.status === 'FAIL') || criticalIssues.length > 0;
  const hasCheckWarn = qaChecks.some(c => c.status === 'WARNING') || warnings.length > 0;

  const overallVerdict: 'PASS' | 'WARNING' | 'FAIL' = hasCheckFail
    ? 'FAIL'
    : hasCheckWarn
      ? 'WARNING'
      : 'PASS';

  const finalScore =
    overallVerdict === 'FAIL'
      ? Math.min(58, weightedScore)
      : overallVerdict === 'WARNING'
        ? Math.min(89, Math.max(60, weightedScore))
        : Math.max(88, Math.min(99, weightedScore));

  recommendations.push(
    'Verify domain accuracy, South African statutory references, and accreditation codes with an SME before learner rollout.'
  );
  if (overallVerdict === 'FAIL') {
    recommendations.unshift(
      'Resolve all FAIL-level issues (such as cross-domain bleed, structure mismatch, or repeated modules) using Edit or Regenerate before approving this course.'
    );
  } else if (overallVerdict === 'WARNING') {
    recommendations.unshift(
      'Review highlighted warnings in the Quality Scorecard cards before signing off for deployment.'
    );
  }

  const selectedRepairTargets = [
    ...repairTargets.slice(0, 2),
    ...taskRepairTargets.slice(0, 2),
    ...questionRepairTargets.slice(0, 1)
  ].slice(0, 5);

  return {
    qa: {
      score: finalScore,
      status: overallVerdict === 'FAIL' ? 'critical_issues' : 'review_required',
      overallVerdict,
      hasBlockingFailures: hasCheckFail,
      subjectAlignmentScore,
      repetitionScore: originalityScore,
      qaChecks,
      passedChecks,
      warnings,
      criticalIssues,
      recommendations,
      southAfricanContextVerified,
      popiaCompliant
    },
    repairTargets: selectedRepairTargets
  };
}

/**
 * Optional semantic alignment & educational audit via LLM (or mocked executor in tests).
 */
export async function auditCourseSemanticAlignmentWithAI(
  course: GeneratedCourse,
  sourceCourse: Course,
  provider: AIProvider,
  model: string,
  aiExecute: (req: AIRequest) => Promise<AIResponse>
): Promise<{
  aligned: boolean;
  subjectAlignmentScore: number;
  issues: string[];
  warnings: string[];
}> {
  const sampleSummary = {
    configuredTitle: sourceCourse.structure?.title || sourceCourse.name,
    configuredDomain: sourceCourse.structure?.industryDomain,
    generatedTitle: course.title,
    overview: course.overview.slice(0, 400),
    modules: course.modules.map(m => ({
      title: m.title,
      lessons: m.lessons.map(l => ({ title: l.title, concepts: l.concepts, excerpt: l.contentBody.slice(0, 220) })),
      taskTitle: m.practicalTask?.title,
      firstScenario: m.scenarios[0]?.situation?.slice(0, 180)
    }))
  };

  const res = await aiExecute({
    provider,
    model,
    systemInstruction:
      'You are a strict curriculum quality auditor. Check if the generated course stays strictly on-subject without cross-domain contamination or generic boilerplate. Return ONLY JSON: { "aligned": boolean, "subjectAlignmentScore": 0-100, "issues": string[], "warnings": string[] }.',
    prompt: `Audit this generated course against its configured subject:\n${JSON.stringify(sampleSummary)}`,
    responseFormat: 'json',
    temperature: 0.1,
    maxTokens: 800,
    timeoutMs: 25000
  });

  const parsed = extractAndParseJSON(res.text);
  return {
    aligned: Boolean(parsed?.aligned),
    subjectAlignmentScore:
      typeof parsed?.subjectAlignmentScore === 'number' ? parsed.subjectAlignmentScore : 0,
    issues: Array.isArray(parsed?.issues) ? parsed.issues.map(String) : [],
    warnings: Array.isArray(parsed?.warnings) ? parsed.warnings.map(String) : []
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

  if (cleaned.startsWith('```')) {
    const firstLineEnd = cleaned.indexOf('\n');
    const lastFence = cleaned.lastIndexOf('```');
    if (firstLineEnd !== -1 && lastFence > firstLineEnd) {
      cleaned = cleaned.substring(firstLineEnd + 1, lastFence).trim();
    }
  }

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (err: any) {
    // Attempt minor trailing-comma cleanup before failing
    const noTrailingCommas = cleaned.replace(/,\s*([}\]])/g, '$1');
    try {
      return JSON.parse(noTrailingCommas);
    } catch {
      throw new Error(`Failed to parse AI JSON response: ${err.message}. Raw preview: ${cleaned.slice(0, 150)}...`);
    }
  }
}

/**
 * Validates and repairs a parsed course object against the GeneratedCourse schema.
 */
export function validateAndSanitizeGeneratedCourse(
  raw: any,
  sourceCourse: Course,
  metadata: GenerationMetadata,
  blueprint?: CurriculumBlueprint
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
    : (s.scopeSummary || s.purposeStatement || `Structured workplace training programme for ${title}.`);

  const purpose = typeof raw.purpose === 'string' && raw.purpose.trim().length > 0
    ? raw.purpose.trim()
    : (s.purposeStatement || `Equip learners with practical, verifiable capability in ${title}.`);

  const targetAudience = typeof raw.targetAudience === 'string' && raw.targetAudience.trim().length > 0
    ? raw.targetAudience.trim()
    : (s.targetRoles || p.targetGroup || '');

  const estimatedDuration = typeof raw.estimatedDuration === 'string' && raw.estimatedDuration.trim().length > 0
    ? raw.estimatedDuration.trim()
    : (s.estimatedDuration || '4 - 6 Hours (Self-paced + Practical Tasks)');

  let learningOutcomes: string[] = [];
  if (Array.isArray(raw.learningOutcomes) && raw.learningOutcomes.length > 0) {
    learningOutcomes = raw.learningOutcomes.map((lo: any) => String(lo).trim()).filter(Boolean);
  }

  if (!Array.isArray(raw.modules) || raw.modules.length === 0) {
    errors.push('Course must contain at least one module.');
  }

  const rawModules = Array.isArray(raw.modules) ? raw.modules : [];
  const sanitizedModules: GeneratedModule[] = [];

  rawModules.forEach((m: any, mIdx: number) => {
    const modNumber = typeof m.moduleNumber === 'number' ? m.moduleNumber : mIdx + 1;
    const modTitle = typeof m.title === 'string' && m.title.trim().length > 0
      ? m.title.trim()
      : ((sourceCourse.modules || [])[mIdx]?.title || `Module ${modNumber}`);

    const lessons: GeneratedLesson[] = [];
    if (Array.isArray(m.lessons)) {
      m.lessons.forEach((l: any, lIdx: number) => {
        lessons.push({
          id: l.id || `lesson-${modNumber}-${lIdx + 1}`,
          title: typeof l.title === 'string' && l.title.trim().length > 0
            ? l.title.trim()
            : `Lesson ${modNumber}.${lIdx + 1}`,
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
      instructions:
        rawAssessments.preCourseDiagnostic?.instructions ||
        'Complete these baseline questions to assess starting familiarity with course concepts.',
      questions: preCourseQuestions
    },
    moduleKnowledgeChecksCount: sanitizedModules.reduce((acc, m) => acc + m.knowledgeChecks.length, 0),
    practicalTasks: sanitizedModules.map(m => m.practicalTask!).filter(Boolean),
    finalAssessment: {
      title: rawAssessments.finalAssessment?.title || 'Summative Capstone Assessment',
      passMark: rawAssessments.finalAssessment?.passMark || '80%',
      instructions:
        rawAssessments.finalAssessment?.instructions ||
        'Demonstrate comprehensive mastery across all modules through scenario-based evaluation.',
      questions: finalQuestions,
      capstoneCaseStudy: rawAssessments.finalAssessment?.capstoneCaseStudy
    },
    postCourseReflection: {
      prompts: [
        `What was the most impactful concept or technique you acquired in ${title}?`,
        'Which verification check or decision criterion will you apply immediately in your work?',
        'What 30-60-90 day action commitments will you set for ongoing application?'
      ],
      actionPlanTemplate: `30-60-90 Day Implementation Plan for ${title}`
    }
  };

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

  const qa: GeneratedCourseQA = {
    score: 0,
    status: 'review_required',
    overallVerdict: 'WARNING',
    hasBlockingFailures: false,
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
    generationMetadata: metadata,
    blueprintSummary: blueprint
      ? {
          subject: blueprint.subjectTitle,
          domain: blueprint.domainLabel,
          moduleCount: blueprint.modules.length,
          lessonCount: blueprint.modules.reduce((acc, m) => acc + m.lessonPlans.length, 0),
          coreConcepts: blueprint.requiredDomainConcepts.slice(0, 8),
          alignmentVerified: blueprint.alignmentChecksPassed
        }
      : undefined
  };

  const finalCourse = enforceComprehensiveCourseVolume(baseCourse, sourceCourse);
  finalCourse.qa = reviewGeneratedCourseQuality(finalCourse, sourceCourse, blueprint).qa;

  return {
    success: errors.length === 0,
    course: finalCourse,
    errors
  };
}
