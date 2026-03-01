import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { allAssets, getNextReading } from '@/utils/datasetStreamEngine';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts';
import { Zap, Sun, Wind, Battery } from 'lucide-react';

export default function EnergyProduction() {
  const [productionHistory, setProductionHistory] = useState<any[]>([]);

  const windAssetsList = allAssets.filter(a => a.type === 'wind');
  const solarAssetsList = allAssets.filter(a => a.type === 'solar');

  useEffect(() => {
    const interval = setInterval(() => {
      const time = new Date().toLocaleTimeString();
      let windTotal = 0, solarTotal = 0;

      windAssetsList.forEach(a => {
        const d = getNextReading(a.id);
        if (d) windTotal += d.powerOutput;
      });
      solarAssetsList.forEach(a => {
        const d = getNextReading(a.id);
        if (d) solarTotal += d.powerOutput;
      });

      setProductionHistory(prev => [...prev, { time, wind: windTotal, solar: solarTotal, total: windTotal + solarTotal }].slice(-30));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const latest = productionHistory[productionHistory.length - 1];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold glow-text">Energy Production Insights</h1>
        <p className="text-muted-foreground mt-1">Real-time power generation from master datasets</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-2 border-primary/30">
          <div className="flex items-center gap-3"><Zap className="h-8 w-8 text-primary" /><div><p className="text-xs text-muted-foreground">Total Output</p><p className="text-2xl font-bold">{latest ? latest.total.toFixed(0) : 0} kW</p></div></div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3"><Wind className="h-8 w-8 text-chart-1" /><div><p className="text-xs text-muted-foreground">Wind ({windAssetsList.length} units)</p><p className="text-2xl font-bold">{latest ? latest.wind.toFixed(0) : 0} kW</p></div></div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3"><Sun className="h-8 w-8 text-chart-3" /><div><p className="text-xs text-muted-foreground">Solar ({solarAssetsList.length} units)</p><p className="text-2xl font-bold">{latest ? latest.solar.toFixed(0) : 0} kW</p></div></div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3"><Battery className="h-8 w-8 text-success" /><div><p className="text-xs text-muted-foreground">Capacity Factor</p><p className="text-2xl font-bold">78%</p></div></div>
        </Card>
      </div>

      <Card className="card-glow p-6">
        <h3 className="text-lg font-semibold mb-4">Total Energy Production</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={productionHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '11px' }} />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
            <Legend />
            <Area type="monotone" dataKey="wind" stackId="1" fill="hsl(217, 91%, 60%)" stroke="hsl(217, 91%, 60%)" fillOpacity={0.3} name="Wind" />
            <Area type="monotone" dataKey="solar" stackId="1" fill="hsl(43, 96%, 56%)" stroke="hsl(43, 96%, 56%)" fillOpacity={0.3} name="Solar" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
