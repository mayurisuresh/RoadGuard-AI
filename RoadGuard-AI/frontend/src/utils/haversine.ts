/**
 * Haversine Distance & Geospatial Clustering Utility
 * For duplicate detection and hotspot cluster analysis.
 */

export interface GeoLocation {
  lat: number;
  lng: number;
}

/**
 * Calculates great-circle distance between two GPS coordinates in meters.
 */
export function calculateHaversineDistance(
  coord1: GeoLocation,
  coord2: GeoLocation
): number {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const lat1 = toRad(coord1.lat);
  const lat2 = toRad(coord2.lat);
  const deltaLat = toRad(coord2.lat - coord1.lat);
  const deltaLng = toRad(coord2.lng - coord1.lng);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c * 10) / 10; // meters rounded to 1 decimal
}

/**
 * Checks whether a candidate report is a potential duplicate of an existing report.
 * Default radius is 40 meters.
 */
export interface DuplicateMatch {
  isDuplicate: boolean;
  distanceMeters: number;
  matchedReportId?: string;
  reason: string;
}

export function detectDuplicateReport(
  candidate: { lat: number; lng: number; category: string },
  existingReports: Array<{ id: string; lat: number; lng: number; category: string }>,
  maxRadiusMeters: number = 40
): DuplicateMatch {
  for (const report of existingReports) {
    const dist = calculateHaversineDistance(
      { lat: candidate.lat, lng: candidate.lng },
      { lat: report.lat, lng: report.lng }
    );

    if (dist <= maxRadiusMeters) {
      const sameCategory =
        candidate.category.toLowerCase() === report.category.toLowerCase();

      return {
        isDuplicate: true,
        distanceMeters: dist,
        matchedReportId: report.id,
        reason: sameCategory
          ? `Exact category match '${candidate.category}' within ${dist.toFixed(0)}m of report ${report.id}.`
          : `Spatial proximity within ${dist.toFixed(0)}m of report ${report.id} (Category: ${report.category}). Admin review recommended before merging.`,
      };
    }
  }

  return {
    isDuplicate: false,
    distanceMeters: -1,
    reason: 'Unique geographic location and defect fingerprint.',
  };
}

/**
 * Hotspot cluster computation for map display
 */
export interface HotspotCluster {
  id: string;
  lat: number;
  lng: number;
  reportCount: number;
  avgPriority: number;
  criticalCount: number;
  radiusMeters: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  reportIds: string[];
}

export function clusterHotspots(
  reports: Array<{ id: string; lat: number; lng: number; priorityScore: number; severity: string }>,
  clusterRadiusMeters: number = 150
): HotspotCluster[] {
  const visited = new Set<string>();
  const clusters: HotspotCluster[] = [];

  for (let i = 0; i < reports.length; i++) {
    const r1 = reports[i];
    if (visited.has(r1.id)) continue;

    const currentClusterReports = [r1];
    visited.add(r1.id);

    for (let j = i + 1; j < reports.length; j++) {
      const r2 = reports[j];
      if (visited.has(r2.id)) continue;

      const dist = calculateHaversineDistance(
        { lat: r1.lat, lng: r1.lng },
        { lat: r2.lat, lng: r2.lng }
      );

      if (dist <= clusterRadiusMeters) {
        currentClusterReports.push(r2);
        visited.add(r2.id);
      }
    }

    if (currentClusterReports.length >= 1) {
      const avgLat =
        currentClusterReports.reduce((sum, r) => sum + r.lat, 0) /
        currentClusterReports.length;
      const avgLng =
        currentClusterReports.reduce((sum, r) => sum + r.lng, 0) /
        currentClusterReports.length;
      const avgPriority = Math.round(
        currentClusterReports.reduce((sum, r) => sum + r.priorityScore, 0) /
          currentClusterReports.length
      );
      const criticalCount = currentClusterReports.filter(
        (r) => r.severity === 'HIGH' || r.priorityScore >= 80
      ).length;

      const severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' =
        criticalCount > 0 || avgPriority >= 75
          ? 'CRITICAL'
          : avgPriority >= 50
          ? 'HIGH'
          : 'MEDIUM';

      clusters.push({
        id: `cluster-${clusters.length + 1}`,
        lat: parseFloat(avgLat.toFixed(6)),
        lng: parseFloat(avgLng.toFixed(6)),
        reportCount: currentClusterReports.length,
        avgPriority,
        criticalCount,
        radiusMeters: Math.max(50, currentClusterReports.length * 35),
        severity,
        reportIds: currentClusterReports.map((r) => r.id),
      });
    }
  }

  return clusters;
}
