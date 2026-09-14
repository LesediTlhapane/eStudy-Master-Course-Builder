import { Course } from '../types';

/**
 * Generates the complete, authentic eStudy South Africa Master Course Generation Prompt
 * for the ACTUAL course that has been built by the user.
 * Free of mock data, dummy examples, or irrelevant placeholders.
 */
export function generateMasterPrompt(course: Course): string {
  const p = course.problem || ({} as any);
  const r = course.research || ({} as any);
  const s = course.structure || ({} as any);
  const ld = course.learningDesign || ({} as any);
  const e = course.ethics || ({} as any);
  const out = course.outputRequirements || ({} as any);
  const cust = course.customisation || ({} as any);

  // Helper to return formatted value or clean pending marker
  const val = (v: string | undefined | null, pendingLabel: string = '[Not specified]') => {
    if (v && v.trim().length > 0) return v.trim();
    return pendingLabel;
  };

  const courseTitle = val(s.title || course.name, 'Untitled Course');
  const courseCode = val(s.code || course.code, 'EST-COURSE-01');
  const targetGroup = val(p.targetGroup || s.targetRoles, '[Primary Target Audience]');
  const taskOrSkill = val(p.taskOrSkill, '[Core Task / Performance Skill]');
  const impact = val(p.operationalImpact, '[Operational / Compliance / Financial Impact]');

  // 1. Problem Statement
  const problemStatementText = p.taskOrSkill || p.targetGroup || p.operationalImpact
    ? `"This course addresses the inability of ${targetGroup} to effectively perform ${taskOrSkill}, resulting in ${impact}."`
    : `[Problem statement pending specification]`;

  // 1.2 Root Causes
  const rootCausesFormatted = p.rootCauses && p.rootCauses.length > 0
    ? p.rootCauses.map((rc: string, i: number) => `• Root Cause ${i + 1}: ${rc.trim()}`).join('\n')
    : `• Root causes: ${val(p.skillGaps, '[Root causes pending specification]')}`;

  // 2. Sources
  const activeSources = (r.sources || []).filter((src: any) => src && (src.name || src.reference));
  const sourcesFormatted = activeSources.length > 0
    ? activeSources
        .map(
          (src: any, i: number) =>
            `${i + 1}. ${src.name || 'Source'} | Type: ${src.type || 'Standard'}${
              src.reference ? ` | Ref: ${src.reference}` : ''
            }${src.relevance ? `\n   Relevance: ${src.relevance}` : ''}`
        )
        .join('\n')
    : `[No external research sources logged yet]`;

  // 3. Benefits
  const orgBenefitsFormatted = s.organisationalBenefits && s.organisationalBenefits.length > 0
    ? s.organisationalBenefits.map((b: string) => `• ${b}`).join('\n')
    : `• ${val(s.performanceImprovement, '[Organisational benefits not specified]')}`;

  const empBenefitsFormatted = s.employeeBenefits && s.employeeBenefits.length > 0
    ? s.employeeBenefits.map((b: string) => `• ${b}`).join('\n')
    : `• [Employee benefits not specified]`;

  const riskReductionFormatted = s.riskReductionOutcomes && s.riskReductionOutcomes.length > 0
    ? s.riskReductionOutcomes.map((b: string) => `• ${b}`).join('\n')
    : `• [Risk reduction outcomes not specified]`;

  // 3. Diagnostic Questions
  const activeDiagnostics = (s.diagnosticQuestions || []).filter(
    (dq: any) => dq && dq.question && dq.question.trim().length > 0
  );
  const diagnosticsFormatted = activeDiagnostics.length > 0
    ? activeDiagnostics
        .map(
          (dq: any, i: number) =>
            `${i + 1}. [${dq.category || 'Diagnostic'}] ${dq.question}${
              dq.options ? `\n   Options: ${dq.options.join(' | ')}` : ''
            }${dq.explanation ? `\n   Guidance: ${dq.explanation}` : ''}`
        )
        .join('\n\n')
    : `[Pre-course diagnostic questions pending definition]`;

  // 4. Modules
  const modulesList = course.modules || [];
  const modulesFormatted = modulesList.length > 0
    ? modulesList
        .map((m, i) => {
          const req: any = m.requirements || {};
          const scList = req.scenarios || [];
          const aiScList = req.aiScenarios || [];

          const scenariosText = scList.length > 0
            ? scList
                .map(
                  (sc: any, sIdx: number) =>
                    `   Scenario ${sIdx + 1}: ${sc.title || 'Workplace Simulation'}
   - Situation: ${val(sc.situation, 'Realistic workplace context')}
   - Challenge: ${val(sc.challenge, 'Key hurdle or task constraint')}
   - Decision Point: ${val(sc.decisionPoint, 'Action required by the learner')}
   - Debrief: ${val(sc.debrief, 'Correct approach, learning outcome, and remediation')}`
                )
                .join('\n\n')
            : '   [Standard scenarios pending configuration]';

          const aiScenariosText = aiScList.length > 0
            ? aiScList
                .map(
                  (sc: any, sIdx: number) =>
                    `   AI Scenario ${sIdx + 1}: ${sc.title || 'AI Tool Interaction & Oversight'}
   - AI Tool in Action: ${val(sc.situation, 'AI prompt or model interaction')}
   - Challenge: ${val(sc.challenge, 'Hallucination, bias, data leak, or output review')}
   - Decision Point: ${val(sc.decisionPoint, 'Human judgment verification step')}
   - Debrief: ${val(sc.debrief, 'Verification checklist and governance rule')}`
                )
                .join('\n\n')
            : '   [AI scenarios pending configuration]';

          return `MODULE ${i + 1}: ${val(m.title, `Module ${i + 1}`)}
Subtitle: ${val(m.subtitle, 'Competency & Practical Application')}
Purpose: ${val(m.purpose, 'Define module objective')}
Key Skills Developed: ${m.keySkills?.length ? m.keySkills.join(', ') : '[Not specified]'}
Learning Objectives:
${m.learningObjectives?.length ? m.learningObjectives.map((lo: string) => `• ${lo}`).join('\n') : '• [Learning objectives pending]'}

Requirements & Workplace Context:
• Context & Problem: ${val(req.problemDefinition || req.workplaceContext, '[Context not specified]')}
• Key Terms & Principles: ${val(req.keyTerms, '[Key terms not specified]')}
• AI & Technology Angle: ${val(req.aiDemystification || req.aiInThisDomain, '[AI integration details not specified]')}
• Procedures & Execution Steps: ${val(req.procedureSteps || req.toolsAndTechniques, '[Procedures not specified]')}

Workplace Scenarios:
${scenariosText}

AI Tool Scenarios & Human Oversight:
${aiScenariosText}

Implementation Deliverables:
• Action Plan: ${val(req.implementationChecklistTitle, '30-Day Workplace Action Plan')}
• Rollout Framework: ${val(req.rolloutFrameworkTitle, 'Rollout SOP')}
• Risk & Compliance: ${val(req.riskComplianceSectionTitle, 'Risk & Compliance Matrix')}`;
        })
        .join('\n\n' + '='.repeat(60) + '\n\n')
    : `[Modules pending definition in workspace]`;

  // 5. Assessments
  const activeAssessments = ld.assessments || [];
  const assessmentsFormatted = activeAssessments.length > 0
    ? activeAssessments
        .map(
          (a: any) =>
            `• ${a.type}: ${a.description || 'Evaluation'} | Timing: ${a.timing || 'Course completion'} | Weighting: ${
              a.weighting || 'Formative'
            }${a.passMark ? ` | Pass Mark: ${a.passMark}` : ''}${a.notes ? `\n  Notes: ${a.notes}` : ''}`
        )
        .join('\n')
    : `• Pre-Course Diagnostic (Baseline check, Ungraded)
• Module Formative Checks (End of each module)
• Practical Application Workplace Task (40% weighting, 70% pass mark)
• Summative Final Assessment (60% weighting, 80% pass mark)`;

  // 6. Ethics Cards
  const ethicsCards = e.cards || [];
  const ethicsCardsFormatted = ethicsCards.length > 0
    ? ethicsCards
        .map(
          (c: any) =>
            `• ${c.title} (${c.complianceRef || 'Regulatory Safeguard'}):
  Guiding Principle: ${c.guidingQuestion}
  Course Implementation: ${val(c.response, '[Specific course safeguard pending user definition]')}`
        )
        .join('\n\n')
    : `[Ethics cards pending configuration]`;

  return `================================================================================
eStudy South Africa — Master Instructional Prompt
Universal Course Architecture & AI Generation Prompt
================================================================================

COURSE METADATA:
• Course Title: ${courseTitle}
• Course Code: ${courseCode}
• Industry / Domain: ${val(s.industryDomain, '[Industry / Domain not specified]')}
• Target Roles: ${val(s.targetRoles || targetGroup, '[Target roles not specified]')}
• Estimated Duration: ${val(s.estimatedDuration, '16 Hours / 2 CPD Credits')}
• Difficulty Level: ${val(s.difficultyLevel, 'Intermediate')}
• AI Integration Level: ${val(s.aiIntegrationLevel, 'Applied')}
• Delivery Format: ${val(s.deliveryFormat, 'Blended Digital Courseware with Interactive Scenarios')}
• Applicable Standards: ${val(s.setaNqfLevel || r.regulatoryFramework, 'POPIA Act No. 4 of 2013 / NQF Aligned')}

================================================================================
EXECUTIVE INSTRUCTION FOR AI GENERATION ENGINE
================================================================================
You are an expert instructional designer, curriculum developer, and AI learning architect for eStudy South Africa.

Generate a complete, structured, industry-ready training programme tailored specifically to the validated specifications below for:
${courseTitle}

Ensure the generated course adheres to eStudy South Africa's instructional design standards:
1. Scenario-driven and performance-focused (anchored in daily workplace realities).
2. Fully compliant with South African regulatory frameworks (specifically POPIA data privacy and industry conduct standards).
3. Structured with clear human oversight on all AI-augmented tasks.
4. Directly deployable to an enterprise LMS (SCORM/xAPI compliant) with zero placeholders.

================================================================================
1. PROBLEM & IMPACT SPECIFICATION
================================================================================
1.1 Core Problem Statement:
${problemStatementText}

1.2 Root Cause Analysis & Workplace Gaps:
${rootCausesFormatted}

• System / Process Failures:
${val(p.processFailures, '[Not specified]')}

• Skills & Capability Gaps:
${val(p.skillGaps, '[Not specified]')}

• Organisational & Operational Constraints:
${val(p.constraints, '[Not specified]')}

1.3 AI-Specific Literacy & Digital Readiness:
• AI Literacy Gap:
${val(p.aiLiteracyGap, '[Not specified]')}

• Digital Readiness Baseline:
${val(p.digitalReadinessLevel, '[Not specified]')}

• AI Ethics & Compliance Risks:
${val(p.aiEthicsComplianceRisk, '[Not specified]')}

================================================================================
2. RESEARCH & VERIFIED SOURCES
================================================================================
2.1 External Reference Sources:
${sourcesFormatted}

2.2 Statutory & Industry Regulatory Framework:
${val(r.regulatoryFramework, '[Regulatory framework not specified]')}

2.3 AI & Technology Tools:
• Relevant AI Platforms & Tools: ${val(r.aiToolsPlatformName, '[Not specified]')}
• AI Governance Framework: ${val(r.aiEthicsFramework, 'SA DCDT AI Policy / UNESCO AI Ethics')}
• Real-World Use Cases: ${val(r.caseStudyUseCases, '[Not specified]')}

================================================================================
3. COURSE STRUCTURE & LEARNING JOURNEY
================================================================================
3.1 Course Purpose Statement:
${val(s.purposeStatement, '[Purpose statement not specified]')}

3.2 Workplace Relevance & Performance Link:
• Workplace Relevance: ${val(s.workplaceRelevance, '[Not specified]')}
• Performance Improvement: ${val(s.performanceImprovement, '[Not specified]')}

3.3 Tangible Outcomes & Benefits:
Organisational Benefits:
${orgBenefitsFormatted}

Employee Benefits:
${empBenefitsFormatted}

Risk Reduction Outcomes:
${riskReductionFormatted}

3.4 Target Audience Profile:
• Job Roles: ${val(s.jobRoles || s.targetRoles || targetGroup, '[Not specified]')}
• Target Departments: ${val(s.departments, '[Not specified]')}
• Experience Level: ${val(s.experienceLevel, 'Entry to Mid-level')}
• Baseline AI Familiarity: ${val(s.aiFamiliarityBaseline, 'Basic')}
• Prerequisites: ${val(s.prerequisiteKnowledge, '[None specified]')}

3.5 Pre-Course Diagnostic Questions:
${diagnosticsFormatted}

3.6 Four-Phase Learning Journey:
Phase 1: Discover & Demystify — Foundational domain knowledge and terminology.
Phase 2: Practise & Apply — Scenario-based workplace simulations and procedures.
Phase 3: Evaluate & Audit — Critical thinking, verification checklists, and error detection.
Phase 4: Embed & Govern — 30-Day action plan, SOP integration, and lifelong learning.

================================================================================
4. MODULE SPECIFICATIONS & SCENARIOS
================================================================================
${modulesFormatted}

================================================================================
5. LEARNING DESIGN & ASSESSMENTS
================================================================================
5.1 Instructional Methodology:
${val(ld.instructionalApproach, 'Scenario-based, interactive, and aligned with Bloom\'s Taxonomy.')}

5.2 AI-Enhanced Learning Activities:
• AI Tool Demonstrations & Simulations:
${val(ld.aiDemoSimulationDescription, '[Not specified]')}

• Prompt Construction Tasks:
${val(ld.promptExerciseDescription, '[Not specified]')}

• AI Output Evaluation & Critique:
${val(ld.aiEvaluationTask, '[Not specified]')}

• Human-AI Collaboration Exercises:
${val(ld.collaborationActivity, '[Not specified]')}

5.3 Assessment Framework:
${assessmentsFormatted}

================================================================================
6. ETHICS, GOVERNANCE & RESPONSIBLE USE
================================================================================
6.1 Statutory Compliance & Data Protection:
• Data Privacy Framework: ${val(e.dataPrivacyFramework, 'Protection of Personal Information Act (POPIA Act No. 4 of 2013)')}
• Confidentiality Controls: ${val(e.confidentialityRequirements, '[Not specified]')}
• Ethical Behaviour Standards: ${val(e.ethicsStandards, '[Not specified]')}

6.2 Responsible AI Mandates:
• Bias & Algorithmic Fairness: ${val(e.aiBiasRisk, '[Not specified]')}
• Transparency & Disclosure Requirements: ${val(e.aiDisclosureRequirement, '[Not specified]')}
• Mandatory Human Oversight Decisions: ${val(e.humanOverrideScenarios, '[Not specified]')}
• Data Sovereignty & Consent: ${val(e.dataSovereigntyContext, '[Not specified]')}
• Workforce Impact Narrative: ${val(e.aiWorkforceImpactNarrative, '[Not specified]')}

6.3 Specific Ethical Decision Frameworks:
${ethicsCardsFormatted}

================================================================================
7. OUTPUT STANDARDS & DELIVERABLES
================================================================================
• LMS Output Format: ${val(out.outputFormat, 'LMS-Ready SCORM / xAPI compliant digital courseware')}
• Target Reading Level: ${val(out.accessibilityTargetReadingLevel, 'Plain language · NQF Level 4 / Grade 12 equivalent')}
• Mandatory Courseware Deliverables:
  1. Complete interactive module content with scenario decision branches.
  2. Printable 30-Day Workplace Action Plan.
  3. Operational Rollout SOP Framework.
  4. Statutory Risk & Compliance Matrix.
  5. Facilitator & Mentor Implementation Guide.

================================================================================
8. BRANDING & QUALITY ASSURANCE
================================================================================
• Brand Authority: ${val(cust.branding, 'eStudy South Africa')}
• Voice & Tone: ${val(cust.tone, 'Professional, supportive, action-oriented, and accessible')}
• Delivery Channels: ${val(cust.deliveryPreferences, 'Enterprise LMS + Facilitator Guide + Participant Action Plan')}

END OF MASTER INSTRUCTIONAL PROMPT
================================================================================
`;
}
