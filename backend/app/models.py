from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import enum

class GenderEnum(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"
    any = "any"

class RideStatusEnum(str, enum.Enum):
    active = "active"
    completed = "completed"
    cancelled = "cancelled"

class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String, nullable=False)
    email         = Column(String, unique=True, index=True, nullable=False)
    phone         = Column(String, unique=True, nullable=False)
    hashed_pw     = Column(String, nullable=False)
    avatar_url    = Column(String, default="")
    college       = Column(String, default="")
    gender        = Column(String, default="other")
    car_model     = Column(String, default="")
    car_number    = Column(String, default="")
    rating        = Column(Float, default=5.0)
    total_rides   = Column(Integer, default=0)
    is_verified   = Column(Boolean, default=False)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())

    rides         = relationship("Ride", back_populates="driver", foreign_keys="Ride.driver_id")
    messages      = relationship("Message", back_populates="sender")

class Ride(Base):
    __tablename__ = "rides"

    id              = Column(Integer, primary_key=True, index=True)
    driver_id       = Column(Integer, ForeignKey("users.id"), nullable=False)
    origin          = Column(String, nullable=False)
    origin_lat      = Column(Float, nullable=False)
    origin_lng      = Column(Float, nullable=False)
    destination     = Column(String, nullable=False)
    dest_lat        = Column(Float, nullable=False)
    dest_lng        = Column(Float, nullable=False)
    departure_time  = Column(DateTime, nullable=False)
    seats_available = Column(Integer, default=3)
    seats_total     = Column(Integer, default=3)
    price_per_seat  = Column(Float, default=0.0)
    auto_price      = Column(Boolean, default=True)
    distance_km     = Column(Float, default=0.0)
    preferences     = Column(String, default="")  # JSON string
    status          = Column(String, default="active")
    created_at      = Column(DateTime(timezone=True), server_default=func.now())

    driver          = relationship("User", back_populates="rides", foreign_keys=[driver_id])
    passengers      = relationship("RidePassenger", back_populates="ride")
    messages        = relationship("Message", back_populates="ride")

class RidePassenger(Base):
    __tablename__ = "ride_passengers"

    id         = Column(Integer, primary_key=True, index=True)
    ride_id    = Column(Integer, ForeignKey("rides.id"))
    user_id    = Column(Integer, ForeignKey("users.id"))
    joined_at  = Column(DateTime(timezone=True), server_default=func.now())

    ride       = relationship("Ride", back_populates="passengers")
    user       = relationship("User")

class Message(Base):
    __tablename__ = "messages"

    id         = Column(Integer, primary_key=True, index=True)
    ride_id    = Column(Integer, ForeignKey("rides.id"))
    sender_id  = Column(Integer, ForeignKey("users.id"))
    content    = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    ride       = relationship("Ride", back_populates="messages")
    sender     = relationship("User", back_populates="messages")
