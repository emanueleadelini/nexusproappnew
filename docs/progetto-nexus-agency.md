# AD next lab - Documentazione Tecnica e Funzionale Completa

## 1. Visione del Progetto
**AD next lab** è un CRM avanzato progettato per centralizzare la collaborazione tra l'agenzia di comunicazione e i suoi clienti. Il sistema gestisce l'intero ciclo di vita del Piano Editoriale (PED), dalla pianificazione strategica assistita da AI alla validazione degli asset multimediali, garantendo trasparenza, controllo granulare e versioning dei contenuti.

## 2. Architettura Tecnologica
- **Frontend**: Next.js 15 (App Router) - Utilizzo di Server Components per performance e Client Components per interattività.
- **Backend**: Firebase 11.
  - **Authentication**: Gestione accessi sicuri tramite email/password.
  - **Firestore**: Database NoSQL real-time per post, materiali, commenti e notifiche.
- **AI Engine**: Google Gemini 2.5 Flash via Genkit. Generazione copy ottimizzata per piattaforma, tono di voce e requisiti specifici del brand.
- **UI Framework**: Tailwind CSS + ShadCN UI. Design "Dark Mode ready" professionale, responsive e accessibile.

## 3. Modello Dati (Firestore)

### 3.1 Utenti (`users/{uid}`)
- `email`: Indirizzo email dell'account.
- `ruolo`: Uno tra `super_admin`, `operatore`, `referente`, `collaboratore`.
- `cliente_id`: Associazione all'azienda (solo per utenti cliente).
- `permessi`: Array di stringhe che definiscono le azioni permesse.
- `nomeAzienda`: Nome visualizzato dell'azienda di appartenenza.

### 3.2 Clienti (`clienti/{clienteId}`)
- `nome_azienda`: Nome legale/commerciale.
- `settore`: Ambito operativo del cliente.
- `post_totali`: Crediti post mensili inclusi nel piano.
- `post_usati`: Numero di post creati nel mese corrente.
- `richiesta_upgrade`: Flag booleano per segnalare necessità di post extra.

### 3.3 Post (`clienti/{clienteId}/post/{postId}`)
- `titolo`: Titolo descrittivo interno.
- `testo`: Copy definitivo del post.
- `stato`: Workflow a 7 stati (`bozza`, `revisione_interna`, `da_approvare`, `revisione`, `approvato`, `programmato`, `pubblicato`).
- `piattaforma`: Destinazione social (IG, FB, LI, TikTok, ecc.).
- `formato`: Tipologia contenuto (Reel, Immagine, Carosello, ecc.).
- `data_pubblicazione`: Timestamp previsto per l'uscita.
- `versioni`: Storico completo di ogni modifica al testo per audit e rollback.
- `storico_stati`: Tracciamento di chi ha cambiato lo stato e quando.

### 3.4 Materiali (`clienti/{clienteId}/materiali/{materialId}`)
- `nome_file`: Nome originale del file.
- `url_storage`: Riferimento al Cloud Storage (limite 50MB).
- `link_esterno`: Supporto per link Drive/WeTransfer per file pesanti (>50MB).
- `stato_validazione`: `in_attesa`, `validato`, `rifiutato`.
- `destinazione`: `social`, `sito`, `offline`.

## 4. Funzionalità Core

### 4.1 Workflow di Approvazione a 7 Stati
Il sistema implementa una matrice di transizioni rigida:
1.  **Agenzia**: Crea il post (`bozza`), lo revisiona internamente e lo invia al cliente (`da_approvare`).
2.  **Cliente (Referente)**: Può approvare il post (`approvato`) o richiedere una revisione (`revisione`).
3.  **Agenzia**: Se approvato, procede alla programmazione (`programmato`) e alla pubblicazione finale (`pubblicato`).

### 4.2 Collaborazione Real-time
Ogni post include una **Sidebar Commenti** sincronizzata in tempo reale. Le notifiche (tramite la campanella in navbar) avvisano istantaneamente gli utenti di nuovi feedback, scadenze o approvazioni necessarie.

### 4.3 Assistente AI Strategico
Integrato direttamente nel flusso di creazione, l'assistente AI (Gemini) permette di:
- Generare bozze partendo da semplici requisiti.
- Ottimizzare il tono di voce in base al settore del cliente.
- Adattare il linguaggio alla piattaforma social selezionata.

### 4.4 Gestione Asset e Limiti
- **Caricamento Diretto**: Supportato per file fino a **50MB** per garantire reattività.
- **Gestione Link**: Per file video 4K o cartelle pesanti, è obbligatorio l'uso di link esterni, mantenendo l'archivio pulito e veloce.

## 5. Sicurezza e Multi-tenancy
Il sistema utilizza le **Firestore Security Rules** per garantire l'isolamento dei dati:
- I clienti possono vedere esclusivamente i dati associati al proprio `cliente_id`.
- Solo gli utenti con ruolo `super_admin` o `operatore` hanno accesso alla gestione globale.
- Ogni operazione di scrittura viene validata lato server per impedire scavalcamenti di ruolo.

---
*Documento aggiornato automaticamente il: 24 Maggio 2024*