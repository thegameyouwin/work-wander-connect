import { motion } from "framer-motion";
import { CheckCircle, DollarSign, Calendar, Briefcase, Shield, Clock, Sparkles, Target, Zap, TrendingUp, Award } from "lucide-react";
import { ApplicationData } from "@/pages/Apply";

const paymentPlans = [
  {
    id: "milestone" as const,
    name: "Milestone Payment Plan",
    price: "$4,999",
    originalPrice: "$5,500",
    description: "Structured payments aligned with your application progress",
    features: [
      "Pay only upon successful milestone completion",
      "Initial investment of $499 to begin the process",
      "Flexible cancellation before each milestone",
      "Priority support throughout the process",
      "Transparent pricing with no hidden fees",
      "Full refund guarantee for incomplete milestones",
    ],
    milestones: [
      { name: "Initial Consultation", amount: "$499" },
      { name: "Document Preparation", amount: "$1,200" },
      { name: "Employer Matching", amount: "$1,800" },
      { name: "Visa & Relocation", amount: "$1,500" },
    ],
    icon: Calendar,
    recommended: true,
    tagline: "For applicants seeking structured flexibility",
    savings: "Save $500 compared to standard rates",
    highlight: "Most flexible payment structure"
  },
  {
    id: "full_upfront" as const,
    name: "Full Upfront Payment",
    price: "$4,299",
    originalPrice: "$5,000",
    description: "Maximum savings with premium priority service",
    features: [
      "15% discount applied to total service fee",
      "Expedited processing with priority queue placement",
      "Dedicated case manager with direct communication access",
      "Guaranteed interview scheduling within 30 days",
      "Comprehensive relocation assistance package",
      "Access to premium employer network",
    ],
    icon: DollarSign,
    recommended: false,
    tagline: "Maximum value with premium benefits",
    savings: "Save $701 with upfront payment",
    highlight: "Premium priority processing"
  },
  {
    id: "deferred" as const,
    name: "Success-Based Partnership",
    price: "$2,750 × 2 payments",
    originalPrice: "$6,500",
    description: "Aligned interests with performance-based payments",
    features: [
      "First payment: $2,750 upon program approval",
      "Second payment: $2,750 only after securing employment",
      "Six-month employment guarantee period",
      "Financial risk protection if employment not secured",
      "Professional profile optimization included",
    ],
    icon: TrendingUp,
    recommended: false,
    tagline: "Shared success, aligned incentives",
    savings: "Performance-based payment structure",
    highlight: "Minimal upfront financial commitment",
    note: "Total $5,500 (50% upon approval + 50% after employment secured)"
  },
];

interface PaymentPlanStepProps {
  data: ApplicationData;
  onUpdate: (data: Partial<ApplicationData>) => void;
}

export const PaymentPlanStep = ({ data, onUpdate }: PaymentPlanStepProps) => {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Strategic Investment Options</span>
        </div>
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-3">
          Select Your Payment Plan
        </h2>
        <p className="text-muted-foreground md:text-lg max-w-2xl mx-auto">
          Choose the payment structure that aligns with your financial preferences. 
          All plans include our comprehensive support services.
        </p>
      </div>

      {/* Payment Plans - Stacked in rows */}
      <div className="space-y-4">
        {paymentPlans.map((plan) => (
          <motion.div
            key={plan.id}
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            {/* Recommended Badge */}
            {plan.recommended && (
              <div className="absolute -top-3 left-0 z-10">
                <div className="bg-primary text-white px-4 py-1 rounded-r-full text-xs font-semibold shadow-md flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  RECOMMENDED
                </div>
              </div>
            )}

            <button
              onClick={() => onUpdate({ paymentPlan: plan.id })}
              className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                data.paymentPlan === plan.id
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-border hover:border-primary/20 bg-card hover:shadow-md"
              } ${plan.recommended ? "pt-8" : ""}`}
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* Left Column - Icon and Header */}
                <div className="flex items-start gap-4 md:w-1/3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    data.paymentPlan === plan.id ? "bg-primary text-white" : "bg-primary/10 text-primary"
                  }`}>
                    <plan.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-lg font-bold text-foreground mb-1">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{plan.tagline}</p>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                </div>

                {/* Middle Column - Price and Features */}
                <div className="md:w-1/3">
                  <div className="mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className="font-heading text-2xl font-bold text-foreground">
                        {plan.price}
                      </span>
                      {plan.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          {plan.originalPrice}
                        </span>
                      )}
                    </div>
                    {plan.savings && (
                      <div className="mt-2 px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full inline-flex items-center gap-1 border border-green-100">
                        <CheckCircle className="w-3 h-3" />
                        {plan.savings}
                      </div>
                    )}
                    {plan.note && (
                      <p className="text-xs text-muted-foreground mt-2">{plan.note}</p>
                    )}
                  </div>

                  <ul className="space-y-2">
                    {plan.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <div className="flex-shrink-0 w-4 h-4 rounded-full bg-green-50 text-green-600 flex items-center justify-center mt-0.5">
                          <CheckCircle className="w-3 h-3" />
                        </div>
                        <span className="text-foreground leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right Column - Milestones/Details and Selection */}
                <div className="md:w-1/3">
                  {plan.milestones && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        Payment Milestones
                      </p>
                      <div className="space-y-2">
                        {plan.milestones.map((milestone, index) => (
                          <div key={milestone.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                                {index + 1}
                              </div>
                              <span className="text-muted-foreground">{milestone.name}</span>
                            </div>
                            <span className="font-bold text-primary">{milestone.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-border/30">
                    <div className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                      {plan.highlight}
                    </div>
                    {data.paymentPlan === plan.id ? (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full border border-border"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      {/* Key Benefits - Also in rows */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-muted/30 rounded-xl p-6 border"
      >
        <div className="text-center mb-6">
          <h3 className="font-heading text-xl font-bold text-foreground mb-2">
            Service Guarantees
          </h3>
          <p className="text-muted-foreground">
            Included with all payment plans
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-white rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Service Guarantees</h4>
                <p className="text-sm text-muted-foreground">
                  Interview scheduling guarantee within specified timeframe
                </p>
              </div>
            </div>
            <div className="md:ml-auto">
              <p className="text-sm text-muted-foreground">
                Comprehensive visa application support with transparent refund policies
              </p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-white rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Processing Efficiency</h4>
                <p className="text-sm text-muted-foreground">
                  Average placement timeline of 45 days
                </p>
              </div>
            </div>
            <div className="md:ml-auto">
              <p className="text-sm text-muted-foreground">
                Continuous support throughout the process with travel coordination services
              </p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-white rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Employer Network</h4>
                <p className="text-sm text-muted-foreground">
                  Access to extensive employer partnerships
                </p>
              </div>
            </div>
            <div className="md:ml-auto">
              <p className="text-sm text-muted-foreground">
                Competitive salary opportunities with family employment assistance
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Performance Metrics - Row layout */}
      <div className="text-center">
        <div className="flex flex-col sm:flex-row justify-center gap-6 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">1,234+</div>
            <div className="text-sm text-muted-foreground">Successful Placements</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">98%</div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">4.9/5</div>
            <div className="text-sm text-muted-foreground">Client Satisfaction</div>
          </div>
        </div>
        
        {data.paymentPlan && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block p-4 bg-primary/5 rounded-lg border border-primary/10"
          >
            <p className="font-semibold text-foreground">
              Selected Plan: <span className="text-primary">{paymentPlans.find(p => p.id === data.paymentPlan)?.name}</span>
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
