
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, Filter, AlertTriangle, Info, Cloud, 
  Server, Database, Clock, Shield, 
  RefreshCw, User, Lock, Key, HardDrive
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchLogs } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import AzureLogSimulator from "@/services/azureLogSimulator";
import { v4 as uuidv4 } from 'uuid';

const realisticLogMessages = {
  info: [
    "User authentication successful from IP 192.168.1.45",
    "System update completed successfully: Security patches v2.3.1 applied",
    "Scheduled backup completed for database 'SecurityLogs'",
    "New user 'john.smith' created in Active Directory",
    "SSL certificate renewed for domain 'security.example.com'",
    "Access granted to resource 'Finance Reports' for user 'sarah.johnson'",
    "System health check completed: All services running normally",
    "Firewall rules updated successfully",
    "User password reset completed for 'michael.brown@example.com'",
    "Resource sharing enabled between security groups 'Analysis' and 'Response'"
  ],
  warning: [
    "Multiple failed login attempts detected for user 'admin' from IP 103.45.67.89",
    "Unusual network traffic detected from workstation WS-003 (192.168.2.35)",
    "Resource utilization at 85% threshold for database server DB-001",
    "Certificate expiration approaching for 'api.example.com' (15 days remaining)",
    "Unusual working hours login detected for user 'alex.wong' at 02:34 AM",
    "Elevated privilege use detected for service account 'svc-backup'",
    "File integrity check found modified system files in /etc/security/",
    "Network scanning activity detected from internal IP 192.168.5.123",
    "Abnormal authentication pattern detected: 25 logins across different accounts from same IP",
    "Unusual outbound traffic volume detected to IP range 78.45.12.0/24"
  ],
  error: [
    "Brute force attack detected targeting admin portal from IP 45.86.123.29",
    "Malware 'Trojan.Emotet' detected on host WKSTN-045, quarantine failed",
    "Authentication server unavailable - Failover activated",
    "Critical vulnerability CVE-2023-8756 detected on server SRV-DB-003",
    "Data exfiltration attempt blocked: 2.3GB upload to unrecognized domain",
    "Ransomware activity detected on file server FS-001, initiating isolation protocols",
    "Suspicious PowerShell script execution detected with encoded payload",
    "Firewall bypass attempt detected from internal network 192.168.10.0/24",
    "DDoS attack in progress targeting public API endpoint",
    "Privilege escalation detected: User 'guest' attempted admin access on SRV-AUTH-001"
  ]
};

const getRealisticLogDetails = (level, source) => {
  const details = {};
  
  // Add realistic user information
  if (source.includes("ActiveDirectory") || source.includes("KeyVault")) {
    const usernames = ['alex.smith', 'sarah.johnson', 'michael.brown', 'david.miller', 'emma.wilson'];
    details.user = usernames[Math.floor(Math.random() * usernames.length)];
  }
  
  // Add IP addresses
  if (source.includes("Network") || source.includes("Firewall") || source.includes("Login")) {
    details.ip_address = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    
    if (level === "error" || level === "warning") {
      details.related_threat = true;
    }
  }
  
  // Add more specific details depending on the source and level
  if (source.includes("SecurityCenter")) {
    details.protocol = ["TCP", "UDP", "HTTP", "HTTPS"][Math.floor(Math.random() * 4)];
    details.port = [80, 443, 22, 3389, 8080, 25][Math.floor(Math.random() * 6)];
    
    if (level === "error") {
      details.indicators_of_compromise = [
        "User-Agent: Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)",
        `IP: ${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        "Hash: 5f4dcc3b5aa765d61d8327deb882cf99"
      ];
      details.actions_taken = [
        "Connection blocked",
        "Alert triggered",
        "SIEM event created"
      ];
    }
  }
  
  if (source.includes("VirtualMachines")) {
    details.event_id = Math.floor(Math.random() * 9000) + 1000;
    details.vm_name = ["srv-web-01", "srv-db-02", "srv-app-03", "srv-auth-01"][Math.floor(Math.random() * 4)];
  }
  
  if (source.includes("KeyVault")) {
    details.resource_id = `/subscriptions/${uuidv4()}/resourceGroups/SecurityRG/providers/Microsoft.KeyVault/vaults/MainSecrets`;
    details.operation = ["read", "write", "delete", "list"][Math.floor(Math.random() * 4)];
  }
  
  if (source.includes("Storage")) {
    details.blob_name = ["security-config.json", "users.db", "firewall-rules.xml", "certificates.pem"][Math.floor(Math.random() * 4)];
    details.operation = ["read", "write", "delete"][Math.floor(Math.random() * 3)];
  }
  
  return details;
};

const LogsPanel = ({ logs = [] }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [localLogs, setLocalLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterLevel, setFilterLevel] = useState("");
  const [filterSource, setFilterSource] = useState("");
  
  useEffect(() => {
    // Process incoming logs to ensure they have realistic content
    const processedLogs = logs.map(log => {
      // Only replace generic messages with realistic ones
      if (!log.message || log.message.includes("Lorem ipsum") || log.message.includes("Cotidie")) {
        const logLevel = log.level || "info";
        const messages = realisticLogMessages[logLevel] || realisticLogMessages.info;
        const newMessage = messages[Math.floor(Math.random() * messages.length)];
        
        // Generate realistic details based on log level and source
        const enhancedDetails = getRealisticLogDetails(logLevel, log.source || "");
        
        return {
          ...log,
          message: newMessage,
          details: { ...(log.details || {}), ...enhancedDetails }
        };
      }
      return log;
    });
    
    setLocalLogs(processedLogs);
  }, [logs]);

  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      try {
        const newLogs = await fetchLogs();
        
        // Process new logs to ensure they have realistic content
        const processedNewLogs = newLogs.map(log => {
          if (!log.message || log.message.includes("Lorem ipsum") || log.message.includes("Cotidie")) {
            const logLevel = log.level || "info";
            const messages = realisticLogMessages[logLevel] || realisticLogMessages.info;
            const newMessage = messages[Math.floor(Math.random() * messages.length)];
            
            // Generate realistic details based on log level and source
            const enhancedDetails = getRealisticLogDetails(logLevel, log.source || "");
            
            return {
              ...log,
              message: newMessage,
              details: { ...(log.details || {}), ...enhancedDetails }
            };
          }
          return log;
        });
        
        setLocalLogs(processedNewLogs);
      } catch (error) {
        console.error("Failed to refresh logs:", error);
      }
    }, 60000);

    return () => clearInterval(refreshInterval);
  }, []);
  
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const newLogs = await fetchLogs();
      
      // Process new logs to ensure they have realistic content
      const processedNewLogs = newLogs.map(log => {
        if (!log.message || log.message.includes("Lorem ipsum") || log.message.includes("Cotidie")) {
          const logLevel = log.level || "info";
          const messages = realisticLogMessages[logLevel] || realisticLogMessages.info;
          const newMessage = messages[Math.floor(Math.random() * messages.length)];
          
          // Generate realistic details based on log level and source
          const enhancedDetails = getRealisticLogDetails(logLevel, log.source || "");
          
          return {
            ...log,
            message: newMessage,
            details: { ...(log.details || {}), ...enhancedDetails }
          };
        }
        return log;
      });
      
      setLocalLogs(processedNewLogs);
      
      toast({
        title: "Logs Refreshed",
        description: `Loaded ${newLogs.length} log entries`
      });
    } catch (error) {
      console.error("Failed to refresh logs:", error);
      toast({
        title: "Refresh Failed",
        description: "Could not refresh logs. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const filteredLogs = localLogs.filter(log => {
    const matchesSearch = 
      (log.message || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.source || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.level || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = filterLevel ? log.level === filterLevel : true;
    const matchesSource = filterSource ? (log.source || "").includes(filterSource) : true;
    
    return matchesSearch && matchesLevel && matchesSource;
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "error":
        return "bg-red-500/20 text-red-400 border-red-600";
      case "warning":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-600";
      case "info":
        return "bg-blue-500/20 text-blue-400 border-blue-600";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500";
    }
  };
  
  const getLogIcon = (level) => {
    switch (level?.toLowerCase()) {
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />;
      default:
        return <Info className="h-4 w-4 text-gray-500 flex-shrink-0" />;
    }
  };
  
  const getSourceBadge = (source) => {
    const sourceType = source?.toLowerCase() || "";
    if (sourceType.includes("activedirectory")) {
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-600 text-xs">Azure AD</Badge>;
    } else if (sourceType.includes("securitycenter")) {
      return <Badge className="bg-red-500/20 text-red-400 border-red-600 text-xs">Security</Badge>;
    } else if (sourceType.includes("network")) {
      return <Badge className="bg-green-500/20 text-green-400 border-green-600 text-xs">Network</Badge>;
    } else if (sourceType.includes("keyvault")) {
      return <Badge className="bg-purple-500/20 text-purple-400 border-purple-600 text-xs">Key Vault</Badge>;
    } else if (sourceType.includes("virtualmachines")) {
      return <Badge className="bg-orange-500/20 text-orange-400 border-orange-600 text-xs">VM</Badge>;
    } else if (sourceType.includes("storage")) {
      return <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-600 text-xs">Storage</Badge>;
    } else {
      return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500 text-xs">Azure</Badge>;
    }
  };

  const getSourceIcon = (source) => {
    const sourceType = source?.toLowerCase() || "";
    if (sourceType.includes("activedirectory")) {
      return <User className="h-3 w-3 text-blue-400" />;
    } else if (sourceType.includes("securitycenter")) {
      return <Shield className="h-3 w-3 text-red-400" />;
    } else if (sourceType.includes("network")) {
      return <Cloud className="h-3 w-3 text-green-400" />;
    } else if (sourceType.includes("keyvault")) {
      return <Key className="h-3 w-3 text-purple-400" />;
    } else if (sourceType.includes("virtualmachines")) {
      return <Server className="h-3 w-3 text-orange-400" />;
    } else if (sourceType.includes("storage")) {
      return <Database className="h-3 w-3 text-cyan-400" />;
    } else {
      return <Info className="h-3 w-3 text-gray-400" />;
    }
  };

  const getLevelFilter = () => {
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        <Badge 
          className={`cursor-pointer ${filterLevel === "" ? "bg-gray-700" : "bg-gray-800"}`}
          onClick={() => setFilterLevel("")}
        >
          All
        </Badge>
        <Badge 
          className={`cursor-pointer ${filterLevel === "info" ? "bg-blue-700" : "bg-gray-800"}`}
          onClick={() => setFilterLevel("info")}
        >
          Info
        </Badge>
        <Badge 
          className={`cursor-pointer ${filterLevel === "warning" ? "bg-yellow-700" : "bg-gray-800"}`}
          onClick={() => setFilterLevel("warning")}
        >
          Warning
        </Badge>
        <Badge 
          className={`cursor-pointer ${filterLevel === "error" ? "bg-red-700" : "bg-gray-800"}`}
          onClick={() => setFilterLevel("error")}
        >
          Error
        </Badge>
      </div>
    );
  };
  
  const getSourceFilter = () => {
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        <Badge 
          className={`cursor-pointer ${filterSource === "" ? "bg-gray-700" : "bg-gray-800"}`}
          onClick={() => setFilterSource("")}
        >
          All
        </Badge>
        <Badge 
          className={`cursor-pointer ${filterSource === "ActiveDirectory" ? "bg-blue-700" : "bg-gray-800"}`}
          onClick={() => setFilterSource("ActiveDirectory")}
        >
          Azure AD
        </Badge>
        <Badge 
          className={`cursor-pointer ${filterSource === "SecurityCenter" ? "bg-red-700" : "bg-gray-800"}`}
          onClick={() => setFilterSource("SecurityCenter")}
        >
          Security
        </Badge>
        <Badge 
          className={`cursor-pointer ${filterSource === "VirtualMachines" ? "bg-orange-700" : "bg-gray-800"}`}
          onClick={() => setFilterSource("VirtualMachines")}
        >
          VMs
        </Badge>
        <Badge 
          className={`cursor-pointer ${filterSource === "KeyVault" ? "bg-purple-700" : "bg-gray-800"}`}
          onClick={() => setFilterSource("KeyVault")}
        >
          Key Vault
        </Badge>
      </div>
    );
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Azure Logs</CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 gap-1 text-gray-400 hover:text-white"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              Live
            </div>
          </div>
        </div>
        <div className="relative mt-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search logs..."
            className="pl-8 bg-gray-800 border-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="absolute right-2 top-2.5">
            <Filter className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        
        {getLevelFilter()}
        {getSourceFilter()}
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          <div className="space-y-1 p-2">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, index) => (
                <div 
                  key={log.id || index} 
                  className="text-xs p-2 rounded bg-gray-800 hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    {getLogIcon(log.level)}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="font-mono text-gray-400">
                            {AzureLogSimulator.constructor['formatToIST'](log.timestamp)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {getSourceBadge(log.source)}
                          {log.details?.related_threat && (
                            <Badge className="bg-red-500/20 text-red-400 border-red-600 text-xs">Threat</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-white mt-1 break-words">{log.message}</p>
                      
                      {/* Display IoCs if available */}
                      {log.details?.indicators_of_compromise && (
                        <div className="mt-1 text-yellow-400 text-xs">
                          <strong>Indicators of Compromise:</strong> {log.details.indicators_of_compromise.join(", ")}
                        </div>
                      )}
                      
                      {/* Display Actions if available */}
                      {log.details?.actions_taken && (
                        <div className="mt-1 text-blue-400 text-xs">
                          <strong>Actions:</strong> {log.details.actions_taken.join(", ")}
                        </div>
                      )}
                      
                      <div className="flex justify-between mt-1 text-gray-500">
                        <div className="flex items-center gap-1">
                          {log.details?.user && (
                            <div className="flex items-center gap-1 mr-2">
                              <User className="h-3 w-3" />
                              <span>{log.details.user}</span>
                            </div>
                          )}
                          {log.details?.ip_address && (
                            <div className="flex items-center gap-1">
                              <Cloud className="h-3 w-3" />
                              <span>{log.details.ip_address}</span>
                            </div>
                          )}
                          {log.details?.resource_id && (
                            <div className="flex items-center gap-1">
                              <HardDrive className="h-3 w-3" />
                              <span>{log.details.resource_id.split('/').pop()}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {getSourceIcon(log.source)}
                          <span className="truncate">{log.source}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-500">
                {searchTerm || filterLevel || filterSource ? 
                  "No logs match your search criteria" : 
                  "No logs available"}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LogsPanel;
