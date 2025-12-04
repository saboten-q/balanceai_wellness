
import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Utensils, User, ArrowRight, TrendingUp, 
  Camera, Plus, Calendar, ChevronRight, BarChart3, LayoutGrid, MessageCircle, Send,
  PlayCircle, LogIn, UserPlus, Sparkles, HelpCircle, X, Check, Target, Dumbbell, Mail
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, ReferenceLine, Legend } from 'recharts';
import { UserProfile, Gender, AppView, WorkoutPlan, DietLog, WeightLog, ChatMessage, DailyWorkout, Exercise } from './types';
import { generateWorkoutPlan, analyzeFoodImage, streamChatMessage, generateDailyEncouragement } from './services/geminiService';
import { Button, Card, Input, Select, Checkbox, Modal } from './components/UIComponents';

// --- Helper Components ---

const StyledIcon = ({ icon: Icon, colorClass = "text-surface-900", bgClass = "bg-surface-100" }: { icon: any, colorClass?: string, bgClass?: string }) => (
  <div className={`p-2.5 rounded-xl ${bgClass} ${colorClass} flex items-center justify-center`}>
    <Icon size={20} strokeWidth={2} />
  </div>
);

// --- View Components ---

const AuthScreen = ({ onNavigate, onLoginSuccess }: { onNavigate: (view: AppView) => void, onLoginSuccess: () => void }) => {
  const [mode, setMode] = useState<'landing' | 'login' | 'register' | 'reset'>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    // Mock login logic
    const saved = localStorage.getItem('profile');
    if (saved) {
      onLoginSuccess();
    } else {
      setError("アカウントが見つかりません。まずは登録してください。");
    }
  };

  const handleRegister = () => {
    // Mock registration
    onNavigate(AppView.Onboarding);
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('メールアドレスを入力してください');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    // Simulate password reset (replace with actual Firebase call later)
    setTimeout(() => {
      setSuccess('パスワードリセットメールを送信しました。メールをご確認ください。');
      setIsLoading(false);
      setTimeout(() => {
        setMode('login');
        setSuccess('');
      }, 3000);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 w-full animate-fade-in relative overflow-hidden bg-surface-50">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-200/20 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent-200/20 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-4 mb-12">
          <div className="w-24 h-24 bg-gradient-to-tr from-primary-500 to-primary-400 rounded-[2.5rem] mx-auto flex items-center justify-center shadow-2xl shadow-primary-500/30 mb-8 rotate-3 hover:rotate-6 transition-transform duration-500 ring-4 ring-white">
            <Activity className="text-white w-12 h-12" strokeWidth={2.5} />
          </div>
          <h1 className="text-5xl font-bold text-surface-900 tracking-tight font-sans">BalanceAI</h1>
          <p className="text-surface-900/60 text-lg leading-relaxed font-medium">
            あなただけの専属AIトレーナー。<br/>
            理想の身体と健康を、<br/>
            これひとつで。
          </p>
        </div>

        {mode === 'landing' && (
          <div className="space-y-4 animate-slide-up">
            <Button onClick={() => setMode('login')} variant="primary" className="w-full py-4 text-lg shadow-xl shadow-primary-500/20">
              <LogIn className="w-5 h-5" /> ログイン
            </Button>
            <Button onClick={() => setMode('register')} variant="secondary" className="w-full py-4 text-lg bg-white border border-surface-200">
              <UserPlus className="w-5 h-5" /> 会員登録
            </Button>
            <div className="pt-4 text-center">
              <button 
                onClick={() => onNavigate(AppView.Onboarding)}
                className="text-surface-500 text-sm font-bold hover:text-surface-900 transition-colors underline decoration-2 decoration-surface-200 underline-offset-4"
              >
                登録せずに利用する
              </button>
            </div>
          </div>
        )}

        {(mode === 'login' || mode === 'register') && (
          <Card className="animate-slide-up space-y-5 !p-8 backdrop-blur-xl bg-white/80">
             <div className="text-center mb-2">
               <h2 className="text-2xl font-bold text-surface-900">{mode === 'login' ? 'おかえりなさい' : 'アカウント作成'}</h2>
             </div>
             
             {error && (
               <div className="bg-red-50 text-red-600 text-sm font-medium p-4 rounded-2xl flex items-center gap-2">
                 <X size={16} /> {error}
               </div>
             )}

             <Input 
               label="メールアドレス" 
               type="email" 
               placeholder="hello@example.com"
               value={email}
               onChange={e => setEmail(e.target.value)}
             />
             <Input 
               label="パスワード" 
               type="password" 
               placeholder="••••••••"
               value={password}
               onChange={e => setPassword(e.target.value)}
             />
             
             {mode === 'login' && (
               <div className="text-right">
                 <button 
                   onClick={() => { setMode('reset'); setError(''); }}
                   className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
                 >
                   パスワードをお忘れですか？
                 </button>
               </div>
             )}
             
             <div className="pt-4 space-y-3">
               <Button 
                 onClick={mode === 'login' ? handleLogin : handleRegister} 
                 isLoading={isLoading}
                 className="w-full py-3.5"
               >
                 <Mail size={18} />
                 {mode === 'login' ? 'メールでログイン' : 'メールで登録'}
               </Button>
               
               {/* Google Login (Future implementation) */}
               <button 
                 onClick={() => setError('Googleログインは近日公開予定です')}
                 className="w-full py-3.5 px-6 bg-white border-2 border-surface-200 text-surface-900 rounded-2xl font-bold hover:bg-surface-50 transition-all flex items-center justify-center gap-2 shadow-sm"
               >
                 <svg className="w-5 h-5" viewBox="0 0 24 24">
                   <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                   <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                   <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                   <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                 </svg>
                 Googleで{mode === 'login' ? 'ログイン' : '登録'}
               </button>
               
               <button 
                 onClick={() => { setMode('landing'); setError(''); }}
                 className="w-full text-center text-sm font-bold text-surface-400 py-2 hover:text-surface-900 transition-colors"
               >
                 キャンセル
               </button>
             </div>
          </Card>
        )}

        {mode === 'reset' && (
          <Card className="animate-slide-up space-y-5 !p-8 backdrop-blur-xl bg-white/80">
             <div className="text-center mb-2">
               <h2 className="text-2xl font-bold text-surface-900">パスワードリセット</h2>
               <p className="text-surface-500 text-sm mt-2">
                 登録されたメールアドレスにパスワードリセット用のリンクを送信します
               </p>
             </div>
             
             {error && (
               <div className="bg-red-50 text-red-600 text-sm font-medium p-4 rounded-2xl flex items-center gap-2">
                 <X size={16} /> {error}
               </div>
             )}

             {success && (
               <div className="bg-primary-50 text-primary-700 text-sm font-medium p-4 rounded-2xl flex items-center gap-2">
                 <Check size={16} /> {success}
               </div>
             )}

             <Input 
               label="メールアドレス" 
               type="email" 
               placeholder="hello@example.com"
               value={email}
               onChange={e => setEmail(e.target.value)}
             />
             
             <div className="pt-4 space-y-3">
               <Button 
                 onClick={handlePasswordReset} 
                 isLoading={isLoading}
                 className="w-full py-3.5"
               >
                 リセットメールを送信
               </Button>
               <button 
                 onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                 className="w-full text-center text-sm font-bold text-surface-400 py-2 hover:text-surface-900 transition-colors"
               >
                 ログイン画面に戻る
               </button>
             </div>
          </Card>
        )}
      </div>
    </div>
  );
};

const Onboarding = ({ onComplete }: { onComplete: (profile: UserProfile) => void }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    gender: Gender.Other,
    activityLevel: 'Moderate',
    hasGymAccess: false,
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    setIsGenerating(true);
    // Simulate slight delay for UX
    setTimeout(() => {
      onComplete(profile as UserProfile);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 max-w-lg mx-auto w-full bg-surface-50">
      <div className="w-full animate-slide-up">
        <div className="mb-10 text-center md:text-left">
          <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-bold mb-3">STEP {step}/3</span>
          <h1 className="text-4xl font-bold text-surface-900 mb-3 tracking-tight">理想の自分へ</h1>
          <p className="text-surface-500 font-medium">あなたの目標に合わせて<br/>AIがプランをパーソナライズします。</p>
        </div>

        <Card className="mb-8 !p-8 shadow-xl shadow-surface-200/50">
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <Input 
                label="お名前 (ニックネーム)" 
                placeholder="例: 田中 太郎" 
                value={profile.name || ''} 
                onChange={e => setProfile({...profile, name: e.target.value})}
              />
               <Select 
                label="性別" 
                value={profile.gender}
                onChange={e => setProfile({...profile, gender: e.target.value as Gender})}
                options={[
                  { label: '男性', value: Gender.Male },
                  { label: '女性', value: Gender.Female },
                  { label: 'その他', value: Gender.Other },
                ]}
              />
              <div className="grid grid-cols-2 gap-6">
                <Input 
                  label="年齢" 
                  type="number" 
                  value={profile.age || ''} 
                  onChange={e => setProfile({...profile, age: Number(e.target.value)})}
                />
                <div />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-2 gap-6">
                <Input 
                  label="身長 (cm)" 
                  type="number" 
                  value={profile.height || ''} 
                  onChange={e => setProfile({...profile, height: Number(e.target.value)})}
                />
                <Input 
                  label="現在の体重 (kg)" 
                  type="number" 
                  value={profile.weight || ''} 
                  onChange={e => setProfile({...profile, weight: Number(e.target.value)})}
                />
              </div>
              
              <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100">
                <Input 
                  label="理想の体重 (kg)" 
                  type="number" 
                  className="bg-white"
                  placeholder="目標とする体重"
                  value={profile.targetWeight || ''} 
                  onChange={e => setProfile({...profile, targetWeight: Number(e.target.value)})}
                />
              </div>

              <Select 
                label="トレーニング環境" 
                value={profile.hasGymAccess ? 'yes' : 'no'}
                onChange={e => setProfile({...profile, hasGymAccess: e.target.value === 'yes'})}
                options={[
                  { label: '自宅 (器具なし・ダンベル程度)', value: 'no' },
                  { label: 'ジムに通っている (マシン等あり)', value: 'yes' },
                ]}
              />

              <Select 
                label="普段の運動レベル" 
                value={profile.activityLevel}
                onChange={e => setProfile({...profile, activityLevel: e.target.value as any})}
                options={[
                  { label: '低い (デスクワーク中心)', value: 'Low' },
                  { label: '普通 (週1-2回の運動)', value: 'Moderate' },
                  { label: '高い (週3回以上の運動)', value: 'High' },
                ]}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
               <div className="space-y-2">
                 <label className="block text-sm font-bold text-surface-900 ml-1">具体的な目標は？</label>
                 <textarea 
                    className="w-full bg-surface-50 border border-surface-200 rounded-2xl px-4 py-3 text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all min-h-[140px] resize-none"
                    placeholder="例：夏までに腹筋を割りたい、マラソンを完走できる体力をつけたい..."
                    value={profile.goal || ''}
                    onChange={e => setProfile({...profile, goal: e.target.value})}
                 />
               </div>
            </div>
          )}
        </Card>

        <div className="flex justify-between items-center">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="text-surface-400 hover:text-surface-900 font-bold px-4 transition-colors">
              戻る
            </button>
          ) : <div />}
          
          <Button onClick={handleNext} isLoading={isGenerating} className="px-8 shadow-xl shadow-primary-500/20">
            {step === 3 ? '始める' : '次へ'} <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ 
  profile, 
  onNavigate, 
  caloriesConsumed, 
  todaysWorkout,
  dailyMessage
}: { 
  profile: UserProfile, 
  onNavigate: (view: AppView) => void,
  caloriesConsumed: number,
  todaysWorkout?: { focus: string, count: number, completedCount: number },
  dailyMessage: string
}) => {
  const targetCalories = profile.recommendedCalories || 2200;
  const percentage = Math.min((caloriesConsumed / targetCalories) * 100, 100);
  const remaining = targetCalories - caloriesConsumed;
  const isOver = remaining < 0;

  return (
    <div className="p-6 space-y-8 animate-fade-in pb-32">
      <header className="flex justify-between items-center pt-2">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 tracking-tight">Hi, {profile.name}</h1>
          <p className="text-surface-500 font-medium mt-1 flex items-center gap-2">
             <Target size={16} className="text-primary-500"/>
             {profile.targetWeight ? `目標まであと ${Math.abs(profile.weight - profile.targetWeight).toFixed(1)}kg` : '今日も一日頑張りましょう'}
          </p>
        </div>
        <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-primary-600 shadow-sm border border-surface-100">
          <User size={24} strokeWidth={2} />
        </div>
      </header>

      {/* AI Encouragement */}
      <div className="bg-gradient-to-r from-primary-50 to-white border border-primary-100 p-5 rounded-3xl flex items-start gap-4 relative overflow-hidden shadow-sm">
         <div className="p-3 bg-white rounded-2xl text-primary-500 shadow-sm shrink-0 mt-0.5">
           <Sparkles size={20} className="opacity-80" strokeWidth={2} />
         </div>
         <div className="relative z-10">
           <h3 className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">Daily Message</h3>
           <p className="text-surface-900 font-medium leading-relaxed">
             {dailyMessage}
           </p>
         </div>
         <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary-100/50 to-transparent -z-0 rounded-bl-[4rem]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Calories Card */}
        <Card 
          className="col-span-1 md:col-span-2 relative overflow-hidden group cursor-pointer border-none !bg-surface-900 !text-white shadow-xl shadow-surface-900/20"
          onClick={() => onNavigate(AppView.Diet)}
        >
           <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-surface-800 to-transparent opacity-50" />
           <div className="relative z-10 flex justify-between items-end">
             <div className="space-y-4 w-full">
               <div className="flex items-center gap-2 text-surface-300">
                 <Utensils size={18} strokeWidth={2} />
                 <span className="font-bold text-sm tracking-wide">Nutrition</span>
               </div>
               
               <div>
                 <div className="flex items-baseline gap-1">
                   <span className="text-5xl font-bold tracking-tight font-sans">{caloriesConsumed.toLocaleString()}</span>
                   <span className="text-surface-400 font-medium text-lg">/ {targetCalories.toLocaleString()} kcal</span>
                 </div>
                 <p className={`text-sm font-medium mt-1 ${isOver ? 'text-accent-400' : 'text-primary-400'}`}>
                   {isOver ? `${Math.abs(remaining).toLocaleString()} kcal オーバー` : `あと ${remaining.toLocaleString()} kcal 摂取可能`}
                 </p>
               </div>

               <div className="h-3 w-full bg-surface-800 rounded-full overflow-hidden">
                 <div 
                   className={`h-full rounded-full transition-all duration-1000 ease-out ${isOver ? 'bg-accent-500' : 'bg-primary-500'}`}
                   style={{ width: `${percentage}%` }}
                 />
               </div>
             </div>
           </div>
        </Card>

        {/* Workout Card */}
        <Card onClick={() => onNavigate(AppView.Workout)} className="relative overflow-hidden border-none bg-white shadow-lg shadow-surface-200/40">
           <div className="absolute top-0 right-0 p-6 opacity-5">
             <Activity size={80} strokeWidth={1} />
           </div>
           <div className="space-y-4">
              <div className="flex items-center gap-2 text-surface-500">
                 <Dumbbell size={18} strokeWidth={2} />
                 <span className="font-bold text-sm tracking-wide">Workout</span>
               </div>
              <div>
                <h3 className="text-2xl font-bold text-surface-900 mb-1">{todaysWorkout?.focus || 'Rest Day'}</h3>
                <p className="text-surface-500 font-medium">
                  {todaysWorkout ? `${todaysWorkout.completedCount}/${todaysWorkout.count} メニュー完了` : '今日は休息日です'}
                </p>
              </div>
              <div className="flex items-center gap-2 text-primary-600 font-bold text-sm">
                <span>詳細を見る</span> <ArrowRight size={16} />
              </div>
           </div>
        </Card>

        {/* Weight Card */}
        <Card onClick={() => onNavigate(AppView.Progress)} className="relative overflow-hidden border-none bg-white shadow-lg shadow-surface-200/40">
           <div className="absolute top-0 right-0 p-6 opacity-5">
             <TrendingUp size={80} strokeWidth={1} />
           </div>
           <div className="space-y-4">
              <div className="flex items-center gap-2 text-surface-500">
                 <TrendingUp size={18} strokeWidth={2} />
                 <span className="font-bold text-sm tracking-wide">Progress</span>
               </div>
              <div>
                <h3 className="text-2xl font-bold text-surface-900 mb-1">{profile.weight} <span className="text-lg text-surface-500 font-medium">kg</span></h3>
                <p className="text-surface-500 font-medium">現在の体重</p>
              </div>
              <div className="flex items-center gap-2 text-primary-600 font-bold text-sm">
                <span>記録する</span> <Plus size={16} />
              </div>
           </div>
        </Card>
      </div>
    </div>
  );
};

// --- Other Views ---

const WorkoutView = ({ plan, onToggleExercise }: { plan: WorkoutPlan | null, onToggleExercise: (dayIndex: number, exIndex: number) => void }) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  // Dedicated chat for workout context
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  
  // Create refs to scroll to bottom of chat
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendChat = async () => {
    if (!chatInput.trim() || isStreaming) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: chatInput, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsStreaming(true);

    const currentWorkout = plan?.schedule[selectedDayIndex];
    const context = `
      User is currently viewing workout for: ${currentWorkout?.day}
      Focus: ${currentWorkout?.focus}
      Exercises: ${currentWorkout?.exercises.map(e => e.name).join(', ')}.
    `;

    // Optimistic AI message
    const aiMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: aiMsgId, role: 'ai', text: '', timestamp: new Date() }]);

    // Access the profile from local storage for context
    const savedProfile = localStorage.getItem('profile');
    const profile = savedProfile ? JSON.parse(savedProfile) : {} as UserProfile;

    const stream = streamChatMessage([...messages, userMsg], profile, context);
    
    let fullText = "";
    for await (const chunk of stream) {
      fullText += chunk;
      setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: fullText } : m));
    }
    setIsStreaming(false);
  };

  if (!plan) return <div className="p-10 text-center text-surface-500">プランを作成中...</div>;

  const currentDay = plan.schedule[selectedDayIndex];

  return (
    <div className="p-6 pb-32 animate-fade-in space-y-6">
      <h2 className="text-3xl font-bold text-surface-900 mb-4 tracking-tight">Weekly Workout</h2>
      
      {/* Day Selector */}
      <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar snap-x">
        {plan.schedule.map((day, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedDayIndex(idx)}
            className={`flex-shrink-0 snap-start px-6 py-3 rounded-2xl whitespace-nowrap transition-all duration-300 font-bold text-sm ${
              selectedDayIndex === idx 
                ? 'bg-surface-900 text-white shadow-lg shadow-surface-900/20 scale-105' 
                : 'bg-white text-surface-500 hover:bg-surface-100 border border-surface-200'
            }`}
          >
            {day.day}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
           <div className="p-2 bg-accent-100 text-accent-600 rounded-xl"><Activity size={20} /></div>
           <h3 className="text-xl font-bold text-surface-900">{currentDay.focus}</h3>
        </div>

        {currentDay.exercises.map((ex, exIdx) => (
          <div key={ex.id || exIdx} className={`bg-white p-5 rounded-3xl border transition-all duration-300 ${ex.isCompleted ? 'border-primary-200 bg-primary-50/30' : 'border-surface-200 shadow-sm'}`}>
            <div className="flex items-start gap-4">
              <div className="pt-1">
                 <Checkbox 
                   checked={!!ex.isCompleted} 
                   onChange={() => onToggleExercise(selectedDayIndex, exIdx)} 
                 />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className={`font-bold text-lg ${ex.isCompleted ? 'text-surface-400 line-through' : 'text-surface-900'}`}>{ex.name}</h4>
                  <span className="text-xs font-bold px-2.5 py-1 bg-surface-100 text-surface-600 rounded-lg">{ex.duration}</span>
                </div>
                <p className={`text-sm leading-relaxed ${ex.isCompleted ? 'text-surface-300' : 'text-surface-500'}`}>{ex.description}</p>
                
                {/* YouTube Link */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' 正しいフォーム')}`, '_blank');
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition-colors mt-2 bg-red-50 w-fit px-3 py-1.5 rounded-full"
                >
                  <PlayCircle size={14} className="text-red-500 bg-white rounded-full" />
                  解説動画を見る
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Workout Context Chat */}
      <div className="mt-8 pt-8 border-t border-surface-200">
         <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-surface-200 overflow-hidden shadow-lg">
           <div className="bg-primary-50/50 p-4 border-b border-primary-100 flex items-center gap-2">
             <Sparkles size={16} className="text-primary-500" strokeWidth={2} />
             <span className="text-sm font-bold text-primary-700">AI Trainer Support</span>
           </div>
           
           <div className="h-48 overflow-y-auto p-4 space-y-3 bg-surface-50/50">
             {messages.length === 0 && (
               <p className="text-center text-xs text-surface-400 my-4">
                 「このメニューの代わりは？」「膝が痛い」など<br/>今日のメニューについて何でも聞いてください。
               </p>
             )}
             {messages.map((msg) => (
               <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                   msg.role === 'user' 
                     ? 'bg-surface-900 text-white rounded-br-none shadow-md' 
                     : 'bg-white text-surface-900 border border-surface-200 rounded-bl-none shadow-sm'
                 }`}>
                   {msg.text}
                 </div>
               </div>
             ))}
             <div ref={chatEndRef} />
           </div>

           <div className="p-3 bg-white border-t border-surface-100 flex gap-2">
             <input 
               className="flex-1 bg-surface-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
               placeholder="質問を入力..."
               value={chatInput}
               onChange={e => setChatInput(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && handleSendChat()}
               disabled={isStreaming}
             />
             <button 
               onClick={handleSendChat}
               disabled={!chatInput.trim() || isStreaming}
               className="p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-all shadow-lg shadow-primary-500/20"
             >
               <Send size={18} />
             </button>
           </div>
         </div>
      </div>
    </div>
  );
};

const DietView = ({ logs, onAddLog }: { logs: DietLog[], onAddLog: (log: DietLog) => void }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeFoodImage(null, description);
      const newLog: DietLog = {
        id: Date.now().toString(),
        timestamp: new Date(),
        foodName: result.foodName,
        advice: result.advice,
        macros: {
          calories: result.calories,
          protein: result.protein,
          fat: result.fat,
          carbs: result.carbs,
        },
        imageUrl: undefined
      };
      onAddLog(newLog);
      setIsModalOpen(false);
      setDescription('');
    } catch (e) {
      alert("分析に失敗しました");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-6 pb-32 animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-surface-900 tracking-tight">Nutrition Log</h2>
        <Button onClick={() => setIsModalOpen(true)} className="!rounded-full w-12 h-12 !p-0 shadow-xl shadow-primary-500/20">
          <Plus size={24} />
        </Button>
      </div>

      <div className="space-y-4">
        {logs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-surface-200 border-dashed">
            <Utensils className="mx-auto text-surface-300 mb-3" size={48} strokeWidth={1.5} />
            <p className="text-surface-400 font-medium">まだ記録がありません。<br/>右上のボタンから追加してください。</p>
          </div>
        ) : (
          [...logs].reverse().map(log => (
            <Card key={log.id} className="flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
               <StyledIcon icon={Utensils} colorClass="text-accent-500" bgClass="bg-accent-50" />
               <div className="flex-1">
                 <div className="flex justify-between items-start mb-1">
                   <h3 className="font-bold text-surface-900">{log.foodName}</h3>
                   <span className="text-xs font-bold text-surface-400">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                 </div>
                 <div className="flex gap-3 text-xs font-medium text-surface-500 mb-3">
                   <span className="text-surface-900 font-bold">{log.macros.calories} kcal</span>
                   <span>P: {log.macros.protein}g</span>
                   <span>F: {log.macros.fat}g</span>
                   <span>C: {log.macros.carbs}g</span>
                 </div>
                 <div className="bg-surface-50 p-3 rounded-xl flex gap-2 items-start">
                   <Sparkles size={14} className="text-primary-500 mt-0.5 shrink-0" strokeWidth={2} />
                   <p className="text-xs text-surface-600 leading-relaxed">{log.advice}</p>
                 </div>
               </div>
            </Card>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="食事を記録">
        <div className="space-y-6 p-6">
          <div className="bg-surface-50 border-2 border-dashed border-surface-200 rounded-2xl h-48 flex flex-col items-center justify-center text-surface-400 gap-2 cursor-pointer hover:bg-surface-100 hover:border-surface-300 transition-all">
            <Camera size={32} strokeWidth={1.5} />
            <span className="text-sm font-bold">写真を撮る / アップロード</span>
          </div>
          <div className="relative">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-surface-200"></span>
            <span className="relative bg-white px-3 text-xs font-bold text-surface-400 mx-auto block w-fit">または</span>
          </div>
          <Input 
            label="食事の内容" 
            placeholder="例: 鶏胸肉のサラダと玄米ご飯" 
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <Button onClick={handleAnalyze} isLoading={isAnalyzing} className="w-full py-4 shadow-lg shadow-primary-500/20">
            記録する
          </Button>
        </div>
      </Modal>
    </div>
  );
};

const ProgressView = ({ weightLogs, profile, onAddWeight }: { weightLogs: WeightLog[], profile: UserProfile, onAddWeight: (w: number) => void }) => {
  const [newWeight, setNewWeight] = useState('');

  const handleAdd = () => {
    if(newWeight) {
      onAddWeight(Number(newWeight));
      setNewWeight('');
    }
  };

  const chartData = weightLogs.map(l => ({ date: l.date.slice(5), weight: l.weight }));

  return (
    <div className="p-6 pb-32 animate-fade-in space-y-8">
      <h2 className="text-3xl font-bold text-surface-900 tracking-tight">Progress</h2>
      
      <Card title="Weight History" icon={TrendingUp} className="overflow-hidden shadow-lg shadow-surface-200/50">
        <div className="h-64 mt-4 -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#a8a29e', fontSize: 12}} dy={10} />
              <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{fill: '#a8a29e', fontSize: 12}} />
              <Tooltip 
                contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} 
                cursor={{stroke: '#22c55e', strokeWidth: 2}}
              />
              <ReferenceLine y={profile.targetWeight} stroke="#22c55e" strokeDasharray="3 3" label={{ value: 'Goal', fill: '#22c55e', fontSize: 10, position: 'insideTopRight' }} />
              <Line type="monotone" dataKey="weight" stroke="#1c1917" strokeWidth={3} dot={{r: 4, fill:'#1c1917', strokeWidth: 2, stroke:'#fff'}} activeDot={{r: 6}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="shadow-lg shadow-surface-200/50">
        <h3 className="font-bold text-lg text-surface-900 mb-4">今の体重を記録</h3>
        <div className="flex gap-3">
          <Input 
            type="number" 
            placeholder="kg" 
            value={newWeight}
            onChange={e => setNewWeight(e.target.value)}
            className="text-lg font-bold"
          />
          <Button onClick={handleAdd} className="px-6 whitespace-nowrap shadow-lg shadow-primary-500/20">記録</Button>
        </div>
      </Card>
    </div>
  );
};

// --- Main App Component ---

const App = () => {
  const [view, setView] = useState<AppView>(AppView.Auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [dietLogs, setDietLogs] = useState<DietLog[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  
  // Daily Encouragement
  const [dailyMessage, setDailyMessage] = useState<string>('');

  // Global Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [globalChatMessages, setGlobalChatMessages] = useState<ChatMessage[]>([]);
  const [globalChatInput, setGlobalChatInput] = useState('');
  const [isGlobalChatStreaming, setIsGlobalChatStreaming] = useState(false);
  const globalChatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load data
    const savedProfile = localStorage.getItem('profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
      setView(AppView.Dashboard);
    }

    const savedPlan = localStorage.getItem('workoutPlan');
    if (savedPlan) setWorkoutPlan(JSON.parse(savedPlan));

    const savedDiet = localStorage.getItem('dietLogs');
    if (savedDiet) setDietLogs(JSON.parse(savedDiet));

    const savedWeight = localStorage.getItem('weightLogs');
    if (savedWeight) setWeightLogs(JSON.parse(savedWeight));
  }, []);

  useEffect(() => {
    // Persist data
    if (profile) localStorage.setItem('profile', JSON.stringify(profile));
    if (workoutPlan) localStorage.setItem('workoutPlan', JSON.stringify(workoutPlan));
    localStorage.setItem('dietLogs', JSON.stringify(dietLogs));
    localStorage.setItem('weightLogs', JSON.stringify(weightLogs));
  }, [profile, workoutPlan, dietLogs, weightLogs]);

  // Generate Daily Encouragement
  useEffect(() => {
    const fetchEncouragement = async () => {
      if (!profile) return;
      const today = new Date().toLocaleDateString();
      const storedMsg = localStorage.getItem('dailyMessage');
      const storedDate = localStorage.getItem('dailyMessageDate');

      if (storedMsg && storedDate === today) {
        setDailyMessage(storedMsg);
      } else {
        const calories = dietLogs
          .filter(l => new Date(l.timestamp).toLocaleDateString() === today)
          .reduce((sum, l) => sum + l.macros.calories, 0);
        
        const msg = await generateDailyEncouragement(profile, calories, profile.recommendedCalories || 2000);
        setDailyMessage(msg);
        localStorage.setItem('dailyMessage', msg);
        localStorage.setItem('dailyMessageDate', today);
      }
    };
    fetchEncouragement();
  }, [profile, dietLogs]);

  useEffect(() => {
    if (isChatOpen) {
      globalChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [globalChatMessages, isChatOpen]);


  const handleOnboardingComplete = async (p: UserProfile) => {
    setProfile(p);
    try {
      const plan = await generateWorkoutPlan(p);
      setWorkoutPlan(plan);
      setView(AppView.Dashboard);
      
      // Initial welcome message for global chat
      setGlobalChatMessages([{
        id: 'init',
        role: 'ai',
        text: `こんにちは、${p.name}さん！専属トレーナーのBalanceAIです。トレーニングや食事のこと、なんでも相談してくださいね。`,
        timestamp: new Date()
      }]);
    } catch (e) {
      alert("プラン作成に失敗しました。もう一度お試しください。");
    }
  };

  const handleToggleExercise = (dayIdx: number, exIdx: number) => {
    if (!workoutPlan) return;
    const newPlan = { ...workoutPlan };
    const ex = newPlan.schedule[dayIdx].exercises[exIdx];
    ex.isCompleted = !ex.isCompleted;
    setWorkoutPlan(newPlan);
  };

  const caloriesConsumed = dietLogs
    .filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString())
    .reduce((a, b) => a + b.macros.calories, 0);

  const todaysWorkout = workoutPlan?.schedule[0]; // Simplified for demo to always show day 1
  const completedCount = todaysWorkout?.exercises.filter(e => e.isCompleted).length || 0;

  const handleSendGlobalChat = async () => {
    if (!globalChatInput.trim() || isGlobalChatStreaming || !profile) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: globalChatInput, timestamp: new Date() };
    setGlobalChatMessages(prev => [...prev, userMsg]);
    setGlobalChatInput('');
    setIsGlobalChatStreaming(true);

    const aiMsgId = (Date.now() + 1).toString();
    setGlobalChatMessages(prev => [...prev, { id: aiMsgId, role: 'ai', text: '', timestamp: new Date() }]);

    const stream = streamChatMessage([...globalChatMessages, userMsg], profile);
    
    let fullText = "";
    for await (const chunk of stream) {
      fullText += chunk;
      setGlobalChatMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: fullText } : m));
    }
    setIsGlobalChatStreaming(false);
  };


  return (
    <div className="max-w-md mx-auto min-h-screen bg-surface-50 relative overflow-hidden shadow-2xl">
      {view === AppView.Auth && (
        <AuthScreen 
          onNavigate={(v) => v === AppView.Onboarding ? setView(AppView.Onboarding) : null} 
          onLoginSuccess={() => setView(AppView.Dashboard)} 
        />
      )}

      {view === AppView.Onboarding && <Onboarding onComplete={handleOnboardingComplete} />}

      {view !== AppView.Auth && view !== AppView.Onboarding && profile && (
        <>
          {view === AppView.Dashboard && (
            <Dashboard 
              profile={profile} 
              onNavigate={setView} 
              caloriesConsumed={caloriesConsumed}
              todaysWorkout={todaysWorkout ? { focus: todaysWorkout.focus, count: todaysWorkout.exercises.length, completedCount } : undefined}
              dailyMessage={dailyMessage}
            />
          )}
          
          {view === AppView.Workout && (
            <WorkoutView plan={workoutPlan} onToggleExercise={handleToggleExercise} />
          )}

          {view === AppView.Diet && (
            <DietView logs={dietLogs} onAddLog={(l) => setDietLogs([...dietLogs, l])} />
          )}

          {view === AppView.Progress && (
             <ProgressView 
               weightLogs={weightLogs} 
               profile={profile} 
               onAddWeight={(w) => setWeightLogs([...weightLogs, { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], weight: w }])} 
             />
          )}

          {/* Global Floating Chat Button */}
          <button 
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-24 right-6 p-4 bg-surface-900 text-white rounded-full shadow-2xl shadow-surface-900/30 hover:scale-110 active:scale-95 transition-all z-40 animate-fade-in"
          >
            <MessageCircle size={24} strokeWidth={2} />
          </button>

          {/* Global Chat Modal */}
          <Modal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} title="BalanceAI Chat">
             <div className="flex flex-col h-[60vh]">
               <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-50">
                 {globalChatMessages.map(msg => (
                   <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                       msg.role === 'user' 
                         ? 'bg-surface-900 text-white rounded-br-none' 
                         : 'bg-white text-surface-900 border border-surface-200 rounded-bl-none shadow-sm'
                     }`}>
                       {msg.text}
                     </div>
                   </div>
                 ))}
                 <div ref={globalChatEndRef} />
               </div>
               <div className="p-4 bg-white border-t border-surface-100 flex gap-2">
                 <Input 
                   value={globalChatInput}
                   onChange={e => setGlobalChatInput(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && handleSendGlobalChat()}
                   placeholder="AIトレーナーに相談..."
                   className="!rounded-xl"
                   disabled={isGlobalChatStreaming}
                 />
                 <Button onClick={handleSendGlobalChat} disabled={!globalChatInput.trim() || isGlobalChatStreaming} className="!px-4 !rounded-xl">
                   <Send size={18} />
                 </Button>
               </div>
             </div>
          </Modal>

          {/* Navigation Bar */}
          <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-surface-200 px-6 py-3 flex justify-between items-center max-w-md mx-auto z-50 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            {[
              { icon: LayoutGrid, label: 'ホーム', view: AppView.Dashboard },
              { icon: Activity, label: '運動', view: AppView.Workout },
              { icon: Utensils, label: '食事', view: AppView.Diet },
              { icon: TrendingUp, label: '分析', view: AppView.Progress },
            ].map((item) => (
              <button 
                key={item.label}
                onClick={() => setView(item.view)}
                className={`flex flex-col items-center justify-center gap-1 w-14 transition-all duration-300 ${view === item.view ? 'text-primary-600' : 'text-surface-400 hover:text-surface-600'}`}
              >
                <div className={`transition-transform duration-300 ${view === item.view ? '-translate-y-0.5' : ''}`}>
                  <item.icon size={24} strokeWidth={view === item.view ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-bold tracking-wide transition-all duration-300 ${view === item.view ? 'opacity-100 translate-y-0' : 'opacity-70'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </nav>
        </>
      )}
    </div>
  );
};

export default App;
