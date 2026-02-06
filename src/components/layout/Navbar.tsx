import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
 import { Menu, X, User, Briefcase, LayoutDashboard, LogOut, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
 import { useTranslation } from "react-i18next";
 import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import logo from "@/assets/logo.png";

const navLinks = [
   { key: "home", href: "/" },
   { key: "jobs", href: "/jobs" },
   { key: "about", href: "/about" },
   { key: "pricing", href: "/pricing" },
   { key: "contact", href: "/contact" },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, isAdmin, signOut, loading } = useAuth();
  const navigate = useNavigate();
   const { t } = useTranslation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container-wide">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Carewell Supports" className="h-12 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                 key={link.key}
                to={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                 {t(`nav.${link.key}`)}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
             <LanguageSwitcher />
            {!loading && user ? (
              <>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm" className="gap-2 text-primary hover:text-primary hover:bg-primary/10">
                      <Shield className="w-4 h-4" />
                       {t("nav.admin")}
                    </Button>
                  </Link>
                )}
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                       {t("nav.dashboard")}
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2">
                  <LogOut className="w-4 h-4" />
                   {t("nav.signOut")}
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                       {t("nav.login")}
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm" className="gap-2">
                    <Briefcase className="w-4 h-4" />
                       {t("nav.startApplication")}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-border bg-card"
          >
            <div className="container-wide py-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                   key={link.key}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block py-2 text-foreground font-medium hover:text-primary transition-colors"
                >
                   {t(`nav.${link.key}`)}
                </Link>
              ))}
               <div className="py-2">
                 <LanguageSwitcher />
               </div>
              <div className="pt-4 border-t border-border space-y-3">
                {!loading && user ? (
                  <>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full gap-2 text-primary border-primary hover:bg-primary hover:text-primary-foreground">
                          <Shield className="w-4 h-4" />
                          {t("nav.admin")}
                        </Button>
                      </Link>
                    )}
                    <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        {t("nav.dashboard")}
                      </Button>
                    </Link>
                    <Button onClick={handleSignOut} className="w-full gap-2">
                      <LogOut className="w-4 h-4" />
                      {t("nav.signOut")}
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full gap-2">
                        <User className="w-4 h-4" />
                        {t("nav.login")}
                      </Button>
                    </Link>
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button className="w-full gap-2">
                        <Briefcase className="w-4 h-4" />
                        {t("nav.startApplication")}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
