/**
 * eStudy Master Course Generation Framework v9.0 Central Configuration
 * Authoritative constants and rules governing prompt generation, validation, QA scoring, and generation engine.
 */

export const FRAMEWORK_VERSION = 'v9.0';
export const FRAMEWORK_TITLE = 'eStudy Master Course Generation Framework v9.0';

export const FRAMEWORK_RULES = {
  // Section 01: Problem Statement & Context
  REQUIRED_PROBLEM_FIELDS: 10,
  MIN_ROOT_CAUSES: 2,

  // Section 02: Research & Evidence
  MIN_RESEARCH_SOURCES: 2,

  // Section 03: Course Structure & Diagnostics
  MIN_DIAGNOSTIC_QUESTIONS: 5,
  MAX_DIAGNOSTIC_QUESTIONS: 10,
  MIN_AI_DIAGNOSTIC_QUESTIONS: 2,

  // Section 04: Module Architecture & Scenarios
  MIN_MODULES: 3,
  MIN_WORKPLACE_SCENARIOS_PER_MODULE: 3,
  MAX_RECOMMENDED_WORKPLACE_SCENARIOS_PER_MODULE: 5,
  MIN_AI_SCENARIOS_TOTAL: 2,
  MIN_LEARNING_OBJECTIVES_PER_MODULE: 3,

  // Section 05: Learning Design & Assessments
  MIN_KNOWLEDGE_CHECKS_PER_MODULE: 5,
  MIN_ASSESSMENTS_COUNT: 4,
  PASS_MARK_STANDARD: '80%',

  // Section 06: Ethics & AI Responsibility
  POPIA_COMPLIANCE_MANDATORY: true,
  HUMAN_IN_THE_LOOP_MANDATORY: true,

  // Section 07: Output & Language Standards
  TARGET_READING_LEVEL_DEFAULT: 'Grade 12 / NQF Level 4 (Plain English)',

  // Section 08: Quality Assurance Benchmark
  BENCHMARK_COURSE_NAME: 'eStudy Financial Literacy Benchmark Course',
  READINESS_THRESHOLD_READY: 100,
  READINESS_THRESHOLD_ALMOST: 80
} as const;

export interface FrameworkComplianceItem {
  id: string;
  code: string;
  label: string;
  category: 'Problem Definition' | 'Research & Evidence' | 'Course Structure' | 'Module Scenarios' | 'Learning Design' | 'Ethics & POPIA' | 'Output Standards' | 'Benchmark QA' | 'Customisation';
  section: '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09';
  isMandatory: boolean;
  status: 'passed' | 'warning' | 'failed';
  message: string;
  details?: string;
  actionSection?: '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09';
  actionField?: string;
}
