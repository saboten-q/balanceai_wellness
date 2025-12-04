
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserProfile, WorkoutPlan, DietLog, ChatMessage } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// --- Schemas ---

const ExerciseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    type: { type: Type.STRING, enum: ['Strength', 'Cardio', 'Flexibility'] },
    duration: { type: Type.STRING },
    description: { type: Type.STRING },
  },
  required: ['name', 'type', 'duration', 'description'],
};

const DailyWorkoutSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    day: { type: Type.STRING },
    focus: { type: Type.STRING },
    exercises: { type: Type.ARRAY, items: ExerciseSchema },
  },
  required: ['day', 'focus', 'exercises'],
};

const WorkoutPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    recommendedCalories: { type: Type.NUMBER, description: "Daily recommended calorie intake based on user BMR and goal" },
    schedule: { type: Type.ARRAY, items: DailyWorkoutSchema },
  },
  required: ['summary', 'recommendedCalories', 'schedule'],
};

const NutritionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    foodName: { type: Type.STRING },
    calories: { type: Type.NUMBER },
    protein: { type: Type.NUMBER },
    fat: { type: Type.NUMBER },
    carbs: { type: Type.NUMBER },
    advice: { type: Type.STRING },
  },
  required: ['foodName', 'calories', 'protein', 'fat', 'carbs', 'advice'],
};

// --- Functions ---

export const generateWorkoutPlan = async (profile: UserProfile): Promise<WorkoutPlan> => {
  try {
    const gymContext = profile.hasGymAccess 
      ? "User has access to a GYM. Include exercises using machines, barbells, and dumbbells where appropriate." 
      : "User works out at HOME. Focus on bodyweight exercises, or simple equipment if typical.";

    const prompt = `
      Create a personalized weekly workout plan AND nutritional target for this user:
      Profile: ${profile.age} years old, ${profile.gender}, ${profile.height}cm.
      Current Weight: ${profile.weight}kg.
      Target Weight: ${profile.targetWeight}kg.
      Goal: ${profile.goal}.
      Activity Level: ${profile.activityLevel}.
      Environment: ${gymContext}
      
      1. Calculate the optimal daily calorie intake (recommendedCalories) to achieve their target weight safely.
      2. Create a 7-day workout schedule.
      3. Return a JSON object with a summary, the recommendedCalories, and the schedule.
      Ensure the plan is realistic, safe, and specifically tailored to their environment (Gym vs Home).
      IMPORTANT: Do NOT use emojis in the text content. Keep it professional and clean.
      Language: Japanese.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: WorkoutPlanSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    // Add IDs to exercises manually since schema doesn't generate UUIDs
    const plan = JSON.parse(text) as WorkoutPlan;
    plan.schedule.forEach(day => {
      day.exercises.forEach((ex: any) => {
        ex.id = crypto.randomUUID();
        ex.isCompleted = false;
      });
    });
    
    return plan;
  } catch (error) {
    console.error("Error generating workout:", error);
    throw error;
  }
};

export const analyzeFoodImage = async (base64Image: string | null, textDescription: string): Promise<DietLog['macros'] & { foodName: string, advice: string }> => {
  try {
    const parts: any[] = [];
    
    if (base64Image) {
      const data = base64Image.split(',')[1] || base64Image;
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: data,
        },
      });
    }

    if (textDescription) {
      parts.push({ text: `Description of food: ${textDescription}` });
    }

    parts.push({ text: "Analyze the nutritional content of this meal. Provide calories, protein (g), fat (g), carbs (g), a short name for the dish, and brief health advice in Japanese. Do NOT use emojis." });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: NutritionSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    const result = JSON.parse(text);

    return {
      foodName: result.foodName,
      calories: result.calories,
      protein: result.protein,
      fat: result.fat,
      carbs: result.carbs,
      advice: result.advice,
    };
  } catch (error) {
    console.error("Error analyzing food:", error);
    throw error;
  }
};

export const generateDailyEncouragement = async (
  profile: UserProfile, 
  currentCalories: number, 
  targetCalories: number
): Promise<string> => {
  try {
    const prompt = `
      You are a friendly, supportive fitness coach.
      User: ${profile.name}
      Goal: ${profile.goal}
      Today's Status: Consumed ${currentCalories}kcal out of ${targetCalories}kcal target.
      
      Provide a VERY SHORT (max 60 characters), warm, encouraging message for the user's dashboard.
      If they are doing well, praise them. If they are over, gently encourage balance. If under, tell them to fuel up.
      IMPORTANT: Do NOT use emojis. Use text only.
      Language: Japanese.
      Example: "いい調子ですね！このまま目標に向かって進みましょう"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || "今日も良い一日を！自分のペースで頑張りましょう。";
  } catch (error) {
    console.error("Error generating encouragement:", error);
    return "今日も健康的な一日を過ごしましょう！";
  }
};

/**
 * Stream chat messages for faster perceived latency
 */
export const streamChatMessage = async function* (
  history: ChatMessage[], 
  profile: UserProfile,
  additionalContext: string = ""
) {
  try {
    // Extract the latest user message
    const lastMsg = history[history.length - 1];
    if (!lastMsg || lastMsg.role !== 'user') {
      throw new Error("Invalid history state: Last message must be user");
    }
    
    const currentMessage = lastMsg.text;
    // Previous history for context
    const previousMessages = history.slice(0, -1);

    const context = `
      You are an expert fitness and nutrition coach named "BalanceAI".
      User Profile:
      - Name: ${profile.name}
      - Goal: ${profile.goal}
      - Current Weight: ${profile.weight}kg, Target: ${profile.targetWeight}kg
      - Recommended Calories: ${profile.recommendedCalories || 'Not set yet'}
      - Gym Access: ${profile.hasGymAccess ? 'Yes' : 'No'}
      
      ${additionalContext ? `CURRENT CONTEXT (The user is looking at this right now): ${additionalContext}` : ''}
      
      Answer the user's questions, provide motivation, or suggest modifications to their plan.
      Keep answers concise (under 200 characters if possible) and encouraging.
      IMPORTANT: Do NOT use emojis. The application provides its own UI icons.
      Language: Japanese.
    `;

    // Map internal chat format to Gemini SDK format
    const sdkHistory = previousMessages
      .filter(m => m.id !== 'init') // Skip local welcome message if not needed for context
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: context,
      },
      history: sdkHistory
    });

    const result = await chat.sendMessageStream({ message: currentMessage });
    
    for await (const chunk of result) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Chat stream error:", error);
    yield "エラーが発生しました。接続を確認してもう一度お試しください。";
  }
};
