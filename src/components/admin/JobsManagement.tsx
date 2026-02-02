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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2, Search, Plus, Pencil, Trash2, RefreshCw, Star } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string | null;
  job_type: string | null;
  category: string | null;
  salary_min: number | null;
  salary_max: number | null;
  requirements: string[] | null;
  benefits: string[] | null;
  visa_sponsorship: boolean | null;
  is_featured: boolean | null;
  created_at: string;
}

const jobCategories = [
  "Healthcare",
  "Technology",
  "Construction",
  "Hospitality",
  "Agriculture",
  "Manufacturing",
  "Transportation",
  "Education",
  "Finance",
  "Other",
];

const jobTypes = ["Full-time", "Part-time", "Contract", "Temporary"];

const emptyJob: Partial<Job> = {
  title: "",
  company: "",
  location: "",
  description: "",
  job_type: "Full-time",
  category: "Healthcare",
  salary_min: null,
  salary_max: null,
  requirements: [],
  benefits: [],
  visa_sponsorship: true,
  is_featured: false,
};

export const JobsManagement = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Partial<Job> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [requirementsText, setRequirementsText] = useState("");
  const [benefitsText, setBenefitsText] = useState("");

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs(data || []);
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
    fetchJobs();
  }, []);

  const openCreateDialog = () => {
    setEditingJob(emptyJob);
    setRequirementsText("");
    setBenefitsText("");
    setDialogOpen(true);
  };

  const openEditDialog = (job: Job) => {
    setEditingJob(job);
    setRequirementsText(job.requirements?.join("\n") || "");
    setBenefitsText(job.benefits?.join("\n") || "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingJob?.title || !editingJob?.company || !editingJob?.location) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill in all required fields.",
      });
      return;
    }

    setSaving(true);
    try {
      const jobData = {
        title: editingJob.title!,
        company: editingJob.company!,
        location: editingJob.location!,
        description: editingJob.description,
        job_type: editingJob.job_type,
        category: editingJob.category,
        salary_min: editingJob.salary_min,
        salary_max: editingJob.salary_max,
        visa_sponsorship: editingJob.visa_sponsorship,
        is_featured: editingJob.is_featured,
        requirements: requirementsText.split("\n").filter(Boolean),
        benefits: benefitsText.split("\n").filter(Boolean),
      };

      if (editingJob.id) {
        // Update
        const { error } = await supabase
          .from("jobs")
          .update(jobData)
          .eq("id", editingJob.id);
        if (error) throw error;
        toast({ title: "Job Updated", description: "Job listing has been updated." });
      } else {
        // Create
        const { error } = await supabase.from("jobs").insert([jobData]);
        if (error) throw error;
        toast({ title: "Job Created", description: "New job listing has been created." });
      }

      setDialogOpen(false);
      fetchJobs();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from("jobs").delete().eq("id", deleteId);
      if (error) throw error;
      toast({ title: "Job Deleted", description: "Job listing has been removed." });
      setDeleteId(null);
      fetchJobs();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const toggleFeatured = async (jobId: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ is_featured: !currentValue })
        .eq("id", jobId);
      if (error) throw error;
      fetchJobs();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Jobs Management</CardTitle>
            <CardDescription>Create and manage job listings</CardDescription>
          </div>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Job
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={fetchJobs} className="gap-2">
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
                  <TableHead>Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No jobs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{job.title}</p>
                          <Badge variant="outline" className="text-xs">
                            {job.category}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{job.company}</TableCell>
                      <TableCell>{job.location}</TableCell>
                      <TableCell>
                        {job.salary_min && job.salary_max
                          ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFeatured(job.id, job.is_featured || false)}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              job.is_featured ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                            }`}
                          />
                        </Button>
                      </TableCell>
                      <TableCell>{format(new Date(job.created_at), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(job)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive/90"
                            onClick={() => setDeleteId(job.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingJob?.id ? "Edit Job" : "Create New Job"}</DialogTitle>
              <DialogDescription>
                {editingJob?.id ? "Update the job listing details" : "Fill in the job details"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={editingJob?.title || ""}
                    onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                    placeholder="e.g., Registered Nurse"
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    value={editingJob?.company || ""}
                    onChange={(e) => setEditingJob({ ...editingJob, company: e.target.value })}
                    placeholder="e.g., Healthcare Corp"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={editingJob?.location || ""}
                    onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                    placeholder="e.g., New York, NY"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={editingJob?.category || "Healthcare"}
                    onValueChange={(value) => setEditingJob({ ...editingJob, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {jobCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="job_type">Job Type</Label>
                  <Select
                    value={editingJob?.job_type || "Full-time"}
                    onValueChange={(value) => setEditingJob({ ...editingJob, job_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {jobTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="salary_min">Min Salary</Label>
                  <Input
                    id="salary_min"
                    type="number"
                    value={editingJob?.salary_min || ""}
                    onChange={(e) =>
                      setEditingJob({ ...editingJob, salary_min: parseInt(e.target.value) || null })
                    }
                    placeholder="40000"
                  />
                </div>
                <div>
                  <Label htmlFor="salary_max">Max Salary</Label>
                  <Input
                    id="salary_max"
                    type="number"
                    value={editingJob?.salary_max || ""}
                    onChange={(e) =>
                      setEditingJob({ ...editingJob, salary_max: parseInt(e.target.value) || null })
                    }
                    placeholder="60000"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingJob?.description || ""}
                  onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                  placeholder="Job description..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="requirements">Requirements (one per line)</Label>
                  <Textarea
                    id="requirements"
                    value={requirementsText}
                    onChange={(e) => setRequirementsText(e.target.value)}
                    placeholder="Valid nursing license&#10;2+ years experience&#10;BLS certification"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="benefits">Benefits (one per line)</Label>
                  <Textarea
                    id="benefits"
                    value={benefitsText}
                    onChange={(e) => setBenefitsText(e.target.value)}
                    placeholder="Health insurance&#10;401(k) matching&#10;Paid time off"
                    rows={4}
                  />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingJob?.visa_sponsorship ?? true}
                    onCheckedChange={(checked) =>
                      setEditingJob({ ...editingJob, visa_sponsorship: checked })
                    }
                  />
                  <Label>Visa Sponsorship</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingJob?.is_featured ?? false}
                    onCheckedChange={(checked) =>
                      setEditingJob({ ...editingJob, is_featured: checked })
                    }
                  />
                  <Label>Featured</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {editingJob?.id ? "Update Job" : "Create Job"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Job Listing?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the job listing.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};
