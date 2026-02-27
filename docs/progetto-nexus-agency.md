# AD Next Lab - Manuale Tecnico Master (Documentazione Integrale)

Questo documento contiene l'analisi ingegneristica completa, l'architettura e il codice sorgente logico della piattaforma AD Next Lab. È destinato all'uso esclusivo del team ingegneristico per audit e sviluppo.

---

## 1. Architettura di Sistema
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, ShadCN UI.
- **Backend**: Firebase 11 (Firestore, Authentication).
- **AI Engine**: Genkit 1.x con Gemini 2.5 Flash.
- **Pattern**: Multi-tenant basato su `cliente_id` con RBAC a 4 livelli: `super_admin`, `operatore`, `referente`, `collaboratore`.

---

## 2. Modelli Dati (Firestore)

### 2.1 UserProfile (`/users/{uid}`)
Definisce l'identità e i permessi dell'utente nel sistema.
- `ruolo`: Determina l'accesso (super_admin, operatore, referente, collaboratore).
- `cliente_id`: Collega l'utente (referente/collaboratore) a una specifica azienda.
- `permessi`: Array di stringhe per granularità fine (es. `creazione_post`, `uso_ai`).

### 2.2 Client (`/clienti/{clienteId}`)
Gestione dell'azienda cliente e dei crediti.
- `post_totali`: Budget mensile di post.
- `post_usati`: Contatore dei post creati nel mese corrente.
- `richiesta_upgrade`: Flag booleano per segnalare necessità di post extra.

### 2.3 Post (`/clienti/{clienteId}/post/{postId}`)
Contenuto strategico con workflow a 7 stati.
- **Stati**: `bozza` -> `revisione_interna` -> `da_approvare` -> `revisione` -> `approvato` -> `programmato` -> `pubblicato`.
- `piattaforma`: Instagram, LinkedIn, ecc.
- `versione_corrente`: Gestione del versioning del copy.

---

## 3. Logiche di Business Core

### 3.1 Sistema Crediti
Ogni post creato (anche via AI) incrementa `post_usati`. L'eliminazione di un post in stato `bozza` riaccredita il punto. Il sistema impedisce la creazione oltre il limite `post_totali` a meno di upgrade.

### 3.2 Gestione Asset (Asset Strategy)
- **Limite Hardware**: Upload diretto limitato a 50MB per file.
- **Video & File Pesanti**: Per file > 50MB, il sistema salva un `link_esterno` (Drive/WeTransfer) memorizzato nel documento `Material`.
- **Validazione**: L'agenzia valida gli asset caricati dal cliente prima che possano essere associati a un post.

---

## 4. Codice Sorgente Logico (Core Snippets)

### 4.1 Security Rules (Stato Attuale: Debug Mode)
Attualmente impostate per permettere l'accesso totale durante la fase di analisi e debug dei permessi.
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 4.2 Hook Reale-Time: useCollection
```typescript
export function useCollection<T>(memoizedQuery) {
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!memoizedQuery) return;
    const unsubscribe = onSnapshot(memoizedQuery, (snapshot) => {
      setData(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    }, (error) => {
      // Gestione centralizzata errori permessi
      errorEmitter.emit('permission-error', new FirestorePermissionError({ operation: 'list', path: '...' }));
    });
    return () => unsubscribe();
  }, [memoizedQuery]);
  return { data };
}
```

### 4.3 AI Flow: Generazione Post
Utilizza Gemini 2.5 Flash per trasformare i requisiti del cliente in copy strategico.
```typescript
const generatePostPrompt = ai.definePrompt({
  name: 'generatePostPrompt',
  prompt: `Sei un SMM per AD next lab. Genera un post per {{{nomeAzienda}}}...`,
  // ... input/output schema defined with Zod
});
```

---
*Documento generato per audit tecnico - Versione 1.1*
