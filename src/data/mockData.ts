
import { Activity, AlertTriangle, Lock, User, Server } from "lucide-react";

export const mockThreats = [
  {
    id: 1,
    title: "Suspected Malware Activity",
    description: "Multiple suspicious executables detected attempting to access system resources with elevated privileges",
    timestamp: "Today 14:28:33",
    source: "Endpoint - WORK-SRV-04",
    severity: "Critical",
    status: "Active",
    type: "Malware",
    user: "admin",
    indicators: [
      "Multiple processes spawned from unusual path /tmp/svchst32.exe",
      "Attempted modification of system registry keys",
      "Connection attempts to known malicious IP: 192.168.14.23"
    ],
    actions: [
      "Quarantined suspicious executables",
      "Blocked outbound connections to malicious IP",
      "Initiated memory dump for analysis"
    ]
  },
  {
    id: 2,
    title: "Brute Force Attack",
    description: "Multiple failed login attempts detected from external IP address on administrative account",
    timestamp: "Today 13:42:17",
    source: "Authentication Service",
    severity: "High",
    status: "Investigating",
    type: "Brute Force",
    user: "administrator",
    indicators: [
      "47 failed login attempts in 2 minutes",
      "Source IP: 203.67.198.12 (location: Unknown)",
      "Target: Administrative account"
    ],
    actions: [
      "Temporarily blocked source IP address",
      "Enabled additional authentication factors",
      "Alerted security team"
    ]
  },
  {
    id: 3,
    title: "Abnormal Data Access Pattern",
    description: "User account accessed unusually large number of documents from file server outside normal working hours",
    timestamp: "Today 02:15:04",
    source: "File Server - FS02",
    severity: "Medium",
    status: "Contained",
    type: "Anomaly",
    user: "jsmith",
    indicators: [
      "Accessed 237 documents in 15 minutes at 2:15 AM",
      "User normally accesses ~25 documents during working hours",
      "Login from unusual location"
    ],
    actions: [
      "Account temporarily suspended",
      "Initiated manager notification workflow",
      "Created access audit report"
    ]
  },
  {
    id: 4,
    title: "Unauthorized Administrative Access",
    description: "User account attempted to execute privileged commands without proper authorization",
    timestamp: "Yesterday 19:54:22",
    source: "Command Shell - APP01",
    severity: "High",
    status: "Resolved",
    type: "Unauthorized Access",
    user: "devuser",
    indicators: [
      "Attempted use of sudo for system configuration",
      "Multiple attempts to access restricted directories",
      "Unusual command pattern detected"
    ],
    actions: [
      "Account privileges reviewed and adjusted",
      "User training initiated",
      "Enhanced monitoring enabled for account"
    ]
  },
  {
    id: 5,
    title: "Unusual Network Traffic Pattern",
    description: "Internal system generating high volume of outbound traffic to unknown destination",
    timestamp: "Yesterday 11:22:07",
    source: "Network Monitor",
    severity: "Medium",
    status: "Investigating",
    type: "Anomaly",
    user: "system",
    indicators: [
      "3.2GB of outbound traffic in 10 minutes",
      "Destination: 45.77.65.211 (unclassified)",
      "Non-standard port usage (4455)"
    ],
    actions: [
      "Traffic throttled to destination",
      "Deep packet inspection enabled",
      "System isolation prepared if needed"
    ]
  },
  {
    id: 6,
    title: "Configuration Change Alert",
    description: "Critical security settings modified outside of change window",
    timestamp: "2 days ago 08:15:33",
    source: "Policy Controller",
    severity: "Low",
    status: "Resolved",
    type: "Policy Violation",
    user: "sysadmin",
    indicators: [
      "Firewall rule modifications",
      "Changes made outside approved window",
      "No change request documentation found"
    ],
    actions: [
      "Configuration rolled back to previous state",
      "Change management process initiated",
      "Admin notification sent"
    ]
  },
];

export const mockLogs = [
  {
    timestamp: "14:32:45",
    level: "error",
    source: "security.service",
    message: "Failed login attempt detected for user 'admin' from IP 192.168.1.45"
  },
  {
    timestamp: "14:31:22",
    level: "warning",
    source: "anomaly.detector",
    message: "Unusual process activity detected: svchst32.exe attempting to modify system registry"
  },
  {
    timestamp: "14:30:17",
    level: "info",
    source: "agent.manager",
    message: "Response agent successfully quarantined suspicious file at C:\\Windows\\Temp\\update.exe"
  },
  {
    timestamp: "14:29:55",
    level: "error",
    source: "network.monitor",
    message: "Outbound connection blocked to known malicious IP: 203.67.198.12:445"
  },
  {
    timestamp: "14:28:33",
    level: "warning",
    source: "event.monitor",
    message: "Multiple failed authentication attempts detected within 30 seconds"
  },
  {
    timestamp: "14:27:19",
    level: "info",
    source: "log.collector",
    message: "Successfully collected and processed 1,456 new log entries from Windows Event Log"
  },
  {
    timestamp: "14:26:02",
    level: "info",
    source: "system.service",
    message: "Automatic update of threat intelligence database completed successfully"
  },
  {
    timestamp: "14:25:47",
    level: "warning",
    source: "file.monitor",
    message: "Sensitive file access detected: HR-SalaryData.xlsx by user 'guest'"
  },
  {
    timestamp: "14:24:18",
    level: "info",
    source: "agent.controller",
    message: "Initiated scheduled system scan on endpoint WORK-SRV-04"
  },
  {
    timestamp: "14:23:05",
    level: "error",
    source: "db.service",
    message: "Database query error: timeout while accessing security events table"
  },
  {
    timestamp: "14:22:51",
    level: "info",
    source: "api.service",
    message: "Security action API received request to block IP 45.77.65.211"
  },
  {
    timestamp: "14:21:40",
    level: "warning",
    source: "ml.service",
    message: "Anomaly detected: user 'jsmith' accessing 237 documents in 15 minutes"
  },
];
