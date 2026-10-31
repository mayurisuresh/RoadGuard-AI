import os
import io
import time
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from sqlalchemy.orm import Session

from .database import engine, Base, get_db
from . import models, schemas
from .services.priority import calculate_priority, detect_duplicates, calculate_haversine
from .ai.detector import run_ai_detection

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="RoadGuard AI Backend",
    description="Intelligent Road Defect Detection & Maintenance Prioritization API",
    version="2.4.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- AUTHENTICATION -----------------

@app.post("/api/auth/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = models.User(
        id=f"usr-{int(time.time())}",
        email=user.email,
        name=user.name,
        hashed_password=user.password, # In production bcrypt hashed
        role=user.role,
        department=user.department,
        phone=user.phone,
        avatar_url=user.avatar_url,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/auth/login")
def login(form_data: schemas.UserCreate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.email).first()
    if not user or user.hashed_password != form_data.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    return {
        "access_token": f"jwt-token-{user.id}",
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "department": user.department
        }
    }

@app.get("/api/auth/me")
def get_me(db: Session = Depends(get_db)):
    user = db.query(models.User).first()
    if not user:
        raise HTTPException(status_code=404, detail="No active session")
    return user

# ----------------- AI DETECTION -----------------

@app.post("/api/detect", response_model=schemas.DetectionResponse)
async def detect_road_damage(file: UploadFile = File(...)):
    contents = await file.read()
    detection_result = run_ai_detection(contents)
    return detection_result

@app.get("/api/detections/{report_id}")
def get_detections_by_report(report_id: str, db: Session = Depends(get_db)):
    dets = db.query(models.Detection).filter(models.Detection.report_id == report_id).all()
    return dets

# ----------------- ROAD REPORTS -----------------

@app.get("/api/reports", response_model=List[schemas.RoadReportResponse])
def get_reports(
    category: Optional[str] = None,
    status: Optional[str] = None,
    severity: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.RoadReport)
    if category:
        query = query.filter(models.RoadReport.category == category)
    if status:
        query = query.filter(models.RoadReport.status == status)
    if severity:
        query = query.filter(models.RoadReport.severity == severity)
    return query.order_by(models.RoadReport.priority_score.desc()).all()

@app.get("/api/reports/{id}", response_model=schemas.RoadReportResponse)
def get_report_by_id(id: str, db: Session = Depends(get_db)):
    report = db.query(models.RoadReport).filter(models.RoadReport.id == id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@app.post("/api/reports", response_model=schemas.RoadReportResponse)
def create_report(payload: schemas.RoadReportCreate, db: Session = Depends(get_db)):
    # Severity score calculation
    sev_map = {"Pothole": 85, "Alligator Crack": 75, "Transverse Crack": 50, "Longitudinal Crack": 45}
    severity_score = sev_map.get(payload.category, 50)
    severity_level = "HIGH" if severity_score >= 70 else ("MEDIUM" if severity_score >= 40 else "LOW")

    # Priority calculation
    prio = calculate_priority(severity_score, payload.traffic_exposure_score, payload.safety_risk_score)

    # Duplicate check
    existing = db.query(models.RoadReport).all()
    dup = detect_duplicates(payload.lat, payload.lng, payload.category, existing, 40.0)

    report_id = f"RG-{datetime.utcnow().year}-{int(time.time()) % 10000}"

    new_report = models.RoadReport(
        id=report_id,
        citizen_id="usr-citizen-1",
        citizen_name="Mayuri Suresh",
        title=payload.title,
        description=payload.description,
        image_url=payload.image_url,
        annotated_image_url=payload.annotated_image_url,
        lat=payload.lat,
        lng=payload.lng,
        address=payload.address,
        category=payload.category,
        severity=severity_level,
        severity_score=severity_score,
        traffic_exposure_score=payload.traffic_exposure_score,
        safety_risk_score=payload.safety_risk_score,
        priority_score=prio["score"],
        priority_tier=prio["tier"],
        priority_reason=prio["reason"],
        status="Pending Verification",
        duplicate_count=1 if dup["is_duplicate"] else 0,
    )
    db.add(new_report)

    # Add status history item
    hist = models.MaintenanceHistory(
        report_id=report_id,
        status="Pending Verification",
        updated_by="Mayuri Suresh",
        role="citizen",
        notes="Citizen uploaded defect with GPS coordinates.",
    )
    db.add(hist)

    # In-app notification
    notif = models.Notification(
        id=f"notif-{int(time.time())}",
        user_id="all",
        role_target="admin",
        title=f"New {payload.category} Reported",
        message=f"Defect at {payload.address} logged with priority {prio['score']} ({prio['tier']}).",
        report_id=report_id,
        type="alert" if prio["tier"] == "CRITICAL" else "info"
    )
    db.add(notif)

    db.commit()
    db.refresh(new_report)
    return new_report

@app.patch("/api/reports/{id}", response_model=schemas.RoadReportResponse)
def update_report(id: str, payload: schemas.RoadReportUpdate, db: Session = Depends(get_db)):
    report = db.query(models.RoadReport).filter(models.RoadReport.id == id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if payload.status:
        report.status = payload.status
        hist = models.MaintenanceHistory(
            report_id=id,
            status=payload.status,
            updated_by="Director Marcus Vance",
            role="admin",
            notes=payload.notes or f"Status updated to {payload.status}",
        )
        db.add(hist)

    if payload.priority_score is not None:
        report.priority_score = payload.priority_score

    db.commit()
    db.refresh(report)
    return report

# ----------------- MAP & HOTSPOTS -----------------

@app.get("/api/map/reports")
def get_map_reports(db: Session = Depends(get_db)):
    reports = db.query(models.RoadReport).all()
    return [
        {
            "id": r.id,
            "title": r.title,
            "lat": r.lat,
            "lng": r.lng,
            "category": r.category,
            "severity": r.severity,
            "priority_score": r.priority_score,
            "priority_tier": r.priority_tier,
            "status": r.status,
            "address": r.address
        }
        for r in reports
    ]

@app.get("/api/map/hotspots")
def get_hotspots(radius_meters: float = 160.0, db: Session = Depends(get_db)):
    reports = db.query(models.RoadReport).all()
    clusters = []
    visited = set()

    for i, r1 in enumerate(reports):
        if r1.id in visited:
            continue
        cluster_members = [r1]
        visited.add(r1.id)

        for j in range(i + 1, len(reports)):
            r2 = reports[j]
            if r2.id in visited:
                continue
            if calculate_haversine(r1.lat, r1.lng, r2.lat, r2.lng) <= radius_meters:
                cluster_members.append(r2)
                visited.add(r2.id)

        avg_lat = sum(m.lat for m in cluster_members) / len(cluster_members)
        avg_lng = sum(m.lng for m in cluster_members) / len(cluster_members)
        avg_priority = int(sum(m.priority_score for m in cluster_members) / len(cluster_members))

        clusters.append({
            "id": f"cluster-{len(clusters)+1}",
            "lat": round(avg_lat, 6),
            "lng": round(avg_lng, 6),
            "report_count": len(cluster_members),
            "avg_priority": avg_priority,
            "severity": "CRITICAL" if avg_priority >= 75 else "HIGH",
            "report_ids": [m.id for m in cluster_members]
        })

    return clusters

# ----------------- MAINTENANCE TASKS -----------------

@app.get("/api/maintenance/tasks")
def get_maintenance_tasks(db: Session = Depends(get_db)):
    return db.query(models.MaintenanceTask).all()

@app.post("/api/maintenance/tasks")
def create_maintenance_task(payload: schemas.MaintenanceTaskCreate, db: Session = Depends(get_db)):
    report = db.query(models.RoadReport).filter(models.RoadReport.id == payload.report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    task = models.MaintenanceTask(
        id=f"task-{int(time.time()) % 10000}",
        report_id=payload.report_id,
        status="Assigned",
        assigned_worker_id=payload.assigned_worker_id,
        assigned_worker_name="Alex Rivera (Crew Lead)",
        instructions=payload.instructions,
        target_completion_date=payload.target_completion_date,
    )
    report.status = "Assigned"
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@app.post("/api/maintenance/tasks/{id}/images")
def submit_repair_verification(
    id: str,
    payload: schemas.RepairVerificationCreate,
    db: Session = Depends(get_db)
):
    task = db.query(models.MaintenanceTask).filter(models.MaintenanceTask.id == id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    report = db.query(models.RoadReport).filter(models.RoadReport.id == task.report_id).first()
    
    repair = models.RepairImage(
        report_id=task.report_id,
        worker_id=task.assigned_worker_id,
        worker_name=task.assigned_worker_name,
        before_image_url=payload.before_image_url,
        after_image_url=payload.after_image_url,
        repair_notes=payload.repair_notes,
        materials_used=payload.materials_used,
        cost_usd=payload.cost_usd,
        admin_approval_status="Pending Review"
    )
    db.add(repair)
    task.status = "In Progress"
    if report:
        report.status = "In Progress"
    
    db.commit()
    return {"message": "Repair verification submitted for QA", "task_id": id}

# ----------------- DASHBOARD & ANALYTICS -----------------

@app.get("/api/dashboard/summary", response_model=schemas.DashboardSummarySchema)
def get_dashboard_summary(db: Session = Depends(get_db)):
    reports = db.query(models.RoadReport).all()
    total = len(reports)
    potholes = len([r for r in reports if r.category == "Pothole"])
    cracks = len([r for r in reports if "Crack" in r.category])
    critical = len([r for r in reports if r.priority_tier == "CRITICAL"])
    pending = len([r for r in reports if r.status in ["Pending Verification", "Verified", "Assigned"]])
    repaired = len([r for r in reports if r.status == "Repaired"])
    avg_score = int(sum(r.priority_score for r in reports) / total) if total else 0

    return {
        "total_reports": total,
        "total_potholes": potholes,
        "total_cracks": cracks,
        "critical_damage_reports": critical,
        "pending_maintenance": pending,
        "completed_repairs": repaired,
        "average_priority_score": avg_score,
        "reports_submitted_today": min(total, 3)
    }

# ----------------- NOTIFICATIONS -----------------

@app.get("/api/notifications")
def get_notifications(db: Session = Depends(get_db)):
    return db.query(models.Notification).order_by(models.Notification.created_at.desc()).all()

@app.patch("/api/notifications/{id}/read")
def mark_notification_read(id: str, db: Session = Depends(get_db)):
    notif = db.query(models.Notification).filter(models.Notification.id == id).first()
    if notif:
        notif.read = True
        db.commit()
    return {"status": "ok"}
