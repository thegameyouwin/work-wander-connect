import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Loader2, Shield, Globe } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const [logoError, setLogoError] = useState(false);
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

  // Handle logo loading error
  useEffect(() => {
    setLogoError(false);
  }, [logo]);

  const handleSignIn = async (data: SignInFormData) => {
    setIsLoading(true);
    const { error, user } = await signIn(data.email, data.password);
    setIsLoading(false);

    if (error) {
      let message = "Failed to sign in. Please try again.";
      if (error.message.includes("Invalid login credentials")) {
        message = "Invalid email or password. Please check your credentials.";
      }
      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: message,
      });
      return;
    }

    toast({
      title: "Welcome back!",
      description: "You have successfully signed in.",
    });
    
    // Check if user needs to complete profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single();
    
    if (profile && profile.country_of_origin && profile.desired_destination) {
      navigate("/dashboard");
    } else {
      navigate("/profile");
    }
  };

  const handleSignUp = async (data: SignUpFormData) => {
    setIsLoading(true);
    
    try {
      // First, check if user already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', data.email)
        .maybeSingle();

      if (existingUser) {
        toast({
          variant: "destructive",
          title: "Account Exists",
          description: "An account with this email already exists. Please sign in instead.",
        });
        setIsLoading(false);
        return;
      }

      // Create user with email confirmation DISABLED
      const { error: signUpError, data: authData } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
          // Disable email confirmation for now
          emailRedirectTo: `${window.location.origin}/auth?verified=true`,
        }
      });

      if (signUpError) throw signUpError;

      // Create profile in our database
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user?.id,
          email: data.email,
          full_name: data.fullName,
          created_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        // Continue anyway - profile can be created later
      }

      // Send welcome email using Resend
      await sendWelcomeEmail(data.email, data.fullName);

      toast({
        title: "🎉 Account Created Successfully!",
        description: "You can now sign in with your credentials.",
        duration: 5000,
      });

      // Switch to sign in form
      setIsSignUp(false);
      signInForm.setValue("email", data.email);
      
    } catch (error: any) {
      console.error("Sign up error:", error);
      
      let message = "Failed to create account. Please try again.";
      if (error.message?.includes("already registered")) {
        message = "An account with this email already exists. Please sign in instead.";
      } else if (error.message?.includes("password")) {
        message = "Password is too weak. Please use a stronger password.";
      }
      
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendWelcomeEmail = async (email: string, name: string) => {
    try {
      // Create email in our database to trigger Resend
      const { error } = await supabase
        .from('email_queue')
        .insert({
          email_type: 'welcome',
          recipient_email: email,
          recipient_name: name,
          subject: 'Welcome to Carewell Supports!',
          template_data: {
            name: name,
            login_url: `${window.location.origin}/auth`,
            support_email: 'support@carewellsupports.com'
          },
          status: 'pending'
        });

      if (error) {
        console.error("Error queuing welcome email:", error);
      }
    } catch (error) {
      console.error("Error sending welcome email:", error);
    }
  };

  const sendVerificationEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?verified=true`,
        }
      });

      if (error) throw error;

      toast({
        title: "Verification Email Sent",
        description: "Please check your email to verify your account.",
      });
    } catch (error) {
      console.error("Error sending verification email:", error);
      toast({
        variant: "destructive",
        title: "Failed to Send Email",
        description: "Please try again later.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-12">
            {logoError ? (
              <div className="w-20 h-20 rounded-xl bg-white/20 flex items-center justify-center">
                <Globe className="w-10 h-10 text-white" />
              </div>
            ) : (
              <img 
                src={logo} 
                alt="Carewell Supports" 
                className="h-20 w-auto"
                onError={() => setLogoError(true)}
              />
            )}
            <div className="flex flex-col">
              <span className="text-2xl font-bold">Carewell</span>
              <span className="text-white/80">Supports</span>
            </div>
          </Link>

          <h1 className="font-heading text-5xl font-bold mb-6 leading-tight">
            Your Pathway to Legal<br />Work Abroad
          </h1>
          <p className="text-lg opacity-90 mb-8 max-w-md">
            Join 50,000+ professionals who successfully migrated with our trusted guidance.
          </p>

          <div className="space-y-4 mb-12">
            {[
              "Verified visa-sponsored jobs",
              "Transparent milestone payments",
              "24/7 expert support team",
              "98% application success rate"
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-primary" />
                </div>
                <span className="text-white/90">{item}</span>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg">
              <Shield className="w-5 h-5" />
              <span className="text-sm">Secure & Encrypted</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg">
              <Globe className="w-5 h-5" />
              <span className="text-sm">Global Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
            {logoError ? (
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                <Globe className="w-8 h-8 text-primary" />
              </div>
            ) : (
              <img 
                src={logo} 
                alt="Carewell Supports" 
                className="h-16 w-auto"
                onError={() => setLogoError(true)}
              />
            )}
            <div className="flex flex-col">
              <span className="text-xl font-bold text-foreground">Carewell</span>
              <span className="text-sm text-muted-foreground">Supports</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-2">
              {isSignUp ? "Start Your Journey" : "Welcome Back"}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              {isSignUp
                ? "Create your account to begin your immigration journey"
                : "Sign in to access your dashboard and applications"}
            </p>
          </div>

          {/* Sign In Form */}
          {!isSignUp && (
            <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10 h-12"
                    disabled={isLoading}
                    {...signInForm.register("email")}
                  />
                </div>
                {signInForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{signInForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={() => sendVerificationEmail(signInForm.getValues("email"))}
                    className="text-xs text-primary hover:underline"
                  >
                    Resend verification?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-12"
                    disabled={isLoading}
                    {...signInForm.register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {signInForm.formState.errors.password && (
                  <p className="text-sm text-destructive">{signInForm.formState.errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
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
            <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    className="pl-10 h-12"
                    disabled={isLoading}
                    {...signUpForm.register("fullName")}
                  />
                </div>
                {signUpForm.formState.errors.fullName && (
                  <p className="text-sm text-destructive">{signUpForm.formState.errors.fullName.message}</p>
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
                    disabled={isLoading}
                    {...signUpForm.register("email")}
                  />
                </div>
                {signUpForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{signUpForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signUpPassword">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="signUpPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-12"
                    disabled={isLoading}
                    {...signUpForm.register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {signUpForm.formState.errors.password && (
                  <p className="text-sm text-destructive">{signUpForm.formState.errors.password.message}</p>
                )}
                <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
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
                    disabled={isLoading}
                    {...signUpForm.register("confirmPassword")}
                  />
                </div>
                {signUpForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">{signUpForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="text-xs text-muted-foreground space-y-2">
                <p className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Your data is protected with enterprise-grade security</span>
                </p>
                <p className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>You can sign in immediately - no email confirmation required</span>
                </p>
              </div>

              <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
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
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setShowPassword(false);
                }}
                className="text-primary font-medium hover:underline"
                disabled={isLoading}
              >
                {isSignUp ? "Sign In" : "Create one"}
              </button>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-8 text-center border-t pt-6">
            <Link 
              to="/" 
              className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-2"
            >
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
