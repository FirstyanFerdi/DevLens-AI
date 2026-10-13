'use client';

import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  FileCode,
  FileText,
  ShieldAlert,
  Grid,
  Sparkles,
} from 'lucide-react';
import { SanitizedResult, BrailleMatrixResult } from '@/lib/types';
import confetti from 'canvas-confetti';

interface OutputConsoleProps {
  promptText: string;
  sanitizedResult: SanitizedResult;
  brailleResult: BrailleMatrixResult | null;
  tokenCount: number;
}

type TabType = 'prompt' | 'ocr' | 'sanitizer' | 'braille';

export const OutputConsole: React.FC<OutputConsoleProps> = ({
  promptText,
  sanitizedResult,
  brailleResult,
  tokenCount,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('prompt');
  const [copied, setCopied] = useState(false);

  const handleCopyPrompt = async () => {
    if (!promptText) return;
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);

      // Trigger celebratory Miku Cyan & Pink confetti
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#39C5BB', '#FF6B9D', '#E0F7F6', '#FFFFFF'],
      });

      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Failed to copy prompt:', e);
    }
  };

  const handleDownloadMarkdown = () => {
    if (!promptText) return;
    const blob = new Blob([promptText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `devlens-prompt-${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-3xl shadow-card border border-slate-100 overflow-hidden flex flex-col h-full">
      {/* Console Top Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-slate-200/60 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('prompt')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
              activeTab === 'prompt'
                ? 'bg-white text-miku-cyan-deep shadow-xs'
                : 'text-miku-slate hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-miku-cyan" />
            <span>LLM Prompt</span>
          </button>

          <button
            onClick={() => setActiveTab('ocr')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
              activeTab === 'ocr'
                ? 'bg-white text-miku-cyan-deep shadow-xs'
                : 'text-miku-slate hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>OCR Text</span>
          </button>

          <button
            onClick={() => setActiveTab('sanitizer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
              activeTab === 'sanitizer'
                ? 'bg-white text-miku-cyan-deep shadow-xs'
                : 'text-miku-slate hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-miku-pink" />
            <span>Sanitizer</span>
            {sanitizedResult.redactedCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-miku-pink text-white text-[10px] flex items-center justify-center">
                {sanitizedResult.redactedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('braille')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
              activeTab === 'braille'
                ? 'bg-white text-miku-cyan-deep shadow-xs'
                : 'text-miku-slate hover:text-slate-900'
            }`}
          >
            <Grid className="w-3.5 h-3.5 text-slate-500" />
            <span>32x32 Grid</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-miku-mint text-miku-cyan-deep border border-miku-mint-border">
            {tokenCount} tokens
          </span>

          <button
            onClick={handleDownloadMarkdown}
            disabled={!promptText}
            className="p-2 rounded-full hover:bg-slate-200 text-miku-slate disabled:opacity-40 transition-colors"
            title="Download .md prompt file"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleCopyPrompt}
            disabled={!promptText}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-40 ${
              copied
                ? 'bg-emerald-500 text-white'
                : 'bg-miku-cyan hover:bg-miku-cyan-bright text-white shadow-miku'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Prompt</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="p-4 sm:p-5 flex-1 overflow-auto bg-slate-900 text-slate-100 font-mono text-xs sm:text-sm min-h-[300px] max-h-[500px]">
        {activeTab === 'prompt' && (
          <div className="relative">
            {promptText ? (
              <pre className="whitespace-pre-wrap font-mono leading-relaxed selection:bg-miku-cyan/30 text-teal-50">
                {promptText}
              </pre>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-slate-500 space-y-2">
                <Sparkles className="w-6 h-6 text-slate-600 animate-pulse" />
                <p>Upload or paste a screenshot above to generate prompt</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ocr' && (
          <div>
            <div className="mb-2 pb-2 border-b border-slate-800 flex justify-between items-center text-slate-400 text-xs">
              <span>RAW EXTRACTED TEXT FROM TESSERACT.JS (WASM)</span>
              <span>{sanitizedResult.cleanText.length} characters</span>
            </div>
            {sanitizedResult.cleanText ? (
              <pre className="whitespace-pre-wrap text-slate-300 leading-relaxed">
                {sanitizedResult.cleanText}
              </pre>
            ) : (
              <p className="text-slate-500 italic">No OCR text extracted yet.</p>
            )}
          </div>
        )}

        {activeTab === 'sanitizer' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400 text-xs">
                AUTOMATIC SECRET &amp; CREDENTIAL MASKING
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-miku-pink text-white">
                {sanitizedResult.redactedCount} SECRETS REDACTED
              </span>
            </div>

            {sanitizedResult.redactedItems.length > 0 ? (
              <div className="space-y-2">
                {sanitizedResult.redactedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-miku-pink">
                        {item.patternName} ({item.type})
                      </span>
                      <div className="font-mono text-slate-400">
                        Masked: <code className="text-emerald-400">{item.originalMatched}</code> → <code className="text-miku-cyan">{item.replacement}</code>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded bg-slate-900 font-mono text-[10px] text-teal-300">
                      SECURED
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-800/40 text-center text-slate-400 space-y-1">
                <p className="font-semibold text-teal-400">Zero sensitive secrets detected.</p>
                <p className="text-xs text-slate-500">
                  OpenAI keys, AWS credentials, JWTs, DB URLs, and private keys will automatically be masked if present.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'braille' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs text-slate-400">
              <span>32×32 UNICODE BRAILLE MICRO-MATRIX (\u2800 - \u28FF)</span>
              <span>Density: {brailleResult ? `${Math.round(brailleResult.density * 100)}%` : '0%'}</span>
            </div>

            {brailleResult ? (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-center">
                <pre className="font-mono text-base leading-tight tracking-wider text-miku-cyan select-all">
                  {brailleResult.brailleString}
                </pre>
              </div>
            ) : (
              <p className="text-slate-500 italic">No image loaded to compute Braille topology.</p>
            )}

            <p className="text-[11px] text-slate-400 leading-normal">
              DevLens downscales 2D wireframe layouts into standard 2×4 dot Braille cells. 
              This enables text-only LLMs to parse spatial layout structure with zero vision API cost!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
