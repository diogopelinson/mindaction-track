-- Atualizar URLs antigas de fotos para apenas caminhos de arquivo
-- Isso resolve o problema de fotos antigas que foram salvas como URLs públicas

UPDATE weekly_updates
SET photo_url = regexp_replace(
  photo_url, 
  'https://[^/]+/storage/v1/object/public/weekly-photos/', 
  '', 
  'g'
)
WHERE photo_url LIKE '%https://%' AND photo_url LIKE '%weekly-photos%';

-- Log das atualizações
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated % photo URLs from full URLs to paths', updated_count;
END $$;