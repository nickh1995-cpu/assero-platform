-- Add image column to assets table
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS image TEXT;
