import React, { useState } from 'react';
import { RoadReport, User } from '../types';
import { X, CheckCircle2, AlertCircle, Camera, Upload, Wrench, ShieldCheck, DollarSign } from 'lucide-react';

interface BeforeAfterModalProps {
  report: RoadReport;
  currentUser: User;
  onClose: () => void;
  onSubmitVerification: (data: {
    beforeImageUrl: string;
    afterImageUrl: string;
    repairNotes: string;
    materialsUsed: string[];
    costUsd: number;
  }) => void;
  onAdminApprove?: (reportId: string, approved: boolean, feedback: string) => void;
}

export const BeforeAfterModal: React.FC<BeforeAfterModalProps> = ({
  report,
  currentUser,
  onClose,
  onSubmitVerification,
  onAdminApprove,
}) => {
  const existing = report.repairVerification;
  const isMaintenance = currentUser.role === 'maintenance';
  const isAdmin = currentUser.role === 'admin';

  // Form states for maintenance worker submission
  const [beforeImg, setBeforeImg] = useState<string>(
    existing?.beforeImageUrl || report.imageUrl
  );
  const [afterImg, setAfterImg] = useState<string>(
    existing?.afterImageUrl ||
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80'
  );
  const [notes, setNotes] = useState<string>(
    existing?.repairNotes ||
      'Pothole edges were saw-cut square to sound pavement. Emulsion tack coat sprayed. 3-inch hot-mix asphalt (HMA) applied and compacted to 95% density using vibratory plate tamper.'
  );
  const [materials, setMaterials] = useState<string>(
    existing?.materialsUsed?.join(', ') || 'Hot-Mix Asphalt Type B, RS-1 Tack Coat, Mineral Aggregate'
  );
  const [cost, setCost] = useState<number>(existing?.costUsd || 340);
  const [adminFeedback, setAdminFeedback] = useState<string>(existing?.adminFeedback || '');

  const handleMaintenanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitVerification({
      beforeImageUrl: beforeImg,
      afterImageUrl: afterImg,
      repairNotes: notes,
      materialsUsed: materials.split(',').map((m) => m.trim()).filter(Boolean),
      costUsd: Number(cost),
    });
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">
                  Before & After Repair Verification
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {report.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {report.title} • {report.address}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Side-by-Side Visual Inspection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Before Repair */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Before Repair (Defect Photo)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {report.category} ({report.severity})
                </span>
              </div>
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-rose-500/40 bg-slate-950">
                <img
                  src={beforeImg}
                  alt="Defect before repair"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-black/75 text-[10px] font-mono text-rose-300">
                  Initial Inspection
                </div>
              </div>
            </div>

            {/* After Repair */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  After Repair (Field Evidence)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Finished Surface
                </span>
              </div>
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-emerald-500/40 bg-slate-950 group">
                <img
                  src={afterImg}
                  alt="Field repair completion"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-black/75 text-[10px] font-mono text-emerald-300">
                  Completed Patch
                </div>
              </div>
            </div>
          </div>

          {/* Verification Status Pill */}
          {existing && (
            <div
              className={`p-4 rounded-xl border flex items-center justify-between ${
                existing.adminApprovalStatus === 'Approved'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : existing.adminApprovalStatus === 'Revision Requested'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5" />
                <div>
                  <h4 className="font-bold text-sm">
                    Municipal Approval Status: {existing.adminApprovalStatus}
                  </h4>
                  <p className="text-xs opacity-80">
                    Completed by {existing.workerName} on{' '}
                    {new Date(existing.completedAt).toLocaleString()}
                    {existing.verifiedByAdmin && ` • Verified by ${existing.verifiedByAdmin}`}
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-900/60 border border-current">
                ${existing.costUsd} USD
              </span>
            </div>
          )}

          {/* Form for Maintenance Team or Display Details */}
          {isMaintenance && report.status !== 'Repaired' ? (
            <form onSubmit={handleMaintenanceSubmit} className="space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-400" />
                Submit Field Repair Verification
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    After Repair Photo URL or Demo Proof
                  </label>
                  <input
                    type="url"
                    value={afterImg}
                    onChange={(e) => setAfterImg(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-blue-500"
                    placeholder="https://..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Materials Consumed
                  </label>
                  <input
                    type="text"
                    value={materials}
                    onChange={(e) => setMaterials(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. Hot Mix Asphalt Type B, Tack Coat"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Field Engineering Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Total Material & Labor Cost ($):</span>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    min="50"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Submit Task for Municipal Approval
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="font-semibold text-white">Repair Engineering Documentation:</div>
              <p className="text-slate-400 italic">"{existing?.repairNotes || notes}"</p>
              <div className="pt-2 flex flex-wrap gap-4 text-slate-400">
                <div>
                  <strong className="text-slate-200">Materials:</strong> {materials}
                </div>
                <div>
                  <strong className="text-slate-200">Recorded Cost:</strong> ${cost} USD
                </div>
              </div>
            </div>
          )}

          {/* Admin Decision Actions */}
          {isAdmin && onAdminApprove && (
            <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Admin Quality Assurance Review
              </h4>
              <p className="text-xs text-slate-400">
                Verify that field repair meets ASTM D6433 road standards. Bumps or unsealed edges require revision.
              </p>
              <input
                type="text"
                value={adminFeedback}
                onChange={(e) => setAdminFeedback(e.target.value)}
                placeholder="Optional engineering feedback or punch list comments..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onAdminApprove(report.id, false, adminFeedback || 'Revision requested')}
                  className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-semibold transition"
                >
                  Request Revision
                </button>
                <button
                  type="button"
                  onClick={() => onAdminApprove(report.id, true, adminFeedback || 'Approved by Municipal Engineer')}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Approve & Close Complaint
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
