import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Key, UserCheck, Sparkles, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: () => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onEventCreated,
}) => {
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [defaultPin, setDefaultPin] = useState(Math.floor(100000 + Math.random() * 900000).toString());
  const [availableMembers, setAvailableMembers] = useState<User[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Fetch team members list for assignment
      api.getTeamMembers().then((res) => {
        if (res.data.success) {
          const photographers = res.data.data.users.filter((u: User) => u.role === 'TEAM_MEMBER');
          setAvailableMembers(photographers);
        }
      });
      setDefaultPin(Math.floor(100000 + Math.random() * 900000).toString());
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleMember = (userId: string) => {
    if (selectedMemberIds.includes(userId)) {
      setSelectedMemberIds(selectedMemberIds.filter((id) => id !== userId));
    } else {
      setSelectedMemberIds([...selectedMemberIds, userId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !clientName) {
      setError('Title and Client Name are required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.createEvent({
        title,
        clientName,
        eventDate,
        location,
        description,
        defaultPin,
        memberIds: selectedMemberIds,
      });

      if (res.data.success) {
        onEventCreated();
        onClose();
        // Reset form
        setTitle('');
        setClientName('');
        setLocation('');
        setDescription('');
        setSelectedMemberIds([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-scale-up">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-dark-900/60">
          <div>
            <h2 className="text-lg font-bold text-white font-serif">Create New Event</h2>
            <p className="text-xs text-slate-400">Initialize a photoshoot workspace and setup team access</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Event Title <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Arjun & Priya Royal Wedding"
                required
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Client / Host Name <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Arjun & Priya Singhania"
                required
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Event Date</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Location / Venue</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. The Oberoi Udaivilas, Udaipur"
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description / Notes</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key photoshoot timeline, special requests, shot list..."
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            ></textarea>
          </div>

          {/* Initial PIN setting */}
          <div className="p-3.5 rounded-xl bg-dark-900/80 border border-brand-500/20">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-brand-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-brand-400" />
                <span>Customer Gallery Access PIN</span>
              </label>
              <button
                type="button"
                onClick={() => setDefaultPin(Math.floor(100000 + Math.random() * 900000).toString())}
                className="text-[11px] text-brand-400 hover:text-brand-300 underline font-medium"
              >
                Generate New
              </button>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={defaultPin}
                onChange={(e) => setDefaultPin(e.target.value)}
                maxLength={8}
                className="w-36 px-3 py-1.5 rounded-lg glass-input text-sm font-mono tracking-widest text-center text-brand-300"
              />
              <p className="text-[11px] text-slate-400">
                Customers will enter this PIN on the published gallery page. (Can be modified later).
              </p>
            </div>
          </div>

          {/* Assign Team Members */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Assign Team Photographers</span>
            </label>
            {availableMembers.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No additional team members found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableMembers.map((member) => {
                  const isSelected = selectedMemberIds.includes(member.id);
                  return (
                    <div
                      key={member.id}
                      onClick={() => toggleMember(member.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center gap-2.5 ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-500/40 text-white'
                          : 'bg-dark-900/40 border-white/5 text-slate-400 hover:border-white/15'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 pointer-events-none"
                      />
                      <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                        {member.name.charAt(0)}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold text-slate-200 truncate">{member.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{member.email}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl btn-gold text-xs font-semibold flex items-center gap-2 shadow-lg shadow-brand-500/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Event...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Create Workspace</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
