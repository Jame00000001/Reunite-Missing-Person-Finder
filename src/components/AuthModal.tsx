import React, { useState } from 'react';
import { X, LogIn, UserPlus, AlertCircle, Shield, User as UserIcon, Lock, Mail, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}) => {
  const { login, register, signInWithGoogle, isLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (mode === 'login') {
      if (!email || !password) {
        setError('Please enter both email and password.');
        return;
      }
      const res = await login(email, password);
      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(res.message || 'Login failed.');
      }
    } else {
      if (!name || !email || !phone || !password) {
        setError('Please fill in all registration fields.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      const res = await register({ name, email, phone, password });
      if (res.success) {
        if (res.requiresEmailVerification) {
          setNotice(res.message);
          setMode('login');
          setPassword('');
          return;
        }
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(res.message || 'Registration failed.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setNotice(null);
    const res = await signInWithGoogle();
    if (res.success) {
      onSuccess?.();
      onClose();
    } else {
      setError(res.message || 'Google sign-in failed.');
    }
  };

  // Quick fill demo credentials
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 relative my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-6 h-6 text-blue-200" />
            <h2 className="text-xl font-black tracking-tight">Reunite Account</h2>
          </div>
          <p className="text-xs text-blue-100">
            {mode === 'login'
              ? 'Log in to manage reports, track cases, or access the admin panel.'
              : 'Create an account to submit and manage missing/found person reports.'}
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'text-blue-700 border-b-2 border-blue-600 bg-blue-50/50'
                : 'text-slate-500 hover:text-slate-900 bg-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'text-blue-700 border-b-2 border-blue-600 bg-blue-50/50'
                : 'text-slate-500 hover:text-slate-900 bg-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Register</span>
          </button>
        </div>

        {/* Error Banner */}
          {notice && (
            <div role="status" className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              {notice}
            </div>
          )}
          {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 mt-2"
          >
            {isLoading ? 'Please wait...' : mode === 'login' ? 'Sign In to Reunite' : 'Create Account'}
          </button>
        </form>

        <div className="px-6 pt-4">
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Or continue with</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-sm border border-slate-300 shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span aria-hidden="true" className="text-base font-black text-blue-600">G</span>
            {isLoading ? 'Please wait...' : 'Continue with Google'}
          </button>
          <p className="mt-2 text-center text-[11px] text-slate-500">
            Use Google sign-in if Email/Password is disabled for this Firebase project.
          </p>
        </div>

        {/* Firebase account guidance */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs">
          <p className="font-bold text-slate-700 mb-2 uppercase tracking-wider text-[10px]">
            Sign-in information
          </p>
          <p className="text-slate-600 leading-relaxed">
            Create an account with the Register option before signing in. Legacy MySQL demo credentials are not registered in Firebase Authentication.
          </p>
        </div>
      </div>
    </div>
  );
};
