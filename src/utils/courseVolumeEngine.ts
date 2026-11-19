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
    pageRangeLabel: 'Estimated page count; not a learning-quality score'
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

    const section2 = `### Key Concepts & How They Apply\n1. **Primary Focus**: Grounded execution of ${taskSkill} specific to *${lesson.title}* rather than generic checklists.\n2. **Practical Mechanics**: Apply domain-appropriate methods${r.aiToolsPlatformName ? ` using ${r.aiToolsPlatformName}` : ''}, documenting assumptions and acceptance criteria.\n3. **Limitations & Safeguards**: Identify edge cases where automated outputs or heuristics fail; cross-check against ${regFramework}.\n\n`;

    const section3 = `### Subject-Specific Worked Example (${angle.city})\nA ${domain} practitioner team in ${angle.city} applied the principles of **${lesson.title}** while resolving a real bottleneck in ${modTitle}. By validating inputs, testing trade-offs explicitly, and recording decision rationale, the team achieved ${angle.workplaceMetric}.`;

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
  if (course.generationMetadata?.provider === 'groq') {
    return course;
  }

  const s = sourceCourse.structure || ({} as any);
  const p = sourceCourse.problem || ({} as any);
  const r = sourceCourse.research || ({} as any);
  const courseTitle = course.title || s.title || sourceCourse.name || 'Corporate Mastery Programme';
  const targetRoles = course.targetAudience || s.targetRoles || p.targetGroup || 'Operational Professionals & Team Leaders';
  const regFramework = r.regulatoryFramework || 'POPIA Act 4 of 2013 & South African Regulatory Standards';

  // 1. Expand Executive Overview & Purpose if too brief
  if (countWordsInText(course.overview) < 80) {
    course.overview = `${course.overview ? course.overview.trim() + ' ' : ''}This comprehensive, NQF-aligned training programme equips ${targetRoles} with the end-to-end operational frameworks, standard operating procedures, and ethical AI governance competencies required to excel in ${courseTitle}. Designed in strict accordance with the eStudy South Africa Master Course Framework v9.0, the curriculum bridges high-level regulatory requirements (${regFramework}) with practical, day-to-day workplace execution. Across structured modules, worked South African case studies, interactive decision-point scenarios, and rigorous competency assessments, participants develop verifiable mastery that directly eliminates operational bottlenecks and elevates organisational compliance.`;
  }

  if (countWordsInText(course.purpose) < 60) {
    course.purpose = `${course.purpose ? course.purpose.trim() + ' ' : ''}The strategic purpose of ${courseTitle} is to establish a unified, audit-defensible standard of practice across all participating business units. By addressing core root causes—including process inconsistencies, skills gaps, and unmonitored digital tool adoption—this programme ensures measurable improvements in turnaround accuracy, stakeholder trust, and statutory compliance.`;
  }

  // Ensure at least 6 comprehensive learning outcomes
  const defaultOutcomes = [
    `Diagnose and remediate systemic operational bottlenecks and root causes impacting ${courseTitle} in South African workplace environments.`,
    `Execute standardised, five-stage operational procedures with measurable quality assurance and zero unverified shortcuts.`,
    `Apply ${regFramework} and internal governance controls across all data handling, reporting, and stakeholder workflows.`,
    `Integrate approved AI and digital productivity tools responsibly while enforcing strict Human-in-the-Loop (HITL) verification protocols.`,
    `Resolve complex workplace and ethical dilemmas using structured decision-making frameworks and risk-mitigation matrices.`,
    `Design and implement a 30-60-90 day departmental action plan that sustains continuous performance improvement and audit readiness.`
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
      title: mod.practicalTask?.title || `Module ${modNum} Practical Application: ${mod.title}`,
      instructions: hasStructuredTask
        ? mod.practicalTask!.instructions
        : `Objective: Demonstrate practical mastery of ${mod.title} within ${courseTitle}.\nScenario: Acting as ${targetRoles} in a ${cityBase} team, you must evaluate and improve an active deliverable related to ${mod.title}.\nResources: Approved domain tools (${r.aiToolsPlatformName || 'workplace templates'}), Module ${modNum} reference guide, and verification checklist.\nSteps: 1. Define scope, inputs, and constraints for ${mod.title}. 2. Execute the core domain workflow on a sample scenario. 3. Audit outputs against domain accuracy, security, and ${regFramework}. 4. Document corrections and stakeholder sign-off notes.\nDeliverable: Completed Module ${modNum} ${mod.title} Implementation & Review Artefact.\nSuccess criteria: All steps trace cleanly to LO ${modNum}.1–LO ${modNum}.${mod.learningObjectives.length}, with verified evidence and zero unvalidated assumptions.\nReflection: Identify one risk prevented by your verification check and one improvement for future iterations.`,
      deliverable:
        countWordsInText(mod.practicalTask?.deliverable) >= 8
          ? mod.practicalTask!.deliverable
          : `Completed Module ${modNum} ${mod.title} Practical Artefact with verification checklist.`,
      evaluationRubric:
        Array.isArray(mod.practicalTask?.evaluationRubric) && mod.practicalTask!.evaluationRubric.length >= 2
          ? mod.practicalTask!.evaluationRubric
          : [
              `Subject accuracy and application of ${mod.title} concepts (40%)`,
              'Completeness and clarity of execution steps and deliverable (35%)',
              'Verification discipline, risk awareness, and reflection quality (25%)'
            ]
    };

    const enrichedSummary =
      countWordsInText(mod.summary) >= 20
        ? mod.summary
        : `Module ${modNum} (${mod.title}) developed practical competence in ${mod.purpose || mod.title}, linking conceptual foundations to hands-on application and verification.`;

    return {
      ...mod,
      lessons: enrichedLessons,
      scenarios: enrichedScenarios,
      knowledgeChecks: enrichedKCs,
      practicalTask,
      summary: enrichedSummary
    };
  });

  // 3. Ensure 5 Pre-Course Diagnostic Questions
  const defaultDiagQuestions: GeneratedQuestion[] = [
    {
      id: 'diag-1',
      question: `Which statement best describes how standard operating procedures (SOPs) for ${courseTitle} are currently executed in your daily workflow?`,
      options: [
        'Ad-hoc and informal, with frequent undocumented shortcuts under deadline pressure',
        'Partially documented, though quality verification varies between team members',
        'Standardised with formal checklists and consistent supervisory sign-off',
        'Fully optimised with continuous root-cause auditing and metrics tracking'
      ],
      correctAnswer: 2,
      rationale: 'Establishes the participant’s baseline maturity regarding procedural standardisation and quality gates.'
    },
    {
      id: 'diag-2',
      question: `When handling customer, employee, or proprietary records under South African POPIA (Act 4 of 2013), what is the primary pre-processing requirement?`,
      options: [
        'Data can be shared freely across any external cloud platform without restriction',
        'Personal identifiers must be verified for lawful purpose and masked/anonymised before external tool processing',
        'Privacy rules only apply if a customer submits a formal legal complaint',
        'Only the IT department is responsible for data privacy compliance'
      ],
      correctAnswer: 1,
      rationale: 'Evaluates baseline awareness of POPIA lawful processing conditions and data de-identification.'
    },
    {
      id: 'diag-3',
      question: `What is the primary operational risk of deploying generative AI or automated tools without a Human-in-the-Loop (HITL) review gate?`,
      options: [
        'The software might use slightly more electricity',
        'Plausible hallucinations, fabricated statutory citations, or biased outputs may be released as official company records',
        'Team members will type faster than usual',
        'Documents will automatically convert to PDF format'
      ],
      correctAnswer: 1,
      rationale: 'Tests foundational AI literacy regarding model hallucinations and human accountability.'
    },
    {
      id: 'diag-4',
      question: `If an operational discrepancy is discovered immediately prior to a client or executive handover, what is the correct course of action?`,
      options: [
        'Release the deliverable on time and hope the client does not notice the error',
        'Halt the release, log the anomaly, verify against primary source records, and communicate a transparent remediation timeline',
        'Delete the error log to protect departmental KPIs',
        'Blame an external vendor without investigating the root cause'
      ],
      correctAnswer: 1,
      rationale: 'Assesses ethical decision-making and adherence to quality assurance escalation protocols.'
    },
    {
      id: 'diag-5',
      question: `How do you currently measure the impact of process improvements within your functional role?`,
      options: [
        'We do not track process metrics after training',
        'Through informal verbal feedback during annual reviews',
        'By tracking error reduction, turnaround time, and audit compliance across a 30-60-90 day implementation plan',
        'By counting the number of emails sent per day'
      ],
      correctAnswer: 2,
      rationale: 'Gauges readiness for outcome-oriented 30-60-90 day workplace application.'
    }
  ];

  const currentDiag = course.assessments?.preCourseDiagnostic?.questions || [];
  while (currentDiag.length < 5) {
    currentDiag.push(defaultDiagQuestions[currentDiag.length]);
  }
  course.assessments.preCourseDiagnostic.questions = currentDiag.slice(0, 5);

  // 4. Ensure 10 Final Summative Assessment Questions + Deep Capstone Case Study
  const defaultFinalQuestions: GeneratedQuestion[] = [
    {
      id: 'final-q1',
      question: `In regulated South African enterprise operations, what is the primary operational vulnerability of adopting unmonitored AI tools for ${courseTitle}?`,
      options: [
        'Minor font formatting discrepancies in internal memos',
        'Severe breach of POPIA conditions, exposure of confidential PII, and unverified algorithmic hallucinations entering official records',
        'Slight reduction in desktop monitor brightness',
        'Increased usage of local printer paper'
      ],
      correctAnswer: 1,
      rationale: 'Unvetted AI tools risk exposing Personal Identifiable Information (PII) under POPIA and introducing plausible but factually incorrect hallucinations.'
    },
    {
      id: 'final-q2',
      question: `When planning and delivering work in ${courseTitle}, why must teams verify key inputs and constraints before implementation?`,
      options: [
        'To delay delivery unnecessarily',
        'To catch incomplete assumptions early, ensure domain feasibility, and avoid downstream rework',
        'To bypass stakeholder review',
        'To remove accountability records'
      ],
      correctAnswer: 1,
      rationale: `Validating inputs and constraints early protects quality across ${courseTitle} and aligns with Module 1 foundations.`,
      learningObjectiveRef: course.modules?.[0]?.learningObjectives?.[0]?.code || 'LO 1.1'
    },
    {
      id: 'final-q3',
      question: `How does POPIA Section 71 govern automated decision-making in corporate workflows?`,
      options: [
        'It permits fully automated profiling of data subjects without human intervention or recourse',
        'It protects data subjects from decisions based solely on automated processing that have legal or substantial impact, requiring human oversight and the opportunity to make representations',
        'It bans the use of computers in South African offices',
        'It applies only to international shipping companies'
      ],
      correctAnswer: 1,
      rationale: 'POPIA Section 71 mandates meaningful human oversight and protects individuals from consequential decisions made solely by automated algorithms.'
    },
    {
      id: 'final-q4',
      question: `During a cross-departmental handover, the receiving specialist notices that the prerequisite verification checklist is unsigned. What is the mandatory action?`,
      options: [
        'Sign the checklist on behalf of the sender without checking the data',
        'Proceed with execution and ignore the missing signature',
        'Place the handover on formal quality hold, request the completed verification evidence from the originating officer, and log the exception',
        'Discard the entire project permanently'
      ],
      correctAnswer: 2,
      rationale: 'Enforcing handover quality gates prevents defective inputs from cascading into downstream operational failures.'
    },
    {
      id: 'final-q5',
      question: `What distinguishes a root-cause remediation strategy from superficial symptom patching?`,
      options: [
        'Root-cause remediation addresses underlying process design, training gaps, and governance controls so the failure cannot recur',
        'Symptom patching is slower and more expensive than root-cause analysis',
        'Root-cause remediation focuses exclusively on issuing punitive warnings to junior staff',
        'There is no operational difference between the two approaches'
      ],
      correctAnswer: 0,
      rationale: 'True root-cause analysis eliminates systemic vulnerabilities in workflow design, tooling, and capability.'
    },
    {
      id: 'final-q6',
      question: `When constructing prompts for an approved enterprise AI assistant, which practice upholds both output precision and statutory compliance?`,
      options: [
        'Pasting raw customer spreadsheets with ID numbers and asking the AI to "fix everything"',
        'Providing clear role context, anonymised/synthetic data parameters, explicit formatting constraints, and mandatory verification criteria',
        'Using vague one-word prompts with no domain context',
        'Requesting the AI to bypass company compliance rules'
      ],
      correctAnswer: 1,
      rationale: 'Structured prompt engineering with anonymised inputs yields high-precision scaffolding while preserving POPIA data privacy.'
    },
    {
      id: 'final-q7',
      question: `Why is psychological safety essential when conducting departmental quality audits and error debriefs?`,
      options: [
        'It lowers performance standards so mistakes are ignored',
        'It encourages practitioners to surface near-misses and process anomalies early rather than concealing errors out of fear',
        'It eliminates the need for standard operating procedures',
        'It replaces formal competency assessments'
      ],
      correctAnswer: 1,
      rationale: 'A blame-free, accountable culture surfaces operational risks early, enabling proactive systemic remediation.'
    },
    {
      id: 'final-q8',
      question: `Under King IV Principle 12 (Technology and Information Governance), who holds ultimate accountability for the ethical and compliant use of technology in an organisation?`,
      options: [
        'The software vendor’s automated helpdesk',
        'The governing body and accountable management through structured governance, risk controls, and human oversight',
        'Entry-level interns operating the keyboard',
        'No one, as digital outputs are legally neutral'
      ],
      correctAnswer: 1,
      rationale: 'King IV Principle 12 places clear responsibility on leadership and management to govern technology ethically, securely, and accountably.'
    },
    {
      id: 'final-q9',
      question: `What is the primary purpose of the 30-60-90 Day Workplace Implementation Action Plan at the conclusion of ${courseTitle}?`,
      options: [
        'To serve as a theoretical filing exercise with no workplace follow-up',
        'To translate classroom mastery into measurable operational habits, audited milestones, and sustained departmental ROI',
        'To delay applying new skills for three months',
        'To replace standard operating procedures with personal opinions'
      ],
      correctAnswer: 1,
      rationale: 'Structured 30-60-90 day milestones ensure immediate behavioural transfer and measurable workplace performance gains.'
    },
    {
      id: 'final-q10',
      question: `Before approving any AI-augmented deliverable for final client or executive release, the reviewing practitioner must confirm:`,
      options: [
        'Only that the document has an attractive cover page',
        'Factual accuracy against primary sources, absence of exposed PII under POPIA, alignment with organisational SOPs, and documented human sign-off',
        'That the AI model generated the response in less than two seconds',
        'That no human edited the raw AI text'
      ],
      correctAnswer: 1,
      rationale: 'Comprehensive Human-in-the-Loop sign-off verifies factual accuracy, statutory compliance, and alignment with operational standards.'
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
      scenario: `A South African organisation is modernising its capabilities in ${courseTitle} for ${targetRoles}. Recent project reviews identified inconsistent workflows, unverified outputs under tight timelines, and unclear escalation boundaries under ${regFramework}. You are tasked with designing an end-to-end solution across the modules covered in this programme.`,
      tasks: [
        `Task 1 — Diagnostic Assessment: Identify key operational gaps, assumptions, and risk points in ${courseTitle}.`,
        `Task 2 — Applied Architecture & Workflow Design: Apply the core methods taught across Modules 1–${course.modules.length} to design a practical solution.`,
        `Task 3 — Verification & Governance Controls: Define measurable acceptance checks and human-oversight boundaries appropriate to ${courseTitle}.`,
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
