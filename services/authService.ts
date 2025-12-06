// 認証サービス（AsyncStorage版）
// Firebase認証は必要に応じて後で追加

import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
}

class AuthService {
  // メールとパスワードでログイン（モック実装）
  async loginWithEmail(email: string, password: string): Promise<AuthUser> {
    try {
      // AsyncStorageから保存されたユーザー情報を取得
      const savedProfile = await AsyncStorage.getItem('profile');
      
      if (!savedProfile) {
        throw new Error('アカウントが見つかりません。まずは登録してください。');
      }
      
      // ログイン成功をシミュレート
      const user: AuthUser = {
        uid: 'local-user',
        email: email,
      };
      
      await AsyncStorage.setItem('authUser', JSON.stringify(user));
      return user;
    } catch (error: any) {
      throw error;
    }
  }

  // メールとパスワードで登録（モック実装）
  async registerWithEmail(email: string, password: string): Promise<AuthUser> {
    try {
      if (password.length < 6) {
        throw new Error('パスワードは6文字以上で設定してください');
      }
      
      const user: AuthUser = {
        uid: 'local-user',
        email: email,
      };
      
      await AsyncStorage.setItem('authUser', JSON.stringify(user));
      return user;
    } catch (error: any) {
      throw error;
    }
  }

  // 現在のユーザーを取得
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const userJson = await AsyncStorage.getItem('authUser');
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      return null;
    }
  }

  // ログアウト
  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem('authUser');
      // プロフィールデータも削除する場合はコメントを外す
      // await AsyncStorage.clear();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // パスワードリセット（モック実装）
  async resetPassword(email: string): Promise<void> {
    // 実際のFirebase実装では、ここでパスワードリセットメールを送信
    console.log('Password reset requested for:', email);
    // モック実装では何もしない
  }
}

export const authService = new AuthService();
