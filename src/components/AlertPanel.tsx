import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/types/sensor';
import { AlertTriangle, AlertCircle, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AlertPanelProps {
  alerts: Alert[];
}

export function AlertPanel({ alerts }: AlertPanelProps) {
  const getSeverityIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return XCircle;
      case 'high': return AlertCircle;
      case 'medium': return AlertTriangle;
      default: return Info;
    }
  };

  const getSeverityStyle = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return 'border-destructive/30 bg-destructive/5';
      case 'high': return 'border-destructive/20 bg-destructive/5';
      case 'medium': return 'border-warning/20 bg-warning/5';
      default: return 'border-primary/20 bg-primary/5';
    }
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': case 'high': return 'text-destructive';
      case 'medium': return 'text-warning';
      default: return 'text-primary';
    }
  };

  return (
    <Card className="p-5 bg-card border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Active Alerts</h3>
        <Badge variant={alerts.length > 0 ? 'destructive' : 'secondary'} className="text-[10px] h-5">
          {alerts.length}
        </Badge>
      </div>

      <div className="space-y-2 max-h-[350px] overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <Info className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">No active alerts</p>
          </div>
        ) : (
          <AnimatePresence>
            {alerts.map((alert, i) => {
              const Icon = getSeverityIcon(alert.severity);
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  className={cn('p-3 rounded-lg border transition-all', getSeverityStyle(alert.severity))}
                >
                  <div className="flex items-start gap-2.5">
                    <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', getSeverityColor(alert.severity))} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {alert.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs font-medium leading-relaxed">{alert.message}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </Card>
  );
}
