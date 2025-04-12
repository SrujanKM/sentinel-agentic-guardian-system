
import React, { useState } from "react";
import { AlertTriangle, Shield, Bell, Settings, X, User, LogOut, Lock, Activity, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { fetchThreats } from "@/services/api";
import { useNavigate } from "react-router-dom";

const SecurityHeader = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeThreats, setActiveThreats] = useState(3);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Fetch active threats count on component mount
  React.useEffect(() => {
    const getActiveThreats = async () => {
      try {
        const threats = await fetchThreats({ status: "active" });
        setActiveThreats(threats.length);
      } catch (error) {
        console.error("Failed to fetch threats:", error);
      }
    };
    
    getActiveThreats();
    
    // Refresh active threats every 30 seconds
    const intervalId = setInterval(getActiveThreats, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const handleThreatClick = () => {
    navigate("/");
    // Use setTimeout to ensure the DOM is updated before accessing the tabs
    setTimeout(() => {
      const threatsTab = document.querySelector('[value="threats"]');
      if (threatsTab) {
        (threatsTab as HTMLElement).click();
      }
    }, 100);
    
    toast({
      title: "Viewing Active Threats",
      description: `Displaying ${activeThreats} active threats in the system`,
    });
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-emerald-500" />
          <span className="text-xl font-bold text-emerald-400 font-mono">SENTINEL AGS</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="bg-gray-800 px-3 py-1 rounded-full flex items-center">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></div>
            <span className="text-sm text-emerald-400">System Active</span>
          </div>
          
          {/* Notifications Button */}
          <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-gray-900 border-gray-800 text-white w-[350px] sm:w-[450px]">
              <SheetHeader>
                <SheetTitle className="text-white flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="bg-gray-800 rounded-md p-3 border-l-2 border-red-500">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="font-medium">Critical Threat Detected</span>
                    </div>
                    <span className="text-xs text-gray-400">2 min ago</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">Multiple failed login attempts detected from IP 192.168.1.45</p>
                </div>
                
                <div className="bg-gray-800 rounded-md p-3 border-l-2 border-yellow-500">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">Anomaly Detected</span>
                    </div>
                    <span className="text-xs text-gray-400">15 min ago</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">Unusual system file access pattern from process explorer.exe</p>
                </div>
                
                <div className="bg-gray-800 rounded-md p-3 border-l-2 border-emerald-500">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-emerald-500" />
                      <span className="font-medium">Threat Resolved</span>
                    </div>
                    <span className="text-xs text-gray-400">1 hour ago</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">Previously detected malware threat has been quarantined and removed</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                className="w-full mt-4 text-gray-400 hover:text-white"
                onClick={() => setNotificationsOpen(false)}
              >
                View All Notifications
              </Button>
            </SheetContent>
          </Sheet>
          
          {/* Settings Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800 text-white">
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2" onClick={() => {
                toast({
                  title: "User Settings",
                  description: "User settings panel would open here",
                });
              }}>
                <User className="h-4 w-4" />
                <span>User Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2" onClick={() => {
                toast({
                  title: "Security Settings",
                  description: "Security settings panel would open here",
                });
              }}>
                <Lock className="h-4 w-4" />
                <span>Security Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-800" />
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2" onClick={() => {
                toast({
                  title: "Logged Out",
                  description: "You have been logged out of the system",
                });
              }}>
                <LogOut className="h-4 w-4" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Threats Button */}
          <Button 
            variant="destructive" 
            size="sm" 
            className="gap-1"
            onClick={handleThreatClick}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Threats ({activeThreats})</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default SecurityHeader;
