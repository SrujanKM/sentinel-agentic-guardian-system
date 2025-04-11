
import os
import random
import json
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from loguru import logger
import pandas as pd

# Import pywin32 only on Windows systems
if os.name == 'nt':
    import win32evtlog
    import win32con
    import win32evtlogutil

from models.models import LogEntryModel
from models.schemas import LogEntry, SystemStats

class LogCollector:
    def __init__(self):
        """Initialize the log collector service"""
        self.windows_sources = [
            "Application", "System", "Security",
            "Microsoft-Windows-Sysmon/Operational",
            "Microsoft-Windows-PowerShell/Operational"
        ]
        
        # Mapping of Windows event IDs to severity levels
        self.event_severity_map = {
            # Security related events
            4624: "info",     # Successful login
            4625: "warning",  # Failed login
            4648: "warning",  # Explicit credentials login
            4634: "info",     # Logoff
            4647: "info",     # User initiated logoff
            4672: "warning",  # Special privileges assigned
            4720: "info",     # User account created
            4725: "warning",  # User account disabled
            4728: "warning",  # Member added to security-enabled global group
            4732: "warning",  # Member added to security-enabled local group
            4756: "warning",  # Member added to security-enabled universal group
            5152: "warning",  # Windows Filtering Platform blocked a packet
            5157: "warning",  # Windows Filtering Platform blocked a connection
            # System related events
            1074: "info",     # System shutdown
            6005: "info",     # Event log service started
            6006: "warning",  # Event log service stopped
            6008: "error",    # Unexpected shutdown
            7036: "info",     # Service started or stopped
            7040: "warning",  # Service start type changed
            7045: "warning",  # New service installed
            # Application related events
            1000: "error",    # Application crash
            1001: "error",    # Application error
            1002: "error",    # Application hang
            11707: "info",    # Install completed successfully
            11708: "error",   # Install failed
            11724: "info",    # Uninstall completed successfully
        }
        
        # Track last read event for each source
        self.last_read_events = {}
        
        logger.info("Log collector initialized")
    
    async def store_log(self, db, log_entry: LogEntry) -> LogEntry:
        """Store a log entry in the database"""
        try:
            # Convert Pydantic model to SQLAlchemy model
            db_log = LogEntryModel(
                id=log_entry.id,
                timestamp=log_entry.timestamp,
                source=log_entry.source,
                level=log_entry.level,
                message=log_entry.message,
                details=log_entry.details,
            )
            
            db.add(db_log)
            await db.commit()
            await db.refresh(db_log)
            
            return log_entry
        except Exception as e:
            await db.rollback()
            logger.error(f"Error storing log: {str(e)}")
            raise
    
    async def get_logs(
        self, 
        db, 
        limit: int = 50,
        source: Optional[str] = None,
        level: Optional[str] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> List[LogEntry]:
        """Retrieve logs with optional filtering"""
        try:
            query = db.query(LogEntryModel)
            
            if source:
                query = query.filter(LogEntryModel.source.contains(source))
            
            if level:
                query = query.filter(LogEntryModel.level == level)
                
            if start_time:
                query = query.filter(LogEntryModel.timestamp >= start_time)
                
            if end_time:
                query = query.filter(LogEntryModel.timestamp <= end_time)
            
            # Order by timestamp descending (newest first)
            query = query.order_by(LogEntryModel.timestamp.desc()).limit(limit)
            
            result = await query.all()
            
            # Convert SQLAlchemy models to Pydantic models
            logs = [
                LogEntry(
                    id=log.id,
                    timestamp=log.timestamp,
                    source=log.source,
                    level=log.level,
                    message=log.message,
                    details=log.details
                )
                for log in result
            ]
            
            return logs
        except Exception as e:
            logger.error(f"Error retrieving logs: {str(e)}")
            raise
    
    async def get_recent_logs(self, db, limit: int = 100) -> List[LogEntry]:
        """Get the most recent logs for analysis"""
        return await self.get_logs(db, limit=limit)
    
    async def collect_windows_events(self) -> List[LogEntry]:
        """Collect logs from Windows Event Log (only runs on Windows)"""
        if os.name != 'nt':
            logger.warning("Windows Event Log collection attempted on non-Windows system")
            return []
        
        collected_logs = []
        
        try:
            for source in self.windows_sources:
                logs = await self._read_event_log(source)
                collected_logs.extend(logs)
                
            # Store these logs in the database
            db = next(get_db())
            for log in collected_logs:
                await self.store_log(db, log)
                
            return collected_logs
        except Exception as e:
            logger.error(f"Error collecting Windows events: {str(e)}")
            return []
    
    async def _read_event_log(self, log_type: str) -> List[LogEntry]:
        """Read a specific Windows event log"""
        logs = []
        
        try:
            # Open the event log
            hand = win32evtlog.OpenEventLog(None, log_type)
            
            # Get the number of records
            total_records = win32evtlog.GetNumberOfEventLogRecords(hand)
            
            # Set flags for reading
            flags = win32evtlog.EVENTLOG_BACKWARDS_READ | win32evtlog.EVENTLOG_SEQUENTIAL_READ
            
            # Track the last record we've seen for this source
            last_record = self.last_read_events.get(log_type, 0)
            
            # Read events
            events = win32evtlog.ReadEventLog(hand, flags, 0)
            
            for event in events:
                # Skip if we've already processed this record
                if event.RecordNumber <= last_record:
                    continue
                
                # Update last record seen
                self.last_read_events[log_type] = event.RecordNumber
                
                # Map Windows event level to our log levels
                level = "info"
                if event.EventType == win32evtlog.EVENTLOG_ERROR_TYPE:
                    level = "error"
                elif event.EventType == win32evtlog.EVENTLOG_WARNING_TYPE:
                    level = "warning"
                
                # Check if this event ID has a specific severity
                if event.EventID in self.event_severity_map:
                    level = self.event_severity_map[event.EventID]
                
                # Create log entry
                log_entry = LogEntry(
                    source=f"Windows-{log_type}",
                    level=level,
                    message=str(event.StringInserts) if event.StringInserts else f"Event ID: {event.EventID}",
                    details={
                        "event_id": event.EventID,
                        "category": event.EventCategory,
                        "source_name": event.SourceName,
                        "computer_name": event.ComputerName,
                        "record_number": event.RecordNumber,
                        "time_generated": event.TimeGenerated.strftime("%Y-%m-%d %H:%M:%S"),
                    }
                )
                
                logs.append(log_entry)
            
            # Close the event log
            win32evtlog.CloseEventLog(hand)
            
        except Exception as e:
            logger.error(f"Error reading Windows event log {log_type}: {str(e)}")
        
        return logs

    async def generate_simulated_logs(self, count: int = 10) -> List[LogEntry]:
        """Generate simulated logs for testing"""
        logs = []
        sources = [
            "Windows-Security", "Windows-System", "Windows-Application",
            "AWS-CloudTrail", "AWS-GuardDuty", "AWS-SecurityHub",
            "Network-Firewall", "Network-IDS", "Network-Router",
            "Database-MySQL", "Database-PostgreSQL", "Database-SQLServer"
        ]
        
        levels = ["info", "warning", "error"]
        
        messages = [
            "User login attempt", "Failed authentication", "Successful login",
            "File access", "Configuration change", "Service started",
            "Service stopped", "Network connection", "Resource usage spike",
            "Database query", "API access", "Password change",
            "Group membership change", "Scheduled task execution", "System update"
        ]
        
        # Generate random logs
        for _ in range(count):
            source = random.choice(sources)
            level = random.choice(levels)
            
            # Make some levels more likely for certain sources
            if "Security" in source and random.random() < 0.7:
                level = random.choice(["warning", "error"])
            
            # Customize message based on source and level
            base_message = random.choice(messages)
            if level == "error":
                message = f"ERROR: {base_message} failed"
            elif level == "warning":
                message = f"WARNING: Suspicious {base_message} detected"
            else:
                message = f"INFO: {base_message} completed successfully"
                
            # Add some specific details
            details = {
                "ip_address": f"192.168.1.{random.randint(2, 254)}",
                "user": f"user{random.randint(1, 20)}",
                "duration_ms": random.randint(10, 5000)
            }
            
            # Add source-specific details
            if "Windows" in source:
                details["event_id"] = random.randint(1000, 9999)
                details["process_id"] = random.randint(1000, 50000)
            elif "AWS" in source:
                details["region"] = random.choice(["us-east-1", "us-west-2", "eu-west-1"])
                details["resource_id"] = f"i-{uuid.uuid4().hex[:8]}"
            elif "Network" in source:
                details["protocol"] = random.choice(["TCP", "UDP", "HTTP", "HTTPS"])
                details["port"] = random.choice([22, 80, 443, 3389, 8080])
            elif "Database" in source:
                details["query_type"] = random.choice(["SELECT", "INSERT", "UPDATE", "DELETE"])
                details["table"] = random.choice(["users", "orders", "products", "logs"])
            
            # Create timestamp with slight randomization
            timestamp = datetime.now() - timedelta(
                seconds=random.randint(1, 3600),  # Up to 1 hour ago
                microseconds=random.randint(0, 999999)
            )
            
            log_entry = LogEntry(
                timestamp=timestamp,
                source=source,
                level=level,
                message=message,
                details=details
            )
            
            logs.append(log_entry)
        
        # Store these logs in the database
        db = next(get_db())
        for log in logs:
            await self.store_log(db, log)
        
        return logs
    
    async def get_system_stats(self, db) -> SystemStats:
        """Get system statistics"""
        try:
            # Count total logs
            total_logs = await db.query(func.count(LogEntryModel.id)).scalar()
            
            # Count logs from today
            today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            logs_today = await db.query(func.count(LogEntryModel.id)).filter(
                LogEntryModel.timestamp >= today_start
            ).scalar()
            
            # Count active threats
            active_threats = await db.query(func.count(ThreatModel.id)).filter(
                ThreatModel.status == "active"
            ).scalar()
            
            # Count resolved threats
            resolved_threats = await db.query(func.count(ThreatModel.id)).filter(
                ThreatModel.status == "resolved"
            ).scalar()
            
            # Count anomalies (threats with anomaly score above threshold)
            anomaly_count = await db.query(func.count(ThreatModel.id)).filter(
                ThreatModel.anomaly_score > 0.6
            ).scalar()
            
            # Determine system health
            if active_threats > 5:
                system_health = "critical"
            elif active_threats > 2:
                system_health = "warning"
            else:
                system_health = "healthy"
            
            # Agent status
            agent_status = {
                "SentinelCore": "active",
                "LogCollector": "active",
                "AnomalyDetector": "active",
                "ResponseManager": "active",
                "EventMonitor": "active",
                "CommandExecutor": "idle"
            }
            
            return SystemStats(
                total_logs=total_logs,
                logs_today=logs_today,
                active_threats=active_threats,
                resolved_threats=resolved_threats,
                anomaly_count=anomaly_count,
                system_health=system_health,
                agent_status=agent_status
            )
        except Exception as e:
            logger.error(f"Error getting system stats: {str(e)}")
            
            # Return fallback stats
            return SystemStats(
                total_logs=0,
                logs_today=0,
                active_threats=0,
                resolved_threats=0,
                anomaly_count=0,
                system_health="unknown",
                agent_status={
                    "SentinelCore": "unknown",
                    "LogCollector": "unknown",
                    "AnomalyDetector": "unknown",
                    "ResponseManager": "unknown",
                    "EventMonitor": "unknown",
                    "CommandExecutor": "unknown"
                }
            )
