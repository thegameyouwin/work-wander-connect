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
import { Badge } from "@/components/ui/badge";

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
      description: "You can now sign in with your credentials.",
      duration: 5000,
    });
    setIsSignUp(false);
    signInForm.setValue("email", data.email);
    signInForm.setValue("password", "");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-8 lg:px-16 py-12 lg:py-0 h-full">
          <Link to="/" className="flex items-center gap-3 mb-8 lg:mb-12">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-2xl text-white">Carewell</span>
              <span className="text-sm text-white/80 -mt-1">Supports</span>
            </div>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-heading text-4xl lg:text-5xl font-bold text-white mb-6">
              Your Pathway to <br />Global Opportunities
            </h1>
            <p className="text-lg text-white/90 mb-8 max-w-lg">
              Join thousands of successful professionals who've built their international careers with our trusted guidance.
            </p>

            <div className="space-y-4 mb-12">
              {[
                { icon: Shield, text: "Secure & verified visa sponsorship" },
                { icon: Briefcase, text: "Guaranteed job placement assistance" },
                { icon: Globe, text: "Global network of 45+ countries" }
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white/90">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-md">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white">50,000+</div>
                  <div className="text-sm text-white/80">Professionals</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white">98%</div>
                  <div className="text-sm text-white/80">Success Rate</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white">45+</div>
                  <div className="text-sm text-white/80">Countries</div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-0">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <Link to="/" className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Globe className="w-7 h-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-foreground">Carewell</span>
              <span className="text-xs text-muted-foreground -mt-1">Supports</span>
            </div>
          </Link>

          <Card className="border shadow-xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="font-heading text-3xl font-bold text-foreground mb-2">
                  {isSignUp ? "Create Account" : "Welcome Back"}
                </h2>
                <p className="text-muted-foreground">
                  {isSignUp
                    ? "Start your international career journey"
                    : "Access your personalized dashboard"}
                </p>
              </div>

              {/* Sign In Form */}
              {!isSignUp && (
                <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10 h-12"
                        {...signInForm.register("email")}
                      />
                    </div>
                    {signInForm.formState.errors.email && (
                      <p className="text-sm text-destructive mt-1">{signInForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link 
                        to="/forgot-password" 
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 h-12"
                        {...signInForm.register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {signInForm.formState.errors.password && (
                      <p className="text-sm text-destructive mt-1">{signInForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-medium" 
                    disabled={isLoading || signInForm.formState.isSubmitting}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
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
                <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        className="pl-10 h-12"
                        {...signUpForm.register("fullName")}
                      />
                    </div>
                    {signUpForm.formState.errors.fullName && (
                      <p className="text-sm text-destructive mt-1">{signUpForm.formState.errors.fullName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signUpEmail">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="signUpEmail"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10 h-12"
                        {...signUpForm.register("email")}
                      />
                    </div>
                    {signUpForm.formState.errors.email && (
                      <p className="text-sm text-destructive mt-1">{signUpForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signUpPassword">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="signUpPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10 h-12"
                          {...signUpForm.register("password")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {signUpForm.formState.errors.password && (
                        <p className="text-sm text-destructive mt-1">{signUpForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 h-12"
                          {...signUpForm.register("confirmPassword")}
                        />
                      </div>
                      {signUpForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-destructive mt-1">{signUpForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p className="mb-2">Password requirements:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>At least 6 characters long</li>
                      <li>Include letters and numbers</li>
                      <li>Special characters allowed</li>
                    </ul>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-medium" 
                    disabled={isLoading || signUpForm.formState.isSubmitting}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              )}

              {/* Toggle */}
              <div className="mt-8 pt-6 border-t">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setShowPassword(false);
                      }}
                      className="text-primary font-medium hover:underline"
                    >
                      {isSignUp ? "Sign In here" : "Sign up now"}
                    </button>
                  </p>
                  <p className="text-xs text-muted-foreground mt-4">
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
          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-2">
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
