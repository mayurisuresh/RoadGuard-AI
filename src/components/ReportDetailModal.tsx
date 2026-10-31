import React, { useState } from 'react';
import { RoadReport, User, ReportStatus } from '../types';
import { exportSingleReportPDF } from '../utils/pdfExport';
import { generateMaintenanceRecommendation } from '../utils/recommendations';
import {
  X,
  FileDown,
  ShieldCheck,
  Wrench,
  AlertTriangle,
  MapPin,
  Clock,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  Copy,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface ReportDetailModalProps {
  report: RoadReport;
  currentUser: User;
  onClose: () => void;
  onUpdateStatus: (reportId: string, newStatus: ReportStatus, notes: string) => void;
  onAssignTask?: (reportId: string, workerId: string, instructions: string, dueDate: string) => void;
  onOpenBeforeAfter?: (report: RoadReport) => void;
  allReports: RoadReport[];
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  currentUser,
  onClose,
  onUpdateStatus,
  onAssignTask,
  onOpenBeforeAfter,
  allReports,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const isMaintenance = currentUser.role === 'maintenance';
  const isCitizen = currentUser.role === 'citizen';

  const [assignee, setAssignee] = useState<string>('usr-maint-1');
  const [instructions, setInstructions] = useState<string>(
    'Square cut edges, clean cavity with compressed air lance, apply RS-1 emulsion tack coat, fill with hot-mix asphalt and compact to 95%.'
  );
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
  );
  const [statusNote, setStatusNote] = useState<string>('');

  const recommendation = generateMaintenanceRecommendation({
    category: report.category,
    severity: report.severity,
    priorityScore: report.priorityScore,
    trafficExposure: report.trafficExposureScore,
    safetyRisk: report.safetyRiskScore,
    status: report.status,
  });

  const handleExportPDF = () => {
    exportSingleReportPDF(report);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <span
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase"
              style={{
                backgroundColor: `${report.priorityTier === 'CRITICAL' ? '#ef4444' : '#3b82f6'}20`,
                color: report.priorityTier === 'CRITICAL' ? '#f87171' : '#60a5fa',
                border: `1px solid ${report.priorityTier === 'CRITICAL' ? '#ef4444' : '#3b82f6'}40`,
              }}
            >
              {report.priorityTier} ({report.priorityScore}/100)
            </span>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{report.id}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-200">{report.title}</span>
              </h2>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>{report.address}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPDF}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
              title="Download Official PDF Report"
            >
              <FileDown className="w-3.5 h-3.5 text-blue-400" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Main Visual & Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Image Preview with Annotated Overlays */}
            <div className="space-y-2">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                <img
                  src={report.annotatedImageUrl || report.imageUrl}
                  alt={report.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2.5 py-1 rounded bg-black/75 backdrop-blur-md text-[11px] font-mono text-emerald-400 border border-emerald-500/30">
                  AI Conf: {report.detections?.[0]?.confidence ? `${(report.detections[0].confidence * 100).toFixed(0)}%` : '96%'}
                </div>
                <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded bg-black/75 backdrop-blur-md text-[11px] font-mono text-slate-300">
                  {report.category}
                </div>
              </div>
              <p className="text-xs text-slate-400 italic">
                "{report.description}"
              </p>
            </div>

            {/* Metrics & Scoring Breakdown */}
            <div className="space-y-4">
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300">Intelligent Priority Formula</span>
                  <span className="font-mono text-blue-400 font-bold">Index: {report.priorityScore}/100</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Severity Weight (50%):</span>
                    <strong className="text-white">{report.severityScore}/100 ({report.severity})</strong>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: `${report.severityScore}%` }} />
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Traffic Exposure (30%):</span>
                    <strong className="text-white">{report.trafficExposureScore}/100</strong>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-400 h-full rounded-full" style={{ width: `${report.trafficExposureScore}%` }} />
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Public Safety Risk (20%):</span>
                    <strong className="text-white">{report.safetyRiskScore}/100</strong>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-400 h-full rounded-full" style={{ width: `${report.safetyRiskScore}%` }} />
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                  <strong>Priority Rationale:</strong> {report.priorityReason}
                </div>
              </div>

              {/* Status and Assignment Info */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Current Status:</span>
                  <span className="font-bold text-white px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700">
                    {report.status}
                  </span>
                </div>
                {report.assignedTo && (
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Assigned Crew:</span>
                    <span className="text-slate-200 font-semibold">{report.assignedTo.name} ({report.assignedTo.team})</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-slate-400">
                  <span>GPS Coordinates:</span>
                  <span className="font-mono text-slate-300">{report.lat.toFixed(5)}, {report.lng.toFixed(5)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Reported By:</span>
                  <span className="text-slate-300">{report.citizenName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Smart Maintenance Recommendation Card */}
          <div className="bg-gradient-to-r from-blue-950/30 to-slate-900 border border-blue-500/20 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Smart Maintenance Recommendation (Automated Engineering Guidance)</span>
            </div>
            <h4 className="text-sm font-bold text-white">{recommendation.action}</h4>
            <p className="text-xs text-slate-300">{recommendation.engineeringNote}</p>
            <div className="pt-2 flex flex-wrap gap-4 text-[11px] text-slate-400 border-t border-slate-800/80">
              <span><strong>Technique:</strong> {recommendation.technique}</span>
              <span><strong>Urgency:</strong> {recommendation.urgency.replace('_', ' ')}</span>
              <span><strong>Estimated Cost:</strong> ${recommendation.estimatedCostUsd} USD</span>
            </div>
          </div>

          {/* Before & After Action Bar if task has verification */}
          {(report.repairVerification || isMaintenance || isAdmin) && onOpenBeforeAfter && (
            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Before & After Repair Quality Assurance</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {report.repairVerification
                    ? `Verification uploaded (${report.repairVerification.adminApprovalStatus})`
                    : 'Submit field repair photo proof and materials log.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenBeforeAfter(report)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                {report.repairVerification ? 'View / QA Repair Proof' : 'Upload Repair Proof'}
              </button>
            </div>
          )}

          {/* Admin Workflow Action Panel */}
          {isAdmin && report.status !== 'Repaired' && (
            <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Admin Maintenance Dispatch Actions
              </h4>

              {/* Status Change Buttons */}
              <div className="flex flex-wrap gap-2">
                {report.status === 'Pending Verification' && (
                  <>
                    <button
                      onClick={() => onUpdateStatus(report.id, 'Verified', 'Report verified by Chief Municipal Engineer.')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verify Defect
                    </button>
                    <button
                      onClick={() => onUpdateStatus(report.id, 'Rejected', 'Surface anomaly does not meet repair threshold.')}
                      className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject Report
                    </button>
                  </>
                )}
              </div>

              {/* Assign Repair Task Form */}
              {onAssignTask && (report.status === 'Verified' || report.status === 'Assigned' || report.status === 'Pending Verification') && (
                <div className="pt-3 border-t border-slate-800/80 space-y-3">
                  <div className="text-xs font-semibold text-slate-300">
                    Dispatch Maintenance Crew
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Assigned Personnel</label>
                      <select
                        value={assignee}
                        onChange={(e) => setAssignee(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                      >
                        <option value="usr-maint-1">Alex Rivera (District 3 Lead)</option>
                        <option value="usr-maint-2">Carlos Mendoza (Asphalt Crew 2)</option>
                        <option value="usr-maint-3">Sarah Jenkins (Emergency Response)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Target Completion Date</label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Repair Instructions</label>
                    <textarea
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <button
                    onClick={() => onAssignTask(report.id, assignee, instructions, dueDate)}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-600/20"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    Assign & Issue Work Order
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Workflow Status Timeline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Complaint Status & History Timeline
            </h4>
            <div className="relative pl-6 space-y-4 border-l-2 border-slate-800">
              {report.statusHistory.map((sh, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-blue-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{sh.status}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(sh.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Updated by <strong className="text-slate-300">{sh.updatedBy}</strong> ({sh.role})
                    {sh.notes ? ` — "${sh.notes}"` : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
