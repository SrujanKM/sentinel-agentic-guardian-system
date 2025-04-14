
import React, { useState, useEffect } from "react";
import { Terminal } from "lucide-react";

const StartupSequence = () => {
  const [lines, setLines] = useState([]);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const startupMessages = [
      { text: "Loading Python environment... Done", delay: 500 },
      { text: "Initializing FastAPI server... Done", delay: 800 },
      { text: "Creating SQLite database with encryption... Done", delay: 1200 },
      { text: "Connecting to Azure Log sources... Done", delay: 900 },
      { text: "Loading Isolation Forest model... Done", delay: 1100 },
      { text: "Starting anomaly detection service... Done", delay: 1000 },
      { text: "Loading threat intelligence database... Done", delay: 700 },
      { text: "Starting automated response system... Done", delay: 900 },
      { text: "System ready. Click Initialize to begin.", delay: 1000 }
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < startupMessages.length) {
        const { text, delay } = startupMessages[currentIndex];
        setLines(prev => [...prev, `> ${text}`]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 600);

    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => {
      clearInterval(interval);
      clearInterval(cursorInterval);
    };
  }, []);

  return (
    <div className="w-full max-w-3xl bg-black border border-emerald-500/30 rounded-md overflow-hidden shadow-lg shadow-emerald-500/10">
      <div className="bg-gray-900 border-b border-emerald-500/20 p-2 flex items-center gap-2">
        <Terminal className="h-4 w-4 text-emerald-500" />
        <span className="text-xs font-mono text-emerald-400">CloudShield - A Framework for Cloud Data Security using Agentic AI</span>
      </div>
      <div className="p-4 font-mono text-sm">
        {lines.map((line, i) => (
          <div key={i} className="text-gray-300 mb-1">{line}</div>
        ))}
        <div className="text-emerald-400 flex">
          <span>{">"}</span>
          <span className="w-2"></span>
          <span className={showCursor ? "blink" : ""}>_</span>
        </div>
      </div>
    </div>
  );
};

export default StartupSequence;
