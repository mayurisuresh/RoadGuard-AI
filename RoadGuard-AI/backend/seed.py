import os
import sys
import sqlite3
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "roadguard.db")

def seed():
    print(f"🌱 Initializing RoadGuard AI Database at {DB_PATH}...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create tables
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        hashed_password TEXT NOT NULL,
        role TEXT DEFAULT 'citizen',
        department TEXT,
        phone TEXT,
        avatar_url TEXT,
        created_at TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS road_reports (
        id TEXT PRIMARY KEY,
        citizen_id TEXT NOT NULL,
        citizen_name TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT NOT NULL,
        annotated_image_url TEXT,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        address TEXT NOT NULL,
        category TEXT NOT NULL,
        severity TEXT NOT NULL,
        severity_score INTEGER DEFAULT 50,
        traffic_exposure_score INTEGER DEFAULT 50,
        safety_risk_score INTEGER DEFAULT 50,
        priority_score INTEGER DEFAULT 50,
        priority_tier TEXT DEFAULT 'MEDIUM',
        priority_reason TEXT,
        status TEXT DEFAULT 'Pending Verification',
        duplicate_count INTEGER DEFAULT 0,
        created_at TEXT,
        updated_at TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS detections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id TEXT NOT NULL,
        label TEXT NOT NULL,
        confidence REAL NOT NULL,
        x REAL NOT NULL,
        y REAL NOT NULL,
        width REAL NOT NULL,
        height REAL NOT NULL,
        model_version TEXT DEFAULT 'yolov8-rdd2022',
        created_at TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS maintenance_tasks (
        id TEXT PRIMARY KEY,
        report_id TEXT NOT NULL,
        status TEXT DEFAULT 'Assigned',
        assigned_worker_id TEXT NOT NULL,
        assigned_worker_name TEXT NOT NULL,
        instructions TEXT,
        target_completion_date TEXT,
        materials_used TEXT,
        cost_usd REAL DEFAULT 0.0,
        created_at TEXT,
        updated_at TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS maintenance_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id TEXT NOT NULL,
        status TEXT NOT NULL,
        updated_by TEXT NOT NULL,
        role TEXT NOT NULL,
        notes TEXT,
        timestamp TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT DEFAULT 'all',
        role_target TEXT,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        report_id TEXT,
        type TEXT DEFAULT 'info',
        read INTEGER DEFAULT 0,
        created_at TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS report_duplicates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id TEXT NOT NULL,
        duplicate_report_id TEXT NOT NULL,
        distance_meters REAL NOT NULL,
        verified_by_admin INTEGER DEFAULT 0,
        created_at TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS repair_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id TEXT NOT NULL,
        worker_id TEXT NOT NULL,
        worker_name TEXT NOT NULL,
        before_image_url TEXT NOT NULL,
        after_image_url TEXT NOT NULL,
        repair_notes TEXT,
        materials_used TEXT,
        cost_usd REAL DEFAULT 0.0,
        admin_approval_status TEXT DEFAULT 'Pending Review',
        admin_feedback TEXT,
        completed_at TEXT
    );
    """)

    # Clean existing
    for tbl in ["users", "road_reports", "detections", "maintenance_tasks", "maintenance_history", "notifications", "report_duplicates", "repair_images"]:
        cursor.execute(f"DELETE FROM {tbl};")

    print("👤 Seeding Demo Users...")
    now = datetime.utcnow().isoformat()
    cursor.execute("""
    INSERT INTO users (id, email, name, hashed_password, role, department, phone, avatar_url, created_at)
    VALUES
    ('usr-citizen-1', 'citizen@roadguard.ai', 'Mayuri Suresh', 'citizen123', 'citizen', NULL, '+1 (555) 234-8910', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', ?),
    ('usr-admin-1', 'admin@roadguard.ai', 'Director Marcus Vance', 'admin123', 'admin', 'Dept of Transportation', NULL, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', ?),
    ('usr-maint-1', 'maintenance@roadguard.ai', 'Alex Rivera (Crew Lead)', 'maint123', 'maintenance', 'District 3 Rapid Repair', '+1 (555) 987-6543', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', ?);
    """, (now, now, now))

    print("🛣️ Seeding Initial Road Reports...")
    cursor.execute("""
    INSERT INTO road_reports (id, citizen_id, citizen_name, title, description, image_url, lat, lng, address, category, severity, severity_score, traffic_exposure_score, safety_risk_score, priority_score, priority_tier, priority_reason, status, duplicate_count, created_at, updated_at)
    VALUES
    ('RG-2026-1001', 'usr-citizen-1', 'Mayuri Suresh', 'Severe Rim-Breaking Pothole on Market St', 'Deep cavity in the center lane right after the pedestrian crossing. Several vehicles have swerved dangerously into oncoming traffic.', 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800', 37.7812, -122.4089, '845 Market St, San Francisco, CA', 'Pothole', 'HIGH', 92, 88, 95, 91, 'CRITICAL', 'Critical cavity on high-volume transit spine.', 'In Progress', 3, ?, ?),
    ('RG-2026-1002', 'usr-citizen-1', 'Mayuri Suresh', 'Extensive Alligator Cracking on Folsom St', 'Interconnected web of structural cracks spanning 25 feet. Water seeping up through asphalt during morning rain.', 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800', 37.7785, -122.4042, '680 Folsom St, San Francisco, CA', 'Alligator Crack', 'HIGH', 85, 74, 78, 80, 'CRITICAL', 'Sub-base fatigue cracking spanning wheel path.', 'Verified', 1, ?, ?),
    ('RG-2026-1003', 'usr-citizen-1', 'Mayuri Suresh', 'Longitudinal Joint Separation on 4th Street', 'Continuous linear crack along the lane joint line. Cyclist tire hazard.', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800', 37.7845, -122.4021, '220 4th St, San Francisco, CA', 'Longitudinal Crack', 'MEDIUM', 52, 68, 58, 58, 'MEDIUM', 'Medium severity joint crack. Routine seal required.', 'Assigned', 0, ?, ?),
    ('RG-2026-1004', 'usr-citizen-1', 'Mayuri Suresh', 'Transverse Thermal Crack Across Howard St', 'Crack cutting perpendicular across the roadway surface at bus stop pullout.', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800', 37.7831, -122.3995, '550 Howard St, San Francisco, CA', 'Transverse Crack', 'MEDIUM', 48, 65, 50, 54, 'MEDIUM', 'Moderate thermal crack. Schedule rout-and-seal.', 'Repaired', 0, ?, ?);
    """, (now, now, now, now, now, now, now, now))

    print("🔧 Seeding Maintenance Tasks...")
    cursor.execute("""
    INSERT INTO maintenance_tasks (id, report_id, status, assigned_worker_id, assigned_worker_name, instructions, target_completion_date, cost_usd, created_at, updated_at)
    VALUES
    ('task-1001', 'RG-2026-1001', 'In Progress', 'usr-maint-1', 'Alex Rivera (Crew Lead)', 'Square-cut edges with asphalt saw, clean cavity, apply RS-1 tack coat, fill with Type B hot-mix asphalt and vibrate with plate compactor.', '2026-10-31', 450.0, ?, ?),
    ('task-1003', 'RG-2026-1003', 'Assigned', 'usr-maint-1', 'Alex Rivera (Crew Lead)', 'Hot air lance blast to clean moisture and debris. Inject hot rubberized asphalt sealant to flush crown.', '2026-11-03', 280.0, ?, ?);
    """, (now, now, now, now))

    print("🔔 Seeding Notifications...")
    cursor.execute("""
    INSERT INTO notifications (id, user_id, role_target, title, message, report_id, type, read, created_at)
    VALUES
    ('notif-1', 'all', 'admin', 'Critical Pothole Flagged on Market St', 'Report RG-2026-1001 elevated to CRITICAL priority (91/100).', 'RG-2026-1001', 'alert', 0, ?),
    ('notif-2', 'usr-citizen-1', 'citizen', 'Work in Progress on Market St', 'District 3 Rapid Repair Unit dispatched to repair pothole.', 'RG-2026-1001', 'info', 0, ?);
    """, (now, now))

    conn.commit()
    conn.close()
    print("✅ RoadGuard AI SQLite Database Seed Complete!")

if __name__ == "__main__":
    seed()
