from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from ..database import get_db
from ..models import Ride, RidePassenger, User
from ..schemas import RideCreate, RideOut
from ..auth import get_current_user
import math

router = APIRouter()

FUEL_COST_PER_KM = 6.0   # ₹6/km average

def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1))*math.cos(math.radians(lat2))*math.sin(dlon/2)**2
    return 2 * R * math.asin(math.sqrt(a))

@router.post("/", response_model=RideOut, status_code=201)
def create_ride(
    ride_in: RideCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dist = haversine(ride_in.origin_lat, ride_in.origin_lng, ride_in.dest_lat, ride_in.dest_lng)
    price = ride_in.price_per_seat
    if ride_in.auto_price or price is None:
        price = round((dist * FUEL_COST_PER_KM) / max(ride_in.seats_available, 1), 2)

    ride = Ride(
        driver_id=current_user.id,
        origin=ride_in.origin,
        origin_lat=ride_in.origin_lat,
        origin_lng=ride_in.origin_lng,
        destination=ride_in.destination,
        dest_lat=ride_in.dest_lat,
        dest_lng=ride_in.dest_lng,
        departure_time=ride_in.departure_time,
        seats_available=ride_in.seats_available,
        seats_total=ride_in.seats_available,
        price_per_seat=price,
        auto_price=ride_in.auto_price,
        distance_km=round(dist, 2),
        preferences=ride_in.preferences or "",
    )
    db.add(ride)
    db.commit()
    db.refresh(ride)
    return ride

@router.get("/", response_model=List[RideOut])
def list_rides(
    status: str = "active",
    limit: int = 50,
    db: Session = Depends(get_db)
):
    rides = (db.query(Ride)
              .filter(Ride.status == status)
              .filter(Ride.departure_time >= datetime.utcnow() - timedelta(hours=12))
              .order_by(Ride.departure_time)
              .limit(limit)
              .all())
    
    # Map passengers manually for each ride since pydantic from_orm might not handle the nested rp.user mapping automatically
    for r in rides:
        r.passenger_list = [rp.user for rp in r.passengers]
    return rides

@router.get("/my", response_model=List[RideOut])
def my_rides(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rides = db.query(Ride).filter(Ride.driver_id == current_user.id).order_by(Ride.created_at.desc()).all()
    for r in rides:
        r.passenger_list = [rp.user for rp in r.passengers]
    return rides

@router.get("/{ride_id}", response_model=RideOut)
def get_ride(ride_id: int, db: Session = Depends(get_db)):
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        raise HTTPException(404, "Ride not found")
    ride.passenger_list = [rp.user for rp in ride.passengers]
    return ride

@router.post("/{ride_id}/join", status_code=200)
def join_ride(
    ride_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        raise HTTPException(404, "Ride not found")
    if ride.seats_available <= 0:
        raise HTTPException(400, "No seats available")
    if ride.driver_id == current_user.id:
        raise HTTPException(400, "You are the driver")
    existing = db.query(RidePassenger).filter_by(ride_id=ride_id, user_id=current_user.id).first()
    if existing:
        raise HTTPException(400, "Already joined")

    passenger = RidePassenger(ride_id=ride_id, user_id=current_user.id)
    ride.seats_available -= 1
    db.add(passenger)
    db.commit()
    return {"message": "Joined successfully", "cost": ride.price_per_seat}

@router.delete("/{ride_id}/cancel", status_code=200)
def cancel_ride(
    ride_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        raise HTTPException(404, "Not found")
    if ride.driver_id != current_user.id:
        raise HTTPException(403, "Not your ride")
    ride.status = "cancelled"
    db.commit()
    return {"message": "Ride cancelled"}
