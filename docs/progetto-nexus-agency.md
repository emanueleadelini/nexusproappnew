# Progetto AD next lab - Documentazione Tecnica e Funzionale

## 1. Descrizione Generale
Il CRM AD next lab è una piattaforma gestionale multi-tenant di livello enterprise progettata per la collaborazione avanzata tra agenzia di comunicazione e clienti. Il sistema centralizza la gestione del Piano Editoriale (PED), degli asset multimediali e del feedback in tempo reale.

## 2. Architettura Tecnologica
- **Frontend**: Next.js 15 (App Router).
- **Backend**: Firebase (Auth, Firestore).
- **AI**: Gemini 1.5 Flash via Genkit per la generazione assistita di copy strategico.
- **Styling**: Tailwind CSS con componenti ShadCN UI.

## 3. Struttura Dati e Ruoli (RBAC)

### 3.1 Gerarchia Utenti e Permessi
Il sistema implementa un controllo degli accessi basato sui ruoli (RBAC) a 4 livelli:
- **Super Admin**: Controllo totale su sistema, configurazioni, clienti e fatturazione.
- **Operatore**: Gestione operativa quotidiana dei post, degli asset e delle campagne per tutti i clienti.
- **Referente (Cliente)**: Responsabile decisionale per l'azienda cliente. Può approvare post e richiedere revisioni.
- **Collaboratore (Cliente)**: Visualizzazione del calendario e caricamento asset senza poteri di approvazione finale.

### 3.2 Workflow Post a 7 Stati
Per garantire la massima qualità, ogni post segue un percorso rigido:
1. `bozza`: In lavorazione interna.
2. `revisione_interna`: Review tra colleghi in agenzia.
3. `da_approvare`: Visibile al cliente per approvazione.
4. `revisione`: Il cliente ha richiesto modifiche (blocca il post).
5. `approvato`: Confermato dal cliente.
6. `programmato`: In attesa di pubblicazione.
7. `pubblicato`: Archivio storico.

## 4. Logiche di Business Core

### 4.1 Gestione Crediti Post
Ogni cliente ha un limite mensile di post definito nel piano. Il sistema scala un credito alla creazione del post e lo riaccredita automaticamente in caso di eliminazione della bozza.

### 4.2 Collaborazione Real-time
- **Sistema Commenti**: Ogni post ha una sidebar dedicata per discussioni contestuali tra agenzia e cliente.
- **Centro Notifiche**: Notifiche istantanee in-app per cambi di stato, nuovi commenti o caricamento materiali.
- **Versioning**: Ogni modifica al copy genera una nuova versione, permettendo di tracciare l'evoluzione del contenuto.

### 4.3 Gestione Asset e Limiti
- **Upload Diretto**: Supportato per file fino a **50MB** (immagini, brevi video, documenti).
- **Link Esterni**: Obbligatori per file pesanti (>50MB) tramite integrazione link (WeTransfer, Drive, ecc.).
- **Archivio Separato**: Gli asset sono divisi tra "Inviati da Agenzia" e "Inviati da Cliente" per una chiarezza totale sulle responsabilità.

## 5. Sicurezza e Multi-tenancy
Le **Security Rules** di Firestore proteggono i dati garantendo che:
- Gli operatori dell'agenzia vedano i dati di tutti i clienti.
- Gli utenti cliente accedano esclusivamente ai dati associati al proprio `cliente_id`.
- Le transizioni di stato sensibili (es. approvazione) siano permesse solo ai ruoli corretti.

---
*Documento aggiornato automaticamente allo stato corrente dello sviluppo (Sprint 2).*