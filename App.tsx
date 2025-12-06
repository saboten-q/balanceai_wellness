import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  KeyboardAvoidingView,
  Linking,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Button, Card, Input, Select } from './components/UIComponents';
import { UserProfile, Gender, AppView, WorkoutPlan, DietLog, WeightLog, Exercise } from './types';
import { generateWorkoutPlan, analyzeFoodImage, generateDailyEncouragement } from './services/geminiService';
import { LineChart } from 'react-native-chart-kit';

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
  accent: {
    50: '#fff7ed',
    100: '#ffedd5',
    400: '#fb923c',
    500: '#f97316',
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

const FALLBACK_PLAN: WorkoutPlan = {
  summary: '自宅でも続けやすい7日間の全身バランスプランです。無理なくフォーム重視で進めましょう。',
  recommendedCalories: 1900,
  schedule: [
    {
      day: '月曜日',
      focus: '上半身',
      exercises: [
        { id: 'mon-1', name: 'プッシュアップ', type: 'Strength', duration: '10分', description: '膝つきOK。胸と腕を意識。', isCompleted: false },
        { id: 'mon-2', name: 'サイドレイズ', type: 'Strength', duration: '8分', description: 'ペットボトルでも可。肩を痛めない範囲で。', isCompleted: false },
      ],
    },
    {
      day: '火曜日',
      focus: '下半身',
      exercises: [
        { id: 'tue-1', name: 'スクワット', type: 'Strength', duration: '12分', description: 'お尻を引いて膝を内側に入れない。', isCompleted: false },
        { id: 'tue-2', name: 'ヒップリフト', type: 'Strength', duration: '8分', description: 'お尻の収縮を意識。', isCompleted: false },
      ],
    },
    {
      day: '水曜日',
      focus: '有酸素',
      exercises: [
        { id: 'wed-1', name: '早歩き/ジョグ', type: 'Cardio', duration: '15-20分', description: '会話できる強度を目安に。', isCompleted: false },
        { id: 'wed-2', name: 'ジャンピングジャック', type: 'Cardio', duration: '5分', description: '膝に不安がある場合はスローペースで。', isCompleted: false },
      ],
    },
    {
      day: '木曜日',
      focus: '体幹',
      exercises: [
        { id: 'thu-1', name: 'プランク', type: 'Strength', duration: '3 x 30秒', description: '腰が落ちないように一直線。', isCompleted: false },
        { id: 'thu-2', name: 'バードドッグ', type: 'Strength', duration: '8分', description: '左右交互に体幹安定を意識。', isCompleted: false },
      ],
    },
    {
      day: '金曜日',
      focus: '上半身2',
      exercises: [
        { id: 'fri-1', name: 'インクラインプッシュアップ', type: 'Strength', duration: '10分', description: '台を使い角度をつけて負荷調整。', isCompleted: false },
        { id: 'fri-2', name: 'ワイドロー（タオル）', type: 'Strength', duration: '8分', description: '肩甲骨を寄せて背中を意識。', isCompleted: false },
      ],
    },
    {
      day: '土曜日',
      focus: '下半身2',
      exercises: [
        { id: 'sat-1', name: 'ランジ', type: 'Strength', duration: '10分', description: '膝がつま先より出すぎないように。', isCompleted: false },
        { id: 'sat-2', name: 'カーフレイズ', type: 'Strength', duration: '6分', description: 'ふくらはぎをしっかり収縮。', isCompleted: false },
      ],
    },
    {
      day: '日曜日',
      focus: 'リカバリー',
      exercises: [
        { id: 'sun-1', name: 'ストレッチ（全身）', type: 'Flexibility', duration: '10-15分', description: '呼吸を止めずに気持ちよく。', isCompleted: false },
        { id: 'sun-2', name: '軽いウォーキング', type: 'Cardio', duration: '15分', description: 'リラックス目的でOK。', isCompleted: false },
      ],
    },
  ],
};

const STORAGE_KEYS = {
  profile: 'profile',
  workoutPlan: 'workoutPlan',
  dietLogs: 'dietLogs',
  weightLogs: 'weightLogs',
  dailyMessage: 'dailyMessage',
};

const todayDate = () => new Date().toISOString().split('T')[0];

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
        colors={[COLORS.primary[700], COLORS.primary[500], COLORS.accent[500]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glowPrimary} />
      <View style={styles.glowAccent} />
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
  onNavigate,
  workoutPlan,
  todayCalories,
  targetCalories,
  dailyMessage,
  onRefreshMessage,
  isRefreshingMessage,
}: { 
  profile: UserProfile;
  onNavigate: (view: AppView) => void;
  workoutPlan: WorkoutPlan | null;
  todayCalories: number;
  targetCalories: number;
  dailyMessage: string | null;
  onRefreshMessage: () => void;
  isRefreshingMessage: boolean;
}) => {
  const todayIndex = new Date().getDay(); // 0:Sun
  const todayPlan = workoutPlan?.schedule?.[todayIndex] || workoutPlan?.schedule?.[0];
  const completedCount = todayPlan ? todayPlan.exercises.filter((e) => e.isCompleted).length : 0;
  const totalCount = todayPlan?.exercises.length || 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.dashboardContent}>
        <View style={styles.dashboardHeader}>
          <View>
            <Text style={styles.dashboardGreeting}>Hi, {profile.name} 👋</Text>
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
            <Icon name="emoticon-happy-outline" size={20} color={COLORS.accent[500]} />
          </View>
          <View style={styles.dailyMessageContent}>
            <Text style={styles.dailyMessageLabel}>DAILY BOOST ✨</Text>
            <Text style={styles.dailyMessageText}>
              {dailyMessage || '今日も一歩ずつ。小さな積み重ねが大きな変化をつくります！'}
            </Text>
          </View>
          <TouchableOpacity onPress={onRefreshMessage} style={styles.refreshButton}>
            <Text style={styles.refreshText}>{isRefreshingMessage ? '更新中...' : '更新'}</Text>
          </TouchableOpacity>
        </Card>

        <Card onPress={() => onNavigate(AppView.Workout)} style={styles.workoutCard}>
          <View style={styles.cardContent}>
            <View style={styles.cardIconSmall}>
              <Icon name="dumbbell" size={18} color={COLORS.surface[500]} />
            </View>
            <Text style={styles.cardLabelSmall}>Workout</Text>
          </View>
          <Text style={styles.workoutFocus}>
            {todayPlan ? `${todayPlan.day} | ${todayPlan.focus}` : 'プラン未生成'}
          </Text>
          <Text style={styles.workoutSubtext}>
            {totalCount ? `完了 ${completedCount}/${totalCount}` : 'タップして詳細を見る'}
          </Text>
          <View style={styles.workoutAction}>
            <Text style={styles.workoutActionText}>詳細を見る</Text>
            <Icon name="arrow-right" size={16} color={COLORS.primary[600]} />
          </View>
        </Card>

        <Card onPress={() => onNavigate(AppView.Diet)} style={styles.dietCard}>
          <GradientView
            colors={[COLORS.accent[50], COLORS.primary[50]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.dietCardGradient}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardIconLarge}>
                <Icon name="food-apple" size={32} color={COLORS.accent[500]} />
              </View>
              <View style={styles.dietCardContent}>
                <Text style={styles.cardLabelSmall}>Nutrition</Text>
                <Text style={styles.dietCalories}>本日のカロリー</Text>
                <Text style={styles.dietSubtext}>
                  {todayCalories} / {targetCalories} kcal
                </Text>
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

// --- Workout Screen ---
const WorkoutScreen = ({
  plan,
  onToggleExercise,
  onRegenerate,
  onBack,
  isLoading,
}: {
  plan: WorkoutPlan | null;
  onToggleExercise: (day: string, exerciseId: string) => void;
  onRegenerate: () => void;
  onBack: () => void;
  isLoading: boolean;
}) => {
  const openYoutube = (name: string) => {
    const query = encodeURIComponent(`${name} フォーム`);
    Linking.openURL(`https://www.youtube.com/results?search_query=${query}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.dashboardContent}>
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>ワークアウト</Text>
          <TouchableOpacity onPress={onBack} style={styles.backChip}>
            <Icon name="arrow-left" size={18} color={COLORS.surface[900]} />
            <Text style={styles.backChipText}>戻る</Text>
          </TouchableOpacity>
        </View>

        <Card>
          <Text style={styles.sectionTitle}>週間プラン</Text>
          <Text style={styles.sectionSubtitle}>{plan?.summary || 'プランを生成してください。'}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Icon name="fire" size={16} color={COLORS.primary[600]} />
              <Text style={styles.badgeText}>
                目安カロリー {plan?.recommendedCalories || 2000} kcal
              </Text>
            </View>
            <TouchableOpacity onPress={onRegenerate} style={styles.textButton}>
              <Text style={styles.textButtonLabel}>{isLoading ? '生成中...' : 'プラン再生成'}</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {!plan && (
          <Card>
            <Text style={styles.sectionSubtitle}>まだプランがありません。ボタンを押して生成します。</Text>
          </Card>
        )}

        {plan?.schedule.map((day) => (
          <Card key={day.day}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>{day.day}</Text>
              <Text style={styles.dayFocus}>{day.focus}</Text>
            </View>
            {day.exercises.map((ex) => (
              <View key={ex.id} style={styles.exerciseRow}>
                <TouchableOpacity
                  onPress={() => onToggleExercise(day.day, ex.id)}
                  style={[styles.exerciseCheck, ex.isCompleted && styles.exerciseCheckDone]}
                >
                  {ex.isCompleted && <Icon name="check" size={16} color={COLORS.white} />}
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <Text style={styles.exerciseName}>{ex.name}</Text>
                  <Text style={styles.exerciseDesc}>{ex.description}</Text>
                  <View style={styles.exerciseMeta}>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{ex.type}</Text>
                    </View>
                    <Text style={styles.exerciseDuration}>{ex.duration}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => openYoutube(ex.name)} style={styles.youtubeButton}>
                  <Icon name="youtube" size={20} color={COLORS.accent[500]} />
                </TouchableOpacity>
              </View>
            ))}
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Diet Screen ---
const DietScreen = ({
  logs,
  targetCalories,
  onAddLog,
  onBack,
  isLoading,
}: {
  logs: DietLog[];
  targetCalories: number;
  onAddLog: (description: string) => void;
  onBack: () => void;
  isLoading: boolean;
}) => {
  const [text, setText] = useState('');

  const todayTotal = useMemo(() => {
    const today = todayDate();
    return logs
      .filter((log) => new Date(log.timestamp).toISOString().startsWith(today))
      .reduce((sum, log) => sum + (log.macros?.calories || 0), 0);
  }, [logs]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.dashboardContent}>
          <View style={styles.screenHeader}>
            <Text style={styles.screenTitle}>食事ログ</Text>
            <TouchableOpacity onPress={onBack} style={styles.backChip}>
              <Icon name="arrow-left" size={18} color={COLORS.surface[900]} />
              <Text style={styles.backChipText}>戻る</Text>
            </TouchableOpacity>
          </View>

          <Card>
            <Text style={styles.sectionTitle}>今日のカロリー</Text>
            <Text style={styles.sectionSubtitle}>
              {todayTotal} / {targetCalories} kcal
            </Text>
            <Input
              label="食事内容をテキストで入力"
              placeholder="例: サラダチキンとおにぎり1個"
              value={text}
              onChangeText={setText}
              multiline
              numberOfLines={3}
            />
            <Button
              onPress={() => {
                if (!text.trim()) return;
                onAddLog(text.trim());
                setText('');
              }}
              isLoading={isLoading}
              disabled={isLoading || !text.trim()}
              style={{ marginTop: 12 }}
            >
              <Text style={styles.authButtonText}>AIで栄養分析して記録</Text>
            </Button>
          </Card>

          {logs.length === 0 && (
            <Card>
              <Text style={styles.sectionSubtitle}>まだ記録がありません。今日の食事を登録しましょう。</Text>
            </Card>
          )}

          {logs.map((log) => (
            <Card key={log.id}>
              <View style={styles.logHeader}>
                <Text style={styles.exerciseName}>{log.foodName}</Text>
                <Text style={styles.logDate}>{new Date(log.timestamp).toLocaleString()}</Text>
              </View>
              <View style={styles.macrosRow}>
                <View style={styles.macroChip}><Text style={styles.macroLabel}>kcal</Text><Text style={styles.macroValue}>{log.macros.calories}</Text></View>
                <View style={styles.macroChip}><Text style={styles.macroLabel}>P</Text><Text style={styles.macroValue}>{log.macros.protein}g</Text></View>
                <View style={styles.macroChip}><Text style={styles.macroLabel}>F</Text><Text style={styles.macroValue}>{log.macros.fat}g</Text></View>
                <View style={styles.macroChip}><Text style={styles.macroLabel}>C</Text><Text style={styles.macroValue}>{log.macros.carbs}g</Text></View>
              </View>
              <Text style={styles.logAdvice}>{log.advice}</Text>
            </Card>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// --- Progress Screen ---
const ProgressScreen = ({
  weightLogs,
  profile,
  onAddWeight,
  onBack,
  dietLogs,
  targetCalories,
}: {
  weightLogs: WeightLog[];
  profile: UserProfile;
  onAddWeight: (weight: number) => void;
  onBack: () => void;
  dietLogs: DietLog[];
  targetCalories: number;
}) => {
  const [weightInput, setWeightInput] = useState('');
  const sortedLogs = [...weightLogs].sort((a, b) => a.date.localeCompare(b.date));
  const chartWidth = Dimensions.get('window').width - 40;
  const chartData = sortedLogs.slice(-7);
  const weightDelta = (sortedLogs.at(-1)?.weight ?? profile.weight) - profile.targetWeight;

  const recentDates = chartData.map((l) => l.date);
  const dietByDate = useMemo(() => {
    const map = new Map<string, { calories: number; protein: number; fat: number; carbs: number }>();
    dietLogs.forEach((log) => {
      const date = new Date(log.timestamp).toISOString().split('T')[0];
      if (!map.has(date)) {
        map.set(date, { calories: 0, protein: 0, fat: 0, carbs: 0 });
      }
      const agg = map.get(date)!;
      agg.calories += log.macros.calories || 0;
      agg.protein += log.macros.protein || 0;
      agg.fat += log.macros.fat || 0;
      agg.carbs += log.macros.carbs || 0;
    });
    return map;
  }, [dietLogs]);

  const pfcDates = recentDates.length ? recentDates : [todayDate()];
  const pfcData = pfcDates.map((d) => dietByDate.get(d) || { calories: 0, protein: 0, fat: 0, carbs: 0 });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.dashboardContent}>
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>進捗</Text>
          <TouchableOpacity onPress={onBack} style={styles.backChip}>
            <Icon name="arrow-left" size={18} color={COLORS.surface[900]} />
            <Text style={styles.backChipText}>戻る</Text>
          </TouchableOpacity>
        </View>

        <Card>
          <Text style={styles.sectionTitle}>体重を追加</Text>
          <Input
            label="現在の体重 (kg)"
            placeholder="例: 68.5"
            value={weightInput}
            onChangeText={setWeightInput}
            keyboardType="numeric"
          />
          <Button
            onPress={() => {
              const val = parseFloat(weightInput);
              if (!val) return;
              onAddWeight(val);
              setWeightInput('');
            }}
            style={{ marginTop: 12 }}
          >
            <Text style={styles.authButtonText}>記録する</Text>
          </Button>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>体重の推移</Text>
          <Text style={styles.sectionSubtitle}>
            目標差分: {weightDelta >= 0 ? '+' : ''}{weightDelta.toFixed(1)} kg
          </Text>
          {chartData.length === 0 ? (
            <Text style={styles.sectionSubtitle}>まだデータがありません。</Text>
          ) : (
            <View style={styles.chartContainer}>
              <LineChart
                data={{
                  labels: chartData.map((l) => l.date.slice(5)),
                  datasets: [
                    { data: chartData.map((l) => l.weight), color: () => '#0ea5e9' },
                    { data: chartData.map(() => profile.targetWeight), color: () => '#94a3b8' },
                  ],
                  legend: ['体重', '目標'],
                }}
                width={chartWidth}
                height={220}
                chartConfig={{
                  backgroundColor: COLORS.white,
                  backgroundGradientFrom: COLORS.white,
                  backgroundGradientTo: COLORS.white,
                  color: (opacity = 1) => `rgba(14,165,233,${opacity})`,
                  labelColor: () => COLORS.surface[500],
                  propsForDots: { r: '4' },
                }}
                bezier
                style={{ borderRadius: 16 }}
              />
            </View>
          )}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>PFC / カロリー推移 (直近7日)</Text>
          {pfcData.every((d) => d.calories === 0 && d.protein === 0 && d.fat === 0 && d.carbs === 0) ? (
            <Text style={styles.sectionSubtitle}>まだ食事データがありません。</Text>
          ) : (
            <View style={styles.chartContainer}>
              <LineChart
                data={{
                  labels: pfcDates.map((d) => d.slice(5)),
                  datasets: [
                    { data: pfcData.map((d) => d.calories), color: () => '#f97316' },
                    { data: pfcData.map((d) => d.protein), color: () => '#22c55e' },
                    { data: pfcData.map((d) => d.fat), color: () => '#0ea5e9' },
                    { data: pfcData.map((d) => d.carbs), color: () => '#64748b' },
                    { data: pfcData.map(() => targetCalories), color: () => '#94a3b8' },
                  ],
                  legend: ['kcal', 'P', 'F', 'C', '目標kcal'],
                }}
                width={chartWidth}
                height={260}
                chartConfig={{
                  backgroundColor: COLORS.white,
                  backgroundGradientFrom: COLORS.white,
                  backgroundGradientTo: COLORS.white,
                  color: (opacity = 1) => `rgba(100,116,139,${opacity})`,
                  labelColor: () => COLORS.surface[500],
                  propsForDots: { r: '3' },
                }}
                bezier
                style={{ borderRadius: 16 }}
              />
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Settings Screen ---
const SettingsScreen = ({
  profile,
  onReset,
  onBack,
}: {
  profile: UserProfile;
  onReset: () => void;
  onBack: () => void;
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.dashboardContent}>
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>設定</Text>
          <TouchableOpacity onPress={onBack} style={styles.backChip}>
            <Icon name="arrow-left" size={18} color={COLORS.surface[900]} />
            <Text style={styles.backChipText}>戻る</Text>
          </TouchableOpacity>
        </View>

        <Card>
          <Text style={styles.sectionTitle}>プロフィール</Text>
          <Text style={styles.sectionSubtitle}>名前: {profile.name}</Text>
          <Text style={styles.sectionSubtitle}>目標: {profile.goal}</Text>
          <Text style={styles.sectionSubtitle}>
            体重: {profile.weight}kg / 目標 {profile.targetWeight}kg
          </Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>データリセット</Text>
          <Text style={styles.sectionSubtitle}>保存済みのプロフィールと記録を削除します。</Text>
          <Button onPress={onReset} variant="secondary" style={{ marginTop: 12 }}>
            <Text style={[styles.authButtonTextSecondary, { color: COLORS.primary[600] }]}>リセットしてサインアウト</Text>
          </Button>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Main App ---
const App = () => {
  const [view, setView] = useState<AppView>(AppView.Auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [dietLogs, setDietLogs] = useState<DietLog[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [dailyMessage, setDailyMessage] = useState<string | null>(null);
  const [isPlanLoading, setIsPlanLoading] = useState(false);
  const [isDietLoading, setIsDietLoading] = useState(false);
  const [isMessageLoading, setIsMessageLoading] = useState(false);

  const targetCalories = useMemo(
    () => workoutPlan?.recommendedCalories ?? 2000,
    [workoutPlan]
  );
  const todayCalories = useMemo(() => {
    const today = todayDate();
    return dietLogs
      .filter((log) => new Date(log.timestamp).toISOString().startsWith(today))
      .reduce((sum, log) => sum + (log.macros?.calories || 0), 0);
  }, [dietLogs]);

  useEffect(() => {
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
      const savedProfile = await AsyncStorage.getItem(STORAGE_KEYS.profile);
      console.log('Profile loaded:', savedProfile ? 'found' : 'not found');
      if (savedProfile) {
          const parsed = JSON.parse(savedProfile);
          setProfile(parsed);
          setView(AppView.Dashboard);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load profile:', error);
      setIsLoading(false);
    }
  };

  const loadAppData = async (p: UserProfile) => {
    try {
      const storedPlan = await AsyncStorage.getItem(STORAGE_KEYS.workoutPlan);
      if (storedPlan) {
        setWorkoutPlan(JSON.parse(storedPlan));
      } else {
        await generatePlanWithFallback(p);
      }

      const savedDiet = await AsyncStorage.getItem(STORAGE_KEYS.dietLogs);
      if (savedDiet) {
        const parsed: DietLog[] = JSON.parse(savedDiet).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        }));
        setDietLogs(parsed);
      }

      const savedWeight = await AsyncStorage.getItem(STORAGE_KEYS.weightLogs);
      if (savedWeight) {
        setWeightLogs(JSON.parse(savedWeight));
      }

      const savedMessage = await AsyncStorage.getItem(STORAGE_KEYS.dailyMessage);
      if (savedMessage) {
        const parsed = JSON.parse(savedMessage);
        if (parsed.date === todayDate()) {
          setDailyMessage(parsed.text);
        }
      }
    } catch (error) {
      console.error('Failed to load app data:', error);
    }
  };

  useEffect(() => {
    if (profile) {
      loadAppData(profile);
    }
  }, [profile]);

  const persistPlan = async (plan: WorkoutPlan) => {
    setWorkoutPlan(plan);
    await AsyncStorage.setItem(STORAGE_KEYS.workoutPlan, JSON.stringify(plan));
  };

  const generatePlanWithFallback = async (p: UserProfile) => {
    setIsPlanLoading(true);
    try {
      const plan = await generateWorkoutPlan(p);
      await persistPlan(plan);
      return plan;
    } catch (err) {
      console.warn('Fallback plan is used because of error:', err);
      await persistPlan(FALLBACK_PLAN);
      return FALLBACK_PLAN;
    } finally {
      setIsPlanLoading(false);
    }
  };

  const handleOnboardingComplete = async (p: UserProfile) => {
    setProfile(p);
    await AsyncStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(p));
    await generatePlanWithFallback(p);
    setView(AppView.Dashboard);
  };

  const handleLoginSuccess = async () => {
    const savedProfile = await AsyncStorage.getItem(STORAGE_KEYS.profile);
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfile(parsed);
      setView(AppView.Dashboard);
      await loadAppData(parsed);
    }
  };

  const toggleExercise = async (dayLabel: string, exerciseId: string) => {
    setWorkoutPlan((prev) => {
      if (!prev) return prev;
      const next: WorkoutPlan = {
        ...prev,
        schedule: prev.schedule.map((day) =>
          day.day === dayLabel
            ? {
                ...day,
                exercises: day.exercises.map((ex) =>
                  ex.id === exerciseId ? { ...ex, isCompleted: !ex.isCompleted } : ex
                ),
              }
            : day
        ),
      };
      AsyncStorage.setItem(STORAGE_KEYS.workoutPlan, JSON.stringify(next));
      return next;
    });
  };

  const addDietLog = async (description: string) => {
    setIsDietLoading(true);
    try {
      const result = await analyzeFoodImage(null, description);
      const newLog: DietLog = {
        id: `${Date.now()}`,
        timestamp: new Date(),
        foodName: result.foodName || description,
        macros: {
          calories: result.calories || 0,
          protein: result.protein || 0,
          fat: result.fat || 0,
          carbs: result.carbs || 0,
        },
        advice: result.advice || 'バランスの良い食事を意識しましょう。',
      };
      const updated = [newLog, ...dietLogs];
      setDietLogs(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.dietLogs, JSON.stringify(updated));
    } catch (err) {
      console.warn('Food analysis failed, using fallback:', err);
      const fallbackLog: DietLog = {
        id: `${Date.now()}`,
        timestamp: new Date(),
        foodName: description,
        macros: { calories: 480, protein: 25, fat: 15, carbs: 55 },
        advice: 'タンパク質を少し増やし、野菜も追加するとさらに良いです。',
      };
      const updated = [fallbackLog, ...dietLogs];
      setDietLogs(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.dietLogs, JSON.stringify(updated));
    } finally {
      setIsDietLoading(false);
    }
  };

  const addWeightLog = async (weight: number) => {
    const log: WeightLog = { id: `${Date.now()}`, date: todayDate(), weight };
    const updated = [...weightLogs, log];
    setWeightLogs(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.weightLogs, JSON.stringify(updated));
  };

  const refreshDailyMessage = async () => {
    if (!profile) return;
    setIsMessageLoading(true);
    try {
      const message = await generateDailyEncouragement(profile, todayCalories, targetCalories);
      setDailyMessage(message);
      await AsyncStorage.setItem(
        STORAGE_KEYS.dailyMessage,
        JSON.stringify({ text: message, date: todayDate() })
      );
    } catch (err) {
      console.warn('Daily message fallback:', err);
      setDailyMessage('今日も健康的な一日を過ごしましょう！');
    } finally {
      setIsMessageLoading(false);
    }
  };

  const resetAll = async () => {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.profile,
      STORAGE_KEYS.workoutPlan,
      STORAGE_KEYS.dietLogs,
      STORAGE_KEYS.weightLogs,
      STORAGE_KEYS.dailyMessage,
    ]);
    setProfile(null);
    setWorkoutPlan(null);
    setDietLogs([]);
    setWeightLogs([]);
    setDailyMessage(null);
    setView(AppView.Auth);
  };

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
        <Dashboard
          profile={profile}
          onNavigate={setView}
          workoutPlan={workoutPlan}
          todayCalories={todayCalories}
          targetCalories={targetCalories}
          dailyMessage={dailyMessage}
          onRefreshMessage={refreshDailyMessage}
          isRefreshingMessage={isMessageLoading}
        />
      )}

      {profile && view === AppView.Workout && (
        <WorkoutScreen
          plan={workoutPlan}
          onToggleExercise={toggleExercise}
          onRegenerate={() => profile && generatePlanWithFallback(profile)}
          onBack={() => setView(AppView.Dashboard)}
          isLoading={isPlanLoading}
        />
      )}

      {profile && view === AppView.Diet && (
        <DietScreen
          logs={dietLogs}
          targetCalories={targetCalories}
          onAddLog={addDietLog}
          onBack={() => setView(AppView.Dashboard)}
          isLoading={isDietLoading}
        />
      )}

      {profile && view === AppView.Progress && (
        <ProgressScreen
          weightLogs={weightLogs}
          profile={profile}
          onAddWeight={addWeightLog}
          dietLogs={dietLogs}
          targetCalories={targetCalories}
          onBack={() => setView(AppView.Dashboard)}
        />
      )}

      {profile && view === AppView.Settings && (
        <SettingsScreen
          profile={profile}
          onReset={resetAll}
          onBack={() => setView(AppView.Dashboard)}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface[50],
  },
  glowPrimary: {
    position: 'absolute',
    top: -140,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 200,
    backgroundColor: 'rgba(14, 165, 233, 0.18)',
  },
  glowAccent: {
    position: 'absolute',
    bottom: -120,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 180,
    backgroundColor: 'rgba(249, 115, 22, 0.14)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface[50],
  },
  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.surface[900],
  },
  backChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface[100],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  backChipText: {
    color: COLORS.surface[800],
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.surface[900],
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.surface[500],
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface[50],
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    color: COLORS.surface[700],
    fontWeight: '600',
  },
  textButton: {
    paddingVertical: 6,
  },
  textButtonLabel: {
    color: COLORS.primary[600],
    fontWeight: '700',
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
    backgroundColor: COLORS.accent[50],
    borderColor: COLORS.accent[100],
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
    color: COLORS.accent[500],
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

  // Workout
  refreshButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.accent[100],
  },
  refreshText: {
    color: COLORS.accent[500],
    fontWeight: '700',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.surface[900],
  },
  dayFocus: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary[600],
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  exerciseCheck: {
    width: 28,
    height: 28,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.surface[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseCheckDone: {
    backgroundColor: COLORS.primary[600],
    borderColor: COLORS.primary[600],
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.surface[900],
  },
  exerciseDesc: {
    fontSize: 13,
    color: COLORS.surface[500],
    marginTop: 2,
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  tag: {
    backgroundColor: COLORS.surface[100],
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.surface[700],
  },
  exerciseDuration: {
    fontSize: 12,
    color: COLORS.surface[500],
    fontWeight: '600',
  },
  youtubeButton: {
    padding: 6,
  },

  // Diet
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logDate: {
    fontSize: 12,
    color: COLORS.surface[400],
  },
  macrosRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  macroChip: {
    backgroundColor: COLORS.surface[100],
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
  },
  macroLabel: {
    fontSize: 12,
    color: COLORS.surface[500],
    fontWeight: '700',
  },
  macroValue: {
    fontSize: 14,
    color: COLORS.surface[900],
    fontWeight: '700',
  },
  logAdvice: {
    fontSize: 13,
    color: COLORS.surface[600],
    lineHeight: 18,
  },

  // Progress
  chartContainer: {
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: COLORS.white,
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
