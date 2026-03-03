# Nexus Pro - Master Technical Guide v10.1

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

## 3. Source Control
- **Repository Ufficiale**: `https://github.com/emanueleadelini/Nexuspro.git`
- **Guida Setup**: Vedere [GITHUB-SETUP.md](./GITHUB-SETUP.md)

## 4. Architettura Identity-Aware v10.1
La piattaforma utilizza un sistema di gating rigoroso per garantire la sicurezza multi-tenant:
- **Tenant Isolation**: Ogni utente è legato a un `cliente_id` nel proprio profilo Firestore. Tutte le query sono filtrate per questo ID tramite l'oggetto `userData` nel `FirebaseProvider`.
- **Role-Based Access Control (RBAC)**:
  - `super_admin`: (emanueleadelini@gmail.com) Accesso totale.
  - `referente`: Il cliente principale, può approvare post e consultare asset.
  - `collaboratore`: Visualizzazione limitata.

## 5. Moduli Strategici
- **Workflow Post**: Gestione stati (bozza -> da approvare -> approvato -> programmato -> pubblicato).
- **Hub Assets**: Archivio centralizzato suddiviso per Contratto, Visual Identity e Materiali Offline (**Bigliettini, Gadget, Brochure, ecc.**).
- **AI Brand Training**: Sistema di "DNA Mapping" per addestrare i modelli LLM sullo stile comunicativo specifico di ogni cliente.

## 6. Documentazione Collegata
- [Specifiche Data Model](./DATA-MODEL-SPEC.md)
- [Logica Security Rules](./SECURITY-RULES-LOGIC.md)
- [Ingegneria AI](./AI-ENGINEERING.md)
