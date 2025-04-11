
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, Lock, Server, User, AlertCircle } from "lucide-react";

const ThreatTimeline = ({ threats, onThreatSelect, expanded = false }) => {
  // Map threat type to icon
  const getThreatIcon = (type) => {
    switch (type.toLowerCase()) {
      case "malware":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "brute force":
        return <Lock className="h-5 w-5 text-orange-500" />;
      case "unauthorized access":
        return <User className="h-5 w-5 text-yellow-500" />;
      case "anomaly":
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <Shield className="h-5 w-5 text-gray-500" />;
    }
  };

  // Map severity to color
  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "bg-red-500/20 text-red-500 border-red-500";
      case "high":
        return "bg-orange-500/20 text-orange-500 border-orange-500";
      case "medium":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500";
      case "low":
        return "bg-blue-500/20 text-blue-500 border-blue-500";
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500";
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Threat Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {threats.slice(0, expanded ? undefined : 5).map((threat) => (
            <div 
              key={threat.id} 
              className="relative pl-6 border-l border-gray-700 pb-4 last:pb-0"
              onClick={() => onThreatSelect(threat)}
            >
              {/* Timeline node */}
              <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full border-2 border-gray-700 bg-gray-900 flex items-center justify-center">
                {getThreatIcon(threat.type)}
              </div>
              
              {/* Timeline content */}
              <div className="bg-gray-800 rounded-md p-3 hover:bg-gray-750 transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-white">{threat.title}</h4>
                    <div className="text-xs text-gray-400">{threat.timestamp}</div>
                  </div>
                  <Badge className={`${getSeverityColor(threat.severity)} border`}>
                    {threat.severity}
                  </Badge>
                </div>
                <p className="text-sm text-gray-300 mb-2">{threat.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Server className="h-3 w-3" />
                    <span>{threat.source}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-emerald-400 hover:text-emerald-300"
                  >
                    Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {!expanded && threats.length > 5 && (
            <Button variant="ghost" className="w-full text-gray-400 hover:text-white">
              View All Threats
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ThreatTimeline;
