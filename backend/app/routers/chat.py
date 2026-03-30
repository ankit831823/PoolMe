from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Message, Ride
from ..schemas import MessageCreate, MessageOut
from ..auth import get_current_user
from ..models import User

router = APIRouter()

@router.get("/my", response_model=List[MessageOut])
def get_my_messages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from ..models import RidePassenger
    # Get rides where user is driver or passenger
    ride_ids = [r.id for r in current_user.rides]
    pass_ride_ids = db.query(RidePassenger.ride_id).filter(RidePassenger.user_id == current_user.id).all()
    ride_ids.extend([r[0] for r in pass_ride_ids])
    
    messages = (db.query(Message)
              .filter(Message.ride_id.in_(ride_ids))
              .order_by(Message.created_at.desc())
              .limit(50)
              .all())
    for m in messages:
        m.ride = m.ride # SQLAlchemy relationship handles this
    return messages

@router.get("/{ride_id}", response_model=List[MessageOut])
def get_messages(
    ride_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        raise HTTPException(404, "Ride not found")
    
    messages = (db.query(Message)
                  .filter(Message.ride_id == ride_id)
                  .order_by(Message.created_at)
                  .all())
    for m in messages:
        m.ride = ride
    return messages

@router.post("/{ride_id}", response_model=MessageOut, status_code=201)
def send_message(
    ride_id: int,
    msg: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        raise HTTPException(404, "Ride not found")
    message = Message(
        ride_id=ride_id,
        sender_id=current_user.id,
        content=msg.content
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    message.ride = ride
    return message
