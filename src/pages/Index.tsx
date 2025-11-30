import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusCard } from '@/components/StatusCard';
import { AlertPanel } from '@/components/AlertPanel';
import { PredictionPanel } from '@/components/PredictionPanel';
import { LiveChart } from '@/components/LiveChart';
import { AssetType, SensorData, Alert } from '@/types/sensor';
import { generateSensorData, generateAlert, getRecommendation } from '@/utils/sensorSimulator';
import { 
  Wind, 
  Sun, 
  Zap, 
  Thermometer, 
  Gauge, 
  Activity,
  TrendingUp,
  BarChart3
} from 'lucide-react';

const Index = () => {
  const [assetType, setAssetType] = useState<AssetType>('wind');
  const [currentData, setCurrentData] = useState<SensorData>(generateSensorData('wind'));
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [powerHistory, setPowerHistory] = useState<Array<{ time: string; power: number; temp: number }>>([]);
  const [efficiencyHistory, setEfficiencyHistory] = useState<Array<{ time: string; efficiency: number }>>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newData = generateSensorData(assetType);
      setCurrentData(newData);

      const newAlert = generateAlert(newData);
      if (newAlert) {
        setAlerts(prev => [newAlert, ...prev].slice(0, 5));
      }

      const time = new Date().toLocaleTimeString();
      
      setPowerHistory(prev => [...prev, {
        time,
        power: newData.powerOutput,
        temp: assetType === 'wind' ? (newData.gearboxTemp || 0) : (newData.moduleTemp || 0)
      }].slice(-20));

      const efficiency = assetType === 'wind' 
        ? (newData.powerOutput / (newData.windSpeed || 1)) * 10
        : (newData.powerOutput / (newData.irradiance || 1)) * 100;
      
      setEfficiencyHistory(prev => [...prev, { time, efficiency }].slice(-20));
    }, 2000);

    return () => clearInterval(interval);
  }, [assetType]);

  const handleAssetChange = (type: AssetType) => {
    setAssetType(type);
    setCurrentData(generateSensorData(type));
    setPowerHistory([]);
    setEfficiencyHistory([]);
    setAlerts([]);
  };

  const recommendation = getRecommendation(currentData.failureType);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold glow-text mb-2">
              GreenTech Reliability Intelligence Platform
            </h1>
            <p className="text-muted-foreground">
              Real-time predictive maintenance dashboard
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant={assetType === 'wind' ? 'default' : 'outline'}
              onClick={() => handleAssetChange('wind')}
              className="gap-2"
            >
              <Wind className="w-4 h-4" />
              Wind Turbine
            </Button>
            <Button
              variant={assetType === 'solar' ? 'default' : 'outline'}
              onClick={() => handleAssetChange('solar')}
              className="gap-2"
            >
              <Sun className="w-4 h-4" />
              Solar Panel
            </Button>
          </div>
        </div>

        {/* Asset Info */}
        <div className="flex items-center gap-4 p-4 bg-card/50 rounded-lg border">
          <Badge variant="outline" className="text-sm px-3 py-1">
            {currentData.assetId}
          </Badge>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="w-4 h-4" />
            <span>Live Monitoring Active</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Last Update: {currentData.timestamp.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatusCard
            title="Power Output"
            value={currentData.powerOutput}
            unit="kW"
            icon={Zap}
            status={currentData.powerOutput < 100 ? 'warning' : 'normal'}
            trend={currentData.powerOutput > 150 ? 'up' : 'stable'}
          />
          
          {assetType === 'wind' ? (
            <>
              <StatusCard
                title="Wind Speed"
                value={currentData.windSpeed || 0}
                unit="m/s"
                icon={Wind}
                status="normal"
              />
              <StatusCard
                title="Rotor Speed"
                value={currentData.rotorSpeed || 0}
                unit="rpm"
                icon={Gauge}
                status={currentData.rotorSpeed && currentData.rotorSpeed < 15 ? 'warning' : 'normal'}
              />
              <StatusCard
                title="Gearbox Temp"
                value={currentData.gearboxTemp || 0}
                unit="°C"
                icon={Thermometer}
                status={currentData.gearboxTemp && currentData.gearboxTemp > 70 ? 'critical' : 'normal'}
              />
            </>
          ) : (
            <>
              <StatusCard
                title="Panel Voltage"
                value={currentData.panelVoltage || 0}
                unit="V"
                icon={Activity}
                status="normal"
              />
              <StatusCard
                title="Irradiance"
                value={currentData.irradiance || 0}
                unit="W/m²"
                icon={Sun}
                status="normal"
              />
              <StatusCard
                title="Module Temp"
                value={currentData.moduleTemp || 0}
                unit="°C"
                icon={Thermometer}
                status={currentData.moduleTemp && currentData.moduleTemp > 65 ? 'warning' : 'normal'}
              />
            </>
          )}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LiveChart
            title="Power Output & Temperature"
            data={powerHistory}
            dataKey="power"
            dataKey2="temp"
            color="#06b6d4"
            color2="#f59e0b"
            unit=" kW"
          />
          <LiveChart
            title="System Efficiency"
            data={efficiencyHistory}
            dataKey="efficiency"
            color="#10b981"
            unit="%"
          />
        </div>

        {/* Bottom Row - Alerts and Predictions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AlertPanel alerts={alerts} />
          <PredictionPanel data={currentData} recommendation={recommendation} />
        </div>

        {/* Footer Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-card/30 rounded-lg border">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Avg Power</span>
            </div>
            <p className="text-2xl font-bold">
              {powerHistory.length > 0 
                ? (powerHistory.reduce((acc, d) => acc + d.power, 0) / powerHistory.length).toFixed(1)
                : '0.0'} kW
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-sm text-muted-foreground">Uptime</span>
            </div>
            <p className="text-2xl font-bold text-success">98.7%</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-warning" />
              <span className="text-sm text-muted-foreground">Active Alerts</span>
            </div>
            <p className="text-2xl font-bold">{alerts.length}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Thermometer className="w-4 h-4 text-destructive" />
              <span className="text-sm text-muted-foreground">Ambient</span>
            </div>
            <p className="text-2xl font-bold">{currentData.ambientTemp.toFixed(1)}°C</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
