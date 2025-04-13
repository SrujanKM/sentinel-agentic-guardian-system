
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

const LogsPanel = ({ logs = [] }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [localLogs, setLocalLogs] = useState(logs);
  const [loading, setLoading] = useState(false);
  const [filterLevel, setFilterLevel] = useState("");
  const [filterSource, setFilterSource] = useState("");
  
  useEffect(() => {
    setLocalLogs(logs);
  }, [logs]);

  // Refresh logs every 15 seconds
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      try {
        const newLogs = await fetchLogs();
        setLocalLogs(newLogs);
      } catch (error) {
        console.error("Failed to refresh logs:", error);
      }
    }, 15000);

    return () => clearInterval(refreshInterval);
  }, []);
  
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const newLogs = await fetchLogs();
      setLocalLogs(newLogs);
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
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.level.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = filterLevel ? log.level === filterLevel : true;
    const matchesSource = filterSource ? log.source.includes(filterSource) : true;
    
    return matchesSearch && matchesLevel && matchesSource;
  });

  const getLogIcon = (level) => {
    switch (level.toLowerCase()) {
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
    const sourceType = source.toLowerCase();
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
    const sourceType = source.toLowerCase();
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
                            {new Date(log.timestamp).toLocaleTimeString()}
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
