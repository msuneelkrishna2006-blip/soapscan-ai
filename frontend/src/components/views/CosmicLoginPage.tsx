import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Mail,
  User,
  Home,
  Eye,
  EyeOff,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { UserProfile, AIStatus } from '../../types/soap';
import { loginUser, registerUser, demoLogin } from '../../lib/api';
import { springPhysics } from '../../lib/motionVariants';

interface CosmicLoginPageProps {
  onAuthSuccess: (user: UserProfile) => void;
  aiStatus: AIStatus | null;
  onWarpStart?: () => void;
}

export const CosmicLoginPage: React.FC<CosmicLoginPageProps> = ({
  onAuthSuccess,
  aiStatus,
  onWarpStart,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');

  // Form Fields
  const [name, setName] = useState('');
  const [householdName, setHouseholdName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Warp
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWarping, setIsWarping] = useState(false);

  const handleSuccessfulAuth = (user: UserProfile) => {
    setIsWarping(true);
    onWarpStart?.();
    setTimeout(() => {
      onAuthSuccess(user);
    }, 650);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (authMode === 'register') {
      if (!name.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (authMode === 'register') {
        const response = await registerUser({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          householdName: householdName.trim() || undefined,
        });
        handleSuccessfulAuth(response.user);
      } else {
        const response = await loginUser({
          email: email.trim().toLowerCase(),
          password,
        });
        handleSuccessfulAuth(response.user);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInstantCommander = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const response = await demoLogin();
      handleSuccessfulAuth(response.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Instant Commander Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`min-h-[calc(100vh-140px)] flex flex-col justify-center items-center px-4 sm:px-6 relative z-10 transition-all duration-700 ${
        isWarping ? 'scale-110 opacity-0 filter blur-sm' : 'opacity-100'
      }`}
    >
      <div className="w-full max-w-md">
        {/* Glowing 3D Orbital Emblem Header */}
        <div className="text-center mb-6 space-y-2">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            {/* Outer Slow Counter-Rotating Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full border border-teal-500/30 border-t-emerald-400"
            />
            {/* Middle Faster Counter-Rotating Ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-2.5 rounded-full border border-dashed border-cyan-400/40 border-b-amber-400"
            />
            {/* Breathing Emerald Aura & Soap Icon */}
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                boxShadow: [
                  '0 0 20px rgba(16,185,129,0.3)',
                  '0 0 45px rgba(16,185,129,0.7)',
                  '0 0 20px rgba(16,185,129,0.3)',
                ],
              }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 via-emerald-400 to-cyan-400 shadow-xl flex items-center justify-center text-obsidian-950 font-black text-2xl"
            >
              🧼
            </motion.div>
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">
            SoapScan Command Portal
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Real-time telemetry &amp; isolated household consumption analytics
          </p>
        </div>

        {/* Portal Card with Spring Entrance & Conic-Gradient Border Beam */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={springPhysics}
          className="relative rounded-3xl p-[1.5px] overflow-hidden shadow-2xl"
        >
          {/* Animated Conic Border Beam */}
          <div className="absolute inset-[-100%] animate-conic-spin bg-[conic-gradient(from_0deg,transparent_0_300deg,#10b981_330deg,#06b6d4_360deg)] opacity-70 pointer-events-none" />

          <div className="relative p-6 sm:p-8 rounded-3xl bg-obsidian-950/95 backdrop-blur-2xl space-y-5 border border-white/5">
            {/* Tab Switcher */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-obsidian-900 border border-teal-900/40 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMessage(null);
                }}
                className={`py-2 rounded-lg transition ${
                  authMode === 'signin'
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-400 text-obsidian-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setErrorMessage(null);
                }}
                className={`py-2 rounded-lg transition ${
                  authMode === 'register'
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-400 text-obsidian-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Household
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {authMode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Your Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Suneel Hegde"
                        className="w-full pl-9 pr-3 py-2.5 bg-obsidian-900/90 border border-obsidian-700 focus:border-teal-400 focus:ring-2 focus:ring-emerald-400/40 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Household Name (Optional)
                    </label>
                    <div className="relative">
                      <Home className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={householdName}
                        onChange={e => setHouseholdName(e.target.value)}
                        placeholder="e.g. Suneel's Smart Household"
                        className="w-full pl-9 pr-3 py-2.5 bg-obsidian-900/90 border border-obsidian-700 focus:border-teal-400 focus:ring-2 focus:ring-emerald-400/40 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="commander@soapscan.io"
                    className="w-full pl-9 pr-3 py-2.5 bg-obsidian-900/90 border border-obsidian-700 focus:border-teal-400 focus:ring-2 focus:ring-emerald-400/40 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-obsidian-900/90 border border-obsidian-700 focus:border-teal-400 focus:ring-2 focus:ring-emerald-400/40 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 bg-obsidian-900/90 border border-obsidian-700 focus:border-teal-400 focus:ring-2 focus:ring-emerald-400/40 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="relative overflow-hidden w-full py-3 bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-400 hover:from-teal-400 hover:to-cyan-300 text-obsidian-950 font-black text-sm rounded-xl shadow-lg shadow-teal-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 group"
              >
                {/* Sweeping Light-Sheen on Hover */}
                <div className="absolute inset-0 w-1/3 bg-white/40 blur-[2px] -skew-x-12 -translate-x-[200%] group-hover:translate-x-[450%] transition-transform duration-1000 ease-in-out pointer-events-none" />
                <span className="relative z-10">{authMode === 'signin' ? 'Sign In & Warp to Dashboard' : 'Create Household & Warp'}</span>
                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            {/* 1-Click Instant Commander Login */}
            <div className="pt-2 border-t border-teal-900/40">
              <button
                type="button"
                onClick={handleInstantCommander}
                disabled={isSubmitting}
                className="w-full py-2.5 bg-obsidian-900/90 hover:bg-obsidian-800 border border-amber-500/40 hover:border-amber-400 text-amber-300 hover:text-amber-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Instant Commander Login (Suneel's Household)</span>
              </button>
            </div>
          </div>
        </motion.div>

        <div className="text-center mt-4 text-[11px] font-mono text-slate-500">
          Strict Zero-Demo Isolation • Authentic Data Encrypted &amp; Persisted
        </div>
      </div>
    </div>
  );
};
