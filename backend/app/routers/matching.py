from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List
from ..database import get_db
from ..models import Ride
from ..schemas import MatchResult
from ..matching_engine import rank_rides

router = APIRouter()

@router.get("/", response_model=List[MatchResult])
def find_matches(
    origin_lat:  float = Query(...),
    origin_lng:  float = Query(...),
    dest_lat:    float = Query(...),
    dest_lng:    float = Query(...),
    travel_time: datetime = Query(...),
    db: Session = Depends(get_db)
):
    print(f"DEBUG: Finding matches for O:{origin_lat},{origin_lng} D:{dest_lat},{dest_lng} T:{travel_time}")
    active_rides = (
        db.query(Ride)
          .filter(Ride.status == "active")
          .filter(Ride.seats_available > 0)
          .filter(Ride.departure_time >= datetime.utcnow() - timedelta(hours=12))
          .all()
    )
    print(f"DEBUG: Found {len(active_rides)} potential rides in DB")
    for r in active_rides:
        print(f"DEBUG: Ride {r.id}: {r.origin} -> {r.destination} at {r.departure_time}")

    ranked = rank_rides(
        origin_lat, origin_lng, dest_lat, dest_lng,
        travel_time, active_rides
    )
    return ranked
