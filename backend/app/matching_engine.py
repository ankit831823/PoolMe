"""
AI Matching Engine for PoolMe
Uses geographic proximity + temporal similarity + preference scoring
"""
import math
from datetime import datetime
from typing import List, Tuple
from .models import Ride, User

EARTH_R_KM = 6371.0

def haversine(lat1, lon1, lat2, lon2) -> float:
    """Great-circle distance in km."""
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2
         + math.cos(math.radians(lat1))
         * math.cos(math.radians(lat2))
         * math.sin(dlon / 2) ** 2)
    return 2 * EARTH_R_KM * math.asin(math.sqrt(a))

def point_to_segment_dist(px, py, ax, ay, bx, by) -> float:
    """Closest distance from point P to line segment AB (all in km-approx coords)."""
    dx, dy = bx - ax, by - ay
    if dx == dy == 0:
        return haversine(px, py, ax, ay)
    t = max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    cx, cy = ax + t * dx, ay + t * dy
    return haversine(px, py, cx, cy)

def compute_match_score(
    req_olat, req_olng, req_dlat, req_dlng, req_time: datetime,
    ride: Ride
) -> Tuple[float, float, str]:
    """
    Returns (score 0-100, detour_km, reason_string)
    """
    # 1️⃣ Origin proximity (how close rider's start is to ride's route)
    origin_dist = haversine(req_olat, req_olng, ride.origin_lat, ride.origin_lng)

    # 2️⃣ Destination proximity
    dest_dist = haversine(req_dlat, req_dlng, ride.dest_lat, ride.dest_lng)

    # 3️⃣ Route deviation — is rider's origin "on the way"?
    on_route_dist = point_to_segment_dist(
        req_olat, req_olng,
        ride.origin_lat, ride.origin_lng,
        ride.dest_lat, ride.dest_lng
    )
    detour_km = on_route_dist

    # 4️⃣ Time difference penalty (in minutes)
    time_diff = abs((req_time - ride.departure_time).total_seconds() / 60)

    # Scoring
    origin_score  = max(0, 100 - origin_dist * 2)    # 50km limit
    dest_score    = max(0, 100 - dest_dist * 2)
    route_score   = max(0, 100 - on_route_dist * 1.5) # ~66km limit
    time_score    = max(0, 100 - time_diff * 0.1)     # 1hr diff only loses 6 points

    score = (origin_score * 0.25 + dest_score * 0.35
             + route_score * 0.25 + time_score * 0.15)

    reasons = []
    if dest_dist < 5:
        reasons.append("Same destination area")
    if on_route_dist < 3:
        reasons.append("On the route")
    if origin_dist < 5:
        reasons.append("Nearby pickup")
    if time_diff < 30:
        reasons.append("Matching time")
    reason = " • ".join(reasons) if reasons else "Partial route overlap"

    return round(score, 1), round(detour_km, 2), reason

def rank_rides(
    req_olat, req_olng, req_dlat, req_dlng, req_time: datetime,
    rides: List[Ride],
    min_score: float = 15.0
):
    results = []
    for ride in rides:
        score, detour, reason = compute_match_score(
            req_olat, req_olng, req_dlat, req_dlng, req_time, ride
        )
        if score >= min_score:
            results.append({"ride": ride, "match_score": score,
                            "detour_km": detour, "reason": reason})
    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results
