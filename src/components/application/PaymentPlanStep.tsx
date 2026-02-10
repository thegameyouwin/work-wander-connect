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
      { name: "Initial Consultation & Strategy", amount: "$499", description: "Comprehensive assessment and planning" },
      { name: "Document Preparation", amount: "$1,200", description: "CV optimization and portfolio development" },
      { name: "Employer Matching", amount: "$1,800", description: "Direct employer introductions and interviews" },
      { name: "Visa Processing & Relocation", amount: "$1,500", description: "Complete visa processing and travel arrangements" },
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
      "Spouse and dependent application included",
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
      "Performance-aligned payment structure",
      "Financial risk protection if employment not secured",
      "Professional profile optimization included",
      "Unlimited interview preparation and coaching",
      "Salary negotiation training and support",
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
    <div className="space-y-6 md:space-y-8">
      {/* Header Section */}
      <div className="text-center mb-6 md:mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-primary/10 border border-primary/20 mb-3 md:mb-4">
          <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
          <span className="text-xs md:text-sm font-medium text-primary">Strategic Investment Options</span>
        </div>
        <h2 className="font-heading text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-2 md:mb-3">
          Select Your Payment Plan
        </h2>
        <p className="text-muted-foreground text-sm md:text-base lg:text-lg max-w-2xl mx-auto px-4">
          Choose the payment structure that aligns with your financial preferences. 
          All plans include our comprehensive support services and high success rate guarantee.
        </p>
      </div>

      {/* Payment Plans - Row-based for laptops, column for mobile, grid for large screens */}
      <div className="space-y-4 md:space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
        {paymentPlans.map((plan) => (
          <motion.div
            key={plan.id}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="relative h-full"
          >
            {/* Recommended Badge */}
            {plan.recommended && (
              <div className="absolute -top-2 md:-top-3 left-1/2 transform -translate-x-1/2 z-10">
                <div className="bg-primary text-white px-2.5 py-1 md:px-3 md:py-1 rounded-full text-xs font-semibold shadow-md flex items-center gap-1 whitespace-nowrap">
                  <Award className="w-2.5 h-2.5 md:w-3 md:h-3" />
                  RECOMMENDED
                </div>
              </div>
            )}

            <button
              onClick={() => onUpdate({ paymentPlan: plan.id })}
              className={`w-full h-full text-left p-4 md:p-5 lg:p-6 rounded-xl border-2 transition-all duration-200 flex flex-col ${
                data.paymentPlan === plan.id
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-border hover:border-primary/20 bg-card hover:shadow-md"
              } ${plan.recommended ? "pt-5 md:pt-7 lg:pt-10" : ""}`}
            >
              {/* Plan Header - Row layout for laptops */}
              <div className="mb-3 md:mb-4 lg:mb-6">
                <div className="flex items-start gap-3 mb-2">
                  <div className={`w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    data.paymentPlan === plan.id ? "bg-primary text-white" : "bg-primary/10 text-primary"
                  }`}>
                    <plan.icon className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-base md:text-lg font-bold text-foreground truncate">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{plan.tagline}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2 md:mb-3 line-clamp-2">{plan.description}</p>
              </div>

              {/* Price and Features in row for laptops */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:gap-4 flex-1">
                {/* Price Section */}
                <div className="mb-3 md:mb-4 lg:mb-0 lg:w-1/3 lg:min-w-[120px]">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-heading text-xl md:text-2xl lg:text-3xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    {plan.originalPrice && (
                      <span className="text-xs md:text-sm text-muted-foreground line-through">
                        {plan.originalPrice}
                      </span>
                    )}
                  </div>
                  {plan.savings && (
                    <div className="mt-2 px-2 py-1 md:px-3 md:py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full inline-flex items-center gap-1 border border-green-100">
                      <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3" />
                      <span className="truncate">{plan.savings}</span>
                    </div>
                  )}
                  {plan.note && (
                    <p className="text-xs text-muted-foreground mt-2">{plan.note}</p>
                  )}
                </div>

                {/* Features List */}
                <div className="flex-1 mb-3 md:mb-4 lg:mb-0 lg:w-2/3">
                  <ul className="space-y-1.5 md:space-y-2">
                    {plan.features.slice(0, plan.id === "deferred" ? 3 : 2).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs md:text-sm">
                        <div className="flex-shrink-0 w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-green-50 text-green-600 flex items-center justify-center mt-0.5">
                          <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3" />
                        </div>
                        <span className="text-foreground leading-relaxed line-clamp-2">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Milestones Section - Full width */}
              {plan.milestones && (
                <div className="mt-3 pt-3 border-t border-border/30">
                  <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                    <span className="truncate">Structured Payment Schedule</span>
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {plan.milestones.map((milestone, index) => (
                      <div key={milestone.name} className="flex flex-col p-2 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-foreground text-xs truncate">{milestone.name}</div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-2 mb-1">{milestone.description}</div>
                        <span className="font-bold text-primary text-sm">{milestone.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selection Indicator */}
              <div className="mt-3 pt-3 border-t border-border/30">
                <div className="flex items-center justify-between">
                  <div className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded font-medium border border-blue-100 truncate">
                    {plan.highlight}
                  </div>
                  {data.paymentPlan === plan.id ? (
                    <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 ml-2">
                      <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 md:w-7 md:h-7 rounded-full border border-border flex items-center justify-center flex-shrink-0 ml-2">
                      <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border border-border"></div>
                    </div>
                  )}
                </div>
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      {/* Key Benefits Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-muted/30 rounded-xl p-4 md:p-6 border"
      >
        <div className="text-center mb-4 md:mb-6">
          <h3 className="font-heading text-lg md:text-xl lg:text-2xl font-bold text-foreground mb-1 md:mb-2">
            Comprehensive Service Guarantees
          </h3>
          <p className="text-muted-foreground text-sm md:text-base">
            All payment plans include our standard service guarantees
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
          <div className="text-center p-3 md:p-4">
            <div className="w-9 h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-2 md:mb-3">
              <Shield className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
            </div>
            <h4 className="font-semibold text-foreground text-sm md:text-base mb-1 md:mb-2">Service Guarantees</h4>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Interview scheduling guarantee. Comprehensive visa support. Transparent refund policies.
            </p>
          </div>
          
          <div className="text-center p-3 md:p-4">
            <div className="w-9 h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2 md:mb-3">
              <Clock className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
            </div>
            <h4 className="font-semibold text-foreground text-sm md:text-base mb-1 md:mb-2">Processing Efficiency</h4>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              45-day average placement. Continuous support. Travel coordination included.
            </p>
          </div>
          
          <div className="text-center p-3 md:p-4">
            <div className="w-9 h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-2 md:mb-3">
              <Briefcase className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
            </div>
            <h4 className="font-semibold text-foreground text-sm md:text-base mb-1 md:mb-2">Employer Network</h4>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Extensive employer partnerships. Competitive salaries. Family employment assistance.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Performance Metrics */}
      <div className="text-center">
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 lg:gap-8 mb-3 md:mb-4">
          <div className="text-center px-3 py-2">
            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-primary">1,234+</div>
            <div className="text-xs md:text-sm text-muted-foreground">Successful Placements</div>
          </div>
          <div className="text-center px-3 py-2">
            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-green-600">98%</div>
            <div className="text-xs md:text-sm text-muted-foreground">Success Rate</div>
          </div>
          <div className="text-center px-3 py-2">
            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-600">4.9/5</div>
            <div className="text-xs md:text-sm text-muted-foreground">Client Satisfaction</div>
          </div>
        </div>
        
        {data.paymentPlan && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block p-2 md:p-3 lg:p-4 bg-primary/5 rounded-lg border border-primary/10"
          >
            <p className="font-semibold text-foreground text-sm md:text-base">
              Selected: <span className="text-primary">{paymentPlans.find(p => p.id === data.paymentPlan)?.name}</span>
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
