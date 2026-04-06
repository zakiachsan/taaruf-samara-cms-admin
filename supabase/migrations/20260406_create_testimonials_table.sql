-- =====================================================
-- Testimonials Table
-- For managing testimonials displayed on landing page
-- =====================================================

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  author_location TEXT NOT NULL,
  testimonial_text TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_testimonials_active ON testimonials(is_active);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(is_featured);
CREATE INDEX IF NOT EXISTS idx_testimonials_display_order ON testimonials(display_order);

-- Enable Row Level Security
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow all for CMS admin (hardcoded auth)
CREATE POLICY "Allow all on testimonials" ON testimonials FOR ALL USING (true);

-- Public can read active testimonials
CREATE POLICY "Public read active testimonials" ON testimonials FOR SELECT
  USING (is_active = true);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_testimonials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER testimonials_updated_at_trigger
  BEFORE UPDATE ON testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_testimonials_updated_at();

-- Seed initial data from existing hardcoded testimonials
INSERT INTO testimonials (author_name, author_location, testimonial_text, rating, avatar_url, is_verified, is_featured, is_active, display_order)
VALUES
  ('Ahmad & Fatimah', 'Jakarta', 'Alhamdulillah, berkat Taaruf Samara kami bisa menemukan pasangan yang sesuai. Pendampingan admin sangat membantu proses taaruf kami menjadi lebih lancar dan sesuai syariat.', 5, NULL, true, true, true, 0),
  ('Rizky & Aisyah', 'Surabaya', 'Sangat direkomendasikan! Fitur Self-Value certification membantu kami mengenal diri sendiri dan pasangan lebih baik. Sekarang kami sudah menikah dan bahagia.', 5, NULL, true, true, true, 1),
  ('Fajar & Sarah', 'Bandung', 'Proses verifikasi yang ketat membuat kami merasa lebih aman. Semua profil terverifikasi dan admin selalu siap membantu. Terima kasih Taaruf Samara!', 5, NULL, true, false, true, 2);
