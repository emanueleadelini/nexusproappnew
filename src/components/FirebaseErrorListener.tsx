'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

/**
 * Ascolta gli errori di permesso Firestore emessi globalmente e mostra un toast.
 * Non lancia eccezioni per evitare crash dell'intera applicazione.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.error('[Firestore] Permission denied:', error.message);
      toast({
        variant: 'destructive',
        title: 'Permesso negato',
        description: `Accesso non autorizzato a: ${error.message}`,
      });
    };

    errorEmitter.on('permission-error', handleError);
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null;
}
