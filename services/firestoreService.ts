// Firestoreサービス（AsyncStorage版）
// Firebase Firestoreは必要に応じて後で追加

import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, WorkoutPlan, DietLog, WeightLog } from '../types';

class FirestoreService {
  // ユーザープロフィールを保存
  async saveUserProfile(userId: string, profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem('profile', JSON.stringify(profile));
    } catch (error) {
      console.error('Save profile error:', error);
      throw new Error('プロフィールの保存に失敗しました');
    }
  }

  // ユーザープロフィールを取得
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const profileJson = await AsyncStorage.getItem('profile');
      return profileJson ? JSON.parse(profileJson) : null;
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  }

  // ワークアウトプランを保存
  async saveWorkoutPlan(userId: string, plan: WorkoutPlan): Promise<void> {
    try {
      await AsyncStorage.setItem('workoutPlan', JSON.stringify(plan));
    } catch (error) {
      console.error('Save workout plan error:', error);
      throw new Error('ワークアウトプランの保存に失敗しました');
    }
  }

  // ワークアウトプランを取得
  async getWorkoutPlan(userId: string): Promise<WorkoutPlan | null> {
    try {
      const planJson = await AsyncStorage.getItem('workoutPlan');
      return planJson ? JSON.parse(planJson) : null;
    } catch (error) {
      console.error('Get workout plan error:', error);
      return null;
    }
  }

  // 食事ログを保存
  async saveDietLog(userId: string, log: DietLog): Promise<void> {
    try {
      const logsJson = await AsyncStorage.getItem('dietLogs');
      const logs: DietLog[] = logsJson ? JSON.parse(logsJson) : [];
      logs.push(log);
      await AsyncStorage.setItem('dietLogs', JSON.stringify(logs));
    } catch (error) {
      console.error('Save diet log error:', error);
      throw new Error('食事ログの保存に失敗しました');
    }
  }

  // 食事ログを取得
  async getDietLogs(userId: string): Promise<DietLog[]> {
    try {
      const logsJson = await AsyncStorage.getItem('dietLogs');
      return logsJson ? JSON.parse(logsJson) : [];
    } catch (error) {
      console.error('Get diet logs error:', error);
      return [];
    }
  }

  // 体重ログを保存
  async saveWeightLog(userId: string, log: WeightLog): Promise<void> {
    try {
      const logsJson = await AsyncStorage.getItem('weightLogs');
      const logs: WeightLog[] = logsJson ? JSON.parse(logsJson) : [];
      logs.push(log);
      await AsyncStorage.setItem('weightLogs', JSON.stringify(logs));
    } catch (error) {
      console.error('Save weight log error:', error);
      throw new Error('体重ログの保存に失敗しました');
    }
  }

  // 体重ログを取得
  async getWeightLogs(userId: string): Promise<WeightLog[]> {
    try {
      const logsJson = await AsyncStorage.getItem('weightLogs');
      return logsJson ? JSON.parse(logsJson) : [];
    } catch (error) {
      console.error('Get weight logs error:', error);
      return [];
    }
  }

  // すべてのデータを削除
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        'profile',
        'workoutPlan',
        'dietLogs',
        'weightLogs',
        'authUser',
      ]);
    } catch (error) {
      console.error('Clear data error:', error);
      throw new Error('データの削除に失敗しました');
    }
  }
}

export const firestoreService = new FirestoreService();
