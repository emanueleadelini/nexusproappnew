# AD Next Lab - Manuale Tecnico & Strategico (Nexus Agency)

Questo documento contiene l'analisi ingegneristica completa, l'architettura e il codice sorgente logico della piattaforma AD Next Lab, aggiornato al report di audit pre-lancio. Il sistema è progettato per operare come una piattaforma SaaS (Software as a Service) per agenzie di comunicazione.

---

## 1. Architettura di Sistema (Multi-tenant SaaS)
La piattaforma utilizza un'architettura **Serverless Multi-tenant** basata su isolamento a livello di database.
- **Tenant Isolation**: Ogni entità di business (`Post`, `Material`, `Commento`) è collegata a un `cliente_id`.
- **RBAC a 4 Livelli**: 
  - `super_admin`: Pieno controllo sistema e fatturazione.
  - `operatore`: Produzione contenuti per tutti i clienti.
  - `referente`: Manager lato cliente (approvazione e upload).
  - `collaboratore`: Visualizzazione e upload per il cliente.

---

## 2. Modelli Dati & Sicurezza (Firestore)

### 2.1 Security Rules (Produzione v5.0)
Le regole di sicurezza garantiscono che nessun dato possa essere letto o scritto al di fuori dei limiti del tenant e del ruolo.
```javascript
// Esempio logica core:
function isClientOf(clienteId) {
  return request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.cliente_id == clienteId;
}
```

### 2.2 Entità Core
- **UserProfile**: Identità e permessi RBAC.
- **Client**: Configurazione tenant e budget crediti.
- **Post**: Contenuto strategico con workflow a 7 stati e versioning integrato.
- **Material**: Asset multimediali con workflow di validazione agenzia/cliente.

---

## 3. Workflow Operativi & Business Logic

### 3.1 Gestione Crediti Post
Il sistema scala su un modello a consumo. Ogni `Post` creato incrementa un contatore `post_usati`. 
- **Upgrade Flow**: Il cliente può richiedere post extra, l'agenzia valida e aggiorna il piano.
- **Monetizzazione**: Predisposto per integrazione Stripe via Server Actions per upgrade automatici.

### 3.2 Asset Management (Audit fix)
- **Validazione**: Gli asset caricati dai clienti entrano in stato `in_attesa`. L'agenzia li valida o li rifiuta con nota tecnica.
- **Isolamento**: Gli asset sono mappati per destinazione (`social`, `sito`, `offline`).

---

## 4. AI Post Generator Engine
Integrazione con **Gemini 2.5 Flash** via Genkit 1.x.
- **Prompt Strategico**: Il motore AI conosce il settore del cliente, il tono di voce richiesto e le restrizioni della piattaforma social di destinazione.

---

## 5. Roadmap per il Lancio SaaS
1. **Billing Integration**: Collegamento Stripe per pagamenti ricorrenti (SaaS Subscription).
2. **Cloud Storage Integration**: Migrazione definitiva dei file pesanti su Firebase Storage con security rules speculari a Firestore.
3. **Analisi Avanzata**: Reporting PDF mensile automatico per i clienti con performance post.

---
*Documento di Audit Tecnico - Versione 5.0 - Pronto per il Go-Live*