export type SourceType =
  | 'Regulatory framework'
  | 'Ethics framework'
  | 'Internal policy'
  | 'Industry standard'
  | 'Academic research'
  | 'Technology documentation'
  | 'Case study'
  | 'Benchmarking source';

export type SourceStatus = 'Required' | 'Verified' | 'Review' | 'Not verified' | 'Not started';

export type SourceMedium = 'document' | 'url' | 'text' | 'framework';

export interface ResearchSource {
  id: string;
  name: string;
  type: SourceType;
  reference: string;
  relevance: string;
  status: SourceStatus;
  notes?: string;
  medium?: SourceMedium;
  url?: string;
  fileName?: string;
  fileSize?: string;
  contentSnippet?: string;
  dateAdded?: string;
}

export interface Scenario {
  id: string;
  title: string;
  isAiSpecific?: boolean;
  situation: string;
  challenge: string;
  decisionPoint: string;
  debrief: string;
  moduleRef?: string;
  status?: 'Complete' | 'In progress' | 'Not started';
}

export interface DiagnosticQuestion {
  id: string;
  category: 'General domain' | 'Problem awareness' | 'Current practices' | 'AI / digital readiness' | 'Ethics & compliance';
  question: string;
  purpose?: string;
}

export interface LearningJourneyStep {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  description: string;
}

export interface ModuleRequirements {
  // Core Content
  problemDefinition: string;
  workplaceContext: string;
  keyTerms: string;
  causes: string;
  warningSigns: string;
  impactStatement: string;

  // AI Literacy Foundation
  aiDemystification: string;
  aiInThisDomain: string;
  aiToolsOverview: string;
  responsibleAiPrinciples: string;

  // Tools, Techniques & Procedures
  toolsAndTechniques: string;
  procedureSteps: string;
  roleResponsibilities: string;
  communicationApproach: string;
  supportMechanisms: string;

  // Scenarios
  scenarios: Scenario[];
  aiScenarios: Scenario[];

  // Implementation & Integration
  implementationStrategy: string;
  rolloutMethod: string;
  meApproach: string; // Monitoring & Evaluation
  improvementCycle: string;

  // Mandatory Deliverables
  implementationChecklistTitle: string;
  rolloutFrameworkTitle: string;
  riskComplianceSectionTitle: string;

  // AI Governance & Continuous Learning
  continuousAiLearningApproach: string;
  aiGovernanceFramework: string;
  aiFeedbackReviewMechanism: string;
}

export interface CourseModule {
  id: string;
  moduleNumber: number;
  title: string;
  subtitle: string;
  purpose: string;
  keySkills: string[];
  learningObjectives: string[];
  requirements: ModuleRequirements;
  status: 'Complete' | 'In progress' | 'Not started';
}

export interface AssessmentItem {
  id: string;
  type: 'Pre-Course Diagnostic' | 'Module Knowledge Checks' | 'Practical Application Task' | 'Final Assessment' | 'Post-Course Reflection';
  description: string;
  timing: string;
  weighting: string;
  passMark?: string;
  notes?: string;
}

export interface EthicsCardData {
  id: string;
  title: string;
  subtitle: string;
  status: 'Complete' | 'Needs input' | 'Not started';
  guidingQuestion: string;
  response: string;
  exampleText: string;
  complianceRef?: string;
}

export interface CustomisationOption {
  id: string;
  label: string;
  currentValue: string;
  options: string[];
  notes?: string;
}

export interface CustomisationPlanningNote {
  templateSection: string;
  whatChanges: string;
  notes: string;
}

export interface TemplateCourseHistory {
  courseTitle: string;
  industry: string;
  dateBuilt: string;
  version: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  status: 'Draft' | 'In Review' | 'Completed';
  lastModified: string;
  coverLogoUrl?: string;
  coverVisualUrl?: string;
  preferredAiEngine?: string;
  skippedFields?: string[];
  
  // Section 01 - Problem & Challenge
  problem: {
    targetGroup: string;
    taskOrSkill: string;
    operationalImpact: string;
    rootCauses: string[];
    processFailures: string;
    skillGaps: string;
    constraints: string;
    aiLiteracyGap: string;
    digitalReadinessLevel: string;
    aiEthicsComplianceRisk: string;
  };

  // Section 02 - Sources & Research
  research: {
    sources: ResearchSource[];
    regulatoryFramework: string;
    aiToolsPlatformName: string;
    aiEthicsFramework: string;
    caseStudyUseCases: string;
    evidenceStandards: string[];
    benchmarkingNotes: string;
    benchmarkCourseRef: string;
  };

  // Section 03 - Course Structure
  structure: {
    title: string;
    code: string;
    industryDomain: string;
    targetRoles: string;
    aiIntegrationLevel: '' | 'Awareness' | 'Applied' | 'Advanced';
    setaNqfLevel: string;
    deliveryLanguages: string;
    estimatedDuration: string;
    deliveryFormat: string;
    difficultyLevel: '' | 'Foundational' | 'Intermediate' | 'Advanced';
    
    // Overview
    purposeStatement: string;
    workplaceRelevance: string;
    performanceImprovement: string;
    aiTechAngle: string;
    
    // About
    scopeSummary: string;
    aiEraRelevance: string;
    performanceLink: string;
    
    // Benefits
    organisationalBenefits: string[];
    employeeBenefits: string[];
    riskReductionOutcomes: string[];
    
    // Description
    scope: string;
    keyCompetencies: string;
    realWorldApplication: string;
    aiSkillsDeveloped: string;
    
    // Target Audience
    jobRoles: string;
    departments: string;
    experienceLevel: string;
    aiFamiliarityBaseline: '' | 'None' | 'Basic' | 'Intermediate';
    
    // Prerequisites
    prerequisiteKnowledge: string;
    prerequisiteExperience: string;
    toolsSystems: string;
    digitalLiteracyLevel: string;
    
    // Diagnostics
    diagnosticQuestions: DiagnosticQuestion[];
    
    // Learning Journey
    learningJourney: LearningJourneyStep[];
  };

  // Section 04 - Modules
  modules: CourseModule[];

  // Section 05 - Learning Design
  learningDesign: {
    coreStandardsSummary: string;
    aiDemoSimulationDescription: string;
    promptExerciseDescription: string;
    aiEvaluationTask: string;
    collaborationActivity: string;
    learningObjectivesList: string[];
    instructionalApproach: string;
    workplaceActivities: string[];
    examplesAndRelevance: string;
    knowledgeChecksDescription: string;
    criticalThinkingDescription: string;
    reflectionPrompts: string;
    learnerEngagementTypes: string[];
    assessments: AssessmentItem[];
  };

  // Section 06 - Ethics, Compliance & AI Responsibility
  ethics: {
    confidentialityRequirements: string;
    dataPrivacyFramework: string;
    ethicsStandards: string;
    psychologicalSafetyNotes: string;
    decisionMakingFramework: string;
    accountabilityMechanism: string;
    aiBiasRisk: string;
    aiDisclosureRequirement: string;
    humanOverrideScenarios: string;
    dataSovereigntyContext: string;
    aiWorkforceImpactNarrative: string;
    aiGovernanceReference: string;
    cards: EthicsCardData[];
  };

  // Section 07 - Output Format Rules
  outputRequirements: {
    outputFormat: string;
    requiredSectionsNote: string;
    moduleRequirementsRule: string;
    assessmentRequirementsRule: string;
    scenarioRequirementsRule: string;
    mandatoryDeliverablesRule: string;
    referencesRule: string;
    accessibilityTargetReadingLevel: string;
    plainLanguageApplied: boolean;
    culturalInclusivityNotes: string;
    formattingRequirements: string;
  };

  // Section 08 - Quality Assurance
  qa: {
    benchmarkReviewed: boolean;
    benchmarkReviewNotes: string;
    qaChecklistConfirmed: boolean;
  };

  // Section 09 - Customisation
  customisation: {
    branding: string;
    tone: string;
    audienceContext: string;
    industryExamples: string;
    terminology: string;
    formatting: string;
    deliveryPreferences: string;
    planningNotes: CustomisationPlanningNote[];
    historicalCourses: TemplateCourseHistory[];
  };

  // AI Generated Course Artifact & Status
  generatedCourse?: GeneratedCourse;
  approvalStatus?: CourseApprovalStatus;
}

export type CourseApprovalStatus = 'draft' | 'ai_generated' | 'approved';

export type AIGenerationStage =
  | 'idle'
  | 'validating'
  | 'research'
  | 'curriculum'
  | 'content'
  | 'scenarios'
  | 'assessments'
  | 'qa_review'
  | 'preparing'
  | 'complete'
  | 'error';

export interface GeneratedLearningObjective {
  id: string;
  code: string;
  statement: string;
  bloomLevel?: 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create';
}

export interface GeneratedLesson {
  id: string;
  title: string;
  durationMinutes: number;
  concepts: string[];
  contentBody: string;
  callouts?: {
    type: 'Tip' | 'Warning' | 'Good/Bad Example' | 'POPIA Note';
    title: string;
    content: string;
  }[];
  workplaceApplication: string;
  aiApplication: string;
}

export interface GeneratedScenario {
  id: string;
  title: string;
  type: 'Workplace' | 'AI Specific';
  situation: string;
  challenge: string;
  decisionPoint: string;
  debrief: string;
  keyTakeaway: string;
}

export interface GeneratedQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0-indexed
  rationale: string;
  learningObjectiveRef?: string;
}

export interface GeneratedPracticalTask {
  id: string;
  title: string;
  instructions: string;
  deliverable: string;
  evaluationRubric: string[];
}

export interface GeneratedModule {
  id: string;
  moduleNumber: number;
  title: string;
  subtitle: string;
  purpose: string;
  learningObjectives: GeneratedLearningObjective[];
  lessons: GeneratedLesson[];
  scenarios: GeneratedScenario[];
  knowledgeChecks: GeneratedQuestion[];
  practicalTask?: GeneratedPracticalTask;
  reflection: string[];
  summary: string;
}

export interface GeneratedAssessmentSet {
  preCourseDiagnostic: {
    title: string;
    instructions: string;
    questions: GeneratedQuestion[];
  };
  moduleKnowledgeChecksCount: number;
  practicalTasks: GeneratedPracticalTask[];
  finalAssessment: {
    title: string;
    passMark: string;
    instructions: string;
    questions: GeneratedQuestion[];
    capstoneCaseStudy?: {
      title: string;
      scenario: string;
      tasks: string[];
      deliverable: string;
    };
  };
  postCourseReflection: {
    prompts: string[];
    actionPlanTemplate: string;
  };
}

export interface GeneratedSource {
  name: string;
  type: SourceType;
  reference: string;
  relevance: string;
  verified: boolean;
}

export interface GeneratedCourseQA {
  score: number;
  status: 'approved' | 'review_required' | 'critical_issues';
  passedChecks: string[];
  warnings: string[];
  criticalIssues: string[];
  recommendations: string[];
  southAfricanContextVerified: boolean;
  popiaCompliant: boolean;
}

export interface GeneratedCourse {
  id: string;
  courseId: string;
  title: string;
  code: string;
  version: string;
  overview: string;
  purpose: string;
  targetAudience: string;
  estimatedDuration: string;
  learningOutcomes: string[];
  modules: GeneratedModule[];
  assessments: GeneratedAssessmentSet;
  sources: GeneratedSource[];
  qa: GeneratedCourseQA;
  generatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export type SectionId =
  | '01'
  | '02'
  | '03'
  | '04'
  | '05'
  | '06'
  | '07'
  | '08'
  | '09';

export interface SectionMeta {
  id: SectionId;
  number: string;
  title: string;
  shortTitle: string;
  description: string;
}

export interface QACheckItem {
  id: string;
  label: string;
  targetSection: SectionId;
  isComplete: boolean;
  issueDescription?: string;
  actionLabel?: string;
}
