import React, { useState } from 'react';
import { BoundingBox, DefectCategory, SeverityLevel } from '../utils/severity';
import { PriorityResult } from '../utils/priority';
import { Cpu, Zap, Activity, Eye, Sliders, CheckCircle2, ShieldAlert } from 'lucide-react';

interface AIDetectionVisualizerProps {
  originalImageUrl: string;
  annotatedImageUrl?: string;
  boxes: BoundingBox[];
  dominantCategory: DefectCategory;
  confidence: number;
  processingTimeMs: number;
  inferenceMode: 'REAL_AI' | 'DEMO_BENCHMARK';
  severityLevel: SeverityLevel;
  severityScore: number;
  priority: PriorityResult;
  trafficExposure: number;
  safetyRisk: number;
  onTrafficChange?: (val: number) => void;
  onSafetyChange?: (val: number) => void;
}

export const AIDetectionVisualizer: React.FC<AIDetectionVisualizerProps> = ({
  originalImageUrl,
  annotatedImageUrl,
  boxes,
  dominantCategory,
  confidence,
  processingTimeMs,
  inferenceMode,
  severityLevel,
  severityScore,
  priority,
  trafficExposure,
  safetyRisk,
  onTrafficChange,
  onSafetyChange,
}) => {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'annotated' | 'original'>('side-by-side');
  const [activeBoxIndex, setActiveBoxIndex] = useState<number | null>(null);

  const displayImage = annotatedImageUrl || originalImageUrl;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl text-slate-100 space-y-5">
      {/* Engine Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white tracking-wide">
                Computer Vision Defect Engine
              </h3>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border ${
                  inferenceMode === 'REAL_AI'
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                }`}
              >
                {inferenceMode === 'REAL_AI' ? '● REAL AI INFERENCE' : '○ BENCHMARK MODE'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              RDD2022 Road Defect Weights • {processingTimeMs}ms forward pass
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`px-3 py-1 rounded-lg transition ${
              viewMode === 'side-by-side'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Side-by-Side
          </button>
          <button
            onClick={() => setViewMode('annotated')}
            className={`px-3 py-1 rounded-lg transition ${
              viewMode === 'annotated'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            AI Annotated
          </button>
          <button
            onClick={() => setViewMode('original')}
            className={`px-3 py-1 rounded-lg transition ${
              viewMode === 'original'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Original
          </button>
        </div>
      </div>

      {/* Image Preview Canvas Area */}
      <div className="relative">
        {viewMode === 'side-by-side' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original Preview */}
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-[4/3] flex items-center justify-center group">
              <img
                src={originalImageUrl}
                alt="Original road input"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[11px] font-mono text-slate-300 border border-white/10">
                Original Input Image
              </div>
            </div>

            {/* AI Annotated Preview */}
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-[4/3] flex items-center justify-center">
              <img
                src={displayImage}
                alt="AI Annotated Defect"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-blue-950/80 backdrop-blur-md text-[11px] font-mono text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-blue-400" />
                <span>AI Annotated Bounding Boxes ({boxes.length})</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 max-h-[460px] flex items-center justify-center">
            <img
              src={viewMode === 'original' ? originalImageUrl : displayImage}
              alt="Road Inspection"
              className="w-full h-auto max-h-[460px] object-contain"
            />
          </div>
        )}
      </div>

      {/* Detection Cards & Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Dominant Defect */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
          <span className="text-[11px] font-medium text-slate-400">Classified Defect</span>
          <div className="text-sm font-bold text-white mt-1 flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                dominantCategory === 'Pothole'
                  ? 'bg-rose-500'
                  : dominantCategory === 'Alligator Crack'
                  ? 'bg-amber-500'
                  : 'bg-yellow-400'
              }`}
            />
            {dominantCategory}
          </div>
        </div>

        {/* Model Confidence */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
          <span className="text-[11px] font-medium text-slate-400">AI Confidence</span>
          <div className="text-sm font-bold text-emerald-400 mt-1 font-mono">
            {(confidence * 100).toFixed(1)}%
          </div>
        </div>

        {/* Severity Score */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
          <span className="text-[11px] font-medium text-slate-400">Severity Index</span>
          <div className="text-sm font-bold text-amber-400 mt-1">
            {severityScore}/100 <span className="text-xs font-normal text-slate-400">({severityLevel})</span>
          </div>
        </div>

        {/* Maintenance Priority */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
          <span className="text-[11px] font-medium text-slate-400">Priority Score</span>
          <div className="text-sm font-bold mt-1 font-mono flex items-center gap-1.5" style={{ color: priority.color }}>
            {priority.score}/100
            <span className="text-[10px] px-1.5 py-0.2 rounded font-sans uppercase font-bold" style={{ backgroundColor: `${priority.color}20` }}>
              {priority.tier}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Priority Formula Slider Controls (if callbacks provided) */}
      {(onTrafficChange || onSafetyChange) && (
        <div className="bg-slate-950/90 rounded-xl p-4 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span>Intelligent Priority Coefficients (Configurable Formula)</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Score = (0.50×{severityScore}) + (0.30×{trafficExposure}) + (0.20×{safetyRisk}) = <strong className="text-white">{priority.score}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {onTrafficChange && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Traffic Exposure Index</span>
                  <span className="font-mono text-blue-400 font-bold">{trafficExposure}/100</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={trafficExposure}
                  onChange={(e) => onTrafficChange(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>
            )}

            {onSafetyChange && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Public Safety Risk Index</span>
                  <span className="font-mono text-rose-400 font-bold">{safetyRisk}/100</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={safetyRisk}
                  onChange={(e) => onSafetyChange(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* List of Detected Bounding Boxes */}
      {boxes.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Detected Defect Envelopes ({boxes.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {boxes.map((box, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setActiveBoxIndex(idx)}
                onMouseLeave={() => setActiveBoxIndex(null)}
                className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition ${
                  activeBoxIndex === idx
                    ? 'border-blue-500/80 bg-blue-500/10'
                    : 'border-slate-800 bg-slate-950/40 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-mono text-[10px] text-slate-400">
                    #{idx + 1}
                  </span>
                  <div>
                    <span className="font-semibold text-white">{box.label}</span>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Area: {((box.width * box.height) * 100).toFixed(1)}% of frame
                    </p>
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-400">
                  {(box.confidence * 100).toFixed(0)}% conf
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
