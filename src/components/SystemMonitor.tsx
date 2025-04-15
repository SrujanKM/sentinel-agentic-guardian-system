
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { fetchSystemStatus } from "@/services/api";
import { MetricCard } from "@/components/ui/metric-card";
import { CircleCheck, Clock, Server, Shield, Users, Verified, Cpu, Database, NetworkIcon, ShieldAlert } from "lucide-react";
import { formatDistance } from "date-fns";
import { Badge } from "@/components/ui/badge";

const SystemMonitor = ({ activeThreatCount = 0 }) => {
  const [systemStatus, setSystemStatus] = useState({
    status: 'initializing',
    uptime: 0,
    version: '0.0.0',
    lastScan: new Date().toISOString(),
    activeServices: [],
    resources: {
      cpu: 0,
      memory: 0,
      disk: 0,
      network: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSystemStatus = async () => {
      try {
        setLoading(true);
        const status = await fetchSystemStatus();
        setSystemStatus(status);
      } catch (error) {
        console.error("Failed to load system status:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSystemStatus();
    
    // Refresh system status every 20 seconds
    const refreshInterval = setInterval(loadSystemStatus, 20000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    
    return parts.join(' ');
  };
  
  const getLastScanAgo = () => {
    try {
      const lastScanDate = new Date(systemStatus.lastScan);
      return formatDistance(lastScanDate, new Date(), { addSuffix: true });
    } catch (error) {
      return "unknown";
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Security monitoring and health</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              className={`${
                systemStatus.status === 'active' 
                  ? 'bg-green-500/20 text-green-400 border-green-500' 
                  : 'bg-yellow-500/20 text-yellow-400 border-yellow-500'
              }`}
            >
              {systemStatus.status === 'active' ? 'Active' : 'Initializing'}
            </Badge>
            {activeThreatCount > 0 && (
              <Badge className="bg-red-600 text-white">
                {activeThreatCount} Active Threat{activeThreatCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 lg:col-span-1">
            <div className="grid grid-cols-2 gap-4">
              <MetricCard
                icon={Shield}
                title="Security Status"
                value={activeThreatCount > 0 ? "Alert" : "Protected"}
                deltaText={activeThreatCount > 0 ? `${activeThreatCount} active threat${activeThreatCount !== 1 ? 's' : ''}` : "No active threats"}
              />
              <MetricCard
                icon={CircleCheck}
                title="Security Version"
                value={systemStatus.version}
                deltaText="Current version"
              />
              <MetricCard
                icon={Clock}
                title="Uptime"
                value={formatUptime(systemStatus.uptime)}
                deltaText="Continuous monitoring"
              />
              <MetricCard
                icon={Verified}
                title="Last Scan"
                value={getLastScanAgo()}
                deltaText="Automatic scanning"
              />
            </div>
          </div>
          
          <div className="col-span-2 lg:col-span-1">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-1">
                    <Cpu className="h-4 w-4 text-blue-400" />
                    <span>CPU Usage</span>
                  </span>
                  <span>{systemStatus.resources.cpu.toFixed(1)}%</span>
                </div>
                <Progress value={systemStatus.resources.cpu} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-1">
                    <Database className="h-4 w-4 text-green-400" />
                    <span>Memory Usage</span>
                  </span>
                  <span>{systemStatus.resources.memory.toFixed(0)} MB</span>
                </div>
                <Progress value={(systemStatus.resources.memory / 500) * 100} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-1">
                    <Server className="h-4 w-4 text-purple-400" />
                    <span>Disk I/O</span>
                  </span>
                  <span>{systemStatus.resources.disk.toFixed(1)} MB/s</span>
                </div>
                <Progress value={(systemStatus.resources.disk / 20) * 100} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-1">
                    <NetworkIcon className="h-4 w-4 text-yellow-400" />
                    <span>Network</span>
                  </span>
                  <span>{systemStatus.resources.network.toFixed(1)} KB/s</span>
                </div>
                <Progress value={(systemStatus.resources.network / 10) * 100} className="h-2" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="text-sm font-medium mb-2 flex items-center">
            <Users className="h-4 w-4 mr-1 text-blue-400" />
            <span>Active Services</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {systemStatus.activeServices.map((service, index) => (
              <div key={index} className="bg-gray-800 p-2 rounded-md text-xs">
                <div className="flex items-center justify-between">
                  <span className="truncate">{service.name}</span>
                  <Badge 
                    className={`${
                      service.status === 'healthy' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    } text-[10px] px-1 py-0`}
                  >
                    {service.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemMonitor;
