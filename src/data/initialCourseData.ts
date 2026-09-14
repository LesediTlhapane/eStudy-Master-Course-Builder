import { Course } from '../types';

/**
 * Benchmark Reference Course as defined in eStudy South Africa Master Prompt Template v9.0:
 * "Use of Artificial Intelligence in Financial Literacy"
 */
export const financialLiteracyBenchmarkCourse: Course = {
  id: 'course-benchmark-fin-lit-v1',
  name: 'Use of Artificial Intelligence in Financial Literacy',
  code: 'EST-FIN-AI-01',
  status: 'Completed',
  lastModified: 'Benchmark v1.0',
  problem: {
    targetGroup: 'Employees, consumers, and financial advisory personnel across South African enterprises',
    taskOrSkill: 'Effectively apply AI tools in personal and organisational financial management',
    operationalImpact: 'Poor financial decisions, vulnerability to digital fraud, and missed productivity gains',
    rootCauses: [
      'Lack of foundational AI literacy and understanding of automated budgeting, forecasting, and algorithmic advisory systems.',
      'Rapid proliferation of AI-assisted voice cloning scams, synthetic invoice manipulation, and deepfake payment fraud targeting corporate staff.'
    ],
    processFailures: 'Absence of standardized AI verification protocols in corporate financial reconciliations and reliance on manual spreadsheet audits.',
    skillGaps: 'Inability to critically evaluate algorithmic credit score models, critique robo-advisor assumptions, or construct sanitized financial prompts.',
    constraints: 'Stringent statutory compliance boundaries under the South African FSCA and POPIA Act No. 4 of 2013, with zero tolerance for PII leaks.',
    aiLiteracyGap: 'Differentiating predictive ML from generative AI, understanding hallucination risks in financial calculation, and identifying algorithmic bias.',
    digitalReadinessLevel: 'Basic digital literacy: spreadsheet proficiency, online banking familiarity, enterprise email usage.',
    aiEthicsComplianceRisk: 'Automated credit underwriting demographic bias, exposure of customer financial PII to public LLMs, and non-disclosure of AI-generated advice.'
  },
  research: {
    sources: [
      {
        id: 'src-1',
        name: 'Financial Sector Conduct Authority (FSCA) Fintech & AI Guidelines',
        type: 'Regulatory framework',
        reference: 'FSCA Regulatory Strategy & Fintech Governance Circular 2024/2025',
        relevance: 'Mandatory market conduct and consumer protection rules in automated financial services.',
        status: 'Verified'
      },
      {
        id: 'src-2',
        name: 'Protection of Personal Information Act (POPIA Act No. 4 of 2013)',
        type: 'Regulatory framework',
        reference: 'Republic of South Africa Government Gazette No. 37067, Section 19 & 71',
        relevance: 'Condition 7 security safeguards for personal financial data and automated decision-making rights.',
        status: 'Verified'
      },
      {
        id: 'src-3',
        name: 'King IV Report on Corporate Governance for South Africa',
        type: 'Ethics framework',
        reference: 'Principle 12: Technology and Information Governance',
        relevance: 'Board and operational oversight of AI adoption, data integrity, and ethical risk management.',
        status: 'Verified'
      },
      {
        id: 'src-4',
        name: 'National Credit Act (NCA Act 34 of 2005)',
        type: 'Regulatory framework',
        reference: 'National Credit Regulator (NCR) Reckless Lending and Credit Assessment Guidelines',
        relevance: 'Prohibits reckless credit extension and unverified automated affordability assessments.',
        status: 'Verified'
      }
    ],
    regulatoryFramework: 'POPIA (Act 4 of 2013), FSCA Market Conduct Rules, NCA (Act 34 of 2005), King IV Principle 12, SETA / NQF Unit Standards',
    aiToolsPlatformName: 'ChatGPT Enterprise (Financial Analysis), Microsoft 365 Copilot for Excel, Cleo & Spendee AI Budgeting, Featurespace ARIC Fraud Engine',
    aiEthicsFramework: 'UNESCO Recommendation on the Ethics of AI, SA DCDT Artificial Intelligence Policy Framework, EU AI Act High-Risk Financial System Standards',
    caseStudyUseCases: 'Detection and prevention of synthetic voice executive authorization fraud in SA banking; Auditing algorithmic credit underwriting for historical bias in retail lending.',
    evidenceStandards: [
      'FSCA Market Conduct and consumer disclosure rules',
      'POPIA Section 19 strict data encryption and zero-PII cloud protocols',
      'Triangulated 3-source empirical validation for interest rate and cash-flow algorithms'
    ],
    benchmarkingNotes: 'Populated as the authoritative eStudy reference benchmark for instructional depth, scenario balance, and POPIA alignment.',
    benchmarkCourseRef: 'Use of Artificial Intelligence in Financial Literacy (eStudy South Africa, 2025)'
  },
  structure: {
    title: 'Use of Artificial Intelligence in Financial Literacy',
    code: 'EST-FIN-AI-01',
    industryDomain: 'Financial Services & Corporate Operations',
    targetRoles: 'Financial Planners, Corporate Accountants, Operations Managers, General Employees',
    aiIntegrationLevel: 'Applied',
    setaNqfLevel: 'NQF Level 5 / SETA Fasset & INSETA Unit Standard 242814 Alignment',
    deliveryLanguages: 'English (South African Business Context with Plain Language Principles)',
    estimatedDuration: '16 Hours / 2 CPD Credits',
    deliveryFormat: 'Blended Digital E-Learning with Interactive Scenarios & Action Plans',
    difficultyLevel: 'Intermediate',
    purposeStatement: 'Equip employees and financial practitioners with practical skills to leverage AI tools for budgeting, forecasting, and fraud prevention while maintaining strict POPIA compliance and human oversight.',
    workplaceRelevance: 'Transforms manual, time-consuming spreadsheet reconciliation into automated, AI-augmented workflows while safeguarding assets against digital scams.',
    performanceImprovement: '35% reduction in financial reporting cycle time, elimination of unverified spreadsheet errors, and 100% compliance with zero-PII data redaction protocols.',
    aiTechAngle: 'Direct application of generative and predictive AI tools for budget variance analysis, cash-flow stress testing, and anomaly detection in financial records.',
    scopeSummary: 'Covers foundational AI mechanics, practical AI budgeting and robo-advisor auditing, and enterprise-wide AI governance and continuous learning.',
    aiEraRelevance: 'In an AI-accelerated economy, financial personnel must transition from repetitive data entry to critical algorithmic auditing and strategic decision-making.',
    performanceLink: 'Enables learners to leverage AI tools for predictive cash flow management while acting as vigilant human-in-the-loop reviewers against algorithmic hallucinations.',
    organisationalBenefits: [
      'Accelerated financial reporting turnaround time and enhanced cash-flow predictability.',
      'Robust institutional defence against synthetic fraud, voice-cloning EFT scams, and POPIA regulatory fines.'
    ],
    employeeBenefits: [
      'Mastery of high-demand AI financial workflows, prompt engineering, and spreadsheet automation.',
      'Significant reduction in manual data reconciliation, freeing hours for strategic financial analysis.'
    ],
    riskReductionOutcomes: [
      'Prevention of client PII exposure to public LLM training datasets.',
      'Mitigation of demographic bias in credit scoring and loan affordability assessments.'
    ],
    scope: 'Comprehensive 3-module framework moving from cognitive foundation to hands-on application and sustained workplace governance.',
    keyCompetencies: 'AI Financial Tool Selection, Algorithmic Output Verification, POPIA-Compliant Prompt Engineering, Automated Fraud Detection.',
    realWorldApplication: 'Hands-on simulation of AI budgeting, cash flow forecasting, and error detection in automated loan approvals.',
    aiSkillsDeveloped: 'Financial Prompting, Hallucination Auditing, Synthetic Voice Scam Identification, Predictive Variance Analysis.',
    jobRoles: 'Financial Planners, Corporate Accountants, Operations Managers, Payroll Specialists, Branch Officers',
    departments: 'Finance & Accounting, Risk & Compliance, Operations, Human Resources',
    experienceLevel: 'Mid-level (2+ years corporate experience)',
    aiFamiliarityBaseline: 'Basic',
    prerequisiteKnowledge: 'Basic corporate accounting principles, spreadsheet literacy, standard financial reporting structures.',
    prerequisiteExperience: '1–2 years handling departmental budgets or financial transactions.',
    toolsSystems: 'Microsoft Excel, Enterprise ERP financial modules, web browser environments.',
    digitalLiteracyLevel: 'NQF Level 4 digital literacy competence.',
    diagnosticQuestions: [
      {
        id: 'dq-1',
        question: 'What is the fundamental difference between simple interest and compound interest calculation when reviewing automated cash flow projections?',
        category: 'General domain',
        purpose: 'Establish baseline financial arithmetic and compound growth comprehension.'
      },
      {
        id: 'dq-2',
        question: 'How do algorithmic credit scoring models make automated lending decisions, and what historical data risks do they introduce?',
        category: 'Problem awareness',
        purpose: 'Evaluate understanding of automated lending risks and demographic data skew.'
      },
      {
        id: 'dq-3',
        question: 'What current verification protocols does your department follow before approving automated spreadsheet formulas or financial summaries?',
        category: 'Current practices',
        purpose: 'Identify existing internal control procedures and manual verification gaps.'
      },
      {
        id: 'dq-4',
        question: 'How does generative AI differ from predictive machine learning when analysing corporate financial trends and expense variances?',
        category: 'AI / digital readiness',
        purpose: 'Assess baseline literacy between generative synthesis and statistical regression.'
      },
      {
        id: 'dq-5',
        question: 'Under POPIA Section 71, what rights does a consumer or business applicant retain when an automated AI algorithm declines their application?',
        category: 'Ethics & compliance',
        purpose: 'Verify understanding of statutory rights regarding automated decision-making.'
      },
      {
        id: 'dq-6',
        question: 'What specific data scrubbing steps must be executed before pasting corporate expense records into a generative AI tool?',
        category: 'AI / digital readiness',
        purpose: 'Test practical knowledge of zero-PII data sanitization techniques.'
      }
    ],
    learningJourney: [
      {
        id: 'step-1',
        stepNumber: 1,
        title: 'Discover & Demystify',
        subtitle: 'Foundational AI Mechanics & POPIA Compliance',
        description: 'Understand how AI models work in finance, demystify algorithms, and establish zero-PII privacy rules.'
      },
      {
        id: 'step-2',
        stepNumber: 2,
        title: 'Practise & Prompt',
        subtitle: 'Hands-on AI Budgeting & Variance Analysis',
        description: 'Execute role-specific financial prompts in simulated environments to automate cash-flow forecasting.'
      },
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'Evaluate & Audit',
        subtitle: 'Hallucination Checks & Fraud Detection',
        description: 'Critique AI outputs, detect calculation errors and synthetic invoice scams, and apply human sign-off.'
      },
      {
        id: 'step-4',
        stepNumber: 4,
        title: 'Embed & Govern',
        subtitle: '30-Day Action Plan & SOP Implementation',
        description: 'Deploy department-level standard operating procedures, establish feedback loops, and commit to continuous learning.'
      }
    ]
  },
  modules: [
    {
      id: 'mod-1',
      moduleNumber: 1,
      title: 'Foundational Understanding of AI in Finance',
      subtitle: 'Demystifying AI, Algorithmic Mechanics & Ethical Baselines',
      purpose: 'Build foundational awareness of AI technologies, personal and banking applications, and ethical risks before practical implementation.',
      keySkills: [
        'AI Concept Demystification',
        'Financial Terminology Decoding',
        'Algorithmic Risk Identification',
        'POPIA Baseline Verification'
      ],
      learningObjectives: [
        'Differentiate between predictive machine learning and generative AI applications in financial services.',
        'Identify key AI tools used in modern banking, robo-advisory, and personal financial management.',
        'Explain South African regulatory requirements (POPIA & FSCA) governing financial data confidentiality.'
      ],
      status: 'Complete',
      requirements: {
        problemDefinition: 'AI in financial literacy encompasses machine learning, natural language processing, and automated algorithms that analyse financial data, optimize budgeting, and predict market trends.',
        workplaceContext: 'Modern South African financial institutions and corporate enterprises integrating AI into credit scoring, fraud detection, and customer advisory.',
        keyTerms: 'Generative AI, Large Language Models (LLMs), Robo-Advisors, Algorithmic Bias, Synthetic Data, Hallucination, Zero-PII Prompting.',
        causes: 'Rapid adoption of unvetted consumer AI tools without corporate guardrails; lack of structured training on algorithmic limitations.',
        warningSigns: 'Unchecked reliance on AI-generated spreadsheets, submission of confidential client bank details to public LLMs, unverified loan recommendations.',
        impactStatement: 'Severe regulatory fines under POPIA, misinformed capital allocation, customer reputational damage, and loss of financial trust.',
        aiDemystification: 'AI does not possess intuition or legal accountability; it is a statistical pattern-matching system requiring human critical appraisal.',
        aiInThisDomain: 'Personal finance (budgeting apps, robo-advisors), banking operations (automated fraud detection, credit scoring, algorithmic trading).',
        aiToolsOverview: 'ChatGPT Enterprise, Microsoft 365 Copilot for Excel, Cleo AI Budgeting, BloombergGPT, Featurespace ARIC.',
        responsibleAiPrinciples: 'Transparency in algorithmic decisions, strict PII data masking, human verification of all calculations, non-discrimination in credit allocation.',
        toolsAndTechniques: 'Algorithmic glossary reference, conceptual AI frameworks, PII identification checklists.',
        procedureSteps: '1. Classify the AI tool type -> 2. Inspect data source credibility -> 3. Redact any sensitive personal identifiers -> 4. Run baseline consistency check.',
        roleResponsibilities: 'Learner: Demystifies AI mechanisms and spots risks. Organization: Provides approved enterprise AI tools with enterprise security boundaries.',
        communicationApproach: 'Informative, demystifying, transparent, and grounded in South African statutory realities.',
        supportMechanisms: 'eStudy Financial AI Reference Guide, Information Officer consultation channel, FAQ knowledge base.',
        scenarios: [
          {
            id: 'sc-1-1',
            title: 'Understanding Robo-Advisor Assumptions',
            situation: 'A wealth advisory intern uses an AI robo-advisor to generate a client retirement portfolio projection.',
            challenge: 'The AI model assumes an aggressive fixed 12% annual return without factoring in South African inflation volatility or SARB interest cycles.',
            decisionPoint: 'Manually stress-test inflation parameters and cross-check historical SARB benchmark data before presenting to the senior wealth planner.',
            debrief: 'Never accept automated investment projections without auditing underlying macroeconomic assumptions.'
          },
          {
            id: 'sc-1-2',
            title: 'Spotting Synthetic Invoicing Fraud',
            situation: 'Accounts department receives an urgent supplier invoice containing altered banking details and an AI-generated executive signature stamp.',
            challenge: 'The standard vendor verification call was skipped due to urgent month-end closing pressure.',
            decisionPoint: 'Halt payment immediately and execute mandatory two-factor verbal verification via the registered corporate telephone directory.',
            debrief: 'AI-generated documents and synthetic invoices require rigorous out-of-band human verification before fund release.'
          },
          {
            id: 'sc-1-3',
            title: 'Confidential Data Redaction in Expense Analysis',
            situation: 'An operations manager wants to analyse departmental travel expenses using a cloud-based AI chat tool.',
            challenge: 'The CSV file contains employee ID numbers, credit card tokens, and residential addresses.',
            decisionPoint: 'Apply a local anonymization script to scrub all PII, uploading only sanitized category totals.',
            debrief: 'POPIA Section 19 strictly penalises processing unredacted personal identifiers on third-party cloud engines.'
          }
        ],
        aiScenarios: [
          {
            id: 'ai-sc-1-1',
            title: 'Evaluating an AI Budgeting Anomaly',
            situation: 'A learner uses an AI budgeting tool to analyse monthly operational expenses and suggest cost optimizations.',
            challenge: 'The AI recommends eliminating a statutory UIF insurance reserve, classifying it as "unnecessary discretionary spend".',
            decisionPoint: 'Identify the statutory compliance error and explain the South African labour law requirement to keep UIF funded.',
            debrief: 'AI tools lack statutory context and must always be audited by knowledgeable human practitioners.'
          },
          {
            id: 'ai-sc-1-2',
            title: 'Algorithmic Credit Scoring Bias Audit',
            situation: 'A financial officer reviews an AI model\'s credit score recommendations for SME loan applicants.',
            challenge: 'The model systematically penalises township-based businesses due to lack of legacy credit bureau history.',
            decisionPoint: 'Override the algorithmic rejection and apply alternative cash-flow scoring criteria.',
            debrief: 'Human oversight is mandatory to prevent historical demographic bias from perpetuating in automated underwriting.'
          }
        ],
        implementationStrategy: 'Establish clear foundational literacy benchmarks across all teams handling financial spreadsheets.',
        rolloutMethod: 'Micro-learning modules with interactive knowledge checks and downloadable glossaries.',
        meApproach: 'Pre/post diagnostic scores measuring comprehension of AI capabilities and limitations.',
        improvementCycle: 'Quarterly review of emerging AI financial toolsets and regulatory amendments.',
        implementationChecklistTitle: 'AI Foundation & Privacy Compliance Readiness Checklist',
        rolloutFrameworkTitle: 'Module 1 Literacy Implementation Framework',
        riskComplianceSectionTitle: 'POPIA Data Ingestion & Privacy Risk Matrix',
        continuousAiLearningApproach: 'Monthly briefings on emerging fintech tools and algorithmic developments.',
        aiGovernanceFramework: 'Tier 1 foundational awareness certified upon completion of knowledge check.',
        aiFeedbackReviewMechanism: 'Feedback channel for reporting unrecognized AI terms or new fintech tools.'
      }
    },
    {
      id: 'mod-2',
      moduleNumber: 2,
      title: 'Practical Application & AI Intervention in Financial Workflows',
      subtitle: 'Hands-on AI Budgeting, Predictive Modelling & Human-in-the-Loop Verification',
      purpose: 'Convert foundational knowledge into workplace action through scenario-based simulations of AI budgeting, forecasting, and fraud auditing.',
      keySkills: [
        'AI-Assisted Cash Flow Forecasting',
        'Algorithmic Anomaly Detection',
        'Scenario Simulation & Prompting',
        'Human Verification Protocols'
      ],
      learningObjectives: [
        'Construct and execute structured financial prompts to perform budget variance analysis without exposing sensitive data.',
        'Audit AI-generated financial projections for mathematical errors, hallucinations, and false assumptions.',
        'Apply human-in-the-loop decision protocols before approving AI-recommended financial transactions.'
      ],
      status: 'Complete',
      requirements: {
        problemDefinition: 'Applying AI to live financial workflows requires structured prompt engineering, output cross-verification, and strict human oversight.',
        workplaceContext: 'Daily budgeting, variance reporting, cash flow modelling, and expense forecasting in corporate finance departments.',
        keyTerms: 'Zero-PII Prompt Engineering, Automated Variance Formulas, Sensitivity Stress-Testing, Triangulated Data Auditing.',
        causes: 'Unstructured prompting leading to inaccurate formulas and failure to verify synthetic spreadsheet figures.',
        warningSigns: 'Relying on single-pass AI outputs without secondary calculation checks.',
        impactStatement: 'Financial misstatements, erroneous tax filings, budget shortfalls, and executive liability.',
        aiDemystification: 'AI generates plausible patterns, not verified arithmetic truths; financial math must be independently validated.',
        aiInThisDomain: 'Automated ledger categorization, predictive cash flow variance analysis, robo-advisory portfolio rebalancing.',
        aiToolsOverview: 'Excel Copilot formulas, ChatGPT Advanced Data Analysis, Cleo enterprise expense engines.',
        responsibleAiPrinciples: 'Never finalize a financial summary without 3-point reconciliation against primary bank statements.',
        toolsAndTechniques: 'Zero-PII Prompt Engineering, Automated Variance Formulas, Sensitivity Stress-Testing, Triangulated Data Auditing.',
        procedureSteps: '1. Data sanitization & PII scrubbing -> 2. Structured prompt execution with explicit formatting constraints -> 3. Output extraction -> 4. 3-point mathematical cross-verification -> 5. Human manager sign-off.',
        roleResponsibilities: 'Employee: Sanitizes data, executes prompts, performs baseline checks. Manager: Validates logic, audits assumptions, signs off financial commitments.',
        communicationApproach: 'Clear disclosure: "Drafted with AI financial analytics assistance; reviewed, verified, and approved by [Employee Name]".',
        supportMechanisms: 'Internal AI Helpdesk, Certified Financial Prompt Library, Compliance Hotline for algorithmic anomalies.',
        scenarios: [
          {
            id: 'sc-2-1',
            title: 'Quarterly Budget Variance Prompting',
            situation: 'Finance team has 48 hours to complete a 100-page expense variance report across 12 regional branches.',
            challenge: 'Manual formula extraction is causing overtime and calculation fatigue, increasing risk of missed outliers.',
            decisionPoint: 'Use sanitized prompt templates in Copilot to identify top 10 cost drivers with variance >15%, then audit ledger lines.',
            debrief: 'AI accelerates synthesis, but percentage totals must be verified against the source general ledger.'
          },
          {
            id: 'sc-2-2',
            title: 'Robo-Advisory Client Suitability Review',
            situation: 'Retail banking client requests aggressive growth portfolio, but AI risk questionnaire indicates low risk capacity.',
            challenge: 'System recommends high-yield derivatives contrary to client\'s 2-year retirement timeline.',
            decisionPoint: 'Conduct live face-to-face consultation to realign portfolio risk with life stage and fiduciary guidelines.',
            debrief: 'Fiduciary responsibility remains strictly with the human financial planner.'
          },
          {
            id: 'sc-2-3',
            title: 'Cash Flow Stress Testing Under Fuel Price Shock',
            situation: 'Logistics firm models operating margin impact under a 10% petrol price increase.',
            challenge: 'AI output calculates direct fuel line item but misses secondary toll fee and maintenance inflation.',
            decisionPoint: 'Prompt the model with chained dependencies and manually integrate national road agency toll schedules.',
            debrief: 'Complex supply chain financial models require domain-specific parameter chaining and human refinement.'
          }
        ],
        aiScenarios: [
          {
            id: 'ai-sc-2-1',
            title: 'Detecting an AI Model Hallucination in Tax Deduction Claims',
            situation: 'An employee uses AI to identify corporate tax deductions under South African Section 12J and Section 18A.',
            challenge: 'The AI cites an expired 2019 tax incentive as currently active and eligible for deduction.',
            decisionPoint: 'Verify against the current SARS tax handbook, identify the hallucination, and correct the filing.',
            debrief: 'AI models may recall obsolete tax legislation; always verify against primary SARS sources.'
          },
          {
            id: 'ai-sc-2-2',
            title: 'Synthetic Voice Authority Authorization Test',
            situation: 'Finance officer receives a realistic voice call from the CEO demanding urgent EFT release for an acquisition.',
            challenge: 'Background noise and cadence sound 100% authentic, but payment routing is unusual.',
            decisionPoint: 'Initiate strict challenge-response protocol via pre-arranged physical corporate channel.',
            debrief: 'Never authorize financial transactions on voice instruction alone in the era of generative voice cloning.'
          }
        ],
        implementationStrategy: 'Embed validated prompt templates into standard finance team desktop software.',
        rolloutMethod: 'Supervised weekly practical workshops and peer prompt auditing exercises.',
        meApproach: 'Error rate tracking on AI-assisted financial reports and prompt efficiency scores.',
        improvementCycle: 'Monthly prompt tuning and removal of deprecated formula prompts.',
        implementationChecklistTitle: 'Practical AI Financial Workflow & Prompt Verification Checklist',
        rolloutFrameworkTitle: 'Module 2 Practical Application SOP',
        riskComplianceSectionTitle: 'Mathematical Verification & Hallucination Audit Matrix',
        continuousAiLearningApproach: 'Bi-weekly prompt hackathons and financial modeling challenge sessions.',
        aiGovernanceFramework: 'Tier 2 operational sign-off required for all customer-facing reports.',
        aiFeedbackReviewMechanism: 'Logging of AI formula errors in the departmental QA bug tracker.'
      }
    },
    {
      id: 'mod-3',
      moduleNumber: 3,
      title: 'Implementation, Governance & Continuous AI Learning',
      subtitle: 'SOPs, 30-Day Action Plans, POPIA Compliance & Lifecycle Governance',
      purpose: 'Translate training into sustained workplace behaviour, organizational change, risk mitigation, and lifelong AI capability.',
      keySkills: [
        'AI Financial Policy Formulation',
        'SOP Integration & Audit Trails',
        '30-Day Action Planning',
        'Continuous Algorithmic Auditing'
      ],
      learningObjectives: [
        'Formulate an actionable 30-Day Financial AI Implementation Plan for their department.',
        'Implement Standard Operating Procedures (SOPs) for AI tool onboarding, audit trails, and POPIA data protection.',
        'Establish a structured feedback loop to monitor and report AI tool accuracy, drift, and ethical concerns.'
      ],
      status: 'Complete',
      requirements: {
        problemDefinition: 'Sustained value from AI requires institutional governance, clear standard operating procedures, and continuous workforce skilling.',
        workplaceContext: 'Departmental AI rollout, compliance audits, change management, and policy enforcement across enterprise teams.',
        keyTerms: '30-Day Action Plan, Algorithmic Drift, Blameless Incident Reporting, POPIA Section 72, Model Governance Matrix.',
        causes: 'Fragmented AI adoption without institutional governance leading to compliance vulnerabilities and model drift.',
        warningSigns: 'Lack of audit trails for AI-assisted decisions, fear of reporting synthetic errors, outdated AI guidelines.',
        impactStatement: 'Loss of regulatory accreditation, systemic compliance breaches, and organizational stagnation.',
        aiDemystification: 'AI governance is not a barrier to innovation; it is the prerequisite for safe, scalable productivity.',
        aiInThisDomain: 'Enterprise AI policy enforcement, compliance monitoring, and automated transaction audit trails.',
        aiToolsOverview: 'Governance dashboards, automated compliance scanners, internal prompt registries.',
        responsibleAiPrinciples: 'Establish an open, non-punitive culture for reporting algorithmic anomalies and data near-misses.',
        toolsAndTechniques: '30-Day Action Plan templates, SOP authoring guides, POPIA compliance audit rubrics.',
        procedureSteps: '1. Draft 30-day action plan -> 2. Establish team SOPs -> 3. Configure blameless error logging -> 4. Review monthly drift metrics -> 5. Refresh compliance certifications.',
        roleResponsibilities: 'Team Lead: Oversees SOP compliance. Information Officer: Validates cross-border data transfer and POPIA adherence.',
        communicationApproach: 'Empowering, clear, accountability-driven, and supportive of continuous learning.',
        supportMechanisms: 'Enterprise Governance Portal, Chief Information Officer escalation channel, AI Ethics Committee.',
        scenarios: [
          {
            id: 'sc-3-1',
            title: 'Departmental AI Tool Onboarding Gate',
            situation: 'Department wants to adopt a new web-based AI cash flow app offering real-time bank account aggregation.',
            challenge: 'The vendor agreement stores data in unencrypted overseas servers without POPIA cross-border safeguards.',
            decisionPoint: 'Reject adoption until vendor signs POPIA Section 72 cross-border data transfer compliance agreement.',
            debrief: 'Enterprise data sovereignty is non-negotiable under South African privacy law.'
          },
          {
            id: 'sc-3-2',
            title: 'Establishing a Blameless AI Incident Post-Mortem',
            situation: 'An analyst accidentally pastes confidential customer revenue into a public AI tool session.',
            challenge: 'Fear of disciplinary action tempts the analyst to conceal the breach.',
            decisionPoint: 'Utilize the company\'s blameless error disclosure channel to immediately purge session cookies and notify the Information Officer.',
            debrief: 'Psychological safety is essential for rapid containment of data privacy incidents.'
          },
          {
            id: 'sc-3-3',
            title: 'Monitoring Algorithmic Drift in Supplier Risk Models',
            situation: 'An AI model used for 6 months begins incorrectly flagging legitimate SME vendors as high credit risk.',
            challenge: 'Post-pandemic economic shifts altered typical cash cycles, causing model parameters to skew.',
            decisionPoint: 'Retrain the evaluation parameters and recalibrate the baseline scoring weights with live data.',
            debrief: 'AI models suffer from drift and require periodic recalibration against live economic conditions.'
          }
        ],
        aiScenarios: [
          {
            id: 'ai-sc-3-1',
            title: 'Drafting a 30-Day Action Plan with AI Feedback Loop',
            situation: 'Team leads draft their 30-day team rollout schedule for financial AI tools.',
            challenge: 'Ensuring balanced workload without disrupting daily financial closing deadlines.',
            decisionPoint: 'Create modular 15-minute daily micro-practice sessions with weekly output audits.',
            debrief: 'Successful AI adoption depends on habituation rather than one-off training.'
          },
          {
            id: 'ai-sc-3-2',
            title: 'Simulating a POPIA Compliance Audit on AI Interactions',
            situation: 'Internal auditor audits 500 AI interaction logs from the finance department.',
            challenge: 'Identifying hidden PII leaks in nested conversational prompts.',
            decisionPoint: 'Implement automated regex PII filtering at API gateway level.',
            debrief: 'Automated safeguards must complement human training to achieve 100% compliance.'
          }
        ],
        implementationStrategy: 'Phased 90-day organizational rollout: 30-day pilot sandbox -> 60-day supervised integration -> 90-day full deployment.',
        rolloutMethod: 'Blended learning with digital micro-modules, weekly peer review clinics, and executive sponsorship.',
        meApproach: 'Quarterly compliance audits, employee AI confidence indices, and verified error reduction metrics.',
        improvementCycle: 'Bi-weekly prompt library updates, quarterly model retraining review, annual governance refresh.',
        implementationChecklistTitle: 'AI Financial Literacy 30-Day Workplace Action Plan',
        rolloutFrameworkTitle: 'Corporate AI Financial Operations Rollout & SOP Guide',
        riskComplianceSectionTitle: 'Financial AI Risk, Bias Mitigation & POPIA Compliance Matrix',
        continuousAiLearningApproach: 'Monthly curated webinars on FinTech AI advancements, participation in South African AI Ethics Forums, subscription to FSCA regulatory circulars.',
        aiGovernanceFramework: 'Tier 2 authorization matrix: Low-risk analytical prompts (Self-certified) -> Customer-impacting advisory prompts (Peer-reviewed) -> High-value transactional prompts (Executive & Legal sign-off).',
        aiFeedbackReviewMechanism: 'Centralized incident repository where prompt errors, hallucinations, and algorithmic edge cases are documented and resolved.'
      }
    }
  ],
  learningDesign: {
    coreStandardsSummary: 'Structured module flow with clear learning progression (Discover → Practise → Evaluate → Apply → Reflect); Scenario-based learning (min 3–5 per module); Knowledge checks at end of each module (min 5 questions); Real workplace application focus; Critical thinking development.',
    aiDemoSimulationDescription: 'Interactive sandbox simulations demonstrating live ChatGPT and Excel Copilot prompt workflows on sanitized financial data sets.',
    promptExerciseDescription: 'Hands-on exercises guiding learners to formulate role-specific financial prompts with explicit format constraints and zero-PII boundaries.',
    aiEvaluationTask: 'Learners critique and identify mathematical hallucinations and regulatory inaccuracies in synthetic AI-generated financial reports.',
    collaborationActivity: 'Human-AI paired analysis where learners use AI to generate preliminary variance hypotheses, then verify findings using standard accounting ledgers.',
    learningObjectivesList: [
      'Differentiate predictive ML from generative AI in corporate financial operations.',
      'Construct zero-PII financial prompts for budgeting and variance analysis.',
      'Audit AI-generated financial reports for hallucinations and mathematical anomalies.',
      'Apply human-in-the-loop decision protocols under FSCA and POPIA regulations.',
      'Formulate and execute a 30-Day Departmental AI Financial Action Plan.'
    ],
    instructionalApproach: 'Scenario-based, learner-centred, reflective, and directly anchored in South African corporate financial workflows.',
    workplaceActivities: [
      'Sanitized Excel budget prompt construction challenge',
      'Synthetic invoice and voice cloning fraud detection drill',
      '30-Day Financial AI Implementation Plan authoring'
    ],
    examplesAndRelevance: 'South African banking, insurance, logistics, retail, and public sector case studies.',
    knowledgeChecksDescription: '5 scenario-driven multiple-choice questions per module with comprehensive explanations for correct and incorrect answers.',
    criticalThinkingDescription: 'Learners must identify faulty assumptions in algorithmic investment advice and stress-test synthetic financial models.',
    reflectionPrompts: 'How will you ensure zero personal or customer data is exposed when prompting AI tools in your daily accounting tasks?',
    learnerEngagementTypes: [
      'Interactive Scenario Decisions',
      'Formula Auditing Drills',
      'Peer Review Feedback Clinics',
      'Self-Paced Diagnostic Checks'
    ],
    assessments: [
      {
        id: 'ass-1',
        type: 'Pre-Course Diagnostic',
        description: 'Baseline assessment measuring initial financial numeracy, algorithmic awareness, and POPIA data privacy knowledge.',
        timing: 'Before Module 1',
        weighting: 'Ungraded (Baseline Diagnostic)',
        notes: '6 questions covering domain knowledge, AI awareness, and compliance.'
      },
      {
        id: 'ass-2',
        type: 'Module Knowledge Checks',
        description: 'Formative scenario-based quizzes evaluating comprehension at the end of each module.',
        timing: 'End of each module',
        weighting: 'Formative (Self-check with detailed remedial feedback)',
        notes: 'Minimum 5 questions per module with comprehensive rationales.'
      },
      {
        id: 'ass-3',
        type: 'Practical Application Task',
        description: 'Workplace-based exercise: Draft a 30-Day Financial AI Action Plan and audit an AI-generated budget variance report for mathematical and regulatory errors.',
        timing: 'After Module 2',
        weighting: '40% of Final Grade',
        passMark: '70%',
        notes: 'Graded via standardized rubric on data privacy, verification rigor, and feasibility.'
      },
      {
        id: 'ass-4',
        type: 'Final Assessment',
        description: 'Summative exam covering all 3 modules: 20 scenario-driven questions requiring critical decision-making on fraud, algorithmic bias, and POPIA governance.',
        timing: 'After Module 3',
        weighting: '60% of Final Grade',
        passMark: '80%',
        notes: 'Certificate of Competence awarded upon achieving pass mark.'
      },
      {
        id: 'ass-5',
        type: 'Post-Course Reflection',
        description: 'Self-assessment against individual learning goals and personal commitment to continuous financial AI governance.',
        timing: 'After course completion',
        weighting: 'Ungraded (Action Plan Milestone)',
        notes: 'Action plan submitted to departmental team lead.'
      }
    ]
  },
  ethics: {
    confidentialityRequirements: 'Mandatory zero-PII input protocol, strict prohibition of entering client account numbers, names, or corporate balance sheets into public AI models.',
    dataPrivacyFramework: 'POPIA (Protection of Personal Information Act No. 4 of 2013) and GDPR cross-border adequacy standards.',
    ethicsStandards: 'Transparency, fiduciary honesty, non-discrimination in credit evaluations, and verifiable algorithmic explanations.',
    psychologicalSafetyNotes: 'Blameless reporting culture for prompt failures, synthetic hallucinations, and accidental data exposure to ensure rapid organizational mitigation.',
    decisionMakingFramework: 'Tier 1 (Informational/Internal): Operator sign-off. Tier 2 (Customer-Facing): Peer review. Tier 3 (Fiduciary/Credit/Legal): Department Head & Compliance sign-off.',
    accountabilityMechanism: 'Human financial practitioners retain 100% operational, ethical, and legal accountability for all advice and decisions—AI is strictly an analytical assistant.',
    aiBiasRisk: 'Historical algorithmic bias in credit scoring (e.g. racial, socio-economic, or geographic skew in training data) that could unfairly penalise loan applicants.',
    aiDisclosureRequirement: 'Mandatory disclosure statement on all external publications: "Drafted with AI financial analytics assistance; verified and approved by [Authorized Practitioner]".',
    humanOverrideScenarios: 'Credit declination, disciplinary financial actions, fraud reporting, and client investment allocation must NEVER be fully automated without certified human sign-off.',
    dataSovereigntyContext: 'Compliance with POPIA Section 72 on cross-border cloud storage and ensuring corporate financial data is hosted within compliant South African jurisdictions.',
    aiWorkforceImpactNarrative: 'Framed positively and honestly: AI replaces repetitive manual data entry and spreadsheet consolidation, freeing professionals for high-value strategic advisory and client engagement.',
    aiGovernanceReference: 'South African Department of Communications and Digital Technologies (DCDT) National AI Policy, UNESCO AI Ethics Recommendations, FSCA Fintech Guidelines.',
    cards: [
      {
        id: 'eth-1',
        title: 'Privacy & Confidentiality',
        subtitle: 'POPIA controls',
        status: 'Complete',
        guidingQuestion: 'What measures are in place to ensure confidential business data and personal information are protected from public AI exposure?',
        response: 'Mandatory zero-PII data redaction protocol. All spreadsheets and customer records must be anonymized before prompting any AI tool.',
        exampleText: 'Anonymize customer names to "Client A" and mask bank account numbers to "XXXX-1234" prior to analysis.',
        complianceRef: 'POPIA Act 4 of 2013, Section 19'
      },
      {
        id: 'eth-2',
        title: 'Bias & Fairness',
        subtitle: 'Risk examples',
        status: 'Complete',
        guidingQuestion: 'How does the course address potential bias and discrimination in AI-generated predictions and recommendations?',
        response: 'Auditing algorithmic credit scoring outputs for historical demographic bias and requiring manual human reviews for loan declinations.',
        exampleText: 'Screen training data distributions to prevent geographic and socio-economic credit redlining.',
        complianceRef: 'Constitution of South Africa Section 9, UNESCO AI Ethics'
      },
      {
        id: 'eth-3',
        title: 'Transparency',
        subtitle: 'Disclosure guidance',
        status: 'Complete',
        guidingQuestion: 'When and how should employees disclose that AI tools were used in preparing workplace content?',
        response: 'Explicit disclosure standard on all corporate reports and financial plans: "Prepared with AI analytical assistance, verified by [Name]".',
        exampleText: 'Include standardized disclosure stamp in footer of all AI-generated financial summaries.',
        complianceRef: 'King IV Corporate Governance Report'
      },
      {
        id: 'eth-4',
        title: 'Human Oversight',
        subtitle: 'Escalation decisions',
        status: 'Complete',
        guidingQuestion: 'What decisions must NEVER be fully delegated to AI without human review and sign-off?',
        response: 'Fiduciary investment advisory, credit declines, fraud reporting to regulatory authorities, and employee financial disciplinary actions.',
        exampleText: 'Automated decline triggers mandatory 48-hour human appeal review under POPIA Section 71.',
        complianceRef: 'POPIA Section 71 (Automated decision making)'
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
    benchmarkReviewed: true,
    benchmarkReviewNotes: 'Authoritative benchmark reference course for eStudy South Africa Master Prompt Template v9.0. Verified 100% compliant across all 40 criteria.',
    qaChecklistConfirmed: true
  },
  customisation: {
    branding: 'eStudy South Africa',
    tone: 'Professional, supportive, structured, and accessible',
    audienceContext: 'Financial services employees, accountants, and corporate operations teams',
    industryExamples: 'South African Financial Services (Banking, Asset Management, Insurance, Corporate Treasury)',
    terminology: 'South African business and financial terminology (SARB, SARS, POPIA, FSCA, NCA, EFT)',
    formatting: 'Digital self-paced e-learning with interactive cards and printable PDF summaries',
    deliveryPreferences: 'LMS SCORM Package + Facilitator Guide + Participant Action Plan',
    planningNotes: [
      {
        templateSection: '1. Problem Statement',
        whatChanges: 'Industry context, target group, operational impact',
        notes: 'Financial literacy gap, algorithmic trading, fraud risks, and productivity gains.'
      },
      {
        templateSection: '2. Sources',
        whatChanges: 'Regulation, industry links, AI tools used in domain',
        notes: 'FSCA guidelines, POPIA Act 4 of 2013, King IV Principle 12, NCA credit guidelines.'
      },
      {
        templateSection: '3.1 Course Details',
        whatChanges: 'Title, code, domain, duration, NQF level',
        notes: 'EST-FIN-AI-01, 16 Hours / 2 CPD Credits, NQF Level 5 Fasset/INSETA alignment.'
      },
      {
        templateSection: '3.6 Target Audience',
        whatChanges: 'Job roles, departments, AI literacy baseline',
        notes: 'Accountants, financial planners, operations staff with basic spreadsheet literacy.'
      },
      {
        templateSection: '4. Module Content',
        whatChanges: 'Scenarios, terminology, tools, procedures',
        notes: 'Module 1: Foundations; Module 2: Practical Application; Module 3: Governance & 30-Day Plan.'
      },
      {
        templateSection: '6. Ethics',
        whatChanges: 'Domain-specific risks, AI bias context, data laws',
        notes: 'Zero-PII input rule, demographic bias mitigation in credit scoring, human sign-off.'
      },
      {
        templateSection: '7.4 Accessibility',
        whatChanges: 'Reading level, language, cultural context',
        notes: 'Plain business English at NQF Level 4 reading comprehension with SA workplace diversity.'
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
        courseTitle: 'AI-Enhanced Customer Service & CRM Operations',
        industry: 'Telecommunications & Retail',
        dateBuilt: '2025',
        version: 'v1.0 — Deployed'
      },
      {
        courseTitle: 'Digital Procurement & Supply Chain Automation',
        industry: 'Manufacturing & Logistics',
        dateBuilt: '2026',
        version: 'v1.0 — Deployed'
      },
      {
        courseTitle: 'Responsible AI in Healthcare Administration',
        industry: 'Healthcare & Public Health',
        dateBuilt: '2026',
        version: 'v1.0 — Planned'
      }
    ]
  }
};

/**
 * Clean Blank Master Template ready for custom course generation:
 */
export const blankMasterTemplate: Course = {
  id: 'course-template-v9',
  name: 'New Master Course',
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
    digitalReadinessLevel: '',
    aiEthicsComplianceRisk: ''
  },
  research: {
    sources: [
      {
        id: 'src-init-1',
        name: '',
        type: 'Regulatory framework',
        reference: '',
        relevance: '',
        status: 'Required'
      },
      {
        id: 'src-init-2',
        name: '',
        type: 'Industry standard',
        reference: '',
        relevance: '',
        status: 'Required'
      }
    ],
    regulatoryFramework: 'POPIA Act 4 of 2013, SETA SAQA Unit Standards',
    aiToolsPlatformName: '',
    aiEthicsFramework: 'UNESCO AI Ethics / SA DCDT Policy Framework',
    caseStudyUseCases: '',
    evidenceStandards: [
      'POPIA Act No. 4 of 2013 Statutory Compliance',
      '3-Point Empirical Verification for Statistical Data'
    ],
    benchmarkingNotes: 'Benchmarked against the Use of Artificial Intelligence in Financial Literacy reference course.',
    benchmarkCourseRef: 'Use of Artificial Intelligence in Financial Literacy'
  },
  structure: {
    title: '',
    code: 'EST-NEW-01',
    industryDomain: '',
    targetRoles: '',
    aiIntegrationLevel: 'Applied',
    setaNqfLevel: 'NQF Level 4/5 Alignment',
    deliveryLanguages: 'English (South African Business Context)',
    estimatedDuration: '16 Hours / 2 CPD Credits',
    deliveryFormat: 'Blended Digital Courseware with Interactive LMS Scenarios',
    difficultyLevel: 'Intermediate',
    purposeStatement: '',
    workplaceRelevance: '',
    performanceImprovement: '',
    aiTechAngle: '',
    scopeSummary: '',
    aiEraRelevance: '',
    performanceLink: '',
    organisationalBenefits: ['', ''],
    employeeBenefits: ['', ''],
    riskReductionOutcomes: ['', ''],
    scope: '',
    keyCompetencies: '',
    realWorldApplication: '',
    aiSkillsDeveloped: '',
    jobRoles: '',
    departments: '',
    experienceLevel: 'Entry to Mid-level',
    aiFamiliarityBaseline: 'Basic',
    prerequisiteKnowledge: '',
    prerequisiteExperience: '',
    toolsSystems: '',
    digitalLiteracyLevel: 'NQF Level 4 minimum',
    diagnosticQuestions: [
      {
        id: 'dq-init-1',
        question: '',
        category: 'General domain',
        purpose: 'Assess baseline foundational knowledge.'
      },
      {
        id: 'dq-init-2',
        question: '',
        category: 'Problem awareness',
        purpose: 'Evaluate awareness of operational bottlenecks.'
      },
      {
        id: 'dq-init-3',
        question: '',
        category: 'Current practices',
        purpose: 'Identify existing workplace procedures.'
      },
      {
        id: 'dq-init-4',
        question: '',
        category: 'AI / digital readiness',
        purpose: 'Assess AI literacy and tool awareness.'
      },
      {
        id: 'dq-init-5',
        question: '',
        category: 'Ethics & compliance',
        purpose: 'Verify understanding of statutory and privacy rules.'
      }
    ],
    learningJourney: [
      {
        id: 'step-init-1',
        stepNumber: 1,
        title: 'Discover & Demystify',
        subtitle: 'Foundational Knowledge & AI Literacy',
        description: 'Understand core domain concepts, terminology, and baseline ethical principles.'
      },
      {
        id: 'step-init-2',
        stepNumber: 2,
        title: 'Practise & Apply',
        subtitle: 'Scenario-Based Workplace Simulation',
        description: 'Execute practical tasks, workplace procedures, and AI-augmented tools.'
      },
      {
        id: 'step-init-3',
        stepNumber: 3,
        title: 'Evaluate & Audit',
        subtitle: 'Critical Thinking & Quality Control',
        description: 'Critique outputs, catch hallucinations, and enforce human oversight.'
      },
      {
        id: 'step-init-4',
        stepNumber: 4,
        title: 'Embed & Govern',
        subtitle: 'SOPs, Action Plans & Lifelong Learning',
        description: 'Deploy 30-day workplace action plan and integrate continuous learning.'
      }
    ]
  },
  modules: [
    {
      id: 'mod-1',
      moduleNumber: 1,
      title: 'Foundational Understanding & Problem Domain',
      subtitle: 'Core Concepts, AI Literacy & Cognitive Baseline',
      purpose: 'Build foundational awareness before practical application.',
      keySkills: [],
      learningObjectives: ['', '', ''],
      status: 'Not started',
      requirements: {
        problemDefinition: '',
        workplaceContext: '',
        keyTerms: '',
        causes: '',
        warningSigns: '',
        impactStatement: '',
        aiDemystification: '',
        aiInThisDomain: '',
        aiToolsOverview: '',
        responsibleAiPrinciples: '',
        toolsAndTechniques: '',
        procedureSteps: '',
        roleResponsibilities: '',
        communicationApproach: '',
        supportMechanisms: '',
        scenarios: [],
        aiScenarios: [],
        implementationStrategy: '',
        rolloutMethod: '',
        meApproach: '',
        improvementCycle: '',
        implementationChecklistTitle: 'Foundational Competency Checklist',
        rolloutFrameworkTitle: 'Module 1 Implementation Framework',
        riskComplianceSectionTitle: 'Foundational Risk & Compliance Matrix',
        continuousAiLearningApproach: '',
        aiGovernanceFramework: '',
        aiFeedbackReviewMechanism: ''
      }
    },
    {
      id: 'mod-2',
      moduleNumber: 2,
      title: 'Practical Application & Workplace Intervention',
      subtitle: 'Scenario-Driven Tools, Techniques & Procedures',
      purpose: 'Convert knowledge into workplace action with scenario-based interventions.',
      keySkills: [],
      learningObjectives: ['', '', ''],
      status: 'Not started',
      requirements: {
        problemDefinition: '',
        workplaceContext: '',
        keyTerms: '',
        causes: '',
        warningSigns: '',
        impactStatement: '',
        aiDemystification: '',
        aiInThisDomain: '',
        aiToolsOverview: '',
        responsibleAiPrinciples: '',
        toolsAndTechniques: '',
        procedureSteps: '',
        roleResponsibilities: '',
        communicationApproach: '',
        supportMechanisms: '',
        scenarios: [],
        aiScenarios: [],
        implementationStrategy: '',
        rolloutMethod: '',
        meApproach: '',
        improvementCycle: '',
        implementationChecklistTitle: 'Practical Workplace Application Checklist',
        rolloutFrameworkTitle: 'Module 2 Standard Operating Procedures',
        riskComplianceSectionTitle: 'Operational Risk & Quality Audit Matrix',
        continuousAiLearningApproach: '',
        aiGovernanceFramework: '',
        aiFeedbackReviewMechanism: ''
      }
    },
    {
      id: 'mod-3',
      moduleNumber: 3,
      title: 'Implementation, Governance & Continuous Skilling',
      subtitle: '30-Day Action Plan, Rollout SOPs & Lifecycle Governance',
      purpose: 'Ensure learners translate training into sustained workplace behaviour and change.',
      keySkills: [],
      learningObjectives: ['', '', ''],
      status: 'Not started',
      requirements: {
        problemDefinition: '',
        workplaceContext: '',
        keyTerms: '',
        causes: '',
        warningSigns: '',
        impactStatement: '',
        aiDemystification: '',
        aiInThisDomain: '',
        aiToolsOverview: '',
        responsibleAiPrinciples: '',
        toolsAndTechniques: '',
        procedureSteps: '',
        roleResponsibilities: '',
        communicationApproach: '',
        supportMechanisms: '',
        scenarios: [],
        aiScenarios: [],
        implementationStrategy: '',
        rolloutMethod: '',
        meApproach: '',
        improvementCycle: '',
        implementationChecklistTitle: '30-Day Workplace Action Plan',
        rolloutFrameworkTitle: 'Enterprise Rollout & SOP Guide',
        riskComplianceSectionTitle: 'Risk, Ethics & POPIA Compliance Matrix',
        continuousAiLearningApproach: '',
        aiGovernanceFramework: '',
        aiFeedbackReviewMechanism: ''
      }
    }
  ],
  learningDesign: {
    coreStandardsSummary: 'Structured module flow with clear learning progression; Scenario-based learning (min 3–5 per module); Knowledge checks at end of each module (min 5 questions); Real workplace application focus throughout; Critical thinking development.',
    aiDemoSimulationDescription: '',
    promptExerciseDescription: '',
    aiEvaluationTask: '',
    collaborationActivity: '',
    learningObjectivesList: [],
    instructionalApproach: 'Scenario-based, interactive, and aligned with Bloom\'s Taxonomy.',
    workplaceActivities: [],
    examplesAndRelevance: '',
    knowledgeChecksDescription: 'Minimum 5 questions per module with clear explanations.',
    criticalThinkingDescription: '',
    reflectionPrompts: '',
    learnerEngagementTypes: [
      'Interactive Scenarios',
      'Knowledge Checks',
      'Action Plan Authoring'
    ],
    assessments: [
      {
        id: 'ass-init-1',
        type: 'Pre-Course Diagnostic',
        description: 'Baseline assessment before Module 1',
        timing: 'Before Module 1',
        weighting: 'Ungraded (Baseline Assessment)',
        notes: '5–10 diagnostic questions assessing prior knowledge and AI readiness.'
      },
      {
        id: 'ass-init-2',
        type: 'Module Knowledge Checks',
        description: 'Formative quizzes at the end of each module',
        timing: 'End of each module',
        weighting: 'Formative (Self-check with detailed remedial feedback)',
        notes: 'Minimum 5 questions per module.'
      },
      {
        id: 'ass-init-3',
        type: 'Practical Application Task',
        description: 'Workplace-based exercise and 30-Day Action Plan',
        timing: 'After Module 2',
        weighting: '40% of Final Grade',
        passMark: '70%',
        notes: 'Demonstrates practical application in workplace context.'
      },
      {
        id: 'ass-init-4',
        type: 'Final Assessment',
        description: 'Summative assessment covering all modules',
        timing: 'After Module 3',
        weighting: '60% of Final Grade',
        passMark: '80%',
        notes: 'Scenario-based final exam.'
      },
      {
        id: 'ass-init-5',
        type: 'Post-Course Reflection',
        description: 'Self-assessment against learning goals',
        timing: 'After course completion',
        weighting: 'Ungraded (Action Plan Milestone)',
        notes: 'Personal action plan commitment.'
      }
    ]
  },
  ethics: {
    confidentialityRequirements: '',
    dataPrivacyFramework: 'Protection of Personal Information Act (POPIA Act No. 4 of 2013)',
    ethicsStandards: '',
    psychologicalSafetyNotes: 'Blameless error logging for prompt mistakes and synthetic inaccuracies.',
    decisionMakingFramework: 'Tier 1 low-risk self-certified; Tier 2 peer sign-off; Tier 3 management approval.',
    accountabilityMechanism: 'Human employees retain 100% legal, ethical, and operational accountability.',
    aiBiasRisk: '',
    aiDisclosureRequirement: 'Mandatory attribution: "Drafted with AI assistance, verified by [Name]".',
    humanOverrideScenarios: 'High-impact decisions, customer communications, and financial approvals.',
    dataSovereigntyContext: 'Compliance with POPIA Section 72 on cross-border data transfer.',
    aiWorkforceImpactNarrative: 'AI augments professional performance, eliminating tedious manual tasks.',
    aiGovernanceReference: 'SA DCDT AI Policy Framework & UNESCO AI Ethics Recommendations',
    cards: [
      {
        id: 'eth-1',
        title: 'Privacy & Confidentiality',
        subtitle: 'POPIA controls',
        status: 'Needs input',
        guidingQuestion: 'What measures are in place to ensure confidential business data and personal information are protected from public AI exposure?',
        response: '',
        exampleText: '',
        complianceRef: 'POPIA Act 4 of 2013, Section 19'
      },
      {
        id: 'eth-2',
        title: 'Bias & Fairness',
        subtitle: 'Risk examples',
        status: 'Needs input',
        guidingQuestion: 'How does the course address potential bias and discrimination in AI-generated predictions and recommendations?',
        response: '',
        exampleText: '',
        complianceRef: 'Constitution of South Africa Section 9, UNESCO AI Ethics'
      },
      {
        id: 'eth-3',
        title: 'Transparency',
        subtitle: 'Disclosure guidance',
        status: 'Needs input',
        guidingQuestion: 'When and how should employees disclose that AI tools were used in preparing workplace content?',
        response: '',
        exampleText: '',
        complianceRef: 'King IV Corporate Governance Report'
      },
      {
        id: 'eth-4',
        title: 'Human Oversight',
        subtitle: 'Escalation decisions',
        status: 'Needs input',
        guidingQuestion: 'What decisions must NEVER be fully delegated to AI without human review and sign-off?',
        response: '',
        exampleText: '',
        complianceRef: 'POPIA Section 71 (Automated decision making)'
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
    benchmarkReviewNotes: 'Review AI output against the Financial Literacy benchmark course before LMS deployment.',
    qaChecklistConfirmed: false
  },
  customisation: {
    branding: 'eStudy South Africa',
    tone: 'Professional, supportive, action-oriented, and accessible',
    audienceContext: 'Corporate workplace teams and operational managers',
    industryExamples: 'Cross-sector South African enterprises',
    terminology: 'Standard South African corporate terminology with clear definitions',
    formatting: 'Digital self-paced e-learning with interactive cards and printable PDF summaries',
    deliveryPreferences: 'LMS SCORM Package + Facilitator Guide + Participant Action Plan',
    planningNotes: [
      {
        templateSection: '1. Problem Statement',
        whatChanges: 'Industry context, target group, operational impact',
        notes: 'Tailored for target learners and workplace context.'
      },
      {
        templateSection: '2. Sources',
        whatChanges: 'Regulation, industry links, AI tools used in domain',
        notes: 'Aligned with domain regulations and evidence standards.'
      },
      {
        templateSection: '3.1 Course Details',
        whatChanges: 'Title, code, domain, duration, NQF level',
        notes: 'Set duration and qualification alignment.'
      },
      {
        templateSection: '3.6 Target Audience',
        whatChanges: 'Job roles, departments, AI literacy baseline',
        notes: 'Target audience roles and baseline prerequisites.'
      },
      {
        templateSection: '4. Module Content',
        whatChanges: 'Scenarios, terminology, tools, procedures',
        notes: '3 core modules: Foundational, Practical application, and Implementation & governance.'
      },
      {
        templateSection: '6. Ethics',
        whatChanges: 'Domain-specific risks, AI bias context, data laws',
        notes: 'Data privacy, fairness, and accountability protocols.'
      },
      {
        templateSection: '7.4 Accessibility',
        whatChanges: 'Reading level, language, cultural context',
        notes: 'Plain business language at NQF Level 4 reading comprehension.'
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
        courseTitle: 'New eStudy Course',
        industry: 'Corporate Operations',
        dateBuilt: '2026',
        version: 'v1.0 — Draft'
      }
    ]
  }
};

export interface CourseTemplateOption {
  id: string;
  name: string;
  badge: string;
  description: string;
  course: Course;
}

export const availableTemplates: CourseTemplateOption[] = [
  {
    id: 'master-template-v9',
    name: 'eStudy Master Course Template v9.0',
    badge: 'Universal Framework',
    description: 'Clean standard instructional architecture with the full 9-section structure, baseline learning journey, and guidance standards.',
    course: blankMasterTemplate
  },
  {
    id: 'financial-literacy-benchmark',
    name: 'Financial Literacy AI Benchmark Reference',
    badge: 'Benchmark Course',
    description: 'Complete pre-populated exemplar course with verified FSCA/POPIA sources, 3 fully articulated modules, and real workplace scenarios.',
    course: financialLiteracyBenchmarkCourse
  }
];

export function createScratchCourse(title: string = 'Untitled Course'): Course {
  const newId = `course-${Date.now()}`;
  return {
    id: newId,
    name: title,
    code: `EST-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    status: 'Draft',
    lastModified: 'Just now',
    problem: {
      targetGroup: '',
      taskOrSkill: '',
      operationalImpact: '',
      rootCauses: [],
      processFailures: '',
      skillGaps: '',
      constraints: '',
      aiLiteracyGap: '',
      digitalReadinessLevel: '',
      aiEthicsComplianceRisk: ''
    },
    research: {
      sources: [],
      regulatoryFramework: '',
      aiToolsPlatformName: '',
      aiEthicsFramework: '',
      caseStudyUseCases: '',
      evidenceStandards: [],
      benchmarkingNotes: '',
      benchmarkCourseRef: ''
    },
    structure: {
      title: title,
      code: `EST-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      industryDomain: '',
      targetRoles: '',
      aiIntegrationLevel: 'Applied',
      setaNqfLevel: '',
      deliveryLanguages: 'English (South African Business Context)',
      estimatedDuration: '16 Hours / 2 CPD Credits',
      deliveryFormat: 'Blended Digital Courseware with Interactive LMS Scenarios',
      difficultyLevel: 'Intermediate',
      purposeStatement: '',
      workplaceRelevance: '',
      performanceImprovement: '',
      aiTechAngle: '',
      scopeSummary: '',
      aiEraRelevance: '',
      performanceLink: '',
      organisationalBenefits: [],
      employeeBenefits: [],
      riskReductionOutcomes: [],
      scope: '',
      keyCompetencies: '',
      realWorldApplication: '',
      aiSkillsDeveloped: '',
      jobRoles: '',
      departments: '',
      experienceLevel: 'Entry to Mid-level',
      aiFamiliarityBaseline: 'Basic',
      prerequisiteKnowledge: '',
      prerequisiteExperience: '',
      toolsSystems: '',
      digitalLiteracyLevel: 'NQF Level 4 minimum',
      diagnosticQuestions: [],
      learningJourney: [
        {
          id: 'step-init-1',
          stepNumber: 1,
          title: 'Discover & Demystify',
          subtitle: 'Foundational Knowledge & AI Literacy',
          description: 'Understand core domain concepts, terminology, and baseline ethical principles.'
        },
        {
          id: 'step-init-2',
          stepNumber: 2,
          title: 'Practise & Apply',
          subtitle: 'Scenario-Based Workplace Simulation',
          description: 'Execute practical tasks, workplace procedures, and AI-augmented tools.'
        },
        {
          id: 'step-init-3',
          stepNumber: 3,
          title: 'Evaluate & Audit',
          subtitle: 'Critical Thinking & Quality Control',
          description: 'Critique outputs, catch hallucinations, and enforce human oversight.'
        },
        {
          id: 'step-init-4',
          stepNumber: 4,
          title: 'Embed & Govern',
          subtitle: 'SOPs, Action Plans & Lifelong Learning',
          description: 'Deploy 30-day workplace action plan and integrate continuous learning.'
        }
      ]
    },
    modules: [
      {
        id: 'mod-1',
        moduleNumber: 1,
        title: 'Module 1: Foundational Understanding',
        subtitle: 'Core Concepts & Domain Baseline',
        purpose: '',
        keySkills: [],
        learningObjectives: [],
        status: 'Not started',
        requirements: {
          problemDefinition: '',
          workplaceContext: '',
          keyTerms: '',
          causes: '',
          warningSigns: '',
          impactStatement: '',
          aiDemystification: '',
          aiInThisDomain: '',
          aiToolsOverview: '',
          responsibleAiPrinciples: '',
          toolsAndTechniques: '',
          procedureSteps: '',
          roleResponsibilities: '',
          communicationApproach: '',
          supportMechanisms: '',
          scenarios: [],
          aiScenarios: [],
          implementationStrategy: '',
          rolloutMethod: '',
          meApproach: '',
          improvementCycle: '',
          implementationChecklistTitle: '',
          rolloutFrameworkTitle: '',
          riskComplianceSectionTitle: '',
          continuousAiLearningApproach: '',
          aiGovernanceFramework: '',
          aiFeedbackReviewMechanism: ''
        }
      },
      {
        id: 'mod-2',
        moduleNumber: 2,
        title: 'Module 2: Practical Application & Workplace Intervention',
        subtitle: 'Scenario-Driven Tools, Techniques & Procedures',
        purpose: '',
        keySkills: [],
        learningObjectives: [],
        status: 'Not started',
        requirements: {
          problemDefinition: '',
          workplaceContext: '',
          keyTerms: '',
          causes: '',
          warningSigns: '',
          impactStatement: '',
          aiDemystification: '',
          aiInThisDomain: '',
          aiToolsOverview: '',
          responsibleAiPrinciples: '',
          toolsAndTechniques: '',
          procedureSteps: '',
          roleResponsibilities: '',
          communicationApproach: '',
          supportMechanisms: '',
          scenarios: [],
          aiScenarios: [],
          implementationStrategy: '',
          rolloutMethod: '',
          meApproach: '',
          improvementCycle: '',
          implementationChecklistTitle: '',
          rolloutFrameworkTitle: '',
          riskComplianceSectionTitle: '',
          continuousAiLearningApproach: '',
          aiGovernanceFramework: '',
          aiFeedbackReviewMechanism: ''
        }
      },
      {
        id: 'mod-3',
        moduleNumber: 3,
        title: 'Module 3: Implementation, Governance & Continuous Skilling',
        subtitle: 'Rollout Framework, Compliance Matrix & Action Plan',
        purpose: '',
        keySkills: [],
        learningObjectives: [],
        status: 'Not started',
        requirements: {
          problemDefinition: '',
          workplaceContext: '',
          keyTerms: '',
          causes: '',
          warningSigns: '',
          impactStatement: '',
          aiDemystification: '',
          aiInThisDomain: '',
          aiToolsOverview: '',
          responsibleAiPrinciples: '',
          toolsAndTechniques: '',
          procedureSteps: '',
          roleResponsibilities: '',
          communicationApproach: '',
          supportMechanisms: '',
          scenarios: [],
          aiScenarios: [],
          implementationStrategy: '',
          rolloutMethod: '',
          meApproach: '',
          improvementCycle: '',
          implementationChecklistTitle: '',
          rolloutFrameworkTitle: '',
          riskComplianceSectionTitle: '',
          continuousAiLearningApproach: '',
          aiGovernanceFramework: '',
          aiFeedbackReviewMechanism: ''
        }
      }
    ],
    learningDesign: {
      coreStandardsSummary: 'Structured module flow with clear learning progression; Scenario-based learning; Real workplace application.',
      aiDemoSimulationDescription: '',
      promptExerciseDescription: '',
      aiEvaluationTask: '',
      collaborationActivity: '',
      learningObjectivesList: [],
      instructionalApproach: 'Scenario-based, interactive, and aligned with Bloom\'s Taxonomy.',
      workplaceActivities: [],
      examplesAndRelevance: '',
      knowledgeChecksDescription: '',
      criticalThinkingDescription: '',
      reflectionPrompts: '',
      learnerEngagementTypes: [
        'Interactive Scenarios',
        'Knowledge Checks',
        'Action Plan Authoring'
      ],
      assessments: [
        {
          id: 'ass-init-1',
          type: 'Pre-Course Diagnostic',
          description: 'Baseline assessment before Module 1',
          timing: 'Before Module 1',
          weighting: 'Ungraded (Baseline Assessment)',
          notes: '5–10 diagnostic questions assessing prior knowledge and AI readiness.'
        },
        {
          id: 'ass-init-2',
          type: 'Module Knowledge Checks',
          description: 'Formative quizzes at the end of each module',
          timing: 'End of each module',
          weighting: 'Formative (Self-check with detailed remedial feedback)',
          notes: 'Minimum 5 questions per module.'
        },
        {
          id: 'ass-init-3',
          type: 'Practical Application Task',
          description: 'Workplace-based exercise and Action Plan',
          timing: 'After Module 2',
          weighting: '40% of Final Grade',
          passMark: '70%',
          notes: 'Demonstrates practical application in workplace context.'
        },
        {
          id: 'ass-init-4',
          type: 'Final Assessment',
          description: 'Summative assessment covering all modules',
          timing: 'After Module 3',
          weighting: '60% of Final Grade',
          passMark: '80%',
          notes: 'Scenario-based final exam.'
        }
      ]
    },
    ethics: {
      confidentialityRequirements: '',
      dataPrivacyFramework: 'Protection of Personal Information Act (POPIA Act No. 4 of 2013)',
      ethicsStandards: '',
      psychologicalSafetyNotes: '',
      decisionMakingFramework: '',
      accountabilityMechanism: '',
      aiBiasRisk: '',
      aiDisclosureRequirement: '',
      humanOverrideScenarios: '',
      dataSovereigntyContext: '',
      aiWorkforceImpactNarrative: '',
      aiGovernanceReference: 'SA DCDT AI Policy Framework & UNESCO AI Ethics Recommendations',
      cards: [
        {
          id: 'eth-1',
          title: 'Privacy & Confidentiality',
          subtitle: 'POPIA controls',
          status: 'Needs input',
          guidingQuestion: 'What measures are in place to ensure confidential business data and personal information are protected from public AI exposure?',
          response: '',
          exampleText: '',
          complianceRef: 'POPIA Act 4 of 2013, Section 19'
        },
        {
          id: 'eth-2',
          title: 'Bias & Fairness',
          subtitle: 'Risk examples',
          status: 'Needs input',
          guidingQuestion: 'How does the course address potential bias and discrimination in AI-generated predictions and recommendations?',
          response: '',
          exampleText: '',
          complianceRef: 'Constitution of South Africa Section 9'
        },
        {
          id: 'eth-3',
          title: 'Transparency',
          subtitle: 'Disclosure guidance',
          status: 'Needs input',
          guidingQuestion: 'When and how should employees disclose that AI tools were used in preparing workplace content?',
          response: '',
          exampleText: '',
          complianceRef: 'King IV Corporate Governance Report'
        },
        {
          id: 'eth-4',
          title: 'Human Oversight',
          subtitle: 'Escalation decisions',
          status: 'Needs input',
          guidingQuestion: 'What decisions must NEVER be fully delegated to AI without human review and sign-off?',
          response: '',
          exampleText: '',
          complianceRef: 'POPIA Section 71 (Automated decision making)'
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
      culturalInclusivityNotes: '',
      formattingRequirements: 'Consistent typography hierarchy: H1 (Module), H2 (Core Lesson), H3 (Scenario / Activity).'
    },
    qa: {
      benchmarkReviewed: false,
      benchmarkReviewNotes: '',
      qaChecklistConfirmed: false
    },
    customisation: {
      branding: 'eStudy South Africa',
      tone: 'Professional, supportive, action-oriented, and accessible',
      audienceContext: '',
      industryExamples: '',
      terminology: '',
      formatting: '',
      deliveryPreferences: 'LMS SCORM Package + Facilitator Guide + Participant Action Plan',
      planningNotes: [],
      historicalCourses: []
    }
  };
}

export const sampleCourses: Course[] = [
  financialLiteracyBenchmarkCourse,
  blankMasterTemplate
];
