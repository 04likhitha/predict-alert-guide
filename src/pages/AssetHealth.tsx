import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { allAssets, getNextReading } from '@/utils/datasetStreamEngine';
import { SensorData } from '@/types/sensor';
import { useAIPrediction } from '@/hooks/useAIPrediction';
import { Heart, Activity, Thermometer, Zap, Wind, Sun, Brain, Loader2, Clock } from 'lucide-react';

export default function AssetHealth() {
  const [sensorMap, setSensorMap] = useState<Record<string, SensorData>>({});
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const { predict, loading: aiLoading, result: aiResult } = useAIPrediction();

  useEffect(() => {
    const interval = setInterval(() => {
      const newMap: Record<string, SensorData> = {};
      allAssets.forEach(a => {
        const d = getNextReading(a.id);
        if (d) newMap[a.id] = d;
      });
      setSensorMap(newMap);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getHealthScore = (d: SensorData) => {
    let score = 100;
    if (d.failureType !== 'normal') score -= 40;
    if (d.rulHours < 50) score -= 30;
    else if (d.rulHours < 150) score -= 15;
    if (d.confidence < 0.8) score -= 10;
    return Math.max(0, Math.min(100, score));
  };

  const getHealthColor = (score: number) => score >= 80 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-destructive';
  const getHealthBg = (score: number) => score >= 80 ? 'bg-success/10 border-success/30' : score >= 50 ? 'bg-warning/10 border-warning/30' : 'bg-destructive/10 border-destructive/30';

  const handleAIAnalysis = async (assetId: string) => {
    setSelectedAsset(assetId);
    const sensorData = sensorMap[assetId];
    if (sensorData) await predict('failure_prediction', sensorData, assetId);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold glow-text">Asset Health Cards</h1>
        <p className="text-muted-foreground mt-1">Health overview powered by master datasets with AI diagnostics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {allAssets.map(asset => {
          const data = sensorMap[asset.id];
          const health = data ? getHealthScore(data) : 100;
          const Icon = asset.type === 'wind' ? Wind : Sun;

          return (
            <Card key={asset.id} className={`border-2 transition-all hover:shadow-lg ${getHealthBg(health)}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{asset.name}</CardTitle>
                  </div>
                  <Badge variant={health >= 80 ? 'default' : health >= 50 ? 'secondary' : 'destructive'}>{asset.id}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <div className="relative inline-flex items-center justify-center">
                    <Heart className={`h-16 w-16 ${getHealthColor(health)} ${health < 50 ? 'animate-pulse' : ''}`} />
                    <span className={`absolute text-sm font-bold ${getHealthColor(health)}`}>{health}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Health Score</p>
                </div>

                {data && (
                  <>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1.5 p-2 rounded bg-card/50"><Zap className="h-3.5 w-3.5 text-chart-1" /><span className="text-muted-foreground">Power:</span><span className="font-medium ml-auto">{data.powerOutput.toFixed(0)} kW</span></div>
                      <div className="flex items-center gap-1.5 p-2 rounded bg-card/50"><Clock className="h-3.5 w-3.5 text-chart-2" /><span className="text-muted-foreground">RUL:</span><span className="font-medium ml-auto">{data.rulHours.toFixed(0)}h</span></div>
                      <div className="flex items-center gap-1.5 p-2 rounded bg-card/50"><Thermometer className="h-3.5 w-3.5 text-chart-3" /><span className="text-muted-foreground">Temp:</span><span className="font-medium ml-auto">{data.ambientTemp.toFixed(1)}°C</span></div>
                      <div className="flex items-center gap-1.5 p-2 rounded bg-card/50"><Activity className="h-3.5 w-3.5 text-chart-4" /><span className="text-muted-foreground">Conf:</span><span className="font-medium ml-auto">{(data.confidence * 100).toFixed(0)}%</span></div>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-card/50">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant={data.failureType === 'normal' ? 'default' : 'destructive'} className="text-xs">{data.failureType === 'normal' ? 'Normal' : data.failureType.replace('_', ' ').toUpperCase()}</Badge>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Remaining Life</span><span>{Math.min(100, (data.rulHours / 450) * 100).toFixed(0)}%</span></div>
                      <Progress value={Math.min(100, (data.rulHours / 450) * 100)} className="h-2" />
                    </div>
                  </>
                )}

                <Button onClick={() => handleAIAnalysis(asset.id)} disabled={aiLoading && selectedAsset === asset.id} className="w-full gap-2" variant="outline">
                  {aiLoading && selectedAsset === asset.id ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : <><Brain className="h-4 w-4" /> AI Diagnostics</>}
                </Button>

                {selectedAsset === asset.id && aiResult && (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm space-y-2">
                    <div className="flex items-center gap-2 font-medium text-primary"><Brain className="h-4 w-4" /> AI Analysis</div>
                    {aiResult.risk_level && <div className="flex justify-between"><span className="text-muted-foreground">Risk Level:</span><Badge variant={aiResult.risk_level === 'high' || aiResult.risk_level === 'critical' ? 'destructive' : 'default'}>{aiResult.risk_level}</Badge></div>}
                    {aiResult.probability !== undefined && <div className="flex justify-between"><span className="text-muted-foreground">Failure Probability:</span><span className="font-medium">{(aiResult.probability * 100).toFixed(1)}%</span></div>}
                    {aiResult.recommendations && <div><span className="text-muted-foreground text-xs">Recommendations:</span><ul className="list-disc pl-4 text-xs mt-1 space-y-0.5">{aiResult.recommendations.slice(0, 3).map((r: string, i: number) => <li key={i}>{r}</li>)}</ul></div>}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
