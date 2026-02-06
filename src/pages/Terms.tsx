 import { motion } from "framer-motion";
 import { useTranslation } from "react-i18next";
 import { Navbar } from "@/components/layout/Navbar";
 import { Footer } from "@/components/layout/Footer";
 import { usePageSEO } from "@/hooks/usePageSEO";
 
 const Terms = () => {
   const { t } = useTranslation();
   usePageSEO({ title: "Terms of Service", description: "Read our terms of service for Carewell Supports immigration services.", canonical: "/terms" });
 
   const sections = [
     {
       title: "1. Acceptance of Terms",
       content: "By accessing and using Carewell Supports services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services."
     },
     {
       title: "2. Services Description",
       content: "Carewell Supports provides immigration consulting, job placement assistance, and related services to help professionals find employment opportunities abroad. We act as intermediaries between job seekers and employers."
     },
     {
       title: "3. User Responsibilities",
       content: "You agree to provide accurate and complete information during registration and throughout the application process. You are responsible for maintaining the confidentiality of your account credentials."
     },
     {
       title: "4. Fees and Payments",
       content: "Our service fees are clearly disclosed on our Pricing page. Payment terms vary based on the selected plan. All fees are non-refundable except as specified in our Refund Policy."
     },
     {
       title: "5. No Guarantee of Outcomes",
       content: "While we strive for the highest success rates, we cannot guarantee visa approval or job placement. Immigration decisions are made by government authorities, and employment decisions are made by employers."
     },
     {
       title: "6. Intellectual Property",
       content: "All content on our platform, including text, graphics, logos, and software, is the property of Carewell Supports and is protected by intellectual property laws."
     },
     {
       title: "7. Privacy and Data Protection",
       content: "Your personal information is handled in accordance with our Privacy Policy. By using our services, you consent to the collection and use of your data as described therein."
     },
     {
       title: "8. Limitation of Liability",
       content: "Carewell Supports shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services, including but not limited to visa denials or job application rejections."
     },
     {
       title: "9. Termination",
       content: "We reserve the right to terminate or suspend your account at any time for violation of these terms or for any other reason at our discretion."
     },
     {
       title: "10. Changes to Terms",
       content: "We may update these terms from time to time. Continued use of our services after changes constitutes acceptance of the modified terms."
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
               {t("terms.title")}
             </h1>
             <p className="text-muted-foreground mb-8">
               {t("terms.lastUpdated")}: January 1, 2026
             </p>
 
             <div className="prose prose-lg max-w-none">
               <p className="text-muted-foreground mb-8">
                 Please read these Terms of Service carefully before using Carewell Supports services.
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
                   If you have any questions about these Terms of Service, please contact us at{" "}
                   <a href="mailto:legal@carewellsupports.com" className="text-primary hover:underline">
                     legal@carewellsupports.com
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
 
 export default Terms;