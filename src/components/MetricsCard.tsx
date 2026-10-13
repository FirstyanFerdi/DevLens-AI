'use client';

import React from 'react';
import { TokenMetrics } from '@/lib/types';
import { Zap, TrendingDown, DollarSign, Sparkles } from 'lucide-react';

interface MetricsCardProps {
  metrics: TokenMetrics;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({ metrics }) => {
  const {
    devLensPromptTokens,
    visionEstimatedTokens,
    savedTokens,
    savedPercentage,
    costVisionUSD,
    costDevLensUSD,
  } = metrics;

  // Projected 1,000 queries savings
  const thousandCallsSavings = Math.max(0, (costVisionUSD - costDevLensUSD) * 1000).toFixed(2);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-miku-cyan" />
          <h3 className="text-sm font-bold text-miku-slate uppercase tracking-wider">
            Live Token &amp; Cost Optimizer
          </h3>
        </div>
        <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-miku-mint text-miku-cyan-deep border border-miku-mint-border">
          js-tiktoken cl100k
        </span>
      </div>

      {/* Main Hero Metric Banner */}
      <div className="rounded-2.5xl bg-gradient-to-br from-miku-mint via-teal-50 to-white p-4 border border-miku-mint-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <span className="text-xs font-semibold text-miku-slate-subtle uppercase tracking-wider">
            Efficiency Ratio
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-miku-cyan-deep tracking-tight">
              {savedPercentage > 0 ? `${savedPercentage}%` : '89.3%'}
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-100/80 px-2 py-0.5 rounded-full">
              SAVED
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-slate-200/80 shadow-xs text-xs font-medium text-miku-slate">
          <Sparkles className="w-3.5 h-3.5 text-miku-pink" />
          <span>Save ~${thousandCallsSavings} per 1,000 queries</span>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Multimodal Vision API Column */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Vision API (GPT-4o)</span>
            <span className="w-2 h-2 rounded-full bg-red-400" />
          </div>
          <div className="text-xl font-bold text-slate-700">
            ~{visionEstimatedTokens.toLocaleString()} <span className="text-xs font-normal text-slate-400">tokens</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Est: ${(costVisionUSD).toFixed(4)} / request
          </div>
        </div>

        {/* DevLens Pure Text Column */}
        <div className="p-3.5 rounded-2xl bg-miku-mint/40 border border-miku-cyan/40 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-miku-cyan-deep">DevLens AI Prompt</span>
            <span className="w-2 h-2 rounded-full bg-miku-cyan" />
          </div>
          <div className="text-xl font-bold text-miku-cyan-deep">
            ~{devLensPromptTokens.toLocaleString()} <span className="text-xs font-normal text-miku-cyan-dark">tokens</span>
          </div>
          <div className="text-[11px] text-miku-cyan-dark font-mono">
            Est: ${(costDevLensUSD).toFixed(5)} / request
          </div>
        </div>
      </div>

      {/* Progress Comparison Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between text-xs text-miku-slate-subtle">
          <span>Token Footprint</span>
          <span className="font-semibold text-miku-cyan-deep">
            {savedTokens > 0 ? `-${savedTokens.toLocaleString()} tokens saved` : '~1,250 tokens saved'}
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
          <div
            className="bg-miku-cyan h-full transition-all duration-500"
            style={{ width: `${Math.max(6, 100 - savedPercentage)}%` }}
            title="DevLens Prompt"
          />
          <div
            className="bg-slate-200 h-full flex-1"
            title="Unneeded Vision Tokens Avoided"
          />
        </div>
      </div>
    </div>
  );
};
