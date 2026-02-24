# AD next lab - Documentazione Tecnica e Funzionale Completa

## 1. Visione del Progetto
**AD next lab** è un CRM avanzato progettato per centralizzare la collaborazione tra l'agenzia di comunicazione e i suoi clienti. Il sistema gestisce l'intero ciclo di vita del Piano Editoriale (PED), dalla pianificazione strategica assistita da AI alla validazione degli asset multimediali, garantendo trasparenza, controllo granulare e versioning dei contenuti.

## 2. Architettura Tecnologica
- **Frontend**: Next.js 15 (App Router) - Utilizzo di Server Components per performance e Client Components per interattività.
- **Backend**: Firebase 11.
  - **Authentication**: Gestione accessi sicuri tramite email/password. Supporto per Custom Claims (ruolo, cliente_id).
  - **Firestore**: Database NoSQL real-time per post, materiali, commenti e notifiche.
- **AI Engine**: Google Gemini 2.5 Flash via Genkit. Generazione copy ottimizzata per piattaforma, tono di voce e requisiti specifici del brand.
- **UI Framework**: Tailwind CSS + ShadCN UI. Design professionale, responsive e accessibile con font 'Space Grotesk' e 'Inter'.

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
- `piattaforma`: Destinazione social (Instagram, Facebook, LinkedIn, ecc.).
- `formato`: Tipologia contenuto (Reel, Immagine, Carosello, ecc.).
- `data_pubblicazione`: Timestamp previsto per l'uscita.
- `versione_corrente`: Indice della versione attiva.
- `versioni`: Array contenente lo storico di ogni modifica al testo per audit e rollback.
- `storico_stati`: Tracciamento cronologico di ogni cambio di stato (chi, quando, note).

### 3.4 Materiali (`clienti/{clienteId}/materiali/{materialId}`)
- `nome_file`: Nome originale del file.
- `url_storage`: Riferimento al Cloud Storage (limite rigoroso 50MB).
- `link_esterno`: Supporto per link Drive/WeTransfer per file pesanti (>50MB).
- `stato_validazione`: `in_attesa`, `validato`, `rifiutato`.
- `destinazione`: `social`, `sito`, `offline`.

### 3.5 Notifiche (`notifiche/{notificaId}`)
- `tipo`: Categoria dell'evento (commento, approvazione, upload).
- `messaggio`: Testo della notifica.
- `destinatario_uid`: UID dell'utente che deve ricevere l'avviso.
- `letta`: Stato di visualizzazione.

## 4. Funzionalità Core

### 4.1 Workflow di Approvazione a 7 Stati
Il sistema implementa una matrice di transizioni rigida per garantire la qualità:
1.  **Agenzia**: Crea il post (`bozza`), esegue la `revisione_interna` e lo invia al cliente (`da_approvare`).
2.  **Cliente (Referente)**: Può approvare il post (`approvato`) o richiedere una `revisione` specificando le note.
3.  **Agenzia**: Se approvato, procede alla programmazione (`programmato`) e alla pubblicazione finale (`pubblicato`).

### 4.2 Collaborazione Real-time e Feedback
- **Sidebar Commenti**: Ogni post include una chat sincronizzata in tempo reale per feedback contestuali.
- **Centro Notifiche**: Una campanella avvisa istantaneamente gli utenti di nuovi commenti o azioni richieste.
- **Versioning**: Ogni modifica salva una versione, permettendo di confrontare i testi e prevenire la perdita di dati.

### 4.3 Assistente AI Strategico
Integrato direttamente nel flusso di creazione, l'assistente AI (Gemini) permette di:
- Generare bozze partendo da piattaforma, tono di voce e argomento.
- Ottimizzare il copy per massimizzare l'engagement.
- Assicurare la coerenza con il brand del cliente.

### 4.4 Gestione Asset e Limiti di Caricamento
- **Caricamento Diretto**: Supportato per file fino a **50MB** (Immagini, PDF, piccoli video).
- **Gestione Link**: Per file pesanti (Video 4K, cartelle), il sistema obbliga l'uso di link esterni, mantenendo l'infrastruttura veloce.

## 5. Sicurezza e Multi-tenancy
- **Isolamento Dati**: I clienti possono accedere esclusivamente ai dati del proprio `cliente_id`.
- **RBAC (Role Based Access Control)**: I permessi sono granulari e basati sui 4 livelli di ruolo definiti.
- **Validazione Server**: Le Security Rules verificano l'identità dell'utente e l'appartenenza aziendale per ogni singola operazione.

---
*Documento aggiornato al: 20 Febbraio 2024*