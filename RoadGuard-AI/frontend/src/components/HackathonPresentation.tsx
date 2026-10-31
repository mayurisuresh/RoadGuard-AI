import React, { useState } from 'react';
import {
  Award,
  Presentation,
  Download,
  Terminal,
  Code2,
  Cpu,
  Database,
  CheckCircle2,
  HelpCircle,
  Clock,
  Sparkles,
  Layers,
  ShieldAlert,
} from 'lucide-react';

export const HackathonPresentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pitch' | 'architecture' | 'judge-qa' | 'download'>('pitch');

  const handleDownloadZip = () => {
    const link = document.createElement('a');
    link.href = '/RoadGuard-AI.zip';
    link.download = 'RoadGuard-AI.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border border-blue-500/30 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase tracking-wider mb-1">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Hackathon Presentation & Technical Defense Package</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            RoadGuard AI: Technical Brief & Pitch Deck
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Complete judge presentation materials, 3-minute stage demo script, architectural data flows, and downloadable standalone project package.
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xl shadow-emerald-600/30 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Download RoadGuard-AI.zip</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('pitch')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'pitch'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Presentation className="w-4 h-4" />
          <span>3-Minute Pitch & Script</span>
        </button>

        <button
          onClick={() => setActiveTab('architecture')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'architecture'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>System Architecture & Data Flow</span>
        </button>

        <button
          onClick={() => setActiveTab('judge-qa')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'judge-qa'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Technical Judge Q&A</span>
        </button>

        <button
          onClick={() => setActiveTab('download')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'download'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Windows Run Instructions</span>
        </button>
      </div>

      {/* Tab 1: 3-Minute Demo Script & Executive Abstract */}
      {activeTab === 'pitch' && (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Project Abstract & Problem Statement</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Abstract:</strong> Road damage—such as potholes, transverse fatigue cracks, and alligator structural deterioration—imposes billions of dollars annually in vehicular damage, traffic congestion, and fatal roadway accidents. Traditional road maintenance relies on manual road patrols or slow complaint portals, resulting in delayed prioritization and reactive patching.
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Proposed Innovation:</strong> <em>RoadGuard AI</em> bridges the gap between citizens, artificial intelligence, and municipal road maintenance crews. By coupling Computer Vision defect localization with an intelligent multi-variable prioritization engine (0.50×Severity + 0.30×Traffic + 0.20×Safety), geospatial duplicate detection (Haversine radius filter), and digital Before/After field verification, RoadGuard AI transitions smart cities from reactive patching to proactive, mathematically optimal infrastructure preservation.
            </p>
          </div>

          {/* 3-Minute Timed Demonstration Script */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>3-Minute Hackathon Demonstration Script (Step-by-Step)</span>
              </h3>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                Target: 180 seconds
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center font-mono text-[11px]">01</span>
                  <span>0:00 - 0:40: Problem Statement & Citizen Ingestion</span>
                </div>
                <p className="text-xs text-slate-300 mt-1.5 pl-8 leading-relaxed">
                  "Judges, every day drivers lose tires and cyclists crash due to undetected potholes. Watch how simple RoadGuard AI makes reporting: As a citizen, I snap a photo of a severe pothole on Market St or click a benchmark sample. In under 300 milliseconds, our neural vision engine classifies it as a <strong>Pothole with 96% confidence</strong>, draws the bounding envelope, and captures my GPS location."
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center font-mono text-[11px]">02</span>
                  <span>0:40 - 1:15: Intelligent Prioritization & Spatial Duplicate Filtering</span>
                </div>
                <p className="text-xs text-slate-300 mt-1.5 pl-8 leading-relaxed">
                  "Notice what happens under the hood: The system doesn't just store a photo. It calculates a multi-factor priority score: <code>0.50×Severity + 0.30×Traffic + 0.20×Safety Risk = 91/100 (CRITICAL)</code>. Simultaneously, our Haversine spatial filter checks a 40-meter radius to merge duplicate citizen complaints, preventing redundant work orders."
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center font-mono text-[11px]">03</span>
                  <span>1:15 - 1:50: Administrator Command Center & Dispatch</span>
                </div>
                <p className="text-xs text-slate-300 mt-1.5 pl-8 leading-relaxed">
                  "Now we switch roles to the Municipal Admin Dashboard. Here, Director Vance can see citywide hotspots, automated equipment recommendations (e.g. 'RS-1 tack coat with Type B HMA'), and one-click dispatch work orders to Crew Lead Alex Rivera with target completion dates."
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center font-mono text-[11px]">04</span>
                  <span>1:50 - 2:30: Maintenance Workflow & Before/After QA Verification</span>
                </div>
                <p className="text-xs text-slate-300 mt-1.5 pl-8 leading-relaxed">
                  "Switching to the Maintenance Team role: Alex arrives on site, performs the hot-mix patch, and uploads the finished repair photo with material logs. Crucially, RoadGuard AI does not blindly close the ticket; it requires municipal engineering verification to approve the repair and notify the citizen."
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center font-mono text-[11px]">05</span>
                  <span>2:30 - 3:00: Impact, Analytics & 1-Click PDF Report Export</span>
                </div>
                <p className="text-xs text-slate-300 mt-1.5 pl-8 leading-relaxed">
                  "Finally, all telemetry updates live in our database-backed analytics. With one click, we export a fully compliant, official Municipal Inspection PDF report. RoadGuard AI saves municipal budgets up to 34% by catching cracks before they become cratered potholes. Thank you!"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Architecture & Data Flow */}
      {activeTab === 'architecture' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Complete Full-Stack System Architecture & Pipeline</span>
          </h3>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-slate-300 space-y-3 overflow-x-auto">
            <div className="text-blue-400 font-bold">// END-TO-END DATA FLOW PIPELINE</div>
            <div>[CITIZEN CLIENT (React + Vite + Leaflet)]</div>
            <div className="pl-4 text-slate-400">
              │── 1. Upload Defect Image / GPS Coordinates (HTML5 Geolocation)
              <br />
              │── 2. Preprocessing & Real-time Canvas Rendering
            </div>
            <div>[AI / COMPUTER VISION ENGINE (YOLOv8 + OpenCV)]</div>
            <div className="pl-4 text-slate-400">
              │── 3. Forward Pass: Bounding Box Localization [x, y, w, h]
              <br />
              │── 4. Classification: Pothole / Alligator / Longitudinal / Transverse Crack
              <br />
              │── 5. Confidence Score Calculation & Annotated Visual Output
            </div>
            <div>[MUNICIPAL INTELLIGENCE & HEURISTICS (FastAPI / Express)]</div>
            <div className="pl-4 text-slate-400">
              │── 6. Severity Index Evaluation (Defect Area Fraction & Class Matrix)
              <br />
              │── 7. Intelligent Prioritization: (0.50×Sev) + (0.30×Traffic) + (0.20×Risk)
              <br />
              │── 8. Spatial Duplicate Detection: Haversine distance &lt; 40 meters
              <br />
              │── 9. Engineering Recommendation Generator (Equipment & Cost Model)
            </div>
            <div>[PERSISTENCE & SECURITY LAYER (SQLite + SQLAlchemy)]</div>
            <div className="pl-4 text-slate-400">
              │── 10. Tables: users, road_reports, detections, maintenance_tasks,
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;maintenance_history, notifications, report_duplicates, repair_images
            </div>
            <div>[FIELD DISPATCH & QA VERIFICATION]</div>
            <div className="pl-4 text-slate-400">
              │── 11. Work Order Assignment to Maintenance Crew
              <br />
              │── 12. Before/After Field Evidence & Material Cost Audit
              <br />
              │── 13. Municipal Director Approval & In-App Notification Dispatch
              <br />
              │── 14. Downloadable PDF Audit Reports & Hotspot Clustering
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Technical Judge Q&A */}
      {activeTab === 'judge-qa' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>Technical Judge Questions & Defense Answers</span>
          </h3>

          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
              <h4 className="text-xs font-bold text-blue-400">
                Q1: How do you avoid false positives from asphalt shadows, dark tar lines, or wet leaves?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Answer:</strong> Our pipeline performs multi-scale luminance gradient and contour aspect ratio analysis. While surface water or shadows create flat luminance drops with smooth transitions, potholes have high edge gradient deltas on their perimeter due to depth shadows, combined with non-linear contours. Furthermore, in production deployment on the RDD2022 dataset, YOLOv8's CSPDarknet backbone extracts feature maps at three different receptive fields (P3, P4, P5), filtering out planar surface artifacts.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
              <h4 className="text-xs font-bold text-blue-400">
                Q2: How does your duplicate detection prevent merging two distinct potholes that are 10 meters apart?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Answer:</strong> We deliberately do not automatically delete or merge reports. Our Haversine algorithm calculates great-circle distance within a configurable threshold (30–50m). When candidate reports fall within this corridor, the system flags them as "Potential Linked Reports" in the admin dashboard and groups their duplicate counter, but retains both citizen records and photos until a municipal engineer verifies whether they are twin cavities or the same pothole.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
              <h4 className="text-xs font-bold text-blue-400">
                Q3: Why did you separate AI detection severity from final maintenance priority?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Answer:</strong> A deep pothole on an empty rural gravel road is high severity, but low priority. Conversely, a medium-sized pothole on a high-speed arterial road next to a bike lane poses an immediate risk to life. By factoring 50% Severity, 30% Traffic Exposure, and 20% Public Safety Risk, municipal funds are directed where the immediate public hazard is greatest.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
              <h4 className="text-xs font-bold text-blue-400">
                Q4: How does the application scale to thousands of reports during rainy seasons?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Answer:</strong> The FastAPI backend uses asynchronous endpoints (`async def`) and SQLite / PostgreSQL indexed on spatial coordinates (`lat`, `lng`, `priorityScore`). Map markers are rendered as dynamic clusters (DBSCAN / grid clustering) so the client only renders density clusters at higher zoom levels, preventing DOM overload.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Windows Setup & Running Instructions */}
      {activeTab === 'download' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Windows 10/11 Automated Execution Guide</span>
            </h3>
            <button
              onClick={handleDownloadZip}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span>Download ZIP Now</span>
            </button>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <p>
              The delivered <code>RoadGuard-AI.zip</code> is completely self-contained with Windows <code>setup.bat</code> and <code>start.bat</code> scripts.
            </p>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-2">
              <div className="text-slate-400"># STEP 1: Extract RoadGuard-AI.zip on Windows</div>
              <div className="text-emerald-400">cd C:\Users\YourName\Downloads\RoadGuard-AI</div>
              <div className="text-slate-400"># STEP 2: Run setup.bat (installs Python venv, backend & frontend dependencies, seeds DB)</div>
              <div className="text-emerald-400">setup.bat</div>
              <div className="text-slate-400"># STEP 3: Run start.bat (launches FastAPI backend on :8000 and React frontend on :3000)</div>
              <div className="text-emerald-400">start.bat</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-white">Preconfigured Demo Credentials:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-900">
                  <div className="text-[10px] uppercase font-bold text-blue-400">Citizen Role</div>
                  <div className="text-white font-mono mt-0.5">citizen@roadguard.ai</div>
                  <div className="text-slate-400 font-mono text-[10px]">pass: citizen123</div>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-900">
                  <div className="text-[10px] uppercase font-bold text-amber-400">Admin Role</div>
                  <div className="text-white font-mono mt-0.5">admin@roadguard.ai</div>
                  <div className="text-slate-400 font-mono text-[10px]">pass: admin123</div>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-900">
                  <div className="text-[10px] uppercase font-bold text-emerald-400">Maintenance Lead</div>
                  <div className="text-white font-mono mt-0.5">maintenance@roadguard.ai</div>
                  <div className="text-slate-400 font-mono text-[10px]">pass: maint123</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
