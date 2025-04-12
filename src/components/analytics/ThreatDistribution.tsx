
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { AlertTriangle, Lock, User, Shield, Server, AlertCircle } from "lucide-react";

interface ThreatDistributionProps {
  data: any[];
  loading: boolean;
}

interface TooltipProps {
  active?: boolean;
  payload?: any[];
}

interface LegendProps {
  payload?: Array<{
    value: string;
    color: string;
  }>;
}

const ThreatDistribution: React.FC<ThreatDistributionProps> = ({ data, loading }) => {
  // Process the data
  const processData = () => {
    // Count threats by type
    const threatCounts = {};
    
    data.forEach(threat => {
      const type = threat.type || "unknown";
      if (!threatCounts[type]) {
        threatCounts[type] = 0;
      }
      threatCounts[type]++;
    });
    
    // Convert to array for chart
    return Object.keys(threatCounts).map(type => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: threatCounts[type]
    }));
  };
  
  const chartData = processData();
  
  // Define colors for each threat type
  const COLORS = {
    'Malware': '#ef4444',
    'Brute force': '#f97316',
    'Unauthorized access': '#eab308',
    'Privilege escalation': '#a855f7',
    'Data exfiltration': '#3b82f6',
    'Anomaly': '#0ea5e9',
    'Unknown': '#6b7280'
  };
  
  // Get icon for threat type
  const getThreatIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'malware':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'brute force':
        return <Lock className="h-4 w-4 text-orange-500" />;
      case 'unauthorized access':
        return <User className="h-4 w-4 text-yellow-500" />;
      case 'privilege escalation':
        return <Shield className="h-4 w-4 text-purple-500" />;
      case 'data exfiltration':
        return <Server className="h-4 w-4 text-blue-500" />;
      case 'anomaly':
        return <AlertCircle className="h-4 w-4 text-sky-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Custom legend
  const CustomLegend: React.FC<LegendProps> = ({ payload }) => {
    if (!payload) return null;
    return (
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
        {payload.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <div className="flex items-center">
              {getThreatIcon(entry.value)}
              <span className="ml-1 text-xs text-gray-300">{entry.value}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Custom tooltip
  const CustomTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 p-2 rounded-md shadow-md text-xs">
          <div className="flex items-center gap-1 font-medium">
            {getThreatIcon(payload[0].name)}
            <span>{payload[0].name}</span>
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
          <CardTitle>Threat Distribution</CardTitle>
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
        <CardTitle>Threat Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS['Unknown']} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[250px] flex items-center justify-center">
            <p className="text-gray-500">No threat data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ThreatDistribution;
