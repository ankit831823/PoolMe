from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from ..database import get_db
from ..models import User
from ..schemas import UserRegister, Token, UserOut
from ..auth import (verify_password, get_password_hash,
                    create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES,
                    get_current_user)

router = APIRouter()

@router.post("/register", response_model=UserOut, status_code=201)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    email = user_in.email.strip().lower()
    
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(400, "Email already registered")
        
    if db.query(User).filter(User.phone == user_in.phone).first():
        raise HTTPException(400, "Phone already registered")
        
    user = User(
        name=user_in.name,
        email=email,
        phone=user_in.phone,
        college=user_in.college,
        gender=user_in.gender,
        car_model=user_in.car_model,
        car_number=user_in.car_number,
        hashed_pw=get_password_hash(user_in.password),
        is_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    email = form.username.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(form.password, user.hashed_pw):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(
        {"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
