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
  { label: 'Instructions', pattern: /instructions?\s*:/i },
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

const GENERIC_SOP_TASK_PHRASES: RegExp[] = [
  /standard operating procedure/i,
  /\bsop checklist\b/i,
  /verification checklist/i,
  /supervisory sign-off/i,
  /document corrective actions?/i,
  /identify (?:at least two )?(?:workflow|process) failures?/i
];

const FALLBACK_DOMINANCE_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: 'generic input/assumption fallback prose', pattern: /examine how inputs,\s*structural assumptions,\s*and domain constraints interact/i },
  { label: 'generic target-outcome fallback step', pattern: /define target outcomes,\s*constraints,\s*and key terminology/i },
  { label: 'generic fallback framing template', pattern: /frame constraints first|construct\s*&\s*test iteratively|frame the problem goals,\s*constraints,\s*and key terminology/i },
  { label: 'generic concept-behaviour filler', pattern: /understanding\s+\*?why\*?\s+a concept behaves the way it does under real constraints/i },
  { label: 'generic mastery MCQ stem', pattern: /which practice best demonstrates mastery of/i },
  { label: 'generic competence MCQ stem', pattern: /what distinguishes deep competence in .* from superficial familiarity/i },
  { label: 'generic fallback MCQ distractor', pattern: /prioritising speed over conceptual accuracy|relying on memorised buzzwords|applying the structured principles of .* with clear success criteria/i },
  { label: 'generic volume-expansion fallback prose', pattern: /apply domain-appropriate methods|grounded execution of .* rather than generic checklists|comparing two concrete approaches for .* against explicit criteria/i },
  { label: 'offline fallback mode marker', pattern: /drafted in offline local-fallback mode/i }
];

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'onto', 'your', 'their',
  'these', 'those', 'about', 'under', 'over', 'when', 'where', 'what', 'which', 'while',
  'before', 'after', 'must', 'should', 'could', 'would', 'will', 'shall', 'have', 'has',
  'had', 'are', 'was', 'were', 'been', 'being', 'can', 'not', 'only', 'also', 'more',
  'most', 'such', 'than', 'then', 'they', 'them', 'each', 'both', 'some', 'many', 'very',
  'just', 'even', 'within', 'across', 'between', 'through', 'without', 'against', 'during',
  'including', 'using', 'based', 'ensure', 'module', 'lesson', 'course', 'learners',
  'learner', 'practitioner', 'practitioners', 'teams', 'team', 'workplace', 'south', 'africa',
  'african', 'apply', 'explain', 'understand', 'evaluate', 'example', 'section', 'part'
]);

const SYNONYM_FOLD: Record<string, string> = {
  optimise: 'optim',
  optimize: 'optim',
  optimisation: 'optim',
  optimization: 'optim',
  verify: 'verif',
  validate: 'verif',
  validation: 'verif',
  check: 'verif',
  enterprise: 'org',
  organisation: 'org',
  organization: 'org',
  organisational: 'org',
  company: 'org',
  worker: 'staff',
  employee: 'staff',
  employees: 'staff',
  staff: 'staff',
  execute: 'run',
  implement: 'run',
  deploy: 'run',
  risk: 'risk',
  hazard: 'risk',
  failure: 'fail',
  defect: 'fail',
  error: 'fail',
  guideline: 'rule',
  policy: 'rule',
  procedure: 'proc',
  protocol: 'proc',
  workflow: 'flow',
  process: 'flow',
  review: 'audit',
  inspect: 'audit'
};

function stemToken(raw: string): string {
  const lower = raw.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!lower) return '';
  if (SYNONYM_FOLD[lower]) return SYNONYM_FOLD[lower];
  return lower
    .replace(/(isation|ization|ations|ation|ments|ment|ities|ity|ness|ing|ers|ies|ed|es|s)$/i, '')
    .slice(0, 10);
}

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

/**
 * Computes normalized semantic/paraphrase similarity while excluding legitimate
 * shared core domain nouns (e.g., "cloud", "terraform", "llm", "recruitment")
 * so teaching the same core subject across lessons is not falsely flagged.
 */
function semanticTokenSignature(text: string, domainStopStems: Set<string>): {
  stems: Set<string>;
  bigrams: Set<string>;
} {
  const tokens = ((text || '').toLowerCase().match(/[a-z][a-z0-9']{2,}/g) || [])
    .filter(w => !STOP_WORDS.has(w))
    .map(stemToken)
    .filter(st => st.length >= 3 && !domainStopStems.has(st));

  const stems = new Set(tokens);
  const bigrams = new Set<string>();
  for (let i = 0; i < tokens.length - 1; i++) {
    bigrams.add(`${tokens[i]}_${tokens[i + 1]}`);
  }
  return { stems, bigrams };
}

function semanticSimilarity(
  left: string,
  right: string,
  domainStopStems: Set<string>
): number {
  const sigA = semanticTokenSignature(left, domainStopStems);
  const sigB = semanticTokenSignature(right, domainStopStems);
  if (sigA.stems.size < 8 || sigB.stems.size < 8) return 0;

  let sharedStems = 0;
  for (const s of sigA.stems) {
    if (sigB.stems.has(s)) sharedStems++;
  }
  const stemOverlap = sharedStems / Math.min(sigA.stems.size, sigB.stems.size);

  let sharedBigrams = 0;
  for (const bg of sigA.bigrams) {
    if (sigB.bigrams.has(bg)) sharedBigrams++;
  }
  const minBg = Math.min(sigA.bigrams.size, sigB.bigrams.size);
  const bigramOverlap = minBg >= 4 ? sharedBigrams / minBg : stemOverlap;

  return stemOverlap * 0.55 + bigramOverlap * 0.45;
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

  // Build core domain vocabulary stems so legitimate domain-noun recurrence is not flagged as paraphrase repetition
  const domainStopStems = new Set<string>();
  const seedVocabText = [
    blueprint.subjectTitle,
    blueprint.domainLabel,
    ...blueprint.requiredDomainConcepts,
    ...course.modules.map(m => m.title)
  ].join(' ');
  for (const w of seedVocabText.toLowerCase().match(/[a-z][a-z0-9]{2,}/g) || []) {
    if (!STOP_WORDS.has(w)) {
      const st = stemToken(w);
      if (st.length >= 3) domainStopStems.add(st);
    }
  }

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

  // ===========================================================================
  // 1. SUBJECT ALIGNMENT (INCLUDING CROSS-DOMAIN BLEED DETECTION)
  // ===========================================================================
  const subjectAffected: string[] = [];
  const bleedFindings: string[] = [];
  const unalignedModules: string[] = [];

  const overallBleed = detectCrossDomainBleed(fullCourseText, blueprint.outOfScopeDomains);
  if (overallBleed.length > 0) {
    for (const hit of overallBleed) {
      const msg = `Cross-domain bleed from "${hit.domain}" detected (off-topic terms: ${hit.matchedTerms.slice(0, 6).join(', ')}).`;
      bleedFindings.push(msg);
      subjectAffected.push(`${hit.domain}: ${hit.matchedTerms.slice(0, 4).join(', ')}`);
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
      const msg = `Module ${mod.moduleNumber} ("${mod.title}") contains off-topic ${modBleed.map(b => b.domain).join(', ')} terms: ${modBleed
        .flatMap(b => b.matchedTerms)
        .slice(0, 5)
        .join(', ')}.`;
      unalignedModules.push(msg);
      subjectAffected.push(`Module ${mod.moduleNumber}: ${mod.title}`);
    }
    const modWords = (mod.title || '')
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3 && !STOP_WORDS.has(w));
    const titleKeywordsMatched = [...modWords, ...requiredConcepts.slice(0, 6)].filter(k =>
      modText.toLowerCase().includes(k)
    );
    if (modText.trim().length > 0 && titleKeywordsMatched.length === 0) {
      unalignedModules.push(`Module ${mod.moduleNumber} ("${mod.title}") shows minimal subject-concept alignment.`);
      subjectAffected.push(`Module ${mod.moduleNumber}: ${mod.title}`);
    }
  }

  for (const um of unalignedModules) {
    if (!criticalIssues.includes(um)) criticalIssues.push(um);
  }

  const titleLower = (course.title || '').toLowerCase();
  const expectedTitleLower = (blueprint.subjectTitle || '').toLowerCase();
  const expectedTitleWords = expectedTitleLower
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOP_WORDS.has(w));
  const titleMatchCount = expectedTitleWords.filter(w => titleLower.includes(w)).length;
  const titleAligned =
    expectedTitleWords.length === 0 ||
    titleMatchCount >= Math.max(1, Math.ceil(expectedTitleWords.length * 0.5));
  if (!titleAligned) {
    criticalIssues.push(
      `Generated course title ("${course.title}") drifted away from configured subject ("${blueprint.subjectTitle}").`
    );
    subjectAffected.push(`Course Title: ${course.title}`);
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
    passedChecks.push(
      `Subject alignment verified for "${blueprint.subjectTitle}" (${subjectAlignmentScore}% alignment, zero cross-domain bleed).`
    );
  } else if (subjectStatus === 'WARNING') {
    warnings.push(
      `Subject alignment score is ${subjectAlignmentScore}%; verify terminology depth for "${blueprint.subjectTitle}".`
    );
  }

  qaChecks.push({
    id: 'subject_alignment',
    label: '1. Subject Alignment',
    category: 'Subject & Curriculum',
    status: subjectStatus,
    score: subjectAlignmentScore,
    summary:
      subjectStatus === 'PASS'
        ? `Strong alignment with "${blueprint.subjectTitle}" (${blueprint.domainLabel}) and zero off-topic bleed.`
        : `Detected subject drift or cross-domain bleed impacting "${blueprint.subjectTitle}".`,
    evidence:
      subjectStatus === 'PASS'
        ? [`Course title, overview, modules, and assessments consistently teach "${blueprint.subjectTitle}".`]
        : [...bleedFindings, ...unalignedModules].slice(0, 6),
    affectedItems: Array.from(new Set(subjectAffected)),
    recommendations:
      subjectStatus === 'PASS'
        ? []
        : [`Remove off-topic terminology and regenerate affected modules cleanly around "${blueprint.subjectTitle}".`]
  });

  // ===========================================================================
  // 2. LEARNING OBJECTIVE ALIGNMENT & LESSON COVERAGE
  // ===========================================================================
  const loAffected: string[] = [];
  const loEvidence: string[] = [];
  let modulesWithValidLOs = 0;
  let totalCheckedLOs = 0;
  let coveredLOsCount = 0;
  let uncoveredLOCount = 0;

  for (const mod of course.modules) {
    const validModLOs = (mod.learningObjectives || []).filter(
      lo => Boolean(lo.code?.trim() && lo.statement?.trim().length >= 12)
    );
    if (validModLOs.length >= 2) {
      modulesWithValidLOs++;
    } else {
      loAffected.push(`Module ${mod.moduleNumber}: ${mod.title}`);
      loEvidence.push(`Module ${mod.moduleNumber} has fewer than 2 complete learning objectives.`);
    }

    const modLessonBlob = (mod.lessons || [])
      .map(l => `${l.title} ${(l.concepts || []).join(' ')} ${l.contentBody} ${l.workplaceApplication}`)
      .join(' ')
      .toLowerCase();
    const modLessonStems = new Set(
      (modLessonBlob.match(/[a-z][a-z0-9]{2,}/g) || [])
        .filter(w => !STOP_WORDS.has(w))
        .map(stemToken)
        .filter(st => st.length >= 3)
    );

    for (const lo of validModLOs) {
      totalCheckedLOs++;
      const loTokens = (lo.statement.toLowerCase().match(/[a-z][a-z0-9]{2,}/g) || [])
        .filter(w => !STOP_WORDS.has(w) && !domainStopStems.has(stemToken(w)))
        .map(stemToken)
        .filter(st => st.length >= 3);
      const fallbackTokens = (lo.statement.toLowerCase().match(/[a-z][a-z0-9]{2,}/g) || [])
        .filter(w => !STOP_WORDS.has(w))
        .map(stemToken)
        .filter(st => st.length >= 3);
      const checkTokens = loTokens.length >= 2 ? Array.from(new Set(loTokens)) : Array.from(new Set(fallbackTokens));

      const matched = checkTokens.filter(st => modLessonStems.has(st));
      const coverageRatio = checkTokens.length > 0 ? matched.length / checkTokens.length : 1;
      const covered = checkTokens.length === 0 || (matched.length >= 2 || coverageRatio >= 0.45);
      if (covered) {
        coveredLOsCount++;
      } else {
        uncoveredLOCount++;
        loAffected.push(`M${mod.moduleNumber} (${lo.code}): ${mod.title}`);
        loEvidence.push(
          `Module ${mod.moduleNumber} objective ${lo.code} ("${lo.statement.slice(0, 70)}...") is not substantively covered inside module lessons.`
        );
      }
    }
  }

  const courseOutcomesPresent = (course.learningOutcomes || []).filter(o => o.trim().length >= 12).length >= 3;
  if (!courseOutcomesPresent) {
    loAffected.push('Programme-Level Learning Outcomes');
    loEvidence.push('Fewer than 3 substantive programme-level learningOutcomes returned.');
  }

  const loStructurePts = course.modules.length
    ? (modulesWithValidLOs / course.modules.length) * 45
    : 0;
  const loLessonCoveragePts = totalCheckedLOs > 0 ? (coveredLOsCount / totalCheckedLOs) * 40 : 40;
  const loScore = course.modules.length
    ? Math.round(loStructurePts + loLessonCoveragePts + (courseOutcomesPresent ? 15 : 0))
    : 0;
  const loStatus: 'PASS' | 'WARNING' | 'FAIL' =
    loScore < 65 || uncoveredLOCount >= 2 || !courseOutcomesPresent && course.modules.length === 0
      ? 'FAIL'
      : loScore >= 90 && uncoveredLOCount === 0
        ? 'PASS'
        : 'WARNING';

  if (loStatus === 'PASS') {
    passedChecks.push('Learning objectives defined cleanly and covered inside module lessons across the course.');
  } else if (loStatus === 'WARNING') {
    warnings.push('Some module learning objectives lack full coverage in lesson content or programme outcomes.');
  } else {
    criticalIssues.push(
      uncoveredLOCount >= 2
        ? `${uncoveredLOCount} module learning objectives are not meaningfully taught in their module lesson bodies.`
        : 'Course is missing structured module/programme learning objectives.'
    );
  }

  qaChecks.push({
    id: 'learning_objectives',
    label: '2. Learning Objective Alignment',
    category: 'Subject & Curriculum',
    status: loStatus,
    score: loScore,
    summary:
      loStatus === 'PASS'
        ? `All ${course.modules.length} modules define structured learning objectives substantively taught in their lessons.`
        : 'One or more module learning objectives are missing or not covered in lesson content.',
    evidence:
      loEvidence.length > 0
        ? Array.from(new Set(loEvidence)).slice(0, 6)
        : [`Verified ${course.learningOutcomes.length} programme outcomes and ${coveredLOsCount}/${totalCheckedLOs} lesson-covered LOs across ${course.modules.length} modules.`],
    affectedItems: Array.from(new Set(loAffected)),
    recommendations:
      loStatus === 'PASS'
        ? []
        : ['Ensure every module defines 2–4 measurable Bloom-level learning objectives and explicitly teaches each objective inside its lessons.']
  });

  // ===========================================================================
  // 3. EDUCATIONAL DEPTH (CONCEPTS, MECHANISMS, TERMINOLOGY, EXAMPLES, LIMITATIONS)
  // ===========================================================================
  const depthAffected: string[] = [];
  const depthEvidence: string[] = [];
  let depthPoints = 0;
  const maxDepthPoints = Math.max(1, lessonEntries.length * 4);

  for (const { module, lesson } of lessonEntries) {
    const body = lesson.contentBody || '';
    const words = countWordsInText(body);
    const hasDepthLength = words >= 130;
    const hasConceptsAndTerms = (lesson.concepts?.length || 0) >= 2;
    const hasExampleOrCase = /example|case|walkthrough|illustration|scenario|suppose|consider|when\s+[a-z]+\s+runs/i.test(body);
    const hasMechanismOrLimitation =
      /because|works\s+by|mechanism|how\s+it|limitation|misconception|pitfall|trade-off|edge\s+case|fail|risk|constraint/i.test(body);

    let lessonPts = 0;
    const lessonIssues: string[] = [];
    if (hasDepthLength) lessonPts++;
    else lessonIssues.push(`Lesson too brief (${words} words; target >= 140 words for substantial explanation).`);
    if (hasConceptsAndTerms) lessonPts++;
    else lessonIssues.push('Identify at least two explicit domain concepts/terms in lesson concepts.');
    if (hasExampleOrCase) lessonPts++;
    else lessonIssues.push('Add a concrete subject-specific worked example illustrating how the concept applies.');
    if (hasMechanismOrLimitation) lessonPts++;
    else lessonIssues.push('Explain the underlying mechanism and key limitations, edge cases, or misconceptions.');

    depthPoints += lessonPts;
    if (lessonPts < 3) {
      depthAffected.push(`M${module.moduleNumber}: ${lesson.title}`);
      depthEvidence.push(`Module ${module.moduleNumber} "${lesson.title}": ${lessonIssues[0]}`);
      contentTargets.set(lesson.id, {
        moduleId: module.id,
        moduleTitle: module.title,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        contentBody: lesson.contentBody,
        workplaceApplication: lesson.workplaceApplication,
        aiApplication: lesson.aiApplication,
        concepts: lesson.concepts,
        issues: lessonIssues
      });
    }
  }

  const depthScore = lessonEntries.length ? Math.round((depthPoints / maxDepthPoints) * 100) : 0;
  const depthStatus: 'PASS' | 'WARNING' | 'FAIL' =
    lessonEntries.length === 0 || depthScore < 55 ? 'FAIL' : depthScore < 80 ? 'WARNING' : 'PASS';

  if (depthStatus === 'PASS') {
    passedChecks.push(`Educational depth verified across ${lessonEntries.length} lessons (mechanisms, examples & misconceptions covered).`);
  } else if (depthStatus === 'WARNING') {
    warnings.push('Some lessons would benefit from deeper mechanism explanations, worked examples, or misconception notes.');
  } else {
    criticalIssues.push('Lessons are too thin or superficial to teach the subject meaningfully.');
  }

  qaChecks.push({
    id: 'educational_depth',
    label: '3. Educational Depth',
    category: 'Pedagogy & Depth',
    status: depthStatus,
    score: depthScore,
    summary:
      depthStatus === 'PASS'
        ? `Lessons teach concepts with depth, concrete examples, terminology, and edge-case limitations (${depthScore}%).`
        : 'One or more lessons are overly brief or omit worked examples, mechanisms, or limitations.',
    evidence:
      depthEvidence.length > 0
        ? depthEvidence.slice(0, 6)
        : [`All ${lessonEntries.length} lessons explain mechanisms, terminology, worked examples, and trade-offs.`],
    affectedItems: depthAffected,
    recommendations:
      depthStatus === 'PASS'
        ? []
        : ['Expand flagged lessons to explain how/why the concept works, include a worked example, and address misconceptions.']
  });

  // ===========================================================================
  // 4. TECHNICAL & CONCEPTUAL ACCURACY
  // ===========================================================================
  const techAffected: string[] = [];
  const techEvidence: string[] = [];
  const domainKeywordsLower = blueprint.requiredDomainConcepts.map(c => c.toLowerCase());
  let accurateModules = 0;

  for (const mod of course.modules) {
    const modTextLower = extractModuleText(mod).toLowerCase();
    const modBleed = detectCrossDomainBleed(modTextLower, blueprint.outOfScopeDomains);
    const domainTermMatches = domainKeywordsLower.filter(kw => modTextLower.includes(kw));
    const hasPlaceholderGarbage = /\bundefined\b|\bnull\b|\[insert\s|\[todo/i.test(modTextLower);

    if (modBleed.length > 0 || hasPlaceholderGarbage || (domainKeywordsLower.length > 0 && domainTermMatches.length === 0)) {
      techAffected.push(`Module ${mod.moduleNumber}: ${mod.title}`);
      if (modBleed.length > 0) {
        techEvidence.push(`Module ${mod.moduleNumber} mixes incompatible terminology (${modBleed[0].matchedTerms.slice(0, 3).join(', ')}).`);
      } else if (hasPlaceholderGarbage) {
        techEvidence.push(`Module ${mod.moduleNumber} contains unfinished placeholder/null text.`);
      } else {
        techEvidence.push(`Module ${mod.moduleNumber} lacks authentic ${blueprint.domainLabel} terminology.`);
      }
    } else {
      accurateModules++;
    }
  }

  const techScore = course.modules.length ? Math.round((accurateModules / course.modules.length) * 100) : 0;
  const techStatus: 'PASS' | 'WARNING' | 'FAIL' =
    overallBleed.length > 0 || techScore < 60 ? 'FAIL' : techScore < 90 ? 'WARNING' : 'PASS';

  if (techStatus === 'PASS') {
    passedChecks.push('Domain terminology and conceptual framing are technically coherent across all modules.');
  } else if (techStatus === 'WARNING') {
    warnings.push('Verify technical terminology accuracy in flagged modules.');
  }

  qaChecks.push({
    id: 'technical_accuracy',
    label: '4. Technical & Conceptual Accuracy',
    category: 'Pedagogy & Depth',
    status: techStatus,
    score: techScore,
    summary:
      techStatus === 'PASS'
        ? `Terminology, explanations, and applied advice match ${blueprint.domainLabel} accurately.`
        : 'Detected missing domain terminology, unfinished tokens, or technically incompatible concepts.',
    evidence:
      techEvidence.length > 0
        ? techEvidence.slice(0, 6)
        : [`Matched authentic ${blueprint.domainLabel} terminology consistently across all ${course.modules.length} modules.`],
    affectedItems: techAffected,
    recommendations:
      techStatus === 'PASS'
        ? []
        : ['Have a domain SME verify technical definitions and replace generic/off-topic vocabulary with accurate domain terms.']
  });

  // ===========================================================================
  // 5. LESSON TITLE & CONTENT ALIGNMENT
  // ===========================================================================
  const lessonRelAffected: string[] = [];
  const lessonRelEvidence: string[] = [];
  let alignedLessonCount = 0;
  let fallbackLessonCount = 0;
  let zeroMatchLessons = 0;

  for (const { module, lesson } of lessonEntries) {
    const titleWords = (lesson.title || '')
      .toLowerCase()
      .match(/[a-z0-9]{3,}/g)
      ?.filter(w => !STOP_WORDS.has(w) && !/^(module|lesson|part|core|foundations|applied|concepts|practice|mechanisms|edge|cases)$/.test(w)) || [];
    const lessonCombined = `${lesson.contentBody} ${lesson.workplaceApplication}`;
    const lessonText = `${lesson.concepts.join(' ')} ${lessonCombined}`.toLowerCase();
    const stemBodySet = new Set((lessonText.match(/[a-z0-9]{3,}/g) || []).map(stemToken));

    const hitsFallbackProse = FALLBACK_DOMINANCE_PATTERNS.some(fp => fp.pattern.test(lessonCombined));
    if (hitsFallbackProse) fallbackLessonCount++;

    const matchedTitleTokens = titleWords.filter(tw => {
      const st = stemToken(tw);
      return lessonText.includes(tw) || (st.length >= 3 && stemBodySet.has(st));
    });

    if (titleWords.length >= 2 && matchedTitleTokens.length === 0) {
      zeroMatchLessons++;
    }

    const ratio = titleWords.length > 0 ? matchedTitleTokens.length / titleWords.length : 1;
    const isRelevant = (titleWords.length === 0 || (matchedTitleTokens.length >= 1 && ratio >= 0.4)) && !hitsFallbackProse;

    if (isRelevant && countWordsInText(lesson.workplaceApplication) >= 6) {
      alignedLessonCount++;
    } else {
      lessonRelAffected.push(`M${module.moduleNumber}: ${lesson.title}`);
      lessonRelEvidence.push(
        hitsFallbackProse
          ? `Module ${module.moduleNumber} "${lesson.title}" relies on generic fallback template text instead of substantive subject teaching.`
          : `Module ${module.moduleNumber} "${lesson.title}" body barely develops its stated title concepts (${matchedTitleTokens.length}/${titleWords.length} title terms covered).`
      );
      const existing = contentTargets.get(lesson.id);
      const msg = `Ensure lesson body explicitly teaches "${lesson.title}" rather than unrelated or generic template material.`;
      if (existing) {
        existing.issues.push(msg);
      } else {
        contentTargets.set(lesson.id, {
          moduleId: module.id,
          moduleTitle: module.title,
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          contentBody: lesson.contentBody,
          workplaceApplication: lesson.workplaceApplication,
          aiApplication: lesson.aiApplication,
          concepts: lesson.concepts,
          issues: [msg]
        });
      }
    }
  }

  const lessonRelScore = lessonEntries.length
    ? Math.round((alignedLessonCount / lessonEntries.length) * 100)
    : 0;
  const lessonRelStatus: 'PASS' | 'WARNING' | 'FAIL' =
    lessonRelScore < 65 || fallbackLessonCount >= 1 || zeroMatchLessons >= 1 || (lessonEntries.length - alignedLessonCount) >= 2 && lessonRelScore < 75
      ? 'FAIL'
      : lessonRelScore >= 85 && fallbackLessonCount === 0 && zeroMatchLessons === 0
        ? 'PASS'
        : 'WARNING';

  if (lessonRelStatus === 'PASS') {
    passedChecks.push('Every lesson teaches content directly matched to its stated title and concept list.');
  } else if (lessonRelStatus === 'WARNING') {
    warnings.push('One or more lessons do not sufficiently develop the topic named in their lesson title.');
  } else {
    criticalIssues.push('One or more lessons fail to teach the topics stated in their own lesson titles or rely on generic template text.');
  }

  qaChecks.push({
    id: 'lesson_relevance',
    label: '5. Lesson Title & Content Alignment',
    category: 'Pedagogy & Depth',
    status: lessonRelStatus,
    score: lessonRelScore,
    summary:
      lessonRelStatus === 'PASS'
        ? `All ${lessonEntries.length} lessons teach substantive content matching their stated titles.`
        : 'Some lesson bodies drift away from or superficially mention their stated lesson titles.',
    evidence:
      lessonRelEvidence.length > 0
        ? lessonRelEvidence.slice(0, 6)
        : [`${alignedLessonCount}/${lessonEntries.length} lessons demonstrated strong title-to-content coherence.`],
    affectedItems: lessonRelAffected,
    recommendations:
      lessonRelStatus === 'PASS'
        ? []
        : ['Rewrite flagged lessons so their headings, examples, and definitions directly unpack the exact lesson title.']
  });

  // ===========================================================================
  // 6. PRACTICAL ACTIVITY QUALITY (10 ELEMENTS + ANTI-GENERIC AUDIT CHECKLIST)
  // ===========================================================================
  let completedTaskSections = 0;
  let possibleTaskSections = 0;
  let genericTaskOveruseCount = 0;
  const taskEvidence: string[] = [];
  const taskAffected: string[] = [];
  const isComplianceOrOpsCourse = /(audit|compliance|sop|governance|safety|quality assurance|operations management)/i.test(
    `${blueprint.subjectTitle} ${blueprint.domainLabel}`
  );

  for (const module of course.modules) {
    if (!module.practicalTask) {
      taskEvidence.push(`Module ${module.moduleNumber} ("${module.title}") is missing a practical task.`);
      taskAffected.push(`Module ${module.moduleNumber}: Missing task`);
      possibleTaskSections += PRACTICAL_TASK_SECTIONS.length + 2;
      continue;
    }
    const task = module.practicalTask;
    const instructions = task.instructions || '';
    const hasTitle = Boolean(task.title?.trim().length >= 5);
    const hasDeliverableText = Boolean(task.deliverable?.trim().length >= 6);
    const missingSections = PRACTICAL_TASK_SECTIONS.filter(section => !section.pattern.test(instructions));
    const weights = (task.evaluationRubric || [])
      .map(criterion => criterion.match(/(\d+(?:\.\d+)?)\s*%/))
      .filter((match): match is RegExpMatchArray => Boolean(match))
      .map(match => Number(match[1]));
    const rubricComplete =
      (task.evaluationRubric?.length || 0) >= 2 &&
      weights.length === (task.evaluationRubric?.length || 0) &&
      Math.abs(weights.reduce((total, weight) => total + weight, 0) - 100) <= 1;

    // Detect lazy generic SOP/audit/checklist template overuse OR generic fallback task copy
    const taskCombined = `${task.title} ${instructions} ${task.deliverable}`;
    const matchedGenericPhrases = GENERIC_SOP_TASK_PHRASES.filter(rx => rx.test(taskCombined));
    const matchedFallbackTaskPhrases = FALLBACK_DOMINANCE_PATTERNS.filter(fp => fp.pattern.test(taskCombined));
    const isGenericFallbackTask =
      matchedFallbackTaskPhrases.length > 0 ||
      /applied portfolio brief|applied solution\s*&\s*analysis brief/i.test(taskCombined);
    const isGenericAuditCopy = (!isComplianceOrOpsCourse && matchedGenericPhrases.length >= 2) || isGenericFallbackTask;
    if (isGenericAuditCopy) {
      genericTaskOveruseCount++;
      taskEvidence.push(
        isGenericFallbackTask
          ? `Module ${module.moduleNumber} practical task uses generic fallback step templates instead of authentic "${module.title}" hands-on work.`
          : `Module ${module.moduleNumber} practical task defaults to generic workflow-audit/SOP-checklist phrasing instead of authentic "${module.title}" practice.`
      );
      taskAffected.push(`Module ${module.moduleNumber}: Generic task template`);
    }

    possibleTaskSections += PRACTICAL_TASK_SECTIONS.length + 2;
    completedTaskSections +=
      (hasTitle ? 1 : 0) +
      (hasDeliverableText ? 0.5 : 0) +
      (rubricComplete ? 0.5 : 0) +
      (PRACTICAL_TASK_SECTIONS.length - missingSections.length);

    if (missingSections.length || !rubricComplete || !hasTitle || !hasDeliverableText || isGenericAuditCopy) {
      if (missingSections.length) {
        taskEvidence.push(
          `Module ${module.moduleNumber} task missing: ${missingSections.map(s => s.label).join(', ')}.`
        );
        taskAffected.push(`Module ${module.moduleNumber}: Missing task sections`);
      }
      if (!rubricComplete) {
        taskEvidence.push(`Module ${module.moduleNumber} task rubric must total 100% across >= 2 criteria.`);
        taskAffected.push(`Module ${module.moduleNumber}: Incomplete rubric`);
      }
      taskRepairTargets.push({
        moduleId: module.id,
        moduleTitle: module.title,
        taskInstructions: instructions,
        taskDeliverable: task.deliverable,
        taskRubric: task.evaluationRubric,
        issues: [
          ...(missingSections.length
            ? [`Include all practical task sections: ${missingSections.map(s => s.label).join(', ')}.`]
            : []),
          ...(!rubricComplete ? ['Provide a weighted evaluation rubric totaling 100%.'] : []),
          ...(isGenericAuditCopy
            ? [`Replace generic workflow-audit/SOP-checklist steps with an authentic "${module.title}" hands-on activity.`]
            : [])
        ]
      });
    }
  }

  const rawTaskScore = possibleTaskSections
    ? Math.round((completedTaskSections / possibleTaskSections) * 100)
    : 0;
  const taskScore = Math.max(0, rawTaskScore - genericTaskOveruseCount * 20);
  const taskStatus: 'PASS' | 'WARNING' | 'FAIL' =
    genericTaskOveruseCount >= 2 || taskScore < 60
      ? 'FAIL'
      : taskScore < 95 || genericTaskOveruseCount > 0
        ? 'WARNING'
        : 'PASS';

  if (taskStatus === 'PASS') {
    passedChecks.push('Practical tasks contain all 10 instructional elements, 100% rubrics, and subject-authentic activities.');
  } else if (taskStatus === 'WARNING') {
    warnings.push('One or more practical tasks lack full 10-element structure, 100% rubrics, or subject authenticity.');
  } else {
    criticalIssues.push('Practical tasks fail structure, rubric, or authentic subject activity checks.');
  }

  qaChecks.push({
    id: 'practical_application',
    label: '6. Practical Activity Quality',
    category: 'Assessments & Practice',
    status: taskStatus,
    score: taskScore,
    summary:
      taskStatus === 'PASS'
        ? `All ${course.modules.length} module practical tasks are complete (10 elements + 100% rubric) and tailored to the subject.`
        : 'Practical tasks require stronger structure, 100% rubrics, or subject-specific hands-on work instead of generic SOP checklists.',
    evidence:
      taskEvidence.length > 0
        ? taskEvidence.slice(0, 6)
        : [`Verified ${course.modules.length} subject-specific practical tasks with complete instructions, numbered steps, deliverables, criteria, reflection, and 100% rubrics.`],
    affectedItems: Array.from(new Set(taskAffected)),
    recommendations:
      taskStatus === 'PASS'
        ? []
        : ['Include Title, Objective, Scenario, Resources, Instructions, Steps, Deliverable, Success Criteria, 100% Rubric, and Reflection tailored directly to the module skill.']
  });

  // ===========================================================================
  // 7. ASSESSMENT ALIGNMENT (TAUGHT CONCEPTS + NO GENERIC POPIA/SOP FILLER)
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

  // Flag generic compliance/SOP trivia, fallback meta-MCQs, OR questions unrelated to module taught lessons
  const offLessonQuestions: string[] = [];
  for (const entry of questionEntries) {
    const qText = `${entry.question.question} ${entry.question.options.join(' ')} ${entry.question.rationale}`.toLowerCase();
    const isGenericComplianceMcq =
      /\bpopia\s+section\s+71\b|\bking\s+iv\s+principle\s+12\b|\bunsigned\b.*\bverification checklist\b|\bstandard operating procedures?\s*\(sops?\)/i.test(
        qText
      );
    const isGenericFallbackMcq = FALLBACK_DOMINANCE_PATTERNS.some(fp => fp.pattern.test(qText));

    const modLessonText = (entry.location === 'final'
      ? fullCourseText
      : entry.module?.lessons.map(l => `${l.title} ${l.concepts.join(' ')} ${l.contentBody} ${l.workplaceApplication}`).join(' ') || ''
    ).toLowerCase();

    if (isGenericComplianceMcq) {
      const taughtInLessons =
        /popia|king iv|section 71|standard operating procedure/i.test(modLessonText);
      if (!taughtInLessons) {
        offLessonQuestions.push(entry.question.id);
        continue;
      }
    }

    if (isGenericFallbackMcq) {
      offLessonQuestions.push(entry.question.id);
      continue;
    }

    // Concept-grounding check: ensure module knowledge check tests concepts actually present in the module's lessons
    if (entry.location === 'module' && entry.module && entry.module.lessons.length > 0) {
      const lessonStems = new Set(
        (modLessonText.match(/[a-z][a-z0-9]{2,}/g) || [])
          .filter(w => !STOP_WORDS.has(w))
          .map(stemToken)
          .filter(st => st.length >= 3)
      );
      const qTokens = (qText.match(/[a-z][a-z0-9]{2,}/g) || [])
        .filter(w => !STOP_WORDS.has(w) && !domainStopStems.has(stemToken(w)))
        .map(stemToken)
        .filter(st => st.length >= 3);
      const overlapCount = new Set(qTokens.filter(st => lessonStems.has(st))).size;
      if (qTokens.length >= 5 && overlapCount === 0) {
        offLessonQuestions.push(entry.question.id);
      }
    }
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
  const taughtConceptPurity = questionEntries.length
    ? (questionEntries.length - offLessonQuestions.length) / questionEntries.length
    : 0;

  const alignmentScore = Math.round(
    (referenceScore * 0.35 + uniquenessScore * 0.2 + completenessScore * 0.2 + taughtConceptPurity * 0.25) * 100
  );

  const assessmentEvidence: string[] = [];
  const assessmentAffected: string[] = [];
  if (questionEntries.length === 0) {
    criticalIssues.push('No module knowledge-check or final assessment questions were generated.');
    assessmentEvidence.push('Missing knowledge checks and final exam questions.');
    assessmentAffected.push('All Knowledge Checks & Final Exam');
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
    if (offLessonQuestions.length > 0) {
      warnings.push(
        `${offLessonQuestions.length} MCQ(s) use generic template stems or fail to test concepts taught in the corresponding module lessons.`
      );
      assessmentEvidence.push(
        `${offLessonQuestions.length} ungrounded/generic question(s) not tied to taught lesson concepts (${offLessonQuestions.slice(0, 4).join(', ')}).`
      );
      assessmentAffected.push(...offLessonQuestions);
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
    const isOffLesson = offLessonQuestions.includes(entry.question.id);
    if (!hasObjectiveRef || duplicateQuestionIds.has(entry.question.id) || !isComplete || isOffLesson) {
      assessmentAffected.push(entry.question.id);
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
            : []),
          ...(isOffLesson
            ? ['Replace generic or ungrounded question with a question directly assessing a taught module concept.']
            : [])
        ]
      });
    }
  }

  const assessmentStatus: 'PASS' | 'WARNING' | 'FAIL' =
    questionEntries.length === 0 || offLessonQuestions.length >= 2 || alignmentScore < 60
      ? 'FAIL'
      : alignmentScore >= 95 && offLessonQuestions.length === 0
        ? 'PASS'
        : 'WARNING';

  if (assessmentStatus === 'PASS') {
    passedChecks.push(
      `All ${questionEntries.length} knowledge check and final exam questions align to taught LO codes and lesson concepts without duplicates.`
    );
  } else if (assessmentStatus === 'FAIL' && offLessonQuestions.length >= 2) {
    criticalIssues.push(
      `Assessments rely on ${offLessonQuestions.length} generic template or ungrounded MCQs disconnected from taught lesson concepts.`
    );
  }

  qaChecks.push({
    id: 'assessment_alignment',
    label: '7. Assessment Alignment',
    category: 'Assessments & Practice',
    status: assessmentStatus,
    score: alignmentScore,
    summary:
      assessmentStatus === 'PASS'
        ? `All ${questionEntries.length} assessment items test taught lesson concepts and map cleanly to module LOs.`
        : 'Assessments show unlinked LO codes, duplicate stems, missing rationales, or generic off-lesson MCQs.',
    evidence:
      assessmentEvidence.length > 0
        ? assessmentEvidence
        : [`${alignedQuestions}/${questionEntries.length} questions matched LO codes; 0 duplicates; 0 generic off-lesson MCQs.`],
    affectedItems: Array.from(new Set(assessmentAffected)),
    recommendations:
      assessmentStatus === 'PASS'
        ? []
        : ['Rewrite flagged questions to test concepts and misconceptions explicitly taught in their module lessons.']
  });

  // ===========================================================================
  // 8. REPETITION CONTROL (EXACT SHINGLES + SEMANTIC PARAPHRASE + ANTI-BOILERPLATE)
  // ===========================================================================
  const boilerplateHits: string[] = [];
  const repetitionAffected: string[] = [];

  for (const { module, lesson } of lessonEntries) {
    const bpIssues: string[] = [];
    for (const bp of [...BOILERPLATE_PATTERNS, ...FALLBACK_DOMINANCE_PATTERNS]) {
      if (bp.pattern.test(`${lesson.contentBody} ${lesson.workplaceApplication}`)) {
        const hitMsg = `Module ${module.moduleNumber} "${lesson.title}" contains ${bp.label}.`;
        boilerplateHits.push(hitMsg);
        repetitionAffected.push(`M${module.moduleNumber}: ${lesson.title}`);
        bpIssues.push(`Remove generic ${bp.label}.`);
      }
    }
    if (bpIssues.length) {
      const existing = contentTargets.get(lesson.id);
      if (existing) existing.issues.push(...bpIssues);
      else {
        contentTargets.set(lesson.id, {
          moduleId: module.id,
          moduleTitle: module.title,
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          contentBody: lesson.contentBody,
          workplaceApplication: lesson.workplaceApplication,
          aiApplication: lesson.aiApplication,
          concepts: lesson.concepts,
          issues: bpIssues
        });
      }
    }
  }

  // Pairwise exact + semantic comparison across lessons
  for (let i = 0; i < lessonEntries.length; i++) {
    const left = lessonEntries[i];
    for (let j = i + 1; j < lessonEntries.length; j++) {
      const right = lessonEntries[j];
      const exactOverlap = contentOverlap(left.lesson.contentBody, right.lesson.contentBody);
      const semSim = semanticSimilarity(left.lesson.contentBody, right.lesson.contentBody, domainStopStems);
      const peakSim = Math.max(exactOverlap, semSim);

      if (exactOverlap >= 0.52 || semSim >= 0.62) {
        duplicatedLessons.add(right.lesson.id);
        const mode = exactOverlap >= 0.52 ? 'text overlap' : 'paraphrase/semantic similarity';
        highOverlapPairs.push(
          `Lesson "${right.lesson.title}" repeats "${left.lesson.title}" (${Math.round(peakSim * 100)}% ${mode}).`
        );
        repetitionAffected.push(`M${right.module.moduleNumber}: ${right.lesson.title}`);

        const existing = contentTargets.get(right.lesson.id);
        const dupMsg = `Substantially repeats or paraphrases "${left.lesson.title}" (${Math.round(peakSim * 100)}% similarity). Teach a distinct concept and worked example.`;
        if (existing) existing.issues.push(dupMsg);
        else {
          contentTargets.set(right.lesson.id, {
            moduleId: right.module.id,
            moduleTitle: right.module.title,
            lessonId: right.lesson.id,
            lessonTitle: right.lesson.title,
            contentBody: right.lesson.contentBody,
            workplaceApplication: right.lesson.workplaceApplication,
            aiApplication: right.lesson.aiApplication,
            concepts: right.lesson.concepts,
            issues: [dupMsg]
          });
        }
      } else if (exactOverlap >= 0.38 || semSim >= 0.5) {
        highOverlapPairs.push(
          `Lesson "${right.lesson.title}" shares moderate phrasing (${Math.round(peakSim * 100)}%) with "${left.lesson.title}".`
        );
      }
    }
  }

  repairTargets.push(...Array.from(contentTargets.values()).slice(0, 3));

  const scenarioEntries = course.modules.flatMap(module =>
    module.scenarios.map(scenario => ({ module, scenario }))
  );
  const duplicatedScenarios = new Set<string>();
  for (let i = 0; i < scenarioEntries.length; i++) {
    const left = scenarioEntries[i];
    const leftText = `${left.scenario.title} ${left.scenario.situation} ${left.scenario.challenge} ${left.scenario.decisionPoint} ${left.scenario.debrief}`;
    for (let j = i + 1; j < scenarioEntries.length; j++) {
      const right = scenarioEntries[j];
      const rightText = `${right.scenario.title} ${right.scenario.situation} ${right.scenario.challenge} ${right.scenario.decisionPoint} ${right.scenario.debrief}`;
      const ex = contentOverlap(leftText, rightText);
      const sm = semanticSimilarity(leftText, rightText, domainStopStems);
      if (ex >= 0.55 || sm >= 0.65) {
        duplicatedScenarios.add(right.scenario.id);
        repetitionAffected.push(`Scenario ${right.scenario.title}`);
      }
    }
  }

  const duplicatedTasks: string[] = [];
  const moduleTasks = course.modules.filter(m => m.practicalTask?.instructions);
  for (let i = 0; i < moduleTasks.length; i++) {
    for (let j = i + 1; j < moduleTasks.length; j++) {
      const tExact = contentOverlap(
        moduleTasks[i].practicalTask!.instructions,
        moduleTasks[j].practicalTask!.instructions
      );
      const tSem = semanticSimilarity(
        moduleTasks[i].practicalTask!.instructions,
        moduleTasks[j].practicalTask!.instructions,
        domainStopStems
      );
      const tPeak = Math.max(tExact, tSem);
      if (tExact >= 0.6 || tSem >= 0.68) {
        duplicatedTasks.push(
          `Module ${moduleTasks[i].moduleNumber} and Module ${moduleTasks[j].moduleNumber} practical tasks are near-identical (${Math.round(tPeak * 100)}% similarity).`
        );
        repetitionAffected.push(`Module ${moduleTasks[j].moduleNumber} Practical Task`);
      }
    }
  }

  const distinctContentCount = Math.max(1, lessonEntries.length + scenarioEntries.length);
  const repeatedContentCount = duplicatedLessons.size + duplicatedScenarios.size;
  const repetitionPenalty =
    (repeatedContentCount / distinctContentCount) * 90 +
    boilerplateHits.length * 14 +
    duplicatedTasks.length * 22;
  const originalityScore = Math.max(0, Math.min(100, Math.round(100 - repetitionPenalty)));

  const repetitionEvidence = Array.from(
    new Set([...highOverlapPairs, ...boilerplateHits, ...duplicatedTasks])
  );

  if (duplicatedLessons.size >= 1 || boilerplateHits.length >= 2 || duplicatedTasks.length > 0) {
    criticalIssues.push(
      `Content repetition, paraphrased duplication, or generic boilerplate detected (${repetitionEvidence[0] || 'duplicated lessons/tasks'}).`
    );
  } else {
    if (highOverlapPairs.length > 0) {
      warnings.push(`${highOverlapPairs.length} lesson pair(s) share elevated phrasing similarity.`);
    }
    if (duplicatedScenarios.size > 0) {
      warnings.push(`${duplicatedScenarios.size} workplace scenario(s) overlap substantially with another scenario.`);
    }
    if (boilerplateHits.length > 0) {
      warnings.push(boilerplateHits[0]);
    }
  }

  const repetitionStatus: 'PASS' | 'WARNING' | 'FAIL' =
    duplicatedLessons.size >= 1 || boilerplateHits.length >= 2 || duplicatedTasks.length > 0
      ? 'FAIL'
      : highOverlapPairs.length > 0 || duplicatedScenarios.size > 0 || boilerplateHits.length > 0
        ? 'WARNING'
        : 'PASS';

  if (repetitionStatus === 'PASS') {
    passedChecks.push('All lessons, scenarios, practical tasks, and MCQs are distinct with zero paraphrased duplication or boilerplate.');
  }

  qaChecks.push({
    id: 'repetition',
    label: '8. Repetition & Paraphrase Control',
    category: 'Pedagogy & Depth',
    status: repetitionStatus,
    score: originalityScore,
    summary:
      repetitionStatus === 'PASS'
        ? `Lessons, scenarios, and tasks are distinct without verbatim or paraphrased duplication (${originalityScore}% originality).`
        : 'Detected verbatim or paraphrased duplication across lessons/tasks or generic template boilerplate.',
    evidence:
      repetitionEvidence.length > 0
        ? repetitionEvidence.slice(0, 6)
        : [`${lessonEntries.length} lessons and ${scenarioEntries.length} scenarios passed exact shingle & semantic similarity checks (${originalityScore}%).`],
    affectedItems: Array.from(new Set(repetitionAffected)),
    recommendations:
      repetitionStatus === 'PASS'
        ? []
        : ['Rewrite flagged lessons or tasks so each introduces distinct concepts, worked examples, and problem contexts.']
  });

  // ===========================================================================
  // 9. LOGICAL LEARNING PROGRESSION
  // ===========================================================================
  const progEvidence: string[] = [];
  const progAffected: string[] = [];
  let progDeductions = 0;

  // Check duplicate lesson titles within or across modules
  const seenLessonTitles = new Map<string, string>();
  for (const { module, lesson } of lessonEntries) {
    const key = (lesson.title || '').toLowerCase().trim();
    if (seenLessonTitles.has(key)) {
      progDeductions += 20;
      progAffected.push(`M${module.moduleNumber}: ${lesson.title}`);
      progEvidence.push(`Lesson title "${lesson.title}" is repeated across modules (${seenLessonTitles.get(key)} and Module ${module.moduleNumber}).`);
    } else {
      seenLessonTitles.set(key, `Module ${module.moduleNumber}`);
    }
  }

  // Verify Bloom progression doesn't put strictly Evaluation before Understand/Foundations in multi-module courses
  if (course.modules.length >= 2) {
    const firstModL1Level = (course.modules[0].learningObjectives?.[0]?.bloomLevel || 'Understand').toLowerCase();
    const lastModMaxLevel = (
      course.modules[course.modules.length - 1].learningObjectives?.slice(-1)[0]?.bloomLevel || 'Evaluate'
    ).toLowerCase();
    if (firstModL1Level === 'create' && lastModMaxLevel === 'remember') {
      progDeductions += 25;
      progAffected.push('Module 1 -> Final Module cognitive sequence');
      progEvidence.push('Cognitive progression appears inverted (Create before foundational Understand/Apply concepts).');
    }
  }

  // Ensure each module has >= 2 distinct lessons when total modules >= 1
  for (const mod of course.modules) {
    if ((mod.lessons?.length || 0) < 2) {
      progDeductions += 15;
      progAffected.push(`Module ${mod.moduleNumber}: ${mod.title}`);
      progEvidence.push(`Module ${mod.moduleNumber} has only ${mod.lessons?.length || 0} lesson(s), limiting scaffolded progression.`);
    }
  }

  const progressionScore = Math.max(0, 100 - progDeductions);
  const progressionStatus: 'PASS' | 'WARNING' | 'FAIL' =
    progressionScore >= 85 ? 'PASS' : progressionScore >= 60 ? 'WARNING' : 'FAIL';

  if (progressionStatus === 'PASS') {
    passedChecks.push('Curriculum follows logical scaffolding from foundations through applied execution and evaluation.');
  } else if (progressionStatus === 'WARNING') {
    warnings.push('Review module/lesson progression for repeated headings or insufficient scaffolding.');
  } else {
    criticalIssues.push('Course progression is broken by repeated headings or inverted difficulty sequence.');
  }

  qaChecks.push({
    id: 'progression',
    label: '9. Logical Learning Progression',
    category: 'Subject & Curriculum',
    status: progressionStatus,
    score: progressionScore,
    summary:
      progressionStatus === 'PASS'
        ? `Modules and lessons progress cohesively from foundational mental models to applied mastery (${progressionScore}%).`
        : 'Progression issues detected across module sequence or repeated lesson titles.',
    evidence:
      progEvidence.length > 0
        ? progEvidence.slice(0, 6)
        : [`Verified progressive sequencing across ${course.modules.length} modules and ${lessonEntries.length} distinct lessons.`],
    affectedItems: Array.from(new Set(progAffected)),
    recommendations:
      progressionStatus === 'PASS'
        ? []
        : ['Sequence lessons from foundational concepts -> worked application -> edge-case evaluation without repeating headings.']
  });

  // ===========================================================================
  // 10. FACTUAL, CITATION & SOUTH AFRICAN REGULATORY RELIABILITY
  // ===========================================================================
  const verifiedSources = (sourceCourse.research?.sources || []).filter(
    source => source.status === 'Verified'
  );
  const verifiedSourceCount = verifiedSources.length;
  const verifiedSourceBlob = verifiedSources
    .map(s => `${s.name} ${s.reference} ${s.relevance}`)
    .join(' ')
    .toLowerCase();

  const mentionsPopia = /popia|protection of personal information/i.test(fullCourseText);
  const popiaSourceVerified = verifiedSources.some(
    src => /popia|personal information/i.test(`${src.name} ${src.reference}`)
  );

  // Detect unqualified South African statutory, NQF, or numeric claims when not backed by verified sources or marked SME-validation
  const unverifiedStatutoryMatches: string[] = [];
  const statuteMatches = fullCourseText.match(
    /(?:NQF\s+Level\s+\d+|SAQA\s+(?:ID|Unit\s+Standard)\s*\d+|Act\s+(?:No\.?\s*)?\d+\s+of\s+\d{4}|\d+\s+CPD\s+Credits?)/gi
  ) || [];
  for (const citation of Array.from(new Set(statuteMatches))) {
    const normalized = citation.toLowerCase();
    const backedBySource = verifiedSourceBlob.includes(normalized.replace(/\s+/g, ' ')) ||
      (normalized.includes('popia') || normalized.includes('4 of 2013') ? popiaSourceVerified : false) ||
      verifiedSources.some(vs => normalized.split(/\s+/).some(tok => tok.length > 3 && verifiedSourceBlob.includes(tok)));
    const caveatPattern = new RegExp(
      `${citation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^.\\n]{0,120}(?:To Be Confirmed|Requires SME|Verify|Pending)`,
      'i'
    );
    const hasCaveat = caveatPattern.test(fullCourseText) || /To Be Confirmed\s*\(Requires SME Validation\)/i.test(fullCourseText);
    if (!backedBySource && !hasCaveat) {
      unverifiedStatutoryMatches.push(citation);
    }
  }

  const reliabilityEvidence: string[] = [];
  const reliabilityAffected: string[] = [];
  const southAfricanContextVerified = verifiedSourceCount > 0 && subjectStatus !== 'FAIL' && unverifiedStatutoryMatches.length === 0;
  const popiaCompliant = !mentionsPopia || popiaSourceVerified || Boolean(sourceCourse.ethics?.dataPrivacySafeguards?.trim());

  if (verifiedSourceCount > 0) {
    reliabilityEvidence.push(
      `${verifiedSourceCount} verified user source(s) supplied and linked in course metadata.`
    );
    passedChecks.push(`${verifiedSourceCount} verified source(s) incorporated into regulatory & technical grounding.`);
  } else {
    warnings.push(
      'No user-marked verified sources were supplied; regulatory, NQF, and factual claims require SME verification.'
    );
    reliabilityEvidence.push('0 verified sources attached in Section 02; claims require SME confirmation.');
  }

  if (unverifiedStatutoryMatches.length > 0) {
    const claimList = unverifiedStatutoryMatches.slice(0, 5).join(', ');
    if (verifiedSourceCount === 0) {
      warnings.push(
        `Unverified statutory/accreditation claim(s) cited without verified sources or SME caveat: ${claimList}.`
      );
    } else {
      warnings.push(
        `Verify exact regulatory/accreditation reference(s) with an SME: ${claimList}.`
      );
    }
    reliabilityEvidence.push(`Unqualified claim(s): ${claimList} (mark "To Be Confirmed (Requires SME Validation)" or attach source).`);
    reliabilityAffected.push(...unverifiedStatutoryMatches.slice(0, 5));
  }

  let groundingScore = verifiedSourceCount >= 2 ? 95 : verifiedSourceCount === 1 ? 82 : 65;
  groundingScore = Math.max(25, groundingScore - unverifiedStatutoryMatches.length * 15);
  const groundingStatus: 'PASS' | 'WARNING' | 'FAIL' =
    unverifiedStatutoryMatches.length >= 3 && verifiedSourceCount === 0
      ? 'FAIL'
      : verifiedSourceCount >= 1 && subjectStatus !== 'FAIL' && unverifiedStatutoryMatches.length === 0
        ? 'PASS'
        : 'WARNING';

  if (groundingStatus === 'FAIL') {
    criticalIssues.push(
      `Multiple unverified South African statutory/NQF claims (${unverifiedStatutoryMatches.slice(0, 3).join(', ')}) cited without supporting sources.`
    );
  }

  qaChecks.push({
    id: 'factual_reliability',
    label: '10. Factual & Regulatory Reliability',
    category: 'Reliability & Structure',
    status: groundingStatus,
    score: groundingScore,
    summary:
      groundingStatus === 'PASS'
        ? 'Factual, statutory, and SA context references are honestly grounded in supplied verified sources.'
        : 'Missing verified sources or unqualified statutory/NQF claims require SME verification before release.',
    evidence: reliabilityEvidence,
    affectedItems: reliabilityAffected,
    recommendations:
      groundingStatus === 'PASS'
        ? []
        : ['Attach verified Section 02 references or mark unconfirmed acts, NQF codes, and statistics "To Be Confirmed (Requires SME Validation)".']
  });

  // ===========================================================================
  // 11. DOCUMENT & METADATA INTEGRITY
  // ===========================================================================
  const integrityEvidence: string[] = [];
  const integrityAffected: string[] = [];
  let integrityIssuesCount = 0;
  let integrityWarningsCount = 0;

  const isOfflineFallbackDraft =
    course.generationMetadata?.provider === 'local_fallback' ||
    course.generationMetadata?.fallbackUsed === true ||
    /offline local-fallback mode/i.test(fullCourseText);

  if (isOfflineFallbackDraft) {
    const reason = course.generationMetadata?.fallbackReason || 'Generated in offline local-fallback mode';
    criticalIssues.push(
      `Course was drafted via offline local-fallback mode (${reason}) instead of live AI synthesis and cannot pass QA approval.`
    );
    integrityEvidence.push(
      `Offline Fallback Draft detected (${reason}). Regenerate using live Groq Cloud or Google Gemini.`
    );
    integrityAffected.push('Generation Provider (Offline Fallback Draft)');
    integrityIssuesCount++;
  }

  if (course.generationMetadata?.isPartial) {
    const done = course.generationMetadata.completedModules ?? course.modules.length;
    const total = course.generationMetadata.totalModules ?? (sourceCourse.modules?.length || done);
    criticalIssues.push(
      `Partial generation draft: only ${done} of ${total} modules completed before an AI provider error.`
    );
    integrityEvidence.push(`Partial draft (${done}/${total} modules). Retry to complete all modules.`);
    integrityAffected.push(`Incomplete Module Set (${done}/${total})`);
    integrityIssuesCount++;
  }

  if (course.modules.length === 0 || lessonEntries.length === 0) {
    criticalIssues.push('Generated course contains no modules or lessons.');
    integrityEvidence.push('Missing modules or lessons in generated output.');
    integrityAffected.push('Modules & Lessons');
    integrityIssuesCount++;
  }

  const sourceModuleCount = sourceCourse.modules?.length || 0;
  if (sourceModuleCount > 0 && sourceModuleCount !== course.modules.length) {
    const msg = `Module count mismatch: template specified ${sourceModuleCount} module(s), generated output has ${course.modules.length}.`;
    criticalIssues.push(msg);
    integrityEvidence.push(msg);
    integrityAffected.push(`Module count (${course.modules.length} vs ${sourceModuleCount})`);
    integrityIssuesCount++;
  } else if (sourceModuleCount > 0) {
    passedChecks.push(`Preserved exact user-defined ${sourceModuleCount}-module structure.`);
  }

  for (let i = 0; i < Math.min(sourceModuleCount, course.modules.length); i++) {
    const srcMod = sourceCourse.modules[i] as any;
    const genMod = course.modules[i];
    if (srcMod.title?.trim()) {
      const srcNorm = srcMod.title.toLowerCase().trim();
      const genNorm = (genMod.title || '').toLowerCase().trim();
      if (srcNorm !== genNorm && !genNorm.includes(srcNorm) && !srcNorm.includes(genNorm)) {
        const msg = `Module ${i + 1} title ("${genMod.title}") changed from template title ("${srcMod.title}").`;
        warnings.push(msg);
        integrityEvidence.push(msg);
        integrityAffected.push(`Module ${i + 1} Title`);
        integrityWarningsCount++;
      }
    }
    if (Array.isArray(srcMod.lessons) && srcMod.lessons.length > 0 && genMod.lessons.length !== srcMod.lessons.length) {
      const msg = `Module ${i + 1} lesson count (${genMod.lessons.length}) differs from configured template (${srcMod.lessons.length}).`;
      warnings.push(msg);
      integrityEvidence.push(msg);
      integrityAffected.push(`Module ${i + 1} Lessons`);
      integrityWarningsCount++;
    }
  }

  const expectedCode = (sourceCourse.structure?.code || sourceCourse.code || '').trim();
  if (expectedCode && course.code && course.code.trim() !== expectedCode) {
    const msg = `Course code mismatch: template uses "${expectedCode}", generated output has "${course.code}".`;
    warnings.push(msg);
    integrityEvidence.push(msg);
    integrityAffected.push('Course Code');
    integrityWarningsCount++;
  }

  if (
    course.assessments.preCourseDiagnostic.questions.length < 5 ||
    course.assessments.preCourseDiagnostic.questions.length > 10
  ) {
    warnings.push('The pre-course diagnostic does not contain the configured 5–10 question range.');
    integrityEvidence.push(
      `Pre-course diagnostic has ${course.assessments.preCourseDiagnostic.questions.length} question(s) (expected 5–10).`
    );
    integrityAffected.push('Pre-Course Diagnostic');
    integrityWarningsCount++;
  }
  if (!course.assessments.finalAssessment.capstoneCaseStudy) {
    warnings.push('The final assessment has no configured capstone case study.');
    integrityEvidence.push('Missing final capstone case study.');
    integrityAffected.push('Capstone Case Study');
    integrityWarningsCount++;
  }

  const structureScore = Math.max(0, 100 - integrityIssuesCount * 40 - integrityWarningsCount * 10);
  const structureStatus: 'PASS' | 'WARNING' | 'FAIL' =
    integrityIssuesCount > 0 ? 'FAIL' : integrityWarningsCount > 0 ? 'WARNING' : 'PASS';

  if (structureStatus === 'PASS') {
    integrityEvidence.push(
      `Title, code (${course.code}), ${course.modules.length} modules, ${lessonEntries.length} lessons, diagnostic, and capstone match Master Template v9.0.`
    );
  }

  qaChecks.push({
    id: 'document_integrity',
    label: '11. Document & Metadata Integrity',
    category: 'Reliability & Structure',
    status: structureStatus,
    score: structureScore,
    summary:
      structureStatus === 'PASS'
        ? `All template metadata, module counts, assessments, and exports align cleanly (${course.modules.length} modules, ${lessonEntries.length} lessons).`
        : 'Structural or metadata deviations found compared to Master Template v9.0.',
    evidence: integrityEvidence.slice(0, 6),
    affectedItems: integrityAffected,
    recommendations:
      structureStatus === 'PASS'
        ? []
        : ['Restore any altered module counts/titles or missing diagnostic/capstone sections before export.']
  });

  // ===========================================================================
  // COMPOSITE SCORE & OVERALL VERDICT ACROSS ALL 11 DIMENSIONS
  // ===========================================================================
  const weightedScore = Math.round(
    subjectAlignmentScore * 0.16 +
      loScore * 0.08 +
      depthScore * 0.14 +
      techScore * 0.1 +
      lessonRelScore * 0.08 +
      taskScore * 0.1 +
      alignmentScore * 0.1 +
      originalityScore * 0.12 +
      progressionScore * 0.04 +
      groundingScore * 0.04 +
      structureScore * 0.04
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
      'Resolve all FAIL-level issues across the 11 QA dimensions using Edit or Regenerate before approving this course.'
    );
  } else if (overallVerdict === 'WARNING') {
    recommendations.unshift(
      'Review highlighted warnings across the 11 QA Scorecard cards before signing off for deployment.'
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
    : (s.estimatedDuration || '16 Hours (Self-paced + Practical Tasks)');

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

  // Never mutate AI-generated courses via offline filler expansion
  const finalCourse =
    metadata.provider === 'local_fallback'
      ? enforceComprehensiveCourseVolume(baseCourse, sourceCourse)
      : baseCourse;
  finalCourse.qa = reviewGeneratedCourseQuality(finalCourse, sourceCourse, blueprint).qa;

  return {
    success: errors.length === 0,
    course: finalCourse,
    errors
  };
}
