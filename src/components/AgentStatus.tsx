
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Activity, Brain, Terminal, Database, Server, Shield } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

const AgentStatus = () => {
  const { toast } = useToast();
  const [selectedAgent, setSelectedAgent] = React.useState(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const agents = [
    {
      id: 1,
      name: "SentinelCore",
      type: "Primary Controller",
      status: "Active",
      lastCheck: "Just now",
      metrics: { cpu: 28, memory: 46, tasks: 17 },
      icon: <Shield className="h-5 w-5 text-emerald-500" />,
      logs: [
        "System initialization complete",
        "Connected to all agent modules",
        "Monitoring active threats",
        "Background analysis running"
      ]
    },
    {
      id: 2,
      name: "LogCollector",
      type: "Data Collection",
      status: "Active",
      lastCheck: "2 mins ago",
      metrics: { cpu: 42, memory: 31, tasks: 8 },
      icon: <Database className="h-5 w-5 text-blue-500" />,
      logs: [
        "Windows Event Log collection active",
        "Processing new logs every 30 seconds",
        "Added 127 new log entries",
        "Database encryption enabled"
      ]
    },
    {
      id: 3,
      name: "AnomalyDetector",
      type: "ML Analysis",
      status: "Active",
      lastCheck: "4 mins ago",
      metrics: { cpu: 64, memory: 72, tasks: 4 },
      icon: <Brain className="h-5 w-5 text-purple-500" />,
      logs: [
        "Isolation Forest model loaded",
        "Analyzing incoming log patterns",
        "Anomaly threshold set to 0.65",
        "Processing batch of 200 entries"
      ]
    },
    {
      id: 4,
      name: "ResponseManager",
      type: "Threat Response",
      status: "Active",
      lastCheck: "3 mins ago",
      metrics: { cpu: 22, memory: 36, tasks: 2 },
      icon: <Bot className="h-5 w-5 text-orange-500" />,
      logs: [
        "Automated response rules active",
        "IP blocking mechanism ready",
        "Awaiting threat triggers",
        "Ready to quarantine malicious activities"
      ]
    },
    {
      id: 5,
      name: "EventMonitor",
      type: "System Events",
      status: "Active",
      lastCheck: "5 mins ago",
      metrics: { cpu: 18, memory: 28, tasks: 6 },
      icon: <Activity className="h-5 w-5 text-green-500" />,
      logs: [
        "Monitoring system events",
        "Tracking user login activities",
        "Watching file system changes",
        "Registry modifications tracked"
      ]
    },
    {
      id: 6,
      name: "CommandExecutor",
      type: "System Commands",
      status: "Idle",
      lastCheck: "7 mins ago",
      metrics: { cpu: 4, memory: 22, tasks: 0 },
      icon: <Terminal className="h-5 w-5 text-gray-500" />,
      logs: [
        "Awaiting command execution requests",
        "PowerShell interface ready",
        "No active commands running",
        "Last executed: System health check"
      ]
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

  const handleAgentAction = (agent) => {
    setSelectedAgent(agent);
    setSheetOpen(true);
  };

  const handleRestartAgent = () => {
    toast({
      title: "Agent Restart Initiated",
      description: `${selectedAgent.name} is restarting...`,
    });
    setSheetOpen(false);
  };

  return (
    <>
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
                  <button 
                    className="text-emerald-400 hover:text-emerald-300" 
                    onClick={() => handleAgentAction(agent)}
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="bg-gray-900 border-gray-800 text-white overflow-y-auto">
          {selectedAgent && (
            <>
              <SheetHeader className="pb-4">
                <div className="flex items-center gap-2">
                  {selectedAgent.icon}
                  <SheetTitle className="text-xl">{selectedAgent.name}</SheetTitle>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">{selectedAgent.type}</span>
                  {getStatusBadge(selectedAgent.status)}
                </div>
              </SheetHeader>
              
              <div className="space-y-4">
                <div className="border border-gray-800 rounded-md p-4">
                  <h3 className="text-sm font-medium mb-2">Agent Metrics</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-gray-800 p-3 rounded-md">
                      <div className="text-lg font-bold text-blue-400">{selectedAgent.metrics.cpu}%</div>
                      <div className="text-xs text-gray-400">CPU Usage</div>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-md">
                      <div className="text-lg font-bold text-purple-400">{selectedAgent.metrics.memory}%</div>
                      <div className="text-xs text-gray-400">Memory</div>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-md">
                      <div className="text-lg font-bold text-emerald-400">{selectedAgent.metrics.tasks}</div>
                      <div className="text-xs text-gray-400">Active Tasks</div>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-800 rounded-md p-4">
                  <h3 className="text-sm font-medium mb-2">Recent Activity</h3>
                  <div className="space-y-2">
                    {selectedAgent.logs.map((log, index) => (
                      <div key={index} className="bg-gray-800 p-2 rounded text-xs">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <button 
                    className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-md text-sm flex-1"
                    onClick={handleRestartAgent}
                  >
                    Restart Agent
                  </button>
                  <button 
                    className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-md text-sm flex-1"
                    onClick={() => setSheetOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default AgentStatus;
