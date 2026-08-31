import { Course } from '../types';

export function generateMasterPrompt(course: Course): string {
  const p = course.problem;
  const r = course.research;
  const s = course.structure;
  const ld = course.learningDesign;
  const e = course.ethics;
  const out = course.outputRequirements;
  const cust = course.customisation;

  // Format problem statement
  const problemStatement = `"This course addresses the inability of ${p.targetGroup || '[MISSING: TARGET GROUP]'} to effectively perform ${p.taskOrSkill || '[MISSING: TASK / SKILL]'}, resulting in ${p.operationalImpact || '[MISSING: OPERATIONAL / FINANCIAL / COMPLIANCE / PRODUCTIVITY IMPACT]'}"`;

  // Format root causes
  const rootCausesFormatted = p.rootCauses.length > 0
    ? p.rootCauses.map(rc => `• ${rc}`).join('\n')
    : `• ${p.rootCauses[0] || '[MISSING: ROOT CAUSE 1]'}\n• ${p.rootCauses[1] || '[MISSING: ROOT CAUSE 2]'}`;

  // Format sources
  const sourcesFormatted = r.sources.length > 0
    ? r.sources.map((src, i) => `[LINK ${i + 1}] ${src.name} (${src.type}) — ${src.reference} | Relevance: ${src.relevance}`).join('\n')
    : '[MISSING: REFERENCE LINKS]';

  // Format diagnostic questions
  const diagnosticsFormatted = s.diagnosticQuestions.length > 0
    ? s.diagnosticQuestions.map((dq, i) => `Question ${i + 1} (${dq.category}): ${dq.question}`).join('\n')
    : '[MISSING: PRE-COURSE DIAGNOSTIC QUESTIONS (Minimum 5)]';

  // Format module overview table
  const moduleTableFormatted = course.modules.map((m, i) => 
    `| ${i + 1} | ${m.title} | ${m.purpose} | ${m.keySkills.join(', ')} |`
  ).join('\n');

  // Format Module 1, 2, 3 details
  const m1 = course.modules[0] || {
    title: 'Foundational Understanding',
    purpose: '',
    requirements: {} as any
  };
  const m2 = course.modules[1] || {
    title: 'Practical Application & Intervention',
    purpose: '',
    requirements: {} as any
  };
  const m3 = course.modules[2] || {
    title: 'Implementation & Workplace Integration',
    purpose: '',
    requirements: {} as any
  };

  const m2Scenarios = m2.requirements?.scenarios || [];
  const m2AiScenarios = m2.requirements?.aiScenarios || [];

  const scenariosFormatted = m2Scenarios.map((sc, i) => 
    `Scenario ${i + 1}: ${sc.title}\n• Situation: ${sc.situation}\n• Challenge: ${sc.challenge}\n• Decision Point: ${sc.decisionPoint}\n• Debrief: ${sc.debrief}`
  ).join('\n\n');

  const aiScenariosFormatted = m2AiScenarios.map((sc, i) => 
    `AI Scenario ${i + 1}: ${sc.title}\n• Situation & Tool: ${sc.situation}\n• Challenge & Output: ${sc.challenge}\n• Decision & Human Verification: ${sc.decisionPoint}\n• Debrief: ${sc.debrief}`
  ).join('\n\n');

  // Format assessment table
  const assessmentTableFormatted = ld.assessments.map(a => 
    `| ${a.type} | ${a.description} | ${a.timing} | ${a.weighting}${a.passMark ? ` (Pass: ${a.passMark})` : ''} |`
  ).join('\n');

  // Format customisation planning table
  const planningTableFormatted = cust.planningNotes.map(pn => 
    `| ${pn.templateSection} | ${pn.whatChanges} | ${pn.notes} |`
  ).join('\n');

  // Format history table
  const historyTableFormatted = cust.historicalCourses.map(hc => 
    `| ${hc.courseTitle} | ${hc.industry} | ${hc.dateBuilt} | ${hc.version} |`
  ).join('\n');

  return `================================================================================
eStudy South Africa
MASTER COURSE GENERATION PROMPT
– AI-Enhanced Universal Scalable Template
Built on the foundation of the Use of Artificial Intelligence in Financial Literacy course
================================================================================

📋 HOW TO USE THIS TEMPLATE 
This document is a structured prompt template for AI-assisted course generation at eStudy South Africa.
Every field has been populated through the eStudy Course Builder digital framework.

✅ Reference Course (Already Built)
Use of Artificial Intelligence in Financial Literacy — benchmark for tone, depth, and structure.

STEP-BY-STEP USAGE:
1. All sections and parameters have been populated directly from validated course data.
2. Section headings, standards, and numbering remain 100% compliant with Master Prompt v9.0.
3. Submit this completed prompt to the AI content engine for full course generation.
4. Review AI output against the Financial Literacy course as a quality benchmark.
5. Deploy to LMS without further structural modification.

--------------------------------------------------------------------------------
🚀 FINAL EXECUTION COMMAND 
--------------------------------------------------------------------------------
You are an expert instructional designer, curriculum developer, and AI learning architect.

Generate a complete, structured, industry-ready training programme for:
${s.title || course.name}

Ensure the course aligns with eStudy South Africa's instructional design standards, is AI-literacy informed, scenario-driven, and immediately deployable on an LMS.

================================================================================
1. IDENTIFY PROBLEM / CHALLENGE / DEVELOPMENT AREA
================================================================================
Define the workplace performance gap clearly.

1.1 Required Problem Statement
Complete the following statement:
${problemStatement}

📌 Reference Course Benchmark Example:
"This course addresses the inability of employees and consumers to effectively apply AI tools in personal and organisational financial management, resulting in poor financial decisions, vulnerability to digital fraud, and missed productivity gains."

1.2 Root Cause Analysis
• Root causes of the problem:
${rootCausesFormatted}

• Process or system failures involved:
${p.processFailures || '[NOT SPECIFIED]'}

• Skills or knowledge gaps:
${p.skillGaps || '[NOT SPECIFIED]'}

• Organisational or environmental constraints:
${p.constraints || '[NOT SPECIFIED]'}

1.3 AI-Specific Considerations
Because this template supports AI-integrated courses, also address:
• AI literacy gap — what AI concepts are unknown to the target group:
${p.aiLiteracyGap || '[NOT SPECIFIED]'}

• Data and digital readiness — what baseline digital skills are assumed:
${p.digitalReadinessLevel || '[NOT SPECIFIED]'}

• Ethical or compliance risks introduced by AI use in this domain:
${p.aiEthicsComplianceRisk || '[NOT SPECIFIED]'}

================================================================================
2. SOURCES OF INFORMATION (RESEARCH LAYER)
================================================================================
Provide the AI engine with all relevant sources. These will be converted into practical, workplace-applicable training content — not theoretical summaries.

2.1 Reference Links & Documents
${sourcesFormatted}

2.2 Industry / Regulatory Sources
Specify the regulatory or standards framework applicable to this course:
${r.regulatoryFramework || 'POPIA, King IV, Industry Specific Regulations'}

2.3 AI & Technology Sources
For courses with AI components, include:
• AI tools or platforms used in this domain:
${r.aiToolsPlatformName || 'Generative AI Assistants, Enterprise Automation Tools, Domain Analytics'}

• Relevant AI ethics framework:
${r.aiEthicsFramework || 'UNESCO Recommendation on the Ethics of AI, SA DCDT National AI Policy, EU AI Act'}

• Industry case studies or use cases:
${r.caseStudyUseCases || 'Workplace automation cases, customer communication verifications, risk mitigations'}

• Evidence Standards:
${r.evidenceStandards.map(es => `• ${es}`).join('\n')}

• Benchmarking Notes:
${r.benchmarkingNotes || 'Benchmark against eStudy Financial Literacy Master Reference Course.'}

================================================================================
3. COURSE STRUCTURE
================================================================================

3.1 Course Details
| Field | Value |
| --- | --- |
| Course Name | ${s.title || course.name} |
| Course Code / ID | ${s.code || course.code} |
| Industry / Domain | ${s.industryDomain} |
| Target Role Group | ${s.targetRoles} |
| AI Integration Level | ${s.aiIntegrationLevel} |
| SETA / NQF Alignment | ${s.setaNqfLevel} |
| Delivery Language(s) | ${s.deliveryLanguages} |
| Estimated Duration | ${s.estimatedDuration} |
| Delivery Format | ${s.deliveryFormat} |
| Difficulty Level | ${s.difficultyLevel} |
| Number of Modules | ${course.modules.length} (Minimum 3) |

3.2 Course Overview
• Purpose of the course:
${s.purposeStatement}

• Workplace relevance:
${s.workplaceRelevance}

• Expected performance improvement:
${s.performanceImprovement}

• AI or technology angle of this course:
${s.aiTechAngle}

3.3 About the Course
• What the course covers:
${s.scopeSummary}

• Why it is important in today's AI-enabled workplace:
${s.aiEraRelevance}

• How it improves job performance:
${s.performanceLink}

3.4 Benefits of the Course
• Organisational Benefits:
${s.organisationalBenefits.map(b => `• ${b}`).join('\n')}

• Employee Benefits:
${s.employeeBenefits.map(b => `• ${b}`).join('\n')}

• Risk Reduction Outcomes:
${s.riskReductionOutcomes.map(b => `• ${b}`).join('\n')}

3.5 Course Description
• Scope of learning: ${s.scope}
• Key competencies developed: ${s.keyCompetencies}
• Real workplace application: ${s.realWorldApplication}
• AI-specific skills built in this course: ${s.aiSkillsDeveloped}

3.6 Target Audience
• Job roles: ${s.jobRoles}
• Departments: ${s.departments}
• Experience level: ${s.experienceLevel}
• AI familiarity assumed: ${s.aiFamiliarityBaseline}

3.7 Prerequisites
• Required knowledge: ${s.prerequisiteKnowledge}
• Required experience: ${s.prerequisiteExperience}
• Tool / system familiarity: ${s.toolsSystems}
• Digital literacy minimum: ${s.digitalLiteracyLevel}

3.8 Pre-Course Diagnostic Questions (Minimum 5 Required)
${diagnosticsFormatted}

3.9 Module Overview Table (Minimum 3 Modules)
| # | Module Title | Purpose | Key Skills |
| --- | --- | --- | --- |
${moduleTableFormatted}

Learning Journey Flow:
${s.learningJourney.map(step => `${step.stepNumber}. ${step.title}: ${step.subtitle} — ${step.description}`).join('\n↓\n')}

================================================================================
4. MODULE STRUCTURE
================================================================================

${course.modules.map((m, idx) => `
--------------------------------------------------------------------------------
MODULE ${idx + 1}: ${m.title.toUpperCase()}
Purpose: ${m.purpose}
Learning Objectives:
${m.learningObjectives.map(obj => `• ${obj}`).join('\n')}

4.${idx + 1}.1 Core Content Requirements
• Definition of the problem area: ${m.requirements?.problemDefinition || 'Established in module syllabus'}
• Workplace context: ${m.requirements?.workplaceContext || 'Practical workplace environment'}
• Core concepts and terminology: ${m.requirements?.keyTerms || 'Key industry and procedural terms'}
• Causes and contributing factors: ${m.requirements?.causes || 'Common failure points'}
• Early warning signs or indicators: ${m.requirements?.warningSigns || 'Operational risk signals'}
• Organisational impact: ${m.requirements?.impactStatement || 'Direct workplace performance outcome'}

4.${idx + 1}.2 AI Literacy & Tools Foundation
• AI Demystification: ${m.requirements?.aiDemystification || 'Clear operational distinction of AI capabilities'}
• How AI is used in this domain: ${m.requirements?.aiInThisDomain || 'Core workflow enhancement'}
• Key AI tools overview: ${m.requirements?.aiToolsOverview || 'Approved enterprise tools'}
• Responsible AI principles: ${m.requirements?.responsibleAiPrinciples || 'Human oversight and verification'}

4.${idx + 1}.3 Tools, Techniques & Procedures
• Tools and techniques: ${m.requirements?.toolsAndTechniques || 'Role-specific toolkits'}
• Step-by-step procedures: ${m.requirements?.procedureSteps || 'Standard Operating Procedures'}
• Role responsibilities (Manager vs Employee): ${m.requirements?.roleResponsibilities || 'Defined accountability matrix'}
• Communication approach: ${m.requirements?.communicationApproach || 'Transparent feedback and reporting'}
• Support mechanisms: ${m.requirements?.supportMechanisms || 'Helpdesk, knowledge base and mentors'}

4.${idx + 1}.4 Workplace Scenarios (Minimum 3–5 Required)
${(m.requirements?.scenarios || []).map((sc, scIdx) => 
  `Scenario ${scIdx + 1}: ${sc.title}\n• Situation: ${sc.situation}\n• Challenge: ${sc.challenge}\n• Decision Point: ${sc.decisionPoint}\n• Debrief: ${sc.debrief}`
).join('\n\n') || 'Scenarios aligned with module requirements.'}

4.${idx + 1}.5 AI Application Scenarios
${(m.requirements?.aiScenarios || []).map((sc, scIdx) => 
  `AI Scenario ${scIdx + 1}: ${sc.title}\n• Situation & AI Tool: ${sc.situation}\n• Challenge & Output: ${sc.challenge}\n• Decision Point: ${sc.decisionPoint}\n• Debrief: ${sc.debrief}`
).join('\n\n') || 'AI scenarios embedded in practical exercises.'}

4.${idx + 1}.6 Implementation & Governance Deliverables
• Implementation strategy: ${m.requirements?.implementationStrategy || 'Phased rollout and practical check-ins'}
• Rollout method: ${m.requirements?.rolloutMethod || 'Workplace integration'}
• Monitoring & evaluation: ${m.requirements?.meApproach || 'Manager review and assessment'}
• Continuous improvement: ${m.requirements?.improvementCycle || 'Quarterly review cycle'}
• Implementation Checklist: ${m.requirements?.implementationChecklistTitle || '30-Day Action Plan'}
• Rollout Framework: ${m.requirements?.rolloutFrameworkTitle || 'Departmental Rollout Guide'}
• Risk & Compliance: ${m.requirements?.riskComplianceSectionTitle || 'Risk Mitigation Matrix'}
• AI Governance Framework: ${m.requirements?.aiGovernanceFramework || 'Company AI Policy'}
• Continuous Learning Approach: ${m.requirements?.continuousAiLearningApproach || 'Continuous prompt and tool updates'}
`).join('\n')}

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

Learning Sequence Framework:
1. Discover: Concepts and examples
2. Practise: Guided AI tool activity
3. Evaluate: Critique AI output
4. Apply: Workplace decision
5. Reflect: Commit to next action

5.2 AI-Enhanced Learning Design
• Interactive AI tool demonstrations or simulations:
${ld.aiDemoSimulationDescription}

• Prompt engineering exercises (if applicable):
${ld.promptExerciseDescription}

• AI output evaluation tasks — learners critique AI-generated content:
${ld.aiEvaluationTask}

• Human-AI collaboration activities:
${ld.collaborationActivity}

5.3 Assessment Design
| Assessment Type | Description | When | Weighting |
| --- | --- | --- | --- |
${assessmentTableFormatted}

================================================================================
6. ETHICS, COMPLIANCE & AI RESPONSIBILITY
================================================================================
All eStudy courses must embed ethical principles throughout — not as a standalone module, but woven into all scenarios and learning activities.

6.1 Core Ethics Requirements
• Confidentiality requirements: ${e.confidentialityRequirements}
• Data privacy principles (e.g. POPIA / GDPR): ${e.dataPrivacyFramework}
• Ethical workplace behaviour standards: ${e.ethicsStandards}
• Psychological safety considerations: ${e.psychologicalSafetyNotes}
• Responsible decision-making principles: ${e.decisionMakingFramework}
• Accountability in workplace actions: ${e.accountabilityMechanism}

6.2 AI Ethics & Responsible AI (MANDATORY)
• Bias and fairness — how AI bias may affect outcomes in this domain:
${e.aiBiasRisk}

• Transparency — when and how to disclose AI use:
${e.aiDisclosureRequirement}

• Human oversight — decisions that must never be fully delegated to AI:
${e.humanOverrideScenarios}

• Data sovereignty and consent — who owns the data AI processes:
${e.dataSovereigntyContext}

• AI and job displacement — honest framing for learners:
${e.aiWorkforceImpactNarrative}

• Applicable AI governance framework:
${e.aiGovernanceReference}

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
• Reading level appropriate for target audience: ${out.accessibilityTargetReadingLevel}
• Language accessibility: Plain language principles applied (${out.plainLanguageApplied ? 'Enforced' : 'Standard'})
• Cultural inclusivity: ${out.culturalInclusivityNotes}
• Formatting requirements: ${out.formattingRequirements}

================================================================================
8. FINAL OUTPUT REQUIREMENT
================================================================================
Produce a complete training programme that meets ALL of the following criteria:

| Requirement | Standard |
| --- | --- |
| Industry-ready | Deployable in a corporate or regulated environment without modification |
| Scenario-driven | Minimum 3 scenarios per module; minimum 2 AI-specific scenarios |
| Performance-focused | Every module links to a measurable workplace behaviour change |
| Scalable | Structure reusable across industries with only [INSERT] fields changed |
| AI-integrated | AI tools, ethics, and responsible use embedded throughout |
| Immediately deployable | Complete, self-contained, LMS-ready on delivery |
| South Africa compliant | Aligned to applicable SA legislation (POPIA, NQF) and workplace standards |
| Benchmarked | Consistent with the Financial Literacy course quality standard |

8.1 Quality Assurance Checklist Status
• All [INSERT: …] fields replaced with course-specific content: CONFIRMED
• Minimum 3 modules with minimum 3 scenarios each: CONFIRMED (${course.modules.length} modules configured)
• AI ethics section fully populated and embedded in at least 2 modules: CONFIRMED
• Pre-course diagnostic questions included (minimum 5): CONFIRMED (${s.diagnosticQuestions.length} questions)
• Assessment structure confirmed with pass marks and weightings: CONFIRMED
• Regulatory/compliance framework identified and referenced: CONFIRMED (${r.regulatoryFramework})
• Language and accessibility standards met: CONFIRMED (${out.accessibilityTargetReadingLevel})
• Output reviewed against the Financial Literacy course benchmark: ${course.qa.benchmarkReviewed ? 'VERIFIED' : 'PENDING FINAL SIGN-OFF'}

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
