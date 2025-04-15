
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface DetectionAccuracyProps {
  data: any[];
  loading: boolean;
}

interface TooltipProps {
  active?: boolean;
  payload?: any[];
}

const DetectionAccuracy: React.FC<DetectionAccuracyProps> = ({ data, loading }) => {
  // Calculate the accuracy - for this demo we'll set it to 95%
  const accuracy = 95.7;
  
  // For the pie chart, calculate true positives, false positives, etc.
  const detectionMetrics = [
    { name: "True Positives", value: 87, color: "#10b981" },  // Green
    { name: "True Negatives", value: 120, color: "#0ea5e9" }, // Blue
    { name: "False Positives", value: 5, color: "#f59e0b" },  // Yellow
    { name: "False Negatives", value: 3, color: "#ef4444" }   // Red
  ];
  
  // Calculate total for percentages
  const total = detectionMetrics.reduce((sum, item) => sum + item.value, 0);
  
  // Custom tooltip for the pie chart
  const CustomTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const percent = ((payload[0].value / total) * 100).toFixed(1);
      return (
        <div className="bg-gray-800 border border-gray-700 p-2 rounded-md shadow-md text-xs">
          <p className="font-medium">{payload[0].name}</p>
          <p>Count: {payload[0].value}</p>
          <p>Percentage: {percent}%</p>
        </div>
      );
    }
    return null;
  };
  
  // Custom legend
  const renderColorfulLegendText = (value: string, entry: any) => {
    return <span className="text-xs text-gray-300">{value}</span>;
  };
  
  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Detection Accuracy</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="animate-pulse text-gray-500">Loading data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle>Detection Accuracy</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="w-36 h-36 mb-4">
            <CircularProgressbar
              value={accuracy}
              text={`${accuracy.toFixed(1)}%`}
              strokeWidth={10}
              styles={buildStyles({
                textSize: '16px',
                pathColor: `rgba(62, 152, 199, ${accuracy / 100})`,
                textColor: '#f8fafc',
                trailColor: '#374151',
                pathTransitionDuration: 0.5,
              })}
            />
          </div>
          <p className="text-center text-sm text-gray-400 mb-4">
            Based on {total} detection events
          </p>
          
          <div className="w-full h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={detectionMetrics}
                  cx="50%"
                  cy="50%"
                  outerRadius={50}
                  dataKey="value"
                  labelLine={false}
                >
                  {detectionMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  formatter={renderColorfulLegendText}
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DetectionAccuracy;
