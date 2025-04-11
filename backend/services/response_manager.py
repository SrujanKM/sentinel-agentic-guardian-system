
import asyncio
import os
import json
import subprocess
from datetime import datetime
from typing import Dict, Any, List, Optional
from loguru import logger

from models.models import ThreatModel, ActionModel
from models.schemas import Threat, ActionRequest

class ResponseManager:
    def __init__(self):
        """Initialize the response manager for automated security actions"""
        self.response_rules = {
            "brute force": "block_ip",
            "malware": "quarantine",
            "unauthorized access": "kill_process",
            "anomaly": "custom"
        }
        logger.info("Response manager initialized")
    
    async def handle_threat(self, threat: Threat) -> Dict[str, Any]:
        """Handle a detected threat with appropriate response"""
        try:
            # Determine appropriate action based on threat type
            action_type = self.response_rules.get(threat.type.lower(), "custom")
            
            # Create action request
            action_request = ActionRequest(
                threat_id=threat.id,
                action_type=action_type,
                parameters={
                    "severity": threat.severity,
                    "source": threat.source,
                    "indicators": threat.indicators
                }
            )
            
            # Execute the action
            result = await self.execute_action(action_request)
            
            # Update threat with action information
            if threat.actions is None:
                threat.actions = []
            
            threat.actions.append(f"{action_type} executed at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            
            # Store updated threat information
            db = next(get_db())
            db_threat = await db.query(ThreatModel).filter(ThreatModel.id == threat.id).first()
            if db_threat:
                db_threat.actions = threat.actions
                if action_type == "quarantine" or action_type == "block_ip":
                    db_threat.status = "contained"
                await db.commit()
            
            return {"message": "Threat handled", "action": action_type, "result": result}
        except Exception as e:
            logger.error(f"Error handling threat: {str(e)}")
            return {"message": "Error handling threat", "error": str(e)}
    
    async def execute_action(self, action: ActionRequest) -> Dict[str, Any]:
        """Execute a security action"""
        try:
            # Record the action in the database
            db = next(get_db())
            db_action = ActionModel(
                threat_id=action.threat_id,
                action_type=action.action_type,
                parameters=action.parameters,
                status="in_progress",
                result=None
            )
            db.add(db_action)
            await db.commit()
            await db.refresh(db_action)
            
            # Execute different actions based on type
            result = None
            if action.action_type == "block_ip":
                result = await self._block_ip(action.parameters)
            elif action.action_type == "quarantine":
                result = await self._quarantine_file(action.parameters)
            elif action.action_type == "restart_service":
                result = await self._restart_service(action.parameters)
            elif action.action_type == "kill_process":
                result = await self._kill_process(action.parameters)
            else:  # custom
                result = await self._custom_action(action.parameters)
            
            # Update the action status in the database
            db_action.status = "completed"
            db_action.result = result
            await db.commit()
            
            logger.info(f"Executed action {action.action_type} for threat {action.threat_id}")
            return result
        except Exception as e:
            logger.error(f"Error executing action: {str(e)}")
            
            # Update action status on error
            try:
                db_action.status = "failed"
                db_action.result = {"error": str(e)}
                await db.commit()
            except Exception as db_err:
                logger.error(f"Error updating action status: {str(db_err)}")
            
            return {"error": str(e)}
    
    async def _block_ip(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Simulate blocking an IP address
        In a real system, this would interact with firewall or security appliances
        """
        try:
            # Extract IP from indicators if present
            ip_address = None
            if "indicators" in parameters and parameters["indicators"]:
                for indicator in parameters["indicators"]:
                    if indicator.startswith("IP address:"):
                        ip_address = indicator.split(":")[1].strip()
            
            if not ip_address and "ip_address" in parameters:
                ip_address = parameters["ip_address"]
            
            if not ip_address:
                # Use a placeholder IP if not found
                ip_address = "192.168.1.100"
            
            # Simulate action - in production would call actual firewall APIs or run firewall commands
            logger.info(f"SIMULATED: Blocking IP {ip_address}")
            
            # Simulate a delay as if communicating with a firewall
            await asyncio.sleep(1)
            
            return {
                "status": "success",
                "action": "block_ip",
                "ip_address": ip_address,
                "message": f"IP address {ip_address} has been blocked",
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error in block_ip action: {str(e)}")
            raise
    
    async def _quarantine_file(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Simulate quarantining a suspicious file
        In a real system, this would move the file to a secure location or container
        """
        try:
            # Extract file path from parameters if present
            file_path = parameters.get("file_path", "/simulated/path/suspicious_file.exe")
            
            # Simulate action
            logger.info(f"SIMULATED: Quarantining file {file_path}")
            
            # Simulate a delay
            await asyncio.sleep(1.5)
            
            return {
                "status": "success",
                "action": "quarantine",
                "file_path": file_path,
                "quarantine_location": "/secured/quarantine/",
                "message": f"File {file_path} has been quarantined",
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error in quarantine_file action: {str(e)}")
            raise
    
    async def _restart_service(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Simulate restarting a service
        In a real system, this would use system commands to restart services
        """
        try:
            # Extract service name from parameters
            service_name = parameters.get("service_name", "simulated_service")
            
            # Simulate action
            logger.info(f"SIMULATED: Restarting service {service_name}")
            
            # Simulate a delay
            await asyncio.sleep(2)
            
            return {
                "status": "success",
                "action": "restart_service",
                "service_name": service_name,
                "message": f"Service {service_name} has been restarted",
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error in restart_service action: {str(e)}")
            raise
    
    async def _kill_process(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Simulate killing a suspicious process
        In a real system, this would use OS commands to terminate processes
        """
        try:
            # Extract process ID from parameters
            process_id = parameters.get("process_id", 12345)
            
            # Simulate action
            logger.info(f"SIMULATED: Killing process {process_id}")
            
            # Simulate a delay
            await asyncio.sleep(1)
            
            return {
                "status": "success",
                "action": "kill_process",
                "process_id": process_id,
                "message": f"Process {process_id} has been terminated",
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error in kill_process action: {str(e)}")
            raise
    
    async def _custom_action(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a custom action based on parameters
        This is a flexible function for handling various response types
        """
        try:
            # Extract action details from parameters
            action_name = parameters.get("action_name", "custom_investigation")
            
            # Simulate action
            logger.info(f"SIMULATED: Executing custom action {action_name}")
            
            # Simulate a delay
            await asyncio.sleep(1.5)
            
            return {
                "status": "success",
                "action": "custom",
                "action_name": action_name,
                "parameters": parameters,
                "message": f"Custom action {action_name} executed successfully",
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error in custom_action: {str(e)}")
            raise
