import React, { useState } from 'react';
import {
  History,
  Download,
  Filter,
  Scale,
  Edit3,
  Droplet,
  CheckCircle2,
  Calendar,
  User,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { UsageEvent, InventoryItem, FamilyMember } from '../types';
import { exportUsageEventsToCSV } from '../lib/api';

interface UsageHistoryProps {
  usageEvents: UsageEvent[];
  inventory: InventoryItem[];
  familyMembers: FamilyMember[];
  includeSample: boolean;
}

export const UsageHistory: React.FC<UsageHistoryProps> = ({
  usageEvents,
  inventory,
  familyMembers,
  includeSample,
}) => {
  const [productFilter, setProductFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredEvents = usageEvents.filter(e => {
    if (!includeSample && e.isSampleData) return false;
    if (productFilter !== 'all' && e.productId !== productFilter) return false;
    if (methodFilter !== 'all' && e.method !== methodFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const prod = inventory.find(i => i.id === e.productId);
      const mem = familyMembers.find(m => m.id === e.memberId);
      const matchProd = prod?.name.toLowerCase().includes(q) || prod?.brand.toLowerCase().includes(q);
      const matchMem = mem?.name.toLowerCase().includes(q);
      const matchNotes = e.notes?.toLowerCase().includes(q);
      return matchProd || matchMem || matchNotes;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-radiant-teal" />
            Usage History & Audit Trail
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Immutable log of every recorded soap consumption event with method validation
          </p>
        </div>

        <button
          onClick={() => exportUsageEventsToCSV(filteredEvents, inventory, familyMembers)}
          className="px-4 py-2 bg-slate-100 dark:bg-obsidian-800 hover:bg-slate-200 dark:hover:bg-obsidian-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-obsidian-700 text-xs font-bold rounded-xl transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-radiant-teal" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-obsidian-800 border border-slate-200 dark:border-teal-900/30 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search events by product, member, or notes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-xl text-xs focus:outline-none focus:border-radiant-teal text-slate-800 dark:text-slate-200"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={productFilter}
            onChange={e => setProductFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-xl text-xs focus:outline-none focus:border-radiant-teal text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Products</option>
            {inventory.map(i => (
              <option key={i.id} value={i.id}>
                {i.brand} {i.name}
              </option>
            ))}
          </select>

          <select
            value={methodFilter}
            onChange={e => setMethodFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-xl text-xs focus:outline-none focus:border-radiant-teal text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Methods</option>
            <option value="SCALE">Digital Scale (Weight)</option>
            <option value="MANUAL">Manual Entry</option>
            <option value="PUMP_ESTIMATE">Pump Dispensing Estimate</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-2xl bg-white dark:bg-obsidian-800 border border-slate-200 dark:border-teal-900/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-obsidian-900/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-obsidian-700">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Soap Product</th>
                <th className="py-3 px-4">Amount Consumed</th>
                <th className="py-3 px-4">Remaining Balance</th>
                <th className="py-3 px-4">Method Badge</th>
                <th className="py-3 px-4">Member / Location</th>
                <th className="py-3 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-obsidian-700">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No consumption events found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEvents.map(event => {
                  const prod = inventory.find(i => i.id === event.productId);
                  const member = familyMembers.find(m => m.id === event.memberId);
                  const dateStr = new Date(event.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr
                      key={event.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-obsidian-700/40 transition"
                    >
                      {/* Date */}
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {dateStr}
                      </td>

                      {/* Product */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {prod ? `${prod.brand} ${prod.name}` : 'Unknown Product'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {prod?.location || 'Shared'}
                        </div>
                      </td>

                      {/* Consumed */}
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-radiant-teal">
                          -{event.consumedQuantity} {event.unit}
                        </span>
                      </td>

                      {/* Remaining */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {event.newQuantity} {event.unit}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          from {event.previousQuantity} {event.unit}
                        </span>
                      </td>

                      {/* Method Badge */}
                      <td className="py-3 px-4">
                        {event.method === 'SCALE' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-radiant-teal/15 text-radiant-teal border border-radiant-teal/30">
                            <Scale className="w-3 h-3" /> SCALE
                          </span>
                        )}
                        {event.method === 'MANUAL' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                            <Edit3 className="w-3 h-3" /> MANUAL
                          </span>
                        )}
                        {event.method === 'PUMP_ESTIMATE' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <Droplet className="w-3 h-3" /> PUMP ESTIMATE
                          </span>
                        )}
                        {event.isSampleData && (
                          <span className="ml-1 inline-flex items-center text-[9px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-obsidian-700 text-slate-500">
                            SAMPLE
                          </span>
                        )}
                      </td>

                      {/* Member */}
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        {member ? (
                          <div className="flex items-center gap-1.5">
                            <span>{member.avatar}</span>
                            <span className="font-medium">{member.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">General Household</span>
                        )}
                      </td>

                      {/* Audit Details */}
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                        {event.method === 'SCALE' && event.scaleReading !== undefined && (
                          <div>
                            Scale: {event.scaleReading}g (Tare: {event.tareWeight || 0}g)
                          </div>
                        )}
                        {event.method === 'PUMP_ESTIMATE' && event.pumpCount !== undefined && (
                          <div>
                            {event.pumpCount} pumps @ {event.mlPerPump || 1.5} mL/pump
                          </div>
                        )}
                        {event.notes && <div className="italic text-slate-400">&ldquo;{event.notes}&rdquo;</div>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
