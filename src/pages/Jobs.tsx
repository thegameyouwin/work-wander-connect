import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, DollarSign, Clock, BadgeCheck, ArrowRight, Building2, Search, Filter, Heart, Briefcase, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Job {
  id: string;
  title: string;
  company: string;
  description: string | null;
  location: string;
  salary_min: number | null;
  salary_max: number | null;
  job_type: string | null;
  category: string | null;
  visa_sponsorship: boolean | null;
  is_featured: boolean | null;
  requirements: string[] | null;
  benefits: string[] | null;
}

const categories = ["All", "Healthcare", "IT & Tech", "Construction", "Hospitality", "Skilled Trades"];

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching jobs:", error);
    } else {
      setJobs(data || []);
    }
    setLoading(false);
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || job.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return "Competitive";
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    return `Up to $${max?.toLocaleString()}`;
  };

  const handleApply = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to apply for jobs.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!selectedJob) return;

    setApplying(true);
    const { error } = await supabase
      .from("job_applications")
      .insert({
        user_id: user.id,
        job_id: selectedJob.id,
        cover_letter: coverLetter || null,
        status: "applied",
      });

    setApplying(false);

    if (error) {
      if (error.code === "23505") {
        toast({
          title: "Already Applied",
          description: "You have already applied for this position.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Application Failed",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Application Submitted!",
        description: "Your job application has been submitted successfully.",
      });
      setSelectedJob(null);
      setCoverLetter("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-12 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              Find Visa-Sponsored Jobs
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Browse {jobs.length}+ verified positions from employers ready to sponsor your work visa.
            </p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-card rounded-2xl border border-border p-6 shadow-lg max-w-4xl mx-auto"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search job titles or companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48 h-12">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Jobs Grid */}
      <section className="py-12">
        <div className="container-wide">
          {/* Results Count */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-muted-foreground">
              Showing <span className="text-foreground font-medium">{filteredJobs.length}</span> jobs
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Jobs List */}
              <div className="grid gap-4">
                {filteredJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    className="group bg-card rounded-xl border border-border p-6 hover:shadow-xl hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      {/* Company Logo */}
                      <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-8 h-8 text-primary" />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className="font-heading text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                            {job.title}
                          </h3>
                          {job.visa_sponsorship && (
                            <Badge className="bg-success/10 text-success border-success/20 gap-1">
                              <BadgeCheck className="w-3.5 h-3.5" />
                              Visa Sponsored
                            </Badge>
                          )}
                          {job.is_featured && (
                            <Badge className="bg-accent/20 text-accent-foreground">Featured</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-3">{job.company}</p>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{job.description}</p>

                        {/* Meta */}
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="w-4 h-4" />
                            {formatSalary(job.salary_min, job.salary_max)}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {job.job_type || "Full-time"}
                          </div>
                          {job.category && (
                            <div className="flex items-center gap-1.5">
                              <Briefcase className="w-4 h-4" />
                              {job.category}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="flex gap-3 lg:flex-col">
                        <Button 
                          className="gap-2 flex-1 lg:flex-none"
                          onClick={() => setSelectedJob(job)}
                        >
                          Apply Now
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* No Results */}
              {filteredJobs.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                    No jobs found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Apply Dialog */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
            <DialogDescription>
              at {selectedJob?.company} • {selectedJob?.location}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedJob?.requirements && selectedJob.requirements.length > 0 && (
              <div>
                <h4 className="font-medium text-foreground mb-2">Requirements</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {selectedJob.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-foreground">
                Cover Letter (Optional)
              </label>
              <Textarea
                placeholder="Tell us why you're a great fit for this role..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedJob(null)}>
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={applying}>
              {applying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Jobs;
