
import os
import uvicorn
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import asyncio
import uuid
from loguru import logger

from models.database import init_db, get_db, engine
from models.schemas import LogEntry, Threat, ActionRequest, SystemStats
from services.log_collector import LogCollector
from services.anomaly_detector import AnomalyDetector
from services.response_manager import ResponseManager
from services.credentials_manager import credentials_manager
from routes.credentials import router as credentials_router

# Configure logger
logger.add("logs/sentinel.log", rotation="500 MB", retention="10 days", level="INFO")

app = FastAPI(
    title="SENTINEL AGS - Azure Security System API",
    description="Intelligent security system powered by Agentic AI for monitoring and responding to Azure cloud threats",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(credentials_router)

# Initialize services
log_collector = LogCollector()
anomaly_detector = AnomalyDetector()
response_manager = ResponseManager()

# Initialize DB
@app.on_event("startup")
async def startup_event():
    await init_db()
    logger.info("Database initialized")
    
    # Check credentials on startup
    cred_status = credentials_manager.get_credentials_status()
    logger.info(f"Credentials status: Azure present: {cred_status['azure']['present']}, Gemini present: {cred_status['gemini']['present']}")
    
    # Start background task for log collection and analysis
    asyncio.create_task(background_analysis_task())
    logger.info("Background analysis task started")

# Background task that runs periodically
async def background_analysis_task():
    while True:
        try:
            logger.info("Running background analysis task")
            
            # Check if Azure credentials are available
            azure_creds = credentials_manager.load_azure_credentials()
            
            if azure_creds:
                # TODO: Collect real Azure logs using credentials
                logger.info("Azure credentials found, would collect real logs here")
            else:
                # Generate simulated logs for testing
                sim_logs = await log_collector.generate_simulated_logs(count=5)
                logger.info(f"Generated {len(sim_logs)} simulated logs")
            
            # Get recent logs from database
            db = next(get_db())
            recent_logs = await log_collector.get_recent_logs(db, limit=100)
            
            # Analyze logs for anomalies
            if recent_logs:
                anomalies = await anomaly_detector.detect_anomalies(recent_logs)
                logger.info(f"Detected {len(anomalies)} anomalies")
                
                # Check if Gemini API is available for enhanced analysis
                gemini_key = credentials_manager.load_gemini_api_key()
                if gemini_key and anomalies:
                    logger.info("Would use Gemini API for enhanced threat analysis here")
                
                # Respond to detected threats
                if anomalies:
                    for anomaly in anomalies:
                        await response_manager.handle_threat(anomaly)
            
        except Exception as e:
            logger.error(f"Error in background task: {str(e)}")
        
        # Wait for next cycle
        await asyncio.sleep(30)  # Run every 30 seconds

# API Routes

@app.get("/")
async def root():
    return {"message": "SENTINEL AGS - Azure Security System API is running"}

@app.get("/logs", response_model=List[LogEntry])
async def get_logs(
    limit: int = Query(50, gt=0, le=500),
    source: Optional[str] = None,
    level: Optional[str] = None,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    db = Depends(get_db)
):
    """
    Retrieve logs with optional filtering
    """
    try:
        logs = await log_collector.get_logs(
            db, 
            limit=limit,
            source=source,
            level=level,
            start_time=start_time,
            end_time=end_time
        )
        return logs
    except Exception as e:
        logger.error(f"Error fetching logs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/logs", response_model=LogEntry)
async def create_log(
    log_entry: LogEntry,
    db = Depends(get_db)
):
    """
    Submit a new log entry
    """
    try:
        result = await log_collector.store_log(db, log_entry)
        
        # Analyze this log entry for potential threats
        background_tasks = BackgroundTasks()
        background_tasks.add_task(anomaly_detector.analyze_log, log_entry)
        
        return result
    except Exception as e:
        logger.error(f"Error creating log: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/threats", response_model=List[Threat])
async def get_threats(
    limit: int = Query(50, gt=0, le=500),
    status: Optional[str] = None,
    severity: Optional[str] = None,
    source: Optional[str] = None,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    db = Depends(get_db)
):
    """
    Retrieve detected threats with optional filtering
    """
    try:
        threats = await anomaly_detector.get_threats(
            db,
            limit=limit,
            status=status,
            severity=severity,
            source=source,
            start_time=start_time,
            end_time=end_time
        )
        return threats
    except Exception as e:
        logger.error(f"Error fetching threats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/actions", response_model=Dict[str, Any])
async def trigger_action(
    action: ActionRequest,
    db = Depends(get_db)
):
    """
    Trigger a security action in response to a threat
    """
    try:
        result = await response_manager.execute_action(db, action)
        return {"message": "Action triggered successfully", "result": result}
    except Exception as e:
        logger.error(f"Error triggering action: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats", response_model=SystemStats)
async def get_system_stats(
    db = Depends(get_db)
):
    """
    Get system statistics
    """
    try:
        stats = await log_collector.get_system_stats(db)
        return stats
    except Exception as e:
        logger.error(f"Error fetching system stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
