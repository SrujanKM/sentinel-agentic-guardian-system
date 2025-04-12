
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AnomalyScoreChartProps {
  data: any[];
  loading: boolean;
}

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const AnomalyScoreChart: React.FC<AnomalyScoreChartProps> = ({ data, loading }) => {
  // Process the data
  const processData = () => {
    // Create buckets for anomaly scores
    const buckets = {
      "0.5-0.6": 0,
      "0.6-0.7": 0,
      "0.7-0.8": 0,
      "0.8-0.9": 0,
      "0.9-1.0": 0
    };
    
    data.forEach(threat => {
      if (threat.anomaly_score) {
        const score = threat.anomaly_score;
        if (score >= 0.5 && score < 0.6) buckets["0.5-0.6"]++;
        else if (score >= 0.6 && score < 0.7) buckets["0.6-0.7"]++;
        else if (score >= 0.7 && score < 0.8) buckets["0.7-0.8"]++;
        else if (score >= 0.8 && score < 0.9) buckets["0.8-0.9"]++;
        else if (score >= 0.9 && score <= 1.0) buckets["0.9-1.0"]++;
      }
    });
    
    // Convert to array for chart
    return Object.keys(buckets).map(range => ({
      range,
      count: buckets[range]
    }));
  };
  
  const chartData = processData();
  
  // Custom tooltip
  const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 p-2 rounded-md shadow-md text-xs">
          <p className="font-medium">Anomaly Score: {label}</p>
          <p>Count: {payload[0].value}</p>
          <p>
            Higher scores indicate stronger anomalies
          </p>
        </div>
      );
    }
    return null;
  };
  
  if (loading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading data...</div>
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      {chartData.some(item => item.count > 0) ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#444" />
            <XAxis 
              dataKey="range" 
              tick={{ fill: '#9ca3af' }} 
              tickLine={{ stroke: '#6b7280' }}
              axisLine={{ stroke: '#4b5563' }}
            />
            <YAxis 
              tick={{ fill: '#9ca3af' }} 
              tickLine={{ stroke: '#6b7280' }}
              axisLine={{ stroke: '#4b5563' }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="count" 
              name="Number of Threats"
              fill="#8b5cf6" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-500">No anomaly score data available</p>
        </div>
      )}
    </div>
  );
};

export default AnomalyScoreChart;
