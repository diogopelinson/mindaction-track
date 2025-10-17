-- Tornar o bucket weekly-photos público para exibição de imagens
UPDATE storage.buckets 
SET public = true 
WHERE id = 'weekly-photos';