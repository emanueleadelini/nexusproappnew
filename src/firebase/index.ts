'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

/**
 * Inizializza l'istanza Firebase per l'applicazione.
 * Supporta sia l'inizializzazione automatica in produzione (App Hosting)
 * che il fallback alla configurazione manuale in sviluppo.
 * 
 * NOTA: Non vengono utilizzati emulatori per garantire la compatibilità
 * con l'ambiente cloud di Firebase Studio.
 */
export function initializeFirebase() {
  if (!getApps().length) {
    let firebaseApp;
    try {
      // Tenta l'inizializzazione via variabili d'ambiente (Firebase App Hosting)
      firebaseApp = initializeApp();
    } catch (e) {
      // Fallback alla configurazione esplicita per sviluppo locale
      if (process.env.NODE_ENV === "production") {
        console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
      }
      firebaseApp = initializeApp(firebaseConfig);
    }

    return getSdks(firebaseApp);
  }

  // Se già inizializzato, ritorna gli SDK esistenti
  return getSdks(getApp());
}

/**
 * Estrae gli SDK principali (Auth e Firestore) dall'app inizializzata.
 */
export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

// Esportazione dei moduli core per l'app
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
