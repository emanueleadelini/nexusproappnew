# AD next lab - Documentazione Tecnica e Funzionale (Master Plan)

## 1. Visione del Progetto
**AD next lab** è un ecosistema CRM SaaS progettato per automatizzare e professionalizzare la collaborazione tra agenzie di comunicazione e i loro clienti. Il sistema centralizza la gestione del Piano Editoriale (PED), la validazione degli asset multimediali e la generazione di contenuti assistita da AI, garantendo sicurezza multi-tenant e tracciabilità totale tramite versioning.

## 2. Architettura Tecnologica
- **Frontend**: Next.js 15 (App Router) con React 19 e TypeScript.
- **Backend**: Firebase 11 (Authentication, Firestore, Cloud Storage).
- **Styling**: Tailwind CSS + ShadCN UI (Design System professionale e accessibile).
- **AI Engine**: Google Gemini 2.5 Flash via Genkit (Prompt Engineering contestuale).
- **Stato**: Real-time tramite Firestore Snapshots (Notifiche e Commenti).

## 3. Modello Dati Firestore (Specifiche Tecniche)

### 3.1 Utenti (`users/{uid}`)
Implementa un sistema RBAC a 4 livelli:
- `ruolo`: `super_admin`, `operatore`, `referente`, `collaboratore`.
- `permessi`: Array di stringhe per controllo granulare delle azioni UI.
- `cliente_id`: Stringa di associazione per l'isolamento dei dati (Multi-tenancy).

### 3.2 Clienti (`clienti/{clienteId}`)
- `post_totali`: Crediti mensili inclusi nel piano.
- `post_usati`: Contatore automatico dei post creati nel periodo.
- `richiesta_upgrade`: Flag per segnalazione automatica all'agenzia.

### 3.3 Post Strategici (`clienti/{clienteId}/post/{postId}`)
Ogni post è un'entità complessa che supporta:
- `piattaforma`: Instagram, Facebook, LinkedIn, TikTok, ecc.
- `formato`: Reel, Story, Carosello, Immagine Singola, Testo.
- `stato`: Workflow a 7 fasi (`bozza`, `revisione_interna`, `da_approvare`, `revisione`, `approvato`, `programmato`, `pubblicato`).
- `versioni`: Storico completo delle modifiche al testo (Audit Trail).
- `storico_stati`: Tracciamento di chi ha cambiato lo stato e quando.

### 3.4 Asset e Materiali (`clienti/{clienteId}/materiali/{materialeId}`)
- **Limite Caricamento**: Supporto diretto fino a **50MB** (Storage ottimizzato).
- **Link Esterni**: Supporto per file pesanti via Drive/WeTransfer per mantenere alte le performance.
- **Validazione**: Workflow di approvazione materiali con feedback contestuale.

### 3.5 Notifiche (`notifiche/{notificaId}`)
Sistema di eventi real-time filtrati per `destinatario_uid`. Tipi supportati: `commento_nuovo`, `post_da_approvare`, `materiale_caricato`.

## 4. Logiche di Business Core

### 4.1 Workflow di Approvazione Rigido
Il sistema impedisce salti di stato non autorizzati:
1. L'Agenzia sposta in `da_approvare`.
2. Il Cliente (Referente) può solo scegliere tra `approvato` o `revisione`.
3. Se in `revisione`, il sistema obbliga l'inserimento di una nota e apre la sidebar dei commenti.

### 4.2 Assistente AI Strategico
Gemini è configurato per agire come Social Media Manager di **AD next lab**. I prompt sono ottimizzati per:
- Generare bozze basate su piattaforma e tono di voce.
- Inserire automaticamente emoji e hashtag pertinenti.
- Rispettare i vincoli di caratteri delle diverse piattaforme.

### 4.3 Sistema Crediti
Il numero di post creati è vincolato ai `post_totali` definiti nel piano del cliente. Il sistema avvisa automaticamente l'admin quando un cliente raggiunge l'80% di utilizzo dei crediti.

## 5. Sicurezza e Privacy
- **Isolamento Totale**: Un cliente non può mai visualizzare dati, post o materiali appartenenti ad un altro `cliente_id`.
- **Security Rules**: La validazione avviene a livello server (Firestore) verificando l'identità dell'utente e il suo ruolo nel token JWT.
- **Protezione Asset**: Solo gli utenti associati all'azienda possono accedere ai file caricati nel Cloud Storage.

---
*Documento aggiornato al: Marzo 2024 - Sprint 2 Completo*