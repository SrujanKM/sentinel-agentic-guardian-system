
import React, { useEffect, useState } from "react";
import { Shield } from "lucide-react";

const StartupSequence = () => {
  const [textIndex, setTextIndex] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);

  const startupTexts = [
    "Initializing Sentinel Agentic Guardian System...",
    "Loading core modules...",
    "Establishing connection to monitoring agents...",
    "Configuring anomaly detection models...",
    "Preparing agent behavioral analysis system...",
    "Initializing threat response mechanisms...",
    "Sentinel AGS ready for activation."
  ];

  useEffect(() => {
    // Auto-advance text sequence
    const textTimer = setTimeout(() => {
      if (textIndex < startupTexts.length - 1) {
        setTextIndex(textIndex + 1);
      }
    }, 800);

    // Cursor blink effect
    const cursorTimer = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 500);

    return () => {
      clearTimeout(textTimer);
      clearInterval(cursorTimer);
    };
  }, [textIndex]);

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="flex justify-center mb-8">
        <Shield className="h-24 w-24 text-emerald-500" />
      </div>
      <h1 className="text-4xl font-bold mb-6 text-emerald-400 font-mono">SENTINEL AGS</h1>
      <h2 className="text-2xl mb-12 text-gray-400 font-mono">Advanced Guardian System</h2>
      
      <div className="bg-gray-900 p-6 rounded-lg border border-emerald-800 font-mono text-left">
        {startupTexts.slice(0, textIndex + 1).map((text, i) => (
          <div key={i} className="mb-2">
            <span className="text-emerald-400">{">"}</span>{" "}
            <span className={i === textIndex ? "text-emerald-100" : "text-gray-500"}>
              {text}
              {i === textIndex && cursorVisible && <span className="text-emerald-400">_</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StartupSequence;
