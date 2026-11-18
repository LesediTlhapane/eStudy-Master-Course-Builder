import { Course, GeneratedCourse, AIProvider, GenerationMetadata } from '../../types';
import { generateMasterPrompt } from '../../utils/promptGenerator';
import { sanitizeCourse } from '../../utils/courseSanitizer';
import { aiRouter } from './aiRouter';
import { extractAndParseJSON, validateAndSanitizeGeneratedCourse } from './courseValidator';
import { getDefaultModelForProvider, getModelMeta } from './modelRegistry';

export interface CourseGenerationResult {
  success: boolean;
  course?: GeneratedCourse;
  error?: string;
}

export async function generateCourseWithAIEngine(
  rawCourse: Course,
  providerInput?: AIProvider,
  modelInput?: string
): Promise<CourseGenerationResult> {
  const startTime = Date.now();
  const course = sanitizeCourse(rawCourse);
  const provider: AIProvider = 'groq';
  const requestedModel = modelInput?.trim();
  const model: string =
    requestedModel && !requestedModel.toLowerCase().includes('gemini')
      ? requestedModel
      : getDefaultModelForProvider(provider, 'course_generation');
  const modelInfo = getModelMeta(provider, model);

  // Validate core compulsory fields before calling the AI service
  const missingCompulsory: string[] = [];
  if (!course.structure?.title?.trim() && (!course.name?.trim() || course.name === 'Untitled Course')) {
    missingCompulsory.push('Course Name (Section 3.1)');
  }
  if (!course.problem?.targetGroup?.trim()) {
    missingCompulsory.push('Target Group (Section 1.1)');
  }
  if (!course.problem?.taskOrSkill?.trim()) {
    missingCompulsory.push('Task or Skill (Section 1.1)');
  }
  if (!course.problem?.operationalImpact?.trim()) {
    missingCompulsory.push('Operational / Financial / Compliance Impact (Section 1.1)');
  }

  if (missingCompulsory.length > 0) {
    throw new Error(
      `Please complete the following compulsory fields before generating the course: ${missingCompulsory.join(', ')}.`
    );
  }

  const masterPrompt = generateMasterPrompt(course);

  const systemInstruction = `You are eStudy South Africa's Senior Instructional Designer and AI Learning Architect.
Your task is to generate a complete, textbook-grade corporate training course and manual (22 to 30 pages in length, ~8,500–12,000 words) grounded strictly in the provided eStudy Master Course Generation Prompt v9.0.

STRICT GROUNDING & QUALITY RULES (NON-NEGOTIABLE):
1. Use South African English spelling and terminology throughout (e.g. Organisation, Programme, Customisation, Analyse, Behaviour, Centre, Summarise, Standardise).
2. Ground all content in the completed template fields and uploaded source materials provided in the Master Prompt.
3. NEVER fabricate South African legislation, qualification codes, SAQA IDs, accreditation status, NQF levels, or empirical statistics. Where the template marks an item as "To Be Confirmed", "Not Applicable", or "Requires SME/Stakeholder Validation", explicitly state that status rather than inventing claims.
4. NEVER generate a short 2-page summary. Structure the curriculum across at least 3 to 4 comprehensive modules (following the user's defined modules in Section 3.9 & Section 4), with 3 to 4 multi-section lessons per module.
5. Each lesson's contentBody must include detailed markdown subsections covering:
   - Executive Context & Operational Foundation
   - Core Principles & Domain Mechanics
   - Step-by-Step Standard Operating Procedure (SOP)
   - South African Statutory & POPIA Governance Framework
   - Real-World Worked Case Example & Troubleshooting Matrix
6. Include realistic workplace scenarios per module (minimum 3 workplace scenarios + AI governance scenarios with Situation, Challenge, Decision Point, and Debrief), 5 formative Knowledge Check MCQs per module with detailed rationales, a Practical Workplace Application Task with weighted rubric per module, Pre-Course Diagnostic questions (5–10 items), and Final Summative Assessment questions with a Capstone Case Study.
7. Return the course STRICTLY as a valid JSON object matching the GeneratedCourse schema (title, code, version, overview, purpose, targetAudience, estimatedDuration, learningOutcomes, modules[], assessments{preCourseDiagnostic, finalAssessment}). Do not include markdown preamble outside the JSON object.`;

  const prompt = `Here is the completed eStudy Master Course Template v9.0 specification:\n\n${masterPrompt}\n\nGenerate the complete, comprehensive 22–30 page training course in valid JSON format.`;

  const aiResponse = await aiRouter.execute({
    provider,
    model,
    prompt,
    systemInstruction,
    responseFormat: 'json',
    maxTokens: 8192,
    timeoutMs: 95000
  });

  if (!aiResponse.text || aiResponse.text.trim().length < 100) {
    throw new Error('The Groq Cloud API returned an empty or incomplete response.');
  }

  const parsedJson = extractAndParseJSON(aiResponse.text);
  if (!parsedJson || typeof parsedJson !== 'object') {
    throw new Error(
      `The AI provider (Groq Cloud - ${model}) returned invalid JSON that could not be parsed. Please retry generation or select another Groq model.`
    );
  }

  const metadata: GenerationMetadata = {
    provider,
    providerDisplayName: 'Groq Cloud',
    model: aiResponse.model || model,
    modelDisplayName: modelInfo?.displayName || aiResponse.model || model,
    generatedAt: new Date().toISOString(),
    generationDurationMs: Date.now() - startTime,
    fallbackUsed: false,
    tokensUsed: aiResponse.usage
      ? {
          input: aiResponse.usage.inputTokens,
          output: aiResponse.usage.outputTokens
        }
      : undefined
  };

  const validation = validateAndSanitizeGeneratedCourse(parsedJson, course, metadata);

  if (validation.course) {
    return {
      success: true,
      course: validation.course
    };
  }

  throw new Error(
    `Generated course validation failed: ${validation.errors.join(', ') || 'Incomplete course structure returned by AI.'}`
  );
}
