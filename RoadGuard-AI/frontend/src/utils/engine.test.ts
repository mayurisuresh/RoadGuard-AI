import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculatePriorityScore,
  DEFAULT_WEIGHTS,
} from './priority';
import {
  analyzeDamageSeverity,
  BoundingBox,
} from './severity';
import {
  calculateHaversineDistance,
  detectDuplicateReport,
  clusterHotspots,
} from './haversine';
import { generateMaintenanceRecommendation } from './recommendations';

test('calculatePriorityScore: matches 0.5*severity + 0.3*traffic + 0.2*safety formula', () => {
  // Severity = 90, Traffic = 80, Safety = 95 => (90*0.5) + (80*0.3) + (95*0.2) = 45 + 24 + 19 = 88
  const res = calculatePriorityScore(90, 80, 95);
  assert.equal(res.score, 88);
  assert.equal(res.tier, 'CRITICAL');
});

test('calculatePriorityScore: handles bounds and tier classification', () => {
  const low = calculatePriorityScore(20, 20, 20);
  assert.equal(low.score, 20);
  assert.equal(low.tier, 'LOW');

  const medium = calculatePriorityScore(50, 40, 45);
  assert.equal(medium.score, 46);
  assert.equal(medium.tier, 'MEDIUM');

  const high = calculatePriorityScore(75, 60, 65);
  assert.equal(high.score, 69);
  assert.equal(high.tier, 'HIGH');
});

test('analyzeDamageSeverity: computes correct severity from bounding boxes', () => {
  const boxes: BoundingBox[] = [
    {
      x: 0.2,
      y: 0.3,
      width: 0.4,
      height: 0.3, // area = 0.12
      label: 'Pothole',
      confidence: 0.94,
    },
    {
      x: 0.6,
      y: 0.4,
      width: 0.2,
      height: 0.2, // area = 0.04
      label: 'Pothole',
      confidence: 0.88,
    },
  ];

  const analysis = analyzeDamageSeverity(boxes);
  assert.equal(analysis.dominantCategory, 'Pothole');
  assert.equal(analysis.defectCount, 2);
  assert.equal(analysis.level, 'HIGH');
  assert.ok(analysis.severityScore >= 70);
});

test('calculateHaversineDistance: accurately measures distance between GPS points', () => {
  // New York City Hall to Brooklyn Bridge anchor point (~1.1km)
  const p1 = { lat: 40.7128, lng: -74.0060 };
  const p2 = { lat: 40.7061, lng: -73.9969 };
  const dist = calculateHaversineDistance(p1, p2);
  // Expected distance roughly 1050m - 1200m
  assert.ok(dist > 1000 && dist < 1300, `Distance ${dist} should be around 1100m`);
});

test('detectDuplicateReport: flags reports within threshold radius', () => {
  const base = { lat: 40.7128, lng: -74.0060, category: 'Pothole' };
  // 15 meters away
  const nearby = [
    { id: 'RG-100', lat: 40.7129, lng: -74.0061, category: 'Pothole' },
  ];

  const match = detectDuplicateReport(base, nearby, 50);
  assert.equal(match.isDuplicate, true);
  assert.equal(match.matchedReportId, 'RG-100');

  // Far away
  const far = [
    { id: 'RG-200', lat: 40.7500, lng: -73.9800, category: 'Pothole' },
  ];
  const noMatch = detectDuplicateReport(base, far, 50);
  assert.equal(noMatch.isDuplicate, false);
});

test('clusterHotspots: groups nearby reports and identifies high priority zones', () => {
  const sampleReports = [
    { id: '1', lat: 40.7128, lng: -74.0060, priorityScore: 90, severity: 'HIGH' },
    { id: '2', lat: 40.7130, lng: -74.0062, priorityScore: 85, severity: 'HIGH' },
    { id: '3', lat: 40.7800, lng: -73.9500, priorityScore: 30, severity: 'LOW' },
  ];

  const clusters = clusterHotspots(sampleReports, 200);
  assert.ok(clusters.length >= 2);
  const firstCluster = clusters.find((c) => c.reportIds.includes('1'));
  assert.ok(firstCluster);
  assert.equal(firstCluster?.reportCount, 2);
  assert.equal(firstCluster?.severity, 'CRITICAL');
});

test('generateMaintenanceRecommendation: produces specific technical action plan', () => {
  const rec = generateMaintenanceRecommendation({
    category: 'Pothole',
    severity: 'HIGH',
    priorityScore: 85,
    trafficExposure: 75,
    safetyRisk: 90,
    status: 'Verified',
  });

  assert.equal(rec.urgency, 'IMMEDIATE_24H');
  assert.ok(rec.action.includes('Patching'));
  assert.ok(rec.equipment.length > 0);
  assert.ok(rec.estimatedCostUsd > 0);
});
