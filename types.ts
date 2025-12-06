
export enum Gender {
  Male = '男性',
  Female = '女性',
  Other = 'その他',
}

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  height: number; // cm
  weight: number; // kg
  targetWeight: number; // kg
  hasGymAccess: boolean;
  goal: string;
  activityLevel: 'Low' | 'Moderate' | 'High';
  recommendedCalories?: number; // Calculated by AI
}

export interface Exercise {
  id: string; // Added for unique identification
  name: string;
  type: 'Strength' | 'Cardio' | 'Flexibility';
  duration: string;
  description: string;
  isCompleted?: boolean; // New: Tracking status
  isFavorite?: boolean; // お気に入り
  videoUrl?: string; // YouTube URL
}

// セット記録
export interface ExerciseSet {
  setNumber: number;
  weight: number; // kg
  reps: number; // 回数
  completedAt: Date;
}

// エクササイズ実施記録
export interface ExerciseRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  date: string; // YYYY-MM-DD
  sets: ExerciseSet[];
  notes?: string;
}

// コンディション記録
export interface ConditionLog {
  id: string;
  date: string; // YYYY-MM-DD
  fatigueLevel: number; // 1-5 (1: 元気, 5: 疲労困憊)
  muscleSoreness: number; // 1-5 (1: なし, 5: ひどい)
  sleepQuality: number; // 1-5 (1: 悪い, 5: 良い)
  motivation: number; // 1-5 (1: 低い, 5: 高い)
}

export interface DailyWorkout {
  day: string;
  focus: string;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  summary: string;
  schedule: DailyWorkout[];
  recommendedCalories: number; // New: AI calculated target
}

export interface MacroNutrients {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface DietLog {
  id: string;
  timestamp: Date; // Stored as string in JSON, parsed back to Date
  foodName: string;
  macros: MacroNutrients;
  advice: string;
  imageUrl?: string;
}

export interface WeightLog {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export enum AppView {
  Auth = 'AUTH', // New view for authentication
  Onboarding = 'ONBOARDING',
  Dashboard = 'DASHBOARD',
  Workout = 'WORKOUT',
  Diet = 'DIET',
  Progress = 'PROGRESS',
  Settings = 'SETTINGS',
}