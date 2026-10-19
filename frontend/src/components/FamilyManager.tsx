import React, { useState } from 'react';
import { Users, Plus, Shield, UserPlus, Heart, Sparkles } from 'lucide-react';
import { FamilyMember, InventoryItem, UsageEvent } from '../types/soap';

interface FamilyManagerProps {
  familyMembers: FamilyMember[];
  inventory: InventoryItem[];
  usageEvents: UsageEvent[];
  onAddMember: (member: Partial<FamilyMember>) => Promise<void>;
}

export const FamilyManager: React.FC<FamilyManagerProps> = ({
  familyMembers,
  inventory,
  usageEvents,
  onAddMember,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('👤');
  const [role, setRole] = useState('Adult');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const avatarOptions = ['👨‍💻', '👩‍⚕️', '👦', '👧', '👵', '👴', '🚿', '✨', '🧼'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddMember({
        name: name.trim(),
        avatar,
        role,
        notes: notes.trim() || undefined,
      });
      setName('');
      setNotes('');
      setIsAdding(false);
    } catch (err: any) {
      alert('Failed to add family member: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-radiant-teal" />
            Family & Bathroom Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Allocate soaps to individuals or bathrooms for accurate personalized consumption tracking
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-gradient-to-r from-radiant-teal to-radiant-light text-obsidian-950 font-bold text-xs rounded-xl hover:opacity-95 transition shadow-lg shadow-radiant-teal/20 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" /> Add Household Profile
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="p-5 rounded-2xl bg-white dark:bg-obsidian-800 border border-radiant-teal/40 shadow-xl space-y-4 max-w-lg"
        >
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-radiant-teal" />
            Create Household Profile
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Name or Location *
            </label>
            <input
              type="text"
              placeholder="e.g. Grandma, Guest Bathroom, Sunil"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-lg text-xs focus:outline-none focus:border-radiant-teal text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Avatar Emoji
              </label>
              <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-lg">
                {avatarOptions.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatar(emoji)}
                    className={`w-7 h-7 rounded text-sm flex items-center justify-center transition ${
                      avatar === emoji ? 'bg-radiant-teal/20 border border-radiant-teal scale-110' : 'hover:bg-slate-200 dark:hover:bg-obsidian-700'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Role / Type
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-lg text-xs focus:outline-none focus:border-radiant-teal text-slate-900 dark:text-slate-100"
              >
                <option value="Admin">Admin</option>
                <option value="Adult">Adult</option>
                <option value="Child">Child</option>
                <option value="Guest">Guest / Washroom</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Prefers glycerine bars, Master bath only"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-lg text-xs focus:outline-none focus:border-radiant-teal text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-4 py-2 bg-radiant-teal text-obsidian-950 font-bold text-xs rounded-lg hover:bg-radiant-light disabled:opacity-50"
            >
              Save Member
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {familyMembers.map(member => {
          const assignedSoaps = inventory.filter(
            i => i.assignedMemberId === member.id && i.status === 'active'
          );
          const memberEvents = usageEvents.filter(e => e.memberId === member.id);
          const totalSolid = memberEvents
            .filter(e => e.unit === 'g')
            .reduce((a, b) => a + b.consumedQuantity, 0);

          return (
            <div
              key={member.id}
              className="p-5 rounded-2xl bg-white dark:bg-obsidian-800 border border-slate-200 dark:border-teal-900/30 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-3xl p-2 rounded-xl bg-slate-100 dark:bg-obsidian-900 w-fit">
                    {member.avatar}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-radiant-teal/15 text-radiant-teal">
                    {member.role}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {member.name}
                  </h3>
                  {member.notes && (
                    <p className="text-xs text-slate-400">{member.notes}</p>
                  )}
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-obsidian-700/60 text-xs">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Assigned Soaps:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {assignedSoaps.length}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Usage Logs:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {memberEvents.length} events
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Total Bar Used:</span>
                    <span className="font-bold text-radiant-teal">
                      {totalSolid.toFixed(1)} g
                    </span>
                  </div>
                </div>
              </div>

              {assignedSoaps.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-obsidian-700/40">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Current Soap:
                  </span>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                    {assignedSoaps[0].brand} {assignedSoaps[0].name}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
