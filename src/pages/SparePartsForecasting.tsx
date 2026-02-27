import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Package, AlertTriangle, Plus, TrendingDown, Box } from 'lucide-react';

export default function SparePartsForecasting() {
  const [parts, setParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', part_number: '', category: '', compatible_asset_type: 'both', quantity_in_stock: '0', reorder_level: '5', unit_cost: '0', supplier: '', lead_time_days: '' });

  const fetchParts = async () => {
    const { data } = await supabase.from('spare_parts').select('*').order('name');
    if (data) setParts(data);
    setLoading(false);
  };

  useEffect(() => { fetchParts(); }, []);

  const addPart = async () => {
    if (!form.name || !form.part_number || !form.category) {
      toast.error('Name, part number, and category required');
      return;
    }
    const { error } = await supabase.from('spare_parts').insert({
      ...form,
      quantity_in_stock: parseInt(form.quantity_in_stock),
      reorder_level: parseInt(form.reorder_level),
      unit_cost: parseFloat(form.unit_cost),
      lead_time_days: form.lead_time_days ? parseInt(form.lead_time_days) : null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success('Part added');
    setDialogOpen(false);
    fetchParts();
  };

  const lowStockParts = parts.filter(p => p.quantity_in_stock <= p.reorder_level);
  const totalValue = parts.reduce((acc, p) => acc + (p.quantity_in_stock * p.unit_cost), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold glow-text">Spare Parts Forecasting</h1>
          <p className="text-muted-foreground mt-1">Inventory management and demand forecasting</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Part</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Spare Part</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Part name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Part number *" value={form.part_number} onChange={e => setForm({ ...form, part_number: e.target.value })} />
              <Input placeholder="Category *" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
              <Select value={form.compatible_asset_type} onValueChange={v => setForm({ ...form, compatible_asset_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="wind">Wind</SelectItem>
                  <SelectItem value="solar">Solar</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" placeholder="Qty in stock" value={form.quantity_in_stock} onChange={e => setForm({ ...form, quantity_in_stock: e.target.value })} />
                <Input type="number" placeholder="Reorder level" value={form.reorder_level} onChange={e => setForm({ ...form, reorder_level: e.target.value })} />
                <Input type="number" placeholder="Unit cost ($)" value={form.unit_cost} onChange={e => setForm({ ...form, unit_cost: e.target.value })} />
                <Input type="number" placeholder="Lead time (days)" value={form.lead_time_days} onChange={e => setForm({ ...form, lead_time_days: e.target.value })} />
              </div>
              <Input placeholder="Supplier" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} />
              <Button onClick={addPart} className="w-full">Add Part</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><Box className="h-8 w-8 text-primary" /><div><p className="text-xs text-muted-foreground">Total Parts</p><p className="text-2xl font-bold">{parts.length}</p></div></div></Card>
        <Card className="p-4 border-warning/30"><div className="flex items-center gap-3"><TrendingDown className="h-8 w-8 text-warning" /><div><p className="text-xs text-muted-foreground">Low Stock</p><p className="text-2xl font-bold text-warning">{lowStockParts.length}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><Package className="h-8 w-8 text-chart-2" /><div><p className="text-xs text-muted-foreground">Total Items</p><p className="text-2xl font-bold">{parts.reduce((a, p) => a + p.quantity_in_stock, 0)}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><Package className="h-8 w-8 text-success" /><div><p className="text-xs text-muted-foreground">Inventory Value</p><p className="text-2xl font-bold">${totalValue.toLocaleString()}</p></div></div></Card>
      </div>

      {lowStockParts.length > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" /> Low Stock Alert</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStockParts.map(p => (
                <Badge key={p.id} variant="outline" className="border-warning/30 text-warning">
                  {p.name}: {p.quantity_in_stock}/{p.reorder_level}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Part #</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Reorder</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parts.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">{p.part_number}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{p.compatible_asset_type}</Badge></TableCell>
                  <TableCell className="text-right">{p.quantity_in_stock}</TableCell>
                  <TableCell className="text-right">{p.reorder_level}</TableCell>
                  <TableCell className="text-right">${p.unit_cost}</TableCell>
                  <TableCell className="text-muted-foreground">{p.supplier || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={p.quantity_in_stock <= p.reorder_level ? 'destructive' : 'default'} className="text-xs">
                      {p.quantity_in_stock <= p.reorder_level ? 'Low' : 'OK'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {parts.length === 0 && <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No parts in inventory</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
