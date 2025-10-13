-- Fix security warnings by setting search_path for functions

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
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  body_fat DECIMAL;
BEGIN
  IF p_sex = 'male' THEN
    body_fat := 495 / (1.0324 - 0.19077 * LOG(10, p_waist - p_neck) + 0.15456 * LOG(10, p_height)) - 450;
  ELSE
    IF p_hip IS NULL THEN
      RAISE EXCEPTION 'Hip circumference is required for female body fat calculation';
    END IF;
    body_fat := 495 / (1.29579 - 0.35004 * LOG(10, p_waist + p_hip - p_neck) + 0.22100 * LOG(10, p_height)) - 450;
  END IF;
  
  RETURN ROUND(body_fat, 2);
END;
$$;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;