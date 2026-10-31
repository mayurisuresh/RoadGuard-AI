import React from 'react';
import { MaintenanceTask, RoadReport, User } from '../types';
import {
  Wrench,
  Clock,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Camera,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface MaintenanceTasksViewProps {
  tasks: MaintenanceTask[];
  reports: RoadReport[];
  currentUser: User;
  onSelectReport: (report: RoadReport) => void;
  onOpenBeforeAfter: (report: RoadReport) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: any) => void;
}

export const MaintenanceTasksView: React.FC<MaintenanceTasksViewProps> = ({
  tasks,
  reports,
  currentUser,
  onSelectReport,
  onOpenBeforeAfter,
  onUpdateTaskStatus,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/70 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <Wrench className="w-4 h-4" />
            <span>Field Maintenance Work Orders</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Rapid Road Repair Unit (Crew Lead: {currentUser.name})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Execute dispatched asphalt patch orders, track equipment requirements, and submit before/after QA photo evidence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
            {tasks.length} Active Work Orders
          </span>
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {tasks.map((task) => {
          const report = reports.find((r) => r.id === task.reportId);
          const isCritical = task.priorityTier === 'CRITICAL';

          return (
            <div
              key={task.id}
              className={`rounded-2xl border p-5 shadow-xl transition flex flex-col justify-between space-y-4 ${
                isCritical
                  ? 'bg-slate-900/90 border-rose-500/40 shadow-rose-950/20'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="space-y-3">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                        isCritical
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                      }`}
                    >
                      {task.priorityTier} ({task.priorityScore})
                    </span>
                    <span className="text-xs font-mono text-slate-400">{task.id}</span>
                  </div>

                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-700 text-slate-300 font-semibold">
                    {task.status}
                  </span>
                </div>

                {/* Title & Location */}
                <div>
                  <h3 className="text-sm font-bold text-white leading-snug">
                    {task.reportTitle}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{task.address}</span>
                  </div>
                </div>

                {/* Repair Instructions */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="font-semibold text-slate-200">Engineering Work Order:</div>
                  <p className="text-slate-400">{task.instructions}</p>
                </div>

                {/* Equipment & Due Date */}
                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Target Due: <strong className="text-white">{task.targetCompletionDate}</strong></span>
                  </div>
                  <div>
                    <strong className="text-slate-300">Class:</strong> {task.reportCategory}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => report && onSelectReport(report)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                >
                  View Details
                </button>

                {report && (
                  <button
                    type="button"
                    onClick={() => onOpenBeforeAfter(report)}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 ml-auto"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Before/After Field QA</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
