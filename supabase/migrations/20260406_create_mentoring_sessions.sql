-- =====================================================
-- Mentoring Sessions Table
-- For tracking 3 mentoring sessions per Premium Pendampingan user
-- =====================================================

CREATE TABLE IF NOT EXISTS mentoring_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  purchase_id UUID NOT NULL REFERENCES subscription_purchases(id) ON DELETE CASCADE,
  session_number INTEGER NOT NULL CHECK (session_number IN (1, 2, 3)),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  mentor_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_mentoring_sessions_user ON mentoring_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_sessions_purchase ON mentoring_sessions(purchase_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_sessions_status ON mentoring_sessions(status);

-- Enable Row Level Security
ALTER TABLE mentoring_sessions ENABLE ROW LEVEL SECURITY;

-- Allow all for CMS admin
CREATE POLICY "Allow all on mentoring_sessions" ON mentoring_sessions FOR ALL USING (true);

-- Auto-update trigger
CREATE OR REPLACE FUNCTION update_mentoring_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mentoring_sessions_updated_at_trigger
  BEFORE UPDATE ON mentoring_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_mentoring_sessions_updated_at();

-- Create mentoring sessions automatically when Premium Pendampingan addon is purchased
CREATE OR REPLACE FUNCTION create_mentoring_sessions_on_purchase()
RETURNS TRIGGER AS $$
DECLARE
  premium_pendampingan_id UUID;
BEGIN
  -- Find Premium Pendampingan addon ID
  SELECT id INTO premium_pendampingan_id
  FROM subscription_addons
  WHERE name = 'Premium Pendampingan'
  LIMIT 1;

  -- If this purchase includes Premium Pendampingan addon, create 3 mentoring sessions
  IF EXISTS (
    SELECT 1 FROM purchase_addons
    WHERE purchase_id = NEW.id AND addon_id = premium_pendampingan_id
  ) THEN
    INSERT INTO mentoring_sessions (user_id, purchase_id, session_number)
    VALUES
      (NEW.user_id, NEW.id, 1),
      (NEW.user_id, NEW.id, 2),
      (NEW.user_id, NEW.id, 3);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mentoring_sessions_trigger
  AFTER INSERT ON subscription_purchases
  FOR EACH ROW
  EXECUTE FUNCTION create_mentoring_sessions_on_purchase();
