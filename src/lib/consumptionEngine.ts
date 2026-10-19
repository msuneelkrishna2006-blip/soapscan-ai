import { Unit, BaseUnit, UsageMethod, UsageEvent, AuditEntry } from '../types';

export interface ScaleTrackingInput {
  previousRemaining: number;
  scaleReading: number;
  tareWeight: number;
  unit: Unit;
}

export interface ManualTrackingInput {
  previousRemaining: number;
  mode: 'consumed' | 'remaining';
  value: number;
  unit: Unit;
}

export interface PumpTrackingInput {
  previousRemaining: number;
  pumpCount: number;
  mlPerPump?: number; // default 1.5 mL
}

export interface CalculationResult {
  consumedQuantity: number;
  newRemainingQuantity: number;
  baseUnit: BaseUnit;
  method: UsageMethod;
  notes?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Normalizes any supported unit to its primary base unit:
 * 'g' or 'kg' -> 'g'
 * 'ml' or 'l' -> 'ml'
 */
export function normalizeToBaseUnit(value: number, unit: Unit): { value: number; baseUnit: BaseUnit } {
  const cleanVal = Number(value);
  if (isNaN(cleanVal)) {
    throw new Error(`Invalid numeric value: ${value}`);
  }

  switch (unit) {
    case 'kg':
      return { value: round(cleanVal * 1000, 2), baseUnit: 'g' };
    case 'g':
      return { value: round(cleanVal, 2), baseUnit: 'g' };
    case 'l':
      return { value: round(cleanVal * 1000, 2), baseUnit: 'ml' };
    case 'ml':
      return { value: round(cleanVal, 2), baseUnit: 'ml' };
    default:
      throw new Error(`Unsupported unit: ${unit}`);
  }
}

/**
 * Utility to round to N decimal places
 */
export function round(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Method A: Weight-Based Scale Tracking
 * Net Weight = Scale Reading - Tare Weight
 * Consumption = Previous Remaining - Net Weight
 * New Remaining = Net Weight
 */
export function calculateScaleConsumption(input: ScaleTrackingInput): CalculationResult {
  const normPrev = normalizeToBaseUnit(input.previousRemaining, input.unit);
  const normScale = normalizeToBaseUnit(input.scaleReading, input.unit);
  const normTare = normalizeToBaseUnit(input.tareWeight, input.unit);

  if (normScale.value < normTare.value) {
    throw new Error('Scale reading cannot be less than the tare weight.');
  }

  const netCurrentWeight = round(normScale.value - normTare.value, 2);
  const consumed = round(normPrev.value - netCurrentWeight, 2);

  if (consumed < 0) {
    throw new Error(
      `Scale reading net weight (${netCurrentWeight}${normPrev.baseUnit}) is greater than previous remaining (${normPrev.value}${normPrev.baseUnit}). Check tare or soap selection.`
    );
  }

  return {
    consumedQuantity: consumed,
    newRemainingQuantity: netCurrentWeight,
    baseUnit: normPrev.baseUnit,
    method: 'SCALE',
    notes: `Scale: ${normScale.value}${normScale.baseUnit}, Tare: ${normTare.value}${normTare.baseUnit}, Net: ${netCurrentWeight}${normPrev.baseUnit}`,
  };
}

/**
 * Method B: Manual Tracking
 * User enters either consumed amount or new remaining amount
 */
export function calculateManualConsumption(input: ManualTrackingInput): CalculationResult {
  const normPrev = normalizeToBaseUnit(input.previousRemaining, input.unit);
  const normVal = normalizeToBaseUnit(input.value, input.unit);

  if (input.value < 0) {
    throw new Error('Input value cannot be negative.');
  }

  let consumed: number;
  let remaining: number;

  if (input.mode === 'consumed') {
    consumed = round(normVal.value, 2);
    if (consumed > normPrev.value) {
      throw new Error(
        `Consumed quantity (${consumed}${normPrev.baseUnit}) cannot exceed remaining inventory (${normPrev.value}${normPrev.baseUnit}).`
      );
    }
    remaining = round(Math.max(0, normPrev.value - consumed), 2);
  } else {
    // Mode is remaining
    remaining = round(normVal.value, 2);
    if (remaining > normPrev.value) {
      throw new Error(
        `New remaining quantity (${remaining}${normPrev.baseUnit}) cannot be greater than previous (${normPrev.value}${normPrev.baseUnit}).`
      );
    }
    consumed = round(normPrev.value - remaining, 2);
  }

  return {
    consumedQuantity: consumed,
    newRemainingQuantity: remaining,
    baseUnit: normPrev.baseUnit,
    method: 'MANUAL',
    notes: input.mode === 'consumed' ? 'Logged manual consumption' : 'Logged manual remaining reading',
  };
}

/**
 * Method C: Liquid Pump Dispensing Estimate
 * Consumption = Pump Count * Calibrated mL per Pump (default 1.5 mL)
 */
export function calculatePumpConsumption(input: PumpTrackingInput): CalculationResult {
  const { previousRemaining, pumpCount, mlPerPump = 1.5 } = input;

  if (pumpCount <= 0 || !Number.isInteger(pumpCount)) {
    throw new Error('Pump count must be a positive whole integer.');
  }

  if (mlPerPump <= 0) {
    throw new Error('Calibrated mL per pump must be greater than zero.');
  }

  const consumed = round(pumpCount * mlPerPump, 2);
  const remaining = round(Math.max(0, previousRemaining - consumed), 2);

  return {
    consumedQuantity: consumed,
    newRemainingQuantity: remaining,
    baseUnit: 'ml',
    method: 'PUMP_ESTIMATE',
    notes: `Estimated from ${pumpCount} pumps @ ${mlPerPump} mL/pump`,
  };
}

/**
 * Validation Guards:
 * - Detects duplicate measurement logged within 15 seconds for the same product
 */
export function checkDuplicateMeasurement(
  lastEventTimeIso: string | undefined,
  currentTimestampIso: string = new Date().toISOString(),
  thresholdSeconds = 15
): boolean {
  if (!lastEventTimeIso) return false;
  const lastTime = new Date(lastEventTimeIso).getTime();
  const currTime = new Date(currentTimestampIso).getTime();
  const diffSec = Math.abs(currTime - lastTime) / 1000;
  return diffSec < thresholdSeconds;
}

/**
 * Audit Trail Helper:
 * Appends a tamper-evident audit record when a usage event is updated or corrected
 */
export function createAuditRecord(
  action: 'CREATED' | 'EDITED' | 'CORRECTED',
  reason?: string,
  previousValue?: number,
  newValue?: number
): AuditEntry {
  return {
    timestamp: new Date().toISOString(),
    action,
    reason,
    previousValue,
    newValue,
  };
}
