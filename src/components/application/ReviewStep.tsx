import { CheckCircle, FileText, User, CreditCard, MapPin, Phone, Mail } from "lucide-react";
import { ApplicationData } from "@/pages/Apply";

const paymentPlanLabels: Record<string, string> = {
  milestone: "Pay Per Milestone ($5,000)",
  full_upfront: "Pay Full Upfront ($4,500)",
  deferred: "Deferred Payment ($5,500)",
};

interface ReviewStepProps {
  data: ApplicationData;
}

export const ReviewStep = ({ data }: ReviewStepProps) => {
  const requiredDocs = ["passport", "photo", "resume"];
  const uploadedRequired = data.documents.filter(d => requiredDocs.includes(d.type)).length;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
          Review Your Application
        </h2>
        <p className="text-muted-foreground">
          Please review all information before submitting. You can go back to make changes if needed.
        </p>
      </div>

      {/* Personal Information */}
      <div className="bg-muted/30 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-primary" />
          <h3 className="font-heading text-lg font-semibold text-foreground">Personal Information</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Full Name</p>
              <p className="font-medium text-foreground">{data.fullName || "Not provided"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium text-foreground">{data.email || "Not provided"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="font-medium text-foreground">{data.phone || "Not provided"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Origin → Destination</p>
              <p className="font-medium text-foreground">
                {data.countryOfOrigin || "Unknown"} → {data.desiredDestination}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-muted/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="font-heading text-lg font-semibold text-foreground">Documents</h3>
          </div>
          <span className={`text-sm ${uploadedRequired >= 3 ? "text-success" : "text-warning"}`}>
            {uploadedRequired}/3 required uploaded
          </span>
        </div>
        <div className="space-y-2">
          {data.documents.length > 0 ? (
            data.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-3 bg-background rounded-lg"
              >
                <CheckCircle className="w-5 h-5 text-success" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{doc.type}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">No documents uploaded yet</p>
          )}
        </div>
        {uploadedRequired < 3 && (
          <div className="mt-3 p-3 bg-warning/10 border border-warning/30 rounded-lg">
            <p className="text-sm text-warning">
              ⚠️ Please upload all required documents before submitting.
            </p>
          </div>
        )}
      </div>

      {/* Payment Plan */}
      <div className="bg-muted/30 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-primary" />
          <h3 className="font-heading text-lg font-semibold text-foreground">Payment Plan</h3>
        </div>
        <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div>
            <p className="font-medium text-foreground">
              {paymentPlanLabels[data.paymentPlan]}
            </p>
            <p className="text-sm text-muted-foreground">
              {data.paymentPlan === "milestone" && "You'll pay in 4 installments as you progress"}
              {data.paymentPlan === "full_upfront" && "One-time payment with 10% discount"}
              {data.paymentPlan === "deferred" && "Pay after you secure your job"}
            </p>
          </div>
          <CheckCircle className="w-6 h-6 text-primary" />
        </div>
      </div>

      {/* Agreement */}
      <div className="bg-success/5 border border-success/20 rounded-xl p-4">
        <p className="text-sm text-foreground">
          <strong>By submitting this application, you agree to:</strong>
        </p>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-success mt-0.5" />
            <span>Our Terms of Service and Privacy Policy</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-success mt-0.5" />
            <span>The accuracy of all provided information</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-success mt-0.5" />
            <span>The selected payment plan terms and conditions</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
