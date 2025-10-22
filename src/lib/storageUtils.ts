import { supabase } from '@/integrations/supabase/client';

/**
 * Gera uma URL assinada temporária para acessar arquivos em buckets privados
 * URLs expiram após 1 hora para maior segurança
 */
export async function getSignedPhotoUrl(
  bucket: 'weekly-photos' | 'avatars',
  path: string
): Promise<string | null> {
  if (!path) return null;

  try {
    // Remove o domínio público se estiver presente (migração de URLs antigas)
    const cleanPath = path.replace(/^https?:\/\/[^/]+\/storage\/v1\/object\/public\/[^/]+\//, '');

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(cleanPath, 3600); // 1 hora de validade

    if (error) {
      console.error(`Failed to generate signed URL for ${bucket}/${cleanPath}:`, error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return null;
  }
}

/**
 * Gera múltiplas URLs assinadas de uma vez (batch)
 */
export async function getSignedPhotoUrls(
  bucket: 'weekly-photos' | 'avatars',
  paths: string[]
): Promise<Map<string, string>> {
  const urlMap = new Map<string, string>();

  await Promise.all(
    paths.map(async (path) => {
      const signedUrl = await getSignedPhotoUrl(bucket, path);
      if (signedUrl) {
        urlMap.set(path, signedUrl);
      }
    })
  );

  return urlMap;
}

/**
 * Upload de arquivo com logging automático
 */
export async function uploadFileWithAudit(
  bucket: 'weekly-photos' | 'avatars',
  path: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ path: string; error: Error | null }> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      return { path: '', error };
    }

    return { path, error: null };
  } catch (error) {
    return { path: '', error: error as Error };
  }
}
