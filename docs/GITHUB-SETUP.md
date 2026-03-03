# Guida al Collegamento GitHub

Questa guida spiega come sincronizzare il codice di Nexus Pro con il repository ufficiale.

## 1. Localizzare il Terminale
Il terminale è lo strumento necessario per inviare il codice. 
**In Firebase Studio:**
- Cerca la linguetta **"Terminal"** nella parte inferiore dello schermo.
- Se non la vedi, clicca sull'icona `>_` o seleziona `View > Terminal`.

## 2. Comandi di Inizializzazione
Copia e incolla questi comandi nel terminale premendo INVIO dopo ognuno:

```bash
# Inizializza il repository locale
git init

# Collega il repository remoto di Emanuele Adelini
git remote add origin https://github.com/emanueleadelini/Nexuspro.git
```

## 3. Preparazione e Primo Invio (Push)
Questi comandi "impacchettano" tutto il codice scritto finora e lo inviano a GitHub:

```bash
# Aggiunge tutti i file al pacchetto
git add .

# Crea un punto di salvataggio con un messaggio
git commit -m "primo push del progetto"

# Imposta il ramo principale
git branch -M main

# Invia i file al server (ti potrebbe chiedere il login a GitHub)
git push -u origin main
```

## 4. Manutenzione
Ogni volta che l'IA apporta modifiche significative, ricorda di ripetere l'operazione di `add`, `commit` e `push` per mantenere il backup su GitHub sempre aggiornato.

---
*Documentazione Tecnica AD Next Lab*
