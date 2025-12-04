import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { UserProfile, WorkoutPlan, DietLog, WeightLog } from '../types';

export const firestoreService = {
  // ユーザープロフィール
  async saveUserProfile(userId: string, profile: UserProfile): Promise<void> {
    try {
      await setDoc(doc(db!, 'users', userId), {
        profile,
        updatedAt: Timestamp.now(),
      }, { merge: true });
    } catch (error) {
      console.error('Error saving profile:', error);
      throw new Error('プロフィールの保存に失敗しました');
    }
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db!, 'users', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data().profile as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  },

  // ワークアウトプラン
  async saveWorkoutPlan(userId: string, plan: WorkoutPlan): Promise<void> {
    try {
      await setDoc(doc(db!, 'users', userId), {
        workoutPlan: plan,
        updatedAt: Timestamp.now(),
      }, { merge: true });
    } catch (error) {
      console.error('Error saving workout plan:', error);
      throw new Error('ワークアウトプランの保存に失敗しました');
    }
  },

  async getWorkoutPlan(userId: string): Promise<WorkoutPlan | null> {
    try {
      const docRef = doc(db!, 'users', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data().workoutPlan as WorkoutPlan;
      }
      return null;
    } catch (error) {
      console.error('Error getting workout plan:', error);
      return null;
    }
  },

  // 食事ログ
  async addDietLog(userId: string, log: DietLog): Promise<string> {
    try {
      const dietLogsRef = collection(db!, 'users', userId, 'dietLogs');
      const docRef = await addDoc(dietLogsRef, {
        ...log,
        timestamp: Timestamp.fromDate(new Date(log.timestamp)),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding diet log:', error);
      throw new Error('食事ログの追加に失敗しました');
    }
  },

  async getDietLogs(userId: string, limit = 100): Promise<DietLog[]> {
    try {
      const dietLogsRef = collection(db!, 'users', userId, 'dietLogs');
      const q = query(dietLogsRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      } as DietLog));
    } catch (error) {
      console.error('Error getting diet logs:', error);
      return [];
    }
  },

  async deleteDietLog(userId: string, logId: string): Promise<void> {
    try {
      await deleteDoc(doc(db!, 'users', userId, 'dietLogs', logId));
    } catch (error) {
      console.error('Error deleting diet log:', error);
      throw new Error('食事ログの削除に失敗しました');
    }
  },

  // 体重ログ
  async addWeightLog(userId: string, log: WeightLog): Promise<string> {
    try {
      const weightLogsRef = collection(db!, 'users', userId, 'weightLogs');
      const docRef = await addDoc(weightLogsRef, log);
      return docRef.id;
    } catch (error) {
      console.error('Error adding weight log:', error);
      throw new Error('体重ログの追加に失敗しました');
    }
  },

  async getWeightLogs(userId: string): Promise<WeightLog[]> {
    try {
      const weightLogsRef = collection(db!, 'users', userId, 'weightLogs');
      const q = query(weightLogsRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as WeightLog));
    } catch (error) {
      console.error('Error getting weight logs:', error);
      return [];
    }
  },

  // ローカルストレージからFirestoreへの移行
  async migrateFromLocalStorage(userId: string): Promise<void> {
    try {
      // プロフィール
      const profileStr = localStorage.getItem('profile');
      if (profileStr) {
        const profile = JSON.parse(profileStr) as UserProfile;
        await this.saveUserProfile(userId, profile);
      }

      // ワークアウトプラン
      const planStr = localStorage.getItem('workoutPlan');
      if (planStr) {
        const plan = JSON.parse(planStr) as WorkoutPlan;
        await this.saveWorkoutPlan(userId, plan);
      }

      // 食事ログ
      const dietLogsStr = localStorage.getItem('dietLogs');
      if (dietLogsStr) {
        const dietLogs = JSON.parse(dietLogsStr) as DietLog[];
        for (const log of dietLogs) {
          await this.addDietLog(userId, {
            ...log,
            timestamp: new Date(log.timestamp),
          });
        }
      }

      // 体重ログ
      const weightLogsStr = localStorage.getItem('weightLogs');
      if (weightLogsStr) {
        const weightLogs = JSON.parse(weightLogsStr) as WeightLog[];
        for (const log of weightLogs) {
          await this.addWeightLog(userId, log);
        }
      }

      console.log('Local storage migration completed');
    } catch (error) {
      console.error('Error migrating from local storage:', error);
      throw new Error('データの移行に失敗しました');
    }
  },
};

