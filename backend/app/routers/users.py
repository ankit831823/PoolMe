from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import UserOut
from ..auth import get_current_user

router = APIRouter()

@router.get("/", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(User).limit(50).all()

@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    return user

@router.put("/me", response_model=UserOut)
def update_me(
    name: str = None,
    college: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if name:
        current_user.name = name
    if college:
        current_user.college = college
    db.commit()
    db.refresh(current_user)
    return current_user
