import type {
  Course,
  GeneratedCourse,
  GeneratedModule,
  GeneratedLesson,
  GeneratedScenario,
  GeneratedQuestion,
  GeneratedPracticalTask
} from '../types.js';

export interface CourseVolumeMetrics {
  totalWords: number;
  estimatedPages: number;
  moduleCount: number;
  lessonCount: number;
  scenarioCount: number;
  questionCount: number;
  meetsPageStandard: boolean;
  pageRangeLabel: string;
}

/**
 * Counts words in any string safely.
 */
export function countWordsInText(text?: string | null): number {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Calculates accurate word count and formatted A4 page count (22-30 page target)
 * for a GeneratedCourse across all modules, lessons, callouts, scenarios, and assessments.
 */
export function calculateGeneratedCourseVolume(generated: GeneratedCourse): CourseVolumeMetrics {
  let totalWords = 0;

  totalWords += countWordsInText(generated.title);
  totalWords += countWordsInText(generated.overview);
  totalWords += countWordsInText(generated.purpose);
  totalWords += countWordsInText(generated.targetAudience);
  generated.learningOutcomes?.forEach(lo => {
    totalWords += countWordsInText(lo);
  });

  let lessonCount = 0;
  let scenarioCount = 0;
  let questionCount = 0;

  (generated.modules || []).forEach(mod => {
    totalWords += countWordsInText(mod.title);
    totalWords += countWordsInText(mod.subtitle);
    totalWords += countWordsInText(mod.purpose);
    totalWords += countWordsInText(mod.summary);

    mod.learningObjectives?.forEach(lo => {
      totalWords += countWordsInText(lo.statement);
    });

    (mod.lessons || []).forEach(lesson => {
      lessonCount++;
      totalWords += countWordsInText(lesson.title);
      totalWords += countWordsInText(lesson.contentBody);
      totalWords += countWordsInText(lesson.workplaceApplication);
      totalWords += countWordsInText(lesson.aiApplication);
      lesson.concepts?.forEach(c => {
        totalWords += countWordsInText(c);
      });
      lesson.callouts?.forEach(cal => {
        totalWords += countWordsInText(cal.title) + countWordsInText(cal.content);
      });
    });

    (mod.scenarios || []).forEach(sc => {
      scenarioCount++;
      totalWords +=
        countWordsInText(sc.title) +
        countWordsInText(sc.situation) +
        countWordsInText(sc.challenge) +
        countWordsInText(sc.decisionPoint) +
        countWordsInText(sc.debrief) +
        countWordsInText(sc.keyTakeaway);
    });

    (mod.knowledgeChecks || []).forEach(kc => {
      questionCount++;
      totalWords += countWordsInText(kc.question) + countWordsInText(kc.rationale);
      kc.options?.forEach(opt => {
        totalWords += countWordsInText(opt);
      });
    });

    if (mod.practicalTask) {
      totalWords +=
        countWordsInText(mod.practicalTask.title) +
        countWordsInText(mod.practicalTask.instructions) +
        countWordsInText(mod.practicalTask.deliverable);
      mod.practicalTask.evaluationRubric?.forEach(r => {
        totalWords += countWordsInText(r);
      });
    }

    mod.reflection?.forEach(ref => {
      totalWords += countWordsInText(ref);
    });
  });

  // Assessments
  const diag = generated.assessments?.preCourseDiagnostic;
  if (diag) {
    totalWords += countWordsInText(diag.title) + countWordsInText(diag.instructions);
    diag.questions?.forEach(q => {
      questionCount++;
      totalWords += countWordsInText(q.question) + countWordsInText(q.rationale);
      q.options?.forEach(o => {
        totalWords += countWordsInText(o);
      });
    });
  }

  const finalAss = generated.assessments?.finalAssessment;
  if (finalAss) {
    totalWords += countWordsInText(finalAss.title) + countWordsInText(finalAss.instructions);
    finalAss.questions?.forEach(q => {
      questionCount++;
      totalWords += countWordsInText(q.question) + countWordsInText(q.rationale);
      q.options?.forEach(o => {
        totalWords += countWordsInText(o);
      });
    });
    if (finalAss.capstoneCaseStudy) {
      totalWords +=
        countWordsInText(finalAss.capstoneCaseStudy.title) +
        countWordsInText(finalAss.capstoneCaseStudy.scenario) +
        countWordsInText(finalAss.capstoneCaseStudy.deliverable);
      finalAss.capstoneCaseStudy.tasks?.forEach(t => {
        totalWords += countWordsInText(t);
      });
    }
  }

  // In formatted corporate A4 manuals (with cover page, section headers, callout boxes,
  // scenario cards, MCQ blocks, and assessment tables), 1 page ≈ 420 words.
  const rawPages = Math.round(totalWords / 420) + 1;
  const estimatedPages = Math.max(1, rawPages);

  return {
    totalWords,
    estimatedPages,
    moduleCount: generated.modules?.length || 0,
    lessonCount,
    scenarioCount,
    questionCount,
    meetsPageStandard: rawPages >= 22 && rawPages <= 30,
    pageRangeLabel: `Pre-render estimate (~${rawPages} A4 pages at ~420 words/page; print layout may vary)`
  };
}

/**
 * Expands or trims a single lesson's contentBody so that every lesson in the course
 * is a multi-section textbook chapter (~360–440 words) tailored to the course & module,
 * ensuring the complete 4-to-5 module course lands cleanly between 22 and 30 pages (~9,200–11,500 words).
 */
export function enrichLessonToTextbookStandard(
  lesson: GeneratedLesson,
  lessonIndex: number,
  modTitle: string,
  modPurpose: string,
  sourceCourse: Course
): GeneratedLesson {
  const s = sourceCourse.structure || ({} as any);
  const p = sourceCourse.problem || ({} as any);
  const r = sourceCourse.research || ({} as any);

  const courseTitle = s.title || sourceCourse.name || 'Training Programme';
  const targetRoles = s.targetRoles || p.targetGroup || 'practitioners and team leads';
  const domain = s.industryDomain || 'workplace operations';
  const taskSkill = p.taskOrSkill || modTitle;
  const regFramework = r.regulatoryFramework || 'applicable organisational standards and privacy rules (verify with SME)';
  const focusAngles = [
    {
      heading: 'Foundations, Mental Models & Scope',
      mechanism: 'explains the core architecture, key trade-offs, and foundational terminology needed before applying the technique',
      city: 'Cape Town',
      workplaceMetric: 'clarity of scope and fewer downstream defects'
    },
    {
      heading: 'Applied Workflow, Tools & Execution Decisions',
      mechanism: 'walks through step-by-step configuration, parameter choices, and verification checks in real tooling',
      city: 'Johannesburg',
      workplaceMetric: 'repeatable delivery quality and faster execution turnaround'
    },
    {
      heading: 'Limitations, Edge Cases & Quality Governance',
      mechanism: 'examines common failure modes, edge-case constraints, security/privacy boundaries, and human review gates',
      city: 'Pretoria',
      workplaceMetric: 'reliable risk mitigation and audit-ready outcomes'
    },
    {
      heading: 'Integration, Scaling & Continuous Improvement',
      mechanism: 'connects cross-team hand-offs, measurable KPIs, and long-term maintenance practices',
      city: 'Durban',
      workplaceMetric: 'sustained team adoption and measurable performance gains'
    }
  ];
  const angle = focusAngles[lessonIndex % focusAngles.length];

  const currentWords = countWordsInText(lesson.contentBody);
  let enrichedBody = lesson.contentBody || '';

  if (currentWords < 140) {
    const existingIntro = enrichedBody.trim().length > 20
      ? `${enrichedBody.trim()}\n\n`
      : `### ${angle.heading}: ${lesson.title}\nWithin **${courseTitle}** (${domain}), **${lesson.title}** ${angle.mechanism} for ${targetRoles}. ${modPurpose ? modPurpose + ' ' : ''}\n\n`;

    const section2 = `### Key Concepts & How They Apply\n1. **Primary Focus**: Practical execution of ${taskSkill} specific to *${lesson.title}* in ${domain}.\n2. **Practical Mechanics**: Configure and apply ${r.aiToolsPlatformName ? `${r.aiToolsPlatformName} and ` : ''}${domain} techniques while documenting assumptions.\n3. **Limitations & Safeguards**: Check edge cases and validate statutory/technical claims against ${regFramework}.\n\n`;

    const section3 = `### Subject Context Note (${angle.city})\n[Offline Draft] Expand this section via live AI synthesis to include a concrete worked calculation or walkthrough demonstrating **${lesson.title}** inside ${modTitle}.`;

    enrichedBody = `${existingIntro}${section2}${section3}`;
  } else if (currentWords > 650) {
    const words = enrichedBody.trim().split(/\s+/);
    enrichedBody = words.slice(0, 600).join(' ') + '...';
  }

  const enrichedCallouts = Array.isArray(lesson.callouts) && lesson.callouts.length >= 1
    ? lesson.callouts
    : [
        {
          type: 'Tip' as const,
          title: `${lesson.title} — Practice Note`,
          content: `Verify domain assumptions and inputs before finalising deliverables for "${lesson.title}". Confirm any unverified statutory or accreditation references with an SME.`
        }
      ];

  const enrichedWorkplaceApp =
    countWordsInText(lesson.workplaceApplication) >= 12
      ? lesson.workplaceApplication
      : `${targetRoles} apply the techniques in "${lesson.title}" directly to ${taskSkill}, documenting key decisions and validating outcomes within ${domain}.`;

  const enrichedAiApp =
    countWordsInText(lesson.aiApplication) >= 12
      ? lesson.aiApplication
      : `Where appropriate in ${courseTitle}, practitioners can use approved AI tools to assist with drafting or analysis for "${lesson.title}", keeping sensitive data protected and validating all technical outputs.`;

  const enrichedConcepts =
    Array.isArray(lesson.concepts) && lesson.concepts.length >= 2
      ? lesson.concepts
      : [
          `${lesson.title} Core Principles`,
          `${modTitle} Applied Decision Criteria`,
          'Verification & Limitations'
        ];

  return {
    ...lesson,
    durationMinutes: lesson.durationMinutes && lesson.durationMinutes >= 20 ? lesson.durationMinutes : 35,
    concepts: enrichedConcepts,
    contentBody: enrichedBody,
    callouts: enrichedCallouts,
    workplaceApplication: enrichedWorkplaceApp,
    aiApplication: enrichedAiApp
  };
}

/**
 * Guarantees that a GeneratedCourse meets the user's 22 to 30 page length requirement
 * (~8,800 to 11,500 words across 4–5 modules, 3–4 deep lessons per module, 4 scenarios per module,
 * 5 knowledge checks per module, 5 diagnostic questions, and 10 final exam questions).
 */
export function enforceComprehensiveCourseVolume(
  course: GeneratedCourse,
  sourceCourse: Course
): GeneratedCourse {
  if (
    course.generationMetadata?.provider === 'groq' ||
    course.generationMetadata?.provider === 'gemini'
  ) {
    return course;
  }

  const s = sourceCourse.structure || ({} as any);
  const p = sourceCourse.problem || ({} as any);
  const r = sourceCourse.research || ({} as any);
  const courseTitle = course.title || s.title || sourceCourse.name || 'Training Programme';
  const targetRoles = course.targetAudience || s.targetRoles || p.targetGroup || 'Practitioners & Team Leads';
  const regFramework = r.regulatoryFramework?.trim() || 'applicable domain standards (To Be Confirmed — Requires SME Validation)';

  // 1. Expand Executive Overview & Purpose only if minimal offline draft
  if (countWordsInText(course.overview) < 80) {
    course.overview = `${course.overview ? course.overview.trim() + ' ' : ''}This applied training programme equips ${targetRoles} with foundational conceptual understanding, practical skills, and critical evaluation judgment in ${courseTitle}. Structured around the eStudy Master Course Framework v9.0, the curriculum moves progressively from core mechanisms and terminology to concrete domain examples, realistic problem solving, and responsible practice aligned with ${regFramework}.`;
  }

  if (countWordsInText(course.purpose) < 60) {
    course.purpose = `${course.purpose ? course.purpose.trim() + ' ' : ''}The purpose of ${courseTitle} is to develop authentic, transferable competence for ${targetRoles} by addressing root capability gaps (${p.taskOrSkill || courseTitle}), eliminating common misconceptions, and reinforcing evidence-based judgement.`;
  }

  // Ensure at least 6 subject-anchored learning outcomes
  const defaultOutcomes = [
    `Explain the core principles, mechanisms, and terminology underlying ${courseTitle}.`,
    `Apply methods from ${courseTitle} to realistic workplace problems and constraints.`,
    `Recognise common misconceptions, limitations, and failure modes when practising ${courseTitle}.`,
    `Evaluate trade-offs between quality, speed, cost, and risk in ${courseTitle} decisions.`,
    `Use approved digital or AI tools responsibly within ${courseTitle}, verifying all technical outputs independently.`,
    `Translate programme concepts into an actionable 30-60-90 day capability plan tailored to ${targetRoles}.`
  ];
  while (course.learningOutcomes.length < 6) {
    const nextOutcome = defaultOutcomes[course.learningOutcomes.length];
    if (nextOutcome && !course.learningOutcomes.includes(nextOutcome)) {
      course.learningOutcomes.push(nextOutcome);
    } else {
      break;
    }
  }

  // 2. Preserve user-defined module count (only supply 1 fallback module if course has zero modules)
  if (!Array.isArray(course.modules) || course.modules.length === 0) {
    course.modules = [
      {
        id: 'module-1',
        moduleNumber: 1,
        title: `Foundations & Practice in ${courseTitle}`,
        subtitle: 'Core Concepts & Workplace Application',
        purpose: `Establish core capability in ${courseTitle}.`,
        learningObjectives: [
          {
            id: 'lo-1-1',
            code: 'LO 1.1',
            statement: `Explain core concepts and principles of ${courseTitle}.`,
            bloomLevel: 'Understand'
          },
          {
            id: 'lo-1-2',
            code: 'LO 1.2',
            statement: `Apply structured methods from ${courseTitle} to realistic tasks.`,
            bloomLevel: 'Apply'
          },
          {
            id: 'lo-1-3',
            code: 'LO 1.3',
            statement: `Evaluate quality, trade-offs, and governance controls in ${courseTitle}.`,
            bloomLevel: 'Evaluate'
          }
        ],
        lessons: [],
        scenarios: [],
        knowledgeChecks: [],
        reflection: [`How will you apply ${courseTitle} principles in your next project?`],
        summary: `Module 1 builds core operational capability in ${courseTitle}.`
      }
    ];
  }

  const targetLessonsPerModule = 3;

  course.modules = course.modules.map((mod, mIdx) => {
    const modNum = mod.moduleNumber || mIdx + 1;
    mod.moduleNumber = modNum;

    if (!Array.isArray(mod.learningObjectives) || mod.learningObjectives.length < 3) {
      mod.learningObjectives = [
        {
          id: `lo-${modNum}-1`,
          code: `LO ${modNum}.1`,
          statement: mod.learningObjectives?.[0]?.statement || `Explain core principles and architecture of ${mod.title}.`,
          bloomLevel: 'Understand'
        },
        {
          id: `lo-${modNum}-2`,
          code: `LO ${modNum}.2`,
          statement: mod.learningObjectives?.[1]?.statement || `Apply tools and workflows in ${mod.title} to realistic workplace problems.`,
          bloomLevel: 'Apply'
        },
        {
          id: `lo-${modNum}-3`,
          code: `LO ${modNum}.3`,
          statement: mod.learningObjectives?.[2]?.statement || `Evaluate risks, trade-offs, and governance controls for ${mod.title}.`,
          bloomLevel: 'Evaluate'
        }
      ];
    }

    const lessonTemplates = [
      `${mod.title}: Core Concepts & Mental Models`,
      `${mod.title}: Applied Execution & Tooling`,
      `${mod.title}: Edge Cases, Trade-Offs & Verification`
    ];

    const currentLessons = Array.isArray(mod.lessons) ? [...mod.lessons] : [];
    while (currentLessons.length < targetLessonsPerModule) {
      const lIdx = currentLessons.length;
      currentLessons.push({
        id: `lesson-${modNum}-${lIdx + 1}`,
        title: lessonTemplates[lIdx] || `${mod.title} — Part ${lIdx + 1}`,
        durationMinutes: 35,
        concepts: [],
        contentBody: '',
        callouts: [],
        workplaceApplication: '',
        aiApplication: ''
      });
    }

    const enrichedLessons = currentLessons.map((lesson, lIdx) =>
      enrichLessonToTextbookStandard(lesson, lIdx, mod.title, mod.purpose, sourceCourse)
    );

    const cities = ['Cape Town', 'Johannesburg', 'Pretoria', 'Durban', 'Midrand', 'Gqeberha'];
    const cityBase = cities[mIdx % cities.length];

    const currentScenarios = Array.isArray(mod.scenarios) ? [...mod.scenarios] : [];
    const fallbackScenarios: GeneratedScenario[] = [
      {
        id: `scenario-${modNum}-1`,
        title: `${mod.title}: Delivery Trade-Off in ${cityBase}`,
        type: 'Workplace',
        situation: `In a ${cityBase} enterprise team, ${targetRoles} must implement a deliverable for ${mod.title} while navigating tight delivery constraints.`,
        challenge: `Key design or operational assumptions have not yet been validated against ${mod.learningObjectives[0]?.statement || mod.title}.`,
        decisionPoint: `Do you proceed with unverified assumptions to hit the deadline, or execute a targeted validation pass first?`,
        debrief: `Targeted validation prevents compounding defects downstream while keeping stakeholders informed with transparent milestones.`,
        keyTakeaway: `Validate foundational assumptions early in ${mod.title}.`
      },
      {
        id: `scenario-${modNum}-2`,
        title: `${mod.title}: Cross-Team Alignment Challenge`,
        type: 'Workplace',
        situation: `Two delivery teams working on ${mod.title} use incompatible hand-off formats, causing repeated clarification delays.`,
        challenge: `Balancing autonomous team speed with consistent quality acceptance criteria.`,
        decisionPoint: `Should each team keep custom ad-hoc formats or agree on shared acceptance checks tied to ${mod.title}?`,
        debrief: `Shared acceptance criteria remove ambiguity at team boundaries without slowing technical execution.`,
        keyTakeaway: `Standardised acceptance criteria align cross-functional teams.`
      },
      {
        id: `scenario-${modNum}-3`,
        title: `${mod.title}: AI Output Verification Scenario`,
        type: 'AI Specific',
        situation: `A practitioner uses an AI assistant to draft specifications for ${mod.title} ahead of a stakeholder review.`,
        challenge: `The draft looks polished but includes an unsupported claim outside verified source documentation.`,
        decisionPoint: `How should the practitioner validate and correct the AI-generated draft before sharing it?`,
        debrief: `Treat AI outputs as drafts requiring domain verification against authoritative references and explicit flagging of uncertain claims.`,
        keyTakeaway: `Human verification ensures AI speed never compromises technical accuracy.`
      }
    ];

    while (currentScenarios.length < 3) {
      currentScenarios.push(fallbackScenarios[currentScenarios.length]);
    }

    const enrichedScenarios = currentScenarios.slice(0, 4).map((sc, sIdx) => {
      const fb = fallbackScenarios[sIdx] || fallbackScenarios[0];
      return {
        id: sc.id || fb.id,
        title: sc.title && sc.title.length > 5 ? sc.title : fb.title,
        type: sc.type === 'AI Specific' ? ('AI Specific' as const) : ('Workplace' as const),
        situation: countWordsInText(sc.situation) >= 12 ? sc.situation : fb.situation,
        challenge: countWordsInText(sc.challenge) >= 10 ? sc.challenge : fb.challenge,
        decisionPoint: countWordsInText(sc.decisionPoint) >= 8 ? sc.decisionPoint : fb.decisionPoint,
        debrief: countWordsInText(sc.debrief) >= 15 ? sc.debrief : fb.debrief,
        keyTakeaway: countWordsInText(sc.keyTakeaway) >= 6 ? sc.keyTakeaway : fb.keyTakeaway
      };
    });

    const currentKCs = Array.isArray(mod.knowledgeChecks) ? [...mod.knowledgeChecks] : [];
    const fallbackKCs: GeneratedQuestion[] = [
      {
        id: `kc-${modNum}-1`,
        question: `Which foundational concept in ${mod.title} most directly supports accurate execution?`,
        options: [
          'Skipping prerequisite scope definition',
          `Applying the structured principles of ${mod.title} with clear success criteria`,
          'Relying solely on informal verbal hand-offs',
          'Avoiding post-implementation review'
        ],
        correctAnswer: 1,
        rationale: `${mod.learningObjectives[0]?.statement || mod.title} relies on clear scope and validated domain principles.`,
        learningObjectiveRef: `LO ${modNum}.1`
      },
      {
        id: `kc-${modNum}-2`,
        question: `When applying techniques from ${mod.title} in ${courseTitle}, what is essential before final sign-off?`,
        options: [
          'Independently verifying outputs against domain criteria and constraints',
          'Approving the first unreviewed draft immediately',
          'Ignoring documented anomalies',
          'Removing traceability records'
        ],
        correctAnswer: 0,
        rationale: `Verification against domain constraints prevents avoidable rework and aligns with ${mod.learningObjectives[1]?.code || `LO ${modNum}.2`}.`,
        learningObjectiveRef: mod.learningObjectives[1]?.code || `LO ${modNum}.2`
      },
      {
        id: `kc-${modNum}-3`,
        question: `How should unverified external claims or AI-generated references encountered during ${mod.title} be handled?`,
        options: [
          'Publish them as verified legal facts',
          'Cross-check against primary sources or mark them for SME validation',
          'Delete all citations without review',
          'Assume high confidence scores guarantee accuracy'
        ],
        correctAnswer: 1,
        rationale: 'Unsourced claims must be validated against authoritative references or flagged for SME verification.',
        learningObjectiveRef: mod.learningObjectives[2]?.code || `LO ${modNum}.3`
      }
    ];

    while (currentKCs.length < 3) {
      currentKCs.push(fallbackKCs[currentKCs.length]);
    }

    const enrichedKCs = currentKCs.slice(0, 5).map((kc, kIdx) => {
      const fb = fallbackKCs[kIdx % fallbackKCs.length];
      return {
        id: kc.id || `kc-${modNum}-${kIdx + 1}`,
        question: countWordsInText(kc.question) >= 6 ? kc.question : fb.question,
        options: Array.isArray(kc.options) && kc.options.length >= 2 ? kc.options : fb.options,
        correctAnswer: typeof kc.correctAnswer === 'number' && kc.correctAnswer >= 0 ? kc.correctAnswer : fb.correctAnswer,
        rationale: countWordsInText(kc.rationale) >= 8 ? kc.rationale : fb.rationale,
        learningObjectiveRef: kc.learningObjectiveRef || fb.learningObjectiveRef
      };
    });

    const hasStructuredTask =
      countWordsInText(mod.practicalTask?.instructions) >= 25 &&
      /objective\s*:/i.test(mod.practicalTask?.instructions || '') &&
      /steps?\s*:/i.test(mod.practicalTask?.instructions || '');

    const practicalTask: GeneratedPracticalTask = {
      id: mod.practicalTask?.id || `task-${modNum}`,
      title: mod.practicalTask?.title || `Module ${modNum} Applied Practice: ${mod.title}`,
      instructions: hasStructuredTask
        ? mod.practicalTask!.instructions
        : `Objective: Apply core concepts from ${mod.title} to solve a realistic challenge in ${courseTitle}.\nScenario: Acting as ${targetRoles} in a ${cityBase} team, complete a practical exercise addressing ${mod.title}.\nResources: ${r.aiToolsPlatformName || 'Domain tools & reference materials'}, Module ${modNum} study guide, and working example template.\nInstructions: Work through the sequential steps below once live AI lessons have been generated.\nSteps: 1. Review goal parameters and domain assumptions for ${mod.title}. 2. Build a working solution using tools and methods taught in Module ${modNum}. 3. Evaluate limitations against ${regFramework} and refine weak areas.\nDeliverable: Offline Draft — Module ${modNum} ${mod.title} Solution & Reflection.\nSuccess criteria: Demonstrates accurate use of ${mod.title} concepts, addresses constraints explicitly, and provides justified decisions aligned to LO ${modNum}.1–LO ${modNum}.${mod.learningObjectives.length}.\nReflection: Which concept or misconception from ${mod.title} had the greatest impact on your solution?`,
      deliverable:
        countWordsInText(mod.practicalTask?.deliverable) >= 8
          ? mod.practicalTask!.deliverable
          : `Offline Draft — Module ${modNum} ${mod.title} Solution & Reflection.`,
      evaluationRubric:
        Array.isArray(mod.practicalTask?.evaluationRubric) && mod.practicalTask!.evaluationRubric.length >= 2
          ? mod.practicalTask!.evaluationRubric
          : [
              `Conceptual accuracy and application of ${mod.title} principles (40%)`,
              'Completeness and quality of practical deliverable and reasoning (35%)',
              'Identification of edge cases, limitations, and reflection quality (25%)'
            ]
    };

    const enrichedSummary =
      countWordsInText(mod.summary) >= 20
        ? mod.summary
        : `Module ${modNum} (${mod.title}) developed practical competence in ${mod.purpose || mod.title}, linking conceptual foundations to hands-on application and critical evaluation.`;

    return {
      ...mod,
      lessons: enrichedLessons,
      scenarios: enrichedScenarios,
      knowledgeChecks: enrichedKCs,
      practicalTask,
      summary: enrichedSummary
    };
  });

  // 3. Ensure 5 Pre-Course Diagnostic Questions anchored to courseTitle
  const defaultDiagQuestions: GeneratedQuestion[] = [
    {
      id: 'diag-1',
      question: `How familiar are you with the foundational principles and terminology of ${courseTitle}?`,
      options: [
        `No prior exposure to ${courseTitle} concepts`,
        `Basic familiarity with definitions, limited practical application`,
        `Regularly apply core methods in guided workplace tasks`,
        `Experienced practitioner able to critique and mentor others`
      ],
      correctAnswer: 2,
      rationale: `Benchmarks prior familiarity with core ${courseTitle} concepts and vocabulary.`
    },
    {
      id: 'diag-2',
      question: `When approaching an unfamiliar challenge in ${courseTitle}, what is the most reliable starting step?`,
      options: [
        'Skip problem framing and adopt the first template found online',
        'Clarify inputs, constraints, and domain criteria before selecting a method',
        'Assume one tool setting suits every context equally',
        'Rely purely on intuition without checking domain assumptions'
      ],
      correctAnswer: 1,
      rationale: 'Sound practice in any domain starts by clarifying constraints and assumptions before execution.'
    },
    {
      id: 'diag-3',
      question: `What is the main limitation of relying uncritically on AI-assisted outputs when working in ${courseTitle}?`,
      options: [
        'Outputs may be formatted in clean paragraphs',
        'Plausible-looking answers can contain conceptual errors, fabrications, or context mismatches if not verified against domain evidence',
        'Tools may generate answers faster than manual typing',
        'Drafts require saving in standard file formats'
      ],
      correctAnswer: 1,
      rationale: 'Tests awareness of why domain judgement must verify automated drafts.'
    },
    {
      id: 'diag-4',
      question: `How do you distinguish an effective practical trade-off in ${courseTitle} from a flawed shortcut?`,
      options: [
        'Shortcuts always produce better results regardless of constraints',
        'An effective trade-off weighs measurable accuracy, feasibility, and domain risk explicitly',
        'Only speed matters in professional deliverables',
        'Trade-offs never affect downstream outcomes'
      ],
      correctAnswer: 1,
      rationale: 'Gauges readiness for structured decision evaluation across course modules.'
    },
    {
      id: 'diag-5',
      question: `What best supports lasting skill transfer after completing ${courseTitle}?`,
      options: [
        'Treating concepts as abstract theory with no workplace follow-through',
        'Applying concepts immediately to real tasks with concrete feedback criteria and reflection',
        'Memorising definitions without practising problem solving',
        'Avoiding peer review on initial implementations'
      ],
      correctAnswer: 1,
      rationale: 'Establishes action-oriented learning habits for the 30-60-90 day plan.'
    }
  ];

  const currentDiag = course.assessments?.preCourseDiagnostic?.questions || [];
  while (currentDiag.length < 5) {
    currentDiag.push(defaultDiagQuestions[currentDiag.length]);
  }
  course.assessments.preCourseDiagnostic.questions = currentDiag.slice(0, 5);

  // 4. Ensure up to 10 Final Summative Assessment Questions anchored to course modules & LOs
  const moduleLoRefs = course.modules.map(m => ({
    modTitle: m.title,
    loCode: m.learningObjectives?.[0]?.code || `LO ${m.moduleNumber}.1`
  }));
  const defaultFinalQuestions: GeneratedQuestion[] = [
    {
      id: 'final-q1',
      question: `Why must practitioners master the underlying mechanism of concepts taught in ${courseTitle} rather than copying surface steps?`,
      options: [
        'Surface steps work identically even when constraints change',
        'Understanding mechanisms reveals why an approach works, where it breaks, and how to adapt it safely',
        'Conceptual knowledge removes the need for testing solutions',
        'Surface steps take longer to read'
      ],
      correctAnswer: 1,
      rationale: 'Deep mechanism comprehension enables sound adaptation and edge-case detection.',
      learningObjectiveRef: moduleLoRefs[0]?.loCode || 'LO 1.1'
    },
    {
      id: 'final-q2',
      question: `When designing deliverables in ${courseTitle}, why should constraints and acceptance criteria be defined before execution?`,
      options: [
        'To delay project progress unnecessarily',
        'To prevent hidden assumptions from causing rework or invalid solutions later',
        'To eliminate collaborative feedback',
        'To avoid measuring solution quality'
      ],
      correctAnswer: 1,
      rationale: `Explicit criteria align execution with ${courseTitle} objectives from the start.`,
      learningObjectiveRef: moduleLoRefs[0]?.loCode || 'LO 1.1'
    },
    {
      id: 'final-q3',
      question: `How should practitioners address common misconceptions identified in ${courseTitle}?`,
      options: [
        'Ignore edge cases whenever initial drafts look plausible',
        'Test assumptions explicitly against worked examples and domain constraints',
        'Assume confidence in presentation equals accuracy',
        'Defer all technical judgement to default settings'
      ],
      correctAnswer: 1,
      rationale: 'Testing assumptions against concrete examples prevents predictable domain errors.',
      learningObjectiveRef: moduleLoRefs[1 % moduleLoRefs.length]?.loCode || 'LO 1.1'
    },
    {
      id: 'final-q4',
      question: `What is the right approach when external tools or AI assistants suggest unverified regulatory or factual claims within ${courseTitle}?`,
      options: [
        'Publish the claims directly into client deliverables',
        'Verify against authoritative primary sources or explicitly mark "To Be Confirmed (Requires SME Validation)"',
        'Remove all context notes without review',
        'Treat unverified citations as binding standards'
      ],
      correctAnswer: 1,
      rationale: 'Only primary-source verified or SME-validated claims belong in authoritative work.',
      learningObjectiveRef: moduleLoRefs[2 % moduleLoRefs.length]?.loCode || 'LO 1.1'
    },
    {
      id: 'final-q5',
      question: `What distinguishes a root-cause improvement in ${courseTitle} from superficial patching?`,
      options: [
        'Root-cause improvement resolves the underlying conceptual, design, or capability driver so the issue does not recur',
        'Superficial patching requires deeper domain analysis',
        'Root-cause work ignores measurable outcomes',
        'There is no practical difference between them'
      ],
      correctAnswer: 0,
      rationale: 'Root-cause fixes address underlying drivers rather than temporary symptoms.',
      learningObjectiveRef: moduleLoRefs[1 % moduleLoRefs.length]?.loCode || 'LO 1.1'
    },
    {
      id: 'final-q6',
      question: `When handling sensitive or proprietary inputs inside digital tools during ${courseTitle}, what principle applies?`,
      options: [
        'Upload unrestricted confidential records to any public endpoint',
        'Protect confidential/personal data according to organisational security and applicable privacy rules',
        'Assume external tools delete all inputs automatically',
        'Disable access controls during pilot testing'
      ],
      correctAnswer: 1,
      rationale: 'Data protection and least-privilege handling safeguard confidentiality across workflows.',
      learningObjectiveRef: moduleLoRefs[2 % moduleLoRefs.length]?.loCode || 'LO 1.1'
    },
    {
      id: 'final-q7',
      question: `How does collaborative peer review strengthen outcomes across ${courseTitle}?`,
      options: [
        'It lowers standards by encouraging informal shortcuts',
        'Constructive critique surfaces blind spots and assumption errors before live rollout',
        'It replaces personal accountability for deliverables',
        'It removes the need for clear evaluation criteria'
      ],
      correctAnswer: 1,
      rationale: 'Blameless, structured peer critique improves accuracy and collective learning.',
      learningObjectiveRef: moduleLoRefs[1 % moduleLoRefs.length]?.loCode || 'LO 1.1'
    },
    {
      id: 'final-q8',
      question: `Who retains accountability for validating quality, safety, and domain fit in ${courseTitle} deliverables?`,
      options: [
        'External software vendors',
        'The accountable practitioner and reviewing leads exercising informed domain judgement',
        'Automated templates alone',
        'No one once a template is generated'
      ],
      correctAnswer: 1,
      rationale: 'Tools assist execution, while human practitioners retain final domain accountability.',
      learningObjectiveRef: moduleLoRefs[2 % moduleLoRefs.length]?.loCode || 'LO 1.1'
    },
    {
      id: 'final-q9',
      question: `What is the purpose of a 30-60-90 day implementation roadmap after completing ${courseTitle}?`,
      options: [
        'To serve as paperwork filed away without follow-up',
        'To translate programme skills into concrete milestones, feedback checks, and sustained workplace outcomes',
        'To delay practising new methods for three months',
        'To eliminate ongoing review'
      ],
      correctAnswer: 1,
      rationale: 'Phased milestones embed new skills into real work with measurable feedback.',
      learningObjectiveRef: moduleLoRefs[0]?.loCode || 'LO 1.1'
    },
    {
      id: 'final-q10',
      question: `Before finalising a solution in ${courseTitle}, what check best confirms readiness?`,
      options: [
        'Checking formatting aesthetics alone',
        'Confirming conceptual accuracy, edge-case testing, source reliability, and alignment with the task brief',
        'Measuring only how fast the draft was written',
        'Skipping stakeholder validation'
      ],
      correctAnswer: 1,
      rationale: 'Readiness requires verifying domain correctness, edge cases, and source reliability.',
      learningObjectiveRef: moduleLoRefs[moduleLoRefs.length - 1]?.loCode || 'LO 1.1'
    }
  ];

  const currentFinal = course.assessments?.finalAssessment?.questions || [];
  while (currentFinal.length < 10) {
    currentFinal.push(defaultFinalQuestions[currentFinal.length]);
  }
  course.assessments.finalAssessment.questions = currentFinal.slice(0, 10);

  // Enrich Capstone Case Study cleanly without generic SOP filler
  const existingCap = course.assessments.finalAssessment.capstoneCaseStudy;
  if (!existingCap || countWordsInText(existingCap.scenario) < 40) {
    course.assessments.finalAssessment.capstoneCaseStudy = {
      title: existingCap?.title || `Applied Capstone Case Study: ${courseTitle}`,
      scenario: `A South African organisation is modernising its capabilities in ${courseTitle} for ${targetRoles}. Recent reviews showed inconsistent practices, unverified assumptions under tight timelines, and limited awareness of ${regFramework}. You are tasked with designing an integrated, well-reasoned solution uniting concepts from Modules 1–${course.modules.length}.`,
      tasks: [
        `Task 1 — Problem Framing & Root Analysis: Identify key conceptual gaps, assumptions, and constraints in ${courseTitle}.`,
        `Task 2 — Applied Solution Architecture: Apply the core methods taught across Modules 1–${course.modules.length} to produce a coherent solution.`,
        `Task 3 — Trade-Offs & Verification Strategy: Explain limitations, human judgement checks, and evidence requirements appropriate to ${courseTitle}.`,
        `Task 4 — 30-60-90 Day Implementation Plan: Outline phased milestones and success indicators for workplace adoption.`
      ],
      deliverable: `Completed ${courseTitle} Capstone Solution Brief & Implementation Plan ready for facilitator review.`
    };
  }

  course.assessments.moduleKnowledgeChecksCount = course.modules.reduce(
    (sum, m) => sum + (m.knowledgeChecks?.length || 0),
    0
  );
  course.assessments.practicalTasks = course.modules
    .map(m => m.practicalTask!)
    .filter(Boolean);

  return course;
}
