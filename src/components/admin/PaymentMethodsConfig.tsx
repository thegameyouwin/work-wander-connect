import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Save,
  CreditCard,
  Wallet,
  Building2,
  Smartphone,
  Globe,
  DollarSign,
  CheckCircle2,
  Info,
  Send,
  Landmark,
  Banknote,
  ArrowLeftRight,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PaymentMethod {
  id: string;
  name: string;
  region: string;
  description: string;
  icon: React.ElementType;
  settingKey: string;
  fields: { key: string; label: string; placeholder: string; isSecret: boolean }[];
}

const PAYMENT_METHODS: PaymentMethod[] = [
  // ── Global / Card-based ──
  {
    id: "stripe",
    name: "Stripe",
    region: "Global",
    description: "Accept credit/debit cards, Apple Pay & Google Pay worldwide",
    icon: CreditCard,
    settingKey: "payment_stripe_enabled",
    fields: [
      { key: "stripe_publishable_key", label: "Publishable Key", placeholder: "pk_live_...", isSecret: false },
      { key: "stripe_secret_key", label: "Secret Key", placeholder: "sk_live_...", isSecret: true },
    ],
  },
  {
    id: "paypal",
    name: "PayPal",
    region: "Global",
    description: "PayPal payments, Venmo (US) and PayPal Credit",
    icon: Wallet,
    settingKey: "payment_paypal_enabled",
    fields: [
      { key: "paypal_client_id", label: "Client ID", placeholder: "AX...", isSecret: false },
      { key: "paypal_client_secret", label: "Client Secret", placeholder: "EL...", isSecret: true },
    ],
  },

  // ── USA-specific ──
  {
    id: "zelle",
    name: "Zelle",
    region: "USA",
    description: "Instant bank-to-bank transfers popular in the United States",
    icon: ArrowLeftRight,
    settingKey: "payment_zelle_enabled",
    fields: [
      { key: "zelle_email", label: "Registered Email", placeholder: "payments@company.com", isSecret: false },
      { key: "zelle_phone", label: "Registered Phone", placeholder: "+1 (555) 123-4567", isSecret: false },
      { key: "zelle_business_name", label: "Business Name", placeholder: "Carewell Supports LLC", isSecret: false },
    ],
  },
  {
    id: "cashapp",
    name: "Cash App",
    region: "USA / UK",
    description: "Cash App payments — popular in USA and UK markets",
    icon: DollarSign,
    settingKey: "payment_cashapp_enabled",
    fields: [
      { key: "cashapp_cashtag", label: "$Cashtag", placeholder: "$CarewellSupports", isSecret: false },
      { key: "cashapp_business_id", label: "Business ID", placeholder: "Business verification ID", isSecret: false },
    ],
  },

  // ── Canada-specific ──
  {
    id: "interac",
    name: "Interac e-Transfer",
    region: "Canada",
    description: "Canada's most popular digital payment method",
    icon: Send,
    settingKey: "payment_interac_enabled",
    fields: [
      { key: "interac_email", label: "Receiving Email", placeholder: "payments@company.com", isSecret: false },
      { key: "interac_autodeposit", label: "Auto-deposit Enabled", placeholder: "yes / no", isSecret: false },
      { key: "interac_security_question", label: "Security Question (if no auto-deposit)", placeholder: "Optional security question", isSecret: false },
    ],
  },

  // ── UK-specific ──
  {
    id: "bacs",
    name: "BACS / Faster Payments",
    region: "UK",
    description: "UK bank transfers via BACS or Faster Payments Service",
    icon: Landmark,
    settingKey: "payment_bacs_enabled",
    fields: [
      { key: "bacs_account_name", label: "Account Name", placeholder: "Carewell Supports Ltd", isSecret: false },
      { key: "bacs_sort_code", label: "Sort Code", placeholder: "12-34-56", isSecret: true },
      { key: "bacs_account_number", label: "Account Number", placeholder: "12345678", isSecret: true },
      { key: "bacs_reference", label: "Payment Reference", placeholder: "e.g. CWS-APP", isSecret: false },
    ],
  },
  {
    id: "gocardless",
    name: "GoCardless",
    region: "UK / Europe",
    description: "Direct debit payments — ideal for recurring milestone payments",
    icon: ShieldCheck,
    settingKey: "payment_gocardless_enabled",
    fields: [
      { key: "gocardless_access_token", label: "Access Token", placeholder: "live_...", isSecret: true },
      { key: "gocardless_webhook_secret", label: "Webhook Secret", placeholder: "Webhook signing secret", isSecret: true },
    ],
  },

  // ── Bank / Wire Transfer (international) ──
  {
    id: "bank_transfer",
    name: "International Wire Transfer",
    region: "Global",
    description: "Direct bank/wire transfer for international payments",
    icon: Building2,
    settingKey: "payment_bank_transfer_enabled",
    fields: [
      { key: "bank_name", label: "Bank Name", placeholder: "e.g. Chase Bank", isSecret: false },
      { key: "bank_account_number", label: "Account Number", placeholder: "Account number", isSecret: true },
      { key: "bank_routing_number", label: "Routing / Sort Code", placeholder: "Routing number", isSecret: true },
      { key: "bank_swift_code", label: "SWIFT/BIC Code", placeholder: "e.g. CHASUS33", isSecret: false },
      { key: "bank_iban", label: "IBAN (if applicable)", placeholder: "e.g. GB29 NWBK 6016 1331 9268 19", isSecret: true },
    ],
  },

  // ── Remittance / Immigrant-friendly ──
  {
    id: "wise",
    name: "Wise (TransferWise)",
    region: "Global",
    description: "Low-fee international transfers — popular with immigrants",
    icon: Globe,
    settingKey: "payment_wise_enabled",
    fields: [
      { key: "wise_api_key", label: "API Key", placeholder: "API key", isSecret: true },
      { key: "wise_profile_id", label: "Profile ID", placeholder: "Business profile ID", isSecret: false },
      { key: "wise_email", label: "Account Email", placeholder: "payments@company.com", isSecret: false },
    ],
  },
  {
    id: "remitly",
    name: "Remitly",
    region: "Global",
    description: "Trusted remittance service for sending money internationally",
    icon: Send,
    settingKey: "payment_remitly_enabled",
    fields: [
      { key: "remitly_partner_id", label: "Partner ID", placeholder: "Partner ID", isSecret: false },
      { key: "remitly_api_key", label: "API Key", placeholder: "API key", isSecret: true },
    ],
  },
  {
    id: "worldremit",
    name: "WorldRemit",
    region: "Global",
    description: "Send money from 50+ countries — popular in Africa & Asia",
    icon: Globe,
    settingKey: "payment_worldremit_enabled",
    fields: [
      { key: "worldremit_partner_id", label: "Partner ID", placeholder: "Partner ID", isSecret: false },
      { key: "worldremit_receiver_name", label: "Receiver Name", placeholder: "Full legal name", isSecret: false },
    ],
  },
  {
    id: "western_union",
    name: "Western Union",
    region: "Global",
    description: "Accept Western Union money transfers from 200+ countries",
    icon: Banknote,
    settingKey: "payment_western_union_enabled",
    fields: [
      { key: "western_union_agent_id", label: "Agent ID", placeholder: "Agent ID", isSecret: false },
      { key: "western_union_receiver_name", label: "Receiver Name", placeholder: "Full legal name", isSecret: false },
    ],
  },
  {
    id: "moneygram",
    name: "MoneyGram",
    region: "Global",
    description: "MoneyGram transfers — available in 200+ countries",
    icon: Banknote,
    settingKey: "payment_moneygram_enabled",
    fields: [
      { key: "moneygram_agent_id", label: "Agent ID", placeholder: "Agent ID", isSecret: false },
      { key: "moneygram_receiver_name", label: "Receiver Name", placeholder: "Full legal name", isSecret: false },
      { key: "moneygram_reference_number", label: "Reference Number", placeholder: "Reference", isSecret: false },
    ],
  },

  // ── Mobile Money (Africa/Asia) ──
  {
    id: "mobile_money",
    name: "Mobile Money",
    region: "Africa",
    description: "M-Pesa, MTN MoMo, Airtel Money and other mobile wallets",
    icon: Smartphone,
    settingKey: "payment_mobile_money_enabled",
    fields: [
      { key: "mobile_money_provider", label: "Provider", placeholder: "e.g. M-Pesa, MTN MoMo, Airtel", isSecret: false },
      { key: "mobile_money_number", label: "Business Number", placeholder: "e.g. 254...", isSecret: false },
      { key: "mobile_money_api_key", label: "API Key", placeholder: "API key", isSecret: true },
    ],
  },
  {
    id: "flutterwave",
    name: "Flutterwave",
    region: "Africa",
    description: "Accept payments from Africa — cards, mobile money, bank transfer",
    icon: QrCode,
    settingKey: "payment_flutterwave_enabled",
    fields: [
      { key: "flutterwave_public_key", label: "Public Key", placeholder: "FLWPUBK_...", isSecret: false },
      { key: "flutterwave_secret_key", label: "Secret Key", placeholder: "FLWSECK_...", isSecret: true },
      { key: "flutterwave_encryption_key", label: "Encryption Key", placeholder: "Encryption key", isSecret: true },
    ],
  },

  // ── In-person ──
  {
    id: "cash_payment",
    name: "Cash / In-Person Payment",
    region: "Local",
    description: "In-person cash or card payments at office locations",
    icon: DollarSign,
    settingKey: "payment_cash_enabled",
    fields: [
      { key: "cash_office_address", label: "Office Address", placeholder: "Payment office address", isSecret: false },
      { key: "cash_office_hours", label: "Office Hours", placeholder: "e.g. Mon-Fri 9am-5pm", isSecret: false },
      { key: "cash_office_phone", label: "Office Phone", placeholder: "+1 (555) 000-0000", isSecret: false },
    ],
  },
];

export const PaymentMethodsConfig = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabledMethods, setEnabledMethods] = useState<Record<string, boolean>>({});
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchPaymentSettings();
  }, []);

  const fetchPaymentSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("admin_settings")
        .select("*")
        .or(
          PAYMENT_METHODS.flatMap((m) => [
            `setting_key.eq.${m.settingKey}`,
            ...m.fields.map((f) => `setting_key.eq.${f.key}`),
          ]).join(",")
        );

      if (error) throw error;

      const enabled: Record<string, boolean> = {};
      const values: Record<string, string> = {};

      PAYMENT_METHODS.forEach((method) => {
        const enabledSetting = data?.find((s) => s.setting_key === method.settingKey);
        enabled[method.id] = enabledSetting?.setting_value === "true";

        method.fields.forEach((field) => {
          const fieldSetting = data?.find((s) => s.setting_key === field.key);
          values[field.key] = fieldSetting?.setting_value || "";
        });
      });

      setEnabledMethods(enabled);
      setFieldValues(values);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading payment settings",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const upsertSetting = async (key: string, value: string, isSecret: boolean, description?: string) => {
    const { data: existing } = await supabase
      .from("admin_settings")
      .select("id")
      .eq("setting_key", key)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("admin_settings")
        .update({ setting_value: value })
        .eq("id", existing.id);
    } else {
      await supabase.from("admin_settings").insert({
        setting_key: key,
        setting_value: value,
        setting_type: "text",
        is_secret: isSecret,
        description: description || key.replace(/_/g, " "),
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const method of PAYMENT_METHODS) {
        await upsertSetting(
          method.settingKey,
          String(enabledMethods[method.id] || false),
          false,
          `Enable/disable ${method.name} payment method`
        );

        if (enabledMethods[method.id]) {
          for (const field of method.fields) {
            await upsertSetting(
              field.key,
              fieldValues[field.key] || "",
              field.isSecret,
              field.label
            );
          }
        }
      }

      toast({
        title: "Payment Methods Saved",
        description: "Payment method configuration has been updated successfully.",
      });
      fetchPaymentSettings();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving payment settings",
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleMethod = (methodId: string) => {
    setEnabledMethods((prev) => ({ ...prev, [methodId]: !prev[methodId] }));
  };

  const updateField = (key: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSecretVisibility = (key: string) => {
    setVisibleSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const enabledCount = Object.values(enabledMethods).filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading payment methods...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <CreditCard className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Payment Methods</h2>
            <p className="text-muted-foreground text-sm">
              Configure which payment options are available to applicants
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          {enabledCount} active
        </Badge>
      </div>

      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          Enable the payment methods you want applicants to use. Each method requires its own credentials.
          Applicants will see only enabled methods during checkout.
        </AlertDescription>
      </Alert>

      {/* Payment Method Cards */}
      <div className="grid gap-4">
        {PAYMENT_METHODS.map((method, index) => {
          const isEnabled = enabledMethods[method.id] || false;
          const Icon = method.icon;

          return (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`transition-all duration-200 ${isEnabled ? "border-primary/40 shadow-md" : "border-border"}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${isEnabled ? "bg-primary/10" : "bg-muted"}`}>
                        <Icon className={`w-5 h-5 ${isEnabled ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {method.name}
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                            {method.region}
                          </Badge>
                          {isEnabled && (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          )}
                        </CardTitle>
                        <CardDescription className="text-sm">{method.description}</CardDescription>
                      </div>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => toggleMethod(method.id)}
                    />
                  </div>
                </CardHeader>

                {isEnabled && (
                  <CardContent className="pt-0 border-t border-border mt-2">
                    <div className="grid gap-4 pt-4 sm:grid-cols-2">
                      {method.fields.map((field) => (
                        <div key={field.key} className="space-y-1.5">
                          <Label className="text-sm font-medium">{field.label}</Label>
                          <div className="relative">
                            <Input
                              type={field.isSecret && !visibleSecrets[field.key] ? "password" : "text"}
                              value={fieldValues[field.key] || ""}
                              onChange={(e) => updateField(field.key, e.target.value)}
                              placeholder={field.placeholder}
                              className="bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
                            />
                            {field.isSecret && (
                              <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                                onClick={() => toggleSecretVisibility(field.key)}
                              >
                                {visibleSecrets[field.key] ? "Hide" : "Show"}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="flex justify-end p-4 bg-muted/30 rounded-xl">
        <Button onClick={handleSave} disabled={saving} className="gap-2 min-w-[160px] shadow-md">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Payment Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
