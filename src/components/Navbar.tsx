import React, { useState } from 'react';
import { User, UserRole, AppNotification } from '../types';
import { DEMO_USERS } from '../data/seedData';
import {
  ShieldAlert,
  Bell,
  Download,
  CheckCircle2,
  AlertTriangle,
  User as UserIcon,
  MapPin,
  BarChart3,
  Wrench,
  Camera,
  Layers,
  Award,
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onSwitchUser: (user: User) => void;
  activeNav: string;
  onNavigate: (tab: string) => void;
  notifications: AppNotification[];
  onMarkNotificationRead: (id: string) => void;
  onSelectReportId?: (reportId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchUser,
  activeNav,
  onNavigate,
  notifications,
  onMarkNotificationRead,
  onSelectReportId,
}) => {
  const [showNotifs, setShowNotifs] = useState<boolean>(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleDownloadZip = () => {
    const link = document.createElement('a');
    link.href = '/RoadGuard-AI.zip';
    link.download = 'RoadGuard-AI.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <header className="sticky top-0 z-[1500] bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('overview')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-base tracking-tight">
                    RoadGuard<span className="text-blue-500">.AI</span>
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-blue-300 font-semibold hidden sm:inline">
                    v2.4 YOLO
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block">
                  Smart Infrastructure Defect & Maintenance System
                </p>
              </div>
            </button>
          </div>

          {/* Navigation Links according to role */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
            {currentUser.role === 'citizen' && (
              <>
                <button
                  onClick={() => onNavigate('report')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    activeNav === 'report'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Report Damage</span>
                </button>
                <button
                  onClick={() => onNavigate('map')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    activeNav === 'map'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Interactive Map</span>
                </button>
                <button
                  onClick={() => onNavigate('my-reports')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    activeNav === 'my-reports'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>My Reports & Tracking</span>
                </button>
              </>
            )}

            {currentUser.role === 'admin' && (
              <>
                <button
                  onClick={() => onNavigate('overview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    activeNav === 'overview'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Command Center</span>
                </button>
                <button
                  onClick={() => onNavigate('all-reports')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    activeNav === 'all-reports'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>All Reports</span>
                </button>
                <button
                  onClick={() => onNavigate('map')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    activeNav === 'map'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Damage Map & Hotspots</span>
                </button>
                <button
                  onClick={() => onNavigate('report')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    activeNav === 'report'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Ingest Defect</span>
                </button>
              </>
            )}

            {currentUser.role === 'maintenance' && (
              <>
                <button
                  onClick={() => onNavigate('tasks')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    activeNav === 'tasks'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>My Assigned Tasks</span>
                </button>
                <button
                  onClick={() => onNavigate('map')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    activeNav === 'map'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Field Navigation Map</span>
                </button>
              </>
            )}

            <button
              onClick={() => onNavigate('presentation')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeNav === 'presentation'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-400/90 hover:text-amber-300'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Pitch & Presentation</span>
            </button>
          </nav>

          {/* Right Controls: Notifications, ZIP Download, and Demo Role Switcher */}
          <div className="flex items-center gap-3">
            {/* Download ZIP Button */}
            <button
              onClick={handleDownloadZip}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition"
              title="Download standalone Windows project ZIP"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download ZIP</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popup Dropdown */}
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 space-y-3 z-[2500]">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-blue-400" />
                      <span>Notifications ({notifications.length})</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {unreadCount} unread
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            onMarkNotificationRead(n.id);
                            if (n.reportId && onSelectReportId) {
                              onSelectReportId(n.reportId);
                              setShowNotifs(false);
                            }
                          }}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                            !n.read
                              ? 'bg-blue-500/10 border-blue-500/30 text-slate-200'
                              : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold text-white mb-1">
                            <span>{n.title}</span>
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-blue-400" />
                            )}
                          </div>
                          <p className="text-[11px] leading-relaxed">{n.message}</p>
                          <div className="text-[10px] text-slate-500 mt-1 font-mono">
                            {new Date(n.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Demo Role Switcher */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-white leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  Role: <strong className="text-blue-400">{currentUser.role}</strong>
                </div>
              </div>

              <select
                value={currentUser.role}
                onChange={(e) => {
                  const targetUser = DEMO_USERS.find((u) => u.role === e.target.value) || DEMO_USERS[0];
                  onSwitchUser(targetUser);
                }}
                className="text-xs bg-slate-900 text-slate-200 border border-slate-700 rounded-xl px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 font-semibold cursor-pointer"
                title="Switch demo persona to test workflows"
              >
                <option value="citizen">Citizen Demo</option>
                <option value="admin">Admin Demo</option>
                <option value="maintenance">Maintenance Demo</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
