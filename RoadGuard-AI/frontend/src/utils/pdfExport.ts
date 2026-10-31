import { jsPDF } from 'jspdf';
import { RoadReport, DashboardSummary } from '../types';
import { generateMaintenanceRecommendation } from './recommendations';

/**
 * Generates an official Road Damage Inspection & Maintenance PDF Report.
 */
export function exportSingleReportPDF(report: RoadReport): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const rec = generateMaintenanceRecommendation({
    category: report.category,
    severity: report.severity,
    priorityScore: report.priorityScore,
    trafficExposure: report.trafficExposureScore,
    safetyRisk: report.safetyRiskScore,
    status: report.status,
  });

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 32, 'F');

  // Accent Line
  doc.setFillColor(59, 130, 246); // blue-500
  doc.rect(0, 32, pageWidth, 2, 'F');

  // Header Titles
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('ROADGUARD AI', 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('MUNICIPAL INFRASTRUCTURE & SURFACE DEFECT ASSESSMENT REPORT', 14, 22);
  doc.text(`GENERATED: ${new Date().toUTCString()}`, 14, 27);

  // Status Badge on Right
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`ID: ${report.id}`, pageWidth - 55, 15);
  doc.setFontSize(9);
  doc.setTextColor(59, 130, 246);
  doc.text(`STATUS: ${report.status.toUpperCase()}`, pageWidth - 55, 22);

  // Body content
  let y = 44;

  // Section 1: Executive Summary Card
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(14, y, pageWidth - 28, 42, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 42, 2, 2, 'S');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(report.title, 18, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Location: ${report.address}`, 18, y + 16);
  doc.text(`GPS Coordinates: ${report.lat.toFixed(6)}, ${report.lng.toFixed(6)}`, 18, y + 22);
  doc.text(`Reported by: ${report.citizenName} | Date: ${new Date(report.createdAt).toLocaleDateString()}`, 18, y + 28);
  doc.text(`AI Inference Model: YOLOv8-RDD2022 | Defect Zones: ${report.detections?.length || 1}`, 18, y + 34);

  y += 50;

  // Section 2: AI Computer Vision & Maintenance Scoring Metrics (3 Column Grid)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('AI DEFECT ASSESSMENT & INTELLIGENT SCORING', 14, y);

  y += 5;
  const colW = (pageWidth - 28 - 8) / 3;

  // Card 1: Damage Severity
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, y, colW, 30, 1.5, 1.5, 'F');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('DEFECT CATEGORY & SEVERITY', 18, y + 6);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(
    report.severity === 'HIGH' ? 220 : report.severity === 'MEDIUM' ? 202 : 16,
    report.severity === 'HIGH' ? 38 : report.severity === 'MEDIUM' ? 138 : 185,
    38
  );
  doc.text(report.category, 18, y + 14);
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Severity Score: ${report.severityScore}/100 (${report.severity})`, 18, y + 22);

  // Card 2: Priority Score
  const c2X = 14 + colW + 4;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(c2X, y, colW, 30, 1.5, 1.5, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('INTELLIGENT PRIORITY INDEX', c2X + 4, y + 6);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(
    report.priorityTier === 'CRITICAL' ? 220 : 37,
    report.priorityTier === 'CRITICAL' ? 38 : 99,
    report.priorityTier === 'CRITICAL' ? 38 : 235
  );
  doc.text(`${report.priorityScore} / 100`, c2X + 4, y + 14);
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Tier: ${report.priorityTier}`, c2X + 4, y + 22);

  // Card 3: Exposure & Risk
  const c3X = c2X + colW + 4;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(c3X, y, colW, 30, 1.5, 1.5, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('RISK & TRAFFIC COEFFICIENTS', c3X + 4, y + 6);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Traffic Exposure: ${report.trafficExposureScore}/100`, c3X + 4, y + 13);
  doc.text(`Safety Hazard: ${report.safetyRiskScore}/100`, c3X + 4, y + 19);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Duplicate Reports: ${report.duplicateCount || 0}`, c3X + 4, y + 25);

  y += 38;

  // Section 3: Recommended Action Plan
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('SMART MAINTENANCE RECOMMENDATION & ENGINEERING PLAN', 14, y);

  y += 5;
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(14, y, pageWidth - 28, 38, 2, 2, 'F');
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(14, y, pageWidth - 28, 38, 2, 2, 'S');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(153, 27, 27);
  doc.text(`Action: ${rec.action}`, 18, y + 7);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Repair Technique: ${rec.technique}`, 18, y + 14);
  doc.text(`Required Equipment: ${rec.equipment.join(', ')}`, 18, y + 20);
  doc.text(`Dispatch Urgency: ${rec.urgency.replace('_', ' ')} | Est. Repair Cost: $${rec.estimatedCostUsd} USD`, 18, y + 26);
  doc.text(`Engineering Analysis: ${rec.engineeringNote}`, 18, y + 32, { maxWidth: pageWidth - 36 });

  y += 46;

  // Section 4: Workflow Audit Trail
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('MAINTENANCE WORKFLOW AUDIT TRAIL', 14, y);

  y += 5;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, pageWidth - 28, 40, 1.5, 1.5, 'F');

  let auditY = y + 7;
  report.statusHistory.forEach((sh, i) => {
    if (i < 4) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(`• [${sh.status.toUpperCase()}]`, 18, auditY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(
        `${new Date(sh.timestamp).toLocaleDateString()} by ${sh.updatedBy} (${sh.role}) - ${sh.notes || 'Status confirmed'}`,
        48,
        auditY,
        { maxWidth: pageWidth - 70 }
      );
      auditY += 7;
    }
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('RoadGuard AI - Confidential Municipal Transportation Engineering Report. Generated automatically.', 14, 285);
  doc.text('Page 1 of 1', pageWidth - 28, 285);

  doc.save(`${report.id}_RoadGuard_Assessment.pdf`);
}

/**
 * Generates an Executive Municipal Maintenance Summary PDF.
 */
export function exportExecutiveSummaryPDF(
  reports: RoadReport[],
  summary: DashboardSummary
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 32, 'F');
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 32, pageWidth, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('ROADGUARD AI - MUNICIPAL AUDIT', 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('EXECUTIVE ROAD SURFACE DEFECT & MAINTENANCE OPERATIONS REPORT', 14, 22);
  doc.text(`PERIOD: OCTOBER 2026 | AS OF: ${new Date().toLocaleDateString()}`, 14, 27);

  let y = 44;

  // KPI Grid (4 Cards)
  const cardW = (pageWidth - 28 - 9) / 4;
  const kpis = [
    { title: 'Total Reports', val: `${summary.totalReports}`, color: [59, 130, 246] },
    { title: 'Critical Defects', val: `${summary.criticalDamageReports}`, color: [239, 68, 68] },
    { title: 'In-Repair / Done', val: `${summary.completedRepairs}`, color: [16, 185, 129] },
    { title: 'Avg Priority Index', val: `${summary.averagePriorityScore}/100`, color: [245, 158, 11] },
  ];

  kpis.forEach((kpi, idx) => {
    const kpiX = 14 + idx * (cardW + 3);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(kpiX, y, cardW, 24, 1.5, 1.5, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.title, kpiX + 3, y + 6);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.val, kpiX + 3, y + 16);
  });

  y += 34;

  // Top Priority Reports Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('HIGHEST PRIORITY DEFECTS REQUIRING DISPATCH', 14, y);

  y += 6;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 8, 'F');

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('REPORT ID', 16, y + 5.5);
  doc.text('CATEGORY', 44, y + 5.5);
  doc.text('LOCATION', 80, y + 5.5);
  doc.text('PRIORITY', 135, y + 5.5);
  doc.text('STATUS', 165, y + 5.5);

  y += 8;

  const sortedReports = [...reports].sort((a, b) => b.priorityScore - a.priorityScore);

  sortedReports.slice(0, 10).forEach((r) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);

    doc.text(r.id, 16, y + 5);
    doc.text(r.category, 44, y + 5);
    doc.text(r.address.length > 28 ? r.address.substring(0, 26) + '...' : r.address, 80, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(r.priorityScore >= 80 ? 220 : 30, 41, 59);
    doc.text(`${r.priorityScore} (${r.priorityTier})`, 135, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(59, 130, 246);
    doc.text(r.status, 165, y + 5);

    y += 7.5;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('RoadGuard AI - Smart City Infrastructure Maintenance Intelligence Report.', 14, 285);
  doc.text('Page 1 of 1', pageWidth - 28, 285);

  doc.save(`RoadGuard_Executive_Summary_${new Date().toISOString().split('T')[0]}.pdf`);
}
