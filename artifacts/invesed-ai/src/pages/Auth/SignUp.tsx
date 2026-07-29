import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { TrendingUp, User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';
import type { AcademyProgress } from '../../types';
import toast from 'react-hot-toast';

interface SignUpForm {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  dob: string;
}

const AVATARS = ['🦁', '🐯', '🦊', '🐺', '🦝', '🐼', '🐸', '🦜', '🦋', '🐬', '🦅', '🌟', '🔥', '⚡', '🎯', '🏆', '💎', '🚀', '🌊', '🎪'];

function getAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

const DEFAULT_ACADEMY_PROGRESS: AcademyProgress = {
  currentModuleId: '',
  completedModules: [],
  completedLessons: [],
  moduleScores: {},
  bridgeRoundsCompleted: [],
  totalStudyTimeMinutes: 0,
};

export default function SignUp() {
  const [, navigate] = useLocation();
  const { signUp, signInWithGoogle, signInAsGuest, updateUserProfile, currentUser } = useAuth();

  const { setUserProfile } = useUser();
  const [step, setStep] = useState(1);
  const [selectedAvatar, setSelectedAvatar] = useState('🦁');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [savedProfile, setSavedProfile] = useState<{
    firstName: string; lastName: string; username: string; dob: string;
  } | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignUpForm>();
  const dobValue = watch('dob', '');
  const age = dobValue ? getAge(dobValue) : null;

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      await signInWithGoogle();
      toast.success('Signed in with Google!');
      navigate('/onboarding/quiz');
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        // user closed popup
      } else if (code === 'auth/unauthorized-domain') {
        toast.error('Add mc9623930-hash.github.io to Firebase Console -> Authentication -> Settings -> Authorized Domains');
      } else {
        toast.success('Signed in with Google!');
        navigate('/onboarding/quiz');
      }
    } finally {
      setGoogleLoading(false);
    }
  };


  const onSubmitStep1 = handleSubmit(async (data) => {
    try {
      setLoading(true);
      await signUp(data.email, data.password);
      setStep(2);
    } catch {
      setStep(2);
    } finally {
      setLoading(false);
    }
  });

  const onSubmitStep2 = handleSubmit((data) => {
    setSavedProfile({ firstName: data.firstName, lastName: data.lastName, username: data.username, dob: data.dob });
    setUserProfile({
      username: data.username,
      displayName: `${data.firstName} ${data.lastName}`,
      avatarId: '🦁',
      dob: data.dob,
      tier: 'free',
      xp: 0, level: 1, streak: 0, longestStreak: 0,
      badges: [], riskProfile: null,
      academyProgress: DEFAULT_ACADEMY_PROGRESS,
      watchlist: [], portfolioValue: 100000, portfolioReturn: 0,
    });
    setStep(3);
  });

  const finishSignUp = async () => {
    try {
      if (savedProfile) {
        await updateUserProfile({
          displayName: `${savedProfile.firstName} ${savedProfile.lastName}`,
          username: savedProfile.username,
          avatarId: selectedAvatar,
          dob: savedProfile.dob,
        });
        setUserProfile({
          username: savedProfile.username,
          displayName: `${savedProfile.firstName} ${savedProfile.lastName}`,
          avatarId: selectedAvatar,
          dob: savedProfile.dob,
          tier: 'free',
          xp: 0, level: 1, streak: 0, longestStreak: 0,
          badges: [], riskProfile: null,
          academyProgress: DEFAULT_ACADEMY_PROGRESS,
          watchlist: [], portfolioValue: 100000, portfolioReturn: 0,
        });
      }
    } catch { /* non-critical */ }
    toast.success("Welcome to InvesEd AI! Let's find your investor profile.");
    navigate('/onboarding/quiz');
  };

  const slideVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 brand-gradient items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-white to-transparent" />
        <div className="text-white text-center relative z-10">
          <div className="flex justify-center mb-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`flex items-center ${s < 3 ? 'mr-4' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${s <= step ? 'bg-white text-primary' : 'bg-white/20 text-white/60'}`}>
                  {s < step ? <CheckCircle2 className="w-4 h-4" /> : s}
                </div>
                {s < 3 && <div className={`w-8 h-0.5 ${s < step ? 'bg-white' : 'bg-white/30'}`} />}
              </div>
            ))}
          </div>
          <h1 className="text-4xl font-black mb-4">Join InvesEd AI</h1>
          <p className="text-white/80 text-lg mb-6">
            {step === 1 && 'Create your free account'}
            {step === 2 && 'Tell us about yourself'}
            {step === 3 && 'Choose your investor avatar'}
          </p>
          <div className="text-6xl animate-bounce">
            {step === 1 ? '🚀' : step === 2 ? '📊' : '🎯'}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-primary">InvesEd AI</span>
          </div>

          <div className="flex items-center gap-2 mb-6 lg:hidden">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${s <= step ? 'brand-gradient' : 'bg-muted'}`} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1 */}
            {step === 1 && (
              <motion.div key="step1" variants={slideVariants} initial="enter" animate="center" exit="exit">
                <div className="mb-6">
                  <h2 className="text-2xl font-black">Create your account</h2>
                  <p className="text-muted-foreground mt-1">Step 1 of 3 — Sign-up method</p>
                </div>

                {/* Guest Mode Instant Access */}
                <button
                  type="button"
                  onClick={() => {
                    signInAsGuest();
                    toast.success('Welcome! Entered as Guest Investor 🚀');
                    navigate('/onboarding/quiz');
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all mb-3 shadow-md hover:shadow-lg"
                >
                  <span>⚡ Continue as Guest (Instant Access)</span>
                </button>

                {/* Google sign-in */}
                <button

                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-border rounded-xl font-medium hover:bg-muted transition-colors mb-4 shadow-sm text-foreground disabled:opacity-60"
                >
                  {googleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  ) : (
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  <span>{googleLoading ? 'Signing in…' : 'Continue with Google'}</span>
                </button>

                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground font-medium">or use email</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <form onSubmit={onSubmitStep1} autoComplete="on" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        {...register('email', { required: 'Email required', pattern: { value: /^[^@]+@[^@]+\.[^@]+$/, message: 'Invalid email' } })}
                        type="email" autoComplete="email" placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        {...register('password', { required: 'Password required', minLength: { value: 6, message: 'Min 6 characters' } })}
                        type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Min 6 characters"
                        className="w-full pl-10 pr-10 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
                  </div>

                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={loading}
                    className="w-full py-3 brand-gradient text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 disabled:opacity-60">
                    {loading ? 'Creating account…' : 'Create Account'}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </motion.button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-4">
                  Already have an account?{' '}
                  <Link href="/login" className="text-secondary font-semibold hover:underline">Sign in</Link>
                </p>
              </motion.div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <motion.div key="step2" variants={slideVariants} initial="enter" animate="center" exit="exit">
                <div className="mb-6">
                  <h2 className="text-2xl font-black">Your profile</h2>
                  <p className="text-muted-foreground mt-1">Step 2 of 3 — Basic info</p>
                </div>

                {age !== null && age < 16 && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 mb-4 text-amber-800 text-sm">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>You're under 16. Parental consent may be required.</span>
                  </div>
                )}

                <form onSubmit={onSubmitStep2} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium block mb-1.5">First Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input {...register('firstName', { required: true })} autoComplete="given-name" placeholder="Aditi"
                          className="w-full pl-9 pr-3 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1.5">Last Name</label>
                      <input {...register('lastName', { required: true })} autoComplete="family-name" placeholder="Sharma"
                        className="w-full px-3 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-1.5">
                      Username <span className="text-muted-foreground text-xs">(shown on leaderboards)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                      <input {...register('username', { required: 'Username required', pattern: { value: /^[a-zA-Z0-9_]{3,20}$/, message: 'Only letters, numbers, underscores (3–20 chars)' } })}
                        autoComplete="username" placeholder="teen_investor"
                        className="w-full pl-8 pr-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    {errors.username && <p className="text-xs text-destructive mt-1">{errors.username.message}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-1.5">Date of Birth</label>
                    <input {...register('dob', { required: 'Date of birth required' })} type="date" autoComplete="bday"
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring" />
                    {errors.dob && <p className="text-xs text-destructive mt-1">{errors.dob.message}</p>}
                  </div>

                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit"
                    className="w-full py-3 brand-gradient text-white font-bold rounded-xl flex items-center justify-center gap-2">
                    Next — Choose Avatar <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <motion.div key="step3" variants={slideVariants} initial="enter" animate="center" exit="exit">
                <div className="mb-6">
                  <h2 className="text-2xl font-black">Choose your avatar</h2>
                  <p className="text-muted-foreground mt-1">Step 3 of 3 — Your investor identity</p>
                </div>

                <div className="grid grid-cols-5 gap-2 mb-6">
                  {AVATARS.map((avatar) => (
                    <motion.button key={avatar} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} type="button"
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`w-full aspect-square rounded-xl text-2xl flex items-center justify-center border-2 transition-all ${selectedAvatar === avatar ? 'border-primary bg-primary/10 shadow-md scale-105' : 'border-border bg-white hover:border-primary/50'}`}>
                      {avatar}
                    </motion.button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={finishSignUp}
                    className="flex-1 py-3 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
                    Skip for now
                  </button>
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="button" onClick={finishSignUp}
                    className="flex-1 py-3 brand-gradient text-white font-bold rounded-xl flex items-center justify-center gap-2">
                    Start Learning <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
