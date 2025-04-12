
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ShieldAlert, ArrowRightCircle, CheckCircle, Clock, Server, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { triggerAction } from "@/services/api";

const ThreatDetails = ({ selectedThreat }) => {
  const { toast } = useToast();
  const [isResolving, setIsResolving] = useState(false);
  const [isResolved, setIsResolved] = useState(false);

  if (!selectedThreat) {
    return (
      <Card className="bg-gray-900 border-gray-800 h-[400px]">
        <CardHeader>
          <CardTitle className="text-lg">Threat Details</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="text-center text-gray-500">
            <ShieldAlert className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Select a threat to view details</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "text-red-500 bg-red-500/10";
      case "investigating":
        return "text-orange-500 bg-orange-500/10";
      case "contained":
        return "text-blue-500 bg-blue-500/10";
      case "resolved":
        return "text-green-500 bg-green-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  const handleRespondButton = async () => {
    try {
      await triggerAction({
        action_type: "respond_to_threat",
        threat_id: selectedThreat.id,
        details: {
          action: "automated_response",
          notes: "Triggered by analyst"
        }
      });
      
      toast({
        title: "Response Initiated",
        description: `Automated response to ${selectedThreat.title} has been triggered.`,
      });
    } catch (error) {
      console.error("Failed to trigger response:", error);
      toast({
        title: "Action Failed",
        description: "Could not initiate response. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsResolved = async () => {
    setIsResolving(true);
    
    try {
      await triggerAction({
        action_type: "resolve_threat",
        threat_id: selectedThreat.id,
        details: {
          resolution: "manually_resolved",
          notes: "Marked as resolved by analyst"
        }
      });
      
      // Update local state
      setIsResolved(true);
      selectedThreat.status = "resolved";
      
      toast({
        title: "Threat Resolved",
        description: `${selectedThreat.title} has been marked as resolved.`,
      });
    } catch (error) {
      console.error("Failed to resolve threat:", error);
      toast({
        title: "Action Failed",
        description: "Could not resolve the threat. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResolving(false);
    }
  };

  const resolvedStatus = isResolved || selectedThreat.status === "resolved";

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{selectedThreat.title}</CardTitle>
          <Badge className={getStatusColor(resolvedStatus ? "resolved" : selectedThreat.status)}>
            {resolvedStatus ? "Resolved" : selectedThreat.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-gray-300">{selectedThreat.description}</p>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1 text-gray-400">
            <AlertCircle className="h-3 w-3" />
            <span>Severity: </span>
            <span className="text-white">{selectedThreat.severity}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <Clock className="h-3 w-3" />
            <span>Detected: </span>
            <span className="text-white">{selectedThreat.timestamp}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <Server className="h-3 w-3" />
            <span>Source: </span>
            <span className="text-white">{selectedThreat.source}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <User className="h-3 w-3" />
            <span>Related User: </span>
            <span className="text-white">{selectedThreat.user || "Unknown"}</span>
          </div>
        </div>

        {selectedThreat.indicators && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Indicators of Compromise</h4>
            <div className="bg-gray-800 rounded-md p-2 text-xs space-y-1">
              {selectedThreat.indicators.map((indicator, idx) => (
                <div key={idx} className="flex items-start gap-1">
                  <ArrowRightCircle className="h-3 w-3 text-emerald-400 mt-0.5" />
                  <span className="text-gray-300">{indicator}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedThreat.actions && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Automated Actions</h4>
            <div className="bg-gray-800 rounded-md p-2 text-xs space-y-1">
              {selectedThreat.actions.map((action, idx) => (
                <div key={idx} className="flex items-start gap-1">
                  <CheckCircle className="h-3 w-3 text-blue-400 mt-0.5" />
                  <span className="text-gray-300">{action}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            className="bg-emerald-600 hover:bg-emerald-700 flex-1"
            onClick={handleRespondButton}
            disabled={resolvedStatus}
          >
            Respond
          </Button>
          <Button 
            size="sm" 
            variant={resolvedStatus ? "default" : "outline"} 
            className={`flex-1 ${
              resolvedStatus 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "border-blue-500 text-blue-400 hover:bg-blue-500/10"
            }`}
            onClick={handleMarkAsResolved}
            disabled={resolvedStatus || isResolving}
          >
            {isResolving ? "Processing..." : (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Mark as Resolved
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThreatDetails;
