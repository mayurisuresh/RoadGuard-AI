import React, { useState } from 'react';
import { RoadReport, User } from '../types';
import {
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  FileDown,
  ShieldCheck,
  Eye,
  Camera,
  ArrowRight,
} from 'lucide-react';

interface CitizenTrackingViewProps {
  reports: RoadReport[];
  currentUser: User;
  onSelectReport: (report: RoadReport) => void;
  onExportReportPDF: (report: RoadReport) => void;
  onNavigateToReport: () => void;
}

export const CitizenTrackingView: React.FC<CitizenTrackingViewProps> = ({
  reports,
  currentUser,
  onSelectReport,
  onExportReportPDF,
  onNavigateToReport,
}) => {
  const [trackingQuery, setTrackingQuery] = useState<string>('');

  // Find specifically tracked report if user typed a tracking ID
  const searchedReport = trackingQuery.trim()
    ? reports.find(
        (r) =>
          r.id.toLowerCase() === trackingQuery.trim().toLowerCase() ||
          r.id.toLowerCase().includes(trackingQuery.trim().toLowerCase())
      )
    : null;

  // Citizen's personal submissions or matching citizen ID
  const myReports = reports.filter(
    (r) => r.citizenId === currentUser.id || r.citizenName === currentUser.name
  );

  return (
    <div className="space-y-6">
      {/* Search Tracker Hero */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950/80 border border-blue-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
        <div>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
            Citizen Transparency Portal
          </span>
          <h2 className="text-xl font-extrabold text-white mt-1">
            Track Road Complaint & Repair Status
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Enter your unique Complaint ID (e.g. <code>RG-2026-1001</code>) to monitor real-time AI verification, municipal crew dispatch, and photo-verified repairs.
          </p>
        </div>

        {/* Tracking Search Input */}
        <div className="flex flex-col sm:flex-row items-center gap-2 max-w-lg">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={trackingQuery}
              onChange={(e) => setTrackingQuery(e.target.value)}
              placeholder="Enter Complaint ID (e.g. RG-2026-1001)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-blue-500 font-mono"
            />
          </div>
          {trackingQuery && (
            <button
              onClick={() => setTrackingQuery('')}
              className="text-xs text-slate-400 hover:text-white px-2 py-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Searched Report Result Card if query active */}
      {searchedReport && (
        <div className="bg-slate-900 border-2 border-blue-500/50 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                {searchedReport.id}
              </span>
              <h3 className="text-base font-bold text-white mt-2">
                {searchedReport.title}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>{searchedReport.address}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectReport(searchedReport)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Inspect Full History</span>
              </button>
              <button
                onClick={() => onExportReportPDF(searchedReport)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                title="Download PDF"
              >
                <FileDown className="w-4 h-4 text-blue-400" />
              </button>
            </div>
          </div>

          {/* Interactive Progress Bar */}
          <div className="pt-2">
            <div className="text-xs font-semibold text-slate-300 mb-2">
              Current Repair Progress: <strong className="text-blue-400">{searchedReport.status}</strong>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-semibold">
              <div
                className={`p-2 rounded-lg border ${
                  searchedReport.statusHistory.some((s) => s.status === 'Pending Verification')
                    ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                1. AI Ingested
              </div>
              <div
                className={`p-2 rounded-lg border ${
                  searchedReport.statusHistory.some((s) => s.status === 'Verified')
                    ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                2. City Verified
              </div>
              <div
                className={`p-2 rounded-lg border ${
                  searchedReport.statusHistory.some((s) => s.status === 'In Progress' || s.status === 'Assigned')
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                3. Crew Dispatched
              </div>
              <div
                className={`p-2 rounded-lg border ${
                  searchedReport.status === 'Repaired'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                4. Repaired & Closed
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Citizen Personal Reports Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">
              My Submitted Damage Reports ({myReports.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Complaints logged from your account with real-time status telemetry.
            </p>
          </div>

          <button
            onClick={onNavigateToReport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
          >
            <Camera className="w-4 h-4" />
            <span>Report New Defect</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {myReports.length === 0 ? (
            <div className="col-span-2 py-8 text-center text-slate-500 text-xs">
              You haven't submitted any road damage reports yet. Click "Report New Defect" above to test the AI camera ingestion!
            </div>
          ) : (
            myReports.map((report) => (
              <div
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/40 transition cursor-pointer flex flex-col justify-between space-y-3 group"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={report.imageUrl}
                    alt={report.title}
                    className="w-16 h-16 rounded-lg object-cover border border-slate-700 shrink-0"
                  />
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                        {report.id}
                      </span>
                      <span className="text-[10px] font-bold text-blue-400">
                        {report.category}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-blue-400 transition">
                      {report.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{report.address}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <span className="text-[11px] font-semibold text-slate-300">
                    Status: <strong className="text-white">{report.status}</strong>
                  </span>
                  <span className="text-blue-400 group-hover:translate-x-1 transition text-[11px] font-bold flex items-center gap-1">
                    <span>Track</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
