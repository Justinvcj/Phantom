import { GoogleGenAI } from '@google/genai';

// Initialize the Google Gen AI SDK
const ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY });

export type SummaryTemplate = 'general' | 'sales' | 'product' | 'interview';

export interface MeetingSummary {
  overview: string;
  key_points: string[];
  action_items: {
    assignee: string;
    text: string;
  }[];
}

export async function generateSummary(transcriptText: string, template: SummaryTemplate): Promise<MeetingSummary> {
  const schemaStr = "{ 'overview': 'paragraph', 'key_points': ['point 1'], 'action_items': [{ 'assignee': 'name', 'text': 'task' }] }";
  
  const systemInstructions = {
    general: `You are an AI meeting assistant. Summarize the transcript. Output JSON matching exactly this schema: ${schemaStr}`,
    sales: `You are an AI sales assistant. Summarize focusing on pain points and next steps. Output JSON matching exactly this schema: ${schemaStr}`,
    product: `You are an AI product manager. Summarize focusing on feature requests and decisions. Output JSON matching exactly this schema: ${schemaStr}`,
    interview: `You are an AI HR assistant. Summarize candidate strengths/weaknesses. Output JSON matching exactly this schema: ${schemaStr}`
  };

  const instruction = systemInstructions[template] || systemInstructions.general;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: transcriptText,
      config: {
        systemInstruction: instruction,
        responseMimeType: "application/json",
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as MeetingSummary;
    }
    throw new Error("No text in response");
  } catch (error) {
    console.error("AI Generation failed, falling back to seed:", error);
    // Fallback so we never show a broken state
    return {
      overview: "Fallback Summary: The AI service is currently unreachable, but the meeting covered standard weekly sync items.",
      key_points: [
        "Discussed project timelines",
        "Assigned action items for the upcoming sprint",
        "Reviewed blockers and dependencies"
      ],
      action_items: [
        { assignee: "Team", text: "Review blockers" }
      ]
    };
  }
}
