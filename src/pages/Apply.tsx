import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, FileText, CreditCard, CheckCircle, ArrowRight, ArrowLeft, 
  Loader2, Shield, Clock, DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PersonalInfoStep } from "@/components/application/PersonalInfoStep";
import { DocumentUploadStep } from "@/components/application/DocumentUploadStep";
import { PaymentPlanStep } from "@/components/application/PaymentPlanStep";
import { ReviewStep } from "@/components/application/ReviewStep";

const steps = [
  { id: 1, name: "Personal Info", icon: User, description: "Verify your details" },
  { id: 2, name: "Documents", icon: FileText, description: "Upload required documents" },
  { id: 3, name: "Payment Plan", icon: CreditCard, description: "Choose your payment option" },
  { id: 4, name: "Review", icon: CheckCircle, description: "Review and submit" },
];

export interface ApplicationData {
  fullName: string;
  email: string;
  phone: string;
  countryOfOrigin: string;
  desiredDestination: string;
  paymentPlan: "milestone" | "full_upfront" | "deferred";
  documents: UploadedDocument[];
}

export interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  status: "pending" | "uploaded";
}

const Apply = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingApplication, setExistingApplication] = useState<string | null>(null);
  
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    fullName: "",
    email: "",
    phone: "",
    countryOfOrigin: "",
    desiredDestination: "USA",
    paymentPlan: "milestone",
    documents: [],
  });

  // Check if user has existing application
  useEffect(() => {
    const checkExistingApplication = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("applications")
        .select("id, status")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (data) {
        setExistingApplication(data.id);
      }
    };
    
    checkExistingApplication();
  }, [user]);

  // Populate from profile
  useEffect(() => {
    if (profile) {
      setApplicationData(prev => ({
        ...prev,
        fullName: profile.full_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        countryOfOrigin: profile.country_of_origin || "",
        desiredDestination: profile.desired_destination || "USA",
      }));
    }
  }, [profile]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  const updateApplicationData = (data: Partial<ApplicationData>) => {
    setApplicationData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Update profile with latest info
      await supabase
        .from("profiles")
        .update({
          phone: applicationData.phone,
          country_of_origin: applicationData.countryOfOrigin,
          desired_destination: applicationData.desiredDestination,
        })
        .eq("id", user.id);

      // Calculate total fee based on payment plan
      const totalFee = applicationData.paymentPlan === "full_upfront" ? 4500 : 5000;
      
      // Create or update application
      let applicationId = existingApplication;
      
      if (!applicationId) {
        const { data: newApp, error: appError } = await supabase
          .from("applications")
          .insert({
            user_id: user.id,
            payment_plan: applicationData.paymentPlan,
            total_fee: totalFee,
            status: "submitted",
          })
          .select("id")
          .single();
        
        if (appError) throw appError;
        applicationId = newApp.id;
      } else {
        await supabase
          .from("applications")
          .update({
            payment_plan: applicationData.paymentPlan,
            total_fee: totalFee,
            status: "submitted",
          })
          .eq("id", applicationId);
      }

      // Save document records
      for (const doc of applicationData.documents) {
        await supabase
          .from("documents")
          .insert({
            application_id: applicationId,
            document_type: doc.type,
            name: doc.name,
            file_url: doc.url,
            status: "pending",
          });
      }

      // Create notification
      await supabase
        .from("notifications")
        .insert({
          user_id: user.id,
          type: "application",
          title: "Application Submitted",
          message: "Your immigration application has been submitted successfully. We will review it shortly.",
          link: "/dashboard",
        });

      toast({
        title: "Application Submitted!",
        description: "Your application has been submitted successfully. Check your dashboard for updates.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "Failed to submit application. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const progressPercent = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container-wide max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">
              Start Your Immigration Application
            </h1>
            <p className="text-muted-foreground text-lg">
              Complete these steps to begin your journey to the USA
            </p>
          </motion.div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                Step {currentStep} of {steps.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progressPercent)}% Complete
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Step Indicators */}
          <div className="hidden md:flex items-center justify-between mb-12">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${index < steps.length - 1 ? "flex-1" : ""}`}
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      currentStep >= step.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>
                  <span className={`text-sm mt-2 ${
                    currentStep >= step.id ? "text-foreground font-medium" : "text-muted-foreground"
                  }`}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded ${
                      currentStep > step.id ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 1 && (
                  <PersonalInfoStep
                    data={applicationData}
                    onUpdate={updateApplicationData}
                  />
                )}
                {currentStep === 2 && (
                  <DocumentUploadStep
                    data={applicationData}
                    onUpdate={updateApplicationData}
                    userId={user?.id || ""}
                  />
                )}
                {currentStep === 3 && (
                  <PaymentPlanStep
                    data={applicationData}
                    onUpdate={updateApplicationData}
                  />
                )}
                {currentStep === 4 && (
                  <ReviewStep data={applicationData} />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>
              
              {currentStep < steps.length ? (
                <Button onClick={nextStep} className="gap-2">
                  Next Step
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <CheckCircle className="w-4 h-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>Secure & Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>24-48h Review Time</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <span>Flexible Payment Options</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Apply;
