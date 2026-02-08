import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, FileText, CreditCard, CheckCircle, ArrowRight, ArrowLeft, 
  Loader2, Shield, Clock, DollarSign, AlertCircle, Lock,
  Upload, Globe, Phone, Mail
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const steps = [
  { 
    id: 1, 
    name: "Personal Info", 
    icon: User, 
    description: "Verify your details",
    required: true
  },
  { 
    id: 2, 
    name: "Documents", 
    icon: FileText, 
    description: "Upload required documents",
    required: true
  },
  { 
    id: 3, 
    name: "Payment Plan", 
    icon: CreditCard, 
    description: "Choose your payment option",
    required: true
  },
  { 
    id: 4, 
    name: "Review", 
    icon: CheckCircle, 
    description: "Review and submit",
    required: false
  },
];

export interface ApplicationData {
  fullName: string;
  email: string;
  phone: string;
  countryOfOrigin: string;
  desiredDestination: string;
  visaType: string;
  paymentPlan: "milestone" | "full_upfront" | "deferred";
  documents: UploadedDocument[];
  applicationType: "work" | "study" | "family" | "business";
  specialization?: string;
  experienceYears?: number;
  educationLevel?: string;
}

export interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  status: "pending" | "uploaded" | "verified";
  size: number;
  uploadedAt: string;
}

interface RequiredDocument {
  type: string;
  name: string;
  description: string;
  required: boolean;
  acceptedFormats: string[];
  maxSizeMB: number;
}

interface ApplicationStatus {
  id?: string;
  status: string;
  lastStepCompleted: number;
}

const Apply = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null);
  const [requiredDocuments, setRequiredDocuments] = useState<RequiredDocument[]>([]);
  const [destinationCountries, setDestinationCountries] = useState<string[]>([]);
  const [visaTypes, setVisaTypes] = useState<string[]>([]);
  
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    fullName: "",
    email: "",
    phone: "",
    countryOfOrigin: "",
    desiredDestination: "USA",
    visaType: "Work Visa",
    paymentPlan: "milestone",
    documents: [],
    applicationType: "work",
  });

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Load destination countries
        const { data: countries } = await supabase
          .from("countries")
          .select("name")
          .eq("active", true)
          .order("name");
        
        if (countries) {
          setDestinationCountries(countries.map(c => c.name));
        }

        // Load visa types
        const { data: visaData } = await supabase
          .from("visa_types")
          .select("*")
          .eq("active", true)
          .order("name");
        
        if (visaData) {
          setVisaTypes(visaData.map(v => v.name));
        }

        // Load required documents
        const { data: docsData } = await supabase
          .from("required_documents")
          .select("*")
          .eq("active", true)
          .order("display_order");
        
        if (docsData) {
          setRequiredDocuments(docsData);
        }

        // Check existing application
        const { data: existingApp } = await supabase
          .from("applications")
          .select("id, status, last_step_completed, application_data")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (existingApp) {
          setApplicationStatus({
            id: existingApp.id,
            status: existingApp.status,
            lastStepCompleted: existingApp.last_step_completed || 1
          });
          
          // Restore saved data
          if (existingApp.application_data) {
            setApplicationData(prev => ({
              ...prev,
              ...existingApp.application_data
            }));
          }
          
          // If application is already submitted, redirect
          if (existingApp.status === "submitted") {
            toast({
              title: "Application Already Submitted",
              description: "You have an active application. Please check your dashboard for updates.",
            });
            navigate("/dashboard");
          }
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load application data. Please refresh the page.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [user, toast, navigate]);

  // Populate from profile
  useEffect(() => {
    if (profile && !applicationStatus) {
      setApplicationData(prev => ({
        ...prev,
        fullName: profile.full_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        countryOfOrigin: profile.country_of_origin || "",
        desiredDestination: profile.desired_destination || "USA",
      }));
    }
  }, [profile, applicationStatus]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  const updateApplicationData = async (data: Partial<ApplicationData>) => {
    const updatedData = { ...applicationData, ...data };
    setApplicationData(updatedData);
    
    // Auto-save to database
    if (user) {
      try {
        await supabase
          .from("applications")
          .upsert({
            id: applicationStatus?.id,
            user_id: user.id,
            application_data: updatedData,
            last_step_completed: currentStep,
            status: "draft",
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id'
          });
      } catch (error) {
        console.error("Error auto-saving:", error);
      }
    }
  };

  const nextStep = async () => {
    // Validate current step before proceeding
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep < steps.length) {
      const nextStepNum = currentStep + 1;
      setCurrentStep(nextStepNum);
      
      // Update last completed step in database
      if (user && nextStepNum > (applicationStatus?.lastStepCompleted || 0)) {
        try {
          await supabase
            .from("applications")
            .update({
              last_step_completed: nextStepNum,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id);
        } catch (error) {
          console.error("Error updating step:", error);
        }
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!applicationData.fullName || !applicationData.email || !applicationData.phone) {
          toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please fill in all required personal information.",
          });
          return false;
        }
        return true;
      case 2:
        // Check if all required documents are uploaded
        const requiredDocTypes = requiredDocuments
          .filter(doc => doc.required)
          .map(doc => doc.type);
        
        const uploadedDocTypes = applicationData.documents.map(doc => doc.type);
        const missingDocs = requiredDocTypes.filter(type => !uploadedDocTypes.includes(type));
        
        if (missingDocs.length > 0) {
          toast({
            variant: "destructive",
            title: "Missing Documents",
            description: `Please upload all required documents: ${missingDocs.join(', ')}`,
          });
          return false;
        }
        return true;
      case 3:
        if (!applicationData.paymentPlan) {
          toast({
            variant: "destructive",
            title: "Payment Plan Required",
            description: "Please select a payment plan to continue.",
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to submit your application.",
      });
      navigate("/auth");
      return;
    }

    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Calculate total fee based on payment plan and visa type
      const feeConfig = {
        "milestone": 5000,
        "full_upfront": 4500, // 10% discount
        "deferred": 5500, // With interest
      };

      const totalFee = feeConfig[applicationData.paymentPlan];
      
      // Create final application record
      const { data: application, error: appError } = await supabase
        .from("applications")
        .upsert({
          id: applicationStatus?.id,
          user_id: user.id,
          application_data: applicationData,
          status: "submitted",
          total_fee: totalFee,
          paid_amount: 0,
          payment_plan: applicationData.paymentPlan,
          visa_type: applicationData.visaType,
          application_type: applicationData.applicationType,
          submitted_at: new Date().toISOString(),
          last_step_completed: 4,
        })
        .select("id")
        .single();

      if (appError) throw appError;

      // Save document records
      const documentPromises = applicationData.documents.map(doc =>
        supabase
          .from("documents")
          .insert({
            application_id: application.id,
            document_type: doc.type,
            name: doc.name,
            file_url: doc.url,
            file_size: doc.size,
            status: "pending",
            uploaded_by: user.id,
          })
      );

      await Promise.all(documentPromises);

      // Update user profile with latest info
      await supabase
        .from("profiles")
        .update({
          phone: applicationData.phone,
          country_of_origin: applicationData.countryOfOrigin,
          desired_destination: applicationData.desiredDestination,
          visa_type: applicationData.visaType,
          last_application_date: new Date().toISOString(),
        })
        .eq("id", user.id);

      // Create notification
      await supabase
        .from("notifications")
        .insert({
          user_id: user.id,
          type: "success",
          title: "Application Submitted Successfully",
          message: "Your immigration application has been submitted and is now under review. We'll contact you within 24-48 hours.",
          read: false,
          action_url: "/dashboard",
        });

      // Create admin notification
      await supabase
        .from("admin_notifications")
        .insert({
          type: "new_application",
          title: "New Application Submitted",
          message: `${applicationData.fullName} submitted a ${applicationData.visaType} application`,
          reference_id: application.id,
          priority: "high",
        });

      toast({
        title: "🎉 Application Submitted!",
        description: "Your application has been submitted successfully. Our team will review it shortly.",
        duration: 5000,
      });

      // Navigate to dashboard after delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "Failed to submit application. Please try again.",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Loading Application</h2>
            <p className="text-muted-foreground">Preparing your application form...</p>
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = (currentStep / steps.length) * 100;
  const completedDocuments = applicationData.documents.filter(d => d.status === "uploaded").length;
  const requiredDocumentCount = requiredDocuments.filter(d => d.required).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      
      <main className="pt-28 pb-16">
        <div className="container-wide max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">Immigration Application</span>
            </div>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
              Start Your Journey
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Complete your immigration application in 4 simple steps. Save your progress and return anytime.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Sidebar - Progress & Info */}
            <div className="lg:col-span-1">
              <Card className="sticky top-28 border shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Application Progress
                  </CardTitle>
                  <CardDescription>
                    {applicationStatus ? "Continue where you left off" : "Start your application"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Progress Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-foreground">
                        Step {currentStep} of {steps.length}
                      </span>
                      <Badge variant="outline">
                        {Math.round(progressPercent)}% Complete
                      </Badge>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>

                  {/* Step List */}
                  <div className="space-y-4">
                    {steps.map((step) => (
                      <div
                        key={step.id}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          currentStep === step.id
                            ? "bg-primary/10 border border-primary/20"
                            : currentStep > step.id
                            ? "bg-muted/50"
                            : "hover:bg-muted/30"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          currentStep >= step.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {currentStep > step.id ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <step.icon className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm ${
                            currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                          }`}>
                            {step.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {step.description}
                          </p>
                        </div>
                        {step.required && (
                          <Badge variant="outline" size="sm" className="ml-2">
                            Required
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Document Status */}
                  {currentStep >= 2 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Documents</span>
                          <span className="text-sm text-muted-foreground">
                            {completedDocuments} / {requiredDocumentCount}
                          </span>
                        </div>
                        <Progress 
                          value={(completedDocuments / requiredDocumentCount) * 100} 
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground">
                          {requiredDocumentCount - completedDocuments} more required
                        </p>
                      </div>
                    </>
                  )}

                  {/* Quick Contact */}
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Need Help?</p>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                        <Mail className="w-4 h-4" />
                        support@carewellsupports.com
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                        <Phone className="w-4 h-4" />
                        +1 (800) CAREWELL
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2">
              <Card className="border shadow-lg">
                <CardContent className="p-6 md:p-8">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Step Indicator Header */}
                      <div className="flex items-center gap-3 mb-6 pb-6 border-b">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          currentStep === 4 
                            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" 
                            : "bg-primary/10 text-primary"
                        }`}>
                          {currentStep === 1 && <User className="w-6 h-6" />}
                          {currentStep === 2 && <FileText className="w-6 h-6" />}
                          {currentStep === 3 && <CreditCard className="w-6 h-6" />}
                          {currentStep === 4 && <CheckCircle className="w-6 h-6" />}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground">
                            {steps[currentStep - 1].name}
                          </h3>
                          <p className="text-muted-foreground">
                            {steps[currentStep - 1].description}
                          </p>
                        </div>
                      </div>

                      {/* Step Content */}
                      <div className="py-2">
                        {currentStep === 1 && (
                          <PersonalInfoStep
                            data={applicationData}
                            onUpdate={updateApplicationData}
                            destinationCountries={destinationCountries}
                            visaTypes={visaTypes}
                          />
                        )}
                        {currentStep === 2 && (
                          <DocumentUploadStep
                            data={applicationData}
                            onUpdate={updateApplicationData}
                            userId={user?.id || ""}
                            requiredDocuments={requiredDocuments}
                          />
                        )}
                        {currentStep === 3 && (
                          <PaymentPlanStep
                            data={applicationData}
                            onUpdate={updateApplicationData}
                          />
                        )}
                        {currentStep === 4 && (
                          <ReviewStep 
                            data={applicationData} 
                            requiredDocuments={requiredDocuments}
                          />
                        )}
                      </div>
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
                      <Button 
                        onClick={nextStep} 
                        className="gap-2"
                        size="lg"
                      >
                        {currentStep === 2 ? "Continue to Payment" : "Next Step"}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting}
                        className="gap-2"
                        size="lg"
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

                  {/* Save Progress Notice */}
                  <div className="mt-6 pt-4 border-t border-dashed">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Lock className="w-4 h-4" />
                      <span>Your progress is automatically saved. You can return anytime to continue.</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trust & Security Badges */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                  <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Bank-Level Security</p>
                    <p className="text-xs text-muted-foreground">256-bit SSL encryption</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                  <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">24-48h Review</p>
                    <p className="text-xs text-muted-foreground">Fast application processing</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                  <DollarSign className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Flexible Payments</p>
                    <p className="text-xs text-muted-foreground">Multiple payment options</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Apply;
