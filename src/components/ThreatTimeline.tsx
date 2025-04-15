
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, Shield, Lock, Server, User, 
  AlertCircle, ExternalLink, CheckCircle, Clock, 
  RefreshCw, Filter, ChevronLeft, ChevronRight, ShieldAlert
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { triggerAction } from "@/services/api";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AzureLogSimulator from "@/services/azureLogSimulator";

const THREATS_PER_PAGE = 5;

const ThreatTimeline = ({ threats, onThreatSelect, expanded = false, onThreatStatusChange }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [resolvedThreats, setResolvedThreats] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(0);
  
  const getThreatIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "malware":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "brute force":
        return <Lock className="h-5 w-5 text-orange-500" />;
      case "unauthorized access":
        return <User className="h-5 w-5 text-yellow-500" />;
      case "privilege escalation":
        return <Shield className="h-5 w-5 text-purple-500" />;
      case "data exfiltration":
        return <Server className="h-5 w-5 text-blue-500" />;
      case "anomaly":
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <Shield className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
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

  const handleThreatDetail = (threat) => {
    onThreatSelect(threat);
  };
  
  const handleRefresh = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Threats Refreshed",
        description: "Latest threat information loaded",
      });
    }, 800);
  };
  
  const handleResolveThreat = async (e, threat) => {
    e.stopPropagation();
    
    try {
      setResolvedThreats(prev => new Set(prev).add(threat.id));
      
      const response = await triggerAction({
        action_type: "resolve_threat",
        threat_id: threat.id,
        details: {
          resolution: "manually_resolved",
          notes: "Marked as resolved by analyst"
        }
      });
      
      // Update the threat status
      threat.status = "resolved";
      
      // Call the parent component's handler to update threat status
      if (onThreatStatusChange) {
        const updatedThreats = threats.map(t => 
          t.id === threat.id ? { ...t, status: "resolved" } : t
        );
        onThreatStatusChange(updatedThreats);
      }
      
      toast({
        title: "Threat Resolved",
        description: "The threat has been marked as resolved",
      });
      
    } catch (error) {
      console.error("Failed to resolve threat:", error);
      setResolvedThreats(prev => {
        const newSet = new Set(prev);
        newSet.delete(threat.id);
        return newSet;
      });
      
      toast({
        title: "Action Failed",
        description: "Could not resolve the threat. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const formatTimeAgo = (timestamp) => {
    return AzureLogSimulator.constructor['formatTimeAgo'](timestamp);
  };

  const formatTimestamp = (timestamp) => {
    return AzureLogSimulator.constructor['formatToIST'](timestamp);
  };

  const filteredThreats = threats.filter(threat => {
    if (activeFilter === "all") return true;
    if (activeFilter === "active") return threat.status === "active";
    if (activeFilter === "resolved") return threat.status === "resolved";
    if (activeFilter === "critical") return threat.severity === "critical";
    if (activeFilter === "high") return threat.severity === "high";
    return threat.type === activeFilter;
  });

  const sortedThreats = [...filteredThreats]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .filter((threat, index, array) => {
      if (index === 0) return true;
      
      const prevThreat = array[index - 1];
      const timeDiff = Math.abs(new Date(threat.timestamp).getTime() - new Date(prevThreat.timestamp).getTime());
      
      return !(
        threat.type === prevThreat.type && 
        timeDiff < 120000 && 
        threat.description === prevThreat.description && 
        threat.source === prevThreat.source
      );
    });

  const totalPages = Math.ceil(sortedThreats.length / THREATS_PER_PAGE);
  const paginatedThreats = expanded 
    ? sortedThreats.slice(
        currentPage * THREATS_PER_PAGE, 
        (currentPage + 1) * THREATS_PER_PAGE
      )
    : sortedThreats.slice(
        currentPage * THREATS_PER_PAGE, 
        (currentPage + 1) * THREATS_PER_PAGE
      );

  // Calculate active threat count (non-resolved threats)
  const activeThreatsCount = sortedThreats.filter(threat => threat.status !== "resolved").length;

  return (
    <Card className="bg-gray-900 border-gray-800 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Threat Timeline
            <div className="flex gap-2">
              {sortedThreats.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {sortedThreats.length} total
                </Badge>
              )}
              {activeThreatsCount > 0 && (
                <Badge className="bg-red-600 text-white border-red-600">
                  {activeThreatsCount} active
                </Badge>
              )}
            </div>
          </CardTitle>
          
          <div className="flex gap-2 items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 gap-1 text-gray-400 hover:text-white"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1 text-gray-400 hover:text-white">
                  <Filter className="h-3 w-3" />
                  <span>Filter</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2 bg-gray-900 border-gray-800 z-50">
                <Tabs defaultValue="status" className="w-[200px]">
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="status">Status</TabsTrigger>
                    <TabsTrigger value="type">Type</TabsTrigger>
                  </TabsList>
                  <TabsContent value="status" className="space-y-1 mt-2">
                    <Button 
                      variant={activeFilter === "all" ? "default" : "ghost"} 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setActiveFilter("all")}
                    >
                      All
                    </Button>
                    <Button 
                      variant={activeFilter === "active" ? "default" : "ghost"} 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setActiveFilter("active")}
                    >
                      Active
                    </Button>
                    <Button 
                      variant={activeFilter === "resolved" ? "default" : "ghost"} 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setActiveFilter("resolved")}
                    >
                      Resolved
                    </Button>
                    <Button 
                      variant={activeFilter === "critical" ? "default" : "ghost"} 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setActiveFilter("critical")}
                    >
                      Critical
                    </Button>
                    <Button 
                      variant={activeFilter === "high" ? "default" : "ghost"} 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setActiveFilter("high")}
                    >
                      High
                    </Button>
                  </TabsContent>
                  <TabsContent value="type" className="space-y-1 mt-2">
                    <Button 
                      variant={activeFilter === "malware" ? "default" : "ghost"} 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setActiveFilter("malware")}
                    >
                      Malware
                    </Button>
                    <Button 
                      variant={activeFilter === "brute force" ? "default" : "ghost"} 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setActiveFilter("brute force")}
                    >
                      Brute Force
                    </Button>
                    <Button 
                      variant={activeFilter === "unauthorized access" ? "default" : "ghost"} 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setActiveFilter("unauthorized access")}
                    >
                      Unauthorized Access
                    </Button>
                    <Button 
                      variant={activeFilter === "privilege escalation" ? "default" : "ghost"} 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setActiveFilter("privilege escalation")}
                    >
                      Privilege Escalation
                    </Button>
                    <Button 
                      variant={activeFilter === "data exfiltration" ? "default" : "ghost"} 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setActiveFilter("data exfiltration")}
                    >
                      Data Exfiltration
                    </Button>
                    <Button 
                      variant={activeFilter === "anomaly" ? "default" : "ghost"} 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setActiveFilter("anomaly")}
                    >
                      Anomaly
                    </Button>
                  </TabsContent>
                </Tabs>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {paginatedThreats.length > 0 ? (
            paginatedThreats.map((threat) => (
              <div 
                key={threat.id} 
                className="relative pl-6 border-l border-gray-700 pb-4 last:pb-0"
              >
                <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full border-2 border-gray-700 bg-gray-900 flex items-center justify-center">
                  {getThreatIcon(threat.type)}
                </div>
                
                <div 
                  className="bg-gray-800 rounded-md p-3 hover:bg-gray-750 transition-colors cursor-pointer"
                  onClick={() => handleThreatDetail(threat)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-white">{threat.title}</h4>
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span title={formatTimestamp(threat.timestamp)}>
                          {formatTimeAgo(threat.timestamp)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {threat.status === "resolved" ? (
                        <Badge className="bg-green-500/20 text-green-500 border-green-500">
                          Resolved
                        </Badge>
                      ) : (
                        <Badge className={`${getSeverityColor(threat.severity)} border`}>
                          {threat.severity}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{threat.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Server className="h-3 w-3" />
                      <span>{threat.source}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {threat.status !== "resolved" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className={`text-xs h-7 px-2 ${
                            resolvedThreats.has(threat.id) 
                              ? "bg-green-600 hover:bg-green-700 text-white" 
                              : "border-blue-500 text-blue-400 hover:bg-blue-500/10"
                          }`}
                          onClick={(e) => handleResolveThreat(e, threat)}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Resolve
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs text-blue-400 hover:text-blue-300 h-7 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleThreatDetail(threat);
                        }}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-gray-500">
              <Shield className="h-16 w-16 mb-2 text-gray-700" />
              <p>No threats match the selected filter</p>
              <Button 
                variant="ghost" 
                className="mt-2"
                onClick={() => setActiveFilter("all")}
              >
                Show all threats
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      
      {totalPages > 1 && (
        <CardFooter className="flex justify-between items-center pt-2 pb-3">
          <div className="text-xs text-gray-400">
            Showing {currentPage * THREATS_PER_PAGE + 1}-{Math.min((currentPage + 1) * THREATS_PER_PAGE, sortedThreats.length)} of {sortedThreats.length}
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage >= totalPages - 1}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default ThreatTimeline;
