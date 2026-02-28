# Nexus Pro (AD Next Lab) - Manuale Tecnico Master v5.4

Documentazione aggiornata con le specifiche del Workflow 2.0 e integrazione Feed Social.

---

## 1. Architettura SaaS & Multi-tenancy
Nexus Pro utilizza un'architettura **Tenant-per-Document** supportata da Firestore Security Rules.

### Isolamento Dati
Ogni cliente è un "Tenant" identificato da un `cliente_id`. 
- **Security Rules**: Isolamento fisico garantito a livello di collezione `/clienti/{id}`.
- **Notifiche**: Spostate in sottocollezioni `/users/{uid}/notifiche` per garantire che ogni utente possa leggere solo i propri avvisi.

---

## 2. Nexus Pro Features
### 2.1 Post Workflow 2.0 (Silenzio Assenso)
Il nuovo workflow è ottimizzato per evitare colli di bottiglia:
1. **Invio**: L'Agenzia crea il post e lo invia in `da_approvare`.
2. **Alert**: Al cliente arriva notifica immediata (gestionale + email simulata).
3. **Countdown 24h**: Il post mostra una scadenza di 24 ore. Se il cliente non agisce, l'agenzia procede secondo la clausola di "Silenzio Assenso".
4. **Approvazione**: Il cliente può approvare o richiedere revisioni direttamente dal feed.

### 2.2 Feed Instagram Preview
Il cliente non vede un elenco tecnico, ma una **simulazione reale del Feed Instagram**:
- Avatar con logo aziendale.
- Immagine in formato 1:1.
- Pulsanti di interazione (Heart, Comment, Send) per simulazione.
- Caption (titolo + testo) formattata come sui social.

### 2.3 Asset Management & Note
Il caricamento materiali è ora categorizzato:
- **Destinazioni**: Social, Sito Web, Grafica Offline, Strategico.
- **Note**: Il cliente può allegare istruzioni specifiche ad ogni file inviato.

---

## 3. Area Consulenza Strategica
Nexus Pro non è solo produzione, ma strategia master:
- **Documenti Master**: Area protetta per Piano Strategico e di Comunicazione.
- **Moduli Premium**: Business Plan e Business Model Canvas attivabili dall'admin solo per i pacchetti che li prevedono.
- **Branding**: Integrazione dinamica del logo del cliente in tutta la piattaforma (Header, Feed, Sidebar).

---

## 4. Gestione Notifiche
Sistema di log persistente per ogni azione rilevante:
- **Audit Log**: Storico completo di chi ha inviato cosa e quando.
- **Badge Real-time**: Contatore di notifiche non lette nell'header.
- **Deep Linking**: Cliccare su una notifica porta l'utente direttamente all'elemento interessato (es. al post specifico nel feed).

---
*Documento di Proprietà Intellettuale - Nexus Pro - 2024*
