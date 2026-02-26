# AD Next Lab - Documentazione Tecnica Master (V6.0)

Questo documento costituisce il manuale tecnico definitivo della piattaforma **AD Next Lab**. È stato redatto per l'analisi ingegneristica e descrive l'architettura, le logiche di business e il codice core integrale.

---

## 1. Architettura di Sistema
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, ShadCN UI.
- **Backend**: Firebase 11 (Firestore, Auth).
- **AI Engine**: Genkit 1.x con Google Gemini 2.5 Flash.
- **Pattern**: Multi-tenant basato su `cliente_id` con RBAC (Role-Based Access Control) a 4 livelli:
  1. `super_admin`: Pieno controllo agenzia e gestione piani.
  2. `operatore`: Gestione quotidiana PED e asset.
  3. `referente`: Approvazione contenuti e feedback lato cliente.
  4. `collaboratore`: Visualizzazione e upload asset lato cliente.

---

## 2. Modello Dati (Firestore)

### 2.1 Collezioni Core
- `users`: Profili utenti con ruoli e permessi granulari.
- `clienti`: Aziende gestite con sistema crediti post e stato upgrade.
- `clienti/{id}/post`: Piano Editoriale (PED) con workflow a 7 stati.
- `clienti/{id}/materiali`: Archivio asset (Foto, Video, Grafiche) con limite hardware 50MB.
- `notifiche`: Eventi real-time per approvazioni, feedback e comunicazioni di sistema.

---

## 3. Logiche di Business Critiche

### 3.1 Workflow a 7 Stati (Contenuti)
1. `bozza`: Creazione iniziale (Agenzia).
2. `revisione_interna`: Controllo qualità (Agenzia).
3. `da_approvare`: In attesa di approvazione (Cliente).
4. `revisione`: Richiesta modifiche con feedback (Cliente).
5. `approvato`: Pronto per la programmazione (Cliente).
6. `programmato`: Impostato sui tool di pubblicazione (Agenzia).
7. `pubblicato`: Fine ciclo vita.

### 3.2 Sistema Crediti e Upgrade
- Ogni post creato scala 1 credito dal piano del cliente.
- L'eliminazione di una bozza riaccredita automaticamente il punto.
- Notifica automatica al Super Admin in caso di richiesta upgrade tramite flag `richiesta_upgrade`.

---

## 4. Codice Sorgente Core

### 4.1 Security Rules (V3 - Safe RBAC)
Le regole utilizzano una tripla logica di protezione:
1. **JWT Custom Claims**: Metodo primario (veloce).
2. **Firestore Fallback**: Metodo secondario (se claims non ancora propagati).
3. **Hardcoded Admin**: Metodo di emergenza per il primo setup del Super Admin.

```javascript
function isHardcodedAdmin() {
  return request.auth.uid in ['DaRQQ7aTpnbw195PmvTE98F2kwD2'];
}

function isAgency() {
  return isHardcodedAdmin() || getUserRole() in ['super_admin', 'operatore', 'admin'];
}

match /notifiche/{notificaId} {
  allow list: if isAuthenticated() && (isAgency() || resource.data.destinatario_uid == request.auth.uid);
}
```

### 4.2 Script Setup Custom Claims (`set-claims.mjs`)
Da eseguire localmente per inizializzare il ruolo Super Admin.

```javascript
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const TARGET_UID = 'DaRQQ7aTpnbw195PmvTE98F2kwD2';
const CLAIMS = { ruolo: 'super_admin', cliente_id: null };

await getAuth().setCustomUserClaims(TARGET_UID, CLAIMS);
```

### 4.3 Generazione AI (Genkit Flow)
Integrazione con Gemini 2.5 Flash per la creazione di copy strategici.

```typescript
const generatePostPrompt = ai.definePrompt({
  name: 'generatePostPrompt',
  prompt: `Sei un social media manager esperto per AD next lab. Genera un post per {{{nomeAzienda}}}...`,
});
```

---
*Proprietà Riservata di AD Next Lab. Sprint 2 - Concluso con successo.*
