import { useState, useEffect } from 'react';
import { Wind, Sun, Activity, Zap, Thermometer, Droplets, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { generateSensorData } from '@/utils/sensorSimulator';
import { SensorData } from '@/types/sensor';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function Assets() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [windAssets, setWindAssets] = useState<string[]>([]);
  const [solarAssets, setSolarAssets] = useState<string[]>([]);
  const [windData, setWindData] = useState<Record<string, SensorData>>({});
  const [solarData, setSolarData] = useState<Record<string, SensorData>>({});
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; assetId: string; assetName: string }>({
    open: false,
    assetId: '',
    assetName: '',
  });

  // Fetch assets from database
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const { data, error } = await supabase
          .from('assets')
          .select('asset_id, asset_type');

        if (error) throw error;

        const wind = data?.filter(a => a.asset_type === 'wind').map(a => a.asset_id) || [];
        const solar = data?.filter(a => a.asset_type === 'solar').map(a => a.asset_id) || [];

        setWindAssets(wind);
        setSolarAssets(solar);
      } catch (error: any) {
        console.error('Error fetching assets:', error);
        toast({
          title: "Error",
          description: "Failed to load assets",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('assets-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assets' }, () => {
        fetchAssets();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  // Generate sensor data for assets
  useEffect(() => {
    const updateData = () => {
      const newWindData: Record<string, SensorData> = {};
      windAssets.forEach(id => {
        const data = generateSensorData('wind');
        newWindData[id] = { ...data, assetId: id };
      });

      const newSolarData: Record<string, SensorData> = {};
      solarAssets.forEach(id => {
        const data = generateSensorData('solar');
        newSolarData[id] = { ...data, assetId: id };
      });

      setWindData(newWindData);
      setSolarData(newSolarData);
    };

    if (!loading && (windAssets.length > 0 || solarAssets.length > 0)) {
      updateData();
      const interval = setInterval(updateData, 5000);
      return () => clearInterval(interval);
    }
  }, [windAssets, solarAssets, loading]);

  const getStatusColor = (failureType: string, rulHours: number) => {
    if (failureType === 'normal' && rulHours > 200) return 'bg-success/20 text-success border-success/30';
    if (failureType === 'normal') return 'bg-warning/20 text-warning border-warning/30';
    if (rulHours < 20) return 'bg-destructive/20 text-destructive border-destructive/30';
    return 'bg-warning/20 text-warning border-warning/30';
  };

  const getStatusText = (failureType: string, rulHours: number) => {
    if (failureType === 'normal' && rulHours > 200) return 'Healthy';
    if (failureType === 'normal') return 'Maintenance Soon';
    if (rulHours < 20) return 'Critical';
    return 'Warning';
  };

  const handleDeleteClick = (assetId: string) => {
    setDeleteDialog({ open: true, assetId, assetName: assetId });
  };

  const handleDeleteConfirm = async () => {
    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('asset_id', deleteDialog.assetId);

      if (error) throw error;

      toast({
        title: "Asset Deleted",
        description: `${deleteDialog.assetName} has been removed from the system.`,
      });

      setDeleteDialog({ open: false, assetId: '', assetName: '' });
    } catch (error: any) {
      console.error('Error deleting asset:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete asset. Please try again.",
        variant: "destructive",
      });
    }
  };

  const AssetCard = ({ data, icon: Icon }: { data: SensorData; icon: any }) => (
    <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{data.assetId}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColor(data.failureType, data.rulHours)}`}>
              {getStatusText(data.failureType, data.rulHours)}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => handleDeleteClick(data.assetId)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 rounded-md bg-accent/50">
            <Zap className="h-4 w-4 text-chart-1" />
            <div>
              <p className="text-xs text-muted-foreground">Power</p>
              <p className="text-sm font-semibold">{data.powerOutput.toFixed(1)} kW</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 rounded-md bg-accent/50">
            <Activity className="h-4 w-4 text-chart-2" />
            <div>
              <p className="text-xs text-muted-foreground">RUL</p>
              <p className="text-sm font-semibold">{data.rulHours.toFixed(0)} hrs</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-md bg-accent/50">
            <Thermometer className="h-4 w-4 text-chart-3" />
            <div>
              <p className="text-xs text-muted-foreground">Temp</p>
              <p className="text-sm font-semibold">{data.ambientTemp.toFixed(1)}°C</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-md bg-accent/50">
            <Droplets className="h-4 w-4 text-chart-4" />
            <div>
              <p className="text-xs text-muted-foreground">Humidity</p>
              <p className="text-sm font-semibold">{data.humidity.toFixed(0)}%</p>
            </div>
          </div>
        </div>

        {data.assetType === 'wind' && (
          <div className="pt-2 border-t border-border/50 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Wind Speed:</span>
              <span className="font-medium">{data.windSpeed?.toFixed(1)} m/s</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Rotor Speed:</span>
              <span className="font-medium">{data.rotorSpeed?.toFixed(1)} rpm</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Gearbox Temp:</span>
              <span className="font-medium">{data.gearboxTemp?.toFixed(1)}°C</span>
            </div>
          </div>
        )}

        {data.assetType === 'solar' && (
          <div className="pt-2 border-t border-border/50 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Voltage:</span>
              <span className="font-medium">{data.panelVoltage?.toFixed(1)} V</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current:</span>
              <span className="font-medium">{data.panelCurrent?.toFixed(2)} A</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Module Temp:</span>
              <span className="font-medium">{data.moduleTemp?.toFixed(1)}°C</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Irradiance:</span>
              <span className="font-medium">{data.irradiance?.toFixed(0)} W/m²</span>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-border/50">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Confidence:</span>
            <span className="text-xs font-medium">{(data.confidence * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-1.5 mt-1">
            <div 
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${data.confidence * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading assets...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Asset Management</h1>
          <p className="text-muted-foreground">Monitor all renewable energy assets and their real-time status</p>
        </div>
        <Button 
          onClick={() => navigate('/add-assets')}
          className="bg-gradient-to-r from-primary to-chart-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Asset
        </Button>
      </div>

      <Tabs defaultValue="wind" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="wind" className="flex items-center gap-2">
            <Wind className="h-4 w-4" />
            Wind Turbines
          </TabsTrigger>
          <TabsTrigger value="solar" className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            Solar Panels
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wind" className="mt-6">
          {windAssets.length === 0 ? (
            <Card className="p-12 text-center">
              <Wind className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No wind turbines added yet</p>
              <Button onClick={() => navigate('/add-assets')} variant="outline">
                Add Your First Wind Turbine
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {windAssets.map(id => (
                windData[id] && <AssetCard key={id} data={windData[id]} icon={Wind} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="solar" className="mt-6">
          {solarAssets.length === 0 ? (
            <Card className="p-12 text-center">
              <Sun className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No solar panels added yet</p>
              <Button onClick={() => navigate('/add-assets')} variant="outline">
                Add Your First Solar Panel
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {solarAssets.map(id => (
                solarData[id] && <AssetCard key={id} data={solarData[id]} icon={Sun} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Asset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold">{deleteDialog.assetName}</span>? 
              This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
