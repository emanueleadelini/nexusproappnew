# Nexus Pro (AD Next Lab) - v10.2

Hub Digitale SaaS per la gestione strategica della comunicazione tra agenzia e clienti.

## Repository Ufficiale
**URL**: `https://github.com/emanueleadelini/Nexuspro.git`

## Documentazione per Ingegneri
Per una comprensione profonda dell'architettura e per il passaggio alla fase di produzione, consultare la cartella `/docs`:

1. [Checkup Lancio 100%](./docs/CHECKUP-STATUS.md) - Stato attuale, moduli attivi e To-Do per la produzione.
2. [Guida Tecnica Master](./docs/MASTER-TECHNICAL-GUIDE.md) - Panoramica dello stack (Next.js 15, Genkit, Identity-Aware v10.2).
3. [Setup GitHub](./docs/GITHUB-SETUP.md) - Istruzioni per il collegamento e il push del codice.
4. [Specifiche Data Model](./docs/DATA-MODEL-SPEC.md) - Struttura Firestore e Multi-tenancy.
5. [Ingegneria AI](./docs/AI-ENGINEERING.md) - Prompt Strategy e Brand DNA Mapping.

## Setup Rapido Git (Per Admin)
Esegui questi comandi nel terminale di Firebase Studio per collegare il repository:
```bash
git init
git remote add origin https://github.com/emanueleadelini/Nexuspro.git
git add .
git commit -m "primo push del progetto"
git branch -M main
git push -u origin main
```

## Configurazione Iniziale App
1. Inizializzare l'admin tramite la pagina `/setup-admin` (Key: `nexus2024`).
2. Creare i tenant dall'area Admin. Tutte le sezioni (Contratto, Visual, Offline) sono attive di default.
3. Configurare il Brand DNA per ogni cliente per abilitare la generazione AI strategica.

---
*Proprietà Intellettuale - AD Next Lab - 2024*
