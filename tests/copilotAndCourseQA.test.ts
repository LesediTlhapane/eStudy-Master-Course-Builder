import test from 'node:test';
import assert from 'node:assert/strict';

import {
  processLocalCopilotChat,
  classifyCopilotIntent,
  generateComprehensiveCoursePatch,
  generateLocalFallbackCourse
} from '../src/utils/localCourseEngine.js';
import { processAIAssistedCopilotChat } from '../src/server/ai/copilotService.js';
import {
  generateCourseWithAIEngine,
  CourseGenerationPartialError
} from '../src/server/ai/courseGenerator.js';
import { reviewGeneratedCourseQuality } from '../src/server/ai/courseValidator.js';
import { buildDeterministicBlueprint } from '../src/server/ai/curriculumBlueprint.js';
import { createScratchCourse } from '../src/data/initialCourseData.js';
import generateApiHandler from '../api/courses/generate.js';
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
              knowledgeToAcquire: `Core principles and operational boundaries governing ${term}.`,
              conceptsToExplain: [term, 'Trust Boundaries', 'Failure Mode Isolation'],
              keyTerminology: [term, 'Trust Boundary', 'Failure Isolation'],
              subjectExamples: [`Baseline architecture review for ${term}`],
              practicalSkills: [`Map ${term} dependencies and failure boundaries`],
              commonMisconceptions: [`Treating ${term} as static configuration rather than living operational boundaries`],
              demonstrationMethod: 'Worked enterprise case walkthrough'
            },
            {
              title: `${secTerm}: Verification & Applied Practice`,
              purpose: `Implementing, testing, and troubleshooting ${secTerm}.`,
              progressionStage: 'Verification & Governance',
              knowledgeToAcquire: `Hands-on troubleshooting and acceptance testing methods for ${secTerm}.`,
              conceptsToExplain: [secTerm, 'Acceptance Thresholds', 'Escalation Paths'],
              keyTerminology: [secTerm, 'Acceptance Threshold', 'Escalation Path'],
              subjectExamples: [`Peer design review for ${secTerm}`],
              practicalSkills: [`Validate ${secTerm} outputs against acceptance criteria`],
              commonMisconceptions: [`Skipping quantitative checks on ${secTerm} edge cases`],
              demonstrationMethod: 'Step-by-step live troubleshooting walkthrough'
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
              coreDilemma: `Cross-team escalation and governance review for ${term}`
            }
          ],
          practicalTaskSpec: {
            title: `Module ${modNum} Applied ${term} Design & Validation Lab`,
            learningObjective: `Design, validate, and remediate a live ${term} deliverable against authentic criteria.`,
            scenarioOrTask: `In a ${subjectFacts.cities[idx % subjectFacts.cities.length]} ${subjectFacts.orgs[idx % subjectFacts.orgs.length]}, evaluate and fix a flawed ${term} artifact.`,
            requiredResources: ['Domain reference brief', 'Sample dataset/configuration', 'Acceptance scoring guide'],
            clearInstructions: `Review the supplied ${term} artifact step by step and produce an improved, validated solution.`,
            sequentialSteps: [
              `1. Inspect ${term} inputs against module technical principles.`,
              `2. Test ${secTerm} edge cases and explain trade-offs.`,
              `3. Submit revised ${term} solution and acceptance notes.`
            ],
            expectedDeliverable: `Module ${modNum} ${term} Applied Solution & Validation Brief`,
            successCriteria: 'All flaws resolved accurately with clear trade-off rationale.',
            rubricCriteria: [`${term} technical accuracy (40%)`, `${secTerm} verification depth (30%)`, 'Clarity and feasibility of design notes (30%)'],
            reflectionPrompt: `Which misconception in ${term} could cause the highest downstream risk in your day-to-day role?`
          }
        };
      });

      return {
        provider: req.provider || 'groq',
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
            concepts: [term, 'Architecture Mechanics', 'Failure Mode Isolation'],
            contentBody: `${lesson1Body}\n\nKey mechanism & limitation note: Because ${term} architecture works by isolating state boundaries before runtime execution, a frequent misconception is treating default settings as resilient; teams must evaluate trade-offs using a concrete baseline example.`,
            callouts: [{ type: 'Tip', title: `${term} Mechanism Tip`, content: `Inspect architecture dependencies and failure limitations carefully before promoting changes to ${term} in Module ${modNum}.` }],
            workplaceApplication: `Map active ${term} architecture mechanisms inside your ${city} ${org} team and document core boundary trade-offs.`,
            aiApplication: `Use enterprise assistants to explore alternative ${term} mechanisms for Module ${modNum}, then validate assumptions independently.`
          },
          {
            id: `lesson-${modNum}-2`,
            title: `${secondaryTerm}: Verification & Applied Practice`,
            durationMinutes: 40,
            concepts: [secondaryTerm, 'Applied Testing', 'Escalation Paths'],
            contentBody: `${lesson2Body}\n\nApplied verification & edge-case trade-off: Verification works by testing reproducible ${secondaryTerm} behaviour against acceptance thresholds; a common misconception is assuming fast green checks eliminate downstream edge-case risks, illustrated cleanly by the walkthrough example above.`,
            callouts: [{ type: 'Good/Bad Example', title: `${secondaryTerm} Practice Standard`, content: `Good: Testing ${secondaryTerm} limits against reproducible evidence. Bad: Assuming defaults work in Module ${modNum} without applied verification.` }],
            workplaceApplication: `Execute applied verification practice on ${secondaryTerm} outputs across weekly sprints inside your ${org} unit.`,
            aiApplication: `Compare AI-generated summaries against live ${secondaryTerm} test evidence before Module ${modNum} completion.`
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
        practicalTask: ([
          {
            id: `task-1`,
            title: `Module 1 Architecture Mapping & Trust-Boundary Exercise (${term})`,
            instructions: `Objective: Sketch the foundational ${term} component flow and isolate high-risk failure boundaries before deployment.\n\nScenario: A ${city} ${org} has suffered repeat outages after linking external vendor feeds directly into internal ${term} records.\n\nResources: Topology worksheet, baseline SLA targets matrix, and ${subjectFacts.laws} boundary brief.\n\nInstructions: Draw the current integration map, highlight unguarded hand-offs, and redesign explicit boundary controls.\n\nSteps: 1. Trace every data entry and exit point across ${term}. 2. Mark two critical trust boundaries where unvalidated inputs enter. 3. Specify fallback isolation timeouts and ownership boundaries.\n\nDeliverable: Annotated ${term} Architecture & Trust-Boundary Diagram.\n\nSuccess criteria: Boundary identification accuracy (40%), Resilience trade-off rationale (30%), Clarity of component flow (30%).\n\nReflection: Where do implicit assumptions hide inside your own team's ${term} architecture?`,
            deliverable: `Annotated ${term} Architecture & Trust-Boundary Diagram`,
            evaluationRubric: [
              `${term} topology & boundary accuracy (40%)`,
              `Isolation & failover trade-off rationale (30%)`,
              `Clarity and completeness of annotated diagram (30%)`
            ]
          },
          {
            id: `task-2`,
            title: `Module 2 Hands-On Build & Acceptance Testing Lab (${secondaryTerm})`,
            instructions: `Objective: Build and test a reproducible ${secondaryTerm} template enforcing repeatable quality gates across sprints.\n\nScenario: Rapid quarterly demand inside a ${city} ${org} pushed contributors toward undocumented manual adjustments that broke release consistency.\n\nResources: Starter configuration repository, sample test cases, and ${subjectFacts.laws} redaction guide.\n\nInstructions: Author a parameterised ${secondaryTerm} configuration and prove via dry-run evidence that automated gates reject bad inputs.\n\nSteps: 1. Parameterise reusable ${secondaryTerm} settings cleanly. 2. Inject an invalid test case and capture automated gate rejection. 3. Document safe rollback commands for on-call peers.\n\nDeliverable: Parameterised ${secondaryTerm} Build Pack & Test Output Log.\n\nSuccess criteria: Template reproducibility (40%), Automated test coverage (30%), Safe rollback documentation (30%).\n\nReflection: Which repetitive manual step in your ${secondaryTerm} workflow should be parameterised first?`,
            deliverable: `Parameterised ${secondaryTerm} Build Pack & Test Output Log`,
            evaluationRubric: [
              `Reproducibility of ${secondaryTerm} template (40%)`,
              `Negative-case gate testing evidence (30%)`,
              `Practicality of on-call rollback instructions (30%)`
            ]
          },
          {
            id: `task-3`,
            title: `Module 3 Edge-Case & Anomaly Triage Simulation (${term})`,
            instructions: `Objective: Diagnose subtle adversarial defects and calibrate escalation thresholds across live ${term} operations.\n\nScenario: Anomalies surfaced inside exception queues at a ${city} ${org}, threatening sensitive client data governed by ${subjectFacts.laws}.\n\nResources: Incident exception extract, redacted sample transcript, and risk impact matrix.\n\nInstructions: Classify incident severity rigorously, contain immediate exposure, and justify long-term structural fixes.\n\nSteps: 1. Separate symptomatic noise from the primary trigger inside the ${term} exception extract. 2. Containment: propose instant blast-radius controls. 3. Draft calibrated alert thresholds eliminating false positives.\n\nDeliverable: Module 3 ${term} Edge-Case Triage Dossier.\n\nSuccess criteria: Root-trigger diagnosis (40%), Containment & ${subjectFacts.laws} alignment (30%), Alert calibration precision (30%).\n\nReflection: How will your team resist shortcut pressure during high-urgency incidents affecting ${term}?`,
            deliverable: `Module 3 ${term} Edge-Case Triage Dossier`,
            evaluationRubric: [
              `Root-trigger diagnostic precision for ${term} (40%)`,
              `Containment & ${subjectFacts.laws} privacy alignment (30%)`,
              `Threshold calibration practicality (30%)`
            ]
          },
          {
            id: `task-4`,
            title: `Module 4 Commercial ROI & 90-Day Adoption Charter (${secondaryTerm})`,
            instructions: `Objective: Quantify operational waste, define measurable KPI baselines, and sequence a realistic 90-day ${secondaryTerm} rollout.\n\nScenario: Executive sponsors at a ${city} ${org} demand measurable spend and quality improvements ninety days after programme completion.\n\nResources: Historical monthly cost/defect ledger, departmental capacity summary, and KPI scorecard canvas.\n\nInstructions: Build a prioritised 30-60-90 day capability roadmap linking ${secondaryTerm} metrics straight to commercial outcomes.\n\nSteps: 1. Calculate baseline cost per unit and top waste drivers across ${secondaryTerm}. 2. Set realistic 30-, 60-, and 90-day improvement milestones. 3. Assign lightweight peer feedback cadences sustaining gains.\n\nDeliverable: 90-Day ${secondaryTerm} Value & Capability Roadmap.\n\nSuccess criteria: Quantitative baseline rigour (40%), Realistic sequencing (30%), Sustainability cadence (30%).\n\nReflection: Which habit from this ${secondaryTerm} charter will stay easiest to keep at Day 90?`,
            deliverable: `90-Day ${secondaryTerm} Value & Capability Roadmap`,
            evaluationRubric: [
              `Baseline metric & waste analysis for ${secondaryTerm} (40%)`,
              `Feasibility of 30-60-90 day milestones (30%)`,
              `Clarity of team sustainability cadence (30%)`
            ]
          }
        ])[(modNum - 1) % 4],
        reflection: [
          `Where could ${term} misconceptions currently introduce risk in your Module ${modNum} work?`,
          `Which validation technique from ${secondaryTerm} will you apply in your team this week?`
        ],
        summary: `Module ${modNum} equips learners to apply, test, and refine ${term} and ${secondaryTerm} reliably.`
      };

      return {
        provider: req.provider || 'groq',
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
      overview: `This programme equips practitioners with practical mastery across ${subjectFacts.domainTerms.join(', ')} using authentic South African workplace scenarios and applied exercises.\n\nLearners progress systematically from foundational architecture to applied verification and 90-day rollout aligned with ${subjectFacts.laws}.`,
      purpose: `Develop verifiable capability in ${subjectFacts.domainTerms.slice(0, 3).join(', ')} with clear human accountability.`,
      targetAudience: `South African practitioners working across ${subjectFacts.orgs[0]} environments`,
      estimatedDuration: '16 Hours (Estimated Guided Learning)',
      learningOutcomes: [
        `Design and validate core ${term0} workflows`,
        `Evaluate ${term1} outputs against objective criteria`,
        `Uphold applicable governance including ${subjectFacts.laws}`
      ],
      assessments: {
        preCourseDiagnostic: {
          title: 'Pre-Course Knowledge & Readiness Diagnostic',
          instructions: 'Answer all 5 baseline questions.',
          questions: [
            { id: 'diag-1', question: `How familiar are you with ${term0} principles?`, options: ['None', 'Basic', 'Regular', 'Advanced'], correctAnswer: 1, rationale: 'Assesses baseline.' },
            { id: 'diag-2', question: `What triggers common errors in ${term1}?`, options: ['Too many audits', 'Missing validation gates', 'Clear criteria', 'Clear roles'], correctAnswer: 1, rationale: 'Measures problem awareness.' },
            { id: 'diag-3', question: `How do you validate ${term0} outputs before release?`, options: ['Guessing', 'Peer technical review against criteria', 'Skipping review', 'Auto-approve'], correctAnswer: 1, rationale: 'Checks workflow habits.' },
            { id: 'diag-4', question: `How should AI-assisted drafts in ${term1} be treated?`, options: ['Final truth', 'Draft requiring independent testing', 'Secret logs', 'Error-free'], correctAnswer: 1, rationale: 'Measures AI literacy.' },
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
      provider: req.provider || 'groq',
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
    review.qa.qaChecks?.some(c => c.id === 'repetition' && c.status === 'FAIL'),
    'Repetition/paraphrase check must detect five-stage operational protocol filler'
  );
  assert.ok(
    review.qa.qaChecks?.some(c => c.id === 'practical_application' && (c.status === 'FAIL' || c.status === 'WARNING')),
    'Practical tasks check must flag incomplete instructions & non-100% rubric'
  );
});

test('11 QA Dimensions & Dual Provider Unification: Gemini (gemini-4-hydrogen) and Groq share identical instructional rigor', async () => {
  const { patch } = generateComprehensiveCoursePatch('Generative AI for Business');
  const courseInput = applyPatchToCourse(createScratchCourse('Generative AI for Business'), patch);

  const groqPrompts: string[] = [];
  const geminiPrompts: string[] = [];

  const baseMock = createDomainCourseAIMock({
    domainTerms: ['Business Use-Case Triage', 'Structured Prompting & RAG Grounding', 'Hallucination Auditing & Governance'],
    cities: ['Sandton', 'Cape Town', 'Pretoria'],
    orgs: ['Commercial Operations Division', 'Customer Advisory Hub', 'Corporate Finance & Admin Team'],
    laws: 'POPIA Act 4 of 2013 & King IV Principle 12'
  });

  const groqRes = await generateCourseWithAIEngine(courseInput, 'groq', 'openai/gpt-oss-120b', {
    aiExecute: async req => {
      groqPrompts.push(req.systemInstruction || '');
      return baseMock(req);
    },
    skipRepair: true
  });

  const geminiRes = await generateCourseWithAIEngine(courseInput, 'gemini', 'gemini-4-hydrogen', {
    aiExecute: async req => {
      geminiPrompts.push(req.systemInstruction || '');
      return baseMock(req);
    },
    skipRepair: true
  });

  assert.equal(groqRes.success, true);
  assert.equal(geminiRes.success, true);
  assert.equal(geminiRes.course?.generationMetadata?.provider, 'gemini');
  assert.equal(geminiRes.course?.generationMetadata?.providerDisplayName, 'Google Gemini');
  assert.equal(geminiRes.course?.generationMetadata?.model, 'gemini-4-hydrogen');

  // Verify Gemini and Groq receive the exact same stage system prompts
  assert.equal(groqPrompts.length, geminiPrompts.length);
  assert.deepEqual(groqPrompts, geminiPrompts);

  // Verify all 11 QA dimensions are emitted with scores & statuses
  const qaIds = new Set((geminiRes.course?.qa.qaChecks || []).map(c => c.id));
  const expectedIds = [
    'subject_alignment',
    'learning_objectives',
    'educational_depth',
    'technical_accuracy',
    'lesson_relevance',
    'practical_application',
    'assessment_alignment',
    'repetition',
    'progression',
    'factual_reliability',
    'document_integrity'
  ];
  for (const id of expectedIds) {
    assert.ok(qaIds.has(id), `Expected QA dimension "${id}" to be present`);
  }
  assert.equal(geminiRes.course?.qa.qaChecks?.length, 11);
  assert.equal(geminiRes.course?.qa.overallVerdict, 'PASS');
});

test('Semantic Repetition Negative Control vs Domain Noun Positive Control', async () => {
  const { patch } = generateComprehensiveCoursePatch('Cloud Engineering');
  const courseInput = applyPatchToCourse(createScratchCourse('Cloud Engineering'), patch);

  const res = await generateCourseWithAIEngine(courseInput, 'gemini', 'gemini-4-hydrogen', {
    aiExecute: createDomainCourseAIMock({
      domainTerms: ['VPC & Cloud Infrastructure', 'Terraform CI/CD Deployment', 'IAM Least-Privilege Security'],
      cities: ['Johannesburg', 'Cape Town', 'Durban'],
      orgs: ['Fintech Cloud Operations Team', 'Enterprise SaaS Platform Group', 'Logistics Digital Unit'],
      laws: 'POPIA Act 4 of 2013 & King IV Principle 12'
    }),
    skipRepair: true
  });

  assert.ok(res.course);
  const blueprint = buildDeterministicBlueprint(courseInput);

  // Positive control: distinct lessons sharing legitimate domain nouns pass repetition cleanly
  const cleanReview = reviewGeneratedCourseQuality(res.course!, courseInput, blueprint);
  assert.equal(cleanReview.qa.qaChecks?.find(c => c.id === 'repetition')?.status, 'PASS');

  // Negative control: paraphrase Lesson 1 inside Module 2 Lesson 1 with synonym swaps
  const paraphrasedCourse = structuredClone(res.course!);
  const sourceBody = paraphrasedCourse.modules[0].lessons[0].contentBody;
  paraphrasedCourse.modules[1].lessons[0].contentBody = sourceBody
    .replace(/\bdeployments?\b/gi, 'rollouts')
    .replace(/\borganisation|enterprise|team\b/gi, 'company')
    .replace(/\bverify|validate|check\b/gi, 'confirm')
    .replace(/\bworkflow\b/gi, 'process')
    .replace(/\bemployees|practitioners\b/gi, 'staff');

  const dupReview = reviewGeneratedCourseQuality(paraphrasedCourse, courseInput, blueprint);
  const repCheck = dupReview.qa.qaChecks?.find(c => c.id === 'repetition');
  assert.equal(repCheck?.status, 'FAIL', 'Paraphrased duplicate lesson must trigger repetition FAIL');
  assert.equal(dupReview.qa.hasBlockingFailures, true);
});

test('Generic SOP/Checklist Practical Task & Off-Lesson POPIA/SOP MCQs are caught cleanly by Semantic QA', async () => {
  const { patch } = generateComprehensiveCoursePatch('Generative AI for Business');
  const courseInput = applyPatchToCourse(createScratchCourse('Generative AI for Business'), patch);

  const res = await generateCourseWithAIEngine(courseInput, 'groq', 'openai/gpt-oss-120b', {
    aiExecute: createDomainCourseAIMock({
      domainTerms: ['Business Use-Case Triage', 'Structured Prompting & RAG Grounding', 'Hallucination Auditing & Governance'],
      cities: ['Sandton', 'Cape Town', 'Pretoria'],
      orgs: ['Commercial Operations Division', 'Customer Advisory Hub', 'Corporate Finance & Admin Team'],
      laws: 'POPIA Act 4 of 2013 & King IV Principle 12'
    }),
    skipRepair: true
  });

  assert.ok(res.course);
  const degraded = structuredClone(res.course!);

  // Strip POPIA/SOP from Module 1 lessons so generic POPIA/SOP MCQs are exposed as off-lesson filler
  for (const l of degraded.modules[0].lessons) {
    l.contentBody = 'Structured prompts specify Role, Context, Constraints, and Output Format so language models stay grounded. For example, testing few-shot examples prevents drift and addresses prompt ambiguity misconceptions because deterministic templates guide output formatting.';
    l.workplaceApplication = 'Test a structured prompt rubric across two internal customer service emails.';
    l.aiApplication = 'Compare zero-shot vs structured prompts on a redacted support ticket.';
  }
  degraded.modules[0].practicalTask!.instructions =
    'Objective: Audit workflow.\nScenario: Workplace.\nResources: SOP checklist.\nInstructions: Identify at least two workflow failures, complete the standard operating procedure verification checklist, obtain supervisory sign-off, and document corrective actions.\nSteps: 1. Audit.\nDeliverable: Checklist.\nSuccess criteria: Done.\nReflection: What failed?';

  degraded.modules[0].knowledgeChecks[0].question = 'What does POPIA Section 71 require for unsigned verification checklist workflows?';
  degraded.modules[0].knowledgeChecks[1].question = 'Why must Standard Operating Procedures (SOPs) govern King IV Principle 12 sign-off?';
  degraded.modules[0].knowledgeChecks[2].question = 'When auditing an unsigned verification checklist under POPIA Section 71, what happens first?';

  const blueprint = buildDeterministicBlueprint(courseInput);
  const review = reviewGeneratedCourseQuality(degraded, courseInput, blueprint);

  const practicalCheck = review.qa.qaChecks?.find(c => c.id === 'practical_application');
  assert.ok(
    practicalCheck && (practicalCheck.status === 'WARNING' || practicalCheck.status === 'FAIL'),
    'Generic SOP checklist practical task must be flagged on non-SOP course'
  );

  const assessmentCheck = review.qa.qaChecks?.find(c => c.id === 'assessment_alignment');
  assert.equal(assessmentCheck?.status, 'FAIL', 'Off-lesson generic POPIA/SOP MCQs must trigger assessment_alignment FAIL');
});

test('Factual & Regulatory Reliability flags unverified NQF/SAQA/Act citations when zero verified sources exist', async () => {
  const { patch } = generateComprehensiveCoursePatch('Cloud Engineering');
  const courseInput = applyPatchToCourse(createScratchCourse('Cloud Engineering'), patch);
  // Zero verified sources
  courseInput.research.sources = [];

  const res = await generateCourseWithAIEngine(courseInput, 'groq', 'openai/gpt-oss-120b', {
    aiExecute: createDomainCourseAIMock({
      domainTerms: ['VPC & Cloud Infrastructure', 'Terraform CI/CD Deployment', 'IAM Least-Privilege Security'],
      cities: ['Johannesburg', 'Cape Town', 'Durban'],
      orgs: ['Fintech Cloud Operations Team', 'Enterprise SaaS Platform Group', 'Logistics Digital Unit'],
      laws: 'Applicable Corporate Governance Standards'
    }),
    skipRepair: true
  });

  assert.ok(res.course);
  const inventedClaims = structuredClone(res.course!);
  inventedClaims.overview += ' Formally accredited at NQF Level 5 with SAQA ID 242814 under Act 99 of 2024 and 4 CPD Credits.';

  const blueprint = buildDeterministicBlueprint(courseInput);
  const review = reviewGeneratedCourseQuality(inventedClaims, courseInput, blueprint);
  const factualCheck = review.qa.qaChecks?.find(c => c.id === 'factual_reliability');
  assert.equal(factualCheck?.status, 'FAIL');
  assert.ok((factualCheck?.affectedItems?.length || 0) >= 3);
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

// ============================================================================
// PART 5 TESTS: NO SILENT FALLBACK, PARTIAL RECOVERY, FULL CONTEXT PARITY & STRICT QA
// ============================================================================

test('API /api/courses/generate never returns HTTP 200 or silent offline local-fallback when AI provider fails', async () => {
  const { patch } = generateComprehensiveCoursePatch('Generative AI for Business');
  const courseInput = applyPatchToCourse(createScratchCourse('Generative AI for Business'), patch);

  const savedGeminiKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  try {
    let statusCode = 0;
    let jsonBody: any = null;
    const mockReq: any = {
      method: 'POST',
      body: {
        course: courseInput,
        provider: 'gemini',
        model: 'gemini-4-hydrogen'
      }
    };
    const mockRes: any = {
      setHeader() {},
      end() {},
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(payload: any) {
        jsonBody = payload;
        return this;
      }
    };

    await generateApiHandler(mockReq, mockRes);

    assert.ok(statusCode >= 400, `Expected non-200 failure status when Gemini key is absent, got ${statusCode}`);
    assert.equal(jsonBody?.success, false);
    assert.equal(jsonBody?.fallbackUsed, false);
    assert.equal(jsonBody?.failedProvider, 'gemini');
    assert.ok(typeof jsonBody?.error === 'string' && jsonBody.error.length > 0);
    assert.equal(jsonBody?.course, undefined, 'Must never attach a fake full course on failure');
  } finally {
    if (savedGeminiKey !== undefined) {
      process.env.GEMINI_API_KEY = savedGeminiKey;
    }
  }
});

test('Mid-generation rate limit / failure preserves completed modules via CourseGenerationPartialError', async () => {
  const { patch } = generateComprehensiveCoursePatch('Generative AI', undefined, {
    subject: 'Generative AI',
    difficultyLevel: 'Foundational',
    learningGoals: ['LLM Tokenisation & Context Windows', 'Structured Prompting', 'RAG Grounding', 'AI Hallucination Governance'],
    moduleCount: 4
  });
  const courseInput = applyPatchToCourse(createScratchCourse('Generative AI'), patch);

  const healthyMock = createDomainCourseAIMock({
    domainTerms: ['LLM Tokens & Context Windows', 'Structured Prompt Constraints', 'RAG Retrieval Grounding', 'AI Hallucination Auditing'],
    cities: ['Johannesburg', 'Cape Town', 'Pretoria'],
    orgs: ['Enterprise Analytics Team', 'Financial Services AI Hub', 'Operations Digital Unit'],
    laws: 'POPIA Act 4 of 2013 & King IV Principle 12'
  });

  await assert.rejects(
    async () => {
      await generateCourseWithAIEngine(courseInput, 'groq', 'openai/gpt-oss-120b', {
        skipRepair: true,
        aiExecute: async req => {
          const modMatch = (req.prompt || '').match(/Author complete Module\s+(\d+)/);
          if (modMatch && Number(modMatch[1]) >= 3) {
            throw new Error(`429 Rate limit reached on Groq TPM quota for Module ${modMatch[1]}`);
          }
          return healthyMock(req);
        }
      });
    },
    (err: any) => {
      assert.ok(err instanceof CourseGenerationPartialError, 'Must throw CourseGenerationPartialError');
      assert.equal(err.failedStage, 'module_synthesis');
      assert.equal(err.failedModuleNumber, 3);
      assert.equal(err.completedModulesCount, 2);
      assert.equal(err.totalModulesCount, 4);
      assert.ok(err.partialCourse, 'Must include preserved completed modules');
      assert.equal(err.partialCourse.modules.length, 2);
      assert.equal(err.partialCourse.generationMetadata?.isPartial, true);
      assert.equal(err.partialCourse.generationMetadata?.completedModules, 2);
      assert.equal(err.partialCourse.generationMetadata?.totalModules, 4);
      assert.equal(err.partialCourse.qa.overallVerdict, 'FAIL');
      return true;
    }
  );
});

test('Both Gemini and Groq receive full course context (description, competencies, outcomes, target audience, 7 lesson dimensions)', async () => {
  const { patch } = generateComprehensiveCoursePatch('Generative AI for Engineers');
  const courseInput = applyPatchToCourse(createScratchCourse('Generative AI for Engineers'), patch);
  courseInput.structure.purposeStatement = 'Hands-on training on transformer tokens, context windows, RAG vector search, and deterministic evaluation.';
  courseInput.structure.targetRoles = 'South African Software & Data Engineers';
  courseInput.structure.keyCompetencies = 'Prompt constraint engineering, RAG chunking, hallucination detection';
  courseInput.learningDesign.learningObjectivesList = ['Build grounded RAG pipelines', 'Benchmark LLM failure modes'];
  courseInput.research.aiToolsPlatformName = 'Groq, Gemini, Vector DB';

  const capturedPrompts: Record<'groq' | 'gemini', string[]> = { groq: [], gemini: [] };
  const healthyMock = createDomainCourseAIMock({
    domainTerms: ['Transformer Tokens & Context Windows', 'RAG Vector Chunking & Grounding', 'Deterministic LLM Evaluation'],
    cities: ['Johannesburg', 'Cape Town', 'Stellenbosch'],
    orgs: ['FinTech Engineering Hub', 'HealthTech Data Platform', 'Cloud Retail Labs'],
    laws: 'POPIA Act 4 of 2013 & King IV Principle 12'
  });

  for (const provider of ['groq', 'gemini'] as const) {
    const model = provider === 'gemini' ? 'gemini-4-hydrogen' : 'openai/gpt-oss-120b';
    const res = await generateCourseWithAIEngine(courseInput, provider, model, {
      skipRepair: true,
      aiExecute: async req => {
        capturedPrompts[provider].push(req.prompt || '');
        return healthyMock(req);
      }
    });
    assert.equal(res.success, true);
    assert.equal(res.course?.qa.overallVerdict, 'PASS');
  }

  for (const provider of ['groq', 'gemini'] as const) {
    const stage1And2 = capturedPrompts[provider].slice(0, 4).join('\n');
    assert.match(stage1And2, /Hands-on training on transformer tokens/);
    assert.match(stage1And2, /South African Software & Data Engineers/);
    assert.match(stage1And2, /Prompt constraint engineering/);
    assert.match(stage1And2, /Build grounded RAG pipelines/);
    assert.match(stage1And2, /Groq, Gemini, Vector DB/);
  }
});

test('Semantic QA strictly verdicts FAIL on explicit offline fallback, generic boilerplate, missing LO coverage, title mismatch, and ungrounded MCQs', async () => {
  const { patch } = generateComprehensiveCoursePatch('Generative AI for Business');
  const courseInput = applyPatchToCourse(createScratchCourse('Generative AI for Business'), patch);
  const blueprint = buildDeterministicBlueprint(courseInput);

  // (a) Explicit offline local-fallback draft must NEVER receive PASS
  const offlineFallback = generateLocalFallbackCourse(courseInput);
  assert.equal(offlineFallback.generationMetadata?.provider, 'local_fallback');
  assert.equal(offlineFallback.qa.overallVerdict, 'FAIL');
  assert.equal(offlineFallback.qa.hasBlockingFailures, true);

  const fallbackReview = reviewGeneratedCourseQuality(offlineFallback, courseInput, blueprint);
  assert.equal(fallbackReview.qa.overallVerdict, 'FAIL');
  assert.equal(fallbackReview.qa.hasBlockingFailures, true);

  // Start from a healthy AI-generated Generative AI course for targeted negative mutation controls
  const healthyRes = await generateCourseWithAIEngine(courseInput, 'groq', 'openai/gpt-oss-120b', {
    skipRepair: true,
    aiExecute: createDomainCourseAIMock({
      domainTerms: ['LLM Tokenisation & Context Limits', 'RAG Document Grounding', 'Hallucination Detection & Guardrails'],
      cities: ['Sandton', 'Cape Town', 'Pretoria'],
      orgs: ['Commercial Operations Division', 'Customer Advisory Hub', 'Corporate Finance Team'],
      laws: 'POPIA Act 4 of 2013 & King IV Principle 12'
    })
  });
  assert.ok(healthyRes.course);

  // (b) Fallback boilerplate phrases trigger FAIL
  const boilerplateCourse = structuredClone(healthyRes.course!);
  boilerplateCourse.modules[0].lessons[0].contentBody +=
    '\n\nUnderstanding why a concept behaves predictably requires checking Frame Constraints First and Construct & Test Iteratively. Examine how inputs, structural assumptions, and domain constraints interact.';
  const boilerplateReview = reviewGeneratedCourseQuality(boilerplateCourse, courseInput, blueprint);
  assert.equal(boilerplateReview.qa.overallVerdict, 'FAIL');
  assert.equal(boilerplateReview.qa.hasBlockingFailures, true);

  // (c) Lesson content unrelated to its lesson title triggers lesson_relevance FAIL
  const mismatchedLessonCourse = structuredClone(healthyRes.course!);
  mismatchedLessonCourse.modules[0].lessons[0].title = 'Vector Embeddings and Cosine Similarity';
  mismatchedLessonCourse.modules[0].lessons[0].contentBody =
    'Quarterly team calendars and holiday shift rosters require advance supervisor approval every Friday afternoon before payroll submissions lock across regional South African branches.';
  const titleMismatchReview = reviewGeneratedCourseQuality(mismatchedLessonCourse, courseInput, blueprint);
  const relevanceCheck = titleMismatchReview.qa.qaChecks?.find(c => c.id === 'lesson_relevance');
  assert.equal(relevanceCheck?.status, 'FAIL');
  assert.equal(titleMismatchReview.qa.hasBlockingFailures, true);

  // (d) Module LO not taught anywhere in module lessons triggers learning_objectives FAIL
  const missingLoCourse = structuredClone(healthyRes.course!);
  missingLoCourse.modules[0].learningObjectives = [
    { id: 'lo-unmet-1', code: 'LO 1.1', statement: 'Calibrate quantization bit-widths and KV-cache eviction heuristics', bloomLevel: 'Apply' },
    { id: 'lo-unmet-2', code: 'LO 1.2', statement: 'Benchmark perplexity degradation across sparse attention kernels', bloomLevel: 'Evaluate' }
  ];
  const loReview = reviewGeneratedCourseQuality(missingLoCourse, courseInput, blueprint);
  const loCheck = loReview.qa.qaChecks?.find(c => c.id === 'learning_objectives');
  assert.equal(loCheck?.status, 'FAIL');
  assert.equal(loReview.qa.hasBlockingFailures, true);

  // (e) Generic MCQ stem ("Which practice best demonstrates mastery of...") triggers assessment_alignment FAIL
  const genericMcqCourse = structuredClone(healthyRes.course!);
  genericMcqCourse.modules[0].knowledgeChecks[0].question =
    'Which practice best demonstrates mastery of RAG Document Grounding?';
  genericMcqCourse.modules[0].knowledgeChecks[1].question =
    'Which practice best demonstrates mastery of LLM Tokenisation & Context Limits?';
  const mcqReview = reviewGeneratedCourseQuality(genericMcqCourse, courseInput, blueprint);
  const mcqCheck = mcqReview.qa.qaChecks?.find(c => c.id === 'assessment_alignment');
  assert.equal(mcqCheck?.status, 'FAIL');
  assert.equal(mcqReview.qa.hasBlockingFailures, true);
});

