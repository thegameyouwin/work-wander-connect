 import { useState } from "react";
 import { motion } from "framer-motion";
 import { useTranslation } from "react-i18next";
 import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Headphones } from "lucide-react";
 import { Navbar } from "@/components/layout/Navbar";
 import { Footer } from "@/components/layout/Footer";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Textarea } from "@/components/ui/textarea";
 import { useToast } from "@/hooks/use-toast";
 import { usePageSEO } from "@/hooks/usePageSEO";
 
 const Contact = () => {
   const { t } = useTranslation();
   const { toast } = useToast();
   const [sending, setSending] = useState(false);
   usePageSEO({ title: "Contact Us", description: "Get in touch with Carewell Supports. Offices in New York, London, and Toronto.", canonical: "/contact" });

   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setSending(true);
     // Simulate sending
     await new Promise((r) => setTimeout(r, 1500));
     setSending(false);
     toast({
       title: t("common.success"),
       description: "Your message has been sent. We'll get back to you soon!",
     });
   };
 
   const contactInfo = [
     { icon: Mail, label: "Email", value: "hr@carewellsupports.com", href: "mailto:hr@carewellsupports.com" },
     { icon: Phone, label: "Phone", value: "+1-800-CAREWELL", href: "tel:+18002273935" },
     { icon: MapPin, label: "Address", value: "123 Immigration Plaza, New York, NY 10001" },
   ];
 
   const offices = [
     { city: "New York", country: "USA", address: "123 Immigration Plaza, NY 10001", phone: "+1 (212) 555-0123" },
     { city: "London", country: "UK", address: "45 Visa Lane, London EC1A 1BB", phone: "+44 20 7946 0958" },
     { city: "Toronto", country: "Canada", address: "789 Work Street, Toronto M5V 2H1", phone: "+1 (416) 555-0199" },
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
               {t("contact.title")}
             </h1>
             <p className="text-lg text-muted-foreground">
               {t("contact.subtitle")}
             </p>
           </motion.div>
         </div>
       </section>
 
       {/* Contact Form & Info */}
       <section className="py-16">
         <div className="container-wide">
           <div className="grid lg:grid-cols-2 gap-12">
             {/* Form */}
             <motion.div
               initial={{ opacity: 0, x: -30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="bg-card rounded-2xl border border-border p-8"
             >
               <h2 className="font-heading text-2xl font-bold text-foreground mb-6">
                 {t("contact.getInTouch")}
               </h2>
               <form onSubmit={handleSubmit} className="space-y-5">
                 <div className="grid sm:grid-cols-2 gap-4">
                   <div>
                     <label className="text-sm font-medium text-foreground mb-2 block">
                       {t("contact.name")}
                     </label>
                     <Input placeholder="John Doe" required />
                   </div>
                   <div>
                     <label className="text-sm font-medium text-foreground mb-2 block">
                       {t("contact.email")}
                     </label>
                     <Input type="email" placeholder="john@example.com" required />
                   </div>
                 </div>
                 <div>
                   <label className="text-sm font-medium text-foreground mb-2 block">
                     {t("contact.phone")}
                   </label>
                   <Input placeholder="+1 (555) 000-0000" />
                 </div>
                 <div>
                   <label className="text-sm font-medium text-foreground mb-2 block">
                     {t("contact.message")}
                   </label>
                   <Textarea placeholder="How can we help you?" rows={5} required />
                 </div>
                 <Button type="submit" className="w-full gap-2" disabled={sending}>
                   {sending ? t("contact.sending") : t("contact.send")}
                   <Send className="w-4 h-4" />
                 </Button>
               </form>
             </motion.div>
 
             {/* Info */}
             <motion.div
               initial={{ opacity: 0, x: 30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="space-y-6"
             >
               {/* Quick Contact */}
               <div className="bg-card rounded-2xl border border-border p-6">
                 <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
                   Quick Contact
                 </h3>
                 <div className="space-y-4">
                   {contactInfo.map((item) => (
                     <a
                       key={item.label}
                       href={item.href}
                       className="flex items-center gap-4 text-muted-foreground hover:text-primary transition-colors"
                     >
                       <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                         <item.icon className="w-5 h-5 text-primary" />
                       </div>
                       <div>
                         <p className="text-sm text-muted-foreground">{item.label}</p>
                         <p className="font-medium text-foreground">{item.value}</p>
                       </div>
                     </a>
                   ))}
                 </div>
               </div>
 
               {/* Office Hours */}
               <div className="bg-card rounded-2xl border border-border p-6">
                 <div className="flex items-center gap-3 mb-4">
                   <Clock className="w-5 h-5 text-primary" />
                   <h3 className="font-heading text-lg font-semibold text-foreground">
                     {t("contact.officeHours")}
                   </h3>
                 </div>
                 <div className="space-y-2 text-muted-foreground">
                   <p>{t("contact.mondayFriday")}: 9:00 AM - 6:00 PM EST</p>
                   <p>{t("contact.saturday")}: 10:00 AM - 4:00 PM EST</p>
                   <p>{t("contact.sunday")}</p>
                 </div>
               </div>
 
               {/* Support Options */}
               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-primary/10 rounded-xl p-4 text-center">
                   <MessageSquare className="w-8 h-8 text-primary mx-auto mb-2" />
                   <p className="font-medium text-foreground">Live Chat</p>
                   <p className="text-xs text-muted-foreground">24/7 Available</p>
                 </div>
                 <div className="bg-secondary/10 rounded-xl p-4 text-center">
                   <Headphones className="w-8 h-8 text-secondary mx-auto mb-2" />
                   <p className="font-medium text-foreground">Phone Support</p>
                   <p className="text-xs text-muted-foreground">Mon-Fri 9-6</p>
                 </div>
               </div>
             </motion.div>
           </div>
         </div>
       </section>
 
       {/* Offices */}
       <section className="py-16 bg-muted/30">
         <div className="container-wide">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="text-center mb-12"
           >
             <h2 className="font-heading text-3xl font-bold text-foreground mb-4">
               Our Offices
             </h2>
             <p className="text-muted-foreground">
               Visit us at any of our global locations
             </p>
           </motion.div>
 
           <div className="grid md:grid-cols-3 gap-6">
             {offices.map((office, i) => (
               <motion.div
                 key={office.city}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 className="bg-card rounded-xl border border-border p-6"
               >
                 <h3 className="font-heading text-xl font-semibold text-foreground mb-1">
                   {office.city}
                 </h3>
                 <p className="text-primary text-sm mb-4">{office.country}</p>
                 <p className="text-sm text-muted-foreground mb-2">{office.address}</p>
                 <p className="text-sm text-muted-foreground">{office.phone}</p>
               </motion.div>
             ))}
           </div>
         </div>
       </section>
 
       <Footer />
     </div>
   );
 };
 
 export default Contact;