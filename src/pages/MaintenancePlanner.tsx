import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { logActivity } from '@/utils/activityLogger';
import { Calendar, Plus, Clock, Wrench, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { allAssets } from '@/utils/datasetStreamEngine';

const TASK_TYPES = ['Preventive Maintenance', 'Corrective Maintenance', 'Inspection', 'Calibration', 'Replacement', 'Emergency Repair'];
const TEAMS = ['Maintenance Team A', 'Maintenance Team B', 'Electrical Team', 'Mechanical Team', 'Solar Team', 'Wind Team'];

export default function MaintenancePlanner() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', asset_id: '', priority: 'medium',
    scheduled_date: '', estimated_hours: '', cost_estimate: '',
    notes: '',
  });

  const fetchTasks = async () => {
    const { data } = await supabase.from('maintenance_tasks').select('*').order('created_at', { ascending: false });
    if (data) setTasks(data);
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  const addTask = async () => {
    if (!form.title || !form.asset_id) { toast.error('Task name and asset are required'); return; }
    const insertData: any = {
      title: form.title,
      description: form.description || null,
      asset_id: form.asset_id,
      priority: form.priority,
      scheduled_date: form.scheduled_date || null,
      estimated_hours: form.estimated_hours ? parseFloat(form.estimated_hours) : null,
      cost_estimate: form.cost_estimate ? parseFloat(form.cost_estimate) : null,
      notes: form.notes || null,
      created_by: user?.id,
    };
    const { error } = await supabase.from('maintenance_tasks').insert(insertData);
    if (error) { toast.error(error.message); return; }
    toast.success('Task created successfully');
    await logActivity('Created maintenance task', 'maintenance_task', form.asset_id, { title: form.title, priority: form.priority });
    setDialogOpen(false);
    setForm({ title: '', description: '', asset_id: '', priority: 'medium', scheduled_date: '', estimated_hours: '', cost_estimate: '', notes: '' });
    fetchTasks();
  };

  const updateStatus = async (id: string, status: string) => {
    const updates: any = { status };
    if (status === 'completed') updates.completed_date = new Date().toISOString().split('T')[0];
    await supabase.from('maintenance_tasks').update(updates).eq('id', id);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    toast.success(`Task ${status}`);
    await logActivity(`Task status changed to ${status}`, 'maintenance_task', id);
  };

  const priorityColors: Record<string, string> = { low: 'bg-success/10 text-success border-success/30', medium: 'bg-warning/10 text-warning border-warning/30', high: 'bg-destructive/10 text-destructive border-destructive/30', critical: 'bg-destructive/20 text-destructive border-destructive/50' };
  const statusIcons: Record<string, any> = { pending: Clock, scheduled: Calendar, in_progress: Wrench, completed: CheckCircle2, cancelled: AlertTriangle };
  const counts = { pending: tasks.filter(t => t.status === 'pending').length, scheduled: tasks.filter(t => t.status === 'scheduled').length, in_progress: tasks.filter(t => t.status === 'in_progress').length, completed: tasks.filter(t => t.status === 'completed').length };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-3xl font-bold glow-text">Maintenance Planner</h1><p className="text-muted-foreground mt-1">Schedule and manage maintenance tasks for all assets</p></div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Add New Task</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Add New Maintenance Task</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-xs">Task Name *</Label>
                <Input placeholder="e.g. Turbine Blade Inspection" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Asset *</Label>
                <Select value={form.asset_id} onValueChange={v => setForm({ ...form, asset_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select asset" /></SelectTrigger>
                  <SelectContent>
                    {allAssets.map(a => <SelectItem key={a.id} value={a.id}>{a.name} ({a.id})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Priority</Label>
                  <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Scheduled Date</Label>
                  <Input type="date" value={form.scheduled_date} onChange={e => setForm({ ...form, scheduled_date: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Estimated Hours</Label>
                  <Input type="number" placeholder="e.g. 4" value={form.estimated_hours} onChange={e => setForm({ ...form, estimated_hours: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Estimated Cost ($)</Label>
                  <Input type="number" placeholder="e.g. 1500" value={form.cost_estimate} onChange={e => setForm({ ...form, cost_estimate: e.target.value })} />
                </div>
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Textarea placeholder="Describe the maintenance activity..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Notes</Label>
                <Input placeholder="Additional notes (e.g. assigned team)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
              <Button onClick={addTask} className="w-full">Create Task</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(counts).map(([status, count]) => {
          const Icon = statusIcons[status];
          return (
            <Card key={status} className={`p-4 cursor-pointer ${filter === status ? 'ring-2 ring-primary' : ''}`} onClick={() => setFilter(filter === status ? 'all' : status)}>
              <div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground capitalize">{status.replace('_', ' ')}</p><p className="text-2xl font-bold">{count}</p></div><Icon className="h-5 w-5 text-muted-foreground" /></div>
            </Card>
          );
        })}
      </div>

      <div className="space-y-3">
        {loading && <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>}
        {filtered.map(task => {
          const Icon = statusIcons[task.status] || Clock;
          return (
            <Card key={task.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <Icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <h3 className="font-medium">{task.title}</h3>
                    {task.description && <p className="text-sm text-muted-foreground mt-0.5">{task.description}</p>}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">{task.asset_id}</Badge>
                      <Badge className={`text-xs ${priorityColors[task.priority]}`}>{task.priority}</Badge>
                      {task.scheduled_date && <Badge variant="secondary" className="text-xs gap-1"><Calendar className="h-3 w-3" />{task.scheduled_date}</Badge>}
                      {task.estimated_hours && <Badge variant="secondary" className="text-xs">{task.estimated_hours}h est.</Badge>}
                      {task.cost_estimate && <Badge variant="secondary" className="text-xs">${task.cost_estimate}</Badge>}
                      {task.notes && <Badge variant="secondary" className="text-xs">{task.notes}</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {task.status === 'pending' && <Button size="sm" variant="outline" onClick={() => updateStatus(task.id, 'scheduled')}>Schedule</Button>}
                  {task.status === 'scheduled' && <Button size="sm" onClick={() => updateStatus(task.id, 'in_progress')}>Start</Button>}
                  {task.status === 'in_progress' && <Button size="sm" className="bg-success hover:bg-success/90" onClick={() => updateStatus(task.id, 'completed')}>Complete</Button>}
                </div>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && !loading && <Card className="p-8 text-center text-muted-foreground">No tasks found. Click "Add New Task" to schedule maintenance.</Card>}
      </div>
    </div>
  );
}
