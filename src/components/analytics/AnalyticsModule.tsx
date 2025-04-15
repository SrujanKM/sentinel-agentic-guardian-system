import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { Clock, Database, Server, ShieldAlert, Users } from "lucide-react";
import AzureLogSimulator from "@/services/azureLogSimulator";

const AnalyticsModule = () => {
  const [systemStatus, setSystemStatus] = useState({
    status: 'inactive',
    version: '0.0.0',
    activeServices: [],
    resources: { cpu: 0, memory: 0, disk: 0, network: 0 },
    uptime: 0,
    lastScan: new Date().toISOString()
  });

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

    fetchStatus();
  }, []);

  const lastUpdated = AzureLogSimulator.constructor.formatToIST(new Date().toISOString());

  return (
    <Card className="col-span-2 bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-lg">System Analytics</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
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
          title="CPU Usage"
          value={`${systemStatus.resources.cpu.toFixed(2)}%`}
          deltaText="Current"
        />
        <MetricCard
          icon={Clock}
          title="Uptime"
          value={`${(systemStatus.uptime / 3600).toFixed(2)} hours`}
          deltaText="Since last restart"
        />
      </CardContent>
    </Card>
  );
};

export default AnalyticsModule;
