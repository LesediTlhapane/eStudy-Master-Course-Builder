import { Course } from '../types';
import { evaluateCourseQA } from './qaEngine';

export function generateMasterPrompt(course: Course): string {
  const p = course.problem || {} as any;
  const r = course.research || {} as any;
  const s = course.structure || {} as any;
  const ld = course.learningDesign || {} as any;
  const e = course.ethics || {} as any;
  const out = course.outputRequirements || {} as any;
  const cust = course.customisation || {} as any;

  const qa = evaluateCourseQA(course);
  const getCheckStatus = (checkId: string) => {
    const item = qa.items.find(i => i.id === checkId);
    if (!item) return 'REQUIRES REVIEW';
    return item.isComplete ? 'CONFIRMED' : 'PENDING REVIEW';
  };

  // Helper to format string or placeholder
  const val = (v: string | undefined | null, placeholder: string) => {
    if (v && v.trim().length > 0) return v.trim();
    return placeholder;
  };

  // Format problem statement formula
  const problemStatement = `"This course addresses the inability of ${val(p.targetGroup, '[INSERT: TARGET GROUP]')} to effectively perform ${val(p.taskOrSkill, '[INSERT: TASK / SKILL]')}, resulting in ${val(p.operationalImpact, '[INSERT: OPERATIONAL / FINANCIAL / COMPLIANCE / PRODUCTIVITY IMPACT]')}"`;

  // Format root causes
  const activeRootCauses = (p.rootCauses || []).filter((rc: string) => rc && rc.trim().length > 0);
  const rootCausesFormatted = activeRootCauses.length > 0
    ? activeRootCauses.map((rc: string) => `• ${rc}`).join('\n')
    : `• ${p.rootCauses?.[0] || '[INSERT: PRIMARY ROOT CAUSE]'}\n• ${p.rootCauses?.[1] || '[INSERT: SECONDARY ROOT CAUSE]'}`;

  // Format sources
  const activeSources = (r.sources || []).filter((src: any) => src && (src.name || src.reference));
  const sourcesFormatted = activeSources.length > 0
    ? activeSources.map((src: any, i: number) => `[SOURCE ${i + 1}] ${src.name || 'Reference'} (${src.type || 'Standard'}) — ${src.reference || ''} | Relevance: ${src.relevance || 'Core'} [Status: ${src.status || 'Verified'}]`).join('\n')
    : '[INSERT: AUTHORITATIVE REFERENCE SOURCES (Minimum 2 Required)]';

  // Format diagnostic questions
  const activeDiagnostics = (s.diagnosticQuestions || []).filter((dq: any) => dq && dq.question && dq.question.trim().length > 0);
  const diagnosticsFormatted = activeDiagnostics.length > 0
    ? activeDiagnostics.map((dq: any, i: number) => `Question ${i + 1} [${dq.category || 'Diagnostic'}]: ${dq.question}${dq.purpose ? ` (Purpose: ${dq.purpose})` : ''}`).join('\n')
    : '[INSERT: PRE-COURSE DIAGNOSTIC QUESTIONS (5–10 Required, with at least 2 AI Readiness Questions)]';

  // Format module overview table
  const activeModules = (course.modules || []);
  const moduleTableFormatted = activeModules.length > 0
    ? activeModules.map((m, i) => 
        `| ${i + 1} | ${m.title || `[INSERT: MODULE ${i + 1} TITLE]`} | ${m.purpose || '[INSERT: MODULE PURPOSE]'} | ${(m.keySkills || []).join(', ') || '[INSERT: KEY SKILLS]'} |`
      ).join('\n')
    : '| 1 | [INSERT: MODULE 1 TITLE] | [INSERT: PURPOSE] | [INSERT: KEY SKILLS] |';

  // Format assessment table
  const activeAssessments = (ld.assessments || []).filter((a: any) => a && (a.description || a.type));
  const assessmentTableFormatted = activeAssessments.length > 0
    ? activeAssessments.map((a: any) => 
        `| ${a.type || 'Assessment'} | ${a.description || '[INSERT: DESCRIPTION]'} | ${a.timing || '[INSERT: TIMING]'} | ${a.weighting || '[INSERT: WEIGHTING]'}${a.passMark ? ` (Pass: ${a.passMark})` : ''} |`
      ).join('\n')
    : '| [INSERT: ASSESSMENT TYPE] | [INSERT: DESCRIPTION] | [INSERT: TIMING] | [INSERT: WEIGHTING] |';

  // Format customisation planning table
  const activePlanningNotes = (cust.planningNotes || []).filter((pn: any) => pn && (pn.whatChanges || pn.notes));
  const planningTableFormatted = activePlanningNotes.length > 0
    ? activePlanningNotes.map((pn: any) => 
        `| ${pn.templateSection || 'Section'} | ${pn.whatChanges || ''} | ${pn.notes || ''} |`
      ).join('\n')
    : '| [Template Section] | [What Changes] | [Notes] |';

  // Format history table
  const activeHistory = (cust.historicalCourses || []).filter((hc: any) => hc && (hc.courseTitle || hc.industry));
  const historyTableFormatted = activeHistory.length > 0
    ? activeHistory.map((hc: any) => 
        `| ${hc.courseTitle || ''} | ${hc.industry || ''} | ${hc.dateBuilt || ''} | ${hc.version || ''} |`
      ).join('\n')
    : '| [Course Title] | [Industry] | [Date Built] | [Version] |';

  // Format Learning Journey
  const activeJourney = (s.learningJourney || []).filter((step: any) => step && (step.title || step.description));
  const journeyFormatted = activeJourney.length > 0
    ? activeJourney.map((step: any) => `${step.stepNumber || 1}. ${step.title || 'Phase'}: ${step.subtitle || ''} — ${step.description || ''}`).join('\n↓\n')
    : '[INSERT: LEARNING JOURNEY FLOW (e.g. 1. Understand → 2. Apply → 3. Evaluate → 4. Embed)]';

  // Format Evidence Standards
  const activeEvidence = (r.evidenceStandards || []).filter((es: string) => es && es.trim().length > 0);
  const evidenceFormatted = activeEvidence.length > 0
    ? activeEvidence.map((es: string) => `• ${es}`).join('\n')
    : '[INSERT: EVIDENCE STANDARDS]';

  // Format Benefits
  const orgBenefits = (s.organisationalBenefits || []).filter((b: string) => b && b.trim().length > 0);
  const empBenefits = (s.employeeBenefits || []).filter((b: string) => b && b.trim().length > 0);
  const riskBenefits = (s.riskReductionOutcomes || []).filter((b: string) => b && b.trim().length > 0);

  return `================================================================================
eStudy South Africa
MASTER COURSE GENERATION PROMPT
– AI-Enhanced Universal Scalable Template (v9.0)
Built on the foundation of the Use of Artificial Intelligence in Financial Literacy course
================================================================================

📋 HOW TO USE THIS TEMPLATE 
This document is a structured prompt template for AI-assisted course generation at eStudy South Africa.
Every field is populated through the eStudy Course Builder digital framework.

✅ Reference Course Benchmark:
"Use of Artificial Intelligence in Financial Literacy" — benchmark for tone, depth, and structure.

STEP-BY-STEP USAGE:
1. All sections and parameters have been populated directly from validated course data.
2. Section headings, standards, and numbering remain 100% compliant with Master Prompt v9.0.
3. Submit this completed prompt to the AI content engine for full course generation.
4. Review AI output against the Financial Literacy course as a quality benchmark.
5. Deploy to LMS without further structural modification.

--------------------------------------------------------------------------------
🚀 FINAL EXECUTION COMMAND 
--------------------------------------------------------------------------------
You are an expert instructional designer, curriculum developer, and AI learning architect for eStudy South Africa.

Generate a complete, structured, industry-ready training programme for:
${s.title || course.name || '[INSERT: COURSE TITLE]'}

Ensure the course aligns with eStudy South Africa's instructional design standards:
- Aligned to South African workplace standards and legislation (POPIA, NQF).
- Minimum 3 modules with clear learning progression.
- Minimum 3–5 workplace scenarios per module + minimum 2 AI application scenarios.
- Minimum 5 knowledge-check questions per module with comprehensive rationales.
- 5–10 diagnostic questions with at least 2 AI / technology readiness questions.
- Clear distinction between AI assistance and mandatory human verification.
- Output ready for LMS deployment.

================================================================================
1. IDENTIFY PROBLEM / CHALLENGE / DEVELOPMENT AREA
================================================================================
Define the workplace performance gap clearly.

1.1 Required Problem Statement
Complete the following statement:
${problemStatement}

📌 Reference Course Benchmark Example:
"This course addresses the inability of employees and consumers to effectively apply AI tools in personal and organisational financial management, resulting in poor financial decisions, vulnerability to digital fraud, and missed productivity gains."

1.2 Root Cause Analysis (10 Core Dimensions)
• Target Group: ${val(p.targetGroup, '[INSERT: TARGET GROUP]')}
• Specific Task or Skill: ${val(p.taskOrSkill, '[INSERT: TASK / SKILL]')}
• Operational Impact: ${val(p.operationalImpact, '[INSERT: OPERATIONAL IMPACT]')}

• Root Causes of the Problem:
${rootCausesFormatted}

• Process or System Failures Involved:
${val(p.processFailures, '[INSERT: PROCESS / SYSTEM FAILURES]')}

• Skills or Knowledge Gaps:
${val(p.skillGaps, '[INSERT: SKILLS / KNOWLEDGE GAPS]')}

• Organisational or Environmental Constraints:
${val(p.constraints, '[INSERT: ORGANISATIONAL / ENVIRONMENTAL CONSTRAINTS]')}

1.3 AI-Specific Considerations
Because this template supports AI-integrated courses, also address:
• AI Literacy Gap — what AI concepts are unknown to the target group:
${val(p.aiLiteracyGap, '[INSERT: AI LITERACY GAP]')}

• Data and Digital Readiness — what baseline digital skills are assumed:
${val(p.digitalReadinessLevel, '[INSERT: DATA & DIGITAL READINESS LEVEL]')}

• Ethical or Compliance Risks Introduced by AI Use in this domain:
${val(p.aiEthicsComplianceRisk, '[INSERT: AI ETHICS & COMPLIANCE RISKS]')}

================================================================================
2. SOURCES OF INFORMATION (RESEARCH LAYER)
================================================================================
Provide the AI engine with all relevant sources. These will be converted into practical, workplace-applicable training content — not theoretical summaries.

2.1 Reference Links & Documents
${sourcesFormatted}

2.2 Industry / Regulatory Sources
Specify the regulatory or standards framework applicable to this course:
${val(r.regulatoryFramework, '[INSERT: REGULATORY / STANDARDS FRAMEWORK (e.g. POPIA Act 4 of 2013, King IV Code of Corporate Governance)]')}

2.3 AI & Technology Sources
For courses with AI components, include:
• AI tools or platforms used in this domain:
${val(r.aiToolsPlatformName, '[INSERT: AI TOOLS OR PLATFORMS]')}

• Relevant AI ethics framework:
${val(r.aiEthicsFramework, '[INSERT: RELEVANT AI ETHICS FRAMEWORK (e.g. UNESCO AI Ethics, SA DCDT Policy Framework)]')}

• Industry case studies or use cases:
${val(r.caseStudyUseCases, '[INSERT: INDUSTRY CASE STUDIES / USE CASES]')}

• Evidence Standards:
${evidenceFormatted}

• Benchmarking Notes:
${val(r.benchmarkingNotes, '[INSERT: BENCHMARKING NOTES]')}

================================================================================
3. COURSE STRUCTURE
================================================================================

3.1 Course Details
| Field | Value |
| --- | --- |
| Course Name | ${val(s.title || course.name, '[INSERT: COURSE NAME]')} |
| Course Code / ID | ${val(s.code || course.code, '[INSERT: COURSE CODE / ID]')} |
| Industry / Domain | ${val(s.industryDomain, '[INSERT: INDUSTRY / DOMAIN]')} |
| Target Role Group | ${val(s.targetRoles, '[INSERT: TARGET ROLE GROUP]')} |
| AI Integration Level | ${val(s.aiIntegrationLevel, '[INSERT: AI INTEGRATION LEVEL]')} |
| SETA / NQF Alignment | ${val(s.setaNqfLevel, '[INSERT: SETA / NQF ALIGNMENT]')} |
| Delivery Language(s) | ${val(s.deliveryLanguages, '[INSERT: DELIVERY LANGUAGES]')} |
| Estimated Duration | ${val(s.estimatedDuration, '[INSERT: ESTIMATED DURATION]')} |
| Delivery Format | ${val(s.deliveryFormat, '[INSERT: DELIVERY FORMAT]')} |
| Difficulty Level | ${val(s.difficultyLevel, '[INSERT: DIFFICULTY LEVEL]')} |
| Number of Modules | ${(course.modules || []).length} (Minimum 3 Required) |

3.2 Course Overview
• Purpose of the course:
${val(s.purposeStatement, '[INSERT: PURPOSE STATEMENT]')}

• Workplace relevance:
${val(s.workplaceRelevance, '[INSERT: WORKPLACE RELEVANCE]')}

• Expected performance improvement:
${val(s.performanceImprovement, '[INSERT: EXPECTED PERFORMANCE IMPROVEMENT]')}

• AI or technology angle of this course:
${val(s.aiTechAngle, '[INSERT: AI / TECHNOLOGY ANGLE]')}

3.3 About the Course
• What the course covers:
${val(s.scopeSummary, '[INSERT: COURSE SCOPE SUMMARY]')}

• Why it is important in today's AI-enabled workplace:
${val(s.aiEraRelevance, '[INSERT: RELEVANCE IN AI ERA]')}

• How it improves job performance:
${val(s.performanceLink, '[INSERT: PERFORMANCE LINK]')}

3.4 Benefits of the Course
• Organisational Benefits:
${orgBenefits.length > 0 ? orgBenefits.map((b: string) => `• ${b}`).join('\n') : '[INSERT: ORGANISATIONAL BENEFITS]'}

• Employee Benefits:
${empBenefits.length > 0 ? empBenefits.map((b: string) => `• ${b}`).join('\n') : '[INSERT: EMPLOYEE BENEFITS]'}

• Risk Reduction Outcomes:
${riskBenefits.length > 0 ? riskBenefits.map((b: string) => `• ${b}`).join('\n') : '[INSERT: RISK REDUCTION OUTCOMES]'}

3.5 Course Description
• Scope of learning: ${val(s.scope, '[INSERT: SCOPE OF LEARNING]')}
• Key competencies developed: ${val(s.keyCompetencies, '[INSERT: KEY COMPETENCIES]')}
• Real workplace application: ${val(s.realWorldApplication, '[INSERT: REAL WORKPLACE APPLICATION]')}
• AI-specific skills built in this course: ${val(s.aiSkillsDeveloped, '[INSERT: AI-SPECIFIC SKILLS BUILT]')}

3.6 Target Audience
• Job roles: ${val(s.jobRoles || s.targetRoles, '[INSERT: TARGET JOB ROLES]')}
• Departments: ${val(s.departments, '[INSERT: DEPARTMENTS]')}
• Experience level: ${val(s.experienceLevel, '[INSERT: EXPERIENCE LEVEL]')}
• AI familiarity assumed: ${val(s.aiFamiliarityBaseline, '[INSERT: AI FAMILIARITY BASELINE]')}

3.7 Prerequisites
• Required knowledge: ${val(s.prerequisiteKnowledge, '[INSERT: PREREQUISITE KNOWLEDGE]')}
• Required experience: ${val(s.prerequisiteExperience, '[INSERT: PREREQUISITE EXPERIENCE]')}
• Tool / system familiarity: ${val(s.toolsSystems, '[INSERT: TOOL / SYSTEM FAMILIARITY]')}
• Digital literacy minimum: ${val(s.digitalLiteracyLevel, '[INSERT: DIGITAL LITERACY MINIMUM]')}

3.8 Pre-Course Diagnostic Questions (5–10 Questions, Minimum 2 AI Readiness)
${diagnosticsFormatted}

3.9 Module Overview Table (Minimum 3 Modules)
| # | Module Title | Purpose | Key Skills |
| --- | --- | --- | --- |
${moduleTableFormatted}

Learning Journey Flow:
${journeyFormatted}

================================================================================
4. MODULE STRUCTURE
================================================================================

${(course.modules || []).map((m, idx) => `
--------------------------------------------------------------------------------
MODULE ${idx + 1}: ${(m.title || `[INSERT: MODULE ${idx + 1} TITLE]`).toUpperCase()}
Purpose: ${val(m.purpose, '[INSERT: MODULE PURPOSE]')}
Learning Objectives (Minimum 3 Bloom-Aligned Objectives):
${(m.learningObjectives || []).filter(obj => obj && obj.trim().length > 0).length > 0 ? (m.learningObjectives || []).filter(obj => obj && obj.trim().length > 0).map(obj => `• ${obj}`).join('\n') : '[INSERT: LEARNING OBJECTIVES (Minimum 3 Bloom-Aligned Objectives)]'}

4.${idx + 1}.1 Core Content Requirements
• Definition of the problem area: ${val(m.requirements?.problemDefinition, '[INSERT: PROBLEM DEFINITION FOR THIS MODULE]')}
• Workplace context: ${val(m.requirements?.workplaceContext, '[INSERT: WORKPLACE CONTEXT]')}
• Core concepts and terminology: ${val(m.requirements?.keyTerms, '[INSERT: CORE CONCEPTS AND TERMINOLOGY]')}
• Causes and contributing factors: ${val(m.requirements?.causes, '[INSERT: CAUSES AND CONTRIBUTING FACTORS]')}
• Early warning signs or indicators: ${val(m.requirements?.warningSigns, '[INSERT: EARLY WARNING SIGNS OR INDICATORS]')}
• Organisational impact: ${val(m.requirements?.impactStatement, '[INSERT: ORGANISATIONAL IMPACT]')}

4.${idx + 1}.2 AI Literacy & Tools Foundation
• AI Demystification: ${val(m.requirements?.aiDemystification, '[INSERT: AI DEMYSTIFICATION]')}
• How AI is used in this domain: ${val(m.requirements?.aiInThisDomain, '[INSERT: HOW AI IS USED IN THIS DOMAIN]')}
• Key AI tools overview: ${val(m.requirements?.aiToolsOverview, '[INSERT: KEY AI TOOLS OVERVIEW]')}
• Responsible AI principles: ${val(m.requirements?.responsibleAiPrinciples, '[INSERT: RESPONSIBLE AI PRINCIPLES]')}

4.${idx + 1}.3 Tools, Techniques & Procedures
• Tools and techniques: ${val(m.requirements?.toolsAndTechniques, '[INSERT: TOOLS AND TECHNIQUES]')}
• Step-by-step procedures: ${val(m.requirements?.procedureSteps, '[INSERT: STEP-BY-STEP PROCEDURES]')}
• Role responsibilities (Manager vs Employee): ${val(m.requirements?.roleResponsibilities, '[INSERT: ROLE RESPONSIBILITIES (Manager vs Employee)]')}
• Communication approach: ${val(m.requirements?.communicationApproach, '[INSERT: COMMUNICATION APPROACH]')}
• Support mechanisms: ${val(m.requirements?.supportMechanisms, '[INSERT: SUPPORT MECHANISMS]')}

4.${idx + 1}.4 Workplace Scenarios (Minimum 3–5 Required Per Module)
${(m.requirements?.scenarios || []).filter(sc => sc && (sc.title || sc.situation)).length > 0 ? (m.requirements?.scenarios || []).filter(sc => sc && (sc.title || sc.situation)).map((sc, scIdx) => 
  `Scenario ${scIdx + 1}: ${sc.title || `Workplace Scenario ${scIdx + 1}`}\n• Situation: ${val(sc.situation, '[INSERT: SITUATION]')}\n• Challenge: ${val(sc.challenge, '[INSERT: CHALLENGE]')}\n• Decision Point: ${val(sc.decisionPoint, '[INSERT: DECISION POINT]')}\n• Debrief: ${val(sc.debrief, '[INSERT: DEBRIEF]')}`
).join('\n\n') : '[INSERT: WORKPLACE SCENARIOS (Minimum 3–5 Required Per Module)]'}

4.${idx + 1}.5 AI Application Scenarios
${(m.requirements?.aiScenarios || []).filter(sc => sc && (sc.title || sc.situation)).length > 0 ? (m.requirements?.aiScenarios || []).filter(sc => sc && (sc.title || sc.situation)).map((sc, scIdx) => 
  `AI Scenario ${scIdx + 1}: ${sc.title || `AI Scenario ${scIdx + 1}`}\n• Situation & AI Tool: ${val(sc.situation, '[INSERT: SITUATION & AI TOOL]')}\n• Challenge & Output: ${val(sc.challenge, '[INSERT: CHALLENGE & OUTPUT]')}\n• Decision Point & Human Verification: ${val(sc.decisionPoint, '[INSERT: DECISION POINT & HUMAN VERIFICATION]')}\n• Debrief: ${val(sc.debrief, '[INSERT: DEBRIEF]')}`
).join('\n\n') : '[INSERT: AI APPLICATION SCENARIOS (Minimum 1 Per Module, 2+ Across Course)]'}

4.${idx + 1}.6 Implementation & Governance Deliverables
• Implementation strategy: ${val(m.requirements?.implementationStrategy, '[INSERT: IMPLEMENTATION STRATEGY]')}
• Rollout method: ${val(m.requirements?.rolloutMethod, '[INSERT: ROLLOUT METHOD]')}
• Monitoring & evaluation: ${val(m.requirements?.meApproach, '[INSERT: MONITORING & EVALUATION APPROACH]')}
• Continuous improvement: ${val(m.requirements?.improvementCycle, '[INSERT: CONTINUOUS IMPROVEMENT APPROACH]')}
• Implementation Checklist: ${val(m.requirements?.implementationChecklistTitle, '[INSERT: IMPLEMENTATION CHECKLIST TITLE]')}
• Rollout Framework: ${val(m.requirements?.rolloutFrameworkTitle, '[INSERT: ROLLOUT FRAMEWORK TITLE]')}
• Risk & Compliance: ${val(m.requirements?.riskComplianceSectionTitle, '[INSERT: RISK & COMPLIANCE SECTION TITLE]')}
• AI Governance Framework: ${val(m.requirements?.aiGovernanceFramework, '[INSERT: AI GOVERNANCE FRAMEWORK]')}
• Continuous Learning Approach: ${val(m.requirements?.continuousAiLearningApproach, '[INSERT: CONTINUOUS LEARNING APPROACH]')}
`).join('\n')}

================================================================================
5. LEARNING DESIGN REQUIREMENTS
================================================================================
All courses generated using this template must meet the following instructional design standards:

5.1 Core Design Standards
• Structured module flow with clear learning progression (Discover → Practise → Evaluate → Apply → Reflect)
• Scenario-based learning: Minimum 3–5 workplace scenarios per module
• Knowledge checks at the end of each module: Minimum 5 questions with remediation rationales
• Real workplace application focus throughout
• Critical thinking development — learners must evaluate, not just recall

Learning Sequence Framework:
1. Discover: Concepts, terminology, and South African workplace context
2. Practise: Guided application or AI tool prompt simulation
3. Evaluate: Critique outputs, identify hallucinations/errors, verify data
4. Apply: Make realistic workplace decisions in realistic scenarios
5. Reflect: Commit to an actionable 30-day workplace practice

5.2 AI-Enhanced Learning Design
• Interactive AI tool demonstrations or simulations:
${val(ld.aiDemoSimulationDescription, '[INSERT: INTERACTIVE AI TOOL DEMONSTRATIONS OR SIMULATIONS]')}

• Prompt engineering exercises (if applicable):
${val(ld.promptExerciseDescription, '[INSERT: PROMPT ENGINEERING EXERCISES]')}

• AI output evaluation tasks — learners critique AI-generated content:
${val(ld.aiEvaluationTask, '[INSERT: AI OUTPUT EVALUATION TASKS]')}

• Human-AI collaboration activities:
${val(ld.collaborationActivity, '[INSERT: HUMAN-AI COLLABORATION ACTIVITIES]')}

5.3 Assessment Design
| Assessment Type | Description | When | Weighting |
| --- | --- | --- | --- |
${assessmentTableFormatted}

================================================================================
6. ETHICS, COMPLIANCE & AI RESPONSIBILITY
================================================================================
All eStudy courses must embed ethical principles throughout — not as a standalone module, but woven into all scenarios and learning activities.

6.1 Core Ethics Requirements
• Confidentiality requirements: ${val(e.confidentialityRequirements, '[INSERT: CONFIDENTIALITY REQUIREMENTS]')}
• Data privacy principles (POPIA Act 4 of 2013): ${val(e.dataPrivacyFramework, '[INSERT: DATA PRIVACY PRINCIPLES (e.g. POPIA Act 4 of 2013)]')}
• Ethical workplace behaviour standards: ${val(e.ethicsStandards, '[INSERT: ETHICAL WORKPLACE BEHAVIOUR STANDARDS]')}
• Psychological safety considerations: ${val(e.psychologicalSafetyNotes, '[INSERT: PSYCHOLOGICAL SAFETY CONSIDERATIONS]')}
• Responsible decision-making principles: ${val(e.decisionMakingFramework, '[INSERT: RESPONSIBLE DECISION-MAKING PRINCIPLES]')}
• Accountability in workplace actions: ${val(e.accountabilityMechanism, '[INSERT: ACCOUNTABILITY IN WORKPLACE ACTIONS]')}

6.2 AI Ethics & Responsible AI (MANDATORY)
• Bias and fairness — how AI bias may affect outcomes in this domain:
${val(e.aiBiasRisk, '[INSERT: AI BIAS AND FAIRNESS SAFEGUARDS]')}

• Transparency — when and how to disclose AI use:
${val(e.aiDisclosureRequirement, '[INSERT: TRANSPARENCY & DISCLOSURE REQUIREMENTS]')}

• Human oversight — decisions that must never be fully delegated to AI:
${val(e.humanOverrideScenarios, '[INSERT: HUMAN OVERSIGHT & OVERRIDE SCENARIOS]')}

• Data sovereignty and consent — who owns the data AI processes:
${val(e.dataSovereigntyContext, '[INSERT: DATA SOVEREIGNTY AND CONSENT REQUIREMENTS]')}

• AI and job displacement — honest framing for learners:
${val(e.aiWorkforceImpactNarrative, '[INSERT: AI & WORKFORCE IMPACT NARRATIVE]')}

• Applicable AI governance framework:
${val(e.aiGovernanceReference, '[INSERT: APPLICABLE AI GOVERNANCE FRAMEWORK]')}

📌 Financial Literacy Example:
"Learners were taught: AI financial tools may reflect historical bias in credit scoring (e.g. racial or gender bias in training data). Always verify AI recommendations against your own financial context and seek human advice for major decisions."

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

7.3 AI Content Standards
• All AI tool references must be verifiable and available to learners
• AI-generated content within the course must be clearly labelled as AI-assisted
• Scenarios involving AI must include both successful use cases and failure/limitation cases
• Prompt examples (if included) must be practical and immediately usable

7.4 Accessibility & Inclusivity
• Reading level appropriate for target audience: ${val(out.accessibilityTargetReadingLevel, '[INSERT: TARGET READING LEVEL (e.g. NQF Level 4 / Grade 12)]')}
• Language accessibility: Plain language principles applied (${out.plainLanguageApplied ? 'Enforced' : 'Standard'})
• Cultural inclusivity: ${val(out.culturalInclusivityNotes, '[INSERT: CULTURAL INCLUSIVITY REQUIREMENTS]')}
• Formatting requirements: ${val(out.formattingRequirements, '[INSERT: FORMATTING REQUIREMENTS]')}

================================================================================
8. FINAL OUTPUT REQUIREMENT
================================================================================
Produce a complete training programme that meets ALL of the following criteria:

| Requirement | Standard |
| --- | --- |
| Industry-ready | Deployable in a corporate or regulated environment without modification |
| Scenario-driven | Minimum 3 scenarios per module; minimum 2 AI-specific scenarios |
| Performance-focused | Every module links to a measurable workplace behaviour change |
| Scalable | Structure reusable across industries with only domain fields changed |
| AI-integrated | AI tools, ethics, and responsible use embedded throughout |
| Immediately deployable | Complete, self-contained, LMS-ready on delivery |
| South Africa compliant | Aligned to applicable SA legislation (POPIA, NQF) and workplace standards |
| Benchmarked | Consistent with the Financial Literacy course quality standard |

8.1 Quality Assurance Checklist Status
• All required fields completed: ${getCheckStatus('chk-req-fields')}
• Authoritative research sources & regulatory references: ${getCheckStatus('chk-sources')}
• Minimum 3 modules configured: ${getCheckStatus('chk-min-modules')} (${(course.modules || []).length} modules)
• Pre-course diagnostic questions (5–10 Qs, min 2 AI readiness): ${getCheckStatus('chk-diagnostics')} (${(s.diagnosticQuestions || []).length} questions)
• Learning objectives defined (min 3 per module): ${getCheckStatus('chk-learning-objectives')}
• Workplace scenarios (min 3 per module): ${getCheckStatus('chk-workplace-scenarios')}
• AI application scenarios included: ${getCheckStatus('chk-ai-scenarios')}
• Instructional progression & 5 knowledge checks per module: ${getCheckStatus('chk-learning-design')}
• Ethics, compliance & POPIA requirements addressed: ${getCheckStatus('chk-ai-ethics')}
• Output formatting & plain language reading level: ${getCheckStatus('chk-accessibility')}
• Quality review against Financial Literacy benchmark: ${course.qa.benchmarkReviewed ? 'CONFIRMED' : 'PENDING REVIEW'}
• Customisation & framework safeguards locked: ${getCheckStatus('chk-customisation')}

================================================================================
9. CUSTOMISATION GUIDE FOR NEW COURSES
================================================================================
Use the table below to plan your customisation before populating the template. This is an internal planning aid — it is not submitted to the AI engine.

| Template Section | What Changes Per Course | Your Notes |
| --- | --- | --- |
${planningTableFormatted}

9.1 Courses Built Using This Template
| Course Title | Industry | Date Built | Version |
| --- | --- | --- | --- |
${historyTableFormatted}

================================================================================
END OF MASTER PROMPT TEMPLATE v9.0
eStudy South Africa · Confidential & Proprietary · Not for Distribution
================================================================================
`;
}

