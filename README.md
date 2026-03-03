# Nexus Pro (AD Next Lab)

Hub Digitale SaaS per la gestione strategica della comunicazione.

## Repository Ufficiale
**URL**: `https://github.com/emanueleadelini/Nexuspro.git`

## Documentazione per Ingegneri
Per una comprensione profonda dell'architettura, consultare la cartella `/docs`:

1. [Guida Tecnica Master](./docs/MASTER-TECHNICAL-GUIDE.md) - Panoramica e Stack.
2. [Setup GitHub](./docs/GITHUB-SETUP.md) - Istruzioni per il collegamento al repository.
3. [Specifiche Data Model](./docs/DATA-MODEL-SPEC.md) - Struttura Firestore.
4. [Logica Security Rules](./docs/SECURITY-RULES-LOGIC.md) - Permessi e Multi-tenancy.
5. [Ingegneria AI](./docs/AI-ENGINEERING.md) - Genkit e Prompt Strategy.

## Setup Rapido
1. Inizializzare l'admin principale tramite la pagina `/setup-admin` (Key: `nexus2024`).
2. Collegare il repository locale:
   ```bash
   git init
   git remote add origin https://github.com/emanueleadelini/Nexuspro.git
   git add .
   git commit -m "Initial commit: Nexus Pro v10.1"
   git push -u origin main
   ```
3. Creare i tenant dall'area Admin.
4. Configurare il Brand DNA per ogni cliente per abilitare la generazione AI strategica.

---
*Proprietà Intellettuale - AD Next Lab*
