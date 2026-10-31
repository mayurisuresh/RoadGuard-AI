# RoadGuard AI
### AI-Powered Road Surface Defect Detection & Intelligent Maintenance Prioritization System

RoadGuard AI is a smart-city civic technology platform connecting citizens, artificial intelligence computer vision detection, municipal transportation engineers, and field maintenance crews.

---

## ⚡ Quick Start on Windows 10/11

1. **Extract ZIP** to a local directory (e.g., `C:\RoadGuard-AI`).
2. **Double-click `setup.bat`** (or run in VS Code Terminal).
   - Verifies Python 3.10+ and Node.js 18+.
   - Creates a Python virtual environment in `backend/venv`.
   - Installs backend dependencies (`fastapi`, `uvicorn`, `sqlalchemy`, `pillow`, `numpy`).
   - Seeds the SQLite database (`roadguard.db`) with real benchmark defect data.
   - Installs frontend React dependencies.
3. **Double-click `start.bat`**.
   - Launches the FastAPI backend on `http://127.0.0.1:8000`.
   - Launches the React Vite frontend on `http://localhost:3000`.
   - Automatically opens Google Chrome.

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **Municipal Admin** | `admin@roadguard.ai` | `admin123` | Command Center, QA Verification, Hotspot Clusters, Work Order Dispatch, PDF Reports |
| **Citizen Reporter** | `citizen@roadguard.ai` | `citizen123` | AI Defect Camera, GPS Geolocation, Complaint Tracking, Duplicate Alert |
| **Maintenance Lead** | `maintenance@roadguard.ai` | `maint123` | Field Work Orders, Before/After Repair Photo QA, Material Cost Logging |

---

## 🧠 Real AI/ML Implementation Details

- **Supported Defect Classes**:
  1. `Pothole` (Cavities & deep surface breaks)
  2. `Alligator Crack` (Fatigue structural interconnected polygons)
  3. `Longitudinal Crack` (Linear wheelpath joint separation)
  4. `Transverse Crack` (Perpendicular thermal contraction cracks)
- **Computer Vision Pipeline**:
  - Image luminance gradient analysis & edge extraction.
  - Multi-scale localized defect bounding box localization `[x, y, width, height]`.
  - Confidence calculation & high-visibility bounding box annotation.
  - Zero-latency client-side and server-side execution.
  - Benchmark sample loader for instant one-click testing without local test files.

---

## 📐 Mathematical Formulation

### Intelligent Priority Scoring Formula:
$$\text{Priority Index} = (0.50 \times \text{Severity}) + (0.30 \times \text{Traffic Exposure}) + (0.20 \times \text{Safety Risk})$$

- **80 – 100**: `CRITICAL` (Dispatch emergency patch within 24 hours)
- **60 – 79**: `HIGH` (Expedited repair within 48–72 hours)
- **35 – 59**: `MEDIUM` (Scheduled municipal batch maintenance)
- **0 – 34**: `LOW` (Routine preventative seal coating)

### Geospatial Duplicate Detection:
Calculates great-circle distance using the **Haversine Formula**:
$$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$
When a candidate defect is submitted within a configurable 40-meter radius of an existing defect of similar class, the system flags it as a duplicate, preventing duplicate road closures.

---

## 📁 Repository Structure

```
RoadGuard-AI/
├── frontend/             # React.js SPA, Vite, Tailwind CSS, Leaflet, jsPDF
│   ├── src/
│   │   ├── components/   # Visualizer, Map, Dashboard, Before/After Modal
│   │   ├── utils/        # AI detector, Priority formula, Haversine, PDF
│   │   └── App.tsx       # State management and workflow orchestration
├── backend/              # Python FastAPI REST API
│   ├── app/
│   │   ├── main.py       # FastAPI router and API endpoints
│   │   ├── models.py     # SQLAlchemy ORM (8 core database tables)
│   │   ├── database.py   # SQLite connection engine
│   │   └── ai/           # Computer vision defect detector
│   ├── seed.py           # Benchmark database seeder
│   └── requirements.txt  # Python package dependencies
├── docs/                 # Architecture diagrams and API reference
├── setup.bat             # 1-Click Windows Setup
├── start.bat             # 1-Click Dual Windows Launcher
└── README.md             # This document
```
