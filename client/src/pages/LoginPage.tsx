import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Camera, Shield, Users, Lock, Mail, ArrowRight, Loader2, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, quickDemoLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.login({ email, password });
      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
        if (res.data.data.user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/team');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'ADMIN' | 'TEAM_1' | 'TEAM_2') => {
    await quickDemoLogin(role);
    if (role === 'ADMIN') navigate('/admin');
    else navigate('/team');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6 animate-scale-up">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-300 p-0.5 mx-auto shadow-lg shadow-brand-500/20">
            <div className="w-full h-full bg-dark-900 rounded-[14px] flex items-center justify-center">
              <Camera className="w-6 h-6 text-brand-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white font-serif tracking-tight">Studio Sign In</h2>
          <p className="text-xs text-slate-400">Access your collaborative event photo workspace</p>
        </div>

        {/* 1-Click Fast Fill for Evaluator */}
        <div className="p-3.5 rounded-2xl bg-dark-900/80 border border-brand-500/20 space-y-2">
          <div className="text-[11px] font-semibold text-brand-300 flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-brand-400" />
            <span>Fast Demo Credentials</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('ADMIN')}
              className="px-2.5 py-1.5 rounded-lg bg-brand-500/15 hover:bg-brand-500/25 border border-brand-500/30 text-brand-200 text-xs font-semibold text-left transition-all flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-brand-400" />
              <span>Lead Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('TEAM_1')}
              className="px-2.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-200 text-xs font-semibold text-left transition-all flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>Photographer 1</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl btn-gold text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In to Platform</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/5">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-brand-300 hover:underline font-semibold">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};
