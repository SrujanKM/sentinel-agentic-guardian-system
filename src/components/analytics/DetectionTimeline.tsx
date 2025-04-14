
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import AzureLogSimulator from "@/services/azureLogSimulator";

interface DetectionTimelineProps {
  data: any[];
  loading: boolean;
}

interface TimeSeriesItem {
  time: string;
  threats: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const DetectionTimeline: React.FC<DetectionTimelineProps> = ({ data, loading }) => {
  // Process the data with reduced frequency
  const processData = () => {
    // Group threats by day or hour depending on the data span
    const timeSeries: Record<string, TimeSeriesItem> = {};
    
    // Sort data by timestamp
    const sortedData = [...data].sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
    
    // Reduce frequency by sampling - take one entry for each hour or day
    // instead of processing every threat
    let sampledData = sortedData;
    if (sortedData.length > 20) {
      const sampleStep = Math.ceil(sortedData.length / 20);
      sampledData = sortedData.filter((_, index) => index % sampleStep === 0);
    }
    
    sampledData.forEach(threat => {
      try {
        // Parse the timestamp
        const date = new Date(threat.timestamp);
        
        // Skip invalid dates
        if (isNaN(date.getTime())) {
          return;
        }
        
        let timeKey;
        
        // If all threats are from the last 24 hours, group by hour
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date > yesterday) {
          // Format as hour, but use 2-hour intervals to reduce clutter
          const hour = date.getHours();
          const normalizedHour = Math.floor(hour / 2) * 2;
          timeKey = `${normalizedHour.toString().padStart(2, '0')}:00`;
        } else {
          // Format as day
          timeKey = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
        
        // Initialize or increment
        if (!timeSeries[timeKey]) {
          timeSeries[timeKey] = {
            time: timeKey,
            threats: 0,
            critical: 0,
            high: 0,
            medium: 0,
            low: 0
          };
        }
        
        timeSeries[timeKey].threats++;
        
        // Count by severity
        if (threat.severity === 'critical') timeSeries[timeKey].critical++;
        else if (threat.severity === 'high') timeSeries[timeKey].high++;
        else if (threat.severity === 'medium') timeSeries[timeKey].medium++;
        else if (threat.severity === 'low') timeSeries[timeKey].low++;
      } catch (error) {
        console.error("Error processing threat timestamp:", error);
      }
    });
    
    // If no data was processed successfully, create a fallback dataset
    if (Object.keys(timeSeries).length === 0) {
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const timeKey = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        
        timeSeries[timeKey] = {
          time: timeKey,
          threats: Math.floor(Math.random() * 5) + 1,
          critical: Math.floor(Math.random() * 2),
          high: Math.floor(Math.random() * 3),
          medium: Math.floor(Math.random() * 4),
          low: Math.floor(Math.random() * 3),
        };
      }
    }
    
    // Convert to array and sort by time
    return Object.values(timeSeries).sort((a, b) => {
      // Try to parse as dates first
      const dateA = new Date(a.time);
      const dateB = new Date(b.time);
      
      if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
        return dateA.getTime() - dateB.getTime();
      }
      
      // If not valid dates, try to parse as hours (HH:00)
      if (a.time.includes(':') && b.time.includes(':')) {
        const hourA = parseInt(a.time.split(':')[0], 10);
        const hourB = parseInt(b.time.split(':')[0], 10);
        return hourA - hourB;
      }
      
      // If all else fails, sort as strings
      return a.time.localeCompare(b.time);
    });
  };
  
  const chartData = processData();
  
  // Custom tooltip
  const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 p-2 rounded-md shadow-md text-xs">
          <p className="font-medium mb-1">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <p>Critical: {payload[1]?.value || 0}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <p>High: {payload[2]?.value || 0}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <p>Medium: {payload[3]?.value || 0}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <p>Low: {payload[4]?.value || 0}</p>
            </div>
            <div className="border-t border-gray-700 pt-1 mt-1">
              <p>Total: {payload[0]?.value || 0}</p>
            </div>
          </div>
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
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#444" />
            <XAxis 
              dataKey="time" 
              tick={{ fill: '#9ca3af' }} 
              tickLine={{ stroke: '#6b7280' }}
              axisLine={{ stroke: '#4b5563' }}
              angle={-45}
              textAnchor="end"
              height={60}
              interval={"preserveStartEnd"}
            />
            <YAxis 
              tick={{ fill: '#9ca3af' }} 
              tickLine={{ stroke: '#6b7280' }}
              axisLine={{ stroke: '#4b5563' }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="threats" 
              stroke="#8884d8" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="critical" 
              stroke="#ef4444" 
              strokeWidth={1.5}
              dot={{ r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="high" 
              stroke="#f97316" 
              strokeWidth={1.5}
              dot={{ r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="medium" 
              stroke="#eab308" 
              strokeWidth={1.5}
              dot={{ r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="low" 
              stroke="#3b82f6" 
              strokeWidth={1.5}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-500">No timeline data available</p>
        </div>
      )}
    </div>
  );
};

export default DetectionTimeline;
