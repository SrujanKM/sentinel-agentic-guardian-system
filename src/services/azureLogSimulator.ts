import { faker } from '@faker-js/faker';
import { format, formatDistanceToNow } from 'date-fns';

interface LogEntry {
  id: string;
  timestamp: string;
  level: string;
  message: string;
  source: string;
  details?: any;
}

interface Threat {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  severity: string;
  type: string;
  source: string;
  user?: string;
  indicators?: string[];
  actions?: string[];
  status: string;
}

class AzureLogSimulator {
  private logs: LogEntry[];
  private generatedThreats: Threat[];
  private continousThreatGenerationInterval: NodeJS.Timeout | null = null;

  static formatToIST(timestamp: string): string {
    try {
      // Parse the ISO timestamp
      const date = new Date(timestamp);
      
      // Format date in a readable format (day month year, hour:minute:second AM/PM)
      // First, adjust for IST by subtracting 5.5 hours from UTC time
      // This ensures times are properly aligned with IST without relying on timezone conversion
      const adjustedDate = new Date(date.getTime() - (5.5 * 60 * 60 * 1000));
      
      // Format with date-fns
      return format(adjustedDate, "dd MMM yyyy, h:mm:ss a 'IST'");
    } catch (error) {
      console.error("Error formatting timestamp to IST:", error);
      return "Invalid date";
    }
  }

  static formatTimeAgo(timestamp: string): string {
    try {
      // Parse the ISO timestamp
      const date = new Date(timestamp);
      
      // Adjust for IST by subtracting 5.5 hours from UTC time
      const adjustedDate = new Date(date.getTime() - (5.5 * 60 * 60 * 1000));
      
      // Calculate time ago using the adjusted date
      return formatDistanceToNow(adjustedDate, { addSuffix: true });
    } catch (error) {
      console.error("Error calculating time ago:", error);
      return "Unknown time";
    }
  }

  private generateRandomLog(): LogEntry {
    const level = faker.helpers.arrayElement(['info', 'warning', 'error']);
    let message = faker.lorem.sentence();
    let details = {};
    const source = faker.helpers.arrayElement([
      "ActiveDirectory/UserLogin",
      "SecurityCenter/Firewall",
      "NetworkWatcher/FlowLog",
      "KeyVault/Access",
      "VirtualMachines/SystemEvents",
      "StorageAccount/BlobAccess"
    ]);

    if (source === "ActiveDirectory/UserLogin") {
      details = {
        user: faker.internet.userName(),
        ip_address: faker.internet.ip(),
        location: faker.location.country()
      };
    } else if (source === "SecurityCenter/Firewall") {
      message = `Firewall blocked traffic from ${faker.internet.ip()} to ${faker.internet.ip()}`;
      details = {
        protocol: faker.internet.protocol(),
        port: faker.internet.port().toString()
      };
    } else if (source === "NetworkWatcher/FlowLog") {
      details = {
        source_ip: faker.internet.ip(),
        dest_ip: faker.internet.ip(),
        bytes_sent: faker.number.int(),
        packets_sent: faker.number.int()
      };
    } else if (source === "KeyVault/Access") {
      details = {
        user: faker.internet.userName(),
        resource_id: `/subscriptions/${faker.string.uuid()}/resourceGroups/${faker.company.name()}/providers/Microsoft.KeyVault/vaults/${faker.word.noun()}`,
        result: faker.helpers.arrayElement(['success', 'failure'])
      };
    } else if (source === "VirtualMachines/SystemEvents") {
      message = `System event occurred on VM: ${faker.word.noun()}`;
      details = {
        event_id: faker.number.int(),
        severity: faker.helpers.arrayElement(['critical', 'warning', 'info'])
      };
    } else if (source === "StorageAccount/BlobAccess") {
      details = {
        user: faker.internet.userName(),
        blob_name: faker.system.fileName(),
        operation: faker.helpers.arrayElement(['read', 'write', 'delete'])
      };
    }

    return {
      id: faker.string.uuid(),
      timestamp: this.generateRandomTimestamp(),
      level: level,
      message: message,
      source: source,
      details: details
    };
  }

  public generateRandomLogs(count: number = 10): void {
    for (let i = 0; i < count; i++) {
      this.logs.push(this.generateRandomLog());
    }
  }

  public getLogs(): LogEntry[] {
    return this.logs;
  }

  private generateRandomThreat(hoursBack: number = 24): void {
    const type = faker.helpers.arrayElement([
      "Malware",
      "Brute Force",
      "Unauthorized Access",
      "Privilege Escalation",
      "Data Exfiltration",
      "Anomaly"
    ]);
    const severity = faker.helpers.arrayElement(["Critical", "High", "Medium", "Low"]);
    const source = faker.helpers.arrayElement([
      "ActiveDirectory",
      "Firewall",
      "IntrusionDetectionSystem",
      "EndpointSecurity",
      "DataLossPrevention"
    ]);
    let description = faker.lorem.sentence();
    let indicators: string[] = [];
    let actions: string[] = [];
    let user: string | undefined = undefined;

    if (type === "Malware") {
      description = `Malware detected on endpoint ${faker.word.noun()}`;
      indicators = [faker.internet.url(), faker.system.filePath()];
      actions = ["Quarantine endpoint", "Scan for other infected files"];
    } else if (type === "Brute Force") {
      description = `Brute force attack detected on account ${faker.internet.userName()}`;
      indicators = [faker.internet.ip()];
      actions = ["Lock account", "Reset password"];
      user = faker.internet.userName();
    } else if (type === "Unauthorized Access") {
      description = `Unauthorized access attempt to resource ${faker.word.noun()}`;
      indicators = [faker.internet.ip(), faker.internet.userAgent()];
      actions = ["Revoke access", "Investigate user activity"];
      user = faker.internet.userName();
    } else if (type === "Privilege Escalation") {
      description = `Privilege escalation detected on account ${faker.internet.userName()}`;
      indicators = [faker.system.filePath()];
      actions = ["Audit user permissions", "Review system logs"];
      user = faker.internet.userName();
    } else if (type === "Data Exfiltration") {
      description = `Data exfiltration attempt detected from server ${faker.word.noun()}`;
      indicators = [faker.internet.ip(), faker.system.fileName()];
      actions = ["Block network traffic", "Isolate server"];
    } else if (type === "Anomaly") {
      description = `Anomalous activity detected on network ${faker.word.noun()}`;
      indicators = [faker.number.int().toString()];
      actions = ["Analyze network traffic", "Check system health"];
    }

    const threat: Threat = {
      id: faker.string.uuid(),
      timestamp: this.generateRandomTimestamp(hoursBack),
      title: `${type} Alert`,
      description: description,
      severity: severity,
      type: type,
      source: source,
      user: user,
      indicators: indicators,
      actions: actions,
      status: faker.helpers.arrayElement(["active", "investigating", "contained", "resolved"])
    };

    this.generatedThreats.push(threat);
  }

  public getGeneratedThreats(): Threat[] {
    return this.generatedThreats;
  }

  private generateRandomTimestamp(hoursBack: number = 24): string {
    const now = new Date();
    // Generate a random time in the past (up to hoursBack hours ago)
    // Adding 5.5 hours to UTC time to ensure all timestamps are in the past when converted to IST
    const randomTime = now.getTime() - (Math.random() * hoursBack * 60 * 60 * 1000);
    return new Date(randomTime).toISOString();
  }

  public initialize(): void {
    // Generate initial batch of threats (5-8)
    const initialThreatCount = Math.floor(Math.random() * 4) + 5; // 5-8 threats
    
    for (let i = 0; i < initialThreatCount; i++) {
      // Generate threats with timestamps from the last 3-4 hours
      this.generateRandomThreat(Math.random() * 3 + 1); // 1-4 hours back
    }
    
    // Set up continuous threat generation
    this.startContinuousThreatGeneration();
    
    // Generate initial logs
    this.generateRandomLogs(10);
  }

  public startContinuousThreatGeneration(): void {
    // Clear any existing interval
    if (this.continousThreatGenerationInterval) {
      clearInterval(this.continousThreatGenerationInterval);
    }
    
    // Generate a new threat every 1-2 minutes
    this.continousThreatGenerationInterval = setInterval(() => {
      this.generateRandomThreat(0.05); // Very recent threat (within last 3 minutes)
    }, 60000 + Math.random() * 60000); // 1-2 minutes
  }

  public stopContinuousThreatGeneration(): void {
    if (this.continousThreatGenerationInterval) {
      clearInterval(this.continousThreatGenerationInterval);
      this.continousThreatGenerationInterval = null;
    }
  }

  constructor() {
    this.logs = [];
    this.generatedThreats = [];
    this.initialize();
  }
}

export default new AzureLogSimulator();
