-- Adicionar goal_subtype à tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS goal_subtype TEXT DEFAULT 'padrao'
CHECK (goal_subtype IN ('padrao', 'moderada', 'standard'));

-- Migrar dados existentes
UPDATE profiles
SET goal_subtype = CASE
  WHEN goal_type = 'perda_peso' THEN 'padrao'
  WHEN goal_type = 'ganho_massa' THEN 'standard'
  ELSE 'padrao'
END
WHERE goal_subtype IS NULL OR goal_subtype = 'padrao';

-- Adicionar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_goal_subtype ON profiles(goal_subtype);

-- Comentário explicativo
COMMENT ON COLUMN profiles.goal_subtype IS 'Subtipo do objetivo: padrao (0.25-0.5-0.75), moderada (0.25-0.35-0.5), standard (ganho massa 0.25-0.35-0.5)';