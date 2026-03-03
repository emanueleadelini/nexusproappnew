# Nexus Pro - Master Technical Guide v10.2

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
- **Branch Principale**: `main`
- **Messaggio Commit Iniziale**: `git commit -m "primo push del progetto"`

## 4. Architettura Identity-Aware v10.2 (Stato: STABILE)
La piattaforma utilizza un sistema di gating rigoroso per garantire la sicurezza multi-tenant:
- **Tenant Isolation**: Ogni utente è legato a un `cliente_id` nel proprio profilo Firestore. Tutte le query sono filtrate per questo ID tramite l'oggetto `userData` nel `FirebaseProvider`.
- **Prevenzione Errori**: Gli hook `useCollection` e `useDoc` includono una guardia che blocca query contenenti UID Firebase al posto di `cliente_id`.
- **Role-Based Access Control (RBAC)**:
  - `super_admin`: (emanueleadelini@gmail.com) Accesso totale.
  - `referente`: Il cliente principale, può approvare post e consultare asset.
  - `collaboratore`: Visualizzazione limitata.

## 5. Moduli Strategici & Feature Flags
- **Workflow Post**: Gestione stati (bozza -> da approvare -> approvato -> programmato -> pubblicato).
- **Hub Assets**: Archivio centralizzato suddiviso per Contratto, Visual Identity e Materiali Offline (**Bigliettini, Gadget, Brochure, ecc.**).
- **Feature Flags**: L'Admin può attivare/disattivare i moduli Contratto, Visual e Offline per ogni singolo tenant tramite il pannello "Modifica Piano".

## 6. Documentazione Collegata
- [Specifiche Data Model](./DATA-MODEL-SPEC.md)
- [Logica Security Rules](./SECURITY-RULES-LOGIC.md)
- [Ingegneria AI](./AI-ENGINEERING.md)
- [Checkup Lancio 100%](./CHECKUP-STATUS.md)