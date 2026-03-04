import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from 'sonner';
import { Shield, Users, Brain, Settings2, Database } from 'lucide-react';

export default function AdminPanel() {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [stats, setStats] = useState({ assets: 0, readings: 0, alerts: 0, tasks: 0 });

  useEffect(() => {
    const fetchAll = async () => {
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
    };
    fetchAll();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold glow-text flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" /> Admin Panel
        </h1>
        <p className="text-muted-foreground mt-1">System administration, user management & AI model monitoring</p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><Database className="h-6 w-6 text-primary" /><div><p className="text-xs text-muted-foreground">Assets</p><p className="text-xl font-bold">{stats.assets}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><Database className="h-6 w-6 text-chart-2" /><div><p className="text-xs text-muted-foreground">Sensor Readings</p><p className="text-xl font-bold">{stats.readings.toLocaleString()}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><Database className="h-6 w-6 text-warning" /><div><p className="text-xs text-muted-foreground">Alerts</p><p className="text-xl font-bold">{stats.alerts}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><Database className="h-6 w-6 text-success" /><div><p className="text-xs text-muted-foreground">Tasks</p><p className="text-xl font-bold">{stats.tasks}</p></div></div></Card>
      </div>

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
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-4">No predictions yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
