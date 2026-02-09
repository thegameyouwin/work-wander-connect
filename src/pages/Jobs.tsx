import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, DollarSign, Clock, BadgeCheck, ArrowRight, 
  Building2, Search, Loader2, ChevronLeft, ChevronRight, 
  Briefcase, Filter, Star, Users, Globe, Award,
  CheckCircle, Heart, Bookmark, Eye, Share2, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";

interface Job {
  id: string;
  title: string;
  company: string;
  description: string | null;
  full_description?: string | null;
  location: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  job_type: string | null;
  category: string | null;
  visa_sponsorship: boolean | null;
  is_featured: boolean | null;
  is_remote: boolean | null;
  experience_level: string | null;
  requirements: string[] | null;
  benefits: string[] | null;
  skills_required: string[] | null;
  application_deadline: string | null;
  created_at: string;
  company_logo?: string | null;
  company_description?: string | null;
  application_count?: number;
  views_count?: number;
  saved_count?: number;
}

interface JobStats {
  totalJobs: number;
  featuredJobs: number;
  remoteJobs: number;
  visaSponsorshipJobs: number;
}

interface Filters {
  category: string;
  job_type: string;
  experience_level: string;
  visa_sponsorship: boolean;
  is_remote: boolean;
  min_salary: number | null;
  max_salary: number | null;
  location: string;
  search: string;
}

const ITEMS_PER_PAGE = 24; // Increased from 12 to show more jobs per page

const Jobs = () => {
  usePageSEO({ 
    title: "Visa-Sponsored Jobs | Carewell Supports", 
    description: "Browse 370+ verified positions with visa sponsorship from employers worldwide. Find opportunities in healthcare, tech, construction, and other high-demand fields.", 
    canonical: "/jobs" 
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobStats, setJobStats] = useState<JobStats>({
    totalJobs: 0,
    featuredJobs: 0,
    remoteJobs: 0,
    visaSponsorshipJobs: 0,
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [experienceLevels, setExperienceLevels] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userHasProfile, setUserHasProfile] = useState(false);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [viewedJobs, setViewedJobs] = useState<Set<string>>(new Set());
  
  const [filters, setFilters] = useState<Filters>({
    category: searchParams.get("category") || "All",
    job_type: searchParams.get("job_type") || "All",
    experience_level: searchParams.get("experience_level") || "All",
    visa_sponsorship: searchParams.get("visa_sponsorship") === "true",
    is_remote: searchParams.get("is_remote") === "true",
    min_salary: searchParams.get("min_salary") ? Number(searchParams.get("min_salary")) : null,
    max_salary: searchParams.get("max_salary") ? Number(searchParams.get("max_salary")) : null,
    location: searchParams.get("location") || "All",
    search: searchParams.get("search") || "",
  });
  
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch filter options from database
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [
          categoriesRes,
          jobTypesRes,
          experienceRes,
          locationsRes,
        ] = await Promise.all([
          supabase.from("jobs").select("category").not("category", "is", null),
          supabase.from("jobs").select("job_type").not("job_type", "is", null),
          supabase.from("jobs").select("experience_level").not("experience_level", "is", null),
          supabase.from("jobs").select("location"),
        ]);

        // Process unique categories
        if (categoriesRes.data) {
          const uniqueCategories = [...new Set(categoriesRes.data.map(j => j.category).filter(Boolean))] as string[];
          setCategories(uniqueCategories.sort());
        }

        // Process unique job types
        if (jobTypesRes.data) {
          const uniqueJobTypes = [...new Set(jobTypesRes.data.map(j => j.job_type).filter(Boolean))] as string[];
          setJobTypes(uniqueJobTypes.sort());
        }

        // Process unique experience levels
        if (experienceRes.data) {
          const uniqueLevels = [...new Set(experienceRes.data.map(j => j.experience_level).filter(Boolean))] as string[];
          setExperienceLevels(uniqueLevels.sort());
        }

        // Process unique locations
        if (locationsRes.data) {
          const uniqueLocations = [...new Set(locationsRes.data.map(j => j.location).filter(Boolean))] as string[];
          setLocations(uniqueLocations.sort());
        }
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Fetch job stats
  useEffect(() => {
    const fetchJobStats = async () => {
      try {
        const [
          totalRes,
          featuredRes,
          remoteRes,
          visaRes,
        ] = await Promise.all([
          supabase.from("jobs").select("id", { count: "exact", head: true }),
          supabase.from("jobs").select("id", { count: "exact", head: true }).eq("is_featured", true),
          supabase.from("jobs").select("id", { count: "exact", head: true }).eq("is_remote", true),
          supabase.from("jobs").select("id", { count: "exact", head: true }).eq("visa_sponsorship", true),
        ]);

        setJobStats({
          totalJobs: totalRes.count || 0,
          featuredJobs: featuredRes.count || 0,
          remoteJobs: remoteRes.count || 0,
          visaSponsorshipJobs: visaRes.count || 0,
        });
      } catch (error) {
        console.error("Error fetching job stats:", error);
      }
    };

    fetchJobStats();
  }, []);

  // Check user profile completion
  useEffect(() => {
    if (profile) {
      const hasProfile = Boolean(
        profile.full_name && 
        profile.country_of_origin && 
        profile.desired_destination
      );
      setUserHasProfile(hasProfile);
    }
  }, [profile]);

  // Load saved jobs
  useEffect(() => {
    const loadSavedJobs = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("saved_jobs")
        .select("job_id")
        .eq("user_id", user.id);
      
      if (data) {
        setSavedJobs(new Set(data.map(item => item.job_id)));
      }
    };
    
    loadSavedJobs();
  }, [user]);

  // Load viewed jobs from localStorage
  useEffect(() => {
    const viewed = localStorage.getItem("viewedJobs");
    if (viewed) {
      setViewedJobs(new Set(JSON.parse(viewed)));
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    
    try {
      // Build count query
      let countQuery = supabase
        .from("jobs")
        .select("*", { count: "exact", head: true });

      // Build data query
      let dataQuery = supabase
        .from("jobs")
        .select("*, company_logos!left(logo_url)");

      // Apply filters to both queries
      const applyFilters = (query: any) => {
        let q = query;
        if (filters.category !== "All") {
          q = q.eq("category", filters.category);
        }
        if (filters.job_type !== "All") {
          q = q.eq("job_type", filters.job_type);
        }
        if (filters.experience_level !== "All") {
          q = q.eq("experience_level", filters.experience_level);
        }
        if (filters.visa_sponsorship) {
          q = q.eq("visa_sponsorship", true);
        }
        if (filters.is_remote) {
          q = q.eq("is_remote", true);
        }
        if (filters.location !== "All") {
          q = q.eq("location", filters.location);
        }
        if (filters.min_salary) {
          q = q.gte("salary_min", filters.min_salary);
        }
        if (filters.max_salary) {
          q = q.lte("salary_max", filters.max_salary);
        }
        if (filters.search) {
          q = q.or(`title.ilike.%${filters.search}%,company.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
        }
        return q;
      };

      // Apply filters
      countQuery = applyFilters(countQuery);
      dataQuery = applyFilters(dataQuery);

      // Execute count query
      const { count, error: countError } = await countQuery;
      if (countError) throw countError;

      // Calculate total pages
      const totalItems = count || 0;
      const calculatedPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
      setTotalPages(calculatedPages);

      // Reset to page 1 if current page exceeds total pages
      if (currentPage > calculatedPages && calculatedPages > 0) {
        setCurrentPage(1);
      }

      // Execute data query with pagination
      const { data, error: dataError } = await dataQuery
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (dataError) throw dataError;

      // Process jobs with additional stats
      const jobsWithStats = await Promise.all(
        (data || []).map(async (job: any) => {
          // Get application count
          const { count: appCount } = await supabase
            .from("job_applications")
            .select("id", { count: "exact" })
            .eq("job_id", job.id);

          // Get saved count
          const { count: savedCount } = await supabase
            .from("saved_jobs")
            .select("id", { count: "exact" })
            .eq("job_id", job.id);

          return {
            ...job,
            application_count: appCount || 0,
            saved_count: savedCount || 0,
            company_logo: job.company_logos?.logo_url,
          };
        })
      );

      setJobs(jobsWithStats);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Error",
        description: "Failed to load jobs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, toast]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Update search params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.category !== "All") params.set("category", filters.category);
    if (filters.job_type !== "All") params.set("job_type", filters.job_type);
    if (filters.experience_level !== "All") params.set("experience_level", filters.experience_level);
    if (filters.visa_sponsorship) params.set("visa_sponsorship", "true");
    if (filters.is_remote) params.set("is_remote", "true");
    if (filters.location !== "All") params.set("location", filters.location);
    if (filters.min_salary) params.set("min_salary", filters.min_salary.toString());
    if (filters.max_salary) params.set("max_salary", filters.max_salary?.toString() || "");
    if (filters.search) params.set("search", filters.search);
    
    setSearchParams(params);
  }, [filters, setSearchParams]);

  // Track job view
  const trackJobView = async (jobId: string) => {
    if (!viewedJobs.has(jobId)) {
      const updatedViewed = new Set(viewedJobs);
      updatedViewed.add(jobId);
      setViewedJobs(updatedViewed);
      localStorage.setItem("viewedJobs", JSON.stringify([...updatedViewed]));
      
      // Increment view count in database
      await supabase.rpc("increment_job_views", { job_id: jobId });
    }
  };

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
    trackJobView(job.id);
  };

  const handleSaveJob = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save jobs.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (savedJobs.has(jobId)) {
        // Unsave
        await supabase
          .from("saved_jobs")
          .delete()
          .eq("user_id", user.id)
          .eq("job_id", jobId);
        
        setSavedJobs(prev => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });

        toast({
          title: "Job removed",
          description: "Job removed from your saved list.",
        });
      } else {
        // Save
        await supabase
          .from("saved_jobs")
          .insert({
            user_id: user.id,
            job_id: jobId,
          });

        setSavedJobs(prev => new Set(prev).add(jobId));

        toast({
          title: "Job saved",
          description: "Job added to your saved list.",
        });
      }

      // Refresh job stats
      fetchJobs();
    } catch (error) {
      console.error("Error saving job:", error);
    }
  };

  const handleShareJob = async (job: Job) => {
    const shareUrl = `${window.location.origin}/jobs/${job.id}`;
    const shareText = `Check out this job: ${job.title} at ${job.company} - ${job.location}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: job.title,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied",
        description: "Job link copied to clipboard.",
      });
    }
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

    if (!userHasProfile) {
      toast({
        title: "Complete your profile",
        description: "Please complete your profile before applying for jobs.",
        variant: "destructive",
      });
      navigate("/profile");
      return;
    }

    if (!selectedJob) return;

    setApplying(true);
    try {
      const { error } = await supabase
        .from("job_applications")
        .insert({
          user_id: user.id,
          job_id: selectedJob.id,
          cover_letter: coverLetter || null,
          status: "applied",
          applied_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Create notification for user
      await supabase.from("notifications").insert({
        user_id: user.id,
        type: "job_application",
        title: "Job Application Submitted",
        message: `Your application for ${selectedJob.title} at ${selectedJob.company} has been submitted.`,
        read: false,
      });

      toast({
        title: "🎉 Application Submitted!",
        description: "Your job application has been submitted successfully.",
      });
      
      setSelectedJob(null);
      setCoverLetter("");
      
      // Refresh jobs to update application count
      fetchJobs();
    } catch (error: any) {
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
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (min: number | null, max: number | null, currency: string = "USD") => {
    if (!min && !max) return "Competitive salary";
    const symbol = currency === "USD" ? "$" : currency;
    if (min && max) return `${symbol}${min.toLocaleString()} - ${symbol}${max.toLocaleString()}`;
    if (min) return `From ${symbol}${min.toLocaleString()}`;
    return `Up to ${symbol}${max?.toLocaleString()}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No deadline";
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 7) return `${diffDays} days left`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks left`;
    return date.toLocaleDateString();
  };

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      category: "All",
      job_type: "All",
      experience_level: "All",
      visa_sponsorship: false,
      is_remote: false,
      min_salary: null,
      max_salary: null,
      location: "All",
      search: "",
    });
    setCurrentPage(1);
  };

  const isNewJob = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 3600 * 24));
    return diffDays <= 7;
  };

  // Calculate salary range for slider
  const salaryRange = useMemo(() => {
    const salaries = jobs
      .filter(job => job.salary_min !== null)
      .map(job => job.salary_min as number);
    
    if (salaries.length === 0) return [0, 200000];
    
    return [
      Math.min(...salaries),
      Math.max(...salaries.filter(s => s < 500000)) // Cap at 500k for reasonable range
    ];
  }, [jobs]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.category !== "All") count++;
    if (filters.job_type !== "All") count++;
    if (filters.experience_level !== "All") count++;
    if (filters.visa_sponsorship) count++;
    if (filters.is_remote) count++;
    if (filters.location !== "All") count++;
    if (filters.min_salary) count++;
    if (filters.max_salary) count++;
    if (filters.search) count++;
    return count;
  }, [filters]);

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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Briefcase className="w-4 h-4" />
              <span className="text-sm font-medium">Global Opportunities</span>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
              Find Your Dream Job Abroad
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Discover {jobStats.totalJobs.toLocaleString()}+ verified positions with visa sponsorship from employers worldwide.
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">{jobStats.totalJobs.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-emerald-600 mb-2">{jobStats.visaSponsorshipJobs.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Visa Sponsorship</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-amber-600 mb-2">{jobStats.remoteJobs.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Remote Jobs</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-purple-600 mb-2">{jobStats.featuredJobs.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Featured</p>
              </CardContent>
            </Card>
          </div>

          {/* Search & Filters */}
          <Card className="max-w-6xl mx-auto shadow-xl border">
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search job titles, companies, locations, or skills..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    className="pl-12 h-14 text-lg"
                  />
                </div>

                {/* Quick Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Filter className="w-4 h-4" />
                        Filters
                        {activeFiltersCount > 0 && (
                          <Badge variant="secondary" className="ml-1">
                            {activeFiltersCount}
                          </Badge>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle className="flex items-center justify-between">
                          <span>Filter Jobs</span>
                          {activeFiltersCount > 0 && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                              <X className="w-3 h-3" />
                              Clear All
                            </Button>
                          )}
                        </SheetTitle>
                      </SheetHeader>
                      <div className="py-6 space-y-6">
                        {/* Category */}
                        <div>
                          <Label className="mb-2 block">Category</Label>
                          <Select 
                            value={filters.category} 
                            onValueChange={(value) => handleFilterChange("category", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="All">All Categories</SelectItem>
                              {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Job Type */}
                        <div>
                          <Label className="mb-2 block">Job Type</Label>
                          <Select 
                            value={filters.job_type} 
                            onValueChange={(value) => handleFilterChange("job_type", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select job type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="All">All Types</SelectItem>
                              {jobTypes.map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Experience Level */}
                        <div>
                          <Label className="mb-2 block">Experience Level</Label>
                          <Select 
                            value={filters.experience_level} 
                            onValueChange={(value) => handleFilterChange("experience_level", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select experience" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="All">All Levels</SelectItem>
                              {experienceLevels.map((level) => (
                                <SelectItem key={level} value={level}>{level}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Location */}
                        <div>
                          <Label className="mb-2 block">Location</Label>
                          <Select 
                            value={filters.location} 
                            onValueChange={(value) => handleFilterChange("location", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="All">All Locations</SelectItem>
                              {locations.map((loc) => (
                                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Salary Range */}
                        <div>
                          <Label className="mb-2 block">Salary Range</Label>
                          <div className="space-y-4">
                            <Slider
                              min={salaryRange[0]}
                              max={salaryRange[1]}
                              step={10000}
                              value={[
                                filters.min_salary || salaryRange[0],
                                filters.max_salary || salaryRange[1]
                              ]}
                              onValueChange={(value) => {
                                handleFilterChange("min_salary", value[0]);
                                handleFilterChange("max_salary", value[1]);
                              }}
                              className="mt-2"
                            />
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>${(filters.min_salary || salaryRange[0]).toLocaleString()}</span>
                              <span>${(filters.max_salary || salaryRange[1]).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Toggles */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="visa-sponsorship" className="cursor-pointer">
                              <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                <span>Visa Sponsorship</span>
                              </div>
                            </Label>
                            <Switch
                              id="visa-sponsorship"
                              checked={filters.visa_sponsorship}
                              onCheckedChange={(checked) => handleFilterChange("visa_sponsorship", checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="remote" className="cursor-pointer">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>Remote Only</span>
                              </div>
                            </Label>
                            <Switch
                              id="remote"
                              checked={filters.is_remote}
                              onCheckedChange={(checked) => handleFilterChange("is_remote", checked)}
                            />
                          </div>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* Active filters */}
                  <div className="flex flex-wrap gap-2 flex-1">
                    {filters.category !== "All" && (
                      <Badge variant="secondary" className="gap-1">
                        {filters.category}
                        <button onClick={() => handleFilterChange("category", "All")}>
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {filters.visa_sponsorship && (
                      <Badge variant="secondary" className="gap-1">
                        <BadgeCheck className="w-3 h-3" />
                        Visa Sponsorship
                        <button onClick={() => handleFilterChange("visa_sponsorship", false)}>
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {filters.is_remote && (
                      <Badge variant="secondary" className="gap-1">
                        <MapPin className="w-3 h-3" />
                        Remote
                        <button onClick={() => handleFilterChange("is_remote", false)}>
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {filters.search && (
                      <Badge variant="secondary" className="gap-1">
                        Search: {filters.search}
                        <button onClick={() => handleFilterChange("search", "")}>
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Jobs Grid */}
      <section className="py-12">
        <div className="container-wide">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar - Featured Jobs */}
            <div className="lg:col-span-1">
              <Card className="sticky top-28">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" />
                    Quick Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant={filters.visa_sponsorship ? "default" : "outline"} 
                    className="w-full justify-start gap-2"
                    onClick={() => handleFilterChange("visa_sponsorship", !filters.visa_sponsorship)}
                  >
                    <BadgeCheck className="w-4 h-4" />
                    Visa Sponsorship ({jobStats.visaSponsorshipJobs})
                  </Button>
                  <Button 
                    variant={filters.is_remote ? "default" : "outline"} 
                    className="w-full justify-start gap-2"
                    onClick={() => handleFilterChange("is_remote", !filters.is_remote)}
                  >
                    <MapPin className="w-4 h-4" />
                    Remote Jobs ({jobStats.remoteJobs})
                  </Button>
                  <Button 
                    variant={filters.category === "Technology" ? "default" : "outline"} 
                    className="w-full justify-start"
                    onClick={() => handleFilterChange("category", filters.category === "Technology" ? "All" : "Technology")}
                  >
                    Tech Jobs
                  </Button>
                  <Button 
                    variant={filters.category === "Healthcare" ? "default" : "outline"} 
                    className="w-full justify-start"
                    onClick={() => handleFilterChange("category", filters.category === "Healthcare" ? "All" : "Healthcare")}
                  >
                    Healthcare Jobs
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {loading ? "Loading jobs..." : `${jobs.length} of ${jobStats.totalJobs} Jobs`}
                  </h2>
                  <p className="text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Select 
                    value={currentPage.toString()} 
                    onValueChange={(value) => setCurrentPage(parseInt(value))}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue placeholder="Page" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          Page {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Loading job opportunities...</p>
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">No jobs found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters or search terms
                  </p>
                  <Button onClick={clearFilters} variant="outline">
                    Clear All Filters
                  </Button>
                </div>
              ) : (
                <>
                  {/* Jobs Grid */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <AnimatePresence>
                      {jobs.map((job, index) => (
                        <motion.div
                          key={job.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.03 }}
                          className="group"
                        >
                          <Card className="h-full hover:shadow-xl hover:border-primary/30 transition-all duration-300 overflow-hidden">
                            <CardContent className="p-0">
                              <div className="p-6">
                                {/* Job Header */}
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                      {job.company_logo ? (
                                        <img 
                                          src={job.company_logo} 
                                          alt={job.company}
                                          className="w-8 h-8 object-contain"
                                        />
                                      ) : (
                                        <Building2 className="w-6 h-6 text-primary" />
                                      )}
                                    </div>
                                    <div>
                                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                        {job.title}
                                      </h3>
                                      <p className="text-sm text-muted-foreground">{job.company}</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={(e) => handleSaveJob(job.id, e)}
                                    >
                                      <Heart className={`w-4 h-4 ${savedJobs.has(job.id) ? "fill-red-500 text-red-500" : ""}`} />
                                    </Button>
                                  </div>
                                </div>

                                {/* Badges */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {job.visa_sponsorship && (
                                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 gap-1">
                                      <BadgeCheck className="w-3 h-3" />
                                      Visa Sponsorship
                                    </Badge>
                                  )}
                                  {job.is_featured && (
                                    <Badge variant="outline" className="border-amber-200 text-amber-700 dark:text-amber-300">
                                      <Star className="w-3 h-3 mr-1" />
                                      Featured
                                    </Badge>
                                  )}
                                  {isNewJob(job.created_at) && (
                                    <Badge variant="secondary">New</Badge>
                                  )}
                                  {job.is_remote && (
                                    <Badge variant="outline">Remote</Badge>
                                  )}
                                </div>

                                {/* Description */}
                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                  {job.description}
                                </p>

                                {/* Meta Info */}
                                <div className="space-y-3 mb-4">
                                  <div className="flex flex-wrap gap-4 text-sm">
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                      <MapPin className="w-4 h-4" />
                                      {job.location}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                      <DollarSign className="w-4 h-4" />
                                      {formatSalary(job.salary_min, job.salary_max, job.salary_currency || "USD")}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                      <Clock className="w-4 h-4" />
                                      {job.job_type || "Full-time"}
                                    </div>
                                  </div>
                                  {job.application_deadline && (
                                    <div className="text-xs text-muted-foreground">
                                      Apply by: {formatDate(job.application_deadline)}
                                    </div>
                                  )}
                                </div>

                                {/* Stats */}
                                <div className="flex items-center justify-between pt-4 border-t">
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Users className="w-3 h-3" />
                                      {job.application_count || 0} applicants
                                    </div>
                                  </div>
                                  <Button 
                                    size="sm"
                                    onClick={() => handleJobSelect(job)}
                                    className="gap-2"
                                  >
                                    Apply Now
                                    <ArrowRight className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t">
                      <div className="text-sm text-muted-foreground">
                        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, jobStats.totalJobs)} of {jobStats.totalJobs} jobs
                      </div>
                      <div className="flex items-center gap-2">
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
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Apply Dialog */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedJob?.title}</DialogTitle>
            <DialogDescription className="text-lg">
              {selectedJob?.company} • {selectedJob?.location}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Salary and Type */}
            <div className="flex flex-wrap gap-4">
              <Badge variant="outline" className="gap-1">
                <DollarSign className="w-4 h-4" />
                {formatSalary(selectedJob?.salary_min || null, selectedJob?.salary_max || null, selectedJob?.salary_currency || "USD")}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="w-4 h-4" />
                {selectedJob?.job_type || "Full-time"}
              </Badge>
              {selectedJob?.experience_level && (
                <Badge variant="outline" className="gap-1">
                  <Award className="w-4 h-4" />
                  {selectedJob.experience_level}
                </Badge>
              )}
            </div>

            {/* Description */}
            {selectedJob?.description && (
              <div>
                <h4 className="font-medium text-foreground mb-2">Job Description</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {selectedJob.description}
                </p>
              </div>
            )}

            {/* Requirements */}
            {selectedJob?.requirements && selectedJob.requirements.length > 0 && (
              <div>
                <h4 className="font-medium text-foreground mb-2">Requirements</h4>
                <ul className="space-y-2">
                  {selectedJob.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills */}
            {selectedJob?.skills_required && selectedJob.skills_required.length > 0 && (
              <div>
                <h4 className="font-medium text-foreground mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.skills_required.map((skill, i) => (
                    <Badge key={i} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits */}
            {selectedJob?.benefits && selectedJob.benefits.length > 0 && (
              <div>
                <h4 className="font-medium text-foreground mb-2">Benefits & Perks</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.benefits.map((benefit, i) => (
                    <Badge key={i} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Cover Letter */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Cover Letter (Optional)
              </label>
              <Textarea
                placeholder="Tell us why you're interested in this position and why you'd be a great fit..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                A well-written cover letter can increase your chances of getting an interview.
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              {userHasProfile ? "Your profile is complete" : "Complete your profile to apply"}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setSelectedJob(null)}>
                Cancel
              </Button>
              <Button 
                onClick={handleApply} 
                disabled={applying || !userHasProfile}
                className="gap-2"
              >
                {applying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : !userHasProfile ? (
                  "Complete Profile First"
                ) : (
                  "Submit Application"
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Jobs;
