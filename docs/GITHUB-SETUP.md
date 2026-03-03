# Guida al Collegamento GitHub

Segui questi passaggi per collegare correttamente il codice sorgente di Nexus Pro al repository ufficiale.

## 1. Configurazione Iniziale
Apri il terminale nella cartella radice del progetto ed esegui:

```bash
# Inizializza il repository git locale
git init

# Aggiungi l'origine remota
git remote add origin https://github.com/emanueleadelini/Nexuspro.git
```

## 2. Preparazione dei file
Assicurati di avere un file `.gitignore` corretto per evitare di caricare la cartella `node_modules` o le chiavi segrete `.env`.

```bash
# Aggiungi tutti i file al sistema di tracking
git add .

# Crea il commit iniziale
git commit -m "Initial commit: Hub Digitale v10.1 - Identity Aware"
```

## 3. Pubblicazione (Push)
Invia il codice al server di GitHub:

```bash
# Se il tuo branch principale si chiama main
git push -u origin main

# Se ricevi un errore, verifica il nome del branch con 'git branch'
```

## 4. Manutenzione
Ogni volta che vengono effettuate modifiche tramite l'App Prototyper di Firebase Studio, ricordati di fare il `git pull` locale e poi il `push` per mantenere sincronizzato il repository.

---
*Documentazione Tecnica AD Next Lab*
