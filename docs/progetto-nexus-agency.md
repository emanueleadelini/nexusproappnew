# AD Next Lab - Documentazione Tecnica Master (V2.0)

Questo documento è destinato all'analisi ingegneristica e descrive l'architettura completa della piattaforma CRM/PED.

## 1. Architettura di Sistema
Il sistema è una Single Page Application (SPA) multi-tenant basata su **Next.js 15 (App Router)** e **Firebase 11**.

### Stack Tecnologico
- **Frontend**: React 19, Tailwind CSS, ShadCN UI.
- **Backend-as-a-Service**: Firebase Firestore, Auth.
- **AI Engine**: Genkit 1.x + Google Gemini 2.5 Flash.
- **State Management**: Real-time snapshots (Firestore SDK).

## 2. Modello Dati (Firestore Schema)

### 2.1 Utenti e Permessi (`/users/{uid}`)
Il sistema utilizza un modello RBAC a 4 livelli gestito tramite Firestore e Custom Claims.
```typescript
interface UserProfile {
  uid: string;
  email: string;
  ruolo: 'super_admin' | 'operatore' | 'referente' | 'collaboratore';
  cliente_id?: string; // Solo per referente/collaboratore
  permessi: string[];
  creatoIl: Timestamp;
}
```

### 2.2 Clienti (`/clienti/{clienteId}`)
Gestione tenant e budget post.
```typescript
interface Client {
  nome_azienda: string;
  settore: string;
  post_totali: number; // Budget mensile
  post_usati: number;  // Conteggio post creati
  richiesta_upgrade: boolean;
}
```

### 2.3 Post e Workflow (`/clienti/{id}/post/{id}`)
Workflow a 7 stati: `bozza` -> `revisione_interna` -> `da_approvare` -> `revisione` -> `approvato` -> `programmato` -> `pubblicato`.
```typescript
interface Post {
  titolo: string;
  testo: string;
  stato: StatoPost;
  piattaforma: 'instagram' | 'facebook' | 'linkedin' | 'tiktok' | 'twitter' | 'pinterest' | 'google_business';
  formato: 'immagine_singola' | 'carosello' | 'video' | 'reel' | 'story' | 'testo';
  data_pubblicazione: Timestamp;
  materiale_id: string; // Ref ad asset
  versione_corrente: number;
  versioni: Array<Versione>; // Storico modifiche testo
  storico_stati: Array<Stato>; // Storico transizioni
}
```

## 3. Logica di Sicurezza (Security Rules)
Le regole di Firestore implementano il multi-tenancy e il fallback dei permessi.
- **Agenzia (super_admin/operatore)**: Accesso trasversale a tutti i clienti.
- **Cliente (referente/collaboratore)**: Accesso isolato tramite `cliente_id`.
- **Integrità Notifiche**: Le query di listing devono obbligatoriamente filtrare per `destinatario_uid`.

## 4. Integrazione AI (Genkit Flow)
La generazione dei contenuti utilizza un flow server-side che inietta il contesto aziendale nel prompt.
- **Input**: Nome azienda, settore, tono di voce, argomento.
- **Output**: Titolo interno e copy del post ottimizzato per la piattaforma scelta.

## 5. Gestione Asset e Materiali
- **Storage**: Caricamento diretto fino a 50MB.
- **External Linking**: Supporto per file pesanti (>50MB) tramite URL WeTransfer/Drive integrati nel workflow di approvazione.

## 6. Sistema di Collaborazione Real-time
Ogni post contiene una sub-collezione `commenti` che permette:
- Discussioni contestuali.
- Richieste di revisione bloccanti (il post torna in stato `revisione`).
- Notifiche push immediate al destinatario interessato.
