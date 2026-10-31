import React, { useState } from 'react';
import { RoadReport, DashboardSummary } from '../types';
import { exportExecutiveSummaryPDF } from '../utils/pdfExport';
import {
  BarChart3,
  TrendingUp,
  AlertOctagon,
  Wrench,
  CheckCircle,
  Clock,
  FileDown,
  Layers,
  Calendar,
  ShieldAlert,
  ArrowUpRight,
} from 'lucide-react';

interface AnalyticsDashboardProps {
  reports: RoadReport[];
  summary: DashboardSummary;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  reports,
  summary,
}) => {
  const [timeframe, setTimeframe] = useState<'all' | 'week' | 'month'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredReports = reports.filter((r) => {
    if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
    return true;
  });

  // Calculate dynamic chart values from actual reports
  const categoryCounts = {
    Pothole: filteredReports.filter((r) => r.category === 'Pothole').length,
    'Alligator Crack': filteredReports.filter((r) => r.category === 'Alligator Crack').length,
    'Longitudinal Crack': filteredReports.filter((r) => r.category === 'Longitudinal Crack').length,
    'Transverse Crack': filteredReports.filter((r) => r.category === 'Transverse Crack').length,
  };

  const severityCounts = {
    HIGH: filteredReports.filter((r) => r.severity === 'HIGH').length,
    MEDIUM: filteredReports.filter((r) => r.severity === 'MEDIUM').length,
    LOW: filteredReports.filter((r) => r.severity === 'LOW').length,
  };

  const statusCounts = {
    Pending: filteredReports.filter((r) => r.status === 'Pending Verification').length,
    Verified: filteredReports.filter((r) => r.status === 'Verified').length,
    Assigned: filteredReports.filter((r) => r.status === 'Assigned').length,
    InProgress: filteredReports.filter((r) => r.status === 'In Progress').length,
    Repaired: filteredReports.filter((r) => r.status === 'Repaired').length,
  };

  const priorityTiers = {
    CRITICAL: filteredReports.filter((r) => r.priorityTier === 'CRITICAL').length,
    HIGH: filteredReports.filter((r) => r.priorityTier === 'HIGH').length,
    MEDIUM: filteredReports.filter((r) => r.priorityTier === 'MEDIUM').length,
    LOW: filteredReports.filter((r) => r.priorityTier === 'LOW').length,
  };

  const handleExportSummary = () => {
    exportExecutiveSummaryPDF(reports, summary);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" />
            <span>Infrastructure Analytics & Intelligence</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Municipal Surface Operations Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time telemetry across city districts, defect severities, and repair completion rates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-950 text-slate-200 border border-slate-700 rounded-xl px-3 py-2"
          >
            <option value="all">All Defect Classes</option>
            <option value="Pothole">Potholes Only</option>
            <option value="Alligator Crack">Alligator Cracks</option>
            <option value="Longitudinal Crack">Longitudinal Cracks</option>
            <option value="Transverse Crack">Transverse Cracks</option>
          </select>

          <button
            onClick={handleExportSummary}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
          >
            <FileDown className="w-4 h-4" />
            <span>Export Executive PDF</span>
          </button>
        </div>
      </div>

      {/* 8 SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Reports */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Total Reports</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2 font-mono">
            {summary.totalReports}
          </div>
          <span className="text-[11px] text-emerald-400 flex items-center gap-0.5 mt-1 font-medium">
            <ArrowUpRight className="w-3 h-3" /> +12% this week
          </span>
        </div>

        {/* Total Potholes */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Potholes</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 mt-2 font-mono">
            {summary.totalPotholes}
          </div>
          <span className="text-[11px] text-slate-500 mt-1">High structural hazard</span>
        </div>

        {/* Total Cracks */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Surface Cracks</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2 font-mono">
            {summary.totalCracks}
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Alligator, long, trans</span>
        </div>

        {/* Critical Damage Reports */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Critical Priority</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-500 mt-2 font-mono">
            {summary.criticalDamageReports}
          </div>
          <span className="text-[11px] text-rose-400/90 font-medium mt-1">Priority index &gt; 80</span>
        </div>

        {/* Pending Maintenance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Pending Dispatch</span>
            <Clock className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-black text-yellow-400 mt-2 font-mono">
            {summary.pendingMaintenance}
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Awaiting field crew</span>
        </div>

        {/* Completed Repairs */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Repaired & Closed</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2 font-mono">
            {summary.completedRepairs}
          </div>
          <span className="text-[11px] text-emerald-400/90 font-medium mt-1">Field verified</span>
        </div>

        {/* Average Priority Score */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Avg Priority Score</span>
            <BarChart3 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400 mt-2 font-mono">
            {summary.averagePriorityScore}
            <span className="text-xs font-normal text-slate-500"> /100</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Citywide weighted index</span>
        </div>

        {/* Reports Submitted Today */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Today's Inflow</span>
            <Calendar className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400 mt-2 font-mono">
            {summary.reportsSubmittedToday}
          </div>
          <span className="text-[11px] text-cyan-400/90 font-medium mt-1">Live citizen reports</span>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Chart 1: Damage Category Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
              Defect Category Breakdown
            </h3>
            <span className="text-[10px] font-mono text-slate-500">YOLO Classes</span>
          </div>
          <div className="space-y-3 pt-1">
            {Object.entries(categoryCounts).map(([cat, cnt]) => {
              const pct = filteredReports.length ? Math.round((cnt / filteredReports.length) * 100) : 0;
              const barColor =
                cat === 'Pothole'
                  ? 'bg-rose-500'
                  : cat === 'Alligator Crack'
                  ? 'bg-amber-500'
                  : cat === 'Transverse Crack'
                  ? 'bg-yellow-400'
                  : 'bg-cyan-400';

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{cat}</span>
                    <span className="font-mono text-slate-400">
                      {cnt} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div className={`${barColor} h-full rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Severity Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
              Damage Severity Distribution
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Impact Ratio</span>
          </div>
          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-rose-400 font-semibold">High Severity (Cavities &gt; 3.5")</span>
                <span className="font-mono text-white">{severityCounts.HIGH}</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${filteredReports.length ? (severityCounts.HIGH / filteredReports.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-amber-400 font-semibold">Medium Severity (Joint separations)</span>
                <span className="font-mono text-white">{severityCounts.MEDIUM}</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${filteredReports.length ? (severityCounts.MEDIUM / filteredReports.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-emerald-400 font-semibold">Low Severity (Superficial hairline)</span>
                <span className="font-mono text-white">{severityCounts.LOW}</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${filteredReports.length ? (severityCounts.LOW / filteredReports.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Chart 3: Priority Index Tier Allocation */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
              Priority Tier Allocation
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Formula Weights</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl text-center">
              <span className="text-[11px] font-bold text-rose-400 uppercase">Critical (80+)</span>
              <div className="text-xl font-black text-rose-400 font-mono mt-1">
                {priorityTiers.CRITICAL}
              </div>
              <span className="text-[10px] text-rose-300/80">Immediate 24h</span>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-center">
              <span className="text-[11px] font-bold text-amber-400 uppercase">High (60-79)</span>
              <div className="text-xl font-black text-amber-400 font-mono mt-1">
                {priorityTiers.HIGH}
              </div>
              <span className="text-[10px] text-amber-300/80">48-72 Hours</span>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-xl text-center">
              <span className="text-[11px] font-bold text-yellow-400 uppercase">Medium (35-59)</span>
              <div className="text-xl font-black text-yellow-400 font-mono mt-1">
                {priorityTiers.MEDIUM}
              </div>
              <span className="text-[10px] text-yellow-300/80">Scheduled</span>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-center">
              <span className="text-[11px] font-bold text-emerald-400 uppercase">Low (&lt;35)</span>
              <div className="text-xl font-black text-emerald-400 font-mono mt-1">
                {priorityTiers.LOW}
              </div>
              <span className="text-[10px] text-emerald-300/80">Routine Cycle</span>
            </div>
          </div>
        </div>

        {/* Chart 4: Maintenance Repair Pipeline */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 md:col-span-2 lg:col-span-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                End-to-End Maintenance Repair Lifecycle
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Current operational count across each verification and dispatch phase.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-semibold">
              System Health: Optimal
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60">
              <span className="text-[11px] text-slate-400">1. Verification</span>
              <div className="text-lg font-bold text-white mt-1 font-mono">{statusCounts.Pending}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Needs QA review</div>
            </div>

            <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/5">
              <span className="text-[11px] text-blue-300">2. Verified</span>
              <div className="text-lg font-bold text-blue-400 mt-1 font-mono">{statusCounts.Verified}</div>
              <div className="text-[10px] text-blue-300/70 mt-0.5">Ready for crew</div>
            </div>

            <div className="p-3 rounded-xl border border-yellow-500/30 bg-yellow-500/5">
              <span className="text-[11px] text-yellow-300">3. Assigned</span>
              <div className="text-lg font-bold text-yellow-400 mt-1 font-mono">{statusCounts.Assigned}</div>
              <div className="text-[10px] text-yellow-300/70 mt-0.5">Dispatched</div>
            </div>

            <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5">
              <span className="text-[11px] text-amber-300">4. In Progress</span>
              <div className="text-lg font-bold text-amber-400 mt-1 font-mono">{statusCounts.InProgress}</div>
              <div className="text-[10px] text-amber-300/70 mt-0.5">Crews on-site</div>
            </div>

            <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <span className="text-[11px] text-emerald-300">5. Repaired</span>
              <div className="text-lg font-bold text-emerald-400 mt-1 font-mono">{statusCounts.Repaired}</div>
              <div className="text-[10px] text-emerald-300/70 mt-0.5">QA Approved</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
