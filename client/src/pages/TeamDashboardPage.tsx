import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { EventItem } from '../types';
import { EventCard } from '../components/EventCard';
import { Users, UploadCloud, ShieldAlert, Image as ImageIcon, Loader2 } from 'lucide-react';

export const TeamDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const res = await api.getEvents();
      if (res.data.success) {
        setEvents(res.data.data.events);
      }
    } catch (error) {
      console.error('Failed to fetch assigned events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3 h-3 text-cyan-400" />
            <span>Photographer Portal</span>
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight">
          Assigned Event Shoots
        </h1>
        <p className="text-xs text-slate-400">
          Welcome back, {user?.name}. Here are the photoshoot events you are assigned to.
        </p>
      </div>

      {/* Role Notice Card */}
      <div className="glass-panel p-4 rounded-2xl border border-cyan-500/20 bg-dark-900/60 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
          <UploadCloud className="w-4 h-4" />
        </div>
        <div className="text-xs space-y-1">
          <div className="font-semibold text-slate-200">Team Member Permissions</div>
          <p className="text-slate-400">
            You can batch upload high-resolution photos and manage your own uploads for assigned events. Gallery curation and PIN publishing are restricted to Studio Admins.
          </p>
        </div>
      </div>

      {/* Assigned Events Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400">Loading your assigned events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3 border border-white/5">
          <ImageIcon className="w-12 h-12 text-slate-600 opacity-50" />
          <h3 className="text-base font-bold text-slate-300 font-serif">No Events Assigned</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            You are not currently assigned to any upcoming shoots. Your studio Lead Admin will assign you to events.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} isAdmin={false} />
          ))}
        </div>
      )}
    </div>
  );
};
