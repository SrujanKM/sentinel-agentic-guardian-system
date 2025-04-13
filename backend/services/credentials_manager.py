
import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class CredentialsManager:
    """Manage secure access to Azure and Gemini credentials"""
    
    def __init__(self, credentials_dir: str = None):
        """Initialize the credentials manager with the directory location"""
        self.credentials_dir = credentials_dir or os.environ.get('CREDENTIALS_DIR', './credentials')
        self._azure_credentials = None
        self._gemini_api_key = None
        
        # Ensure the credentials directory exists
        Path(self.credentials_dir).mkdir(parents=True, exist_ok=True)
    
    def load_azure_credentials(self) -> Optional[Dict[str, Any]]:
        """Load Azure credentials from file"""
        if self._azure_credentials is not None:
            return self._azure_credentials
            
        credentials_path = os.path.join(self.credentials_dir, 'azure_credentials.json')
        
        if not os.path.exists(credentials_path):
            logger.warning(f"Azure credentials file not found at {credentials_path}")
            return None
            
        try:
            with open(credentials_path, 'r') as f:
                self._azure_credentials = json.load(f)
            logger.info("Azure credentials loaded successfully")
            return self._azure_credentials
        except Exception as e:
            logger.error(f"Error loading Azure credentials: {str(e)}")
            return None
    
    def load_gemini_api_key(self) -> Optional[str]:
        """Load Gemini API key from file"""
        if self._gemini_api_key is not None:
            return self._gemini_api_key
            
        key_path = os.path.join(self.credentials_dir, 'gemini_api_key.txt')
        
        if not os.path.exists(key_path):
            logger.warning(f"Gemini API key file not found at {key_path}")
            return None
            
        try:
            with open(key_path, 'r') as f:
                self._gemini_api_key = f.read().strip()
            logger.info("Gemini API key loaded successfully")
            return self._gemini_api_key
        except Exception as e:
            logger.error(f"Error loading Gemini API key: {str(e)}")
            return None
    
    def validate_azure_credentials(self) -> bool:
        """Validate Azure credentials by attempting to connect"""
        credentials = self.load_azure_credentials()
        if not credentials:
            return False
            
        # TODO: Implement actual validation with Azure SDK
        # For now, just check if required fields exist
        required_fields = ['client_id', 'client_secret', 'tenant_id', 'subscription_id']
        has_required_fields = all(field in credentials for field in required_fields)
        
        if has_required_fields:
            logger.info("Azure credentials validation passed")
            return True
        else:
            logger.warning("Azure credentials missing required fields")
            return False
    
    def validate_gemini_api_key(self) -> bool:
        """Validate Gemini API key by checking format"""
        api_key = self.load_gemini_api_key()
        if not api_key:
            return False
            
        # Check if key has the proper format
        # This is a simple check - in reality, a test API call would be better
        if api_key.startswith('Gemini-') and len(api_key) > 20:
            logger.info("Gemini API key validation passed")
            return True
        else:
            logger.warning("Gemini API key format validation failed")
            return False
    
    def get_credentials_status(self) -> Dict[str, Any]:
        """Get status of both credentials"""
        azure_present = self.load_azure_credentials() is not None
        gemini_present = self.load_gemini_api_key() is not None
        
        azure_valid = self.validate_azure_credentials() if azure_present else False
        gemini_valid = self.validate_gemini_api_key() if gemini_present else False
        
        return {
            "azure": {
                "present": azure_present,
                "valid": azure_valid
            },
            "gemini": {
                "present": gemini_present,
                "valid": gemini_valid
            }
        }

# Create a singleton instance
credentials_manager = CredentialsManager()
