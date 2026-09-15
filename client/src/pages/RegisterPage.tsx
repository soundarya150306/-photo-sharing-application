import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Camera, Shield, Users, Lock, Mail, User, ArrowRight, Loader2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'TEAM_MEMBER'>('ADMIN');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.register({
        name,
        email,
        password,
        role,
      });

      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
        if (role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/team');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6 animate-scale-up">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-300 p-0.5 mx-auto shadow-lg shadow-brand-500/20">
            <div className="w-full h-full bg-dark-900 rounded-[14px] flex items-center justify-center">
              <Camera className="w-6 h-6 text-brand-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white font-serif tracking-tight">Create Studio Account</h2>
          <p className="text-xs text-slate-400">Join the LuminaPhoto photography platform</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sarah Jenkins"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>
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
                placeholder="sarah@lumina.photos"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password (Min. 6 chars)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Initial Role Selection</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('ADMIN')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  role === 'ADMIN'
                    ? 'bg-brand-500/20 border-brand-500 text-white'
                    : 'bg-dark-900/40 border-white/5 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Shield className="w-3.5 h-3.5 text-brand-400" />
                  <span>Admin / Lead</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Manage events & galleries</div>
              </button>

              <button
                type="button"
                onClick={() => setRole('TEAM_MEMBER')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  role === 'TEAM_MEMBER'
                    ? 'bg-cyan-500/20 border-cyan-500 text-white'
                    : 'bg-dark-900/40 border-white/5 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Team Member</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Upload to assigned shoots</div>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl btn-gold text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 disabled:opacity-50 mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Register & Enter Studio</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/5">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-300 hover:underline font-semibold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
