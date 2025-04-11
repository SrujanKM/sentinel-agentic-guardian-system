
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, validator
from datetime import datetime
import uuid

class LogEntry(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: Optional[datetime] = Field(default_factory=datetime.now)
    source: str
    level: str
    message: str
    details: Optional[Dict[str, Any]] = None
    
    class Config:
        orm_mode = True

class Threat(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    timestamp: Optional[datetime] = Field(default_factory=datetime.now)
    severity: str
    status: str = "active"
    source: str
    type: str
    indicators: Optional[List[str]] = None
    actions: Optional[List[str]] = None
    related_logs: Optional[List[str]] = None
    user: Optional[str] = None
    anomaly_score: Optional[float] = None
    details: Optional[Dict[str, Any]] = None
    
    class Config:
        orm_mode = True
        
    @validator('severity')
    def severity_must_be_valid(cls, v):
        allowed = ['low', 'medium', 'high', 'critical']
        if v.lower() not in allowed:
            raise ValueError(f'Severity must be one of {allowed}')
        return v.lower()
        
    @validator('status')
    def status_must_be_valid(cls, v):
        allowed = ['active', 'investigating', 'contained', 'resolved']
        if v.lower() not in allowed:
            raise ValueError(f'Status must be one of {allowed}')
        return v.lower()

class ActionRequest(BaseModel):
    threat_id: str
    action_type: str
    parameters: Optional[Dict[str, Any]] = None
    
    @validator('action_type')
    def action_type_must_be_valid(cls, v):
        allowed = ['block_ip', 'quarantine', 'restart_service', 'kill_process', 'custom']
        if v.lower() not in allowed:
            raise ValueError(f'Action type must be one of {allowed}')
        return v.lower()

class SystemStats(BaseModel):
    total_logs: int
    logs_today: int
    active_threats: int
    resolved_threats: int
    anomaly_count: int
    system_health: str
    agent_status: Dict[str, str]
    last_updated: datetime = Field(default_factory=datetime.now)
