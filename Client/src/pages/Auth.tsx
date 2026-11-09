import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LockIcon, UserIcon, MailIcon, SparklesIcon, AlertCircleIcon, Loader2Icon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AurenMark } from '../components/AurenMark';
import { Button } from '../components/Button';

type Mode = 'login' | 'register';

export function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login form state
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regBio, setRegBio] = useState('');

  const from = (location.state as any)?.from?.pathname || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password) {
      setError('Please enter your username and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(usernameOrEmail.trim(), password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername.trim() || !regEmail.trim() || !regPassword || !regFullName.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await register({
        username: regUsername.trim(),
        email: regEmail.trim(),
        password: regPassword,
        fullName: regFullName.trim(),
        bio: regBio.trim(),
      });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-canvas px-4 py-12 text-label">
      <div className="ambient" aria-hidden="true" />
      <div className="noise" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        className="glass-strong relative z-10 w-full max-w-md rounded-[32px] p-7 md:p-9 shadow-2xl"
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <AurenMark size={48} />
          <h1 className="mt-4 text-[26px] font-semibold tracking-[-0.03em] text-white">
            Welcome to Auren
          </h1>
          <p className="mt-1 text-[14px] text-label-secondary">
            {mode === 'login'
              ? 'Sign in to access chats, stories, and rooms.'
              : 'Create an account to join the network.'}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="mt-6 flex rounded-full bg-white/[0.05] p-1 border border-white/[0.07]">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 rounded-full py-2 text-[14px] font-medium transition-all duration-200 ${
              mode === 'login'
                ? 'bg-white/[0.12] text-white shadow-sm'
                : 'text-label-tertiary hover:text-label'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 rounded-full py-2 text-[14px] font-medium transition-all duration-200 ${
              mode === 'register'
                ? 'bg-white/[0.12] text-white shadow-sm'
                : 'text-label-tertiary hover:text-label'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 flex items-center gap-2.5 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-[13px] text-danger"
            >
              <AlertCircleIcon className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-4">
            <div>
              <label className="block text-[13px] font-medium text-label-secondary mb-1.5">
                Username or Email
              </label>
              <div className="glass-pill flex h-12 items-center gap-3 rounded-2xl px-4 transition-[box-shadow,border-color] duration-150 focus-within:border-accent/40 focus-within:shadow-[0_0_0_3px_rgba(90,130,255,0.15)]">
                <UserIcon className="h-4 w-4 text-label-tertiary" />
                <input
                  type="text"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="Enter username or email"
                  autoComplete="username"
                  required
                  className="w-full bg-transparent text-[15px] outline-none placeholder:text-label-quaternary"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-label-secondary mb-1.5">
                Password
              </label>
              <div className="glass-pill flex h-12 items-center gap-3 rounded-2xl px-4 transition-[box-shadow,border-color] duration-150 focus-within:border-accent/40 focus-within:shadow-[0_0_0_3px_rgba(90,130,255,0.15)]">
                <LockIcon className="h-4 w-4 text-label-tertiary" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full bg-transparent text-[15px] outline-none placeholder:text-label-quaternary"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="mt-3 w-full"
            >
              {loading ? (
                <>
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  Signing In…
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="mt-6 flex flex-col gap-3.5">
            <div>
              <label className="block text-[12px] font-medium text-label-secondary mb-1">
                Full Name
              </label>
              <div className="glass-pill flex h-11 items-center gap-2.5 rounded-2xl px-3.5 focus-within:border-accent/40">
                <SparklesIcon className="h-4 w-4 text-label-tertiary" />
                <input
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. Elena Vance"
                  required
                  className="w-full bg-transparent text-[14px] outline-none placeholder:text-label-quaternary"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-label-secondary mb-1">
                Username
              </label>
              <div className="glass-pill flex h-11 items-center gap-2.5 rounded-2xl px-3.5 focus-within:border-accent/40">
                <UserIcon className="h-4 w-4 text-label-tertiary" />
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value.toLowerCase())}
                  placeholder="e.g. elenavance"
                  required
                  className="w-full bg-transparent text-[14px] outline-none placeholder:text-label-quaternary"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-label-secondary mb-1">
                Email
              </label>
              <div className="glass-pill flex h-11 items-center gap-2.5 rounded-2xl px-3.5 focus-within:border-accent/40">
                <MailIcon className="h-4 w-4 text-label-tertiary" />
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="elena@example.com"
                  required
                  className="w-full bg-transparent text-[14px] outline-none placeholder:text-label-quaternary"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-label-secondary mb-1">
                Password (min. 6 characters)
              </label>
              <div className="glass-pill flex h-11 items-center gap-2.5 rounded-2xl px-3.5 focus-within:border-accent/40">
                <LockIcon className="h-4 w-4 text-label-tertiary" />
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-transparent text-[14px] outline-none placeholder:text-label-quaternary"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-label-secondary mb-1">
                Bio (optional)
              </label>
              <div className="glass-pill flex h-11 items-center gap-2.5 rounded-2xl px-3.5 focus-within:border-accent/40">
                <input
                  type="text"
                  value={regBio}
                  onChange={(e) => setRegBio(e.target.value)}
                  placeholder="A few words about you"
                  className="w-full bg-transparent text-[14px] outline-none placeholder:text-label-quaternary"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="mt-2 w-full"
            >
              {loading ? (
                <>
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  Creating Account…
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

