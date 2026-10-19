import React, { useState } from 'react';
import {
  Package,
  Search,
  Filter,
  Trash2,
  Edit2,
  CheckCircle,
  Clock,
  Plus,
  Scale,
  Barcode,
  Sparkles,
} from 'lucide-react';
import { InventoryItem, FamilyMember, ProductType, ItemStatus } from '../types';

interface InventoryManagerProps {
  inventory: InventoryItem[];
  familyMembers: FamilyMember[];
  includeSample: boolean;
  onOpenScanModal: () => void;
  onOpenLogModal: (item: InventoryItem) => void;
  onDeleteItem: (id: string) => Promise<void>;
  onUpdateItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  inventory,
  familyMembers,
  includeSample,
  onOpenScanModal,
  onOpenLogModal,
  onDeleteItem,
  onUpdateItem,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const filteredItems = inventory.filter(item => {
    if (!includeSample && item.isSampleData) return false;
    if (typeFilter !== 'all' && item.productType !== typeFilter) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchBrand = item.brand.toLowerCase().includes(q);
      const matchName = item.name.toLowerCase().includes(q);
      const matchBarcode = item.barcode?.toLowerCase().includes(q);
      const matchLocation = item.location?.toLowerCase().includes(q);
      return matchBrand || matchName || matchBarcode || matchLocation;
    }
    return true;
  });

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    await onUpdateItem(editingItem.id, editingItem);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-radiant-teal" />
            Inventory Manager
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track active and finished soaps, calibrate tare weights, and manage household allocations
          </p>
        </div>

        <button
          onClick={onOpenScanModal}
          className="px-4 py-2 bg-gradient-to-r from-radiant-teal to-radiant-light text-obsidian-950 font-bold text-xs rounded-xl hover:opacity-95 transition shadow-lg shadow-radiant-teal/20 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Soap via AI Scan
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-obsidian-800 border border-slate-200 dark:border-teal-900/30 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by brand, product name, barcode, or bathroom..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-xl text-xs focus:outline-none focus:border-radiant-teal text-slate-800 dark:text-slate-200"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-xl text-xs focus:outline-none focus:border-radiant-teal text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Product Types</option>
            <option value="soap_bar">Soap Bars</option>
            <option value="liquid_handwash">Liquid Handwash</option>
            <option value="body_wash">Body Wash</option>
            <option value="other">Other</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-xl text-xs focus:outline-none focus:border-radiant-teal text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="finished">Finished Only</option>
          </select>
        </div>
      </div>

      {/* Table / Cards Grid */}
      <div className="rounded-2xl bg-white dark:bg-obsidian-800 border border-slate-200 dark:border-teal-900/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-obsidian-900/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-obsidian-700">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Location & Member</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4">Tare (Dish)</th>
                <th className="py-3 px-4">Cost</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-obsidian-700">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No matching inventory products found.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const remainingPct =
                    item.initialQuantity > 0
                      ? Math.round((item.remainingQuantity / item.initialQuantity) * 100)
                      : 0;
                  const member = familyMembers.find(m => m.id === item.assignedMemberId);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-obsidian-700/40 transition"
                    >
                      {/* Product Name & Barcode */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {item.brand} {item.name}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                          {item.variant && <span>{item.variant}</span>}
                          {item.barcode && (
                            <span className="font-mono flex items-center gap-1 text-[10px] text-slate-500">
                              <Barcode className="w-3 h-3" /> {item.barcode}
                            </span>
                          )}
                          {item.isSampleData && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-obsidian-700 text-slate-600 dark:text-slate-400">
                              SAMPLE
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-radiant-teal/15 text-radiant-teal">
                          {item.productType.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Location & Member */}
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                        <div>{item.location}</div>
                        {member ? (
                          <div className="text-[11px] text-slate-400 flex items-center gap-1">
                            <span>{member.avatar}</span>
                            <span>{member.name}</span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400">Shared</div>
                        )}
                      </td>

                      {/* Stock Status & Depletion bar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-extrabold text-slate-900 dark:text-white">
                            {item.remainingQuantity} {item.unit}
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            / {item.initialQuantity} {item.unit}
                          </span>
                          <span
                            className={`text-[10px] font-bold ${
                              remainingPct <= 20
                                ? 'text-red-400'
                                : remainingPct <= 40
                                ? 'text-amber-400'
                                : 'text-radiant-teal'
                            }`}
                          >
                            ({remainingPct}%)
                          </span>
                        </div>
                        <div className="w-28 h-1.5 bg-slate-200 dark:bg-obsidian-950 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              remainingPct <= 20
                                ? 'bg-red-500'
                                : remainingPct <= 40
                                ? 'bg-amber-400'
                                : 'bg-radiant-teal'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, remainingPct))}%` }}
                          />
                        </div>
                      </td>

                      {/* Tare */}
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {item.tareWeightG || 0} g
                      </td>

                      {/* Cost */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        ₹{item.costInr || 0}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status === 'active' && (
                            <button
                              onClick={() => onOpenLogModal(item)}
                              title="Log Usage"
                              className="p-1.5 rounded-lg bg-radiant-teal/15 hover:bg-radiant-teal text-radiant-teal hover:text-obsidian-950 transition"
                            >
                              <Scale className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => setEditingItem(item)}
                            title="Edit"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-obsidian-700 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete "${item.brand} ${item.name}" from inventory?`)) {
                                onDeleteItem(item.id);
                              }
                            }}
                            title="Delete"
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-obsidian-800 rounded-2xl border border-slate-200 dark:border-teal-900/40 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Edit Product Details
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="block text-slate-500 mb-1">Product Name</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Brand</label>
                <input
                  type="text"
                  value={editingItem.brand}
                  onChange={e => setEditingItem({ ...editingItem, brand: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Variant</label>
                <input
                  type="text"
                  value={editingItem.variant || ''}
                  onChange={e => setEditingItem({ ...editingItem, variant: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Remaining ({editingItem.unit})</label>
                <input
                  type="number"
                  value={editingItem.remainingQuantity}
                  onChange={e =>
                    setEditingItem({
                      ...editingItem,
                      remainingQuantity: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Tare Weight (g)</label>
                <input
                  type="number"
                  value={editingItem.tareWeightG}
                  onChange={e =>
                    setEditingItem({
                      ...editingItem,
                      tareWeightG: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Price (₹ INR)</label>
                <input
                  type="number"
                  value={editingItem.costInr}
                  onChange={e =>
                    setEditingItem({
                      ...editingItem,
                      costInr: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Location</label>
                <input
                  type="text"
                  value={editingItem.location}
                  onChange={e => setEditingItem({ ...editingItem, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingItem(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-radiant-teal text-obsidian-950 font-bold text-xs rounded-lg hover:bg-radiant-light"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
