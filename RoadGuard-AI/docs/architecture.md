# RoadGuard AI - System Architecture

## 1. System Overview

RoadGuard AI is designed as a modular, decoupled full-stack platform consisting of:

1. **Client Tier**:
   - Modern React SPA built with Vite
   - Tailwind CSS for responsive styling
   - Leaflet.js with OpenStreetMap for mapping and cluster density visualization
   - jsPDF for generating ASTM-compliant municipal damage reports
   - Canvas-based edge detection and bounding box visual overlays

2. **Application Tier**:
   - Python FastAPI REST server
   - High-throughput asynchronous endpoints (`uvicorn`)
   - Bounding box and defect feature extraction service
   - Priority scoring engine: `(0.50 * Sev) + (0.30 * Traffic) + (0.20 * Risk)`
   - Spatial duplicate detector (Haversine distance filter, 40m radius)

3. **Data Tier**:
   - SQLite relational database with SQLAlchemy ORM
   - 8 core tables: `users`, `road_reports`, `detections`, `maintenance_tasks`, `maintenance_history`, `notifications`, `report_duplicates`, `repair_images`

---

## 2. Component Diagram

```
+-----------------------------------------------------------+
|                      React SPA Client                     |
|  - AIDetectionVisualizer  - DamageMap (Leaflet)           |
|  - AnalyticsDashboard     - BeforeAfterModal (QA)         |
|  - CitizenTrackingView    - MaintenanceTasksView          |
+-----------------------------+-----------------------------+
                              | REST JSON / Multipart
                              v
+-----------------------------------------------------------+
|                   FastAPI Application Tier                |
|  - /api/detect (Computer Vision feature extraction)       |
|  - /api/reports (CRUD, Severity & Priority calculation)   |
|  - /api/maintenance (Work orders & Before/After QA)      |
|  - /api/map/hotspots (Spatial clustering)                 |
+-----------------------------+-----------------------------+
                              | SQLAlchemy
                              v
+-----------------------------------------------------------+
|                     SQLite Database                       |
|  - roadguard.db (Indexed on lat, lng, priority_score)     |
+-----------------------------------------------------------+
```
