import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  HeartPulse, Lock, Mail, User, Eye, EyeOff, 
  ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, 
  Loader2, KeyRound, Sparkles, Home 
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';

  const { 
    user, loginWithEmail, loginWithGoogle, signupAdmin, 
    resetPassword, error, clearError, quickDemoLogin 
  } = useAdminAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
        navigate(from, { replace: true });
      } else if (mode === 'signup') {
        if (!displayName.trim()) {
          setLocalError('Please enter your full name');
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setLocalError('Password must be at least 6 characters');
          setIsSubmitting(false);
          return;
        }
        await signupAdmin(email, password, displayName);
        navigate(from, { replace: true });
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setResetSent(true);
      }
    } catch (err: any) {
      setLocalError(err.message || 'An error occurred during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLocalError(null);
    clearError();
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err: any) {
      setLocalError(err.message || 'Google login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async () => {
    setLocalError(null);
    clearError();
    setIsSubmitting(true);
    try {
      await quickDemoLogin();
      navigate(from, { replace: true });
    } catch (err: any) {
      setLocalError(err.message || 'Quick sign-in error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeError = localError || error;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-primary-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-800"
        >
          <Home size={14} />
          <span>Back to Main Website</span>
        </Link>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck size={16} className="text-primary-400" />
          <span>HIPAA-Compliant Portal</span>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 text-white shadow-xl shadow-primary-600/30 mb-4 border border-primary-400/30">
            <HeartPulse size={28} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Newark Medical Associates
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {mode === 'login' && 'Administrative Management & CMS Portal'}
            {mode === 'signup' && 'Register New Administrator Account'}
            {mode === 'forgot' && 'Reset Your Administrator Password'}
          </p>
        </div>

        {/* Form Container */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/90 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-800"
        >
          {/* Mode Switcher Tabs */}
          {mode !== 'forgot' && (
            <div className="flex rounded-xl bg-slate-950/70 p-1 mb-6 border border-slate-800">
              <button
                type="button"
                onClick={() => { setMode('login'); setLocalError(null); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'login' 
                    ? 'bg-primary-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setLocalError(null); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'signup' 
                    ? 'bg-primary-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Register Admin
              </button>
            </div>
          )}

          {/* Error Message */}
          {activeError && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-start gap-2.5"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-400" />
              <div className="flex-1">{activeError}</div>
            </motion.div>
          )}

          {/* Reset Sent Success */}
          {mode === 'forgot' && resetSent ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-emerald-950 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-800">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Password Reset Sent</h3>
              <p className="text-slate-400 text-xs mb-6 leading-relaxed">
                We've dispatched password recovery instructions to <span className="text-white font-mono">{email}</span>.
              </p>
              <button
                type="button"
                onClick={() => { setMode('login'); setResetSent(false); }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs py-2.5 rounded-xl transition-colors"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name for Signup */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Full Name & Title
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Dr. Deval Gadhvi"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@newarkmed.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-slate-300">
                      Password
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => { setMode('forgot'); setLocalError(null); }}
                        className="text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-lg shadow-primary-600/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {mode === 'login' && 'Sign In to Admin Portal'}
                        {mode === 'signup' && 'Create Administrator Profile'}
                        {mode === 'forgot' && 'Send Password Reset Email'}
                      </span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>

              {mode === 'forgot' && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setLocalError(null); }}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Back to Sign In
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Social / OAuth & Demo Quick Login Section */}
          {mode !== 'forgot' && (
            <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
              {/* Google Sign-in */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full bg-slate-950 hover:bg-slate-800 text-white border border-slate-700 font-medium text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Instant 1-Click Demo Login */}
              <button
                type="button"
                onClick={handleQuickDemo}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-primary-900/50 to-teal-900/50 hover:from-primary-900/80 hover:to-teal-900/80 text-primary-200 border border-primary-700/50 font-semibold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 group"
              >
                <Sparkles size={14} className="text-primary-400 group-hover:scale-110 transition-transform" />
                <span>1-Click Test Admin Sign-In (Demo)</span>
              </button>
            </div>
          )}
        </motion.div>

        {/* Security & Copyright Footer */}
        <div className="mt-8 text-center text-xs text-slate-500 space-y-1">
          <p>© {new Date().getFullYear()} Newark Medical Associates • All Rights Reserved</p>
          <p className="text-[11px] text-slate-600">Authorized personnel only. All access is audited and encrypted.</p>
        </div>
      </div>
    </div>
  );
}
