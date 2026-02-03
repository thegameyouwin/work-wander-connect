import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Loader2, 
  Save, 
  Plus, 
  Trash2, 
  CreditCard, 
  Mail, 
  Key, 
  AlertTriangle,
  Settings,
  Eye,
  EyeOff,
  Shield,
  Globe
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface AdminSetting {
  id: string;
  setting_key: string;
  setting_value: string | null;
  setting_type: string;
  description: string | null;
  is_secret: boolean;
  created_at: string;
  updated_at: string;
}

export const APIConfiguration = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AdminSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedSettings, setEditedSettings] = useState<Record<string, string>>({});
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({});
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newSetting, setNewSetting] = useState({
    setting_key: "",
    setting_value: "",
    setting_type: "text",
    description: "",
    is_secret: false,
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("admin_settings")
        .select("*")
        .order("setting_key");

      if (error) throw error;
      setSettings(data || []);
      
      const initial: Record<string, string> = {};
      data?.forEach((s) => {
        initial[s.setting_key] = s.setting_value || "";
      });
      setEditedSettings(initial);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading settings",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const setting of settings) {
        const newValue = editedSettings[setting.setting_key];
        if (newValue !== setting.setting_value) {
          const { error } = await supabase
            .from("admin_settings")
            .update({ setting_value: newValue })
            .eq("id", setting.id);
          if (error) throw error;
        }
      }
      toast({
        title: "Settings Saved",
        description: "All configuration changes have been saved successfully.",
      });
      fetchSettings();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving settings",
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSetting = async () => {
    if (!newSetting.setting_key) {
      toast({
        variant: "destructive",
        title: "Missing Key",
        description: "Please provide a setting key.",
      });
      return;
    }

    try {
      const { error } = await supabase.from("admin_settings").insert({
        setting_key: newSetting.setting_key.toLowerCase().replace(/\s+/g, "_"),
        setting_value: newSetting.setting_value,
        setting_type: newSetting.setting_type,
        description: newSetting.description,
        is_secret: newSetting.is_secret,
      });

      if (error) throw error;

      toast({
        title: "Setting Added",
        description: "New configuration setting has been added.",
      });
      setAddDialogOpen(false);
      setNewSetting({
        setting_key: "",
        setting_value: "",
        setting_type: "text",
        description: "",
        is_secret: false,
      });
      fetchSettings();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error adding setting",
        description: error.message,
      });
    }
  };

  const handleDeleteSetting = async (id: string) => {
    try {
      const { error } = await supabase.from("admin_settings").delete().eq("id", id);
      if (error) throw error;
      toast({
        title: "Setting Deleted",
        description: "Configuration setting has been removed.",
      });
      fetchSettings();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting setting",
        description: error.message,
      });
    }
  };

  const updateEditedSetting = (key: string, value: string) => {
    setEditedSettings((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSecretVisibility = (key: string) => {
    setVisibleSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Group settings by category
  const paymentSettings = settings.filter(
    (s) => s.setting_key.includes("stripe") || s.setting_key.includes("paypal") || s.setting_key.includes("payment")
  );
  const emailSettings = settings.filter(
    (s) => s.setting_key.includes("smtp") || s.setting_key.includes("email")
  );
  const otherSettings = settings.filter(
    (s) => !paymentSettings.includes(s) && !emailSettings.includes(s)
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "payment":
        return <CreditCard className="w-5 h-5" />;
      case "email":
        return <Mail className="w-5 h-5" />;
      default:
        return <Globe className="w-5 h-5" />;
    }
  };

  const renderSettingInput = (setting: AdminSetting) => {
    const value = editedSettings[setting.setting_key] ?? "";
    const isVisible = visibleSecrets[setting.setting_key];

    if (setting.setting_type === "boolean") {
      return (
        <Switch
          checked={value === "true"}
          onCheckedChange={(checked) => updateEditedSetting(setting.setting_key, String(checked))}
        />
      );
    }

    return (
      <div className="relative flex-1 max-w-md">
        <Input
          type={setting.is_secret && !isVisible ? "password" : "text"}
          value={value}
          onChange={(e) => updateEditedSetting(setting.setting_key, e.target.value)}
          placeholder={setting.is_secret ? "••••••••••••" : "Enter value..."}
          className="pr-10 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
        />
        {setting.is_secret && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            onClick={() => toggleSecretVisibility(setting.setting_key)}
          >
            {isVisible ? (
              <EyeOff className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Eye className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>
        )}
      </div>
    );
  };

  const SettingRow = ({ setting }: { setting: AdminSetting }) => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between py-4 px-4 rounded-lg hover:bg-muted/50 transition-colors group"
    >
      <div className="space-y-1 flex-1">
        <div className="flex items-center gap-2">
          <Label className="font-medium">
            {setting.setting_key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </Label>
          {setting.is_secret && (
            <Badge variant="outline" className="text-xs gap-1 font-normal">
              <Key className="w-3 h-3" />
              Secret
            </Badge>
          )}
        </div>
        {setting.description && (
          <p className="text-sm text-muted-foreground">{setting.description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {renderSettingInput(setting)}
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => handleDeleteSetting(setting.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );

  const SettingsSection = ({ 
    title, 
    description, 
    icon, 
    settings,
    iconBg,
    iconColor 
  }: { 
    title: string; 
    description: string; 
    icon: React.ReactNode;
    settings: AdminSetting[];
    iconBg: string;
    iconColor: string;
  }) => (
    <Card className="border-0 shadow-md">
      <CardHeader className="border-b bg-gradient-to-r from-muted/50 to-transparent">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${iconBg}`}>
            <span className={iconColor}>{icon}</span>
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        {settings.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground text-sm">No settings configured in this category.</p>
          </div>
        ) : (
          <div className="divide-y divide-muted">
            {settings.map((setting) => (
              <SettingRow key={setting.id} setting={setting} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">API Configuration</h2>
            <p className="text-muted-foreground text-sm">Manage payment gateways, email services, and other integrations</p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          {settings.length} {settings.length === 1 ? 'setting' : 'settings'}
        </Badge>
      </div>

      {/* Security Notice */}
      <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900/50">
        <Shield className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800 dark:text-amber-200">Security Best Practice</AlertTitle>
        <AlertDescription className="text-amber-700 dark:text-amber-300">
          For highly sensitive API keys (like Stripe Secret Key), consider using secure environment 
          secrets instead of database storage. Contact support for guidance on production secret management.
        </AlertDescription>
      </Alert>

      {/* Payment Configuration */}
      <SettingsSection
        title="Payment Configuration"
        description="Configure payment gateway credentials"
        icon={<CreditCard className="w-5 h-5" />}
        settings={paymentSettings}
        iconBg="bg-primary/10"
        iconColor="text-primary"
      />

      {/* Email Configuration */}
      <SettingsSection
        title="Email Configuration"
        description="Configure email service and notification settings"
        icon={<Mail className="w-5 h-5" />}
        settings={emailSettings}
        iconBg="bg-secondary/10"
        iconColor="text-secondary"
      />

      {/* Other Settings */}
      {otherSettings.length > 0 && (
        <SettingsSection
          title="Additional Configuration"
          description="Other integration settings and API keys"
          icon={<Globe className="w-5 h-5" />}
          settings={otherSettings}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
        />
      )}

      {/* Actions */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
        <Button 
          variant="outline" 
          onClick={() => setAddDialogOpen(true)} 
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Setting
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={saving} 
          className="gap-2 min-w-[160px] shadow-md"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save All Changes
            </>
          )}
        </Button>
      </div>

      {/* Add Setting Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Add New Setting
            </DialogTitle>
            <DialogDescription>
              Add a new configuration setting to the system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="key">Setting Key *</Label>
              <Input
                id="key"
                value={newSetting.setting_key}
                onChange={(e) => setNewSetting({ ...newSetting, setting_key: e.target.value })}
                placeholder="e.g., stripe_api_key"
                className="bg-muted/50 border-0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type={newSetting.is_secret ? "password" : "text"}
                value={newSetting.setting_value}
                onChange={(e) => setNewSetting({ ...newSetting, setting_value: e.target.value })}
                placeholder="Enter value..."
                className="bg-muted/50 border-0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={newSetting.setting_type}
                onValueChange={(value) => setNewSetting({ ...newSetting, setting_type: value })}
              >
                <SelectTrigger className="bg-muted/50 border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newSetting.description}
                onChange={(e) => setNewSetting({ ...newSetting, description: e.target.value })}
                placeholder="What is this setting for?"
                className="bg-muted/50 border-0"
              />
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Switch
                checked={newSetting.is_secret}
                onCheckedChange={(checked) => setNewSetting({ ...newSetting, is_secret: checked })}
              />
              <div>
                <Label className="cursor-pointer">This is a secret value</Label>
                <p className="text-xs text-muted-foreground">Secret values will be masked by default</p>
              </div>
            </div>
            <Separator />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSetting} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Setting
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
