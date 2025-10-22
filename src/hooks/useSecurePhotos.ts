import { useState, useEffect } from 'react';
import { getSignedPhotoUrls } from '@/lib/storageUtils';

/**
 * Hook para carregar múltiplas URLs assinadas de fotos
 * Útil para galerias e listagens
 */
export function useSecurePhotos(
  bucket: 'weekly-photos' | 'avatars',
  paths: string[]
) {
  const [photoUrls, setPhotoUrls] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!paths || paths.length === 0) {
          setPhotoUrls(new Map());
          return;
        }

        const urls = await getSignedPhotoUrls(bucket, paths);
        setPhotoUrls(urls);
      } catch (err) {
        console.error('Failed to load secure photos:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPhotos();
  }, [bucket, paths.join(',')]);

  return {
    photoUrls,
    isLoading,
    error,
    getUrl: (path: string) => photoUrls.get(path) || null,
  };
}
