import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Upload, FileText, X, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { logActivity } from '@/utils/activityLogger';

interface TimeSeriesRecord {
  timestamp: string;
  [key: string]: string | number;
}

interface AddAssetDialogProps {
  onAssetAdded: () => void;
}

export default function AddAssetDialog({ onAssetAdded }: AddAssetDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<TimeSeriesRecord[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    assetId: '',
    assetName: '',
    assetType: '' as 'wind' | 'solar' | '',
    capacityMw: '',
    locationLat: '',
    locationLon: '',
    status: 'Healthy' as 'Healthy' | 'Warning' | 'Critical',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.assetId.trim()) errs.assetId = 'Asset ID is required';
    if (!form.assetName.trim()) errs.assetName = 'Asset Name is required';
    if (!form.assetType) errs.assetType = 'Asset Type is required';
    if (!form.capacityMw || parseFloat(form.capacityMw) <= 0) errs.capacityMw = 'Capacity must be a positive number';
    if (!form.locationLat.trim()) errs.locationLat = 'Latitude is required';
    if (!form.locationLon.trim()) errs.locationLon = 'Longitude is required';
    const lat = parseFloat(form.locationLat);
    const lon = parseFloat(form.locationLon);
    if (isNaN(lat) || lat < -90 || lat > 90) errs.locationLat = 'Invalid latitude (-90 to 90)';
    if (isNaN(lon) || lon < -180 || lon > 180) errs.locationLon = 'Invalid longitude (-180 to 180)';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.trim().split('\n');
      if (lines.length < 2) return;
      const headers = lines[0].split(',').map(h => h.trim());
      const preview = lines.slice(1, 6).map(line => {
        const values = line.split(',');
        const record: TimeSeriesRecord = { timestamp: '' };
        headers.forEach((h, i) => {
          const val = values[i]?.trim() || '';
          record[h] = isNaN(Number(val)) ? val : Number(val);
        });
        return record;
      });
      setCsvPreview(preview);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);

    try {
      const location = `${form.locationLat}, ${form.locationLon}`;

      const { error } = await supabase.from('assets').insert({
        asset_id: form.assetId.trim(),
        name: form.assetName.trim(),
        asset_type: form.assetType as 'wind' | 'solar',
        capacity: parseFloat(form.capacityMw),
        location,
      });

      if (error) throw error;

      // If CSV file was uploaded, parse and insert time-series data as sensor readings
      if (csvFile) {
        const text = await csvFile.text();
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        const readings = lines.slice(1).map(line => {
          const vals = line.split(',').map(v => v.trim());
          const row: Record<string, any> = {};
          headers.forEach((h, i) => { row[h] = vals[i]; });

          return {
            asset_id: form.assetId.trim(),
            asset_type: form.assetType,
            power_output: parseFloat(row.power_output) || 0,
            ambient_temp: parseFloat(row.ambient_temperature) || 0,
            humidity: parseFloat(row.humidity) || 0,
            wind_speed: form.assetType === 'wind' ? (parseFloat(row.wind_speed) || null) : null,
            rotor_speed: form.assetType === 'wind' ? (parseFloat(row.rotor_speed) || null) : null,
            gearbox_temp: form.assetType === 'wind' ? (parseFloat(row.gearbox_temperature) || null) : null,
            panel_voltage: form.assetType === 'solar' ? (parseFloat(row.voltage) || null) : null,
            panel_current: form.assetType === 'solar' ? (parseFloat(row.current) || null) : null,
            module_temp: form.assetType === 'solar' ? (parseFloat(row.panel_temperature) || null) : null,
            irradiance: form.assetType === 'solar' ? (parseFloat(row.irradiance) || null) : null,
            failure_type: row.failure_type || 'normal',
            rul_hours: parseFloat(row.remaining_useful_life_hours) || 450,
            confidence: parseFloat(row.confidence_score) || 0.85,
          };
        }).filter(r => !isNaN(r.power_output));

        // Insert in batches of 500
        for (let i = 0; i < readings.length; i += 500) {
          const batch = readings.slice(i, i + 500);
          await supabase.from('sensor_readings').insert(batch);
        }
      }

      await logActivity('create', 'asset', form.assetId, { name: form.assetName, type: form.assetType });

      toast({ title: 'Asset Added', description: `${form.assetName} (${form.assetId}) has been registered.` });
      setForm({ assetId: '', assetName: '', assetType: '', capacityMw: '', locationLat: '', locationLon: '', status: 'Healthy' });
      setCsvFile(null);
      setCsvPreview([]);
      setOpen(false);
      onAssetAdded();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to add asset', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Asset
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New Asset</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Asset Type Selection */}
          <div className="grid grid-cols-2 gap-3">
            {(['solar', 'wind'] as const).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setForm(f => ({ ...f, assetType: type }))}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  form.assetType === type
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <span className="text-2xl">{type === 'solar' ? '☀️' : '💨'}</span>
                <p className="font-medium mt-1 capitalize">{type} Asset</p>
              </button>
            ))}
          </div>
          {errors.assetType && <p className="text-sm text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.assetType}</p>}

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Asset ID <span className="text-destructive">*</span></Label>
              <Input placeholder="e.g., SOL005" value={form.assetId} onChange={e => setForm(f => ({ ...f, assetId: e.target.value }))} />
              {errors.assetId && <p className="text-xs text-destructive">{errors.assetId}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Asset Name <span className="text-destructive">*</span></Label>
              <Input placeholder="e.g., SolarFarm Alpha" value={form.assetName} onChange={e => setForm(f => ({ ...f, assetName: e.target.value }))} />
              {errors.assetName && <p className="text-xs text-destructive">{errors.assetName}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Capacity (MW) <span className="text-destructive">*</span></Label>
              <Input type="number" step="0.1" min="0" placeholder="e.g., 2.5" value={form.capacityMw} onChange={e => setForm(f => ({ ...f, capacityMw: e.target.value }))} />
              {errors.capacityMw && <p className="text-xs text-destructive">{errors.capacityMw}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v: 'Healthy' | 'Warning' | 'Critical') => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Healthy">🟢 Healthy</SelectItem>
                  <SelectItem value="Warning">🟡 Warning</SelectItem>
                  <SelectItem value="Critical">🔴 Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Latitude <span className="text-destructive">*</span></Label>
              <Input type="number" step="any" placeholder="e.g., 34.05" value={form.locationLat} onChange={e => setForm(f => ({ ...f, locationLat: e.target.value }))} />
              {errors.locationLat && <p className="text-xs text-destructive">{errors.locationLat}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Longitude <span className="text-destructive">*</span></Label>
              <Input type="number" step="any" placeholder="e.g., -118.24" value={form.locationLon} onChange={e => setForm(f => ({ ...f, locationLon: e.target.value }))} />
              {errors.locationLon && <p className="text-xs text-destructive">{errors.locationLon}</p>}
            </div>
          </div>

          {/* CSV Upload */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Time-Series Data (Optional CSV Upload)</Label>
            <div
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
              {csvFile ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="font-medium">{csvFile.name}</span>
                  <Badge variant="secondary">{csvPreview.length > 0 ? `${csvPreview.length}+ rows` : 'Loaded'}</Badge>
                  <button onClick={(e) => { e.stopPropagation(); setCsvFile(null); setCsvPreview([]); }}>
                    <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload CSV with time-series data</p>
                  <p className="text-xs text-muted-foreground">Columns: timestamp, power_output, voltage, current, humidity, etc.</p>
                </div>
              )}
            </div>

            {csvPreview.length > 0 && (
              <div className="rounded-lg border overflow-hidden">
                <div className="bg-muted px-3 py-1.5 text-xs font-medium">CSV Preview (first 5 rows)</div>
                <div className="overflow-x-auto text-xs">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        {Object.keys(csvPreview[0]).slice(0, 6).map(k => (
                          <th key={k} className="px-2 py-1 text-left font-medium">{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.map((row, i) => (
                        <tr key={i} className="border-b last:border-0">
                          {Object.values(row).slice(0, 6).map((v, j) => (
                            <td key={j} className="px-2 py-1 text-muted-foreground">{String(v)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Adding…' : 'Add Asset'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
