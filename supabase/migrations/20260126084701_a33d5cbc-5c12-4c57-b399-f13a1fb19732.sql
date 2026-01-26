-- Add theme preference column to profiles
ALTER TABLE public.profiles 
ADD COLUMN theme_preference text DEFAULT 'system';

-- Add accent preference column (bull/bear/neutral)
ALTER TABLE public.profiles 
ADD COLUMN accent_preference text DEFAULT 'neutral';