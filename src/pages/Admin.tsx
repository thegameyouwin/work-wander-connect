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
  TrendingDown,
  Clock,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { ApplicationsManagement } from "@/components/admin/ApplicationsManagement";
import { DocumentsManagement } from "@/components/admin/DocumentsManagement";
import { JobsManagement } from "@/components/admin/JobsManagement";
import { APIConfiguration } from "@/components/admin/APIConfiguration";
import { PaymentMethodsConfig } from "@/components/admin/PaymentMethodsConfig";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface DashboardStats {
  totalApplications: number;
  pendingDocuments: number;
  activeJobs: number;
  completedThisMonth: number;
  pendingPayments: number;
  totalUsers: number;
  newApplicationsToday: number;
  approvalRate: number;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  user_name?: string;
}

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pendingDocuments: 0,
    activeJobs: 0,
    completedThisMonth: 0,
    pendingPayments: 0,
    totalUsers: 0,
    newApplicationsToday: 0,
    approvalRate: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [loading, user, isAdmin, navigate]);

  const fetchDashboardData = async () => {
    if (!isAdmin) return;
    
    setRefreshing(true);
    setLoadingStats(true);
    setLoadingActivity(true);

    try {
      // Fetch all stats in parallel
      const [
        appsResult,
        pendingDocsResult,
        activeJobsResult,
        completedThisMonthResult,
        pendingPaymentsResult,
        usersResult,
        newApplicationsTodayResult,
        approvedApplicationsResult,
        activityResult
      ] = await Promise.all([
        // Total Applications
        supabase.from("applications").select("id", { count: "exact" }),
        
        // Pending Documents
        supabase
          .from("documents")
          .select("id", { count: "exact" })
          .eq("status", "pending"),
        
        // Active Jobs
        supabase
          .from("jobs")
          .select("id", { count: "exact" })
          .eq("status", "active"),
        
        // Completed this month
        supabase
          .from("applications")
          .select("id", { count: "exact" })
          .eq("status", "approved")
          .gte("updated_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
        
        // Pending Payments
        supabase
          .from("payments")
          .select("id", { count: "exact" })
          .eq("status", "pending"),
        
        // Total Users
        supabase.from("profiles").select("id", { count: "exact" }),
        
        // New Applications Today
        supabase
          .from("applications")
          .select("id", { count: "exact" })
          .gte("created_at", new Date().toISOString().split('T')[0]),
        
        // Approved Applications for approval rate
        supabase
          .from("applications")
          .select("id", { count: "exact" })
          .eq("status", "approved"),
        
        // Recent Activity
        supabase
          .from("admin_logs")
          .select(`
            id,
            action_type,
            description,
            created_at,
            profiles(full_name)
          `)
          .order("created_at", { ascending: false })
          .limit(10)
      ]);

      // Calculate approval rate
      const totalApps = appsResult.count || 0;
      const approvedApps = approvedApplicationsResult.count || 0;
      const approvalRate = totalApps > 0 ? Math.round((approvedApps / totalApps) * 100) : 0;

      setStats({
        totalApplications: appsResult.count || 0,
        pendingDocuments: pendingDocsResult.count || 0,
        activeJobs: activeJobsResult.count || 0,
        completedThisMonth: completedThisMonthResult.count || 0,
        pendingPayments: pendingPaymentsResult.count || 0,
        totalUsers: usersResult.count || 0,
        newApplicationsToday: newApplicationsTodayResult.count || 0,
        approvalRate,
      });

      // Transform activity data
      const activityData: RecentActivity[] = (activityResult.data || []).map((item: any) => ({
        id: item.id,
        type: item.action_type,
        title: getActivityTitle(item.action_type),
        description: item.description,
        timestamp: item.created_at,
        user_name: item.profiles?.full_name || "System",
      }));

      setRecentActivity(activityData);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoadingStats(false);
      setLoadingActivity(false);
      setRefreshing(false);
    }
  };

  const getActivityTitle = (actionType: string): string => {
    const titles: Record<string, string> = {
      'application_submitted': 'New Application Submitted',
      'document_uploaded': 'Document Uploaded',
      'payment_received': 'Payment Received',
      'status_updated': 'Status Updated',
      'job_posted': 'Job Posted',
      'user_registered': 'User Registered',
      'admin_login': 'Admin Login',
      'settings_updated': 'Settings Updated',
    };
    return titles[actionType] || 'Activity';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'application_submitted':
        return <Users className="w-4 h-4" />;
      case 'document_uploaded':
        return <FileText className="w-4 h-4" />;
      case 'payment_received':
        return <DollarSign className="w-4 h-4" />;
      case 'status_updated':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'job_posted':
        return <Briefcase className="w-4 h-4" />;
      case 'user_registered':
        return <Users className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    fetchDashboardData();
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
      description: `${stats.newApplicationsToday} new today`,
      trend: stats.newApplicationsToday > 0 ? "up" : "stable",
    },
    {
      title: "Pending Documents",
      value: stats.pendingDocuments,
      icon: FileText,
      color: "text-amber-600",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
      description: "Require review",
      trend: stats.pendingDocuments > 0 ? "attention" : "clear",
    },
    {
      title: "Active Jobs",
      value: stats.activeJobs,
      icon: Briefcase,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      description: "Currently listed",
      trend: "active",
    },
    {
      title: "Completed This Month",
      value: stats.completedThisMonth,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
      description: "Approved applications",
      trend: "up",
    },
    {
      title: "Pending Payments",
      value: stats.pendingPayments,
      icon: DollarSign,
      color: "text-violet-600",
      bgColor: "bg-violet-100 dark:bg-violet-900/30",
      description: "Awaiting processing",
      trend: stats.pendingPayments > 0 ? "attention" : "clear",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-rose-600",
      bgColor: "bg-rose-100 dark:bg-rose-900/30",
      description: "Registered accounts",
      trend: "stable",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
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
              
              <Button
                onClick={fetchDashboardData}
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh Data'}
              </Button>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="col-span-1 md:col-span-2 lg:col-span-2 border shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    System Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Approval Rate</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-foreground">{stats.approvalRate}%</p>
                        {stats.approvalRate > 75 ? (
                          <TrendingUp className="w-5 h-5 text-emerald-500" />
                        ) : stats.approvalRate < 50 ? (
                          <TrendingDown className="w-5 h-5 text-amber-500" />
                        ) : null}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">New Today</p>
                      <p className="text-3xl font-bold text-foreground">{stats.newApplicationsToday}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1 border shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Applications</span>
                      <span className="font-medium">{stats.approvalRate}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${stats.approvalRate}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1 border shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">System</span>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                        Online
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Database</span>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                        Connected
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
              {statCards.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300 border">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                          <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        {stat.trend === 'up' && (
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                        )}
                        {stat.trend === 'attention' && (
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                      <div className="space-y-1">
                        {loadingStats ? (
                          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        ) : (
                          <>
                            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                            <p className="text-sm text-muted-foreground">{stat.title}</p>
                            <p className="text-xs text-muted-foreground">{stat.description}</p>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity & Main Tabs */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <Card className="h-full border shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Recent Activity</span>
                    <Activity className="w-5 h-5 text-muted-foreground" />
                  </CardTitle>
                  <CardDescription>Latest system activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loadingActivity ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : recentActivity.length > 0 ? (
                      recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="p-2 rounded-lg bg-muted">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">
                              {activity.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {activity.description}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground">
                                {activity.user_name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(activity.timestamp), 'HH:mm')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">No recent activity</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Main Tabs */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="lg:col-span-2"
            >
              <Card className="border shadow-lg">
                <CardContent className="p-0">
                  <Tabs defaultValue="applications" className="w-full">
                    <div className="border-b">
                      <TabsList className="w-full h-auto bg-transparent p-0 flex flex-wrap">
                        <TabsTrigger 
                          value="applications" 
                          className="flex-1 gap-2 px-6 py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none border-b-2 data-[state=active]:border-primary border-transparent"
                        >
                          <Users className="w-4 h-4" />
                          <span className="hidden sm:inline">Applications</span>
                          {stats.totalApplications > 0 && (
                            <Badge variant="secondary" className="ml-2">
                              {stats.totalApplications}
                            </Badge>
                          )}
                        </TabsTrigger>
                        <TabsTrigger 
                          value="documents" 
                          className="flex-1 gap-2 px-6 py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none border-b-2 data-[state=active]:border-primary border-transparent"
                        >
                          <FileText className="w-4 h-4" />
                          <span className="hidden sm:inline">Documents</span>
                          {stats.pendingDocuments > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {stats.pendingDocuments}
                            </Badge>
                          )}
                        </TabsTrigger>
                        <TabsTrigger 
                          value="jobs" 
                          className="flex-1 gap-2 px-6 py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none border-b-2 data-[state=active]:border-primary border-transparent"
                        >
                          <Briefcase className="w-4 h-4" />
                          <span className="hidden sm:inline">Jobs</span>
                          {stats.activeJobs > 0 && (
                            <Badge variant="secondary" className="ml-2">
                              {stats.activeJobs}
                            </Badge>
                          )}
                        </TabsTrigger>
                        <TabsTrigger 
                          value="payments" 
                          className="flex-1 gap-2 px-6 py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none border-b-2 data-[state=active]:border-primary border-transparent"
                        >
                          <DollarSign className="w-4 h-4" />
                          <span className="hidden sm:inline">Payments</span>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="settings" 
                          className="flex-1 gap-2 px-6 py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none border-b-2 data-[state=active]:border-primary border-transparent"
                        >
                          <Settings className="w-4 h-4" />
                          <span className="hidden sm:inline">Settings</span>
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <div className="p-6">
                      <TabsContent value="applications" className="m-0">
                        <ApplicationsManagement onUpdate={fetchDashboardData} />
                      </TabsContent>

                      <TabsContent value="documents" className="m-0">
                        <DocumentsManagement onUpdate={fetchDashboardData} />
                      </TabsContent>

                      <TabsContent value="jobs" className="m-0">
                        <JobsManagement onUpdate={fetchDashboardData} />
                      </TabsContent>

                      <TabsContent value="payments" className="m-0">
                        <PaymentMethodsConfig onUpdate={fetchDashboardData} />
                      </TabsContent>

                      <TabsContent value="settings" className="m-0">
                        <APIConfiguration onUpdate={fetchDashboardData} />
                      </TabsContent>
                    </div>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
