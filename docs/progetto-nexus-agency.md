# Nexus Agency - Specifica Tecnica Master (Source Code Snapshot)

## 1. Architettura di Sistema
Il CRM è costruito su uno stack **Next.js 15 (App Router)** con integrazione profonda di **Firebase 11**. La logica di business è guidata da un sistema **Multi-tenant** con isolamento dei dati basato su `cliente_id`.

### Stack Tecnologico
- **Frontend**: React 19, Tailwind CSS, ShadCN UI, Lucide Icons.
- **Backend**: Firebase Firestore (NoSQL), Firebase Authentication (JWT/RBAC).
- **AI Engine**: Genkit 1.x con Google Gemini 2.5 Flash per la generazione dei contenuti.
- **Gestione Stato**: React Hooks + Firestore Real-time Snapshots.

## 2. Modelli Dati Core (TypeScript)

### 2.1 Post Social (Workflow a 7 Stati)
Il cuore della piattaforma è il workflow del post, progettato per eliminare frizioni tra agenzia e cliente.
```typescript
type StatoPost = 'bozza' | 'revisione_interna' | 'da_approvare' | 'revisione' | 'approvato' | 'programmato' | 'pubblicato';

interface Post {
  id: string;
  titolo: string;
  testo: string;
  stato: StatoPost;
  piattaforma: "instagram" | "facebook" | "linkedin" | "tiktok" | "twitter" | "pinterest" | "google_business";
  formato: "immagine_singola" | "carosello" | "video" | "reel" | "story" | "testo";
  data_pubblicazione: Timestamp | null;
  materiale_id?: string | null;
  versione_corrente: number;
  versioni: Array<{
    testo: string;
    titolo: string;
    autore_uid: string;
    autore_nome: string;
    timestamp: Timestamp;
  }>;
  storico_stati: Array<{
    stato: StatoPost;
    autore_uid: string;
    timestamp: Timestamp;
    nota?: string;
  }>;
}
```

### 2.2 Utente e RBAC (4 Livelli)
Il sistema utilizza un modello di permessi granulare (`src/types/user.ts`):
- **super_admin**: Accesso totale, gestione piani e fatturazione.
- **operatore**: Gestione post e asset per tutti i clienti.
- **referente (Cliente)**: Approvazione post, caricamento materiali, gestione ticket.
- **collaboratore (Cliente)**: Solo visualizzazione e caricamento asset.

## 3. Logiche di Sicurezza (Firestore Rules)
Le regole utilizzano un sistema di **fallback documentale**. Se i Custom Claims non sono presenti nel token JWT, la regola legge direttamente il profilo utente per validare l'accesso.
```javascript
function getUserRole() {
  return request.auth.token.ruolo != null
    ? request.auth.token.ruolo
    : get(/databases/$(database)/documents/users/$(request.auth.uid)).data.ruolo;
}
```

## 4. Motore AI (Genkit & Gemini)
L'IA non genera solo testo, ma agisce come un esperto di comunicazione. Utilizziamo **Genkit Flows** per iniettare il contesto aziendale nei prompt (`src/ai/flows/generate-post-ai-flow.ts`).

### Prompt Strategico:
```handlebars
Sei un social media manager esperto per AD next lab.
CLIENTE: {{{nomeAzienda}}}
SETTORE: {{{settore}}}
PIATTAFORMA: {{{piattaforma.label}}}
TONO: {{{tono.label}}} ({{{tono.descrizione}}})
ARGOMENTO: {{{argomento}}}
```

## 5. Workflow Operativo
1. **Creazione**: L'agenzia crea una `bozza`.
2. **Review Interna**: Passaggio opzionale tra operatori agenzia.
3. **Approvazione**: Il post viene inviato al cliente (`da_approvare`).
4. **Feedback**: Il cliente può approvare o richiedere una `revisione`. In caso di revisione, viene aperta la sidebar dei commenti real-time.
5. **Programmazione**: Una volta approvato, l'agenzia imposta data/ora (`programmato`).

## 6. Gestione Asset
- **Limiti**: Supporto diretto fino a 50MB per file tramite caricamento immediato.
- **Link Esterni**: Integrazione con WeTransfer/Drive per file pesanti (Video RAW).
- **Validazione**: Workflow dedicato per l'approvazione degli asset grafici.

## 7. Sistema Notifiche e Collaborazione
- **Notifiche**: Gestite tramite collezione `notifiche` con query filtrate obbligatoriamente per `destinatario_uid` per privacy e performance.
- **Commenti**: Ogni post ha una collezione sub-level `commenti` per discussioni contestuali, riducendo l'uso di email/whatsapp.

---
*Documento generato per analisi tecnica degli ingegneri - Sprint 2 Completato*
