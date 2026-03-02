'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, onSnapshot } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener'
import { UserProfile } from '@/types/user';

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
  userData: UserProfile | null;
  isUserDataLoading: boolean;
}

export interface FirebaseContextState extends UserAuthState {
  areServicesAvailable: boolean;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [authState, setAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true,
    userError: null,
    userData: null,
    isUserDataLoading: false,
  });

  // Listener Autenticazione
  useEffect(() => {
    if (!auth) return;

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setAuthState(prev => ({ 
          ...prev, 
          user: firebaseUser, 
          isUserLoading: false,
          isUserDataLoading: !!firebaseUser // Se c'è un utente, dovremo caricare i dati
        }));
      },
      (error) => {
        setAuthState(prev => ({ ...prev, user: null, isUserLoading: false, userError: error }));
      }
    );
    return () => unsubscribeAuth();
  }, [auth]);

  // Listener Dati Utente Firestore (Profilo)
  useEffect(() => {
    if (!authState.user || !firestore) {
      setAuthState(prev => ({ ...prev, userData: null, isUserDataLoading: false }));
      return;
    }

    const unsubscribeData = onSnapshot(
      doc(firestore, 'users', authState.user.uid),
      (docSnap) => {
        setAuthState(prev => ({ 
          ...prev, 
          userData: docSnap.exists() ? (docSnap.data() as UserProfile) : null,
          isUserDataLoading: false 
        }));
      },
      (error) => {
        console.error("Errore caricamento profilo:", error);
        setAuthState(prev => ({ ...prev, isUserDataLoading: false }));
      }
    );

    return () => unsubscribeData();
  }, [authState.user, firestore]);

  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(firebaseApp && firestore && auth);
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: servicesAvailable ? firebaseApp : null,
      firestore: servicesAvailable ? firestore : null,
      auth: servicesAvailable ? auth : null,
      ...authState
    };
  }, [firebaseApp, firestore, auth, authState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) throw new Error('useFirebase must be used within a FirebaseProvider.');
  return context;
};

export const useAuth = () => useFirebase().auth!;
export const useFirestore = () => useFirebase().firestore!;
export const useFirebaseApp = () => useFirebase().firebaseApp!;
export const useUser = () => {
  const { user, isUserLoading, userError, userData, isUserDataLoading } = useFirebase();
  return { 
    user, 
    isUserLoading, 
    userError, 
    userData, 
    isUserDataLoading,
    role: userData?.ruolo || null,
    isAdmin: ['super_admin', 'admin', 'operatore'].includes(userData?.ruolo || ''),
    isCliente: ['referente', 'collaboratore'].includes(userData?.ruolo || '')
  };
};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  const memoized = useMemo(factory, deps);
  if(typeof memoized === 'object' && memoized !== null) {
    (memoized as any).__memo = true;
  }
  return memoized;
}
