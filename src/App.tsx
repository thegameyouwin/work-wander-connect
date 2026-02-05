import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Jobs from "./pages/Jobs";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Apply from "./pages/Apply";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
 import About from "./pages/About";
 import Contact from "./pages/Contact";
 import FAQ from "./pages/FAQ";
 import Pricing from "./pages/Pricing";
 import Blog from "./pages/Blog";
 import Resources from "./pages/Resources";
 import SuccessStories from "./pages/SuccessStories";
 import Partners from "./pages/Partners";
 import Terms from "./pages/Terms";
 import Privacy from "./pages/Privacy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/apply" element={<Apply />} />
            <Route path="/admin" element={<Admin />} />
             <Route path="/about" element={<About />} />
             <Route path="/contact" element={<Contact />} />
             <Route path="/faq" element={<FAQ />} />
             <Route path="/pricing" element={<Pricing />} />
             <Route path="/blog" element={<Blog />} />
             <Route path="/resources" element={<Resources />} />
             <Route path="/success-stories" element={<SuccessStories />} />
             <Route path="/partners" element={<Partners />} />
             <Route path="/terms" element={<Terms />} />
             <Route path="/privacy" element={<Privacy />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
