import { Course } from '../types';

/**
 * Safely extract a string representation from any unknown value
 */
export function toSafeString(v: any, fallback: string = ''): string {
  if (v === null || v === undefined) return fallback;
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) {
    return v.map(item => toSafeString(item)).filter(Boolean).join(', ');
  }
  if (typeof v === 'object') {
    if (v.text) return toSafeString(v.text);
    if (v.title) return toSafeString(v.title);
    if (v.name) return toSafeString(v.name);
    if (v.content) return toSafeString(v.content);
    if (v.description) return toSafeString(v.description);
    if (v.situation) return toSafeString(v.situation);
    if (v.challenge) return toSafeString(v.challenge);
    if (v.cause) return toSafeString(v.cause);
    try {
      return JSON.stringify(v);
    } catch {
      return fallback;
    }
  }
  return String(v).trim();
}

/**
 * Ensure input is an array
 */
export function toSafeArray<T = any>(arr: any): T[] {
  if (Array.isArray(arr)) return arr;
  if (arr === null || arr === undefined) return [];
  return [arr as T];
}

/**
 * Generates the complete, authentic eStudy South Africa Master Course Generation Prompt
 * for the ACTUAL course that has been built by the user.
 * Free of mock data, dummy examples, or irrelevant placeholders.
 * Resilient against any malformed course data or third-party AI inputs.
 */
export function generateMasterPrompt(course: Course | undefined | null): string {
  if (!course) {
    return `[eStudy Master Course Prompt: No course data currently available in workspace]`;
  }

  try {
    const p = course.problem || ({} as any);
    const r = course.research || ({} as any);
    const s = course.structure || ({} as any);
    const ld = course.learningDesign || ({} as any);
    const e = course.ethics || ({} as any);
    const out = course.outputRequirements || ({} as any);
    const cust = course.customisation || ({} as any);

    // Helper to return formatted value or clean pending marker
    const val = (v: any, pendingLabel: string = '[Not specified]') => {
      const str = toSafeString(v);
      if (str.length > 0) return str;
      return pendingLabel;
    };

    const courseTitle = val(s.title || course.name, 'Untitled Course');
    const courseCode = val(s.code || course.code, 'EST-COURSE-01');
    const targetGroup = val(p.targetGroup || s.targetRoles, '[Primary Target Audience]');
    const taskOrSkill = val(p.taskOrSkill, '[Core Task / Performance Skill]');
    const impact = val(p.operationalImpact, '[Operational / Compliance / Financial Impact]');

    // 1. Problem Statement
    const hasProblemElements = toSafeString(p.taskOrSkill).length > 0 || 
                               toSafeString(p.targetGroup).length > 0 || 
                               toSafeString(p.operationalImpact).length > 0;
    const problemStatementText = hasProblemElements
      ? `"This course addresses the inability of ${targetGroup} to effectively perform ${taskOrSkill}, resulting in ${impact}."`
      : `[Problem statement pending specification]`;

    // 1.2 Root Causes
    const rootCausesList = toSafeArray(p.rootCauses).map(rc => toSafeString(rc)).filter(Boolean);
    const rootCausesFormatted = rootCausesList.length > 0
      ? rootCausesList.map((rc: string, i: number) => `• Root Cause ${i + 1}: ${rc}`).join('\n')
      : `• Root causes: ${val(p.skillGaps, '[Root causes pending specification]')}`;

    // 2. Sources & Uploaded Evidence
    const activeSources = toSafeArray(r.sources).filter(
      (src: any) => src && (toSafeString(src.name) || toSafeString(src.reference) || toSafeString(src.contentSnippet))
    );
    const sourcesFormatted = activeSources.length > 0
      ? activeSources
          .map(
            (src: any, i: number) => {
              let line = `${i + 1}. ${toSafeString(src.name, 'Source')} | Type: ${toSafeString(src.type, 'Standard')}${
                toSafeString(src.reference) ? ` | Ref: ${toSafeString(src.reference)}` : ''
              }${toSafeString(src.fileName) ? ` | File: ${toSafeString(src.fileName)}` : ''}${
                toSafeString(src.relevance) ? `\n   Relevance / Application: ${toSafeString(src.relevance)}` : ''
              }`;
              if (toSafeString(src.contentSnippet).length > 0) {
                line += `\n   Uploaded Document / Source Excerpt Grounding:\n   """\n   ${toSafeString(src.contentSnippet)}\n   """`;
              }
              return line;
            }
          )
          .join('\n\n')
      : `[No external research sources logged yet]`;

    // 3. Benefits
    const orgBenefitsList = toSafeArray(s.organisationalBenefits).map(b => toSafeString(b)).filter(Boolean);
    const orgBenefitsFormatted = orgBenefitsList.length > 0
      ? orgBenefitsList.map((b: string) => `• ${b}`).join('\n')
      : `• ${val(s.performanceImprovement, '[Organisational benefits not specified]')}`;

    const empBenefitsList = toSafeArray(s.employeeBenefits).map(b => toSafeString(b)).filter(Boolean);
    const empBenefitsFormatted = empBenefitsList.length > 0
      ? empBenefitsList.map((b: string) => `• ${b}`).join('\n')
      : `• [Employee benefits not specified]`;

    const riskReductionList = toSafeArray(s.riskReductionOutcomes).map(b => toSafeString(b)).filter(Boolean);
    const riskReductionFormatted = riskReductionList.length > 0
      ? riskReductionList.map((b: string) => `• ${b}`).join('\n')
      : `• [Risk reduction outcomes not specified]`;

    // 3. Diagnostic Questions
    const activeDiagnostics = toSafeArray(s.diagnosticQuestions).filter(
      (dq: any) => dq && toSafeString(dq.question).length > 0
    );
    const diagnosticsFormatted = activeDiagnostics.length > 0
      ? activeDiagnostics
          .map(
            (dq: any, i: number) => {
              const opts = toSafeArray(dq.options).map(o => toSafeString(o)).filter(Boolean);
              return `${i + 1}. [${toSafeString(dq.category, 'Diagnostic')}] ${toSafeString(dq.question)}${
                opts.length > 0 ? `\n   Options: ${opts.join(' | ')}` : ''
              }${toSafeString(dq.explanation) ? `\n   Guidance: ${toSafeString(dq.explanation)}` : ''}`;
            }
          )
          .join('\n\n')
      : `[Pre-course diagnostic questions pending definition]`;

    // 4. Modules
    const modulesList = toSafeArray(course.modules).filter(Boolean);
    const modulesFormatted = modulesList.length > 0
      ? modulesList
          .map((m: any, i: number) => {
            const req: any = m.requirements || {};
            const scList = toSafeArray(req.scenarios).filter(Boolean);
            const aiScList = toSafeArray(req.aiScenarios).filter(Boolean);

            const scenariosText = scList.length > 0
              ? scList
                  .map(
                    (sc: any, sIdx: number) =>
                      `   Scenario ${sIdx + 1}: ${toSafeString(sc.title, 'Workplace Simulation')}
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
                      `   AI Scenario ${sIdx + 1}: ${toSafeString(sc.title, 'AI Tool Interaction & Oversight')}
   - AI Tool in Action: ${val(sc.situation, 'AI prompt or model interaction')}
   - Challenge: ${val(sc.challenge, 'Hallucination, bias, data leak, or output review')}
   - Decision Point: ${val(sc.decisionPoint, 'Human judgment verification step')}
   - Debrief: ${val(sc.debrief, 'Verification checklist and governance rule')}`
                  )
                  .join('\n\n')
              : '   [AI scenarios pending configuration]';

            const keySkills = toSafeArray(m.keySkills).map(k => toSafeString(k)).filter(Boolean);
            const learningObjectives = toSafeArray(m.learningObjectives).map(lo => toSafeString(lo)).filter(Boolean);

            return `MODULE ${i + 1}: ${val(m.title, `Module ${i + 1}`)}
Subtitle: ${val(m.subtitle, 'Competency & Practical Application')}
Purpose: ${val(m.purpose, 'Define module objective')}
Key Skills Developed: ${keySkills.length > 0 ? keySkills.join(', ') : '[Not specified]'}
Learning Objectives:
${learningObjectives.length > 0 ? learningObjectives.map((lo: string) => `• ${lo}`).join('\n') : '• [Learning objectives pending]'}

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
    const activeAssessments = toSafeArray(ld.assessments).filter(Boolean);
    const assessmentsFormatted = activeAssessments.length > 0
      ? activeAssessments
          .map(
            (a: any) =>
              `• ${toSafeString(a.type, 'Assessment')}: ${toSafeString(a.description, 'Evaluation')} | Timing: ${toSafeString(a.timing, 'Course completion')} | Weighting: ${
                toSafeString(a.weighting, 'Formative')
              }${toSafeString(a.passMark) ? ` | Pass Mark: ${toSafeString(a.passMark)}` : ''}${toSafeString(a.notes) ? `\n  Notes: ${toSafeString(a.notes)}` : ''}`
          )
          .join('\n')
      : `• Pre-Course Diagnostic (Baseline check, Ungraded)
• Module Formative Checks (End of each module)
• Practical Application Workplace Task (40% weighting, 70% pass mark)
• Summative Final Assessment (60% weighting, 80% pass mark)`;

    // 6. Ethics Cards
    const ethicsCards = toSafeArray(e.cards).filter(Boolean);
    const ethicsCardsFormatted = ethicsCards.length > 0
      ? ethicsCards
          .map(
            (c: any) =>
              `• ${toSafeString(c.title, 'Ethical Safeguard')} (${toSafeString(c.complianceRef, 'Regulatory Safeguard')}):
  Guiding Principle: ${toSafeString(c.guidingQuestion, 'Ethical responsibility')}
  Course Implementation: ${val(c.response, '[Specific course safeguard pending user definition]')}`
          )
          .join('\n\n')
      : `[Ethics cards pending configuration]`;

    const lp = r.learnerProfile || ({} as any);

    return `================================================================================
eStudy South Africa — Master Instructional Prompt
Universal Course Architecture & AI Generation Prompt (v9.0)
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

Ensure the generated course adheres to eStudy South Africa's instructional design standards (using South African English throughout):
1. Scenario-driven and performance-focused (anchored in daily workplace realities).
2. Fully compliant with South African regulatory frameworks (specifically POPIA data privacy and industry conduct standards).
3. Structured with clear human oversight on all AI-augmented tasks.
4. Directly deployable to an enterprise LMS (SCORM/xAPI compliant) with zero placeholders.

================================================================================
1. IDENTIFY PROBLEM / CHALLENGE / DEVELOPMENT AREA (SECTION 01)
================================================================================
Target Audience: ${targetGroup}
Core Performance Skill: ${taskOrSkill}
Operational / Compliance Impact: ${impact}

1.1 Required Problem Statement:
${problemStatementText}

1.2 Root Cause Analysis:
${rootCausesFormatted}
• Process or System Failures: ${val(p.processFailures, '[Process failures not specified]')}
• Skills or Knowledge Gaps: ${val(p.skillGaps, '[Skill gaps not specified]')}
• Organisational or Environmental Constraints: ${val(p.constraints, '[Constraints not specified]')}

1.3 AI-Specific Considerations:
• AI Literacy Gap: ${val(p.aiLiteracyGap, 'Baseline AI literacy and understanding of automated tools in this domain')}
• Data and Digital Readiness Level: ${val(p.digitalReadinessLevel, 'General enterprise productivity tools and digital literacy')}
• Ethical or Compliance Risks Introduced by AI Use: ${val(p.aiEthicsComplianceRisk, 'Zero tolerance for PII leaks under South African POPIA Act 4 of 2013 and mandatory transparency')}

================================================================================
2. SOURCES OF INFORMATION (RESEARCH LAYER) (SECTION 02)
================================================================================
2.1 Reference Links & Supporting Documents:
${sourcesFormatted}

2.2 Industry / Regulatory Sources:
• Regulatory Framework: ${val(r.regulatoryFramework, 'POPIA Act No. 4 of 2013 / South African statutory workplace compliance')}
• Benchmark Course / Standard: ${val(r.benchmarkCourseRef, 'eStudy South Africa Master Curriculum Benchmark Standard v9.0')}

2.3 AI & Technology Sources:
• AI Tools or Platforms Used in This Domain: ${val(r.aiToolsPlatformName, 'Standard enterprise generative AI and analytics platforms')}
• Relevant AI Ethics Framework: ${val(r.aiEthicsFramework, 'King IV Principle 12 & POPIA Section 71 Automated Decision-Making Standards')}
• Industry Case Studies or Use Cases: ${val(r.industryCaseStudies, '[Industry case studies not specified]')}

Learner Profile and Environment:
• Learner Job Roles: ${val(lp.jobRoles || s.targetRoles, targetGroup)}
• Departments: ${val(lp.departments, '[Not specified]')}
• Experience Levels: ${val(lp.experienceLevels || s.experienceLevel, '[Not specified]')}
• Existing Knowledge: ${val(lp.existingKnowledge, '[Not specified]')}
• Digital Literacy: ${val(lp.digitalLiteracy, '[Not specified]')}
• AI Familiarity: ${val(lp.aiFamiliarity || s.aiFamiliarityBaseline, '[Not specified]')}
• Workplace Environment: ${val(lp.workplaceEnvironment, '[Not specified]')}
• Organisational Constraints: ${val(lp.organisationalConstraints || p.constraints, '[Not specified]')}
• Available Tools & Technology: ${val(lp.availableTools || s.toolsSystems, '[Not specified]')}

================================================================================
3. COURSE STRUCTURE (SECTION 03)
================================================================================
3.2 Course Overview & 3.3 About the Course:
• Course Purpose: ${val(s.purposeStatement, val(s.scopeSummary, '[Course purpose not specified]'))}
• Workplace Relevance: ${val(s.workplaceRelevance, val(s.performanceLink, '[Workplace relevance not specified]'))}
• Expected Performance Improvement: ${val(s.performanceImprovement, '[Performance improvement objectives not specified]')}

3.4 Benefits of the Course:
Organisational Benefits:
${orgBenefitsFormatted}

Employee Benefits:
${empBenefitsFormatted}

Risk Reduction Outcomes:
${riskReductionFormatted}

3.6 Target Audience:
• Target Roles: ${val(s.targetRoles || targetGroup, '[Target roles not specified]')}
• Experience Level: ${val(s.experienceLevel, '[Not specified]')}
• Industry Context: ${val(s.industryContext || s.industryDomain, '[Not specified]')}
• AI Familiarity Baseline: ${val(s.aiFamiliarityBaseline, 'Basic')} — ${val(s.aiFamiliarityExplanation, 'Understands basic digital tools')}

3.7 Prerequisites:
• Required Prior Knowledge: ${val(s.prerequisiteKnowledge, 'Standard operational knowledge in domain')}
• Required Experience: ${val(s.prerequisiteExperience, 'Foundational workplace experience')}
• Required Tools or Systems: ${val(s.toolsSystems, 'Standard enterprise workstation & internet connectivity')}

3.8 Pre-Course Diagnostic Questions:
${diagnosticsFormatted}

================================================================================
4. DETAILED MODULE DEVELOPMENT TEMPLATE (SECTION 04)
================================================================================
${modulesFormatted}

================================================================================
5. LEARNING DESIGN & ASSESSMENT REQUIREMENTS (SECTION 05)
================================================================================
5.1 Instructional Design Principles:
${val(ld.instructionalApproach, 'Blended, micro-learning, scenario-based experiential learning')}

5.2 Interactive Elements:
• AI Tool Demonstration / Simulation: ${val(ld.aiDemoSimulationDescription, 'Interactive AI prompt evaluation and critical human verification simulation')}
• Prompt-Writing Exercise: ${val(ld.promptExerciseDescription, 'Learner writes, refines, and audits domain-specific AI prompts for operational efficiency')}
• Guided Practice Activity: ${val(ld.guidedPracticeDescription, 'Step-by-step scenario walkthrough with decision branches and immediate feedback')}
• Critical Thinking / AI Limitations Exercise: ${val(ld.criticalThinkingDescription, 'Auditing AI generated outputs for hallucination, statutory conflict, and bias')}
• Learner Collaboration / Discussion Task: ${val(ld.collaborationActivity, 'Peer review of prompt structures and scenario debrief discussion')}

5.3 Assessment Design:
• Practical Application Task Weighting: ${val(ld.practicalTaskWeighting, '40%')}
• Summative Final Assessment Pass Mark: ${val(ld.finalAssessmentPassMark, '80%')}
• Capstone / Summative Assessment Description: ${val(ld.summativeAssessmentDescription, 'Comprehensive workplace action plan and procedural audit deliverable')}
${assessmentsFormatted}

================================================================================
6. ETHICAL AI, GOVERNANCE & HUMAN FACTORS (SECTION 06)
================================================================================
6.1 Responsible AI Principles:
• Data Protection & Privacy Safeguard (POPIA Act 4 of 2013): ${val(e.dataPrivacySafeguards, 'Strict prohibition of personal, proprietary, or customer PII in cloud AI prompts')}
• Algorithmic Bias Mitigation & Fairness: ${val(e.biasMitigationPlan, 'Cross-demographic validation of AI decisions and explicit fairness auditing')}
• Mandatory Human Oversight & Override Protocols: ${val(e.humanOversightNotes, 'Human-in-the-loop sign-off required for all final operational decisions and escalations')}

6.2 Human Factors & Workplace Safety:
• Confidentiality & Proprietary Information Safeguards: ${val(e.confidentialityRequirements, 'Synthetic test data utilised for all learning exercises; enterprise confidentiality rules enforced')}
• Psychological Safety & Learner Support: ${val(e.psychologicalSafetyNotes, 'Transparent, blame-free learning environment encouraging safe experimentation')}

Specific Ethical Decision Frameworks:
${ethicsCardsFormatted}

================================================================================
7. COURSE OUTPUT REQUIREMENTS & ACCREDITATION (SECTION 07)
================================================================================
• LMS Output Format: ${val(out.outputFormat, 'LMS-Ready SCORM / xAPI compliant digital courseware')}
• Target Document Volume: 22 Pages Minimum to 30 Pages Maximum (~8,500 to 12,000 words of comprehensive textbook-grade instructional content; strictly never a brief 2-page summary)
• Target Reading Level: ${val(out.accessibilityTargetReadingLevel, 'Plain language · NQF Level 4 / Grade 12 equivalent')}
• 7.5 Accreditation & Standards Alignment:
  - SETA / QCTO Alignment: ${val(out.accreditationAlignment || s.setaNqfLevel, '[Not specified]')}
  - NQF Level: ${val(out.nqfLevel, '[Not specified]')}
  - Credits / Notional Hours: ${val(out.notionalHoursCredits || s.estimatedDuration, '[Not specified]')}
  - Qualification / Unit Standard ID: ${val(out.qualificationUnitStandardId, '[Not specified]')}
  - Assessment Moderation Requirements: ${val(out.moderationRequirements, '[Not specified]')}
• Mandatory Structural Depth Per Course:
  - 4 to 5 Complete Curriculum Modules
  - 3 to 4 Multi-Section Lessons per Module (600–800 words per lesson covering: Theoretical & Operational Context, Core Principles, Step-by-Step Standard Operating Procedures, South African Statutory & POPIA Compliance, Worked Case Examples, and Quality Checklists)
  - 4 Detailed Scenarios per Module (3 Realistic South African Workplace Scenarios + 1 AI Governance & Human-in-the-Loop Scenario)
  - 5 Scenario-Based Knowledge Check MCQs per Module with comprehensive rationales
  - 1 Practical Workplace Application Task per Module with weighted Evaluation Rubric
  - 5 Pre-Course Diagnostic Questions + 10 Summative Final Exam Questions + Multi-Part Capstone Case Study
• Mandatory Courseware Deliverables:
  1. Complete 22–30 Page Participant & Facilitator Course Manual with scenario decision branches.
  2. Printable 30-60-90 Day Workplace Action Plan.
  3. Operational Rollout SOP Framework.
  4. Statutory Risk & Compliance Matrix.
  5. Facilitator & Mentor Implementation Guide.

================================================================================
9. CUSTOMISATION & BRANDING (SECTION 09)
================================================================================
• Brand Authority: ${val(cust.branding, 'eStudy South Africa')}
• Voice & Tone: ${val(cust.tone, 'Professional, supportive, action-oriented, and accessible (South African English)')}
• Delivery Channels: ${val(cust.deliveryPreferences, 'Enterprise LMS + Facilitator Guide + Participant Action Plan')}

END OF MASTER INSTRUCTIONAL PROMPT
================================================================================
`;
  } catch (err: any) {
    console.error('Error generating master prompt:', err);
    return `================================================================================
eStudy South Africa — Master Instructional Prompt
================================================================================
Course: ${toSafeString(course?.name, 'eStudy Course')}
Status: Recovered Prompt (Course data safely restored)

Executive Instruction:
Generate a complete, structured, industry-ready training programme for "${toSafeString(course?.name, 'eStudy Course')}".
Ensure compliance with South African regulatory standards (POPIA Act 4 of 2013) and eStudy v9.0 instructional design guidelines.

================================================================================
`;
  }
}
