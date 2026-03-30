from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, rides, users, matching, chat

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PoolMe API",
    description="Smart Travel Matchmaking API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,     prefix="/api/auth",    tags=["Authentication"])
app.include_router(users.router,    prefix="/api/users",   tags=["Users"])
app.include_router(rides.router,    prefix="/api/rides",   tags=["Rides"])
app.include_router(matching.router, prefix="/api/match",   tags=["Matching"])
app.include_router(chat.router,     prefix="/api/chat",    tags=["Chat"])

@app.get("/")
def root():
    return {"message": "PoolMe API running 🚗"}
