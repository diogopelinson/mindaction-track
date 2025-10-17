-- Deletar todos os usuários existentes
DELETE FROM auth.users;

-- Atualizar função handle_new_user para tornar o email específico admin automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
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
  
  -- Verificar se é o email do admin e adicionar role admin
  IF NEW.email = 'diogopelinsonduartemoraes@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    -- Create mentee role by default para outros usuários
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'mentee');
  END IF;
  
  RETURN NEW;
END;
$$;