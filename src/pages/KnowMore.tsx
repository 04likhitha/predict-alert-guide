import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Heart, Radio, Brain, TrendingUp, Zap, DollarSign, Leaf,
  Wrench, Package, Bell, FileText, ClipboardList, Shield, HardDrive, Search,
  Settings, Info, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const sections = [
  {
    icon: LayoutDashboard, title: "Dashboard", path: "/", color: "primary",
    description: "Central command center with real-time KPIs, live sensor metrics, power output charts, efficiency trends, active alerts, and AI-powered failure predictions for all assets."
  },
  {
    icon: Heart, title: "Asset Health", path: "/asset-health", color: "success",
    description: "Comprehensive health monitoring for each asset with health scores, degradation trends, failure probability indicators, and maintenance urgency assessments."
  },
  {
    icon: Radio, title: "Real-Time Monitoring", path: "/monitoring", color: "primary",
    description: "Live IoT sensor data streaming every 2 seconds showing wind speed, rotor speed, gearbox temperature, solar irradiance, panel voltage, and more."
  },
  {
    icon: Brain, title: "Predictive Analytics", path: "/predictive-analytics", color: "chart-4",
    description: "AI-driven failure prediction using Random Forest classification, Remaining Useful Life estimation, confidence scores, and feature importance explainability."
  },
  {
    icon: TrendingUp, title: "Historical Trends", path: "/historical-trends", color: "success",
    description: "Time-series analysis of sensor readings, performance patterns, seasonal variations, and anomaly detection across the full dataset history."
  },
  {
    icon: Zap, title: "Energy Production", path: "/energy-production", color: "warning",
    description: "Track energy generation across all assets with production forecasts, capacity utilization, peak output analysis, and production vs. target comparisons."
  },
  {
    icon: DollarSign, title: "Financial Analytics", path: "/financial-analytics", color: "success",
    description: "Revenue tracking, cost analysis, ROI calculations, maintenance cost optimization, and financial forecasting for the entire asset portfolio."
  },
  {
    icon: Leaf, title: "Sustainability", path: "/sustainability", color: "success",
    description: "Carbon offset calculations, CO₂ savings tracking, environmental impact metrics, and sustainability reporting aligned with ESG standards."
  },
  {
    icon: Wrench, title: "Maintenance Planner", path: "/maintenance-planner", color: "warning",
    description: "Schedule and track maintenance tasks, assign technicians, monitor task progress, estimate costs, and optimize maintenance windows."
  },
  {
    icon: Package, title: "Spare Parts", path: "/spare-parts", color: "chart-4",
    description: "Inventory management for replacement components with stock levels, reorder alerts, lead times, and cost tracking per part category."
  },
  {
    icon: Bell, title: "Alerts Center", path: "/alerts-center", color: "destructive",
    description: "Centralized alert management with severity-based filtering, acknowledgment tracking, resolution workflows, and full session-persistent alert history."
  },
  {
    icon: HardDrive, title: "Dataset Manager", path: "/dataset-manager", color: "primary",
    description: "Upload, validate, and manage dataset assets. Each dataset displays metadata, row/column counts, tags, and is available across all analytics modules."
  },
  {
    icon: Search, title: "Datasets Explorer", path: "/datasets-explorer", color: "primary",
    description: "Browse platform datasets in a modern data table with search, filtering, column sorting, pagination, and CSV export capabilities."
  },
  {
    icon: FileText, title: "Reports Center", path: "/reports", color: "primary",
    description: "Generate professional PDF reports covering 24-hour platform activity including alerts, analytics, performance metrics, and AI insights."
  },
  {
    icon: ClipboardList, title: "Activity Logs", path: "/activity-logs", color: "muted-foreground",
    description: "Complete audit trail of all user actions, system events, data modifications, and platform interactions for compliance and debugging."
  },
  {
    icon: Shield, title: "Admin Panel", path: "/admin", color: "destructive",
    description: "Role-based user management (Admin, Operator, Technician), system configuration, model management, and platform-wide settings."
  },
];

export default function KnowMore() {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-[1800px] mx-auto space-y-8 animate-fade-in">
      <div className="page-header">
        <h1>Know More</h1>
        <p>Understand the GreenTech Reliability Intelligence Platform and explore every feature</p>
      </div>

      {/* Platform Overview */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/15">
              <Info className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold mb-2">About the Platform</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                The <strong className="text-foreground">GreenTech Reliability Intelligence Platform (GRIP)</strong> is a research-grade, enterprise-class SaaS application for predictive maintenance and operational intelligence in renewable energy systems. It integrates real-time IoT sensor data from wind turbines and solar farms with AI-powered failure prediction, remaining useful life estimation, and automated anomaly detection.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                The platform processes data from <strong className="text-foreground">5 wind farm assets</strong> and <strong className="text-foreground">5 solar farm assets</strong>, each with comprehensive sensor readings including environmental conditions, operational parameters, and machine health indicators. The AI engine provides failure type classification, confidence-scored predictions, and actionable maintenance recommendations.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Key capabilities include role-based access control (Admin, Operator, Technician), dark/light theme support, responsive design, real-time streaming with 2-second update intervals, PDF report generation, session-persistent alert tracking, and comprehensive data exploration tools.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Feature Cards Grid */}
      <div>
        <h2 className="text-lg font-bold mb-4">Platform Sections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sections.map((section, i) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card
                  className="p-4 bg-card border border-border/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
                  onClick={() => navigate(section.path)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">{section.title}</h3>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{section.description}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Tech Stack */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="p-5 bg-card border border-border/50">
          <h2 className="text-sm font-bold mb-3">Technology Stack</h2>
          <div className="flex flex-wrap gap-2">
            {['React 18', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Recharts', 'Lovable Cloud', 'Lovable AI', 'Shadcn/UI', 'React Router', 'TanStack Query', 'jsPDF'].map(tech => (
              <Badge key={tech} variant="secondary" className="text-[10px] h-5">{tech}</Badge>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
