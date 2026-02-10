// src/pages/profile/profile.tsx
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  country_of_origin: string | null;
  desired_destination: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

export default function ProfilePage() {
  const { profileId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [profileId, user]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const targetProfileId = profileId || user?.id;
      
      if (!targetProfileId) {
        navigate('/auth');
        return;
      }

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetProfileId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', targetProfileId)
        .single();

      setUserRole(roleData);

      // Check if current user is viewing their own profile
      setIsOwner(user?.id === targetProfileId);

    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 max-w-6xl">
        <Skeleton className="h-64 w-full mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile not found</h1>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  const roleDisplay = userRole?.role ? 
    userRole.role.charAt(0).toUpperCase() + userRole.role.slice(1) : 
    'User';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-6xl">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className={`h-40 ${userRole?.role === 'admin' ? 'bg-gradient-to-r from-purple-600 to-indigo-700' : 'bg-gradient-to-r from-blue-600 to-cyan-600'}`}></div>
          
          <div className="relative px-6 pb-6 -mt-16">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                  <AvatarImage 
                    src={profile.avatar_url || ''} 
                    alt={profile.full_name}
                  />
                  <AvatarFallback>
                    {profile.full_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {isOwner && (
                  <Link
                    to="/profile/edit"
                    className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition"
                    title="Edit profile"
                  >
                    ✏️
                  </Link>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {profile.full_name}
                    </h1>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant={userRole?.role === 'admin' ? 'secondary' : 'default'}>
                        {roleDisplay}
                      </Badge>
                      <span className="text-gray-600">
                        {profile.email}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 md:mt-0">
                    <div className="flex flex-wrap gap-3">
                      {isOwner ? (
                        <>
                          <Link to="/dashboard">
                            <Button>Dashboard</Button>
                          </Link>
                          <Link to="/profile/edit">
                            <Button variant="outline">Edit Profile</Button>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Button>Send Message</Button>
                          <Button variant="outline">Connect</Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Location Info */}
                {(profile.country_of_origin || profile.desired_destination) && (
                  <div className="flex flex-wrap gap-4 text-gray-700">
                    {profile.country_of_origin && (
                      <div className="flex items-center gap-2">
                        <span>🌍</span>
                        <span>From: <strong>{profile.country_of_origin}</strong></span>
                      </div>
                    )}
                    {profile.desired_destination && (
                      <div className="flex items-center gap-2">
                        <span>✈️</span>
                        <span>Destination: <strong>{profile.desired_destination}</strong></span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
                <CardDescription>Personal information and bio</CardDescription>
              </CardHeader>
              <CardContent>
                {profile.bio ? (
                  <p className="text-gray-700 whitespace-pre-line">{profile.bio}</p>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No bio information provided yet.</p>
                    {isOwner && (
                      <Link
                        to="/profile/edit#bio"
                        className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Add your bio
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Ways to get in touch</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.email && (
                    <div className="flex items-start gap-3">
                      <div className="text-blue-500">📧</div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium break-all">{profile.email}</p>
                      </div>
                    </div>
                  )}
                  {profile.phone && (
                    <div className="flex items-start gap-3">
                      <div className="text-green-500">📱</div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{profile.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium">
                      {new Date(profile.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium">
                      {new Date(profile.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions for Owner */}
            {isOwner && (
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link to="/dashboard">
                      <Button variant="outline" className="w-full justify-start">
                        📊 View Dashboard
                      </Button>
                    </Link>
                    <Link to="/profile/edit">
                      <Button variant="outline" className="w-full justify-start">
                        ✏️ Edit Profile
                      </Button>
                    </Link>
                    <Link to="/jobs/create">
                      <Button variant="outline" className="w-full justify-start">
                        🏢 Post a Job
                      </Button>
                    </Link>
                    <Link to="/apply">
                      <Button variant="outline" className="w-full justify-start">
                        📝 Start Application
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
