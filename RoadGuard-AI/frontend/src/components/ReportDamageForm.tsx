import React, { useState } from 'react';
import { User, DefectCategory, RoadReport, ReportStatus } from '../types';
import { runRoadDamageInference, VisionDetectionResult } from '../utils/aiDetector';
import { analyzeDamageSeverity } from '../utils/severity';
import { calculatePriorityScore } from '../utils/priority';
import { detectDuplicateReport } from '../utils/haversine';
import { SAMPLE_TEST_IMAGES, SampleTestImage } from '../data/seedData';
import { AIDetectionVisualizer } from './AIDetectionVisualizer';
import {
  Upload,
  Camera,
  MapPin,
  Crosshair,
  Sparkles,
  AlertTriangle,
  Send,
  Loader2,
  CheckCircle2,
  HelpCircle,
  FileCheck,
} from 'lucide-react';

interface ReportDamageFormProps {
  currentUser: User;
  existingReports: RoadReport[];
  onSubmitReport: (newReport: RoadReport) => void;
  onCancel?: () => void;
}

export const ReportDamageForm: React.FC<ReportDamageFormProps> = ({
  currentUser,
  existingReports,
  onSubmitReport,
  onCancel,
}) => {
  // Step workflow: 1: Image & AI Analysis, 2: Location & Details, 3: Confirmation
  const [step, setStep] = useState<number>(1);

  // Image & Detection State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [detectionResult, setDetectionResult] = useState<VisionDetectionResult | null>(null);

  // Form Details
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [address, setAddress] = useState<string>('Market St & 5th St, San Francisco, CA');
  const [lat, setLat] = useState<number>(37.7812);
  const [lng, setLng] = useState<number>(-122.4089);
  const [trafficExposure, setTrafficExposure] = useState<number>(75);
  const [safetyRisk, setSafetyRisk] = useState<number>(80);

  // Duplicate Check State
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load a sample image for quick testing
  const handleSelectSample = async (sample: SampleTestImage) => {
    setImageUrl(sample.thumbnailUrl);
    setTitle(`${sample.name} near ${sample.address.split(',')[0]}`);
    setDescription(sample.description);
    setAddress(sample.address);
    setLat(sample.lat);
    setLng(sample.lng);
    await triggerInference(sample.thumbnailUrl);
  };

  // Handle local file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (.jpg, .png, .webp)');
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      alert('File size exceeds 12MB limit.');
      return;
    }

    setSelectedFile(file);
    const localUrl = URL.createObjectURL(file);
    setImageUrl(localUrl);
    setTitle(`Road Defect at ${address.split(',')[0]}`);
    await triggerInference(file);
  };

  const triggerInference = async (imgSource: string | File) => {
    setIsAnalyzing(true);
    setDetectionResult(null);
    try {
      const result = await runRoadDamageInference(imgSource);
      setDetectionResult(result);

      // Perform duplicate check against existing reports
      const dupCheck = detectDuplicateReport(
        { lat, lng, category: result.dominantCategory },
        existingReports.map((r) => ({ id: r.id, lat: r.lat, lng: r.lng, category: r.category })),
        45
      );

      if (dupCheck.isDuplicate) {
        setDuplicateWarning(
          `Notice: An existing report (${dupCheck.matchedReportId}) is located within ${dupCheck.distanceMeters.toFixed(0)}m of this point. Your submission will be linked to prevent duplicate road closure orders.`
        );
      } else {
        setDuplicateWarning(null);
      }
    } catch (err) {
      console.error('AI Inference error:', err);
      alert('Failed to analyze image with AI model: ' + err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCaptureLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(parseFloat(pos.coords.latitude.toFixed(6)));
          setLng(parseFloat(pos.coords.longitude.toFixed(6)));
          setAddress(`GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)} (Current Location)`);
        },
        (err) => {
          alert('Could not retrieve GPS coordinates automatically. You can enter coordinates or address manually.');
        }
      );
    }
  };

  // Severity & Priority calculation
  const severityAnalysis = detectionResult
    ? analyzeDamageSeverity(detectionResult.boxes)
    : { level: 'MEDIUM' as const, severityScore: 50, explanation: '' };

  const priorityResult = calculatePriorityScore(
    severityAnalysis.severityScore,
    trafficExposure,
    safetyRisk
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl || !detectionResult) {
      alert('Please upload a road image and allow AI detection to complete.');
      return;
    }

    setIsSubmitting(true);
    const reportId = `RG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newReport: RoadReport = {
      id: reportId,
      citizenId: currentUser.id,
      citizenName: currentUser.name,
      title: title || `${detectionResult.dominantCategory} on ${address.split(',')[0]}`,
      description: description || `Reported ${detectionResult.dominantCategory} with estimated severity score of ${severityAnalysis.severityScore}/100.`,
      imageUrl: imageUrl,
      annotatedImageUrl: detectionResult.annotatedDataUrl,
      lat,
      lng,
      address,
      category: detectionResult.dominantCategory,
      severity: severityAnalysis.level,
      severityScore: severityAnalysis.severityScore,
      trafficExposureScore: trafficExposure,
      safetyRiskScore: safetyRisk,
      priorityScore: priorityResult.score,
      priorityTier: priorityResult.tier,
      priorityReason: priorityResult.reason,
      status: 'Pending Verification',
      statusHistory: [
        {
          id: `sh-${Date.now()}`,
          status: 'Pending Verification',
          updatedBy: currentUser.name,
          role: currentUser.role,
          timestamp: new Date().toISOString(),
          notes: 'Submitted via citizen rapid-report module with AI verification.',
        },
      ],
      detections: detectionResult.boxes.map((b, i) => ({
        id: `box-${i}`,
        ...b,
      })),
      duplicateCount: duplicateWarning ? 1 : 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitReport(newReport);
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-900 border border-blue-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>AI Automated Defect Ingestion</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">Report Road Surface Damage</h2>
          <p className="text-xs text-slate-400 mt-1">
            Upload road defect images for real-time YOLOv8 neural detection, severity analysis, and priority calculation.
          </p>
        </div>

        {/* Quick Sample Test Selectors */}
        <div className="flex flex-col items-start md:items-end">
          <span className="text-[11px] font-mono text-slate-400 mb-1">
            One-Click Benchmark Samples:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_TEST_IMAGES.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white border border-slate-700 transition"
              >
                {sample.expectedClass}
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Image Upload & Real-Time Computer Vision Detection */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-400" />
              <span>Step 1: Upload or Capture Road Damage Image</span>
            </h3>
            {detectionResult && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                AI Inference Complete
              </span>
            )}
          </div>

          {/* Upload Dropzone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-950/60 hover:bg-blue-500/5 transition text-center group">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-110 transition">
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-200">
                Click to upload local road photo
              </span>
              <span className="text-[11px] text-slate-500 mt-1">
                Supports JPG, PNG, WEBP up to 12MB
              </span>
            </label>

            {/* Quick Sample Selector Card */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300">
                  Select a Real Field Test Photo:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {SAMPLE_TEST_IMAGES.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleSelectSample(sample)}
                      className="p-2 rounded-lg border border-slate-800 hover:border-blue-500 bg-slate-900 flex items-center gap-2 text-left transition group"
                    >
                      <img
                        src={sample.thumbnailUrl}
                        alt={sample.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div className="overflow-hidden">
                        <div className="text-[11px] font-bold text-slate-200 truncate group-hover:text-blue-400">
                          {sample.expectedClass}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {sample.name}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Inference Progress Spinner */}
          {isAnalyzing && (
            <div className="p-8 rounded-xl bg-slate-950/90 border border-blue-500/30 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              <div className="text-sm font-bold text-white">
                Running YOLOv8 Road Defect Neural Inference...
              </div>
              <p className="text-xs text-slate-400 max-w-sm">
                Extracting pixel luminance, dark cavity gradients, and multi-scale defect bounding boxes.
              </p>
            </div>
          )}

          {/* AI Detection Visualizer when ready */}
          {detectionResult && imageUrl && !isAnalyzing && (
            <div className="pt-2">
              <AIDetectionVisualizer
                originalImageUrl={imageUrl}
                annotatedImageUrl={detectionResult.annotatedDataUrl}
                boxes={detectionResult.boxes}
                dominantCategory={detectionResult.dominantCategory}
                confidence={detectionResult.confidence}
                processingTimeMs={detectionResult.processingTimeMs}
                inferenceMode={detectionResult.inferenceMode}
                severityLevel={severityAnalysis.level}
                severityScore={severityAnalysis.severityScore}
                priority={priorityResult}
                trafficExposure={trafficExposure}
                safetyRisk={safetyRisk}
                onTrafficChange={(val) => setTrafficExposure(val)}
                onSafetyChange={(val) => setSafetyRisk(val)}
              />
            </div>
          )}
        </div>

        {/* Step 2: Location, Geocoding, and Metadata */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>Step 2: Location & Defect Details</span>
            </h3>
            <button
              type="button"
              onClick={handleCaptureLocation}
              className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Capture GPS Coordinates</span>
            </button>
          </div>

          {/* Duplicate Warning Alert if within 40m */}
          {duplicateWarning && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
              <div className="space-y-1">
                <div className="font-bold">Possible Nearby Damage Report Detected</div>
                <p className="opacity-90">{duplicateWarning}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Report Title / Landmark
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Dangerous Pothole near Crosswalk"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Street Address / Intersection
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 845 Market St, San Francisco, CA"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Latitude (WGS84)
              </label>
              <input
                type="number"
                step="0.000001"
                value={lat}
                onChange={(e) => setLat(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Longitude (WGS84)
              </label>
              <input
                type="number"
                step="0.000001"
                value={lng}
                onChange={(e) => setLng(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Hazard Description & Citizen Notes
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe surface condition, depth, proximity to bike lanes or pedestrian crossings..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Submit Action Bar */}
        <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
          )}

          <div className="flex items-center gap-3 ml-auto">
            <span className="text-xs text-slate-400 hidden sm:inline">
              Calculated Priority: <strong className="text-white">{priorityResult.score}/100 ({priorityResult.tier})</strong>
            </span>
            <button
              type="submit"
              disabled={isSubmitting || !detectionResult}
              className={`px-6 py-3 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg ${
                isSubmitting || !detectionResult
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 hover:scale-[1.02]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting to Municipal Database...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Defect Report & Issue Tracking ID</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
