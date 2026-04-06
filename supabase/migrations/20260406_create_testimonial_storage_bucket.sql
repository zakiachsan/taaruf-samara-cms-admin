-- =====================================================
-- Storage Bucket for Testimonial Avatars
-- =====================================================

-- Insert storage bucket for testimonials
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'testimonial-avatars',
  'testimonial-avatars',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for storage bucket
-- Public can read all avatars
CREATE POLICY "Public read testimonial avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'testimonial-avatars');

-- Everyone can upload (for admin usage via service role)
CREATE POLICY "Upload testimonial avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'testimonial-avatars');

-- Everyone can update (for admin usage via service role)
CREATE POLICY "Update testimonial avatars"
ON storage.objects FOR UPDATE
WITH CHECK (bucket_id = 'testimonial-avatars');

-- Everyone can delete (for admin usage via service role)
CREATE POLICY "Delete testimonial avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'testimonial-avatars');
