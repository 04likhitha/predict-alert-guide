import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { solarDataset, solarDatasetMeta } from '@/data/solarDataset';
import { windDataset, windDatasetMeta } from '@/data/windDataset';
import { motion } from 'framer-motion';
import { Search, Download, ArrowUpDown, ChevronLeft, ChevronRight, Database, Sun, Wind } from 'lucide-react';

export default function DatasetsExplorer() {
  const [tab, setTab] = useState('solar');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('timestamp');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const perPage = 25;

  const dataset = tab === 'solar' ? solarDataset : windDataset;
  const meta = tab === 'solar' ? solarDatasetMeta : windDatasetMeta;

  const solarColumns = [
    'timestamp', 'asset_id', 'asset_name', 'capacity_mw', 'voltage', 'current',
    'power_output', 'irradiance', 'humidity', 'ambient_temperature', 'panel_temperature',
    'vibration', 'failure_type', 'failure_probability', 'confidence_score',
    'remaining_useful_life_hours', 'efficiency_percent', 'alert_level',
    'daily_cost', 'daily_revenue', 'roi_percent', 'carbon_saved_kg', 'energy_generated_kwh'
  ];

  const windColumns = [
    'timestamp', 'asset_id', 'asset_name', 'capacity_mw', 'voltage', 'current',
    'power_output', 'rotor_speed', 'gearbox_temperature', 'wind_speed',
    'humidity', 'ambient_temperature', 'vibration', 'failure_type', 'failure_probability',
    'confidence_score', 'remaining_useful_life_hours', 'efficiency_percent', 'alert_level',
    'daily_cost', 'daily_revenue', 'roi_percent', 'carbon_saved_kg', 'energy_generated_kwh'
  ];

  const columns = tab === 'solar' ? solarColumns : windColumns;

  const filtered = useMemo(() => {
    let data = [...dataset];
    if (search) {
      const s = search.toLowerCase();
      data = data.filter(row => Object.values(row).some(v => String(v).toLowerCase().includes(s)));
    }
    data.sort((a: any, b: any) => {
      const av = a[sortField], bv = b[sortField];
      if (typeof av === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return data;
  }, [dataset, search, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
    setPage(1);
  };

  const exportCSV = () => {
    const allCols = tab === 'solar' ? Object.keys(solarDataset[0] || {}) : Object.keys(windDataset[0] || {});
    const headers = allCols.join(',');
    const rows = filtered.map(row => allCols.map(c => (row as any)[c]).join(','));
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${tab}_master_dataset.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // Pagination range
  const getPageRange = () => {
    const maxVisible = 7;
    if (totalPages <= maxVisible) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const start = Math.max(1, page - 3);
    const end = Math.min(totalPages, start + maxVisible - 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className="p-6 max-w-[1800px] mx-auto space-y-6 animate-fade-in">
      <div className="page-header">
        <h1>Datasets Explorer</h1>
        <p>Browse, search, filter, and export all {solarDataset.length + windDataset.length} records from the platform's master datasets</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => { setTab(v); setPage(1); setSearch(''); }}>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <TabsList>
            <TabsTrigger value="solar" className="gap-2"><Sun className="h-3.5 w-3.5" /> Solar Dataset ({solarDataset.length} rows)</TabsTrigger>
            <TabsTrigger value="wind" className="gap-2"><Wind className="h-3.5 w-3.5" /> Wind Dataset ({windDataset.length} rows)</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search all fields..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9 h-9 w-60 text-xs" />
            </div>
            <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2 text-xs">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-4 mb-4 bg-card border border-border/50">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold">{meta.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{meta.description}</p>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span><strong className="text-foreground">{meta.rows.toLocaleString()}</strong> rows</span>
                <span><strong className="text-foreground">{meta.columns}</strong> columns</span>
                <span>{meta.dateRange}</span>
              </div>
              <div className="flex gap-1.5">
                {meta.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-[10px] h-5">{tag}</Badge>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        <TabsContent value={tab} className="mt-0">
          <Card className="border border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/50 border-b border-border/50">
                    {columns.map(col => (
                      <th key={col} className="text-left p-3 font-semibold text-muted-foreground cursor-pointer hover:text-foreground transition-colors whitespace-nowrap" onClick={() => toggleSort(col)}>
                        <div className="flex items-center gap-1">
                          {col.replace(/_/g, ' ')}
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((row, i) => (
                    <tr key={i} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                      {columns.map(col => {
                        const val = (row as any)[col];
                        return (
                          <td key={col} className="p-3 whitespace-nowrap">
                            {col === 'failure_type' ? (
                              <Badge variant={String(val).toLowerCase() === 'normal' ? 'secondary' : 'destructive'} className="text-[10px] h-4">
                                {val}
                              </Badge>
                            ) : col === 'alert_level' ? (
                              <Badge variant={String(val).toLowerCase() === 'low' ? 'secondary' : String(val).toLowerCase() === 'high' ? 'destructive' : 'outline'} className="text-[10px] h-4">
                                {val}
                              </Badge>
                            ) : col === 'confidence_score' || col === 'failure_probability' ? (
                              <span className="font-medium">{(Number(val) * 100).toFixed(1)}%</span>
                            ) : typeof val === 'number' ? (
                              <span className="font-mono">{val.toFixed(2)}</span>
                            ) : (
                              <span>{val}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between p-3 border-t border-border/50 bg-muted/30">
              <span className="text-xs text-muted-foreground">
                Showing {((page - 1) * perPage + 1).toLocaleString()}-{Math.min(page * perPage, filtered.length).toLocaleString()} of {filtered.length.toLocaleString()}
              </span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(1)} className="h-7 px-2 text-xs">First</Button>
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="h-7 w-7 p-0">
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                {getPageRange().map(p => (
                  <Button key={p} variant={page === p ? 'default' : 'outline'} size="sm" onClick={() => setPage(p)} className="h-7 w-7 p-0 text-xs">{p}</Button>
                ))}
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="h-7 w-7 p-0">
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(totalPages)} className="h-7 px-2 text-xs">Last</Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
