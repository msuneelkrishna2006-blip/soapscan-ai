import { useState, useCallback, useRef, useEffect } from 'react';
import {
  decodeBarcodeFromVideo,
  decodeBarcodeFromImageFile,
  playBarcodeBeep,
} from './barcodeScanner';

export interface UseBarcodeScannerOptions {
  onDetected?: (code: string, format?: string) => void;
  autoBeep?: boolean;
  scanIntervalMs?: number;
}

export function useBarcodeScanner(options: UseBarcodeScannerOptions = {}) {
  const { onDetected, autoBeep = true, scanIntervalMs = 250 } = options;
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const handleBarcodeFound = useCallback(
    (code: string, format?: string) => {
      setLastScannedCode(code);
      if (autoBeep) {
        playBarcodeBeep();
      }
      onDetected?.(code, format);
    },
    [autoBeep, onDetected]
  );

  const startScanning = useCallback(
    (videoEl: HTMLVideoElement) => {
      videoElementRef.current = videoEl;
      setIsScanning(true);

      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = window.setInterval(async () => {
        if (!videoElementRef.current || videoElementRef.current.readyState < 2) return;

        try {
          const result = await decodeBarcodeFromVideo(videoElementRef.current);
          if (result && result.code) {
            handleBarcodeFound(result.code, result.format);
          }
        } catch (e) {
          // Frame decode skip
        }
      }, scanIntervalMs);
    },
    [handleBarcodeFound, scanIntervalMs]
  );

  const stopScanning = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    videoElementRef.current = null;
    setIsScanning(false);
  }, []);

  const scanImage = useCallback(
    async (file: File) => {
      setIsProcessing(true);
      try {
        const result = await decodeBarcodeFromImageFile(file);
        if (result && result.code) {
          handleBarcodeFound(result.code, result.format);
          return result;
        }
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [handleBarcodeFound]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return {
    isScanning,
    isProcessing,
    lastScannedCode,
    startScanning,
    stopScanning,
    scanImage,
  };
}
