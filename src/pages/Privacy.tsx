 import { motion } from "framer-motion";
 import { useTranslation } from "react-i18next";
 import { Navbar } from "@/components/layout/Navbar";
 import { Footer } from "@/components/layout/Footer";
 
 const Privacy = () => {
   const { t } = useTranslation();
 
   const sections = [
     {
       title: "1. Information We Collect",
       content: "We collect personal information you provide directly, including name, email, phone number, passport details, educational credentials, and employment history. We also collect usage data through cookies and analytics tools."
     },
     {
       title: "2. How We Use Your Information",
       content: "We use your information to process applications, match you with job opportunities, communicate with you about our services, comply with legal requirements, and improve our platform."
     },
     {
       title: "3. Information Sharing",
       content: "We share your information with potential employers, immigration authorities (as required), and trusted service providers who assist in our operations. We never sell your personal data to third parties."
     },
     {
       title: "4. Data Security",
       content: "We implement industry-standard security measures including encryption, secure servers, and access controls to protect your personal information from unauthorized access or disclosure."
     },
     {
       title: "5. Data Retention",
       content: "We retain your personal information for as long as necessary to provide our services and comply with legal obligations. You may request deletion of your data at any time."
     },
     {
       title: "6. Your Rights",
       content: "You have the right to access, correct, or delete your personal information. You may also object to processing or request data portability. Contact us to exercise these rights."
     },
     {
       title: "7. Cookies and Tracking",
       content: "We use cookies and similar technologies to enhance your experience, analyze usage patterns, and deliver personalized content. You can manage cookie preferences through your browser settings."
     },
     {
       title: "8. International Transfers",
       content: "Your data may be transferred to and processed in countries other than your residence. We ensure appropriate safeguards are in place for such transfers."
     },
     {
       title: "9. Children's Privacy",
       content: "Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children."
     },
     {
       title: "10. Updates to This Policy",
       content: "We may update this Privacy Policy periodically. We will notify you of significant changes via email or prominent notice on our platform."
     },
   ];
 
   return (
     <div className="min-h-screen bg-background">
       <Navbar />
 
       <section className="pt-28 pb-16">
         <div className="container-wide max-w-4xl">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
           >
             <h1 className="font-heading text-4xl font-bold text-foreground mb-4">
               {t("privacy.title")}
             </h1>
             <p className="text-muted-foreground mb-8">
               {t("privacy.lastUpdated")}: January 1, 2026
             </p>
 
             <div className="prose prose-lg max-w-none">
               <p className="text-muted-foreground mb-8">
                 At Carewell Supports, we are committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information.
               </p>
 
               <div className="space-y-8">
                 {sections.map((section) => (
                   <div key={section.title} className="bg-card rounded-xl border border-border p-6">
                     <h2 className="font-heading text-lg font-semibold text-foreground mb-3">
                       {section.title}
                     </h2>
                     <p className="text-muted-foreground">{section.content}</p>
                   </div>
                 ))}
               </div>
 
               <div className="mt-8 p-6 bg-muted/30 rounded-xl">
                 <p className="text-sm text-muted-foreground">
                   For privacy-related inquiries, please contact our Data Protection Officer at{" "}
                   <a href="mailto:privacy@carewellsupports.com" className="text-primary hover:underline">
                     privacy@carewellsupports.com
                   </a>
                 </p>
               </div>
             </div>
           </motion.div>
         </div>
       </section>
 
       <Footer />
     </div>
   );
 };
 
 export default Privacy;