-- Garantir que profiles.created_at tem valor padrão
-- Isso assegura que todos os novos perfis terão a data de criação registrada

-- Verificar e adicionar DEFAULT se não existir
ALTER TABLE public.profiles 
ALTER COLUMN created_at SET DEFAULT now();

-- Comentário explicativo
COMMENT ON COLUMN public.profiles.created_at IS 'Data de criação do perfil do usuário, preenchida automaticamente';