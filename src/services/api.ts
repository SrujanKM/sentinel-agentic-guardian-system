
import axios from 'axios';
import AzureLogSimulator from './azureLogSimulator';  // This was causing an error
import { format } from 'date-fns';

// Base URL for API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create a singleton instance of the log simulator
// This was causing an error as AzureLogSimulator is already instantiated in the module
const logSimulator = AzureLogSimulator;

// Setup axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Function to handle API errors
const handleApiError = (error) => {
  console.error('API Error:', error);
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
  } else if (error.request) {
    // The request was made but no response was received
    console.error('No response received:', error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Request error:', error.message);
  }
  
  // Return a standardized error object
  return {
    error: true,
    message: error.response?.data?.message || error.message || 'An unknown error occurred',
    statusCode: error.response?.status || 500
  };
};

// Fetch system status
export const fetchSystemStatus = async () => {
  try {
    const response = await apiClient.get('/system/status');
    return response.data;
  } catch (error) {
    console.info('Backend connection failed:', error.message);
    // Return mock data when API fails
    return {
      status: 'active',
      cpu_usage: Math.floor(Math.random() * 30) + 15,
      memory_usage: Math.floor(Math.random() * 40) + 25,
      storage_usage: Math.floor(Math.random() * 30) + 40,
      network_usage: Math.floor(Math.random() * 50) + 10,
      last_update: new Date().toISOString(),
      components: [
        { name: 'Log Collector', status: 'active', last_seen: new Date().toISOString() },
        { name: 'Analyzer', status: 'active', last_seen: new Date().toISOString() },
        { name: 'Database', status: 'active', last_seen: new Date().toISOString() },
        { name: 'Response System', status: 'active', last_seen: new Date().toISOString() }
      ]
    };
  }
};

// Fetch threats
export const fetchThreats = async (params = {}) => {
  try {
    const response = await apiClient.get('/threats', { params });
    return response.data;
  } catch (error) {
    console.info('Using simulated threat data');
    // Return simulated threats
    return logSimulator.getGeneratedThreats();
  }
};

// Fetch logs
export const fetchLogs = async (params = {}) => {
  try {
    const response = await apiClient.get('/logs', { params });
    return response.data;
  } catch (error) {
    console.info('Using simulated log data');
    // Generate some new logs before returning them
    if (!params.noGeneration) {
      logSimulator.generateRandomLogs(5); // Generate 5 new logs
    }
    // Return simulated logs
    return logSimulator.getLogs();
  }
};

// Fetch agent status
export const fetchAgentStatus = async () => {
  try {
    const response = await apiClient.get('/agents/status');
    return response.data;
  } catch (error) {
    // Return mock data when API fails
    return [
      {
        id: 'agent-001',
        hostname: 'server-prod-01',
        ip: '10.0.1.15',
        status: 'active',
        cpu_usage: Math.floor(Math.random() * 30) + 5,
        memory_usage: Math.floor(Math.random() * 40) + 20,
        last_seen: new Date().toISOString(),
        version: '2.1.0',
      },
      {
        id: 'agent-002',
        hostname: 'server-prod-02', 
        ip: '10.0.1.16',
        status: 'active',
        cpu_usage: Math.floor(Math.random() * 30) + 5,
        memory_usage: Math.floor(Math.random() * 40) + 20,
        last_seen: new Date().toISOString(),
        version: '2.1.0',
      },
      {
        id: 'agent-003',
        hostname: 'db-server-01',
        ip: '10.0.1.20',
        status: 'active',
        cpu_usage: Math.floor(Math.random() * 30) + 5,
        memory_usage: Math.floor(Math.random() * 40) + 20,
        last_seen: new Date().toISOString(),
        version: '2.1.0',
      },
      {
        id: 'agent-004',
        hostname: 'app-server-01',
        ip: '10.0.1.25',
        status: 'warning',
        cpu_usage: Math.floor(Math.random() * 30) + 60,
        memory_usage: Math.floor(Math.random() * 20) + 70,
        last_seen: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        version: '2.0.9',
      },
      {
        id: 'agent-005',
        hostname: 'gateway-01',
        ip: '10.0.1.1',
        status: 'active',
        cpu_usage: Math.floor(Math.random() * 30) + 5,
        memory_usage: Math.floor(Math.random() * 40) + 20,
        last_seen: new Date().toISOString(),
        version: '2.1.0',
      }
    ];
  }
};

// Trigger an action (e.g. responding to threat, etc.)
export const triggerAction = async (actionData) => {
  try {
    const response = await apiClient.post('/actions', actionData);
    return response.data;
  } catch (error) {
    console.info('Simulating action response');
    // Simulate action response
    return {
      success: true,
      action_id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      message: `Action ${actionData.action_type} initiated successfully`
    };
  }
};

// Fetch analytics data
export const fetchAnalytics = async (params = {}) => {
  try {
    const response = await apiClient.get('/analytics', { params });
    return response.data;
  } catch (error) {
    console.info('Using mock analytics data');
    // Generate mock analytics data
    const today = new Date();
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(today.getDate() - (6 - i));
      return format(date, 'yyyy-MM-dd');
    });
    
    return {
      threat_distribution: [
        { name: 'Malware', value: Math.floor(Math.random() * 20) + 10 },
        { name: 'Brute Force', value: Math.floor(Math.random() * 15) + 5 },
        { name: 'Unauthorized Access', value: Math.floor(Math.random() * 10) + 8 },
        { name: 'Data Exfiltration', value: Math.floor(Math.random() * 8) + 3 },
        { name: 'Privilege Escalation', value: Math.floor(Math.random() * 5) + 2 },
        { name: 'Anomaly', value: Math.floor(Math.random() * 10) + 5 }
      ],
      detection_timeline: dates.map(date => ({
        date,
        threats: Math.floor(Math.random() * 10) + 1,
        resolved: Math.floor(Math.random() * 8)
      })),
      source_breakdown: [
        { name: 'Endpoint Security', value: Math.floor(Math.random() * 30) + 20 },
        { name: 'Network Traffic', value: Math.floor(Math.random() * 25) + 15 },
        { name: 'Authentication Logs', value: Math.floor(Math.random() * 20) + 10 },
        { name: 'Cloud Services', value: Math.floor(Math.random() * 15) + 5 },
        { name: 'User Reports', value: Math.floor(Math.random() * 10) + 2 }
      ],
      risk_levels: [
        { name: 'Critical', value: Math.floor(Math.random() * 10) + 2 },
        { name: 'High', value: Math.floor(Math.random() * 15) + 8 },
        { name: 'Medium', value: Math.floor(Math.random() * 20) + 10 },
        { name: 'Low', value: Math.floor(Math.random() * 25) + 15 }
      ],
      anomaly_scores: dates.map(date => ({
        date,
        score: Math.random() * 0.8 + 0.1
      })),
      detection_accuracy: {
        true_positives: Math.floor(Math.random() * 50) + 70,
        false_positives: Math.floor(Math.random() * 20) + 5,
        true_negatives: Math.floor(Math.random() * 100) + 100,
        false_negatives: Math.floor(Math.random() * 10) + 1
      },
      response_times: Array.from({ length: 5 }, (_, i) => ({
        date: dates[i + 2],
        avg_time: Math.floor(Math.random() * 10) + 2,
        min_time: Math.floor(Math.random() * 1) + 1,
        max_time: Math.floor(Math.random() * 20) + 15
      })),
      source_activity: dates.map(date => ({
        date,
        endpoint: Math.floor(Math.random() * 15) + 5,
        network: Math.floor(Math.random() * 20) + 10,
        authentication: Math.floor(Math.random() * 10) + 3,
        cloud: Math.floor(Math.random() * 8) + 2
      }))
    };
  }
};
