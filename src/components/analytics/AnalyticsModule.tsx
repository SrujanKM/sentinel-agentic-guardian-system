
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { Clock, Database, Server, ShieldAlert, Users } from "lucide-react";
import AzureLogSimulator from "@/services/azureLogSimulator";
import ThreatDistribution from "./ThreatDistribution";
import RiskLevelDistribution from "./RiskLevelDistribution";
import SourceBreakdown from "./SourceBreakdown";
import DetectionAccuracy from "./DetectionAccuracy";
import ResponseTimeAnalysis from "./ResponseTimeAnalysis";
import DetectionTimeline from "./DetectionTimeline";
import SourceActivityTimeline from "./SourceActivityTimeline";
import AnomalyScoreChart from "./AnomalyScoreChart";
import { fetchThreats, fetchLogs } from "@/services/api";

const AnalyticsModule = ({ activeThreatCount = 0 }) => {
  const [systemStatus, setSystemStatus] = useState({
    status: 'inactive',
    version: '0.0.0',
    activeServices: [],
    resources: { cpu: 0, memory: 0, disk: 0, network: 0 },
    uptime: 0,
    lastScan: new Date().toISOString()
  });
  const [threats, setThreats] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      const status = {
        status: 'active',
        version: '1.5.3',
        activeServices: [
          { name: 'Threat Detection Engine', status: 'healthy', lastUpdated: new Date().toISOString() },
          { name: 'Log Collection Service', status: 'healthy', lastUpdated: new Date().toISOString() },
          { name: 'Anomaly Detection', status: 'healthy', lastUpdated: new Date().toISOString() },
          { name: 'Response Automation', status: 'healthy', lastUpdated: new Date().toISOString() }
        ],
        resources: {
          cpu: Math.random() * 5 + 1, // 1-6% CPU usage
          memory: Math.random() * 150 + 100, // 100-250MB memory usage
          disk: Math.random() * 10, // 0-10MB disk space
          network: Math.random() * 5 // 0-5KB/s network usage
        },
        uptime: 841200, // 9.74 days in seconds
        lastScan: new Date(Date.now() - 1000 * 60 * Math.random() * 60).toISOString() // 0-60 mins ago
      };
      setSystemStatus(status);
    };

    const loadData = async () => {
      try {
        setLoading(true);
        const [threatsData, logsData] = await Promise.all([
          fetchThreats({ limit: 50 }),
          fetchLogs({ limit: 100 })
        ]);
        
        setThreats(threatsData);
        setLogs(logsData);
      } catch (err) {
        console.error("Error fetching data for analytics:", err);
        
        // Load mock data if API fails
        import("@/data/mockData").then(({ mockThreats, mockLogs }) => {
          setThreats(mockThreats);
          setLogs(mockLogs);
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    loadData();

    // Refresh data every 60 seconds
    const refreshInterval = setInterval(() => {
      fetchStatus();
      loadData();
    }, 60000);

    return () => clearInterval(refreshInterval);
  }, []);

  // Use formatToIST method from the AzureLogSimulator instance
  const lastUpdated = AzureLogSimulator.constructor['formatToIST'](new Date().toISOString());

  return (
    <div className="space-y-4">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg">System Analytics</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <MetricCard
            icon={Server}
            title="System Status"
            value={systemStatus.status}
            deltaText={`Last Updated: ${lastUpdated}`}
          />
          <MetricCard
            icon={Database}
            title="Version"
            value={systemStatus.version}
            deltaText="Latest"
          />
          <MetricCard
            icon={Users}
            title="Active Services"
            value={systemStatus.activeServices.length.toString()}
            deltaText="Running"
          />
          <MetricCard
            icon={ShieldAlert}
            title="Active Threats"
            value={activeThreatCount.toString()}
            deltaText={activeThreatCount === 0 ? "System Protected" : "Requires Attention"}
          />
          <MetricCard
            icon={Clock}
            title="Uptime"
            value={`${(systemStatus.uptime / 3600).toFixed(2)} hours`}
            deltaText="Since last restart"
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ThreatDistribution data={threats} loading={loading} />
        <RiskLevelDistribution data={threats} loading={loading} />
        <DetectionAccuracy data={threats} loading={loading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ResponseTimeAnalysis data={threats} loading={loading} />
        <SourceBreakdown data={logs} loading={loading} />
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Detection Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <DetectionTimeline data={threats} loading={loading} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SourceActivityTimeline data={logs} loading={loading} />
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Anomaly Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <AnomalyScoreChart data={threats} loading={loading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsModule;
