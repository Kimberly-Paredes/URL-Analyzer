from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from database import engine, Base, get_db
import models
from services.aggregator import analyze_url
from fastapi.middleware.cors import CORSMiddleware
from services.turnstile import verify_turnstile
from fastapi import HTTPExceptio

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://url-virus-detector-flame.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"message": "API is running"}

@app.post("/check")
def check_url(url: str, turnstile_token: str, db: Session = Depends(get_db)):
    if not verify_turnstile(turnstile_token):
        raise HTTPException(status_code=403, detail="CAPTCHA verification failed")

    existing = db.query(models.Lookup).filter(models.Lookup.url == url).first()
    if existing:
        return {
            "url": existing.url,
            "verdict": existing.verdict,
            "sources": existing.sources,
            "cached": True,
        }

    result = analyze_url(url)

    new_lookup = models.Lookup(url=result["url"], verdict=result["verdict"], sources=result["sources"])
    db.add(new_lookup)
    db.commit()

    return {**result, "cached": False}

@app.get("/history")
def get_history(db: Session = Depends(get_db)):
    return db.query(models.Lookup).order_by(desc(models.Lookup.checked_at)).limit(20).all()
