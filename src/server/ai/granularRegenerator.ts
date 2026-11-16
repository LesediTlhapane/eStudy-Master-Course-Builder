import { Course, GeneratedCourse, GeneratedModule, GeneratedLesson, GeneratedScenario, GeneratedQuestion, GeneratedPracticalTask, AIProvider } from '../../types';
import { aiRouter } from './aiRouter';
import { extractAndParseJSON } from './courseValidator';
import { generateLocalFallbackCourse } from '../../utils/localCourseEngine';
import { sanitizeCourse } from '../../utils/courseSanitizer';
import { enrichLessonToTextbookStandard, enforceComprehensiveCourseVolume } from '../../utils/courseVolumeEngine';

export interface GranularRegenerationResult {
  success: boolean;
  course: GeneratedCourse;
  updatedPart: any;
  provider: string;
  model: string;
  durationMs: number;
  fallbackUsed: boolean;
}

export async function executeGranularRegeneration(
  rawCourse: Course,
  partType: string,
  targetId: string,
  currentGeneratedCourse?: GeneratedCourse,
  provider: AIProvider = 'gemini',
  model?: string
): Promise<GranularRegenerationResult> {
  const startTime = Date.now();
  const course = sanitizeCourse(rawCourse);
  const s = course.structure || ({} as any);
  const p = course.problem || ({} as any);

  let systemInstruction = `You are eStudy South Africa's Senior Instructional Designer.
Your task is to regenerate ONLY the requested course component in valid JSON format.
Adhere strictly to eStudy pedagogical standards: performance-driven, POPIA and South African workplace compliant.
Return ONLY valid JSON matching the requested component schema.`;

  let prompt = '';
  let updatedCourse: GeneratedCourse = currentGeneratedCourse
    ? JSON.parse(JSON.stringify(currentGeneratedCourse))
    : generateLocalFallbackCourse(course);
  let updatedPart: any = null;
  let fallbackUsed = false;

  try {
    if (partType === 'module') {
      // Find the specific module index and context
      const modIndex = updatedCourse.modules.findIndex(m => m.id === targetId);
      const targetMod = modIndex !== -1 ? updatedCourse.modules[modIndex] : updatedCourse.modules[0];
      const sourceMod = ((course.modules || [])[modIndex] || {}) as any;

      prompt = `Course: "${s.title || course.name}" (Code: ${s.code || course.code})
Target Audience: ${s.targetRoles || p.targetGroup || 'Professionals'}
Regenerate Module Number ${targetMod.moduleNumber}: "${targetMod.title}"
Purpose: ${sourceMod?.purpose || targetMod.purpose}

Requirements:
Return a single JSON object matching this schema:
{
  "id": "${targetMod.id}",
  "moduleNumber": ${targetMod.moduleNumber},
  "title": "${targetMod.title}",
  "subtitle": "Practical Workplace Application",
  "purpose": "Clear operational purpose",
  "learningObjectives": [
    { "id": "lo-1", "code": "LO 1", "statement": "Action-oriented objective", "bloomLevel": "Apply" }
  ],
  "lessons": [
    {
      "id": "lesson-1",
      "title": "Lesson Title",
      "durationMinutes": 30,
      "concepts": ["Concept 1", "Concept 2"],
      "contentBody": "Comprehensive instructional markdown content with workplace guidelines",
      "callouts": [{ "type": "Tip", "title": "Execution Standard", "content": "Practical guidance" }],
      "workplaceApplication": "How learners apply this in their role",
      "aiApplication": "How to leverage AI with human verification"
    }
  ],
  "scenarios": [
    {
      "id": "sc-1",
      "title": "Workplace Scenario Title",
      "type": "Workplace",
      "situation": "Realistic workplace situation",
      "challenge": "Operational conflict or constraint",
      "decisionPoint": "Key dilemma to resolve",
      "debrief": "Analysis of why the correct decision matters",
      "keyTakeaway": "Core takeaway rule"
    }
  ],
  "knowledgeChecks": [
    {
      "id": "kc-1",
      "question": "Scenario-based question testing application",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 1,
      "rationale": "Why option B is correct"
    }
  ],
  "practicalTask": {
    "id": "task-1",
    "title": "Workplace Practical Task",
    "instructions": "Step by step instructions",
    "deliverable": "Completed operational deliverable",
    "evaluationRubric": ["Rubric criteria 1", "Rubric criteria 2"]
  },
  "reflection": ["Reflection question 1", "Reflection question 2"],
  "summary": "Module summary statement"
}`;

      const aiResponse = await aiRouter.execute({
        provider,
        model: model || '',
        prompt,
        systemInstruction,
        responseFormat: 'json'
      });

      const parsedMod = extractAndParseJSON(aiResponse.text);
      if (parsedMod && parsedMod.title && Array.isArray(parsedMod.lessons)) {
        parsedMod.id = targetMod.id;
        parsedMod.moduleNumber = targetMod.moduleNumber;
        parsedMod.lessons = parsedMod.lessons.map((l: GeneratedLesson, lIdx: number) =>
          enrichLessonToTextbookStandard(l, lIdx, parsedMod.title, parsedMod.purpose || '', course)
        );
        if (modIndex !== -1) {
          updatedCourse.modules[modIndex] = parsedMod;
        } else {
          updatedCourse.modules.push(parsedMod);
        }
        updatedCourse = enforceComprehensiveCourseVolume(updatedCourse, course);
        updatedPart = updatedCourse.modules[modIndex !== -1 ? modIndex : updatedCourse.modules.length - 1];
      } else {
        throw new Error('Regenerated module JSON missing required lessons array or title.');
      }

    } else if (partType === 'lesson') {
      // Find lesson and parent module
      let foundMod: GeneratedModule | undefined;
      let foundLesson: GeneratedLesson | undefined;

      for (const m of updatedCourse.modules) {
        const l = m.lessons.find(less => less.id === targetId);
        if (l) {
          foundMod = m;
          foundLesson = l;
          break;
        }
      }

      const modTitle = foundMod?.title || 'Operational Foundations';
      const lessonTitle = foundLesson?.title || 'Workplace Application';

      prompt = `Course: "${s.title || course.name}"
Parent Module: "${modTitle}"
Regenerate single lesson: "${lessonTitle}" (ID: "${targetId}")

Return a single JSON object matching this schema:
{
  "id": "${targetId}",
  "title": "${lessonTitle}",
  "durationMinutes": 35,
  "concepts": ["Applied Practice", "Error Prevention", "POPIA & Policy Compliance"],
  "contentBody": "### Operational Execution\\n\\nDetailed step-by-step guidance, procedural standards, and real-world implementation rules...",
  "callouts": [
    { "type": "Good/Bad Example", "title": "Implementation Standard", "content": "Good: Following formal channels.\\nBad: Skipping safeguards." }
  ],
  "workplaceApplication": "Concrete application in learner role.",
  "aiApplication": "Responsible AI tool assistance with human-in-the-loop sign-off."
}`;

      const aiResponse = await aiRouter.execute({
        provider,
        model: model || '',
        prompt,
        systemInstruction,
        responseFormat: 'json'
      });

      const parsedLesson = extractAndParseJSON(aiResponse.text);
      if (parsedLesson && parsedLesson.title && parsedLesson.contentBody) {
        parsedLesson.id = targetId;
        const enrichedLesson = enrichLessonToTextbookStandard(
          parsedLesson,
          0,
          modTitle,
          foundMod?.purpose || '',
          course
        );
        updatedCourse.modules = updatedCourse.modules.map(m => ({
          ...m,
          lessons: m.lessons.map(l => l.id === targetId ? { ...l, ...enrichedLesson } : l)
        }));
        updatedPart = enrichedLesson;
      } else {
        throw new Error('Regenerated lesson JSON missing required contentBody or title.');
      }

    } else if (partType === 'scenario') {
      // Find scenario and parent module
      let foundMod: GeneratedModule | undefined;
      let foundScenario: GeneratedScenario | undefined;

      for (const m of updatedCourse.modules) {
        const sc = m.scenarios.find(s => s.id === targetId);
        if (sc) {
          foundMod = m;
          foundScenario = sc;
          break;
        }
      }

      prompt = `Course: "${s.title || course.name}"
Parent Module: "${foundMod?.title || 'Core Operations'}"
Regenerate single workplace decision scenario (ID: "${targetId}")
Scenario Type: ${foundScenario?.type || 'Workplace'}

Return a single JSON object matching this schema:
{
  "id": "${targetId}",
  "title": "Fresh Realistic Workplace Scenario",
  "type": "${foundScenario?.type || 'Workplace'}",
  "situation": "A realistic high-stakes workplace dilemma in a South African corporate setting",
  "challenge": "Competing pressures between operational speed and compliance requirements",
  "decisionPoint": "Crucial choice between cutting corners vs following established quality controls",
  "debrief": "In-depth rationale of why compliance and psychological safety prevail",
  "keyTakeaway": "Concise operational takeaway rule"
}`;

      const aiResponse = await aiRouter.execute({
        provider,
        model: model || '',
        prompt,
        systemInstruction,
        responseFormat: 'json'
      });

      const parsedScenario = extractAndParseJSON(aiResponse.text);
      if (parsedScenario && parsedScenario.situation && parsedScenario.decisionPoint) {
        parsedScenario.id = targetId;
        updatedCourse.modules = updatedCourse.modules.map(m => ({
          ...m,
          scenarios: m.scenarios.map(sc => sc.id === targetId ? { ...sc, ...parsedScenario } : sc)
        }));
        updatedPart = parsedScenario;
      } else {
        throw new Error('Regenerated scenario JSON missing situation or decisionPoint.');
      }

    } else if (partType === 'knowledge_check') {
      prompt = `Course: "${s.title || course.name}"
Regenerate a single challenging scenario-based knowledge check question (ID: "${targetId}").

Return a single JSON object matching this schema:
{
  "id": "${targetId}",
  "question": "Realistic scenario-based question evaluating practitioner judgment",
  "options": [
    "Plausible but flawed shortcut",
    "Correct standard operating procedure adhering to regulatory safeguards",
    "Unverified automated assumption",
    "Passive escalation without documentation"
  ],
  "correctAnswer": 1,
  "rationale": "Comprehensive explanation of why option 2 is correct and others fail compliance."
}`;

      const aiResponse = await aiRouter.execute({
        provider,
        model: model || '',
        prompt,
        systemInstruction,
        responseFormat: 'json'
      });

      const parsedQ = extractAndParseJSON(aiResponse.text);
      if (parsedQ && parsedQ.question && Array.isArray(parsedQ.options)) {
        parsedQ.id = targetId;
        updatedCourse.modules = updatedCourse.modules.map(m => ({
          ...m,
          knowledgeChecks: m.knowledgeChecks.map(q => q.id === targetId ? { ...q, ...parsedQ } : q)
        }));
        updatedPart = parsedQ;
      } else {
        throw new Error('Regenerated knowledge check missing question or options.');
      }

    } else if (partType === 'diagnostic') {
      prompt = `Course: "${s.title || course.name}"
Regenerate the Pre-Course Readiness Diagnostic questions (5 questions).

Return a JSON object:
{
  "title": "Pre-Course Knowledge & Readiness Diagnostic",
  "instructions": "Assess your baseline competency across domain practices and digital tool oversight.",
  "questions": [
    {
      "id": "diag-1",
      "question": "Diagnostic question 1",
      "options": ["No prior exposure", "Basic understanding", "Regular supervised practice", "Lead practitioner"],
      "correctAnswer": 2,
      "rationale": "Calibrates cohort learning trajectory."
    }
  ]
}`;

      const aiResponse = await aiRouter.execute({
        provider,
        model: model || '',
        prompt,
        systemInstruction,
        responseFormat: 'json'
      });

      const parsedDiag = extractAndParseJSON(aiResponse.text);
      if (parsedDiag && Array.isArray(parsedDiag.questions)) {
        updatedCourse.assessments.preCourseDiagnostic = parsedDiag;
        updatedPart = parsedDiag;
      } else {
        throw new Error('Regenerated diagnostic missing questions array.');
      }

    } else if (partType === 'capstone') {
      prompt = `Course: "${s.title || course.name}"
Regenerate the Summative Capstone Assessment and Case Study.

Return a JSON object:
{
  "title": "Summative Capstone Assessment & Final Evaluation",
  "passMark": "80%",
  "instructions": "Demonstrate complete procedural and regulatory mastery across all course modules.",
  "questions": [
    {
      "id": "final-q1",
      "question": "Complex case-based capstone question",
      "options": ["Option A", "Option B (Correct)", "Option C", "Option D"],
      "correctAnswer": 1,
      "rationale": "Clear rationale linking to POPIA and operational standards."
    }
  ],
  "capstoneCaseStudy": {
    "title": "${s.title || course.name} Strategic Operational Audit",
    "scenario": "A comprehensive multi-departmental challenge involving risk remediation and AI tool governance.",
    "tasks": ["1. Audit workflow controls.", "2. Formulate 3-pillar remediation.", "3. Executive presentation."],
    "deliverable": "A 3-page Operational Remediation Plan."
  }
}`;

      const aiResponse = await aiRouter.execute({
        provider,
        model: model || '',
        prompt,
        systemInstruction,
        responseFormat: 'json'
      });

      const parsedCap = extractAndParseJSON(aiResponse.text);
      if (parsedCap && Array.isArray(parsedCap.questions)) {
        updatedCourse.assessments.finalAssessment = {
          ...updatedCourse.assessments.finalAssessment,
          ...parsedCap
        };
        updatedPart = parsedCap;
      } else {
        throw new Error('Regenerated capstone missing questions array.');
      }

    } else if (partType === 'practical_task' || partType === 'task') {
      let foundMod: GeneratedModule | undefined;
      for (const m of updatedCourse.modules) {
        if (m.practicalTask && (m.practicalTask.id === targetId || m.id === targetId)) {
          foundMod = m;
          break;
        }
      }
      const modTitle = foundMod?.title || 'Operational Application';

      prompt = `Course: "${s.title || course.name}"
Parent Module: "${modTitle}"
Regenerate a realistic workplace Practical Task.

Return a JSON object matching this schema:
{
  "id": "${targetId}",
  "title": "${modTitle} Workplace Application & Audit Task",
  "instructions": "Step-by-step practical workplace instructions adhering to eStudy and regulatory criteria.",
  "deliverable": "Tangible professional deliverable produced by learner (e.g. Audit matrix, Action Plan)",
  "evaluationRubric": [
    "Criteria 1: Thoroughness and procedural fidelity (40%)",
    "Criteria 2: Statutory and POPIA compliance (30%)",
    "Criteria 3: Feasibility of remediation timeline (30%)"
  ]
}`;

      const aiResponse = await aiRouter.execute({
        provider,
        model: model || '',
        prompt,
        systemInstruction,
        responseFormat: 'json'
      });

      const parsedTask = extractAndParseJSON(aiResponse.text);
      if (parsedTask && parsedTask.title && parsedTask.instructions && parsedTask.deliverable) {
        parsedTask.id = targetId;
        updatedCourse.modules = updatedCourse.modules.map(m => {
          if ((m.practicalTask && m.practicalTask.id === targetId) || m.id === targetId) {
            return { ...m, practicalTask: parsedTask };
          }
          return m;
        });
        updatedPart = parsedTask;
      } else {
        throw new Error('Regenerated practical task missing title, instructions, or deliverable.');
      }

    } else {
      throw new Error(`Unsupported regeneration partType: "${partType}".`);
    }

  } catch (err: any) {
    console.warn(`Granular regeneration via AI provider ${provider} failed, using local refinement fallback:`, err?.message || err);
    fallbackUsed = true;
    
    // Provide safe local fallback refinement for the targeted part
    if (partType === 'scenario') {
      const refreshedScenario: GeneratedScenario = {
        id: targetId,
        title: `Workplace Scenario: High-Impact Decision Point`,
        type: 'Workplace',
        situation: `During an operational cycle in ${s.title || 'the organisation'}, unforeseen variance arises requiring immediate remediation.`,
        challenge: `Reconciling throughput timelines with mandatory POPIA and compliance standards.`,
        decisionPoint: `Initiate root-cause escalation protocol vs applying an undocumented shortcut.`,
        debrief: `Shortcuts create audit and statutory non-compliance. Escalation preserves quality and organizational accountability.`,
        keyTakeaway: `Adhere strictly to standard operating procedures and documentation gates.`
      };
      updatedCourse.modules = updatedCourse.modules.map(m => ({
        ...m,
        scenarios: m.scenarios.map(sc => sc.id === targetId ? refreshedScenario : sc)
      }));
      updatedPart = refreshedScenario;
    } else if (partType === 'lesson') {
      const refreshedLesson: GeneratedLesson = {
        id: targetId,
        title: `Applied Workplace Execution & Compliance Standards`,
        durationMinutes: 30,
        concepts: ['Operating Procedures', 'Human Oversight', 'Audit Trails'],
        contentBody: `### Applied Implementation\nThis lesson refines core operational procedures under ${s.title || 'the standard framework'}.\n\n### Core Protocol\n1. Validate source information against statutory standards.\n2. Execute procedures with zero unvetted shortcuts.\n3. Log all decisions for quality audits.`,
        callouts: [
          { type: 'Tip', title: 'Operational Checklist', content: 'Double-check compliance criteria before customer hand-off.' }
        ],
        workplaceApplication: 'Immediate integration into daily task checklists and peer reviews.',
        aiApplication: 'Use AI assistants for drafting while enforcing mandatory human-in-the-loop review.'
      };
      updatedCourse.modules = updatedCourse.modules.map(m => ({
        ...m,
        lessons: m.lessons.map(l => l.id === targetId ? refreshedLesson : l)
      }));
      updatedPart = refreshedLesson;
    } else {
      updatedPart = updatedCourse;
    }
  }

  // Update generation metadata to record the granular change
  updatedCourse.generationMetadata = {
    provider: fallbackUsed ? 'local_fallback' : provider,
    providerDisplayName: fallbackUsed ? 'Local Fallback Engine' : (provider === 'groq' ? 'Groq Cloud' : 'Google Gemini'),
    model: model || (provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gemini-3.8-flash'),
    generatedAt: new Date().toISOString(),
    generationDurationMs: Date.now() - startTime,
    fallbackUsed,
    fallbackReason: fallbackUsed ? `Granular regeneration executed via local engine.` : undefined
  };

  return {
    success: true,
    course: updatedCourse,
    updatedPart,
    provider,
    model: model || '',
    durationMs: Date.now() - startTime,
    fallbackUsed
  };
}
