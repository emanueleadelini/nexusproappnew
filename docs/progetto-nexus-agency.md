# AD Next Lab - Manuale Tecnico Master (Nexus Agency)

Questo documento contiene l'analisi ingegneristica completa, l'architettura e il codice sorgente logico della piattaforma AD Next Lab aggiornato allo Sprint 3.

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

### 3.3 AI Flow: Generazione Post
Utilizza Gemini 2.5 Flash per trasformare prompt in copy ottimizzato per piattaforma (Instagram, LinkedIn, etc.) e tono di voce.

---

## 4. Stato del Progetto

- **Sprint 1 (Fondamenta)**: COMPLETATO. Architettura, Auth e RBAC.
- **Sprint 2 (Content AI)**: COMPLETATO. Generazione post con Gemini e gestione Asset.
- **Sprint 3 (Produttività)**: COMPLETATO. Calendario visuale con Drag-and-Drop.
- **Sprint 4 (Analytics)**: PENDENTE. Reportistica avanzata sull'utilizzo dei crediti.

---
*Documento generato per audit tecnico - Versione 2.1*