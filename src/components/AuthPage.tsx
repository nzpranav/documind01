import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { User } from '../types/index.ts';

interface AuthPageProps {
  onAuthSuccess: (user: User, token: string) => void;
  onContinueAsGuest?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess, onContinueAsGuest }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFillDemo = (type: 'reshma' | 'demo') => {
    if (type === 'reshma') {
      setEmail('reshmathakre278@gmail.com');
      setPassword('password123');
    } else {
      setEmail('demo@documind.ai');
      setPassword('password123');
    }
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (mode === 'register') {
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload =
        mode === 'login'
          ? { email: email.trim(), password }
          : { email: email.trim(), password, name: name.trim() || email.split('@')[0] };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please check credentials.');
      }

      // Save token and inform parent
      localStorage.setItem('documind_token', data.token);
      onAuthSuccess(data.user, data.token);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#eaf0fc] flex items-center justify-center p-3 sm:p-6 md:p-10 font-sans selection:bg-blue-200">
      {/* Decorative Organic Periwinkle Blobs in background matching mockup */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#cbdcf9] opacity-70 blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 -right-20 w-[480px] h-[480px] rounded-full bg-[#bcd3f8] opacity-80 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/4 w-[520px] h-[520px] rounded-full bg-[#c2d7f8] opacity-75 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-[#dbe8fc] opacity-90 blur-2xl pointer-events-none" />

      {/* Main Container Card matching the mockup rounded rectangle with blue border */}
      <div className="relative w-full max-w-5xl bg-white rounded-[32px] sm:rounded-[44px] border-[2.5px] border-[#2558d1] shadow-2xl shadow-blue-900/15 overflow-hidden z-10 flex flex-col lg:flex-row">
        {/* Left Column: Form Section */}
        <div className="w-full lg:w-[45%] p-8 sm:p-12 lg:p-14 flex flex-col justify-between z-10 bg-white">
          <div>
            {/* Top Brand Logo */}
            <div className="flex items-center gap-2 mb-10">
              <span className="font-extrabold tracking-widest text-slate-800 text-sm uppercase">
                REERUI
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                DocuMind AI
              </span>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1.5 mb-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#192b4d] tracking-tight">
                {mode === 'login' ? 'Login' : 'Register'}
              </h1>
              <p className="text-xs text-slate-400 font-normal leading-relaxed">
                {mode === 'login'
                  ? 'Welcome to log in to your background management system.'
                  : 'Create an account to start analyzing documents with verifiable AI.'}
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === 'register' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Reshma Thakre"
                    className="w-full py-2 px-0 text-sm text-slate-800 border-b border-slate-300 focus:border-[#2b66ec] focus:outline-none transition bg-transparent placeholder:text-slate-300"
                  />
                </div>
              )}

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="1185780732@qq.com"
                  required
                  className="w-full py-2 px-0 text-sm text-slate-800 border-b border-slate-300 focus:border-[#2b66ec] focus:outline-none transition bg-transparent placeholder:text-slate-300"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Please enter your password"
                    required
                    className="w-full py-2 pr-8 px-0 text-sm text-slate-800 border-b border-slate-300 focus:border-[#2b66ec] focus:outline-none transition bg-transparent placeholder:text-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    required
                    className="w-full py-2 px-0 text-sm text-slate-800 border-b border-slate-300 focus:border-[#2b66ec] focus:outline-none transition bg-transparent placeholder:text-slate-300"
                  />
                </div>
              )}

              {/* Submit Button matching the exact solid blue pill/rect button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-32 py-2.5 px-6 rounded-lg bg-[#2b66ec] hover:bg-[#2052c4] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-500/25 transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : mode === 'login' ? (
                    'LOGIN'
                  ) : (
                    'REGISTER'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer & Mode Switcher */}
          <div className="pt-8 space-y-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{mode === 'login' ? "Don't have an account?" : 'Already have an account?'}</span>
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setErrorMessage('');
                }}
                className="text-blue-600 font-semibold hover:underline"
              >
                {mode === 'login' ? 'Sign Up' : 'Log In'}
              </button>
            </div>

            {/* Quick Demo Fill Buttons for convenience */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Quick 1-Click Credentials:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleFillDemo('reshma')}
                  className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg transition"
                >
                  Reshma Thakre (Admin)
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('demo')}
                  className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg transition"
                >
                  Demo User
                </button>
                {onContinueAsGuest && (
                  <button
                    type="button"
                    onClick={onContinueAsGuest}
                    className="px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 transition ml-auto"
                  >
                    Guest Mode →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Illustration Artwork matching the uploaded design */}
        <div className="w-full lg:w-[55%] relative min-h-[380px] lg:min-h-full bg-gradient-to-br from-[#ebf3ff] via-[#dceaff] to-[#c9dffc] overflow-hidden flex items-center justify-center p-6 sm:p-10">
          {/* Subtle soft backdrop circles */}
          <div className="absolute w-72 h-72 rounded-full bg-white/40 blur-2xl top-1/4 left-1/4 pointer-events-none" />

          {/* Embedded Hero Illustration from the provided image */}
          <div className="relative w-full h-full max-h-[500px] flex items-center justify-center">
            <img
              src="/assets/aistudio/image_abe14549.png"
              alt="Management and Document Intelligence Illustration"
              className="w-full h-auto max-h-[460px] object-contain drop-shadow-sm select-none"
            />
          </div>

          {/* Feature Badge Overlay */}
          <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-blue-200 shadow-sm flex items-center gap-1.5 text-[11px] font-semibold text-blue-900">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Verified Document Intelligence</span>
          </div>
        </div>
      </div>
    </div>
  );
};
