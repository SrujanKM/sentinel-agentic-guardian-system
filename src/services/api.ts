
import axios from 'axios';
import AzureLogSimulator from './azureLogSimulator';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
// Initialize the simulator
const azureLogSimulator = new AzureLogSimulator();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Backend API connection state
let isBackendConnected = null;
let lastConnectionAttempt = 0;
const CONNECTION_RETRY_INTERVAL = 30000; // 30 seconds

// Check backend connection
const checkBackendConnection = async () => {
  const now = Date.now();
  if (isBackendConnected !== null && now - lastConnectionAttempt < CONNECTION_RETRY_INTERVAL) {
    return isBackendConnected;
  }
  
  lastConnectionAttempt = now;
  
  try {
    await api.get('/', { timeout: 5000 });
    isBackendConnected = true;
    return true;
  } catch (error) {
    console.log('Backend connection failed:', error.message);
    isBackendConnected = false;
    return false;
  }
};

// Get Azure credentials
const getAzureCredentials = async () => {
  try {
    if (await checkBackendConnection()) {
      const response = await api.get('/credentials/azure');
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching Azure credentials:', error);
    return null;
  }
};

// Get Gemini API key
const getGeminiApiKey = async () => {
  try {
    if (await checkBackendConnection()) {
      const response = await api.get('/credentials/gemini');
      return response.data.key;
    }
    return null;
  } catch (error) {
    console.error('Error fetching Gemini API key:', error);
    return null;
  }
};

// Logs API
export const fetchLogs = async (filters = {}) => {
  try {
    // Try to get logs from backend first
    if (await checkBackendConnection()) {
      const response = await api.get('/logs', { params: filters });
      return response.data;
    } else {
      // Use simulator if backend is not available
      // Generate some new logs to have fresh data
      azureLogSimulator.generateRandomLogs(Math.floor(Math.random() * 3) + 2);
      return azureLogSimulator.getLogs();
    }
  } catch (error) {
    console.error('Error fetching logs:', error);
    // Fallback to simulator
    return azureLogSimulator.getLogs();
  }
};

export const submitLog = async (logData) => {
  try {
    if (await checkBackendConnection()) {
      const response = await api.post('/logs', logData);
      return response.data;
    } else {
      // Simulate log submission
      console.log('Simulating log submission:', logData);
      return { success: true, message: 'Log submitted (simulated)' };
    }
  } catch (error) {
    console.error('Error submitting log:', error);
    throw error;
  }
};

// Threats API
export const fetchThreats = async (filters = {}) => {
  try {
    if (await checkBackendConnection()) {
      const response = await api.get('/threats', { params: filters });
      return response.data;
    } else {
      // Use simulator if backend is not available
      return azureLogSimulator.getGeneratedThreats();
    }
  } catch (error) {
    console.error('Error fetching threats:', error);
    // Fallback to simulator
    return azureLogSimulator.getGeneratedThreats();
  }
};

// Actions API
export const triggerAction = async (actionData) => {
  try {
    if (await checkBackendConnection()) {
      const response = await api.post('/actions', actionData);
      return response.data;
    } else {
      // Simulate action trigger
      console.log('Simulating action trigger:', actionData);
      return { 
        success: true, 
        message: 'Action triggered (simulated)',
        result: {
          action_id: Math.random().toString(36).substring(2, 10),
          timestamp: new Date().toISOString(),
          status: 'completed'
        }
      };
    }
  } catch (error) {
    console.error('Error triggering action:', error);
    throw error;
  }
};

// System Stats API
export const fetchSystemStats = async () => {
  try {
    if (await checkBackendConnection()) {
      const response = await api.get('/stats');
      return response.data;
    } else {
      // Generate simulated system stats
      const threats = azureLogSimulator.getGeneratedThreats();
      const logs = azureLogSimulator.getLogs();
      
      return {
        total_logs: logs.length,
        logs_today: Math.floor(logs.length * 0.7),
        active_threats: threats.filter(t => t.status === 'active').length,
        resolved_threats: threats.filter(t => t.status === 'resolved').length,
        anomaly_count: Math.floor(Math.random() * 10) + 5,
        system_health: threats.filter(t => t.status === 'active' && (t.severity === 'critical' || t.severity === 'high')).length > 2 
          ? 'warning' 
          : 'healthy',
        agent_status: {
          SentinelCore: 'active',
          LogCollector: 'active',
          AnomalyDetector: 'active',
          ResponseManager: 'active',
          EventMonitor: 'active',
          CommandExecutor: Math.random() > 0.5 ? 'active' : 'idle'
        }
      };
    }
  } catch (error) {
    console.error('Error fetching system stats:', error);
    
    // Return fallback stats
    return {
      total_logs: 250,
      logs_today: 75,
      active_threats: 3,
      resolved_threats: 12,
      anomaly_count: 8,
      system_health: 'warning',
      agent_status: {
        SentinelCore: 'active',
        LogCollector: 'active',
        AnomalyDetector: 'active',
        ResponseManager: 'active',
        EventMonitor: 'active',
        CommandExecutor: 'idle'
      }
    };
  }
};

// Get connection status for backend
export const getBackendStatus = async () => {
  const isConnected = await checkBackendConnection();
  return {
    connected: isConnected,
    url: API_URL,
    lastChecked: new Date().toISOString()
  };
};

// Check credential status
export const checkCredentialStatus = async () => {
  try {
    if (await checkBackendConnection()) {
      const response = await api.get('/credentials/status');
      return response.data;
    } else {
      // Simulate credentials status
      return {
        azure: { present: true, valid: true },
        gemini: { present: true, valid: true }
      };
    }
  } catch (error) {
    console.error('Error checking credential status:', error);
    return {
      azure: { present: true, valid: true },
      gemini: { present: true, valid: true }
    };
  }
};

export default api;
