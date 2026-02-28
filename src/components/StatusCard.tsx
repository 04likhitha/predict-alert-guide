import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StatusCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'stable';
  status?: 'normal' | 'warning' | 'critical';
  gradient?: string;
  delay?: number;
}

export function StatusCard({ title, value, unit, icon: Icon, trend, status = 'normal', gradient, delay = 0 }: StatusCardProps) {
  const statusConfig = {
    normal: { border: 'border-border/50', iconBg: 'bg-primary/10', iconColor: 'text-primary', dot: 'bg-success' },
    warning: { border: 'border-warning/30', iconBg: 'bg-warning/10', iconColor: 'text-warning', dot: 'bg-warning' },
    critical: { border: 'border-destructive/30', iconBg: 'bg-destructive/10', iconColor: 'text-destructive', dot: 'bg-destructive' },
  };

  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.1, ease: "easeOut" }}
    >
      <Card className={cn(
        'metric-card bg-card border',
        config.border,
        gradient
      )}>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className={cn('p-2.5 rounded-xl', config.iconBg)}>
              <Icon className={cn('h-5 w-5', config.iconColor)} />
            </div>
            <div className="flex items-center gap-1.5">
              <div className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
              <span className="text-[11px] text-muted-foreground capitalize">{status}</span>
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1">{title}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight">{typeof value === 'number' ? value.toFixed(1) : value}</span>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
          {trend && (
            <p className={cn('text-[11px] mt-2 font-medium', {
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
      </Card>
    </motion.div>
  );
}
