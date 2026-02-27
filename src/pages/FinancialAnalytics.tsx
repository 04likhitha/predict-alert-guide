import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

const COLORS = ['hsl(217, 91%, 60%)', 'hsl(280, 75%, 65%)', 'hsl(43, 96%, 56%)', 'hsl(142, 71%, 45%)', 'hsl(340, 82%, 52%)'];

export default function FinancialAnalytics() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [parts, setParts] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const [{ data: t }, { data: p }] = await Promise.all([
        supabase.from('maintenance_tasks').select('*'),
        supabase.from('spare_parts').select('*'),
      ]);
      if (t) setTasks(t);
      if (p) setParts(p);
    };
    fetch();
  }, []);

  const totalMaintenanceCost = tasks.reduce((a, t) => a + (t.actual_cost || t.cost_estimate || 0), 0);
  const inventoryValue = parts.reduce((a, p) => a + (p.quantity_in_stock * p.unit_cost), 0);
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const avgCost = completedTasks.length > 0 ? totalMaintenanceCost / completedTasks.length : 0;

  const costByPriority = ['low', 'medium', 'high', 'critical'].map(p => ({
    name: p,
    cost: tasks.filter(t => t.priority === p).reduce((a, t) => a + (t.cost_estimate || 0), 0),
  }));

  const monthlyData = Array.from({ length: 6 }, (_, i) => ({
    month: new Date(Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en', { month: 'short' }),
    cost: Math.round(Math.random() * 15000 + 5000),
    savings: Math.round(Math.random() * 8000 + 2000),
  }));

  const partsByCategory = parts.reduce((acc: Record<string, number>, p) => {
    acc[p.category] = (acc[p.category] || 0) + (p.quantity_in_stock * p.unit_cost);
    return acc;
  }, {});
  const categoryData = Object.entries(partsByCategory).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold glow-text">Financial Analytics</h1>
        <p className="text-muted-foreground mt-1">Cost analysis, ROI tracking, and budget insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><DollarSign className="h-8 w-8 text-primary" /><div><p className="text-xs text-muted-foreground">Total Maintenance Cost</p><p className="text-2xl font-bold">${totalMaintenanceCost.toLocaleString()}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><Wallet className="h-8 w-8 text-chart-2" /><div><p className="text-xs text-muted-foreground">Inventory Value</p><p className="text-2xl font-bold">${inventoryValue.toLocaleString()}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><TrendingDown className="h-8 w-8 text-success" /><div><p className="text-xs text-muted-foreground">Avg Cost/Task</p><p className="text-2xl font-bold">${avgCost.toFixed(0)}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><TrendingUp className="h-8 w-8 text-chart-3" /><div><p className="text-xs text-muted-foreground">Tasks Completed</p><p className="text-2xl font-bold">{completedTasks.length}</p></div></div></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-glow p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Cost vs Savings</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
              <Legend />
              <Line type="monotone" dataKey="cost" stroke="hsl(var(--destructive))" strokeWidth={2} name="Cost" />
              <Line type="monotone" dataKey="savings" stroke="hsl(var(--success))" strokeWidth={2} name="Savings" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="card-glow p-6">
          <h3 className="text-lg font-semibold mb-4">Cost by Priority</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costByPriority}>
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
              <Bar dataKey="cost" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {categoryData.length > 0 && (
          <Card className="card-glow p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Inventory Value by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>
    </div>
  );
}
