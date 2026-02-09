// app/routes/profile.tsx
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, useParams, Outlet } from "@remix-run/react";
import { createServerClient } from "@supabase/auth-helpers-remix";
import { Database } from "~/utils/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Job = Database["public"]["Tables"]["jobs"]["Row"];
type Application = Database["public"]["Tables"]["applications"]["Row"];
type Document = Database["public"]["Tables"]["documents"]["Row"];
type UserRole = Database["public"]["Tables"]["user_roles"]["Row"];

interface LoaderData {
  profile: Profile;
  userRole: UserRole | null;
  jobStats: {
    total: number;
    active: number;
    completed: number;
    posted: number;
  };
  applicationStats: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    in_progress: number;
  };
  documentStats: {
    total: number;
    verified: number;
    pending: number;
  };
  recentJobs: Job[];
  recentApplications: Application[];
  recentDocuments: Document[];
  isOwner: boolean;
  canEdit: boolean;
  isAdmin: boolean;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const response = new Response();
  const supabase = createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  );

  // Get current user
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const currentUser = session?.user;

  // Get profile ID from URL or use current user's ID
  const profileId = params.profileId || currentUser?.id;

  if (!profileId) {
    throw new Response("Profile not found", { status: 404 });
  }

  // Fetch profile data
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .single();

  if (profileError || !profile) {
    throw new Response("Profile not found", { status: 404 });
  }

  // Fetch user role
  const { data: userRole } = await supabase
    .from("user_roles")
    .select("*")
    .eq("user_id", profileId)
    .single();

  // Fetch job statistics
  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, status, created_by")
    .or(`profile_id.eq.${profileId},created_by.eq.${profileId}`);

  const jobStats = {
    total: jobs?.length || 0,
    active: jobs?.filter(j => j.status === 'active')?.length || 0,
    completed: jobs?.filter(j => j.status === 'completed')?.length || 0,
    posted: jobs?.filter(j => j.created_by === profileId)?.length || 0,
  };

  // Fetch application statistics
  const { data: applications } = await supabase
    .from("applications")
    .select("id, status")
    .eq("profile_id", profileId);

  const applicationStats = {
    total: applications?.length || 0,
    pending: applications?.filter(a => a.status === 'pending')?.length || 0,
    accepted: applications?.filter(a => a.status === 'accepted')?.length || 0,
    rejected: applications?.filter(a => a.status === 'rejected')?.length || 0,
    in_progress: applications?.filter(a => a.status === 'in_progress')?.length || 0,
  };

  // Fetch document statistics
  const { data: documents } = await supabase
    .from("documents")
    .select("id, status")
    .eq("profile_id", profileId);

  const documentStats = {
    total: documents?.length || 0,
    verified: documents?.filter(d => d.status === 'verified')?.length || 0,
    pending: documents?.filter(d => d.status === 'pending')?.length || 0,
  };

  // Fetch recent jobs (limit 5)
  const { data: recentJobs } = await supabase
    .from("jobs")
    .select("*")
    .or(`profile_id.eq.${profileId},created_by.eq.${profileId}`)
    .order("created_at", { ascending: false })
    .limit(5);

  // Fetch recent applications (limit 5)
  const { data: recentApplications } = await supabase
    .from("applications")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(5);

  // Fetch recent documents (limit 5)
  const { data: recentDocuments } = await supabase
    .from("documents")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(5);

  // Check permissions
  const isOwner = currentUser?.id === profileId;
  const isAdmin = userRole?.role === 'admin';
  const canEdit = isOwner || isAdmin;

  return json(
    {
      profile,
      userRole,
      jobStats,
      applicationStats,
      documentStats,
      recentJobs: recentJobs || [],
      recentApplications: recentApplications || [],
      recentDocuments: recentDocuments || [],
      isOwner,
      canEdit,
      isAdmin,
    },
    {
      headers: response.headers,
    }
  );
}

export default function ProfilePage() {
  const { 
    profile, 
    userRole, 
    jobStats, 
    applicationStats, 
    documentStats,
    recentJobs, 
    recentApplications,
    recentDocuments,
    isOwner,
    canEdit,
    isAdmin
  } = useLoaderData<LoaderData>();
  const params = useParams();

  // Format role for display
  const roleDisplay = userRole?.role ? 
    userRole.role.charAt(0).toUpperCase() + userRole.role.slice(1) : 
    'User';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header with Stats */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Gradient Banner based on role */}
          <div className={`h-40 ${isAdmin ? 'bg-gradient-to-r from-purple-600 to-indigo-700' : 'bg-gradient-to-r from-blue-600 to-cyan-600'} relative`}>
            {canEdit && (
              <div className="absolute top-4 right-4 flex gap-2">
                <Link
                  to="/profile/edit"
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Admin Panel
                  </Link>
                )}
              </div>
            )}
          </div>
          
          <div className="relative px-8 pb-8 -mt-16">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-8">
              <div className="relative">
                <img
                  src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=random&size=150`}
                  alt={profile.full_name}
                  className="w-40 h-40 rounded-full border-4 border-white shadow-2xl object-cover bg-white"
                />
                <div className={`absolute -bottom-2 -right-2 ${isAdmin ? 'bg-purple-500' : 'bg-blue-500'} text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg`}>
                  {roleDisplay}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900">
                      {profile.full_name}
                    </h1>
                    {profile.email && (
                      <p className="text-gray-600 mt-2">
                        <span className="inline-flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {profile.email}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="mt-4 md:mt-0">
                    <div className="flex flex-wrap gap-3">
                      {isOwner ? (
                        <>
                          <Link
                            to="/dashboard"
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold shadow-md"
                          >
                            Dashboard
                          </Link>
                          <Link
                            to="/jobs/create"
                            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold shadow-md"
                          >
                            Post Job
                          </Link>
                        </>
                      ) : (
                        <>
                          <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold shadow-md">
                            Send Message
                          </button>
                          <Link
                            to={`/jobs?profile=${profile.id}`}
                            className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-xl hover:bg-blue-50 transition font-semibold shadow-md"
                          >
                            View Jobs
                          </Link>
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
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>From: <strong>{profile.country_of_origin}</strong></span>
                      </div>
                    )}
                    {profile.desired_destination && (
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        <span>Destination: <strong>{profile.desired_destination}</strong></span>
                      </div>
                    )}
                    {profile.phone && (
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>Phone: <strong>{profile.phone}</strong></span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-gray-200">
              <div className="bg-blue-50 p-4 rounded-xl text-center hover:shadow-md transition">
                <div className="text-3xl font-bold text-blue-700">{jobStats.total}</div>
                <div className="text-sm text-blue-600 font-medium">Total Jobs</div>
                <div className="text-xs text-gray-500 mt-1">
                  {jobStats.active} active • {jobStats.posted} posted
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-xl text-center hover:shadow-md transition">
                <div className="text-3xl font-bold text-green-700">{applicationStats.total}</div>
                <div className="text-sm text-green-600 font-medium">Applications</div>
                <div className="text-xs text-gray-500 mt-1">
                  {applicationStats.pending} pending • {applicationStats.accepted} accepted
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl text-center hover:shadow-md transition">
                <div className="text-3xl font-bold text-purple-700">{documentStats.total}</div>
                <div className="text-sm text-purple-600 font-medium">Documents</div>
                <div className="text-xs text-gray-500 mt-1">
                  {documentStats.verified} verified • {documentStats.pending} pending
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-xl text-center hover:shadow-md transition">
                <div className="text-3xl font-bold text-yellow-700">
                  {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
                <div className="text-sm text-yellow-600 font-medium">Member Since</div>
                <div className="text-xs text-gray-500 mt-1">
                  Last updated: {new Date(profile.updated_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Activity */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Jobs */}
            {recentJobs.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Recent Jobs</h2>
                  <Link 
                    to={isOwner ? "/my-jobs" : `/jobs?profile=${profile.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View all →
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <div key={job.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{job.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{job.description?.substring(0, 100)}...</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          job.status === 'active' ? 'bg-green-100 text-green-800' :
                          job.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-500">
                          Posted: {new Date(job.created_at).toLocaleDateString()}
                        </div>
                        <Link 
                          to={`/jobs/${job.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Applications */}
            {isOwner && recentApplications.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Recent Applications</h2>
                  <Link 
                    to="/my-applications"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View all →
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentApplications.map((app) => (
                    <div key={app.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">Application #{app.id.substring(0, 8)}</h3>
                          <p className="text-sm text-gray-600 mt-1">Applied for job</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          app.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {app.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-500">
                          Applied: {new Date(app.created_at).toLocaleDateString()}
                        </div>
                        <Link 
                          to={`/applications/${app.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Status →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Profile Bio/About */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">About</h2>
              <div className="prose max-w-none">
                {profile.bio ? (
                  <p className="text-gray-700 whitespace-pre-line">{profile.bio}</p>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
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
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Documents Status */}
            {recentDocuments.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Documents Status</h3>
                <div className="space-y-3">
                  {recentDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          doc.status === 'verified' ? 'bg-green-500' :
                          doc.status === 'rejected' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }`}></div>
                        <span className="text-sm text-gray-700">{doc.document_type || 'Document'}</span>
                      </div>
                      <span className={`text-xs font-medium ${
                        doc.status === 'verified' ? 'text-green-700' :
                        doc.status === 'rejected' ? 'text-red-700' :
                        'text-yellow-700'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
                {isOwner && (
                  <Link
                    to="/documents"
                    className="block w-full mt-4 text-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition font-medium"
                  >
                    Manage Documents
                  </Link>
                )}
              </div>
            )}

            {/* Quick Actions */}
            {isOwner && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border border-blue-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    to="/jobs/create"
                    className="flex items-center justify-between p-3 bg-white rounded-xl hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <span className="font-medium">Post a New Job</span>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    to="/documents/upload"
                    className="flex items-center justify-between p-3 bg-white rounded-xl hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <span className="font-medium">Upload Document</span>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    to="/applications"
                    className="flex items-center justify-between p-3 bg-white rounded-xl hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="font-medium">View Applications</span>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-4">
                {profile.email && (
                  <div className="flex items-start gap-3">
                    <div className="text-blue-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium break-all">{profile.email}</p>
                    </div>
                  </div>
                )}
                {profile.phone && (
                  <div className="flex items-start gap-3">
                    <div className="text-green-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{profile.phone}</p>
                    </div>
                  </div>
                )}
                <div className="pt-4 border-t border-gray-200">
                  {!isOwner && (
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                      Contact This User
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Completion */}
            {isOwner && (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-6 border border-yellow-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Completion</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Profile Strength</span>
                      <span className="text-sm font-bold text-blue-700">75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full w-3/4"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'Add Bio', completed: !!profile.bio, path: '/profile/edit#bio' },
                      { label: 'Upload Profile Picture', completed: !!profile.avatar_url, path: '/profile/edit#avatar' },
                      { label: 'Add Phone Number', completed: !!profile.phone, path: '/profile/edit#contact' },
                      { label: 'Upload Documents', completed: documentStats.total > 0, path: '/documents/upload' },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className={`text-sm ${item.completed ? 'text-green-600' : 'text-gray-600'}`}>
                          {item.label}
                        </span>
                        {item.completed ? (
                          <span className="text-green-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        ) : (
                          <Link
                            to={item.path}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Add
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
