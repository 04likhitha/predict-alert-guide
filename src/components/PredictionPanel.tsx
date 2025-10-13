import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SensorData, Recommendation } from '@/types/sensor';
import { Activity, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-destructive';
      case 'medium':
        return 'text-warning';
      default:
        return 'text-success';
    }
  };

  return (
    <div className="space-y-6">
      {/* Prediction Status */}
      <Card className={cn(
        'card-glow p-6 border-2 transition-all duration-300',
        isHealthy ? 'border-success/50 bg-success/5' : 'border-destructive/50 bg-destructive/5'
      )}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {isHealthy ? (
              <CheckCircle2 className="w-8 h-8 text-success" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-destructive" />
            )}
            <div>
              <h3 className="text-lg font-semibold">Prediction Status</h3>
              <p className="text-sm text-muted-foreground">ML Model Inference</p>
            </div>
          </div>
          <Badge variant={isHealthy ? 'default' : 'destructive'} className="text-xs">
            {(data.confidence * 100).toFixed(1)}% Confidence
          </Badge>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Failure Type</span>
              <span className={cn('text-sm font-bold', isHealthy ? 'text-success' : 'text-destructive')}>
                {getFailureLabel(data.failureType)}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Remaining Useful Life (RUL)
              </span>
              <span className="text-sm font-bold">{Math.round(data.rulHours)}h</span>
            </div>
            <Progress 
              value={rulPercentage} 
              className={cn(
                'h-2',
                data.rulHours < 50 && 'bg-destructive/20',
                data.rulHours >= 50 && data.rulHours < 150 && 'bg-warning/20'
              )}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {data.rulHours < 50 && 'Critical: Immediate action required'}
              {data.rulHours >= 50 && data.rulHours < 150 && 'Warning: Schedule maintenance soon'}
              {data.rulHours >= 150 && 'Good: Within normal operating range'}
            </p>
          </div>
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="card-glow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-primary" />
          <div>
            <h3 className="text-lg font-semibold">Diagnosis & Solution</h3>
            <p className="text-sm text-muted-foreground">AI-Powered Recommendations</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Problem Analysis</span>
              <Badge className={getPriorityColor(recommendation.priority)}>
                {recommendation.priority.toUpperCase()} Priority
              </Badge>
            </div>
            <p className="text-sm leading-relaxed bg-muted/30 p-3 rounded-lg">
              {recommendation.problem}
            </p>
          </div>

          <div>
            <span className="text-sm font-medium text-muted-foreground block mb-2">
              Recommended Actions
            </span>
            <p className="text-sm leading-relaxed bg-primary/10 p-3 rounded-lg border border-primary/20">
              {recommendation.solution}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
