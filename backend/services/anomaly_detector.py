
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import json
import uuid
from loguru import logger
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

from models.models import LogEntryModel, ThreatModel
from models.schemas import LogEntry, Threat

class AnomalyDetector:
    def __init__(self):
        """Initialize the anomaly detector with an Isolation Forest model"""
        self.model = IsolationForest(
            n_estimators=100,
            max_samples='auto',
            contamination=0.1,  # Assume 10% of data points are anomalies
            random_state=42
        )
        self.scaler = StandardScaler()
        self.is_model_fitted = False
        self.features = [
            'hour_of_day', 
            'day_of_week',
            'is_error',
            'is_warning',
            'is_security_related',
            'is_authentication',
            'is_network_related',
            'is_database_related',
            'is_file_access',
            'is_admin_action'
        ]
        logger.info("Anomaly detector initialized")
    
    async def detect_anomalies(self, logs: List[LogEntry]) -> List[Threat]:
        """Detect anomalies in logs using Isolation Forest"""
        if not logs:
            return []
        
        try:
            # Convert logs to features for model
            features = self._extract_features(logs)
            
            if not self.is_model_fitted or len(logs) >= 20:
                # Train model with current batch if we have enough data
                self._train_model(features)
            
            if not self.is_model_fitted:
                # Can't predict without a fitted model
                return []
            
            # Normalize features
            scaled_features = self.scaler.transform(features)
            
            # Predict anomalies (returns -1 for anomalies, 1 for normal points)
            predictions = self.model.predict(scaled_features)
            
            # Get anomaly scores (-1 to 1, lower is more anomalous)
            raw_scores = self.model.decision_function(scaled_features)
            
            # Convert scores to 0-1 range (0 = normal, 1 = anomaly)
            anomaly_scores = 1 - (raw_scores - np.min(raw_scores)) / (np.max(raw_scores) - np.min(raw_scores) + 1e-10)
            
            threats = []
            for i, (pred, score) in enumerate(zip(predictions, anomaly_scores)):
                if pred == -1 or score > 0.75:  # High anomaly score
                    log = logs[i]
                    
                    # Determine severity based on anomaly score
                    severity = "low"
                    if score > 0.95:
                        severity = "critical"
                    elif score > 0.9:
                        severity = "high"
                    elif score > 0.8:
                        severity = "medium"
                    
                    # Determine threat type based on log characteristics
                    threat_type = "anomaly"
                    if "login" in log.message.lower() or "authentication" in log.message.lower():
                        threat_type = "brute force"
                    elif "malware" in log.message.lower() or "virus" in log.message.lower():
                        threat_type = "malware"
                    elif "access" in log.message.lower() and ("unauthorized" in log.message.lower() or "denied" in log.message.lower()):
                        threat_type = "unauthorized access"
                    
                    # Generate indicators
                    indicators = self._generate_indicators(log)
                    
                    # Create threat
                    threat = Threat(
                        title=f"Anomaly detected in {log.source}",
                        description=f"Unusual activity detected: {log.message}",
                        timestamp=log.timestamp,
                        severity=severity,
                        status="active",
                        source=log.source,
                        type=threat_type,
                        indicators=indicators,
                        related_logs=[log.id],
                        anomaly_score=float(score),
                        user=log.details.get("user") if log.details else None
                    )
                    
                    threats.append(threat)
                    
                    # Store the threat in the database
                    await self._store_threat(threat)
            
            logger.info(f"Detected {len(threats)} anomalies from {len(logs)} logs")
            return threats
        
        except Exception as e:
            logger.error(f"Error detecting anomalies: {str(e)}")
            return []
    
    def _extract_features(self, logs: List[LogEntry]) -> np.ndarray:
        """Extract numerical features from logs for anomaly detection"""
        features_list = []
        
        for log in logs:
            # Time-based features
            timestamp = log.timestamp
            hour_of_day = timestamp.hour
            day_of_week = timestamp.weekday()
            
            # Log level features
            is_error = 1 if log.level.lower() == "error" else 0
            is_warning = 1 if log.level.lower() == "warning" else 0
            
            # Content-based features
            msg = log.message.lower()
            is_security_related = 1 if any(term in msg for term in ["security", "secure", "attack", "threat", "vulnerability"]) else 0
            is_authentication = 1 if any(term in msg for term in ["login", "password", "credential", "auth", "user"]) else 0
            is_network_related = 1 if any(term in msg for term in ["network", "connection", "ip", "tcp", "udp", "dns", "http"]) else 0
            is_database_related = 1 if any(term in msg for term in ["database", "sql", "query", "table", "record"]) else 0
            is_file_access = 1 if any(term in msg for term in ["file", "directory", "folder", "path", "read", "write"]) else 0
            is_admin_action = 1 if any(term in msg for term in ["admin", "root", "sudo", "permission", "privilege"]) else 0
            
            features = [
                hour_of_day, 
                day_of_week,
                is_error,
                is_warning,
                is_security_related,
                is_authentication,
                is_network_related,
                is_database_related,
                is_file_access,
                is_admin_action
            ]
            
            features_list.append(features)
        
        return np.array(features_list)
    
    def _train_model(self, features: np.ndarray):
        """Train the Isolation Forest model"""
        if len(features) < 10:
            logger.warning("Not enough data to train the model")
            return
        
        try:
            # Scale the features
            self.scaler.fit(features)
            scaled_features = self.scaler.transform(features)
            
            # Train the model
            self.model.fit(scaled_features)
            self.is_model_fitted = True
            logger.info(f"Trained anomaly detection model on {len(features)} samples")
        except Exception as e:
            logger.error(f"Error training anomaly model: {str(e)}")
    
    def _generate_indicators(self, log: LogEntry) -> List[str]:
        """Generate indicators of compromise based on log data"""
        indicators = []
        
        # Add general indicators
        indicators.append(f"Source: {log.source}")
        indicators.append(f"Level: {log.level}")
        
        # Add time-based indicators
        hour = log.timestamp.hour
        if hour < 5 or hour > 22:  # Night hours
            indicators.append(f"Unusual time: {log.timestamp.strftime('%H:%M')}")
        
        # Add indicators from details if available
        if log.details:
            if "ip_address" in log.details:
                indicators.append(f"IP address: {log.details['ip_address']}")
            
            if "user" in log.details:
                indicators.append(f"User: {log.details['user']}")
            
            if "process_id" in log.details:
                indicators.append(f"Process ID: {log.details['process_id']}")
            
            if "region" in log.details and "resource_id" in log.details:
                indicators.append(f"AWS Resource: {log.details['resource_id']} in {log.details['region']}")
        
        return indicators
    
    async def _store_threat(self, threat: Threat):
        """Store a detected threat in the database"""
        try:
            db = next(get_db())
            
            # Convert Pydantic model to SQLAlchemy model
            db_threat = ThreatModel(
                id=threat.id,
                title=threat.title,
                description=threat.description,
                timestamp=threat.timestamp,
                severity=threat.severity,
                status=threat.status,
                source=threat.source,
                type=threat.type,
                indicators=threat.indicators,
                actions=threat.actions,
                related_logs=threat.related_logs,
                user=threat.user,
                anomaly_score=threat.anomaly_score,
                details=threat.details
            )
            
            db.add(db_threat)
            await db.commit()
            logger.info(f"Stored new threat: {threat.title}")
        except Exception as e:
            logger.error(f"Error storing threat: {str(e)}")
    
    async def analyze_log(self, log: LogEntry):
        """Analyze a single log entry for potential threats"""
        await self.detect_anomalies([log])
    
    async def get_threats(
        self,
        db,
        limit: int = 50,
        status: Optional[str] = None,
        severity: Optional[str] = None,
        source: Optional[str] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> List[Threat]:
        """Retrieve threats with optional filtering"""
        try:
            query = db.query(ThreatModel)
            
            if status:
                query = query.filter(ThreatModel.status == status)
            
            if severity:
                query = query.filter(ThreatModel.severity == severity)
                
            if source:
                query = query.filter(ThreatModel.source.contains(source))
                
            if start_time:
                query = query.filter(ThreatModel.timestamp >= start_time)
                
            if end_time:
                query = query.filter(ThreatModel.timestamp <= end_time)
            
            # Order by timestamp descending (newest first)
            query = query.order_by(ThreatModel.timestamp.desc()).limit(limit)
            
            result = await query.all()
            
            # Convert SQLAlchemy models to Pydantic models
            threats = [
                Threat(
                    id=t.id,
                    title=t.title,
                    description=t.description,
                    timestamp=t.timestamp,
                    severity=t.severity,
                    status=t.status,
                    source=t.source,
                    type=t.type,
                    indicators=t.indicators,
                    actions=t.actions,
                    related_logs=t.related_logs,
                    user=t.user,
                    anomaly_score=t.anomaly_score,
                    details=t.details
                )
                for t in result
            ]
            
            return threats
        except Exception as e:
            logger.error(f"Error retrieving threats: {str(e)}")
            
            # If database query fails, return empty list
            return []
