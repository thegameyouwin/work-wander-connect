import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Plus, Trash2, CreditCard, Mail, Key, AlertTriangle } from "lucide-react";
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
      
      // Initialize edited settings
      const initial: Record<string, string> = {};
      data?.forEach((s) => {
        initial[s.setting_key] = s.setting_value || "";
      });
      setEditedSettings(initial);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
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
        description: "All settings have been updated successfully.",
      });
      fetchSettings();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
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
        title: "Error",
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
        title: "Error",
        description: error.message,
      });
    }
  };

  const updateEditedSetting = (key: string, value: string) => {
    setEditedSettings((prev) => ({ ...prev, [key]: value }));
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

  const renderSettingInput = (setting: AdminSetting) => {
    const value = editedSettings[setting.setting_key] ?? "";

    if (setting.setting_type === "boolean") {
      return (
        <Switch
          checked={value === "true"}
          onCheckedChange={(checked) => updateEditedSetting(setting.setting_key, String(checked))}
        />
      );
    }

    return (
      <Input
        type={setting.is_secret ? "password" : "text"}
        value={value}
        onChange={(e) => updateEditedSetting(setting.setting_key, e.target.value)}
        placeholder={setting.is_secret ? "••••••••" : "Enter value..."}
        className="max-w-md"
      />
    );
  };

  const SettingRow = ({ setting }: { setting: AdminSetting }) => (
    <div className="flex items-center justify-between py-4 border-b last:border-0">
      <div className="space-y-1">
        <Label className="font-medium">
          {setting.setting_key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          {setting.is_secret && (
            <Key className="w-3 h-3 inline ml-2 text-muted-foreground" />
          )}
        </Label>
        {setting.description && (
          <p className="text-sm text-muted-foreground">{setting.description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {renderSettingInput(setting)}
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive/90"
          onClick={() => handleDeleteSetting(setting.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Notice */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Security Notice</AlertTitle>
        <AlertDescription>
          For sensitive API keys (Stripe Secret Key, etc.), we recommend using secure environment 
          secrets instead of storing them here. Contact support for guidance on secure secret management.
        </AlertDescription>
      </Alert>

      {/* Payment Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <CardTitle>Payment Configuration</CardTitle>
          </div>
          <CardDescription>
            Configure payment gateway settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paymentSettings.length === 0 ? (
            <p className="text-muted-foreground text-sm">No payment settings configured.</p>
          ) : (
            paymentSettings.map((setting) => (
              <SettingRow key={setting.id} setting={setting} />
            ))
          )}
        </CardContent>
      </Card>

      {/* Email Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            <CardTitle>Email Configuration</CardTitle>
          </div>
          <CardDescription>
            Configure email notification settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emailSettings.length === 0 ? (
            <p className="text-muted-foreground text-sm">No email settings configured.</p>
          ) : (
            emailSettings.map((setting) => (
              <SettingRow key={setting.id} setting={setting} />
            ))
          )}
        </CardContent>
      </Card>

      {/* Other Settings */}
      {otherSettings.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              <CardTitle>Other Configuration</CardTitle>
            </div>
            <CardDescription>
              Additional configuration settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {otherSettings.map((setting) => (
              <SettingRow key={setting.id} setting={setting} />
            ))}
        </CardContent>
      </Card>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setAddDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Setting
        </Button>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save All Changes
        </Button>
      </div>

      {/* Add Setting Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Setting</DialogTitle>
            <DialogDescription>
              Add a new configuration setting
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="key">Setting Key</Label>
              <Input
                id="key"
                value={newSetting.setting_key}
                onChange={(e) => setNewSetting({ ...newSetting, setting_key: e.target.value })}
                placeholder="e.g., api_key_name"
              />
            </div>
            <div>
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type={newSetting.is_secret ? "password" : "text"}
                value={newSetting.setting_value}
                onChange={(e) => setNewSetting({ ...newSetting, setting_value: e.target.value })}
                placeholder="Enter value..."
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={newSetting.setting_type}
                onValueChange={(value) => setNewSetting({ ...newSetting, setting_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newSetting.description}
                onChange={(e) => setNewSetting({ ...newSetting, description: e.target.value })}
                placeholder="What is this setting for?"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={newSetting.is_secret}
                onCheckedChange={(checked) => setNewSetting({ ...newSetting, is_secret: checked })}
              />
              <Label>This is a secret value</Label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSetting}>Add Setting</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
