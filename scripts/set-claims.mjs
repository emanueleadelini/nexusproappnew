// scripts/set-claims.mjs
// Esegui con: node scripts/set-claims.mjs
//
// Prerequisiti:
// 1. npm install firebase-admin
// 2. Scarica la service account key da Firebase Console:
//    Project Settings > Service Accounts > Generate new private key
// 3. Salva il file JSON nella root del progetto come "serviceAccountKey.json"

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';

const SERVICE_ACCOUNT_PATH = './serviceAccountKey.json';
const TARGET_UID = 'DaRQQ7aTpnbw195PmvTE98F2kwD2';
const CLAIMS = {
  ruolo: 'super_admin',
  cliente_id: null,
};

try {
  const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
  
  initializeApp({
    credential: cert(serviceAccount),
  });

  const auth = getAuth();
  await auth.setCustomUserClaims(TARGET_UID, CLAIMS);
  
  const user = await auth.getUser(TARGET_UID);
  console.log('✅ Custom claims impostati con successo per:', user.email);
  console.log('⚠️ IMPORTANTE: L\'utente deve fare LOGOUT e LOGIN.');
  
} catch (error) {
  console.error('❌ Errore:', error.message);
}