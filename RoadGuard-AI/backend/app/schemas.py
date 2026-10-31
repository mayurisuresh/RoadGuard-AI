from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class UserBase(BaseModel):
    email: str
    name: str
    role: str = "citizen"
    department: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class DetectionBoxSchema(BaseModel):
    x: float
    y: float
    width: float
    height: float
    label: str
    confidence: float

class DetectionResponse(BaseModel):
    report_id: Optional[str] = None
    boxes: List[DetectionBoxSchema]
    defect_count: int
    dominant_category: str
    confidence: float
    processing_time_ms: int
    annotated_image_url: Optional[str] = None
    inference_mode: str = "REAL_AI"

class RoadReportCreate(BaseModel):
    title: str
    description: Optional[str] = None
    image_url: str
    annotated_image_url: Optional[str] = None
    lat: float
    lng: float
    address: str
    category: str
    traffic_exposure_score: int = Field(default=50, ge=0, le=100)
    safety_risk_score: int = Field(default=50, ge=0, le=100)
    boxes: Optional[List[DetectionBoxSchema]] = []

class RoadReportUpdate(BaseModel):
    status: Optional[str] = None
    priority_score: Optional[int] = None
    notes: Optional[str] = None

class RoadReportResponse(BaseModel):
    id: str
    citizen_id: str
    citizen_name: str
    title: str
    description: Optional[str]
    image_url: str
    annotated_image_url: Optional[str]
    lat: float
    lng: float
    address: str
    category: str
    severity: str
    severity_score: int
    traffic_exposure_score: int
    safety_risk_score: int
    priority_score: int
    priority_tier: str
    priority_reason: Optional[str]
    status: str
    duplicate_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class MaintenanceTaskCreate(BaseModel):
    report_id: str
    assigned_worker_id: str
    instructions: str
    target_completion_date: str

class MaintenanceTaskUpdate(BaseModel):
    status: Optional[str] = None
    instructions: Optional[str] = None
    target_completion_date: Optional[str] = None

class RepairVerificationCreate(BaseModel):
    before_image_url: str
    after_image_url: str
    repair_notes: str
    materials_used: str
    cost_usd: float

class DashboardSummarySchema(BaseModel):
    total_reports: int
    total_potholes: int
    total_cracks: int
    critical_damage_reports: int
    pending_maintenance: int
    completed_repairs: int
    average_priority_score: int
    reports_submitted_today: int
