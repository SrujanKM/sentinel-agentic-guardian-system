
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Activity, Brain, Terminal, Database, Server, Shield } from "lucide-react";

const AgentStatus = () => {
  const agents = [
    {
      id: 1,
      name: "SentinelCore",
      type: "Primary Controller",
      status: "Active",
      lastCheck: "Just now",
      metrics: { cpu: 28, memory: 46, tasks: 17 },
      icon: <Shield className="h-5 w-5 text-emerald-500" />
    },
    {
      id: 2,
      name: "LogCollector",
      type: "Data Collection",
      status: "Active",
      lastCheck: "2 mins ago",
      metrics: { cpu: 42, memory: 31, tasks: 8 },
      icon: <Database className="h-5 w-5 text-blue-500" />
    },
    {
      id: 3,
      name: "AnomalyDetector",
      type: "ML Analysis",
      status: "Active",
      lastCheck: "4 mins ago",
      metrics: { cpu: 64, memory: 72, tasks: 4 },
      icon: <Brain className="h-5 w-5 text-purple-500" />
    },
    {
      id: 4,
      name: "ResponseManager",
      type: "Threat Response",
      status: "Active",
      lastCheck: "3 mins ago",
      metrics: { cpu: 22, memory: 36, tasks: 2 },
      icon: <Bot className="h-5 w-5 text-orange-500" />
    },
    {
      id: 5,
      name: "EventMonitor",
      type: "System Events",
      status: "Active",
      lastCheck: "5 mins ago",
      metrics: { cpu: 18, memory: 28, tasks: 6 },
      icon: <Activity className="h-5 w-5 text-green-500" />
    },
    {
      id: 6,
      name: "CommandExecutor",
      type: "System Commands",
      status: "Idle",
      lastCheck: "7 mins ago",
      metrics: { cpu: 4, memory: 22, tasks: 0 },
      icon: <Terminal className="h-5 w-5 text-gray-500" />
    },
  ];

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500">Active</Badge>;
      case "idle":
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500">Idle</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500">Warning</Badge>;
      case "error":
        return <Badge className="bg-red-500/20 text-red-500 border-red-500">Error</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="h-5 w-5 text-emerald-500" />
          Agent Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {agents.map((agent) => (
            <div 
              key={agent.id} 
              className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {agent.icon}
                  <div>
                    <h4 className="font-medium">{agent.name}</h4>
                    <p className="text-xs text-gray-400">{agent.type}</p>
                  </div>
                </div>
                {getStatusBadge(agent.status)}
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                <div className="bg-gray-900 rounded p-2">
                  <div className="text-sm font-medium text-blue-400">{agent.metrics.cpu}%</div>
                  <div className="text-gray-500">CPU</div>
                </div>
                <div className="bg-gray-900 rounded p-2">
                  <div className="text-sm font-medium text-purple-400">{agent.metrics.memory}%</div>
                  <div className="text-gray-500">Memory</div>
                </div>
                <div className="bg-gray-900 rounded p-2">
                  <div className="text-sm font-medium text-emerald-400">{agent.metrics.tasks}</div>
                  <div className="text-gray-500">Tasks</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Last check: {agent.lastCheck}</span>
                <button className="text-emerald-400 hover:text-emerald-300">Details</button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentStatus;
