import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useSensorHistory(assetId?: string, limit = 100) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      let query = supabase
        .from('sensor_readings')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (assetId) query = query.eq('asset_id', assetId);

      const { data: readings, error } = await query;
      if (!error && readings) setData(readings.reverse());
      setLoading(false);
    };

    fetch();

    // Realtime subscription
    const channel = supabase
      .channel('sensor-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'sensor_readings',
        ...(assetId ? { filter: `asset_id=eq.${assetId}` } : {}),
      }, (payload) => {
        setData(prev => [...prev, payload.new].slice(-limit));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [assetId, limit]);

  return { data, loading };
}
