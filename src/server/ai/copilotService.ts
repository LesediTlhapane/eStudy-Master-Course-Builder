import { Course, AIProvider } from '../../types';
import { aiRouter } from './aiRouter';
import { getDefaultModelForProvider } from './modelRegistry';
import { extractAndParseJSON } from './courseValidator';
import { processLocalCopilotChat } from '../../utils/localCourseEngine';

export interface CopilotMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CopilotChatPayload {
  messages: CopilotMessage[];
  currentCourse: Course;
  activeSection?: string;
  qaResult?: any;
  provider?: AIProvider;
  model?: string;
}

export interface CopilotChatResponse {
  message: string;
  suggestedActions?: Array<{
    id: string;
    label: string;
    actionType: string;
    payload?: any;
  }>;
  coursePatch?: Partial<Course>;
  courseBrief?: {
    ready: boolean;
    title: string;
    targetAudience: string;
    industryContext: string;
    duration: string;
    moduleCount: number;
  };
  providerUsed?: string;
  modelUsed?: string;
  fallbackUsed?: boolean;
}

export async function processAIAssistedCopilotChat(
  payload: CopilotChatPayload
): Promise<CopilotChatResponse> {
  const provider: AIProvider = payload.provider === 'groq' ? 'groq' : 'gemini';
  const model = payload.model || getDefaultModelForProvider(provider, 'copilot');

  const { messages, currentCourse, activeSection = '01', qaResult } = payload;
  const lastUserMsg = messages[messages.length - 1]?.content || '';

  const courseTitle = currentCourse.structure?.title || currentCourse.name || 'Untitled Course';
  const systemInstruction = `You are eStudy South Africa's Course Architect Copilot.
You assist instructional designers in building, refining, and auditing corporate learning courses under the Master Course Framework v9.0.
Current Course Context:
- Title: "${courseTitle}"
- Code: "${currentCourse.structure?.code || currentCourse.code || 'EST-COURSE-01'}"
- Active Section in Builder: Section ${activeSection}
- Overall QA Score: ${qaResult?.scorePercent || 0}%

Capabilities:
1. Advise on instructional design, Bloom's Taxonomy, POPIA compliance, and workplace scenarios.
2. If the user asks to build, improve, or scaffold modules, provide a helpful explanation AND optionally a JSON 'coursePatch' object containing fields to automatically update in the Course Builder.
3. Suggest 2-3 short quick-action buttons in 'suggestedActions'.

Output format: You MUST return a valid JSON object matching:
{
  "message": "Friendly markdown response answering the user's question directly",
  "suggestedActions": [
    { "id": "act-1", "label": "Button Label", "actionType": "send_prompt", "payload": { "prompt": "Follow up question" } }
  ],
  "coursePatch": { ...optional partial Course updates... }
}`;

  const conversationHistory = messages
    .slice(-6)
    .map(m => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n');

  const prompt = `${conversationHistory}\n\nASSISTANT:`;

  try {
    const aiResponse = await aiRouter.execute({
      provider,
      model,
      prompt,
      systemInstruction,
      responseFormat: 'json',
      timeoutMs: 25000
    });

    const parsed = extractAndParseJSON(aiResponse.text);

    if (parsed && typeof parsed.message === 'string') {
      return {
        message: parsed.message,
        suggestedActions: Array.isArray(parsed.suggestedActions) ? parsed.suggestedActions : [],
        coursePatch: parsed.coursePatch,
        courseBrief: parsed.courseBrief,
        providerUsed: provider,
        modelUsed: model,
        fallbackUsed: false
      };
    }
    throw new Error('AI response did not match expected Copilot format.');

  } catch (err: any) {
    console.warn(`Copilot chat using ${provider}/${model} failed, engaging local engine:`, err?.message || err);

    const localResponse = processLocalCopilotChat({
      messages,
      currentCourse,
      activeSection,
      qaResult
    });

    return {
      ...localResponse,
      providerUsed: 'local_fallback',
      modelUsed: 'local-copilot-engine',
      fallbackUsed: true
    };
  }
}
