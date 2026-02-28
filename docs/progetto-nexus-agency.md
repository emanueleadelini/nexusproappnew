# Nexus Agency (AD Next Lab) - Manuale Tecnico Master v5.2

Questo documento rappresenta la documentazione tecnica e commerciale definitiva per il progetto **AD Next Lab**. È stato progettato per essere una soluzione SaaS (Software as a Service) multi-tenant per agenzie di comunicazione.

---

## 1. Architettura di Sistema
La piattaforma utilizza uno stack moderno e scalabile:
- **Frontend/Backend**: Next.js 15 (App Router) + React 19.
- **Database & Auth**: Firebase Cloud (Firestore + Authentication).
- **Intelligenza Artificiale**: Genkit 1.x con Google Gemini 2.5 Flash per la generazione di copy strategici.
- **UI Framework**: Tailwind CSS + ShadCN UI per un design professionale e responsive.

### Isolamento Multi-tenant
Ogni cliente è isolato tramite un `cliente_id`. Le Security Rules di Firestore impediscono l'accesso ai dati tra tenant diversi. Un utente di tipo `referente` vede solo i dati della propria azienda.

---

## 2. Ruoli e Permessi (RBAC)
Il sistema implementa 4 livelli di accesso definiti in `src/types/user.ts`:

- **super_admin**: Controllo totale (gestione agenzia, fatturazione, cancellazione clienti).
- **operatore**: Produzione contenuti, gestione calendari per tutti i clienti, validazione asset.
- **referente**: Manager lato cliente. Può caricare asset, commentare e approvare/rifiutare post.
- **collaboratore**: Visualizzatore lato cliente. Può commentare e caricare materiali ma non approva i post.

---

## 3. Codice Core e Logiche di Business

### 3.1 Security Rules (V5.2 Production-Ready)
Le regole garantiscono che nessun dato possa essere letto o scritto senza autorizzazione.

```javascript
// Estratto firestore.rules
match /clienti/{clienteId} {
  allow get: if isClientOf(clienteId) || isAgency();
  allow list: if isAgency();
  
  match /post/{postId} {
    allow get, list: if isClientOf(clienteId) || isAgency();
    // Solo l'agenzia crea i post
    allow create: if isAgency();
    // Il cliente (referente) può solo cambiare lo stato in 'approvato' o 'revisione'
    allow update: if isAgency() || 
      (isReferente(clienteId) && resource.data.stato == 'da_approvare' && 
       request.resource.data.diff(resource.data).affectedKeys().hasOnly(['stato', 'storico_stati', 'aggiornato_il']));
  }
}
```

### 3.2 Workflow Editoriale (I 7 Stati)
Un post segue un percorso blindato per garantire la qualità:
1. `bozza` (Interno)
2. `revisione_interna` (Interno)
3. `da_approvare` (Visibile al cliente)
4. `revisione` (Rimandato dal cliente)
5. `approvato` (Pronto per l'uscita)
6. `programmato` (In coda sui tool di posting)
7. `pubblicato` (Storico)

### 3.3 Motore AI (Genkit Flow)
La generazione dei post avviene tramite prompt ingegnerizzati che tengono conto del tono di voce e della piattaforma.

```typescript
// src/ai/flows/generate-post-ai-flow.ts
const generatePostPrompt = ai.definePrompt({
  name: 'generatePostPrompt',
  prompt: `Sei un social media manager esperto... 
  Genera un post per {{{nomeAzienda}}} nel settore {{{settore}}}. 
  Piattaforma: {{{piattaforma.label}}}, Tono: {{{tono.label}}}.`
});
```

---

## 4. Strategia Commerciale SaaS

### 4.1 Monetizzazione (Credit System)
Il sistema è predisposto per un modello a consumo:
- **Piano Starter**: 5 post/mese.
- **Piano Professional**: 15 post/mese.
- **Piano Agency**: Post illimitati.
Il campo `post_totali` nel documento `clienti` blocca la creazione di nuovi post se il limite viene raggiunto.

### 4.2 Onboarding Clienti
L'amministratore crea un cliente in 30 secondi tramite il modulo "Aggiungi Cliente", che genera automaticamente:
1. Documento Azienda.
2. Account Authentication per il referente.
3. Profilo permessi personalizzato.

### 4.3 Offboarding e Backup
Prima di cancellare un cliente (funzione "Elimina Cliente"), l'Admin può scaricare un dump JSON completo. Questo garantisce la conformità GDPR e la portabilità dei dati per il cliente che decide di lasciare l'agenzia.

---

## 5. Roadmap Go-Live
1. **Configurazione Admin**: Eseguire `/setup-admin` per inizializzare il primo Super User.
2. **Integrazione Pagamenti**: Collegare il tasto "Richiedi Upgrade" a un checkout di Stripe.
3. **App Hosting**: Deploy su Firebase App Hosting per scalabilità automatica.

*Documento di Proprietà Intellettuale - Nexus Agency (AD Next Lab) - 2024*
