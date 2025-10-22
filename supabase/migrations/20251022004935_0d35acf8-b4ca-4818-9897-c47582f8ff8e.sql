-- Melhorar função de cálculo de gordura corporal com validações robustas
CREATE OR REPLACE FUNCTION public.calculate_body_fat_navy(
  p_sex user_sex,
  p_height NUMERIC,
  p_neck NUMERIC,
  p_waist NUMERIC,
  p_hip NUMERIC DEFAULT NULL
)
RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  body_fat NUMERIC;
  log_value NUMERIC;
BEGIN
  -- Validações básicas de valores positivos
  IF p_neck <= 0 OR p_waist <= 0 OR p_height <= 0 THEN
    RAISE EXCEPTION 'All measurements must be positive';
  END IF;
  
  -- Validações antropométricas básicas
  IF p_neck < 25 OR p_neck > 60 THEN
    RAISE EXCEPTION 'Neck circumference seems unusual (%.1f cm). Please verify.', p_neck;
  END IF;
  
  IF p_waist < 50 OR p_waist > 150 THEN
    RAISE EXCEPTION 'Waist circumference seems unusual (%.1f cm). Please verify.', p_waist;
  END IF;
  
  IF p_waist <= p_neck THEN
    RAISE EXCEPTION 'Waist must be larger than neck (Waist: %.1f, Neck: %.1f)', p_waist, p_neck;
  END IF;

  IF p_sex = 'male' THEN
    log_value := p_waist - p_neck;
    IF log_value <= 0 THEN
      RETURN NULL; -- Medidas inválidas
    END IF;
    
    body_fat := 495 / (1.0324 - 0.19077 * LOG(10, log_value) + 0.15456 * LOG(10, p_height)) - 450;
  ELSE
    IF p_hip IS NULL OR p_hip <= 0 THEN
      RAISE EXCEPTION 'Hip circumference is required for female body fat calculation';
    END IF;
    
    IF p_hip < 50 OR p_hip > 170 THEN
      RAISE EXCEPTION 'Hip circumference seems unusual (%.1f cm). Please verify.', p_hip;
    END IF;
    
    IF p_hip < p_waist THEN
      RAISE EXCEPTION 'Hip is usually larger than waist (Hip: %.1f, Waist: %.1f)', p_hip, p_waist;
    END IF;
    
    log_value := p_waist + p_hip - p_neck;
    IF log_value <= 0 THEN
      RETURN NULL;
    END IF;
    
    body_fat := 495 / (1.29579 - 0.35004 * LOG(10, log_value) + 0.22100 * LOG(10, p_height)) - 450;
  END IF;
  
  -- Validar resultado (BF% entre 3% e 60%)
  IF body_fat < 3 OR body_fat > 60 THEN
    RETURN NULL; -- Resultado improvável, indica erro nas medidas
  END IF;
  
  RETURN ROUND(body_fat, 1); -- Arredondar para 1 casa decimal
END;
$$;