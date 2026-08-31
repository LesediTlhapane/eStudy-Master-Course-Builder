import { Course } from '../types';

export const blankMasterTemplate: Course = {
  id: 'course-template-v9',
  name: 'New eStudy Course',
  code: 'EST-2026-001',
  status: 'Draft',
  lastModified: 'Just now',
  problem: {
    targetGroup: '',
    taskOrSkill: '',
    operationalImpact: '',
    rootCauses: ['', ''],
    processFailures: '',
    skillGaps: '',
    constraints: '',
    aiLiteracyGap: '',
    digitalReadinessLevel: 'Basic digital familiarity (email, browser, office productivity suites)',
    aiEthicsComplianceRisk: ''
  },
  research: {
    sources: [
      {
        id: 'src-1',
        name: 'Protection of Personal Information Act (POPIA)',
        type: 'Regulatory framework',
        reference: 'Act 4 of 2013, Information Regulator South Africa',
        relevance: 'Defines lawful processing of personal information and data privacy standards in South Africa.',
        status: 'Required'
      },
      {
        id: 'src-2',
        name: 'UNESCO Recommendation on the Ethics of Artificial Intelligence',
        type: 'Ethics framework',
        reference: 'UNESCO General Conference 2021',
        relevance: 'Provides international consensus principles for human oversight, fairness, and accountability.',
        status: 'Verified'
      }
    ],
    regulatoryFramework: 'POPIA (Act 4 of 2013), King IV Report on Corporate Governance',
    aiToolsPlatformName: 'Enterprise Generative AI, Workplace Digital Assistants',
    aiEthicsFramework: 'UNESCO AI Ethics & SA DCDT National AI Policy Framework',
    caseStudyUseCases: 'Workplace automation cases, customer communication verifications, risk mitigations',
    evidenceStandards: [
      'All factual claims backed by South African regulatory standards or peer-reviewed research',
      'AI tool workflows tested for hallucination and bias risks before inclusion'
    ],
    benchmarkingNotes: 'Directly benchmarked against eStudy Financial Literacy Master Reference Course standards.',
    benchmarkCourseRef: 'Use of Artificial Intelligence in Financial Literacy (v1.0)'
  },
  structure: {
    title: '',
    code: 'EST-NEW-01',
    industryDomain: 'Cross-Sector / Corporate',
    targetRoles: '',
    aiIntegrationLevel: 'Applied',
    setaNqfLevel: 'NQF Level 5 (Aligned)',
    deliveryLanguages: 'English (South African Business Standard)',
    estimatedDuration: '6 hours',
    deliveryFormat: 'Self-paced online with interactive activities',
    difficultyLevel: 'Foundational',
    purposeStatement: '',
    workplaceRelevance: '',
    performanceImprovement: '',
    aiTechAngle: '',
    scopeSummary: '',
    aiEraRelevance: '',
    performanceLink: '',
    organisationalBenefits: [
      'Standardised, compliant workplace AI adoption across departments',
      'Reduced exposure to data privacy breaches and regulatory fines',
      'Measurable productivity gains through safe automation'
    ],
    employeeBenefits: [
      'Confidence in using modern digital and AI tools safely',
      'Clear understanding of role accountability and human oversight',
      'Practical prompt skills and output critique abilities'
    ],
    riskReductionOutcomes: [
      'Elimination of confidential data entry into unvetted public AI platforms',
      'Prevention of customer miscommunication from unverified AI drafts'
    ],
    scope: 'Foundational literacy, practical tooling, workplace scenarios, and organizational governance.',
    keyCompetencies: 'AI literacy, prompt engineering, critical output verification, POPIA compliance, human oversight.',
    realWorldApplication: 'Direct workplace workflows, customer communications, analysis, and reporting.',
    aiSkillsDeveloped: 'Effective prompting, hallucination detection, privacy redaction, task delegation.',
    jobRoles: 'Knowledge workers, team leads, operations analysts, customer service consultants',
    departments: 'Operations, Customer Support, Marketing, Finance, HR',
    experienceLevel: 'Entry to Mid-level employees',
    aiFamiliarityBaseline: 'Basic',
    prerequisiteKnowledge: 'Standard business workflow familiarity and basic digital fluency',
    prerequisiteExperience: 'At least 6 months experience in primary role',
    toolsSystems: 'Web browser, modern office productivity tools, corporate email',
    digitalLiteracyLevel: 'Intermediate computer and internet usage',
    diagnosticQuestions: [
      {
        id: 'diag-1',
        category: 'General domain',
        question: 'How do you currently use digital automation or AI tools in your daily job responsibilities?'
      },
      {
        id: 'diag-2',
        category: 'Problem awareness',
        question: 'What are the main risks when using computer-generated text or data in official customer communications?'
      },
      {
        id: 'diag-3',
        category: 'Current practices',
        question: 'What steps do you currently take to verify accuracy before sending an AI-assisted report?'
      },
      {
        id: 'diag-4',
        category: 'AI / digital readiness',
        question: 'What is the fundamental difference between a web search engine and a generative AI language model?'
      },
      {
        id: 'diag-5',
        category: 'Ethics & compliance',
        question: 'Under POPIA, what categories of data must NEVER be pasted into public, third-party AI chat tools?'
      }
    ],
    learningJourney: [
      {
        id: 'step-1',
        stepNumber: 1,
        title: 'Understand',
        subtitle: 'AI concepts & limits',
        description: 'Demystify underlying technology, set realistic expectations, and identify operational boundaries.'
      },
      {
        id: 'step-2',
        stepNumber: 2,
        title: 'Apply',
        subtitle: 'Tools in real work',
        description: 'Practice high-impact workflows, prompt structures, and everyday productivity techniques.'
      },
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'Evaluate',
        subtitle: 'Outputs & risks',
        description: 'Critique AI outputs, detect hallucinations or bias, and apply rigorous verification checks.'
      },
      {
        id: 'step-4',
        stepNumber: 4,
        title: 'Embed',
        subtitle: 'Responsible practice',
        description: 'Sustain ethical standards, data privacy compliance, and transparent team collaboration.'
      }
    ]
  },
  modules: [
    {
      id: 'mod-1',
      moduleNumber: 1,
      title: 'Introduction to AI Literacy',
      subtitle: 'Foundational understanding',
      purpose: 'Build foundational awareness before practical application. This module sets the cognitive and contextual baseline.',
      keySkills: ['AI Demystification', 'Core Terminology', 'Risk Identification', 'Tool Landscape'],
      learningObjectives: [
        'Define core AI concepts and differentiate between predictive and generative models.',
        'Identify specific workplace tasks suited for AI assistance versus human execution.',
        'Recognise early warning signs of AI hallucination, bias, and output errors.'
      ],
      status: 'Complete',
      requirements: {
        problemDefinition: 'Lack of foundational understanding leading to either unjustified fear or reckless over-reliance on AI outputs.',
        workplaceContext: 'Everyday corporate knowledge work, reporting, customer inquiries, and administrative tasks.',
        keyTerms: 'Generative AI, Large Language Models (LLMs), Hallucination, Training Data, Prompting, Human-in-the-loop.',
        causes: 'Rapid availability of consumer AI tools without formal organizational training or usage policies.',
        warningSigns: 'Pasting sensitive company data into open web tools; accepting plausible-sounding incorrect answers.',
        impactStatement: 'Exposure to data breaches, flawed executive briefings, and degraded customer trust.',
        aiDemystification: 'AI is statistical pattern prediction based on training data; it does not possess consciousness, real-time factual knowledge, or moral reasoning.',
        aiInThisDomain: 'Summarisation, drafting, spreadsheet formula assistance, research structuring, and customer service drafts.',
        aiToolsOverview: 'Approved workplace assistants, secure enterprise chatbots, and domain analytics suites.',
        responsibleAiPrinciples: 'Never treat AI output as authoritative truth without human validation; protect confidentiality unconditionally.',
        toolsAndTechniques: 'Prompt drafting templates, sanity checking frameworks, and privacy sanitisation techniques.',
        procedureSteps: '1. Frame task. 2. Redact sensitive info. 3. Run prompt. 4. Verify against primary source. 5. Refine.',
        roleResponsibilities: 'Employees verify all personal outputs; managers establish approved use cases and review team compliance.',
        communicationApproach: 'Openly disclose AI collaboration when preparing team reports and strategic documents.',
        supportMechanisms: 'Internal AI Champions network, IT Security hotline, and prompt template repository.',
        scenarios: [
          {
            id: 'sc-1-1',
            title: 'Distinguishing Search from Generation',
            situation: 'An analyst searches for current 2026 tax brackets using an AI chat tool without internet browsing enabled.',
            challenge: 'The AI generates outdated 2023 figures with high confidence and professional formatting.',
            decisionPoint: 'Should the analyst use the figures or verify them on SARS official portal?',
            debrief: 'LLMs predict text rather than live database records; official regulatory values must always be cross-referenced with authoritative source portals.'
          }
        ],
        aiScenarios: [
          {
            id: 'ai-sc-1-1',
            title: 'Evaluating Initial AI Drafts',
            isAiSpecific: true,
            situation: 'A junior employee asks an AI to summarize a 40-page policy document.',
            challenge: 'The summary omits a critical mandatory disclaimer clause on page 38.',
            decisionPoint: 'How does the employee structure prompt constraints and verify section coverage?',
            debrief: 'Break large documents into structured sections and explicitly instruct the model to cite specific page numbers for verification.'
          }
        ],
        implementationStrategy: 'Mandatory baseline completion for all corporate computer users.',
        rolloutMethod: 'Digital self-paced e-learning with embedded knowledge checks.',
        meApproach: 'Pre- and post-diagnostic assessment score comparison.',
        improvementCycle: 'Bi-monthly review of emerging AI tool updates.',
        implementationChecklistTitle: 'AI Literacy Onboarding 14-Day Checklist',
        rolloutFrameworkTitle: 'Foundational Rollout Standard Operating Procedure',
        riskComplianceSectionTitle: 'Basic Data Handling Risk Matrix',
        continuousAiLearningApproach: 'Monthly 15-minute micro-learning modules on new model capabilities.',
        aiGovernanceFramework: 'Corporate Acceptable Use Policy for Artificial Intelligence (v2.1)',
        aiFeedbackReviewMechanism: 'Feedback button inside internal learning portal to report ambiguous AI responses.'
      }
    },
    {
      id: 'mod-2',
      moduleNumber: 2,
      title: 'Understanding Generative AI',
      subtitle: 'Practical application & intervention',
      purpose: 'Enable learners to use generative AI safely, verify outputs and make accountable decisions in real workflows.',
      keySkills: ['Prompt Architecture', 'Iterative Refinement', 'Output Verification', 'Data Redaction'],
      learningObjectives: [
        'Construct multi-part prompts with context, role, constraints, and format specifications.',
        'Apply rigorous fact-checking and error-detection workflows to AI-generated drafts.',
        'Execute redaction of personally identifiable information (PII) before prompt submission.',
        'Demonstrate ethical decision-making during AI-assisted stakeholder communications.'
      ],
      status: 'In progress',
      requirements: {
        problemDefinition: 'Ineffective, vague prompts resulting in poor outputs and wasted work hours, combined with unverified claims.',
        workplaceContext: 'Drafting emails, preparing customer proposals, summarizing technical documents, and analyzing spreadsheets.',
        keyTerms: 'Role Prompting, Few-Shot Examples, Temperature, Hallucination Auditing, Redaction, Zero-Data Retention.',
        causes: 'Lack of structured prompt training and absence of verification protocols.',
        warningSigns: 'One-sentence prompts, copying raw AI output directly into client emails, hallucinations in customer replies.',
        impactStatement: 'Inefficient iteration cycles, customer dissatisfaction, and reputational risk.',
        aiDemystification: 'Prompt quality directly dictates output quality; AI requires explicit boundary constraints and formatting guidance.',
        aiInThisDomain: 'Email drafting, document restructuring, translation into plain language, brainstorming, and code/formula debugging.',
        aiToolsOverview: 'Enterprise ChatGPT/Gemini workspaces, Microsoft Copilot, document analysis tools.',
        responsibleAiPrinciples: 'Maintain human accountability for every word published or sent under your name.',
        toolsAndTechniques: 'The 4-Part Prompt Framework (Role, Context, Task, Constraints), Side-by-side Verification Table.',
        procedureSteps: '1. Prepare source input. 2. Remove PII/POPIA data. 3. Input structured prompt. 4. Audit output against reference facts. 5. Edit in human voice.',
        roleResponsibilities: 'Creator retains 100% accountability for accuracy; Peer reviewer checks for hallucinated citations.',
        communicationApproach: 'Include "Drafted with AI assistance, verified by [Name]" when required by corporate policy.',
        supportMechanisms: 'Prompt library on internal wiki and weekly peer review lunch-and-learns.',
        scenarios: [
          {
            id: 'sc-2-1',
            title: 'AI-generated customer communication',
            situation: 'A service consultant uses a generative AI tool to draft a response to a high-priority customer complaint regarding account fees.',
            challenge: 'The draft contains an inaccurate product promise and inadvertently includes the customer\'s private ID number.',
            decisionPoint: 'What should the consultant verify, remove and escalate before sending the response?',
            debrief: 'Verify claims against approved pricing guides, remove all personal identification numbers to comply with POPIA, and retain human accountability.'
          },
          {
            id: 'sc-2-2',
            title: 'Drafting an Executive Board Briefing',
            situation: 'A project manager uses AI to summarize quarterly budget variances across 6 divisions.',
            challenge: 'The AI tool miscalculates a negative variance as a positive gain due to a formatting anomaly in the input table.',
            decisionPoint: 'How does the manager validate mathematical calculations produced by language models?',
            debrief: 'Never rely on language models for arithmetic calculations without auditing formulas in a spreadsheet or calculator.'
          },
          {
            id: 'sc-2-3',
            title: 'Supplier Negotiation Strategy Notes',
            situation: 'A procurement officer pastes vendor pricing proposals into a public AI tool to generate negotiation talking points.',
            challenge: 'The proprietary pricing structure of competing vendors is uploaded to an external server without an enterprise NDA.',
            decisionPoint: 'What protocol was breached, and what safe alternative should have been used?',
            debrief: 'Sensitive commercial pricing is protected information. Only enterprise-licensed AI instances with zero-data retention agreements may process commercial secrets.'
          }
        ],
        aiScenarios: [
          {
            id: 'ai-sc-2-1',
            title: 'AI Budgeting Tool Anomaly Detection',
            isAiSpecific: true,
            situation: 'A finance specialist uses an AI tool to analyze monthly department expense trends and suggest budget reductions.',
            challenge: 'The AI suggests cutting a statutory compliance audit fee, incorrectly tagging it as an "optional discretionary expense".',
            decisionPoint: 'How does the learner identify the regulatory flaw and adjust the prompt constraints?',
            debrief: 'Learners must verify classification against statutory mandates. The learner updates the prompt with explicit negative constraints: "Do not modify statutory audit lines".'
          },
          {
            id: 'ai-sc-2-2',
            title: 'Critiquing AI-Generated Market Research',
            isAiSpecific: true,
            situation: 'An employee requests competitive analysis of South African fintech competitors.',
            challenge: 'The AI fabricates two company names and invents plausible-sounding market share statistics.',
            decisionPoint: 'Which fact-checking checklist must be executed before citing market statistics in a strategic presentation?',
            debrief: 'Execute the 3-point source audit: 1. Search for entity in official CIPC registry. 2. Verify cited report author. 3. Confirm numbers in audited annual reports.'
          }
        ],
        implementationStrategy: 'Departmental workshops with hands-on prompt labs and scenario roleplays.',
        rolloutMethod: 'Blended learning: online interactive simulations followed by team prompt audits.',
        meApproach: 'Review of sample AI-assisted workplace deliverables by departmental leads.',
        improvementCycle: 'Quarterly review of prompt templates based on real workplace support tickets.',
        implementationChecklistTitle: 'Generative AI Daily Workflow 30-Day Checklist',
        rolloutFrameworkTitle: 'Departmental AI Productivity Rollout Guide',
        riskComplianceSectionTitle: 'POPIA & Commercial Confidentiality Guideline',
        continuousAiLearningApproach: 'Prompt engineering challenges and shared prompt repository updates.',
        aiGovernanceFramework: 'Enterprise Generative AI Guidelines & Human Review SOP',
        aiFeedbackReviewMechanism: 'Monthly prompt effectiveness survey across teams.'
      }
    },
    {
      id: 'mod-3',
      moduleNumber: 3,
      title: 'Responsible AI in the Workplace',
      subtitle: 'Implementation & workplace integration',
      purpose: 'Ensure learners can translate training into sustained workplace behaviour, ethical compliance, and organizational governance.',
      keySkills: ['POPIA Compliance', 'Bias Mitigation', 'Human Oversight', 'Sustained Change'],
      learningObjectives: [
        'Apply POPIA principles when processing internal and customer data with AI systems.',
        'Implement mandatory human sign-off checkpoints for all AI-augmented decisions.',
        'Identify systemic bias in algorithmic outputs and escalate through established governance channels.',
        'Develop a personal 30-day action plan for sustained, responsible AI utilization.'
      ],
      status: 'Not started',
      requirements: {
        problemDefinition: 'Fragmented individual AI use without cohesive team oversight, leading to compliance vulnerabilities and lack of sustained habit.',
        workplaceContext: 'Cross-functional operations, performance evaluations, customer credit/hiring workflows, and team collaboration.',
        keyTerms: 'POPIA Section 71 (Automated Decision Making), Algorithmic Bias, Data Sovereignty, Whistleblowing, Governance Committee.',
        causes: 'Absence of departmental governance structures and unclear escalation paths for AI errors.',
        warningSigns: 'Automating high-stakes decisions impacting individuals without human appeal mechanisms; silence regarding AI failures.',
        impactStatement: 'Legal liability under POPIA, brand damage, biased hiring or lending outcomes, employee anxiety regarding automation.',
        aiDemystification: 'AI is a tool to augment human capability, not a substitute for ethical accountability, empathy, and statutory responsibility.',
        aiInThisDomain: 'Enterprise risk management, automated triage with human oversight, audit logs, and compliance reporting.',
        aiToolsOverview: 'Governance monitoring dashboards, bias detection linters, and secure enterprise model hubs.',
        responsibleAiPrinciples: 'Human primacy in all critical decisions; transparency regarding AI involvement; equitable treatment across demographic groups.',
        toolsAndTechniques: 'Ethical AI Decision Tree, POPIA Privacy Impact Assessment (PIA) Template, AI Incident Escalation Matrix.',
        procedureSteps: '1. Evaluate risk level of use case. 2. Verify data processing consent. 3. Insert human checkpoint. 4. Maintain audit log. 5. Periodic performance review.',
        roleResponsibilities: 'Executives set governance policies; Team managers audit monthly AI usage; Employees report anomalies.',
        communicationApproach: 'Transparent disclosure to customers and stakeholders whenever AI is used in service delivery.',
        supportMechanisms: 'Ethics & AI Governance Board, Chief Information Officer mailbox, confidential compliance reporting line.',
        scenarios: [
          {
            id: 'sc-3-1',
            title: 'Automated Screening in Candidate Selection',
            situation: 'An HR coordinator uses an AI resume screening tool that disproportionately down-ranks applicants from certain educational backgrounds.',
            challenge: 'The tool reflects historical hiring data bias and excludes qualified diverse candidates.',
            decisionPoint: 'What intervention should the HR coordinator trigger before final interview shortlisting?',
            debrief: 'Automated recruitment tools must never make unmonitored exclusion decisions. The coordinator audits sample rejections, identifies the bias proxy, and mandates blind human review.'
          },
          {
            id: 'sc-3-2',
            title: 'Handling Customer AI Inquiries under POPIA',
            situation: 'A customer requests full details on how their personal transaction history was processed by an automated credit risk algorithm.',
            challenge: 'The customer demands human review of an automated credit limit decrease under Section 71 of POPIA.',
            decisionPoint: 'How does the customer service representative facilitate the statutory right to human intervention?',
            debrief: 'Under POPIA Section 71, data subjects have the right not to be subject to a decision based solely on automated processing. The representative escalates to a human credit officer for manual review.'
          },
          {
            id: 'sc-3-3',
            title: 'Reporting an Unsanctioned AI Tool Vulnerability',
            situation: 'A developer discovers that a third-party AI browser plugin is transmitting internal email snippets to a foreign cloud server.',
            challenge: 'The plugin is popular among colleagues for quick email spell-checking.',
            decisionPoint: 'What immediate reporting and containment steps are required?',
            debrief: 'Immediately alert IT Security and Data Privacy Officer, notify affected team members to uninstall the extension, and submit a security incident report.'
          }
        ],
        aiScenarios: [
          {
            id: 'ai-sc-3-1',
            title: 'Auditing Automated Credit Recommendation Models',
            isAiSpecific: true,
            situation: 'A loan assessor reviews automated risk scores generated by an AI underwriting engine.',
            challenge: 'The algorithm recommends rejection for a self-employed applicant with strong cash flows due to rigid scoring parameters.',
            decisionPoint: 'How does the assessor override the algorithmic score using contextual financial evidence?',
            debrief: 'Document the specific compensatory financial indicators, execute a formal override in the credit system, and log the rationale for model retraining.'
          },
          {
            id: 'ai-sc-3-2',
            title: 'Transparency and Disclosure in Customer Advice',
            isAiSpecific: true,
            situation: 'An advisor generates a personalized financial wellness plan using an enterprise AI assistant.',
            challenge: 'The client asks whether the advice was generated by a human advisor or a computer program.',
            decisionPoint: 'What is the required standard for transparent disclosure under financial consumer protection standards?',
            debrief: 'Always be fully transparent: explain that AI was used to assist in calculations and formatting, but the recommendations were reviewed, validated, and signed off by a qualified professional.'
          }
        ],
        implementationStrategy: 'Enterprise governance alignment with mandatory annual certification.',
        rolloutMethod: 'Team-level scenario workshops and compliance sign-off.',
        meApproach: 'Quarterly compliance audits and incident reporting tracking.',
        improvementCycle: 'Annual policy update aligned with South African Information Regulator guidelines.',
        implementationChecklistTitle: 'Responsible AI Workplace Integration 30-Day Action Plan',
        rolloutFrameworkTitle: 'Enterprise AI Governance & Escalation Framework',
        riskComplianceSectionTitle: 'POPIA Compliance & Automated Decision Making Risk Matrix',
        continuousAiLearningApproach: 'Quarterly governance briefings and ethical case study circulars.',
        aiGovernanceFramework: 'eStudy Responsible AI Corporate Policy Framework v3.0',
        aiFeedbackReviewMechanism: 'Annual AI Impact Assessment and anonymous staff ethics channel.'
      }
    }
  ],
  learningDesign: {
    coreStandardsSummary: 'Structured module flow, scenario-based learning (minimum 3 per module), knowledge checks (minimum 5 questions), critical thinking evaluation.',
    aiDemoSimulationDescription: 'Interactive step-by-step simulation comparing a naive one-line prompt against a structured 4-part prompt, showcasing output accuracy and hallucination risks.',
    promptExerciseDescription: 'Hands-on workplace prompt engineering exercises where learners draft, constrain, and refine prompts for real-world tasks.',
    aiEvaluationTask: 'Learners are presented with 3 realistic AI outputs containing subtle factual errors, bias, or POPIA violations, and must conduct a structured critique.',
    collaborationActivity: 'Paired workflow: one learner acts as AI prompt author, the second acts as human compliance & fact-checking auditor.',
    learningObjectivesList: [
      'Understand core AI capabilities and limitations in the workplace.',
      'Construct effective, structured prompts for everyday productivity.',
      'Critique and verify AI outputs against authoritative source standards.',
      'Ensure strict compliance with POPIA and enterprise data confidentiality.',
      'Apply human oversight to prevent bias and erroneous automated decisions.'
    ],
    instructionalApproach: 'Scenario-led, practical, workplace-contextualised instructional design with hands-on practice loops.',
    workplaceActivities: [
      'Interactive Prompt Construction Lab',
      'Hallucination & Bias Audit Exercise',
      'POPIA Data Redaction Simulation'
    ],
    examplesAndRelevance: 'Grounded in South African business contexts, local regulations (POPIA, King IV), and real corporate workflows.',
    knowledgeChecksDescription: '5 multiple-choice and scenario-based diagnostic questions at the conclusion of each module to test application rather than rote memorization.',
    criticalThinkingDescription: 'Learners must identify assumptions, audit mathematical claims, and evaluate potential demographic bias in AI answers.',
    reflectionPrompts: 'What is one repetitive task in your daily work that can be safely enhanced with AI, and what verification steps will you implement?',
    learnerEngagementTypes: [
      'Branching scenario decisions',
      'Interactive prompt input simulators',
      'Side-by-side output critique sliders',
      'Personalized action plan builder'
    ],
    assessments: [
      {
        id: 'ass-1',
        type: 'Pre-Course Diagnostic',
        description: 'Baseline knowledge check on digital readiness, AI concepts, and POPIA awareness.',
        timing: 'Before Module 1',
        weighting: 'Ungraded (Baseline Assessment)',
        notes: 'Identifies individual learning gaps to calibrate feedback.'
      },
      {
        id: 'ass-2',
        type: 'Module Knowledge Checks',
        description: 'Per-module scenario quiz testing critical output evaluation and prompt techniques.',
        timing: 'End of each module',
        weighting: 'Formative (Self-check with detailed explanations)',
        notes: 'Minimum 5 questions per module with remedial feedback.'
      },
      {
        id: 'ass-3',
        type: 'Practical Application Task',
        description: 'Workplace scenario exercise: learners create a structured prompt, redact PII, audit the generated output, and write a verification brief.',
        timing: 'After Module 2',
        weighting: '40% of Final Grade',
        passMark: '70%',
        notes: 'Evaluated against rubric for safety, prompt structure, and fact checking.'
      },
      {
        id: 'ass-4',
        type: 'Final Assessment',
        description: 'Summative comprehensive assessment covering all 3 modules: problem solving, ethics, POPIA compliance, and AI governance.',
        timing: 'After Module 3',
        weighting: '60% of Final Grade',
        passMark: '80%',
        notes: 'Scenario-based decision questions; certificate awarded upon achievement.'
      },
      {
        id: 'ass-5',
        type: 'Post-Course Reflection',
        description: 'Self-assessment against initial learning goals and completion of the 30-Day Responsible AI Action Plan.',
        timing: 'After course completion',
        weighting: 'Ungraded (Action Plan Milestone)',
        notes: 'Submitted to line manager for workplace coaching integration.'
      }
    ]
  },
  ethics: {
    confidentialityRequirements: 'Proprietary corporate data, trade secrets, unpublished financial statements, and customer records must never be submitted into non-enterprise public AI models.',
    dataPrivacyFramework: 'Protection of Personal Information Act (POPIA) Act 4 of 2013, ensuring lawful processing, purpose specification, and security safeguards.',
    ethicsStandards: 'Principles of honesty, transparency, human dignity, non-discrimination, and professional accountability.',
    psychologicalSafetyNotes: 'Employees must feel safe reporting AI-related errors or near-misses without fear of punitive action, fostering a culture of open learning and security vigilance.',
    decisionMakingFramework: 'The 4-Pillar Ethical Decision Matrix: Legality (POPIA), Accuracy (Fact-checked), Fairness (Unbiased), Accountability (Human sign-off).',
    accountabilityMechanism: 'The human author who publishes or acts upon AI output retains 100% professional and legal responsibility for that output.',
    aiBiasRisk: 'AI models trained on historical data may perpetuate gender, racial, linguistic, or socio-economic biases in hiring, credit scoring, and customer classification.',
    aiDisclosureRequirement: 'Mandatory disclosure when AI tools generate substantial portions of client-facing deliverables, public announcements, or compliance filings.',
    humanOverrideScenarios: 'Any decision directly impacting an individual\'s employment, creditworthiness, legal rights, or disciplinary standing must have mandatory human review and override authority.',
    dataSovereigntyContext: 'Data processed through cloud AI APIs must comply with South African cross-border data transfer regulations under Section 72 of POPIA.',
    aiWorkforceImpactNarrative: 'Framed constructively: AI automates routine tasks to allow employees to focus on high-value human critical thinking, strategy, and empathy.',
    aiGovernanceReference: 'eStudy Responsible AI Framework, SA Department of Communications & Digital Technologies (DCDT) AI Policy, UNESCO Ethics of AI.',
    cards: [
      {
        id: 'eth-1',
        title: 'Privacy & Confidentiality',
        subtitle: 'POPIA controls defined',
        status: 'Complete',
        guidingQuestion: 'What measures are in place to ensure confidential business data and personal information are protected from public AI exposure?',
        response: 'Strict zero-PII input rule, redaction protocols, and mandatory use of enterprise-secured tenants with data privacy agreements.',
        exampleText: 'Pasting customer bank account statements or ID numbers into consumer chatbots is strictly prohibited under disciplinary code.',
        complianceRef: 'POPIA Act 4 of 2013, Section 19 (Security measures on integrity and confidentiality)'
      },
      {
        id: 'eth-2',
        title: 'Bias & Fairness',
        subtitle: 'Risk examples added',
        status: 'Complete',
        guidingQuestion: 'How does the course address potential bias and discrimination in AI-generated predictions and recommendations?',
        response: 'Includes mandatory bias auditing exercises for screening tools, credit evaluations, and marketing copy, teaching learners to identify skewed training representations.',
        exampleText: 'Checking whether credit-scoring algorithms inadvertently penalise applicants based on postal code or age proxies.',
        complianceRef: 'Constitution of South Africa Section 9 (Equality), UNESCO AI Ethics Principle 4'
      },
      {
        id: 'eth-3',
        title: 'Transparency',
        subtitle: 'Disclosure guidance added',
        status: 'Complete',
        guidingQuestion: 'When and how should employees disclose that AI tools were used in preparing workplace content?',
        response: 'Clear standardized citation: "Drafted with AI assistance, verified and approved by [Employee Name]" on internal and external reports.',
        exampleText: 'Labeling AI-assisted customer service chat summaries so reviewers know human verification was conducted.',
        complianceRef: 'King IV Corporate Governance Report on Transparency'
      },
      {
        id: 'eth-4',
        title: 'Human Oversight',
        subtitle: 'Escalation decisions defined',
        status: 'Complete',
        guidingQuestion: 'What decisions must NEVER be fully delegated to AI without human review and sign-off?',
        response: 'Disciplinary actions, performance ratings, loan rejections, official financial filings, and medical or legal advisories require mandatory human signature.',
        exampleText: 'A manager must independently review performance metrics before issuing a formal performance improvement plan.',
        complianceRef: 'POPIA Section 71 (Automated decision making safeguards)'
      },
      {
        id: 'eth-5',
        title: 'Accountability',
        subtitle: 'Owner roles defined',
        status: 'Complete',
        guidingQuestion: 'Who owns the accountability for accuracy, ethics, and legal compliance of AI-generated deliverables?',
        response: 'The designated employee and approving line manager retain 100% legal and professional ownership of the delivered output.',
        exampleText: 'An employee cannot claim "the AI made a mistake" as a defense for an unverified misleading client statement.',
        complianceRef: 'Professional Standards of Conduct'
      },
      {
        id: 'eth-6',
        title: 'Consent & Data Sovereignty',
        subtitle: 'Needs learner example',
        status: 'Needs input',
        guidingQuestion: 'How are customer consent and data sovereignty handled when processing data through third-party cloud AI vendors?',
        response: 'Verify that customer terms of service include explicit consent for digital automated processing, and ensure cloud processing takes place in compliant data centres.',
        exampleText: 'Checking cross-border data transfer agreements when using cloud servers hosted outside South African borders.',
        complianceRef: 'POPIA Section 72 (Transborder information flows)'
      },
      {
        id: 'eth-7',
        title: 'Responsible AI Use',
        subtitle: 'Principles complete',
        status: 'Complete',
        guidingQuestion: 'What practical principles guide daily ethical workplace AI interactions?',
        response: 'Purpose limitation, accuracy verification, data minimisation, fairness, and transparency.',
        exampleText: 'Only providing the minimal necessary data points to the model to achieve the specific summarisation task.',
        complianceRef: 'eStudy Responsible AI Principles'
      },
      {
        id: 'eth-8',
        title: 'AI Governance',
        subtitle: 'Select framework',
        status: 'Not started',
        guidingQuestion: 'Which corporate governance body oversees AI usage guidelines, monitoring, and updates?',
        response: 'The Enterprise Technology & Ethics Steering Committee reviews high-risk AI applications quarterly.',
        exampleText: 'Submitting a new generative AI plugin to the IT Governance Committee for security accreditation.',
        complianceRef: 'King IV Principle 12 (Governance of Technology and Information)'
      },
      {
        id: 'eth-9',
        title: 'Psychological Safety',
        subtitle: 'Add facilitation note',
        status: 'Not started',
        guidingQuestion: 'How does the course create psychological safety for employees adopting AI without anxiety or fear of job loss?',
        response: 'Emphasize AI as an augmentation tool that eliminates tedious admin work, enabling employees to focus on strategic, creative, and empathetic responsibilities.',
        exampleText: 'Facilitators encourage open discussion on automation anxieties during Module 1 introduction.',
        complianceRef: 'Workplace Culture & Wellness Standards'
      }
    ]
  },
  outputRequirements: {
    outputFormat: 'LMS-Ready SCORM / xAPI compliant structured digital course with interactive modules and printable action plans.',
    requiredSectionsNote: 'All nine numbered sections of Master Prompt v9.0 retained with strict instructional hierarchy.',
    moduleRequirementsRule: 'Minimum 3 modules with foundational, practical, and governance progression.',
    assessmentRequirementsRule: 'Pre-course diagnostic (ungraded), formative module knowledge checks (min 5 per module), practical task (40%), final summative exam (80% pass mark).',
    scenarioRequirementsRule: '3–5 realistic workplace scenarios per module; minimum 2 AI-specific scenarios with Situation, Challenge, Decision Point, and Debrief.',
    mandatoryDeliverablesRule: '30-Day Action Plan, Rollout Framework SOP, and Risk & Compliance Matrix.',
    referencesRule: 'All references current, reputable, South Africa aligned (POPIA, King IV, NQF).',
    accessibilityTargetReadingLevel: 'Plain language · NQF Level 4 / Grade 12 equivalent reading comprehension.',
    plainLanguageApplied: true,
    culturalInclusivityNotes: 'Scenarios and character names reflect diverse South African workplace demographics and multilingual business etiquette.',
    formattingRequirements: 'Consistent typography hierarchy: H1 (Module), H2 (Core Lesson), H3 (Scenario / Activity), Callout cards for Ethical Safeguards.'
  },
  qa: {
    benchmarkReviewed: false,
    benchmarkReviewNotes: 'Compare instructional depth and scenario structure against the benchmark Use of Artificial Intelligence in Financial Literacy course before final export.',
    qaChecklistConfirmed: true
  },
  customisation: {
    branding: 'eStudy South Africa',
    tone: 'Professional, supportive, structured, and accessible',
    audienceContext: 'General corporate workplace employees and team managers',
    industryExamples: 'Cross-sector corporate (Finance, Operations, Customer Service, Retail)',
    terminology: 'Plain South African business language with clear AI term definitions',
    formatting: 'Digital self-paced e-learning with interactive cards and printable PDF summaries',
    deliveryPreferences: 'LMS SCORM Package + Facilitator Guide + Participant Action Plan',
    planningNotes: [
      {
        templateSection: '1. Problem Statement',
        whatChanges: 'Industry context, target group, operational impact',
        notes: 'Tailored for everyday corporate knowledge workers adopting generative AI tools.'
      },
      {
        templateSection: '2. Sources',
        whatChanges: 'Regulation, industry links, AI tools used in domain',
        notes: 'Aligned with POPIA, UNESCO AI Ethics, and South African DCDT Policy.'
      },
      {
        templateSection: '3.1 Course Details',
        whatChanges: 'Title, code, domain, duration, NQF level',
        notes: 'Set to 6 hours self-paced, NQF Level 5 alignment.'
      },
      {
        templateSection: '3.6 Target Audience',
        whatChanges: 'Job roles, departments, AI literacy baseline',
        notes: 'Cross-departmental employees with basic digital literacy.'
      },
      {
        templateSection: '4. Module Content',
        whatChanges: 'Scenarios, terminology, tools, procedures',
        notes: '3 core modules: Foundational, Generative AI Practical, and Responsible Workplace Integration.'
      },
      {
        templateSection: '6. Ethics',
        whatChanges: 'Domain-specific risks, AI bias context, data laws',
        notes: 'POPIA Section 71, bias mitigation in credit/hiring, and transparency protocols.'
      },
      {
        templateSection: '7.4 Accessibility',
        whatChanges: 'Reading level, language, cultural context',
        notes: 'Plain business English at NQF Level 4 reading comprehension.'
      }
    ],
    historicalCourses: [
      {
        courseTitle: 'Use of Artificial Intelligence in Financial Literacy',
        industry: 'Financial Services',
        dateBuilt: '2025',
        version: 'v1.0 — BENCHMARK'
      },
      {
        courseTitle: 'AI Literacy for the Modern Workplace',
        industry: 'Corporate Cross-Sector',
        dateBuilt: '2026',
        version: 'v1.0 — Current'
      },
      {
        courseTitle: 'Responsible AI in Financial Services',
        industry: 'Banking & Insurance',
        dateBuilt: '2026',
        version: 'v1.0 — In Review'
      },
      {
        courseTitle: 'Digital Transformation Fundamentals',
        industry: 'Public Sector & Enterprises',
        dateBuilt: '2026',
        version: 'v1.0 — Completed'
      }
    ]
  }
};

export const sampleCourses: Course[] = [
  {
    ...blankMasterTemplate,
    id: 'course-ai-literacy-2026',
    name: 'AI Literacy for the Modern Workplace',
    code: 'EST-AI-2026',
    status: 'Draft',
    lastModified: 'Today at 09:42',
    problem: {
      ...blankMasterTemplate.problem,
      targetGroup: 'corporate employees and operational teams',
      taskOrSkill: 'effectively apply generative AI tools in daily workflows with proper verification',
      operationalImpact: 'poor decision-making, inadvertent data privacy breaches under POPIA, and unverified misleading communications',
      rootCauses: [
        'Rapid informal adoption of consumer AI tools without institutional guidelines or verification protocols.',
        'Lack of foundational training in prompt engineering, hallucination identification, and output auditing.'
      ],
      processFailures: 'Lack of clear review standards for AI-assisted customer and board communications.',
      skillGaps: 'Prompt structuring, output fact-checking, POPIA data sanitisation.',
      constraints: 'Fast-paced operational deadlines encouraging copy-pasting unverified content.',
      aiLiteracyGap: 'Belief that AI models possess factual databases rather than probabilistic language prediction engines.',
      digitalReadinessLevel: 'Intermediate familiarity with browsers, spreadsheets, and office applications.',
      aiEthicsComplianceRisk: 'Entering customer identifiable data (PII) into public AI platforms violating POPIA regulations.'
    },
    structure: {
      ...blankMasterTemplate.structure,
      title: 'AI Literacy for the Modern Workplace',
      code: 'EST-AI-2026',
      targetRoles: 'Employees who use digital tools in daily work.',
      purposeStatement: 'Equip employees with the practical skills, ethical judgment, and critical verification habits required to harness generative AI safely and productively.',
      workplaceRelevance: 'Addresses immediate daily tasks including drafting, data summarisation, customer inquiries, and workflow automation.',
      performanceImprovement: 'Reduces time spent on repetitive drafting by 40% while preventing data breaches and factual hallucinations.',
      aiTechAngle: 'Focuses on applied prompt engineering, hallucination auditing, and human oversight.',
      scopeSummary: 'Comprehensive 3-module framework covering cognitive foundations, practical tool application, and sustained workplace governance.',
      aiEraRelevance: 'AI tools are evolving faster than organizational policies; employees must possess internal standards of excellence and vigilance.',
      performanceLink: 'Transforms unmonitored risk into structured, productive, and compliant competitive advantage.'
    }
  },
  {
    ...blankMasterTemplate,
    id: 'course-ai-fin-services-2026',
    name: 'Responsible AI in Financial Services',
    code: 'EST-FIN-2026',
    status: 'In Review',
    lastModified: 'Yesterday at 16:15',
    problem: {
      ...blankMasterTemplate.problem,
      targetGroup: 'financial advisors, credit underwriters, and customer service consultants',
      taskOrSkill: 'utilize predictive and generative AI tools in credit assessment and investment advisory',
      operationalImpact: 'regulatory penalties under FSCA and POPIA, algorithmic lending bias, and client misrepresentation',
      rootCauses: [
        'Automated credit scoring models trained on biased historical banking datasets.',
        'Inadequate human oversight protocols when providing automated algorithmic financial guidance.'
      ]
    },
    structure: {
      ...blankMasterTemplate.structure,
      title: 'Responsible AI in Financial Services',
      code: 'EST-FIN-2026',
      industryDomain: 'Banking & Financial Services',
      targetRoles: 'Financial Advisors, Credit Analysts, Compliance Officers',
      purposeStatement: 'Ensure financial professionals apply AI tools in credit underwriting, fraud detection, and advisory with strict adherence to FSCA and POPIA standards.'
    }
  },
  {
    ...blankMasterTemplate,
    id: 'course-digital-trans-2026',
    name: 'Digital Transformation Fundamentals',
    code: 'EST-DT-2026',
    status: 'Completed',
    lastModified: '26 Aug 2026',
    qa: {
      benchmarkReviewed: true,
      benchmarkReviewNotes: 'Fully benchmarked against Financial Literacy master course. All 9 sections certified.',
      qaChecklistConfirmed: true
    },
    structure: {
      ...blankMasterTemplate.structure,
      title: 'Digital Transformation Fundamentals',
      code: 'EST-DT-2026',
      industryDomain: 'Enterprise Technology & Public Sector',
      targetRoles: 'Departmental Managers and Team Leads',
      purposeStatement: 'Guide departmental leaders through modernising workflows, selecting appropriate digital systems, and managing change effectively.'
    }
  }
];
