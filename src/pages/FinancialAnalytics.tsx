import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend, AreaChart, Area } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { getAllDatasetRows } from '@/utils/datasetStreamEngine';
import { type SolarDataRow } from '@/data/solarDataset';
import { type WindDataRow } from '@/data/windDataset';

const COLORS = ['hsl(217, 91%, 60%)', 'hsl(280, 75%, 65%)', 'hsl(43, 96%, 56%)', 'hsl(142, 71%, 45%)', 'hsl(340, 82%, 52%)', 'hsl(200, 80%, 50%)'];

export default function FinancialAnalytics() {
  const { solar, wind } = useMemo(() => getAllDatasetRows(), []);
  const allRows: (SolarDataRow | WindDataRow)[] = useMemo(() => [...solar, ...wind], [solar, wind]);

  // ── Core financial metrics computed from dataset ──
  const totalMaintenanceCost = useMemo(() =>
    allRows.reduce((sum, r) => sum + (r.daily_cost || 0), 0), [allRows]);

  const totalRevenue = useMemo(() =>
    allRows.reduce((sum, r) => sum + (r.daily_revenue || 0), 0), [allRows]);

  const totalDowntimeLoss = useMemo(() =>
    allRows.reduce((sum, r) => sum + (r.downtime_loss || 0), 0), [allRows]);

  const avgROI = useMemo(() => {
    const roiValues = allRows.filter(r => r.roi_percent != null);
    return roiValues.length > 0 ? roiValues.reduce((s, r) => s + r.roi_percent, 0) / roiValues.length : 0;
  }, [allRows]);

  // Unique asset count
  const assetIds = useMemo(() => new Set(allRows.map(r => r.asset_id)), [allRows]);
  const avgCostPerAsset = assetIds.size > 0 ? totalMaintenanceCost / assetIds.size : 0;

  // ── Monthly cost vs revenue (group by month from timestamps) ──
  const monthlyData = useMemo(() => {
    const byMonth: Record<string, { cost: number; revenue: number; loss: number }> = {};
    allRows.forEach(r => {
      const d = new Date(r.timestamp);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!byMonth[key]) byMonth[key] = { cost: 0, revenue: 0, loss: 0 };
      byMonth[key].cost += r.daily_cost || 0;
      byMonth[key].revenue += r.daily_revenue || 0;
      byMonth[key].loss += r.downtime_loss || 0;
    });
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, v]) => ({
        month: new Date(month + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' }),
        cost: Math.round(v.cost),
        revenue: Math.round(v.revenue),
        loss: Math.round(v.loss),
      }));
  }, [allRows]);

  // ── Cost by asset type ──
  const costByType = useMemo(() => {
    const solarCost = solar.reduce((s, r) => s + (r.daily_cost || 0), 0);
    const windCost = wind.reduce((s, r) => s + (r.daily_cost || 0), 0);
    return [
      { name: 'Solar', cost: Math.round(solarCost), revenue: Math.round(solar.reduce((s, r) => s + (r.daily_revenue || 0), 0)) },
      { name: 'Wind', cost: Math.round(windCost), revenue: Math.round(wind.reduce((s, r) => s + (r.daily_revenue || 0), 0)) },
    ];
  }, [solar, wind]);

  // ── ROI by asset ──
  const roiByAsset = useMemo(() => {
    const byAsset: Record<string, { sum: number; count: number }> = {};
    allRows.forEach(r => {
      if (!byAsset[r.asset_id]) byAsset[r.asset_id] = { sum: 0, count: 0 };
      byAsset[r.asset_id].sum += r.roi_percent || 0;
      byAsset[r.asset_id].count += 1;
    });
    return Object.entries(byAsset).map(([id, v]) => ({
      name: id,
      roi: Math.round((v.sum / v.count) * 100) / 100,
    }));
  }, [allRows]);

  // ── Downtime loss by failure type ──
  const lossByFailure = useMemo(() => {
    const byFailure: Record<string, number> = {};
    allRows.forEach(r => {
      const ft = r.failure_type || 'Normal';
      byFailure[ft] = (byFailure[ft] || 0) + (r.downtime_loss || 0);
    });
    return Object.entries(byFailure)
      .filter(([_, v]) => v > 0)
      .map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [allRows]);

  const tooltipStyle = { backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold glow-text">Financial Analytics</h1>
        <p className="text-muted-foreground mt-1">Historical cost analysis, ROI tracking, and budget insights from dataset</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><DollarSign className="h-8 w-8 text-primary" /><div><p className="text-xs text-muted-foreground">Total Maintenance Cost</p><p className="text-2xl font-bold">${totalMaintenanceCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><Wallet className="h-8 w-8 text-chart-2" /><div><p className="text-xs text-muted-foreground">Total Revenue</p><p className="text-2xl font-bold">${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><TrendingDown className="h-8 w-8 text-destructive" /><div><p className="text-xs text-muted-foreground">Downtime Losses</p><p className="text-2xl font-bold">${totalDowntimeLoss.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><TrendingUp className="h-8 w-8 text-success" /><div><p className="text-xs text-muted-foreground">Average ROI</p><p className="text-2xl font-bold">{avgROI.toFixed(1)}%</p></div></div></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-glow p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Cost vs Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.15} strokeWidth={2} name="Revenue ($)" />
              <Area type="monotone" dataKey="cost" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.15} strokeWidth={2} name="Cost ($)" />
              <Area type="monotone" dataKey="loss" stroke="hsl(var(--warning))" fill="hsl(var(--warning))" fillOpacity={0.1} strokeWidth={1.5} name="Downtime Loss ($)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="card-glow p-6">
          <h3 className="text-lg font-semibold mb-4">Cost vs Revenue by Asset Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costByType}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="cost" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} name="Cost ($)" />
              <Bar dataKey="revenue" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} name="Revenue ($)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="card-glow p-6">
          <h3 className="text-lg font-semibold mb-4">ROI by Asset (%)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roiByAsset} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={10} width={80} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="roi" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="ROI %" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="card-glow p-6">
          <h3 className="text-lg font-semibold mb-4">Downtime Loss by Failure Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={lossByFailure} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: $${value.toLocaleString()}`}>
                {lossByFailure.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
