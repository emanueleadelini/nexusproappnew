# AD Next Lab - Manuale Tecnico Master

Questo documento contiene l'analisi ingegneristica completa, l'architettura e il codice sorgente logico della piattaforma AD Next Lab. È destinato all'uso esclusivo del team ingegneristico per audit e sviluppo.

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
- `cliente_id`: Collega l'utente (referente/collaboratore) a una specifica azienda.
- `permessi`: Array di stringhe per granularità fine (es. `creazione_post`, `uso_ai`).

### 2.2 Client (`/clienti/{clienteId}`)
Gestione dell'azienda cliente e dei crediti.
- `post_totali`: Budget mensile di post.
- `post_usati`: Contatore dei post creati.
- `richiesta_upgrade`: Flag per segnalare necessità di post extra.

### 2.3 Post (`/clienti/{clienteId}/post/{postId}`)
Contenuto strategico con workflow a 7 stati.
- **Stati**: `bozza` -> `revisione_interna` -> `da_approvare` -> `revisione` -> `approvato` -> `programmato` -> `pubblicato`.
- `piattaforma`: Instagram, LinkedIn, Facebook, TikTok, X, Pinterest, Google Business.
- `versione_corrente`: Indice dell'ultima versione del copy salvata nell'array `versioni`.

---

## 3. Logiche di Business Core

### 3.1 Sistema Crediti
Ogni post creato incrementa `post_usati`. L'eliminazione di un post in stato `bozza` riaccredita il punto. Il sistema impedisce la creazione oltre il limite `post_totali`.

### 3.2 Gestione Asset (Asset Strategy)
- **Limite Hardware**: Upload diretto limitato a 50MB per file tramite Cloud Storage.
- **Video & File Pesanti**: Per file > 50MB, il sistema supporta `link_esterno` (Drive/WeTransfer) memorizzato nel documento `Material`.
- **Validazione**: Gli asset caricati dal cliente entrano in stato `in_attesa` e devono essere validati dall'agenzia prima dell'uso.

---

## 4. Codice Sorgente Logico (Core Snippets)

### 4.1 Security Rules (V5 - Robust Mode)
Le regole utilizzano un sistema di fallback a 3 livelli: Token JWT, Hardcoded UID e Firestore Get.
```javascript
function getUserRole() {
  return request.auth.token.ruolo != null
    ? request.auth.token.ruolo
    : (exists(/databases/$(database)/documents/users/$(request.auth.uid)) 
        ? get(/databases/$(database)/documents/users/$(request.auth.uid)).data.ruolo 
        : 'guest');
}
```

### 4.2 Custom Hook: useCollection
Gestione centralizzata della reattività e degli errori di permesso con propagazione globale tramite `errorEmitter`.

### 4.3 AI Flow: Generazione Post
Utilizza Gemini 2.5 Flash per trasformare i requisiti del cliente in copy strategico, adattando tono di voce e lunghezza alla piattaforma specifica (Instagram, LinkedIn, etc.).

---
*Documento generato per audit tecnico - Versione 1.5*
