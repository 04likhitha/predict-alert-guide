import { useState, useEffect } from "react";
import { AlertPanel } from "@/components/AlertPanel";
import { generateAlert, generateSensorData } from "@/utils/sensorSimulator";
import { Alert } from "@/types/sensor";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const Alerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<"all" | "critical" | "high" | "medium" | "low">("all");

  useEffect(() => {
    // Generate alerts from sensor data
    const generateRandomAlerts = () => {
      const newAlerts: Alert[] = [];
      for (let i = 0; i < 8; i++) {
        const assetType = Math.random() > 0.5 ? 'wind' : 'solar';
        const sensorData = generateSensorData(assetType);
        const alert = generateAlert(sensorData);
        if (alert) newAlerts.push(alert);
      }
      return newAlerts;
    };

    setAlerts(generateRandomAlerts());

    // Update alerts periodically
    const interval = setInterval(() => {
      setAlerts(generateRandomAlerts());
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const filteredAlerts = filter === "all" 
    ? alerts 
    : alerts.filter(alert => alert.severity === filter);

  const criticalCount = alerts.filter(a => a.severity === "critical").length;
  const highCount = alerts.filter(a => a.severity === "high").length;
  const mediumCount = alerts.filter(a => a.severity === "medium").length;
  const lowCount = alerts.filter(a => a.severity === "low").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent">
              System Alerts
            </h1>
            <p className="text-muted-foreground mt-2">
              Monitor and manage all system alerts in real-time
            </p>
          </div>

          {/* Alert Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card
              className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                filter === "all" ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setFilter("all")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Alerts</p>
                  <p className="text-2xl font-bold">{alerts.length}</p>
                </div>
                <Badge variant="outline">All</Badge>
              </div>
            </Card>

            <Card
              className={`p-4 cursor-pointer transition-all hover:shadow-lg border-destructive/20 ${
                filter === "critical" ? "ring-2 ring-destructive" : ""
              }`}
              onClick={() => setFilter("critical")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical</p>
                  <p className="text-2xl font-bold text-destructive">{criticalCount}</p>
                </div>
                <Badge variant="destructive">!</Badge>
              </div>
            </Card>

            <Card
              className={`p-4 cursor-pointer transition-all hover:shadow-lg border-warning/20 ${
                filter === "high" ? "ring-2 ring-warning" : ""
              }`}
              onClick={() => setFilter("high")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">High</p>
                  <p className="text-2xl font-bold text-warning">{highCount}</p>
                </div>
                <Badge className="bg-warning/10 text-warning border-warning/20">⚠</Badge>
              </div>
            </Card>

            <Card
              className={`p-4 cursor-pointer transition-all hover:shadow-lg border-chart-2/20 ${
                filter === "medium" ? "ring-2 ring-chart-2" : ""
              }`}
              onClick={() => setFilter("medium")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Medium</p>
                  <p className="text-2xl font-bold text-chart-2">{mediumCount}</p>
                </div>
                <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/20">●</Badge>
              </div>
            </Card>

            <Card
              className={`p-4 cursor-pointer transition-all hover:shadow-lg border-success/20 ${
                filter === "low" ? "ring-2 ring-success" : ""
              }`}
              onClick={() => setFilter("low")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Low</p>
                  <p className="text-2xl font-bold text-success">{lowCount}</p>
                </div>
                <Badge className="bg-success/10 text-success border-success/20">ℹ</Badge>
              </div>
            </Card>
          </div>
        </div>

        {/* Alert List */}
        <AlertPanel alerts={filteredAlerts} />
      </div>
    </div>
  );
};

export default Alerts;
