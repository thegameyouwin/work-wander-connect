import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Globe, MapPin, Copy, AlertCircle } from "lucide-react";
import { ApplicationData } from "@/pages/Apply";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const countries = [
  "India", "Philippines", "Brazil", "Mexico", "Nigeria", "Pakistan", 
  "Bangladesh", "Vietnam", "Poland", "Ukraine", "China", "Indonesia",
  "Colombia", "Peru", "Argentina", "South Africa", "Kenya", "Ghana",
  "Egypt", "Morocco", "Thailand", "Malaysia", "Sri Lanka", "Nepal",
  "Australia", "United Kingdom", "Canada", "Germany", "France", "Other"
];

interface PersonalInfoStepProps {
  data: ApplicationData;
  onUpdate: (data: Partial<ApplicationData>) => void;
}

export const PersonalInfoStep = ({ data, onUpdate }: PersonalInfoStepProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [hasProfileData, setHasProfileData] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  // Fetch user's profile data on component mount
  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (profile) {
        setProfileData(profile);
        
        // Check if profile has data that can be auto-filled
        const hasData = profile.full_name || profile.phone || profile.country_of_origin;
        setHasProfileData(hasData);
        
        // Auto-fill if user hasn't entered anything yet
        if (hasData && !data.fullName && !data.phone && !data.countryOfOrigin) {
          autoFillFromProfile(profile);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const autoFillFromProfile = (profile: any) => {
    const updates: Partial<ApplicationData> = {};
    
    if (profile.full_name && !data.fullName) {
      updates.fullName = profile.full_name;
    }
    
    if (profile.phone && !data.phone) {
      updates.phone = profile.phone;
    }
    
    if (profile.country_of_origin && !data.countryOfOrigin) {
      updates.countryOfOrigin = profile.country_of_origin;
    }
    
    if (profile.desired_destination && !data.desiredDestination) {
      updates.desiredDestination = profile.desired_destination;
    }
    
    if (Object.keys(updates).length > 0) {
      onUpdate(updates);
      toast({
        title: "Auto-filled from profile",
        description: "Your profile information has been loaded",
      });
    }
  };

  const handleAutoFill = () => {
    if (profileData) {
      autoFillFromProfile(profileData);
    }
  };

  const handleClearAll = () => {
    onUpdate({
      fullName: '',
      phone: '',
      countryOfOrigin: '',
      desiredDestination: 'USA', // Keep USA as default
    });
    toast({
      title: "Cleared",
      description: "All fields have been cleared",
    });
  };

  const getFillPercentage = () => {
    let filled = 0;
    if (data.fullName) filled++;
    if (data.phone) filled++;
    if (data.countryOfOrigin) filled++;
    return Math.round((filled / 3) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header with Auto-fill button */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
              Personal Information
            </h2>
            <p className="text-muted-foreground">
              Please verify and complete your personal details. This information will be used for your visa application.
            </p>
          </div>
          
          {hasProfileData && (
            <Button
              type="button"
              variant="outline"
              onClick={handleAutoFill}
              disabled={loading}
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              {loading ? 'Loading...' : 'Auto-fill from Profile'}
            </Button>
          )}
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Form completion</span>
            <span className="font-medium">{getFillPercentage()}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${getFillPercentage()}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="fullName">Full Name (as on passport)</Label>
            {profileData?.full_name && data.fullName !== profileData.full_name && (
              <button
                type="button"
                onClick={() => onUpdate({ fullName: profileData.full_name })}
                className="text-xs text-primary hover:underline"
                title="Use profile name"
              >
                Use profile name: {profileData.full_name}
              </button>
            )}
          </div>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="fullName"
              value={data.fullName}
              onChange={(e) => onUpdate({ fullName: e.target.value })}
              placeholder="John Doe"
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => onUpdate({ email: e.target.value })}
              placeholder="you@example.com"
              className="pl-10 h-12"
              disabled
            />
          </div>
          <p className="text-xs text-muted-foreground">Email cannot be changed</p>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="phone">Phone Number</Label>
            {profileData?.phone && data.phone !== profileData.phone && (
              <button
                type="button"
                onClick={() => onUpdate({ phone: profileData.phone })}
                className="text-xs text-primary hover:underline"
                title="Use profile phone"
              >
                Use profile phone
              </button>
            )}
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              value={data.phone}
              onChange={(e) => onUpdate({ phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Country of Origin */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="countryOfOrigin">Country of Origin</Label>
            {profileData?.country_of_origin && data.countryOfOrigin !== profileData.country_of_origin && (
              <button
                type="button"
                onClick={() => onUpdate({ countryOfOrigin: profileData.country_of_origin })}
                className="text-xs text-primary hover:underline"
                title="Use profile country"
              >
                Use profile country
              </button>
            )}
          </div>
          <Select
            value={data.countryOfOrigin}
            onValueChange={(value) => onUpdate({ countryOfOrigin: value })}
          >
            <SelectTrigger className="h-12">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <SelectValue placeholder="Select your country" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Desired Destination */}
        <div className="md:col-span-2 space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="desiredDestination">Desired Destination</Label>
            {profileData?.desired_destination && data.desiredDestination !== profileData.desired_destination && (
              <button
                type="button"
                onClick={() => onUpdate({ desiredDestination: profileData.desired_destination })}
                className="text-xs text-primary hover:underline"
                title="Use profile destination"
              >
                Use profile destination
              </button>
            )}
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="desiredDestination"
              value={data.desiredDestination}
              onChange={(e) => onUpdate({ desiredDestination: e.target.value })}
              placeholder="USA"
              className="pl-10 h-12"
              disabled
            />
          </div>
          <p className="text-xs text-muted-foreground">Currently we only support USA placements</p>
        </div>
      </div>

      {/* Auto-fill Notification */}
      {hasProfileData && !data.fullName && !data.phone && !data.countryOfOrigin && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Copy className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Profile Auto-fill Available</h4>
              <p className="text-sm text-blue-800">
                You have saved information in your profile. Click "Auto-fill from Profile" 
                to automatically populate this form with your saved details.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Data Summary */}
      {profileData && (data.fullName || data.phone || data.countryOfOrigin) && (
        <div className="bg-muted/30 rounded-xl p-4 border">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-primary" />
            <h4 className="font-medium">Profile Data Used</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {data.fullName && (
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium">{data.fullName}</p>
              </div>
            )}
            {data.phone && (
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">{data.phone}</p>
              </div>
            )}
            {data.countryOfOrigin && (
              <div>
                <p className="text-muted-foreground">Country</p>
                <p className="font-medium">{data.countryOfOrigin}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={handleClearAll}
          className="gap-2"
        >
          Clear All
        </Button>
        
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-green-600">{getFillPercentage()}% complete</span> • 
          All fields are required for submission
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Important Information</p>
            <p className="text-sm text-foreground">
              Please ensure all information matches your passport exactly. 
              Any discrepancies may delay your application process. Profile data 
              will help you quickly fill forms, but always verify accuracy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
