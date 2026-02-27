# AD Next Lab - Manuale Tecnico Master (Analisi Ingegneristica)

Questo documento contiene l'analisi completa, l'architettura e il codice sorgente logico della piattaforma AD Next Lab.

---

## 1. Architettura di Sistema
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, ShadCN UI.
- **Backend**: Firebase 11 (Firestore, Authentication).
- **AI Engine**: Genkit 1.x con plugin Google Generative AI (Gemini 2.5 Flash).
- **Pattern**: Multi-tenant basato su `cliente_id` con RBAC a 4 livelli.

---

## 2. Modello Dati (Firestore Collections)

### 2.1 Collezioni
- `/users/{uid}`: Profili utenti con ruoli e permessi.
- `/clienti/{clienteId}`: Dati azienda e sistema crediti.
- `/clienti/{clienteId}/post/{postId}`: Piano Editoriale con workflow stati.
- `/clienti/{clienteId}/materiali/{materialeId}`: Archivio asset (limite hardware 50MB).
- `/notifiche/{id}`: Notifiche real-time.

---

## 3. Logiche di Business

### 3.1 Workflow Contenuti (7 Stati)
1. `bozza` -> 2. `revisione_interna` -> 3. `da_approvare` -> 4. `revisione` -> 5. `approvato` -> 6. `programmato` -> 7. `pubblicato`.

### 3.2 Sistema Crediti
- Ogni post creato scala un credito dal `post_totali` del cliente.
- Cancellando una bozza, il credito viene riaccreditato.
- Sistema di richiesta upgrade tramite flag `richiesta_upgrade`.

---

## 4. Codice Sorgente Core

### 4.1 Security Rules (V5)
Le regole utilizzano un sistema di tripla protezione: Hardcoded Admin, Custom Claims e Firestore Fallback.

```javascript
// Helper critico per evitare crash in fase di valutazione
function getUserRole() {
  return request.auth.token.ruolo != null
    ? request.auth.token.ruolo
    : (exists(/databases/$(database)/documents/users/$(request.auth.uid))
        ? get(/databases/$(database)/documents/users/$(request.auth.uid)).data.ruolo
        : 'guest');
}
```

### 4.2 Custom Hook: useCollection (Real-time)
Gestione sottoscrizioni con emissione errori contestuali per debug rules.

```typescript
export function useCollection<T = any>(memoizedTargetRefOrQuery: Query | null) {
  useEffect(() => {
    if (!memoizedTargetRefOrQuery) return;
    const unsubscribe = onSnapshot(memoizedTargetRefOrQuery, 
      (snapshot) => { /* update data */ },
      (error) => {
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

### 4.3 Genkit Flow (AI Generation)
Utilizzo di Gemini 2.5 Flash per la generazione di copy basati sul brand identity.

```typescript
const generatePostPrompt = ai.definePrompt({
  name: 'generatePostPrompt',
  prompt: `Sei un social media manager esperto per AD next lab. Genera un post per {{{nomeAzienda}}}...`,
});
```

---

## 5. Vincoli Tecnici
- **Upload**: Limite massimo 50MB per file caricato direttamente (per video più grandi si usa il sistema Link Esterni).
- **Sicurezza**: Ogni scrittura è validata via Security Rules; le transizioni di stato sono verificate dal frontend e protette lato server.

*Documento riservato ad uso esclusivo del team ingegneristico AD Next Lab.*