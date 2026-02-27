# AD Next Lab - Manuale Tecnico Master (Nexus Agency)

Questo documento contiene l'analisi ingegneristica completa, l'architettura e il codice sorgente logico della piattaforma AD Next Lab aggiornato allo Sprint 4. È destinato al team di sviluppo per la validazione pre-lancio e la valutazione della scalabilità SaaS.

---

## 1. Architettura di Sistema
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, ShadCN UI.
- **Backend**: Firebase 11 (Firestore, Authentication).
- **AI Engine**: Genkit 1.x con Gemini 2.5 Flash.
- **Pattern**: Multi-tenant basato su `cliente_id` con RBAC a 4 livelli: `super_admin`, `operatore`, `referente`, `collaboratore`.

---

## 2. Modelli Dati (Firestore)

### 2.1 UserProfile (`/users/{uid}`)
Definisce l'identità e i permessi dell'utente.
- `ruolo`: `super_admin`, `operatore`, `referente`, `collaboratore`.
- `cliente_id`: Collega l'utente a una specifica azienda cliente.
- `permessi`: Array di stringhe (es. `creazione_post`, `uso_ai`).

### 2.2 Client (`/clienti/{clienteId}`)
Gestione dell'azienda cliente e dei crediti.
- `post_totali`: Budget mensile di post.
- `post_usati`: Contatore dei post creati nel mese.

### 2.3 Post (`/clienti/{clienteId}/post/{postId}`)
Contenuto strategico con workflow a 7 stati.
- **Campi Core**: `titolo`, `testo`, `stato`, `piattaforma`, `formato`, `data_pubblicazione`.
- **Versioning**: Gestito tramite array `versioni` e `versione_corrente`.

---

## 3. Logiche di Business Core

### 3.1 Sistema Crediti
Ogni post creato incrementa `post_usati`. Il sistema impedisce la creazione se il limite è raggiunto, a meno di upgrade o permessi admin.

### 3.2 Calendario Drag-and-Drop
Implementato con `@dnd-kit`. Lo spostamento di un post sulla griglia aggiorna il campo `data_pubblicazione` su Firestore in modalità ottimistica.

### 3.3 Analytics & Reporting
Dashboard centralizzata per l'agenzia che aggrega l'utilizzo dei crediti e la saturazione dei piani per monitorare il fatturato e le necessità di upgrade dei clienti.

---

## 4. Codice Sorgente Logico (Core Artifacts)

### 4.1 Security Rules (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // TEST NUCLEARE: Accesso libero per debug ambiente Studio.
      // In produzione sostituire con RBAC basato su UID e ruolo.
      allow read, write: if true;
    }
  }
}
```

### 4.2 Inizializzazione Firebase (`src/firebase/index.ts`)
```typescript
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

export function initializeFirebase() {
  const apps = getApps();
  // Forza l'uso della config esplicita per evitare l'instradamento automatico di Studio verso l'emulatore.
  const firebaseApp = !apps.length ? initializeApp(firebaseConfig) : getApp();
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}
```

### 4.3 AI Post Generator Flow (`src/ai/flows/generate-post-ai-flow.ts`)
```typescript
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const generatePostPrompt = ai.definePrompt({
  name: 'generatePostPrompt',
  prompt: `Sei un social media manager esperto per AD next lab. Genera un post per {{{nomeAzienda}}} nel settore {{{settore}}}. Piattaforma: {{{piattaforma.label}}}. Tono: {{{tono.label}}}.`,
  // ... schema di output per titolo e testo
});
```

### 4.4 Definizione Tipi Post (`src/types/post.ts`)
```typescript
export type StatoPost = 'bozza' | 'revisione_interna' | 'da_approvare' | 'revisione' | 'approvato' | 'programmato' | 'pubblicato';
export interface Post {
  id: string;
  titolo: string;
  testo: string;
  stato: StatoPost;
  piattaforma: string;
  versione_corrente: number;
  storico_stati: Array<{ stato: string; timestamp: any }>;
}
```

---

## 5. Roadmap SaaS & Commercializzazione
1.  **Onboarding**: Implementata la creazione automatica di Client + User Referente.
2.  **Scalabilità**: La struttura multi-tenant permette di ospitare infiniti clienti senza interferenze.
3.  **Monetizzazione**: Il sistema a crediti (`post_totali`) è pronto per essere collegato a un gateway di pagamento (es. Stripe) per upgrade automatici.

---
*Documento generato per audit tecnico e go-live - Versione 3.0*