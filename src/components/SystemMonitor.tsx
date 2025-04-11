
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, Server, Shield, AlertTriangle, Lock, Database } from "lucide-react";

const SystemMonitor = () => {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-emerald-500" />
          System Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* System Health Metrics */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-400">System Health</h3>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-blue-400" />
                    <span className="text-sm">CPU Usage</span>
                  </div>
                  <span className="text-sm font-medium">38%</span>
                </div>
                <Progress value={38} className="h-1.5 bg-gray-700" indicatorClassName="bg-blue-500" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-purple-400" />
                    <span className="text-sm">Memory Usage</span>
                  </div>
                  <span className="text-sm font-medium">64%</span>
                </div>
                <Progress value={64} className="h-1.5 bg-gray-700" indicatorClassName="bg-purple-500" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-400" />
                    <span className="text-sm">Network Activity</span>
                  </div>
                  <span className="text-sm font-medium">26%</span>
                </div>
                <Progress value={26} className="h-1.5 bg-gray-700" indicatorClassName="bg-green-500" />
              </div>
            </div>
          </div>
          
          {/* Security Metrics */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-400">Security Metrics</h3>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm">System Protection</span>
                  </div>
                  <span className="text-sm font-medium">94%</span>
                </div>
                <Progress value={94} className="h-1.5 bg-gray-700" indicatorClassName="bg-emerald-500" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <span className="text-sm">Threat Level</span>
                  </div>
                  <span className="text-sm font-medium">42%</span>
                </div>
                <Progress value={42} className="h-1.5 bg-gray-700" indicatorClassName="bg-red-500" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-orange-400" />
                    <span className="text-sm">Access Violations</span>
                  </div>
                  <span className="text-sm font-medium">18%</span>
                </div>
                <Progress value={18} className="h-1.5 bg-gray-700" indicatorClassName="bg-orange-500" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemMonitor;
