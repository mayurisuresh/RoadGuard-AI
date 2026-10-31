import React, { useState } from 'react';
import { RoadReport, User, ReportStatus, DefectCategory, SeverityLevel } from '../types';
import {
  Search,
  Filter,
  Eye,
  FileDown,
  Layers,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wrench,
  MapPin,
} from 'lucide-react';

interface ReportsTableProps {
  reports: RoadReport[];
  currentUser: User;
  onSelectReport: (report: RoadReport) => void;
  onExportReportPDF: (report: RoadReport) => void;
  title?: string;
  subtitle?: string;
}

export const ReportsTable: React.FC<ReportsTableProps> = ({
  reports,
  currentUser,
  onSelectReport,
  onExportReportPDF,
  title = 'Road Damage Reports',
  subtitle = 'Comprehensive register of ingested defects, AI confidence scores, and maintenance status.',
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'date' | 'severity'>('priority');

  const filtered = reports.filter((r) => {
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (severityFilter !== 'all' && r.severity !== severityFilter) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        r.id.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'priority') return b.priorityScore - a.priorityScore;
    if (sortBy === 'severity') return b.severityScore - a.severityScore;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden space-y-4 p-5">
      {/* Table Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ID, street, class..."
              className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 w-48 sm:w-60 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-slate-950 text-slate-200 border border-slate-700 rounded-xl px-2.5 py-1.5"
          >
            <option value="all">All Classes</option>
            <option value="Pothole">Potholes</option>
            <option value="Alligator Crack">Alligator Cracks</option>
            <option value="Longitudinal Crack">Longitudinal Cracks</option>
            <option value="Transverse Crack">Transverse Cracks</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-950 text-slate-200 border border-slate-700 rounded-xl px-2.5 py-1.5"
          >
            <option value="all">All Statuses</option>
            <option value="Pending Verification">Pending</option>
            <option value="Verified">Verified</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Repaired">Repaired</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs bg-slate-950 text-slate-200 border border-slate-700 rounded-xl px-2.5 py-1.5"
          >
            <option value="priority">Sort: Highest Priority</option>
            <option value="severity">Sort: Highest Severity</option>
            <option value="date">Sort: Newest First</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Report & Category</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4 text-center">AI Confidence</th>
              <th className="py-3 px-4 text-center">Severity</th>
              <th className="py-3 px-4 text-center">Intelligent Priority</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No matching road damage reports found.
                </td>
              </tr>
            ) : (
              sorted.map((report) => (
                <tr
                  key={report.id}
                  className="hover:bg-slate-800/50 transition cursor-pointer group"
                  onClick={() => onSelectReport(report)}
                >
                  {/* Report ID & Category */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={report.imageUrl}
                        alt={report.title}
                        className="w-11 h-11 rounded-lg object-cover border border-slate-700 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-slate-400 text-[11px]">
                            {report.id}
                          </span>
                          {report.duplicateCount && report.duplicateCount > 0 && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              +{report.duplicateCount} linked
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-white text-xs leading-snug group-hover:text-blue-400 transition">
                          {report.title}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {report.category}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-3 px-4 max-w-xs">
                    <div className="text-slate-200 text-xs truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                      <span className="truncate">{report.address}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                      {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
                    </div>
                  </td>

                  {/* AI Confidence */}
                  <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400">
                    {report.detections?.[0]?.confidence
                      ? `${(report.detections[0].confidence * 100).toFixed(0)}%`
                      : '94%'}
                  </td>

                  {/* Severity */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        report.severity === 'HIGH'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : report.severity === 'MEDIUM'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {report.severity} ({report.severityScore})
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase inline-flex items-center gap-1"
                      style={{
                        backgroundColor: `${
                          report.priorityTier === 'CRITICAL'
                            ? '#ef4444'
                            : report.priorityTier === 'HIGH'
                            ? '#f97316'
                            : '#3b82f6'
                        }20`,
                        color:
                          report.priorityTier === 'CRITICAL'
                            ? '#f87171'
                            : report.priorityTier === 'HIGH'
                            ? '#fb923c'
                            : '#60a5fa',
                        border: `1px solid ${
                          report.priorityTier === 'CRITICAL'
                            ? '#ef4444'
                            : report.priorityTier === 'HIGH'
                            ? '#f97316'
                            : '#3b82f6'
                        }40`,
                      }}
                    >
                      {report.priorityScore} • {report.priorityTier}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 text-center">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-950 border border-slate-700 text-slate-300">
                      {report.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div
                      className="flex items-center justify-end gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => onSelectReport(report)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition"
                        title="Inspect Defect"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onExportReportPDF(report)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 transition"
                        title="Download PDF"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
