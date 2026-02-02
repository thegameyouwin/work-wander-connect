import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Linkedin, Instagram, Twitter } from "lucide-react";
import logo from "@/assets/logo.png";

const footerLinks = {
  services: [
    { name: "Job Placements", href: "/jobs" },
    { name: "Visa Processing", href: "#" },
    { name: "Document Support", href: "#" },
    { name: "Travel Assistance", href: "#" },
  ],
  company: [
    { name: "About Us", href: "#about" },
    { name: "Success Stories", href: "#testimonials" },
    { name: "Blog", href: "#" },
    { name: "Careers", href: "#" },
  ],
  support: [
    { name: "Help Center", href: "#" },
    { name: "Contact Us", href: "#contact" },
    { name: "FAQ", href: "#" },
    { name: "Live Chat", href: "#" },
  ],
  legal: [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Cookie Policy", href: "#" },
    { name: "GDPR Compliance", href: "#" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
];

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="container-wide py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <img src={logo} alt="Carewell Supports" className="h-12 w-auto brightness-0 invert" />
            </Link>
            <p className="text-sm opacity-80 mb-6 max-w-xs">
              Your trusted partner for legal immigration pathways and job placements worldwide.
            </p>
            <div className="space-y-3">
              <a href="mailto:hr@carewellsupports.com" className="flex items-center gap-3 text-sm opacity-80 hover:opacity-100 transition-opacity">
                <Mail className="w-4 h-4" />
                hr@carewellsupports.com
              </a>
              <a href="tel:+1-800-CAREWELL" className="flex items-center gap-3 text-sm opacity-80 hover:opacity-100 transition-opacity">
                <Phone className="w-4 h-4" />
                +1-800-CAREWELL
              </a>
              <div className="flex items-center gap-3 text-sm opacity-80">
                <MapPin className="w-4 h-4" />
                New York, NY 10001
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm opacity-70 hover:opacity-100 transition-opacity">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm opacity-70 hover:opacity-100 transition-opacity">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm opacity-70 hover:opacity-100 transition-opacity">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm opacity-70 hover:opacity-100 transition-opacity">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container-wide py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm opacity-70">
            © {new Date().getFullYear()} Carewell Supports. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
