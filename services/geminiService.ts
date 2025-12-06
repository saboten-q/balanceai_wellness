import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserProfile, WorkoutPlan, DietLog } from "../types";

// Expo環境変数の取得
const getApiKey = () => {
  // 開発時は直接APIキーを設定（本番では環境変数から取得）
  return "YOUR_GEMINI_API_KEY_HERE"; // ここにAPIキーを設定してください
};

const genAI = new GoogleGenerativeAI(getApiKey());

// --- ワークアウトプラン生成 ---
export const generateWorkoutPlan = async (profile: UserProfile): Promise<WorkoutPlan> => {
  try {
    const gymContext = profile.hasGymAccess 
      ? "ジムでマシンやダンベルを使えます" 
      : "自宅で自重トレーニング中心です";

    const prompt = `
あなたはプロのフィットネストレーナーです。以下のユーザーに最適な週間ワークアウトプランを作成してください。

【ユーザー情報】
- 年齢: ${profile.age}歳
- 性別: ${profile.gender}
- 身長: ${profile.height}cm
- 現在の体重: ${profile.weight}kg
- 目標体重: ${profile.targetWeight}kg
- 目標: ${profile.goal}
- 活動レベル: ${profile.activityLevel}
- 環境: ${gymContext}

【指示】
1. 1日の推奨カロリー摂取量を計算
2. 週7日分のトレーニングプランを作成
3. 以下のJSON形式で返してください：

{
  "summary": "プラン全体の説明（100文字程度）",
  "recommendedCalories": 2000,
  "schedule": [
    {
      "day": "月曜日",
      "focus": "上半身",
      "exercises": [
        {
          "name": "腕立て伏せ",
          "type": "Strength",
          "duration": "10分",
          "description": "胸と腕を鍛える基本種目"
        }
      ]
    }
  ]
}

【重要】
- 絵文字は使わない
- 安全で実現可能なメニューを
- 初心者でも続けられる内容に
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // JSONを抽出（マークダウンのコードブロックを削除）
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format");
    }
    
    const plan = JSON.parse(jsonMatch[0]) as WorkoutPlan;
    
    // エクササイズにIDを追加
    plan.schedule.forEach(day => {
      day.exercises.forEach((ex: any) => {
        ex.id = `${Date.now()}-${Math.random()}`;
        ex.isCompleted = false;
      });
    });
    
    return plan;
  } catch (error: any) {
    console.error("Workout generation error:", error);
    throw new Error("ワークアウトプランの生成に失敗しました");
  }
};

// --- 食事分析 ---
export const analyzeFoodImage = async (
  base64Image: string | null, 
  textDescription: string
): Promise<DietLog['macros'] & { foodName: string, advice: string }> => {
  try {
    const prompt = `
食品「${textDescription}」の栄養成分を分析してJSON形式で返してください。

{
  "foodName": "料理名",
  "calories": カロリー(kcal),
  "protein": タンパク質(g),
  "fat": 脂質(g),
  "carbs": 炭水化物(g),
  "advice": "一言アドバイス（30文字以内）"
}

絵文字は使わないでください。
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format");
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error: any) {
    console.error("Food analysis error:", error);
    throw new Error("食事分析に失敗しました");
  }
};

// --- デイリーメッセージ生成 ---
export const generateDailyEncouragement = async (
  profile: UserProfile, 
  currentCalories: number, 
  targetCalories: number
): Promise<string> => {
  try {
    const prompt = `
あなたはフィットネスコーチです。
ユーザー: ${profile.name}さん
目標: ${profile.goal}
今日のカロリー: ${currentCalories}kcal / ${targetCalories}kcal

60文字以内で励ましのメッセージを。絵文字は使わない。日本語で。
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Daily message error:", error);
    return "今日も健康的な一日を過ごしましょう！";
  }
};
