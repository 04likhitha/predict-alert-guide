import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type PredictionType = 'failure_prediction' | 'rul_prediction' | 'anomaly_detection' | 'maintenance_recommendation';

export function useAIPrediction() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const predict = async (type: PredictionType, sensorData: any, assetId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-predict', {
        body: { type, sensorData, assetId },
      });

      if (error) throw error;
      setResult(data);
      return data;
    } catch (err: any) {
      const msg = err?.message || 'AI prediction failed';
      if (msg.includes('Rate limit')) {
        toast.error('AI rate limit reached. Please wait a moment.');
      } else if (msg.includes('credits')) {
        toast.error('AI credits exhausted. Please add credits in Settings → Workspace → Usage.');
      } else {
        toast.error(msg);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { predict, loading, result };
}
