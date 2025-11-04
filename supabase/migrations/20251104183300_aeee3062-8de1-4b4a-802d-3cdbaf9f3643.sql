-- Create user_xp table to track XP and levels
CREATE TABLE public.user_xp (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  xp_to_next_level INTEGER NOT NULL DEFAULT 500,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create xp_history table to track XP gains
CREATE TABLE public.xp_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  xp_gained INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create weekly_challenges table
CREATE TABLE public.weekly_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_type TEXT NOT NULL,
  week_number INTEGER NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  xp_reward INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_xp
CREATE POLICY "Users can view their own XP"
  ON public.user_xp FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own XP"
  ON public.user_xp FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own XP"
  ON public.user_xp FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all XP"
  ON public.user_xp FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for xp_history
CREATE POLICY "Users can view their own XP history"
  ON public.xp_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own XP history"
  ON public.xp_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all XP history"
  ON public.xp_history FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for weekly_challenges
CREATE POLICY "Users can view their own challenges"
  ON public.weekly_challenges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenges"
  ON public.weekly_challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenges"
  ON public.weekly_challenges FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all challenges"
  ON public.weekly_challenges FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at on user_xp
CREATE TRIGGER update_user_xp_updated_at
  BEFORE UPDATE ON public.user_xp
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_user_xp_user_id ON public.user_xp(user_id);
CREATE INDEX idx_xp_history_user_id ON public.xp_history(user_id);
CREATE INDEX idx_xp_history_created_at ON public.xp_history(created_at DESC);
CREATE INDEX idx_weekly_challenges_user_id ON public.weekly_challenges(user_id);
CREATE INDEX idx_weekly_challenges_week_number ON public.weekly_challenges(week_number);