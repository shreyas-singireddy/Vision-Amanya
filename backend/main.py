import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
import redis
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Vision Infra - Vision Amanya API"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgrespassword@localhost:5432/vision_amanya"
    REDIS_URL: str = "redis://localhost:6379/0"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Setup
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Redis Setup
try:
    redis_client = redis.from_url(settings.REDIS_URL, socket_connect_timeout=2)
except Exception:
    redis_client = None

@app.get("/")
def read_root():
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "environment": os.getenv("ENVIRONMENT", "development")
    }

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    health_status = {
        "status": "healthy",
        "services": {
            "api": "healthy",
            "postgres": "unknown",
            "redis": "unknown"
        }
    }
    
    # 1. Check Postgres
    try:
        db.execute(text("SELECT 1"))
        health_status["services"]["postgres"] = "healthy"
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["services"]["postgres"] = f"unhealthy: {str(e)}"
        
    # 2. Check Redis
    if redis_client is not None:
        try:
            redis_client.ping()
            health_status["services"]["redis"] = "healthy"
        except Exception as e:
            health_status["status"] = "unhealthy"
            health_status["services"]["redis"] = f"unhealthy: {str(e)}"
    else:
        health_status["status"] = "unhealthy"
        health_status["services"]["redis"] = "unhealthy: client not initialized"

    if health_status["status"] == "unhealthy":
        raise HTTPException(status_code=503, detail=health_status)
        
    return health_status
