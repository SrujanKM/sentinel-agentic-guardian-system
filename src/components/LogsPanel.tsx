
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Filter, AlertTriangle, Info, TerminalSquare } from "lucide-react";

const LogsPanel = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredLogs = logs.filter(log => 
    log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.source.toLowerCase().includes(searchTerm.toLowerCase())
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
        <ScrollArea className="h-[300px] p-2">
          <div className="space-y-1 p-2">
            {filteredLogs.map((log, index) => (
              <div 
                key={index} 
                className="text-xs p-2 rounded bg-gray-800 hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-start gap-2">
                  {getLogIcon(log.level)}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <span className="font-mono text-gray-400">{log.timestamp}</span>
                      <span className="text-gray-500 truncate">{log.source}</span>
                    </div>
                    <p className="text-white mt-1 break-words">{log.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LogsPanel;
