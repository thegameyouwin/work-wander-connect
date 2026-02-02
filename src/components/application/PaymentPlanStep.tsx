import { motion } from "framer-motion";
import { CheckCircle, DollarSign, Calendar, Briefcase, Shield, Clock } from "lucide-react";
import { ApplicationData } from "@/pages/Apply";

const paymentPlans = [
  {
    id: "milestone" as const,
    name: "Pay Per Milestone",
    price: "$5,000",
    description: "Pay as you progress through each stage",
    features: [
      "Split into 4 payments",
      "Pay only when milestones are completed",
      "Cancel anytime before next milestone",
      "Most popular choice",
    ],
    milestones: [
      { name: "Application Review", amount: "$500" },
      { name: "Document Processing", amount: "$1,000" },
      { name: "Job Matching", amount: "$1,500" },
      { name: "Visa & Travel", amount: "$2,000" },
    ],
    icon: Calendar,
    recommended: true,
  },
  {
    id: "full_upfront" as const,
    name: "Pay Full Upfront",
    price: "$4,500",
    description: "Save $500 by paying everything upfront",
    features: [
      "10% discount applied",
      "Priority processing",
      "Dedicated case manager",
      "Full refund if visa denied",
    ],
    icon: DollarSign,
    recommended: false,
  },
  {
    id: "deferred" as const,
    name: "Deferred Payment",
    price: "$5,500",
    description: "Pay after you secure your job",
    features: [
      "No upfront payment required",
      "Pay from your first paycheck",
      "6-month payment plan",
      "Perfect for those on a budget",
    ],
    icon: Briefcase,
    recommended: false,
  },
];

interface PaymentPlanStepProps {
  data: ApplicationData;
  onUpdate: (data: Partial<ApplicationData>) => void;
}

export const PaymentPlanStep = ({ data, onUpdate }: PaymentPlanStepProps) => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
          Choose Your Payment Plan
        </h2>
        <p className="text-muted-foreground">
          Select the payment option that works best for you. All plans include full support throughout your journey.
        </p>
      </div>

      <div className="grid gap-4">
        {paymentPlans.map((plan) => (
          <motion.div
            key={plan.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <button
              onClick={() => onUpdate({ paymentPlan: plan.id })}
              className={`w-full text-left p-6 rounded-xl border-2 transition-all ${
                data.paymentPlan === plan.id
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-border hover:border-primary/50 bg-card"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  data.paymentPlan === plan.id ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  <plan.icon className="w-6 h-6" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-heading text-lg font-semibold text-foreground">
                      {plan.name}
                    </h3>
                    {plan.recommended && (
                      <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {plan.features.map((feature) => (
                      <span
                        key={feature}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full"
                      >
                        <CheckCircle className="w-3 h-3 text-success" />
                        {feature}
                      </span>
                    ))}
                  </div>

                  {plan.milestones && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm font-medium text-foreground mb-2">Payment Schedule:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {plan.milestones.map((milestone, index) => (
                          <div key={milestone.name} className="flex items-center gap-2 text-sm">
                            <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </span>
                            <span className="text-muted-foreground">{milestone.name}</span>
                            <span className="font-medium text-foreground ml-auto">{milestone.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Price & Selection */}
                <div className="text-right">
                  <p className="font-heading text-2xl font-bold text-foreground">{plan.price}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                  {data.paymentPlan === plan.id && (
                    <div className="mt-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center ml-auto">
                      <CheckCircle className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      {/* Trust Indicators */}
      <div className="bg-muted/50 rounded-xl p-4 flex flex-wrap gap-6 justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="w-4 h-4 text-primary" />
          <span>Secure Payment</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle className="w-4 h-4 text-success" />
          <span>Money-back Guarantee</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4 text-primary" />
          <span>No Hidden Fees</span>
        </div>
      </div>
    </div>
  );
};
