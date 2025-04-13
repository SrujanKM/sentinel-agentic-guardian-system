
# Sentinel AGS - Backend

This is the backend for the Sentinel AGS security system, providing real-time detection and response to Azure cloud security threats.

## Features

- Collects and analyzes Azure cloud logs
- Uses Isolation Forest algorithm for anomaly detection
- Encrypts and stores logs in SQLite database
- FastAPI REST endpoints for frontend communication
- Automated response to detected threats
- Integration with Gemini AI for enhanced threat analysis

## Setup Instructions

### Prerequisites

- Python 3.9 or higher
- Pip package manager
- Azure account with active subscription
- Gemini API key (for AI-powered analysis)

### Installation

1. Clone this repository
2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install required packages:
   ```
   pip install -r requirements.txt
   ```

### Credentials Setup

The system requires Azure credentials and a Gemini API key to fully function. You can set these up using the provided script:

```bash
python scripts/setup_credentials.py --azure-creds /path/to/azure_credentials.json --gemini-key YOUR_GEMINI_API_KEY
```

#### Azure Credentials File Format

The Azure credentials file should be a JSON file with the following format:

```json
{
  "client_id": "YOUR_AZURE_CLIENT_ID",
  "client_secret": "YOUR_AZURE_CLIENT_SECRET",
  "tenant_id": "YOUR_AZURE_TENANT_ID",
  "subscription_id": "YOUR_AZURE_SUBSCRIPTION_ID"
}
```

To obtain these credentials:
1. Sign in to the Azure portal
2. Create a new App Registration in Azure Active Directory
3. Create a client secret for the application
4. Grant appropriate permissions to the app for monitoring resources
5. Note the subscription ID and tenant ID from your account

#### Gemini API Key

To obtain a Gemini API key:
1. Sign up at https://aistudio.google.com/
2. Navigate to API keys section
3. Create a new API key
4. Copy the key starting with "Gemini-"

### Running the Backend

Start the backend server:

```bash
cd backend
python main.py
```

The server will run on http://localhost:8000 by default.

## API Documentation

Once the server is running, API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Development

### Project Structure

- `main.py` - FastAPI application entry point
- `models/` - Database models and schemas
- `services/` - Core business logic components
  - `log_collector.py` - Collects Azure logs
  - `anomaly_detector.py` - Detects anomalies in logs
  - `response_manager.py` - Executes responses to threats
  - `credentials_manager.py` - Manages secure credentials
- `routes/` - API endpoint definitions
- `scripts/` - Utility scripts

### Adding New Features

When adding new features:
1. Update the appropriate service in the `services/` directory
2. Add any new models to `models/`
3. Create new API endpoints in `routes/` if needed
4. Update the main application in `main.py`

## Security Notes

- Credential files will be stored in the `credentials/` directory with restricted permissions
- All communication with Azure APIs is done securely using the official Azure SDKs
- Logs containing sensitive information are encrypted in the database
