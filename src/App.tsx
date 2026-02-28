import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "next-themes";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Assets from "./pages/Assets";
import Alerts from "./pages/Alerts";
import AddAssets from "./pages/AddAssets";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AssetHealth from "./pages/AssetHealth";
import RealTimeMonitoring from "./pages/RealTimeMonitoring";
import PredictiveAnalytics from "./pages/PredictiveAnalytics";
import MaintenancePlanner from "./pages/MaintenancePlanner";
import SparePartsForecasting from "./pages/SparePartsForecasting";
import FinancialAnalytics from "./pages/FinancialAnalytics";
import EnergyProduction from "./pages/EnergyProduction";
import Sustainability from "./pages/Sustainability";
import AlertsCenter from "./pages/AlertsCenter";
import HistoricalTrends from "./pages/HistoricalTrends";
import ReportsCenter from "./pages/ReportsCenter";
import ActivityLogs from "./pages/ActivityLogs";
import AdminPanel from "./pages/AdminPanel";
import DatasetsExplorer from "./pages/DatasetsExplorer";
import DatasetManager from "./pages/DatasetManager";
import KnowMore from "./pages/KnowMore";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <SidebarProvider>
                      <div className="flex min-h-screen w-full">
                        <AppSidebar />
                        <SidebarInset className="flex-1 bg-background">
                          <header className="sticky top-0 z-20 flex h-12 items-center gap-3 border-b border-border/50 bg-background/80 backdrop-blur-xl px-4">
                            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
                            <div className="h-4 w-px bg-border" />
                            <span className="text-sm font-medium text-foreground/80">GreenTech GRIP</span>
                          </header>
                          <main className="min-h-[calc(100vh-3rem)]">
                            <Routes>
                              <Route path="/" element={<Index />} />
                              <Route path="/assets" element={<Assets />} />
                              <Route path="/alerts" element={<Alerts />} />
                              <Route path="/add-assets" element={<AddAssets />} />
                              <Route path="/settings" element={<Settings />} />
                              <Route path="/asset-health" element={<AssetHealth />} />
                              <Route path="/monitoring" element={<RealTimeMonitoring />} />
                              <Route path="/predictive-analytics" element={<PredictiveAnalytics />} />
                              <Route path="/maintenance-planner" element={<MaintenancePlanner />} />
                              <Route path="/spare-parts" element={<SparePartsForecasting />} />
                              <Route path="/financial-analytics" element={<FinancialAnalytics />} />
                              <Route path="/energy-production" element={<EnergyProduction />} />
                              <Route path="/sustainability" element={<Sustainability />} />
                              <Route path="/alerts-center" element={<AlertsCenter />} />
                              <Route path="/historical-trends" element={<HistoricalTrends />} />
                              <Route path="/reports" element={<ReportsCenter />} />
                              <Route path="/activity-logs" element={<ActivityLogs />} />
                              <Route path="/admin" element={<AdminPanel />} />
                              <Route path="/datasets-explorer" element={<DatasetsExplorer />} />
                              <Route path="/dataset-manager" element={<DatasetManager />} />
                              <Route path="/know-more" element={<KnowMore />} />
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </main>
                        </SidebarInset>
                      </div>
                    </SidebarProvider>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
