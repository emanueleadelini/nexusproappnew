# AD Next Lab - Manuale Tecnico Master (Documentazione Integrale)

Questo documento contiene l'analisi ingegneristica completa, l'architettura e il codice sorgente integrale della piattaforma AD Next Lab. È destinato all'uso esclusivo del team ingegneristico per audit e sviluppo.

---

## 1. Architettura di Sistema
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, ShadCN UI.
- **Backend**: Firebase 11 (Firestore, Authentication).
- **AI Engine**: Genkit 1.x con plugin Google Generative AI (Gemini 2.5 Flash).
- **Pattern**: Multi-tenant basato su `cliente_id` con RBAC a 4 livelli: `super_admin`, `operatore`, `referente`, `collaboratore`.

---

## 2. Configurazione e Inizializzazione (src/firebase/)

### 2.1 Configurazione (config.ts)
```typescript
export const firebaseConfig = {
  "projectId": "studio-1172125722-4fbeb",
  "appId": "1:93997751906:web:f34d376284a6232765bb3b",
  "apiKey": "AIzaSyCydvNHxTZMivgQDGClqopoG1PiE_gZsBA",
  "authDomain": "studio-1172125722-4fbeb.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "93997751906"
};
```

### 2.2 Provider Core (provider.tsx)
```typescript
'use client';
import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener'

export const FirebaseContext = createContext<any>(undefined);

export const FirebaseProvider = ({ children, firebaseApp, firestore, auth }) => {
  const [userState, setUserState] = useState({ user: null, isUserLoading: true });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUserState({ user: u, isUserLoading: false });
    });
    return () => unsubscribe();
  }, [auth]);

  const contextValue = useMemo(() => ({
    firebaseApp, firestore, auth, ...userState
  }), [firebaseApp, firestore, auth, userState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => useContext(FirebaseContext);
export const useFirestore = () => useFirebase().firestore;
export const useAuth = () => useFirebase().auth;
export const useUser = () => {
  const { user, isUserLoading } = useFirebase();
  return { user, isUserLoading };
};
```

---

## 3. Custom Hooks Firestore (src/firebase/firestore/)

### 3.1 useCollection.tsx
```typescript
'use client';
import { useState, useEffect } from 'react';
import { onSnapshot, QuerySnapshot, FirestoreError } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function useCollection(memoizedQuery) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!memoizedQuery) return;
    setIsLoading(true);

    const unsubscribe = onSnapshot(memoizedQuery, 
      (snapshot) => {
        setData(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        setIsLoading(false);
      },
      (error) => {
        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path: memoizedQuery.path || 'query'
        });
        errorEmitter.emit('permission-error', contextualError);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [memoizedQuery]);

  return { data, isLoading };
}
```

---

## 4. Logiche AI (src/ai/flows/)

### 4.1 Generazione Post (generate-post-ai-flow.ts)
```typescript
'use server';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GeneratePostInputSchema = z.object({
  nomeAzienda: z.string(),
  settore: z.string(),
  piattaforma: z.object({ label: z.string(), istruzioni: z.string() }),
  tono: z.object({ label: z.string(), descrizione: z.string() }),
  argomento: z.string(),
});

export const generateSocialPost = async (input) => {
  const prompt = ai.definePrompt({
    name: 'generatePostPrompt',
    input: { schema: GeneratePostInputSchema },
    prompt: `Sei un esperto SMM per AD next lab. Genera un post per {{{nomeAzienda}}}...`,
  });
  const { output } = await prompt(input);
  return output;
};
```

---

## 5. Security Rules (firestore.rules)
*(Attualmente in modalità di test nucleare per debug)*
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

---

## 6. Business Logic: Workflow e Crediti
- **Workflow (7 stati)**: `bozza` -> `revisione_interna` -> `da_approvare` -> `revisione` -> `approvato` -> `programmato` -> `pubblicato`.
- **Sistema Crediti**: Ogni post creato decrementa il saldo `post_totali - post_usati`. L'eliminazione di una bozza riaccredita il punto.
- **Gestione Asset**: Limite hardware di 50MB per upload diretto. Oltre tale soglia, il sistema utilizza riferimenti a link esterni (Drive/WeTransfer) salvati nel metadato `link_esterno`.

---
*Documento generato per audit tecnico - Versione 1.1*
