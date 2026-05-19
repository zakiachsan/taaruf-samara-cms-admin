-- Migration: Add birth_date column to user_profiles
-- Run this in Supabase SQL Editor if birth_date column does not exist

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_profiles' AND column_name = 'birth_date'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN birth_date DATE;
        COMMENT ON COLUMN public.user_profiles.birth_date IS 'User date of birth';
    END IF;
END $$;
