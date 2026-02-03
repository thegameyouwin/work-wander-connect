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
import { 
  Loader2, 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  RefreshCw, 
  Star,
  Briefcase,
  MapPin,
  Building2,
  DollarSign,
  Filter,
  CheckCircle2
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
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";

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
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
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
        title: "Error loading jobs",
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
        title: "Missing Required Fields",
        description: "Please fill in job title, company, and location.",
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
        const { error } = await supabase
          .from("jobs")
          .update(jobData)
          .eq("id", editingJob.id);
        if (error) throw error;
        toast({ 
          title: "Job Updated", 
          description: "Job listing has been updated successfully." 
        });
      } else {
        const { error } = await supabase.from("jobs").insert([jobData]);
        if (error) throw error;
        toast({ 
          title: "Job Created", 
          description: "New job listing has been published." 
        });
      }

      setDialogOpen(false);
      fetchJobs();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving job",
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
      toast({ 
        title: "Job Deleted", 
        description: "Job listing has been removed." 
      });
      setDeleteId(null);
      fetchJobs();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting job",
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
      toast({
        title: currentValue ? "Removed from Featured" : "Added to Featured",
        description: currentValue 
          ? "Job is no longer featured" 
          : "Job is now featured on the homepage",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || job.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return "Not specified";
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    return `Up to $${max!.toLocaleString()}`;
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-secondary/5 to-transparent border-b">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-secondary/10">
              <Briefcase className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <CardTitle className="text-xl">Jobs Management</CardTitle>
              <CardDescription>
                Create and manage job listings
              </CardDescription>
            </div>
          </div>
          <Button onClick={openCreateDialog} className="gap-2 shadow-md">
            <Plus className="w-4 h-4" />
            Add New Job
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search jobs by title, company, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-11 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          <div className="flex gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48 h-11 bg-muted/50 border-0">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {jobCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={fetchJobs} 
              className="h-11 gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex gap-4 mb-6 p-4 rounded-xl bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Total:</span>
            <Badge variant="secondary">{jobs.length}</Badge>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-muted-foreground">Featured:</span>
            <Badge variant="secondary">{jobs.filter(j => j.is_featured).length}</Badge>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-secondary" />
            <span className="text-sm text-muted-foreground">Visa Sponsorship:</span>
            <Badge variant="secondary">{jobs.filter(j => j.visa_sponsorship).length}</Badge>
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
              <p className="text-muted-foreground">Loading jobs...</p>
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
                    <TableHead className="font-semibold">Job Details</TableHead>
                    <TableHead className="font-semibold">Location</TableHead>
                    <TableHead className="font-semibold">Salary</TableHead>
                    <TableHead className="font-semibold">Featured</TableHead>
                    <TableHead className="font-semibold">Created</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-16">
                        <div className="flex flex-col items-center gap-3">
                          <Briefcase className="w-12 h-12 text-muted-foreground/40" />
                          <p className="text-muted-foreground font-medium">No jobs found</p>
                          <p className="text-sm text-muted-foreground/60">Try adjusting your search or add a new job</p>
                          <Button onClick={openCreateDialog} className="mt-2 gap-2">
                            <Plus className="w-4 h-4" />
                            Add Your First Job
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredJobs.map((job, index) => (
                      <motion.tr
                        key={job.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                              <Building2 className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{job.title}</p>
                              <p className="text-sm text-muted-foreground">{job.company}</p>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="outline" className="text-xs font-normal">
                                  {job.category || "Uncategorized"}
                                </Badge>
                                <Badge variant="outline" className="text-xs font-normal">
                                  {job.job_type || "Full-time"}
                                </Badge>
                                {job.visa_sponsorship && (
                                  <Badge className="text-xs font-normal bg-secondary/10 text-secondary border-0">
                                    Visa Sponsor
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{job.location}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{formatSalary(job.salary_min, job.salary_max)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFeatured(job.id, job.is_featured || false)}
                            className={`p-2 transition-all ${job.is_featured ? 'text-amber-500 hover:text-amber-600' : 'text-muted-foreground hover:text-amber-500'}`}
                          >
                            <Star className={`w-5 h-5 ${job.is_featured ? "fill-current" : ""}`} />
                          </Button>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(job.created_at), "MMM d, yyyy")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => openEditDialog(job)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity gap-1"
                            >
                              <Pencil className="w-4 h-4" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setDeleteId(job.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              </Table>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                {editingJob?.id ? "Edit Job Listing" : "Create New Job Listing"}
              </DialogTitle>
              <DialogDescription>
                {editingJob?.id ? "Update the job listing details below" : "Fill in the job details to create a new listing"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      value={editingJob?.title || ""}
                      onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                      placeholder="e.g., Registered Nurse"
                      className="bg-muted/50 border-0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company *</Label>
                    <Input
                      id="company"
                      value={editingJob?.company || ""}
                      onChange={(e) => setEditingJob({ ...editingJob, company: e.target.value })}
                      placeholder="e.g., Healthcare Corp"
                      className="bg-muted/50 border-0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={editingJob?.location || ""}
                      onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                      placeholder="e.g., New York, NY"
                      className="bg-muted/50 border-0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={editingJob?.category || "Healthcare"}
                      onValueChange={(value) => setEditingJob({ ...editingJob, category: value })}
                    >
                      <SelectTrigger className="bg-muted/50 border-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {jobCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Salary & Type */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Compensation & Type</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="job_type">Job Type</Label>
                    <Select
                      value={editingJob?.job_type || "Full-time"}
                      onValueChange={(value) => setEditingJob({ ...editingJob, job_type: value })}
                    >
                      <SelectTrigger className="bg-muted/50 border-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {jobTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary_min">Min Salary (USD)</Label>
                    <Input
                      id="salary_min"
                      type="number"
                      value={editingJob?.salary_min || ""}
                      onChange={(e) => setEditingJob({ ...editingJob, salary_min: parseInt(e.target.value) || null })}
                      placeholder="40000"
                      className="bg-muted/50 border-0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary_max">Max Salary (USD)</Label>
                    <Input
                      id="salary_max"
                      type="number"
                      value={editingJob?.salary_max || ""}
                      onChange={(e) => setEditingJob({ ...editingJob, salary_max: parseInt(e.target.value) || null })}
                      placeholder="60000"
                      className="bg-muted/50 border-0"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Description</h4>
                <Textarea
                  id="description"
                  value={editingJob?.description || ""}
                  onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                  placeholder="Describe the job role, responsibilities, and ideal candidate..."
                  className="min-h-[120px] bg-muted/50 border-0 resize-none"
                />
              </div>

              <Separator />

              {/* Requirements & Benefits */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Requirements & Benefits</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="requirements">Requirements (one per line)</Label>
                    <Textarea
                      id="requirements"
                      value={requirementsText}
                      onChange={(e) => setRequirementsText(e.target.value)}
                      placeholder="Valid nursing license&#10;2+ years experience&#10;BLS certification"
                      className="min-h-[120px] bg-muted/50 border-0 resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="benefits">Benefits (one per line)</Label>
                    <Textarea
                      id="benefits"
                      value={benefitsText}
                      onChange={(e) => setBenefitsText(e.target.value)}
                      placeholder="Health insurance&#10;401(k) matching&#10;Paid time off"
                      className="min-h-[120px] bg-muted/50 border-0 resize-none"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Toggles */}
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={editingJob?.visa_sponsorship ?? true}
                    onCheckedChange={(checked) => setEditingJob({ ...editingJob, visa_sponsorship: checked })}
                  />
                  <Label className="cursor-pointer">Visa Sponsorship Available</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={editingJob?.is_featured ?? false}
                    onCheckedChange={(checked) => setEditingJob({ ...editingJob, is_featured: checked })}
                  />
                  <Label className="cursor-pointer flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    Featured Listing
                  </Label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving} className="min-w-[140px]">
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : editingJob?.id ? (
                    "Update Job"
                  ) : (
                    "Create Job"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="w-5 h-5" />
                Delete Job Listing
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this job listing? This action cannot be undone and will remove the job from all searches.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Job
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};
