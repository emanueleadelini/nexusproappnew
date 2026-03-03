# Guida alla Manutenzione GitHub (v10.4)

Questa guida spiega come mantenere il codice di Nexus Pro sincronizzato tra il tuo ambiente di sviluppo e il repository GitHub ufficiale.

## 1. Routine di Aggiornamento (Inviare modifiche a GitHub)
Esegui questi passaggi ogni volta che completi una nuova funzionalità o una serie di correzioni:

1.  **Apri il Terminale**: Menu `View > Terminal`.
2.  **Staging dei file**:
    ```bash
    git add .
    ```
3.  **Commit (Salvataggio locale)**:
    ```bash
    git commit -m "Descrivi qui cosa hai cambiato"
    ```
4.  **Push (Invio al server)**:
    ```bash
    git push origin main
    ```

## 2. Scaricare aggiornamenti (Se modifichi il codice altrove)
Se hai apportato modifiche direttamente su GitHub o da un altro computer, usa questo comando per aggiornare il tuo ambiente attuale:

```bash
git pull origin main
```
*Nota: Se ricevi errori di conflitto, puoi forzare l'aggiornamento con `git pull origin main --force` (attenzione: sovrascrive le modifiche locali non salvate).*

## 3. Verifica del Successo ✅
Per confermare che tutto sia andato a buon fine:
1. Apri: `https://github.com/emanueleadelini/Nexuspro`
2. Controlla la data dell'ultimo commit accanto ai file: deve corrispondere a pochi minuti fa.
3. Se vedi il tuo messaggio di commit (punto 1.3), il codice è al sicuro sul cloud.

## 4. Differenza tra Branch Menu e Terminale
- **Menu Branch (Icona in basso a sinistra)**: Serve solo a visualizzare o cambiare "ramo" del codice. Non esegue il push dei file.
- **Terminale (Finestra testuale)**: È l'unico posto dove puoi scrivere i comandi `git add`, `git commit` e `git push`.

---
*Documentazione Tecnica AD Next Lab - 2024*
