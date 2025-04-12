
from sqlalchemy import Column, String, DateTime, Float, JSON, Text, Integer, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import uuid

from .database import Base

class LogEntryModel(Base):
    __tablename__ = "logs"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    timestamp = Column(DateTime, default=datetime.now, index=True)
    source = Column(String, index=True)
    level = Column(String, index=True)
    message = Column(Text)
    details = Column(JSON, nullable=True)
    encrypted = Column(Boolean, default=True)

class ThreatModel(Base):
    __tablename__ = "threats"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    title = Column(String)
    description = Column(Text)
    timestamp = Column(DateTime, default=datetime.now, index=True)
    severity = Column(String, index=True)
    status = Column(String, index=True)
    source = Column(String, index=True)
    type = Column(String, index=True)
    indicators = Column(JSON, nullable=True)
    actions = Column(JSON, nullable=True)
    related_logs = Column(JSON, nullable=True)
    user = Column(String, nullable=True, index=True)
    anomaly_score = Column(Float, nullable=True)
    details = Column(JSON, nullable=True)

class ActionModel(Base):
    __tablename__ = "actions"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    threat_id = Column(String, ForeignKey("threats.id"), index=True)
    action_type = Column(String, index=True)
    parameters = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.now, index=True)
    status = Column(String, index=True)
    result = Column(JSON, nullable=True)
    
    # Relationship
    threat = relationship("ThreatModel", back_populates="actions")

# Add relationship to ThreatModel
ThreatModel.actions = relationship("ActionModel", back_populates="threat")
