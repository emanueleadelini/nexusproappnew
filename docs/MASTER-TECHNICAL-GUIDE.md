# Nexus Pro - Master Technical Guide v10.0

## 1. Visione Generale
Nexus Pro è un'applicazione SaaS Multi-tenant progettata per AD Next Lab. Gestisce il workflow di comunicazione digitale tra agenzia e clienti, integrando intelligenza artificiale generativa per il copywriting strategico.

## 2. Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Linguaggio**: TypeScript
- **Frontend**: React 19, Tailwind CSS
- **Componenti**: ShadCN UI (Radix Primitives)
- **Backend-as-a-Service**: Firebase (Auth, Firestore)
- **AI Engine**: Genkit 1.x con Google Gemini 2.5 Flash
- **Drag & Drop**: @dnd-kit (per il Calendario Visuale)

## 3. Architettura Identity-Aware
La piattaforma utilizza un sistema di gating rigoroso:
- **Admin Root**: `emanueleadelini@gmail.com` (Unico utente con privilegi di Super Admin).
- **Tenant Isolation**: Ogni utente non-admin è legato a un `cliente_id` nel proprio profilo Firestore. Tutte le query sono filtrate per questo ID.
- **Role-Based Access Control (RBAC)**:
  - `super_admin`: Accesso totale a dashboard, analytics e gestione tenant.
  - `referente`: Il cliente principale, può approvare post e caricare asset.
  - `collaboratore`: Visualizzazione limitata e feedback.

## 4. Moduli Strategici
- **Workflow Post**: Gestione stati (bozza -> da approvare -> approvato -> programmato -> pubblicato).
- **Silenzio Assenso**: Logica di approvazione automatica (24h) gestibile via UI.
- **Hub Assets**: Archivio centralizzato per Contratti, Visual Identity e Materiali Offline.
- **AI Brand Training**: Sistema di "DNA Mapping" per addestrare i modelli LLM sullo stile comunicativo specifico di ogni cliente.

## 5. Directory Map
- `src/app/admin`: Dashboard gestionale agenzia.
- `src/app/cliente`: Portale riservato per i tenant.
- `src/firebase/`: Core logic, hook personalizzati (`useCollection`, `useDoc`) e provider.
- `src/ai/flows/`: Definizione dei flussi Genkit per la generazione post e calendari.
- `src/components/admin/`: Componenti UI per la gestione tenant.
