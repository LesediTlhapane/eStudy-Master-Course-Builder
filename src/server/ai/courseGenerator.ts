import { Course, GeneratedCourse, AIProvider, GenerationMetadata } from '../../types';
import { generateMasterPrompt } from '../../utils/promptGenerator';
import { generateLocalFallbackCourse } from '../../utils/localCourseEngine';
import { sanitizeCourse } from '../../utils/courseSanitizer';
import { aiRouter } from './aiRouter';
import { extractAndParseJSON, validateAndSanitizeGeneratedCourse } from './courseValidator';
import { getDefaultModelForProvider, getModelMeta } from './modelRegistry';

export interface CourseGenerationResult {
  success: boolean;
  course: GeneratedCourse;
  error?: string;
}

export async function generateCourseWithAIEngine(
  rawCourse: Course,
  providerInput?: AIProvider,
  modelInput?: string
): Promise<CourseGenerationResult> {
  const startTime = Date.now();
  const course = sanitizeCourse(rawCourse);
  const provider: AIProvider = providerInput === 'groq' ? 'groq' : 'gemini';
  const model: string = modelInput?.trim() || getDefaultModelForProvider(provider, 'course_generation');
  const modelInfo = getModelMeta(provider, model);

  const masterPrompt = generateMasterPrompt(course);

  const systemInstruction = `You are eStudy South Africa's Senior Instructional Designer and AI Learning Architect.
Your task is to generate a complete, structured, highly professional corporate course based on the provided Master Course Generation Prompt v9.0.

Requirements:
1. Adhere strictly to eStudy pedagogical standards: scenario-driven, performance-focused, POPIA and South African regulatory compliant.
2. Generate all modules, detailed lessons, realistic South African workplace scenarios (Situation, Challenge, Decision Point, Debrief, Key Takeaway), AI application scenarios, diagnostic questions, module knowledge checks with rationales, and capstone assessment with case study.
3. Return the course STRICTLY as a valid JSON object matching the requested schema. Do not include markdown preamble outside the JSON object.`;

  const prompt = `Here is the validated Master Prompt specification:\n\n${masterPrompt}\n\nGenerate the complete course output in JSON format.`;

  try {
    const aiResponse = await aiRouter.execute({
      provider,
      model,
      prompt,
      systemInstruction,
      responseFormat: 'json',
      timeoutMs: 60000 // 60s for full curriculum generation
    });

    const parsedJson = extractAndParseJSON(aiResponse.text);

    const metadata: GenerationMetadata = {
      provider,
      providerDisplayName: provider === 'groq' ? 'Groq Cloud' : 'Google Gemini',
      model,
      modelDisplayName: modelInfo?.displayName || model,
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

    if (validation.success && validation.course) {
      return {
        success: true,
        course: validation.course
      };
    } else {
      console.warn(`Generated course failed strict validation:`, validation.errors);
      if (validation.course) {
        // Returned sanitized version with note
        return {
          success: true,
          course: validation.course
        };
      }
      throw new Error(`Course validation failed: ${validation.errors.join(', ')}`);
    }

  } catch (err: any) {
    console.error(`AI generation using ${provider}/${model} failed, engaging resilient fallback:`, err?.message || err);

    const fallbackCourse = generateLocalFallbackCourse(course);
    const durationMs = Date.now() - startTime;

    fallbackCourse.generationMetadata = {
      provider: 'local_fallback',
      providerDisplayName: 'Local Fallback Engine',
      model: 'local-framework-v9',
      modelDisplayName: 'Local Framework Fallback Engine',
      generatedAt: new Date().toISOString(),
      generationDurationMs: durationMs,
      fallbackUsed: true,
      fallbackReason: err?.message || 'AI provider request failed or timed out.'
    };

    return {
      success: true,
      course: fallbackCourse,
      error: err?.message
    };
  }
}
