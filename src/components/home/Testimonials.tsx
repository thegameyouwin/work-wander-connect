import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  origin_country: string;
  current_location: string;
  image_url: string | null;
  quote: string;
  rating: number;
}

export const Testimonials = () => {
  const [current, setCurrent] = useState(0);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_featured", true)
        .order("created_at", { ascending: false });

      if (data && !error) {
        setTestimonials(data);
      }
      setLoading(false);
    };

    fetchTestimonials();
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  if (loading) {
    return (
      <section className="py-20 lg:py-28 bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section id="testimonials" className="py-20 lg:py-28 bg-background overflow-hidden">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium mb-4">
            Success Stories
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Hear From Our Community
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Real stories from people who successfully relocated with our help.
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Testimonial Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="relative bg-card rounded-2xl border border-border p-8 md:p-12 shadow-lg"
            >
              {/* Quote Icon */}
              <div className="absolute top-8 right-8 w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center">
                <Quote className="w-8 h-8 text-primary/30" />
              </div>

              {/* Content */}
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <img
                    src={testimonials[current].image_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"}
                    alt={testimonials[current].name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
                  />
                </div>

                {/* Text */}
                <div className="flex-1 text-center md:text-left">
                  {/* Stars */}
                  <div className="flex gap-1 justify-center md:justify-start mb-4">
                    {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                    ))}
                  </div>

                  <blockquote className="text-lg md:text-xl text-foreground mb-6 leading-relaxed">
                    "{testimonials[current].quote}"
                  </blockquote>

                  <div>
                    <p className="font-heading text-xl font-semibold text-foreground">
                      {testimonials[current].name}
                    </p>
                    <p className="text-primary font-medium">
                      {testimonials[current].role}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      From {testimonials[current].origin_country} → Now in {testimonials[current].current_location}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === current
                      ? "bg-primary w-8"
                      : "bg-muted hover:bg-primary/50"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
