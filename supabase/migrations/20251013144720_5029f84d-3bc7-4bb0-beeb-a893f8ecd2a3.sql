-- Create enum for user sex
CREATE TYPE user_sex AS ENUM ('male', 'female');

-- Create enum for user role
CREATE TYPE user_role AS ENUM ('mentee', 'mentor');

-- Create enum for goal type
CREATE TYPE goal_type AS ENUM ('weight_loss', 'muscle_gain');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  sex user_sex NOT NULL,
  age INTEGER NOT NULL CHECK (age > 0 AND age < 120),
  height DECIMAL(5,2) NOT NULL CHECK (height > 0),
  initial_weight DECIMAL(5,2) NOT NULL CHECK (initial_weight > 0),
  role user_role NOT NULL DEFAULT 'mentee',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_goals table
CREATE TABLE public.user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  goal_type goal_type NOT NULL,
  target_weight DECIMAL(5,2) NOT NULL CHECK (target_weight > 0),
  weekly_variation_percent DECIMAL(5,4) NOT NULL CHECK (weekly_variation_percent > 0),
  total_weeks INTEGER NOT NULL DEFAULT 24 CHECK (total_weeks > 0 AND total_weeks <= 52),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create weekly_updates table
CREATE TABLE public.weekly_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL CHECK (week_number > 0 AND week_number <= 52),
  weight DECIMAL(5,2) NOT NULL CHECK (weight > 0),
  photo_url TEXT,
  neck_circumference DECIMAL(5,2),
  waist_circumference DECIMAL(5,2),
  hip_circumference DECIMAL(5,2),
  body_fat_percentage DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, week_number)
);

-- Create function to calculate body fat percentage using Navy Method
CREATE OR REPLACE FUNCTION calculate_body_fat_navy(
  p_sex user_sex,
  p_height DECIMAL,
  p_neck DECIMAL,
  p_waist DECIMAL,
  p_hip DECIMAL DEFAULT NULL
)
RETURNS DECIMAL
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  body_fat DECIMAL;
BEGIN
  IF p_sex = 'male' THEN
    -- Male formula: 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
    body_fat := 495 / (1.0324 - 0.19077 * LOG(10, p_waist - p_neck) + 0.15456 * LOG(10, p_height)) - 450;
  ELSE
    -- Female formula: 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450
    IF p_hip IS NULL THEN
      RAISE EXCEPTION 'Hip circumference is required for female body fat calculation';
    END IF;
    body_fat := 495 / (1.29579 - 0.35004 * LOG(10, p_waist + p_hip - p_neck) + 0.22100 * LOG(10, p_height)) - 450;
  END IF;
  
  RETURN ROUND(body_fat, 2);
END;
$$;

-- Create function to automatically calculate body fat percentage on insert/update
CREATE OR REPLACE FUNCTION update_body_fat_percentage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_profile RECORD;
BEGIN
  -- Get user profile data
  SELECT p.sex, p.height
  INTO user_profile
  FROM public.profiles p
  WHERE p.id = NEW.user_id;

  -- Calculate body fat if measurements are provided
  IF NEW.neck_circumference IS NOT NULL AND NEW.waist_circumference IS NOT NULL THEN
    IF user_profile.sex = 'male' THEN
      NEW.body_fat_percentage := calculate_body_fat_navy(
        user_profile.sex,
        user_profile.height,
        NEW.neck_circumference,
        NEW.waist_circumference
      );
    ELSIF NEW.hip_circumference IS NOT NULL THEN
      NEW.body_fat_percentage := calculate_body_fat_navy(
        user_profile.sex,
        user_profile.height,
        NEW.neck_circumference,
        NEW.waist_circumference,
        NEW.hip_circumference
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for body fat calculation
CREATE TRIGGER calculate_body_fat_trigger
BEFORE INSERT OR UPDATE ON public.weekly_updates
FOR EACH ROW
EXECUTE FUNCTION update_body_fat_percentage();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_goals_updated_at
BEFORE UPDATE ON public.user_goals
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_updates_updated_at
BEFORE UPDATE ON public.weekly_updates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, sex, age, height, initial_weight)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'sex')::user_sex, 'female'),
    COALESCE((NEW.raw_user_meta_data->>'age')::INTEGER, 25),
    COALESCE((NEW.raw_user_meta_data->>'height')::DECIMAL, 170),
    COALESCE((NEW.raw_user_meta_data->>'initial_weight')::DECIMAL, 70)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Mentors can view all profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'mentor'
  )
);

-- RLS Policies for user_goals
CREATE POLICY "Users can view their own goals"
ON public.user_goals
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals"
ON public.user_goals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
ON public.user_goals
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Mentors can view all goals"
ON public.user_goals
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'mentor'
  )
);

-- RLS Policies for weekly_updates
CREATE POLICY "Users can view their own updates"
ON public.weekly_updates
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own updates"
ON public.weekly_updates
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own updates"
ON public.weekly_updates
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own updates"
ON public.weekly_updates
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Mentors can view all updates"
ON public.weekly_updates
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'mentor'
  )
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_user_goals_user_id ON public.user_goals(user_id);
CREATE INDEX idx_weekly_updates_user_id ON public.weekly_updates(user_id);
CREATE INDEX idx_weekly_updates_week_number ON public.weekly_updates(user_id, week_number);

-- Create storage bucket for weekly photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('weekly-photos', 'weekly-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for weekly photos
CREATE POLICY "Users can upload their own photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'weekly-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own photos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'weekly-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own photos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'weekly-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Mentors can view all photos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'weekly-photos' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'mentor'
  )
);