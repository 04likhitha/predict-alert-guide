import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { allAssets, getNextReading } from '@/utils/datasetStreamEngine';
import { useAIPrediction } from '@/hooks/useAIPrediction';
import { SensorData } from '@/types/sensor';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Brain, TrendingUp, AlertTriangle, Loader2, Activity, Target, Gauge } from 'lucide-react';

export default function PredictiveAnalytics() {
  const [selectedAsset, setSelectedAsset] = useState(allAssets[0]?.id || '');
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const { predict, loading, result } = useAIPrediction();
  const [failureResult, setFailureResult] = useState<any>(null);
  const [rulResult, setRulResult] = useState<any>(null);
  const [anomalyResult, setAnomalyResult] = useState<any>(null);

  useEffect(() => {
    if (!selectedAsset) return;
    const d = getNextReading(selectedAsset);
    if (d) setSensorData(d);
  }, [selectedAsset]);

  const runFailurePrediction = async () => { if (sensorData) { const r = await predict('failure_prediction', sensorData, selectedAsset); if (r) setFailureResult(r); } };
  const runRULPrediction = async () => { if (sensorData) { const r = await predict('rul_prediction', sensorData, selectedAsset); if (r) setRulResult(r); } };
  const runAnomalyDetection = async () => { if (sensorData) { const r = await predict('anomaly_detection', sensorData, selectedAsset); if (r) setAnomalyResult(r); } };

  const featureImportanceData = failureResult?.feature_importance
    ? Object.entries(failureResult.feature_importance).map(([name, value]) => ({ name: name.replace(/_/g, ' '), importance: Number(value) }))
    : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold glow-text">Predictive Analytics</h1>
          <p className="text-muted-foreground mt-1">AI-powered predictions from master dataset readings</p>
        </div>
        <Select value={selectedAsset} onValueChange={setSelectedAsset}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Select asset" /></SelectTrigger>
          <SelectContent>{allAssets.map(a => <SelectItem key={a.id} value={a.id}>{a.name} ({a.id})</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="failure" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="failure" className="gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Failure</TabsTrigger>
          <TabsTrigger value="rul" className="gap-1"><TrendingUp className="h-3.5 w-3.5" /> RUL</TabsTrigger>
          <TabsTrigger value="anomaly" className="gap-1"><Activity className="h-3.5 w-3.5" /> Anomaly</TabsTrigger>
        </TabsList>

        <TabsContent value="failure" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-primary" /> Failure Prediction</CardTitle>
                <Button onClick={runFailurePrediction} disabled={loading} className="gap-2">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />} Run Prediction</Button>
              </div>
            </CardHeader>
            <CardContent>
              {failureResult ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-card border">
                      <div className="flex justify-between items-center mb-2"><span className="text-sm text-muted-foreground">Failure Type</span><Badge variant={failureResult.failure_type === 'normal' ? 'default' : 'destructive'}>{(failureResult.failure_type || 'unknown').replace(/_/g, ' ').toUpperCase()}</Badge></div>
                      <div className="flex justify-between items-center mb-2"><span className="text-sm text-muted-foreground">Probability</span><span className="font-bold">{((failureResult.probability || 0) * 100).toFixed(1)}%</span></div>
                      <div className="flex justify-between items-center mb-2"><span className="text-sm text-muted-foreground">Confidence</span><span className="font-bold">{((failureResult.confidence || 0) * 100).toFixed(1)}%</span></div>
                      <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Risk Level</span><Badge variant={failureResult.risk_level === 'critical' || failureResult.risk_level === 'high' ? 'destructive' : 'default'}>{failureResult.risk_level || 'unknown'}</Badge></div>
                    </div>
                    {failureResult.recommendations && (
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <h4 className="font-medium mb-2 text-sm">AI Recommendations</h4>
                        <ul className="space-y-1.5">{failureResult.recommendations.map((r: string, i: number) => <li key={i} className="text-sm text-muted-foreground flex gap-2"><span className="text-primary">•</span>{r}</li>)}</ul>
                      </div>
                    )}
                  </div>
                  {featureImportanceData.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 text-sm">Feature Importance</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={featureImportanceData} layout="vertical">
                          <XAxis type="number" domain={[0, 1]} />
                          <YAxis type="category" dataKey="name" width={120} style={{ fontSize: '11px' }} />
                          <Tooltip />
                          <Bar dataKey="importance" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              ) : <p className="text-center text-muted-foreground py-8">Click "Run Prediction" to analyze the current dataset reading</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rul" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Gauge className="h-5 w-5 text-chart-2" /> RUL Prediction</CardTitle>
                <Button onClick={runRULPrediction} disabled={loading} className="gap-2">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />} Estimate RUL</Button>
              </div>
            </CardHeader>
            <CardContent>
              {rulResult ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 border-2 border-primary/30 bg-primary/5"><p className="text-sm text-muted-foreground">Remaining Useful Life</p><p className="text-4xl font-bold text-primary">{rulResult.rul_hours || 0}h</p></Card>
                  <Card className="p-4 border-2 border-chart-3/30 bg-chart-3/5"><p className="text-sm text-muted-foreground">Degradation Rate</p><p className="text-4xl font-bold text-chart-3">{rulResult.degradation_rate || 0}%/day</p></Card>
                  <Card className="p-4 border-2 border-success/30 bg-success/5"><p className="text-sm text-muted-foreground">Confidence</p><p className="text-4xl font-bold text-success">{((rulResult.confidence || 0) * 100).toFixed(0)}%</p></Card>
                  {rulResult.contributing_factors && <div className="col-span-full p-4 rounded-lg bg-card border"><h4 className="font-medium mb-2">Contributing Factors</h4><div className="flex flex-wrap gap-2">{rulResult.contributing_factors.map((f: string, i: number) => <Badge key={i} variant="outline">{f}</Badge>)}</div></div>}
                </div>
              ) : <p className="text-center text-muted-foreground py-8">Click "Estimate RUL" to predict remaining useful life</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anomaly" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-destructive" /> Anomaly Detection</CardTitle>
                <Button onClick={runAnomalyDetection} disabled={loading} className="gap-2" variant="destructive">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />} Detect Anomalies</Button>
              </div>
            </CardHeader>
            <CardContent>
              {anomalyResult ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Badge variant={anomalyResult.is_anomaly ? 'destructive' : 'default'} className="text-lg py-1 px-4">{anomalyResult.is_anomaly ? '⚠ ANOMALY DETECTED' : '✓ NO ANOMALY'}</Badge>
                    <span className="text-muted-foreground">Score: {((anomalyResult.anomaly_score || 0) * 100).toFixed(1)}%</span>
                  </div>
                  {anomalyResult.anomalies?.length > 0 && (
                    <div className="space-y-2">{anomalyResult.anomalies.map((a: any, i: number) => (
                      <div key={i} className="p-3 rounded border bg-destructive/5 border-destructive/20">
                        <div className="flex justify-between"><span className="font-medium">{a.parameter}</span><Badge variant="destructive">{a.severity}</Badge></div>
                        <p className="text-sm text-muted-foreground mt-1">Value: {a.value} | Expected: {a.expected_range}</p>
                      </div>
                    ))}</div>
                  )}
                  {anomalyResult.root_cause && <div className="p-3 rounded bg-warning/5 border border-warning/20"><p className="text-sm"><strong>Root Cause:</strong> {anomalyResult.root_cause}</p></div>}
                </div>
              ) : <p className="text-center text-muted-foreground py-8">Click "Detect Anomalies" to scan dataset readings</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
