import { BrowserMultiFormatReader } from '@zxing/browser';

// Web Audio API POS Scanner Beep
export function playBarcodeBeep() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Clear high-pitched scanner confirmation tone (1760Hz)
    osc.frequency.setValueAtTime(1760, ctx.currentTime);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (err) {
    // AudioContext might be blocked before user gesture
  }
}

// Global cached ZXing reader instance
let zxingReader: BrowserMultiFormatReader | null = null;
function getZxingReader(): BrowserMultiFormatReader {
  if (!zxingReader) {
    zxingReader = new BrowserMultiFormatReader();
  }
  return zxingReader;
}

export interface BarcodeDetectionResult {
  code: string;
  format?: string;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Dual-Engine Barcode Decoder:
 * 1. Native window.BarcodeDetector API (Supported natively in Chromium / Edge)
 * 2. Fallback to @zxing/browser BrowserMultiFormatReader (100% cross-browser)
 */
export async function decodeBarcodeFromCanvas(
  canvas: HTMLCanvasElement
): Promise<BarcodeDetectionResult | null> {
  // Engine 1: Native BarcodeDetector
  if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
    try {
      const BarcodeDetectorClass = (window as any).BarcodeDetector;
      const detector = new BarcodeDetectorClass({
        formats: [
          'ean_13',
          'ean_8',
          'upc_a',
          'upc_e',
          'code_128',
          'code_39',
          'qr_code',
          'data_matrix',
        ],
      });
      const results = await detector.detect(canvas);
      if (results && results.length > 0) {
        const first = results[0];
        const raw = first.rawValue?.trim();
        if (raw && raw.length >= 4) {
          const box = first.boundingBox
            ? {
                x: first.boundingBox.x,
                y: first.boundingBox.y,
                width: first.boundingBox.width,
                height: first.boundingBox.height,
              }
            : undefined;
          return {
            code: raw,
            format: first.format,
            boundingBox: box,
          };
        }
      }
    } catch {
      // Fallback to ZXing
    }
  }

  // Engine 2: ZXing Library Fallback
  try {
    const reader = getZxingReader();
    const result = reader.decodeFromCanvas(canvas);
    if (result && result.getText()) {
      const code = result.getText().trim();
      if (code.length >= 4) {
        return {
          code,
          format: result.getBarcodeFormat()?.toString(),
        };
      }
    }
  } catch {
    // No barcode found in current frame
  }

  return null;
}

/**
 * Decode barcode directly from an HTMLVideoElement
 */
export async function decodeBarcodeFromVideo(
  video: HTMLVideoElement
): Promise<BarcodeDetectionResult | null> {
  if (!video || video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
    return null;
  }

  // Engine 1: Native BarcodeDetector directly on video
  if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
    try {
      const BarcodeDetectorClass = (window as any).BarcodeDetector;
      const detector = new BarcodeDetectorClass({
        formats: [
          'ean_13',
          'ean_8',
          'upc_a',
          'upc_e',
          'code_128',
          'code_39',
          'qr_code',
        ],
      });
      const results = await detector.detect(video);
      if (results && results.length > 0) {
        const raw = results[0].rawValue?.trim();
        if (raw && raw.length >= 4) {
          return {
            code: raw,
            format: results[0].format,
          };
        }
      }
    } catch {}
  }

  // Engine 2: Offscreen canvas sampling + ZXing
  const canvas = document.createElement('canvas');
  // Scale down for speed (max 800px width)
  const maxW = 800;
  let w = video.videoWidth;
  let h = video.videoHeight;
  if (w > maxW) {
    h = Math.round((h * maxW) / w);
    w = maxW;
  }
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(video, 0, 0, w, h);

  return await decodeBarcodeFromCanvas(canvas);
}

/**
 * Decode barcode from an uploaded image file
 */
export async function decodeBarcodeFromImageFile(
  file: File
): Promise<BarcodeDetectionResult | null> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = async () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }
      ctx.drawImage(img, 0, 0);
      const res = await decodeBarcodeFromCanvas(canvas);
      resolve(res);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}
