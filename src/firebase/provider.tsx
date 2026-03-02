'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, onSnapshot } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { UserProfile } from '@/types/user';

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

const ADMIN_EMAIL = 'emanueleadelini@gmail.com';

export const FirebaseProvider: React.FC<{
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}> = ({ children, firebaseApp, firestore, auth }) => {
  const [authState, setAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true,
    userError: null,
    userData: null,
    isUserDataLoading: false,
  });

  useEffect(() => {
    if (!auth) return;
    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setAuthState(prev => ({ 
          ...prev, 
          user: firebaseUser, 
          isUserLoading: false,
          isUserDataLoading: !!firebaseUser
        }));
      },
      (error) => {
        setAuthState(prev => ({ ...prev, user: null, isUserLoading: false, userError: error }));
      }
    );
    return () => unsubscribeAuth();
  }, [auth]);

  useEffect(() => {
    if (!authState.user || !firestore) {
      setAuthState(prev => ({ ...prev, userData: null, isUserDataLoading: false }));
      return;
    }

    // Caricamento profilo utente (Fonte di verità per il ruolo e cliente_id)
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
        console.warn("FirebaseProvider: Profilo non ancora accessibile o mancante.");
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
export const useUser = () => {
  const { user, isUserLoading, userData, isUserDataLoading } = useFirebase();
  const isAdmin = user?.email === ADMIN_EMAIL;
  return { 
    user, 
    isUserLoading, 
    userData, 
    isUserDataLoading,
    isAdmin,
    isCliente: user && !isAdmin,
    clienteId: userData?.cliente_id || null
  };
};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  const memoized = useMemo(factory, deps);
  if(typeof memoized === 'object' && memoized !== null) {
    (memoized as any).__memo = true;
  }
  return memoized;
}
