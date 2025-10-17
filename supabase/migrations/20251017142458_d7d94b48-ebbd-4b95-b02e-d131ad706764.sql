-- Deletar todos os usuários existentes
DELETE FROM auth.users;

-- Criar tabela de solicitações de admin
CREATE TABLE public.admin_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  cpf text NOT NULL,
  phone text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- RLS para admin_requests
ALTER TABLE public.admin_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all requests"
ON public.admin_requests FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update requests"
ON public.admin_requests FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own requests"
ON public.admin_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own requests"
ON public.admin_requests FOR SELECT
USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_admin_requests_updated_at
BEFORE UPDATE ON public.admin_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

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