import { motion } from "framer-motion";
import { Shield, Award, Users, Globe, CheckCircle, FileCheck } from "lucide-react";

const indicators = [
  {
    icon: Shield,
    title: "Verified Employers",
    description: "All partner companies are thoroughly vetted and legally compliant",
  },
  {
    icon: FileCheck,
    title: "Transparent Fees",
    description: "Clear pricing with no hidden costs. Pay per milestone or upfront.",
  },
  {
    icon: Users,
    title: "50,000+ Placed",
    description: "Helping professionals from 45+ countries find their path to the USA.",
  },
  {
    icon: Award,
    title: "Award-Winning",
    description: "Recognized as Top Immigration Support Service 2026.",
  },
  {
    icon: Globe,
    title: "Global Coverage",
    description: "Supporting applicants from Australia, South Asia, Latin America, and more.",
  },
  {
    icon: CheckCircle,
    title: "98% Success Rate",
    description: "Industry-leading approval rate for visa sponsorship applications.",
  },
];

export const TrustIndicators = () => {
  return (
    <section className="py-20 bg-card border-y border-border">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Trust Carewell Supports?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We combine technology with personalized support to make your immigration journey smooth and successful.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {indicators.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group p-6 rounded-xl bg-background border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
