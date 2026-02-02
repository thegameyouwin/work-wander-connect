import { motion } from "framer-motion";
import { MapPin, DollarSign, Clock, BadgeCheck, ArrowRight, Building2, Heart, Code, Wrench, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const jobCategories = [
  { icon: Heart, name: "Healthcare", count: 245 },
  { icon: Code, name: "IT & Tech", count: 189 },
  { icon: Wrench, name: "Construction", count: 156 },
  { icon: UtensilsCrossed, name: "Hospitality", count: 134 },
  { icon: Building2, name: "Skilled Trades", count: 178 },
];

const featuredJobs = [
  {
    id: 1,
    title: "Registered Nurse",
    company: "NYC Health System",
    location: "New York, NY",
    salary: "$75,000 - $95,000",
    type: "Full-time",
    sponsored: true,
    category: "Healthcare",
  },
  {
    id: 2,
    title: "Software Engineer",
    company: "Tech Innovations Inc",
    location: "San Francisco, CA",
    salary: "$120,000 - $160,000",
    type: "Full-time",
    sponsored: true,
    category: "IT & Tech",
  },
  {
    id: 3,
    title: "Construction Manager",
    company: "BuildRight Corp",
    location: "Austin, TX",
    salary: "$85,000 - $110,000",
    type: "Full-time",
    sponsored: true,
    category: "Construction",
  },
];

export const JobsPreview = () => {
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {jobCategories.map((category) => (
            <button
              key={category.name}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-card border border-border hover:border-primary hover:shadow-md transition-all duration-200"
            >
              <category.icon className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">{category.name}</span>
              <Badge variant="secondary" className="ml-1">
                {category.count}
              </Badge>
            </button>
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
                {job.sponsored && (
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
                  {job.salary}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {job.type}
                </div>
              </div>

              {/* CTA */}
              <Button className="w-full gap-2 group-hover:shadow-md transition-shadow">
                Apply Now
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
        </div>

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
