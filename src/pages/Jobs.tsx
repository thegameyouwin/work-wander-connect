import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, DollarSign, Clock, BadgeCheck, ArrowRight, Building2, Search, Loader2, ChevronLeft, ChevronRight, Briefcase } from "lucide-react";
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
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePageSEO } from "@/hooks/usePageSEO";

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

const ITEMS_PER_PAGE = 20;

const Jobs = () => {
  usePageSEO({ title: "Visa-Sponsored Jobs", description: "Browse verified visa-sponsored jobs in the USA, Canada, and UK across healthcare, tech, construction, and more.", canonical: "/jobs" });
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch unique categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("jobs")
        .select("category");
      
      if (data) {
        const uniqueCategories = [...new Set(data.map(j => j.category).filter(Boolean))] as string[];
        setCategories(uniqueCategories.sort());
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [currentPage, selectedCategory]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm]);

  const fetchJobs = async () => {
    setLoading(true);
    
    // Build query
    let query = supabase
      .from("jobs")
      .select("*", { count: "exact" });

    // Apply category filter
    if (selectedCategory !== "All") {
      query = query.eq("category", selectedCategory);
    }

    // Order and paginate
    query = query
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching jobs:", error);
    } else {
      setJobs(data || []);
      setTotalJobs(count || 0);
    }
    setLoading(false);
  };

  // Client-side search filter
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = searchTerm === "" || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil(totalJobs / ITEMS_PER_PAGE);

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return "Competitive";
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    return `Up to $${max?.toLocaleString()}`;
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    if (value === "All") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", value);
    }
    setSearchParams(searchParams);
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
              Browse {totalJobs.toLocaleString()}+ verified positions from employers ready to sponsor your work visa.
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
                  placeholder="Search job titles, companies, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full md:w-56 h-12">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
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
              Showing <span className="text-foreground font-medium">{filteredJobs.length}</span> of{" "}
              <span className="text-foreground font-medium">{totalJobs.toLocaleString()}</span> jobs
              {selectedCategory !== "All" && (
                <span> in <Badge variant="secondary">{selectedCategory}</Badge></span>
              )}
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
                    transition={{ delay: index * 0.03, duration: 0.4 }}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="icon"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-10 h-10"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <span className="px-2 text-muted-foreground">...</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentPage(totalPages)}
                          className="w-10 h-10"
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
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

            {selectedJob?.benefits && selectedJob.benefits.length > 0 && (
              <div>
                <h4 className="font-medium text-foreground mb-2">Benefits</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.benefits.map((benefit, i) => (
                    <Badge key={i} variant="secondary">{benefit}</Badge>
                  ))}
                </div>
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
