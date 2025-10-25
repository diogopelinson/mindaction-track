import { useState, useEffect } from 'react';
import { getSignedPhotoUrl } from '@/lib/storageUtils';
import { Skeleton } from '@/components/ui/skeleton';

interface SecureImageProps {
  bucket: 'weekly-photos' | 'avatars';
  path: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}

/**
 * Componente para exibir imagens de buckets privados
 * Carrega automaticamente URLs assinadas temporárias
 */
export const SecureImage = ({ bucket, path, alt, className, fallback }: SecureImageProps) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadSignedUrl = async () => {
      try {
        setIsLoading(true);
        setError(false);
        
        if (!path) {
          console.error('SecureImage: No path provided');
          setError(true);
          return;
        }

        console.log(`SecureImage: Loading ${bucket}/${path}`);
        const url = await getSignedPhotoUrl(bucket, path);
        
        if (!url) {
          console.error(`SecureImage: Failed to get signed URL for ${bucket}/${path}`);
          setError(true);
          return;
        }

        console.log(`SecureImage: Successfully loaded ${bucket}/${path}`);
        setSignedUrl(url);
      } catch (err) {
        console.error('SecureImage: Failed to load signed URL:', err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadSignedUrl();
  }, [bucket, path]);

  if (isLoading) {
    return <Skeleton className={className} />;
  }

  if (error || !signedUrl) {
    return fallback ? <>{fallback}</> : <div className={className}>Imagem indisponível</div>;
  }

  return (
    <img 
      src={signedUrl} 
      alt={alt} 
      className={className}
      onError={() => setError(true)}
    />
  );
};
