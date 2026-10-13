'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Annotation,
  AnnotationType,
  DeveloperIntent,
  OCRResult,
  SanitizedResult,
  SpatialAnchor,
  BrailleMatrixResult,
  TokenMetrics,
} from '@/lib/types';
import { runClientSideOCR } from '@/lib/ocr-worker';
import { sanitizeText } from '@/lib/sanitizer';
import { analyzeSpatialRelationships } from '@/lib/spatial-analyzer';
import { generateBrailleFromCanvas } from '@/lib/braille-encoder';
import { buildPrompt } from '@/lib/prompt-builder';
import { calculateTokenMetrics } from '@/lib/token-counter';
import { SAMPLE_PRESETS } from '@/lib/sample-data';

const DEFAULT_METRICS: TokenMetrics = {
  devLensPromptTokens: 0,
  visionEstimatedTokens: 1400,
  savedTokens: 1400,
  savedPercentage: 100,
  costVisionUSD: 0.015,
  costDevLensUSD: 0,
  costSavingsPercent: 100,
};

const DEFAULT_OCR: OCRResult = {
  rawText: '',
  blocks: [],
  words: [],
  status: 'idle',
  progress: 0,
};

const DEFAULT_SANITIZED: SanitizedResult = {
  cleanText: '',
  redactedItems: [],
  redactedCount: 0,
};

export function useDevLens() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [activeTool, setActiveTool] = useState<AnnotationType>('box');
  const [activeColor, setActiveColor] = useState<string>('#39C5BB');
  const [activeIntent, setActiveIntent] = useState<DeveloperIntent>('add-feature');
  const [userInstruction, setUserInstruction] = useState<string>('');

  // Annotations & Undo/Redo stack
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [history, setHistory] = useState<Annotation[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Pipeline processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [processingProgress, setProcessingProgress] = useState<number>(0);

  // Extracted data
  const [ocrResult, setOcrResult] = useState<OCRResult>(DEFAULT_OCR);
  const [sanitizedResult, setSanitizedResult] = useState<SanitizedResult>(DEFAULT_SANITIZED);
  const [spatialAnchors, setSpatialAnchors] = useState<SpatialAnchor[]>([]);
  const [brailleResult, setBrailleResult] = useState<BrailleMatrixResult | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [tokenMetrics, setTokenMetrics] = useState<TokenMetrics>(DEFAULT_METRICS);

  const imageElementRef = useRef<HTMLImageElement | null>(null);

  // Re-synthesize prompt & update token calculations
  const updateSynthesizedPrompt = useCallback(
    (
      currentIntent: DeveloperIntent,
      instruction: string,
      currentAnnotations: Annotation[],
      currentAnchors: SpatialAnchor[],
      currentSanitized: SanitizedResult,
      currentBraille: BrailleMatrixResult | null,
      dims: { width: number; height: number } | null
    ) => {
      const prompt = buildPrompt({
        intent: currentIntent,
        userInstruction: instruction,
        annotations: currentAnnotations,
        spatialAnchors: currentAnchors,
        sanitizedOCR: currentSanitized,
        brailleResult: currentBraille,
        imageDimensions: dims,
      });

      setGeneratedPrompt(prompt);
      const metrics = calculateTokenMetrics(prompt, dims);
      setTokenMetrics(metrics);
    },
    []
  );

  // Run full extraction pipeline
  const processImagePipeline = useCallback(
    async (
      imgUrl: string,
      newAnnotations: Annotation[] = [],
      dims?: { width: number; height: number }
    ) => {
      setIsProcessing(true);
      setProcessingStep('Starting Client-Side Tesseract OCR...');
      setProcessingProgress(10);

      try {
        // Step 1: Run OCR in Web Worker
        const ocr = await runClientSideOCR(imgUrl, (progress, status) => {
          setProcessingProgress(Math.max(10, Math.min(progress, 85)));
          setProcessingStep(`OCR Processing: ${status} (${progress}%)`);
        });

        setOcrResult(ocr);
        setProcessingStep('Sanitizing Sensitive Credentials & Secrets...');
        setProcessingProgress(88);

        // Step 2: Auto-Sanitizer Filter
        const sanitized = sanitizeText(ocr.rawText);
        setSanitizedResult(sanitized);

        // Step 3: Spatial Analysis & Braille Matrix
        setProcessingStep('Computing Spatial Anchors & Braille Density...');
        setProcessingProgress(95);

        let braille: BrailleMatrixResult | null = null;
        if (typeof window !== 'undefined') {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = imgUrl;
          await new Promise((res) => {
            img.onload = () => res(true);
            img.onerror = () => res(false);
          });

          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 800;
          canvas.height = img.naturalHeight || 600;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            braille = generateBrailleFromCanvas(canvas, 32, 32);
            setBrailleResult(braille);
          }
        }

        const effectiveDims = dims || imageDimensions || { width: 800, height: 600 };
        const anchors = analyzeSpatialRelationships(
          newAnnotations,
          ocr.words,
          ocr.blocks,
          effectiveDims
        );
        setSpatialAnchors(anchors);

        // Step 4: Synthesize Prompt & Metrics
        setProcessingStep('Synthesizing Developer LLM Prompt...');
        setProcessingProgress(100);

        updateSynthesizedPrompt(
          activeIntent,
          userInstruction,
          newAnnotations,
          anchors,
          sanitized,
          braille,
          effectiveDims
        );
      } catch (err) {
        console.error('Pipeline processing error:', err);
      } finally {
        setIsProcessing(false);
        setProcessingStep('');
      }
    },
    [activeIntent, userInstruction, imageDimensions, updateSynthesizedPrompt]
  );

  // Load an image from File/Blob
  const handleImageFile = useCallback(
    (file: File | Blob) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (!result) return;

        const img = new Image();
        img.onload = () => {
          const dims = { width: img.naturalWidth, height: img.naturalHeight };
          setImageDimensions(dims);
          setImageSrc(result);
          setAnnotations([]);
          setHistory([[]]);
          setHistoryIndex(0);
          processImagePipeline(result, [], dims);
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    },
    [processImagePipeline]
  );

  // Load preset sample
  const loadPreset = useCallback(
    (presetId: string) => {
      const preset = SAMPLE_PRESETS.find((p) => p.id === presetId);
      if (!preset) return;

      setActiveIntent(preset.intent);
      setUserInstruction(preset.userInstruction);
      setImageSrc(preset.imageSrc);

      const img = new Image();
      img.onload = () => {
        const dims = { width: img.naturalWidth || 900, height: img.naturalHeight || 500 };
        setImageDimensions(dims);
        setAnnotations(preset.initialAnnotations);
        setHistory([preset.initialAnnotations]);
        setHistoryIndex(0);
        processImagePipeline(preset.imageSrc, preset.initialAnnotations, dims);
      };
      img.src = preset.imageSrc;
    },
    [processImagePipeline]
  );

  // Annotation push with history management
  const pushAnnotations = useCallback(
    (newAnns: Annotation[]) => {
      setAnnotations(newAnns);
      const nextHistory = history.slice(0, historyIndex + 1);
      nextHistory.push(newAnns);
      setHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);

      // Re-evaluate spatial anchors & prompt
      const anchors = analyzeSpatialRelationships(
        newAnns,
        ocrResult.words,
        ocrResult.blocks,
        imageDimensions || { width: 800, height: 600 }
      );
      setSpatialAnchors(anchors);

      updateSynthesizedPrompt(
        activeIntent,
        userInstruction,
        newAnns,
        anchors,
        sanitizedResult,
        brailleResult,
        imageDimensions
      );
    },
    [
      history,
      historyIndex,
      ocrResult,
      imageDimensions,
      updateSynthesizedPrompt,
      activeIntent,
      userInstruction,
      sanitizedResult,
      brailleResult,
    ]
  );

  const addAnnotation = useCallback(
    (ann: Annotation) => {
      const updated = [...annotations, ann];
      pushAnnotations(updated);
    },
    [annotations, pushAnnotations]
  );

  const clearAnnotations = useCallback(() => {
    pushAnnotations([]);
  }, [pushAnnotations]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const nextIdx = historyIndex - 1;
      setHistoryIndex(nextIdx);
      const prevAnns = history[nextIdx];
      setAnnotations(prevAnns);

      const anchors = analyzeSpatialRelationships(
        prevAnns,
        ocrResult.words,
        ocrResult.blocks,
        imageDimensions || { width: 800, height: 600 }
      );
      setSpatialAnchors(anchors);

      updateSynthesizedPrompt(
        activeIntent,
        userInstruction,
        prevAnns,
        anchors,
        sanitizedResult,
        brailleResult,
        imageDimensions
      );
    }
  }, [
    historyIndex,
    history,
    ocrResult,
    imageDimensions,
    activeIntent,
    userInstruction,
    sanitizedResult,
    brailleResult,
    updateSynthesizedPrompt,
  ]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      const nextAnns = history[nextIdx];
      setAnnotations(nextAnns);

      const anchors = analyzeSpatialRelationships(
        nextAnns,
        ocrResult.words,
        ocrResult.blocks,
        imageDimensions || { width: 800, height: 600 }
      );
      setSpatialAnchors(anchors);

      updateSynthesizedPrompt(
        activeIntent,
        userInstruction,
        nextAnns,
        anchors,
        sanitizedResult,
        brailleResult,
        imageDimensions
      );
    }
  }, [
    historyIndex,
    history,
    ocrResult,
    imageDimensions,
    activeIntent,
    userInstruction,
    sanitizedResult,
    brailleResult,
    updateSynthesizedPrompt,
  ]);

  // Update intent or user instruction triggers re-synthesis
  const changeIntent = useCallback(
    (newIntent: DeveloperIntent) => {
      setActiveIntent(newIntent);
      updateSynthesizedPrompt(
        newIntent,
        userInstruction,
        annotations,
        spatialAnchors,
        sanitizedResult,
        brailleResult,
        imageDimensions
      );
    },
    [
      userInstruction,
      annotations,
      spatialAnchors,
      sanitizedResult,
      brailleResult,
      imageDimensions,
      updateSynthesizedPrompt,
    ]
  );

  const changeInstruction = useCallback(
    (text: string) => {
      setUserInstruction(text);
      updateSynthesizedPrompt(
        activeIntent,
        text,
        annotations,
        spatialAnchors,
        sanitizedResult,
        brailleResult,
        imageDimensions
      );
    },
    [
      activeIntent,
      annotations,
      spatialAnchors,
      sanitizedResult,
      brailleResult,
      imageDimensions,
      updateSynthesizedPrompt,
    ]
  );

  const resetAll = useCallback(() => {
    setImageSrc(null);
    setImageDimensions(null);
    setAnnotations([]);
    setHistory([[]]);
    setHistoryIndex(0);
    setOcrResult(DEFAULT_OCR);
    setSanitizedResult(DEFAULT_SANITIZED);
    setSpatialAnchors([]);
    setBrailleResult(null);
    setGeneratedPrompt('');
    setTokenMetrics(DEFAULT_METRICS);
    setUserInstruction('');
  }, []);

  // Global Paste Listener (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            handleImageFile(blob);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => {
      window.removeEventListener('paste', handleGlobalPaste);
    };
  }, [handleImageFile]);

  return {
    imageSrc,
    imageDimensions,
    activeTool,
    activeColor,
    activeIntent,
    userInstruction,
    annotations,
    isProcessing,
    processingStep,
    processingProgress,
    ocrResult,
    sanitizedResult,
    spatialAnchors,
    brailleResult,
    generatedPrompt,
    tokenMetrics,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    imageElementRef,
    // Actions
    setActiveTool,
    setActiveColor,
    setActiveIntent: changeIntent,
    setUserInstruction: changeInstruction,
    handleImageFile,
    loadPreset,
    addAnnotation,
    clearAnnotations,
    undo,
    redo,
    resetAll,
  };
}
