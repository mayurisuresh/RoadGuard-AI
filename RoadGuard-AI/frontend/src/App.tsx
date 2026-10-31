import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  RoadReport,
  User,
  MaintenanceTask,
  AppNotification,
  ReportStatus,
  DashboardSummary,
} from './types';
import {
  DEMO_USERS,
  INITIAL_REPORTS,
  INITIAL_TASKS,
  INITIAL_NOTIFICATIONS,
} from './data/seedData';
import { Navbar } from './components/Navbar';
import { DamageMap } from './components/DamageMap';
import { ReportDamageForm } from './components/ReportDamageForm';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { ReportsTable } from './components/ReportsTable';
import { MaintenanceTasksView } from './components/MaintenanceTasksView';
import { CitizenTrackingView } from './components/CitizenTrackingView';
import { ReportDetailModal } from './components/ReportDetailModal';
import { BeforeAfterModal } from './components/BeforeAfterModal';
import { HackathonPresentation } from './components/HackathonPresentation';
import { exportSingleReportPDF } from './utils/pdfExport';
import {
  PlusCircle,
  MapPin,
  BarChart3,
  Layers,
  Wrench,
  Award,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export const App: React.FC = () => {
  // Current user state (default: Director Marcus Vance - Admin for complete overview, switchable with 1-click)
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('roadguard_user');
    return saved ? JSON.parse(saved) : DEMO_USERS[1]; // default admin
  });

  // Main Reports State
  const [reports, setReports] = useState<RoadReport[]>(() => {
    const saved = localStorage.getItem('roadguard_reports');
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  // Maintenance Tasks State
  const [tasks, setTasks] = useState<MaintenanceTask[]>(() => {
    const saved = localStorage.getItem('roadguard_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('roadguard_notifs');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Navigation tab state
  const [activeNav, setActiveNav] = useState<string>('overview');

  // Modals & Inspection state
  const [selectedReport, setSelectedReport] = useState<RoadReport | null>(null);
  const [beforeAfterReport, setBeforeAfterReport] = useState<RoadReport | null>(null);

  // Persistence to local storage
  useEffect(() => {
    localStorage.setItem('roadguard_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('roadguard_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('roadguard_notifs', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('roadguard_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // Sync default navigation when user role changes
  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'citizen') {
      setActiveNav('report');
    } else if (user.role === 'maintenance') {
      setActiveNav('tasks');
    } else {
      setActiveNav('overview');
    }
  };

  // Compute live dashboard summary
  const summary: DashboardSummary = {
    totalReports: reports.length,
    totalPotholes: reports.filter((r) => r.category === 'Pothole').length,
    totalCracks: reports.filter((r) => r.category.includes('Crack')).length,
    criticalDamageReports: reports.filter((r) => r.priorityTier === 'CRITICAL').length,
    pendingMaintenance: reports.filter(
      (r) => r.status === 'Pending Verification' || r.status === 'Verified' || r.status === 'Assigned'
    ).length,
    completedRepairs: reports.filter((r) => r.status === 'Repaired').length,
    averagePriorityScore: reports.length
      ? Math.round(reports.reduce((acc, r) => acc + r.priorityScore, 0) / reports.length)
      : 0,
    reportsSubmittedToday: reports.filter(
      (r) => new Date(r.createdAt).toDateString() === new Date().toDateString()
    ).length,
  };

  // Submit new report
  const handleSubmitReport = (newReport: RoadReport) => {
    setReports((prev) => [newReport, ...prev]);

    // Add in-app notification
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: 'all',
      roleTarget: 'admin',
      title: `New Defect Logged: ${newReport.category}`,
      message: `Report ${newReport.id} at ${newReport.address.split(',')[0]} submitted with Priority ${newReport.priorityScore} (${newReport.priorityTier}).`,
      reportId: newReport.id,
      type: newReport.priorityTier === 'CRITICAL' ? 'alert' : 'info',
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Confetti celebration if submitted
    try {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    } catch (e) {
      // ignore
    }

    if (currentUser.role === 'citizen') {
      setActiveNav('my-reports');
    } else {
      setActiveNav('all-reports');
    }
    setSelectedReport(newReport);
  };

  // Update report status
  const handleUpdateStatus = (reportId: string, newStatus: ReportStatus, notes: string) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) {
          const updatedHistory = [
            ...r.statusHistory,
            {
              id: `sh-${Date.now()}`,
              status: newStatus,
              updatedBy: currentUser.name,
              role: currentUser.role,
              timestamp: new Date().toISOString(),
              notes,
            },
          ];
          return {
            ...r,
            status: newStatus,
            statusHistory: updatedHistory,
            updatedAt: new Date().toISOString(),
          };
        }
        return r;
      })
    );

    // Notification
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: 'all',
      title: `Status Updated: ${reportId} is now ${newStatus}`,
      message: `${notes} by ${currentUser.name}.`,
      reportId,
      type: newStatus === 'Repaired' ? 'success' : 'info',
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);

    if (selectedReport && selectedReport.id === reportId) {
      setSelectedReport((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // Assign task to maintenance crew
  const handleAssignTask = (
    reportId: string,
    workerId: string,
    instructions: string,
    dueDate: string
  ) => {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;

    const worker = DEMO_USERS.find((u) => u.id === workerId) || DEMO_USERS[2];

    const newTask: MaintenanceTask = {
      id: `task-${Math.floor(1000 + Math.random() * 9000)}`,
      reportId,
      reportTitle: report.title,
      reportCategory: report.category,
      priorityScore: report.priorityScore,
      priorityTier: report.priorityTier,
      status: 'Assigned',
      assignedWorkerId: worker.id,
      assignedWorkerName: worker.name,
      targetCompletionDate: dueDate,
      instructions,
      equipment: ['Plate compactor', 'Asphalt hot box', 'Saw cutter', 'Safety cones'],
      lat: report.lat,
      lng: report.lng,
      address: report.address,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);

    // Update report
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) {
          return {
            ...r,
            status: 'Assigned',
            assignedTo: {
              id: worker.id,
              name: worker.name,
              team: worker.department || 'Rapid Road Repair',
            },
            statusHistory: [
              ...r.statusHistory,
              {
                id: `sh-${Date.now()}`,
                status: 'Assigned',
                updatedBy: currentUser.name,
                role: currentUser.role,
                timestamp: new Date().toISOString(),
                notes: `Dispatched to ${worker.name}. Due: ${dueDate}`,
              },
            ],
          };
        }
        return r;
      })
    );

    // Notification
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: workerId,
      roleTarget: 'maintenance',
      title: `New Maintenance Task Dispatched`,
      message: `Task ${newTask.id} assigned to you for ${report.title} (${report.priorityTier}).`,
      reportId,
      type: 'warning',
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);

    if (selectedReport?.id === reportId) {
      setSelectedReport((prev) =>
        prev
          ? {
              ...prev,
              status: 'Assigned',
              assignedTo: {
                id: worker.id,
                name: worker.name,
                team: worker.department || 'Rapid Road Repair',
              },
            }
          : null
      );
    }
  };

  // Submit Field Repair Before/After Verification
  const handleSubmitVerification = (data: {
    beforeImageUrl: string;
    afterImageUrl: string;
    repairNotes: string;
    materialsUsed: string[];
    costUsd: number;
  }) => {
    if (!beforeAfterReport) return;
    const reportId = beforeAfterReport.id;

    const verification = {
      taskId: `task-${reportId}`,
      workerId: currentUser.id,
      workerName: currentUser.name,
      beforeImageUrl: data.beforeImageUrl,
      afterImageUrl: data.afterImageUrl,
      repairNotes: data.repairNotes,
      materialsUsed: data.materialsUsed,
      costUsd: data.costUsd,
      completedAt: new Date().toISOString(),
      adminApprovalStatus: 'Pending Review' as const,
    };

    setReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) {
          return {
            ...r,
            status: 'In Progress',
            repairVerification: verification,
            statusHistory: [
              ...r.statusHistory,
              {
                id: `sh-${Date.now()}`,
                status: 'In Progress',
                updatedBy: currentUser.name,
                role: currentUser.role,
                timestamp: new Date().toISOString(),
                notes: 'Field repair photo evidence uploaded. Awaiting Municipal QA approval.',
              },
            ],
          };
        }
        return r;
      })
    );

    // Update corresponding task
    setTasks((prev) =>
      prev.map((t) => (t.reportId === reportId ? { ...t, status: 'In Progress', repairVerification: verification } : t))
    );

    // In-app alert
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: 'all',
      roleTarget: 'admin',
      title: `Field Repair Submitted for Review: ${reportId}`,
      message: `Crew lead ${currentUser.name} uploaded before/after evidence for QA approval.`,
      reportId,
      type: 'info',
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);

    setBeforeAfterReport(null);
  };

  // Admin approves or requests revision
  const handleAdminApprove = (reportId: string, approved: boolean, feedback: string) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId && r.repairVerification) {
          const updatedVerification = {
            ...r.repairVerification,
            verifiedByAdmin: currentUser.name,
            adminApprovalStatus: approved ? ('Approved' as const) : ('Revision Requested' as const),
            adminFeedback: feedback,
          };

          const newStatus: ReportStatus = approved ? 'Repaired' : 'In Progress';
          return {
            ...r,
            status: newStatus,
            repairVerification: updatedVerification,
            statusHistory: [
              ...r.statusHistory,
              {
                id: `sh-${Date.now()}`,
                status: newStatus,
                updatedBy: currentUser.name,
                role: currentUser.role,
                timestamp: new Date().toISOString(),
                notes: approved
                  ? `Repair QA Approved by ${currentUser.name}: ${feedback}`
                  : `Revision Requested by ${currentUser.name}: ${feedback}`,
              },
            ],
          };
        }
        return r;
      })
    );

    // Update tasks
    setTasks((prev) =>
      prev.map((t) => (t.reportId === reportId ? { ...t, status: approved ? 'Repaired' : 'In Progress' } : t))
    );

    if (approved) {
      try {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      } catch (e) {
        // ignore
      }
    }

    setBeforeAfterReport(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Universal Top Navigation */}
      <Navbar
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        activeNav={activeNav}
        onNavigate={(tab) => setActiveNav(tab)}
        notifications={notifications}
        onMarkNotificationRead={(id) => {
          setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
        }}
        onSelectReportId={(id) => {
          const r = reports.find((item) => item.id === id);
          if (r) setSelectedReport(r);
        }}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* VIEW 1: Admin Command Center (Overview & Analytics) */}
        {activeNav === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            <AnalyticsDashboard reports={reports} summary={summary} />

            {/* Quick Map Preview */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <span>Live Defect Telemetry & Hotspot Geospatial Map</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click any marker to inspect depth envelopes, AI confidence, or dispatch work orders.
                  </p>
                </div>
                <button
                  onClick={() => setActiveNav('map')}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                >
                  Expand Full Map &rarr;
                </button>
              </div>

              <DamageMap
                reports={reports}
                onSelectReport={(r) => setSelectedReport(r)}
                heightClass="h-[420px]"
              />
            </div>

            {/* Top Priority Reports Table */}
            <ReportsTable
              reports={reports}
              currentUser={currentUser}
              onSelectReport={(r) => setSelectedReport(r)}
              onExportReportPDF={(r) => exportSingleReportPDF(r)}
              title="Recent & Highest Priority Surface Defects"
              subtitle="Ordered by multi-factor municipal priority score (Severity 50% + Traffic 30% + Safety 20%)."
            />
          </div>
        )}

        {/* VIEW 2: Report Damage Ingestion (Citizen or Admin) */}
        {activeNav === 'report' && (
          <div className="animate-fadeIn">
            <ReportDamageForm
              currentUser={currentUser}
              existingReports={reports}
              onSubmitReport={handleSubmitReport}
              onCancel={() => setActiveNav(currentUser.role === 'citizen' ? 'my-reports' : 'overview')}
            />
          </div>
        )}

        {/* VIEW 3: Interactive Leaflet Map & Hotspots */}
        {activeNav === 'map' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  Geospatial Infrastructure Intelligence
                </span>
                <h2 className="text-xl font-bold text-white mt-1">
                  Citywide Road Damage & Hotspot Clusters
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visualized using Leaflet and OpenStreetMap. Color-coded by Intelligent Priority Index.
                </p>
              </div>

              <button
                onClick={() => setActiveNav('report')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report Defect at Location</span>
              </button>
            </div>

            <DamageMap
              reports={reports}
              selectedReport={selectedReport}
              onSelectReport={(r) => setSelectedReport(r)}
              heightClass="h-[620px]"
            />
          </div>
        )}

        {/* VIEW 4: All Reports Table */}
        {activeNav === 'all-reports' && (
          <div className="animate-fadeIn">
            <ReportsTable
              reports={reports}
              currentUser={currentUser}
              onSelectReport={(r) => setSelectedReport(r)}
              onExportReportPDF={(r) => exportSingleReportPDF(r)}
              title="Citywide Infrastructure Defect Register"
              subtitle="Filter, search, and verify all citizen reports and field road repair orders."
            />
          </div>
        )}

        {/* VIEW 5: Citizen My Reports & Tracking */}
        {activeNav === 'my-reports' && (
          <div className="animate-fadeIn">
            <CitizenTrackingView
              reports={reports}
              currentUser={currentUser}
              onSelectReport={(r) => setSelectedReport(r)}
              onExportReportPDF={(r) => exportSingleReportPDF(r)}
              onNavigateToReport={() => setActiveNav('report')}
            />
          </div>
        )}

        {/* VIEW 6: Maintenance Tasks View */}
        {activeNav === 'tasks' && (
          <div className="animate-fadeIn">
            <MaintenanceTasksView
              tasks={tasks}
              reports={reports}
              currentUser={currentUser}
              onSelectReport={(r) => setSelectedReport(r)}
              onOpenBeforeAfter={(r) => setBeforeAfterReport(r)}
              onUpdateTaskStatus={handleUpdateStatus}
            />
          </div>
        )}

        {/* VIEW 7: Hackathon Presentation Material & Deck */}
        {activeNav === 'presentation' && (
          <div className="animate-fadeIn">
            <HackathonPresentation />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-slate-400">RoadGuard AI Platform</span>
            <span>• Hackathon Technical Deliverable</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>YOLOv8-RDD2022</span>
            <span>Haversine Spatial Clustered</span>
            <span>ASTM D6433 Compliant</span>
          </div>
        </div>
      </footer>

      {/* Report Detail Modal */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          currentUser={currentUser}
          onClose={() => setSelectedReport(null)}
          onUpdateStatus={handleUpdateStatus}
          onAssignTask={handleAssignTask}
          onOpenBeforeAfter={(r) => setBeforeAfterReport(r)}
          allReports={reports}
        />
      )}

      {/* Before / After Verification Modal */}
      {beforeAfterReport && (
        <BeforeAfterModal
          report={beforeAfterReport}
          currentUser={currentUser}
          onClose={() => setBeforeAfterReport(null)}
          onSubmitVerification={handleSubmitVerification}
          onAdminApprove={handleAdminApprove}
        />
      )}
    </div>
  );
};
export default App;
