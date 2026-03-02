# Nexus Pro (AD Next Lab) - Manuale Tecnico Master v7.0

Documentazione definitiva dell'Hub Digitale integrato.

---

## 1. Visione & Posizionamento
Nexus Pro è un **Hub Digitale SaaS** progettato per AD Next Lab. Un ecosistema che unisce Strategia Marketing AI (Gemini), Automazione Tech e Formazione Master. La v7.0 introduce il focus sulla **Leggibilità Totale** tramite un design Light Mode ad alto contrasto.

---

## 2. Design System: Nexus Light 3.0
- **Background**: Bianco / Slate 50 (#F8FAFC)
- **Contrast**: Testo Slate 900 (#0F172A) per la massima leggibilità.
- **Interfaccia**: Card bianche con ombre sfumate e bordi Slate 100.
- **Status Style**: Badge pastello con testo saturo per una chiara distinzione cromatica.

---

## 3. Workflow 2.0: Silenzio Assenso (24h)
Sistema di approvazione contenuti per eliminare i colli di bottiglia:
1. **Pianificazione**: L'admin crea il post e imposta la scadenza (+24h).
2. **Notifica Push/Email**: Il cliente riceve un deep link al feed.
3. **Feed Instagram Preview**: Il cliente vede il post in anteprima reale con countdown ad alta visibilità.
4. **Scadenza**: Se il cliente non agisce entro le 24h, il sistema (Cloud Function) approva automaticamente.

---

## 4. Architettura Identity-Aware (v7.0)
- **Global Provider**: Il `FirebaseProvider` gestisce lo stato dell'utente e del tenant in tempo reale.
- **Role-Based Gating**: Query Firestore disabilitate finché il profilo non è caricato.
- **Multi-tenancy**: Isolamento rigoroso tramite `cliente_id` nel profilo utente.
- **Rotte Admin**: 
  - `/admin`: Dashboard direzionale con statistiche aggregate.
  - `/admin/clienti`: Portfolio tenant con monitoraggio budget.
  - `/admin/post`: Monitoraggio globale dei workflow.
  - `/admin/notifiche`: Registro attività centralizzato.

---

## 5. Billing & Infrastruttura
- **Account Centralizzato**: Un unico Billing Account Google Cloud per tutti i progetti tenant.
- **Quota Monitor**: Analytics real-time sull'uso dei crediti post e chiamate AI.

---
*Proprietà Intellettuale - AD next lab - 2024*
