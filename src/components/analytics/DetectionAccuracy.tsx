
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const DetectionAccuracy = ({ data, loading }) => {
  // Calculate metrics
  const calculateMetrics = () => {
    const total = data.length;
    if (!total) return { accuracy: 0, falsePositive: 0, precision: 0 };
    
    // In a real system, these would be calculated based on actual outcomes
    // For now, we'll simulate them based on anomaly scores
    let truePositives = 0;
    let falsePositives = 0;
    
    data.forEach(threat => {
      // Simulate that threats with high anomaly scores are more likely to be true positives
      if (threat.anomaly_score > 0.8) {
        truePositives += 0.9; // 90% likely to be a true positive
        falsePositives += 0.1; // 10% likely to be a false positive
      } else if (threat.anomaly_score > 0.7) {
        truePositives += 0.75;
        falsePositives += 0.25;
      } else if (threat.anomaly_score > 0.6) {
        truePositives += 0.6;
        falsePositives += 0.4;
      } else {
        truePositives += 0.3;
        falsePositives += 0.7;
      }
    });
    
    // Round to nearest whole number
    truePositives = Math.round(truePositives);
    falsePositives = Math.round(falsePositives);
    
    // Calculate metrics
    const accuracy = (truePositives / (truePositives + falsePositives)) * 100;
    const falsePositiveRate = (falsePositives / (truePositives + falsePositives)) * 100;
    const precision = (truePositives / (truePositives + falsePositives)) * 100;
    
    return {
      accuracy: isNaN(accuracy) ? 0 : accuracy,
      falsePositive: isNaN(falsePositiveRate) ? 0 : falsePositiveRate,
      precision: isNaN(precision) ? 0 : precision,
      truePositives,
      falsePositives
    };
  };
  
  const metrics = calculateMetrics();

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
        {data.length > 0 ? (
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-32 h-32 mx-auto">
                <CircularProgressbar
                  value={metrics.accuracy}
                  text={`${Math.round(metrics.accuracy)}%`}
                  strokeWidth={10}
                  styles={buildStyles({
                    textSize: '16px',
                    pathColor: '#10b981',
                    textColor: '#fff',
                    trailColor: '#374151',
                  })}
                />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-400">True Positives</span>
                      <span className="text-xs font-medium text-green-400">{metrics.truePositives}</span>
                    </div>
                    <Progress value={metrics.accuracy} className="h-2 bg-gray-700" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-400">False Positives</span>
                      <span className="text-xs font-medium text-red-400">{metrics.falsePositives}</span>
                    </div>
                    <Progress value={metrics.falsePositive} className="h-2 bg-gray-700" indicatorColor="bg-red-500" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-800 p-3 rounded-md">
                <div className="text-2xl font-semibold text-emerald-400">{Math.round(metrics.accuracy)}%</div>
                <div className="text-xs text-gray-400">Overall Accuracy</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-md">
                <div className="text-2xl font-semibold text-orange-400">{Math.round(metrics.precision)}%</div>
                <div className="text-xs text-gray-400">Precision</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-md">
                <div className="text-2xl font-semibold text-blue-400">{data.length}</div>
                <div className="text-xs text-gray-400">Total Detections</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[250px] flex items-center justify-center">
            <p className="text-gray-500">No detection data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DetectionAccuracy;
