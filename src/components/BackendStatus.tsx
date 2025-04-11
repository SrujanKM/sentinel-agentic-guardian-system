
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, Database, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const BackendStatus = () => {
  const apiEndpoints = [
    { name: "GET /logs", description: "Fetch logs with filtering", status: "active" },
    { name: "POST /logs", description: "Submit new log entries", status: "active" },
    { name: "GET /threats", description: "Retrieve detected threats", status: "active" },
    { name: "POST /actions", description: "Trigger security actions", status: "active" },
    { name: "GET /stats", description: "System statistics", status: "active" }
  ];

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Server className="h-5 w-5 text-emerald-500" />
          Python Backend Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <span>FastAPI Server</span>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500">
              Running
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              <span>SQLite Database</span>
            </div>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500">
              Connected
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-purple-500" />
              <span>Anomaly Detector</span>
            </div>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500">
              Active
            </Badge>
          </div>
          
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-400 mb-2">API Endpoints</h3>
            <div className="space-y-1">
              {apiEndpoints.map((endpoint, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-800 p-2 rounded-md">
                  <div>
                    <div className="font-mono text-xs">{endpoint.name}</div>
                    <div className="text-xs text-gray-400">{endpoint.description}</div>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500 text-xs">
                    {endpoint.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between mt-4">
            <Button variant="outline" size="sm" className="gap-1 text-xs bg-gray-800 hover:bg-gray-700">
              <Server className="h-3 w-3" />
              Swagger Docs
            </Button>
            <Button variant="outline" size="sm" className="gap-1 text-xs bg-gray-800 hover:bg-gray-700">
              <Database className="h-3 w-3" />
              ReDoc
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BackendStatus;
