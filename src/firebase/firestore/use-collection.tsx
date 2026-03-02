'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export type WithId<T> = T & { id: string };

export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

export interface UseCollectionOptions {
  enabled?: boolean;
}

export function useCollection<T = any>(
    memoizedTargetRefOrQuery: ((CollectionReference<DocumentData> | Query<DocumentData>) & {__memo?: boolean})  | null | undefined,
    options: UseCollectionOptions = {}
): UseCollectionResult<T> {
  const { enabled = true } = options;
  const [data, setData] = useState<WithId<T>[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // GUARDIA 1: Sospensione esplicita o riferimento nullo
    if (!enabled || !memoizedTargetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    // GUARDIA 2: Protezione percorsi non validi o "unknown"
    try {
      const path = (memoizedTargetRefOrQuery as any).type === 'collection'
        ? (memoizedTargetRefOrQuery as CollectionReference).path
        : (memoizedTargetRefOrQuery as any)._query?.path?.canonicalString?.() || '';
      
      if (!path || path.includes('unknown') || path === '') {
        setData(null);
        setIsLoading(false);
        return;
      }
    } catch (e) {
      // Silenzia errori di parsing del path
    }

    if (unsubscribeRef.current) unsubscribeRef.current();

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const results: WithId<T>[] = [];
        snapshot.forEach((doc) => {
          results.push({ ...(doc.data() as T), id: doc.id });
        });
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        // GUARDIA 3: Silenzio assenso durante caricamento o transizioni di auth
        if (err.code === 'permission-denied') {
          console.warn('useCollection: Permesso negato silenziato (fase di caricamento auth).');
          setData(null);
          setIsLoading(false);
          return;
        }

        const path = (memoizedTargetRefOrQuery as any).type === 'collection'
          ? (memoizedTargetRefOrQuery as CollectionReference).path
          : (memoizedTargetRefOrQuery as any)._query?.path?.canonicalString?.() || 'unknown';

        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path,
        });

        setError(contextualError);
        setData(null);
        setIsLoading(false);
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    unsubscribeRef.current = unsubscribe;
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, [memoizedTargetRefOrQuery, enabled]);

  if(memoizedTargetRefOrQuery && !memoizedTargetRefOrQuery.__memo) {
    throw new Error('Query non stabilizzata con useMemoFirebase. Rischio loop infinito.');
  }

  return { data, isLoading, error };
}