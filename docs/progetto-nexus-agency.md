# Progetto Nexus Agency - Area Riservata Gestionale

## 1. Descrizione Generale
L'applicazione è un sistema gestionale multi-tenant per un'agenzia di comunicazione (Nexus Agency). Permette la gestione dei piani editoriali (PED) e degli asset digitali (Materiali) tra l'agenzia (Admin) e i suoi clienti.

### Stack Tecnologico
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS.
- **Backend**: Firebase (Authentication, Firestore).
- **AI**: Google Gemini via Genkit per la generazione di post social.
- **UI**: Shadcn UI, Lucide React (icone), Space Grotesk (titoli), Inter (body).

---

## 2. Architettura Dati (Firestore)

### users/{uid}
- `email`: string
- `ruolo`: "admin" | "cliente"
- `cliente_id`: string (solo per clienti)
- `nomeAzienda`: string
- `creatoIl`: Timestamp

### clienti/{clienteId}
- `nome_azienda`: string
- `settore`: string
- `email_riferimento`: string
- `post_totali`: number
- `post_usati`: number
- `creato_il`: Timestamp

#### clienti/{clienteId}/post/{postId} (Sotto-collezione PED)
- `titolo`: string
- `testo`: string
- `stato`: "bozza" | "da_approvare" | "approvato" | "pubblicato"
- `data_pubblicazione`: ISO String
- `creato_il`: Timestamp

#### clienti/{clienteId}/materiali/{materialId} (Sotto-collezione Asset)
- `nome_file`: string
- `destinazione`: "social" | "sito" | "offline"
- `ruolo_caricatore`: "admin" | "cliente"
- `stato_validazione`: "in_attesa" | "validato" | "rifiutato"
- `note_rifiuto`: string (opzionale)
- `creato_il`: ISO String

---

## 3. Codice Sorgente Principale

### Tipi Globali (`src/types/`)
- `user.ts`, `client.ts`, `post.ts`, `material.ts`.

### Layout e Guardie di Accesso
- `src/app/admin/layout.tsx`: Verifica il ruolo "admin".
- `src/app/cliente/layout.tsx`: Verifica il ruolo "cliente" e carica il `cliente_id`.
- `src/app/page.tsx`: Gestisce il redirect automatico basato sulla sessione.

### Componenti Core
- `GeneraBozzaModal.tsx`: Utilizza Genkit/Gemini per creare bozze social basate su piattaforma e tono.
- `CreaPostManualeModal.tsx`: Permette l'inserimento manuale nel PED.
- `CaricaMaterialeModal.tsx`: Gestisce l'invio di asset con selezione di destinazione.

### Flow AI (`src/ai/flows/generate-post-ai-flow.ts`)
```typescript
const generatePostPrompt = ai.definePrompt({
  name: 'generatePostPrompt',
  input: { schema: GeneratePostInputSchema },
  output: { schema: GeneratePostOutputSchema },
  prompt: `Sei un social media manager esperto... [prompt strutturato per Gemini]`,
});
```

---

## 4. Logica di Business
1. **Multi-Tenancy**: I clienti vedono solo la propria area grazie al filtraggio basato su `cliente_id` memorizzato nel profilo utente.
2. **Workflow PED**: 
   - Admin crea bozza (IA o manuale).
   - Admin invia per approvazione.
   - Cliente approva (diventa `approvato`).
   - Admin segna come `pubblicato`.
3. **Timeline Asset**: I materiali sono visualizzati in un raggruppamento giornaliero per tenere traccia dello storico scambi agenzia-cliente.
4. **Validazione**: L'admin può approvare o rifiutare (con feedback) i materiali inviati dal cliente.

---

## 5. File Sorgente Completi (Disponibili nel workspace)
Il codice completo è distribuito nei file:
- `src/app/admin/page.tsx`
- `src/app/admin/clienti/[clienteId]/page.tsx`
- `src/app/cliente/page.tsx`
- `src/app/login/page.tsx`
- `src/app/setup-admin/page.tsx`
- `src/firebase/firestore/use-collection.tsx`
- `src/firebase/firestore/use-doc.tsx`
- `src/components/admin/genera-bozza-modal.tsx`
- `src/components/admin/carica-materiale-modal.tsx`
- `src/components/admin/crea-post-manuale-modal.tsx`
- `firestore.rules` (Security Rules)
