/**
 * Smart Maintenance Recommendations Engine
 * Computes actionable engineering guidance based on damage category, severity,
 * priority, traffic exposure, safety risk, complaint count, and unresolved age.
 */

export interface RecommendationInput {
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  priorityScore: number;
  trafficExposure: number;
  safetyRisk: number;
  complaintCount?: number;
  ageDays?: number;
  status: string;
}

export interface RecommendationResult {
  action: string;
  technique: string;
  equipment: string[];
  urgency: 'IMMEDIATE_24H' | 'EXPEDITED_72H' | 'SCHEDULED_14D' | 'ROUTINE_CYCLE';
  estimatedCostUsd: number;
  engineeringNote: string;
}

export function generateMaintenanceRecommendation(
  input: RecommendationInput
): RecommendationResult {
  const { category, severity, priorityScore, trafficExposure, safetyRisk, ageDays = 1 } = input;

  if (priorityScore >= 80 || (category === 'Pothole' && severity === 'HIGH')) {
    return {
      action: 'Emergency Cold/Hot-Mix Patching & Temporary Warning Bollards',
      technique: 'Milling edges square, tack coat application, HMA asphalt compaction to 95%',
      equipment: ['Plate compactor', 'Infrared asphalt heater', 'Asphalt hot-box trailer', 'Traffic signage'],
      urgency: 'IMMEDIATE_24H',
      estimatedCostUsd: 450 + Math.round(trafficExposure * 3),
      engineeringNote: `Critical pothole in ${
        trafficExposure > 60 ? 'high-volume arterial transit lane' : 'collector road'
      }. Immediate rim damage and cyclist hazard. Dispatch Rapid Response Unit within 24 hours.`,
    };
  }

  if (category === 'Alligator Crack') {
    return {
      action: 'Sub-Base Structural Stabilization & Full-Depth Asphalt Mill & Inlay',
      technique: '2-inch cold milling, geotextile membrane placement, hot-mix binder & wearing course',
      equipment: ['Asphalt cold planer', 'Tandem vibratory roller', 'Paving machine', 'Dump trucks'],
      urgency: priorityScore >= 60 ? 'EXPEDITED_72H' : 'SCHEDULED_14D',
      estimatedCostUsd: 1200 + Math.round(priorityScore * 8),
      engineeringNote: 'Alligator cracking indicates fatigue failure in underlying pavement layers. Seal coats will fail; structural milling and inlay required.',
    };
  }

  if (category.includes('Crack') && severity === 'MEDIUM') {
    return {
      action: 'High-Performance Polymer-Modified Crack Routing & Hot-Pour Rubberized Sealant',
      technique: 'Hot compressed-air lance cleaning, crack reservoir routing (1/2"x1/2"), sealant injection at 380°F',
      equipment: ['Hot-air lance', 'Crack router', 'Rubberized melter applicator'],
      urgency: ageDays > 14 ? 'EXPEDITED_72H' : 'SCHEDULED_14D',
      estimatedCostUsd: 280,
      engineeringNote: 'Prevent moisture intrusion into base subgrade before freeze-thaw cycles worsen crack propagation.',
    };
  }

  if (priorityScore >= 60) {
    return {
      action: 'Excavation & High-Strength Asphalt Patch',
      technique: 'Square edge saw-cutting, subgrade compaction, 3-inch hot mix layer with vibrating tamper',
      equipment: ['Pavement saw', 'Vibratory tamper', 'Tack spray rig'],
      urgency: 'EXPEDITED_72H',
      estimatedCostUsd: 550,
      engineeringNote: `High-priority road defect with safety risk score of ${safetyRisk}/100. Expedited maintenance prevents cascading surface decay.`,
    };
  }

  return {
    action: 'Routine Seal Coating & Slurry Surface Treatment',
    technique: 'Emulsified asphalt slurry seal with fine aggregate aggregate matrix',
    equipment: ['Slurry truck', 'Rubber squeegee applicators'],
    urgency: 'ROUTINE_CYCLE',
    estimatedCostUsd: 150,
    engineeringNote: 'Surface damage poses low immediate hazard. Batch with standard municipal zone maintenance.',
  };
}
