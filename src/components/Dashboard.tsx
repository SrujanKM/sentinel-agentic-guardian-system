
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ThreatTimeline from "./ThreatTimeline";
import SystemMonitor from "./SystemMonitor";
import AgentStatus from "./AgentStatus";
import LogsPanel from "./LogsPanel";
import ThreatDetails from "./ThreatDetails";
import BackendStatus from "./BackendStatus";
import AnalyticsModule from "./analytics/AnalyticsModule";
import { fetchLogs, fetchThreats } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { toast } = useToast();
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [threats, setThreats] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const handleThreatSelect = (threat) => {
    setSelectedThreat(threat);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [threatsData, logsData] = await Promise.all([
          fetchThreats(),
          fetchLogs()
        ]);
        
        setThreats(threatsData);
        setLogs(logsData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Using mock data instead.");
        
        // Load mock data if API fails
        import("@/data/mockData").then(({ mockThreats, mockLogs }) => {
          setThreats(mockThreats);
          setLogs(mockLogs);
          
          toast({
            title: "Using Mock Data",
            description: "Couldn't connect to the API. Using locally stored mock data.",
            variant: "destructive",
          });
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Set up a refresh interval for data (every 30 seconds)
    const refreshInterval = setInterval(() => {
      loadData();
    }, 30000);

    // Clean up the interval when component unmounts
    return () => clearInterval(refreshInterval);
  }, [toast]);

  return (
    <div className="flex-1 container mx-auto p-4 overflow-hidden">
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
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
              <ThreatTimeline 
                threats={threats} 
                onThreatSelect={handleThreatSelect} 
              />
            </TabsContent>
            
            <TabsContent value="threats">
              <ThreatTimeline 
                threats={threats} 
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
              <AnalyticsModule />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - Threat Details and Logs */}
        <div className="col-span-12 lg:col-span-4 space-y-4 overflow-y-auto pb-4 pr-2">
          <ThreatDetails selectedThreat={selectedThreat} />
          <LogsPanel logs={logs} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
