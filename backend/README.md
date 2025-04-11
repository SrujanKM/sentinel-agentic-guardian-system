
# SENTINEL AGS - Python Security Backend

This backend implements a Python-based intelligent security system powered by Agentic AI. It continuously monitors real-time Windows Event Logs, simulates logs from various sources, and provides a FastAPI REST API for integration with the frontend dashboard.

## Features

- Real-time Windows Event Log collection using pywin32
- SQLite database with encryption for secure log storage
- FastAPI backend with REST endpoints
- Isolation Forest anomaly detection for identifying unusual patterns
- Automated response system for high-risk threats
- Background analysis task that runs periodically

## Installation

1. Clone the repository
2. Install required dependencies:

```bash
pip install -r requirements.txt
```

## Usage

Start the FastAPI server:

```bash
cd backend
python main.py
```

The server will run at http://localhost:8000 by default.

## API Endpoints

- `GET /logs`: Fetch logs with filtering options
- `POST /logs`: Submit new log entries
- `GET /threats`: Retrieve detected threats
- `POST /actions`: Trigger security actions
- `GET /stats`: Get system statistics

## Documentation

Once the server is running, you can access:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

- `main.py`: FastAPI application and API routes
- `models/`: Database models and schemas
- `services/`: Core functionality implementation
  - `log_collector.py`: Collects logs from various sources
  - `anomaly_detector.py`: Detects anomalies using Isolation Forest
  - `response_manager.py`: Handles automated responses to threats

## Windows Event Log Collection

On Windows systems, the application will automatically collect event logs from the following sources:
- Application
- System
- Security
- Microsoft-Windows-Sysmon/Operational
- Microsoft-Windows-PowerShell/Operational

## Security Features

- Log encryption using Fernet symmetric encryption
- Secure password hashing
- Automated threat response
- Continuous monitoring of system events

## Requirements

- Python 3.8+
- Windows OS (for Windows Event Log collection)
- Required Python packages listed in requirements.txt
