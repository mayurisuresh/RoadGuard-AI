import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { RoadReport, DefectCategory, SeverityLevel, ReportStatus } from '../types';
import { clusterHotspots, HotspotCluster } from '../utils/haversine';
import { Layers, Crosshair, AlertTriangle, ShieldCheck, Clock, MapPin, Eye } from 'lucide-react';

interface DamageMapProps {
  reports: RoadReport[];
  selectedReport?: RoadReport | null;
  onSelectReport?: (report: RoadReport) => void;
  showHotspots?: boolean;
  allowCoordinatePick?: boolean;
  onPickCoordinate?: (lat: number, lng: number) => void;
  pickedCoordinate?: { lat: number; lng: number } | null;
  heightClass?: string;
}

export const DamageMap: React.FC<DamageMapProps> = ({
  reports,
  selectedReport,
  onSelectReport,
  showHotspots = true,
  allowCoordinatePick = false,
  onPickCoordinate,
  pickedCoordinate,
  heightClass = 'h-[500px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const hotspotsLayerRef = useRef<L.LayerGroup | null>(null);
  const pickedMarkerRef = useRef<L.Marker | null>(null);

  // Filters
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [hotspotClusters, setHotspotClusters] = useState<HotspotCluster[]>([]);
  const [activeHotspotOverlay, setActiveHotspotOverlay] = useState<boolean>(showHotspots);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center San Francisco Downtown
    const initialCenter: [number, number] = [37.7812, -122.4089];
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 14,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Standard OpenStreetMap free public tiles (No API key needed)
    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: ['a', 'b', 'c'],
        maxZoom: 19,
      }
    ).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    hotspotsLayerRef.current = L.layerGroup().addTo(map);

    if (allowCoordinatePick && onPickCoordinate) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        onPickCoordinate(e.latlng.lat, e.latlng.lng);
      });
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Picked Marker if in coordinate picking mode
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (pickedCoordinate) {
      if (pickedMarkerRef.current) {
        pickedMarkerRef.current.setLatLng([pickedCoordinate.lat, pickedCoordinate.lng]);
      } else {
        const pinIcon = L.divIcon({
          className: 'custom-picked-pin',
          html: `
            <div class="relative flex items-center justify-center w-8 h-8">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <div class="relative inline-flex items-center justify-center rounded-full w-8 h-8 bg-blue-600 text-white shadow-lg border-2 border-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });

        pickedMarkerRef.current = L.marker([pickedCoordinate.lat, pickedCoordinate.lng], {
          icon: pinIcon,
          draggable: true,
        }).addTo(mapInstanceRef.current);

        pickedMarkerRef.current.on('dragend', (e) => {
          const latlng = e.target.getLatLng();
          if (onPickCoordinate) {
            onPickCoordinate(latlng.lat, latlng.lng);
          }
        });
      }
    } else if (pickedMarkerRef.current) {
      pickedMarkerRef.current.remove();
      pickedMarkerRef.current = null;
    }
  }, [pickedCoordinate]);

  // Compute Clusters
  useEffect(() => {
    const clusterData = clusterHotspots(
      reports.map((r) => ({
        id: r.id,
        lat: r.lat,
        lng: r.lng,
        priorityScore: r.priorityScore,
        severity: r.severity,
      })),
      160
    );
    setHotspotClusters(clusterData);
  }, [reports]);

  // Render Markers & Hotspots
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !hotspotsLayerRef.current)
      return;

    markersLayerRef.current.clearLayers();
    hotspotsLayerRef.current.clearLayers();

    // Filter reports
    const filtered = reports.filter((r) => {
      if (filterCategory !== 'all' && r.category !== filterCategory) return false;
      if (filterSeverity !== 'all' && r.severity !== filterSeverity) return false;
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;
      return true;
    });

    // Render Hotspots if active
    if (activeHotspotOverlay) {
      hotspotClusters.forEach((cluster) => {
        const color =
          cluster.severity === 'CRITICAL'
            ? '#ef4444'
            : cluster.severity === 'HIGH'
            ? '#f97316'
            : '#eab308';

        const circle = L.circle([cluster.lat, cluster.lng], {
          radius: cluster.radiusMeters,
          color,
          fillColor: color,
          fillOpacity: 0.16,
          weight: 2,
          dashArray: '4, 4',
        });

        circle.bindTooltip(
          `<strong>Hotspot Cluster (${cluster.reportCount} reports)</strong><br/>Avg Priority: ${cluster.avgPriority}/100<br/>Status: ${cluster.severity}`,
          { direction: 'top', className: 'glass-tooltip' }
        );

        hotspotsLayerRef.current?.addLayer(circle);
      });
    }

    // Render Individual Damage Markers
    filtered.forEach((report) => {
      // Color-coding rule:
      // Red = Critical, Orange = High, Yellow = Medium, Green = Low
      const markerColor =
        report.priorityTier === 'CRITICAL'
          ? '#ef4444'
          : report.priorityTier === 'HIGH'
          ? '#f97316'
          : report.priorityTier === 'MEDIUM'
          ? '#eab308'
          : '#10b981';

      const customIcon = L.divIcon({
        className: 'custom-damage-pin',
        html: `
          <div class="relative group cursor-pointer" title="${report.title}">
            <div class="w-7 h-7 rounded-full flex items-center justify-center text-white shadow-md border-2 border-white transition-transform hover:scale-125" style="background-color: ${markerColor};">
              <span class="text-[10px] font-bold">${report.priorityScore}</span>
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([report.lat, report.lng], { icon: customIcon });

      const popupContent = `
        <div class="p-2 min-w-[210px] font-sans">
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase" style="background-color: ${markerColor}">
              ${report.priorityTier} (${report.priorityScore})
            </span>
            <span class="text-[11px] font-mono text-slate-500">${report.id}</span>
          </div>
          <h4 class="font-bold text-slate-900 text-xs leading-snug mb-1">${report.title}</h4>
          <p class="text-[11px] text-slate-500 flex items-center gap-1 mb-2">
            <span>📍</span> ${report.address}
          </p>
          <div class="text-[11px] bg-slate-100 p-1.5 rounded flex justify-between mb-2">
            <span class="text-slate-600">Status:</span>
            <strong class="text-slate-800">${report.status}</strong>
          </div>
          <button id="btn-inspect-${report.id}" class="w-full py-1 text-center bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-sm transition">
            Inspect Defect Details
          </button>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 260 });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-inspect-${report.id}`);
        if (btn && onSelectReport) {
          btn.onclick = () => {
            onSelectReport(report);
            marker.closePopup();
          };
        }
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [reports, filterCategory, filterSeverity, filterStatus, activeHotspotOverlay, hotspotClusters]);

  // Center on selected report if specified
  useEffect(() => {
    if (selectedReport && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedReport.lat, selectedReport.lng], 16, {
        duration: 0.8,
      });
    }
  }, [selectedReport]);

  const handleLocateMe = () => {
    if (navigator.geolocation && mapInstanceRef.current) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          mapInstanceRef.current?.flyTo([lat, lng], 16);
          if (onPickCoordinate) {
            onPickCoordinate(lat, lng);
          }
        },
        (err) => {
          // Fallback to default
          console.warn('Geolocation denied or unavailable:', err);
        }
      );
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-slate-900 shadow-xl">
      {/* Top Filter Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/60 shadow-lg">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold pr-2 border-r border-slate-700">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Map Filters</span>
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs bg-slate-800/90 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="Pothole">Potholes</option>
            <option value="Longitudinal Crack">Longitudinal Cracks</option>
            <option value="Transverse Crack">Transverse Cracks</option>
            <option value="Alligator Crack">Alligator Cracks</option>
          </select>

          {/* Severity Filter */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="text-xs bg-slate-800/90 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Severities</option>
            <option value="HIGH">High Severity</option>
            <option value="MEDIUM">Medium Severity</option>
            <option value="LOW">Low Severity</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs bg-slate-800/90 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="Pending Verification">Pending</option>
            <option value="Verified">Verified</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Repaired">Repaired</option>
          </select>

          {/* Hotspots Toggle */}
          <button
            onClick={() => setActiveHotspotOverlay(!activeHotspotOverlay)}
            className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition flex items-center gap-1.5 ${
              activeHotspotOverlay
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>Hotspot Clusters ({hotspotClusters.length})</span>
          </button>
        </div>

        {/* Locate Me Button */}
        <div className="pointer-events-auto">
          <button
            onClick={handleLocateMe}
            title="Locate my position"
            className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/60 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white shadow-lg transition"
          >
            <Crosshair className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>Locate Me</span>
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div ref={mapContainerRef} className={`w-full ${heightClass} z-0`} />

      {/* Legend Card Bottom Left */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md px-3 py-2.5 rounded-xl border border-slate-700/60 text-[11px] text-slate-300 shadow-xl flex items-center gap-3">
        <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Priority Index:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/30"></span>
          <span>Critical (80+)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>High (60-79)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
          <span>Med (35-59)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Low (&lt;35)</span>
        </div>
      </div>
    </div>
  );
};
