import React, { useState, useEffect } from 'react';
import { X, UserPlus, Trash2, Check, Loader2, Users } from 'lucide-react';
import { api } from '../services/api';
import { EventItem, User } from '../types';

interface AssignMembersModalProps {
  isOpen: boolean;
  event: EventItem | null;
  onClose: () => void;
  onUpdated: () => void;
}

export const AssignMembersModal: React.FC<AssignMembersModalProps> = ({
  isOpen,
  event,
  onClose,
  onUpdated,
}) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [customRole, setCustomRole] = useState('Photographer');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && event) {
      api.getTeamMembers().then((res) => {
        if (res.data.success) {
          setAllUsers(res.data.data.users);
        }
      });
      setError(null);
    }
  }, [isOpen, event]);

  if (!isOpen || !event) return null;

  const currentMembers = event.members || [];
  const currentMemberUserIds = currentMembers.map((m) => m.userId);
  const availableToAdd = allUsers.filter(
    (u) => !currentMemberUserIds.includes(u.id) && u.id !== event.createdByAdminId
  );

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await api.addMember(event.id, {
        userId: selectedUserId,
        role: customRole,
      });
      if (res.data.success) {
        setSelectedUserId('');
        onUpdated();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    setIsLoading(true);
    try {
      const res = await api.removeMember(event.id, userId);
      if (res.data.success) {
        onUpdated();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove member');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-dark-900/60">
          <div>
            <h2 className="text-lg font-bold text-white font-serif">Manage Photography Team</h2>
            <p className="text-xs text-slate-400">Event: {event.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* Add Member Form */}
          <form onSubmit={handleAddMember} className="p-4 rounded-xl bg-dark-900/70 border border-white/5 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Assign New Photographer</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Select Member</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                >
                  <option value="" className="bg-dark-900 text-slate-400">
                    -- Choose Photographer --
                  </option>
                  {availableToAdd.map((u) => (
                    <option key={u.id} value={u.id} className="bg-dark-900 text-slate-200">
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Role / Responsibility</label>
                <input
                  type="text"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="e.g. Lead Candid, Drone..."
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!selectedUserId || isLoading}
              className="w-full py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>Add to Event Workspace</span>
            </button>
          </form>

          {/* Current Assigned List */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-brand-400" />
              <span>Assigned Team Members ({currentMembers.length})</span>
            </h3>

            {currentMembers.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 bg-dark-900/30 rounded-xl border border-white/5">
                No photographers assigned yet. Assign a team member above.
              </p>
            ) : (
              <div className="space-y-2">
                {currentMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-3 rounded-xl bg-dark-900/50 border border-white/5 flex items-center justify-between group hover:border-white/15 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-300 flex items-center justify-center font-bold text-xs border border-brand-500/30">
                        {member.user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-200">{member.user.name}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2">
                          <span>{member.user.email}</span>
                          <span className="px-1.5 py-0.2 rounded bg-white/5 text-cyan-300 font-medium">
                            {member.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveMember(member.userId)}
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Remove from event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-dark-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
