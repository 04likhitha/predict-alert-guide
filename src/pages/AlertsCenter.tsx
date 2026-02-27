import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Bell, CheckCircle2, XCircle, AlertTriangle, AlertCircle, Info, Filter } from 'lucide-react';

export default function AlertsCenter() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    const { data } = await supabase.from('alerts_history').select('*').order('created_at', { ascending: false }).limit(100);
    if (data) setAlerts(data);
    setLoading(false);
  };

  useEffect(() => { fetchAlerts(); }, []);

  const acknowledge = async (id: string) => {
    await supabase.from('alerts_history').update({ acknowledged: true, acknowledged_by: user?.id }).eq('id', id);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
    toast.success('Alert acknowledged');
  };

  const resolve = async (id: string) => {
    await supabase.from('alerts_history').update({ resolved: true, resolved_at: new Date().toISOString() }).eq('id', id);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
    toast.success('Alert resolved');
  };

  const filtered = filter === 'all' ? alerts
    : filter === 'unresolved' ? alerts.filter(a => !a.resolved)
    : alerts.filter(a => a.severity === filter);

  const severityIcons: Record<string, any> = { critical: XCircle, high: AlertCircle, medium: AlertTriangle, low: Info };
  const severityColors: Record<string, string> = {
    critical: 'border-destructive/50 bg-destructive/5',
    high: 'border-destructive/30 bg-destructive/5',
    medium: 'border-warning/30 bg-warning/5',
    low: 'border-primary/30 bg-primary/5',
  };

  const counts = {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    unresolved: alerts.filter(a => !a.resolved).length,
    acknowledged: alerts.filter(a => a.acknowledged).length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold glow-text">Alerts Center</h1>
          <p className="text-muted-foreground mt-1">Centralized alert management and resolution tracking</p>
        </div>
        <div className="flex gap-2">
          {['all', 'critical', 'high', 'medium', 'low', 'unresolved'].map(f => (
            <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)} className="capitalize text-xs">
              {f}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><Bell className="h-6 w-6 text-primary" /><div><p className="text-xs text-muted-foreground">Total</p><p className="text-xl font-bold">{counts.total}</p></div></div></Card>
        <Card className="p-4 border-destructive/30"><div className="flex items-center gap-3"><XCircle className="h-6 w-6 text-destructive" /><div><p className="text-xs text-muted-foreground">Critical</p><p className="text-xl font-bold text-destructive">{counts.critical}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><AlertTriangle className="h-6 w-6 text-warning" /><div><p className="text-xs text-muted-foreground">Unresolved</p><p className="text-xl font-bold">{counts.unresolved}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><CheckCircle2 className="h-6 w-6 text-success" /><div><p className="text-xs text-muted-foreground">Acknowledged</p><p className="text-xl font-bold">{counts.acknowledged}</p></div></div></Card>
      </div>

      <div className="space-y-3">
        {filtered.map(alert => {
          const Icon = severityIcons[alert.severity] || Info;
          return (
            <Card key={alert.id} className={`p-4 border-2 ${severityColors[alert.severity] || ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <Icon className={`h-5 w-5 mt-0.5 ${alert.severity === 'critical' ? 'text-destructive' : alert.severity === 'high' ? 'text-destructive' : alert.severity === 'medium' ? 'text-warning' : 'text-primary'}`} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{alert.message}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Badge variant="outline" className="text-xs">{alert.asset_id}</Badge>
                      <Badge variant={alert.severity === 'critical' || alert.severity === 'high' ? 'destructive' : 'default'} className="text-xs">{alert.severity}</Badge>
                      {alert.acknowledged && <Badge variant="secondary" className="text-xs">Acknowledged</Badge>}
                      {alert.resolved && <Badge className="bg-success/10 text-success text-xs">Resolved</Badge>}
                      <span className="text-xs text-muted-foreground">{new Date(alert.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!alert.acknowledged && <Button size="sm" variant="outline" onClick={() => acknowledge(alert.id)}>Acknowledge</Button>}
                  {!alert.resolved && <Button size="sm" className="bg-success hover:bg-success/90" onClick={() => resolve(alert.id)}>Resolve</Button>}
                </div>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No alerts match the current filter</p>
          </Card>
        )}
      </div>
    </div>
  );
}
