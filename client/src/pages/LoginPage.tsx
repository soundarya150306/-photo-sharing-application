import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Camera, Shield, Users, Lock, Mail, ArrowRight, Loader2, Sparkles, Key, CheckCircle2, ChevronDown } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoadingRole, setDemoLoadingRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);

  const { login, quickDemoLogin } = useAuth();
  const navigate = useNavigate();

  const handle1ClickDemo = async (role: 'ADMIN' | 'TEAM_1' | 'TEAM_2' | 'TEAM_3') => {
    setDemoLoadingRole(role);
    setError(null);

    try {
      const user = await quickDemoLogin(role);
      if (user) {
        if (user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/team');
        }
      } else {
        setError('Demo login was unable to establish a session. Please check that the server is running.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Demo login failed. Please try again.');
    } finally {
      setDemoLoadingRole(null);
    }
  };

  const autofillCredentials = (role: 'ADMIN' | 'TEAM_1' | 'TEAM_2') => {
    setShowManualForm(true);
    if (role === 'ADMIN') {
      setEmail('admin@lumina.photos');
      setPassword('Admin@123456');
    } else if (role === 'TEAM_1') {
      setEmail('photographer1@lumina.photos');
      setPassword('Team@123456');
    } else if (role === 'TEAM_2') {
      setEmail('photographer2@lumina.photos');
      setPassword('Team@123456');
    }
  };

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

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-8">
      <div className="glass-panel w-full max-w-lg p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6 animate-scale-up">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-300 p-0.5 mx-auto shadow-lg shadow-brand-500/20">
            <div className="w-full h-full bg-dark-900 rounded-[14px] flex items-center justify-center">
              <Camera className="w-7 h-7 text-brand-400" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif tracking-tight">Studio Sign In</h2>
          <p className="text-xs text-slate-400">Choose a demo role below for instant 1-click access</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 text-center font-medium">
            {error}
          </div>
        )}

        {/* PRIMARY: 1-Click Instant Demo Login Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>1-Click Instant Demo Access</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
              No typing required
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Admin 1-Click Card */}
            <button
              type="button"
              disabled={!!demoLoadingRole || isLoading}
              onClick={() => handle1ClickDemo('ADMIN')}
              className="p-4 rounded-2xl bg-gradient-to-br from-brand-600/25 to-brand-950/60 border border-brand-500/40 hover:border-brand-400 hover:scale-[1.02] text-left transition-all group relative overflow-hidden shadow-lg shadow-brand-500/10 disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-brand-500/30 text-brand-300 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-brand-500/30 text-brand-200 font-bold uppercase tracking-wider">
                  Lead Admin
                </span>
              </div>
              <div className="font-bold text-white text-sm group-hover:text-brand-300 transition-colors flex items-center justify-between">
                <span>Studio Admin</span>
                {demoLoadingRole === 'ADMIN' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5 text-brand-400 group-hover:translate-x-1 transition-transform" />
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                Manage events, assign team, curate picks & publish PIN galleries.
              </p>
            </button>

            {/* Team Member 1 1-Click Card */}
            <button
              type="button"
              disabled={!!demoLoadingRole || isLoading}
              onClick={() => handle1ClickDemo('TEAM_1')}
              className="p-4 rounded-2xl bg-gradient-to-br from-cyan-600/25 to-cyan-950/60 border border-cyan-500/40 hover:border-cyan-400 hover:scale-[1.02] text-left transition-all group relative overflow-hidden shadow-lg shadow-cyan-500/10 disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/30 text-cyan-300 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/30 text-cyan-200 font-bold uppercase tracking-wider">
                  Photographer 1
                </span>
              </div>
              <div className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors flex items-center justify-between">
                <span>Team Member</span>
                {demoLoadingRole === 'TEAM_1' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                Assigned to <em>Wedding</em> & <em>Tech Summit</em> for uploads.
              </p>
            </button>

            {/* Team Member 2 1-Click Card */}
            <button
              type="button"
              disabled={!!demoLoadingRole || isLoading}
              onClick={() => handle1ClickDemo('TEAM_2')}
              className="p-3.5 rounded-2xl bg-dark-900/80 border border-white/10 hover:border-cyan-400/50 hover:scale-[1.02] text-left transition-all group disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-cyan-300 font-semibold flex items-center gap-1">
                  <Users className="w-3 h-3" /> Photographer 2
                </span>
                {demoLoadingRole === 'TEAM_2' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                ) : (
                  <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                )}
              </div>
              <div className="text-xs font-semibold text-white">Sophia Chen (Ceremony)</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Assigned to Arjun & Priya Wedding</div>
            </button>

            {/* Customer Gallery Direct Link Card */}
            <Link
              to="/gallery/arjun-priya-wedding"
              className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-600/20 to-emerald-950/50 border border-emerald-500/30 hover:border-emerald-400 hover:scale-[1.02] text-left transition-all group block"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
                  <Key className="w-3 h-3" /> Client Gallery
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-200 font-mono">
                  PIN: 482917
                </span>
              </div>
              <div className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors flex items-center justify-between">
                <span>View Customer Gallery</span>
                <ArrowRight className="w-3 h-3 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Luxury PIN-protected client showcase</div>
            </Link>
          </div>
        </div>

        {/* Divider / Toggle Manual Form */}
        <div className="pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={() => setShowManualForm(!showManualForm)}
            className="w-full py-2 flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <span>Or sign in with email & password</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showManualForm ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Manual Credentials Form (Collapsible or visible on demand) */}
        {showManualForm && (
          <form onSubmit={handleSubmit} className="space-y-4 pt-1 animate-fade-in">
            {/* Quick Fill Buttons */}
            <div className="flex items-center gap-2 pb-1">
              <span className="text-[10px] text-slate-400">Fill inputs:</span>
              <button
                type="button"
                onClick={() => autofillCredentials('ADMIN')}
                className="px-2 py-0.5 rounded-md bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 text-[10px] font-semibold transition-colors"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => autofillCredentials('TEAM_1')}
                className="px-2 py-0.5 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-[10px] font-semibold transition-colors"
              >
                Photographer 1
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@lumina.photos"
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
                  placeholder="Admin@123456"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !!demoLoadingRole}
              className="w-full py-2.5 rounded-xl btn-gold text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In with Credentials</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

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
