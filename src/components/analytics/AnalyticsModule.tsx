
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchLogs, fetchThreats, fetchSystemStats } from "@/services/api";
import ThreatDistribution from "./ThreatDistribution";
import AnomalyScoreChart from "./AnomalyScoreChart";
import DetectionTimeline from "./DetectionTimeline";
import RiskLevelDistribution from "./RiskLevelDistribution";
import SourceBreakdown from "./SourceBreakdown";
import DetectionAccuracy from "./DetectionAccuracy";
import SourceActivityTimeline from "./SourceActivityTimeline";
import ResponseTimeAnalysis from "./ResponseTimeAnalysis";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AnalyticsModule = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [threats, setThreats] = useState([]);
  const [stats, setStats] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const loadData = async () => {
    setLoading(true);
    try {
      const [logsData, threatsData, statsData] = await Promise.all([
        fetchLogs({ limit: 500 }),
        fetchThreats({ limit: 100 }),
        fetchSystemStats()
      ]);
      
      setLogs(logsData);
      setThreats(threatsData);
      setStats(statsData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error loading analytics data:", error);
      toast({
        title: "Error Loading Data",
        description: "Could not load analytics data. See console for details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Refresh data every 2 minutes
    const refreshInterval = setInterval(loadData, 120000);
    return () => clearInterval(refreshInterval);
  }, []);

  const handleRefresh = () => {
    loadData();
    toast({
      title: "Analytics Refreshed",
      description: "Analytics data has been updated with the latest information."
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Security Analytics</h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <span className="text-xs text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="threats">Threat Analysis</TabsTrigger>
          <TabsTrigger value="anomalies">Anomaly Detection</TabsTrigger>
          <TabsTrigger value="sources">Source Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ThreatDistribution data={threats} loading={loading} />
            <RiskLevelDistribution data={threats} loading={loading} />
            <SourceBreakdown data={logs} loading={loading} />
            <DetectionAccuracy data={threats} loading={loading} />
          </div>
        </TabsContent>

        <TabsContent value="threats">
          <div className="grid grid-cols-1 gap-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Threat Timeline Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <DetectionTimeline data={threats} loading={loading} />
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ThreatDistribution data={threats} loading={loading} />
              <RiskLevelDistribution data={threats} loading={loading} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="anomalies">
          <div className="grid grid-cols-1 gap-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Anomaly Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <AnomalyScoreChart data={threats} loading={loading} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sources">
          <div className="grid grid-cols-1 gap-4">
            <SourceActivityTimeline data={logs} loading={loading} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SourceBreakdown data={logs} loading={loading} />
              <ResponseTimeAnalysis data={threats} loading={loading} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 gap-4">
            <ResponseTimeAnalysis data={threats} loading={loading} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetectionAccuracy data={threats} loading={loading} />
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>System Resource Impact</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <div className="h-full flex flex-col items-center justify-center">
                    <p className="text-gray-400 mb-4">Security agent resource usage</p>
                    <div className="grid grid-cols-2 gap-8 w-full max-w-md">
                      <div className="flex flex-col items-center">
                        <div className="text-2xl font-bold text-blue-500">3.2%</div>
                        <div className="text-sm text-gray-500">CPU Usage</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="text-2xl font-bold text-green-500">128MB</div>
                        <div className="text-sm text-gray-500">Memory Usage</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="text-2xl font-bold text-purple-500">5MB/s</div>
                        <div className="text-sm text-gray-500">Disk I/O</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="text-2xl font-bold text-yellow-500">2KB/s</div>
                        <div className="text-sm text-gray-500">Network</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsModule;
