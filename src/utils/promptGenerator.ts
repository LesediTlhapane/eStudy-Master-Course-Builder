import { Course } from '../types';

/**
 * Generates the complete, verbatim eStudy South Africa Master Course Generation Prompt
 * exactly as structured in the Master Prompt Template v9.0 document.
 */
export function generateMasterPrompt(course: Course): string {
  const p = course.problem || ({} as any);
  const r = course.research || ({} as any);
  const s = course.structure || ({} as any);
  const ld = course.learningDesign || ({} as any);
  const e = course.ethics || ({} as any);
  const out = course.outputRequirements || ({} as any);
  const cust = course.customisation || ({} as any);

  // Helper to format string or placeholder
  const val = (v: string | undefined | null, placeholder: string) => {
    if (v && v.trim().length > 0) return v.trim();
    return placeholder;
  };

  // 1. Problem Statement
  const targetGroupVal = val(p.targetGroup, '[INSERT: TARGET GROUP]');
  const taskOrSkillVal = val(p.taskOrSkill, '[INSERT: TASK / SKILL]');
  const impactVal = val(
    p.operationalImpact,
    '[INSERT: OPERATIONAL / FINANCIAL / COMPLIANCE / PRODUCTIVITY IMPACT]'
  );
  const problemStatementText = `"This course addresses the inability of ${targetGroupVal} to effectively perform ${taskOrSkillVal}, resulting in ${impactVal}."`;

  // 1.2 Root Causes
  const rc1 = p.rootCauses?.[0] ? p.rootCauses[0].trim() : '[INSERT: ROOT CAUSE 1]';
  const rc2 = p.rootCauses?.[1] ? p.rootCauses[1].trim() : '[INSERT: ROOT CAUSE 2]';

  // 2.1 Sources
  const activeSources = (r.sources || []).filter(
    (src: any) => src && (src.name || src.reference)
  );
  const sourcesFormatted =
    activeSources.length > 0
      ? activeSources
          .map(
            (src: any, i: number) =>
              `[INSERT: LINK ${i + 1} — ${src.name || 'URL or document title'}${
                src.reference ? ` (${src.reference})` : ''
              }]`
          )
          .join('\n')
      : `[INSERT: LINK 1 — URL or document title]\n[INSERT: LINK 2 — URL or document title]\n[INSERT: LINK 3 — URL or document title (add more as needed)]`;

  // 3.4 Benefits
  const orgB1 = s.organisationalBenefits?.[0]
    ? s.organisationalBenefits[0].trim()
    : '[INSERT: ORGANISATIONAL BENEFIT 1]';
  const orgB2 = s.organisationalBenefits?.[1]
    ? s.organisationalBenefits[1].trim()
    : '[INSERT: ORGANISATIONAL BENEFIT 2]';

  const empB1 = s.employeeBenefits?.[0]
    ? s.employeeBenefits[0].trim()
    : '[INSERT: EMPLOYEE BENEFIT 1]';
  const empB2 = s.employeeBenefits?.[1]
    ? s.employeeBenefits[1].trim()
    : '[INSERT: EMPLOYEE BENEFIT 2]';

  const riskB1 = s.riskReductionOutcomes?.[0]
    ? s.riskReductionOutcomes[0].trim()
    : '[INSERT: RISK REDUCTION OUTCOME 1]';
  const riskB2 = s.riskReductionOutcomes?.[1]
    ? s.riskReductionOutcomes[1].trim()
    : '[INSERT: RISK REDUCTION OUTCOME 2]';

  // 3.8 Diagnostic Questions
  const activeDiagnostics = (s.diagnosticQuestions || []).filter(
    (dq: any) => dq && dq.question && dq.question.trim().length > 0
  );
  const diagnosticsFormatted =
    activeDiagnostics.length > 0
      ? activeDiagnostics
          .map(
            (dq: any, i: number) =>
              `[INSERT: DIAGNOSTIC QUESTION ${i + 1} — ${dq.category || 'Domain check'}: ${
                dq.question
              }]`
          )
          .join('\n')
      : `[INSERT: DIAGNOSTIC QUESTION 1 — General domain knowledge]
[INSERT: DIAGNOSTIC QUESTION 2 — Awareness of the problem]
[INSERT: DIAGNOSTIC QUESTION 3 — Current workplace practices]
[INSERT: DIAGNOSTIC QUESTION 4 — AI awareness / digital readiness]
[INSERT: DIAGNOSTIC QUESTION 5 — Ethics / compliance awareness]
[INSERT: DIAGNOSTIC QUESTIONS 6–10 — Add as needed]`;

  // 3.9 Module Overview Table
  const modulesList = course.modules || [];
  const moduleTableFormatted =
    modulesList.length > 0
      ? modulesList
          .map(
            (m, i) =>
              `${i + 1} | ${val(m.title, `[INSERT: MODULE ${i + 1} TITLE]`)} | ${val(
                m.purpose,
                `[INSERT: MODULE ${i + 1} PURPOSE]`
              )} | ${
                m.keySkills && m.keySkills.length > 0
                  ? m.keySkills.join(', ')
                  : `[INSERT: MODULE ${i + 1} KEY SKILLS]`
              }`
          )
          .join('\n')
      : `1 | [INSERT: MODULE 1 TITLE] | [INSERT: MODULE 1 PURPOSE] | [INSERT: MODULE 1 KEY SKILLS]
2 | [INSERT: MODULE 2 TITLE] | [INSERT: MODULE 2 PURPOSE] | [INSERT: MODULE 2 KEY SKILLS]
3 | [INSERT: MODULE 3 TITLE] | [INSERT: MODULE 3 PURPOSE] | [INSERT: MODULE 3 KEY SKILLS]
4 (optional) | [INSERT: MODULE 4 (optional) TITLE] | [INSERT: MODULE 4 (optional) PURPOSE] | [INSERT: MODULE 4 (optional) KEY SKILLS]
5 (optional) | [INSERT: MODULE 5 (optional) TITLE] | [INSERT: MODULE 5 (optional) PURPOSE] | [INSERT: MODULE 5 (optional) KEY SKILLS]`;

  // Module 1, 2, 3 Data extraction
  const m1 = modulesList[0] || ({} as any);
  const m2 = modulesList[1] || ({} as any);
  const m3 = modulesList[2] || ({} as any);

  const m1Req = m1.requirements || ({} as any);
  const m2Req = m2.requirements || ({} as any);
  const m3Req = m3.requirements || ({} as any);

  // Scenarios for Module 2
  const m2Scenarios = m2Req.scenarios || [];
  const m2ScenariosFormatted =
    m2Scenarios.length > 0
      ? m2Scenarios
          .map((sc: any, idx: number) => {
            return `[INSERT: SCENARIO ${idx + 1} TITLE — ${sc.title || `Scenario ${idx + 1}`}]
• Situation: ${val(sc.situation, '[INSERT: SITUATION]')}
• Challenge: ${val(sc.challenge, '[INSERT: CHALLENGE]')}
• Decision Point: ${val(sc.decisionPoint, '[INSERT: DECISION POINT]')}
• Debrief: ${val(sc.debrief, '[INSERT: DEBRIEF]')}`;
          })
          .join('\n\n')
      : `[INSERT: SCENARIO 1 TITLE]
[INSERT: SCENARIO 2 TITLE]
[INSERT: SCENARIO 3 TITLE]
[INSERT: SCENARIO 4 TITLE (recommended)]
[INSERT: SCENARIO 5 TITLE (recommended)]`;

  // AI Scenarios for Module 2
  const m2AiScenarios = m2Req.aiScenarios || [];
  const m2AiScenariosFormatted =
    m2AiScenarios.length > 0
      ? m2AiScenarios
          .map((sc: any, idx: number) => {
            return `[INSERT: AI SCENARIO ${idx + 1} — ${sc.title || `AI Scenario ${idx + 1}`}]
• Situation: ${val(sc.situation, '[INSERT: AI TOOL IN ACTION]')}
• Challenge: ${val(sc.challenge, '[INSERT: CHALLENGE / OUTPUT EVALUATION]')}
• Decision Point: ${val(sc.decisionPoint, '[INSERT: DECISION REQUIRED / HUMAN JUDGMENT]')}
• Debrief: ${val(sc.debrief, '[INSERT: DEBRIEF]')}`;
          })
          .join('\n\n')
      : `[INSERT: AI SCENARIO 1 — AI tool in action, decision required]
[INSERT: AI SCENARIO 2 — AI output evaluation, critical thinking required]`;

  // 5.3 Assessments Table
  const activeAssessments = ld.assessments || [];
  const practicalWeight =
    activeAssessments.find((a: any) => a.type?.includes('Practical'))?.weighting ||
    '[INSERT: WEIGHTING]';
  const finalPassMark =
    activeAssessments.find((a: any) => a.type?.includes('Final'))?.passMark ||
    '[INSERT: PASS MARK %]';

  // 9. Customisation Planning Table
  const activePlanningNotes = (cust.planningNotes || []).filter(
    (pn: any) => pn && (pn.whatChanges || pn.notes)
  );
  const planningTableFormatted =
    activePlanningNotes.length > 0
      ? activePlanningNotes
          .map(
            (pn: any) =>
              `${pn.templateSection || 'Section'} | ${pn.whatChanges || ''} | ${
                pn.notes || '[INSERT: YOUR PLANNING NOTES]'
              }`
          )
          .join('\n')
      : `1. Problem Statement | Industry context, target group, operational impact | [INSERT: YOUR PLANNING NOTES]
2. Sources | Regulation, industry links, AI tools used in domain | [INSERT: YOUR PLANNING NOTES]
3.1 Course Details | Title, code, domain, duration, NQF level | [INSERT: YOUR PLANNING NOTES]
3.6 Target Audience | Job roles, departments, AI literacy baseline | [INSERT: YOUR PLANNING NOTES]
4. Module Content | Scenarios, terminology, tools, procedures | [INSERT: YOUR PLANNING NOTES]
6. Ethics | Domain-specific risks, AI bias context, data laws | [INSERT: YOUR PLANNING NOTES]
7.4 Accessibility | Reading level, language, cultural context | [INSERT: YOUR PLANNING NOTES]`;

  // 9.1 Course History Table
  const activeHistory = cust.historicalCourses || [];
  const historyTableFormatted =
    activeHistory.length > 0
      ? activeHistory
          .map(
            (hc: any) =>
              `${val(hc.courseTitle, '[INSERT: COURSE TITLE]')} | ${val(
                hc.industry,
                '[INSERT: INDUSTRY]'
              )} | ${val(hc.dateBuilt, '[INSERT: DATE]')} | ${val(
                hc.version,
                '[INSERT: VERSION]'
              )}`
          )
          .join('\n')
      : `Use of Artificial Intelligence in Financial Literacy | Financial Services | 2025 | v1.0 — BENCHMARK
[INSERT: COURSE 2 TITLE] | [INSERT: INDUSTRY] | [INSERT: DATE] | [INSERT: VERSION]
[INSERT: COURSE 3 TITLE] | [INSERT: INDUSTRY] | [INSERT: DATE] | [INSERT: VERSION]
[INSERT: COURSE 4 TITLE] | [INSERT: INDUSTRY] | [INSERT: DATE] | [INSERT: VERSION]`;

  const courseTitle = val(s.title || course.name, '[INSERT: COURSE TITLE]');

  return `eStudy South Africa
MASTER COURSE GENERATION PROMPT
– AI-Enhanced Universal Scalable Template
Built on the foundation of the Use of Artificial Intelligence in Financial Literacy course

📋 HOW TO USE THIS TEMPLATE 
This document is a structured prompt template for AI-assisted course generation at eStudy South 
Africa. Each [INSERT: …] bracket is a field you replace with course-specific content before submitting 
the prompt to your AI engine.

✅ Reference Course (Already Built)
Use of Artificial Intelligence in Financial Literacy — use this course as a benchmark for tone, 
depth, and structure when populating this template.

STEP-BY-STEP USAGE:
1. Replace every [INSERT: …] field with the relevant course-specific information.
2. Keep all section headings and numbering exactly as shown.
3. Submit the completed prompt to your AI content engine for full course generation.
4. Review AI output against the Financial Literacy course as a quality benchmark.
5. Deploy to LMS without further structural modification.

🚀 FINAL EXECUTION COMMAND 
You are an expert instructional designer, curriculum developer, and AI learning architect.

Generate a complete, structured, industry-ready training programme for:
${courseTitle} ← e.g. Use of Artificial Intelligence in Financial Literacy

Ensure the course aligns with eStudy South Africa's instructional design standards, is AI-literacy 
informed, scenario-driven, and immediately deployable on an LMS.

================================================================================
1. IDENTIFY PROBLEM / CHALLENGE / DEVELOPMENT AREA 
================================================================================
Define the workplace performance gap clearly. Use the sentence format below, then expand.

1.1 Required Problem Statement 
Complete the following statement:
${problemStatementText}

📌 Example (Financial Literacy course):
"This course addresses the inability of employees and consumers to effectively apply AI tools in 
personal and organisational financial management, resulting in poor financial decisions, vulnerability 
to digital fraud, and missed productivity gains."

1.2 Root Cause Analysis 
Expand on the following:
• Root causes of the problem:
${rc1}
${rc2}
• Process or system failures involved:
${val(p.processFailures, '[INSERT: PROCESS / SYSTEM FAILURE]')}
• Skills or knowledge gaps:
${val(p.skillGaps, '[INSERT: SKILL / KNOWLEDGE GAP]')}
• Organisational or environmental constraints:
${val(p.constraints, '[INSERT: CONSTRAINT]')}

1.3 AI-Specific Considerations (NEW) 
Because this template supports AI-integrated courses, also address:
• AI literacy gap — what AI concepts are unknown to the target group?
${val(p.aiLiteracyGap, '[INSERT: AI LITERACY GAP]')}
• Data and digital readiness — what baseline digital skills are assumed?
${val(p.digitalReadinessLevel, '[INSERT: DIGITAL READINESS LEVEL]')}
• Ethical or compliance risks introduced by AI use in this domain:
${val(p.aiEthicsComplianceRisk, '[INSERT: AI ETHICS / COMPLIANCE RISK]')}

================================================================================
2. SOURCES OF INFORMATION (RESEARCH LAYER) 
================================================================================
Provide the AI engine with all relevant sources. These will be converted into practical, workplace-applicable training content — not theoretical summaries.

2.1 Reference Links (if available) 
${sourcesFormatted}

2.2 Industry / Regulatory Sources 
Specify the regulatory or standards framework applicable to this course:
${val(
    r.regulatoryFramework,
    '[INSERT: REGULATORY FRAMEWORK] ← e.g. POPIA, FSCA, NCA, ISO, King IV, SETA SAQA unit standards'
  )}

2.3 AI & Technology Sources (NEW) 
For courses with AI components, include:
• AI tools or platforms used in this domain:
${val(r.aiToolsPlatformName, '[INSERT: AI TOOL / PLATFORM NAME]')}
• Relevant AI ethics framework:
${val(
    r.aiEthicsFramework,
    '[INSERT: AI ETHICS FRAMEWORK] ← e.g. UNESCO AI Ethics, EU AI Act, SA DCDT AI Policy'
  )}
• Industry case studies or use cases:
${val(r.caseStudyUseCases, '[INSERT: CASE STUDY / USE CASE]')}

================================================================================
3. COURSE STRUCTURE 
================================================================================

3.1 Course Details 
Field | Your Input
Course Name | ${val(s.title || course.name, '[INSERT: COURSE TITLE]')}
Course Code / ID | ${val(s.code || course.code, '[INSERT: COURSE CODE]')}
Industry / Domain | ${val(s.industryDomain, '[INSERT: INDUSTRY DOMAIN]')}
Target Role Group | ${val(s.targetRoles, '[INSERT: TARGET ROLES]')}
AI Integration Level | ${val(
    s.aiIntegrationLevel,
    '[INSERT: AI INTEGRATION LEVEL — e.g. Awareness / Applied / Advanced]'
  )}
SETA / NQF Alignment (if applicable) | ${val(s.setaNqfLevel, '[INSERT: SETA / NQF LEVEL]')}
Language(s) | ${val(s.deliveryLanguages, '[INSERT: DELIVERY LANGUAGE(S)]')}
Estimated Duration | ${val(s.estimatedDuration, '[INSERT: HOURS / CPD CREDITS]')}

3.2 Course Overview 
Provide a 3–5 sentence overview covering:
• Purpose of the course:
${val(s.purposeStatement, '[INSERT: PURPOSE STATEMENT]')}
• Workplace relevance:
${val(s.workplaceRelevance, '[INSERT: WORKPLACE RELEVANCE]')}
• Expected performance improvement:
${val(s.performanceImprovement, '[INSERT: PERFORMANCE IMPROVEMENT]')}
• AI or technology angle of this course:
${val(s.aiTechAngle, '[INSERT: AI / TECH ANGLE]')}

3.3 About the Course 
• What the course covers:
${val(s.scopeSummary, '[INSERT: SCOPE SUMMARY]')}
• Why it is important in today's AI-enabled workplace:
${val(s.aiEraRelevance, '[INSERT: AI-ERA RELEVANCE]')}
• How it improves job performance:
${val(s.performanceLink, '[INSERT: PERFORMANCE LINK]')}

3.4 Benefits of the Course 
Organisational Benefits | Employee Benefits | Risk Reduction
${orgB1} | ${empB1} | ${riskB1}
${orgB2} | ${empB2} | ${riskB2}

3.5 Course Description 
• Scope of learning:
${val(s.scope, '[INSERT: SCOPE]')}
• Key competencies developed:
${val(s.keyCompetencies, '[INSERT: KEY COMPETENCIES]')}
• Real workplace application:
${val(s.realWorldApplication, '[INSERT: REAL WORLD APPLICATION]')}
• AI-specific skills built in this course:
${val(s.aiSkillsDeveloped, '[INSERT: AI SKILLS DEVELOPED]')}

3.6 Target Audience 
• Job roles:
${val(s.jobRoles || s.targetRoles, '[INSERT: JOB ROLES]')}
• Departments:
${val(s.departments, '[INSERT: DEPARTMENTS]')}
• Experience level:
${val(s.experienceLevel, '[INSERT: EXPERIENCE LEVEL]')}
• AI familiarity assumed:
${val(
    s.aiFamiliarityBaseline,
    '[INSERT: AI FAMILIARITY BASELINE] ← e.g. None / Basic / Intermediate'
  )}

3.7 Prerequisites 
• Required knowledge:
${val(s.prerequisiteKnowledge, '[INSERT: PREREQUISITE KNOWLEDGE]')}
• Required experience:
${val(s.prerequisiteExperience, '[INSERT: PREREQUISITE EXPERIENCE]')}
• Tool / system familiarity:
${val(s.toolsSystems, '[INSERT: TOOLS / SYSTEMS]')}
• Digital literacy minimum:
${val(s.digitalLiteracyLevel, '[INSERT: DIGITAL LITERACY LEVEL]')}

3.8 Pre-Course Diagnostic Questions 
Provide 5–10 questions to assess current knowledge and awareness. Include at least 2 questions 
related to AI or technology readiness.
${diagnosticsFormatted}

3.9 Module Overview Table (Minimum 3 Modules) 
# | Module Title | Purpose | Key Skills
${moduleTableFormatted}

================================================================================
4. MODULE STRUCTURE 
================================================================================

MODULE 1: FOUNDATIONAL UNDERSTANDING 
Build foundational awareness before practical application. This module sets the cognitive and 
contextual baseline.

4.1.1 Core Content Requirements 
• Definition of the problem area:
${val(m1Req.problemDefinition, '[INSERT: DEFINITION]')}
• Workplace context:
${val(m1Req.workplaceContext, '[INSERT: WORKPLACE CONTEXT]')}
• Core concepts and terminology:
${val(m1Req.keyTerms, '[INSERT: KEY TERMS / CONCEPTS]')}
• Causes and contributing factors:
${val(m1Req.causes, '[INSERT: CAUSES]')}
• Early warning signs or indicators:
${val(m1Req.warningSigns, '[INSERT: WARNING SIGNS]')}
• Organisational impact:
${val(m1Req.impactStatement, '[INSERT: IMPACT STATEMENT]')}

4.1.2 AI Literacy Foundation (NEW) 
For AI-integrated courses, Module 1 must also include:
• What AI is and is not (demystification):
${val(m1Req.aiDemystification, '[INSERT: AI DEMYSTIFICATION CONTENT]')}
• How AI is used in this specific domain:
${val(m1Req.aiInThisDomain, '[INSERT: AI IN THIS DOMAIN]')}
• Key AI tools relevant to this course:
${val(m1Req.aiToolsOverview, '[INSERT: AI TOOLS OVERVIEW]')}
• Responsible and ethical AI use principles:
${val(m1Req.responsibleAiPrinciples, '[INSERT: RESPONSIBLE AI PRINCIPLES]')}

📌 Financial Literacy Example:
Module 1 covered: What is AI? AI in personal finance (budgeting apps, robo-advisors), AI in banking 
(fraud detection, credit scoring), and ethical use of AI financial data.

--------------------------------------------------------------------------------
MODULE 2: PRACTICAL APPLICATION & INTERVENTION 
--------------------------------------------------------------------------------
Convert knowledge into workplace action. All content must be scenario-based and immediately 
applicable.

4.2.1 Tools, Techniques & Procedures 
• Tools and techniques relevant to this role:
${val(m2Req.toolsAndTechniques, '[INSERT: TOOLS & TECHNIQUES]')}
• Step-by-step workplace procedures:
${val(m2Req.procedureSteps, '[INSERT: PROCEDURE STEPS]')}
• Role responsibilities (manager vs employee):
${val(m2Req.roleResponsibilities, '[INSERT: ROLE RESPONSIBILITIES]')}
• Communication approaches:
${val(m2Req.communicationApproach, '[INSERT: COMMUNICATION APPROACH]')}
• Support mechanisms available:
${val(m2Req.supportMechanisms, '[INSERT: SUPPORT MECHANISMS]')}

4.2.2 Workplace Scenarios (Minimum 3–5 Required) 
Each scenario must include a situation, challenge, decision point, and debrief.
${m2ScenariosFormatted}

4.2.3 AI Application Scenarios (NEW) 
Include at least 2 scenarios demonstrating AI tools in action in this domain:
📌 Financial Literacy Example:
Scenario: A learner uses an AI budgeting tool to analyse their monthly expenses. They must identify 
an AI-generated recommendation that contains an error and explain how they verified it using human 
judgment.
${m2AiScenariosFormatted}

--------------------------------------------------------------------------------
MODULE 3: IMPLEMENTATION & WORKPLACE INTEGRATION 
--------------------------------------------------------------------------------
Ensure learners can translate training into sustained workplace behaviour and organisational change.

4.3.1 Implementation Requirements 
• Implementation strategies:
${val(m3Req.implementationStrategy, '[INSERT: IMPLEMENTATION STRATEGY]')}
• Workplace rollout methods:
${val(m3Req.rolloutMethod, '[INSERT: ROLLOUT METHOD]')}
• Monitoring and evaluation approach:
${val(m3Req.meApproach, '[INSERT: M&E APPROACH]')}
• Continuous improvement practices:
${val(m3Req.improvementCycle, '[INSERT: IMPROVEMENT CYCLE]')}

4.3.2 Mandatory Deliverables 
Module 3 must include all of the following:
${val(
    m3Req.implementationChecklistTitle,
    '[INSERT: IMPLEMENTATION CHECKLIST TITLE] ← e.g. AI Financial Literacy 30-Day Action Plan'
  )}
${val(m3Req.rolloutFrameworkTitle, '[INSERT: CAMPAIGN / ROLLOUT FRAMEWORK TITLE]')}
${val(m3Req.riskComplianceSectionTitle, '[INSERT: RISK & COMPLIANCE SECTION TITLE]')}

4.3.3 AI Governance & Continuous Learning (NEW) 
Because AI evolves rapidly, Module 3 must address:
• How learners stay current with AI developments in this domain:
${val(m3Req.continuousAiLearningApproach, '[INSERT: CONTINUOUS AI LEARNING APPROACH]')}
• Organisational AI policy or governance framework:
${val(m3Req.aiGovernanceFramework, '[INSERT: AI GOVERNANCE FRAMEWORK]')}
• Feedback loop — how AI tool performance is reviewed:
${val(m3Req.aiFeedbackReviewMechanism, '[INSERT: AI FEEDBACK / REVIEW MECHANISM]')}

================================================================================
5. LEARNING DESIGN REQUIREMENTS 
================================================================================
All courses generated using this template must meet the following instructional design standards:

5.1 Core Design Standards 
• Structured module flow with clear learning progression
• Scenario-based learning (minimum 3–5 per module)
• Knowledge checks at the end of each module (minimum 5 questions)
• Real workplace application focus throughout
• Critical thinking development — learners must evaluate, not just recall

5.2 AI-Enhanced Learning Design (NEW) 
For AI-integrated courses, also include:
• Interactive AI tool demonstrations or simulations:
${val(ld.aiDemoSimulationDescription, '[INSERT: AI DEMO / SIMULATION DESCRIPTION]')}
• Prompt engineering exercises (if applicable):
${val(ld.promptExerciseDescription, '[INSERT: PROMPT EXERCISE DESCRIPTION]')}
• AI output evaluation tasks — learners critique AI-generated content:
${val(ld.aiEvaluationTask, '[INSERT: AI EVALUATION TASK]')}
• Human-AI collaboration activities:
${val(ld.collaborationActivity, '[INSERT: COLLABORATION ACTIVITY]')}

5.3 Assessment Design 
Assessment Type | Description | When | Weighting
Pre-Course Diagnostic | Baseline knowledge check | Before Module 1 | Ungraded
Module Knowledge Checks | Per-module MCQ / scenario quiz | End of each module | Formative
Practical Application Task | Workplace-based exercise | After Module 2 | ${practicalWeight}
Final Assessment | Summative — all modules | After Module 3 | Pass Mark: ${finalPassMark}
Post-Course Reflection | Self-assessment against learning goals | After completion | Ungraded

================================================================================
6. ETHICS, COMPLIANCE & AI RESPONSIBILITY 
================================================================================
All eStudy courses must embed ethical principles throughout — not as a standalone module, but 
woven into all scenarios and learning activities.

6.1 Core Ethics Requirements 
• Confidentiality requirements relevant to this domain:
${val(e.confidentialityRequirements, '[INSERT: CONFIDENTIALITY REQUIREMENTS]')}
• Data privacy principles:
${val(e.dataPrivacyFramework, '[INSERT: DATA PRIVACY FRAMEWORK] ← e.g. POPIA, GDPR')}
• Ethical workplace behaviour standards:
${val(e.ethicsStandards, '[INSERT: ETHICS STANDARDS]')}
• Psychological safety considerations:
${val(e.psychologicalSafetyNotes, '[INSERT: PSYCHOLOGICAL SAFETY NOTES]')}
• Responsible decision-making principles:
${val(e.decisionMakingFramework, '[INSERT: DECISION-MAKING FRAMEWORK]')}
• Accountability in workplace actions:
${val(e.accountabilityMechanism, '[INSERT: ACCOUNTABILITY MECHANISM]')}

6.2 AI Ethics & Responsible AI (NEW — MANDATORY) 
For all AI-integrated courses, the following must be explicitly addressed:
• Bias and fairness — how AI bias may affect outcomes in this domain:
${val(e.aiBiasRisk, '[INSERT: AI BIAS RISK]')}
• Transparency — when and how to disclose AI use:
${val(e.aiDisclosureRequirement, '[INSERT: AI DISCLOSURE REQUIREMENT]')}
• Human oversight — decisions that must never be fully delegated to AI:
${val(e.humanOverrideScenarios, '[INSERT: HUMAN OVERRIDE SCENARIOS]')}
• Data sovereignty and consent — who owns the data AI processes:
${val(e.dataSovereigntyContext, '[INSERT: DATA SOVEREIGNTY CONTEXT]')}
• AI and job displacement — honest framing for learners:
${val(e.aiWorkforceImpactNarrative, '[INSERT: AI WORKFORCE IMPACT NARRATIVE]')}
• Applicable AI governance framework:
${val(
    e.aiGovernanceReference,
    '[INSERT: AI GOVERNANCE REFERENCE] ← e.g. SA DCDT National AI Policy, UNESCO AI Ethics'
  )}

📌 Financial Literacy Example:
Learners were taught: AI financial tools may reflect historical bias in credit scoring (e.g. racial or 
gender bias in training data). Always verify AI recommendations against your own financial context 
and seek human advice for major decisions.

================================================================================
7. OUTPUT FORMAT RULES 
================================================================================
The AI-generated course output must meet all of the following standards before LMS deployment:

7.1 Structural Requirements 
• Professionally structured with numbered sections exactly as per this template
• Suitable for LMS deployment without structural modification
• Follows corporate instructional design standards
• Uses formal, inclusive, workplace-appropriate language throughout
• Fully self-contained — no external references needed to interpret the content

7.2 Content Quality Standards 
• All scenarios are realistic, role-specific, and contextualised to the South African workplace
• AI tools referenced are current, accessible, and appropriate for the target audience
• Statistics and claims are sourced from reputable, current industry references
• Examples reflect demographic and sectoral diversity

7.3 AI Content Standards (NEW) 
• All AI tool references must be verifiable and available to learners
• AI-generated content within the course must be clearly labelled as AI-assisted
• Scenarios involving AI must include both successful use cases and failure/limitation cases
• Prompt examples (if included) must be practical and immediately usable

7.4 Accessibility & Inclusivity 
• Reading level appropriate for target audience:
${val(
    out.accessibilityTargetReadingLevel,
    '[INSERT: TARGET READING LEVEL] ← e.g. NQF 4 / Grade 12 equivalent'
  )}
• Language accessibility — plain language principles applied
• Cultural inclusivity — examples reflect South African workplace diversity
• Accommodates varied digital literacy levels

================================================================================
8. FINAL OUTPUT REQUIREMENT 
================================================================================
Produce a complete training programme that meets ALL of the following criteria:

Requirement | Standard
Industry-ready | Deployable in a corporate or regulated environment without modification
Scenario-driven | Minimum 3 scenarios per module; minimum 2 AI-specific scenarios
Performance-focused | Every module links to a measurable workplace behaviour change
Scalable | Structure reusable across industries with only [INSERT] fields changed
AI-integrated | AI tools, ethics, and responsible use embedded throughout
Immediately deployable | Complete, self-contained, LMS-ready on delivery
South Africa compliant | Aligned to applicable SA legislation and workplace standards
Benchmarked | Consistent with the Financial Literacy course quality standard

8.1 Quality Assurance Checklist 
Before submitting for LMS deployment, confirm all of the following:
• All [INSERT: …] fields have been replaced with course-specific content
• Minimum 3 modules with minimum 3 scenarios each
• AI ethics section is fully populated and embedded in at least 2 modules
• Pre-course diagnostic questions included (minimum 5)
• Assessment structure confirmed with pass marks and weightings
• Regulatory/compliance framework identified and referenced
• Language and accessibility standards met
• Output reviewed against the Financial Literacy course benchmark

================================================================================
9. CUSTOMISATION GUIDE FOR NEW COURSES (NEW) 
================================================================================
Use the table below to plan your customisation before populating the template. This is an internal 
planning aid — it is not submitted to the AI engine.

Template Section | What Changes Per Course | Your Notes
${planningTableFormatted}

9.1 Courses Built Using This Template 
Track all courses generated from this master template:
Course Title | Industry | Date Built | Version
${historyTableFormatted}

END OF MASTER PROMPT TEMPLATE v9.0
eStudy South Africa · Confidential & Proprietary · Not for Distribution
`;
}
