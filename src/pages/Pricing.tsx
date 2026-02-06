 import { motion } from "framer-motion";
 import { useTranslation } from "react-i18next";
 import { Check, Star, Zap, Clock } from "lucide-react";
 import { Link } from "react-router-dom";
 import { Navbar } from "@/components/layout/Navbar";
 import { Footer } from "@/components/layout/Footer";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { usePageSEO } from "@/hooks/usePageSEO";
 
 const plans = [
   {
     id: "milestone",
     icon: Clock,
     price: "$3,500",
     priceNote: "Total (paid in stages)",
     features: [
       "Pay as you progress",
       "Document review & validation",
       "Job matching & placement",
       "Visa application support",
       "Travel coordination",
       "30-day post-arrival support",
     ],
   },
   {
     id: "upfront",
     icon: Star,
     popular: true,
     price: "$2,800",
     priceNote: "One-time payment",
     savings: "Save 20%",
     features: [
       "Everything in Milestone, plus:",
       "Priority job matching",
       "Dedicated case manager",
       "Express document processing",
       "Airport pickup coordination",
       "90-day post-arrival support",
       "Resume optimization service",
     ],
   },
   {
     id: "deferred",
     icon: Zap,
     price: "$4,200",
     priceNote: "Pay after you start working",
     features: [
       "Zero upfront cost",
       "Document review & validation",
       "Job matching & placement",
       "Visa application support",
       "Payment starts after first paycheck",
       "12-month payment plan option",
       "30-day post-arrival support",
     ],
   },
 ];
 
 const included = [
   "Verified employer connections only",
   "AI-powered document validation",
   "24/7 application tracking",
   "Interview preparation guides",
   "Visa interview coaching",
   "Pre-departure orientation",
   "Emergency support hotline",
   "Cultural adaptation resources",
 ];
 
 const Pricing = () => {
   const { t } = useTranslation();
   usePageSEO({ title: "Pricing Plans", description: "Transparent pricing starting from $2,800. Choose Milestone, Full Upfront, or Deferred payment plans.", canonical: "/pricing" });
 
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
               {t("pricing.title")}
             </h1>
             <p className="text-lg text-muted-foreground">
               {t("pricing.subtitle")}
             </p>
           </motion.div>
         </div>
       </section>
 
       {/* Pricing Cards */}
       <section className="py-16">
         <div className="container-wide">
           <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
             {plans.map((plan, i) => (
               <motion.div
                 key={plan.id}
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 className={`relative bg-card rounded-2xl border p-8 ${
                   plan.popular
                     ? "border-primary shadow-xl scale-105"
                     : "border-border"
                 }`}
               >
                 {plan.popular && (
                   <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                     {t("pricing.mostPopular")}
                   </Badge>
                 )}
 
                 <div className="text-center mb-6">
                   <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                     <plan.icon className="w-6 h-6 text-primary" />
                   </div>
                   <h3 className="font-heading text-xl font-semibold text-foreground mb-1">
                     {t(`pricing.${plan.id}`)}
                   </h3>
                   <p className="text-sm text-muted-foreground">
                     {t(`pricing.${plan.id}Desc`)}
                   </p>
                 </div>
 
                 <div className="text-center mb-6">
                   <p className="text-4xl font-heading font-bold text-foreground">
                     {plan.price}
                   </p>
                   <p className="text-sm text-muted-foreground">{plan.priceNote}</p>
                   {plan.savings && (
                     <Badge variant="secondary" className="mt-2 bg-success/10 text-success">
                       {plan.savings}
                     </Badge>
                   )}
                 </div>
 
                 <ul className="space-y-3 mb-8">
                   {plan.features.map((feature) => (
                     <li key={feature} className="flex items-start gap-3 text-sm">
                       <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                       <span className="text-muted-foreground">{feature}</span>
                     </li>
                   ))}
                 </ul>
 
                 <Link to="/apply">
                   <Button
                     className="w-full"
                     variant={plan.popular ? "default" : "outline"}
                   >
                     {t("pricing.getStarted")}
                   </Button>
                 </Link>
               </motion.div>
             ))}
           </div>
         </div>
       </section>
 
       {/* What's Included */}
       <section className="py-16 bg-muted/30">
         <div className="container-wide">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="text-center mb-12"
           >
             <h2 className="font-heading text-3xl font-bold text-foreground mb-4">
               {t("pricing.includes")}
             </h2>
             <p className="text-muted-foreground">All plans include these essential services</p>
           </motion.div>
 
           <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
             {included.map((item, i) => (
               <motion.div
                 key={item}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.05 }}
                 className="flex items-center gap-3 bg-card rounded-xl border border-border p-4"
               >
                 <Check className="w-5 h-5 text-success flex-shrink-0" />
                 <span className="text-sm text-foreground">{item}</span>
               </motion.div>
             ))}
           </div>
         </div>
       </section>
 
       <Footer />
     </div>
   );
 };
 
 export default Pricing;