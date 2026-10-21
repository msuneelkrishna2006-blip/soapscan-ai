import React, { useState } from 'react';
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
  Lock,
} from 'lucide-react';
import { CosmicBackground3D } from '../three/CosmicBackground3D';
import { UserProfile, AIStatus } from '../../types/soap';
import { loginUser, registerUser } from '../../lib/api';

interface CosmicAuthPortalProps {
  onAuthSuccess: (user: UserProfile) => void;
  aiStatus: AIStatus | null;
}

export const CosmicAuthPortal: React.FC<CosmicAuthPortalProps> = ({
  onAuthSuccess,
  aiStatus,
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
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWarping, setIsWarping] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState<UserProfile | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusNotice(null);

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
    const slowNoticeTimer = setTimeout(() => {
      setStatusNotice('Render backend waking from sleep (establishing secure link)...');
    }, 2000);

    try {
      if (authMode === 'register') {
        const response = await registerUser({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          householdName: householdName.trim() || undefined,
        });
        clearTimeout(slowNoticeTimer);
        setAuthenticatedUser(response.user);
      } else {
        const response = await loginUser({
          email: email.trim().toLowerCase(),
          password,
        });
        clearTimeout(slowNoticeTimer);
        setAuthenticatedUser(response.user);
      }

      // Trigger 3D camera warp transition
      setIsWarping(true);
    } catch (err: any) {
      clearTimeout(slowNoticeTimer);
      setStatusNotice(null);
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWarpComplete = () => {
    if (authenticatedUser) {
      onAuthSuccess(authenticatedUser);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none bg-obsidian-950">
      {/* 3D WebGL Cosmic Environment with Smooth Star Orbs & Soap Crystal */}
      <CosmicBackground3D
        mode="login"
        intensity="high"
        warpSpeed={isWarping}
        onWarpComplete={handleWarpComplete}
      />

      {/* Frosted Cosmic Glassmorphism Authentication Card */}
      <div
        className={`relative z-20 w-full max-w-md p-6 sm:p-8 rounded-3xl transition-all duration-700 ${
          isWarping
            ? 'opacity-0 scale-90 translate-y-8 pointer-events-none'
            : 'opacity-100 scale-100 translate-y-0'
        }`}
        style={{
          background: 'rgba(5, 14, 24, 0.78)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(0, 242, 254, 0.28)',
          boxShadow: '0 25px 60px -15px rgba(0, 229, 163, 0.22), 0 0 45px rgba(0, 242, 254, 0.16)',
        }}
      >
        {/* Glow Accent Border */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-radiant-teal/40 via-cyan-500/20 to-purple-500/40 rounded-3xl -z-10 blur-sm pointer-events-none animate-pulse" />

        {/* Brand Logo & Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-radiant-teal to-cyan-400 text-obsidian-950 shadow-lg shadow-radiant-teal/30 mb-1">
            <span className="text-3xl">🧼</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
              SoapScan <span className="text-transparent bg-clip-text bg-gradient-to-r from-radiant-teal to-cyan-400">AI</span>
            </h1>
            <p className="text-xs text-slate-300 font-medium mt-1">
              Smart Soap Usage &amp; 3D Digital Twin Consumption Tracker
            </p>
          </div>

          {/* AI Neural Engine Status Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-obsidian-900/80 border border-teal-800/40 text-[11px] text-slate-300 font-mono mt-1">
            <span
              className={`w-2 h-2 rounded-full ${
                aiStatus?.online ? 'bg-radiant-teal animate-ping' : 'bg-amber-400'
              }`}
            />
            <span>{aiStatus?.online ? 'Gemma 4 Local AI Connected' : 'Gemma 4 Standby'}</span>
            <span className="text-radiant-teal font-bold font-mono">11434</span>
          </div>
        </div>

        {/* Mode Switcher Tabs (Sign In / Create Account) */}
        <div className="flex p-1 bg-obsidian-900/90 rounded-2xl border border-teal-900/40 mb-6">
          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
              authMode === 'signin'
                ? 'bg-gradient-to-r from-radiant-teal to-cyan-400 text-obsidian-950 shadow-md shadow-radiant-teal/20'
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
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
              authMode === 'register'
                ? 'bg-gradient-to-r from-radiant-teal to-cyan-400 text-obsidian-950 shadow-md shadow-radiant-teal/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Cold Start Status Notice */}
        {statusNotice && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            <span>{statusNotice}</span>
          </div>
        )}

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-start gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {authMode === 'register' && (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 ml-1">
                  Your Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4 text-cyan-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-obsidian-900/80 border border-slate-700 focus:border-radiant-teal focus:ring-1 focus:ring-radiant-teal text-xs text-white placeholder-slate-500 focus:outline-none transition font-sans"
                    placeholder="e.g. Sunil Sharma"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 ml-1">
                  Household Name <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Home className="w-4 h-4 text-radiant-teal" />
                  </div>
                  <input
                    type="text"
                    value={householdName}
                    onChange={e => setHouseholdName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-obsidian-900/80 border border-slate-700 focus:border-radiant-teal focus:ring-1 focus:ring-radiant-teal text-xs text-white placeholder-slate-500 focus:outline-none transition font-sans"
                    placeholder="e.g. The Sharma Residence"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 ml-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4 text-cyan-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-obsidian-900/80 border border-slate-700 focus:border-radiant-teal focus:ring-1 focus:ring-radiant-teal text-xs text-white placeholder-slate-500 focus:outline-none transition font-mono"
                placeholder="you@household.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 ml-1">
              Password {authMode === 'register' && <span className="text-slate-500 font-normal">(min 6 chars)</span>}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <KeyRound className="w-4 h-4 text-purple-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-obsidian-900/80 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs text-white placeholder-slate-500 focus:outline-none transition font-mono"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {authMode === 'register' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 ml-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4 text-purple-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-obsidian-900/80 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs text-white placeholder-slate-500 focus:outline-none transition font-mono"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isWarping}
              className="w-full py-3.5 px-4 rounded-xl font-black text-sm text-obsidian-950 bg-gradient-to-r from-radiant-teal via-cyan-400 to-radiant-light hover:brightness-110 active:scale-[0.99] transition-all duration-200 shadow-xl shadow-radiant-teal/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>
                {isSubmitting
                  ? 'Verifying Credentials...'
                  : authMode === 'register'
                  ? 'Create Cosmic Account & Launch'
                  : 'Authenticate to Cosmic Workspace'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Footer Guarantee */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-radiant-teal" /> 100% User-Scoped Storage
          </span>
          <span className="font-mono text-cyan-400">Zero Fake Data</span>
        </div>
      </div>

      {/* Warp Speed Full-Screen Overlay */}
      {isWarping && (
        <div className="fixed inset-0 z-30 pointer-events-none flex flex-col items-center justify-center">
          <div className="text-center space-y-3 animate-pulse">
            <div className="w-16 h-16 mx-auto rounded-full bg-radiant-teal/20 border-2 border-radiant-teal flex items-center justify-center text-radiant-teal text-2xl shadow-2xl shadow-radiant-teal">
              ✨
            </div>
            <h2 className="text-2xl font-black text-white tracking-widest uppercase">
              Warping to Workspace...
            </h2>
            <p className="text-xs font-mono text-cyan-300">
              Loading authentic household database for {authenticatedUser?.name || 'User'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
