import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LiveChart } from '@/components/LiveChart';
import { StatusCard } from '@/components/StatusCard';
import { allAssets, getNextReading } from '@/utils/datasetStreamEngine';
import { SensorData } from '@/types/sensor';
import { supabase } from '@/integrations/supabase/client';
import { Radio, Activity, Zap, Thermometer, Wind, Sun, Gauge, Droplets } from 'lucide-react';

export default function RealTimeMonitoring() {
  const [selectedAsset, setSelectedAsset] = useState(allAssets[0]?.id || '');
  const [currentData, setCurrentData] = useState<SensorData | null>(null);
  const [powerHistory, setPowerHistory] = useState<any[]>([]);
  const [tempHistory, setTempHistory] = useState<any[]>([]);
  const [efficiencyHistory, setEfficiencyHistory] = useState<any[]>([]);

  const selectedAssetInfo = allAssets.find(a => a.id === selectedAsset);

  useEffect(() => {
    if (!selectedAsset) return;
    setPowerHistory([]);
    setTempHistory([]);
    setEfficiencyHistory([]);

    const interval = setInterval(() => {
      const data = getNextReading(selectedAsset);
      if (!data) return;
      setCurrentData(data);

      const time = new Date().toLocaleTimeString();
      setPowerHistory(prev => [...prev, { time, power: data.powerOutput }].slice(-30));
      setTempHistory(prev => [...prev, {
        time,
        ambient: data.ambientTemp,
        component: data.assetType === 'wind' ? (data.gearboxTemp || 0) : (data.moduleTemp || 0),
      }].slice(-30));

      const eff = data.assetType === 'wind'
        ? (data.powerOutput / (data.windSpeed || 1)) * 10
        : (data.powerOutput / (data.irradiance || 1)) * 100;
      setEfficiencyHistory(prev => [...prev, { time, efficiency: eff }].slice(-30));

      // Store reading in database
      supabase.from('sensor_readings').insert({
        asset_id: selectedAsset,
        asset_type: data.assetType,
        wind_speed: data.windSpeed || null,
        rotor_speed: data.rotorSpeed || null,
        gearbox_temp: data.gearboxTemp || null,
        panel_voltage: data.panelVoltage || null,
        panel_current: data.panelCurrent || null,
        module_temp: data.moduleTemp || null,
        irradiance: data.irradiance || null,
        power_output: data.powerOutput,
        ambient_temp: data.ambientTemp,
        humidity: data.humidity,
        failure_type: data.failureType,
        rul_hours: data.rulHours,
        confidence: data.confidence,
      }).then(() => {});
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedAsset]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold glow-text">Real-Time Monitoring</h1>
          <p className="text-muted-foreground mt-1">Dataset loop streaming every 2 seconds</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="default" className="gap-1 animate-pulse"><Radio className="h-3 w-3" /> LIVE</Badge>
          <Select value={selectedAsset} onValueChange={setSelectedAsset}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Select asset" />
            </SelectTrigger>
            <SelectContent>
              {allAssets.map(a => (
                <SelectItem key={a.id} value={a.id}>{a.name} ({a.id})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {currentData && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatusCard title="Power Output" value={currentData.powerOutput} unit="kW" icon={Zap} status={currentData.powerOutput < 100 ? 'warning' : 'normal'} />
            <StatusCard title="Ambient Temp" value={currentData.ambientTemp} unit="°C" icon={Thermometer} status="normal" />
            <StatusCard title="Humidity" value={currentData.humidity} unit="%" icon={Droplets} status="normal" />
            <StatusCard title="RUL" value={currentData.rulHours} unit="hrs" icon={Activity} status={currentData.rulHours < 50 ? 'critical' : currentData.rulHours < 150 ? 'warning' : 'normal'} />
          </div>

          {currentData.assetType === 'wind' && (
            <div className="grid grid-cols-3 gap-4">
              <StatusCard title="Wind Speed" value={currentData.windSpeed || 0} unit="m/s" icon={Wind} status="normal" />
              <StatusCard title="Rotor Speed" value={currentData.rotorSpeed || 0} unit="rpm" icon={Gauge} status="normal" />
              <StatusCard title="Gearbox Temp" value={currentData.gearboxTemp || 0} unit="°C" icon={Thermometer} status={(currentData.gearboxTemp || 0) > 70 ? 'critical' : 'normal'} />
            </div>
          )}
          {currentData.assetType === 'solar' && (
            <div className="grid grid-cols-3 gap-4">
              <StatusCard title="Voltage" value={currentData.panelVoltage || 0} unit="V" icon={Zap} status="normal" />
              <StatusCard title="Irradiance" value={currentData.irradiance || 0} unit="W/m²" icon={Sun} status="normal" />
              <StatusCard title="Module Temp" value={currentData.moduleTemp || 0} unit="°C" icon={Thermometer} status={(currentData.moduleTemp || 0) > 65 ? 'warning' : 'normal'} />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LiveChart title="Power Output" data={powerHistory} dataKey="power" color="#06b6d4" unit=" kW" />
            <LiveChart title="Temperature" data={tempHistory} dataKey="ambient" dataKey2="component" color="#f59e0b" color2="#ef4444" unit="°C" />
          </div>
          <LiveChart title="System Efficiency" data={efficiencyHistory} dataKey="efficiency" color="#10b981" unit="%" />
        </>
      )}
    </div>
  );
}
