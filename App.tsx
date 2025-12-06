import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Button, Card, Input, Select } from './components/UIComponents';
import { UserProfile, Gender, AppView } from './types';

// Web用のフォールバックコンポーネント
const GradientView = ({ colors, start, end, style, children }: any) => {
  if (Platform.OS === 'web') {
    // Web用のCSSグラデーションを使用
    const gradientString = `linear-gradient(135deg, ${colors.join(', ')})`;
    const webStyle = {
      ...style,
      // @ts-ignore - Web用のCSSプロパティ
      backgroundImage: gradientString,
      backgroundColor: colors[0], // フォールバック用の背景色
    };
    return <View style={webStyle}>{children}</View>;
  }
  return (
    <LinearGradient colors={colors} start={start} end={end} style={style}>
      {children}
    </LinearGradient>
  );
};

// Constants (COLORS)を設定
const COLORS = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
  },
  surface: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    900: '#0f172a',
  },
  white: '#ffffff',
  green: '#22c55e',
};

// --- Auth Screen ---
const AuthScreen = ({ onNavigate, onLoginSuccess }: { 
  onNavigate: (view: AppView) => void; 
  onLoginSuccess: () => void;
}) => {
  const [mode, setMode] = useState<'landing' | 'login' | 'register'>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Mock login - LocalStorageチェック
      const saved = await AsyncStorage.getItem('profile');
      if (saved) {
        onLoginSuccess();
      } else {
        setError('アカウントが見つかりません。まずは登録してください。');
      }
    } catch (err: any) {
      setError(err.message || 'ログインに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailRegister = async () => {
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上で設定してください');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 登録後はオンボーディングへ
      onNavigate(AppView.Onboarding);
    } catch (err: any) {
      setError(err.message || '登録に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <GradientView
        colors={[COLORS.primary[600], COLORS.primary[400], COLORS.primary[500]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.authSafeArea}>
        <ScrollView contentContainerStyle={styles.authContent}>
          <Animated.View 
            style={[
              styles.authHeader,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.logoContainer}>
              <Icon name="heart-pulse" size={48} color={COLORS.white} />
            </View>
            <Text style={styles.appTitle}>BalanceAI</Text>
            <Text style={styles.appSubtitle}>
              あなただけの専属AIトレーナー。{'\n'}
              理想の身体と健康を、{'\n'}
              これひとつで。
            </Text>
          </Animated.View>

        {mode === 'landing' && (
          <View style={styles.authButtons}>
            <Button onPress={() => setMode('login')} style={styles.authButton}>
              <Icon name="login" size={20} color={COLORS.white} />
              <Text style={styles.authButtonText}>ログイン</Text>
            </Button>
            <Button 
              onPress={() => setMode('register')} 
              variant="secondary"
              style={styles.authButton}
            >
              <Icon name="account-plus" size={20} color={COLORS.surface[900]} />
              <Text style={styles.authButtonTextSecondary}>会員登録</Text>
            </Button>
            <TouchableOpacity onPress={() => onNavigate(AppView.Onboarding)}>
              <Text style={styles.skipText}>登録せずに利用する</Text>
            </TouchableOpacity>
          </View>
        )}

        {(mode === 'login' || mode === 'register') && (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <Card style={styles.authCard}>
            <Text style={styles.authCardTitle}>
              {mode === 'login' ? 'おかえりなさい' : 'アカウント作成'}
            </Text>

            {error ? (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={16} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Input
              label="メールアドレス"
              placeholder="hello@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <Input
              label="パスワード"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Button
              onPress={mode === 'login' ? handleEmailLogin : handleEmailRegister}
              isLoading={isLoading}
              disabled={isLoading}
              style={{ marginTop: 16 }}
            >
              <Icon name="email" size={18} color={COLORS.white} />
              <Text style={styles.authButtonText}>
                {mode === 'login' ? 'メールでログイン' : 'メールで登録'}
              </Text>
            </Button>

            <TouchableOpacity
              onPress={() => {
                setMode('landing');
                setError('');
              }}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>キャンセル</Text>
            </TouchableOpacity>
          </Card>
          </Animated.View>
        )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

// --- Onboarding Screen ---
const Onboarding = ({ onComplete }: { onComplete: (profile: UserProfile) => void }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    gender: Gender.Other,
    activityLevel: 'Moderate',
    hasGymAccess: false,
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsGenerating(true);
    // 簡単なバリデーション
    if (!profile.name || !profile.age || !profile.height || !profile.weight || !profile.targetWeight) {
      Alert.alert('エラー', '全ての項目を入力してください');
      setIsGenerating(false);
      return;
    }
    onComplete(profile as UserProfile);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.onboardingContent}>
        <View style={styles.onboardingHeader}>
          <Text style={styles.stepBadge}>STEP {step}/3</Text>
          <Text style={styles.onboardingTitle}>理想の自分へ</Text>
          <Text style={styles.onboardingSubtitle}>
            あなたの目標に合わせて{'\n'}AIがプランをパーソナライズします。
          </Text>
        </View>

        <Card>
          {step === 1 && (
            <View>
              <Input
                label="お名前 (ニックネーム)"
                placeholder="例: 田中 太郎"
                value={profile.name || ''}
                onChangeText={(text) => setProfile({ ...profile, name: text })}
              />
              <Select
                label="性別"
                value={profile.gender}
                onValueChange={(value) => setProfile({ ...profile, gender: value as Gender })}
                options={[
                  { label: '男性', value: Gender.Male },
                  { label: '女性', value: Gender.Female },
                  { label: 'その他', value: Gender.Other },
                ]}
              />
              <Input
                label="年齢"
                placeholder="例: 25"
                value={profile.age?.toString() || ''}
                onChangeText={(text) => setProfile({ ...profile, age: parseInt(text) || 0 })}
                keyboardType="numeric"
              />
            </View>
          )}

          {step === 2 && (
            <View>
              <Input
                label="身長 (cm)"
                placeholder="例: 170"
                value={profile.height?.toString() || ''}
                onChangeText={(text) => setProfile({ ...profile, height: parseInt(text) || 0 })}
                keyboardType="numeric"
              />
              <Input
                label="現在の体重 (kg)"
                placeholder="例: 70"
                value={profile.weight?.toString() || ''}
                onChangeText={(text) => setProfile({ ...profile, weight: parseFloat(text) || 0 })}
                keyboardType="numeric"
              />
              <Input
                label="目標体重 (kg)"
                placeholder="例: 65"
                value={profile.targetWeight?.toString() || ''}
                onChangeText={(text) => setProfile({ ...profile, targetWeight: parseFloat(text) || 0 })}
                keyboardType="numeric"
              />
              <Select
                label="トレーニング環境"
                value={profile.hasGymAccess ? 'yes' : 'no'}
                onValueChange={(value) => setProfile({ ...profile, hasGymAccess: value === 'yes' })}
                options={[
                  { label: '自宅 (器具なし・ダンベル程度)', value: 'no' },
                  { label: 'ジムに通っている (マシン等あり)', value: 'yes' },
                ]}
              />
              <Select
                label="普段の運動レベル"
                value={profile.activityLevel}
                onValueChange={(value) => setProfile({ ...profile, activityLevel: value as any })}
                options={[
                  { label: '低い (デスクワーク中心)', value: 'Low' },
                  { label: '普通 (週1-2回の運動)', value: 'Moderate' },
                  { label: '高い (週3回以上の運動)', value: 'High' },
                ]}
              />
            </View>
          )}

          {step === 3 && (
            <View>
              <Input
                label="具体的な目標は？"
                placeholder="例：夏までに腹筋を割りたい、マラソンを完走できる体力をつけたい..."
                value={profile.goal || ''}
                onChangeText={(text) => setProfile({ ...profile, goal: text })}
                multiline
                numberOfLines={4}
              />
            </View>
          )}
        </Card>

        <View style={styles.onboardingButtons}>
          {step > 1 && (
            <Button
              variant="ghost"
              onPress={() => setStep(step - 1)}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>戻る</Text>
            </Button>
          )}
          <Button
            onPress={handleNext}
            isLoading={isGenerating}
            style={styles.nextButton}
          >
            <Text style={styles.authButtonText}>
              {step === 3 ? '始める' : '次へ'}
            </Text>
            <Icon name="arrow-right" size={18} color={COLORS.white} />
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Dashboard Screen ---
const Dashboard = ({ 
  profile, 
  onNavigate 
}: { 
  profile: UserProfile;
  onNavigate: (view: AppView) => void;
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.dashboardContent}>
        <View style={styles.dashboardHeader}>
          <View>
            <Text style={styles.dashboardGreeting}>Hi, {profile.name}</Text>
            <View style={styles.targetContainer}>
              <Icon name="target" size={16} color={COLORS.primary[500]} />
              <Text style={styles.targetText}>
                目標まであと {Math.abs(profile.weight - profile.targetWeight!).toFixed(1)}kg
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => onNavigate(AppView.Settings)}
            style={styles.profileButton}
          >
            <Icon name="account" size={24} color={COLORS.primary[600]} />
          </TouchableOpacity>
        </View>

        <Card style={styles.dailyMessageCard}>
          <View style={styles.dailyMessageIcon}>
            <Icon name="star-four-points" size={20} color={COLORS.primary[500]} />
          </View>
          <View style={styles.dailyMessageContent}>
            <Text style={styles.dailyMessageLabel}>DAILY MESSAGE</Text>
            <Text style={styles.dailyMessageText}>
              今日も一日頑張りましょう！継続は力なりです。
            </Text>
          </View>
        </Card>

        <Card onPress={() => onNavigate(AppView.Workout)} style={styles.workoutCard}>
          <View style={styles.cardContent}>
            <View style={styles.cardIconSmall}>
              <Icon name="dumbbell" size={18} color={COLORS.surface[500]} />
            </View>
            <Text style={styles.cardLabelSmall}>Workout</Text>
          </View>
          <Text style={styles.workoutFocus}>今日のトレーニング</Text>
          <Text style={styles.workoutSubtext}>タップして詳細を見る</Text>
          <View style={styles.workoutAction}>
            <Text style={styles.workoutActionText}>詳細を見る</Text>
            <Icon name="arrow-right" size={16} color={COLORS.primary[600]} />
          </View>
        </Card>

        <Card onPress={() => onNavigate(AppView.Diet)} style={styles.dietCard}>
          <GradientView
            colors={[COLORS.primary[50], COLORS.primary[100]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.dietCardGradient}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardIconLarge}>
                <Icon name="food-apple" size={32} color={COLORS.primary[600]} />
              </View>
              <View style={styles.dietCardContent}>
                <Text style={styles.cardLabelSmall}>Nutrition</Text>
                <Text style={styles.dietCalories}>食事を記録しましょう</Text>
                <Text style={styles.dietSubtext}>今日のカロリー: 0 kcal</Text>
              </View>
            </View>
            <View style={styles.workoutAction}>
              <Text style={styles.workoutActionText}>記録する</Text>
              <Icon name="plus" size={16} color={COLORS.primary[600]} />
            </View>
          </GradientView>
        </Card>

        <View style={styles.gridRow}>
          <Card onPress={() => onNavigate(AppView.Progress)} style={styles.weightCard}>
            <View style={styles.cardContent}>
              <View style={styles.cardIconSmall}>
                <Icon name="scale-bathroom" size={18} color={COLORS.surface[500]} />
              </View>
              <Text style={styles.cardLabelSmall}>Weight</Text>
            </View>
            <Text style={styles.weightValue}>{profile.weight}kg</Text>
            <Text style={styles.weightTarget}>目標: {profile.targetWeight}kg</Text>
          </Card>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {[
          { icon: 'view-dashboard', label: 'ホーム', view: AppView.Dashboard },
          { icon: 'run', label: '運動', view: AppView.Workout },
          { icon: 'food-apple', label: '食事', view: AppView.Diet },
          { icon: 'chart-line', label: '分析', view: AppView.Progress },
        ].map((item) => (
          <TouchableOpacity
            key={item.label}
            onPress={() => onNavigate(item.view)}
            style={styles.navItem}
          >
            <Icon name={item.icon as any} size={24} color={COLORS.surface[400]} />
            <Text style={styles.navLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

// --- Placeholder Screens ---
const PlaceholderScreen = ({ title }: { title: string }) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.placeholderContainer}>
      <Icon name={"construction" as any} size={64} color={COLORS.surface[300]} />
      <Text style={styles.placeholderTitle}>{title}</Text>
      <Text style={styles.placeholderText}>この画面は現在開発中です</Text>
    </View>
  </SafeAreaView>
);

// --- Main App ---
const App = () => {
  const [view, setView] = useState<AppView>(AppView.Auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // エラーハンドリングを追加
    const initApp = async () => {
      try {
        console.log('App initializing...');
        await loadProfile();
        console.log('App initialized successfully');
      } catch (err: any) {
        console.error('App initialization error:', err);
        setError(err.message || 'アプリの初期化に失敗しました');
        setIsLoading(false);
      }
    };
    initApp();
  }, []);

  const loadProfile = async () => {
    try {
      console.log('Loading profile...');
      const savedProfile = await AsyncStorage.getItem('profile');
      console.log('Profile loaded:', savedProfile ? 'found' : 'not found');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
        setView(AppView.Dashboard);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      console.log('Setting isLoading to false');
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = async (p: UserProfile) => {
    setProfile(p);
    await AsyncStorage.setItem('profile', JSON.stringify(p));
    setView(AppView.Dashboard);
  };

  const handleLoginSuccess = async () => {
    const savedProfile = await AsyncStorage.getItem('profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
      setView(AppView.Dashboard);
    }
  };

  useEffect(() => {
    console.log('App state changed - isLoading:', isLoading, 'error:', error, 'view:', view);
  }, [isLoading, error, view]);

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: '#ef4444', marginBottom: 16, fontSize: 18 }}>エラー: {error}</Text>
        <Text style={{ color: COLORS.surface[600] }}>ブラウザのコンソールを確認してください</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: COLORS.surface[900], marginBottom: 16 }}>読み込み中...</Text>
        <ActivityIndicator size="large" color={COLORS.primary[600]} />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface[50]} />
      
      {view === AppView.Auth && (
        <AuthScreen onNavigate={setView} onLoginSuccess={handleLoginSuccess} />
      )}

      {view === AppView.Onboarding && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}

      {profile && view === AppView.Dashboard && (
        <Dashboard profile={profile} onNavigate={setView} />
      )}

      {profile && view === AppView.Workout && (
        <PlaceholderScreen title="ワークアウト画面" />
      )}

      {profile && view === AppView.Diet && (
        <PlaceholderScreen title="食事記録画面" />
      )}

      {profile && view === AppView.Progress && (
        <PlaceholderScreen title="進捗分析画面" />
      )}

      {profile && view === AppView.Settings && (
        <PlaceholderScreen title="設定画面" />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface[50],
  },

  // Auth Screen
  authSafeArea: {
    flex: 1,
  },
  authContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  authHeader: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 32,
    backgroundColor: COLORS.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary[500],
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  appTitle: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appSubtitle: {
    fontSize: 16,
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.95,
  },
  authButtons: {
    gap: 16,
  },
  authButton: {
    flexDirection: 'row',
    gap: 8,
  },
  authButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  authButtonTextSecondary: {
    color: COLORS.surface[900],
    fontSize: 16,
    fontWeight: '600',
  },
  skipText: {
    textAlign: 'center',
    color: COLORS.surface[500],
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
    marginTop: 16,
  },
  authCard: {
    marginTop: 24,
  },
  authCardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.surface[900],
    textAlign: 'center',
    marginBottom: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  cancelButton: {
    marginTop: 16,
    padding: 8,
  },
  cancelText: {
    textAlign: 'center',
    color: COLORS.surface[400],
    fontSize: 14,
    fontWeight: '600',
  },

  // Onboarding
  onboardingContent: {
    flexGrow: 1,
    padding: 24,
  },
  onboardingHeader: {
    marginBottom: 32,
  },
  stepBadge: {
    backgroundColor: COLORS.primary[100],
    color: COLORS.primary[700],
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  onboardingTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.surface[900],
    marginBottom: 8,
  },
  onboardingSubtitle: {
    fontSize: 16,
    color: COLORS.surface[500],
    lineHeight: 24,
  },
  onboardingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
    flexDirection: 'row',
    gap: 8,
  },
  backButtonText: {
    color: COLORS.surface[400],
    fontSize: 16,
    fontWeight: '600',
  },

  // Dashboard
  dashboardContent: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 100,
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  dashboardGreeting: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.surface[900],
    marginBottom: 4,
  },
  targetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  targetText: {
    fontSize: 14,
    color: COLORS.surface[500],
    fontWeight: '500',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  dailyMessageCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary[50],
    borderColor: COLORS.primary[100],
    borderWidth: 1,
    alignItems: 'flex-start',
    gap: 12,
  },
  dailyMessageIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dailyMessageContent: {
    flex: 1,
  },
  dailyMessageLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary[600],
    marginBottom: 4,
    letterSpacing: 1,
  },
  dailyMessageText: {
    fontSize: 14,
    color: COLORS.surface[900],
    lineHeight: 20,
  },
  workoutCard: {
    backgroundColor: COLORS.white,
  },
  dietCard: {
    backgroundColor: COLORS.white,
    padding: 0,
    overflow: 'hidden',
  },
  dietCardGradient: {
    padding: 20,
  },
  cardIconLarge: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dietCardContent: {
    flex: 1,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  cardIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.surface[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLabelSmall: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.surface[500],
    letterSpacing: 1,
  },
  workoutFocus: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.surface[900],
    marginBottom: 4,
  },
  workoutSubtext: {
    fontSize: 14,
    color: COLORS.surface[500],
    marginBottom: 12,
  },
  workoutAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  workoutActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary[600],
  },
  dietCalories: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.surface[900],
    marginTop: 8,
    marginBottom: 4,
  },
  dietSubtext: {
    fontSize: 14,
    color: COLORS.surface[500],
  },
  gridRow: {
    flexDirection: 'row',
    gap: 16,
  },
  weightCard: {
    flex: 1,
  },
  weightValue: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.surface[900],
    marginTop: 8,
    marginBottom: 4,
  },
  weightTarget: {
    fontSize: 14,
    color: COLORS.surface[500],
  },

  // Bottom Navigation
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.surface[200],
    paddingVertical: 12,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.surface[400],
  },

  // Placeholder
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.surface[900],
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: COLORS.surface[500],
    textAlign: 'center',
  },
});

export default App;
