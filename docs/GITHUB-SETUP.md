# Guida al Collegamento GitHub

Segui questi passaggi per collegare correttamente il codice sorgente di Nexus Pro al repository ufficiale su GitHub.

## 1. Inizializzazione Repository
Apri il terminale nella cartella radice del progetto ed esegui i seguenti comandi:

```bash
# Inizializza il repository git locale
git init

# Aggiungi l'origine remota
git remote add origin https://github.com/emanueleadelini/Nexuspro.git
```

## 2. Preparazione e Primo Commit
Assicurati di avere un file `.gitignore` corretto per evitare di caricare la cartella `node_modules`.

```bash
# Aggiungi tutti i file al sistema di tracking
git add .

# Crea il primo commit con il messaggio richiesto
git commit -m "primo push del progetto"
```

## 3. Configurazione Branch e Push
Imposta il branch principale su `main` ed esegui l'invio al server:

```bash
# Rinomina il branch in main (standard attuale GitHub)
git branch -M main

# Invia il codice al server remoto
git push -u origin main
```

## 4. Manutenzione
Ogni volta che effettui modifiche tramite l'App Prototyper di Firebase Studio, ricordati di eseguire un `git pull` locale per sincronizzare le modifiche dell'AI, e successivamente un `push` per mantenere aggiornato il repository remoto.

---
*Documentazione Tecnica AD Next Lab*
