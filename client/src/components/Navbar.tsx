import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Camera, LogOut, User as UserIcon, Shield, Users, Sparkles, ExternalLink, ChevronDown, Key } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, quickDemoLogin } = useAuth();
  const navigate = useNavigate();
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 bg-dark-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-amber-300 p-0.5 shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-all">
              <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
                <Camera className="w-5 h-5 text-brand-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-white font-serif">Lumina</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  STUDIO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Event Photo Platform</p>
            </div>
          </Link>

          {/* Center / Navigation Links */}
          <div className="hidden md:flex items-center gap-4 text-xs font-semibold">
            <Link
              to="/admin"
              className="text-slate-300 hover:text-brand-300 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              <Shield className="w-3.5 h-3.5 text-brand-400" />
              <span>Admin Portal</span>
            </Link>
            <Link
              to="/team"
              className="text-slate-300 hover:text-cyan-300 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>Team Portal</span>
            </Link>
            <Link
              to="/gallery/arjun-priya-wedding"
              className="text-slate-300 hover:text-emerald-300 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              <span>Customer Gallery</span>
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 text-xs font-semibold text-brand-300 transition-all shadow-sm"
                title="Quick switch between demo roles for testing"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span className="hidden sm:inline">Role Switcher</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {showDemoMenu && (
                <div
                  className="absolute right-0 mt-2 w-64 glass-panel bg-dark-900/95 rounded-xl shadow-2xl border border-white/10 p-2 z-50 animate-scale-up text-xs"
                  onMouseLeave={() => setShowDemoMenu(false)}
                >
                  <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-white/5">
                    1-Click Demo Login
                  </div>
                  <button
                    onClick={async () => {
                      await quickDemoLogin('ADMIN');
                      setShowDemoMenu(false);
                      navigate('/admin');
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-brand-500/15 transition-colors flex items-center justify-between text-slate-200 hover:text-brand-300"
                  >
                    <div>
                      <div className="font-semibold flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-brand-400" />
                        <span>Admin / Lead</span>
                      </div>
                      <div className="text-[10px] text-slate-400">admin@lumina.photos</div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">Lead</span>
                  </button>

                  <button
                    onClick={async () => {
                      await quickDemoLogin('TEAM_1');
                      setShowDemoMenu(false);
                      navigate('/team');
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-cyan-500/15 transition-colors flex items-center justify-between text-slate-200 hover:text-cyan-300"
                  >
                    <div>
                      <div className="font-semibold flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Photographer 1</span>
                      </div>
                      <div className="text-[10px] text-slate-400">photographer1@lumina.photos</div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">Team</span>
                  </button>

                  <button
                    onClick={async () => {
                      await quickDemoLogin('TEAM_2');
                      setShowDemoMenu(false);
                      navigate('/team');
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-purple-500/15 transition-colors flex items-center justify-between text-slate-200 hover:text-purple-300"
                  >
                    <div>
                      <div className="font-semibold flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-purple-400" />
                        <span>Photographer 2</span>
                      </div>
                      <div className="text-[10px] text-slate-400">photographer2@lumina.photos</div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">Team</span>
                  </button>

                  <div className="mt-1 pt-1 border-t border-white/5">
                    <Link
                      to="/gallery/arjun-priya-wedding"
                      target="_blank"
                      onClick={() => setShowDemoMenu(false)}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-emerald-500/15 transition-colors flex items-center justify-between text-emerald-300"
                    >
                      <div className="font-medium flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Customer PIN View</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">PIN: 482917</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-dark-900 border border-white/5">
                  <div className="w-7 h-7 rounded-full bg-brand-500/20 text-brand-300 flex items-center justify-center font-bold text-xs border border-brand-500/30">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-slate-200 leading-tight">{user.name}</p>
                    <p className="text-[10px] text-slate-400">{user.role === 'ADMIN' ? 'Lead Admin' : 'Team Member'}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg btn-gold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
