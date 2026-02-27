# Nexus Agency (AD Next Lab) - Manuale Tecnico Master v5.1

Questo documento rappresenta la documentazione definitiva per l'analisi tecnica e commerciale della piattaforma AD Next Lab. Progettata come soluzione SaaS multi-tenant per agenzie di comunicazione.

---

## 1. Architettura di Sistema
La piattaforma utilizza uno stack moderno basato su **Next.js 15**, **React 19** e **Firebase Cloud**.
- **Isolamento Multi-tenant**: Ogni cliente è identificato da un `cliente_id` univoco. Tutti i dati (Post, Materiali, Commenti) sono filtrati tramite questo ID.
- **RBAC (Role-Based Access Control)**:
  - `super_admin`: Controllo totale su sistema, clienti e fatturazione.
  - `operatore`: Produzione contenuti per tutti i clienti dell'agenzia.
  - `referente`: Manager lato cliente con poteri di approvazione e upload.
  - `collaboratore`: Visualizzatore lato cliente con possibilità di upload.

---

## 2. Sicurezza & Data Isolation (Firestore)
Le Security Rules (V5.1 Production) garantiscono che nessun utente possa leggere dati al di fuori del proprio perimetro.

### Logica Core (Rules):
```javascript
function isClientOf(clienteId) {
  return request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.cliente_id == clienteId;
}
```
Le regole applicano il principio del minimo privilegio:
- I **Clienti** leggono solo i documenti dove `cliente_id` coincide con il loro profilo.
- Gli **Operatori** accedono a tutti i tenant per la gestione operativa.
- I **Super Admin** gestiscono le configurazioni di sistema.

---

## 3. Workflow Operativi

### 3.1 Editorial Calendar (Sprint 3)
Sistema dinamico basato su `dnd-kit` per il riposizionamento dei post nel PED. Lo stato di un post segue un workflow a 7 stadi:
1. `bozza` -> 2. `revisione_interna` -> 3. `da_approvare` -> 4. `revisione` -> 5. `approvato` -> 6. `programmato` -> 7. `pubblicato`.

### 3.2 Credit System (Monetizzazione SaaS)
Ogni cliente ha un limite di `post_totali` mensili. Il sistema monitora i `post_usati` in tempo reale.
- **SaaS Readiness**: Predisposto per integrazione Stripe via Server Actions per l'acquisto di pacchetti post extra.

---

## 4. AI Post Generator Engine
Integrazione con **Gemini 2.5 Flash** tramite **Genkit 1.x**.
- **Prompt strategico**: L'IA genera copy personalizzati basati su settore, tono di voce e piattaforma social, garantendo coerenza di brand.

---

## 5. Analisi Tecnica per il Team
Tutti i componenti UI sono costruiti con **ShadCN UI** e **Tailwind CSS**. La gestione dello stato Firebase è centralizzata tramite hook personalizzati (`useCollection`, `useDoc`) che implementano la gestione degli errori contestuale per le Security Rules.

### Directory Structure:
- `src/app/admin`: Area gestionale agenzia.
- `src/app/cliente`: Area riservata per i clienti.
- `src/ai/flows`: Logiche di generazione contenuti AI.
- `src/firebase`: Configurazione e provider SDK.
- `firestore.rules`: Definizione dei permessi di produzione.

---
*Documento di Audit Tecnico - Versione 5.1 - Pronto per la fase di Go-Live Commerciale*