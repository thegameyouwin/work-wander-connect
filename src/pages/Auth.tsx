import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Loader2, Shield, Briefcase, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import logo from "@/assets/logo.png"; // Import the same logo

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().email("Please enter a valid email address").max(255, "Email is too long"),
  password: z.string().min(6, "Password must be at least 6 characters").max(72, "Password is too long"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignInFormData = z.infer<typeof signInSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  const handleSignIn = async (data: SignInFormData) => {
    setIsLoading(true);
    const { error } = await signIn(data.email, data.password);
    setIsLoading(false);

    if (error) {
      let message = "Failed to sign in. Please try again.";
      if (error.message.includes("Invalid login credentials")) {
        message = "Invalid email or password. Please check your credentials.";
      } else if (error.message.includes("Email not confirmed")) {
        message = "Please confirm your email before signing in.";
      } else if (error.message.includes("rate limit")) {
        message = "Too many attempts. Please try again in a few minutes.";
      }
      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: message,
        duration: 5000,
      });
      return;
    }

    toast({
      title: "Welcome back!",
      description: "You have successfully signed in.",
    });
    navigate("/dashboard");
  };

  const handleSignUp = async (data: SignUpFormData) => {
    setIsLoading(true);
    const { error } = await signUp(data.email, data.password, data.fullName);
    setIsLoading(false);

    if (error) {
      let message = "Failed to create account. Please try again.";
      if (error.message.includes("User already registered")) {
        message = "An account with this email already exists. Please sign in instead.";
      } else if (error.message.includes("Password")) {
        message = "Password is too weak. Please use a stronger password.";
      } else if (error.message.includes("rate limit")) {
        message = "Too many attempts. Please try again in a few minutes.";
      }
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: message,
        duration: 5000,
      });
      return;
    }

    toast({
      title: "Account created successfully!",
      description: "Please check your email to verify your account.",
      duration: 5000,
    });
    setIsSignUp(false);
    signInForm.setValue("email", data.email);
    signInForm.setValue("password", "");
  };

  // Logo Component using the same logo as Navbar
  const Logo = ({ isMobile = false }: { isMobile?: boolean }) => (
    <Link to="/" className={`flex items-center gap-2 ${isMobile ? "justify-center" : ""}`}>
      <img 
        src={logo} 
        alt="Carewell Supports" 
        className={`${isMobile ? "h-10" : "h-12 lg:h-14"} w-auto`}
      />
      {!isMobile && (
        <div className="hidden lg:flex flex-col">
          <span className="text-lg lg:text-xl font-bold text-white">Carewell</span>
          <span className="text-sm text-white/80 -mt-1">Supports</span>
        </div>
      )}
    </Link>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 lg:py-0 h-full">
          {/* Desktop Logo - Hidden on mobile */}
          <div className="hidden lg:block mb-8 lg:mb-12">
            <Logo />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:pr-4 xl:pr-8"
          >
            <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 lg:mb-6 leading-tight">
              Your Pathway to <br />Global Opportunities
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-white/90 mb-6 lg:mb-8 max-w-lg">
              Join thousands of successful professionals who've built their international careers with our trusted guidance.
            </p>

            <div className="space-y-3 sm:space-y-4 mb-6 lg:mb-10">
              {[
                { icon: Shield, text: "Secure & verified visa sponsorship" },
                { icon: Briefcase, text: "Guaranteed job placement assistance" },
                { icon: Globe, text: "Global network of 45+ countries" }
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm md:text-base text-white/90">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Stats - Hidden on small mobile, shown on tablet+ */}
            <div className="hidden sm:grid grid-cols-3 gap-3 lg:gap-4 max-w-md">
              {[
                { value: "50,000+", label: "Professionals" },
                { value: "98%", label: "Success Rate" },
                { value: "45+", label: "Countries" }
              ].map((stat) => (
                <Card key={stat.label} className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-2 sm:p-3 lg:p-4 text-center">
                    <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-white/80 mt-1">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-5 md:px-6 py-6 sm:py-8 lg:py-0">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-sm sm:max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden mb-5 sm:mb-6 md:mb-8">
            <Logo isMobile />
          </div>

          <Card className="border shadow-md sm:shadow-lg">
            <CardContent className="p-5 sm:p-6 md:p-8">
              <div className="text-center mb-5 sm:mb-6 md:mb-8">
                <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {isSignUp ? "Create Account" : "Welcome Back"}
                </h2>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                  {isSignUp
                    ? "Start your international career journey"
                    : "Access your personalized dashboard"}
                </p>
              </div>

              {/* Sign In Form */}
              {!isSignUp && (
                <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4 sm:space-y-5 md:space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm sm:text-base">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-8 sm:pl-10 h-10 sm:h-11 md:h-12 text-sm sm:text-base"
                        {...signInForm.register("email")}
                      />
                    </div>
                    {signInForm.formState.errors.email && (
                      <p className="text-xs text-destructive mt-1">
                        {signInForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
                      <Link 
                        to="/forgot-password" 
                        className="text-xs sm:text-sm text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-8 sm:pl-10 pr-8 sm:pr-10 h-10 sm:h-11 md:h-12 text-sm sm:text-base"
                        {...signInForm.register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? 
                          <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" /> : 
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        }
                      </button>
                    </div>
                    {signInForm.formState.errors.password && (
                      <p className="text-xs text-destructive mt-1">
                        {signInForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-10 sm:h-11 md:h-12 text-sm sm:text-base font-medium" 
                    disabled={isLoading || signInForm.formState.isSubmitting}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              )}

              {/* Sign Up Form */}
              {isSignUp && (
                <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4 sm:space-y-5 md:space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm sm:text-base">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        className="pl-8 sm:pl-10 h-10 sm:h-11 md:h-12 text-sm sm:text-base"
                        {...signUpForm.register("fullName")}
                      />
                    </div>
                    {signUpForm.formState.errors.fullName && (
                      <p className="text-xs text-destructive mt-1">
                        {signUpForm.formState.errors.fullName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signUpEmail" className="text-sm sm:text-base">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                      <Input
                        id="signUpEmail"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-8 sm:pl-10 h-10 sm:h-11 md:h-12 text-sm sm:text-base"
                        {...signUpForm.register("email")}
                      />
                    </div>
                    {signUpForm.formState.errors.email && (
                      <p className="text-xs text-destructive mt-1">
                        {signUpForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signUpPassword" className="text-sm sm:text-base">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                        <Input
                          id="signUpPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-8 sm:pl-10 pr-8 sm:pr-10 h-10 sm:h-11 md:h-12 text-sm sm:text-base"
                          {...signUpForm.register("password")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? 
                            <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" /> : 
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          }
                        </button>
                      </div>
                      {signUpForm.formState.errors.password && (
                        <p className="text-xs text-destructive mt-1">
                          {signUpForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm sm:text-base">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-8 sm:pl-10 pr-8 sm:pr-10 h-10 sm:h-11 md:h-12 text-sm sm:text-base"
                          {...signUpForm.register("confirmPassword")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? 
                            <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" /> : 
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          }
                        </button>
                      </div>
                      {signUpForm.formState.errors.confirmPassword && (
                        <p className="text-xs text-destructive mt-1">
                          {signUpForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-xs sm:text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    <p className="font-medium mb-1">Password requirements:</p>
                    <ul className="space-y-0.5">
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>At least 6 characters long</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Include letters and numbers</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Special characters allowed</span>
                      </li>
                    </ul>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-10 sm:h-11 md:h-12 text-sm sm:text-base font-medium" 
                    disabled={isLoading || signUpForm.formState.isSubmitting}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              )}

              {/* Toggle */}
              <div className="mt-5 sm:mt-6 md:mt-8 pt-4 sm:pt-5 md:pt-6 border-t">
                <div className="text-center">
                  <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setShowPassword(false);
                        setShowConfirmPassword(false);
                      }}
                      className="text-primary font-medium hover:underline"
                    >
                      {isSignUp ? "Sign In here" : "Sign up now"}
                    </button>
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 sm:mt-3">
                    By continuing, you agree to our{" "}
                    <Link to="/terms" className="text-primary hover:underline">Terms</Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Back to Home */}
          <div className="mt-4 sm:mt-5 text-center">
            <Link to="/" className="text-xs sm:text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-1 sm:gap-2">
              <ArrowRight className="w-3 h-3 sm:w-3 sm:h-3 md:w-4 md:h-4 rotate-180" />
              Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
