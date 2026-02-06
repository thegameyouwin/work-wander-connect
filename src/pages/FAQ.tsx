 import { useState } from "react";
 import { motion } from "framer-motion";
 import { useTranslation } from "react-i18next";
 import { Search, HelpCircle, FileText, CreditCard, Plane } from "lucide-react";
 import { Navbar } from "@/components/layout/Navbar";
 import { Footer } from "@/components/layout/Footer";
 import { Input } from "@/components/ui/input";
 import { usePageSEO } from "@/hooks/usePageSEO";
 import {
   Accordion,
   AccordionContent,
   AccordionItem,
   AccordionTrigger,
 } from "@/components/ui/accordion";
 
 const faqs = [
   {
     category: "general",
     icon: HelpCircle,
     questions: [
       { q: "What is Carewell Supports?", a: "Carewell Supports is a comprehensive immigration and job placement service that helps skilled professionals from around the world find visa-sponsored employment in the USA, Canada, and UK." },
       { q: "How is Carewell different from other agencies?", a: "We offer complete transparency in pricing, verified employers only, a 98% success rate, and end-to-end support from application to arrival. We never charge hidden fees." },
       { q: "What countries do you support?", a: "We help place professionals in the USA, Canada, and UK. We accept applications from professionals worldwide, with special focus on healthcare, technology, construction, and hospitality sectors." },
       { q: "How long does the entire process take?", a: "The typical timeline is 4-8 weeks from application to job offer, with an additional 2-4 months for visa processing depending on your destination country." },
     ],
   },
   {
     category: "process",
     icon: FileText,
     questions: [
       { q: "What documents do I need to apply?", a: "You'll need: valid passport, educational certificates, professional licenses (if applicable), resume/CV, proof of work experience, and language proficiency test results (IELTS/TOEFL for English-speaking countries)." },
       { q: "How does the job matching work?", a: "Our AI-powered system matches your skills, experience, and preferences with open positions from our verified employer network. You can also browse and apply to jobs manually." },
       { q: "Can I choose which country I want to work in?", a: "Yes, you can specify your preferred destination(s) during registration. However, flexibility often increases your chances of faster placement." },
       { q: "What happens after I get a job offer?", a: "Once you accept an offer, we assist with visa application preparation, document submission, interview preparation (if required), and coordinate with the employer on your start date." },
     ],
   },
   {
     category: "payment",
     icon: CreditCard,
     questions: [
       { q: "How much does your service cost?", a: "We offer three payment plans: Milestone ($3,500 total in stages), Full Upfront ($2,800 one-time with 20% savings), and Deferred (pay after you start working). See our Pricing page for details." },
       { q: "What is included in the fee?", a: "Our fee covers: document review and validation, job matching and placement, visa application support, travel coordination assistance, and 90-day post-arrival support." },
       { q: "Is there a refund policy?", a: "Yes. If we cannot place you in a job within 6 months, you're eligible for a full refund minus any administrative costs already incurred. See our Terms for full details." },
       { q: "Do I need to pay for the visa separately?", a: "Government visa fees are not included in our service fee and must be paid directly to the relevant embassy or immigration authority. We'll guide you through this process." },
     ],
   },
   {
     category: "visa",
     icon: Plane,
     questions: [
       { q: "What type of work visas do you help with?", a: "We help with H-1B and EB-3 visas for USA, Skilled Worker visas for UK, and Express Entry/LMIA work permits for Canada." },
       { q: "Does the employer sponsor my visa?", a: "Yes, all employers in our network are verified to provide visa sponsorship. The employer becomes your visa sponsor once you accept their job offer." },
       { q: "Can my family come with me?", a: "Yes, most work visas allow you to bring your spouse and dependent children. We can provide guidance on dependent visa applications." },
       { q: "What if my visa application is denied?", a: "If your visa is denied despite following our guidance and meeting all requirements, you're eligible for a partial refund. We also offer reapplication support at no extra cost." },
     ],
   },
 ];
 
 const FAQ = () => {
   const { t } = useTranslation();
   const [search, setSearch] = useState("");
   const [activeCategory, setActiveCategory] = useState("all");
   usePageSEO({ title: "Frequently Asked Questions", description: "Find answers about visa sponsorship, job placement, pricing, and immigration with Carewell Supports.", canonical: "/faq" });
 
   const categories = [
     { id: "all", label: "All", icon: HelpCircle },
     { id: "general", label: t("faq.categories.general"), icon: HelpCircle },
     { id: "process", label: t("faq.categories.process"), icon: FileText },
     { id: "payment", label: t("faq.categories.payment"), icon: CreditCard },
     { id: "visa", label: t("faq.categories.visa"), icon: Plane },
   ];
 
   const filteredFaqs = faqs
     .filter((cat) => activeCategory === "all" || cat.category === activeCategory)
     .map((cat) => ({
       ...cat,
       questions: cat.questions.filter(
         (q) =>
           q.q.toLowerCase().includes(search.toLowerCase()) ||
           q.a.toLowerCase().includes(search.toLowerCase())
       ),
     }))
     .filter((cat) => cat.questions.length > 0);
 
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
               {t("faq.title")}
             </h1>
             <p className="text-lg text-muted-foreground mb-8">
               {t("faq.subtitle")}
             </p>
 
             {/* Search */}
             <div className="relative max-w-xl mx-auto">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
               <Input
                 placeholder="Search questions..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="pl-12 h-12"
               />
             </div>
           </motion.div>
         </div>
       </section>
 
       {/* Categories & Questions */}
       <section className="py-16">
         <div className="container-wide">
           {/* Category Tabs */}
           <div className="flex flex-wrap justify-center gap-3 mb-12">
             {categories.map((cat) => (
               <button
                 key={cat.id}
                 onClick={() => setActiveCategory(cat.id)}
                 className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                   activeCategory === cat.id
                     ? "bg-primary text-primary-foreground"
                     : "bg-card border border-border hover:border-primary"
                 }`}
               >
                 <cat.icon className="w-4 h-4" />
                 {cat.label}
               </button>
             ))}
           </div>
 
           {/* FAQ Accordions */}
           <div className="max-w-3xl mx-auto space-y-8">
             {filteredFaqs.map((category) => (
               <motion.div
                 key={category.category}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
               >
                 <div className="flex items-center gap-3 mb-4">
                   <category.icon className="w-5 h-5 text-primary" />
                   <h2 className="font-heading text-xl font-semibold text-foreground capitalize">
                     {category.category}
                   </h2>
                 </div>
                 <Accordion type="single" collapsible className="space-y-3">
                   {category.questions.map((item, i) => (
                     <AccordionItem
                       key={i}
                       value={`${category.category}-${i}`}
                       className="bg-card rounded-xl border border-border px-6"
                     >
                       <AccordionTrigger className="text-left font-medium hover:no-underline">
                         {item.q}
                       </AccordionTrigger>
                       <AccordionContent className="text-muted-foreground">
                         {item.a}
                       </AccordionContent>
                     </AccordionItem>
                   ))}
                 </Accordion>
               </motion.div>
             ))}
 
             {filteredFaqs.length === 0 && (
               <div className="text-center py-12">
                 <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                 <p className="text-muted-foreground">No questions found matching your search.</p>
               </div>
             )}
           </div>
         </div>
       </section>
 
       <Footer />
     </div>
   );
 };
 
 export default FAQ;