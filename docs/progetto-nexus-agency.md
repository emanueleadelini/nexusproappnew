
# Nexus Pro (AD Next Lab) - Manuale Tecnico Master v5.7

Documentazione definitiva dell'Hub Digitale integrato.

---

## 1. Visione & Posizionamento
Nexus Pro è un **Hub Digitale SaaS** progettato per AD Next Lab. Un ecosistema che unisce Strategia Marketing AI (Gemini), Automazione Tech e Formazione Master.

---

## 2. Design System: Nexus Dark
- **Background**: Slate 950 (#020617)
- **Primary Accent**: Indigo 600 (#4f46e5)
- **Secondary Accent**: Violet 600 (#7c3aed)
- **Glassmorphism**: Componenti con `bg-slate-900/50` e `backdrop-blur-xl`.

---

## 3. Workflow 2.0: Silenzio Assenso (24h)
Sistema di approvazione contenuti per eliminare i colli di bottiglia:
1. **Pianificazione**: L'admin crea il post e imposta la scadenza (+24h).
2. **Notifica Push/Email**: Il cliente riceve un deep link al feed.
3. **Feed Instagram Preview**: Il cliente vede il post in anteprima reale con countdown.
4. **Scadenza**: Se il cliente non agisce entro le 24h, il sistema (Cloud Function) approva automaticamente.

---

## 4. Architettura Dati & Sicurezza
- **Multi-tenancy**: Isolamento tramite `cliente_id` nel profilo utente.
- **Indici Ottimizzati**: Richiesti per `collectionGroup` (Dashboard Admin) e query ordinate.
- **Error Handling**: Sistema di Error Boundaries centralizzato per intercettare problemi di indici o permessi senza crashare l'app.

---

## 5. Billing & Infrastruttura
- **Account Centralizzato**: Google Cloud Billing agenzia per tutti i progetti tenant.
- **Quota Monitor**: Analytics real-time sull'uso dei crediti post.

---
*Proprietà Intellettuale - AD next lab - 2024*
