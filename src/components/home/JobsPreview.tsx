import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, DollarSign, Clock, BadgeCheck, ArrowRight, Building2, Heart, Code, Wrench, UtensilsCrossed, Loader2, Tractor, Truck, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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
}

interface CategoryCount {
  name: string;
  count: number;
  icon: React.ElementType;
}

const categoryIcons: Record<string, React.ElementType> = {
  Healthcare: Heart,
  Technology: Code,
  Construction: Wrench,
  Hospitality: UtensilsCrossed,
  Agriculture: Tractor,
  Logistics: Truck,
  Education: GraduationCap,
};

export const JobsPreview = () => {
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch featured jobs
      const { data: jobsData } = await supabase
        .from("jobs")
        .select("*")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(3);

      setFeaturedJobs(jobsData || []);

      // Fetch category counts
      const { data: allJobs } = await supabase
        .from("jobs")
        .select("category");

      if (allJobs) {
        const counts: Record<string, number> = {};
        allJobs.forEach((job) => {
          if (job.category) {
            counts[job.category] = (counts[job.category] || 0) + 1;
          }
        });

        const categoryList: CategoryCount[] = Object.entries(counts)
          .map(([name, count]) => ({
            name,
            count,
            icon: categoryIcons[name] || Building2,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);

        setCategories(categoryList);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return "Competitive";
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    return `Up to $${max?.toLocaleString()}`;
  };

  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium mb-4">
            Job Opportunities
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Find Your Dream Job
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Browse hundreds of visa-sponsored positions from verified employers across the USA.
          </p>
        </motion.div>

        {/* Job Categories */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-wrap justify-center gap-4 mb-12"
            >
              {categories.map((category) => (
                <Link
                  to={`/jobs?category=${encodeURIComponent(category.name)}`}
                  key={category.name}
                  className="flex items-center gap-2 px-5 py-3 rounded-full bg-card border border-border hover:border-primary hover:shadow-md transition-all duration-200"
                >
                  <category.icon className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">{category.name}</span>
                  <Badge variant="secondary" className="ml-1">
                    {category.count}
                  </Badge>
                </Link>
              ))}
            </motion.div>

            {/* Featured Jobs */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {featuredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                  className="group bg-card rounded-xl border border-border p-6 hover:shadow-xl hover:border-primary/30 transition-all duration-300"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    {job.visa_sponsorship && (
                      <Badge className="bg-success/10 text-success border-success/20 gap-1">
                        <BadgeCheck className="w-3.5 h-3.5" />
                        Visa Sponsored
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <h3 className="font-heading text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">{job.company}</p>

                  {/* Meta */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="w-4 h-4" />
                      {formatSalary(job.salary_min, job.salary_max)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {job.job_type || "Full-time"}
                    </div>
                  </div>

                  {/* CTA */}
                  <Link to="/jobs">
                    <Button className="w-full gap-2 group-hover:shadow-md transition-shadow">
                      Apply Now
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center"
        >
          <Link to="/jobs">
            <Button size="lg" variant="outline" className="gap-2">
              View All Jobs
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
