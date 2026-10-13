'use client';

import React from 'react';
import { DeveloperIntent } from '@/lib/types';
import { PlusCircle, Bug, Code2, Grid, MessageSquareQuote } from 'lucide-react';

interface IntentSelectorProps {
  activeIntent: DeveloperIntent;
  onSelectIntent: (intent: DeveloperIntent) => void;
  userInstruction: string;
  onChangeInstruction: (text: string) => void;
}

interface ModeConfig {
  id: DeveloperIntent;
  title: string;
  badge: string;
  icon: React.ReactNode;
  description: string;
  placeholder: string;
  quickSuggestions: string[];
}

const MODES: ModeConfig[] = [
  {
    id: 'add-feature',
    title: 'Feature Request',
    badge: 'Mode A',
    icon: <PlusCircle className="w-4 h-4" />,
    description: 'Calculates relative coordinates (e.g. "Right of SearchBar") and adjacent elements for new UI components.',
    placeholder: 'e.g. Tambahkan dropdown filter kategori di area yang ditandai kotak...',
    quickSuggestions: [
      'Tambahkan dropdown filter di sini',
      'Buat modal dialog trigger saat tombol ini diklik',
      'Tambahkan badge diskon promo di pojok kanan atas',
    ],
  },
  {
    id: 'fix-bug',
    title: 'Bug & Crash',
    badge: 'Mode B',
    icon: <Bug className="w-4 h-4" />,
    description: 'Extracts TypeError, stack trace, file path, and line numbers while sanitizing leaked API keys.',
    placeholder: 'e.g. Identifikasi penyebab crash TypeError dan perbaiki kode dengan defensive null checking...',
    quickSuggestions: [
      'Identifikasi penyebab crash TypeError dan berikan solusinya',
      'Jelaskan mengapa error ini terjadi dan beri patch kode aman',
      'Perbaiki error unhandled promise rejection ini',
    ],
  },
  {
    id: 'refactor-code',
    title: 'Code Refactor',
    badge: 'Mode C',
    icon: <Code2 className="w-4 h-4" />,
    description: 'Converts screenshot code into clean monospaced Markdown with preserved syntax indentation.',
    placeholder: 'e.g. Refactor fungsi ini ke TypeScript ketat dengan interface dan optimalkan performanya...',
    quickSuggestions: [
      'Refactor fungsi ini ke TypeScript modern dengan strict types',
      'Optimalkan kompleksitas algoritma dan bersihkan sintaks',
      'Ubah kode ini menjadi React custom hook yang reusable',
    ],
  },
  {
    id: 'spatial-wireframe',
    title: 'Wireframe 2D',
    badge: 'Mode D',
    icon: <Grid className="w-4 h-4" />,
    description: 'Generates 32x32 Braille micro-grid density matrix representing UI topology for responsive web generation.',
    placeholder: 'e.g. Rekonstruksi tata letak halaman ini menjadi komponen Next.js/Tailwind CSS...',
    quickSuggestions: [
      'Rekonstruksi tata letak ini ke Tailwind CSS Grid responsif',
      'Buat komponen Flexbox untuk wireframe dashboard ini',
      'Generate layout HTML5 semantik sesuai topologi braille di atas',
    ],
  },
];

export const IntentSelector: React.FC<IntentSelectorProps> = ({
  activeIntent,
  onSelectIntent,
  userInstruction,
  onChangeInstruction,
}) => {
  const currentMode = MODES.find((m) => m.id === activeIntent) || MODES[0];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-miku-slate uppercase tracking-wider flex items-center gap-2">
          <span>Developer Intent Mode</span>
        </h3>
        <span className="text-xs font-mono text-miku-slate-subtle">
          PRD Multi-Intent v2.0
        </span>
      </div>

      {/* 4 Mode Floating Pill Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {MODES.map((mode) => {
          const isActive = activeIntent === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onSelectIntent(mode.id)}
              className={`flex flex-col items-start p-3 rounded-2.5xl transition-all duration-200 text-left border ${
                isActive
                  ? 'bg-miku-mint border-miku-cyan shadow-miku text-miku-cyan-deep'
                  : 'bg-miku-mist hover:bg-slate-100 border-slate-200 text-miku-slate'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className={`p-1.5 rounded-full ${isActive ? 'bg-miku-cyan text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {mode.icon}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isActive ? 'bg-white text-miku-cyan' : 'bg-slate-200/60 text-slate-500'}`}>
                  {mode.badge}
                </span>
              </div>
              <span className="text-xs font-bold">{mode.title}</span>
            </button>
          );
        })}
      </div>

      {/* Mode Description Banner */}
      <div className="p-3 rounded-2xl bg-miku-mist border border-slate-200/70 text-xs text-miku-slate-subtle flex items-start gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-miku-cyan mt-1 shrink-0" />
        <p className="leading-relaxed">
          <strong className="text-miku-slate font-semibold">{currentMode.title}:</strong> {currentMode.description}
        </p>
      </div>

      {/* Custom User Instruction Textarea */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-miku-slate flex items-center gap-1.5">
          <MessageSquareQuote className="w-3.5 h-3.5 text-miku-cyan" />
          <span>User Goal / Instructions (Custom Prompt Detail)</span>
        </label>
        <textarea
          value={userInstruction}
          onChange={(e) => onChangeInstruction(e.target.value)}
          placeholder={currentMode.placeholder}
          rows={2}
          className="w-full text-xs sm:text-sm p-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-miku-cyan/50 focus:border-miku-cyan resize-none bg-slate-50/50"
        />

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-medium text-miku-slate-subtle">Quick suggestions:</span>
          {currentMode.quickSuggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => onChangeInstruction(suggestion)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-miku-mint hover:text-miku-cyan-deep text-miku-slate border border-slate-200/80 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
