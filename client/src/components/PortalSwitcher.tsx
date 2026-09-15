import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Users,
  Key,
  Home,
  ChevronUp,
  ChevronDown,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const PortalSwitcher: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { user, quickDemoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;
  const isAdminActive = currentPath === '/admin' || (currentPath.startsWith('/events/') && user?.role === 'ADMIN');
  const isTeamActive = currentPath === '/team' || (currentPath.startsWith('/events/') && user?.role === 'TEAM_MEMBER');
  const isCustomerActive = currentPath.startsWith('/gallery/');
  const isHomeActive = currentPath === '/';

  const switchToAdmin = async () => {
    if (!user || user.role !== 'ADMIN') {
      await quickDemoLogin('ADMIN');
    }
    navigate('/admin');
  };

  const switchToTeam = async () => {
    if (!user || user.role !== 'TEAM_MEMBER') {
      await quickDemoLogin('TEAM_1');
    }
    navigate('/team');
  };

  const switchToCustomer = () => {
    navigate('/gallery/arjun-priya-wedding');
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-2xl w-auto px-4 select-none animate-fade-in">
      <div className="glass-panel bg-dark-950/95 rounded-2xl border border-brand-500/40 shadow-2xl shadow-black/80 backdrop-blur-xl p-1.5 ring-1 ring-white/10">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Label */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-brand-300 border-r border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span className="uppercase tracking-wider text-[10px]">Switch Portal</span>
          </div>

          {/* Admin Portal Button */}
          <button
            onClick={switchToAdmin}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isAdminActive
                ? 'bg-gradient-to-r from-brand-600 to-amber-500 text-dark-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-brand-500/15'
            }`}
            title="Open Lead Admin Portal (Manage events, assign photographers, curate & publish)"
          >
            <Shield className="w-3.5 h-3.5 shrink-0" />
            <span>Admin Portal</span>
          </button>

          {/* Team / Photographer Portal Button */}
          <button
            onClick={switchToTeam}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isTeamActive
                ? 'bg-cyan-500 text-dark-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/15'
            }`}
            title="Open Photographer Team Portal (View assigned shoots & batch upload)"
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>Team Portal</span>
          </button>

          {/* Customer PIN Gallery Button */}
          <button
            onClick={switchToCustomer}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isCustomerActive
                ? 'bg-emerald-500 text-dark-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-emerald-300 hover:bg-emerald-500/15'
            }`}
            title="Open Customer PIN Protected Gallery (Client access without account)"
          >
            <Key className="w-3.5 h-3.5 shrink-0" />
            <span>Customer Portal</span>
          </button>

          {/* Home Link */}
          <Link
            to="/"
            className={`p-2 rounded-xl text-xs font-semibold transition-all ${
              isHomeActive
                ? 'bg-white/20 text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Studio Home & Overview"
          >
            <Home className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
