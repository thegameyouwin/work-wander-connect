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
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Application {
  id: string;
  status: string;
  total_fee: number;
  paid_amount: number;
  payment_plan: string;
  created_at: string;
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

const Dashboard = () => {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
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
      
      // Transform the data to match our interface
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
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    navigate("/");
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: "bg-primary/10 text-primary",
      under_review: "bg-warning/10 text-warning-foreground",
      pending_documents: "bg-destructive/10 text-destructive",
      approved: "bg-success/10 text-success",
      job_matched: "bg-success/10 text-success",
      applied: "bg-primary/10 text-primary",
      pending: "bg-warning/10 text-warning-foreground",
      accepted: "bg-success/10 text-success",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const primaryApplication = applications[0];
  const progressPercentage = primaryApplication
    ? (primaryApplication.paid_amount / (primaryApplication.total_fee || 1)) * 100
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container-wide flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Globe className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-lg leading-tight">Carewell</span>
              <span className="text-xs text-muted-foreground -mt-0.5">Supports</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              )}
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container-wide py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
            Welcome back, {profile?.full_name || "Applicant"}!
          </h1>
          <p className="text-muted-foreground">
            Track your applications, jobs, and payments all in one place.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Applications", value: applications.length, icon: FileText, color: "text-primary" },
            { label: "Job Applications", value: jobApplications.length, icon: Briefcase, color: "text-success" },
            { label: "Pending Payments", value: applications.filter((a) => a.paid_amount < a.total_fee).length, icon: CreditCard, color: "text-warning-foreground" },
            { label: "Notifications", value: notifications.filter((n) => !n.read).length, icon: Bell, color: "text-destructive" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-heading font-bold text-foreground">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Application Card */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Immigration Application</CardTitle>
                  <CardDescription>Track your visa application progress</CardDescription>
                </div>
                {!primaryApplication && (
                  <Link to="/apply">
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Start Application
                    </Button>
                  </Link>
                )}
              </CardHeader>
              <CardContent>
                {primaryApplication ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Badge className={getStatusColor(primaryApplication.status)}>
                        {formatStatus(primaryApplication.status)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Started {new Date(primaryApplication.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Payment Progress</span>
                        <span className="font-medium">{progressPercentage.toFixed(0)}%</span>
                      </div>
                      <Progress value={progressPercentage} className="h-3" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>${primaryApplication.paid_amount.toLocaleString()} paid</span>
                        <span>${primaryApplication.total_fee.toLocaleString()} total</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1 gap-2">
                        <FileUp className="w-4 h-4" />
                        Upload Documents
                      </Button>
                      <Button className="flex-1 gap-2">
                        <CreditCard className="w-4 h-4" />
                        Make Payment
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      You haven't started an immigration application yet.
                    </p>
                    <Link to="/apply">
                      <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Start Your Application
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Job Applications */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Job Applications</CardTitle>
                  <CardDescription>Your recent job applications</CardDescription>
                </div>
                <Link to="/jobs">
                  <Button variant="outline" size="sm" className="gap-2">
                    Browse Jobs
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {jobApplications.length > 0 ? (
                  <div className="space-y-4">
                    {jobApplications.map((app) => (
                      <div
                        key={app.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{app.job?.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {app.job?.company} • {app.job?.location}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(app.status)}>
                          {formatStatus(app.status)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      You haven't applied to any jobs yet.
                    </p>
                    <Link to="/jobs">
                      <Button variant="outline" className="gap-2">
                        Browse Available Jobs
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{profile?.full_name}</p>
                    <p className="text-sm text-muted-foreground">{profile?.email}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Country of Origin</span>
                    <span className="font-medium">{profile?.country_of_origin || "Not set"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Destination</span>
                    <span className="font-medium">{profile?.desired_destination || "USA"}</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.slice(0, 3).map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 rounded-lg border ${
                          notif.read ? "border-border" : "border-primary/30 bg-primary/5"
                        }`}
                      >
                        <p className="font-medium text-sm text-foreground">{notif.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No notifications yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
