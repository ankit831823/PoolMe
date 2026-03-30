from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# ── Auth ──────────────────────────────────────────────────
class UserRegister(BaseModel):
    name: str
    email: str
    phone: str
    password: str
    college: Optional[str] = ""
    gender: Optional[str] = "other"
    car_model: Optional[str] = ""
    car_number: Optional[str] = ""

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# ── User ──────────────────────────────────────────────────
class UserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    college: str
    gender: str
    car_model: str
    car_number: str
    rating: float
    total_rides: int
    is_verified: bool
    avatar_url: str
    created_at: datetime

    class Config:
        from_attributes = True

# ── Ride ──────────────────────────────────────────────────
class RideCreate(BaseModel):
    origin: str
    origin_lat: float
    origin_lng: float
    destination: str
    dest_lat: float
    dest_lng: float
    departure_time: datetime
    seats_available: int = 3
    price_per_seat: Optional[float] = None
    auto_price: bool = True
    preferences: Optional[str] = ""

class RideOut(BaseModel):
    id: int
    driver_id: int
    origin: str
    origin_lat: float
    origin_lng: float
    destination: str
    dest_lat: float
    dest_lng: float
    departure_time: datetime
    seats_available: int
    seats_total: int
    price_per_seat: float
    distance_km: float
    preferences: str
    status: str
    created_at: datetime
    driver: UserOut
    passenger_list: List[UserOut] = []

    class Config:
        from_attributes = True

class MatchResult(BaseModel):
    ride: RideOut
    match_score: float
    detour_km: float
    reason: str
class RideMinimal(BaseModel):
    id: int
    origin: str
    destination: str

# ── Chat ──────────────────────────────────────────────────
class MessageCreate(BaseModel):
    content: str

class MessageOut(BaseModel):
    id: int
    ride_id: int
    sender_id: int
    content: str
    created_at: datetime
    sender: UserOut
    ride: Optional[RideMinimal] = None

    class Config:
        from_attributes = True
