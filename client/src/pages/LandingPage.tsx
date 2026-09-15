import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Camera,
  Shield,
  Users,
  Key,
  Globe,
  UploadCloud,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Download,
  Lock,
  Layers,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { quickDemoLogin } = useAuth();
  const navigate = useNavigate();

  const handleDemo = async (role: 'ADMIN' | 'TEAM_1' | 'TEAM_2' | 'TEAM_3') => {
    const user = await quickDemoLogin(role);
    if (user?.role === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/team');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="relative pt-12 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-6 animate-fade-in shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Multi-Role Event Photo Collaboration & Publishing</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold font-serif text-white tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
            Elevate Collaborative Event Photography & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-brand-400 to-amber-500">Private Client Galleries</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            A photography team platform to collaboratively upload high-res event captures, curate client selections, and publish PIN-protected customer galleries.
          </p>

          {/* Quick Demo Sandbox Action Box */}
          <div className="mt-10 max-w-3xl mx-auto glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl">
            <div className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-3">
              1-Click Interactive Evaluation Sandbox
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Admin Button */}
              <button
                onClick={() => handleDemo('ADMIN')}
                className="p-4 rounded-2xl bg-gradient-to-br from-brand-600/20 to-brand-900/40 border border-brand-500/40 hover:border-brand-400 text-left transition-all hover:scale-[1.02] group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-brand-500/30 text-brand-300 flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-brand-500/30 text-brand-200 font-bold uppercase">
                    Admin
                  </span>
                </div>
                <div className="font-bold text-white text-sm group-hover:text-brand-300 transition-colors">
                  Lead Admin Portal
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Create events, assign photographers, curate & publish galleries.
                </div>
              </button>

              {/* Team Member Button */}
              <button
                onClick={() => handleDemo('TEAM_1')}
                className="p-4 rounded-2xl bg-gradient-to-br from-cyan-600/20 to-cyan-950/40 border border-cyan-500/40 hover:border-cyan-400 text-left transition-all hover:scale-[1.02] group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/30 text-cyan-300 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/30 text-cyan-200 font-bold uppercase">
                    Team
                  </span>
                </div>
                <div className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">
                  Photographer Portal
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  View assigned events, batch upload raw photos, track status.
                </div>
              </button>

              {/* Customer Gallery Button */}
              <Link
                to="/gallery/arjun-priya-wedding"
                target="_blank"
                className="p-4 rounded-2xl bg-gradient-to-br from-emerald-600/20 to-emerald-950/40 border border-emerald-500/40 hover:border-emerald-400 text-left transition-all hover:scale-[1.02] group block"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/30 text-emerald-300 flex items-center justify-center">
                    <Key className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-200 font-bold uppercase">
                    Customer
                  </span>
                </div>
                <div className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">
                  Customer PIN Gallery
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  No login required. Access with PIN: <strong className="text-emerald-300 font-mono">482917</strong>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Step Workflow Sequence */}
      <div className="py-16 bg-dark-900/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
              End-to-End Operational Workflow
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Designed according to photography industry standards for collaborative team workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                step: '01',
                actor: 'Admin / Lead',
                title: 'Create & Assign',
                desc: 'Admin creates the event workspace, sets date & location, and assigns photography team members.',
                icon: Shield,
                badge: 'bg-brand-500/20 text-brand-300',
              },
              {
                step: '02',
                actor: 'Team Member',
                title: 'Batch Upload',
                desc: 'Photographers log in to their assigned event workspace and upload event photos to Object Storage.',
                icon: UploadCloud,
                badge: 'bg-cyan-500/20 text-cyan-300',
              },
              {
                step: '03',
                actor: 'Admin / Lead',
                title: 'Review & Curate',
                desc: 'Admin reviews all team captures, filters by photographer, and selects the best shots for client sharing.',
                icon: Layers,
                badge: 'bg-brand-500/20 text-brand-300',
              },
              {
                step: '04',
                actor: 'Admin / Lead',
                title: 'Publish & PIN',
                desc: 'Admin configures a secure 6-digit access PIN and publishes the customer-facing shareable link.',
                icon: Lock,
                badge: 'bg-amber-500/20 text-amber-300',
              },
              {
                step: '05',
                actor: 'Customer / Guest',
                title: 'Unlock & Browse',
                desc: 'Client opens the shareable link without an account, enters the PIN, views photos, and downloads ZIP album.',
                icon: Globe,
                badge: 'bg-emerald-500/20 text-emerald-300',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="glass-card p-5 rounded-2xl flex flex-col justify-between border border-white/5 relative group hover:border-white/20">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold font-serif text-slate-600 group-hover:text-brand-400 transition-colors">
                        {item.step}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.badge}`}>
                        {item.actor}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-1.5">
                      <Icon className="w-4 h-4 text-brand-400" />
                      <span>{item.title}</span>
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Security & Architecture Highlights */}
      <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Strict Role-Based Access (RBAC)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Granular access control prevents unassigned team members from accessing other events. Team members cannot publish galleries or delete other photographers' uploads.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Hashed PIN & Rate Limiting</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Customer PINs are hashed using bcrypt with salt. Access verification issues signed ephemeral guest tokens with built-in brute-force protection.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Object Storage Architecture</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Images are stored via isolated object storage paths with database metadata tracking (dimensions, filesize, original names, selection status).
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-white/10 bg-dark-950 text-center text-xs text-slate-500">
        <p>LuminaPhoto Studio Platform • Built with React, Node.js, Express, Prisma, SQLite & Object Storage</p>
      </footer>
    </div>
  );
};
