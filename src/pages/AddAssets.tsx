import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Wind, Zap, Sun } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type AssetTypeOption = "wind" | "solar";

const AddAssets = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    assetName: "",
    assetType: "" as AssetTypeOption | "",
    location: "",
    capacity: "",
    installDate: "",
  });

  const assetIcons: Record<string, typeof Wind> = {
    wind: Wind,
    solar: Sun,
  };

  const assetLabels: Record<AssetTypeOption, string> = {
    wind: "Wind Turbine",
    solar: "Solar Panel",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.assetName || !formData.assetType || !formData.location) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate asset ID
      const assetId = `${formData.assetType === 'wind' ? 'WT' : 'SP'}_${Date.now()}`;

      const { error } = await supabase.from("assets").insert({
        asset_id: assetId,
        name: formData.assetName,
        asset_type: formData.assetType,
        location: formData.location,
        capacity: formData.capacity ? parseFloat(formData.capacity) : null,
        installation_date: formData.installDate || null,
      });

      if (error) throw error;

      toast({
        title: "Asset Added Successfully",
        description: `${assetLabels[formData.assetType]} "${formData.assetName}" has been registered in the system.`,
      });

      // Reset form
      setFormData({
        assetName: "",
        assetType: "",
        location: "",
        capacity: "",
        installDate: "",
      });

      // Navigate to assets page after 1 second
      setTimeout(() => navigate("/assets"), 1000);
    } catch (error: any) {
      console.error("Error adding asset:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add asset. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent">
            Add New Asset
          </h1>
          <p className="text-muted-foreground mt-2">
            Register new renewable energy assets for monitoring
          </p>
        </div>

        {/* Asset Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(assetIcons) as AssetTypeOption[]).map((type) => {
            const Icon = assetIcons[type];
            const isSelected = formData.assetType === type;
            
            return (
              <Card
                key={type}
                className={`p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                  isSelected
                    ? "ring-2 ring-primary bg-primary/5"
                    : "hover:bg-accent/50"
                }`}
                onClick={() => setFormData({ ...formData, assetType: type })}
              >
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className={`p-3 rounded-full ${
                    isSelected 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-accent"
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold">{assetLabels[type]}</h3>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Form */}
        <Card className="p-6 backdrop-blur-sm bg-card/50 border-border/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="assetName">
                  Asset Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="assetName"
                  placeholder="e.g., Turbine-A1"
                  value={formData.assetName}
                  onChange={(e) =>
                    setFormData({ ...formData, assetName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assetType">
                  Asset Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.assetType}
                  onValueChange={(value: AssetTypeOption) =>
                    setFormData({ ...formData, assetType: value })
                  }
                >
                  <SelectTrigger id="assetType">
                    <SelectValue placeholder="Select asset type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wind">Wind Turbine</SelectItem>
                    <SelectItem value="solar">Solar Panel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">
                  Location <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="location"
                  placeholder="e.g., Site A, Grid 5"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (MW)</Label>
                <Input
                  id="capacity"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 2.5"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="installDate">Installation Date</Label>
                <Input
                  id="installDate"
                  type="date"
                  value={formData.installDate}
                  onChange={(e) =>
                    setFormData({ ...formData, installDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setFormData({
                    assetName: "",
                    assetType: "",
                    location: "",
                    capacity: "",
                    installDate: "",
                  })
                }
              >
                Reset
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-primary to-chart-3 hover:opacity-90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add Asset"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AddAssets;
