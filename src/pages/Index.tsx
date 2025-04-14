
import React from "react";
import { Button } from "@/components/ui/button";
import Dashboard from "@/components/Dashboard";
import SecurityHeader from "@/components/SecurityHeader";
import StartupSequence from "@/components/StartupSequence";

const Index = () => {
  const [systemStarted, setSystemStarted] = React.useState(false);

  const handleStartSystem = () => {
    setSystemStarted(true);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {!systemStarted ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <h1 className="text-2xl font-bold text-emerald-400 font-mono mb-8 text-center">
            CloudShield - A Framework for Cloud Data Security using Agentic AI
          </h1>
          <StartupSequence />
          <div className="mt-8">
            <Button 
              onClick={handleStartSystem} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono py-2 px-6 rounded-md"
            >
              INITIALIZE SYSTEM
            </Button>
          </div>
        </div>
      ) : (
        <>
          <SecurityHeader />
          <Dashboard />
        </>
      )}
    </div>
  );
};

export default Index;
