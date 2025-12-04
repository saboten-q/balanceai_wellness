import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { authService } from '../services/authService';

// Firebase認証が利用可能かチェック
const isFirebaseEnabled = () => {
  return !!import.meta.env.VITE_FIREBASE_API_KEY;
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseEnabled()) {
      setLoading(false);
      return;
    }

    // Firebase認証状態の監視
    const unsubscribe = authService.onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    if (!isFirebaseEnabled()) {
      // Mock login
      const saved = localStorage.getItem('profile');
      if (saved) {
        return { success: true };
      } else {
        throw new Error('アカウントが見つかりません。まずは登録してください。');
      }
    }

    try {
      await authService.loginWithEmail(email, password);
      return { success: true };
    } catch (error: any) {
      throw error;
    }
  };

  const registerWithEmail = async (email: string, password: string) => {
    if (!isFirebaseEnabled()) {
      // Mock registration - just proceed to onboarding
      return { success: true, needsOnboarding: true };
    }

    try {
      await authService.registerWithEmail(email, password);
      return { success: true, needsOnboarding: true };
    } catch (error: any) {
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    if (!isFirebaseEnabled()) {
      throw new Error('Firebase設定が必要です');
    }

    try {
      await authService.loginWithGoogle();
      return { success: true };
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    if (!isFirebaseEnabled()) {
      // Clear local storage
      localStorage.clear();
      window.location.reload();
      return;
    }

    try {
      await authService.logout();
    } catch (error: any) {
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    if (!isFirebaseEnabled()) {
      // Mock - just return success
      return { success: true };
    }

    try {
      await authService.resetPassword(email);
      return { success: true };
    } catch (error: any) {
      throw error;
    }
  };

  return {
    user,
    loading,
    isAuthenticated: !!user || !isFirebaseEnabled(),
    isFirebaseEnabled: isFirebaseEnabled(),
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout,
    resetPassword,
  };
};

