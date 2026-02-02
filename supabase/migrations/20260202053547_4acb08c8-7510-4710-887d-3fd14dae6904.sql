-- Create storage bucket for application documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'application-documents', 
  'application-documents', 
  false,
  20971520, -- 20MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
);

-- Allow users to upload their own documents
CREATE POLICY "Users can upload own documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'application-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own documents
CREATE POLICY "Users can view own documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'application-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own documents
CREATE POLICY "Users can delete own documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'application-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow admins to view all documents
CREATE POLICY "Admins can view all documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'application-documents' 
  AND has_role(auth.uid(), 'admin')
);