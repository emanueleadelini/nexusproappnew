# AD next lab - Documentazione Tecnica Master (Source Code Snapshot)

## 1. Architettura di Sistema
Il CRM è costruito su uno stack **Next.js 15 (App Router)** con integrazione profonda di **Firebase 11**. La logica di business è guidata da un sistema **Multi-tenant** con isolamento dei dati basato su `cliente_id`.

## 2. Modelli Dati Core (TypeScript)

### 2.1 Post Strategico
```typescript
interface Post {
  id: string;
  titolo: string;
  testo: string;
  stato: "bozza" | "revisione_interna" | "da_approvare" | "revisione" | "approvato" | "programmato" | "pubblicato";
  piattaforma: "instagram" | "facebook" | "linkedin" | "tiktok" | "twitter" | "pinterest" | "google_business";
  formato: "immagine_singola" | "carosello" | "video" | "reel" | "story" | "testo";
  data_pubblicazione: Timestamp | null;
  materiale_id?: string | null;
  versione_corrente: number;
  versioni: Array<{
    testo: string;
    titolo: string;
    autore_uid: string;
    autore_nome: string;
    timestamp: Timestamp;
  }>;
  storico_stati: Array<{
    stato: string;
    autore_uid: string;
    timestamp: Timestamp;
    nota?: string;
  }>;
}
```

### 2.2 Utente e RBAC
```typescript
type UserRole = 'super_admin' | 'operatore' | 'referente' | 'collaboratore';

interface UserProfile {
  uid: string;
  email: string;
  ruolo: UserRole;
  cliente_id?: string;
  nomeAzienda?: string;
  permessi: string[];
}
```

## 3. Logiche di Sicurezza (Firestore Rules)
Le regole utilizzano un sistema di **fallback documentale**. Se i Custom Claims non sono ancora presenti nel token JWT, la regola legge direttamente il profilo utente per validare l'accesso.

```javascript
function getUserRole() {
  return request.auth.token.ruolo != null
    ? request.auth.token.ruolo
    : get(/databases/$(database)/documents/users/$(request.auth.uid)).data.ruolo;
}
```

## 4. Motore AI (Genkit & Gemini)
L'IA non genera solo testo, ma agisce come un esperto di comunicazione. Utilizziamo **Genkit Flows** per iniettare il contesto aziendale nei prompt.

### Prompt Strategico:
```handlebars
Sei un social media manager esperto per AD next lab.
CLIENTE: {{{nomeAzienda}}}
SETTORE: {{{settore}}}
PIATTAFORMA: {{{piattaforma.label}}}
TONO: {{{tono.label}}} ({{{tono.descrizione}}})
ARGOMENTO: {{{argomento}}}
```

## 5. Workflow Operativo
1. **Creazione**: L'agenzia crea una `bozza`.
2. **Review Interna**: Passaggio opzionale tra operatori.
3. **Approvazione**: Il post viene inviato al cliente (`da_approvare`).
4. **Feedback**: Il cliente può approvare o richiedere una `revisione`. In caso di revisione, viene aperta la sidebar dei commenti real-time.
5. **Programmazione**: Una volta approvato, l'agenzia imposta data/ora (`programmato`).

## 6. Gestione Asset
- **Limiti**: Supporto diretto fino a 50MB.
- **Link Esterni**: Integrazione con Drive/WeTransfer per file pesanti.
- **Validazione**: Workflow dedicato per l'approvazione degli asset grafici.

## 7. Sistema Notifiche
Gestito tramite una collezione top-level `notifiche` con query filtrate obbligatoriamente per `destinatario_uid` per garantire performance e privacy.

---
*Documento generato per analisi tecnica - Sprint 2 Completato*