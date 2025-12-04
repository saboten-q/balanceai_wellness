import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, googleProvider } from './firebaseConfig';

export const authService = {
  // メール/パスワードで登録
  async registerWithEmail(email: string, password: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth!, email, password);
      return userCredential.user;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  },

  // メール/パスワードでログイン
  async loginWithEmail(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth!, email, password);
      return userCredential.user;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  },

  // Googleログイン
  async loginWithGoogle(): Promise<User> {
    try {
      const result = await signInWithPopup(auth!, googleProvider!);
      return result.user;
    } catch (error: any) {
      console.error('Google login error:', error);
      throw new Error('Googleログインに失敗しました');
    }
  },

  // ログアウト
  async logout(): Promise<void> {
    try {
      await signOut(auth!);
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('ログアウトに失敗しました');
    }
  },

  // パスワードリセットメール送信
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth!, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  },

  // 認証状態の監視
  onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth!, callback);
  },

  // 現在のユーザーを取得
  getCurrentUser(): User | null {
    return auth?.currentUser || null;
  },
};

// エラーメッセージの日本語化
function getAuthErrorMessage(errorCode: string): string {
  const errorMessages: { [key: string]: string } = {
    'auth/email-already-in-use': 'このメールアドレスは既に使用されています',
    'auth/invalid-email': 'メールアドレスの形式が正しくありません',
    'auth/operation-not-allowed': 'この操作は許可されていません',
    'auth/weak-password': 'パスワードは6文字以上で設定してください',
    'auth/user-disabled': 'このアカウントは無効化されています',
    'auth/user-not-found': 'ユーザーが見つかりません',
    'auth/wrong-password': 'パスワードが正しくありません',
    'auth/too-many-requests': '試行回数が多すぎます。しばらく待ってからお試しください',
    'auth/network-request-failed': 'ネットワークエラーが発生しました',
  };

  return errorMessages[errorCode] || '認証エラーが発生しました';
}

