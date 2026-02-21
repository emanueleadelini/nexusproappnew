# Configurazione Utente Admin (Manuale)

Segui questi passaggi nella Console di Firebase per configurare l'accesso admin per `emanueleadelini@gmail.com`.

### 1. Creazione Utente in Firebase Authentication
1. Accedi alla [Firebase Console](https://console.firebase.google.com/).
2. Vai nella sezione **Authentication** dal menu a sinistra.
3. Seleziona la tab **Users** e clicca sul pulsante **Add user**.
4. Inserisci le credenziali:
   - Email: `emanueleadelini@gmail.com`
   - Password: `Angela25!`
5. Clicca su **Add user**.
6. **IMPORTANTE**: Una volta creato, apparirà una colonna chiamata **User UID**. Copia quel codice (es. `vX9...`). Ti servirà per il prossimo passaggio.

### 2. Configurazione Ruolo in Cloud Firestore
1. Vai nella sezione **Firestore Database** dal menu a sinistra.
2. Se non esiste già, clicca su "Start collection" per creare la collezione `users`.
3. Clicca su **Add document** dentro la collezione `users`.
4. In **Document ID**, incolla esattamente l'**UID** che hai copiato poco fa dal modulo Authentication.
5. Aggiungi i seguenti campi cliccando su "Add field":
   - **Field name**: `email` | **Type**: `string` | **Value**: `emanueleadelini@gmail.com`
   - **Field name**: `ruolo` | **Type**: `string` | **Value**: `admin`
   - **Field name**: `nomeAzienda` | **Type**: `string` | **Value**: `Nexus Agency`
   - **Field name**: `creatoIl` | **Type**: `timestamp` | **Value**: (clicca sull'icona calendario per impostare la data odierna)
6. Clicca su **Save**.

### 3. Verifica
Ora puoi tornare all'applicazione, andare alla pagina `/login` e inserire le credenziali. Il sistema leggerà il ruolo `admin` dal documento che hai appena creato e ti permetterà di accedere all'area gestionale `/admin`.
