
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any

from models.database import get_db
from services.credentials_manager import credentials_manager

router = APIRouter(
    prefix="/credentials",
    tags=["credentials"],
    responses={404: {"description": "Not found"}},
)

@router.get("/status", response_model=Dict[str, Any])
async def get_credentials_status(db: AsyncSession = Depends(get_db)):
    """Get the status of Azure and Gemini credentials"""
    try:
        status = credentials_manager.get_credentials_status()
        return status
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error checking credentials: {str(e)}"
        )

@router.get("/azure", response_model=Dict[str, Any])
async def get_azure_credentials(db: AsyncSession = Depends(get_db)):
    """Get the Azure credentials (metadata only, not the actual secrets)"""
    credentials = credentials_manager.load_azure_credentials()
    
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Azure credentials not found"
        )
    
    # Return only non-sensitive metadata
    return {
        "tenant_id": credentials.get("tenant_id", ""),
        "subscription_id": credentials.get("subscription_id", ""),
        "has_client_id": "client_id" in credentials,
        "has_client_secret": "client_secret" in credentials,
    }

@router.get("/gemini", response_model=Dict[str, Any])
async def get_gemini_api_key_info(db: AsyncSession = Depends(get_db)):
    """Get information about the Gemini API key (not the actual key)"""
    api_key = credentials_manager.load_gemini_api_key()
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gemini API key not found"
        )
    
    # Return only metadata, not the actual key
    return {
        "key_present": True,
        "key_length": len(api_key),
        "key_prefix": api_key[:8] + "..." if len(api_key) > 8 else "",
    }
