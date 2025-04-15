
import { faker } from '@faker-js/faker';
import AzureLogSimulator from './azureLogSimulator';

// Mocked API functions for fetching data
export async function fetchSystemStatus() {
  // Simulate API call latency
  await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));

  return {
    status: 'active',
    version: '1.5.3',
    activeServices: [
      { name: 'Threat Detection Engine', status: 'healthy', lastUpdated: new Date().toISOString() },
      { name: 'Log Collection Service', status: 'healthy', lastUpdated: new Date().toISOString() },
      { name: 'Anomaly Detection', status: 'healthy', lastUpdated: new Date().toISOString() },
      { name: 'Response Automation', status: 'healthy', lastUpdated: new Date().toISOString() }
    ],
    resources: {
      cpu: Math.random() * 5 + 1, // 1-6% CPU usage
      memory: Math.random() * 150 + 100, // 100-250MB memory usage
      disk: Math.random() * 10, // 0-10MB disk space
      network: Math.random() * 5 // 0-5KB/s network usage
    },
    uptime: 841200, // 9.74 days in seconds
    lastScan: new Date(Date.now() - 1000 * 60 * Math.random() * 60).toISOString() // 0-60 mins ago
  };
}

// Fetch logs with optional filters
export async function fetchLogs(options = {}) {
  const { limit = 30, source, level, fromDate, toDate } = options;
  
  // Simulate API call latency
  await new Promise(resolve => setTimeout(resolve, Math.random() * 800 + 200));
  
  // Get logs from our simulator
  const logs = AzureLogSimulator.getLogs();
  
  // Apply filters if provided
  let filteredLogs = [...logs];
  
  if (source) {
    filteredLogs = filteredLogs.filter(log => log.source.includes(source));
  }
  
  if (level) {
    filteredLogs = filteredLogs.filter(log => log.level === level);
  }
  
  if (fromDate) {
    const fromTimestamp = new Date(fromDate).getTime();
    filteredLogs = filteredLogs.filter(log => new Date(log.timestamp).getTime() >= fromTimestamp);
  }
  
  if (toDate) {
    const toTimestamp = new Date(toDate).getTime();
    filteredLogs = filteredLogs.filter(log => new Date(log.timestamp).getTime() <= toTimestamp);
  }
  
  // Sort by timestamp (newest first) and apply limit
  return filteredLogs
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

// Fetch threats with optional filters
export async function fetchThreats(options = {}) {
  const { limit = 20, severity, type, status, fromDate, toDate } = options;
  
  // Simulate API call latency
  await new Promise(resolve => setTimeout(resolve, Math.random() * 600 + 200));
  
  // Get threats from our simulator
  const threats = AzureLogSimulator.getGeneratedThreats();
  
  // Apply filters if provided
  let filteredThreats = [...threats];
  
  if (severity) {
    filteredThreats = filteredThreats.filter(threat => threat.severity === severity);
  }
  
  if (type) {
    filteredThreats = filteredThreats.filter(threat => threat.type === type);
  }
  
  if (status) {
    filteredThreats = filteredThreats.filter(threat => threat.status === status);
  }
  
  if (fromDate) {
    const fromTimestamp = new Date(fromDate).getTime();
    filteredThreats = filteredThreats.filter(threat => new Date(threat.timestamp).getTime() >= fromTimestamp);
  }
  
  if (toDate) {
    const toTimestamp = new Date(toDate).getTime();
    filteredThreats = filteredThreats.filter(threat => new Date(threat.timestamp).getTime() <= toTimestamp);
  }
  
  // Sort by timestamp (newest first) and apply limit
  return filteredThreats
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

// Trigger action against a threat or for the system
export async function triggerAction(actionDetails) {
  // Simulate API call latency
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1200 + 400));
  
  // Different responses based on action type
  switch (actionDetails.action_type) {
    case "respond_to_threat":
      // Simulate success response for responding to a threat
      return {
        success: true,
        action_id: faker.string.uuid(),
        timestamp: new Date().toISOString(),
        details: {
          threat_id: actionDetails.threat_id,
          status: "action_triggered",
          response_type: "automated",
          eta: "2 minutes"
        }
      };
      
    case "resolve_threat":
      // Simulate success response for resolving a threat
      return {
        success: true,
        action_id: faker.string.uuid(),
        timestamp: new Date().toISOString(),
        details: {
          threat_id: actionDetails.threat_id,
          status: "resolved",
          resolution_type: actionDetails.details?.resolution || "manual",
          notes: actionDetails.details?.notes
        }
      };
      
    case "scan_system":
      // Simulate success response for initiating a system scan
      return {
        success: true,
        action_id: faker.string.uuid(),
        timestamp: new Date().toISOString(),
        details: {
          scan_type: actionDetails.details?.scan_type || "full",
          estimated_duration: "5-10 minutes",
          status: "initiated"
        }
      };
      
    default:
      // Unknown action type
      throw new Error(`Unsupported action type: ${actionDetails.action_type}`);
  }
}
