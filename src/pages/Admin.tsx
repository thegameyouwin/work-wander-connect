import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Loader2, 
  Users, 
  FileText, 
  Briefcase, 
  Settings, 
  Shield,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle2
} from "lucide-react";
import { ApplicationsManagement } from "@/components/admin/ApplicationsManagement";
import { DocumentsManagement } from "@/components/admin/DocumentsManagement";
import { JobsManagement } from "@/components/admin/JobsManagement";
import { APIConfiguration } from "@/components/admin/APIConfiguration";
import { PaymentMethodsConfig } from "@/components/admin/PaymentMethodsConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface DashboardStats {
  totalApplications: number;
  pendingDocuments: number;
  activeJobs: number;
  completedThisMonth: number;
}

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pendingDocuments: 0,
    activeJobs: 0,
    completedThisMonth: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [loading, user, isAdmin, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isAdmin) return;
      
      try {
        const [appsResult, docsResult, jobsResult, completedResult] = await Promise.all([
          supabase.from("applications").select("id", { count: "exact" }),
          supabase.from("documents").select("id", { count: "exact" }).eq("status", "pending"),
          supabase.from("jobs").select("id", { count: "exact" }),
          supabase.from("applications").select("id", { count: "exact" }).eq("status", "completed"),
        ]);

        setStats({
          totalApplications: appsResult.count || 0,
          pendingDocuments: docsResult.count || 0,
          activeJobs: jobsResult.count || 0,
          completedThisMonth: completedResult.count || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const statCards = [
    {
      title: "Total Applications",
      value: stats.totalApplications,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
      trend: "+12%",
    },
    {
      title: "Pending Documents",
      value: stats.pendingDocuments,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
      trend: stats.pendingDocuments > 0 ? "Needs attention" : "All clear",
    },
    {
      title: "Active Job Listings",
      value: stats.activeJobs,
      icon: Briefcase,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      trend: "+5 this week",
    },
    {
      title: "Completed Cases",
      value: stats.completedThisMonth,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
      trend: "This month",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-28 pb-16">
        <div className="container-wide">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
                <Shield className="w-10 h-10 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-heading text-4xl font-bold text-foreground">
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground text-lg">
                  Manage applications, documents, jobs, and system configuration
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="relative overflow-hidden border-0 shadow-card hover:shadow-card-hover transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                      <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {loadingStats ? (
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {stat.trend}
                          </p>
                        </>
                      )}
                    </CardContent>
                    <div className={`absolute bottom-0 left-0 right-0 h-1 ${stat.bgColor}`} />
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Main Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Tabs defaultValue="applications" className="space-y-6">
              <TabsList className="bg-card border shadow-sm p-1 h-auto flex-wrap">
                <TabsTrigger 
                  value="applications" 
                  className="gap-2 px-4 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Users className="w-4 h-4" />
                  <span>Applications</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="documents" 
                  className="gap-2 px-4 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative"
                >
                  <FileText className="w-4 h-4" />
                  <span>Documents</span>
                  {stats.pendingDocuments > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                      {stats.pendingDocuments}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="jobs" 
                  className="gap-2 px-4 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Jobs</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="payments" 
                  className="gap-2 px-4 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Settings className="w-4 h-4" />
                  <span>Payment Methods</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="gap-2 px-4 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Settings className="w-4 h-4" />
                  <span>API Configuration</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="applications" className="space-y-4 mt-6">
                <ApplicationsManagement />
              </TabsContent>

              <TabsContent value="documents" className="space-y-4 mt-6">
                <DocumentsManagement />
              </TabsContent>

              <TabsContent value="jobs" className="space-y-4 mt-6">
                <JobsManagement />
              </TabsContent>

              <TabsContent value="payments" className="space-y-4 mt-6">
                <PaymentMethodsConfig />
              </TabsContent>

              <TabsContent value="settings" className="space-y-4 mt-6">
                <APIConfiguration />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
