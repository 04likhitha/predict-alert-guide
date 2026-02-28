import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle2, XCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateSensorData, generateAlert } from '@/utils/sensorSimulator';
import type { Alert } from '@/types/sensor';

export default function AlertsCenter() {
  const { user } = useAuth();
  const [dbAlerts, setDbAlerts] = useState<any[]>([]);
  const [sessionAlerts, setSessionAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const sessionRef = useRef<boolean>(true);

  // Fetch persisted alerts
  const fetchAlerts = async () => {
    const { data } = await supabase.from('alerts_history').select('*').order('created_at', { ascending: false }).limit(200);
    if (data) setDbAlerts(data);
    setLoading(false);
  };

  useEffect(() => { fetchAlerts(); }, []);

  // Session-based live alert generation
  useEffect(() => {
    const interval = setInterval(() => {
      if (!sessionRef.current) return;
      const windData = generateSensorData('wind');
      const solarData = generateSensorData('solar');
      const windAlert = generateAlert(windData);
      const solarAlert = generateAlert(solarData);
      if (windAlert) {
        setSessionAlerts(prev => [windAlert, ...prev]);
        // Persist to DB
        supabase.from('alerts_history').insert({
          asset_id: windAlert.assetId,
          severity: windAlert.severity,
          message: windAlert.message,
          failure_type: windData.failureType,
          rul_hours: windData.rulHours,
        }).then(() => {});
      }
      if (solarAlert) {
        setSessionAlerts(prev => [solarAlert, ...prev]);
        supabase.from('alerts_history').insert({
          asset_id: solarAlert.assetId,
          severity: solarAlert.severity,
          message: solarAlert.message,
          failure_type: solarData.failureType,
          rul_hours: solarData.rulHours,
        }).then(() => {});
      }
    }, 4000);
    return () => { clearInterval(interval); sessionRef.current = false; };
  }, []);

  const acknowledge = async (id: string) => {
    await supabase.from('alerts_history').update({ acknowledged: true, acknowledged_by: user?.id }).eq('id', id);
    setDbAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
    toast.success('Alert acknowledged');
  };

  const resolve = async (id: string) => {
    await supabase.from('alerts_history').update({ resolved: true, resolved_at: new Date().toISOString() }).eq('id', id);
    setDbAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
    toast.success('Alert resolved');
  };

  // Merge session alerts with db alerts for display
  const allAlerts = [
    ...sessionAlerts.map(a => ({
      id: a.id,
      asset_id: a.assetId,
      severity: a.severity,
      message: a.message,
      created_at: a.timestamp.toISOString(),
      acknowledged: false,
      resolved: false,
      isSession: true,
    })),
    ...dbAlerts.map(a => ({ ...a, isSession: false })),
  ];

  const filtered = filter === 'all' ? allAlerts
    : filter === 'unresolved' ? allAlerts.filter(a => !a.resolved)
    : filter === 'session' ? allAlerts.filter(a => a.isSession)
    : allAlerts.filter(a => a.severity === filter);

  const severityIcons: Record<string, any> = { critical: XCircle, high: AlertCircle, medium: AlertTriangle, low: Info };
  const severityStyles: Record<string, string> = {
    critical: 'border-destructive/30 bg-destructive/5',
    high: 'border-destructive/20 bg-destructive/5',
    medium: 'border-warning/20 bg-warning/5',
    low: 'border-primary/20 bg-primary/5',
  };

  const counts = {
    total: allAlerts.length,
    critical: allAlerts.filter(a => a.severity === 'critical').length,
    unresolved: allAlerts.filter(a => !a.resolved).length,
    session: sessionAlerts.length,
  };

  return (
    <div className="p-6 max-w-[1800px] mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="page-header mb-0">
          <h1>Alerts Center</h1>
          <p>Session-persistent alert tracking and resolution management</p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['all', 'critical', 'high', 'medium', 'low', 'unresolved', 'session'].map(f => (
            <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)} className="capitalize text-[11px] h-7">
              {f}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 bg-card border border-border/50"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><Bell className="h-4 w-4 text-primary" /></div><div><p className="text-[11px] text-muted-foreground">Total</p><p className="text-lg font-bold">{counts.total}</p></div></div></Card>
        <Card className="p-4 bg-card border-destructive/20"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-destructive/10"><XCircle className="h-4 w-4 text-destructive" /></div><div><p className="text-[11px] text-muted-foreground">Critical</p><p className="text-lg font-bold text-destructive">{counts.critical}</p></div></div></Card>
        <Card className="p-4 bg-card border border-border/50"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-warning/10"><AlertTriangle className="h-4 w-4 text-warning" /></div><div><p className="text-[11px] text-muted-foreground">Unresolved</p><p className="text-lg font-bold">{counts.unresolved}</p></div></div></Card>
        <Card className="p-4 bg-card border border-border/50"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-success/10"><CheckCircle2 className="h-4 w-4 text-success" /></div><div><p className="text-[11px] text-muted-foreground">This Session</p><p className="text-lg font-bold">{counts.session}</p></div></div></Card>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {filtered.slice(0, 50).map((alert, i) => {
            const Icon = severityIcons[alert.severity] || Info;
            return (
              <motion.div
                key={alert.id + '-' + i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: i * 0.02 }}
              >
                <Card className={cn('p-3.5 border', severityStyles[alert.severity] || '')}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 flex-1">
                      <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', alert.severity === 'critical' || alert.severity === 'high' ? 'text-destructive' : alert.severity === 'medium' ? 'text-warning' : 'text-primary')} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">{alert.message}</p>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5">{alert.asset_id}</Badge>
                          <Badge variant={alert.severity === 'critical' || alert.severity === 'high' ? 'destructive' : 'secondary'} className="text-[10px] h-4">{alert.severity}</Badge>
                          {alert.isSession && <Badge className="text-[10px] h-4 bg-primary/10 text-primary border-0">Session</Badge>}
                          {alert.acknowledged && <Badge variant="secondary" className="text-[10px] h-4">Ack</Badge>}
                          {alert.resolved && <Badge className="text-[10px] h-4 bg-success/10 text-success border-0">Resolved</Badge>}
                          <span className="text-[10px] text-muted-foreground">{new Date(alert.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    {!alert.isSession && (
                      <div className="flex gap-1.5 shrink-0">
                        {!alert.acknowledged && <Button size="sm" variant="outline" onClick={() => acknowledge(alert.id)} className="h-7 text-[10px]">Ack</Button>}
                        {!alert.resolved && <Button size="sm" onClick={() => resolve(alert.id)} className="h-7 text-[10px] bg-success hover:bg-success/90">Resolve</Button>}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <Card className="p-8 text-center border border-border/50">
            <Bell className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">No alerts match the current filter</p>
          </Card>
        )}
      </div>
    </div>
  );
}
