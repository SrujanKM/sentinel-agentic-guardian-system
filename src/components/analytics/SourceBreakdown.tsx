
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const SourceBreakdown = ({ data, loading }) => {
  // Process the data
  const processData = () => {
    // Group logs by source type
    const sourceGroups = {
      "Windows": 0,
      "AWS": 0,
      "Network": 0,
      "Database": 0,
      "Other": 0
    };
    
    data.forEach(log => {
      const source = log.source || "";
      
      if (source.includes("Windows")) {
        sourceGroups["Windows"]++;
      } else if (source.includes("AWS") || source.includes("Cloud")) {
        sourceGroups["AWS"]++;
      } else if (source.includes("Network") || source.includes("Firewall")) {
        sourceGroups["Network"]++;
      } else if (source.includes("Database") || source.includes("DB")) {
        sourceGroups["Database"]++;
      } else {
        sourceGroups["Other"]++;
      }
    });
    
    // Convert to array for chart
    return Object.keys(sourceGroups).map(source => ({
      name: source,
      count: sourceGroups[source]
    }));
  };
  
  const chartData = processData();
  
  // Define colors for each source type
  const COLORS = {
    'Windows': '#0ea5e9',
    'AWS': '#f97316',
    'Network': '#10b981',
    'Database': '#a855f7',
    'Other': '#6b7280'
  };
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const color = COLORS[label] || '#6b7280';
      return (
        <div className="bg-gray-800 border border-gray-700 p-2 rounded-md shadow-md text-xs">
          <div className="flex items-center gap-1 font-medium">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span>{label} Logs</span>
          </div>
          <div className="mt-1">
            Count: <span className="font-medium">{payload[0].value}</span>
          </div>
          <div>
            Percentage: <span className="font-medium">
              {((payload[0].value / data.length) * 100).toFixed(1)}%
            </span>
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
          <CardTitle>Log Source Breakdown</CardTitle>
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
        <CardTitle>Log Source Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.some(item => item.count > 0) ? (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#444" />
                <XAxis 
                  type="number" 
                  tick={{ fill: '#9ca3af' }} 
                  tickLine={{ stroke: '#6b7280' }}
                  axisLine={{ stroke: '#4b5563' }}
                />
                <YAxis 
                  type="category"
                  dataKey="name" 
                  tick={{ fill: '#9ca3af' }} 
                  tickLine={{ stroke: '#6b7280' }}
                  axisLine={{ stroke: '#4b5563' }}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  radius={[0, 4, 4, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#6b7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[250px] flex items-center justify-center">
            <p className="text-gray-500">No source data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SourceBreakdown;
