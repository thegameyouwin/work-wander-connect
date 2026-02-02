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
import { Loader2, Search, Eye, RefreshCw } from "lucide-react";
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

const statusColors: Record<ApplicationStatus, string> = {
  submitted: "bg-blue-100 text-blue-800",
  under_review: "bg-yellow-100 text-yellow-800",
  pending_documents: "bg-orange-100 text-orange-800",
  approved: "bg-green-100 text-green-800",
  job_matched: "bg-purple-100 text-purple-800",
  visa_process: "bg-indigo-100 text-indigo-800",
  completed: "bg-emerald-100 text-emerald-800",
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
      // Fetch applications
      const { data: appsData, error: appsError } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (appsError) throw appsError;

      // Fetch profiles for each application
      const userIds = appsData?.map(app => app.user_id) || [];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, country_of_origin")
        .in("id", userIds);

      // Combine applications with profiles
      const combinedData = appsData?.map(app => ({
        ...app,
        profiles: profilesData?.find(p => p.id === app.user_id)
      })) || [];

      setApplications(combinedData as Application[]);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
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

      // Send notification to user
      const app = applications.find(a => a.id === appId);
      if (app) {
        await supabase.from("notifications").insert({
          user_id: app.user_id,
          type: "application",
          title: "Application Status Updated",
          message: `Your application status has been updated to: ${newStatus.replace("_", " ")}`,
          link: "/dashboard",
        });
      }

      toast({
        title: "Status Updated",
        description: `Application status changed to ${newStatus.replace("_", " ")}`,
      });

      fetchApplications();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
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
        title: "Notes Updated",
        description: "Application notes have been saved.",
      });

      setSelectedApp(null);
      fetchApplications();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Applications Management</CardTitle>
        <CardDescription>
          Review and manage immigration applications
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchApplications} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Plan</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No applications found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{app.profiles?.full_name}</p>
                          <p className="text-sm text-muted-foreground">{app.profiles?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{app.profiles?.country_of_origin || "N/A"}</TableCell>
                      <TableCell>
                        <Select
                          value={app.status}
                          onValueChange={(value) => updateApplicationStatus(app.id, value as ApplicationStatus)}
                          disabled={updating}
                        >
                          <SelectTrigger className="w-36">
                            <Badge className={statusColors[app.status]}>
                              {app.status.replace("_", " ")}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.replace("_", " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="capitalize">
                        {app.payment_plan?.replace("_", " ") || "N/A"}
                      </TableCell>
                      <TableCell>
                        ${app.paid_amount || 0} / ${app.total_fee || 0}
                      </TableCell>
                      <TableCell>
                        {format(new Date(app.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedApp(app);
                            setNotes(app.notes || "");
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Details Dialog */}
        <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
              <DialogDescription>
                {selectedApp?.profiles?.full_name} - {selectedApp?.profiles?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedApp?.profiles?.phone || "Not provided"}
                  </p>
                </div>
                <div>
                  <Label>Country of Origin</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedApp?.profiles?.country_of_origin || "Not provided"}
                  </p>
                </div>
                <div>
                  <Label>Payment Plan</Label>
                  <p className="text-sm text-muted-foreground capitalize">
                    {selectedApp?.payment_plan?.replace("_", " ") || "Not selected"}
                  </p>
                </div>
                <div>
                  <Label>Payment Progress</Label>
                  <p className="text-sm text-muted-foreground">
                    ${selectedApp?.paid_amount || 0} of ${selectedApp?.total_fee || 0}
                  </p>
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Admin Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this application..."
                  className="mt-1"
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedApp(null)}>
                  Cancel
                </Button>
                <Button onClick={updateNotes} disabled={updating}>
                  {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Notes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
