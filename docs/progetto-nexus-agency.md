# AD Next Lab - Manuale Tecnico Master (Documentazione Integrale)

Questo documento contiene l'analisi ingegneristica completa, l'architettura e il codice sorgente logico della piattaforma AD Next Lab.

---

## 1. Architettura di Sistema
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, ShadCN UI.
- **Backend**: Firebase 11 (Firestore, Authentication).
- **AI Engine**: Genkit 1.x con plugin Google Generative AI (Gemini 2.5 Flash).
- **Pattern**: Multi-tenant basato su `cliente_id` con RBAC a 4 livelli: `super_admin`, `operatore`, `referente` (cliente), `collaboratore`.

---

## 2. Modello Dati (Firestore Collections)

### 2.1 Collezioni e Schema
- `/users/{uid}`: Profili utenti.
- `/clienti/{clienteId}`: Aziende clienti e gestione crediti post.
- `/clienti/{clienteId}/post/{postId}`: Piano Editoriale con workflow a 7 stati.
- `/clienti/{clienteId}/materiali/{materialeId}`: Archivio asset (limite hardware 50MB).
- `/notifiche/{id}`: Eventi real-time.

---

## 3. Logiche di Business Core

### 3.1 Workflow Contenuti (7 Stati)
Il ciclo di vita di un post è così definito:
1. `bozza` -> 2. `revisione_interna` -> 3. `da_approvare` -> 4. `revisione` -> 5. `approvato` -> 6. `programmato` -> 7. `pubblicato`.

### 3.2 Sistema Crediti
Ogni post creato dall'agenzia incrementa `post_usati` nel documento cliente. Se una bozza viene eliminata, il contatore viene decrementato (riaccredito). Il cliente può richiedere upgrade tramite il flag `richiesta_upgrade`.

---

## 4. Codice Sorgente Logico (Snippet Integrali)

### 4.1 Security Rules (Logica di Protezione V5)
```javascript
function getUserRole() {
  return request.auth.token.ruolo != null
    ? request.auth.token.ruolo
    : (exists(/databases/$(database)/documents/users/$(request.auth.uid))
        ? get(/databases/$(database)/documents/users/$(request.auth.uid)).data.ruolo
        : 'guest');
}

function isAgency() {
  let role = getUserRole();
  return role in ['super_admin', 'operatore', 'admin'];
}

match /clienti/{clienteId} {
  allow get: if isAuthenticated() && (isAgency() || getClienteId() == clienteId);
  allow list: if isAuthenticated() && isAgency();
}
```

### 4.2 Hook useCollection (Real-time & Contextual Errors)
```typescript
export function useCollection<T = any>(memoizedTargetRefOrQuery: Query | null) {
  useEffect(() => {
    if (!memoizedTargetRefOrQuery) return;
    const unsubscribe = onSnapshot(memoizedTargetRefOrQuery, 
      (snapshot) => { /* Update State */ },
      (serverError) => {
        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path: memoizedTargetRefOrQuery.path
        });
        errorEmitter.emit('permission-error', contextualError);
      }
    );
    return () => unsubscribe();
  }, [memoizedTargetRefOrQuery]);
}
```

### 4.3 Genkit AI Flow (Generazione Copy)
```typescript
export const generatePostPrompt = ai.definePrompt({
  name: 'generatePostPrompt',
  prompt: `Sei un social media manager esperto per AD next lab. Genera un post per {{{nomeAzienda}}} nel settore {{{settore}}} per la piattaforma {{{piattaforma}}}. Tono: {{{tono}}}. Argomento: {{{argomento}}}.`,
});
```

---

## 5. Vincoli Tecnici e Sicurezza
- **Upload**: Limite massimo 50MB per caricamento diretto. Per file >50MB si utilizza il sistema di link esterni (Drive/WeTransfer) nell'archivio.
- **Transizioni**: Ogni cambio di stato viene registrato nello `storico_stati` con UID autore e timestamp.
- **Versionamento**: Ogni modifica al testo del post crea una nuova entry nell'array `versioni`.

---
*Documento tecnico riservato ad uso esclusivo del team ingegneristico.*