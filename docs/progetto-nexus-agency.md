# AD Next Lab - Documentazione Tecnica Master (V4.0)

Questo documento costituisce il manuale tecnico definitivo della piattaforma **AD Next Lab**. È stato redatto per l'analisi ingegneristica e descrive l'architettura, le logiche di business e il codice core.

## 1. Architettura di Sistema
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, ShadCN UI.
- **Backend**: Firebase 11 (Firestore, Auth).
- **AI Engine**: Genkit 1.x con Google Gemini 2.5 Flash.
- **Pattern**: Multi-tenant basato su `cliente_id` con RBAC (Role-Based Access Control) a 4 livelli.

## 2. Modello Dati (Firestore)

### 2.1 Collezioni Core
- `users`: Profili utenti con ruoli (`super_admin`, `operatore`, `referente`, `collaboratore`).
- `clienti`: Aziende gestite con sistema crediti post.
- `clienti/{id}/post`: Piano Editoriale (PED) con workflow a 7 stati.
- `clienti/{id}/materiali`: Archivio asset (Foto, Video, Grafiche) con limite 50MB.
- `notifiche`: Eventi real-time per approvazioni e feedback.

### 2.2 Workflow a 7 Stati (Logica Transizioni)
Il sistema implementa una macchina a stati finiti:
1. `bozza` (Agenzia)
2. `revisione_interna` (Agenzia)
3. `da_approvare` (Agenzia -> Cliente)
4. `revisione` (Cliente -> Agenzia)
5. `approvato` (Cliente)
6. `programmato` (Automazione/Agenzia)
7. `pubblicato` (Fine ciclo)

## 3. Logiche di Business Critiche

### 3.1 Sistema Crediti
- Ogni post creato in una collezione cliente scala 1 credito dal campo `post_totali`.
- L'eliminazione di un post in stato `bozza` riaccredita automaticamente il punto.
- I clienti possono usare il tasto "Richiedi Upgrade" per inviare una notifica al Super Admin.

### 3.2 Gestione Asset e Storage
- **Limite 50MB**: Per file locali caricati direttamente.
- **Link Esterni**: Supporto integrato per URL Drive/WeTransfer per asset pesanti (>50MB), trattati come entità nell'archivio ma gestiti esternamente.

## 4. Codice Core (Analisi per Ingegneri)

### 4.1 Security Rules (Safe RBAC)
```javascript
function getUserRole() {
  return request.auth.token.ruolo != null
    ? request.auth.token.ruolo
    : (exists(/databases/$(database)/documents/users/$(request.auth.uid))
        ? get(/databases/$(database)/documents/users/$(request.auth.uid)).data.ruolo
        : 'guest');
}
```

### 4.2 Hook Real-time (useCollection)
```tsx
export function useCollection<T = any>(memoizedTargetRefOrQuery) {
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!memoizedTargetRefOrQuery) return;
    const unsubscribe = onSnapshot(memoizedTargetRefOrQuery, (snapshot) => {
      setData(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    }, (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ ... }));
    });
    return () => unsubscribe();
  }, [memoizedTargetRefOrQuery]);
  return { data };
}
```

### 4.3 Generazione AI (Genkit Flow)
Il flusso AI utilizza Gemini 2.5 Flash per generare copy social basati sul Tone of Voice del brand cliente, iniettando il settore e l'argomento nel prompt.

---
*Proprietà Riservata di AD Next Lab - Sprint 2 Completato.*