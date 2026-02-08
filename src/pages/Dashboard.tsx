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
  Globe,
  Home,
  DollarSign,
  TrendingUp,
  FileCheck,
  Calendar
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
import { Skeleton } from "@/components/ui/skeleton";

interface Application {
  id: string;
  status: string;
  total_fee: number;
  paid_amount: number;
  payment_plan: string;
  created_at: string;
  application_type: string;
}

interface JobApplication {
  id: string;
  status: string;
  applied_at: string;
  job: {
    title: string;
    company: string;
    location: string;
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
  });
  const [dataLoading, setDataLoading] = useState(true);

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
    setDataLoading(true);
    try {
      // Fetch applications
      const { data: appsData } = await supabase
        .from("applications")
        .select("*")
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
          job:jobs(title, company, location)
        `)
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
        .order("created_at", { ascending: false })
        .limit(5);
      
      setNotifications((notifData || []) as Notification[]);

      // Update stats
      setStats({
        totalApplications: (appsData || []).length,
        totalJobsApplied: (jobAppsData || []).length,
        pendingPayments: pendingPaymentsCount,
        upcomingDeadlines: 2, // This could be fetched from actual deadlines
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
        return <CheckCircle2 className="w-4 h-4" />;
      case 'pending':
      case 'under_review':
        return <Clock className="w-4 h-4" />;
      case 'pending_documents':
        return <AlertCircle className="w-4 h-4" />;
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
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const primaryApplication = applications[0];
  const progressPercentage = primaryApplication
    ? (primaryApplication.paid_amount / (primaryApplication.total_fee || 1)) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header - Fixed and Responsive */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo Section - Fixed Logo Issue */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Carewell
                </span>
                <span className="text-xs text-muted-foreground -mt-0.5">Global Immigration Support</span>
              </div>
            </Link>

            {/* Navigation & User Menu */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
                )}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-9 w-9 border-2 border-primary/20">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white">
                        {getInitials(profile?.full_name || "User")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{profile?.full_name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {profile?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

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
              <h1 className="font-bold text-3xl md:text-4xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Welcome back, <span className="text-primary">{profile?.full_name || "Applicant"}</span>!
              </h1>
              <p className="text-muted-foreground mt-2">
                Here's what's happening with your applications today.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/apply")}>
                <Plus className="w-4 h-4 mr-2" />
                New Application
              </Button>
              <Button size="sm" onClick={() => navigate("/jobs")}>
                <Briefcase className="w-4 h-4 mr-2" />
                Find Jobs
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { 
              label: "Total Applications", 
              value: stats.totalApplications, 
              icon: FileCheck, 
              color: "text-blue-600 dark:text-blue-400",
              bgColor: "bg-blue-50 dark:bg-blue-950"
            },
            { 
              label: "Jobs Applied", 
              value: stats.totalJobsApplied, 
              icon: Briefcase, 
              color: "text-green-600 dark:text-green-400",
              bgColor: "bg-green-50 dark:bg-green-950"
            },
            { 
              label: "Pending Payments", 
              value: stats.pendingPayments, 
              icon: DollarSign, 
              color: "text-amber-600 dark:text-amber-400",
              bgColor: "bg-amber-50 dark:bg-amber-950"
            },
            { 
              label: "Upcoming Deadlines", 
              value: stats.upcomingDeadlines, 
              icon: Calendar, 
              color: "text-purple-600 dark:text-purple-400",
              bgColor: "bg-purple-50 dark:bg-purple-950"
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -4 }}
            >
              <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
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
          {/* Left Column - 2/3 width on large screens */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Status Card */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">Immigration Application</CardTitle>
                    <CardDescription>
                      {primaryApplication ? "Track your current application progress" : "Start your immigration journey"}
                    </CardDescription>
                  </div>
                  {!primaryApplication ? (
                    <Link to="/apply">
                      <Button className="gap-2 shadow-md hover:shadow-lg transition-shadow">
                        <Plus className="w-4 h-4" />
                        Start Application
                      </Button>
                    </Link>
                  ) : (
                    <Badge className={`${getStatusColor(primaryApplication.status)} px-3 py-1`}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(primaryApplication.status)}
                        {formatStatus(primaryApplication.status)}
                      </span>
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pb-6">
                {primaryApplication ? (
                  <div className="space-y-6">
                    {/* Progress Section */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Payment Progress</span>
                        <span className="font-medium">{progressPercentage.toFixed(0)}%</span>
                      </div>
                      <div className="relative">
                        <Progress 
                          value={progressPercentage} 
                          className="h-3 rounded-full"
                          indicatorClassName="bg-gradient-to-r from-primary to-primary/70"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-xs font-medium text-foreground/80">
                            {formatCurrency(primaryApplication.paid_amount)} of {formatCurrency(primaryApplication.total_fee)}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Started {new Date(primaryApplication.created_at).toLocaleDateString()}
                        </span>
                        <span>{primaryApplication.payment_plan || "Standard Plan"}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button variant="outline" className="gap-2 h-11">
                        <FileUp className="w-4 h-4" />
                        Upload Documents
                      </Button>
                      <Button className="gap-2 h-11 bg-gradient-to-r from-primary to-primary/70 hover:opacity-90 transition-opacity">
                        <CreditCard className="w-4 h-4" />
                        Make Payment
                      </Button>
                    </div>

                    {/* Additional Info */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Application Type</p>
                        <p className="font-medium">{primaryApplication.application_type || "Work Visa"}</p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Balance</p>
                        <p className="font-medium text-amber-600 dark:text-amber-400">
                          {formatCurrency(primaryApplication.total_fee - primaryApplication.paid_amount)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 md:py-12">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Active Application</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Start your immigration journey today. Our experts will guide you through every step.
                    </p>
                    <Link to="/apply">
                      <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all">
                        <Plus className="w-5 h-5" />
                        Start Your Application
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Job Applications Card */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">Recent Job Applications</CardTitle>
                    <CardDescription>Your most recent job applications and their status</CardDescription>
                  </div>
                  <Link to="/jobs">
                    <Button variant="outline" size="sm" className="gap-2">
                      View All
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
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ x: 4 }}
                        className="group"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer">
                          <div className="flex items-start gap-4 mb-3 sm:mb-0">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <Briefcase className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                {app.job?.title}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {app.job?.company} • {app.job?.location}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Clock className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  Applied {new Date(app.applied_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(app.status)} px-3 py-1`}>
                            {formatStatus(app.status)}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Job Applications Yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Start applying to jobs that match your profile and immigration status.
                    </p>
                    <Link to="/jobs">
                      <Button variant="outline" className="gap-2">
                        <Briefcase className="w-4 h-4" />
                        Browse Available Jobs
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
                  Your Profile
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                    <AvatarFallback className="text-lg bg-gradient-to-br from-primary to-primary/70 text-white">
                      {getInitials(profile?.full_name || "User")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg text-foreground">{profile?.full_name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{profile?.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        Applicant
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">From</span>
                    </div>
                    <span className="font-medium">{profile?.country_of_origin || "Not specified"}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Destination</span>
                    </div>
                    <span className="font-medium text-primary">{profile?.desired_destination || "United States"}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Visa Type</span>
                    </div>
                    <span className="font-medium">Work Visa</span>
                  </div>
                </div>

                <Button className="w-full" variant="outline" onClick={() => navigate("/profile")}>
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Notifications Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications
                  </CardTitle>
                  <Badge variant="secondary">
                    {notifications.filter((n) => !n.read).length} New
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                {notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.slice(0, 4).map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 rounded-xl border transition-all ${
                          notif.read 
                            ? "border-border hover:border-primary/30" 
                            : "border-primary/30 bg-primary/5 hover:bg-primary/10"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {notif.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                          ) : notif.type === 'warning' ? (
                            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                          ) : (
                            <Bell className="w-4 h-4 text-blue-500 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-sm text-foreground">{notif.title}</p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notif.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground">No notifications yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      We'll notify you when there's important updates
                    </p>
                  </div>
                )}
              </CardContent>
              
              {notifications.length > 0 && (
                <CardFooter className="border-t pt-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-sm"
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
                <CardDescription>Common tasks you might need</CardDescription>
              </CardHeader>
              
              <CardContent className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-auto py-3 flex-col gap-2" onClick={() => navigate("/documents")}>
                  <FileUp className="w-5 h-5" />
                  <span className="text-xs">Upload Documents</span>
                </Button>
                
                <Button variant="outline" className="h-auto py-3 flex-col gap-2" onClick={() => navigate("/payments")}>
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs">Make Payment</span>
                </Button>
                
                <Button variant="outline" className="h-auto py-3 flex-col gap-2" onClick={() => navigate("/jobs")}>
                  <Briefcase className="w-5 h-5" />
                  <span className="text-xs">Browse Jobs</span>
                </Button>
                
                <Button variant="outline" className="h-auto py-3 flex-col gap-2" onClick={() => navigate("/support")}>
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-xs">Get Support</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation (for small screens) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40">
        <div className="flex items-center justify-around h-16">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <Home className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate("/jobs")}>
            <Briefcase className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate("/apply")}>
            <Plus className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate("/notifications")}>
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
