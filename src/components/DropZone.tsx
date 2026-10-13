'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Clipboard, Sparkles, ArrowRight } from 'lucide-react';
import { SAMPLE_PRESETS } from '@/lib/sample-data';

interface DropZoneProps {
  onImageSelected: (file: File) => void;
  onSelectPreset: (presetId: string) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ onImageSelected, onSelectPreset }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onImageSelected(file);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        onImageSelected(file);
      }
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Main Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-300 ${
          isDragOver
            ? 'border-miku-cyan bg-miku-mint/40 scale-[1.01] shadow-miku'
            : 'border-miku-mint-border bg-white hover:border-miku-cyan hover:bg-miku-mint/10 shadow-card'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={handleFileInputChange}
          className="hidden"
          id="screenshot-input"
        />

        <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-4">
          <div className="w-20 h-20 rounded-full bg-miku-mint flex items-center justify-center text-miku-cyan shadow-sm animate-pulse-slow">
            <UploadCloud className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-miku-slate">
              Drop Developer Screenshot Here
            </h3>
            <p className="text-sm text-miku-slate-subtle">
              or press <kbd className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-xs font-semibold text-slate-700">Ctrl + V</kbd> to paste directly from Snipping Tool / Clipboard
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2.5 rounded-full bg-miku-cyan hover:bg-miku-cyan-bright active:scale-95 text-white font-semibold text-sm transition-all shadow-miku flex items-center gap-2"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Browse Image File</span>
            </button>
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-miku-mint text-miku-cyan-deep text-xs font-medium border border-miku-mint-border">
              <Clipboard className="w-3.5 h-3.5" />
              <span>Clipboard Paste Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Cards for Instant Testing */}
      <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-miku-cyan" />
            <h4 className="text-sm font-bold text-miku-slate uppercase tracking-wider">
              Or Try A Preloaded Benchmark Screenshot
            </h4>
          </div>
          <span className="text-xs text-miku-slate-subtle">Instant 1-Click Load</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset.id)}
              className="group text-left p-4 rounded-2.5xl bg-miku-mist hover:bg-miku-mint/40 border border-slate-200/80 hover:border-miku-cyan transition-all duration-200 hover:shadow-miku flex flex-col justify-between"
            >
              <div className="space-y-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-white border border-slate-200 text-miku-cyan-deep">
                  {preset.intent.replace('-', ' ')}
                </span>
                <h5 className="text-sm font-bold text-miku-slate group-hover:text-miku-cyan transition-colors">
                  {preset.title}
                </h5>
                <p className="text-xs text-miku-slate-subtle line-clamp-2">
                  {preset.subtitle}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs font-semibold text-miku-cyan">
                <span>Load Sample</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
