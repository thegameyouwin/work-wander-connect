 import { useState, useEffect } from "react";
 import { motion } from "framer-motion";
 import { useTranslation } from "react-i18next";
 import { Star, MapPin, ArrowRight, Quote, Loader2 } from "lucide-react";
 import { Navbar } from "@/components/layout/Navbar";
 import { Footer } from "@/components/layout/Footer";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { supabase } from "@/integrations/supabase/client";
 
 interface Story {
   id: string;
   name: string;
   role: string;
   origin_country: string;
   current_location: string;
   image_url: string | null;
   quote: string;
   rating: number;
 }
 
 const SuccessStories = () => {
   const { t } = useTranslation();
   const [stories, setStories] = useState<Story[]>([]);
   const [loading, setLoading] = useState(true);
 
   useEffect(() => {
     const fetch = async () => {
       const { data } = await supabase
         .from("testimonials")
         .select("*")
         .order("created_at", { ascending: false });
       setStories(data || []);
       setLoading(false);
     };
     fetch();
   }, []);
 
   return (
     <div className="min-h-screen bg-background">
       <Navbar />
 
       {/* Hero */}
       <section className="pt-28 pb-16 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
         <div className="container-wide">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="text-center max-w-3xl mx-auto"
           >
             <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
               {t("successStories.title")}
             </h1>
             <p className="text-lg text-muted-foreground">
               {t("successStories.subtitle")}
             </p>
           </motion.div>
         </div>
       </section>
 
       {/* Stories */}
       <section className="py-16">
         <div className="container-wide">
           {loading ? (
             <div className="flex justify-center py-12">
               <Loader2 className="w-8 h-8 animate-spin text-primary" />
             </div>
           ) : (
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
               {stories.map((story, i) => (
                 <motion.div
                   key={story.id}
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: i * 0.1 }}
                   className="bg-card rounded-2xl border border-border p-6 hover:shadow-xl transition-shadow"
                 >
                   <div className="flex items-center gap-4 mb-4">
                     <img
                       src={story.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(story.name)}&background=random`}
                       alt={story.name}
                       className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                     />
                     <div>
                       <h3 className="font-heading text-lg font-semibold text-foreground">
                         {story.name}
                       </h3>
                       <p className="text-sm text-primary">{story.role}</p>
                     </div>
                   </div>
 
                   <div className="flex gap-1 mb-4">
                     {Array.from({ length: story.rating }).map((_, i) => (
                       <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                     ))}
                   </div>
 
                   <div className="relative mb-4">
                     <Quote className="absolute -top-2 -left-1 w-6 h-6 text-primary/20" />
                     <p className="text-muted-foreground pl-5 italic line-clamp-4">
                       "{story.quote}"
                     </p>
                   </div>
 
                   <div className="flex items-center gap-2 text-sm text-muted-foreground">
                     <MapPin className="w-4 h-4" />
                     <span>{story.origin_country} → {story.current_location}</span>
                   </div>
                 </motion.div>
               ))}
             </div>
           )}
 
           {stories.length === 0 && !loading && (
             <div className="text-center py-12">
               <p className="text-muted-foreground">No stories available yet.</p>
             </div>
           )}
         </div>
       </section>
 
       <Footer />
     </div>
   );
 };
 
 export default SuccessStories;