import React, { useState, useEffect } from "react";
import { AlertTriangle, Shield, Bell, Settings, X, User, LogOut, Lock, Activity, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter,
  SheetDescription,
  SheetClose
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { fetchThreats } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SecurityHeader = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeThreats, setActiveThreats] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      type: "critical",
      title: "Critical Threat Detected",
      message: "Multiple failed login attempts detected from IP 192.168.1.45",
      time: "2 min ago",
      read: false
    },
    {
      id: "2",
      type: "warning",
      title: "Anomaly Detected",
      message: "Unusual system file access pattern from process explorer.exe",
      time: "15 min ago",
      read: false
    },
    {
      id: "3",
      type: "success",
      title: "Threat Resolved",
      message: "Previously detected malware threat has been quarantined and removed",
      time: "1 hour ago",
      read: true
    },
    {
      id: "4",
      type: "warning",
      title: "Suspicious Connection",
      message: "Outbound connection to known malicious IP address 103.45.67.89",
      time: "3 hours ago",
      read: true
    },
    {
      id: "5",
      type: "info",
      title: "System Update",
      message: "Security definitions have been updated to the latest version",
      time: "Yesterday",
      read: true
    }
  ]);
  const [userSettingsOpen, setUserSettingsOpen] = useState(false);
  const [securitySettingsOpen, setSecuritySettingsOpen] = useState(false);

  useEffect(() => {
    const getActiveThreats = async () => {
      try {
        const threats = await fetchThreats({ status: "active" });
        setActiveThreats(threats.length);
      } catch (error) {
        console.error("Failed to fetch threats:", error);
      }
    };
    
    getActiveThreats();
    
    const intervalId = setInterval(getActiveThreats, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const handleThreatClick = () => {
    navigate("/");
    setTimeout(() => {
      const threatsTab = document.querySelector('[value="threats"]');
      if (threatsTab) {
        (threatsTab as HTMLElement).click();
      }
    }, 100);
  };

  const getNotificationTypeStyles = (type) => {
    switch (type) {
      case "critical":
        return "border-l-2 border-red-500";
      case "warning":
        return "border-l-2 border-yellow-500";
      case "success":
        return "border-l-2 border-emerald-500";
      case "info":
        return "border-l-2 border-blue-500";
      default:
        return "border-l-2 border-gray-500";
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <Activity className="h-4 w-4 text-yellow-500" />;
      case "success":
        return <Shield className="h-4 w-4 text-emerald-500" />;
      case "info":
        return <Bell className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    
    toast({
      title: "Notifications Cleared",
      description: "All notifications have been marked as read",
    });
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-emerald-500" />
          <span className="text-xl font-bold text-emerald-400 font-mono">CloudShield</span>
          <span className="hidden md:inline text-sm text-emerald-400/70">A Framework for Cloud Data Security using Agentic AI</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="bg-gray-800 px-3 py-1 rounded-full flex items-center">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></div>
            <span className="text-sm text-emerald-400">System Active</span>
          </div>
          
          <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-gray-900 border-gray-800 text-white w-[350px] sm:w-[450px]">
              <SheetHeader>
                <SheetTitle className="text-white flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </SheetTitle>
                <SheetDescription className="text-gray-400">
                  You have {notifications.filter(n => !n.read).length} unread notifications
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`bg-gray-800 rounded-md p-3 ${getNotificationTypeStyles(notification.type)} ${!notification.read ? 'bg-gray-750' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {getNotificationIcon(notification.type)}
                        <span className="font-medium">{notification.title}</span>
                      </div>
                      <span className="text-xs text-gray-400">{notification.time}</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">{notification.message}</p>
                  </div>
                ))}
              </div>
              <SheetFooter className="mt-4 flex-col gap-2 sm:flex-row">
                <Button 
                  variant="outline" 
                  className="w-full border-gray-700 text-gray-400 hover:text-white"
                  onClick={markAllNotificationsAsRead}
                >
                  Mark All as Read
                </Button>
                <SheetClose asChild>
                  <Button 
                    variant="default" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Close
                  </Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800 text-white">
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2" onClick={() => {
                setUserSettingsOpen(true);
              }}>
                <User className="h-4 w-4" />
                <span>User Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2" onClick={() => {
                setSecuritySettingsOpen(true);
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
          
          <Dialog open={userSettingsOpen} onOpenChange={setUserSettingsOpen}>
            <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" /> User Settings
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Configure your personal preferences and account settings
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Account Information</Label>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="col-span-1 text-gray-400 text-sm">Username:</div>
                    <div className="col-span-3 text-sm">admin_user</div>
                    <div className="col-span-1 text-gray-400 text-sm">Email:</div>
                    <div className="col-span-3 text-sm">admin@sentinel.local</div>
                    <div className="col-span-1 text-gray-400 text-sm">Role:</div>
                    <div className="col-span-3 text-sm">System Administrator</div>
                  </div>
                </div>
                
                <Separator className="bg-gray-800" />
                
                <div className="space-y-2">
                  <Label>Password Settings</Label>
                  <Button className="w-full" variant="outline">Change Password</Button>
                </div>
                
                <Separator className="bg-gray-800" />
                
                <div className="space-y-2">
                  <Label>Notification Preferences</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <div className="text-xs text-gray-400">Receive critical alerts via email</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Desktop Notifications</Label>
                        <div className="text-xs text-gray-400">Show alerts as desktop notifications</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setUserSettingsOpen(false)}>Cancel</Button>
                <Button onClick={() => {
                  setUserSettingsOpen(false);
                  toast({
                    title: "Settings Saved",
                    description: "Your user settings have been updated",
                  });
                }}>Save Changes</Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={securitySettingsOpen} onOpenChange={setSecuritySettingsOpen}>
            <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" /> Security Settings
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Configure system security and detection preferences
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Detection Thresholds</Label>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <Label className="text-sm">Anomaly Detection Sensitivity</Label>
                        <span className="text-xs text-gray-400">High</span>
                      </div>
                      <Input type="range" min="1" max="10" defaultValue="8" className="w-full" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <Label className="text-sm">Alert Threshold</Label>
                        <span className="text-xs text-gray-400">Medium</span>
                      </div>
                      <Input type="range" min="1" max="10" defaultValue="5" className="w-full" />
                    </div>
                  </div>
                </div>
                
                <Separator className="bg-gray-800" />
                
                <div className="space-y-2">
                  <Label>Automated Response</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto-Quarantine Malware</Label>
                        <div className="text-xs text-gray-400">Automatically isolate detected malware</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Block Brute Force Attempts</Label>
                        <div className="text-xs text-gray-400">Temporarily block IPs after failed logins</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto-Update Threat Intelligence</Label>
                        <div className="text-xs text-gray-400">Keep threat data current</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
                
                <Separator className="bg-gray-800" />
                
                <div className="space-y-2">
                  <Label>Log Management</Label>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Log Retention Period</Label>
                      <div className="text-xs text-gray-400">How long to keep security logs</div>
                    </div>
                    <select className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm">
                      <option>30 days</option>
                      <option>60 days</option>
                      <option selected>90 days</option>
                      <option>180 days</option>
                      <option>1 year</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSecuritySettingsOpen(false)}>Cancel</Button>
                <Button onClick={() => {
                  setSecuritySettingsOpen(false);
                  toast({
                    title: "Security Settings Saved",
                    description: "Your security configuration has been updated",
                  });
                }}>Save Changes</Button>
              </div>
            </DialogContent>
          </Dialog>
          
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
