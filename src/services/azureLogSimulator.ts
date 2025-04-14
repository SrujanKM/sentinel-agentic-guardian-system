// src/services/azureLogSimulator.ts

interface LogEvent {
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
}

class AzureLogSimulator {
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
  private sources: string[] = ['firewall', 'antivirus', 'ids', 'os', 'application'];
  private users: string[] = ['john.doe', 'jane.smith', 'admin', 'system'];
  private hostnames: string[] = ['server01', 'desktop12', 'laptop42', 'dbserver'];
  private processNames: string[] = ['explorer.exe', 'chrome.exe', 'java.exe', 'powershell.exe'];
  private filePaths: string[] = ['C:\\Windows\\System32\\', '/var/log/', '/opt/app/'];
  private registryKeys: string[] = [
    'HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows\\CurrentVersion\\Run',
    'HKEY_CURRENT_USER\\Software\\Microsoft\\Office'
  ];
  private urls: string[] = ['http://example.com', 'https://api.example.com', 'http://malicious.net'];
  private countries: string[] = ['US', 'CN', 'DE', 'RU', 'GB'];
  private protocols: string[] = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'DNS'];

  constructor() {}

  private generateIpAddress(): string {
    return Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
  }

  private generatePort(): number {
    return Math.floor(Math.random() * (65535 - 1024 + 1)) + 1024;
  }

  private generateEvent(): LogEvent {
    const type = this.eventTypes[Math.floor(Math.random() * this.eventTypes.length)];
    const severity = this.severities[Math.floor(Math.random() * this.severities.length)];
    const timestamp = new Date().toISOString();

    let event: LogEvent = {
      timestamp,
      type,
      severity,
      message: `Simulated ${severity} ${type} event`,
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
        event.message = `Vulnerability ${severity} detected on ${event.hostname}`;
        break;
      case 'anomaly_detection':
        event.user = this.users[Math.floor(Math.random() * this.users.length)];
        event.message = `Anomalous activity detected for user ${event.user}`;
        break;
      case 'security_alert':
        event.source = this.sources[Math.floor(Math.random() * this.sources.length)];
        event.message = `Security alert from ${event.source}: ${severity} threat detected`;
        break;
      case 'suspicious_access':
        event.user = this.users[Math.floor(Math.random() * this.users.length)];
        event.file_path = this.filePaths[Math.floor(Math.random() * this.filePaths.length)];
        event.src_ip = this.generateIpAddress();
        event.message = `Suspicious access to ${event.file_path} by ${event.user}`;
        break;
      case 'login_attempt':
        event.user = this.users[Math.floor(Math.random() * this.users.length)];
        event.src_ip = this.generateIpAddress();
        event.status = Math.random() > 0.5 ? 'success' : 'failed';
        event.country = this.countries[Math.floor(Math.random() * this.countries.length)];
        event.message = `Login attempt by ${event.user} from ${event.src_ip} - ${event.status}`;
        break;
    }
    
    if (event.type === 'suspicious_access' || event.type === 'login_attempt') {
      if (!event.src_ip) {
        event.src_ip = this.generateIpAddress();
      }
    }

    return event;
  }

  public generateLogs(count: number): LogEvent[] {
    const logs: LogEvent[] = [];
    for (let i = 0; i < count; i++) {
      logs.push(this.generateEvent());
    }
    return logs;
  }
}

export default AzureLogSimulator;
