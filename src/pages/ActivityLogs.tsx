import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ClipboardList, User, Clock } from 'lucide-react';

export default function ActivityLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(100);
      if (data) setLogs(data);
      setLoading(false);
    };
    fetchLogs();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold glow-text">Activity Logs</h1>
        <p className="text-muted-foreground mt-1">Track all user actions and system events</p>
      </div>

      <div className="space-y-2">
        {logs.map(log => (
          <Card key={log.id} className="p-3">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{log.action}</span>
                  <Badge variant="outline" className="text-xs">{log.entity_type}</Badge>
                  {log.entity_id && <span className="text-xs text-muted-foreground">{log.entity_id}</span>}
                </div>
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
