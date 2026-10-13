'use client';

import React from 'react';
import {
  Square,
  ArrowUpRight,
  PenTool,
  MapPin,
  Undo2,
  Redo2,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { AnnotationType } from '@/lib/types';

interface ToolbarProps {
  activeTool: AnnotationType;
  onSelectTool: (tool: AnnotationType) => void;
  activeColor: string;
  onSelectColor: (color: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  showOcrBoxes: boolean;
  onToggleOcrBoxes: () => void;
}

const COLOR_OPTIONS = [
  { label: 'Miku Cyan', hex: '#39C5BB' },
  { label: 'Neon Pink', hex: '#FF6B9D' },
  { label: 'Mint Bright', hex: '#10B981' },
  { label: 'Slate Contrast', hex: '#334155' },
];

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  onSelectTool,
  activeColor,
  onSelectColor,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  showOcrBoxes,
  onToggleOcrBoxes,
}) => {
  const tools: { id: AnnotationType; label: string; icon: React.ReactNode }[] = [
    {
      id: 'box',
      label: 'Bounding Box',
      icon: <Square className="w-4 h-4" />,
    },
    {
      id: 'arrow',
      label: 'Arrow Indicator',
      icon: <ArrowUpRight className="w-4 h-4" />,
    },
    {
      id: 'pen',
      label: 'Highlighter Pen',
      icon: <PenTool className="w-4 h-4" />,
    },
    {
      id: 'pin',
      label: 'Numbered Pin',
      icon: <MapPin className="w-4 h-4" />,
    },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-white/95 backdrop-blur-md rounded-2xl border border-miku-mint-border shadow-miku w-full max-w-2xl mx-auto transition-all">
      {/* Drawing Tools Group */}
      <div className="flex items-center gap-1.5">
        {tools.map((t) => {
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTool(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-miku-cyan text-white shadow-miku scale-105'
                  : 'bg-slate-100 hover:bg-slate-200 text-miku-slate'
              }`}
              title={t.label}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Color Picker Group */}
      <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
        {COLOR_OPTIONS.map((c) => (
          <button
            key={c.hex}
            onClick={() => onSelectColor(c.hex)}
            className={`w-6 h-6 rounded-full transition-transform ${
              activeColor === c.hex
                ? 'ring-2 ring-offset-2 ring-miku-cyan scale-110 shadow-sm'
                : 'hover:scale-105'
            }`}
            style={{ backgroundColor: c.hex }}
            title={c.label}
          />
        ))}
      </div>

      {/* History and Utility Actions */}
      <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
        {/* Toggle OCR Word Overlay */}
        <button
          onClick={onToggleOcrBoxes}
          className={`p-2 rounded-full text-xs font-medium transition-all ${
            showOcrBoxes
              ? 'bg-miku-mint text-miku-cyan-deep border border-miku-cyan'
              : 'hover:bg-slate-100 text-miku-slate-subtle'
          }`}
          title={showOcrBoxes ? 'Hide OCR text boxes' : 'Show OCR text bounding boxes'}
        >
          {showOcrBoxes ? <Eye className="w-4 h-4 text-miku-cyan" /> : <EyeOff className="w-4 h-4" />}
        </button>

        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2 rounded-full hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none text-miku-slate transition-all"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-2 rounded-full hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none text-miku-slate transition-all"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <button
          onClick={onClear}
          className="p-2 rounded-full hover:bg-red-50 text-red-500 hover:text-red-600 transition-all"
          title="Clear Annotations"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
