/**
 * Priority Scoring Engine
 * Formula: Priority = (0.50 * Severity) + (0.30 * Traffic) + (0.20 * Safety)
 * Normalized between 0 and 100
 */

export interface PriorityWeights {
  severity: number;
  traffic: number;
  safety: number;
}

export const DEFAULT_WEIGHTS: PriorityWeights = {
  severity: 0.50,
  traffic: 0.30,
  safety: 0.20,
};

export type PriorityTier = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface PriorityResult {
  score: number;
  tier: PriorityTier;
  color: string;
  badgeBg: string;
  badgeText: string;
  reason: string;
}

export function calculatePriorityScore(
  severityScore: number,
  trafficExposureScore: number,
  safetyRiskScore: number,
  weights: PriorityWeights = DEFAULT_WEIGHTS
): PriorityResult {
  const clampedSeverity = Math.max(0, Math.min(100, severityScore));
  const clampedTraffic = Math.max(0, Math.min(100, trafficExposureScore));
  const clampedSafety = Math.max(0, Math.min(100, safetyRiskScore));

  const rawScore =
    clampedSeverity * weights.severity +
    clampedTraffic * weights.traffic +
    clampedSafety * weights.safety;

  const score = Math.round(Math.max(0, Math.min(100, rawScore)));

  let tier: PriorityTier = 'LOW';
  let color = '#10b981'; // green
  let badgeBg = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
  let badgeText = 'text-emerald-400';
  let reason = 'Surface damage poses low immediate hazard. Routine cycle scheduling.';

  if (score >= 80) {
    tier = 'CRITICAL';
    color = '#ef4444'; // red
    badgeBg = 'bg-rose-500/15 border-rose-500/40 text-rose-400';
    badgeText = 'text-rose-400';
    reason = 'Immediate structural hazard in high-traffic corridor. Dispatch emergency patch team within 24h.';
  } else if (score >= 60) {
    tier = 'HIGH';
    color = '#f97316'; // orange
    badgeBg = 'bg-amber-500/15 border-amber-500/40 text-amber-400';
    badgeText = 'text-amber-400';
    reason = 'Substantial defect with elevated safety risk. Prioritize for repair within 48-72 hours.';
  } else if (score >= 35) {
    tier = 'MEDIUM';
    color = '#eab308'; // yellow
    badgeBg = 'bg-yellow-500/15 border-yellow-500/40 text-yellow-400';
    badgeText = 'text-yellow-400';
    reason = 'Noticeable surface degradation. Plan repairs in upcoming municipal maintenance batch.';
  }

  return {
    score,
    tier,
    color,
    badgeBg,
    badgeText,
    reason,
  };
}
