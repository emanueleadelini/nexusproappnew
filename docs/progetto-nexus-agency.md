# Nexus Pro (AD Next Lab) - Manuale Tecnico Master v5.5

Documentazione definitiva dell'Hub Digitale integrato.

---

## 1. Visione & Posizionamento
Nexus Pro è un **Hub Digitale SaaS** progettato per AD Next Lab. Non è un semplice gestionale, ma un ecosistema che unisce:
- **ADNext Digital**: Strategia Marketing potenziata da AI (Gemini).
- **ADNext Tech**: Automazione processi e sviluppo software.
- **ADNext Academy**: Formazione professionale continua.

---

## 2. Architettura & Design System
### 2.1 Nexus Dark UI
- **Background**: Slate 950 (#020617)
- **Primary Accent**: Indigo 600 → Purple 600 (Gradient)
- **Estetica**: Glassmorphism, bordi ultra-sottili (White/5), blur elevato.
- **Font**: 'Space Grotesk' per titoli, 'Inter' per il corpo del testo.

### 2.2 Isolamento Dati (SaaS Multi-tenancy)
Il sistema utilizza un'architettura **Tenant-per-Document** con isolamento garantito a livello di Security Rules:
- Ogni cliente è un "Tenant" identificato da un `cliente_id`.
- Gli utenti (`users`) hanno un riferimento al proprio `cliente_id`.
- Le notifiche sono isolate per utente nella sottocollezione `/users/{uid}/notifiche`.

---

## 3. Workflow 2.0 (Silenzio Assenso)
Il cuore della piattaforma è il processo di approvazione contenuti:
1. **Invio**: L'admin crea un post e imposta `tipo_pianificazione` (Immediata/Programmata).
2. **Countdown 24h**: All'invio, viene calcolata `scadenza_approvazione` (+24h).
3. **Notifica & Deep Link**: Il cliente riceve una notifica. Cliccando, viene portato direttamente alla card del post nel feed con effetto highlight.
4. **Azioni Cliente**: 
   - **Approva**: Il post passa a `approvato`.
   - **Modifiche**: Il cliente inserisce note e il post torna in `revisione`.
5. **Silenzio Assenso**: Se il cliente non agisce entro le 24h, l'agenzia è autorizzata alla pubblicazione automatica.

---

## 4. Gestione Asset & Materiali
- **Destinazioni**: Social, Sito Web, Offline, Strategico.
- **Input Cliente**: Include campo Note e selettore Destinazione.
- **Validazione Admin**: L'admin può validare o rifiutare gli asset caricati dal cliente.

---

## 5. Struttura Database (Firestore)

### 5.1 Collezioni Primarie
- `/users/{uid}`: Profili utenti con ruoli (`super_admin`, `operatore`, `referente`, `collaboratore`).
- `/clienti/{clienteId}`: Dati azienda, budget post (usati/totali) e logo branding.

### 5.2 Sottocollezioni
- `/users/{uid}/notifiche/{notificaId}`: Log notifiche personale.
- `/clienti/{clienteId}/post/{postId}`: Workflow editoriale, storico stati e versionamento.
- `/clienti/{clienteId}/materiali/{materialeId}`: Asset creativi e documenti strategici.
- `/clienti/{clienteId}/post/{postId}/commenti/{commentoId}`: Chat contestuale per ogni contenuto.

---

## 6. Integrazione AI
- **Gemini Flash 2.5**: Utilizzato tramite Genkit per la generazione di bozze social (Titolo + Testo) basate sul settore e sul tono di voce del cliente.

---
*Proprietà Intellettuale - AD next lab - 2024*