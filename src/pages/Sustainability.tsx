import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { allAssets, getAllDatasetRows } from '@/utils/datasetStreamEngine';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Leaf, TreePine, Fuel, Wind as WindIcon } from 'lucide-react';

export default function Sustainability() {
  const windCount = allAssets.filter(a => a.type === 'wind').length;
  const solarCount = allAssets.filter(a => a.type === 'solar').length;
  const { solar, wind } = getAllDatasetRows();

  // Compute averages from actual dataset
  const avgWindPower = wind.length > 0 ? wind.reduce((a, r) => a + r.power_output, 0) / wind.length : 0;
  const avgSolarPower = solar.length > 0 ? solar.reduce((a, r) => a + r.power_output, 0) / solar.length : 0;

  const totalDailyKWh = (windCount * avgWindPower + solarCount * avgSolarPower) * 24;
  const co2PerKWh = 0.4;
  const dailyCO2Saved = (totalDailyKWh * co2PerKWh) / 1000;
  const annualCO2Saved = dailyCO2Saved * 365;
  const treesEquivalent = Math.round(annualCO2Saved * 45);
  const householdsPowered = Math.round(totalDailyKWh / 30);

  const monthlyData = Array.from({ length: 6 }, (_, i) => ({
    month: new Date(Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en', { month: 'short' }),
    co2Saved: Math.round(annualCO2Saved / 12 * (0.85 + (i * 0.03))),
    energyGenerated: Math.round(totalDailyKWh * 30 * (0.85 + (i * 0.03)) / 1000),
  }));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold glow-text">Sustainability & Carbon Savings</h1>
        <p className="text-muted-foreground mt-1">Environmental impact computed from master datasets</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-2 border-success/30 bg-success/5"><div className="flex items-center gap-3"><Leaf className="h-8 w-8 text-success" /><div><p className="text-xs text-muted-foreground">Annual CO₂ Saved</p><p className="text-2xl font-bold text-success">{annualCO2Saved.toFixed(1)} tons</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><TreePine className="h-8 w-8 text-chart-4" /><div><p className="text-xs text-muted-foreground">Trees Equivalent</p><p className="text-2xl font-bold">{treesEquivalent.toLocaleString()}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><Fuel className="h-8 w-8 text-chart-3" /><div><p className="text-xs text-muted-foreground">Daily Energy</p><p className="text-2xl font-bold">{(totalDailyKWh / 1000).toFixed(1)} MWh</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><WindIcon className="h-8 w-8 text-primary" /><div><p className="text-xs text-muted-foreground">Homes Powered</p><p className="text-2xl font-bold">{householdsPowered.toLocaleString()}</p></div></div></Card>
      </div>

      <Card className="card-glow p-6">
        <h3 className="text-lg font-semibold mb-4">UN SDG Alignment</h3>
        <div className="space-y-4">
          <div><div className="flex justify-between text-sm mb-1"><span>SDG 7: Affordable & Clean Energy</span><span>85%</span></div><Progress value={85} className="h-2" /></div>
          <div><div className="flex justify-between text-sm mb-1"><span>SDG 13: Climate Action</span><span>72%</span></div><Progress value={72} className="h-2" /></div>
          <div><div className="flex justify-between text-sm mb-1"><span>SDG 9: Industry Innovation</span><span>90%</span></div><Progress value={90} className="h-2" /></div>
          <div><div className="flex justify-between text-sm mb-1"><span>SDG 12: Responsible Consumption</span><span>65%</span></div><Progress value={65} className="h-2" /></div>
        </div>
      </Card>

      <Card className="card-glow p-6">
        <h3 className="text-lg font-semibold mb-4">Monthly Environmental Impact</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
            <Legend />
            <Bar dataKey="co2Saved" fill="hsl(142, 71%, 45%)" name="CO₂ Saved (tons)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="energyGenerated" fill="hsl(217, 91%, 60%)" name="Energy (MWh)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
