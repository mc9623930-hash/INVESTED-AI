import { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { TrendingUp, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface ForgotForm {
  email: string;
}

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<ForgotForm>();

  const onSubmit = async (data: ForgotForm) => {
    try {
      setLoading(true);
      await resetPassword(data.email);
      setSent(true);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      if (code.includes('user-not-found') || code.includes('invalid-email')) {
        toast.error('No account found with that email.');
      } else if (code.includes('too-many-requests')) {
        toast.error('Too many requests. Please wait a moment.');
      } else {
        toast.error('Could not send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 brand-gradient items-center justify-center p-12">
        <div className="text-white text-center">
          <div className="w-20 h-20 rounded-3xl bg-white/20 border border-white/30 flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black mb-4">InvesEd AI</h1>
          <p className="text-white/80 text-xl max-w-sm">
            We'll send a password reset link straight to your inbox.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-primary">InvesEd AI</span>
          </div>

          {!sent ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-black text-foreground">Forgot password?</h2>
                <p className="text-muted-foreground mt-1">
                  Enter your email and we'll send a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /^[^@]+@[^@]+\.[^@]+$/, message: 'Invalid email' },
                      })}
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 brand-gradient text-white font-bold rounded-xl shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </motion.button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-black mb-2">Check your inbox</h3>
              <p className="text-muted-foreground text-sm mb-1">
                We sent a reset link to
              </p>
              <p className="font-semibold text-primary mb-6">{getValues('email')}</p>
              <p className="text-xs text-muted-foreground mb-6">
                Didn't get it? Check your spam folder or{' '}
                <button
                  onClick={() => setSent(false)}
                  className="text-secondary underline hover:no-underline"
                >
                  try again
                </button>
                .
              </p>
            </motion.div>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-3 h-3" />
              Back to sign in
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
