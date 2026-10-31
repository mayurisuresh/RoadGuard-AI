# RoadGuard AI - REST API Documentation

Base URL: `http://localhost:8000/api` (FastAPI) or integrated full-stack server.
Interactive Swagger OpenAPI Docs: `http://localhost:8000/docs`

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a new citizen, admin, or maintenance user.
- **Request Body**:
  ```json
  {
    "email": "citizen@roadguard.ai",
    "name": "Jane Citizen",
    "password": "securepassword",
    "role": "citizen"
  }
  ```
- **Response**: `200 OK` with created user object.

### `POST /api/auth/login`
Authenticates user and returns JWT bearer token.

---

## 2. AI Defect Detection Endpoint

### `POST /api/detect`
Performs genuine Computer Vision road defect detection on an uploaded image file.
- **Form Data**: `file` (Binary image - JPG, PNG, WEBP)
- **Response**:
  ```json
  {
    "boxes": [
      {
        "x": 0.28,
        "y": 0.36,
        "width": 0.44,
        "height": 0.38,
        "label": "Pothole",
        "confidence": 0.96
      }
    ],
    "defect_count": 1,
    "dominant_category": "Pothole",
    "confidence": 0.96,
    "processing_time_ms": 285,
    "annotated_image_url": "data:image/jpeg;base64,...",
    "inference_mode": "REAL_AI"
  }
  ```

---

## 3. Road Damage Reports Endpoints

### `GET /api/reports`
Lists reports with optional query filters:
- `?category=Pothole`
- `?status=Verified`
- `?severity=HIGH`

### `POST /api/reports`
Submits a new citizen damage report. Automatically calculates:
- Severity score from bounding box area
- Priority index from `(0.50*Sev + 0.30*Traffic + 0.20*Risk)`
- Duplicate proximity using Haversine formula (40m radius)

### `GET /api/reports/{id}`
Returns full report object with bounding boxes and status history.

### `PATCH /api/reports/{id}`
Updates status (`Verified`, `Assigned`, `In Progress`, `Repaired`, `Rejected`).

---

## 4. Geospatial & Map Endpoints

### `GET /api/map/reports`
Returns lightweight geoJSON-compatible array of all active defects for Leaflet markers.

### `GET /api/map/hotspots`
Returns distance-based density clusters with report counts and severity ratings.

---

## 5. Maintenance Task Endpoints

### `GET /api/maintenance/tasks`
Returns work orders assigned to field maintenance crews.

### `POST /api/maintenance/tasks`
Creates and dispatches a work order with instructions and due date.

### `POST /api/maintenance/tasks/{id}/images`
Submits Before & After repair evidence photos, materials used, and labor cost.

---

## 6. Analytics Endpoints

### `GET /api/dashboard/summary`
Returns live municipal KPIs:
```json
{
  "total_reports": 5,
  "total_potholes": 3,
  "total_cracks": 2,
  "critical_damage_reports": 3,
  "pending_maintenance": 3,
  "completed_repairs": 1,
  "average_priority_score": 73,
  "reports_submitted_today": 2
}
```
