
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from "recharts";
import { Activity, PieChart } from "lucide-react";

interface SourceActivityTimelineProps {
  data: any[];
  loading: boolean;
}

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const SourceActivityTimeline: React.FC<SourceActivityTimelineProps> = ({ data, loading }) => {
  // Process the logs to create a time series of activity by source
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Create a map of timestamps to source counts
    const timeMap = new Map();
    
    // Calculate time range
    const timestamps = data.map(log => new Date(log.timestamp).getTime());
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    const timeRange = maxTime - minTime;
    
    // Determine appropriate time bucket (hour or day)
    const useHourly = timeRange < 24 * 60 * 60 * 1000; // Less than 24 hours
    
    // Group logs by time buckets
    data.forEach(log => {
      const date = new Date(log.timestamp);
      let timeKey;
      
      if (useHourly) {
        // Use hourly buckets
        timeKey = `${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:00`;
      } else {
        // Use daily buckets
        timeKey = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear().toString().substr(2)}`;
      }
      
      if (!timeMap.has(timeKey)) {
        timeMap.set(timeKey, {
          time: timeKey,
          Windows: 0,
          AWS: 0,
          Network: 0,
          Database: 0,
          Other: 0,
          total: 0,
          error: 0,
          warning: 0,
          info: 0
        });
      }
      
      const entry = timeMap.get(timeKey);
      entry.total++;
      
      // Increment source type
      const source = log.source || "";
      if (source.includes("Windows")) {
        entry.Windows++;
      } else if (source.includes("AWS") || source.includes("Cloud")) {
        entry.AWS++;
      } else if (source.includes("Network") || source.includes("Firewall")) {
        entry.Network++;
      } else if (source.includes("Database") || source.includes("DB")) {
        entry.Database++;
      } else {
        entry.Other++;
      }
      
      // Increment severity level
      const level = log.level || "info";
      if (level === "error") {
        entry.error++;
      } else if (level === "warning") {
        entry.warning++;
      } else {
        entry.info++;
      }
    });
    
    // Convert to array and sort by time
    const sortedData = Array.from(timeMap.values());
    
    // Sort by time
    if (useHourly) {
      sortedData.sort((a, b) => {
        const [dateA, timeA] = a.time.split(' ');
        const [dateB, timeB] = b.time.split(' ');
        return dateA.localeCompare(dateB) || timeA.localeCompare(timeB);
      });
    } else {
      sortedData.sort((a, b) => {
        const partsA = a.time.split('/').map(Number);
        const partsB = b.time.split('/').map(Number);
        return partsA[2] - partsB[2] || partsA[0] - partsB[0] || partsA[1] - partsB[1];
      });
    }
    
    return sortedData;
  }, [data]);
  
  // Custom tooltip for the chart
  const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 p-3 rounded-md shadow-md">
          <p className="font-medium mb-2">{label}</p>
          
          <div className="space-y-1 text-xs">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>Windows: {payload.find(p => p.name === 'Windows')?.value || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span>AWS: {payload.find(p => p.name === 'AWS')?.value || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Network: {payload.find(p => p.name === 'Network')?.value || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span>Database: {payload.find(p => p.name === 'Database')?.value || 0}</span>
              </div>
            </div>
            
            <div className="border-t border-gray-700 my-2 pt-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>Errors: {payload.find(p => p.name === 'error')?.value || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>Warnings: {payload.find(p => p.name === 'warning')?.value || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span>Info: {payload.find(p => p.name === 'info')?.value || 0}</span>
              </div>
            </div>
            
            <div className="border-t border-gray-700 pt-2 font-medium">
              Total Events: {payload.find(p => p.name === 'total')?.value || 0}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Source Activity Over Time
          </CardTitle>
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
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-500" />
          Source Activity Over Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#444" />
                <XAxis 
                  dataKey="time"
                  tick={{ fill: '#9ca3af' }}
                  axisLine={{ stroke: '#6b7280' }}
                  tickLine={{ stroke: '#6b7280' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fill: '#9ca3af' }}
                  axisLine={{ stroke: '#6b7280' }}
                  tickLine={{ stroke: '#6b7280' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top"
                  wrapperStyle={{ paddingBottom: '10px' }}
                />
                <Area 
                  type="monotone"
                  dataKey="Windows"
                  stackId="1"
                  stroke="#0ea5e9"
                  fill="#0ea5e9"
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone"
                  dataKey="AWS"
                  stackId="1"
                  stroke="#f97316"
                  fill="#f97316"
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone"
                  dataKey="Network"
                  stackId="1"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone"
                  dataKey="Database"
                  stackId="1"
                  stroke="#a855f7"
                  fill="#a855f7"
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone"
                  dataKey="Other"
                  stackId="1"
                  stroke="#6b7280"
                  fill="#6b7280"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">No source activity data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SourceActivityTimeline;
