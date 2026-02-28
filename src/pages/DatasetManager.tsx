import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { solarDatasetMeta, solarAssets } from '@/data/solarDataset';
import { windDatasetMeta, windAssets } from '@/data/windDataset';
import { motion } from 'framer-motion';
import { HardDrive, Upload, Download, Trash2, Eye, Sun, Wind, Database, Calendar, Rows3, Columns3, Tag } from 'lucide-react';
import { toast } from 'sonner';

const builtInDatasets = [
  { ...solarDatasetMeta, id: 'solar', type: 'solar' as const, icon: Sun, assets: solarAssets, status: 'active' as const },
  { ...windDatasetMeta, id: 'wind', type: 'wind' as const, icon: Wind, assets: windAssets, status: 'active' as const },
];

export default function DatasetManager() {
  const [datasets] = useState(builtInDatasets);

  return (
    <div className="p-6 max-w-[1800px] mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="page-header mb-0">
          <h1>Dataset Asset Manager</h1>
          <p>Manage, preview, and configure datasets used across the platform</p>
        </div>
        <Button size="sm" className="gap-2 text-xs" onClick={() => toast.info('Upload functionality coming soon - datasets are loaded from the provided solar and wind master files')}>
          <Upload className="h-3.5 w-3.5" /> Upload Dataset
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/15"><Database className="h-4 w-4 text-primary" /></div>
            <div><p className="text-[11px] text-muted-foreground">Total Datasets</p><p className="text-lg font-bold">{datasets.length}</p></div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/15"><Rows3 className="h-4 w-4 text-success" /></div>
            <div><p className="text-[11px] text-muted-foreground">Total Records</p><p className="text-lg font-bold">{datasets.reduce((s, d) => s + d.rows, 0).toLocaleString()}</p></div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary/15"><HardDrive className="h-4 w-4 text-secondary" /></div>
            <div><p className="text-[11px] text-muted-foreground">Active Assets</p><p className="text-lg font-bold">{datasets.reduce((s, d) => s + d.assets.length, 0)}</p></div>
          </div>
        </Card>
      </div>

      {/* Dataset Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {datasets.map((ds, i) => {
          const Icon = ds.icon;
          return (
            <motion.div key={ds.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="p-5 bg-card border border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${ds.type === 'solar' ? 'bg-warning/10' : 'bg-primary/10'}`}>
                      <Icon className={`h-5 w-5 ${ds.type === 'solar' ? 'text-warning' : 'text-primary'}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold">{ds.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{ds.description.slice(0, 80)}...</p>
                    </div>
                  </div>
                  <Badge variant="default" className="text-[10px] h-5 bg-success/10 text-success border-0">{ds.status}</Badge>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-xs">
                    <Rows3 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Rows:</span>
                    <span className="font-semibold">{ds.rows}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Columns3 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Columns:</span>
                    <span className="font-semibold">{ds.columns}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Range:</span>
                    <span className="font-semibold">{ds.dateRange}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Updated:</span>
                    <span className="font-semibold">{ds.lastUpdated}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {ds.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-[10px] h-5 gap-1">
                      <Tag className="h-2.5 w-2.5" /> {tag}
                    </Badge>
                  ))}
                </div>

                {/* Assets Preview */}
                <div className="p-3 rounded-lg bg-muted/50 mb-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Assets ({ds.assets.length})</p>
                  <div className="space-y-1.5">
                    {ds.assets.map(asset => (
                      <div key={asset.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-mono">{asset.id}</Badge>
                          <span>{asset.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{asset.capacity_mw} MW</span>
                          <div className={`w-1.5 h-1.5 rounded-full ${asset.status === 'operational' ? 'bg-success' : asset.status === 'warning' ? 'bg-warning' : 'bg-destructive'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs flex-1 gap-1.5" onClick={() => window.location.href = '/datasets-explorer'}>
                    <Eye className="h-3 w-3" /> View Data
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs gap-1.5">
                    <Download className="h-3 w-3" /> Export
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
