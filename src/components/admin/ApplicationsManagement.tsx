import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  Search, 
  Eye, 
  RefreshCw, 
  Users, 
  Filter,
  ArrowUpDown,
  Mail,
  Phone,
  Globe,
  Calendar,
  DollarSign,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Database } from "@/integrations/supabase/types";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

type ApplicationStatus = Database["public"]["Enums"]["application_status"];

interface Application {
  id: string;
  user_id: string;
  status: ApplicationStatus;
  payment_plan: string | null;
  total_fee: number | null;
  paid_amount: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    email: string;
    phone: string | null;
    country_of_origin: string | null;
  };
}

const statusConfig: Record<ApplicationStatus, { label: string; color: string; bgColor: string }> = {
  submitted: { label: "Submitted", color: "text-blue-700", bgColor: "bg-blue-100 dark:bg-blue-900/40" },
  under_review: { label: "Under Review", color: "text-amber-700", bgColor: "bg-amber-100 dark:bg-amber-900/40" },
  pending_documents: { label: "Pending Documents", color: "text-orange-700", bgColor: "bg-orange-100 dark:bg-orange-900/40" },
  approved: { label: "Approved", color: "text-green-700", bgColor: "bg-green-100 dark:bg-green-900/40" },
  job_matched: { label: "Job Matched", color: "text-purple-700", bgColor: "bg-purple-100 dark:bg-purple-900/40" },
  visa_process: { label: "Visa Process", color: "text-indigo-700", bgColor: "bg-indigo-100 dark:bg-indigo-900/40" },
  completed: { label: "Completed", color: "text-emerald-700", bgColor: "bg-emerald-100 dark:bg-emerald-900/40" },
};

const statusOptions: ApplicationStatus[] = [
  "submitted",
  "under_review",
  "pending_documents",
  "approved",
  "job_matched",
  "visa_process",
  "completed",
];

export const ApplicationsManagement = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState("");

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data: appsData, error: appsError } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (appsError) throw appsError;

      const userIds = appsData?.map(app => app.user_id) || [];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, country_of_origin")
        .in("id", userIds);

      const combinedData = appsData?.map(app => ({
        ...app,
        profiles: profilesData?.find(p => p.id === app.user_id)
      })) || [];

      setApplications(combinedData as Application[]);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading applications",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const updateApplicationStatus = async (appId: string, newStatus: ApplicationStatus) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .eq("id", appId);

      if (error) throw error;

      const app = applications.find(a => a.id === appId);
      if (app) {
        await supabase.from("notifications").insert({
          user_id: app.user_id,
          type: "application",
          title: "Application Status Updated",
          message: `Your application status has been updated to: ${statusConfig[newStatus].label}`,
          link: "/dashboard",
        });
      }

      toast({
        title: "Status Updated",
        description: `Application status changed to ${statusConfig[newStatus].label}`,
      });

      fetchApplications();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating status",
        description: error.message,
      });
    } finally {
      setUpdating(false);
    }
  };

  const updateNotes = async () => {
    if (!selectedApp) return;
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("applications")
        .update({ notes })
        .eq("id", selectedApp.id);

      if (error) throw error;

      toast({
        title: "Notes Saved",
        description: "Application notes have been updated successfully.",
      });

      setSelectedApp(null);
      fetchApplications();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving notes",
        description: error.message,
      });
    } finally {
      setUpdating(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPaymentProgress = (paid: number | null, total: number | null) => {
    if (!total || total === 0) return 0;
    return Math.min(100, ((paid || 0) / total) * 100);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Applications Management</CardTitle>
              <CardDescription>
                Review, process, and manage immigration applications
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-sm px-3 py-1">
            {filteredApplications.length} {filteredApplications.length === 1 ? 'application' : 'applications'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-11 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 h-11 bg-muted/50 border-0">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    <span className={`flex items-center gap-2`}>
                      <span className={`w-2 h-2 rounded-full ${statusConfig[status].bgColor}`} />
                      {statusConfig[status].label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={fetchApplications} 
              className="h-11 gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Table */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading applications...</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-xl border overflow-hidden"
            >
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="font-semibold">Applicant</TableHead>
                    <TableHead className="font-semibold">Country</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Payment</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-16">
                        <div className="flex flex-col items-center gap-3">
                          <Users className="w-12 h-12 text-muted-foreground/40" />
                          <p className="text-muted-foreground font-medium">No applications found</p>
                          <p className="text-sm text-muted-foreground/60">Try adjusting your search or filters</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredApplications.map((app, index) => (
                      <motion.tr
                        key={app.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-semibold text-sm">
                                {app.profiles?.full_name?.charAt(0)?.toUpperCase() || "?"}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{app.profiles?.full_name || "Unknown"}</p>
                              <p className="text-sm text-muted-foreground">{app.profiles?.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-muted-foreground" />
                            <span>{app.profiles?.country_of_origin || "N/A"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={app.status}
                            onValueChange={(value) => updateApplicationStatus(app.id, value as ApplicationStatus)}
                            disabled={updating}
                          >
                            <SelectTrigger className="w-40 h-9 border-0">
                              <Badge className={`${statusConfig[app.status].bgColor} ${statusConfig[app.status].color} border-0 font-medium`}>
                                {statusConfig[app.status].label}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((status) => (
                                <SelectItem key={status} value={status}>
                                  <Badge className={`${statusConfig[status].bgColor} ${statusConfig[status].color} border-0`}>
                                    {statusConfig[status].label}
                                  </Badge>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1.5 w-32">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">
                                ${app.paid_amount || 0} / ${app.total_fee || 0}
                              </span>
                            </div>
                            <Progress 
                              value={getPaymentProgress(app.paid_amount, app.total_fee)} 
                              className="h-1.5"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">{format(new Date(app.created_at), "MMM d, yyyy")}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedApp(app);
                              setNotes(app.notes || "");
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              </Table>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Details Dialog */}
        <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {selectedApp?.profiles?.full_name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                Application Details
              </DialogTitle>
              <DialogDescription>
                {selectedApp?.profiles?.full_name} - {selectedApp?.profiles?.email}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm">{selectedApp?.profiles?.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Phone</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm">{selectedApp?.profiles?.phone || "Not provided"}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Country of Origin</Label>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm">{selectedApp?.profiles?.country_of_origin || "Not provided"}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Payment Plan</Label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm capitalize">{selectedApp?.payment_plan?.replace("_", " ") || "Not selected"}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Payment Progress */}
              <div className="space-y-3">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Payment Progress</Label>
                <div className="p-4 rounded-xl bg-muted/50">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Amount Paid</span>
                    <span className="font-semibold">
                      ${selectedApp?.paid_amount || 0} of ${selectedApp?.total_fee || 0}
                    </span>
                  </div>
                  <Progress 
                    value={getPaymentProgress(selectedApp?.paid_amount ?? null, selectedApp?.total_fee ?? null)} 
                    className="h-2"
                  />
                </div>
              </div>

              <Separator />

              {/* Admin Notes */}
              <div className="space-y-3">
                <Label htmlFor="notes" className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Admin Notes
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add internal notes about this application..."
                  className="min-h-[120px] bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setSelectedApp(null)}>
                  Cancel
                </Button>
                <Button onClick={updateNotes} disabled={updating} className="min-w-[120px]">
                  {updating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Notes"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
