import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { TeamDashboardPage } from './pages/TeamDashboardPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { CustomerGalleryPage } from './pages/CustomerGalleryPage';
import { PortalSwitcher } from './components/PortalSwitcher';

import { Shield, Users, Sparkles, ArrowRight, LogIn } from 'lucide-react';

// Interactive Protected Route Guard that never leaves users stuck
const ProtectedRoute: React.FC<{ children: React.ReactNode; requireAdmin?: boolean }> = ({
  children,
  requireAdmin = false,
}) => {
  const { user, isLoading, quickDemoLogin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-brand-400 border-t-transparent animate-spin"></div>
        <p className="text-xs text-slate-400">Authenticating studio workspace...</p>
      </div>
    );
  }

  // Not logged in at all -> Show instant 1-click gateway
  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="glass-panel w-full max-w-md p-8 rounded-3xl border border-brand-500/30 shadow-2xl space-y-6 text-center animate-scale-up">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/20 text-brand-300 flex items-center justify-center mx-auto border border-brand-500/30">
            {requireAdmin ? <Shield className="w-7 h-7" /> : <Users className="w-7 h-7" />}
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white font-serif">
              {requireAdmin ? 'Lead Admin Portal Access' : 'Photographer Portal Access'}
            </h2>
            <p className="text-xs text-slate-400">
              {requireAdmin
                ? 'Sign in as Studio Lead to manage events, curate photos, and publish PIN galleries.'
                : 'Sign in to access your assigned event shoots and batch upload captures.'}
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => quickDemoLogin(requireAdmin ? 'ADMIN' : 'TEAM_1')}
              className="w-full py-3 rounded-xl btn-gold text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Enter as {requireAdmin ? 'Lead Admin (1-Click)' : 'Photographer 1 (1-Click)'}</span>
            </button>

            <Link
              to="/login"
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all block"
            >
              <LogIn className="w-3.5 h-3.5 inline" />
              <span>Sign In with Custom Email</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Logged in as Team Member, but this route requires Admin -> Show Switcher Gateway
  if (requireAdmin && user.role !== 'ADMIN') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="glass-panel w-full max-w-md p-8 rounded-3xl border border-brand-500/30 shadow-2xl space-y-6 text-center animate-scale-up">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center mx-auto border border-amber-500/30">
            <Shield className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white font-serif">Admin Privileges Required</h2>
            <p className="text-xs text-slate-400">
              You are currently signed in as <strong className="text-cyan-300">{user.name} (Photographer)</strong>. Switch to Admin mode to access the Studio Lead Console.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => quickDemoLogin('ADMIN')}
              className="w-full py-3 rounded-xl btn-gold text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Switch to Lead Admin (1-Click)</span>
            </button>

            <Link
              to="/team"
              className="w-full py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all block"
            >
              <Users className="w-3.5 h-3.5 inline" />
              <span>Return to My Photographer Portal</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Layout wrapper to conditionally show Navbar
const AppLayout: React.FC = () => {
  const location = useLocation();
  const isCustomerGallery = location.pathname.startsWith('/gallery/');

  return (
    <div className="min-h-screen flex flex-col bg-dark-950 text-slate-100 pb-16">
      {!isCustomerGallery && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Team Member Routes */}
          <Route
            path="/team"
            element={
              <ProtectedRoute>
                <TeamDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Collaborative Event Workspace */}
          <Route
            path="/events/:id"
            element={
              <ProtectedRoute>
                <EventDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Customer Facing PIN Protected Gallery */}
          <Route path="/gallery/:slug" element={<CustomerGalleryPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Persistent 1-Click Portal Switcher Dock */}
      <PortalSwitcher />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
