import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SensorData, Recommendation } from '@/types/sensor';
import { Activity, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PredictionPanelProps {
  data: SensorData;
  recommendation: Recommendation;
}

export function PredictionPanel({ data, recommendation }: PredictionPanelProps) {
  const isHealthy = data.failureType === 'normal';
  const rulPercentage = Math.min((data.rulHours / 450) * 100, 100);

  const getFailureLabel = (type: string) => {
    const labels: Record<string, string> = {
      normal: 'Normal Operation',
      inverter_failure: 'Inverter Failure',
      gearbox_failure: 'Gearbox Failure',
      panel_hotspot: 'Panel Hotspot',
      generator_failure: 'Generator Failure',
    };
    return labels[type] || type;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="space-y-4"
    >
      <Card className={cn(
        'p-5 border bg-card transition-all duration-300',
        isHealthy ? 'border-success/20' : 'border-destructive/20'
      )}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            {isHealthy ? (
              <div className="p-2 rounded-xl bg-success/10">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold">Prediction Status</h3>
              <p className="text-[11px] text-muted-foreground">AI Model Inference</p>
            </div>
          </div>
          <Badge variant={isHealthy ? 'default' : 'destructive'} className="text-[10px] h-5">
            {(data.confidence * 100).toFixed(1)}%
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Failure Type</span>
            <span className={cn('text-xs font-semibold', isHealthy ? 'text-success' : 'text-destructive')}>
              {getFailureLabel(data.failureType)}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> RUL
              </span>
              <span className="text-xs font-semibold">{Math.round(data.rulHours)}h</span>
            </div>
            <Progress value={rulPercentage} className="h-1.5" />
            <p className="text-[10px] text-muted-foreground mt-1">
              {data.rulHours < 50 && 'Critical: Immediate action required'}
              {data.rulHours >= 50 && data.rulHours < 150 && 'Warning: Schedule maintenance soon'}
              {data.rulHours >= 150 && 'Good: Normal operating range'}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-5 bg-card border border-border/50">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">AI Recommendation</h3>
            <p className="text-[11px] text-muted-foreground">Diagnosis & Solution</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Problem</span>
            <p className="text-xs mt-1 p-2.5 rounded-lg bg-muted/50 leading-relaxed">{recommendation.problem}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Action</span>
            <p className="text-xs mt-1 p-2.5 rounded-lg bg-primary/5 border border-primary/10 leading-relaxed">{recommendation.solution}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
