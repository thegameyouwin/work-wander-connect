import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Headphones, MessageCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CTASection = () => {
  return (
    <section id="contact" className="py-20 lg:py-28 bg-primary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-primary-foreground blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-primary-foreground blur-3xl" />
      </div>

      <div className="container-wide relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-lg">
              Join thousands of successful applicants who've built their new life in the USA with Carewell Supports.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/apply">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="gap-2 text-base px-8 h-14"
                >
                  Start Free Application
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline"
                className="gap-2 text-base px-8 h-14 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Headphones className="w-5 h-5" />
                Talk to an Expert
              </Button>
            </div>
          </motion.div>

          {/* Contact Options */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="grid sm:grid-cols-2 gap-4"
          >
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-6 border border-primary-foreground/20">
              <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-primary-foreground mb-2">
                Live Chat
              </h3>
              <p className="text-primary-foreground/70 text-sm mb-4">
                Get instant answers from our AI-powered support.
              </p>
              <Button variant="link" className="p-0 h-auto text-primary-foreground underline">
                Start Chat →
              </Button>
            </div>

            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-6 border border-primary-foreground/20">
              <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center mb-4">
                <Headphones className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-primary-foreground mb-2">
                Schedule Call
              </h3>
              <p className="text-primary-foreground/70 text-sm mb-4">
                Book a free consultation with our experts.
              </p>
              <Button variant="link" className="p-0 h-auto text-primary-foreground underline">
                Book Now →
              </Button>
            </div>

            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-6 border border-primary-foreground/20 sm:col-span-2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-lg font-semibold text-primary-foreground">
                    Email Us
                  </h3>
                  <a 
                    href="mailto:hr@carewellsupports.com" 
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    hr@carewellsupports.com
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
