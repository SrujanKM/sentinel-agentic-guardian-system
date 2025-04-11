
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Filter, AlertTriangle, Info, TerminalSquare, Globe, Cloud, Server } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fetchLogs } from "@/services/api";

const LogsPanel = ({ logs = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [localLogs, setLocalLogs] = useState(logs);
  
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
  
  const filteredLogs = localLogs.filter(log => 
    log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.level.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLogIcon = (level) => {
    switch (level.toLowerCase()) {
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />;
      default:
        return <TerminalSquare className="h-4 w-4 text-gray-500 flex-shrink-0" />;
    }
  };
  
  const getSourceBadge = (source) => {
    const sourceType = source.toLowerCase();
    if (sourceType.includes("windows")) {
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-600 text-xs">Windows</Badge>;
    } else if (sourceType.includes("aws") || sourceType.includes("cloud")) {
      return <Badge className="bg-orange-500/20 text-orange-400 border-orange-600 text-xs">AWS</Badge>;
    } else if (sourceType.includes("network") || sourceType.includes("firewall")) {
      return <Badge className="bg-green-500/20 text-green-400 border-green-600 text-xs">Network</Badge>;
    } else if (sourceType.includes("db") || sourceType.includes("database")) {
      return <Badge className="bg-purple-500/20 text-purple-400 border-purple-600 text-xs">Database</Badge>;
    } else {
      return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500 text-xs">Other</Badge>;
    }
  };

  const getSourceIcon = (source) => {
    const sourceType = source.toLowerCase();
    if (sourceType.includes("windows")) {
      return <TerminalSquare className="h-3 w-3 text-blue-400" />;
    } else if (sourceType.includes("aws") || sourceType.includes("cloud")) {
      return <Cloud className="h-3 w-3 text-orange-400" />;
    } else if (sourceType.includes("network") || sourceType.includes("firewall")) {
      return <Globe className="h-3 w-3 text-green-400" />;
    } else if (sourceType.includes("db") || sourceType.includes("database")) {
      return <Server className="h-3 w-3 text-purple-400" />;
    } else {
      return <Info className="h-3 w-3 text-gray-400" />;
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">System Logs</CardTitle>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            Live
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
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          <div className="space-y-1 p-2">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, index) => (
                <div 
                  key={index} 
                  className="text-xs p-2 rounded bg-gray-800 hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    {getLogIcon(log.level)}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <span className="font-mono text-gray-400">{log.timestamp}</span>
                        <div className="flex items-center gap-1">
                          {getSourceBadge(log.source)}
                        </div>
                      </div>
                      <p className="text-white mt-1 break-words">{log.message}</p>
                      <div className="flex justify-end mt-1 text-gray-500">
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
                {searchTerm ? "No logs match your search" : "No logs available"}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LogsPanel;
