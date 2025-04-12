
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface RiskLevelDistributionProps {
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

const RiskLevelDistribution: React.FC<RiskLevelDistributionProps> = ({ data, loading }) => {
  // Process the data
  const processData = () => {
    // Count threats by severity
    const severityCounts = {
      "Critical": 0,
      "High": 0,
      "Medium": 0,
      "Low": 0
    };
    
    data.forEach(threat => {
      const severity = threat.severity || "unknown";
      const normalizedSeverity = severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase();
      
      if (severityCounts[normalizedSeverity] !== undefined) {
        severityCounts[normalizedSeverity]++;
      }
    });
    
    // Convert to array for chart
    return Object.keys(severityCounts).map(severity => ({
      name: severity,
      value: severityCounts[severity]
    }));
  };
  
  const chartData = processData();
  
  // Define colors for each severity level
  const COLORS = {
    'Critical': '#ef4444',
    'High': '#f97316',
    'Medium': '#eab308',
    'Low': '#3b82f6'
  };
  
  // Custom tooltip
  const CustomTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const color = COLORS[payload[0].name] || '#6b7280';
      return (
        <div className="bg-gray-800 border border-gray-700 p-2 rounded-md shadow-md text-xs">
          <div className="flex items-center gap-1 font-medium">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span>{payload[0].name} Risk</span>
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
            <span className="text-xs text-gray-300">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Risk Level Distribution</CardTitle>
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
        <CardTitle>Risk Level Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.some(item => item.value > 0) ? (
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
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[250px] flex items-center justify-center">
            <p className="text-gray-500">No risk level data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RiskLevelDistribution;
