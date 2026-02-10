import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  FileText, 
  Briefcase, 
  CreditCard, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  Plus,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileUp,
  Home,
  DollarSign,
  TrendingUp,
  FileCheck,
  Calendar,
  Menu,
  X,
  MessageSquare,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PaymentFlow } from "@/components/dashboard/PaymentFlow";
import logo from "@/assets/logo.png";

interface Application {
  id: string;
  status: string;
  total_fee: number;
  paid_amount: number;
  payment_plan: string;
  created_at: string;
  application_type: string;
  visa_type?: string;
  current_step?: string;
  user_id: string;
}

interface JobApplication {
  id: string;
  status: string;
  applied_at: string;
  job: {
    title: string;
    company: string;
    location: string;
    salary?: string;
  };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

interface DashboardStats {
  totalApplications: number;
  totalJobsApplied: number;
  pendingPayments: number;
  upcomingDeadlines: number;
  totalDocuments: number;
  totalPayments: number;
}

const Dashboard = () => {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    totalJobsApplied: 0,
    pendingPayments: 0,
    upcomingDeadlines: 0,
    totalDocuments: 0,
    totalPayments: 0,
  });
  const [dataLoading, setDataLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    
    setDataLoading(true);
    try {
      // Fetch applications for this user
      const { data: appsData } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      setApplications((appsData || []) as Application[]);

      // Calculate pending payments
      const pendingPaymentsCount = (appsData || []).filter(
        (app: any) => app.paid_amount < app.total_fee
      ).length;

      // Fetch job applications with job details
      const { data: jobAppsData } = await supabase
        .from("job_applications")
        .select(`
          id,
          status,
          applied_at,
          job:jobs(title, company, location, salary)
        `)
        .eq("user_id", user.id)
        .order("applied_at", { ascending: false })
        .limit(5);
      
      const transformedJobApps = (jobAppsData || []).map((app: any) => ({
        id: app.id,
        status: app.status,
        applied_at: app.applied_at,
        job: app.job
      }));
      setJobApplications(transformedJobApps);

      // Fetch notifications
      const { data: notifData } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      
      setNotifications((notifData || []) as Notification[]);

      // Fetch documents count
      const { count: documentsCount } = await supabase
        .from("documents")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user.id);

      // Fetch payments count
      const { count: paymentsCount } = await supabase
        .from("payments")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user.id);

      // Update stats
      setStats({
        totalApplications: (appsData || []).length,
        totalJobsApplied: (jobAppsData || []).length,
        pendingPayments: pendingPaymentsCount,
        upcomingDeadlines: 0,
        totalDocuments: documentsCount || 0,
        totalPayments: paymentsCount || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setDataLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'accepted':
      case 'job_matched':
      case 'payment_complete':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'pending':
      case 'under_review':
      case 'payment_pending':
        return <Clock className="w-4 h-4" />;
      case 'pending_documents':
      case 'partially_paid':
        return <AlertTriangle className="w-4 h-4" />;
      case 'submitted':
        return <FileUp className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      under_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      pending_documents: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      job_matched: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      payment_complete: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      payment_pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      partially_paid: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
      draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      applied: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      accepted: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleViewPayments = () => {
    navigate("/payments");
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Loading Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-muted animate-pulse" />
                <div className="space-y-1">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
                <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="space-y-4">
              <div className="h-8 w-64 bg-muted rounded" />
              <div className="h-4 w-96 bg-muted rounded" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-muted rounded-lg" />
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-96 bg-muted rounded-lg" />
                <div className="h-64 bg-muted rounded-lg" />
              </div>
              <div className="space-y-6">
                <div className="h-64 bg-muted rounded-lg" />
                <div className="h-64 bg-muted rounded-lg" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const primaryApplication = applications[0];
  const progressPercentage = primaryApplication
    ? (primaryApplication.paid_amount / (primaryApplication.total_fee || 1)) * 100
    : 0;

  const totalBalance = primaryApplication 
    ? primaryApplication.total_fee - primaryApplication.paid_amount 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img 
                src={logo} 
                alt="Carewell Supports" 
                className="h-10 w-auto" 
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              <nav className="flex items-center gap-6">
                <Link to="/dashboard" className="text-sm font-medium text-primary">
                  Dashboard
                </Link>
                <Link to="/apply" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  Apply
                </Link>
                <Link to="/jobs" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  Jobs
                </Link>
                <Link to="/payments" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  Payments
                </Link>
                <Link to="/documents" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  Documents
                </Link>
                <Link to="/support" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  Support
                </Link>
              </nav>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* Mobile menu button */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-8">
                      <img 
                        src={logo} 
                        alt="Carewell Supports" 
                        className="h-10 w-auto" 
                      />
                    </div>
                    
                    <nav className="flex-1 space-y-4">
                      <Link 
                        to="/dashboard" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 text-primary font-medium"
                      >
                        <Home className="w-5 h-5" />
                        Dashboard
                      </Link>
                      <Link 
                        to="/apply" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        Apply
                      </Link>
                      <Link 
                        to="/jobs" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <Briefcase className="w-5 h-5" />
                        Jobs
                      </Link>
                      <Link 
                        to="/payments" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <CreditCard className="w-5 h-5" />
                        Payments
                      </Link>
                      <Link 
                        to="/documents" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <FileText className="w-5 h-5" />
                        Documents
                      </Link>
                      <Link 
                        to="/support" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <MessageSquare className="w-5 h-5" />
                        Support
                      </Link>
                    </nav>

                    <div className="pt-6 border-t">
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white">
                            {getInitials(profile?.full_name || "User")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{profile?.full_name}</p>
                          <p className="text-sm text-muted-foreground">{profile?.email}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            navigate("/profile");
                          }}
                        >
                          <User className="w-4 h-4 mr-2" />
                          Profile
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            navigate("/settings");
                          }}
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start text-destructive hover:text-destructive"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            handleSignOut();
                          }}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    {notifications.filter((n) => !n.read).length > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    <Badge variant="secondary" className="ml-2">
                      {notifications.filter(n => !n.read).length} new
                    </Badge>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 5).map((notif) => (
                        <DropdownMenuItem 
                          key={notif.id} 
                          className={`p-3 cursor-pointer ${!notif.read ? 'bg-primary/5' : ''}`}
                          onClick={() => handleMarkNotificationAsRead(notif.id)}
                        >
                          <div className="flex items-start gap-3 w-full">
                            <div className={`mt-0.5 ${notif.type === 'success' ? 'text-green-500' : notif.type === 'warning' ? 'text-amber-500' : 'text-blue-500'}`}>
                              {notif.type === 'success' ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : notif.type === 'warning' ? (
                                <AlertCircle className="w-4 h-4" />
                              ) : (
                                <Bell className="w-4 h-4" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-foreground truncate">{notif.title}</p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {notif.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {formatDate(notif.created_at)}
                              </p>
                            </div>
                            {!notif.read && (
                              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="p-4 text-center">
                        <Bell className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">No notifications</p>
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => navigate("/notifications")} 
                        className="cursor-pointer justify-center"
                      >
                        View all notifications
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white">
                        {getInitials(profile?.full_name || "User")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{profile?.full_name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {profile?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => navigate("/profile")} 
                    className="cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate("/payments")} 
                    className="cursor-pointer"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Payments
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate("/settings")} 
                    className="cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleSignOut} 
                    className="cursor-pointer text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Welcome back, <span className="text-primary">{profile?.full_name || "Applicant"}</span>!
              </h1>
              <p className="text-muted-foreground">
                Here's an overview of your immigration journey and recent activity.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {!primaryApplication ? (
                <Link to="/apply">
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Start Application
                  </Button>
                </Link>
              ) : (
                <Button className="gap-2" onClick={() => navigate("/applications")}>
                  <FileText className="w-4 h-4" />
                  View Applications
                </Button>
              )}
              <Button variant="outline" className="gap-2" onClick={handleViewPayments}>
                <CreditCard className="w-4 h-4" />
                Payment History
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { 
              label: "Applications", 
              value: stats.totalApplications, 
              icon: FileText, 
              color: "text-blue-500",
              bgColor: "bg-blue-50 dark:bg-blue-950/50"
            },
            { 
              label: "Jobs Applied", 
              value: stats.totalJobsApplied, 
              icon: Briefcase, 
              color: "text-green-500",
              bgColor: "bg-green-50 dark:bg-green-950/50"
            },
            { 
              label: "Pending Payments", 
              value: stats.pendingPayments, 
              icon: CreditCard, 
              color: "text-amber-500",
              bgColor: "bg-amber-50 dark:bg-amber-950/50"
            },
            { 
              label: "Documents", 
              value: stats.totalDocuments, 
              icon: FileCheck, 
              color: "text-purple-500",
              bgColor: "bg-purple-50 dark:bg-purple-950/50"
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Primary Application Card */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl font-bold">Immigration Application</CardTitle>
                    <CardDescription>
                      {primaryApplication ? "Track your application progress" : "Start your immigration journey"}
                    </CardDescription>
                  </div>
                  {primaryApplication && (
                    <Badge className={`${getStatusColor(primaryApplication.status)} px-3 py-1 font-medium`}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(primaryApplication.status)}
                        {formatStatus(primaryApplication.status)}
                      </span>
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                {primaryApplication ? (
                  <div className="space-y-6">
                    {/* Progress Section */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Payment Progress</span>
                        <span className="font-medium">{progressPercentage.toFixed(0)}%</span>
                      </div>
                      <Progress 
                        value={progressPercentage} 
                        className="h-3 rounded-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{formatCurrency(primaryApplication.paid_amount)} paid</span>
                        <span>{formatCurrency(primaryApplication.total_fee)} total</span>
                      </div>
                    </div>

                    {/* Application Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Application Type</p>
                        <p className="font-medium capitalize">{primaryApplication.application_type || "Work Visa"}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Started On</p>
                        <p className="font-medium">{new Date(primaryApplication.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Payment Plan</p>
                        <p className="font-medium capitalize">{primaryApplication.payment_plan || "Standard Plan"}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Balance Due</p>
                        <p className="font-medium text-amber-600 dark:text-amber-400">
                          {formatCurrency(totalBalance)}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t">
                      <Button variant="outline" className="gap-2" onClick={() => navigate("/documents")}>
                        <Upload className="w-4 h-4" />
                        Upload Documents
                      </Button>
                      
                      {primaryApplication && totalBalance > 0 ? (
                        <PaymentFlow 
                          applicationId={primaryApplication.id}
                          totalFee={primaryApplication.total_fee}
                          paidAmount={primaryApplication.paid_amount}
                          paymentPlan={primaryApplication.payment_plan}
                          balanceDue={totalBalance}
                          onPaymentSuccess={fetchDashboardData}
                        />
                      ) : (
                        <Button variant="outline" className="gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Payment Complete
                        </Button>
                      )}
                    </div>

                    {/* Payment Tip */}
                    {totalBalance > 0 && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-800 dark:text-blue-300 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          <span>
                            <strong>Tip:</strong> Complete your payment to move forward with your application processing.
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Active Application</h3>
                    <p className="text-muted-foreground mb-6">
                      Start your immigration journey today with our guided application process.
                    </p>
                    <Link to="/apply">
                      <Button size="lg" className="gap-2">
                        <Plus className="w-5 h-5" />
                        Start Application
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Job Applications */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl font-bold">Recent Job Applications</CardTitle>
                    <CardDescription>Your most recent job applications</CardDescription>
                  </div>
                  <Link to="/jobs">
                    <Button variant="outline" size="sm" className="gap-2">
                      View All Jobs
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              
              <CardContent>
                {jobApplications.length > 0 ? (
                  <div className="space-y-4">
                    {jobApplications.map((app) => (
                      <motion.div
                        key={app.id}
                        whileHover={{ scale: 1.01 }}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
                        onClick={() => navigate(`/jobs/${app.id}`)}
                      >
                        <div className="flex items-start gap-4 mb-3 sm:mb-0">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Briefcase className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{app.job?.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {app.job?.company} • {app.job?.location}
                            </p>
                            {app.job?.salary && (
                              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                {app.job.salary}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Calendar className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                Applied {formatDate(app.applied_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(app.status)} min-w-[100px] justify-center`}>
                          {formatStatus(app.status)}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Job Applications Yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Browse our job listings and start applying to positions that match your skills.
                    </p>
                    <Link to="/jobs">
                      <Button variant="outline" className="gap-2">
                        <Briefcase className="w-4 h-4" />
                        Browse Jobs
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white text-lg">
                      {getInitials(profile?.full_name || "User")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">{profile?.full_name}</p>
                    <p className="text-sm text-muted-foreground">{profile?.email}</p>
                    <Badge variant="secondary" className="mt-1">
                      {primaryApplication ? "Active Applicant" : "Registered User"}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Country of Origin</span>
                    <span className="font-medium">{profile?.country_of_origin || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Destination</span>
                    <span className="font-medium text-primary">{profile?.desired_destination || "United States"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Member Since</span>
                    <span className="font-medium">
                      {profile?.created_at 
                        ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                        : "Recently"
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Payments</span>
                    <span className="font-medium text-green-600">
                      {stats.totalPayments} transactions
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => navigate("/profile")}>
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => navigate("/settings")}>
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notifications Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Recent Notifications
                  </CardTitle>
                  <Badge variant="secondary">
                    {notifications.filter((n) => !n.read).length} new
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                {notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.slice(0, 3).map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          notif.read 
                            ? 'border-border hover:border-primary/30' 
                            : 'border-primary/30 bg-primary/5 hover:bg-primary/10'
                        }`}
                        onClick={() => handleMarkNotificationAsRead(notif.id)}
                      >
                        <div className="flex items-start gap-3">
                          {notif.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          ) : notif.type === 'warning' ? (
                            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          ) : (
                            <Bell className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">{notif.title}</p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notif.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatDate(notif.created_at)}
                            </p>
                          </div>
                          {!notif.read && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Bell className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">No notifications yet</p>
                  </div>
                )}
              </CardContent>
              
              {notifications.length > 0 && (
                <CardFooter className="border-t pt-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate("/notifications")}
                  >
                    View All Notifications
                  </Button>
                </CardFooter>
              )}
            </Card>

            {/* Quick Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and actions</CardDescription>
              </CardHeader>
              
              <CardContent className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="h-auto py-3 flex-col gap-2" 
                  onClick={() => navigate("/documents")}
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-xs">Upload Docs</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto py-3 flex-col gap-2" 
                  onClick={handleViewPayments}
                >
                  <Eye className="w-5 h-5" />
                  <span className="text-xs">View Payments</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto py-3 flex-col gap-2" 
                  onClick={() => navigate("/jobs")}
                >
                  <Briefcase className="w-5 h-5" />
                  <span className="text-xs">Find Jobs</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto py-3 flex-col gap-2" 
                  onClick={() => navigate("/support")}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-xs">Get Support</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40">
        <div className="flex items-center justify-around h-16">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/dashboard")}
            className="relative"
          >
            <Home className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/jobs")}
          >
            <Briefcase className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/apply")}
          >
            <Plus className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleViewPayments}
          >
            <CreditCard className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/notifications")}
            className="relative"
          >
            <Bell className="w-5 h-5" />
            {notifications.filter((n) => !n.read).length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
