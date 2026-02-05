 import { motion } from "framer-motion";
 import { useTranslation } from "react-i18next";
 import { Target, Eye, Heart, Lightbulb, Shield, Award, Users, Globe2 } from "lucide-react";
 import { Navbar } from "@/components/layout/Navbar";
 import { Footer } from "@/components/layout/Footer";
 import successStoriesImg from "@/assets/success-stories.jpg";
 
 const About = () => {
   const { t } = useTranslation();
 
   const values = [
     { icon: Shield, title: t("about.integrity"), desc: t("about.integrityDesc") },
     { icon: Award, title: t("about.excellence"), desc: t("about.excellenceDesc") },
     { icon: Heart, title: t("about.compassion"), desc: t("about.compassionDesc") },
     { icon: Lightbulb, title: t("about.innovation"), desc: t("about.innovationDesc") },
   ];
 
   const stats = [
     { value: "50,000+", label: "Professionals Placed" },
     { value: "45+", label: "Countries Served" },
     { value: "98%", label: "Success Rate" },
     { value: "24/7", label: "Support Available" },
   ];
 
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
               {t("about.title")}
             </h1>
             <p className="text-lg text-muted-foreground">
               {t("about.subtitle")}
             </p>
           </motion.div>
         </div>
       </section>
 
       {/* Mission & Vision */}
       <section className="py-16">
         <div className="container-wide">
           <div className="grid md:grid-cols-2 gap-12">
             <motion.div
               initial={{ opacity: 0, x: -30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="bg-card rounded-2xl border border-border p-8"
             >
               <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                 <Target className="w-7 h-7 text-primary" />
               </div>
               <h2 className="font-heading text-2xl font-bold text-foreground mb-4">
                 {t("about.mission")}
               </h2>
               <p className="text-muted-foreground leading-relaxed">
                 {t("about.missionText")}
               </p>
             </motion.div>
 
             <motion.div
               initial={{ opacity: 0, x: 30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="bg-card rounded-2xl border border-border p-8"
             >
               <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
                 <Eye className="w-7 h-7 text-secondary" />
               </div>
               <h2 className="font-heading text-2xl font-bold text-foreground mb-4">
                 {t("about.vision")}
               </h2>
               <p className="text-muted-foreground leading-relaxed">
                 {t("about.visionText")}
               </p>
             </motion.div>
           </div>
         </div>
       </section>
 
       {/* Stats */}
       <section className="py-16 bg-primary">
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
                 <p className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-2">
                   {stat.value}
                 </p>
                 <p className="text-primary-foreground/80">{stat.label}</p>
               </motion.div>
             ))}
           </div>
         </div>
       </section>
 
       {/* Values */}
       <section className="py-16">
         <div className="container-wide">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="text-center mb-12"
           >
             <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
               {t("about.values")}
             </h2>
           </motion.div>
 
           <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {values.map((value, i) => (
               <motion.div
                 key={value.title}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 className="bg-card rounded-xl border border-border p-6 text-center hover:shadow-lg transition-shadow"
               >
                 <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                   <value.icon className="w-6 h-6 text-primary" />
                 </div>
                 <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                   {value.title}
                 </h3>
                 <p className="text-sm text-muted-foreground">{value.desc}</p>
               </motion.div>
             ))}
           </div>
         </div>
       </section>
 
       {/* Image Section */}
       <section className="py-16 bg-muted/30">
         <div className="container-wide">
           <div className="grid lg:grid-cols-2 gap-12 items-center">
             <motion.div
               initial={{ opacity: 0, x: -30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
             >
               <img
                 src={successStoriesImg}
                 alt="Our team helping professionals"
                 className="rounded-2xl shadow-xl"
               />
             </motion.div>
             <motion.div
               initial={{ opacity: 0, x: 30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
             >
               <h2 className="font-heading text-3xl font-bold text-foreground mb-6">
                 Building Dreams, One Journey at a Time
               </h2>
               <p className="text-muted-foreground mb-4">
                 Since 2018, Carewell Supports has been at the forefront of ethical immigration services. 
                 We believe everyone deserves access to global opportunities, regardless of where they were born.
               </p>
               <p className="text-muted-foreground mb-4">
                 Our team of immigration experts, career counselors, and support staff work tirelessly to 
                 ensure your journey from application to arrival is smooth, transparent, and successful.
               </p>
               <p className="text-muted-foreground">
                 With offices in New York, London, and Toronto, we're positioned to serve applicants 
                 worldwide and connect them with top employers in the USA, Canada, and UK.
               </p>
             </motion.div>
           </div>
         </div>
       </section>
 
       <Footer />
     </div>
   );
 };
 
 export default About;