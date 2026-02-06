 import { useState } from "react";
 import { motion } from "framer-motion";
 import { useTranslation } from "react-i18next";
 import { Calendar, Clock, ArrowRight, User, Tag } from "lucide-react";
 import { Link } from "react-router-dom";
 import { Navbar } from "@/components/layout/Navbar";
 import { Footer } from "@/components/layout/Footer";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { usePageSEO } from "@/hooks/usePageSEO";
 
 const posts = [
   {
     id: 1,
     title: "Complete Guide to H-1B Visa Application in 2026",
     excerpt: "Everything you need to know about the H-1B visa process, from eligibility to interview tips.",
     category: "Visa Guide",
     author: "Sarah Chen",
     date: "Jan 15, 2026",
     readTime: "8 min read",
     image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=400&fit=crop",
     featured: true,
   },
   {
     id: 2,
     title: "Top 10 In-Demand Jobs for Immigrants in Canada",
     excerpt: "Discover which professions have the highest demand and best visa sponsorship opportunities.",
     category: "Career Tips",
     author: "Michael Roberts",
     date: "Jan 12, 2026",
     readTime: "5 min read",
     image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop",
   },
   {
     id: 3,
     title: "How to Prepare for Your UK Skilled Worker Visa Interview",
     excerpt: "Expert tips and common questions to help you succeed in your visa interview.",
     category: "Visa Guide",
     author: "Emma Thompson",
     date: "Jan 10, 2026",
     readTime: "6 min read",
     image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=400&fit=crop",
   },
   {
     id: 4,
     title: "Understanding Express Entry: A Complete Breakdown",
     excerpt: "Navigate Canada's Express Entry system with our comprehensive step-by-step guide.",
     category: "Immigration",
     author: "David Kim",
     date: "Jan 8, 2026",
     readTime: "10 min read",
     image: "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=600&h=400&fit=crop",
   },
   {
     id: 5,
     title: "Success Story: From Mumbai to Manhattan",
     excerpt: "Read how Priya landed her dream job as a software engineer in New York.",
     category: "Success Stories",
     author: "Carewell Team",
     date: "Jan 5, 2026",
     readTime: "4 min read",
     image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&h=400&fit=crop",
   },
   {
     id: 6,
     title: "Essential Documents Checklist for Immigration",
     excerpt: "Make sure you have everything ready with our comprehensive document checklist.",
     category: "Guides",
     author: "Lisa Wang",
     date: "Jan 3, 2026",
     readTime: "3 min read",
     image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=400&fit=crop",
   },
 ];
 
 const categories = ["All", "Visa Guide", "Career Tips", "Immigration", "Success Stories", "Guides"];
 
 const Blog = () => {
   const { t } = useTranslation();
   const [activeCategory, setActiveCategory] = useState("All");
   usePageSEO({ title: "Blog", description: "Immigration insights, visa guides, and career tips for professionals seeking work abroad.", canonical: "/blog" });
 
   const filteredPosts = activeCategory === "All" 
     ? posts 
     : posts.filter((p) => p.category === activeCategory);
 
   const featuredPost = posts.find((p) => p.featured);
 
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
               {t("blog.title")}
             </h1>
             <p className="text-lg text-muted-foreground">
               {t("blog.subtitle")}
             </p>
           </motion.div>
         </div>
       </section>
 
       {/* Featured Post */}
       {featuredPost && (
         <section className="py-8">
           <div className="container-wide">
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="relative bg-card rounded-2xl border border-border overflow-hidden"
             >
               <div className="grid lg:grid-cols-2">
                 <div className="aspect-video lg:aspect-auto">
                   <img
                     src={featuredPost.image}
                     alt={featuredPost.title}
                     className="w-full h-full object-cover"
                   />
                 </div>
                 <div className="p-8 lg:p-12 flex flex-col justify-center">
                   <Badge className="w-fit mb-4">{featuredPost.category}</Badge>
                   <h2 className="font-heading text-2xl lg:text-3xl font-bold text-foreground mb-4">
                     {featuredPost.title}
                   </h2>
                   <p className="text-muted-foreground mb-6">{featuredPost.excerpt}</p>
                   <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                     <span className="flex items-center gap-1">
                       <User className="w-4 h-4" />
                       {featuredPost.author}
                     </span>
                     <span className="flex items-center gap-1">
                       <Calendar className="w-4 h-4" />
                       {featuredPost.date}
                     </span>
                     <span className="flex items-center gap-1">
                       <Clock className="w-4 h-4" />
                       {featuredPost.readTime}
                     </span>
                   </div>
                   <Button className="w-fit gap-2">
                     {t("blog.readMore")}
                     <ArrowRight className="w-4 h-4" />
                   </Button>
                 </div>
               </div>
             </motion.div>
           </div>
         </section>
       )}
 
       {/* Categories & Posts */}
       <section className="py-12">
         <div className="container-wide">
           {/* Categories */}
           <div className="flex flex-wrap gap-3 mb-10">
             {categories.map((cat) => (
               <button
                 key={cat}
                 onClick={() => setActiveCategory(cat)}
                 className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                   activeCategory === cat
                     ? "bg-primary text-primary-foreground"
                     : "bg-card border border-border hover:border-primary"
                 }`}
               >
                 {cat}
               </button>
             ))}
           </div>
 
           {/* Posts Grid */}
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
             {filteredPosts.filter(p => !p.featured || activeCategory !== "All").map((post, i) => (
               <motion.article
                 key={post.id}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
               >
                 <div className="aspect-video overflow-hidden">
                   <img
                     src={post.image}
                     alt={post.title}
                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                   />
                 </div>
                 <div className="p-6">
                   <Badge variant="secondary" className="mb-3">{post.category}</Badge>
                   <h3 className="font-heading text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                     {post.title}
                   </h3>
                   <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>
                   <div className="flex items-center gap-4 text-xs text-muted-foreground">
                     <span className="flex items-center gap-1">
                       <Calendar className="w-3 h-3" />
                       {post.date}
                     </span>
                     <span className="flex items-center gap-1">
                       <Clock className="w-3 h-3" />
                       {post.readTime}
                     </span>
                   </div>
                 </div>
               </motion.article>
             ))}
           </div>
         </div>
       </section>
 
       <Footer />
     </div>
   );
 };
 
 export default Blog;