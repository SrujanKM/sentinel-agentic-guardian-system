
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ThreatTimeline from "./ThreatTimeline";
import SystemMonitor from "./SystemMonitor";
import AgentStatus from "./AgentStatus";
import LogsPanel from "./LogsPanel";
import ThreatDetails from "./ThreatDetails";
import BackendStatus from "./BackendStatus";
import AnalyticsModule from "./analytics/AnalyticsModule";
import { fetchLogs, fetchThreats, checkCredentialStatus } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Shield, Info } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const Dashboard = () => {
  const { toast } = useToast();
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [threats, setThreats] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [credentialStatus, setCredentialStatus] = useState({
    azure: { present: false, valid: false },
    gemini: { present: false, valid: false }
  });
  
  const handleThreatSelect = (threat) => {
    setSelectedThreat(threat);
  };

  // Reset selected threat when changing to a tab where it wouldn't be visible
  useEffect(() => {
    if (activeTab !== "overview" && activeTab !== "threats") {
      setSelectedThreat(null);
    }
  }, [activeTab]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [threatsData, logsData, credentials] = await Promise.all([
          fetchThreats(),
          fetchLogs({ limit: 20 }), // Reduce the number of logs fetched to avoid clutter
          checkCredentialStatus()
        ]);
        
        setThreats(threatsData);
        setLogs(logsData);
        setCredentialStatus(credentials);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Using mock data instead.");
        
        // Load mock data if API fails
        import("@/data/mockData").then(({ mockThreats, mockLogs }) => {
          // Reduce mock data size to avoid clutter
          setThreats(mockThreats.slice(0, 15));
          setLogs(mockLogs.slice(0, 20));
          
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

    // Set up a refresh interval for data (less frequent to reduce unnecessary refreshes)
    const refreshInterval = setInterval(() => {
      loadData();
    }, 60000); // Every 60 seconds

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
  };

  const renderCredentialAlert = () => {
    if (!credentialStatus.azure.present || !credentialStatus.gemini.present) {
      return (
        <Alert variant="warning" className="mb-4 bg-amber-900/20 border-amber-700">
          <Info className="h-4 w-4 text-amber-500" />
          <AlertTitle>Credentials Missing</AlertTitle>
          <AlertDescription>
            {!credentialStatus.azure.present && !credentialStatus.gemini.present ? (
              "Azure credentials file and Gemini API key are not configured."
            ) : !credentialStatus.azure.present ? (
              "Azure credentials file is not configured."
            ) : (
              "Gemini API key is not configured."
            )}
          </AlertDescription>
        </Alert>
      );
    }
    
    if (!credentialStatus.azure.valid || !credentialStatus.gemini.valid) {
      return (
        <Alert variant="destructive" className="mb-4">
          <Shield className="h-4 w-4" />
          <AlertTitle>Credential Validation Failed</AlertTitle>
          <AlertDescription>
            {!credentialStatus.azure.valid && !credentialStatus.gemini.valid ? (
              "Azure credentials and Gemini API key validation failed."
            ) : !credentialStatus.azure.valid ? (
              "Azure credentials validation failed."
            ) : (
              "Gemini API key validation failed."
            )}
          </AlertDescription>
        </Alert>
      );
    }
    
    return null;
  };

  return (
    <div className="flex-1 container mx-auto p-4 overflow-hidden">
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {renderCredentialAlert()}
      
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
