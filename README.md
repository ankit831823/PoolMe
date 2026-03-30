# PoolMe 🚗
**Smart Travel Matchmaking App**

A premium carpooling application featuring AI-driven route matching, real-time chat, and a beautiful dark glassmorphism design.

## 🚀 Features
- **🤖 AI Route Matchmaking**: Finds people on similar routes, not just exact matches.
- **💸 Smart Cost Split**: Automatically calculates fair pricing based on distance and fuel.
- **💬 In-App Chat**: Message co-travelers securely.
- **🔒 Verified Profiles**: Safety first with profile status and ratings.
- **📍 Live Tracking**: (UI Ready) For enhanced safety during trips.

## 🛠️ Tech Stack
- **Frontend**: React.js, Lucide Icons, Vanilla CSS (Premium Dark Theme).
- **Backend**: FastAPI, SQLAlchemy, SQLite.
- **AI**: Custom Haversine-based matching engine.

## 🏁 Getting Started

### 1. Backend Setup
```bash
# Navigate to backend
cd backend

# Use the existing venv in root
..\venv\Scripts\activate

# Install dependencies (already included in PoolMe root)
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

## 🧠 AI Matching Logic
The app uses a custom algorithm in `matching_engine.py` that calculates:
1. **Haversine Distance**: Geographic proximity of start/end points.
2. **Route Deviation (Detour)**: Calculates if the passenger's start point is "on the way" using point-to-segment distance formulas.
3. **Temporal Alignment**: Penalty scores for time differences.

---
Created for Advanced Agentic Coding - Project PoolMe
