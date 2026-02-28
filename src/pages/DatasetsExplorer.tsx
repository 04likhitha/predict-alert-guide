import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { solarDataset, solarDatasetMeta } from '@/data/solarDataset';
import { windDataset, windDatasetMeta } from '@/data/windDataset';
import { motion } from 'framer-motion';
import { Search, Download, ArrowUpDown, ChevronLeft, ChevronRight, Database, Sun, Wind, Filter } from 'lucide-react';

export default function DatasetsExplorer() {
  const [tab, setTab] = useState('solar');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('timestamp');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const perPage = 15;

  const dataset = tab === 'solar' ? solarDataset : windDataset;
  const meta = tab === 'solar' ? solarDatasetMeta : windDatasetMeta;

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

  const columns = tab === 'solar'
    ? ['timestamp', 'asset_id', 'capacity_mw', 'irradiance', 'module_temp', 'power_output', 'efficiency', 'failure_type', 'rul_hours', 'confidence']
    : ['timestamp', 'asset_id', 'capacity_mw', 'wind_speed', 'rotor_speed', 'gearbox_temp', 'power_output', 'efficiency', 'failure_type', 'rul_hours'];

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
    setPage(1);
  };

  const exportCSV = () => {
    const headers = columns.join(',');
    const rows = filtered.map(row => columns.map(c => (row as any)[c]).join(','));
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${tab}_dataset.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-[1800px] mx-auto space-y-6 animate-fade-in">
      <div className="page-header">
        <h1>Datasets Explorer</h1>
        <p>Browse, search, filter, and export the platform's core datasets</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => { setTab(v); setPage(1); setSearch(''); }}>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <TabsList>
            <TabsTrigger value="solar" className="gap-2"><Sun className="h-3.5 w-3.5" /> Solar Dataset</TabsTrigger>
            <TabsTrigger value="wind" className="gap-2"><Wind className="h-3.5 w-3.5" /> Wind Dataset</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9 h-9 w-60 text-xs" />
            </div>
            <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2 text-xs">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Dataset Meta Card */}
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
                <span><strong className="text-foreground">{meta.rows}</strong> rows</span>
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
                      <th key={col} className="text-left p-3 font-semibold text-muted-foreground cursor-pointer hover:text-foreground transition-colors" onClick={() => toggleSort(col)}>
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
                      {columns.map(col => (
                        <td key={col} className="p-3">
                          {col === 'failure_type' ? (
                            <Badge variant={(row as any)[col] === 'normal' ? 'secondary' : 'destructive'} className="text-[10px] h-4">
                              {(row as any)[col]}
                            </Badge>
                          ) : col === 'confidence' ? (
                            <span className="font-medium">{((row as any)[col] * 100).toFixed(1)}%</span>
                          ) : typeof (row as any)[col] === 'number' ? (
                            <span className="font-mono">{(row as any)[col].toFixed(1)}</span>
                          ) : (
                            <span>{(row as any)[col]}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-3 border-t border-border/50 bg-muted/30">
              <span className="text-xs text-muted-foreground">
                Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} of {filtered.length}
              </span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="h-7 w-7 p-0">
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                  <Button key={p} variant={page === p ? 'default' : 'outline'} size="sm" onClick={() => setPage(p)} className="h-7 w-7 p-0 text-xs">{p}</Button>
                ))}
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="h-7 w-7 p-0">
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
