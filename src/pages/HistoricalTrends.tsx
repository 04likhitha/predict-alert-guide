import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useSensorHistory } from '@/hooks/useSensorHistory';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, Database, BarChart3, Clock } from 'lucide-react';

export default function HistoricalTrends() {
  const [assets, setAssets] = useState<any[]>([]);
  const [selectedAsset, setSelectedAsset] = useState('');
  const { data: sensorData, loading } = useSensorHistory(selectedAsset || undefined, 200);

  useEffect(() => {
    const fetchAssets = async () => {
      const { data } = await supabase.from('assets').select('*');
      if (data && data.length > 0) {
        setAssets(data);
        setSelectedAsset(data[0].asset_id);
      }
    };
    fetchAssets();
  }, []);

  const chartData = sensorData.map(r => ({
    time: new Date(r.timestamp).toLocaleTimeString(),
    power: r.power_output,
    temp: r.ambient_temp,
    humidity: r.humidity,
    rul: r.rul_hours,
    confidence: r.confidence * 100,
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold glow-text">Historical Trends Explorer</h1>
          <p className="text-muted-foreground mt-1">Analyze historical sensor data patterns and trends</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedAsset} onValueChange={setSelectedAsset}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select asset" />
            </SelectTrigger>
            <SelectContent>
              {assets.map(a => <SelectItem key={a.asset_id} value={a.asset_id}>{a.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><Database className="h-6 w-6 text-primary" /><div><p className="text-xs text-muted-foreground">Data Points</p><p className="text-xl font-bold">{sensorData.length}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><BarChart3 className="h-6 w-6 text-chart-2" /><div><p className="text-xs text-muted-foreground">Avg Power</p><p className="text-xl font-bold">{sensorData.length > 0 ? (sensorData.reduce((a, r) => a + r.power_output, 0) / sensorData.length).toFixed(1) : 0} kW</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><TrendingUp className="h-6 w-6 text-success" /><div><p className="text-xs text-muted-foreground">Avg Confidence</p><p className="text-xl font-bold">{sensorData.length > 0 ? (sensorData.reduce((a, r) => a + r.confidence, 0) / sensorData.length * 100).toFixed(0) : 0}%</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><Clock className="h-6 w-6 text-chart-3" /><div><p className="text-xs text-muted-foreground">Avg RUL</p><p className="text-xl font-bold">{sensorData.length > 0 ? (sensorData.reduce((a, r) => a + r.rul_hours, 0) / sensorData.length).toFixed(0) : 0}h</p></div></div></Card>
      </div>

      {chartData.length > 0 ? (
        <div className="space-y-6">
          <Card className="card-glow p-6">
            <h3 className="text-lg font-semibold mb-4">Power Output Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '10px' }} />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                <Legend />
                <Line type="monotone" dataKey="power" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Power (kW)" />
                <Line type="monotone" dataKey="rul" stroke="hsl(var(--success))" strokeWidth={2} dot={false} name="RUL (hrs)" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="card-glow p-6">
            <h3 className="text-lg font-semibold mb-4">Environmental Conditions</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '10px' }} />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                <Legend />
                <Line type="monotone" dataKey="temp" stroke="hsl(var(--warning))" strokeWidth={2} dot={false} name="Temp (°C)" />
                <Line type="monotone" dataKey="humidity" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} name="Humidity (%)" />
                <Line type="monotone" dataKey="confidence" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={false} name="Confidence (%)" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      ) : (
        <Card className="p-8 text-center text-muted-foreground">
          <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No historical data available. Start real-time monitoring to collect data.</p>
        </Card>
      )}
    </div>
  );
}
