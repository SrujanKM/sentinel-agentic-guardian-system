
// src/services/azureLogSimulator.ts
import { v4 as uuidv4 } from 'uuid';
import { format, formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface LogEvent {
  id: string;
  timestamp: string;
  type: string;
  severity: string;
  message: string;
  source?: string;
  src_ip?: string;
  dest_ip?: string;
  user?: string;
  hostname?: string;
  process_name?: string;
  file_path?: string;
  registry_key?: string;
  url?: string;
  status?: string;
  protocol?: string;
  port?: number;
  country?: string;
  level?: string;
}

interface Threat {
  id: string;
  title: string;
  description: string;
  type: string;
  severity: string;
  timestamp: string;
  source: string;
  status: string;
  user?: string;
  hostname?: string;
  anomaly_score?: number;
  indicators?: string[];
  actions?: string[];
  details?: {
    response_time_seconds?: number;
    priority?: string;
    affected_systems?: string[];
    azure_resource_id?: string;
    attack_vector?: string;
    detection_time?: string;
  }
}

class AzureLogSimulator {
  private logs: LogEvent[] = [];
  private threats: Threat[] = [];
  private eventTypes: string[] = [
    'security_alert',
    'system_error',
    'network_traffic',
    'user_login',
    'user_logout',
    'file_access',
    'registry_change',
    'process_creation',
    'vulnerability_scan',
    'anomaly_detection',
    'suspicious_access',
    'login_attempt'
  ];
  private severities: string[] = ['critical', 'high', 'medium', 'low', 'info'];
  private sources: string[] = [
    'Azure.ActiveDirectory', 
    'Azure.SecurityCenter', 
    'Azure.VirtualMachines', 
    'Azure.KeyVault', 
    'Azure.Network', 
    'Azure.Storage',
    'Azure.AppService',
    'Azure.DataFactory',
    'Azure.CosmosDB',
    'Azure.Monitor'
  ];
  private users: string[] = ['john.doe@contoso.com', 'jane.smith@contoso.com', 'admin@contoso.com', 'system@contoso.com'];
  private hostnames: string[] = ['vm-prod-01', 'vm-dev-03', 'appservice-web1', 'aks-cluster1-node3'];
  private processNames: string[] = ['AzureService.exe', 'w3wp.exe', 'node.exe', 'AzurePowershell.exe'];
  private filePaths: string[] = ['/home/site/wwwroot/', '/var/log/', '/data/storage/', '/opt/app/'];
  private registryKeys: string[] = [
    'HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Azure',
    'HKEY_CURRENT_USER\\Software\\Microsoft\\AzureCLI'
  ];
  private urls: string[] = [
    'https://login.microsoftonline.com', 
    'https://portal.azure.com', 
    'https://storage.azure.com', 
    'https://malicious-domain.com'
  ];
  private countries: string[] = ['US', 'IN', 'DE', 'RU', 'GB'];
  private protocols: string[] = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'TLS'];
  private threatTypes: string[] = [
    'malware', 
    'brute force', 
    'unauthorized access', 
    'privilege escalation', 
    'data exfiltration',
    'anomaly'
  ];
  private lastAutoResolveCheck: number = Date.now();
  private lastThreatGenerationTime: number = Date.now();
  private threatGenerationInterval: number = 60000 + Math.floor(Math.random() * 60000); // 1-2 minutes

  constructor() {
    // Initialize with some data
    this.generateInitialData();
    
    // Set up automatic threat resolution
    setInterval(() => this.autoResolveThreats(), 60000); // Check every minute
    
    // Set up automated threat generation
    setInterval(() => this.generatePeriodicThreat(), 10000); // Check every 10 seconds
  }

  private generateInitialData(): void {
    // Generate initial logs and threats (5-8 threats in the last 3-4 hours)
    this.generateRandomLogs(10);
    
    // Generate 5-8 initial threats with timestamps from the last 3-4 hours
    const now = Date.now();
    const threatsCount = 5 + Math.floor(Math.random() * 4); // 5-8 threats
    
    for (let i = 0; i < threatsCount; i++) {
      // Generate a random time in the past 3-4 hours
      const hoursAgo = Math.random() * 4; // 0-4 hours ago
      const pastTime = now - (hoursAgo * 60 * 60 * 1000);
      
      // Create a new threat with this timestamp
      const newThreat = this.generateThreat();
      newThreat.timestamp = new Date(pastTime).toISOString();
      
      // Randomize status - some resolved, some active
      newThreat.status = Math.random() > 0.4 ? 'active' : 'resolved';
      
      // Add to threats list
      this.threats.push(newThreat);
      
      // Also generate associated log
      const logEvent = this.generateEventForThreat(newThreat);
      this.logs.push(logEvent);
    }
    
    // Sort threats by timestamp (newest first)
    this.threats.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  // Generate a new threat periodically to simulate live environment
  private generatePeriodicThreat(): void {
    const now = Date.now();
    
    // Only generate a new threat if it's been the required interval since the last one
    if (now - this.lastThreatGenerationTime >= this.threatGenerationInterval) {
      // Generate one new threat
      const newThreat = this.generateThreat();
      
      // Ensure the threat has a proper current timestamp
      newThreat.timestamp = new Date().toISOString();
      newThreat.status = 'active'; // Always active at first
      
      // Add to threats list
      this.threats.push(newThreat);
      
      // Also generate associated log
      const logEvent = this.generateEventForThreat(newThreat);
      this.logs.push(logEvent);
      
      // Reset the timer
      this.lastThreatGenerationTime = now;
      
      // Set a new random interval (1-2 minutes)
      this.threatGenerationInterval = 60000 + Math.floor(Math.random() * 60000);
      
      console.log(`New threat generated: ${newThreat.title}. Next threat in ${Math.round(this.threatGenerationInterval/60000)} minutes`);
      
      // Trim excess threats if needed
      if (this.threats.length > 50) {
        this.threats = this.threats.slice(this.threats.length - 50);
      }
    }
  }
  
  // Generate a log event for a specific threat
  private generateEventForThreat(threat: Threat): LogEvent {
    const event: LogEvent = {
      id: uuidv4(),
      timestamp: threat.timestamp,
      type: 'security_alert',
      severity: threat.severity,
      message: `Azure ${threat.severity} alert: ${threat.title}`,
      source: threat.source,
      level: threat.severity === 'critical' || threat.severity === 'high' ? 'error' : 
             threat.severity === 'medium' ? 'warning' : 'info'
    };
    
    switch (threat.type) {
      case 'malware':
        event.process_name = this.processNames[Math.floor(Math.random() * this.processNames.length)];
        event.file_path = this.filePaths[Math.floor(Math.random() * this.filePaths.length)];
        break;
      case 'brute force':
        event.user = threat.user || this.users[Math.floor(Math.random() * this.users.length)];
        event.src_ip = this.generateIpAddress();
        break;
      case 'unauthorized access':
        event.user = threat.user || this.users[Math.floor(Math.random() * this.users.length)];
        event.hostname = threat.hostname || this.hostnames[Math.floor(Math.random() * this.hostnames.length)];
        break;
      case 'data exfiltration':
        event.src_ip = this.generateIpAddress();
        event.dest_ip = this.generateIpAddress();
        break;
    }
    
    return event;
  }

  // Auto-resolve threats that are older than the threshold
  private autoResolveThreats(): void {
    const now = Date.now();
    const resolutionThreshold = 90 * 60 * 1000; // 90 minutes (1.5 hours)
    
    let resolvedCount = 0;
    
    this.threats.forEach(threat => {
      if (threat.status === 'active') {
        const threatTime = new Date(threat.timestamp).getTime();
        if (now - threatTime > resolutionThreshold) {
          threat.status = 'resolved';
          threat.actions = threat.actions || [];
          threat.actions.push('Automatically resolved by system');
          resolvedCount++;
        }
      }
    });
    
    if (resolvedCount > 0) {
      console.log(`Auto-resolved ${resolvedCount} threats that were older than ${resolutionThreshold / (60 * 1000)} minutes`);
    }
    
    this.lastAutoResolveCheck = now;
  }

  // Helper methods for generating random data
  private generateIpAddress(): string {
    return Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
  }

  private generatePort(): number {
    return Math.floor(Math.random() * (65535 - 1024 + 1)) + 1024;
  }

  private generatePastDate(maxHoursAgo: number = 4): Date {
    const now = new Date();
    // Generate a past time within the specified hours, not a future time
    const pastTime = now.getTime() - Math.floor(Math.random() * (maxHoursAgo * 60 * 60 * 1000));
    return new Date(pastTime);
  }

  private formatTimestamp(date: Date): string {
    return date.toISOString();
  }

  private generateEvent(): LogEvent {
    const type = this.eventTypes[Math.floor(Math.random() * this.eventTypes.length)];
    const severity = this.severities[Math.floor(Math.random() * this.severities.length)];
    // Use current time or very recent past time only
    const timestamp = this.formatTimestamp(this.generatePastDate(0.5)); // Max 30 minutes in the past
    const source = this.sources[Math.floor(Math.random() * this.sources.length)];

    let event: LogEvent = {
      id: uuidv4(),
      timestamp,
      type,
      severity,
      message: `Azure ${severity} ${type} event detected in ${source}`,
      source,
      level: severity === 'critical' || severity === 'high' ? 'error' : 
             severity === 'medium' ? 'warning' : 'info'
    };

    // Add properties based on event type
    switch (type) {
      case 'network_traffic':
        event.src_ip = this.generateIpAddress();
        event.dest_ip = this.generateIpAddress();
        event.protocol = this.protocols[Math.floor(Math.random() * this.protocols.length)];
        event.port = this.generatePort();
        event.status = Math.random() > 0.5 ? 'success' : 'failed';
        break;
      case 'user_login':
      case 'user_logout':
        event.user = this.users[Math.floor(Math.random() * this.users.length)];
        event.src_ip = this.generateIpAddress();
        event.hostname = this.hostnames[Math.floor(Math.random() * this.hostnames.length)];
        event.status = Math.random() > 0.5 ? 'success' : 'failed';
        event.country = this.countries[Math.floor(Math.random() * this.countries.length)];
        break;
      case 'file_access':
        event.user = this.users[Math.floor(Math.random() * this.users.length)];
        event.file_path = this.filePaths[Math.floor(Math.random() * this.filePaths.length)];
        event.process_name = this.processNames[Math.floor(Math.random() * this.processNames.length)];
        event.status = Math.random() > 0.5 ? 'allowed' : 'denied';
        break;
      case 'registry_change':
        event.user = this.users[Math.floor(Math.random() * this.users.length)];
        event.registry_key = this.registryKeys[Math.floor(Math.random() * this.registryKeys.length)];
        event.process_name = this.processNames[Math.floor(Math.random() * this.processNames.length)];
        event.status = Math.random() > 0.5 ? 'success' : 'failed';
        break;
      case 'process_creation':
        event.user = this.users[Math.floor(Math.random() * this.users.length)];
        event.process_name = this.processNames[Math.floor(Math.random() * this.processNames.length)];
        event.src_ip = this.generateIpAddress();
        break;
      case 'vulnerability_scan':
        event.hostname = this.hostnames[Math.floor(Math.random() * this.hostnames.length)];
        event.severity = this.severities[Math.floor(Math.random() * this.severities.length)];
        event.message = `Azure vulnerability ${severity} detected on ${event.hostname}`;
        break;
      case 'anomaly_detection':
        event.user = this.users[Math.floor(Math.random() * this.users.length)];
        event.message = `Azure anomalous activity detected for user ${event.user}`;
        break;
      case 'security_alert':
        event.source = this.sources[Math.floor(Math.random() * this.sources.length)];
        event.message = `Azure security alert from ${event.source}: ${severity} threat detected`;
        break;
      case 'suspicious_access':
        event.user = this.users[Math.floor(Math.random() * this.users.length)];
        event.file_path = this.filePaths[Math.floor(Math.random() * this.filePaths.length)];
        event.src_ip = this.generateIpAddress();
        event.message = `Azure suspicious access to ${event.file_path} by ${event.user}`;
        break;
      case 'login_attempt':
        event.user = this.users[Math.floor(Math.random() * this.users.length)];
        event.src_ip = this.generateIpAddress();
        event.status = Math.random() > 0.5 ? 'success' : 'failed';
        event.country = this.countries[Math.floor(Math.random() * this.countries.length)];
        event.message = `Azure login attempt by ${event.user} from ${event.src_ip} - ${event.status}`;
        break;
    }
    
    if (event.type === 'suspicious_access' || event.type === 'login_attempt') {
      if (!event.src_ip) {
        event.src_ip = this.generateIpAddress();
      }
    }

    return event;
  }

  private generateThreat(): Threat {
    const threatType = this.threatTypes[Math.floor(Math.random() * this.threatTypes.length)];
    const severity = this.severities.filter(s => s !== 'info')[
      Math.floor(Math.random() * (this.severities.length - 1))
    ];
    const source = this.sources[Math.floor(Math.random() * this.sources.length)];
    const user = Math.random() > 0.3 ? this.users[Math.floor(Math.random() * this.users.length)] : undefined;
    const hostname = this.hostnames[Math.floor(Math.random() * this.hostnames.length)];
    const status = Math.random() > 0.3 ? 'active' : 'resolved';
    // Use current time or very recent past time only
    const timestamp = this.formatTimestamp(new Date());
    
    // Generate threat title based on type
    let title = '';
    let description = '';
    const indicators: string[] = [];
    const actions: string[] = [];
    
    switch (threatType) {
      case 'malware':
        title = `Potential malware detected in ${source}`;
        description = `Suspicious code execution detected in ${hostname} with potential malware signatures.`;
        indicators.push(`Suspicious process: ${this.processNames[Math.floor(Math.random() * this.processNames.length)]}`);
        indicators.push(`Connection to known malicious IP: ${this.generateIpAddress()}`);
        indicators.push(`File modification in system directory: ${this.filePaths[Math.floor(Math.random() * this.filePaths.length)]}`);
        actions.push('Isolated affected system');
        actions.push('Blocked outbound connections');
        actions.push('Initiated malware scan');
        break;
      case 'brute force':
        title = `Brute force attack on ${source}`;
        description = `Multiple failed login attempts detected for ${user || 'a user'} from multiple IP addresses.`;
        indicators.push(`${Math.floor(Math.random() * 50) + 20} failed login attempts in ${Math.floor(Math.random() * 10) + 2} minutes`);
        indicators.push(`Login attempts from ${Math.floor(Math.random() * 5) + 3} different countries`);
        indicators.push(`IP address range associated with known attack patterns`);
        actions.push('Temporarily locked account');
        actions.push('Added source IPs to blocklist');
        actions.push('Notified security team');
        break;
      case 'unauthorized access':
        title = `Unauthorized access to ${source}`;
        description = `Suspicious access detected to ${source} resources by ${user || 'an unknown user'}.`;
        indicators.push(`Access from unusual location: ${this.countries[Math.floor(Math.random() * this.countries.length)]}`);
        indicators.push(`Access to sensitive data outside normal patterns`);
        indicators.push(`Session anomalies detected`);
        actions.push('Terminated active sessions');
        actions.push('Applied conditional access policies');
        actions.push('Escalated to security team');
        break;
      case 'privilege escalation':
        title = `Privilege escalation in ${source}`;
        description = `${user || 'A user'} attempted to gain elevated privileges in ${source}.`;
        indicators.push(`Modification of role assignments`);
        indicators.push(`Use of potentially compromised credentials`);
        indicators.push(`Unusual administrative actions detected`);
        actions.push('Revoked suspicious permissions');
        actions.push('Enforced just-in-time access for admins');
        actions.push('Initiated security review');
        break;
      case 'data exfiltration':
        title = `Potential data exfiltration from ${source}`;
        description = `Unusual data transfer detected from ${source} to external endpoints.`;
        indicators.push(`Large data transfer: ${Math.floor(Math.random() * 900) + 100}MB`);
        indicators.push(`Connection to non-approved endpoint: ${this.urls[Math.floor(Math.random() * this.urls.length)]}`);
        indicators.push(`After-hours activity from account: ${user || 'unknown'}`);
        actions.push('Blocked data transfer');
        actions.push('Alerted data protection team');
        actions.push('Created forensic snapshot of affected resources');
        break;
      case 'anomaly':
        title = `Anomalous activity in ${source}`;
        description = `Azure security detected anomalous behavior in ${source} that doesn't match established patterns.`;
        indicators.push(`Unusual traffic patterns detected`);
        indicators.push(`Activity outside normal business hours`);
        indicators.push(`First-time access to critical resources`);
        actions.push('Increased monitoring for affected resources');
        actions.push('Applied additional authentication requirements');
        actions.push('Updated baseline behavior patterns');
        break;
    }
    
    // Add anomaly score based on severity
    let anomalyScore;
    switch (severity) {
      case 'critical':
        anomalyScore = (Math.random() * 0.1) + 0.9; // 0.9-1.0
        break;
      case 'high':
        anomalyScore = (Math.random() * 0.2) + 0.7; // 0.7-0.9
        break;
      case 'medium':
        anomalyScore = (Math.random() * 0.2) + 0.5; // 0.5-0.7
        break;
      default:
        anomalyScore = (Math.random() * 0.3) + 0.2; // 0.2-0.5
        break;
    }
    
    return {
      id: uuidv4(),
      title,
      description,
      type: threatType,
      severity,
      timestamp,
      source,
      status,
      user,
      hostname,
      anomaly_score: anomalyScore,
      indicators,
      actions,
      details: {
        response_time_seconds: Math.floor(Math.random() * 120) + 5,
        priority: severity,
        affected_systems: [hostname],
        azure_resource_id: `/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/securitydemo/providers/${source.replace('Azure.', '')}`,
        attack_vector: threatType === 'malware' ? 'malicious-payload' : 
                        threatType === 'brute force' ? 'credential-stuffing' : 
                        threatType === 'unauthorized access' ? 'stolen-credentials' : 
                        'unknown',
        detection_time: timestamp
      }
    };
  }

  public generateRandomLogs(count: number): LogEvent[] {
    const adjustedCount = Math.min(count, 5); // Cap at 5 logs at a time
    
    const newLogs: LogEvent[] = [];
    for (let i = 0; i < adjustedCount; i++) {
      const newLog = this.generateEvent();
      newLogs.push(newLog);
      this.logs.push(newLog);
    }
    
    // Limit total logs to prevent memory issues
    if (this.logs.length > 200) { // Reduced from 500
      this.logs = this.logs.slice(this.logs.length - 200);
    }
    
    return newLogs;
  }

  public generateRandomThreats(count: number): Threat[] {
    const adjustedCount = Math.min(count, 2); // Cap at 2 threats at a time
    
    const newThreats: Threat[] = [];
    for (let i = 0; i < adjustedCount; i++) {
      const newThreat = this.generateThreat();
      newThreats.push(newThreat);
      this.threats.push(newThreat);
    }
    
    // Limit total threats to prevent memory issues
    if (this.threats.length > 50) { // Reduced from 100
      this.threats = this.threats.slice(this.threats.length - 50);
    }
    
    return newThreats;
  }

  public getLogs(): LogEvent[] {
    // Ensure logs are sorted in strict chronological order (newest first)
    return [...this.logs].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public getGeneratedThreats(): Threat[] {
    // Ensure threats are sorted in strict chronological order (newest first)
    return [...this.threats].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public static formatToIST(dateString: string): string {
    try {
      const date = new Date(dateString);
      
      // If invalid date, return placeholder
      if (isNaN(date.getTime())) {
        return "Unknown date";
      }
      
      // Add 5 hours and 30 minutes for IST
      const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
      return format(istDate, "dd MMM yyyy, h:mm:ss a 'IST'", { locale: enUS });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  }

  public static formatTimeAgo(dateString: string): string {
    try {
      const date = new Date(dateString);
      
      // If invalid date, return placeholder
      if (isNaN(date.getTime())) {
        return "Unknown time";
      }
      
      return formatDistanceToNow(date, { addSuffix: true, locale: enUS });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  }
}

export default AzureLogSimulator;
