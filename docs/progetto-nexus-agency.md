# Nexus Pro (AD Next Lab) - Manuale Tecnico Master v5.3

Documentazione definitiva per il lancio commerciale della piattaforma SaaS Nexus Agency.

---

## 1. Architettura SaaS & Multi-tenancy
Nexus Pro utilizza un'architettura **Tenant-per-Document** supportata da Firestore Security Rules.

### Isolamento Dati
Ogni cliente è un "Tenant" identificato da un `cliente_id`. 
- **Security Rules**: Bloccano qualsiasi query che non includa il filtro per il proprio `cliente_id`.
- **Siloing**: Le sottocollezioni `/clienti/{id}/post` garantiscono che i dati non siano mai mescolati.

---

## 2. Nexus Pro Features
### 2.1 Post Versioning (History)
A differenza dei normali PED, Nexus Pro traccia ogni modifica:
- Ogni volta che l'agenzia cambia un testo dopo il feedback del cliente, viene salvata una **snapshot** della versione precedente.
- Permette di ripristinare o confrontare i cambiamenti strategici.

### 2.2 Credit Refund System
Il sistema crediti è "Fair-Usage":
- I crediti vengono scalati alla creazione del post (`bozza`).
- Se l'agenzia o il cliente decidono di eliminare una bozza non utilizzata, il credito viene **riaccreditato istantaneamente**.
- I post `pubblicati` consumano il credito in modo definitivo.

### 2.3 Workflow Post "Ferreo" (7 Stati)
Il workflow è blindato per ruoli:
1. `bozza` (Interno Agenzia)
2. `revisione_interna` (Interno Agenzia)
3. `da_approvare` (Visibile al Cliente)
4. `revisione` (Richiesta dal Cliente)
5. `approvato` (Blindato, pronto per uscita)
6. `programmato` (In attesa)
7. `pubblicato` (Storico)

---

## 3. Gestione Ruoli (RBAC)
- **super_admin**: Controllo licenze, billing, setup agenzia.
- **operatore**: Produzione contenuti, uso IA, gestione calendari.
- **referente**: Approvazione post, upload asset, richiesta upgrade (Tenant Admin).
- **collaboratore**: Solo upload asset e commenti (Tenant User).

---

## 4. Sicurezza & Go-Live
### 4.1 Master Activation Key
La pagina `/setup-admin` è protetta da una chiave di licenza fisica (`nexus2024`) per impedire attacchi di tipo "First Admin Creation".

### 4.2 GDPR Compliance
- **Offboarding**: Funzione di esportazione JSON completa prima della cancellazione.
- **Data Deletion**: Cancellazione logica e fisica di tutti i dati associati al tenant.

---
*Documento di Proprietà Intellettuale - Nexus Pro - 2024*
