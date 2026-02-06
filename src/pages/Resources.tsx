 import { motion } from "framer-motion";
 import { useTranslation } from "react-i18next";
 import { FileText, Download, BookOpen, Calculator, FileCheck, Globe2, Briefcase, Plane } from "lucide-react";
 import { Navbar } from "@/components/layout/Navbar";
 import { Footer } from "@/components/layout/Footer";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { usePageSEO } from "@/hooks/usePageSEO";
 
 const guides = [
   { icon: BookOpen, title: "Complete Immigration Guide 2026", desc: "Step-by-step walkthrough of the entire immigration process", format: "PDF", pages: "45 pages" },
   { icon: FileCheck, title: "Document Preparation Checklist", desc: "Comprehensive list of all required documents", format: "PDF", pages: "12 pages" },
   { icon: Globe2, title: "Country Comparison Guide", desc: "Compare USA, Canada, and UK immigration paths", format: "PDF", pages: "28 pages" },
   { icon: Briefcase, title: "Interview Preparation Guide", desc: "Common questions and best practices for visa interviews", format: "PDF", pages: "18 pages" },
 ];
 
 const templates = [
   { title: "Cover Letter Template", desc: "Professional cover letter format for job applications", format: "DOCX" },
   { title: "Resume/CV Template", desc: "ATS-friendly resume template for international jobs", format: "DOCX" },
   { title: "Reference Letter Template", desc: "Template for requesting professional references", format: "DOCX" },
   { title: "Statement of Purpose Template", desc: "Guide for writing your immigration statement", format: "DOCX" },
 ];
 
 const tools = [
   { icon: Calculator, title: "Points Calculator", desc: "Calculate your Express Entry CRS score", action: "Use Tool" },
   { icon: Plane, title: "Timeline Estimator", desc: "Estimate your visa processing timeline", action: "Use Tool" },
   { icon: FileText, title: "Document Validator", desc: "Check if your documents meet requirements", action: "Use Tool" },
 ];
 
 const Resources = () => {
   const { t } = useTranslation();
   usePageSEO({ title: "Resources", description: "Download free immigration guides, document templates, and preparation tools.", canonical: "/resources" });
 
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
               {t("resources.title")}
             </h1>
             <p className="text-lg text-muted-foreground">
               {t("resources.subtitle")}
             </p>
           </motion.div>
         </div>
       </section>
 
       {/* Guides */}
       <section className="py-16">
         <div className="container-wide">
           <h2 className="font-heading text-2xl font-bold text-foreground mb-8">
             {t("resources.guides")}
           </h2>
           <div className="grid md:grid-cols-2 gap-6">
             {guides.map((guide, i) => (
               <motion.div
                 key={guide.title}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 className="flex gap-5 bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow"
               >
                 <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                   <guide.icon className="w-7 h-7 text-primary" />
                 </div>
                 <div className="flex-1">
                   <h3 className="font-heading text-lg font-semibold text-foreground mb-1">
                     {guide.title}
                   </h3>
                   <p className="text-sm text-muted-foreground mb-3">{guide.desc}</p>
                   <div className="flex items-center gap-3">
                     <Badge variant="secondary">{guide.format}</Badge>
                     <span className="text-xs text-muted-foreground">{guide.pages}</span>
                   </div>
                 </div>
                 <Button variant="outline" size="icon" className="flex-shrink-0">
                   <Download className="w-4 h-4" />
                 </Button>
               </motion.div>
             ))}
           </div>
         </div>
       </section>
 
       {/* Templates */}
       <section className="py-16 bg-muted/30">
         <div className="container-wide">
           <h2 className="font-heading text-2xl font-bold text-foreground mb-8">
             {t("resources.templates")}
           </h2>
           <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {templates.map((template, i) => (
               <motion.div
                 key={template.title}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 className="bg-card rounded-xl border border-border p-6 text-center hover:shadow-lg transition-shadow"
               >
                 <FileText className="w-10 h-10 text-primary mx-auto mb-4" />
                 <h3 className="font-heading text-base font-semibold text-foreground mb-2">
                   {template.title}
                 </h3>
                 <p className="text-xs text-muted-foreground mb-4">{template.desc}</p>
                 <Button variant="outline" size="sm" className="gap-2">
                   <Download className="w-4 h-4" />
                   {t("resources.download")}
                 </Button>
               </motion.div>
             ))}
           </div>
         </div>
       </section>
 
       {/* Tools */}
       <section className="py-16">
         <div className="container-wide">
           <h2 className="font-heading text-2xl font-bold text-foreground mb-8">
             {t("resources.tools")}
           </h2>
           <div className="grid md:grid-cols-3 gap-6">
             {tools.map((tool, i) => (
               <motion.div
                 key={tool.title}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow"
               >
                 <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                   <tool.icon className="w-6 h-6 text-secondary" />
                 </div>
                 <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                   {tool.title}
                 </h3>
                 <p className="text-sm text-muted-foreground mb-4">{tool.desc}</p>
                 <Button variant="outline">{tool.action}</Button>
               </motion.div>
             ))}
           </div>
         </div>
       </section>
 
       <Footer />
     </div>
   );
 };
 
 export default Resources;