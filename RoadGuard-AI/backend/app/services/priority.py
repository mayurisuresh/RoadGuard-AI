import math

def calculate_priority(severity_score: int, traffic_score: int, safety_score: int):
    """
    Priority Score = (0.50 * Severity Score) + (0.30 * Traffic Exposure Score) + (0.20 * Safety Risk Score)
    Normalized between 0 and 100
    """
    raw = (0.50 * severity_score) + (0.30 * traffic_score) + (0.20 * safety_score)
    score = int(round(max(0, min(100, raw))))

    if score >= 80:
        tier = "CRITICAL"
        reason = "Immediate structural hazard in high-traffic corridor. Dispatch emergency patch team within 24h."
    elif score >= 60:
        tier = "HIGH"
        reason = "Substantial defect with elevated safety risk. Prioritize for repair within 48-72 hours."
    elif score >= 35:
        tier = "MEDIUM"
        reason = "Noticeable surface degradation. Plan repairs in upcoming municipal maintenance batch."
    else:
        tier = "LOW"
        reason = "Surface damage poses low immediate hazard. Routine cycle scheduling."

    return {
        "score": score,
        "tier": tier,
        "reason": reason
    }

def calculate_haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculates geographical distance between two GPS coordinates in meters."""
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lng2 - lng1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 1)

def detect_duplicates(candidate_lat: float, candidate_lng: float, candidate_category: str, existing_reports, radius_meters: float = 40.0):
    for report in existing_reports:
        dist = calculate_haversine(candidate_lat, candidate_lng, report.lat, report.lng)
        if dist <= radius_meters:
            return {
                "is_duplicate": True,
                "matched_report_id": report.id,
                "distance_meters": dist,
                "reason": f"Spatial proximity within {dist:.0f}m of report {report.id} ({report.category})"
            }
    return {
        "is_duplicate": False,
        "matched_report_id": None,
        "distance_meters": -1.0,
        "reason": "Unique geographic location"
    }
