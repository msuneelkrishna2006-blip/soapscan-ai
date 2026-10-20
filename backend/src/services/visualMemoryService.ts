import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ResolvedSoapSpec, ProductType, Unit } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../data');
const VISUAL_MEMORY_FILE = path.join(DATA_DIR, 'trained_visual_memory.json');

export interface VisualSample {
  id: string;
  brand: string;
  name: string;
  variant: string;
  productType: ProductType;
  netQuantity: number;
  unit: Unit;
  colorHex: string;
  shape: 'rectangle' | 'oval' | 'cylinder' | 'round';
  priceInr: number;
  keyVisualCues: string[];
  requireExplicitText?: string[];
  hueRange: [number, number];
  dominantRgb: [number, number, number];
  saturationRange: [number, number];
  brightnessRange: [number, number];
  fingerprint16x16?: string;
  minConfidence: number;
}

export interface VisualMemoryDatabase {
  version: string;
  lastUpdated: string;
  samples: VisualSample[];
}

let cachedMemory: VisualMemoryDatabase | null = null;

export function loadVisualMemory(): VisualMemoryDatabase {
  if (cachedMemory) return cachedMemory;

  try {
    if (fs.existsSync(VISUAL_MEMORY_FILE)) {
      const content = fs.readFileSync(VISUAL_MEMORY_FILE, 'utf-8');
      cachedMemory = JSON.parse(content);
      return cachedMemory!;
    }
  } catch (err) {
    console.error('[visualMemoryService] Error loading visual memory file:', err);
  }

  cachedMemory = {
    version: '2.0.0',
    lastUpdated: new Date().toISOString(),
    samples: [],
  };
  return cachedMemory;
}

export function saveVisualMemory(db: VisualMemoryDatabase): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    cachedMemory = db;
    fs.writeFileSync(VISUAL_MEMORY_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('[visualMemoryService] Error saving visual memory file:', err);
  }
}

/**
 * Converts RGB to HSV (Hue in [0, 360], Saturation in [0, 1], Value/Brightness in [0, 1])
 */
export function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  let h = 0;

  if (diff === 0) {
    h = 0;
  } else if (max === r) {
    h = ((g - b) / diff) % 6;
  } else if (max === g) {
    h = (b - r) / diff + 2;
  } else {
    h = (r - g) / diff + 4;
  }

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  const s = max === 0 ? 0 : diff / max;
  const v = max;

  return { h, s, v };
}

/**
 * Checks if a color falls within the typical human skin tone / warm indoor lighting cluster.
 * Used to PREVENT false positives (e.g. Hands or warm walls being labeled "Mysore Sandal Gold")
 */
export function isHumanSkinOrWarmLighting(r: number, g: number, b: number): boolean {
  // YCbCr approximation
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

  const isSkinChroma = cb >= 75 && cb <= 130 && cr >= 132 && cr <= 175;
  const isSkinRatio = r > g && g > b && r - g >= 12 && g - b >= 8;

  const { h, s } = rgbToHsv(r, g, b);
  const isSkinHue = h >= 12 && h <= 42 && s >= 0.18 && s <= 0.65;

  return (isSkinChroma || isSkinHue) && isSkinRatio && y > 40;
}

/**
 * Perceptual 16x16 Matcher & Visual Memory Classifier
 */
export function classifyByVisualMemory(params: {
  dominantRgb?: [number, number, number];
  hueHist?: number[];
  ocrText?: string;
  fingerprint?: string;
}): { sample: VisualSample; confidence: number; matchReason: string } | null {
  const memory = loadVisualMemory();
  const { dominantRgb, ocrText, fingerprint } = params;

  if (!dominantRgb && !fingerprint && !ocrText) return null;

  const [r, g, b] = dominantRgb || [128, 128, 128];
  const { h, s, v } = rgbToHsv(r, g, b);
  const ocrUpper = (ocrText || '').toUpperCase();

  // 1. Check if user is holding hands in warm room lighting without packaging
  const isSkinTone = isHumanSkinOrWarmLighting(r, g, b);

  let bestMatch: { sample: VisualSample; confidence: number; matchReason: string } | null = null;
  let highestScore = 0;

  for (const sample of memory.samples) {
    // CRITICAL RULE: If a sample requires explicit printed text (e.g. Mysore Sandal),
    // NEVER match unless the exact words appear in OCR!
    if (sample.requireExplicitText && sample.requireExplicitText.length > 0) {
      const hasRequired = sample.requireExplicitText.some(word => ocrUpper.includes(word));
      if (!hasRequired) {
        continue; // Disallow false-positive Mysore Sandal guess
      }
    }

    // If skin tone is detected and no explicit packaging text exists, skip warm tones
    if (isSkinTone && !ocrText && sample.brand === 'Mysore Sandal') {
      continue;
    }

    let score = 0;
    let matchReasons: string[] = [];

    // A. Hue Range Evaluation (circular distance)
    const [minHue, maxHue] = sample.hueRange;
    let hueMatch = false;
    if (minHue > maxHue) {
      // Wraps around 360 (e.g. 350 to 15 for Lifebuoy red)
      hueMatch = h >= minHue || h <= maxHue;
    } else {
      hueMatch = h >= minHue && h <= maxHue;
    }

    if (hueMatch) {
      score += 0.45;
      matchReasons.push(`Hue in range [${minHue}°, ${maxHue}°]`);
    } else {
      const hueDist = Math.min(Math.abs(h - minHue), Math.abs(h - maxHue), 360 - Math.abs(h - minHue));
      if (hueDist < 25) {
        score += 0.25;
        matchReasons.push(`Hue nearby (~${Math.round(hueDist)}° delta)`);
      }
    }

    // B. Saturation & Brightness
    if (s >= sample.saturationRange[0] && s <= sample.saturationRange[1]) {
      score += 0.2;
    }
    if (v >= sample.brightnessRange[0] && v <= sample.brightnessRange[1]) {
      score += 0.15;
    }

    // C. OCR Keywords reinforcement
    if (ocrText && ocrText.length > 2) {
      const brandUpper = sample.brand.toUpperCase();
      const variantUpper = sample.variant.toUpperCase();
      if (ocrUpper.includes(brandUpper)) {
        score += 0.45;
        matchReasons.push(`OCR brand keyword '${sample.brand}' identified`);
      } else if (sample.keyVisualCues.some(c => ocrUpper.includes(c.toUpperCase()))) {
        score += 0.3;
        matchReasons.push('Packaging cue keywords detected');
      }
    }

    // D. Fingerprint string match
    if (fingerprint && sample.fingerprint16x16) {
      let matches = 0;
      const len = Math.min(fingerprint.length, sample.fingerprint16x16.length);
      for (let i = 0; i < len; i += 6) {
        if (fingerprint.substring(i, i + 6) === sample.fingerprint16x16.substring(i, i + 6)) {
          matches++;
        }
      }
      const fpSimilarity = matches / (len / 6);
      if (fpSimilarity > 0.4) {
        score += 0.25 * fpSimilarity;
        matchReasons.push(`Perceptual 16x16 hash ${Math.round(fpSimilarity * 100)}% match`);
      }
    }

    // Check against sample's threshold
    if (score > highestScore && score >= (sample.minConfidence - 0.1)) {
      highestScore = score;
      bestMatch = {
        sample,
        confidence: Math.min(0.99, score),
        matchReason: matchReasons.join('; '),
      };
    }
  }

  return bestMatch;
}

/**
 * 1-Click Teach: Save or update a visual soap sample in trained_visual_memory.json
 */
export function teachVisualSample(newSample: Partial<VisualSample>): VisualSample {
  const memory = loadVisualMemory();

  const id = newSample.id || `vis-${(newSample.brand || 'soap').toLowerCase()}-${Date.now()}`;
  const existingIndex = memory.samples.findIndex(
    s => s.id === id || (s.brand.toLowerCase() === newSample.brand?.toLowerCase() && s.variant.toLowerCase() === newSample.variant?.toLowerCase())
  );

  const dominantRgb = newSample.dominantRgb || [128, 128, 128];
  const { h, s, v } = rgbToHsv(dominantRgb[0], dominantRgb[1], dominantRgb[2]);

  const compiledSample: VisualSample = {
    id,
    brand: newSample.brand || 'Artisan Soap',
    name: newSample.name || 'Bathing Bar',
    variant: newSample.variant || 'Standard',
    productType: newSample.productType || 'soap_bar',
    netQuantity: Number(newSample.netQuantity) || 100,
    unit: newSample.unit || 'g',
    colorHex: newSample.colorHex || '#059669',
    shape: newSample.shape || 'rectangle',
    priceInr: Number(newSample.priceInr) || 60,
    keyVisualCues: newSample.keyVisualCues || [newSample.brand || 'soap', newSample.variant || ''],
    requireExplicitText: newSample.requireExplicitText,
    hueRange: newSample.hueRange || [Math.max(0, h - 20), Math.min(360, h + 20)],
    dominantRgb,
    saturationRange: newSample.saturationRange || [Math.max(0, s - 0.25), Math.min(1, s + 0.25)],
    brightnessRange: newSample.brightnessRange || [Math.max(0, v - 0.25), Math.min(1, v + 0.25)],
    fingerprint16x16: newSample.fingerprint16x16,
    minConfidence: newSample.minConfidence || 0.85,
  };

  if (existingIndex >= 0) {
    memory.samples[existingIndex] = { ...memory.samples[existingIndex], ...compiledSample };
  } else {
    memory.samples.push(compiledSample);
  }

  memory.lastUpdated = new Date().toISOString();
  saveVisualMemory(memory);
  console.log(`[visualMemoryService] 🎓 Taught visual memory for '${compiledSample.brand} - ${compiledSample.name}' (${memory.samples.length} total samples).`);
  return compiledSample;
}
