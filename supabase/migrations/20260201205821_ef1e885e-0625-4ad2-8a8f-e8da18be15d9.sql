-- =============================================
-- CAREWELL SUPPORTS COMPLETE DATABASE SCHEMA
-- =============================================

-- 1. Create enums for statuses
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'applicant');
CREATE TYPE public.application_status AS ENUM ('submitted', 'under_review', 'pending_documents', 'approved', 'job_matched', 'visa_process', 'completed');
CREATE TYPE public.document_status AS ENUM ('pending', 'approved', 'missing', 'rejected');
CREATE TYPE public.payment_plan_type AS ENUM ('milestone', 'full_upfront', 'deferred');
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE public.job_application_status AS ENUM ('applied', 'accepted', 'rejected', 'pending', 'interviewing');
CREATE TYPE public.transportation_status AS ENUM ('pending', 'booked', 'completed', 'cancelled');
CREATE TYPE public.notification_type AS ENUM ('application', 'document', 'payment', 'job', 'system');

-- 2. Create profiles table (linked to auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    country_of_origin TEXT,
    desired_destination TEXT DEFAULT 'USA',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create user_roles table (CRITICAL: roles must be separate table)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'applicant',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- 4. Create jobs table (public job listings)
CREATE TABLE public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    salary_min INTEGER,
    salary_max INTEGER,
    job_type TEXT DEFAULT 'Full-time',
    category TEXT,
    visa_sponsorship BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    requirements TEXT[],
    benefits TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create applications table (user migration applications)
CREATE TABLE public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status application_status NOT NULL DEFAULT 'submitted',
    total_fee DECIMAL(10,2) DEFAULT 0,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    payment_plan payment_plan_type DEFAULT 'milestone',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Create documents table
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    document_type TEXT NOT NULL,
    file_url TEXT,
    status document_status NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMPTZ
);

-- 7. Create job_applications table
CREATE TABLE public.job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    status job_application_status NOT NULL DEFAULT 'applied',
    cover_letter TEXT,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, job_id)
);

-- 8. Create payments table
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT,
    milestone_name TEXT,
    status payment_status NOT NULL DEFAULT 'pending',
    transaction_id TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Create notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type notification_type NOT NULL DEFAULT 'system',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Create transportation table
CREATE TABLE public.transportation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL UNIQUE,
    ticket_booked BOOLEAN DEFAULT false,
    flight_details JSONB,
    milestone_payment_id UUID REFERENCES public.payments(id),
    status transportation_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transportation ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SECURITY DEFINER FUNCTION FOR ROLE CHECKING
-- =============================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies (only admins can manage roles, users can see their own)
CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles" ON public.user_roles
    FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles" ON public.user_roles
    FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Jobs policies (public read, admin write)
CREATE POLICY "Anyone can view jobs" ON public.jobs
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert jobs" ON public.jobs
    FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update jobs" ON public.jobs
    FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete jobs" ON public.jobs
    FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Applications policies
CREATE POLICY "Users can view own applications" ON public.applications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications" ON public.applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications" ON public.applications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications" ON public.applications
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all applications" ON public.applications
    FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Documents policies (via application ownership)
CREATE POLICY "Users can view own documents" ON public.documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.applications 
            WHERE id = documents.application_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own documents" ON public.documents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.applications 
            WHERE id = application_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all documents" ON public.documents
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all documents" ON public.documents
    FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Job applications policies
CREATE POLICY "Users can view own job applications" ON public.job_applications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own job applications" ON public.job_applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own job applications" ON public.job_applications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own job applications" ON public.job_applications
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all job applications" ON public.job_applications
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all job applications" ON public.job_applications
    FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Payments policies
CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.applications 
            WHERE id = payments.application_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all payments" ON public.payments
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert payments" ON public.payments
    FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update payments" ON public.payments
    FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Transportation policies
CREATE POLICY "Users can view own transportation" ON public.transportation
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.applications 
            WHERE id = transportation.application_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all transportation" ON public.transportation
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage transportation" ON public.transportation
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON public.applications
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
    BEFORE UPDATE ON public.job_applications
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transportation_updated_at
    BEFORE UPDATE ON public.transportation
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- TRIGGER TO AUTO-CREATE PROFILE & ROLE ON SIGNUP
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create profile
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email
    );
    
    -- Assign default applicant role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'applicant');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();