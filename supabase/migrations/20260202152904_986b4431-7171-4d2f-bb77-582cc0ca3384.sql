-- Create admin settings table for storing configuration values
CREATE TABLE public.admin_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key text NOT NULL UNIQUE,
    setting_value text,
    setting_type text NOT NULL DEFAULT 'text',
    description text,
    is_secret boolean DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view settings
CREATE POLICY "Admins can view settings"
    ON public.admin_settings
    FOR SELECT
    USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert settings
CREATE POLICY "Admins can insert settings"
    ON public.admin_settings
    FOR INSERT
    WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update settings
CREATE POLICY "Admins can update settings"
    ON public.admin_settings
    FOR UPDATE
    USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete settings
CREATE POLICY "Admins can delete settings"
    ON public.admin_settings
    FOR DELETE
    USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_admin_settings_updated_at
    BEFORE UPDATE ON public.admin_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default payment settings placeholders
INSERT INTO public.admin_settings (setting_key, setting_value, setting_type, description, is_secret) VALUES
    ('stripe_enabled', 'false', 'boolean', 'Enable Stripe payment processing', false),
    ('paypal_enabled', 'false', 'boolean', 'Enable PayPal payment processing', false),
    ('payment_currency', 'USD', 'text', 'Default payment currency', false),
    ('smtp_host', '', 'text', 'SMTP server host for email notifications', false),
    ('smtp_port', '587', 'text', 'SMTP server port', false),
    ('support_email', 'support@carewellsupports.com', 'text', 'Support email address', false);