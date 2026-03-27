import { useState, useEffect, useCallback } from 'react';
import { Wind, Sun, Activity, Zap, Thermometer, Droplets, MapPin, Gauge, ShieldCheck, TrendingUp, Search, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { allAssets, getNextReading, type DatasetAsset } from '@/utils/datasetStreamEngine';
import { SensorData } from '@/types/sensor';
import { supabase } from '@/integrations/supabase/client';
import AddAssetDialog from '@/components/AddAssetDialog';

// Extended sensor data for display including dataset-specific fields
interface ExtendedReading extends SensorData {
  voltage?: number;
  current?: number;
  efficiency_percent?: number;
  alert_level?: string;
  vibration?: number;
  daily_cost?: number;
  daily_revenue?: number;
  carbon_saved_kg?: number;
  energy_generated_kwh?: number;
}

export default function Assets() {
  const [sensorMap, setSensorMap] = useState<Record<string, ExtendedReading>>({});
  const [dbAssets, setDbAssets] = useState<DatasetAsset[]>([]);
  const [search, setSearch] = useState('');

  // Combine dataset assets + DB-added assets
  const combinedAssets = [...allAssets, ...dbAssets];
  const windAssetsList = combinedAssets.filter(a => a.type === 'wind');
  const solarAssetsList = combinedAssets.filter(a => a.type === 'solar');

  const filteredWind = windAssetsList.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.id.toLowerCase().includes(search.toLowerCase())
  );
  const filteredSolar = solarAssetsList.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.id.toLowerCase().includes(search.toLowerCase())
  );

  const fetchDbAssets = useCallback(async () => {
    const datasetIds = new Set(allAssets.map(a => a.id));
    const { data } = await supabase.from('assets').select('*');
    if (data) {
      const extra = data
        .filter(a => !datasetIds.has(a.asset_id))
        .map(a => ({
          id: a.asset_id,
          name: a.name,
          type: a.asset_type as 'wind' | 'solar',
          capacity_mw: a.capacity || 0,
          location: a.location || '',
          lat: 0,
          lng: 0,
          installation_date: a.installation_date || '',
          status: 'Healthy',
        }));
      setDbAssets(extra);
    }
  }, []);

  useEffect(() => {
    fetchDbAssets();
  }, [fetchDbAssets]);

  // Stream dataset readings
  useEffect(() => {
    const tick = () => {
      const newMap: Record<string, ExtendedReading> = {};
      allAssets.forEach(asset => {
        const reading = getNextReading(asset.id);
        if (reading) newMap[asset.id] = reading as ExtendedReading;
      });
      setSensorMap(prev => ({ ...prev, ...newMap }));
    };
    tick();
    const interval = setInterval(tick, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch latest sensor reading for DB-added assets
  useEffect(() => {
    if (dbAssets.length === 0) return;
    const fetchLatest = async () => {
      for (const asset of dbAssets) {
        const { data } = await supabase
          .from('sensor_readings')
          .select('*')
          .eq('asset_id', asset.id)
          .order('timestamp', { ascending: false })
          .limit(1);
        if (data && data[0]) {
          const r = data[0];
          setSensorMap(prev => ({
            ...prev,
            [asset.id]: {
              timestamp: new Date(r.timestamp),
              assetType: r.asset_type as 'wind' | 'solar',
              assetId: r.asset_id,
              powerOutput: r.power_output,
              ambientTemp: r.ambient_temp,
              humidity: r.humidity,
              windSpeed: r.wind_speed ?? undefined,
              rotorSpeed: r.rotor_speed ?? undefined,
              gearboxTemp: r.gearbox_temp ?? undefined,
              panelVoltage: r.panel_voltage ?? undefined,
              panelCurrent: r.panel_current ?? undefined,
              moduleTemp: r.module_temp ?? undefined,
              irradiance: r.irradiance ?? undefined,
              failureType: r.failure_type as any,
              rulHours: r.rul_hours,
              confidence: r.confidence,
            } as ExtendedReading,
          }));
        }
      }
    };
    fetchLatest();
  }, [dbAssets]);

  const getStatusBadge = (failureType: string, rulHours: number) => {
    if (failureType === 'normal' && rulHours > 200)
      return { label: 'Healthy', className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' };
    if (failureType === 'normal')
      return { label: 'Warning', className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' };
    if (rulHours < 20)
      return { label: 'Critical', className: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30' };
    return { label: 'Warning', className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' };
  };

  const MetricTile = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) => (
    <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-accent/40 border border-border/30">
      <div className={`p-1.5 rounded-md ${color}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold truncate">{value}</p>
      </div>
    </div>
  );

  const AssetCard = ({ asset, data, icon: Icon }: { asset: DatasetAsset; data: ExtendedReading | undefined; icon: any }) => {
    const status = data ? getStatusBadge(data.failureType, data.rulHours) : { label: 'No Data', className: 'bg-muted text-muted-foreground' };
    const confidencePct = data ? data.confidence * 100 : 0;

    return (
      <Card className="group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border-border/50 overflow-hidden">
        {/* Header */}
        <CardHeader className="pb-3 space-y-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="shrink-0 p-2 rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base truncate">{asset.name}</CardTitle>
                <p className="text-xs text-muted-foreground font-mono">{asset.id}</p>
              </div>
            </div>
            <Badge variant="outline" className={`shrink-0 text-[10px] px-2 ${status.className}`}>
              {status.label}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2 pt-2 border-t border-border/30">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{asset.location}</span>
            <span className="ml-auto shrink-0 font-medium">{asset.capacity_mw} MW</span>
          </div>
        </CardHeader>

        {data && (
          <CardContent className="space-y-3 pt-0">
            {/* Primary Metrics Grid */}
            <div className="grid grid-cols-2 gap-2">
              <MetricTile icon={Zap} label="Power" value={`${data.powerOutput.toFixed(1)} kW`} color="bg-chart-1/20 text-chart-1" />
              <MetricTile icon={Activity} label="RUL" value={`${data.rulHours.toFixed(0)} hrs`} color="bg-chart-2/20 text-chart-2" />
              <MetricTile icon={Thermometer} label="Temp" value={`${data.ambientTemp.toFixed(1)}°C`} color="bg-chart-3/20 text-chart-3" />
              <MetricTile icon={Droplets} label="Humidity" value={`${data.humidity.toFixed(0)}%`} color="bg-chart-4/20 text-chart-4" />
            </div>

            {/* Type-specific metrics */}
            <div className="rounded-lg border border-border/30 divide-y divide-border/30">
              {data.assetType === 'wind' && (
                <>
                  <div className="flex justify-between items-center px-3 py-1.5 text-sm">
                    <span className="text-muted-foreground">Wind Speed</span>
                    <span className="font-medium">{data.windSpeed?.toFixed(1) ?? '—'} m/s</span>
                  </div>
                  <div className="flex justify-between items-center px-3 py-1.5 text-sm">
                    <span className="text-muted-foreground">Rotor Speed</span>
                    <span className="font-medium">{data.rotorSpeed?.toFixed(1) ?? '—'} rpm</span>
                  </div>
                  <div className="flex justify-between items-center px-3 py-1.5 text-sm">
                    <span className="text-muted-foreground">Gearbox Temp</span>
                    <span className="font-medium">{data.gearboxTemp?.toFixed(1) ?? '—'}°C</span>
                  </div>
                </>
              )}
              {data.assetType === 'solar' && (
                <>
                  <div className="flex justify-between items-center px-3 py-1.5 text-sm">
                    <span className="text-muted-foreground">Voltage</span>
                    <span className="font-medium">{data.panelVoltage?.toFixed(1) ?? '—'} V</span>
                  </div>
                  <div className="flex justify-between items-center px-3 py-1.5 text-sm">
                    <span className="text-muted-foreground">Current</span>
                    <span className="font-medium">{data.panelCurrent?.toFixed(2) ?? '—'} A</span>
                  </div>
                  <div className="flex justify-between items-center px-3 py-1.5 text-sm">
                    <span className="text-muted-foreground">Irradiance</span>
                    <span className="font-medium">{data.irradiance?.toFixed(0) ?? '—'} W/m²</span>
                  </div>
                </>
              )}
            </div>

            {/* Confidence bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Confidence</span>
                <span className="font-semibold">{confidencePct.toFixed(1)}%</span>
              </div>
              <Progress value={confidencePct} className="h-1.5" />
            </div>
          </CardContent>
        )}

        {!data && (
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground text-center py-4">Awaiting sensor data…</p>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Asset Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {combinedAssets.length} assets — live loop streaming from master datasets
          </p>
        </div>
        <AddAssetDialog onAssetAdded={fetchDbAssets} />
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search assets by name or ID…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="all">All ({combinedAssets.length})</TabsTrigger>
          <TabsTrigger value="wind" className="flex items-center gap-1.5"><Wind className="h-3.5 w-3.5" /> Wind ({windAssetsList.length})</TabsTrigger>
          <TabsTrigger value="solar" className="flex items-center gap-1.5"><Sun className="h-3.5 w-3.5" /> Solar ({solarAssetsList.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...filteredWind, ...filteredSolar].map(asset => (
              <AssetCard key={asset.id} asset={asset} data={sensorMap[asset.id]} icon={asset.type === 'wind' ? Wind : Sun} />
            ))}
          </div>
          {filteredWind.length + filteredSolar.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No assets match your search.</p>
          )}
        </TabsContent>

        <TabsContent value="wind" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredWind.map(asset => (
              <AssetCard key={asset.id} asset={asset} data={sensorMap[asset.id]} icon={Wind} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="solar" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredSolar.map(asset => (
              <AssetCard key={asset.id} asset={asset} data={sensorMap[asset.id]} icon={Sun} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
