'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

/**
 * Inizializza l'istanza Firebase per l'applicazione.
 * Forza l'uso di firebaseConfig per garantire la connessione al Cloud di produzione
 * ed evitare l'instradamento automatico verso l'emulatore locale di Firebase Studio.
 */
export function initializeFirebase() {
  if (!getApps().length) {
    // Utilizziamo SEMPRE la configurazione esplicita per garantire la connessione al Cloud.
    const firebaseApp = initializeApp(firebaseConfig);
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
