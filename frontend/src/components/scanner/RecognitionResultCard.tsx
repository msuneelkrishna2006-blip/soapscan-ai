import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  CheckCircle2,
  RefreshCw,
  Plus,
  Edit2,
  Scale,
  Sparkles,
  AlertTriangle,
  Tag,
  MapPin,
  Check,
} from 'lucide-react';
import { ResolvedSoapSpec, AutoDetectResult, ProductType } from '../../types/soap';

interface RecognitionResultCardProps {
  result: ResolvedSoapSpec | AutoDetectResult;
  onConfirm: () => void;
  onRescan: () => void;
  onEdit?: () => void;
  isSaving?: boolean;
}

export const RecognitionResultCard: React.FC<RecognitionResultCardProps> = ({
  result,
  onConfirm,
  onRescan,
  onEdit,
  isSaving = false,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const brand = result.brand || 'Unbranded Soap';
  const name = result.name || 'Bathing Soap';
  const confidence = result.confidence ? Math.round(result.confidence * 100) : 95;
  const isLiquid =
    result.productType === 'liquid_handwash' ||
    result.type === 'liquid' ||
    result.shape === 'cylinder';
  const netQuantity =
    result.printedNetQuantity || result.weightGrams || result.volumeMl || 100;
  const unit = result.printedUnit || (isLiquid ? 'ml' : 'g');
  const price = result.priceInr || result.estimatedPriceInr || 60;
  const colorHex = result.colorHex || '#14b8a6';

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={shouldReduceMotion ? {} : { opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950/60 via-obsidian-950/90 to-emerald-950/40 border border-emerald-500/40 shadow-2xl shadow-emerald-500/10 space-y-4 backdrop-blur-xl relative overflow-hidden"
    >
      {/* Background radial accent */}
      <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Header with Title and Confidence Pill */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Target Identified
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {confidence}% Confidence
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-black text-white mt-0.5">
              {brand} — {name}
            </h4>
          </div>
        </div>

        {/* Color preview badge */}
        <div
          className="w-7 h-7 rounded-full border-2 border-white/40 shadow-md shrink-0 mt-1"
          style={{ backgroundColor: colorHex }}
          title={`Detected Color: ${colorHex}`}
        />
      </div>

      {/* Recognition Badges */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono relative z-10">
        <span className="px-3 py-1.5 rounded-xl bg-obsidian-900/90 border border-white/10 text-slate-200 flex items-center gap-1.5">
          <Scale className="w-3.5 h-3.5 text-teal-400" />
          <span>Net Quantity: <strong className="text-white">{netQuantity}{unit}</strong></span>
        </span>

        <span className="px-3 py-1.5 rounded-xl bg-obsidian-900/90 border border-white/10 text-slate-200">
          Format: <strong className="text-teal-300">{isLiquid ? 'Liquid Dispenser' : 'Solid Bar'}</strong>
        </span>

        <span className="px-3 py-1.5 rounded-xl bg-obsidian-900/90 border border-white/10 text-slate-200">
          Price: <strong className="text-amber-400">₹{price}</strong>
        </span>

        {result.barcode && (
          <span className="px-3 py-1.5 rounded-xl bg-obsidian-900/90 border border-white/10 text-slate-400">
            Barcode: <strong className="text-slate-200">{result.barcode}</strong>
          </span>
        )}
      </div>

      {/* Actions: Confirm, Edit, Rescan */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-emerald-500/20 relative z-10">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRescan}
            className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-obsidian-900/80 hover:bg-obsidian-800 rounded-xl border border-white/10 transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Rescan</span>
          </button>

          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-obsidian-900/80 hover:bg-obsidian-800 rounded-xl border border-white/10 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          )}
        </div>

        <motion.button
          whileHover={shouldReduceMotion ? {} : { scale: 1.025 }}
          whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
          type="button"
          onClick={onConfirm}
          disabled={isSaving}
          className="px-5 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-obsidian-950 rounded-xl shadow-lg shadow-emerald-500/25 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
          <span>{isSaving ? 'Adding...' : 'Confirm & Save to Inventory'}</span>
        </motion.button>
      </div>
    </motion.div>
  );
};
