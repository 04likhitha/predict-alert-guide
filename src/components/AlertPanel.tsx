import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/types/sensor';
import { AlertTriangle, AlertCircle, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertPanelProps {
  alerts: Alert[];
}

export function AlertPanel({ alerts }: AlertPanelProps) {
  const getSeverityIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return XCircle;
      case 'high':
        return AlertCircle;
      case 'medium':
        return AlertTriangle;
      default:
        return Info;
    }
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'border-destructive/50 bg-destructive/5 text-destructive';
      case 'high':
        return 'border-destructive/30 bg-destructive/5 text-destructive';
      case 'medium':
        return 'border-warning/50 bg-warning/5 text-warning';
      default:
        return 'border-primary/50 bg-primary/5 text-primary';
    }
  };

  const getBadgeVariant = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="card-glow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Active Alerts</h3>
        <Badge variant={alerts.length > 0 ? 'destructive' : 'secondary'}>
          {alerts.length} Alert{alerts.length !== 1 ? 's' : ''}
        </Badge>
      </div>
      
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Info className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No active alerts</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const Icon = getSeverityIcon(alert.severity);
            return (
              <div
                key={alert.id}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all duration-300',
                  getSeverityColor(alert.severity),
                  alert.severity === 'critical' && 'animate-pulse-glow'
                )}
              >
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <Badge variant={getBadgeVariant(alert.severity)} className="text-xs">
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {alert.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{alert.message}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
