// src/pages/profile/ProfileEdit.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProfilePictureUpload } from '@/components/profile/ProfilePictureUpload';
import { DocumentManager } from '@/components/profile/DocumentManager';
import { 
  User, 
  FileText, 
  Settings, 
  Camera,
  Globe,
  Phone,
  MapPin,
  MessageSquare
} from 'lucide-react';

export default function ProfileEdit() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    country_of_origin: '',
    desired_destination: '',
    bio: '',
    avatar_url: '',
  });
  const [documents, setDocuments] = useState<any[]>([]);

  // Fetch existing profile data
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          country_of_origin: data.country_of_origin || '',
          desired_destination: data.desired_destination || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      navigate('/profile');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleAvatarUploadComplete = (url: string) => {
    setFormData(prev => ({
      ...prev,
      avatar_url: url,
    }));
  };

  const handleDocumentsUpdate = (docs: any[]) => {
    setDocuments(docs);
    toast({
      title: "Documents Updated",
      description: `${docs.length} document(s) available for applications`,
    });
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Update your personal information, upload documents, and manage your profile
        </p>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-2">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Personal Info
          </TabsTrigger>
          <TabsTrigger value="photo" className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Profile Photo
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your basic profile details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Full Name
                    </Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="country_of_origin" className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Country of Origin
                    </Label>
                    <Input
                      id="country_of_origin"
                      value={formData.country_of_origin}
                      onChange={handleChange}
                      placeholder="Enter your country of origin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desired_destination" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Desired Destination
                    </Label>
                    <Input
                      id="desired_destination"
                      value={formData.desired_destination}
                      onChange={handleChange}
                      placeholder="Enter your desired destination"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself, your experience, skills, and what you're looking for..."
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This information helps employers understand your background and qualifications.
                  </p>
                </div>
                
                <div className="flex gap-4 pt-4 border-t">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/profile')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setActiveTab('photo')}
                  >
                    Next: Profile Photo →
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Photo Tab */}
        <TabsContent value="photo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Profile Picture
              </CardTitle>
              <CardDescription>
                Upload a professional photo that represents you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfilePictureUpload
                onUploadComplete={handleAvatarUploadComplete}
                currentAvatarUrl={formData.avatar_url}
              />
              
              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                  Profile Picture Tips
                </h3>
                <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-400">
                  <li>• Use a clear, high-quality photo of yourself</li>
                  <li>• Face the camera directly with good lighting</li>
                  <li>• Professional or business casual attire recommended</li>
                  <li>• Plain background works best</li>
                  <li>• Smile to appear approachable</li>
                </ul>
              </div>
              
              <div className="flex gap-4 pt-6 border-t mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setActiveTab('personal')}
                >
                  ← Back
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setActiveTab('documents')}
                >
                  Next: Documents →
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documents & Files
              </CardTitle>
              <CardDescription>
                Upload important documents that will auto-fill in your applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentManager
                onDocumentsUpdate={handleDocumentsUpdate}
                allowedTypes={[
                  'application/pdf',
                  'image/jpeg',
                  'image/jpg', 
                  'image/png',
                  'application/msword',
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                ]}
                maxSizeMB={20}
              />
              
              <div className="mt-8 space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                    💡 How Document Auto-fill Works
                  </h3>
                  <ul className="space-y-1 text-sm text-green-700 dark:text-green-400">
                    <li>• Upload your resume, certificates, and other documents here</li>
                    <li>• When applying for jobs, these documents will be automatically attached</li>
                    <li>• Verified documents speed up your application process</li>
                    <li>• You can select which documents to include with each application</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">
                    📋 Recommended Documents
                  </h3>
                  <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-400">
                    <li>• Resume/CV (PDF or Word)</li>
                    <li>• Cover Letter Template</li>
                    <li>• Professional Certificates</li>
                    <li>• Educational Degrees</li>
                    <li>• ID/Passport (for verification)</li>
                    <li>• Work Samples/Portfolio</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex gap-4 pt-6 border-t mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setActiveTab('photo')}
                >
                  ← Back
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setActiveTab('preferences')}
                >
                  Next: Preferences →
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Preferences & Settings
              </CardTitle>
              <CardDescription>
                Configure your application preferences and notification settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Application Preferences</h3>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <p className="font-medium mb-2">Auto-attach documents to new applications</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        When enabled, your uploaded documents will be automatically attached to job applications
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <p className="font-medium mb-2">Default job alert preferences</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive notifications for jobs matching your profile
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setActiveTab('documents')}
                  >
                    ← Back
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setActiveTab('preview')}
                  >
                    Preview Profile →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Preview</CardTitle>
              <CardDescription>
                See how your profile looks to others
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                    {formData.avatar_url ? (
                      <img 
                        src={formData.avatar_url} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{formData.full_name || 'Your Name'}</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {formData.country_of_origin || 'Country'} → {formData.desired_destination || 'Destination'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {formData.bio && (
                    <div>
                      <h3 className="font-semibold mb-2">About</h3>
                      <p className="text-gray-700 dark:text-gray-300">{formData.bio}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.phone && (
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{formData.phone}</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm text-gray-500">Documents Available</p>
                      <p className="font-medium">{documents.length} uploaded documents</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold mb-2">Ready to Save?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Your profile is looking great! Save your changes to update your profile.
                </p>
                
                <div className="flex gap-4">
                  <Button 
                    onClick={() => setActiveTab('personal')}
                    variant="outline"
                  >
                    Continue Editing
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save All Changes'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{documents.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Documents Uploaded</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {formData.avatar_url ? '✓' : '—'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Profile Picture</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {formData.bio ? '✓' : '—'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Bio Completed</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {(formData.full_name && formData.phone) ? '✓' : '—'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Contact Info</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
