import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ClipboardList, RefreshCw, Loader2 } from 'lucide-react';

export default function ActivityLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(200);
    if (data) setLogs(data);
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const actionColors: Record<string, string> = {
    'Created maintenance task': 'bg-primary/10 text-primary',
    'Task status changed': 'bg-warning/10 text-warning',
    'Added spare part': 'bg-success/10 text-success',
    'Generated report': 'bg-chart-2/10 text-chart-2',
    'User signed in': 'bg-primary/10 text-primary',
    'User signed up': 'bg-success/10 text-success',
    'Alert generated': 'bg-destructive/10 text-destructive',
    'Ran AI prediction': 'bg-chart-3/10 text-chart-3',
  };

  const getActionColor = (action: string) => {
    for (const [key, color] of Object.entries(actionColors)) {
      if (action.toLowerCase().includes(key.toLowerCase())) return color;
    }
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold glow-text">Activity Logs</h1>
          <p className="text-muted-foreground mt-1">Track all user actions and system events</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {loading && <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>}

      <div className="space-y-2">
        {logs.map(log => (
          <Card key={log.id} className="p-3">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`text-xs ${getActionColor(log.action)}`}>{log.action}</Badge>
                  <Badge variant="outline" className="text-xs">{log.entity_type}</Badge>
                  {log.entity_id && <span className="text-xs text-muted-foreground font-mono">{log.entity_id}</span>}
                </div>
                {log.details && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {Object.entries(log.details as Record<string, any>).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                  </p>
                )}
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0">{new Date(log.created_at).toLocaleString()}</span>
            </div>
          </Card>
        ))}
        {logs.length === 0 && !loading && (
          <Card className="p-8 text-center text-muted-foreground">
            <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No activity logs yet. Actions will be recorded as users interact with the system.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
