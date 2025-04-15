
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  deltaText?: string;
}

export const MetricCard = ({ icon: Icon, title, value, deltaText }: MetricCardProps) => {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">{title}</p>
            <h4 className="text-2xl font-semibold mt-1">{value}</h4>
            {deltaText && (
              <p className="text-xs text-gray-500 mt-1">{deltaText}</p>
            )}
          </div>
          <div className="rounded-full bg-gray-700 p-3">
            <Icon className="h-5 w-5 text-blue-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
