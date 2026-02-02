import { motion } from "framer-motion";
import { UserPlus, FileText, Briefcase, Plane, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create Account",
    description: "Sign up with your email or social login and complete your profile with your qualifications and desired destination.",
  },
  {
    icon: FileText,
    step: "02",
    title: "Submit Documents",
    description: "Upload your documents securely. Our AI validates them instantly and requests any missing information.",
  },
  {
    icon: Briefcase,
    step: "03",
    title: "Get Job Matched",
    description: "Browse verified job listings or let our smart matching system find the perfect opportunities for your skills.",
  },
  {
    icon: Plane,
    step: "04",
    title: "Visa & Travel",
    description: "We handle your visa processing and can assist with travel arrangements once everything is approved.",
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-background">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Simple Process
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            From application to arrival, we guide you through every step of your journey.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="relative"
              >
                {/* Step Number Circle */}
                <div className="relative z-10 flex justify-center lg:justify-start mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg">
                    <item.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                </div>

                {/* Content */}
                <div className="text-center lg:text-left">
                  <span className="inline-block text-5xl font-heading font-bold text-primary/10 mb-2">
                    {item.step}
                  </span>
                  <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-success/10 border border-success/20">
            <CheckCircle2 className="w-6 h-6 text-success" />
            <span className="text-foreground font-medium">
              Average processing time: <strong className="text-success">4-8 weeks</strong>
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
