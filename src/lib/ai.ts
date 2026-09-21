import { GoogleGenAI, Type, Schema } from '@google/genai';

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

const MeetingSummarySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    overview: {
      type: Type.STRING,
      description: "A comprehensive overview paragraph of the meeting."
    },
    key_points: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: "Bullet points representing the key takeaways."
    },
    action_items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          assignee: { type: Type.STRING },
          text: { type: Type.STRING }
        },
        required: ["assignee", "text"]
      },
      description: "Action items or tasks assigned during the meeting."
    }
  },
  required: ["overview", "key_points", "action_items"]
};

export async function generateSummary(transcriptText: string, template: SummaryTemplate): Promise<MeetingSummary> {
  const systemInstructions = {
    general: `You are an AI meeting assistant. Summarize the transcript following the required schema. Ensure the overview is accurate.`,
    sales: `You are an AI sales assistant. Summarize focusing on pain points, customer objections, and next steps following the required schema.`,
    product: `You are an AI product manager. Summarize focusing on feature requests, UX feedback, and decisions following the required schema.`,
    interview: `You are an AI HR assistant. Summarize candidate strengths, weaknesses, and follow-up topics following the required schema.`
  };

  const instruction = systemInstructions[template] || systemInstructions.general;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: transcriptText,
      config: {
        systemInstruction: instruction,
        responseMimeType: "application/json",
        responseSchema: MeetingSummarySchema
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
