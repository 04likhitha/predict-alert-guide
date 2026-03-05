import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { logActivity } from '@/utils/activityLogger';
import { motion } from 'framer-motion';
import { FileText, Download, Plus, Clock, CheckCircle2, Loader2, RotateCcw } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  const generatePDF = (title: string, data: { assets: any[]; tasks: any[]; alerts: any[]; readings: any[] }) => {
    const doc = new jsPDF();
    const now = new Date();

    doc.setFillColor(17, 24, 39);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('GreenTech GRIP', 15, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(title, 15, 28);
    doc.setFontSize(8);
    doc.text(`Generated: ${now.toLocaleString()}`, 15, 36);
    doc.text(`Report Period: Last 24 Hours`, 120, 36);

    let y = 55;

    doc.setTextColor(17, 24, 39);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', 15, y);
    y += 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const summaryLines = [
      `Total Assets Monitored: ${data.assets?.length || 0}`,
      `Active Maintenance Tasks: ${data.tasks?.length || 0}`,
      `Alerts Generated: ${data.alerts?.length || 0}`,
      `Sensor Readings Processed: ${data.readings?.length || 0}`,
    ];
    summaryLines.forEach(line => { doc.text(line, 15, y); y += 6; });
    y += 5;

    if (data.alerts && data.alerts.length > 0) {
      doc.setTextColor(17, 24, 39);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Alert Summary', 15, y);
      y += 3;

      autoTable(doc, {
        startY: y,
        head: [['Asset', 'Severity', 'Message', 'Resolved', 'Date']],
        body: data.alerts.slice(0, 15).map(a => [
          a.asset_id, a.severity, a.message?.slice(0, 50) || '',
          a.resolved ? 'Yes' : 'No', new Date(a.created_at).toLocaleDateString(),
        ]),
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246], fontSize: 8 },
        bodyStyles: { fontSize: 7 },
        margin: { left: 15, right: 15 },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    }

    if (data.readings && data.readings.length > 0) {
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setTextColor(17, 24, 39);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Performance Metrics', 15, y);
      y += 3;

      autoTable(doc, {
        startY: y,
        head: [['Asset', 'Type', 'Power (kW)', 'Failure Type', 'RUL (h)', 'Confidence']],
        body: data.readings.slice(0, 10).map((r: any) => [
          r.asset_id, r.asset_type, r.power_output?.toFixed(1) || '0',
          r.failure_type || 'normal', r.rul_hours?.toFixed(0) || '0',
          ((r.confidence || 0) * 100).toFixed(1) + '%',
        ]),
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129], fontSize: 8 },
        bodyStyles: { fontSize: 7 },
        margin: { left: 15, right: 15 },
      });
    }

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(`GreenTech Reliability Intelligence Platform — Page ${i} of ${pageCount}`, 15, 290);
    }

    return doc;
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const [{ data: assets }, { data: tasks }, { data: alerts }, { data: readings }] = await Promise.all([
        supabase.from('assets').select('*'),
        supabase.from('maintenance_tasks').select('*'),
        supabase.from('alerts_history').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('sensor_readings').select('*').order('created_at', { ascending: false }).limit(100),
      ]);

      const title = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report — ${new Date().toLocaleDateString()}`;
      const doc = generatePDF(title, { assets: assets || [], tasks: tasks || [], alerts: alerts || [], readings: readings || [] });
      doc.save(`${title.replace(/\s+/g, '_')}.pdf`);

      await supabase.from('reports').insert({
        title,
        report_type: reportType,
        generated_by: user?.id,
        status: 'completed',
        parameters: { assets_count: assets?.length, tasks_count: tasks?.length, alerts_count: alerts?.length, readings_count: readings?.length },
      });

      await logActivity('Generated report', 'report', reportType, { title });
      toast.success('PDF report generated, downloaded, and saved');
      fetchReports();
    } catch (e) {
      toast.error('Failed to generate report');
    }
    setGenerating(false);
  };

  const redownloadReport = async (report: any) => {
    try {
      const [{ data: assets }, { data: tasks }, { data: alerts }, { data: readings }] = await Promise.all([
        supabase.from('assets').select('*'),
        supabase.from('maintenance_tasks').select('*'),
        supabase.from('alerts_history').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('sensor_readings').select('*').order('created_at', { ascending: false }).limit(100),
      ]);
      const doc = generatePDF(report.title, { assets: assets || [], tasks: tasks || [], alerts: alerts || [], readings: readings || [] });
      doc.save(`${report.title.replace(/\s+/g, '_')}.pdf`);
      toast.success('Report re-downloaded');
    } catch {
      toast.error('Failed to re-download');
    }
  };

  const exportCSV = (report: any) => {
    const params = report.parameters || {};
    const csv = `Report,${report.title}\nType,${report.report_type}\nGenerated,${new Date(report.created_at).toLocaleString()}\nAssets,${params.assets_count || 0}\nTasks,${params.tasks_count || 0}\nAlerts,${params.alerts_count || 0}\nReadings,${params.readings_count || 0}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${report.title.replace(/\s+/g, '_')}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  return (
    <div className="p-6 max-w-[1800px] mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="page-header mb-0">
          <h1>Reports Center</h1>
          <p>Generate, save, and revisit professional PDF reports</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-40 h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="financial">Financial</SelectItem>
              <SelectItem value="sustainability">Sustainability</SelectItem>
              <SelectItem value="daily">Daily Summary</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generateReport} disabled={generating} size="sm" className="gap-2 text-xs">
            {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Generate Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-4 bg-card border border-border/50"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><FileText className="h-4 w-4 text-primary" /></div><div><p className="text-[11px] text-muted-foreground">Total Reports</p><p className="text-lg font-bold">{reports.length}</p></div></div></Card>
        <Card className="p-4 bg-card border border-border/50"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-success/10"><CheckCircle2 className="h-4 w-4 text-success" /></div><div><p className="text-[11px] text-muted-foreground">Completed</p><p className="text-lg font-bold">{reports.filter(r => r.status === 'completed').length}</p></div></div></Card>
        <Card className="p-4 bg-card border border-border/50"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-warning/10"><Clock className="h-4 w-4 text-warning" /></div><div><p className="text-[11px] text-muted-foreground">Last Generated</p><p className="text-lg font-bold text-sm">{reports.length > 0 ? new Date(reports[0].created_at).toLocaleDateString() : '—'}</p></div></div></Card>
      </div>

      <div className="space-y-2">
        {reports.map((report, i) => (
          <motion.div key={report.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className="p-3.5 bg-card border border-border/50">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0"><FileText className="h-4 w-4 text-primary" /></div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-semibold truncate">{report.title}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge variant="outline" className="text-[10px] h-4 capitalize">{report.report_type}</Badge>
                      <Badge variant={report.status === 'completed' ? 'default' : 'secondary'} className="text-[10px] h-4">{report.status}</Badge>
                      <span className="text-[10px] text-muted-foreground">{new Date(report.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => redownloadReport(report)} className="gap-1.5 h-7 text-[10px]">
                    <RotateCcw className="h-3 w-3" /> PDF
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => exportCSV(report)} className="gap-1.5 h-7 text-[10px]">
                    <Download className="h-3 w-3" /> CSV
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
        {reports.length === 0 && (
          <Card className="p-8 text-center border border-border/50">
            <FileText className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">No reports yet. Click "Generate Report" to create one.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
