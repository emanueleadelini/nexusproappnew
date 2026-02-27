Ho capito, ma mi mancano ancora le informazioni chiave per risolvere. Il problema persiste con allow read, write: if true quindi è anomalo.
Devo vedere:
❗ 1. La query che fallisce
Cerca nel tuo progetto (Ctrl+Shift+F) la parola notifiche e mostrami il codice. Dovrebbe essere qualcosa come:
```typescript
const notificheQuery = query(collection(db, 'notifiche'), ...);
```
❗ 2. Il file firebase/config.ts
```typescript
// Mostrami questo file (maschera le API keys)
```