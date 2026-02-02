import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Shield, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-image.jpg";

const trustBadges = [
  { icon: Shield, text: "Verified Employers" },
  { icon: Users, text: "10,000+ Success Stories" },
  { icon: Award, text: "Top Rated 2026" },
];

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div 
          className="absolute top-0 right-0 w-1/2 h-full bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container-wide relative z-10 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success mb-6"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">Trusted by 50,000+ Applicants</span>
            </motion.div>

            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Your Pathway to{" "}
              <span className="text-gradient-primary">Legal Work</span>{" "}
              in the USA
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
              Carewell Supports helps you migrate, secure jobs, and travel safely with complete transparency and premium support every step of the way.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <Link to="/apply">
                <Button size="lg" className="gap-2 text-base px-8 h-14 shadow-lg hover:shadow-xl transition-shadow">
                  Start Application
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/jobs">
                <Button size="lg" variant="outline" className="gap-2 text-base px-8 h-14">
                  View Jobs
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6">
              {trustBadges.map((badge, index) => (
                <motion.div
                  key={badge.text}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <badge.icon className="w-5 h-5 text-primary" />
                  <span>{badge.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative hidden lg:block"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={heroImage}
                alt="Professionals arriving for new opportunities"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
            </div>

            {/* Floating Stats Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="absolute -bottom-6 -left-6 bg-card rounded-xl p-6 shadow-xl border border-border"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-foreground">98%</p>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </motion.div>

            {/* Floating Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              className="absolute -top-4 -right-4 bg-primary text-primary-foreground rounded-xl px-4 py-2 shadow-lg"
            >
              <p className="text-sm font-medium">ISO Certified</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
