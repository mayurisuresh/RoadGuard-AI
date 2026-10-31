/**
 * Damage Severity Analysis Module
 * Categories: Pothole, Longitudinal Crack, Transverse Crack, Alligator Crack
 * Analyzes relative bounding box area, detection count, and defect type.
 */

export type DefectCategory =
  | 'Pothole'
  | 'Longitudinal Crack'
  | 'Transverse Crack'
  | 'Alligator Crack';

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface BoundingBox {
  x: number; // 0..1 (fraction of image width)
  y: number; // 0..1 (fraction of image height)
  width: number; // 0..1
  height: number; // 0..1
  label: DefectCategory;
  confidence: number; // 0..1
}

export interface SeverityAnalysisResult {
  level: SeverityLevel;
  severityScore: number; // 0..100
  totalAreaFraction: number; // relative area
  defectCount: number;
  dominantCategory: DefectCategory;
  explanation: string;
}

export function analyzeDamageSeverity(
  detections: BoundingBox[]
): SeverityAnalysisResult {
  if (!detections || detections.length === 0) {
    return {
      level: 'LOW',
      severityScore: 10,
      totalAreaFraction: 0,
      defectCount: 0,
      dominantCategory: 'Longitudinal Crack',
      explanation: 'No significant surface defects detected. Regular periodic inspection.',
    };
  }

  // Calculate total bounding box area fraction
  const totalAreaFraction = detections.reduce(
    (acc, d) => acc + d.width * d.height,
    0
  );

  // Determine category weights
  const categoryBaseWeights: Record<DefectCategory, number> = {
    Pothole: 55,
    'Alligator Crack': 45,
    'Transverse Crack': 30,
    'Longitudinal Crack': 25,
  };

  // Find dominant category based on highest confidence and highest impact
  const dominant = detections.reduce((prev, curr) =>
    (categoryBaseWeights[curr.label] || 20) * curr.confidence >
    (categoryBaseWeights[prev.label] || 20) * prev.confidence
      ? curr
      : prev
  );

  // Compute raw score based on base category, area, and count
  const baseScore = categoryBaseWeights[dominant.label] || 30;
  const areaMultiplier = Math.min(35, totalAreaFraction * 120);
  const countMultiplier = Math.min(20, (detections.length - 1) * 6);

  const rawScore = baseScore + areaMultiplier + countMultiplier;
  const severityScore = Math.round(Math.min(100, Math.max(10, rawScore)));

  let level: SeverityLevel = 'LOW';
  let explanation = '';

  if (severityScore >= 70) {
    level = 'HIGH';
    explanation = `High severity: Large ${dominant.label.toLowerCase()} covering ${(
      totalAreaFraction * 100
    ).toFixed(1)}% of frame with ${
      detections.length
    } defect cluster(s). Sub-base breakdown likely without rapid intervention.`;
  } else if (severityScore >= 40) {
    level = 'MEDIUM';
    explanation = `Medium severity: Moderate ${dominant.label.toLowerCase()} detected (${detections.length} defect zones). Requires sealing/patching to prevent water ingress.`;
  } else {
    level = 'LOW';
    explanation = `Low severity: Minor superficial ${dominant.label.toLowerCase()} detected. Surface condition stable; schedule for routine preventative seal.`;
  }

  return {
    level,
    severityScore,
    totalAreaFraction: parseFloat(totalAreaFraction.toFixed(4)),
    defectCount: detections.length,
    dominantCategory: dominant.label,
    explanation,
  };
}
