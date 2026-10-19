import { describe, it, expect } from 'vitest';
import {
  normalizeToBaseUnit,
  calculateScaleConsumption,
  calculateManualConsumption,
  calculatePumpConsumption,
  checkDuplicateMeasurement,
  round,
} from '../consumptionEngine';

describe('consumptionEngine - Unit Normalization', () => {
  it('converts kg to grams correctly', () => {
    const res = normalizeToBaseUnit(0.125, 'kg');
    expect(res.value).toBe(125);
    expect(res.baseUnit).toBe('g');
  });

  it('keeps grams as grams', () => {
    const res = normalizeToBaseUnit(100, 'g');
    expect(res.value).toBe(100);
    expect(res.baseUnit).toBe('g');
  });

  it('converts liters to milliliters correctly', () => {
    const res = normalizeToBaseUnit(0.5, 'l');
    expect(res.value).toBe(500);
    expect(res.baseUnit).toBe('ml');
  });

  it('keeps milliliters as milliliters', () => {
    const res = normalizeToBaseUnit(250, 'ml');
    expect(res.value).toBe(250);
    expect(res.baseUnit).toBe('ml');
  });
});

describe('consumptionEngine - Method A: Scale Tracking', () => {
  it('calculates scale consumption accurately with tare weight', () => {
    // Previous soap was 100g. Scale reads 125g (dish is 30g tare).
    // Net weight = 125 - 30 = 95g.
    // Consumed = 100 - 95 = 5g.
    const result = calculateScaleConsumption({
      previousRemaining: 100,
      scaleReading: 125,
      tareWeight: 30,
      unit: 'g',
    });

    expect(result.consumedQuantity).toBe(5);
    expect(result.newRemainingQuantity).toBe(95);
    expect(result.baseUnit).toBe('g');
    expect(result.method).toBe('SCALE');
  });

  it('throws if scale reading is less than tare weight', () => {
    expect(() => {
      calculateScaleConsumption({
        previousRemaining: 100,
        scaleReading: 20,
        tareWeight: 30,
        unit: 'g',
      });
    }).toThrow('Scale reading cannot be less than the tare weight.');
  });

  it('throws if net weight exceeds previous remaining weight', () => {
    // Previous is 100g. Net reading is 110g. Negative consumption!
    expect(() => {
      calculateScaleConsumption({
        previousRemaining: 100,
        scaleReading: 140,
        tareWeight: 30,
        unit: 'g',
      });
    }).toThrow(/greater than previous remaining/);
  });
});

describe('consumptionEngine - Method B: Manual Tracking', () => {
  it('correctly calculates new remaining when consumed quantity is provided', () => {
    const result = calculateManualConsumption({
      previousRemaining: 125,
      mode: 'consumed',
      value: 12.5,
      unit: 'g',
    });

    expect(result.consumedQuantity).toBe(12.5);
    expect(result.newRemainingQuantity).toBe(112.5);
    expect(result.method).toBe('MANUAL');
  });

  it('correctly calculates consumed quantity when remaining quantity is provided', () => {
    const result = calculateManualConsumption({
      previousRemaining: 125,
      mode: 'remaining',
      value: 110,
      unit: 'g',
    });

    expect(result.consumedQuantity).toBe(15);
    expect(result.newRemainingQuantity).toBe(110);
    expect(result.method).toBe('MANUAL');
  });

  it('throws error if entered consumed quantity is greater than previous remaining', () => {
    expect(() => {
      calculateManualConsumption({
        previousRemaining: 50,
        mode: 'consumed',
        value: 60,
        unit: 'g',
      });
    }).toThrow(/cannot exceed remaining inventory/);
  });

  it('throws error if entered remaining quantity is greater than previous remaining', () => {
    expect(() => {
      calculateManualConsumption({
        previousRemaining: 50,
        mode: 'remaining',
        value: 60,
        unit: 'g',
      });
    }).toThrow(/cannot be greater than previous/);
  });
});

describe('consumptionEngine - Method C: Liquid Pump Dispensing', () => {
  it('calculates pump estimate with default 1.5 mL per pump', () => {
    // 250 mL soap, 4 pumps = 6 mL consumed, 244 mL remaining
    const result = calculatePumpConsumption({
      previousRemaining: 250,
      pumpCount: 4,
    });

    expect(result.consumedQuantity).toBe(6);
    expect(result.newRemainingQuantity).toBe(244);
    expect(result.baseUnit).toBe('ml');
    expect(result.method).toBe('PUMP_ESTIMATE');
  });

  it('supports custom calibrated mL per pump', () => {
    const result = calculatePumpConsumption({
      previousRemaining: 500,
      pumpCount: 3,
      mlPerPump: 2.0,
    });

    expect(result.consumedQuantity).toBe(6);
    expect(result.newRemainingQuantity).toBe(494);
  });

  it('throws on non-positive or float pump counts', () => {
    expect(() => {
      calculatePumpConsumption({
        previousRemaining: 200,
        pumpCount: 0,
      });
    }).toThrow(/positive whole integer/);

    expect(() => {
      calculatePumpConsumption({
        previousRemaining: 200,
        pumpCount: 2.5,
      });
    }).toThrow(/positive whole integer/);
  });
});

describe('consumptionEngine - Duplicate Prevention', () => {
  it('identifies duplicate events within 15 seconds', () => {
    const now = new Date('2026-10-19T10:00:10Z');
    const recent = new Date('2026-10-19T10:00:02Z').toISOString();

    const isDup = checkDuplicateMeasurement(recent, now.toISOString(), 15);
    expect(isDup).toBe(true);
  });

  it('permits events logged after 15 seconds', () => {
    const now = new Date('2026-10-19T10:00:30Z');
    const past = new Date('2026-10-19T10:00:00Z').toISOString();

    const isDup = checkDuplicateMeasurement(past, now.toISOString(), 15);
    expect(isDup).toBe(false);
  });
});
