
import os
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.asyncio import AsyncEngine
from cryptography.fernet import Fernet
import sqlite3
import contextlib
from loguru import logger

# Generate encryption key or load existing one
def get_encryption_key():
    key_file = "db_key.key"
    if os.path.exists(key_file):
        with open(key_file, "rb") as f:
            return f.read()
    else:
        key = Fernet.generate_key()
        with open(key_file, "wb") as f:
            f.write(key)
        return key

# Create encryption instance
ENCRYPTION_KEY = get_encryption_key()
fernet = Fernet(ENCRYPTION_KEY)

# SQLite database with encryption
SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///./sentinel_security.db"

engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

# Create a custom SQLite database with encryption for raw queries if needed
def get_encrypted_connection():
    conn = sqlite3.connect("sentinel_security.db")
    
    # Create encryption functions
    conn.create_function("encrypt", 1, lambda s: fernet.encrypt(s.encode()).decode())
    conn.create_function("decrypt", 1, lambda s: fernet.decrypt(s.encode()).decode())
    
    return conn

# Session for async SQLAlchemy
SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine, 
    class_=AsyncSession
)

Base = declarative_base()

# Dependency for database access
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Database initialization
async def init_db():
    async with engine.begin() as conn:
        # Create tables if they don't exist
        await conn.run_sync(Base.metadata.create_all)
    
    logger.info("Database tables created")
