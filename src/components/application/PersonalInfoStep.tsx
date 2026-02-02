import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Phone, Globe, MapPin } from "lucide-react";
import { ApplicationData } from "@/pages/Apply";

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
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
          Personal Information
        </h2>
        <p className="text-muted-foreground">
          Please verify and complete your personal details. This information will be used for your visa application.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name (as on passport)</Label>
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
          <Label htmlFor="phone">Phone Number</Label>
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
          <Label htmlFor="countryOfOrigin">Country of Origin</Label>
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
          <Label htmlFor="desiredDestination">Desired Destination</Label>
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

      {/* Info Box */}
      <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
        <p className="text-sm text-foreground">
          <strong>Important:</strong> Please ensure all information matches your passport exactly. 
          Any discrepancies may delay your application process.
        </p>
      </div>
    </div>
  );
};
