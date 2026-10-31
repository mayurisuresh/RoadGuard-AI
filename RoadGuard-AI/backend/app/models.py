from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="citizen") # citizen, admin, maintenance
    department = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    reports = relationship("RoadReport", back_populates="citizen")
    assigned_tasks = relationship("MaintenanceTask", back_populates="assigned_worker")

class RoadReport(Base):
    __tablename__ = "road_reports"

    id = Column(String, primary_key=True, index=True) # RG-2026-XXXX
    citizen_id = Column(String, ForeignKey("users.id"), nullable=False)
    citizen_name = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String, nullable=False)
    annotated_image_url = Column(String, nullable=True)
    lat = Column(Float, nullable=False, index=True)
    lng = Column(Float, nullable=False, index=True)
    address = Column(String, nullable=False)
    category = Column(String, nullable=False) # Pothole, Longitudinal Crack, Transverse Crack, Alligator Crack
    severity = Column(String, nullable=False) # LOW, MEDIUM, HIGH
    severity_score = Column(Integer, default=50) # 0..100
    traffic_exposure_score = Column(Integer, default=50) # 0..100
    safety_risk_score = Column(Integer, default=50) # 0..100
    priority_score = Column(Integer, default=50) # 0..100
    priority_tier = Column(String, default="MEDIUM") # CRITICAL, HIGH, MEDIUM, LOW
    priority_reason = Column(Text, nullable=True)
    status = Column(String, default="Pending Verification") # Pending Verification, Verified, Assigned, In Progress, Repaired, Rejected
    duplicate_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    citizen = relationship("User", back_populates="reports")
    detections = relationship("Detection", back_populates="report", cascade="all, delete-orphan")
    tasks = relationship("MaintenanceTask", back_populates="report", cascade="all, delete-orphan")
    history = relationship("MaintenanceHistory", back_populates="report", cascade="all, delete-orphan")
    duplicates = relationship("ReportDuplicate", foreign_keys="ReportDuplicate.report_id", back_populates="report")
    repair_images = relationship("RepairImage", back_populates="report", cascade="all, delete-orphan")

class Detection(Base):
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, autoincrement=True)
    report_id = Column(String, ForeignKey("road_reports.id"), nullable=False)
    label = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    x = Column(Float, nullable=False)
    y = Column(Float, nullable=False)
    width = Column(Float, nullable=False)
    height = Column(Float, nullable=False)
    model_version = Column(String, default="yolov8-rdd2022")
    created_at = Column(DateTime, default=datetime.utcnow)

    report = relationship("RoadReport", back_populates="detections")

class MaintenanceTask(Base):
    __tablename__ = "maintenance_tasks"

    id = Column(String, primary_key=True, index=True)
    report_id = Column(String, ForeignKey("road_reports.id"), nullable=False)
    status = Column(String, default="Assigned") # Assigned, In Progress, Repaired
    assigned_worker_id = Column(String, ForeignKey("users.id"), nullable=False)
    assigned_worker_name = Column(String, nullable=False)
    instructions = Column(Text, nullable=True)
    target_completion_date = Column(String, nullable=True)
    materials_used = Column(Text, nullable=True)
    cost_usd = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    report = relationship("RoadReport", back_populates="tasks")
    assigned_worker = relationship("User", back_populates="assigned_tasks")

class MaintenanceHistory(Base):
    __tablename__ = "maintenance_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    report_id = Column(String, ForeignKey("road_reports.id"), nullable=False)
    status = Column(String, nullable=False)
    updated_by = Column(String, nullable=False)
    role = Column(String, nullable=False)
    notes = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    report = relationship("RoadReport", back_populates="history")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=False, default="all")
    role_target = Column(String, nullable=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    report_id = Column(String, nullable=True)
    type = Column(String, default="info")
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class ReportDuplicate(Base):
    __tablename__ = "report_duplicates"

    id = Column(Integer, primary_key=True, autoincrement=True)
    report_id = Column(String, ForeignKey("road_reports.id"), nullable=False)
    duplicate_report_id = Column(String, nullable=False)
    distance_meters = Column(Float, nullable=False)
    verified_by_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    report = relationship("RoadReport", foreign_keys=[report_id], back_populates="duplicates")

class RepairImage(Base):
    __tablename__ = "repair_images"

    id = Column(Integer, primary_key=True, autoincrement=True)
    report_id = Column(String, ForeignKey("road_reports.id"), nullable=False)
    worker_id = Column(String, ForeignKey("users.id"), nullable=False)
    worker_name = Column(String, nullable=False)
    before_image_url = Column(String, nullable=False)
    after_image_url = Column(String, nullable=False)
    repair_notes = Column(Text, nullable=True)
    materials_used = Column(Text, nullable=True)
    cost_usd = Column(Float, default=0.0)
    admin_approval_status = Column(String, default="Pending Review")
    admin_feedback = Column(Text, nullable=True)
    completed_at = Column(DateTime, default=datetime.utcnow)

    report = relationship("RoadReport", back_populates="repair_images")
