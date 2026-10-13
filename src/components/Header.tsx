'use client';

import React from 'react';
import { ShieldCheck, Cpu, Sparkles, RotateCcw, HelpCircle, Layers } from 'lucide-react';
import { SAMPLE_PRESETS } from '@/lib/sample-data';

interface HeaderProps {
  onSelectPreset: (presetId: string) => void;
  onReset: () => void;
  hasImage: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onSelectPreset, onReset, hasImage }) => {
  return (
    <header className="relative w-full mb-6">
      {/* Top Banner with Miku UI Aesthetic */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-miku-cyan via-[#45D3C8] to-[#60E2D8] p-6 sm:p-8 text-white shadow-miku-lg border border-white/20">
        {/* Subtle decorative anime glow & kanji overlay */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute top-2 right-6 font-mono text-xs text-white/40 tracking-widest hidden sm:block select-none pointer-events-none">
          SYSTEM_VER: 2.0 // MIKU_CORE
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold tracking-wide uppercase border border-white/30 text-white">
                <Sparkles className="w-3.5 h-3.5 text-miku-pink-soft animate-spin-slow" />
                Screen2Prompt Engine
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-miku-slate-dark/40 backdrop-blur-sm text-xs font-medium text-miku-mint border border-white/20">
                <ShieldCheck className="w-3.5 h-3.5 text-miku-cyan-bright" />
                100% Client-Side • Zero-Server Upload
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow-sm text-white">
                DevLens AI
              </h1>
              <span className="text-sm font-medium text-teal-100 tracking-wider hidden lg:inline">
                初音ミク風 DevLens AI ・ 画面からプロンプトへ
              </span>
            </div>

            <p className="text-sm text-white/90 leading-relaxed">
              Transform developer screenshots into ultra-compact, token-efficient LLM prompts. 
              Save <span className="font-bold underline decoration-white/50">85%–95%</span> tokens 
              (~150 tokens vs ~1,400 vision tokens) using Client-Side OCR, Spatial Anchoring &amp; Braille Micro-Matrix.
            </p>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            {hasImage && (
              <button
                onClick={onReset}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-sm font-semibold text-white transition-all shadow-sm active:scale-95 border border-white/30"
                title="Reset Workspace"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            )}
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-miku-slate/80 text-white text-xs font-mono shadow-sm">
              <Cpu className="w-3.5 h-3.5 text-miku-cyan" />
              <span>WASM OCR</span>
            </div>
          </div>
        </div>

        {/* Quick Sample Presets Bar */}
        <div className="mt-5 pt-4 border-t border-white/20 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-teal-100 flex items-center gap-1 mr-1">
            <Layers className="w-3.5 h-3.5" />
            Quick Presets:
          </span>
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset.id)}
              className="px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/35 active:scale-95 text-xs font-medium text-white transition-all backdrop-blur-sm border border-white/30 shadow-xs flex items-center gap-1.5"
            >
              <span>{preset.title}</span>
              <span className="text-[10px] text-teal-100 opacity-80">({preset.subtitle.split(' ')[0]})</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
