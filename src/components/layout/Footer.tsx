import { Link } from "react-router-dom";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Linkedin, 
  Instagram, 
  Twitter, 
  Globe,
  Shield,
  CheckCircle,
  ArrowUpRight,
  MessageSquare,
  ChevronUp
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/logo.png";
import logoWhite from "@/assets/logo-white.png"; // Create a white version or use the same

const footerLinks = {
  services: [
    { key: "jobPlacements", href: "/jobs", icon: "💼" },
    { key: "visaProcessing", href: "/resources", icon: "🛂" },
    { key: "documentSupport", href: "/resources", icon: "📄" },
    { key: "travelAssistance", href: "/resources", icon: "✈️" },
  ],
  company: [
    { key: "aboutUs", href: "/about", icon: "🏢" },
    { key: "successStories", href: "/success-stories", icon: "⭐" },
    { key: "blog", href: "/blog", icon: "📝" },
    { key: "careers", href: "/jobs", icon: "👔" },
  ],
  support: [
    { key: "helpCenter", href: "/faq", icon: "❓" },
    { key: "contactUs", href: "/contact", icon: "📞" },
    { key: "faq", href: "/faq", icon: "💬" },
    { key: "liveChat", href: "/contact", icon: "💭" },
  ],
  legal: [
    { key: "privacyPolicy", href: "/privacy", icon: "🔒" },
    { key: "termsOfService", href: "/terms", icon: "📜" },
    { key: "cookiePolicy", href: "/privacy", icon: "🍪" },
    { key: "gdprCompliance", href: "/privacy", icon: "🛡️" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook", color: "hover:bg-blue-600" },
  { icon: Linkedin, href: "#", label: "LinkedIn", color: "hover:bg-blue-700" },
  { icon: Instagram, href: "#", label: "Instagram", color: "hover:bg-pink-600" },
  { icon: Twitter, href: "#", label: "Twitter", color: "hover:bg-blue-400" },
];

const certifications = [
  { text: "Licensed Immigration Consultants", icon: Shield },
  { text: "Verified by Government Authorities", icon: CheckCircle },
  { text: "ISO 9001 Certified", icon: Shield },
  { text: "24/7 Customer Support", icon: MessageSquare },
];

export const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  // Try using a white version of your logo, or adjust the logo color
  const logoSrc = logo; // Use your existing logo
  // If you have a white version: const logoSrc = logoWhite;

  return (
    <footer className="bg-gradient-to-b from-foreground to-foreground/95 text-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white blur-3xl" />
      </div>

      {/* Newsletter Section */}
      <div className="relative z-10 container-wide py-12 border-b border-background/10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="font-heading text-2xl font-bold mb-3">
              Stay Updated with Global Opportunities
            </h3>
            <p className="text-background/70 text-sm">
              Subscribe to get the latest job openings, visa updates, and immigration tips.
            </p>
          </div>
          <form className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-background/10 border-background/20 text-background placeholder:text-background/50 flex-1 h-12"
            />
            <Button 
              type="submit" 
              className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground whitespace-nowrap"
            >
              Subscribe
              <ArrowUpRight className="ml-2 w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Certifications */}
      <div className="relative z-10 container-wide py-8 border-b border-background/10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {certifications.map((cert) => (
            <div key={cert.text} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <cert.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium">{cert.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Footer */}
      <div className="relative z-10 container-wide py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <div className="relative overflow-hidden rounded-xl p-2 bg-gradient-to-br from-primary to-primary/80 group-hover:scale-105 transition-transform duration-300">
                {/* Remove the brightness/invert filters and add white background if needed */}
                <img 
                  src={logoSrc} 
                  alt="Carewell Supports" 
                  className="h-14 w-auto"
                  // If logo is dark, add a white background:
                  style={{ 
                    backgroundColor: '#ffffff',
                    padding: '2px',
                    borderRadius: '6px'
                  }}
                />
              </div>
              <div>
                <h2 className="font-heading text-2xl font-bold">Carewell</h2>
                <p className="text-sm text-background/70 -mt-1">Supports</p>
              </div>
            </Link>
            <p className="text-sm text-background/70 mb-8 max-w-md leading-relaxed">
              {t("footer.tagline") || "Your trusted partner for global career opportunities and immigration solutions."}
            </p>
            
            <div className="space-y-4">
              <a 
                href="mailto:hr@carewellsupports.com" 
                className="flex items-center gap-3 text-sm text-background/80 hover:text-primary hover:translate-x-1 transition-all duration-200 group"
              >
                <div className="w-9 h-9 rounded-lg bg-background/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <span>hr@carewellsupports.com</span>
              </a>
              <a 
                href="tel:+1-800-CAREWELL" 
                className="flex items-center gap-3 text-sm text-background/80 hover:text-primary hover:translate-x-1 transition-all duration-200 group"
              >
                <div className="w-9 h-9 rounded-lg bg-background/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <span>+1-800-CAREWELL</span>
              </a>
              <div className="flex items-center gap-3 text-sm text-background/80 group">
                <div className="w-9 h-9 rounded-lg bg-background/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>New York, NY 10001 • London • Toronto</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-6 pb-3 border-b border-background/10">
              {t("footer.services") || "Services"}
            </h4>
            <ul className="space-y-4">
              {footerLinks.services.map((link) => (
                <li key={link.key}>
                  <Link 
                    to={link.href} 
                    className="flex items-center gap-3 text-sm text-background/70 hover:text-primary hover:translate-x-2 transition-all duration-200 group"
                  >
                    <span className="text-base">{link.icon}</span>
                    <span className="group-hover:underline">
                      {t(`footer.${link.key}`)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-lg mb-6 pb-3 border-b border-background/10">
              {t("footer.company") || "Company"}
            </h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.key}>
                  <Link 
                    to={link.href} 
                    className="flex items-center gap-3 text-sm text-background/70 hover:text-primary hover:translate-x-2 transition-all duration-200 group"
                  >
                    <span className="text-base">{link.icon}</span>
                    <span className="group-hover:underline">
                      {t(`footer.${link.key}`)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-lg mb-6 pb-3 border-b border-background/10">
              {t("footer.support") || "Support"}
            </h4>
            <ul className="space-y-4">
              {footerLinks.support.map((link) => (
                <li key={link.key}>
                  <Link 
                    to={link.href} 
                    className="flex items-center gap-3 text-sm text-background/70 hover:text-primary hover:translate-x-2 transition-all duration-200 group"
                  >
                    <span className="text-base">{link.icon}</span>
                    <span className="group-hover:underline">
                      {t(`footer.${link.key}`)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative z-10 border-t border-background/10">
        <div className="container-wide">
          <div className="py-8 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <p className="text-sm text-background/60">
                © {currentYear} Carewell Supports International Ltd. All rights reserved.
              </p>
              <div className="flex flex-wrap gap-4 mt-3">
                {footerLinks.legal.map((link) => (
                  <Link 
                    key={link.key}
                    to={link.href} 
                    className="text-xs text-background/50 hover:text-primary transition-colors"
                  >
                    {t(`footer.${link.key}`)}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 text-sm text-background/60">
                <Globe className="w-4 h-4" />
                <span>Global Operations • 45+ Countries</span>
              </div>
              <div className="h-6 w-px bg-background/20 hidden sm:block" />
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className={`w-9 h-9 rounded-lg bg-background/10 flex items-center justify-center ${social.color} transition-all duration-300 hover:scale-110 hover:text-white`}
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top - Fixed the icon */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all duration-300 hover:scale-110"
        aria-label="Back to top"
      >
        <ChevronUp className="w-5 h-5" />
      </button>
    </footer>
  );
};
