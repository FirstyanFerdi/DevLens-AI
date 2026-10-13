'use client';

import React, { useState } from 'react';
import { useDevLens } from '@/hooks/useDevLens';
import { Header } from '@/components/Header';
import { DropZone } from '@/components/DropZone';
import { Toolbar } from '@/components/Toolbar';
import { AnnotationCanvas } from '@/components/AnnotationCanvas';
import { IntentSelector } from '@/components/IntentSelector';
import { MetricsCard } from '@/components/MetricsCard';
import { OutputConsole } from '@/components/OutputConsole';
import {
  Sparkles,
  Zap,
  Lock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

export default function HomePage() {
  const {
    imageSrc,
    activeTool,
    activeColor,
    activeIntent,
    userInstruction,
    annotations,
    isProcessing,
    processingProgress,
    processingStep,
    ocrResult,
    sanitizedResult,
    spatialAnchors,
    brailleResult,
    generatedPrompt,
    tokenMetrics,
    canUndo,
    canRedo,
    setActiveTool,
    setActiveColor,
    setActiveIntent,
    setUserInstruction,
    handleImageFile,
    loadPreset,
    addAnnotation,
    clearAnnotations,
    undo,
    redo,
    resetAll,
  } = useDevLens();

  const [showOcrBoxes, setShowOcrBoxes] = useState<boolean>(false);

  return (
    <div className="min-h-screen flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <main className="w-full space-y-6">
        {/* Miku UI Hero Masthead */}
        <Header
          onSelectPreset={loadPreset}
          onReset={resetAll}
          hasImage={Boolean(imageSrc)}
        />

        {/* View Mode 1: No Image Loaded -> Ingestion Dropzone & Highlights */}
        {!imageSrc ? (
          <div className="space-y-8 animate-fadeIn">
            <DropZone
              onImageSelected={handleImageFile}
              onSelectPreset={loadPreset}
            />

            {/* Feature & Architecture Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-miku-mint flex items-center justify-center text-miku-cyan shadow-xs">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-miku-slate">
                  100% Client-Side Privacy
                </h3>
                <p className="text-xs text-miku-slate-subtle leading-relaxed">
                  Screenshots are never uploaded to any remote server. OCR (Tesseract.js Web Worker), spatial anchoring, and regex credential sanitization run completely inside your local browser.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-miku-pink-soft flex items-center justify-center text-miku-pink-vivid shadow-xs">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-miku-slate">
                  85% - 95% Token Savings
                </h3>
                <p className="text-xs text-miku-slate-subtle leading-relaxed">
                  Vision API models consume ~1,400 tokens ($0.015) per full screenshot. DevLens generates compact, high-density text prompts (~150 tokens) with precise coordinates and OCR context.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-miku-cyan-deep shadow-xs">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-miku-slate">
                  Dual-Layer Spatial Pipeline
                </h3>
                <p className="text-xs text-miku-slate-subtle leading-relaxed">
                  Combines semantic text parsing with mathematical spatial proximity (e.g. &ldquo;Right of &lt;SearchInput /&gt;&rdquo;) and an optional 32x32 Braille micro-matrix for 2D UI topology.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* View Mode 2: Interactive Visual Annotation Workspace */
          <div className="space-y-6">
            {/* Floating Glassmorphic Toolbar */}
            <Toolbar
              activeTool={activeTool}
              onSelectTool={setActiveTool}
              activeColor={activeColor}
              onSelectColor={setActiveColor}
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={undo}
              onRedo={redo}
              onClear={clearAnnotations}
              showOcrBoxes={showOcrBoxes}
              onToggleOcrBoxes={() => setShowOcrBoxes((v) => !v)}
            />

            {/* Main Dual-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Visual Canvas & Developer Intent */}
              <div className="lg:col-span-7 space-y-6">
                <AnnotationCanvas
                  imageSrc={imageSrc}
                  annotations={annotations}
                  activeTool={activeTool}
                  activeColor={activeColor}
                  ocrWords={ocrResult.words}
                  showOcrBoxes={showOcrBoxes}
                  isProcessing={isProcessing}
                  processingProgress={processingProgress}
                  processingStep={processingStep}
                  onAddAnnotation={addAnnotation}
                />

                {/* Spatial Anchor Pill Indicators */}
                {spatialAnchors.length > 0 && (
                  <div className="p-4 rounded-3xl bg-white shadow-card border border-slate-100 space-y-2">
                    <span className="text-xs font-bold text-miku-slate uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-miku-cyan" />
                      Detected Spatial Anchors:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {spatialAnchors.map((anchor, i) => (
                        <div
                          key={anchor.annotationId || i}
                          className="px-3 py-1.5 rounded-full bg-miku-mint/60 border border-miku-mint-border text-xs text-miku-cyan-deep flex items-center gap-1.5"
                        >
                          <span className="font-bold">[{anchor.targetBox.w}×{anchor.targetBox.h}]</span>
                          <span>{anchor.relativeDescription}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4 Mode Intent Selector & Custom Instructions */}
                <IntentSelector
                  activeIntent={activeIntent}
                  onSelectIntent={setActiveIntent}
                  userInstruction={userInstruction}
                  onChangeInstruction={setUserInstruction}
                />
              </div>

              {/* Right Column: Live Token Optimizer & Output Console */}
              <div className="lg:col-span-5 space-y-6">
                {/* Real-time Token Metrics Card */}
                <MetricsCard metrics={tokenMetrics} />

                {/* Markdown Output Console */}
                <OutputConsole
                  promptText={generatedPrompt}
                  sanitizedResult={sanitizedResult}
                  brailleResult={brailleResult}
                  tokenCount={tokenMetrics.devLensPromptTokens}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer with Miku UI Aesthetic */}
      <footer className="mt-12 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-miku-slate-subtle">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-miku-cyan animate-pulse" />
          <span className="font-semibold text-miku-slate">DevLens AI (Screen2Prompt)</span>
          <span>•</span>
          <span>Miku UI Edition v2.0</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-slate-500">
            <Cpu className="w-3.5 h-3.5 text-miku-cyan" /> Next.js 14 App Router
          </span>
          <span className="flex items-center gap-1 text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Zero Telemetry
          </span>
        </div>
      </footer>
    </div>
  );
}
