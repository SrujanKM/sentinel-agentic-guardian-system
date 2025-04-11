
import React from "react";
import { AlertTriangle, Shield, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const SecurityHeader = () => {
  return (
    <header className="bg-gray-900 border-b border-gray-800 p-4">
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
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
          
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          
          <Button variant="destructive" size="sm" className="gap-1">
            <AlertTriangle className="h-4 w-4" />
            <span>Threats (3)</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default SecurityHeader;
