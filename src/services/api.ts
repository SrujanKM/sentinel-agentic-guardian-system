
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Logs API
export const fetchLogs = async (filters = {}) => {
  const response = await api.get('/logs', { params: filters });
  return response.data;
};

export const submitLog = async (logData) => {
  const response = await api.post('/logs', logData);
  return response.data;
};

// Threats API
export const fetchThreats = async (filters = {}) => {
  const response = await api.get('/threats', { params: filters });
  return response.data;
};

// Actions API
export const triggerAction = async (actionData) => {
  const response = await api.post('/actions', actionData);
  return response.data;
};

// System Stats API
export const fetchSystemStats = async () => {
  const response = await api.get('/stats');
  return response.data;
};

export default api;
