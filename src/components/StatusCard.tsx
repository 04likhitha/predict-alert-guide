import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'stable';
  status?: 'normal' | 'warning' | 'critical';
}

export function StatusCard({ title, value, unit, icon: Icon, trend, status = 'normal' }: StatusCardProps) {
  const statusColors = {
    normal: 'border-success/50 bg-success/5',
    warning: 'border-warning/50 bg-warning/5',
    critical: 'border-destructive/50 bg-destructive/5',
  };

  const iconColors = {
    normal: 'text-success',
    warning: 'text-warning',
    critical: 'text-destructive',
  };

  return (
    <Card className={cn('card-glow p-6 border-2 transition-all duration-300', statusColors[status])}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{typeof value === 'number' ? value.toFixed(1) : value}</span>
            {unit && <span className="text-lg text-muted-foreground">{unit}</span>}
          </div>
          {trend && (
            <p className={cn('text-xs', {
              'text-success': trend === 'up',
              'text-destructive': trend === 'down',
              'text-muted-foreground': trend === 'stable',
            })}>
              {trend === 'up' && '↑ Increasing'}
              {trend === 'down' && '↓ Decreasing'}
              {trend === 'stable' && '→ Stable'}
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-lg bg-card/50', iconColors[status])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
}
