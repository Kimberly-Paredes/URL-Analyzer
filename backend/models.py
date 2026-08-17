from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.sql import func
from database import Base

class Lookup(Base):
    __tablename__ = "lookups"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, index=True, nullable=False)
    verdict = Column(String, nullable=False)          # "safe" | "suspicious" | "malicious"
    sources = Column(JSON, nullable=False)              # e.g. {"google_safe_browsing": "clean", "virustotal": "3/70"}
    checked_at = Column(DateTime(timezone=True), server_default=func.now())