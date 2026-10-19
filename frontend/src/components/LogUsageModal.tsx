import React, { useState, useMemo } from 'react';
import {
  Scale,
  Edit3,
  Droplet,
  X,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { InventoryItem, FamilyMember, UsageEvent, UsageMethod } from '../types/soap';
import {
  calculateScaleConsumption,
  calculateManualConsumption,
  calculatePumpConsumption,
  checkDuplicateMeasurement,
} from '../lib/consumptionEngine';

interface LogUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  familyMembers: FamilyMember[];
  onLogSaved: (event: Partial<UsageEvent>) => Promise<void>;
  lastEventTime?: string;
}

export const LogUsageModal: React.FC<LogUsageModalProps> = ({
  isOpen,
  onClose,
  item,
  familyMembers,
  onLogSaved,
  lastEventTime,
}) => {
  if (!isOpen || !item) return null;

  const isLiquid = item.productType === 'liquid_handwash' || item.productType === 'body_wash';
  const [method, setMethod] = useState<UsageMethod>(isLiquid ? 'PUMP_ESTIMATE' : 'SCALE');
  const [memberId, setMemberId] = useState<string>(item.assignedMemberId || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [scaleReading, setScaleReading] = useState<number>(
    Math.round(item.remainingQuantity + (item.tareWeightG || 0))
  );
  const [tareWeight, setTareWeight] = useState<number>(item.tareWeightG || 0);

  const [manualMode, setManualMode] = useState<'consumed' | 'remaining'>('consumed');
  const [manualValue, setManualValue] = useState<number>(5);

  const [pumpCount, setPumpCount] = useState<number>(2);
  const [mlPerPump, setMlPerPump] = useState<number>(1.5);

  const calculation = useMemo(() => {
    try {
      if (method === 'SCALE') {
        const res = calculateScaleConsumption({
          previousRemaining: item.remainingQuantity,
          scaleReading,
          tareWeight,
          unit: item.unit,
        });
        return { success: true, result: res, error: null };
      } else if (method === 'MANUAL') {
        const res = calculateManualConsumption({
          previousRemaining: item.remainingQuantity,
          mode: manualMode,
          value: manualValue,
          unit: item.unit,
        });
        return { success: true, result: res, error: null };
      } else {
        const res = calculatePumpConsumption({
          previousRemaining: item.remainingQuantity,
          pumpCount,
          mlPerPump,
        });
        return { success: true, result: res, error: null };
      }
    } catch (err: any) {
      return { success: false, result: null, error: err.message };
    }
  }, [method, scaleReading, tareWeight, manualMode, manualValue, pumpCount, mlPerPump, item]);

  const isPotentialDuplicate = checkDuplicateMeasurement(lastEventTime, new Date().toISOString(), 15);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calculation.success || !calculation.result) {
      setSubmitError(calculation.error || 'Please resolve validation errors first.');
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const payload: Partial<UsageEvent> = {
        productId: item.id,
        memberId: memberId || undefined,
        consumedQuantity: calculation.result.consumedQuantity,
        unit: calculation.result.baseUnit,
        previousQuantity: item.remainingQuantity,
        newQuantity: calculation.result.newRemainingQuantity,
        method: calculation.result.method,
        scaleReading: method === 'SCALE' ? scaleReading : undefined,
        tareWeight: method === 'SCALE' ? tareWeight : undefined,
        pumpCount: method === 'PUMP_ESTIMATE' ? pumpCount : undefined,
        mlPerPump: method === 'PUMP_ESTIMATE' ? mlPerPump : undefined,
        notes: notes.trim() || undefined,
        isSampleData: false,
        createdAt: new Date().toISOString(),
      };

      await onLogSaved(payload);
      onClose();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to record usage');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl my-auto bg-white dark:bg-obsidian-800 rounded-2xl border border-slate-200 dark:border-teal-900/40 shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-obsidian-700 bg-slate-50/50 dark:bg-obsidian-900/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-radiant-teal tracking-wider">
                Log Consumption
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-obsidian-700 text-slate-700 dark:text-slate-300 font-mono">
                Current: {item.remainingQuantity} {item.unit}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {item.brand} {item.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-obsidian-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 border-b border-slate-200 dark:border-obsidian-700 bg-slate-100/50 dark:bg-obsidian-950/60 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setMethod('SCALE')}
            className={`py-2 text-xs font-semibold rounded-lg flex flex-col items-center justify-center gap-1 transition ${
              method === 'SCALE'
                ? 'bg-white dark:bg-obsidian-700 text-radiant-teal shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>A. Digital Scale</span>
          </button>

          <button
            type="button"
            onClick={() => setMethod('MANUAL')}
            className={`py-2 text-xs font-semibold rounded-lg flex flex-col items-center justify-center gap-1 transition ${
              method === 'MANUAL'
                ? 'bg-white dark:bg-obsidian-700 text-radiant-teal shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>B. Manual Entry</span>
          </button>

          <button
            type="button"
            onClick={() => setMethod('PUMP_ESTIMATE')}
            className={`py-2 text-xs font-semibold rounded-lg flex flex-col items-center justify-center gap-1 transition ${
              method === 'PUMP_ESTIMATE'
                ? 'bg-white dark:bg-obsidian-700 text-radiant-teal shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Droplet className="w-4 h-4" />
            <span>C. Pump Dispense</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {method === 'SCALE' && (
            <div className="space-y-4">
              <div className="p-3 bg-radiant-teal/5 border border-radiant-teal/20 rounded-xl text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                <Info className="w-4 h-4 text-radiant-teal shrink-0 mt-0.5" />
                <span>
                  Place soap and dish on your digital kitchen scale. Net soap weight is automatically
                  calculated: <strong>(Scale Reading - Tare Dish Weight)</strong>.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Gross Scale Reading ({item.unit}) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={scaleReading}
                    onChange={e => setScaleReading(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-lg text-sm font-semibold focus:outline-none focus:border-radiant-teal text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tare Weight of Dish ({item.unit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={tareWeight}
                    onChange={e => setTareWeight(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-lg text-sm font-semibold focus:outline-none focus:border-radiant-teal text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          )}

          {method === 'MANUAL' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setManualMode('consumed')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition ${
                    manualMode === 'consumed'
                      ? 'bg-radiant-teal/15 border-radiant-teal text-radiant-teal'
                      : 'border-slate-200 dark:border-obsidian-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Enter Amount Consumed
                </button>
                <button
                  type="button"
                  onClick={() => setManualMode('remaining')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition ${
                    manualMode === 'remaining'
                      ? 'bg-radiant-teal/15 border-radiant-teal text-radiant-teal'
                      : 'border-slate-200 dark:border-obsidian-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Enter New Remaining
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {manualMode === 'consumed' ? 'Quantity Consumed' : 'New Remaining Balance'} (
                  {item.unit}) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={manualValue}
                  onChange={e => setManualValue(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-lg text-sm font-semibold focus:outline-none focus:border-radiant-teal text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          )}

          {method === 'PUMP_ESTIMATE' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-500 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Liquid pump logs are marked with the <strong>ESTIMATE</strong> badge in the audit ledger.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Number of Pumps (Handwashes) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={pumpCount}
                    onChange={e => setPumpCount(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-lg text-sm font-semibold focus:outline-none focus:border-radiant-teal text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Calibrated mL per Pump
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={mlPerPump}
                    onChange={e => setMlPerPump(parseFloat(e.target.value) || 1.5)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-lg text-sm font-semibold focus:outline-none focus:border-radiant-teal text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Calculation Preview
            </div>

            {calculation.success && calculation.result ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 text-center gap-2">
                  <div className="p-2 bg-white dark:bg-obsidian-800 rounded-lg border border-slate-200 dark:border-obsidian-700">
                    <span className="text-[10px] text-slate-400 block">Previous</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {item.remainingQuantity} {item.unit}
                    </span>
                  </div>
                  <div className="p-2 bg-white dark:bg-obsidian-800 rounded-lg border border-slate-200 dark:border-obsidian-700">
                    <span className="text-[10px] text-radiant-teal block">Consumed</span>
                    <span className="text-sm font-bold text-radiant-teal">
                      -{calculation.result.consumedQuantity} {calculation.result.baseUnit}
                    </span>
                  </div>
                  <div className="p-2 bg-white dark:bg-obsidian-800 rounded-lg border border-slate-200 dark:border-obsidian-700">
                    <span className="text-[10px] text-slate-400 block">New Remaining</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {calculation.result.newRemainingQuantity} {calculation.result.baseUnit}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Stock Depletion</span>
                    <span>
                      {Math.round(
                        (calculation.result.newRemainingQuantity / item.initialQuantity) * 100
                      )}
                      % Left
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-obsidian-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-radiant-teal to-radiant-light transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            (calculation.result.newRemainingQuantity / item.initialQuantity) * 100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{calculation.error}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Used By
              </label>
              <select
                value={memberId}
                onChange={e => setMemberId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-lg text-xs focus:outline-none focus:border-radiant-teal text-slate-800 dark:text-slate-200"
              >
                <option value="">Shared / Household General</option>
                {familyMembers.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.avatar} {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Post-workout shower, guest wash"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-lg text-xs focus:outline-none focus:border-radiant-teal text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          {isPotentialDuplicate && (
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-500 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>A usage event was recently recorded for this soap (&lt; 15s ago).</span>
            </div>
          )}

          {submitError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
              {submitError}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-obsidian-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!calculation.success || isSubmitting}
              className="px-5 py-2.5 bg-gradient-to-r from-radiant-teal to-radiant-light text-obsidian-950 font-bold text-sm rounded-xl hover:opacity-95 transition shadow-lg shadow-radiant-teal/20 disabled:opacity-50 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Recording...' : 'Record Consumption'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
