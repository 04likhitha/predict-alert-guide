import { useState, useEffect } from 'react';
import { Wind, Sun, Activity, Zap, Thermometer, Droplets } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateSensorData } from '@/utils/sensorSimulator';
import { SensorData, AssetType } from '@/types/sensor';

const WIND_ASSETS = ['WT_1', 'WT_2', 'WT_3', 'WT_4', 'WT_5'];
const SOLAR_ASSETS = ['SP_1', 'SP_2', 'SP_3', 'SP_4', 'SP_5'];

export default function Assets() {
  const [windData, setWindData] = useState<Record<string, SensorData>>({});
  const [solarData, setSolarData] = useState<Record<string, SensorData>>({});

  useEffect(() => {
    const updateData = () => {
      const newWindData: Record<string, SensorData> = {};
      WIND_ASSETS.forEach(id => {
        const data = generateSensorData('wind');
        newWindData[id] = { ...data, assetId: id };
      });

      const newSolarData: Record<string, SensorData> = {};
      SOLAR_ASSETS.forEach(id => {
        const data = generateSensorData('solar');
        newSolarData[id] = { ...data, assetId: id };
      });

      setWindData(newWindData);
      setSolarData(newSolarData);
    };

    updateData();
    const interval = setInterval(updateData, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (failureType: string, rulHours: number) => {
    if (failureType === 'normal' && rulHours > 200) return 'bg-success/20 text-success border-success/30';
    if (failureType === 'normal') return 'bg-warning/20 text-warning border-warning/30';
    if (rulHours < 20) return 'bg-destructive/20 text-destructive border-destructive/30';
    return 'bg-warning/20 text-warning border-warning/30';
  };

  const getStatusText = (failureType: string, rulHours: number) => {
    if (failureType === 'normal' && rulHours > 200) return 'Healthy';
    if (failureType === 'normal') return 'Maintenance Soon';
    if (rulHours < 20) return 'Critical';
    return 'Warning';
  };

  const AssetCard = ({ data, icon: Icon }: { data: SensorData; icon: any }) => (
    <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{data.assetId}</CardTitle>
          </div>
          <Badge className={`${getStatusColor(data.failureType, data.rulHours)}`}>
            {getStatusText(data.failureType, data.rulHours)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 rounded-md bg-accent/50">
            <Zap className="h-4 w-4 text-chart-1" />
            <div>
              <p className="text-xs text-muted-foreground">Power</p>
              <p className="text-sm font-semibold">{data.powerOutput.toFixed(1)} kW</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 rounded-md bg-accent/50">
            <Activity className="h-4 w-4 text-chart-2" />
            <div>
              <p className="text-xs text-muted-foreground">RUL</p>
              <p className="text-sm font-semibold">{data.rulHours.toFixed(0)} hrs</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-md bg-accent/50">
            <Thermometer className="h-4 w-4 text-chart-3" />
            <div>
              <p className="text-xs text-muted-foreground">Temp</p>
              <p className="text-sm font-semibold">{data.ambientTemp.toFixed(1)}°C</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-md bg-accent/50">
            <Droplets className="h-4 w-4 text-chart-4" />
            <div>
              <p className="text-xs text-muted-foreground">Humidity</p>
              <p className="text-sm font-semibold">{data.humidity.toFixed(0)}%</p>
            </div>
          </div>
        </div>

        {data.assetType === 'wind' && (
          <div className="pt-2 border-t border-border/50 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Wind Speed:</span>
              <span className="font-medium">{data.windSpeed?.toFixed(1)} m/s</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Rotor Speed:</span>
              <span className="font-medium">{data.rotorSpeed?.toFixed(1)} rpm</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Gearbox Temp:</span>
              <span className="font-medium">{data.gearboxTemp?.toFixed(1)}°C</span>
            </div>
          </div>
        )}

        {data.assetType === 'solar' && (
          <div className="pt-2 border-t border-border/50 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Voltage:</span>
              <span className="font-medium">{data.panelVoltage?.toFixed(1)} V</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current:</span>
              <span className="font-medium">{data.panelCurrent?.toFixed(2)} A</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Module Temp:</span>
              <span className="font-medium">{data.moduleTemp?.toFixed(1)}°C</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Irradiance:</span>
              <span className="font-medium">{data.irradiance?.toFixed(0)} W/m²</span>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-border/50">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Confidence:</span>
            <span className="text-xs font-medium">{(data.confidence * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-1.5 mt-1">
            <div 
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${data.confidence * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Asset Management</h1>
        <p className="text-muted-foreground">Monitor all renewable energy assets and their real-time status</p>
      </div>

      <Tabs defaultValue="wind" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="wind" className="flex items-center gap-2">
            <Wind className="h-4 w-4" />
            Wind Turbines
          </TabsTrigger>
          <TabsTrigger value="solar" className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            Solar Panels
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wind" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {WIND_ASSETS.map(id => (
              windData[id] && <AssetCard key={id} data={windData[id]} icon={Wind} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="solar" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SOLAR_ASSETS.map(id => (
              solarData[id] && <AssetCard key={id} data={solarData[id]} icon={Sun} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
