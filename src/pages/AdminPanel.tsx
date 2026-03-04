import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shield, Users, Brain, Database, RefreshCw, Upload, CheckCircle2, AlertTriangle, Loader2, Info } from 'lucide-react';
import { allAssets } from '@/utils/datasetStreamEngine';

export default function AdminPanel() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [stats, setStats] = useState({ assets: 0, readings: 0, alerts: 0, tasks: 0 });
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    setRefreshing(true);
    const [{ data: p }, { data: pred }, { count: assetCount }, { count: readingCount }, { count: alertCount }, { count: taskCount }] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('ai_predictions').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('assets').select('*', { count: 'exact', head: true }),
      supabase.from('sensor_readings').select('*', { count: 'exact', head: true }),
      supabase.from('alerts_history').select('*', { count: 'exact', head: true }),
      supabase.from('maintenance_tasks').select('*', { count: 'exact', head: true }),
    ]);
    if (p) setProfiles(p);
    if (pred) setPredictions(pred);
    setStats({ assets: assetCount || 0, readings: readingCount || 0, alerts: alertCount || 0, tasks: taskCount || 0 });
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const syncAssets = async () => {
    setSyncing(true);
    try {
      for (const asset of allAssets) {
        const { error } = await supabase.from('assets').upsert({
          asset_id: asset.id,
          name: asset.name,
          asset_type: asset.type as 'wind' | 'solar',
          capacity: asset.capacity_mw,
          location: asset.location,
          installation_date: asset.installation_date,
        }, { onConflict: 'asset_id' });
        if (error) console.error('Asset sync error:', error.message);
      }
      toast.success(`Synced ${allAssets.length} assets from master datasets`);
      await fetchAll();
    } catch (err: any) {
      toast.error(err.message || 'Sync failed');
    }
    setSyncing(false);
  };

  const statCards = [
    { label: 'Assets (DB)', value: stats.assets, expected: allAssets.length, color: 'text-primary', icon: Database },
    { label: 'Sensor Readings', value: stats.readings, color: 'text-chart-2', icon: Database },
    { label: 'Alerts', value: stats.alerts, color: 'text-warning', icon: Database },
    { label: 'Tasks', value: stats.tasks, color: 'text-success', icon: Database },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold glow-text flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" /> Admin Panel
          </h1>
          <p className="text-muted-foreground mt-1">System administration — sync assets, monitor data, AI predictions</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAll} disabled={refreshing} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(s => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center gap-3">
              <s.icon className={`h-6 w-6 ${s.color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold">{s.value.toLocaleString()}</p>
                {s.expected !== undefined && (
                  <p className="text-[10px] text-muted-foreground">
                    Expected: {s.expected} {s.value === s.expected ? <CheckCircle2 className="inline h-3 w-3 text-success" /> : <AlertTriangle className="inline h-3 w-3 text-warning" />}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* System Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" /> System Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button onClick={syncAssets} disabled={syncing} className="gap-2">
              {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Sync Dataset Assets to DB ({allAssets.length} assets)
            </Button>
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">System Data Policy — Fresh Start Active</p>
                <p>Old alerts, predictions, sensor readings, and tasks have been cleared. New data is being saved from this point onwards.</p>
                <p>• <strong>Sensor readings</strong> persist automatically when viewing Real-Time Monitoring.</p>
                <p>• <strong>Alerts</strong> are generated from dataset loop and saved to DB every 3 seconds.</p>
                <p>• <strong>Tasks</strong> are created manually via the Maintenance Planner using dataset asset IDs.</p>
                <p>• <strong>AI Predictions</strong> are saved when running predictions on the Predictive Analytics page.</p>
                <p>• All modules use the Solar & Wind Master Datasets exclusively — {allAssets.length} assets ({allAssets.filter(a => a.type === 'solar').length} solar, {allAssets.filter(a => a.type === 'wind').length} wind).</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Display Name</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.user_id.slice(0, 8)}...</TableCell>
                  <TableCell>{p.display_name || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* AI Model Predictions Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" /> Recent AI Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {predictions.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.asset_id}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{p.prediction_type}</Badge></TableCell>
                  <TableCell>{p.confidence ? `${(p.confidence * 100).toFixed(0)}%` : '-'}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{p.model_used || '-'}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{new Date(p.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {predictions.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-4">No predictions yet — run predictions from Predictive Analytics</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
