-- Drop old policies that depend on role column
DROP POLICY IF EXISTS "Mentors can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Mentors can view all goals" ON public.user_goals;
DROP POLICY IF EXISTS "Mentors can view all updates" ON public.weekly_updates;
DROP POLICY IF EXISTS "Mentors can view all photos" ON storage.objects;

-- Remove role column from profiles (security risk - roles must be in separate table)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- Add new fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS cpf TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS target_weight NUMERIC,
ADD COLUMN IF NOT EXISTS goal_type TEXT CHECK (goal_type IN ('perda_peso', 'ganho_massa'));

-- Create app_role enum
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('mentee', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table (separate table for security)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'mentee',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own role" 
ON public.user_roles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
ON public.user_roles FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Create NEW profiles RLS policies using role system
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Create NEW user_goals RLS policies
CREATE POLICY "Admins can view all goals" 
ON public.user_goals FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Create NEW weekly_updates RLS policies
CREATE POLICY "Admins can view all updates" 
ON public.weekly_updates FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (
    id, email, full_name, sex, age, height, initial_weight, 
    cpf, phone, target_weight, goal_type
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'sex')::user_sex, 'female'),
    COALESCE((NEW.raw_user_meta_data->>'age')::INTEGER, 25),
    COALESCE((NEW.raw_user_meta_data->>'height')::NUMERIC, 170),
    COALESCE((NEW.raw_user_meta_data->>'initial_weight')::NUMERIC, 70),
    NEW.raw_user_meta_data->>'cpf',
    NEW.raw_user_meta_data->>'phone',
    COALESCE((NEW.raw_user_meta_data->>'target_weight')::NUMERIC, 70),
    COALESCE(NEW.raw_user_meta_data->>'goal_type', 'perda_peso')
  );
  
  -- Create mentee role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'mentee');
  
  RETURN NEW;
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_cpf ON public.profiles(cpf);
CREATE INDEX IF NOT EXISTS idx_profiles_goal_type ON public.profiles(goal_type);