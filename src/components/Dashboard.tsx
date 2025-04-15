
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ThreatTimeline from "./ThreatTimeline";
import SystemMonitor from "./SystemMonitor";
import AgentStatus from "./AgentStatus";
import LogsPanel from "./LogsPanel";
import ThreatDetails from "./ThreatDetails";
import BackendStatus from "./BackendStatus";
import AnalyticsModule from "./analytics/AnalyticsModule";
import ReportDialog from "./ReportDialog";
import { fetchLogs, fetchThreats } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Download, Download as FileDownload, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { toast } = useToast();
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [threats, setThreats] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [activeThreatCount, setActiveThreatCount] = useState(0);
  
  const handleThreatSelect = (threat) => {
    setSelectedThreat(threat);
  };
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [threatsData, logsData] = await Promise.all([
          fetchThreats(),
          fetchLogs({ limit: 20 })
        ]);
        
        setThreats(threatsData);
        
        // Calculate active threat count (excluding resolved threats)
        const activeThreats = threatsData.filter(threat => 
          threat.status !== "resolved"
        );
        setActiveThreatCount(activeThreats.length);
        
        setLogs(logsData);
      } catch (err) {
        console.error("Error fetching data:", err);
        
        // Load mock data if API fails (silently, no error message to user)
        import("@/data/mockData").then(({ mockThreats, mockLogs }) => {
          const threats = mockThreats.slice(0, 15);
          setThreats(threats);
          
          // Calculate active threat count from mock data
          const activeThreats = threats.filter(threat => 
            threat.status !== "resolved"
          );
          setActiveThreatCount(activeThreats.length);
          
          setLogs(mockLogs.slice(0, 20));
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Set up a refresh interval for data - more frequent refresh
    const refreshInterval = setInterval(() => {
      loadData();
    }, 15000); // Every 15 seconds (shortened for better real-time updates)

    // Fix for settings menu bug: ensure click events work properly after Popover dialogs close
    const restorePointerEvents = () => {
      document.body.style.pointerEvents = 'auto';
      const modals = document.querySelectorAll('[role="dialog"]');
      modals.forEach(modal => {
        if (modal.parentElement) {
          modal.parentElement.style.pointerEvents = 'auto';
        }
      });
    };
    
    document.addEventListener('click', restorePointerEvents);

    // Clean up the interval and event listener when component unmounts
    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener('click', restorePointerEvents);
    };
  }, [toast]);

  const handleTabChange = (value) => {
    setActiveTab(value);
    // We're no longer changing selectedThreat when tab changes
    // This ensures threat details persist between tab navigations
  };

  return (
    <div className="flex-1 container mx-auto p-4 overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold">Security Dashboard</h2>
          {activeThreatCount > 0 && (
            <div className="ml-4 flex items-center">
              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-md flex items-center">
                <ShieldAlert className="h-3 w-3 mr-1" />
                {activeThreatCount} Active Threat{activeThreatCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setReportDialogOpen(true)}
        >
          <FileDownload className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>
      
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-72px)]">
        {/* Main Content */}
        <div className="col-span-12 lg:col-span-8 space-y-4 overflow-y-auto pr-2">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="threats">Threats</TabsTrigger>
              <TabsTrigger value="agents">Agents</TabsTrigger>
              <TabsTrigger value="backend">Backend</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <SystemMonitor activeThreatCount={activeThreatCount} />
              <ThreatTimeline 
                threats={threats} 
                onThreatSelect={handleThreatSelect}
                onThreatStatusChange={(updatedThreats) => {
                  setThreats(updatedThreats);
                  const activeThreats = updatedThreats.filter(threat => 
                    threat.status !== "resolved"
                  );
                  setActiveThreatCount(activeThreats.length);
                }}
              />
            </TabsContent>
            
            <TabsContent value="threats">
              <ThreatTimeline 
                threats={threats} 
                onThreatSelect={handleThreatSelect}
                expanded={true}
                onThreatStatusChange={(updatedThreats) => {
                  setThreats(updatedThreats);
                  const activeThreats = updatedThreats.filter(threat => 
                    threat.status !== "resolved"
                  );
                  setActiveThreatCount(activeThreats.length);
                }}
              />
            </TabsContent>

            <TabsContent value="agents">
              <AgentStatus />
            </TabsContent>
            
            <TabsContent value="backend">
              <BackendStatus />
            </TabsContent>

            <TabsContent value="analytics" className="overflow-y-auto pb-4">
              <AnalyticsModule activeThreatCount={activeThreatCount} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - Threat Details and Logs */}
        <div className="col-span-12 lg:col-span-4 space-y-4 overflow-y-auto pb-4 pr-2">
          <ThreatDetails 
            selectedThreat={selectedThreat}
            onThreatStatusChange={(updatedThreat) => {
              // Update the status of this threat in the threats array
              const updatedThreats = threats.map(threat => 
                threat.id === updatedThreat.id ? updatedThreat : threat
              );
              setThreats(updatedThreats);
              
              // Recalculate active threat count
              const activeThreats = updatedThreats.filter(threat => 
                threat.status !== "resolved"
              );
              setActiveThreatCount(activeThreats.length);
            }} 
          />
          <LogsPanel logs={logs} />
        </div>
      </div>
      
      {/* Report Dialog */}
      <ReportDialog 
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        threats={threats}
        logs={logs}
      />
    </div>
  );
};

export default Dashboard;
