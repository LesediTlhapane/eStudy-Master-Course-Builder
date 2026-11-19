import type { Course, GeneratedCourse, GeneratedModule, GeneratedLesson, GeneratedScenario, GeneratedQuestion, GeneratedPracticalTask, AIProvider } from '../../types.js';
import { aiRouter } from './aiRouter.js';
import { extractAndParseJSON, reviewGeneratedCourseQuality } from './courseValidator.js';
import { buildDeterministicBlueprint } from './curriculumBlueprint.js';
import { sanitizeCourse } from '../../utils/courseSanitizer.js';

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
  provider: AIProvider = 'groq',
  model?: string
): Promise<GranularRegenerationResult> {
  const startTime = Date.now();
  const course = sanitizeCourse(rawCourse);
  const blueprint = buildDeterministicBlueprint(course);
  const s = course.structure || ({} as any);
  const p = course.problem || ({} as any);
  const forbiddenList = blueprint.outOfScopeDomains
    .flatMap(d => d.forbiddenTerms.slice(0, 5))
    .slice(0, 15)
    .join(', ');

  const systemInstruction = `You are a subject-matter educator and instructional designer for "${blueprint.subjectTitle}" (${blueprint.domainLabel}). Regenerate ONLY the requested component in valid JSON.
SUBJECT LOCK:
- Stay strictly within "${blueprint.subjectTitle}" for "${blueprint.targetAudience}".
- NEVER introduce off-topic concepts such as: ${forbiddenList || 'unrelated domains'}.
- Avoid generic compliance/SOP filler and avoid repeating content taught elsewhere in the course.
- Cite South African legal/regulatory claims ONLY when genuinely applicable and verified; otherwise mark unverified claims for SME validation.
- Preserve all IDs, titles, and objective codes. Return ONLY valid JSON matching the requested schema.`;

  if (!currentGeneratedCourse) {
    throw new Error('Cannot regenerate a component without an existing generated course draft.');
  }

  let prompt = '';
  const updatedCourse: GeneratedCourse = JSON.parse(JSON.stringify(currentGeneratedCourse));
  let updatedPart: any = null;

  {
    if (partType === 'module') {
      // Find the specific module index and context
      const modIndex = updatedCourse.modules.findIndex(m => m.id === targetId);
      const targetMod = modIndex !== -1 ? updatedCourse.modules[modIndex] : updatedCourse.modules[0];
      const sourceMod = ((course.modules || [])[modIndex] || {}) as any;

      prompt = `Course: "${s.title || course.name}" (Code: ${s.code || course.code})
Target Audience: ${s.targetRoles || p.targetGroup || 'Professionals'}
Regenerate Module Number ${targetMod.moduleNumber}: "${targetMod.title}"
Purpose: ${sourceMod?.purpose || targetMod.purpose}
Existing learning objectives: ${JSON.stringify(targetMod.learningObjectives)}
Existing lesson plan to preserve: ${JSON.stringify(targetMod.lessons.map((lesson: GeneratedLesson) => ({
  id: lesson.id,
  title: lesson.title,
  concepts: lesson.concepts
})))}

Requirements:
Keep the same lesson count and titles/IDs. Give each lesson a distinct teaching purpose, explain its core concepts and limitations, and include a subject-specific worked example. Avoid repeating content from the other lessons.
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
      "contentBody": "Subject-specific teaching text that explains concepts, mechanisms, limitations and a worked example",
      "callouts": [{ "type": "Tip", "title": "Execution Standard", "content": "Practical guidance" }],
      "workplaceApplication": "Specific application to this learner's role",
      "aiApplication": "Relevant AI application, or state that AI is not applicable"
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
      "question": "Distinct question assessing a taught concept or objective",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 1,
      "rationale": "Why the correct answer is correct",
      "learningObjectiveRef": "Exact code of the relevant module objective"
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
            if (modIndex !== -1) {
              updatedCourse.modules[modIndex] = parsedMod;
            } else {
              updatedCourse.modules.push(parsedMod);
            }
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
Module learning objectives: ${JSON.stringify(foundMod?.learningObjectives || [])}
Other lesson titles and concepts to avoid repeating: ${JSON.stringify(
  (foundMod?.lessons || []).filter(lesson => lesson.id !== targetId).map(lesson => ({
    title: lesson.title,
    concepts: lesson.concepts
  }))
)}

Return a single JSON object matching this schema:
{
  "id": "${targetId}",
  "title": "${lessonTitle}",
  "durationMinutes": 35,
  "concepts": ["Subject-specific concepts taught in this lesson"],
  "contentBody": "Markdown lesson teaching that explains concepts, how or why they work, when they apply, limitations, and a distinct worked example.",
  "callouts": [
    { "type": "Good/Bad Example", "title": "Implementation Standard", "content": "Good: Following formal channels.\\nBad: Skipping safeguards." }
  ],
  "workplaceApplication": "Concrete subject-specific application in the learner role.",
  "aiApplication": "Relevant AI application, or state that AI is not applicable."
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
        updatedCourse.modules = updatedCourse.modules.map(m => ({
          ...m,
          lessons: m.lessons.map(l => l.id === targetId ? { ...l, ...parsedLesson } : l)
        }));
        updatedPart = parsedLesson;
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
Other scenarios to avoid repeating: ${JSON.stringify(
  updatedCourse.modules.flatMap(module => module.scenarios)
    .filter(scenario => scenario.id !== targetId)
    .map(scenario => ({ title: scenario.title, situation: scenario.situation }))
)}
Use a context that demonstrates the subject matter. Do not force legal or compliance content into an unrelated scenario.

Return a single JSON object matching this schema:
{
  "id": "${targetId}",
  "title": "Fresh Realistic Workplace Scenario",
  "type": "${foundScenario?.type || 'Workplace'}",
  "situation": "A specific, realistic workplace situation relevant to the lesson subject and target audience",
  "challenge": "A subject-specific problem or decision",
  "decisionPoint": "A clear choice the learner must make",
  "debrief": "Explain the relevant concept and reason through the decision",
  "keyTakeaway": "A concise, subject-specific learning point"
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
      const parentModule = updatedCourse.modules.find(m =>
        m.knowledgeChecks.some(question => question.id === targetId)
      );
      const currentQuestion = parentModule?.knowledgeChecks.find(question => question.id === targetId);
      prompt = `Course: "${s.title || course.name}"
Module: "${parentModule?.title || 'Course'}"
Existing learning objectives: ${JSON.stringify(parentModule?.learningObjectives || [])}
Regenerate a single distinct question (ID: "${targetId}") that tests a concept actually taught in this module.

Return a single JSON object matching this schema:
{
  "id": "${targetId}",
  "question": "A clear question testing a taught concept, with application where appropriate",
  "options": [
    "Plausible option",
    "Correct answer",
    "Plausible misconception",
    "Another plausible option"
  ],
  "correctAnswer": 1,
  "rationale": "Explain why the correct answer is right and why the strongest distractor is wrong.",
  "learningObjectiveRef": "${currentQuestion?.learningObjectiveRef || parentModule?.learningObjectives[0]?.code || ''}"
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
Base every question and task on the course's taught concepts and learning objectives. Do not assume a compliance or AI-governance topic unless it appears in the course.

Return a JSON object:
{
  "title": "Summative Capstone Assessment & Final Evaluation",
  "passMark": "80%",
  "instructions": "Demonstrate mastery of the concepts and skills taught in the course.",
  "questions": [
    {
      "id": "final-q1",
      "question": "Distinct case-based question testing a taught objective",
      "options": ["Option A", "Option B (Correct)", "Option C", "Option D"],
      "correctAnswer": 1,
      "rationale": "Accurate rationale tied to a taught concept.",
      "learningObjectiveRef": "Exact code of a relevant course objective"
    }
  ],
  "capstoneCaseStudy": {
    "title": "${s.title || course.name} Strategic Operational Audit",
    "scenario": "A realistic, subject-specific case for the target audience.",
    "tasks": ["1. Apply a taught concept.", "2. Explain the decision using evidence.", "3. Produce the required artefact."],
    "deliverable": "A clearly specified learner artefact aligned to the objectives."
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
Module learning objectives: ${JSON.stringify(foundMod?.learningObjectives || [])}
Regenerate a practical task that tests subject-specific skills without generic compliance filler.

Return a JSON object matching this schema:
{
  "id": "${targetId}",
  "title": "Specific task title",
  "instructions": "Objective: ...\\nScenario: ...\\nResources: ...\\nSteps: 1. ... 2. ...\\nDeliverable: ...\\nSuccess criteria: ...\\nReflection: ...",
  "deliverable": "A specific learner artefact aligned with the module objectives",
  "evaluationRubric": [
    "Subject accuracy and application (50%)",
    "Reasoning and completeness (50%)"
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
  }

  // Re-run QA review after granular update so Quality Scorecard stays accurate
  try {
    updatedCourse.qa = reviewGeneratedCourseQuality(updatedCourse, course, blueprint).qa;
  } catch (qaErr) {
    console.warn('Could not re-evaluate QA after granular regeneration:', qaErr);
  }

  const activeProvider: AIProvider = provider === 'gemini' ? 'gemini' : 'groq';
  const defaultModel = activeProvider === 'gemini' ? 'gemini-4-hydrogen' : 'openai/gpt-oss-120b';
  const modelCompatible =
    model &&
    (activeProvider === 'gemini' ? model.toLowerCase().includes('gemini') : !model.toLowerCase().includes('gemini'));
  const resolvedModel = modelCompatible ? model! : defaultModel;

  // Update generation metadata to record the live AI granular update
  updatedCourse.generationMetadata = {
    provider: activeProvider,
    providerDisplayName: activeProvider === 'gemini' ? 'Google Gemini' : 'Groq Cloud',
    model: resolvedModel,
    generatedAt: new Date().toISOString(),
    generationDurationMs: Date.now() - startTime,
    fallbackUsed: false
  };

  return {
    success: true,
    course: updatedCourse,
    updatedPart,
    provider: activeProvider,
    model: resolvedModel,
    durationMs: Date.now() - startTime,
    fallbackUsed: false
  };
}
