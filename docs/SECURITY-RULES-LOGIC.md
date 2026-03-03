# Nexus Pro - Security Rules Logic (v10.0)

## 1. Filosofia di Sicurezza
Le regole di Firestore sono progettate per garantire l'isolamento dei dati (Multi-tenancy) senza compromettere le performance. Il sistema evita l'uso eccessivo della funzione `get()` nelle operazioni di `list` per prevenire latenze.

## 2. Funzioni Core
- `isSignedIn()`: Verifica l'autenticazione tramite Firebase Auth.
- `userHasRole(role)`: Verifica il ruolo nel documento `/users/{uid}`.
- `userHasClienteId(clientId)`: Verifica che l'utente stia tentando di accedere esclusivamente alla propria "cella" di dati.

## 3. Logica di Accesso
```javascript
// Esempio di accesso ai Post
match /clienti/{clienteId}/post/{postId} {
  // Il cliente legge solo se il suo cliente_id matcha il path
  allow get, list: if isAgency() || userHasClienteId(clienteId);
  
  // Solo l'agenzia crea post
  allow create: if isAgency();
  
  // Il cliente aggiorna solo se il post è in stato 'da_approvare'
  allow update: if isAgency() || (userHasRole('referente') && resource.data.stato == 'da_approvare');
}
```

## 4. Collection Group Queries
L'applicazione supporta le query globali per gli amministratori (es. per vedere tutti i post in attesa di tutti i clienti) tramite indici di gruppo, protetti da:
```javascript
match /{path=**}/post/{postId} {
  allow list: if isAgency();
}
```
