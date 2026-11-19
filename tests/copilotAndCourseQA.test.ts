import test from 'node:test';
import assert from 'node:assert/strict';

import {
  processLocalCopilotChat,
  classifyCopilotIntent,
  generateComprehensiveCoursePatch
} from '../src/utils/localCourseEngine.js';
import { processAIAssistedCopilotChat } from '../src/server/ai/copilotService.js';
import { generateCourseWithAIEngine } from '../src/server/ai/courseGenerator.js';
import { reviewGeneratedCourseQuality } from '../src/server/ai/courseValidator.js';
import { buildDeterministicBlueprint } from '../src/server/ai/curriculumBlueprint.js';
import { createScratchCourse } from '../src/data/initialCourseData.js';
import type { Course, CopilotAgreedRequirements } from '../src/types.js';
import type { AIRequest, AIResponse } from '../src/server/ai/types.js';

function applyPatchToCourse(base: Course, patch: Partial<Course>): Course {
  return {
    ...base,
    ...patch,
    name: patch.name || patch.structure?.title || base.name,
    code: patch.code || patch.structure?.code || base.code,
    problem: { ...base.problem, ...(patch.problem || {}) },
    research: {
      ...base.research,
      ...(patch.research || {}),
      learnerProfile: {
        ...(base.research.learnerProfile || ({} as any)),
        ...(patch.research?.learnerProfile || {})
      }
    },
    structure: { ...base.structure, ...(patch.structure || {}) },
    modules: patch.modules || base.modules,
    learningDesign: { ...base.learningDesign, ...(patch.learningDesign || {}) },
    ethics: { ...base.ethics, ...(patch.ethics || {}) },
    outputRequirements: { ...base.outputRequirements, ...(patch.outputRequirements || {}) },
    qa: { ...base.qa, ...(patch.qa || {}) },
    customisation: { ...base.customisation, ...(patch.customisation || {}) }
  };
}

/**
 * Deterministic subject-aware AI mock that simulates Groq Stage 1 (Blueprint),
 * Stage 2 (Per-module deep content), and Stage 3 (Wrapper + Assessments)
 * while enforcing distinct non-duplicated lessons, 7-part practical tasks,
 * 100%-sum rubrics, and LO-linked MCQs.
 */
function createDomainCourseAIMock(subjectFacts: {
  domainTerms: string[];
  cities: string[];
  orgs: string[];
  laws: string;
}) {
  return async (req: AIRequest): Promise<AIResponse> => {
    const prompt = req.prompt || '';
    const sys = req.systemInstruction || '';

    // Stage 1 Blueprint request
    if (
      sys.includes('Subject & Curriculum Blueprint') ||
      sys.includes('Principal Curriculum Architect') ||
      prompt.includes('Subject & Curriculum Blueprint')
    ) {
      const titleMatch = prompt.match(/Subject Title:\s*(.+)/);
      const title = titleMatch?.[1]?.trim() || 'Course';
      const modTitleMatches = [...prompt.matchAll(/"moduleNumber":\s*(\d+),\s*"title":\s*"([^"]+)"/g)];
      const count = modTitleMatches.length || 3;

      const modules = Array.from({ length: count }, (_, idx) => {
        const modNum = modTitleMatches[idx] ? Number(modTitleMatches[idx][1]) : idx + 1;
        const modTitle = modTitleMatches[idx]?.[2] || `Module ${modNum}: ${subjectFacts.domainTerms[idx % subjectFacts.domainTerms.length]}`;
        const term = subjectFacts.domainTerms[idx % subjectFacts.domainTerms.length];
        const secTerm = subjectFacts.domainTerms[(idx + 1) % subjectFacts.domainTerms.length];
        return {
          moduleNumber: modNum,
          title: modTitle,
          lessonPlans: [
            {
              title: `${term}: Architecture & Mechanisms`,
              purpose: `How ${term} works under real operational constraints.`,
              progressionStage: 'Foundation & Mental Model',
              conceptsToTeach: [term, 'Trust Boundaries', 'Failure Mode Isolation'],
              workedExampleTopic: `Baseline architecture audit for ${term}`
            },
            {
              title: `${secTerm}: Verification & Applied Practice`,
              purpose: `Implementing, auditing, and troubleshooting ${secTerm}.`,
              progressionStage: 'Verification & Governance',
              conceptsToTeach: [secTerm, 'Acceptance Thresholds', 'Escalation Paths'],
              workedExampleTopic: `Peer verification review for ${secTerm}`
            }
          ],
          scenarioContexts: [
            {
              title: `${subjectFacts.cities[idx % subjectFacts.cities.length]} ${term} Triage`,
              type: 'Workplace',
              organisationType: subjectFacts.orgs[idx % subjectFacts.orgs.length],
              cityOrSetting: subjectFacts.cities[idx % subjectFacts.cities.length],
              coreDilemma: `Addressing ${term} operational challenges under realistic team constraints`
            },
            {
              title: `${subjectFacts.cities[(idx + 1) % subjectFacts.cities.length]} ${secTerm} Escalation`,
              type: 'Workplace',
              organisationType: subjectFacts.orgs[(idx + 1) % subjectFacts.orgs.length],
              cityOrSetting: subjectFacts.cities[(idx + 1) % subjectFacts.cities.length],
              coreDilemma: `Preventing verification shortcuts during ${secTerm} execution`
            },
            {
              title: `Sign-Off Under Deadline Pressure`,
              type: 'Workplace',
              organisationType: subjectFacts.orgs[(idx + 2) % subjectFacts.orgs.length],
              cityOrSetting: subjectFacts.cities[(idx + 2) % subjectFacts.cities.length],
              coreDilemma: `Cross-team escalation and governance audit for ${term}`
            }
          ],
          practicalTaskSpec: {
            title: `Module ${modNum} Applied ${term} Verification Task`,
            objective: `Apply ${term} controls to diagnose and fix an imperfect workflow.`,
            realisticScenario: `In a ${subjectFacts.cities[idx % subjectFacts.cities.length]} ${subjectFacts.orgs[idx % subjectFacts.orgs.length]}, audit a live ${term} workflow.`,
            deliverable: `Signed Module ${modNum} ${term} Audit & Remediation Brief`,
            resourcesRequired: ['Module checklist', 'Domain specification sheet', 'Verification rubric'],
            rubricCriteria: [`${term} technical accuracy (40%)`, 'Verification & governance rigour (30%)', 'Feasibility of corrective plan (30%)']
          }
        };
      });

      return {
        provider: 'groq',
        model: req.model || 'openai/gpt-oss-120b',
        text: JSON.stringify({
          requiredDomainConcepts: subjectFacts.domainTerms,
          modules
        }),
        usage: { inputTokens: 300, outputTokens: 500 },
        durationMs: 25
      };
    }

    // Stage 2 Module synthesis request
    if (prompt.includes('Author complete Module') || sys.includes('writing Module')) {
      const modNumMatch = prompt.match(/Author complete Module\s+(\d+)/);
      const modNum = Number(modNumMatch?.[1] || 1);
      const specTitleMatch = prompt.match(/MODULE BLUEPRINT SPECIFICATION:\s*\{[\s\S]*?"title":\s*"([^"]+)"/);
      const configuredTitle = specTitleMatch?.[1]?.trim();
      const term = subjectFacts.domainTerms[(modNum - 1) % subjectFacts.domainTerms.length];
      const secondaryTerm = subjectFacts.domainTerms[modNum % subjectFacts.domainTerms.length];
      const city = subjectFacts.cities[(modNum - 1) % subjectFacts.cities.length];
      const org = subjectFacts.orgs[(modNum - 1) % subjectFacts.orgs.length];

      const distinctAngles1 = [
        `### Module 1 Foundation: Designing Reliable ${term} Systems
Every successful deployment of ${term} begins before a single tool or policy is activated: practitioners map exact inputs, failure modes, and stakeholder sign-off boundaries. Inside a ${city} ${org}, unstated assumptions quickly compound into service outages, delayed approvals, and unexpected operational spend. Rather than treating ${term} as an isolated checklist, teams document baseline capacity targets, escalation thresholds, and clear ownership across engineering and operations.

During day-to-day triage, compare automated telemetry or summary dashboards directly against primary configuration records, service logs, and vendor specifications. When ${secondaryTerm} dependencies change unexpectedly, verify rollback procedures, isolate downstream impacts, and capture objective evidence for peer audit. Disciplined teams schedule weekly review checkpoints so minor configuration drift is corrected long before customer-facing commitments or compliance obligations under ${subjectFacts.laws} are placed at risk.`,
        `### Module 2 Execution: Automating & Controlling ${term} Pipelines
Scaling ${term} across growing South African teams requires repeatable workflow automation paired with strict human verification gates. In high-volume ${city} ${org} operations, ad-hoc manual adjustments create silent configuration drift, inconsistent quality standards, and brittle hand-offs between contributors. Standardised templates, pre-flight validation checks, and version-controlled approvals eliminate guesswork while preserving delivery velocity.

Practitioners must inspect intermediate outputs before promoting changes into live environments. Whenever ${term} interacts with ${secondaryTerm}, confirm permission scoping, audit log completeness, and exception handling paths against agreed SLA tolerances. Documenting why specific architectural or policy trade-offs were accepted allows future reviewers to verify compliance under ${subjectFacts.laws}, onboard new team members faster, and perform rapid root-cause diagnostics without repeating prior mistakes.`,
        `### Module 3 Governance: Auditing Risks & Strengthening ${term}
Operational excellence in ${term} depends on proactive risk detection rather than post-incident firefighting. Within a regulated ${city} ${org}, blind trust in default settings or unverified external templates exposes teams to security breaches, inaccurate reporting, and regulatory findings under ${subjectFacts.laws}. Effective practitioners establish clear tolerance thresholds, test adversarial edge cases routinely, and demand traceable primary evidence before signing off high-impact changes.

Consider how subtle anomalies emerge between ${term} and ${secondaryTerm} during peak business cycles: early warning indicators often appear in exception queues days before full failure. By conducting structured monthly assurance sampling, assigning named action owners, and validating every corrective fix empirically, teams transform compliance from bureaucratic paperwork into a measurable operational safeguard that protects clients, budgets, and executive accountability.`,
        `### Module 4 Optimisation: Measuring ROI & Sustaining ${term}
Long-term mastery of ${term} translates technical and procedural rigour into measurable commercial value, budget predictability, and sustained team capability. Across mature ${city} ${org} teams, unmonitored usage growth or stale legacy practices gradually erode performance gains unless usage telemetry, cost attribution, and outcome KPIs are reviewed systematically every month.

Rather than optimising metrics in isolation, leads connect ${term} performance directly to stakeholder satisfaction, defect reduction, and disciplined governance of ${secondaryTerm}. Teams establish transparent 30-60-90 day capability targets, archive retired artefacts safely in line with ${subjectFacts.laws}, and run quarterly retrospective reviews. Each cycle feeds real workplace lessons back into updated onboarding checklists, ensuring every practitioner upholds consistent verification quality as organisational demands evolve.`
      ];

      const distinctAngles2 = [
        `### Practical Walkthrough: Troubleshooting ${secondaryTerm} Gaps in Practice
Real workplace environments rarely match ideal textbook conditions. Inside ${city} enterprises, practitioners frequently inherit partially documented ${secondaryTerm} workflows while still expected to deliver reliable outcomes under tight quarterly timelines. The disciplined first response is isolating verified facts from assumptions: gather raw execution logs, inspect active permission boundaries, and benchmark current metrics against documented SLA thresholds.

Worked case illustration: When reviewing an inherited ${secondaryTerm} workflow at a ${org}, the team noticed intermittent delays and rising rework. Instead of replacing tooling immediately, the lead audited configuration inputs step by step, uncovered conflicting override rules tied to ${term}, and introduced a pre-release verification sign-off sheet aligned with ${subjectFacts.laws}. Rework dropped substantially within two review cycles while audit readiness remained intact.`,
        `### Step-by-Step Verification: Reviewing ${secondaryTerm} Deliverables
Quality verification for ${secondaryTerm} becomes practical only when checks are concrete, fast to execute, and unambiguous across shift or team hand-offs. Rather than vague reminders to "double check work", high-performing ${org} teams in ${city} maintain structured peer-review checklists covering input completeness, boundary validation, exception logging, and formal sign-off accountability under ${subjectFacts.laws}.

During live review sessions, two practitioners walk through a recent ${secondaryTerm} change side by side against primary evidence. Where any step relies on automated or AI-assisted drafting linked to ${term}, reviewers independently verify citations, numerical tolerances, and privacy redaction before publication. Any gap generates a specific corrective ticket with a target date, turning every review into targeted skill building across the whole department.`,
        `### Resolving Edge Cases & Escalations in ${secondaryTerm}
High-pressure workplace incidents test whether a team's ${secondaryTerm} controls hold up when stakeholders request urgent shortcuts. Inside a busy ${city} ${org}, competing deadlines often tempt operators to bypass peer verification or waive ${subjectFacts.laws} privacy rules temporarily. Yet skipping foundational checks is precisely how minor anomalies escalate into major customer or audit incidents.

An effective escalation protocol defines tiered review levels: routine low-risk changes pass lightweight automated checks, whereas high-impact adjustments affecting ${term} require explicit lead sign-off backed by documented rollback steps. By rehearsing exception scenarios during quarterly team workshops, practitioners build confidence to push back constructively, isolate critical risks quickly, and sustain both delivery speed and verifiable governance.`,
        `### Embedding 30-60-90 Day Continuous Improvement in ${secondaryTerm}
Training creates lasting workplace impact only when new habits in ${secondaryTerm} survive the transition back to daily operations. In the first thirty days after completing this module, practitioners at a ${city} ${org} audit one live workflow against Module ${modNum} criteria, identifying top recurring defects and privacy risks under ${subjectFacts.laws}.

By day sixty, leads consolidate findings into lightweight standard operating templates covering ${term} and ${secondaryTerm} hand-offs across teams. By day ninety, the unit tracks baseline versus current error rates, resolution turnaround, and audit pass consistency in regular management reviews. This closed feedback loop turns individual competence into durable institutional capability.`
      ];

      const lesson1Body = distinctAngles1[(modNum - 1) % distinctAngles1.length];
      const lesson2Body = distinctAngles2[(modNum - 1) % distinctAngles2.length];

      const modulePayload = {
        id: `mod-${modNum}`,
        moduleNumber: modNum,
        title: configuredTitle || `Module ${modNum}: ${term}`,
        subtitle: `Applied ${term} & ${secondaryTerm} Mastery`,
        purpose: `Enable practitioners to design, execute, and verify ${term} workflows accurately.`,
        learningObjectives: [
          { id: `lo-${modNum}-1`, code: `LO ${modNum}.1`, statement: `Explain core mechanisms and trade-offs of ${term}`, bloomLevel: 'Understand' },
          { id: `lo-${modNum}-2`, code: `LO ${modNum}.2`, statement: `Apply ${term} workflows and verification gates cleanly`, bloomLevel: 'Apply' },
          { id: `lo-${modNum}-3`, code: `LO ${modNum}.3`, statement: `Evaluate risks and audit outputs for ${secondaryTerm}`, bloomLevel: 'Evaluate' }
        ],
        lessons: [
          {
            id: `lesson-${modNum}-1`,
            title: `${term}: Architecture & Mechanisms`,
            durationMinutes: 35,
            concepts: [term, 'Trust Boundaries', 'Failure Mode Isolation'],
            contentBody: lesson1Body,
            callouts: [{ type: 'Tip', title: `${term} Verification Tip`, content: `Always inspect primary logs before approving changes to ${term} in Module ${modNum}.` }],
            workplaceApplication: `Review active ${term} configurations inside your ${city} ${org} team and document core operational assumptions.`,
            aiApplication: `Use enterprise assistants to draft ${term} checklists for Module ${modNum}, then verify every rule manually.`
          },
          {
            id: `lesson-${modNum}-2`,
            title: `${secondaryTerm}: Verification & Applied Practice`,
            durationMinutes: 40,
            concepts: [secondaryTerm, 'Acceptance Thresholds', 'Escalation Paths'],
            contentBody: lesson2Body,
            callouts: [{ type: 'Good/Bad Example', title: `${secondaryTerm} Standard`, content: `Good: Verifying ${secondaryTerm} controls prior to sign-off. Bad: Bypassing Module ${modNum} checks under rush pressure.` }],
            workplaceApplication: `Run peer QA reviews on ${secondaryTerm} deliverables across weekly sprints inside your ${org} unit.`,
            aiApplication: `Compare AI summary drafts against live ${secondaryTerm} evidence before Module ${modNum} sign-off.`
          }
        ],
        scenarios: ([
          [
            {
              id: `sc-1-1`,
              title: `Phase 1 Kickoff: ${city} ${term} Architecture Gap`,
              type: 'Workplace' as const,
              situation: `During a quarterly service review in ${city}, engineers at a ${org} uncover silent single points of failure embedded inside legacy ${term} setups.`,
              challenge: `Re-architecting baseline dependencies cleanly without interrupting live regional users.`,
              decisionPoint: `Freeze undocumented adjustments, map active dependencies, and deploy redundant ${term} boundaries.`,
              debrief: `Early architectural mapping eliminates fragile single points of failure.`,
              keyTakeaway: `Always document ${term} topology before scaling.`
            },
            {
              id: `sc-1-2`,
              title: `Vendor Integration Breakdown in ${secondaryTerm}`,
              type: 'Workplace' as const,
              situation: `An external supplier onboarding session highlights conflicting permissions between corporate directories and ${secondaryTerm}.`,
              challenge: `Tightening access scope quickly without blocking partner billing workflows.`,
              decisionPoint: `Enforce least-privilege credentials and log every external hand-off under ${subjectFacts.laws}.`,
              debrief: `Scoped access preserves partner velocity while closing audit gaps.`,
              keyTakeaway: `Never grant blanket external permissions.`
            },
            {
              id: `sc-1-3`,
              title: `After-Hours Incident Handoff Under Shift Pressure`,
              type: 'Workplace' as const,
              situation: `Night-shift operators receive ambiguous hand-off notes during an urgent ${term} maintenance window.`,
              challenge: `Preventing conflicting hotfixes across shifts when executive leadership demands updates.`,
              decisionPoint: `Run the signed two-person checklist before executing any rollback or escalation step.`,
              debrief: `Explicit shift checklists prevent duplicate or conflicting interventions.`,
              keyTakeaway: `Checklist hand-offs outperform informal verbal updates.`
            },
            {
              id: `ai-sc-1-1`,
              title: `Spotting Confident Inaccuracies in AI Architecture Drafts`,
              type: 'AI Specific' as const,
              situation: `A junior analyst pastes an AI-generated ${term} policy directly into an internal ${org} tender pack.`,
              challenge: `Identifying fabricated compliance claims and missing operational constraints before client issue.`,
              decisionPoint: `Cross-check every clause against verified vendor documentation and mark gaps for SME sign-off.`,
              debrief: `Source verification intercepts plausible-sounding AI fabrications early.`,
              keyTakeaway: `Treat AI tender drafts strictly as unverified starting notes.`
            }
          ],
          [
            {
              id: `sc-2-1`,
              title: `Deployment Pipeline Drift Across Staging and Production`,
              type: 'Workplace' as const,
              situation: `A ${city} ${org} discovers manual hotfixes applied straight in live production have diverged from approved ${term} templates.`,
              challenge: `Reconciling live state safely while keeping automated releases moving.`,
              decisionPoint: `Import verified configuration state into version control and gate future releases via peer review.`,
              debrief: `Versioned reconciliation stops silent configuration drift.`,
              keyTakeaway: `Keep staging and production anchored to one source of truth.`
            },
            {
              id: `sc-2-2`,
              title: `Balancing Delivery Speed Against Automated Security Checks`,
              type: 'Workplace' as const,
              situation: `Commercial directors urge bypassing mandatory ${secondaryTerm} scans to hit a Friday campaign launch.`,
              challenge: `Respecting commercial urgency without exposing sensitive client datasets under ${subjectFacts.laws}.`,
              decisionPoint: `Triage critical blockers on a rapid 20-minute call and defer cosmetic warnings with logged approval.`,
              debrief: `Targeted risk triage balances launch speed with core security hygiene.`,
              keyTakeaway: `Automate fast checks instead of turning gates off.`
            },
            {
              id: `sc-2-3`,
              title: `Debugging Cascading Errors After Library Upgrades`,
              type: 'Workplace' as const,
              situation: `Following a routine dependency bump, ${term} alerts spike selectively for Cape Town regional branches.`,
              challenge: `Isolating whether root cause sits inside recent releases or upstream external feeds.`,
              decisionPoint: `Compare canary telemetry against baseline metrics and execute an immediate staged rollback.`,
              debrief: `Canary releases contain blast radius to small test cohorts.`,
              keyTakeaway: `Roll back fast when canary variance crosses agreed limits.`
            },
            {
              id: `ai-sc-2-1`,
              title: `Reviewing AI-Suggested Workflow Scripts Safely`,
              type: 'AI Specific' as const,
              situation: `An AI coding assistant proposes a concise ${term} automation script containing permissive wildcard defaults.`,
              challenge: `Catching over-broad privileges hidden inside clean syntax before merging.`,
              decisionPoint: `Audit every wildcard rule manually and run sandbox dry-runs prior to promotion.`,
              debrief: `Sandbox testing catches dangerous defaults masked by tidy code.`,
              keyTakeaway: `Never merge generated automation without dry-run verification.`
            }
          ],
          [
            {
              id: `sc-3-1`,
              title: `Board Audit Challenge on Historical Access Logs`,
              type: 'Workplace' as const,
              situation: `Internal auditors ask a ${city} ${org} to prove who approved privileged ${term} exceptions over the past six months.`,
              challenge: `Reconstructing accountable approvals across fragmented email threads and spreadsheets.`,
              decisionPoint: `Centralise exception approvals inside a tamper-evident ledger mapped to ${subjectFacts.laws}.`,
              debrief: `Centralised audit trails cut audit preparation time dramatically.`,
              keyTakeaway: `Capture accountability at approval time, not months later.`
            },
            {
              id: `sc-3-2`,
              title: `Containing Sensitive Customer Record Exposure`,
              type: 'Workplace' as const,
              situation: `QA testing accidentally uses unmasked production client records inside a shared ${secondaryTerm} workspace.`,
              challenge: `Responding rapidly in line with ${subjectFacts.laws} notification duties while preserving forensic evidence.`,
              decisionPoint: `Revoke shared workspace access immediately, purge synthetic copies, and notify privacy officers.`,
              debrief: `Rapid containment and synthetic test data eliminate repeat privacy exposures.`,
              keyTakeaway: `Use anonymised or synthetic records outside locked production.`
            },
            {
              id: `sc-3-3`,
              title: `Resolving Disagreements Between Operations and Risk Leads`,
              type: 'Workplace' as const,
              situation: `Operational leads view newly added ${term} sign-off steps as bureaucratic friction slowing daily delivery.`,
              challenge: `Achieving genuine buy-in across both frontline teams and governance committees.`,
              decisionPoint: `Co-design streamlined pre-flight checklists eliminating duplicate paperwork while keeping control evidence.`,
              debrief: `Lightweight embedded controls win adoption across delivery and risk teams.`,
              keyTakeaway: `Design governance checks around actual workflows.`
            },
            {
              id: `ai-sc-3-1`,
              title: `Verifying AI Statutory Summaries Against Primary Acts`,
              type: 'AI Specific' as const,
              situation: `An enterprise chatbot cites a non-existent section number when summarising ${subjectFacts.laws} rules for ${term}.`,
              challenge: `Preventing legal misstatements from guiding frontline staff decisions.`,
              decisionPoint: `Require verbatim legal section verification against official statutes before staff guidance publishes.`,
              debrief: `Mandatory primary citation checks neutralise legal hallucinations.`,
              keyTakeaway: `AI statutory summaries must be verified against official text.`
            }
          ],
          [
            {
              id: `sc-4-1`,
              title: `Diagnosing Unexplained Monthly Spend Spikes`,
              type: 'Workplace' as const,
              situation: `Finance flags a 38% month-on-month cost surge inside a ${city} ${org} unit running ${term} workloads.`,
              challenge: `Pinpointing orphaned resources and inefficient usage patterns without breaking customer SLAs.`,
              decisionPoint: `Enforce mandatory cost-centre tags, right-size idle capacity, and set automated budget thresholds.`,
              debrief: `Granular tagging turns opaque monthly bills into actionable team levers.`,
              keyTakeaway: `You cannot optimise ${term} spend without ownership tags.`
            },
            {
              id: `sc-4-2`,
              title: `Scaling Pilot Wins Across Regional Branches`,
              type: 'Workplace' as const,
              situation: `Head-office ${secondaryTerm} efficiencies fail to replicate cleanly inside busy Durban and Gqeberha branch teams.`,
              challenge: `Adapting HQ playbooks to varying local staffing ratios and connectivity realities.`,
              decisionPoint: `Run structured 30-day branch feedback sprints and co-author localised quick-reference guides.`,
              debrief: `Localised adaptation drives real multi-site adoption.`,
              keyTakeaway: `Co-adapt rollout toolkits with regional operators.`
            },
            {
              id: `sc-4-3`,
              title: `Sustaining Habits 90 Days After Programme Completion`,
              type: 'Workplace' as const,
              situation: `Three months post-training, two departments slip back toward unverified shortcuts on ${term} tasks.`,
              challenge: `Reinforcing disciplined habits without resorting to punitive micro-management.`,
              decisionPoint: `Embed peer spot-checks into existing weekly stand-ups and celebrate defect-free streaks.`,
              debrief: `Lightweight social accountability sustains capability beyond classroom days.`,
              keyTakeaway: `Anchor new habits inside regular team ceremonies.`
            },
            {
              id: `ai-sc-4-1`,
              title: `Evaluating Vendor Claims for Autonomous Optimisation Tools`,
              type: 'AI Specific' as const,
              situation: `A software vendor promises zero-touch AI optimisation eliminating manual reviews for ${secondaryTerm}.`,
              challenge: `Testing vendor accuracy transparently before committing multi-year budgets.`,
              decisionPoint: `Run a 30-day controlled shadow pilot measuring actual defect rates and human override overhead.`,
              debrief: `Measured shadow pilots separate genuine ROI from marketing hype.`,
              keyTakeaway: `Validate AI vendor promises with controlled shadow metrics.`
            }
          ]
        ])[(modNum - 1) % 4],
        knowledgeChecks: [
          {
            id: `qc-${modNum}-1`,
            question: `Under LO ${modNum}.1, why must teams verify ${term} assumptions inside a ${city} ${org} before rollout?`,
            options: ['To slow team velocity', `To isolate dependencies and prevent cascading ${term} defects`, 'To remove peer accountability', 'To avoid documenting baselines'],
            correctAnswer: 1,
            rationale: `Documenting ${term} assumptions prevents cascading Module ${modNum} defects.`,
            learningObjectiveRef: `LO ${modNum}.1`
          },
          {
            id: `qc-${modNum}-2`,
            question: `How does LO ${modNum}.2 guide practitioners auditing ${secondaryTerm} workflows in Module ${modNum}?`,
            options: ['Accept default configurations blindly', `Compare ${secondaryTerm} outputs against primary evidence and acceptance thresholds`, 'Skip checks on urgent tasks', 'Disable operational logging'],
            correctAnswer: 1,
            rationale: `Primary-evidence comparison confirms ${secondaryTerm} reliability.`,
            learningObjectiveRef: `LO ${modNum}.2`
          },
          {
            id: `qc-${modNum}-3`,
            question: `When an anomaly hits ${term} during peak load, which step satisfies LO ${modNum}.2?`,
            options: ['Silence monitoring alerts immediately', `Cross-check ${term} telemetry and log root cause before modifying production`, 'Bypass escalation rules', 'Clear audit logs'],
            correctAnswer: 1,
            rationale: `Root-cause verification ensures safe remediation for ${term}.`,
            learningObjectiveRef: `LO ${modNum}.2`
          },
          {
            id: `qc-${modNum}-4`,
            question: `Under LO ${modNum}.3, which governance safeguard protects ${secondaryTerm} reviews under ${subjectFacts.laws}?`,
            options: ['Anonymous shared credentials', `Accountable human sign-off backed by ${subjectFacts.laws} evidence`, 'Unchecked automated overrides', 'Skipping SME validation'],
            correctAnswer: 1,
            rationale: `Accountable human sign-off upholds ${subjectFacts.laws}.`,
            learningObjectiveRef: `LO ${modNum}.3`
          },
          {
            id: `qc-${modNum}-5`,
            question: `Which habit best sustains Module ${modNum} gains across ${term} and ${secondaryTerm}?`,
            options: ['Informal verbal hand-offs', `Peer checklists, KPI reviews, and 30-60-90 day audits for ${term}`, 'Removing retrospectives', 'Relying solely on memory'],
            correctAnswer: 1,
            rationale: `Structured checklists and KPI reviews sustain ${term} mastery.`,
            learningObjectiveRef: `LO ${modNum}.3`
          }
        ],
        practicalTask: {
          id: `task-${modNum}`,
          title: `Module ${modNum} Applied ${term} Verification Task`,
          instructions: `Objective: Apply ${term} and ${secondaryTerm} verification gates to diagnose and fix a realistic workplace flaw.\n\nScenario: Inside a ${city} ${org}, audit the Phase ${modNum} ${term} package exhibiting unverified configuration shortcuts and incomplete documentation.\n\nResources: Module ${modNum} ${term} checklist, ${subjectFacts.laws} summary guide, and sample audit log.\n\nSteps: 1. Inspect the ${term} inputs for at least two high-impact defects. 2. Cross-check ${secondaryTerm} controls against Module ${modNum} thresholds. 3. Draft a concise corrective action plan with named owners and verification criteria.\n\nDeliverable: Signed Module ${modNum} ${term} Audit & Remediation Brief.\n\nSuccess criteria: Root-cause accuracy (40%), Governance alignment (30%), Remediation clarity (30%).\n\nReflection: Which verification step from this ${term} exercise would catch the costliest mistake in your real role?`,
          deliverable: `Signed Module ${modNum} ${term} Audit & Remediation Brief`,
          evaluationRubric: [
            `${term} technical gap identification (40%)`,
            `Compliance with ${secondaryTerm} & ${subjectFacts.laws} governance controls (30%)`,
            `Actionability and clarity of Module ${modNum} remediation steps (30%)`
          ]
        },
        reflection: [
          `Where could ${term} verification gaps currently exist in your Module ${modNum} workflow?`,
          `Which check from ${secondaryTerm} will you adopt in your team this week?`
        ],
        summary: `Module ${modNum} equips learners to apply, audit, and govern ${term} and ${secondaryTerm} reliably.`
      };

      return {
        provider: 'groq',
        model: req.model || 'openai/gpt-oss-120b',
        text: JSON.stringify(modulePayload),
        usage: { inputTokens: 400, outputTokens: 1200 },
        durationMs: 25
      };
    }

    // Stage 3 Wrapper + Assessments request
    const lo1 = 'LO 1.1';
    const lo2 = 'LO 2.2';
    const lo3 = 'LO 3.3';
    const term0 = subjectFacts.domainTerms[0];
    const term1 = subjectFacts.domainTerms[1 % subjectFacts.domainTerms.length];

    const wrapperPayload = {
      overview: `This programme equips practitioners with practical mastery across ${subjectFacts.domainTerms.join(', ')} using authentic South African workplace scenarios and verification checklists.\n\nLearners progress systematically from foundational architecture to applied verification and 90-day governance rollout aligned with ${subjectFacts.laws}.`,
      purpose: `Develop verifiable capability in ${subjectFacts.domainTerms.slice(0, 3).join(', ')} with clear human accountability.`,
      targetAudience: `South African practitioners working across ${subjectFacts.orgs[0]} environments`,
      estimatedDuration: '16 Hours / 2 CPD Credits',
      learningOutcomes: [
        `Design and validate core ${term0} workflows`,
        `Audit ${term1} outputs against objective criteria`,
        `Uphold applicable governance including ${subjectFacts.laws}`
      ],
      assessments: {
        preCourseDiagnostic: {
          title: 'Pre-Course Knowledge & Readiness Diagnostic',
          instructions: 'Answer all 5 baseline questions.',
          questions: [
            { id: 'diag-1', question: `How familiar are you with ${term0} principles?`, options: ['None', 'Basic', 'Regular', 'Advanced'], correctAnswer: 1, rationale: 'Assesses baseline.' },
            { id: 'diag-2', question: `What triggers common errors in ${term1}?`, options: ['Too many audits', 'Missing verification gates', 'Strong SOPs', 'Clear roles'], correctAnswer: 1, rationale: 'Measures problem awareness.' },
            { id: 'diag-3', question: `How do you validate ${term0} outputs before release?`, options: ['Guessing', 'Peer checklist review', 'Skipping review', 'Auto-approve'], correctAnswer: 1, rationale: 'Checks workflow habits.' },
            { id: 'diag-4', question: `How should AI-assisted drafts in ${term1} be treated?`, options: ['Final truth', 'Draft requiring verification', 'Secret logs', 'Error-free'], correctAnswer: 1, rationale: 'Measures AI literacy.' },
            { id: 'diag-5', question: `Which governance standard applies to ${term0} records?`, options: ['None', subjectFacts.laws, 'Ad-hoc rules', 'Public posting'], correctAnswer: 1, rationale: 'Assesses compliance baseline.' }
          ]
        },
        finalAssessment: {
          title: 'Summative Capstone & Final Knowledge Assessment',
          passMark: '80%',
          instructions: 'Complete all final scenario questions and the capstone case.',
          questions: [
            { id: 'final-q1', question: `Why are verification gates essential when scaling ${term0}?`, options: ['Slow down teams', 'Prevent cascading production or compliance failures', 'Replace SMEs', 'Eliminate records'], correctAnswer: 1, rationale: 'Gates prevent cascading defects.', learningObjectiveRef: lo1 },
            { id: 'final-q2', question: `What is the primary control when auditing ${term1} deliverables?`, options: ['Trusting formatting', 'Cross-checking primary evidence against criteria', 'Deleting variance logs', 'Skipping peer review'], correctAnswer: 1, rationale: 'Primary evidence validates accuracy.', learningObjectiveRef: lo2 },
            { id: 'final-q3', question: `How should teams uphold ${subjectFacts.laws} during rapid delivery?`, options: ['Waive privacy checks', 'Embed pre-release compliance checklists and accountable sign-off', 'Use unvetted personal tools', 'Ignore exceptions'], correctAnswer: 1, rationale: 'Checklists embed compliance safely.', learningObjectiveRef: lo3 }
          ],
          capstoneCaseStudy: {
            title: `Workplace Capstone: Governing ${term0} & ${term1}`,
            scenario: `A ${subjectFacts.cities[0]} ${subjectFacts.orgs[0]} faces recurring ${term0} rework after rapid adoption of unverified ${term1} shortcuts.`,
            tasks: [
              `1. Diagnose key failure points across ${term0}.`,
              `2. Design an auditable ${term1} verification checklist.`,
              `3. Outline a 30-60-90 day rollout charter aligned to ${subjectFacts.laws}.`
            ],
            deliverable: `3-page ${term0} Governance & Rollout Capstone Plan`
          }
        }
      }
    };

    return {
      provider: 'groq',
      model: req.model || 'openai/gpt-oss-120b',
      text: JSON.stringify(wrapperPayload),
      usage: { inputTokens: 350, outputTokens: 800 },
      durationMs: 25
    };
  };
}

// ============================================================================
// PART 1 TESTS: 10 CONVERSATIONAL & CONTEXT-ISOLATED CO-PILOT SCENARIOS
// ============================================================================

test('Scenario 1 & 2: General Q&A and Follow-Up stay in chat mode with zero premature course generation', async () => {
  const baseCourse = createScratchCourse();

  const res1 = await processAIAssistedCopilotChat(
    {
      messages: [{ role: 'user', content: "What is Bloom's Taxonomy and how does it improve training?" }],
      currentCourse: baseCourse,
      agreedRequirements: null
    },
    {
      aiExecute: async () => ({
        provider: 'groq',
        model: 'openai/gpt-oss-20b',
        text: JSON.stringify({
          message: "Bloom's Taxonomy organises cognitive objectives from Understand to Apply, Analyse, and Evaluate so courses test real competence.",
          updatedRequirements: {}
        }),
        durationMs: 15
      })
    }
  );

  assert.equal(res1.mode, 'chat');
  assert.equal(res1.intent, 'general_chat');
  assert.equal(res1.coursePatch, undefined);
  assert.match(res1.message, /Bloom/i);

  const res2 = await processAIAssistedCopilotChat(
    {
      messages: [
        { role: 'user', content: "What is Bloom's Taxonomy and how does it improve training?" },
        { role: 'assistant', content: res1.message },
        { role: 'user', content: 'Can you give me a concrete workplace example of that?' }
      ],
      currentCourse: baseCourse,
      agreedRequirements: res1.agreedRequirements
    },
    {
      aiExecute: async req => {
        assert.match(req.prompt, /Bloom/i, 'Follow-up prompt must carry conversation history');
        return {
          provider: 'groq',
          model: 'openai/gpt-oss-20b',
          text: JSON.stringify({
            message: 'Using that Bloom progression, an Evaluate task asks a supervisor to audit a flawed safety checklist rather than just defining safety rules.',
            updatedRequirements: {}
          }),
          durationMs: 15
        };
      }
    }
  );

  assert.equal(res2.mode, 'chat');
  assert.equal(res2.coursePatch, undefined);
  assert.match(res2.message, /Evaluate|supervisor/i);
});

test('Scenario 3 & 4: Concept explanation & brainstorming work offline/locally without forcing course creation', () => {
  const baseCourse = createScratchCourse();

  const explain = processLocalCopilotChat({
    messages: [{ role: 'user', content: 'Explain the difference between formative and summative assessment' }],
    currentCourse: baseCourse,
    agreedRequirements: null
  });
  assert.equal(explain.mode, 'chat');
  assert.equal(explain.intent, 'general_chat');
  assert.equal(explain.coursePatch, undefined);
  assert.match(explain.message, /Formative/i);
  assert.match(explain.message, /Summative/i);

  const brainstorm = processLocalCopilotChat({
    messages: [{ role: 'user', content: 'Brainstorm 5 practical training activity ideas for operations teams' }],
    currentCourse: baseCourse,
    agreedRequirements: null
  });
  assert.equal(brainstorm.mode, 'chat');
  assert.equal(brainstorm.intent, 'general_chat');
  assert.equal(brainstorm.coursePatch, undefined);
  assert.match(brainstorm.message, /Activity Ideas/i);
});

test('Scenarios 5, 6, 7 & 8: Multi-turn Cloud Engineering planning -> goals -> refinement -> explicit creation transfers ALL requirements', async () => {
  const baseCourse = createScratchCourse();

  // Turn 5: Natural course planning starter -> MUST discuss/ask clarifying questions, NOT generate course
  const turn1 = processLocalCopilotChat({
    messages: [{ role: 'user', content: 'I want to create a Cloud Engineering course for beginners.' }],
    currentCourse: baseCourse,
    agreedRequirements: null
  });
  assert.equal(turn1.mode, 'chat');
  assert.equal(turn1.intent, 'course_discussion_plan');
  assert.equal(turn1.coursePatch, undefined);
  assert.equal(turn1.agreedRequirements?.subject, 'Cloud Engineering');
  assert.equal(turn1.agreedRequirements?.difficultyLevel, 'Foundational');

  // Turn 6: User provides 4 goals -> MUST retain Cloud Engineering + Foundational and add goals, still NO coursePatch
  const turn2 = processLocalCopilotChat({
    messages: [
      { role: 'user', content: 'I want to create a Cloud Engineering course for beginners.' },
      { role: 'assistant', content: turn1.message },
      { role: 'user', content: 'I want them to understand cloud infrastructure, deployment, security and cost optimisation.' }
    ],
    currentCourse: baseCourse,
    agreedRequirements: turn1.agreedRequirements
  });
  assert.equal(turn2.mode, 'chat');
  assert.equal(turn2.intent, 'course_refine');
  assert.equal(turn2.coursePatch, undefined);
  assert.equal(turn2.agreedRequirements?.subject, 'Cloud Engineering');
  assert.equal(turn2.agreedRequirements?.difficultyLevel, 'Foundational');
  const goalsJoined = (turn2.agreedRequirements?.learningGoals || []).join(' ').toLowerCase();
  assert.match(goalsJoined, /cloud infrastructure/);
  assert.match(goalsJoined, /deployment/);
  assert.match(goalsJoined, /security/);
  assert.match(goalsJoined, /cost optimisation/);

  // Turn 7: User refines ("Make the course more practical") -> remembers Cloud Engineering + beginner + 4 goals!
  const turn3 = processLocalCopilotChat({
    messages: [
      { role: 'user', content: 'I want to create a Cloud Engineering course for beginners.' },
      { role: 'assistant', content: turn1.message },
      { role: 'user', content: 'I want them to understand cloud infrastructure, deployment, security and cost optimisation.' },
      { role: 'assistant', content: turn2.message },
      { role: 'user', content: 'Make the course more practical' }
    ],
    currentCourse: baseCourse,
    agreedRequirements: turn2.agreedRequirements
  });
  assert.equal(turn3.mode, 'chat');
  assert.equal(turn3.intent, 'course_refine');
  assert.equal(turn3.coursePatch, undefined);
  assert.equal(turn3.agreedRequirements?.subject, 'Cloud Engineering');
  assert.ok(turn3.agreedRequirements?.practicalFocus, 'Practical focus must be captured');

  // Turn 8: User explicitly confirms creation -> NOW coursePatch is generated with all requirements!
  const turn4 = processLocalCopilotChat({
    messages: [
      { role: 'user', content: 'I want to create a Cloud Engineering course for beginners.' },
      { role: 'assistant', content: turn1.message },
      { role: 'user', content: 'I want them to understand cloud infrastructure, deployment, security and cost optimisation.' },
      { role: 'assistant', content: turn2.message },
      { role: 'user', content: 'Make the course more practical' },
      { role: 'assistant', content: turn3.message },
      { role: 'user', content: 'That sounds good. Please create the course.' }
    ],
    currentCourse: baseCourse,
    agreedRequirements: turn3.agreedRequirements
  });
  assert.equal(turn4.mode, 'course_creation');
  assert.equal(turn4.intent, 'course_create');
  assert.ok(turn4.coursePatch, 'Explicit create command must return 9-section coursePatch');
  assert.equal(turn4.coursePatch?.structure?.title, 'Cloud Engineering');
  assert.equal(turn4.coursePatch?.structure?.difficultyLevel, 'Foundational');
  assert.ok((turn4.coursePatch?.modules?.length || 0) >= 3);

  const patchBlob = JSON.stringify(turn4.coursePatch).toLowerCase();
  assert.match(patchBlob, /cloud infrastructure|vpc|compute/);
  assert.match(patchBlob, /deployment|ci\/cd|terraform/);
  assert.match(patchBlob, /iam|security/);
  assert.match(patchBlob, /finops|cost/);
  assert.ok(!/finite element analysis|sans 347|jaw crusher|millwright/.test(patchBlob), 'Must have zero mechanical engineering bleed');
});

test('Scenario 9: New Conversation isolation prevents previous Cloud Engineering requirements leaking into HRM', () => {
  const baseCourse = createScratchCourse('Cloud Engineering');
  // Simulate user clicked "New Chat" so agreedRequirements is null and message history starts fresh
  const hrmRes = processLocalCopilotChat({
    messages: [{ role: 'user', content: 'Build a template for me "Human Resource Management"' }],
    currentCourse: baseCourse,
    agreedRequirements: null
  });

  assert.equal(hrmRes.mode, 'course_creation');
  assert.equal(hrmRes.intent, 'course_create');
  assert.equal(hrmRes.coursePatch?.structure?.title, 'Human Resource Management');
  const hrmBlob = JSON.stringify(hrmRes.coursePatch).toLowerCase();
  assert.match(hrmBlob, /recruitment|onboarding|lra|bcea|performance/);
  assert.ok(!/terraform|vpc|kubernetes|finops|cloud engineering/.test(hrmBlob), 'Zero Cloud Engineering carryover after New Chat');
});

test('Scenario 10: Pure QA check reviews readiness without altering course data', () => {
  const sampleCourse = createScratchCourse('Generative AI for Business');
  const qaRes = processLocalCopilotChat({
    messages: [{ role: 'user', content: 'Check my course framework compliance' }],
    currentCourse: sampleCourse,
    qaResult: { scorePercent: 84, completedCount: 38, totalChecks: 45 },
    agreedRequirements: null
  });

  assert.equal(qaRes.mode, 'chat');
  assert.equal(qaRes.intent, 'qa_check');
  assert.equal(qaRes.coursePatch, undefined);
  assert.match(qaRes.message, /84%/);
});

// ============================================================================
// PART 2, 3 & 4 TESTS: SUBJECT BLUEPRINT, MULTI-STAGE GENERATION & QA SCORECARD
// ============================================================================

test('Cloud Engineering full generation passes Subject Blueprint, Structure, Practical Tasks, and QA Scorecard (PASS)', async () => {
  const { patch } = generateComprehensiveCoursePatch('Cloud Engineering', undefined, {
    subject: 'Cloud Engineering',
    difficultyLevel: 'Foundational',
    learningGoals: ['Cloud Infrastructure', 'CI/CD Deployment', 'IAM Security', 'FinOps Cost Optimisation'],
    moduleCount: 4
  });
  const courseInput = applyPatchToCourse(createScratchCourse('Cloud Engineering'), patch);

  const result = await generateCourseWithAIEngine(courseInput, 'groq', 'openai/gpt-oss-120b', {
    aiExecute: createDomainCourseAIMock({
      domainTerms: ['VPC & Cloud Infrastructure', 'Terraform CI/CD Deployment', 'IAM Least-Privilege Security', 'FinOps Cost Optimisation'],
      cities: ['Johannesburg', 'Cape Town', 'Durban'],
      orgs: ['Fintech Cloud Operations Team', 'Enterprise SaaS Platform Group', 'Logistics Digital Unit'],
      laws: 'POPIA Act 4 of 2013 & King IV Principle 12'
    }),
    skipRepair: true
  });

  assert.equal(result.success, true);
  assert.ok(result.course);
  const generated = result.course!;

  assert.equal(generated.modules.length, 4, 'Must preserve all 4 configured modules');
  assert.equal(generated.qa.overallVerdict, 'PASS', `Warnings: ${JSON.stringify(generated.qa.warnings)} | Critical: ${JSON.stringify(generated.qa.criticalIssues)}`);
  assert.equal(generated.qa.hasBlockingFailures, false);
  assert.ok((generated.qa.subjectAlignmentScore || 0) >= 85, `Expected subject alignment >= 85, got ${generated.qa.subjectAlignmentScore}`);
  assert.ok((generated.qa.repetitionScore || 0) >= 75, `Expected originality >= 75, got ${generated.qa.repetitionScore}`);
  assert.equal(generated.qa.criticalIssues.length, 0);

  const fullText = JSON.stringify(generated).toLowerCase();
  assert.ok(!/five-stage operational protocol|johannesburg operational unit.*48-hour deadline/.test(fullText));
  assert.ok(!/finite element analysis|sans 347|centrifugal pump|millwright/.test(fullText));
});

test('Generative AI for Business full generation passes Blueprint & QA validation (PASS)', async () => {
  const { patch } = generateComprehensiveCoursePatch('Generative AI for Business');
  const courseInput = applyPatchToCourse(createScratchCourse('Generative AI for Business'), patch);

  const result = await generateCourseWithAIEngine(courseInput, 'groq', 'openai/gpt-oss-120b', {
    aiExecute: createDomainCourseAIMock({
      domainTerms: ['Business Use-Case Triage', 'Structured Prompting & RAG Grounding', 'Hallucination Auditing & Governance'],
      cities: ['Sandton', 'Cape Town', 'Pretoria'],
      orgs: ['Commercial Operations Division', 'Customer Advisory Hub', 'Corporate Finance & Admin Team'],
      laws: 'POPIA Act 4 of 2013 & King IV Principle 12'
    }),
    skipRepair: true
  });

  assert.equal(result.success, true);
  assert.ok(result.course);
  assert.equal(result.course!.modules.length, 3);
  assert.equal(result.course!.qa.overallVerdict, 'PASS', `Warnings: ${JSON.stringify(result.course!.qa.warnings)}`);
  assert.equal(result.course!.qa.hasBlockingFailures, false);
  assert.ok((result.course!.qa.subjectAlignmentScore || 0) >= 85);
});

test('Human Resource Management full generation passes Blueprint & QA validation (PASS)', async () => {
  const { patch } = generateComprehensiveCoursePatch('Human Resource Management');
  const courseInput = applyPatchToCourse(createScratchCourse('Human Resource Management'), patch);

  const result = await generateCourseWithAIEngine(courseInput, 'groq', 'openai/gpt-oss-120b', {
    aiExecute: createDomainCourseAIMock({
      domainTerms: ['Structured Talent Acquisition & Onboarding', 'Performance Coaching & Procedural Fairness', 'POPIA Employee Data Governance'],
      cities: ['Johannesburg', 'Durban', 'Gqeberha'],
      orgs: ['People Operations Department', 'Retail HR Shared Services', 'Manufacturing Site HR Team'],
      laws: 'Labour Relations Act 66 of 1995 & POPIA Act 4 of 2013'
    }),
    skipRepair: true
  });

  assert.equal(result.success, true);
  assert.ok(result.course);
  assert.equal(result.course!.modules.length, 3);
  assert.equal(result.course!.qa.overallVerdict, 'PASS', `Warnings: ${JSON.stringify(result.course!.qa.warnings)}`);
  assert.equal(result.course!.qa.hasBlockingFailures, false);
});

test('QA Negative Control: Cross-domain Mechanical bleed + Boilerplate in Cloud Engineering triggers FAIL and blocks approval', async () => {
  const { patch } = generateComprehensiveCoursePatch('Cloud Engineering');
  const courseInput = applyPatchToCourse(createScratchCourse('Cloud Engineering'), patch);

  const result = await generateCourseWithAIEngine(courseInput, 'groq', 'openai/gpt-oss-120b', {
    aiExecute: createDomainCourseAIMock({
      domainTerms: ['VPC & Cloud Infrastructure', 'Terraform CI/CD Deployment', 'IAM Least-Privilege Security'],
      cities: ['Johannesburg', 'Cape Town', 'Durban'],
      orgs: ['Fintech Cloud Team', 'SaaS Platform Group', 'IT Infrastructure Unit'],
      laws: 'POPIA Act 4 of 2013'
    }),
    skipRepair: true
  });

  assert.ok(result.course);
  const corrupted = structuredClone(result.course!);

  // Inject forbidden Mechanical Engineering bleed + generic 48-hour Johannesburg boilerplate
  corrupted.modules[0].lessons[0].contentBody +=
    '\n\nEvery team must apply the five-stage operational protocol across generative CAD topology optimisation, finite element analysis, and pump cavitation inside a Johannesburg operational unit facing a strict 48-hour deadline.';
  corrupted.modules[0].practicalTask!.instructions = 'Review the workflow.';
  corrupted.modules[0].practicalTask!.evaluationRubric = ['Quality (50%)']; // Only 50%, not 100%

  const blueprint = buildDeterministicBlueprint(courseInput);
  const review = reviewGeneratedCourseQuality(corrupted, courseInput, blueprint);

  assert.equal(review.qa.overallVerdict, 'FAIL');
  assert.equal(review.qa.hasBlockingFailures, true);
  assert.equal(review.qa.status, 'critical_issues');
  assert.ok(review.qa.criticalIssues.length >= 2, 'Should flag both cross-domain bleed and boilerplate/rubric failures');
  assert.ok(
    review.qa.qaChecks?.some(c => c.id === 'subject_alignment' && c.status === 'FAIL'),
    'Subject alignment check must verdict FAIL on mechanical CAD/FEA bleed inside Cloud Engineering'
  );
  assert.ok(
    review.qa.qaChecks?.some(c => c.id === 'repetition_boilerplate' && c.status === 'FAIL'),
    'Repetition/boilerplate check must detect five-stage operational protocol filler'
  );
  assert.ok(
    review.qa.qaChecks?.some(c => c.id === 'practical_tasks' && (c.status === 'FAIL' || c.status === 'WARNING')),
    'Practical tasks check must flag incomplete instructions & non-100% rubric'
  );
});

test('classifyCopilotIntent never misclassifies questions as course_create', () => {
  const sampleAgreed: CopilotAgreedRequirements = {
    subject: 'Cloud Engineering',
    difficultyLevel: 'Foundational'
  };

  assert.equal(classifyCopilotIntent('What is Terraform?', [], sampleAgreed), 'general_chat');
  assert.equal(classifyCopilotIntent('How does IAM work in AWS?', [], null), 'general_chat');
  assert.equal(classifyCopilotIntent('Can you suggest modules for a GenAI course?', [], null), 'course_discussion_plan');
  assert.equal(classifyCopilotIntent('Make the course more practical', [{ role: 'user', content: 'hi' }], sampleAgreed), 'course_refine');
  assert.equal(classifyCopilotIntent('Please create the course', [{ role: 'user', content: 'hi' }], sampleAgreed), 'course_create');
  assert.equal(classifyCopilotIntent('Build a template for me "Cybersecurity Awareness"', [], null), 'course_create');
});
