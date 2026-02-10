import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, 
  X, 
  User, 
  Briefcase, 
  LayoutDashboard, 
  LogOut, 
  Shield, 
  Sparkles,
  UserCircle,
  Settings,
  FileText,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import logo from "@/assets/logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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
    setIsOpen(false);
  };

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container-wide">
        <div className="flex items-center justify-between h-20 lg:h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Carewell Supports" className="h-16 w-auto" />
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
              <div className="flex items-center gap-3">
                {/* Notifications */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative"
                  onClick={() => navigate('/dashboard?tab=notifications')}
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </Button>

                {/* Applications */}
                <Link to="/dashboard?tab=applications">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <FileText className="w-4 h-4" />
                    Applications
                  </Button>
                </Link>

                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm" className="gap-2 text-primary hover:text-primary hover:bg-primary/10">
                      <Shield className="w-4 h-4" />
                      {t("nav.admin")}
                    </Button>
                  </Link>
                )}

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="relative h-10 px-2 rounded-full"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={profile?.avatar_url || user?.user_metadata?.avatar_url} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-left hidden sm:block">
                          <p className="text-sm font-medium">
                            {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                          </p>
                          {isAdmin && (
                            <Badge variant="secondary" className="text-xs">
                              Admin
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <UserCircle className="w-4 h-4 mr-2" />
                      View Profile
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => navigate('/profile/edit')}>
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={() => navigate('/dashboard?tab=applications')}>
                      <FileText className="w-4 h-4 mr-2" />
                      My Applications
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => navigate('/dashboard?tab=jobs')}>
                      <Briefcase className="w-4 h-4 mr-2" />
                      My Jobs
                    </DropdownMenuItem>
                    
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate('/admin')}>
                          <Shield className="w-4 h-4 mr-2" />
                          Admin Panel
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link to="/auth?tab=login">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    {t("nav.login")}
                  </Button>
                </Link>
                <Link to="/auth?tab=register">
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
              {/* Navigation Links */}
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

              {/* Language Switcher */}
              <div className="py-2">
                <LanguageSwitcher />
              </div>

              {/* User Section */}
              <div className="pt-4 border-t border-border space-y-3">
                {!loading && user ? (
                  <>
                    {/* User Info */}
                    <div className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={profile?.avatar_url || user?.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                        </p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>

                    {/* User Actions */}
                    <div className="grid grid-cols-1 gap-2">
                      <Link to="/profile" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full gap-2 justify-start">
                          <UserCircle className="w-4 h-4" />
                          View Profile
                        </Button>
                      </Link>
                      
                      <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full gap-2 justify-start">
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Button>
                      </Link>
                      
                      <Link to="/profile/edit" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full gap-2 justify-start">
                          <Settings className="w-4 h-4" />
                          Edit Profile
                        </Button>
                      </Link>
                      
                      <Link to="/dashboard?tab=applications" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full gap-2 justify-start">
                          <FileText className="w-4 h-4" />
                          My Applications
                        </Button>
                      </Link>

                      {isAdmin && (
                        <Link to="/admin" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-full gap-2 justify-start text-primary border-primary hover:bg-primary hover:text-primary-foreground">
                            <Shield className="w-4 h-4" />
                            Admin Panel
                          </Button>
                        </Link>
                      )}

                      <Button 
                        onClick={handleSignOut} 
                        className="w-full gap-2 justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        variant="outline"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link to="/auth?tab=login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full gap-2">
                        <User className="w-4 h-4" />
                        {t("nav.login")}
                      </Button>
                    </Link>
                    <Link to="/auth?tab=register" onClick={() => setIsOpen(false)}>
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
