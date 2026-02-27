import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { FileText, Download, Plus, Clock, CheckCircle2, Loader2 } from 'lucide-react';

export default function ReportsCenter() {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [reportType, setReportType] = useState('performance');
  const [generating, setGenerating] = useState(false);

  const fetchReports = async () => {
    const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
    if (data) setReports(data);
  };

  useEffect(() => { fetchReports(); }, []);

  const generateReport = async () => {
    setGenerating(true);

    // Fetch data for the report
    const [{ data: assets }, { data: tasks }, { data: alerts }, { data: readings }] = await Promise.all([
      supabase.from('assets').select('*'),
      supabase.from('maintenance_tasks').select('*'),
      supabase.from('alerts_history').select('*').limit(50),
      supabase.from('sensor_readings').select('*').limit(100),
    ]);

    // Create report record
    const { data: report, error } = await supabase.from('reports').insert({
      title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${new Date().toLocaleDateString()}`,
      report_type: reportType,
      generated_by: user?.id,
      status: 'completed',
      parameters: { assets_count: assets?.length, tasks_count: tasks?.length, alerts_count: alerts?.length, readings_count: readings?.length },
    }).select().single();

    if (error) {
      toast.error('Failed to generate report');
    } else {
      toast.success('Report generated successfully');
      fetchReports();
    }

    setGenerating(false);
  };

  const exportCSV = (report: any) => {
    const params = report.parameters || {};
    const csvContent = `Report: ${report.title}\nType: ${report.report_type}\nGenerated: ${new Date(report.created_at).toLocaleString()}\n\nAssets: ${params.assets_count || 0}\nTasks: ${params.tasks_count || 0}\nAlerts: ${params.alerts_count || 0}\nReadings: ${params.readings_count || 0}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported as CSV');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold glow-text">Reports Center</h1>
          <p className="text-muted-foreground mt-1">Generate and export analytical reports</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="financial">Financial</SelectItem>
              <SelectItem value="sustainability">Sustainability</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generateReport} disabled={generating} className="gap-2">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Generate Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><FileText className="h-6 w-6 text-primary" /><div><p className="text-xs text-muted-foreground">Total Reports</p><p className="text-xl font-bold">{reports.length}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><CheckCircle2 className="h-6 w-6 text-success" /><div><p className="text-xs text-muted-foreground">Completed</p><p className="text-xl font-bold">{reports.filter(r => r.status === 'completed').length}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><Clock className="h-6 w-6 text-chart-3" /><div><p className="text-xs text-muted-foreground">Last Generated</p><p className="text-xl font-bold">{reports.length > 0 ? new Date(reports[0].created_at).toLocaleDateString() : '-'}</p></div></div></Card>
      </div>

      <div className="space-y-3">
        {reports.map(report => (
          <Card key={report.id} className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-medium text-sm">{report.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs capitalize">{report.report_type}</Badge>
                    <Badge variant={report.status === 'completed' ? 'default' : 'secondary'} className="text-xs">{report.status}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(report.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => exportCSV(report)} className="gap-1">
                <Download className="h-3.5 w-3.5" /> CSV
              </Button>
            </div>
          </Card>
        ))}
        {reports.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No reports generated yet. Click "Generate Report" to create one.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
