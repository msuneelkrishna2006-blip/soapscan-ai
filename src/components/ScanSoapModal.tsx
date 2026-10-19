import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Barcode,
  Sparkles,
  X,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Plus,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { InventoryItem, AIScanResult, FamilyMember, ProductType, Unit } from '../types';
import { scanSoapAI } from '../lib/api';

interface ScanSoapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemAdded: (item: InventoryItem) => void;
  familyMembers: FamilyMember[];
}

export const ScanSoapModal: React.FC<ScanSoapModalProps> = ({
  isOpen,
  onClose,
  onItemAdded,
  familyMembers,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'barcode'>('camera');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Inputs
  const [ocrHint, setOcrHint] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');

  // AI Result / Form fields
  const [scanResult, setScanResult] = useState<AIScanResult | null>(null);
  const [brand, setBrand] = useState('');
  const [name, setName] = useState('');
  const [variant, setVariant] = useState('');
  const [productType, setProductType] = useState<ProductType>('soap_bar');
  const [initialQuantity, setInitialQuantity] = useState<number>(100);
  const [unit, setUnit] = useState<Unit>('g');
  const [tareWeightG, setTareWeightG] = useState<number>(25);
  const [costInr, setCostInr] = useState<number>(60);
  const [location, setLocation] = useState('Master Bathroom');
  const [assignedMemberId, setAssignedMemberId] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Preset barcodes for quick testing
  const presets = [
    { label: 'Dove 100g Bar', code: '8901030383457' },
    { label: 'Dettol 125g Bar', code: '8901396115203' },
    { label: 'Pears 125g Bar', code: '8901030704986' },
    { label: 'Santoor 100g Bar', code: '8901030005434' },
    { label: 'Lifebuoy Handwash 200ml', code: '8901030800001' },
  ];

  // Stop media tracks reliably
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      resetForm();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const resetForm = () => {
    setCapturedImage(null);
    setScanResult(null);
    setCameraError(null);
    setOcrHint('');
    setBarcodeInput('');
    setBrand('');
    setName('');
    setVariant('');
    setProductType('soap_bar');
    setInitialQuantity(100);
    setUnit('g');
    setTareWeightG(25);
    setCostInr(60);
  };

  // Start Camera ONLY when user explicitly clicks "Start Camera"
  const startCamera = async () => {
    setCameraError(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        'Unable to access camera. Please check browser permissions or use file upload / barcode lookup.'
      );
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      stopCamera();
      analyzeImage(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      setCapturedImage(dataUrl);
      analyzeImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64Img: string) => {
    setIsAnalyzing(true);
    try {
      const result = await scanSoapAI({
        imageBase64: base64Img,
        ocrText: ocrHint,
        barcode: barcodeInput,
      });
      populateFromScan(result);
    } catch (err: any) {
      console.error('Scan error:', err);
      alert('Error analyzing image with Gemma 4: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBarcodeLookup = async (codeToLookup?: string) => {
    const code = (codeToLookup || barcodeInput).trim();
    if (!code) return;

    setIsAnalyzing(true);
    try {
      const result = await scanSoapAI({
        barcode: code,
        ocrText: ocrHint,
      });
      populateFromScan(result);
    } catch (err: any) {
      console.error('Barcode lookup error:', err);
      alert('Error looking up barcode: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const populateFromScan = (res: AIScanResult) => {
    setScanResult(res);
    setBrand(res.brand || '');
    setName(res.name || '');
    setVariant(res.variant || '');
    setProductType(res.productType || 'soap_bar');
    setInitialQuantity(res.printedNetQuantity || 100);
    setUnit(res.printedUnit || 'g');
    if (res.productType === 'liquid_handwash') {
      setTareWeightG(40);
      setCostInr(95);
    } else {
      setTareWeightG(25);
      setCostInr(55);
    }
  };

  const handleSaveToInventory = () => {
    if (!brand.trim() || !name.trim()) {
      alert('Please provide brand and product name.');
      return;
    }

    const newItem: InventoryItem = {
      id: `item-${Date.now()}`,
      brand: brand.trim(),
      name: name.trim(),
      variant: variant.trim() || undefined,
      productType,
      initialQuantity: Number(initialQuantity) || 100,
      remainingQuantity: Number(initialQuantity) || 100,
      unit,
      tareWeightG: Number(tareWeightG) || 0,
      costInr: Number(costInr) || 0,
      location: location || 'Master Bathroom',
      assignedMemberId: assignedMemberId || undefined,
      barcode: barcodeInput.trim() || scanResult?.rawBarcode || undefined,
      imageUrl: capturedImage || undefined,
      status: 'active',
      isSampleData: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onItemAdded(newItem);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-auto bg-white dark:bg-obsidian-800 rounded-2xl border border-slate-200 dark:border-teal-900/40 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-obsidian-700 bg-slate-50/50 dark:bg-obsidian-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-radiant-teal/15 text-radiant-teal rounded-lg">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Scan Soap Packaging
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-radiant-teal/15 text-radiant-teal border border-radiant-teal/30">
                  Gemma 4 Vision
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Identify brand, net weight & soap characteristics using local on-device AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-obsidian-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 dark:border-obsidian-700 bg-slate-100/50 dark:bg-obsidian-950/60 p-1.5 gap-1.5">
          <button
            onClick={() => {
              setActiveTab('camera');
              if (capturedImage) setCapturedImage(null);
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition ${
              activeTab === 'camera'
                ? 'bg-white dark:bg-obsidian-700 text-radiant-teal shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" /> Live Camera
          </button>
          <button
            onClick={() => {
              setActiveTab('upload');
              stopCamera();
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition ${
              activeTab === 'upload'
                ? 'bg-white dark:bg-obsidian-700 text-radiant-teal shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" /> Upload Photo
          </button>
          <button
            onClick={() => {
              setActiveTab('barcode');
              stopCamera();
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition ${
              activeTab === 'barcode'
                ? 'bg-white dark:bg-obsidian-700 text-radiant-teal shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Barcode className="w-4 h-4" /> Barcode & Presets
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: Live Camera */}
          {activeTab === 'camera' && (
            <div className="space-y-4">
              <div className="relative aspect-video max-h-72 w-full bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-700">
                {capturedImage ? (
                  <img
                    src={capturedImage}
                    alt="Captured packaging"
                    className="w-full h-full object-contain"
                  />
                ) : isCameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6 space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-radiant-teal/10 flex items-center justify-center text-radiant-teal">
                      <Camera className="w-6 h-6" />
                    </div>
                    <p className="text-sm text-slate-300">
                      Camera will activate only after explicit permission.
                    </p>
                    <button
                      onClick={startCamera}
                      className="px-4 py-2 bg-radiant-teal hover:bg-radiant-light text-obsidian-950 font-semibold text-sm rounded-lg transition shadow-lg shadow-radiant-teal/20"
                    >
                      Start Camera
                    </button>
                  </div>
                )}

                {/* Retake overlay if image captured */}
                {capturedImage && (
                  <button
                    onClick={() => {
                      setCapturedImage(null);
                      startCamera();
                    }}
                    className="absolute top-3 right-3 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white text-xs rounded-lg backdrop-blur flex items-center gap-1.5 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Retake
                  </button>
                )}
              </div>

              {cameraError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}

              {isCameraActive && (
                <div className="flex justify-center gap-3">
                  <button
                    onClick={capturePhoto}
                    disabled={isAnalyzing}
                    className="px-6 py-2.5 bg-gradient-to-r from-radiant-teal to-radiant-light text-obsidian-950 font-bold text-sm rounded-xl hover:opacity-95 transition shadow-lg shadow-radiant-teal/20 flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" /> Capture to Gemma 4
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-4 py-2.5 bg-slate-700 text-slate-200 text-sm rounded-xl hover:bg-slate-600 transition"
                  >
                    Stop Camera
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Upload Photo */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-obsidian-600 hover:border-radiant-teal rounded-xl p-8 text-center cursor-pointer transition hover:bg-radiant-teal/5"
              >
                {capturedImage ? (
                  <div className="space-y-3">
                    <img
                      src={capturedImage}
                      alt="Uploaded"
                      className="max-h-56 mx-auto rounded-lg object-contain shadow-md"
                    />
                    <p className="text-xs text-radiant-teal font-medium">
                      Click to choose a different photo
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-full bg-radiant-teal/10 flex items-center justify-center text-radiant-teal">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      Upload Soap Packaging Photo
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Supports JPG, PNG, WEBP (analyzed locally by Gemma 4)
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Barcode & Quick Presets */}
          {activeTab === 'barcode' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter or scan barcode (e.g. 8901030383457)"
                  value={barcodeInput}
                  onChange={e => setBarcodeInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-lg text-sm focus:outline-none focus:border-radiant-teal text-slate-900 dark:text-slate-100"
                />
                <button
                  onClick={() => handleBarcodeLookup()}
                  disabled={isAnalyzing || !barcodeInput.trim()}
                  className="px-4 py-2 bg-radiant-teal text-obsidian-950 font-bold text-sm rounded-lg hover:bg-radiant-light transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  Lookup
                </button>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Quick-Test Preset Barcodes:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {presets.map(p => (
                    <button
                      key={p.code}
                      onClick={() => {
                        setBarcodeInput(p.code);
                        handleBarcodeLookup(p.code);
                      }}
                      className="p-2.5 text-left border border-slate-200 dark:border-obsidian-700 hover:border-radiant-teal rounded-lg bg-slate-50/70 dark:bg-obsidian-900/60 hover:bg-radiant-teal/5 transition flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-radiant-teal transition">
                          {p.label}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{p.code}</div>
                      </div>
                      <Zap className="w-3.5 h-3.5 text-slate-400 group-hover:text-radiant-teal" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Optional OCR / Packaging Text Hint */}
          <div className="p-3 bg-slate-100/60 dark:bg-obsidian-900/40 rounded-xl border border-slate-200 dark:border-obsidian-700/60 space-y-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <span>Packaging Text / OCR Hint (Optional)</span>
              <span className="text-[10px] text-slate-400 font-normal">
                - Helps Gemma 4 if lighting is low
              </span>
            </label>
            <input
              type="text"
              placeholder="e.g. Dove Cream Beauty Bathing Bar 100g, Dettol 125g"
              value={ocrHint}
              onChange={e => setOcrHint(e.target.value)}
              className="w-full px-3 py-1.5 bg-white dark:bg-obsidian-800 border border-slate-200 dark:border-obsidian-700 rounded-lg text-xs focus:outline-none focus:border-radiant-teal text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Loading Indicator */}
          {isAnalyzing && (
            <div className="py-6 flex flex-col items-center justify-center gap-3 bg-radiant-teal/5 rounded-xl border border-radiant-teal/20 animate-pulse">
              <RefreshCw className="w-6 h-6 text-radiant-teal animate-spin" />
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Gemma 4 Multimodal Analysis in Progress...
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Inspecting packaging geometry, typography & net weight
                </p>
              </div>
            </div>
          )}

          {/* AI Recognition Source & Confidence Banner */}
          {scanResult && !isAnalyzing && (
            <div className="p-4 rounded-xl bg-radiant-teal/10 border border-radiant-teal/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-radiant-teal">
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    Detected via{' '}
                    {scanResult.source === 'barcode_dictionary'
                      ? 'Verified Barcode Dictionary'
                      : scanResult.source === 'openbeautyfacts'
                      ? 'OpenBeautyFacts Database'
                      : scanResult.source === 'gemma4_vision'
                      ? 'Gemma 4 Vision AI'
                      : 'Intelligent Packaging Engine'}
                  </span>
                </div>
                <div className="text-xs font-mono px-2 py-0.5 rounded bg-radiant-teal/20 text-radiant-teal">
                  Confidence: {Math.round(scanResult.confidence * 100)}%
                </div>
              </div>

              {scanResult.warnings?.map((warn, i) => (
                <div key={i} className="text-[11px] text-amber-500/90 flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{warn}</span>
                </div>
              ))}
            </div>
          )}

          {/* Editable Product Verification Form */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Verify Product Information Before Adding
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Brand *
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  placeholder="e.g. Dove, Dettol, Pears"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-lg text-sm focus:outline-none focus:border-radiant-teal text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Beauty Bathing Bar"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-lg text-sm focus:outline-none focus:border-radiant-teal text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Variant / Fragrance
                </label>
                <input
                  type="text"
                  value={variant}
                  onChange={e => setVariant(e.target.value)}
                  placeholder="e.g. White Moisturizing, Pine"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-lg text-sm focus:outline-none focus:border-radiant-teal text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Product Type
                </label>
                <select
                  value={productType}
                  onChange={e => {
                    const pt = e.target.value as ProductType;
                    setProductType(pt);
                    if (pt === 'liquid_handwash' || pt === 'body_wash') {
                      setUnit('ml');
                    } else {
                      setUnit('g');
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-lg text-sm focus:outline-none focus:border-radiant-teal text-slate-900 dark:text-slate-100"
                >
                  <option value="soap_bar">Solid Soap Bar</option>
                  <option value="liquid_handwash">Liquid Handwash (Pump / Refill)</option>
                  <option value="body_wash">Body Wash / Shower Gel</option>
                  <option value="other">Other Cleanser</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Printed Net Qty *
                  </label>
                  <input
                    type="number"
                    value={initialQuantity}
                    onChange={e => setInitialQuantity(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-lg text-sm focus:outline-none focus:border-radiant-teal text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Unit
                  </label>
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value as Unit)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-lg text-sm focus:outline-none focus:border-radiant-teal text-slate-900 dark:text-slate-100"
                  >
                    <option value="g">Grams (g)</option>
                    <option value="ml">Milliliters (ml)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="l">Liters (l)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Tare Weight (Dish/Bottle) (g)
                  </label>
                  <input
                    type="number"
                    value={tareWeightG}
                    onChange={e => setTareWeightG(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-lg text-sm focus:outline-none focus:border-radiant-teal text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Price (₹ INR)
                  </label>
                  <input
                    type="number"
                    value={costInr}
                    onChange={e => setCostInr(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-lg text-sm focus:outline-none focus:border-radiant-teal text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Bathroom / Location
                </label>
                <select
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-lg text-sm focus:outline-none focus:border-radiant-teal text-slate-900 dark:text-slate-100"
                >
                  <option value="Master Bathroom">Master Bathroom</option>
                  <option value="Kids Bathroom">Kids Bathroom</option>
                  <option value="Guest Bathroom">Guest Bathroom</option>
                  <option value="Kitchen Sink">Kitchen Sink</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Assigned Family Member
                </label>
                <select
                  value={assignedMemberId}
                  onChange={e => setAssignedMemberId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-lg text-sm focus:outline-none focus:border-radiant-teal text-slate-900 dark:text-slate-100"
                >
                  <option value="">Shared / Household General</option>
                  {familyMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.avatar} {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-obsidian-700 bg-slate-50/50 dark:bg-obsidian-900/50">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-radiant-teal" />
            <span>Images processed on local device via Gemma 4</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveToInventory}
              className="px-5 py-2.5 bg-gradient-to-r from-radiant-teal to-radiant-light text-obsidian-950 font-bold text-sm rounded-xl hover:opacity-95 transition shadow-lg shadow-radiant-teal/25 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Save to Inventory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
