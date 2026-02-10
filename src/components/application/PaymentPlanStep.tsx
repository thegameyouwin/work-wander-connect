import { motion } from "framer-motion";
import { CheckCircle, DollarSign, Calendar, Briefcase, Shield, Clock, Sparkles, Target, Zap, TrendingUp, Award } from "lucide-react";
import { ApplicationData } from "@/pages/Apply";

const paymentPlans = [
  {
    id: "milestone" as const,
    name: "Smart Milestone Plan",
    price: "$4,999",
    originalPrice: "$5,500",
    description: "The most popular choice for smart applicants who want control and flexibility",
    features: [
      "✅ Pay only when milestones are successfully completed",
      "🚀 Front-loaded success: Start with just $499",
      "🎯 Risk-free: Cancel anytime before next milestone",
      "👑 Priority support throughout your journey",
      "📈 Value grows as you progress",
      "🛡️ 100% money-back guarantee on incomplete milestones",
    ],
    milestones: [
      { name: "Success Foundation", amount: "$499", description: "Initial consultation & strategy session" },
      { name: "Document Excellence", amount: "$1,200", description: "CV optimization & portfolio building" },
      { name: "Premium Job Matching", amount: "$1,800", description: "Direct employer introductions & interviews" },
      { name: "Visa Victory & Relocation", amount: "$1,500", description: "Full visa processing & travel arrangement" },
    ],
    icon: Target,
    recommended: true,
    tagline: "For the strategic applicant",
    savings: "Save $500+ compared to competitors",
    highlight: "Most flexible & risk-averse option"
  },
  {
    id: "full_upfront" as const,
    name: "Elite Accelerator Plan",
    price: "$4,299",
    originalPrice: "$5,000",
    description: "Maximum savings + VIP treatment for serious applicants ready to commit",
    features: [
      "🔥 15% instant savings - Pay just $4,299 instead of $5,000",
      "⚡ Fast-track processing: Jump to front of the queue",
      "👨‍💼 Dedicated success manager with 24/7 WhatsApp access",
      "🎯 Guaranteed job interview within 30 days or money back",
      "✈️ Free flight ticket & accommodation assistance",
      "📋 Free spouse & dependents application included",
      "🏆 Exclusive access to premium employer network",
    ],
    icon: Zap,
    recommended: false,
    tagline: "Maximum value, minimum stress",
    savings: "Save $701 instantly",
    highlight: "VIP treatment & fastest processing"
  },
  {
    id: "deferred" as const,
    name: "Success-First Partnership",
    price: "$2,750 × 2 payments",
    originalPrice: "$6,500",
    description: "We invest in your success - Pay only when you succeed",
    features: [
      "💎 First payment: $2,750 after approval (start immediately)",
      "🎯 Second payment: $2,750 ONLY after you secure job offer",
      "⏱️ 6-month job guarantee period",
      "🤝 We only win when you win - aligned incentives",
      "💼 If no job in 6 months, pay NOTHING more",
      "📊 Full financial risk protection",
      "👔 Free LinkedIn optimization & professional branding",
      "🎤 Unlimited interview coaching & negotiation training",
    ],
    icon: TrendingUp,
    recommended: false,
    tagline: "No job, no full payment - Guaranteed",
    savings: "Pay as you earn - Zero financial risk",
    highlight: "Perfect for limited upfront budget",
    note: "Total $5,500 (50% after approval + 50% after job secured)"
  },
];

interface PaymentPlanStepProps {
  data: ApplicationData;
  onUpdate: (data: Partial<ApplicationData>) => void;
}

export const PaymentPlanStep = ({ data, onUpdate }: PaymentPlanStepProps) => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 mb-4">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Smart Investment, Brighter Future</span>
        </div>
        <h2 className="font-heading text-3xl font-bold text-foreground mb-3">
          Choose Your Success Path
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Your investment today opens doors to life-changing opportunities. 
          Every plan comes with our <span className="font-semibold text-primary">98% success guarantee</span>.
        </p>
      </div>

      {/* Payment Plans */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paymentPlans.map((plan) => (
          <motion.div
            key={plan.id}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="relative h-full"
          >
            {/* Recommended Badge */}
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-primary to-primary/80 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  MOST POPULAR CHOICE
                </div>
              </div>
            )}

            <button
              onClick={() => onUpdate({ paymentPlan: plan.id })}
              className={`w-full h-full text-left p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col ${
                data.paymentPlan === plan.id
                  ? "border-primary bg-gradient-to-b from-primary/5 to-transparent shadow-xl scale-[1.02]"
                  : "border-border hover:border-primary/30 bg-card hover:shadow-lg"
              } ${plan.recommended ? "pt-10" : ""}`}
            >
              {/* Plan Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    data.paymentPlan === plan.id ? "bg-primary text-white" : "bg-gradient-to-br from-primary/10 to-primary/5"
                  }`}>
                    <plan.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-foreground">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground">{plan.tagline}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
              </div>

              {/* Price Section */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="font-heading text-3xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  {plan.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      {plan.originalPrice}
                    </span>
                  )}
                </div>
                {plan.savings && (
                  <div className="mt-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full inline-flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {plan.savings}
                  </div>
                )}
                {plan.note && (
                  <p className="text-xs text-muted-foreground mt-2">{plan.note}</p>
                )}
              </div>

              {/* Features List */}
              <div className="flex-1 mb-6">
                <ul className="space-y-2">
                  {plan.features.slice(0, 6).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="flex-shrink-0 w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center mt-0.5">
                        <CheckCircle className="w-3 h-3" />
                      </div>
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Milestones for Smart Plan */}
              {plan.milestones && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Strategic Payment Schedule
                  </p>
                  <div className="space-y-2">
                    {plan.milestones.map((milestone, index) => (
                      <div key={milestone.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{milestone.name}</div>
                            <div className="text-xs text-muted-foreground">{milestone.description}</div>
                          </div>
                        </div>
                        <span className="font-bold text-primary">{milestone.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selection Indicator */}
              <div className="mt-6 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <div className="text-xs px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                    {plan.highlight}
                  </div>
                  {data.paymentPlan === plan.id ? (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center animate-pulse">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full border-2 border-border"></div>
                    </div>
                  )}
                </div>
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      {/* Key Benefits & Guarantees */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary/5 via-background to-primary/5 rounded-2xl p-8 border border-primary/20"
      >
        <div className="text-center mb-6">
          <h3 className="font-heading text-2xl font-bold text-foreground mb-2">
            Why Choose CareWell Immigration?
          </h3>
          <p className="text-muted-foreground">
            Every plan includes these unbeatable benefits
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">Triple Guarantee</h4>
            <p className="text-sm text-muted-foreground">
              1. Job interview guarantee<br />
              2. Visa approval guarantee<br />
              3. Money-back guarantee
            </p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">Lightning Fast</h4>
            <p className="text-sm text-muted-foreground">
              Average placement: 45 days<br />
              24/7 support available<br />
              Emergency travel assistance
            </p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-3">
              <Briefcase className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">Premium Network</h4>
            <p className="text-sm text-muted-foreground">
              Access to 500+ employers<br />
              Average salary: $85,000+<br />
              Spouse employment assistance
            </p>
          </div>
        </div>
      </motion.div>

      {/* Final CTA */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          <span className="font-bold text-primary">1,234+</span> successful placements this year • 
          <span className="font-bold text-green-600 ml-2">4.9/5</span> client satisfaction
        </p>
        {data.paymentPlan && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block p-4 bg-gradient-to-r from-primary/10 to-green-100 rounded-xl"
          >
            <p className="font-semibold text-foreground">
              Smart choice! You selected: <span className="text-primary">{paymentPlans.find(p => p.id === data.paymentPlan)?.name}</span>
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
