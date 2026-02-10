import { useState } from "react";
import { CreditCard, Banknote, Building, CheckCircle, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

interface PaymentFlowProps {
  applicationId: string;
  totalFee: number;
  paidAmount: number;
  paymentPlan: string;
  balanceDue: number;
  onPaymentSuccess?: () => void;
}

const paymentMethods = [
  { id: "credit_card", name: "Credit/Debit Card", icon: CreditCard, fee: 2.5 },
  { id: "bank_transfer", name: "Bank Transfer", icon: Banknote, fee: 0 },
  { id: "paypal", name: "PayPal", icon: Building, fee: 3.5 },
];

export const PaymentFlow = ({ 
  applicationId, 
  totalFee, 
  paidAmount, 
  paymentPlan, 
  balanceDue,
  onPaymentSuccess 
}: PaymentFlowProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState("credit_card");
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // Calculate payment amounts based on plan
  const getPaymentOptions = () => {
    if (paymentPlan === "deferred") {
      const firstInstallment = Math.ceil(totalFee * 0.5);
      const remainingBalance = balanceDue;
      
      if (paidAmount === 0) {
        // Haven't paid anything yet
        return [
          { label: "First Installment (50%)", amount: firstInstallment },
          { label: "Custom Amount", amount: 0 }
        ];
      } else if (paidAmount < totalFee * 0.5) {
        // Paid less than 50%
        return [
          { label: "Complete First Installment", amount: firstInstallment - paidAmount },
          { label: "Pay Remaining Balance", amount: remainingBalance },
          { label: "Custom Amount", amount: 0 }
        ];
      } else {
        // Paid at least 50%
        return [
          { label: "Pay Remaining Balance", amount: remainingBalance },
          { label: "Custom Amount", amount: 0 }
        ];
      }
    } else if (paymentPlan === "milestone") {
      const nextMilestone = Math.ceil(totalFee / 4);
      return [
        { label: "Next Milestone", amount: nextMilestone },
        { label: "Pay Minimum", amount: 100 },
        { label: "Full Balance", amount: balanceDue },
        { label: "Custom Amount", amount: 0 }
      ];
    } else {
      return [
        { label: "Full Payment", amount: balanceDue },
        { label: "Custom Amount", amount: 0 }
      ];
    }
  };

  const paymentOptions = getPaymentOptions();

  const calculateProcessingFee = () => {
    const method = paymentMethods.find(m => m.id === selectedMethod);
    if (!method || !amount) return 0;
    return (amount * method.fee) / 100;
  };

  const handlePayment = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to make a payment.",
      });
      return;
    }

    if (!amount || amount <= 0 || amount > balanceDue) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid payment amount.",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const processingFee = calculateProcessingFee();
      const totalAmount = amount + processingFee;
      
      // Determine installment number
      let installmentNumber = 1;
      if (paymentPlan === "deferred") {
        installmentNumber = paidAmount === 0 ? 1 : 2;
      } else if (paymentPlan === "milestone") {
        installmentNumber = Math.floor(paidAmount / (totalFee / 4)) + 1;
      }
      
      // Create payment record
      const { data: payment, error } = await supabase
        .from("payments")
        .insert({
          application_id: applicationId,
          user_id: user.id,
          amount: amount,
          processing_fee: processingFee,
          total_amount: totalAmount,
          payment_method: selectedMethod,
          installment_number: installmentNumber,
          status: "pending",
        })
        .select("id")
        .single();
      
      if (error) throw error;

      // Update application paid amount
      const newPaidAmount = paidAmount + amount;
      let newStatus = "payment_pending";
      if (newPaidAmount >= totalFee) {
        newStatus = "payment_complete";
      } else if (newPaidAmount > 0) {
        newStatus = "partially_paid";
      }
      
      const { error: updateError } = await supabase
        .from("applications")
        .update({ 
          paid_amount: newPaidAmount,
          status: newStatus
        })
        .eq("id", applicationId);
      
      if (updateError) throw updateError;

      // Create notification
      await supabase
        .from("notifications")
        .insert({
          user_id: user.id,
          type: "success",
          title: "Payment Initiated",
          message: `Payment of $${amount} has been successfully initiated.`,
          read: false,
          action_url: "/payments",
        });

      toast({
        title: "Payment Initiated",
        description: `Your payment of $${amount} has been successfully initiated.`,
      });

      // Close dialog and reset
      setIsOpen(false);
      setAmount(null);
      setCustomAmount("");
      
      // Call success callback
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }

    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: error.message || "Failed to process payment. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAmountSelect = (optionAmount: number) => {
    if (optionAmount === 0) {
      // Custom amount selected
      setAmount(null);
      setCustomAmount("");
    } else {
      setAmount(optionAmount);
      setCustomAmount(optionAmount.toString());
    }
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setAmount(numValue);
    } else {
      setAmount(null);
    }
  };

  const totalAmount = amount ? amount + calculateProcessingFee() : 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2">
          <CreditCard className="w-4 h-4" />
          Make Payment
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Make Payment
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">Payment Plan</span>
              <span className="font-medium capitalize">{paymentPlan.replace("_", " ")}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Fee</span>
              <span className="font-medium">${totalFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">Already Paid</span>
              <span className="text-green-600">${paidAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-sm font-semibold">Balance Due</span>
              <span className="font-bold text-lg text-amber-600">${balanceDue.toLocaleString()}</span>
            </div>
          </div>
          
          {/* Payment Amount */}
          <div className="space-y-3">
            <Label>Select Payment Amount</Label>
            <div className="grid grid-cols-2 gap-2">
              {paymentOptions.map((option, index) => (
                <Button
                  key={index}
                  type="button"
                  variant={amount === option.amount && option.amount !== 0 ? "default" : "outline"}
                  onClick={() => handleAmountSelect(option.amount)}
                  className="h-auto py-3"
                >
                  <div className="text-center">
                    <div className="font-medium text-sm">{option.label}</div>
                    {option.amount > 0 && (
                      <div className="font-bold text-lg">${option.amount.toLocaleString()}</div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
            
            {/* Custom Amount Input */}
            <div>
              <Label htmlFor="customAmount">Or Enter Custom Amount</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="customAmount"
                  type="number"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  className="pl-8"
                  placeholder="Enter custom amount"
                  min="1"
                  max={balanceDue}
                />
              </div>
            </div>
          </div>
          
          {/* Payment Method */}
          <div className="space-y-3">
            <Label>Payment Method</Label>
            <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value={method.id} id={method.id} />
                  <Label htmlFor={method.id} className="flex-1 cursor-pointer flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <method.icon className="w-5 h-5" />
                      <span>{method.name}</span>
                    </div>
                    {method.fee > 0 && (
                      <span className="text-sm text-muted-foreground">{method.fee}% fee</span>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          {/* Security Badge */}
          <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200">
            <Shield className="w-4 h-4" />
            <span className="text-sm">Secure payment • 256-bit SSL encryption</span>
          </div>
          
          {/* Payment Summary */}
          {amount && amount > 0 && (
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
              <div className="flex justify-between mb-2">
                <span className="text-sm">Payment Amount</span>
                <span className="font-medium">${amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Processing Fee</span>
                <span className="text-muted-foreground">
                  ${calculateProcessingFee().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-primary/20">
                <span className="font-semibold">Total to Pay</span>
                <span className="font-bold text-lg text-primary">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          )}
          
          {/* Pay Button */}
          <Button 
            onClick={handlePayment}
            disabled={!amount || amount <= 0 || amount > balanceDue || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay $${amount ? amount.toFixed(2) : "0.00"}`
            )}
          </Button>
          
          {/* Terms */}
          <p className="text-xs text-center text-muted-foreground">
            By proceeding, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
