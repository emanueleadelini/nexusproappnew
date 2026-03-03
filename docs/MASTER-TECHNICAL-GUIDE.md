# Nexus Pro - Master Technical Guide v10.3

## 1. Visione Generale
Nexus Pro è un'applicazione SaaS Multi-tenant progettata per AD Next Lab. Gestisce il workflow di comunicazione digitale tra agenzia e clienti, integrando intelligenza artificiale generativa per il copywriting strategico.

## 2. Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Linguaggio**: TypeScript
- **Frontend**: React 19, Tailwind CSS
- **Componenti**: ShadCN UI (Radix Primitives)
- **Backend-as-a-Service**: Firebase (Auth, Firestore)
- **AI Engine**: Genkit 1.x con Google Gemini 2.5 Flash

## 3. Architettura Identity-Aware v10.2 (Stato: STABILE)
La piattaforma utilizza un sistema di gating rigoroso per garantire la sicurezza multi-tenant:
- **Tenant Isolation**: Ogni utente è legato a un `cliente_id` nel proprio profilo Firestore. Tutte le query sono filtrate per questo ID.
- **Prevenzione Errori**: Gli hook `useCollection` e `useDoc` bloccano query verso path non validi.
- **Role-Based Access Control (RBAC)**:
  - `super_admin`: Accesso totale.
  - `referente`: Il cliente principale (approvazione e consultazione).
  - `collaboratore`: Visualizzazione limitata.

## 4. Manifest del Progetto (File Chiave)
Ecco dove trovare il codice principale per l'analisi:

### Core & Layout
- `src/app/layout.tsx`: Root del progetto con Firebase Provider.
- `src/firebase/provider.tsx`: Gestione globale dello stato utente e tenant.

### Area Admin (Agenzia)
- `src/app/admin/page.tsx`: Dashboard direzionale.
- `src/app/admin/clienti/[clienteId]/page.tsx`: Gestione specifica del tenant (Workflow, AI, Assets).
- `src/components/admin/genera-bozza-modal.tsx`: Motore di generazione post e calendari AI.

### Area Cliente (Hub Riservato)
- `src/app/cliente/page.tsx`: Area riservata speculare all'admin (Workflow, Calendario, Assets).
- `src/components/feed-instagram-preview.tsx`: Motore di rendering anteprima social.

### Ingegneria AI
- `src/ai/genkit.ts`: Configurazione engine Gemini.
- `src/ai/flows/generate-post-ai-flow.ts`: Logica dei prompt strategici e calendari.

### Sicurezza & Data
- `firestore.rules`: Regole di sicurezza Identity-Aware.
- `docs/backend.json`: Definizione schemi entità e percorsi Firestore.

---
*Aggiornato: 2024 - Nexus Pro Engineering Team*