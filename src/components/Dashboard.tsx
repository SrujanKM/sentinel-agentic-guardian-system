
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ThreatTimeline from "./ThreatTimeline";
import SystemMonitor from "./SystemMonitor";
import AgentStatus from "./AgentStatus";
import LogsPanel from "./LogsPanel";
import ThreatDetails from "./ThreatDetails";
import BackendStatus from "./BackendStatus";
import { mockThreats, mockLogs } from "@/data/mockData";

const Dashboard = () => {
  const [selectedThreat, setSelectedThreat] = useState(null);
  
  const handleThreatSelect = (threat) => {
    setSelectedThreat(threat);
  };

  return (
    <div className="flex-1 container mx-auto p-4 overflow-hidden">
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-72px)]">
        {/* Main Content */}
        <div className="col-span-12 lg:col-span-8 space-y-4 overflow-y-auto pr-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="threats">Threats</TabsTrigger>
              <TabsTrigger value="agents">Agents</TabsTrigger>
              <TabsTrigger value="backend">Backend</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <SystemMonitor />
              <ThreatTimeline threats={mockThreats} onThreatSelect={handleThreatSelect} />
            </TabsContent>
            
            <TabsContent value="threats">
              <ThreatTimeline 
                threats={mockThreats} 
                onThreatSelect={handleThreatSelect}
                expanded={true}
              />
            </TabsContent>

            <TabsContent value="agents">
              <AgentStatus />
            </TabsContent>
            
            <TabsContent value="backend">
              <BackendStatus />
            </TabsContent>

            <TabsContent value="analytics">
              <div className="bg-gray-800 rounded-lg p-6 h-[300px] flex items-center justify-center">
                <p className="text-gray-400">Analytics module will be available in the next update.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - Threat Details and Logs */}
        <div className="col-span-12 lg:col-span-4 space-y-4 overflow-y-auto pb-4 pr-2">
          <ThreatDetails selectedThreat={selectedThreat} />
          <LogsPanel logs={mockLogs} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
