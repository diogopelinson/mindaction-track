-- Add level_title field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN level_title TEXT DEFAULT 'Iniciante';

-- Add level field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN current_level INTEGER DEFAULT 1;