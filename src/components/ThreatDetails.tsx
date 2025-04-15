
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  AlertTriangle, Clock, Server, User, ScanLine, 
  CheckCircle, AlertOctagon, Filter, Shield
} from "lucide-react";
import { triggerAction } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import AzureLogSimulator from "@/services/azureLogSimulator";

const ThreatDetails = ({ selectedThreat, onThreatStatusChange }) => {
  const { toast } = useToast();
  const [isResponding, setIsResponding] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  if (!selectedThreat) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Threat Details
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-400 text-sm py-8 text-center">
          <Shield className="h-12 w-12 mx-auto mb-3 text-gray-700" />
          <p>Select a threat to view details</p>
        </CardContent>
      </Card>
    );
  }

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "Unknown date";
    return AzureLogSimulator.constructor['formatToIST'](timestamp);
  };

  const handleRespondButton = async () => {
    try {
      setIsResponding(true);
      await triggerAction({
        action_type: "respond_to_threat",
        threat_id: selectedThreat.id,
      });
      
      toast({
        title: "Response Initiated",
        description: "Automated response to threat has been initiated."
      });
      
      // Update the threat status to "investigating"
      const updatedThreat = {
        ...selectedThreat,
        status: "investigating"
      };
      
      // Notify parent component of the status change
      if (onThreatStatusChange) {
        onThreatStatusChange(updatedThreat);
      }
      
    } catch (error) {
      console.error("Failed to respond to threat:", error);
      toast({
        title: "Action Failed",
        description: "Could not respond to the threat. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsResponding(false);
    }
  };
  
  const handleResolveButton = async () => {
    try {
      setIsResolving(true);
      await triggerAction({
        action_type: "resolve_threat",
        threat_id: selectedThreat.id,
        details: {
          resolution: "manually_resolved",
          notes: "Marked as resolved by analyst"
        }
      });
      
      toast({
        title: "Threat Resolved",
        description: "Threat has been marked as resolved."
      });
      
      // Update the threat status to "resolved"
      const updatedThreat = {
        ...selectedThreat,
        status: "resolved"
      };
      
      // Notify parent component of the status change
      if (onThreatStatusChange) {
        onThreatStatusChange(updatedThreat);
      }
      
    } catch (error) {
      console.error("Failed to resolve threat:", error);
      toast({
        title: "Action Failed",
        description: "Could not resolve the threat. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsResolving(false);
    }
  };

  const getStatusBadge = () => {
    switch (selectedThreat.status.toLowerCase()) {
      case "active":
        return <Badge className="bg-red-500/20 text-red-400 border-red-600">Active</Badge>;
      case "investigating":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-600">Investigating</Badge>;
      case "contained":
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-600">Contained</Badge>;
      case "resolved":
        return <Badge className="bg-green-500/20 text-green-400 border-green-600">Resolved</Badge>;
      default:
        return <Badge>{selectedThreat.status}</Badge>;
    }
  };
  
  const getSeverityBadge = () => {
    switch (selectedThreat.severity.toLowerCase()) {
      case "critical":
        return <Badge className="bg-red-500/20 text-red-400 border-red-600">Critical</Badge>;
      case "high":
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-600">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-600">Medium</Badge>;
      case "low":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-600">Low</Badge>;
      default:
        return <Badge>{selectedThreat.severity}</Badge>;
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Threat Details
          </CardTitle>
          <div className="flex items-center gap-1">
            {getStatusBadge()}
            {getSeverityBadge()}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[450px]">
          <div className="p-4 space-y-4">
            <div>
              <h3 className="text-lg font-medium">{selectedThreat.title}</h3>
              <p className="text-gray-400 text-sm mt-1">
                {selectedThreat.description}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-400">Detected:</span>
              </div>
              <div>{formatDateTime(selectedThreat.timestamp)}</div>
              
              <div className="flex items-center gap-1">
                <Server className="h-4 w-4 text-gray-500" />
                <span className="text-gray-400">Source:</span>
              </div>
              <div>{selectedThreat.source}</div>
              
              <div className="flex items-center gap-1">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-gray-400">Type:</span>
              </div>
              <div>{selectedThreat.type}</div>
              
              {selectedThreat.user && (
                <>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-400">User:</span>
                  </div>
                  <div>{selectedThreat.user}</div>
                </>
              )}
            </div>
            
            <Separator />
            
            {selectedThreat.indicators && selectedThreat.indicators.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <AlertOctagon className="h-4 w-4 mr-1 text-yellow-500" />
                  Indicators of Compromise
                </h4>
                <div className="bg-gray-800 rounded-md p-2 text-sm">
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    {selectedThreat.indicators.map((indicator, index) => (
                      <li key={index}>{indicator}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {selectedThreat.actions && selectedThreat.actions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <ScanLine className="h-4 w-4 mr-1 text-blue-500" />
                  Recommended Actions
                </h4>
                <div className="bg-gray-800 rounded-md p-2 text-sm">
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    {selectedThreat.actions.map((action, index) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            <div className="pt-2 flex gap-2 justify-end">
              {selectedThreat.status !== "resolved" && (
                <>
                  {selectedThreat.status === "active" && (
                    <Button 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={handleRespondButton}
                      disabled={isResponding}
                    >
                      {isResponding ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <ScanLine className="h-4 w-4 mr-1" />
                          Respond Automatically
                        </>
                      )}
                    </Button>
                  )}
                  
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleResolveButton}
                    disabled={isResolving}
                  >
                    {isResolving ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark as Resolved
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ThreatDetails;
