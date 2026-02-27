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
                        <SidebarInset className="flex-1">
                          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
                            <SidebarTrigger />
                            <div className="flex items-center gap-2">
                              <h1 className="text-lg font-semibold">GreenTech Reliability Intelligence Platform</h1>
                            </div>
                          </header>
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
                            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                            <Route path="*" element={<NotFound />} />
                          </Routes>
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
