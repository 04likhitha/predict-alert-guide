import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusCard } from '@/components/StatusCard';
import { AlertPanel } from '@/components/AlertPanel';
import { PredictionPanel } from '@/components/PredictionPanel';
import { LiveChart } from '@/components/LiveChart';
import { AssetType, SensorData, Alert } from '@/types/sensor';
import { getNextReading, generateAlertFromReading, allAssets } from '@/utils/datasetStreamEngine';
import { getRecommendation } from '@/utils/sensorSimulator';
import { motion } from 'framer-motion';
import { Wind, Sun, Zap, Thermometer, Gauge, Activity, TrendingUp, Shield } from 'lucide-react';

const Index = () => {
  const [assetType, setAssetType] = useState<AssetType>('wind');
  const [currentData, setCurrentData] = useState<SensorData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [powerHistory, setPowerHistory] = useState<Array<{ time: string; power: number; temp: number }>>([]);
  const [efficiencyHistory, setEfficiencyHistory] = useState<Array<{ time: string; efficiency: number }>>([]);

  const assets = allAssets.filter(a => a.type === assetType);
  const totalCapacity = assets.reduce((s, a) => s + a.capacity_mw, 0);
  const operationalCount = assets.filter(a => a.status === 'operational').length;

  useEffect(() => {
    setPowerHistory([]);
    setEfficiencyHistory([]);
    setAlerts([]);
  }, [assetType]);

  useEffect(() => {
    const assetIds = assets.map(a => a.id);
    let currentIdx = 0;

    const interval = setInterval(() => {
      const assetId = assetIds[currentIdx % assetIds.length];
      currentIdx++;
      const newData = getNextReading(assetId);
      if (!newData) return;
      setCurrentData(newData);

      const newAlert = generateAlertFromReading(newData);
      if (newAlert) setAlerts(prev => [newAlert, ...prev].slice(0, 10));

      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setPowerHistory(prev => [...prev, { time, power: newData.powerOutput, temp: assetType === 'wind' ? (newData.gearboxTemp || 0) : (newData.moduleTemp || 0) }].slice(-20));
      const efficiency = assetType === 'wind' ? (newData.powerOutput / (newData.windSpeed || 1)) * 10 : (newData.powerOutput / (newData.irradiance || 1)) * 100;
      setEfficiencyHistory(prev => [...prev, { time, efficiency: Math.min(efficiency, 100) }].slice(-20));
    }, 2000);
    return () => clearInterval(interval);
  }, [assetType, assets]);

  const handleAssetChange = (type: AssetType) => setAssetType(type);

  const recommendation = currentData ? getRecommendation(currentData.failureType) : getRecommendation('normal');

  return (
    <div className="p-6 max-w-[1800px] mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <motion.h1 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold tracking-tight">Dashboard</motion.h1>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time predictive maintenance — powered by master datasets</p>
        </div>
        <div className="flex gap-2">
          <Button variant={assetType === 'wind' ? 'default' : 'outline'} onClick={() => handleAssetChange('wind')} size="sm" className="gap-2 text-xs"><Wind className="w-3.5 h-3.5" /> Wind Turbines</Button>
          <Button variant={assetType === 'solar' ? 'default' : 'outline'} onClick={() => handleAssetChange('solar')} size="sm" className="gap-2 text-xs"><Sun className="w-3.5 h-3.5" /> Solar Panels</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }}>
          <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/15"><Zap className="h-4 w-4 text-primary" /></div>
              <div><p className="text-[11px] text-muted-foreground">Total Capacity</p><p className="text-lg font-bold">{totalCapacity} MW</p></div>
            </div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Card className="p-4 bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/15"><Shield className="h-4 w-4 text-success" /></div>
              <div><p className="text-[11px] text-muted-foreground">Operational</p><p className="text-lg font-bold text-success">{operationalCount}/{assets.length}</p></div>
            </div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}>
          <Card className="p-4 bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/15"><Activity className="h-4 w-4 text-warning" /></div>
              <div><p className="text-[11px] text-muted-foreground">Active Alerts</p><p className="text-lg font-bold">{alerts.length}</p></div>
            </div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Card className="p-4 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/15"><TrendingUp className="h-4 w-4 text-secondary" /></div>
              <div><p className="text-[11px] text-muted-foreground">Uptime</p><p className="text-lg font-bold">98.7%</p></div>
            </div>
          </Card>
        </motion.div>
      </div>

      {currentData && (
        <>
          <Card className="p-3 px-4 bg-card/80 border border-border/50 flex items-center gap-4 flex-wrap">
            <Badge variant="outline" className="text-xs">{currentData.assetId}</Badge>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span>Dataset Loop Streaming</span>
            </div>
            <span className="text-xs text-muted-foreground">Updated: {currentData.timestamp.toLocaleTimeString()}</span>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <StatusCard title="Power Output" value={currentData.powerOutput} unit="kW" icon={Zap} status={currentData.powerOutput < 100 ? 'warning' : 'normal'} trend={currentData.powerOutput > 150 ? 'up' : 'stable'} delay={0} />
            {assetType === 'wind' ? (
              <>
                <StatusCard title="Wind Speed" value={currentData.windSpeed || 0} unit="m/s" icon={Wind} status="normal" delay={1} />
                <StatusCard title="Rotor Speed" value={currentData.rotorSpeed || 0} unit="rpm" icon={Gauge} status={currentData.rotorSpeed && currentData.rotorSpeed < 15 ? 'warning' : 'normal'} delay={2} />
                <StatusCard title="Gearbox Temp" value={currentData.gearboxTemp || 0} unit="°C" icon={Thermometer} status={currentData.gearboxTemp && currentData.gearboxTemp > 70 ? 'critical' : 'normal'} delay={3} />
              </>
            ) : (
              <>
                <StatusCard title="Panel Voltage" value={currentData.panelVoltage || 0} unit="V" icon={Activity} status="normal" delay={1} />
                <StatusCard title="Irradiance" value={currentData.irradiance || 0} unit="W/m²" icon={Sun} status="normal" delay={2} />
                <StatusCard title="Module Temp" value={currentData.moduleTemp || 0} unit="°C" icon={Thermometer} status={currentData.moduleTemp && currentData.moduleTemp > 65 ? 'warning' : 'normal'} delay={3} />
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LiveChart title="Power Output & Temperature" data={powerHistory} dataKey="power" dataKey2="temp" color="hsl(217, 91%, 60%)" color2="hsl(38, 92%, 50%)" unit=" kW" />
            <LiveChart title="System Efficiency" data={efficiencyHistory} dataKey="efficiency" color="hsl(160, 84%, 39%)" unit="%" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AlertPanel alerts={alerts} />
            <PredictionPanel data={currentData} recommendation={recommendation} />
          </div>
        </>
      )}
    </div>
  );
};

export default Index;
