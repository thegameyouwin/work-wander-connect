 import { motion } from "framer-motion";
 import { useTranslation } from "react-i18next";
 import { Building2, Users, Globe2, Handshake, ArrowRight, CheckCircle, Sparkles } from "lucide-react";
 import { Link } from "react-router-dom";
 import { Navbar } from "@/components/layout/Navbar";
 import { Footer } from "@/components/layout/Footer";
 import { Button } from "@/components/ui/button";
 
 const partnerTypes = [
   {
     icon: Building2,
     title: "Employers",
     desc: "Access a pool of pre-vetted, skilled professionals ready to join your team.",
     benefits: ["Pre-screened candidates", "Visa sponsorship support", "Diverse talent pool", "Reduced hiring costs"],
   },
   {
     icon: Users,
     title: "Recruitment Agencies",
     desc: "Partner with us to expand your international placement capabilities.",
     benefits: ["White-label solutions", "Immigration expertise", "Shared candidate database", "Revenue sharing"],
   },
   {
     icon: Globe2,
     title: "Educational Institutions",
     desc: "Help your graduates find international career opportunities.",
     benefits: ["Graduate placement programs", "Career services integration", "Alumni network access", "Custom workshops"],
   },
 ];
 
 const stats = [
   { value: "500+", label: "Partner Employers" },
   { value: "45+", label: "Countries" },
   { value: "10,000+", label: "Successful Placements" },
   { value: "98%", label: "Partner Satisfaction" },
 ];
 
 const Partners = () => {
   const { t } = useTranslation();
 
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
               {t("partners.title")}
             </h1>
             <p className="text-lg text-muted-foreground mb-8">
               {t("partners.subtitle")}
             </p>
             <Button size="lg" className="gap-2">
               {t("partners.becomePartner")}
               <ArrowRight className="w-5 h-5" />
             </Button>
           </motion.div>
         </div>
       </section>
 
       {/* Stats */}
       <section className="py-12 bg-primary">
         <div className="container-wide">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
             {stats.map((stat, i) => (
               <motion.div
                 key={stat.label}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 className="text-center"
               >
                 <p className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-1">
                   {stat.value}
                 </p>
                 <p className="text-primary-foreground/80 text-sm">{stat.label}</p>
               </motion.div>
             ))}
           </div>
         </div>
       </section>
 
       {/* Partner Types */}
       <section className="py-16">
         <div className="container-wide">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="text-center mb-12"
           >
             <h2 className="font-heading text-3xl font-bold text-foreground mb-4">
               Partnership Opportunities
             </h2>
             <p className="text-muted-foreground max-w-2xl mx-auto">
               We offer tailored partnership programs for different types of organizations.
             </p>
           </motion.div>
 
           <div className="grid md:grid-cols-3 gap-8">
             {partnerTypes.map((type, i) => (
               <motion.div
                 key={type.title}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 className="bg-card rounded-2xl border border-border p-8 hover:shadow-xl transition-shadow"
               >
                 <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                   <type.icon className="w-7 h-7 text-primary" />
                 </div>
                 <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                   {type.title}
                 </h3>
                 <p className="text-muted-foreground mb-6">{type.desc}</p>
                 <ul className="space-y-2">
                   {type.benefits.map((benefit) => (
                     <li key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                       <CheckCircle className="w-4 h-4 text-success" />
                       {benefit}
                     </li>
                   ))}
                 </ul>
               </motion.div>
             ))}
           </div>
         </div>
       </section>
 
       {/* CTA */}
       <section className="py-16 bg-muted/30">
         <div className="container-wide">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="bg-card rounded-2xl border border-border p-8 md:p-12 text-center max-w-3xl mx-auto"
           >
             <Handshake className="w-12 h-12 text-primary mx-auto mb-4" />
             <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-4">
               Ready to Partner With Us?
             </h2>
             <p className="text-muted-foreground mb-6">
               Join our network of successful partners and help connect talent with opportunity.
             </p>
             <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <Link to="/contact">
                 <Button size="lg" className="gap-2">
                   Contact Our Team
                   <ArrowRight className="w-5 h-5" />
                 </Button>
               </Link>
               <Button size="lg" variant="outline">
                 Download Partnership Guide
               </Button>
             </div>
           </motion.div>
         </div>
       </section>
 
       <Footer />
     </div>
   );
 };
 
 export default Partners;