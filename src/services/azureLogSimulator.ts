
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

// Azure event sources
const azureEventSources = [
  "Azure-ActiveDirectory",
  "Azure-SecurityCenter",
  "Azure-Monitor",
  "Azure-Sentinel",
  "Azure-KeyVault",
  "Azure-VirtualMachines",
  "Azure-Storage",
  "Azure-AppService",
  "Azure-Network",
  "Azure-IAM"
];

// Azure security events
const azureSecurityEvents = [
  { id: "AAD001", description: "Failed login attempt in Azure AD", level: "warning" },
  { id: "AAD002", description: "Suspicious sign-in detected", level: "warning" },
  { id: "AAD003", description: "User added to privileged role", level: "warning" },
  { id: "AAD004", description: "Password reset for admin account", level: "warning" },
  { id: "AAD005", description: "New service principal created", level: "info" },
  { id: "SEC001", description: "Vulnerability detected in VM", level: "warning" },
  { id: "SEC002", description: "Suspicious process execution in VM", level: "error" },
  { id: "SEC003", description: "Malware detected in storage account", level: "error" },
  { id: "SEC004", description: "Suspicious outbound traffic detected", level: "warning" },
  { id: "KV001", description: "Key Vault access attempt failed", level: "warning" },
  { id: "KV002", description: "Secret accessed from unauthorized location", level: "error" },
  { id: "VM001", description: "Unusual login to VM detected", level: "warning" },
  { id: "VM002", description: "VM started during non-business hours", level: "info" },
  { id: "VM003", description: "Unusual VM scaling activity", level: "info" },
  { id: "NET001", description: "Unusual port scan detected", level: "warning" },
  { id: "NET002", description: "DDoS attack mitigated", level: "error" },
  { id: "STOR001", description: "Anonymous access to blob storage", level: "warning" },
  { id: "IAM001", description: "Role assignment changed", level: "warning" },
  { id: "APP001", description: "Function app modified", level: "info" }
];

const threatPatterns: ThreatPattern[] = [
  {
    type: "brute force",
    title: "Azure AD Brute Force Attack",
    description: "Multiple failed login attempts targeting Azure Active Directory",
    severity: "high",
    source: "Azure-ActiveDirectory",
    indicators: ["Multiple AAD001 events", "Same target account", "Different IP addresses"]
  },
  {
    type: "privilege escalation",
    title: "Azure Privilege Escalation",
    description: "User gained elevated privileges in Azure environment",
    severity: "high",
    source: "Azure-IAM",
    indicators: ["IAM role changes", "Unusual access patterns", "Admin actions by non-admin user"]
  },
  {
    type: "data exfiltration",
    title: "Azure Storage Data Exfiltration",
    description: "Unusual data transfer from Azure Storage detected",
    severity: "critical",
    source: "Azure-Storage",
    indicators: ["Large data transfer", "Unusual access patterns", "Access from unusual location"]
  },
  {
    type: "malware",
    title: "Malware Detected in Azure VM",
    description: "Malicious software detected in Azure Virtual Machine",
    severity: "critical",
    source: "Azure-SecurityCenter",
    indicators: ["Known malware signature", "Suspicious process execution", "Unusual network activity"]
  },
  {
    type: "unauthorized access",
    title: "Unauthorized Access to Azure Resources",
    description: "Unauthorized access attempt to restricted Azure resources",
    severity: "medium",
    source: "Azure-KeyVault",
    indicators: ["Access denied events", "Non-business hours", "Sensitive resource"]
  },
  {
    type: "anomaly",
    title: "Azure Behavior Anomaly",
    description: "Unusual behavior detected in Azure environment",
    severity: "medium",
    source: "Azure-Monitor",
    indicators: ["Statistical deviation", "Unusual timing", "Irregular access pattern"]
  }
];

const users = [
  "admin@company.com", "azure.admin@company.com", "john.doe@company.com", 
  "sarah.smith@company.com", "helpdesk@company.com", "developer@company.com",
  "api.user@company.com", "workflow@company.com", "testing@company.com", 
  "integration@company.com"
];

const generateRandomIP = () => {
  return `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
};

class AzureLogSimulator {
  private lastSimulatedTime: Date;
  private recentLogs: SimulatedLog[] = [];
  private activeThreats: SimulatedThreat[] = [];
  private previousThreatTypes: Map<string, number> = new Map();
  private seenThreatsInTimeWindow: Set<string> = new Set();
  private lastCleanupTime: number = Date.now();

  constructor() {
    this.lastSimulatedTime = new Date();
    this.generateInitialThreats();
  }

  private generateInitialThreats(): void {
    const threatCount = Math.floor(Math.random() * 3) + 3;
    const threatTypes = ["brute force", "privilege escalation", "data exfiltration", "malware", "unauthorized access", "anomaly"];
    
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

  // Clean up threat tracking to prevent duplicates in short time windows
  private cleanupThreatsTracking(): void {
    const now = Date.now();
    // Only run cleanup once per minute
    if (now - this.lastCleanupTime < 60000) {
      return;
    }
    
    // Remove entries older than 5 minutes from the tracking set
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    this.seenThreatsInTimeWindow.forEach(entry => {
      const [threatType, timestamp] = entry.split('|');
      if (parseInt(timestamp) < fiveMinutesAgo) {
        this.seenThreatsInTimeWindow.delete(entry);
      }
    });
    
    this.lastCleanupTime = now;
  }

  public generateLogs(count: number = 10): SimulatedLog[] {
    const newLogs: SimulatedLog[] = [];
    
    // Reduce frequency by generating fewer logs
    const actualCount = Math.min(count, 5);
    
    for (let i = 0; i < actualCount; i++) {
      const isThreatLog = Math.random() < 0.1;
      
      if (isThreatLog) {
        newLogs.push(this.generateThreatLog());
      } else {
        newLogs.push(this.generateNormalLog());
      }
      
      this.lastSimulatedTime = new Date(this.lastSimulatedTime.getTime() + (Math.random() * 4000 + 1000));
    }
    
    this.recentLogs = [...newLogs, ...this.recentLogs].slice(0, 100);
    this.cleanupThreatsTracking();
    
    return newLogs;
  }

  private generateNormalLog(): SimulatedLog {
    const source = azureEventSources[Math.floor(Math.random() * azureEventSources.length)];
    
    if (source === "Azure-ActiveDirectory") {
      const user = users[Math.floor(Math.random() * users.length)];
      const ip = generateRandomIP();
      
      return {
        id: uuidv4(),
        timestamp: this.lastSimulatedTime.toISOString(),
        source,
        level: Math.random() < 0.8 ? "info" : "warning",
        message: `User ${user} signed in successfully from ${ip}`,
        details: {
          event_id: "AAD006",
          user,
          ip_address: ip,
          resource_id: `/tenants/${uuidv4().substring(0, 8)}/users/${user}`,
          success: true
        }
      };
    } 
    
    if (source === "Azure-SecurityCenter") {
      return {
        id: uuidv4(),
        timestamp: this.lastSimulatedTime.toISOString(),
        source,
        level: "info",
        message: "Security scan completed successfully",
        details: {
          event_id: "SEC005",
          resource_type: "Virtual Machine",
          resource_id: `/subscriptions/${uuidv4().substring(0, 8)}/resourceGroups/production/providers/Microsoft.Compute/virtualMachines/vm-${Math.floor(Math.random() * 10) + 1}`,
          findings: Math.floor(Math.random() * 5)
        }
      };
    }
    
    if (source === "Azure-VirtualMachines") {
      const vmActions = ["started", "stopped", "restarted", "deallocated", "updated"];
      const action = vmActions[Math.floor(Math.random() * vmActions.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      
      return {
        id: uuidv4(),
        timestamp: this.lastSimulatedTime.toISOString(),
        source,
        level: "info",
        message: `Virtual machine ${action} by ${user}`,
        details: {
          event_id: "VM004",
          user,
          resource_id: `/subscriptions/${uuidv4().substring(0, 8)}/resourceGroups/production/providers/Microsoft.Compute/virtualMachines/vm-${Math.floor(Math.random() * 10) + 1}`,
          action
        }
      };
    }
    
    if (source === "Azure-KeyVault") {
      const user = users[Math.floor(Math.random() * users.length)];
      
      return {
        id: uuidv4(),
        timestamp: this.lastSimulatedTime.toISOString(),
        source,
        level: "info",
        message: `Key Vault secret accessed by ${user}`,
        details: {
          event_id: "KV003",
          user,
          resource_id: `/subscriptions/${uuidv4().substring(0, 8)}/resourceGroups/security/providers/Microsoft.KeyVault/vaults/keyvault-${Math.floor(Math.random() * 5) + 1}`,
          secret_name: ["api-key", "db-password", "cert-password", "storage-key"][Math.floor(Math.random() * 4)]
        }
      };
    }
    
    const messages = [
      "Resource health check passed",
      "Application insights event received",
      "Resource group updated",
      "Subscription policy compliance verified",
      "Scheduled maintenance completed"
    ];
    
    return {
      id: uuidv4(),
      timestamp: this.lastSimulatedTime.toISOString(),
      source,
      level: "info",
      message: messages[Math.floor(Math.random() * messages.length)],
      details: {
        region: ["East US", "West US 2", "North Europe", "West Europe", "Southeast Asia"][Math.floor(Math.random() * 5)],
        subscription_id: uuidv4().substring(0, 8),
        resource_group: ["production", "development", "testing", "shared", "management"][Math.floor(Math.random() * 5)]
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
          source: "Azure-ActiveDirectory",
          level: "warning",
          message: `Failed login attempt for user ${user} from ${ip}`,
          details: {
            event_id: "AAD001",
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
          source: "Azure-SecurityCenter",
          level: "error",
          message: "Malware detected in VM: Suspicious file activity identified",
          details: {
            event_id: "SEC002",
            malware_name: threat.details?.malware_name || "Trojan.AzureVM.GenericML",
            vm_name: threat.details?.resource_id || `vm-${Math.floor(Math.random() * 10) + 1}`,
            action_taken: "Quarantined",
            related_threat: threat.id
          }
        };
      }
      
      if (threat.type === "privilege escalation") {
        return {
          id: uuidv4(),
          timestamp: this.lastSimulatedTime.toISOString(),
          source: "Azure-IAM",
          level: "warning",
          message: `User ${threat.user || users[Math.floor(Math.random() * users.length)]} assigned to elevated role`,
          details: {
            event_id: "IAM001",
            user: threat.user,
            role: ["Owner", "Contributor", "User Access Administrator"][Math.floor(Math.random() * 3)],
            assigned_by: users[Math.floor(Math.random() * users.length)],
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
      
      if (Math.random() < 0.1 && !this.checkRecentThreatType("brute force")) {
        this.createNewThreat("brute force", user, ip);
      }
      
      return {
        id: uuidv4(),
        timestamp: this.lastSimulatedTime.toISOString(),
        source: "Azure-ActiveDirectory",
        level: "warning",
        message: `Failed login attempt for user ${user} from ${ip}`,
        details: {
          event_id: "AAD001",
          user,
          ip_address: ip,
          failure_reason: "Invalid password"
        }
      };
    }
    
    if (threatEvent < 0.6) {
      const vmId = `/subscriptions/${uuidv4().substring(0, 8)}/resourceGroups/production/providers/Microsoft.Compute/virtualMachines/vm-${Math.floor(Math.random() * 10) + 1}`;
      
      if (Math.random() < 0.1 && !this.checkRecentThreatType("malware")) {
        this.createNewThreat("malware", users[Math.floor(Math.random() * users.length)], generateRandomIP(), vmId);
      }
      
      return {
        id: uuidv4(),
        timestamp: this.lastSimulatedTime.toISOString(),
        source: "Azure-SecurityCenter",
        level: "error",
        message: "Suspicious process execution detected in Azure VM",
        details: {
          event_id: "SEC002",
          process_name: ["cmd.exe", "powershell.exe", "regsvr32.exe", "certutil.exe"][Math.floor(Math.random() * 4)],
          vm_name: vmId.split('/').pop(),
          command_line: "encoded suspicious command",
          user: users[Math.floor(Math.random() * users.length)]
        }
      };
    }
    
    const suspiciousActivities = [
      {
        source: "Azure-IAM",
        level: "warning",
        message: "User added to privileged Azure role",
        details: {
          event_id: "IAM001",
          user: users[Math.floor(Math.random() * users.length)],
          role: "Owner",
          assigned_by: users[0] // admin@company.com
        }
      },
      {
        source: "Azure-Network",
        level: "warning",
        message: "Unusual outbound connection to known malicious IP",
        details: {
          event_id: "NET001",
          src_resource: `vm-${Math.floor(Math.random() * 10) + 1}`,
          dst_ip: "185.128.41." + Math.floor(Math.random() * 255),
          dst_port: 445,
          protocol: "TCP"
        }
      },
      {
        source: "Azure-KeyVault",
        level: "warning",
        message: "Multiple Key Vault access attempts",
        details: {
          event_id: "KV001",
          vault_name: `keyvault-${Math.floor(Math.random() * 5) + 1}`,
          user: users[Math.floor(Math.random() * users.length)],
          access_count: Math.floor(Math.random() * 20) + 10
        }
      }
    ];
    
    const activity = suspiciousActivities[Math.floor(Math.random() * suspiciousActivities.length)];
    
    if (Math.random() < 0.1) {
      const threatTypes = ["unauthorized access", "privilege escalation", "data exfiltration", "anomaly"];
      const selectedType = threatTypes[Math.floor(Math.random() * threatTypes.length)];
      
      if (!this.checkRecentThreatType(selectedType)) {
        this.createNewThreat(
          selectedType, 
          activity.details.user || users[Math.floor(Math.random() * users.length)],
          activity.details.src_ip || generateRandomIP()
        );
      }
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

  // Check if we've seen this threat type recently (to prevent duplicates)
  private checkRecentThreatType(type: string): boolean {
    const now = Date.now();
    const key = `${type}|${now}`;
    
    // Check if we've seen this threat type in the last 5 minutes
    let hasRecentThreat = false;
    this.seenThreatsInTimeWindow.forEach(entry => {
      const [threatType, timestamp] = entry.split('|');
      if (threatType === type && (now - parseInt(timestamp)) < 5 * 60 * 1000) {
        hasRecentThreat = true;
      }
    });
    
    if (!hasRecentThreat) {
      this.seenThreatsInTimeWindow.add(key);
      return false;
    }
    
    return true;
  }

  private createNewThreat(type: string, user?: string, ip?: string, resourceId?: string): SimulatedThreat {
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
        malware_name: ["Trojan.AzureVM.GenericML", "Backdoor.Azure.Botnet", "Ransom.AzureCrypt", "Exploit.VM.PowerShell"][Math.floor(Math.random() * 4)],
        resource_id: resourceId || `/subscriptions/${uuidv4().substring(0, 8)}/resourceGroups/production/providers/Microsoft.Compute/virtualMachines/vm-${Math.floor(Math.random() * 10) + 1}`,
        detection_source: "Microsoft Defender for Cloud",
        response_time_seconds: Math.floor(Math.random() * 30) + 5
      };
    } else if (type === "privilege escalation") {
      details = {
        original_role: "Reader",
        new_role: "Owner",
        assigned_by: users[0], // Typically the admin account
        response_time_seconds: Math.floor(Math.random() * 60) + 20
      };
    } else if (type === "data exfiltration") {
      details = {
        data_type: "Storage Blob",
        storage_account: `storage${Math.random().toString(36).substring(2, 10)}`,
        volume_gb: (Math.random() * 10).toFixed(2),
        destination_ip: generateRandomIP(),
        response_time_seconds: Math.floor(Math.random() * 90) + 30
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
    // Process existing threats - some might be resolved
    this.activeThreats.forEach(threat => {
      if (Math.random() < 0.3) {
        const age = new Date().getTime() - new Date(threat.timestamp).getTime();
        
        if (age > 30 * 60 * 1000 && Math.random() < 0.2) {
          threat.status = "resolved";
          threat.actions = ["Blocked", "Isolated", "Alert sent"];
        }
      }
    });
    
    // Remove old resolved threats from the list
    this.activeThreats = this.activeThreats.filter(threat => {
      const age = new Date().getTime() - new Date(threat.timestamp).getTime();
      return threat.status === "active" || age < 60 * 60 * 1000;
    });
    
    const now = Date.now();
    
    // Possibly generate new threats, but not too frequently
    const availableTypes = threatPatterns.filter(p => {
      const lastAdded = this.previousThreatTypes.get(p.type) || 0;
      return (now - lastAdded) > 180000; // 3 minutes
    });
    
    if (availableTypes.length > 0 && Math.random() < 0.1) {
      const typeIndex = Math.floor(Math.random() * availableTypes.length);
      const threatType = availableTypes[typeIndex].type;
      
      // Don't create a new threat if we've seen this type recently
      if (!this.checkRecentThreatType(threatType)) {
        this.createNewThreat(threatType, users[Math.floor(Math.random() * users.length)], generateRandomIP());
      }
    }
    
    return this.activeThreats;
  }
}

const azureLogSimulator = new AzureLogSimulator();

export default azureLogSimulator;
