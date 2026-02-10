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
import { 
  User, 
  FileText, 
  Settings, 
  Camera,
  Globe,
  Phone,
  MapPin,
  MessageSquare,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

export default function ProfileEdit() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
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
      fetchDocuments();
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

  const fetchDocuments = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('profile_id', user.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, GIF, or WebP image",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, avatar_url: previewUrl }));

      // Convert file to base64 for simple storage
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        // Store in profiles table
        const { error } = await supabase
          .from('profiles')
          .update({ avatar_url: base64String })
          .eq('id', user.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Profile picture updated",
        });
      };
      reader.readAsDataURL(file);
      
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      });
      // Revert to original avatar_url
      fetchProfile();
    } finally {
      setUploading(false);
    }
  };

  const removeProfilePicture = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (error) throw error;

      setFormData(prev => ({ ...prev, avatar_url: '' }));
      toast({
        title: "Removed",
        description: "Profile picture removed",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove profile picture",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const uploadNewDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload PDF, JPG, or PNG files only",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File must be less than 20MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Convert file to base64 for storage
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        // Create document record
        const { error } = await supabase
          .from('documents')
          .insert({
            profile_id: user.id,
            document_type: file.type.includes('pdf') ? 'PDF' : 'Image',
            file_name: file.name,
            file_url: base64String,
            file_size: file.size,
            status: 'pending',
            uploaded_at: new Date().toISOString(),
          });

        if (error) throw error;

        toast({
          title: "Document uploaded",
          description: "Your document has been uploaded for review",
        });

        // Refresh documents list
        fetchDocuments();
      };
      reader.readAsDataURL(file);
      
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
        <p className="text-gray-600 mt-2">
          Update your personal information and manage documents
        </p>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-1 md:grid-cols-4 gap-2">
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
            Documents ({documents.length})
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
                      Full Name *
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
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-40 h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                      {formData.avatar_url ? (
                        <img 
                          src={formData.avatar_url} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-20 h-20 text-gray-400" />
                      )}
                    </div>
                    {formData.avatar_url && (
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                        onClick={removeProfilePicture}
                        disabled={uploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <Label htmlFor="profile-picture" className="cursor-pointer">
                      <div className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                        <Upload className="w-5 h-5" />
                        {uploading ? 'Uploading...' : 'Upload New Picture'}
                      </div>
                      <input
                        id="profile-picture"
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </Label>
                    <p className="text-sm text-gray-500 text-center">
                      JPG, PNG, GIF, WebP up to 5MB
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">
                  Profile Picture Tips
                </h3>
                <ul className="space-y-1 text-sm text-blue-700">
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
                Documents ({documents.length})
              </CardTitle>
              <CardDescription>
                Manage your documents for job applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Upload Section */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <Label htmlFor="document-upload" className="cursor-pointer">
                    <div className="space-y-4">
                      <Upload className="w-12 h-12 mx-auto text-gray-400" />
                      <div>
                        <p className="font-medium">
                          {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          PDF, JPG, PNG up to 20MB
                        </p>
                      </div>
                    </div>
                    <input
                      id="document-upload"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={uploadNewDocument}
                      className="hidden"
                      disabled={uploading}
                    />
                  </Label>
                </div>

                {/* Documents List */}
                {documents.length === 0 ? (
                  <div className="text-center py-12 border rounded-lg">
                    <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No Documents Uploaded</h3>
                    <p className="text-gray-600 mb-4">
                      Upload documents to auto-fill your job applications
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {documents.map((doc) => (
                        <Card key={doc.id} className="p-4 hover:shadow-md transition-shadow">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(doc.status)}
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(doc.status)}`}>
                                  {doc.status}
                                </span>
                              </div>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  if (doc.file_url) {
                                    window.open(doc.file_url, '_blank');
                                  }
                                }}
                                title="View document"
                              >
                                View
                              </Button>
                            </div>
                            <div>
                              <p className="font-medium truncate" title={doc.file_name}>
                                {doc.file_name}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <span>{doc.document_type}</span>
                                <span>•</span>
                                <span>{(doc.file_size / 1024 / 1024).toFixed(2)} MB</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">
                              Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                            </p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">💡 Document Auto-fill</h3>
                <p className="text-sm text-green-700">
                  Documents uploaded here will be automatically available when filling out job applications.
                  Verified documents will be prioritized by employers.
                </p>
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
                  onClick={() => setActiveTab('preview')}
                >
                  Preview Profile →
                </Button>
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
              <div className="border rounded-lg p-8">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                      {formData.avatar_url ? (
                        <img 
                          src={formData.avatar_url} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-16 h-16 text-gray-400" />
                      )}
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl font-bold text-gray-900">
                      {formData.full_name || 'Your Name'}
                    </h2>
                    <p className="text-gray-600 mt-2">
                      {user?.email}
                    </p>
                    {(formData.country_of_origin || formData.desired_destination) && (
                      <div className="flex flex-wrap gap-3 mt-3">
                        {formData.country_of_origin && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            <Globe className="w-3 h-3" />
                            From: {formData.country_of_origin}
                          </span>
                        )}
                        {formData.desired_destination && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            <MapPin className="w-3 h-3" />
                            Destination: {formData.desired_destination}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-6">
                  {formData.bio && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3">About</h3>
                      <p className="text-gray-700 whitespace-pre-line">{formData.bio}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                        <div className="space-y-2">
                          {formData.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span>{formData.phone}</span>
                            </div>
                          )}
                          {user?.email && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">✉️</span>
                              <span>{user.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Documents</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Total Documents</span>
                          <span className="font-medium">{documents.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Verified</span>
                          <span className="font-medium text-green-600">
                            {documents.filter(d => d.status === 'verified').length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Pending Review</span>
                          <span className="font-medium text-yellow-600">
                            {documents.filter(d => d.status === 'pending').length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Ready to Save?</h3>
                    <p className="text-gray-600 mt-1">
                      Your profile is looking great! Save your changes to update your profile.
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => setActiveTab('personal')}
                      variant="outline"
                    >
                      Continue Editing
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      disabled={loading}
                      className="gap-2"
                    >
                      {loading ? (
                        <>
                          <span className="animate-spin">⟳</span>
                          Saving...
                        </>
                      ) : (
                        'Save All Changes'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{documents.length}</p>
              <p className="text-sm text-gray-600">Documents Uploaded</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {formData.avatar_url ? '✓' : '—'}
              </p>
              <p className="text-sm text-gray-600">Profile Picture</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {formData.bio ? '✓' : '—'}
              </p>
              <p className="text-sm text-gray-600">Bio Completed</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {(formData.full_name && formData.phone) ? '✓' : '—'}
              </p>
              <p className="text-sm text-gray-600">Contact Info</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
