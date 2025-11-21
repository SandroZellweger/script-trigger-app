# 📁 Guida: Configurare Google Drive Picker

## 🎯 Cosa Abbiamo Implementato

Ho aggiunto un **Google Drive Picker** che permette di:
- ✅ Aprire l'interfaccia di Google Drive direttamente nell'app
- ✅ Sfogliare i file visivamente
- ✅ Selezionare fatture (immagini o PDF) con un click
- ✅ Analizzare automaticamente il file selezionato
- ✅ Fallback manuale se Google Picker non è disponibile

---

## 🔧 Configurazione (Necessaria!)

Per usare il Google Drive Picker, devi configurare le credenziali Google API.

### Passo 1: Creare un Progetto su Google Cloud

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Clicca **"Crea progetto"** o seleziona un progetto esistente
3. Dai un nome al progetto (es: "Noleggio Semplice")

### Passo 2: Abilitare le API necessarie

1. Nel menu laterale, vai su **"API e servizi" → "Libreria"**
2. Cerca e abilita:
   - ✅ **Google Drive API**
   - ✅ **Google Picker API**

### Passo 3: Creare le Credenziali

#### A) Creare API Key

1. Vai su **"API e servizi" → "Credenziali"**
2. Clicca **"+ Crea credenziali" → "Chiave API"**
3. Copia la chiave generata (es: `AIza...xyz`)
4. (Opzionale) Clicca sulla chiave per limitarla solo a:
   - API Google Drive
   - API Google Picker
   - Il tuo dominio/localhost

#### B) Creare OAuth 2.0 Client ID

1. Sempre in **"Credenziali"**, clicca **"+ Crea credenziali" → "ID client OAuth"**
2. Se richiesto, configura la **schermata per il consenso**:
   - Tipo: **Esterno** (se non hai Google Workspace) o **Interno**
   - Nome app: "Noleggio Semplice"
   - Email assistenza: la tua email
   - Ambiti: aggiungi `https://www.googleapis.com/auth/drive.readonly`
   - Salva

3. Torna a creare l'OAuth Client ID:
   - Tipo applicazione: **Applicazione web**
   - Nome: "Noleggio Semplice - Web"
   - Origini JavaScript autorizzate:
     - `http://localhost:8000` (per test locali)
     - `https://tuo-dominio.com` (per produzione)
     - `https://sandroCiccio.github.io` (se usi GitHub Pages)
   - URI di reindirizzamento autorizzati:
     - `http://localhost:8000/maintenance-new.html`
     - `https://tuo-dominio.com/maintenance-new.html`

4. Copia il **Client ID** (formato: `123456789-abc.apps.googleusercontent.com`)

### Passo 4: Configurare l'App

Crea un file `config.google.js` nella root del progetto:

```javascript
// config.google.js
window.GOOGLE_CONFIG = {
    // Incolla il Client ID qui
    googleClientId: '123456789-abc.apps.googleusercontent.com',
    
    // Incolla l'API Key qui
    googleApiKey: 'AIza...xyz',
    
    // App ID = prima parte del Client ID (prima del trattino)
    googleAppId: '123456789'
};

// Merge con configurazione esistente
if (window.PUBLIC_CONFIG) {
    window.PUBLIC_CONFIG = {
        ...window.PUBLIC_CONFIG,
        ...window.GOOGLE_CONFIG
    };
}
```

### Passo 5: Includere il File di Config

Nel file `maintenance-new.html`, dopo aver caricato `config.public.js`:

```html
<!-- Esistente -->
<script src="config.public.js"></script>
<script src="config.private.js"></script>

<!-- NUOVO: Aggiungi questo -->
<script src="config.google.js"></script>
```

---

## 🚀 Come Funziona

### Modalità 1: Google Drive Picker (Consigliato)

1. Utente clicca **"📁 Analizza da Drive"**
2. Si apre un modal con due opzioni
3. Utente clicca **"Apri Google Drive"**
4. Si apre il picker di Google Drive (interfaccia visiva)
5. Utente seleziona il file (immagine o PDF)
6. File viene analizzato automaticamente
7. Risultati mostrati in modal

### Modalità 2: Fallback Manuale

Se Google Picker non funziona (credenziali mancanti/errore):

1. Si apre il modal standard
2. Utente inserisce manualmente il File ID
3. Clicca "🤖 Analizza"
4. File viene analizzato
5. Risultati mostrati

---

## 🧪 Test

### Test 1: Con Google Picker (dopo configurazione)

1. Apri `maintenance-new.html`
2. Vai alla sezione "Liste Officina"
3. Clicca **"📁 Analizza da Drive"**
4. Clicca **"Apri Google Drive"**
5. Dovresti vedere l'interfaccia di Google Drive
6. Seleziona una fattura
7. Verifica l'analisi automatica

### Test 2: Fallback Manuale

1. Se il Picker non funziona, vedrai il campo manuale
2. Inserisci un File ID di test
3. Clicca "🤖 Analizza"
4. Verifica che funzioni

---

## ⚠️ Risoluzione Problemi

### Errore: "Google API initialization failed"

**Cause possibili:**
- Credenziali non configurate
- API Key non valida
- Client ID non valido
- API non abilitate

**Soluzione:**
1. Verifica di aver creato `config.google.js`
2. Controlla che le credenziali siano corrette
3. Verifica che le API siano abilitate su Google Cloud Console
4. Controlla la console del browser per errori specifici

### Errore: "Access blocked: This app's request is invalid"

**Causa:** Domini non autorizzati

**Soluzione:**
1. Vai su Google Cloud Console
2. **"API e servizi" → "Credenziali"**
3. Clicca sul tuo OAuth Client ID
4. Aggiungi il tuo dominio alle **"Origini JavaScript autorizzate"**

### Google Picker non si apre

**Causa:** Popup bloccati dal browser

**Soluzione:**
1. Consenti popup per il tuo dominio
2. Riprova

---

## 📊 Confronto: Prima vs Dopo

| Caratteristica | Prima (File ID Manuale) | Dopo (Drive Picker) |
|---------------|------------------------|---------------------|
| **UX** | ⭐⭐ Devi trovare File ID | ⭐⭐⭐⭐⭐ Selezioni visivamente |
| **Velocità** | 🐢 30-60 secondi | ⚡ 5-10 secondi |
| **Errori** | ❌ File ID sbagliato frequente | ✅ Rarissimi |
| **Usabilità** | 😕 Difficile per utenti | 😊 Intuitivo |
| **Fallback** | ❌ Nessuno | ✅ Input manuale disponibile |

---

## 🎨 UI Migliorata

### Bottone "Analizza da Drive"

```html
<!-- Nell'interfaccia liste officina -->
<button onclick="promptDriveFileForInvoice('LISTA_ID')" 
        style="background: #4285f4; ...">
    📁 Analizza da Drive
</button>
```

### Modal con Due Opzioni

```
┌────────────────────────────────────┐
│  📁 Seleziona Fattura da Drive     │
├────────────────────────────────────┤
│                                    │
│  ✨ Nuovo! Seleziona direttamente  │
│     da Drive                       │
│                                    │
│  [  📁 Apri Google Drive  ]       │
│                                    │
│            oppure                  │
│                                    │
│  Inserisci manualmente File ID:   │
│  [____________________________]   │
│                                    │
│  [ Annulla ]  [ 🤖 Analizza ]     │
└────────────────────────────────────┘
```

---

## 💡 Vantaggi

✅ **Esperienza utente migliorata** - seleziona visivamente i file  
✅ **Meno errori** - niente File ID da copiare/incollare  
✅ **Più veloce** - 3 click invece di 10 passi  
✅ **Supporto multiplo** - funziona con immagini E PDF  
✅ **Fallback robusto** - input manuale sempre disponibile  
✅ **Sicuro** - OAuth 2.0 di Google  

---

## 📝 File Modificati

1. **`maintenance-new.html`**
   - Aggiunto script Google API nell'head
   - Aggiunta funzione `loadDrivePicker()`
   - Aggiunta funzione `showDrivePicker()`
   - Modificato `promptDriveFileForInvoice()` con due opzioni
   - Aggiunta inizializzazione Google API in `initApp()`

2. **`config.google.js.example`** (NUOVO)
   - Template per configurazione credenziali Google

3. **`GOOGLE-DRIVE-PICKER-SETUP.md`** (questo file)
   - Guida completa alla configurazione

---

## 🚀 Deploy Checklist

- [ ] Creare progetto Google Cloud
- [ ] Abilitare Google Drive API
- [ ] Abilitare Google Picker API
- [ ] Creare API Key
- [ ] Creare OAuth 2.0 Client ID
- [ ] Configurare origini JavaScript autorizzate
- [ ] Creare file `config.google.js`
- [ ] Includere `config.google.js` in `maintenance-new.html`
- [ ] Testare con file di test
- [ ] Testare fallback manuale
- [ ] Deploy in produzione

---

## 🎉 Pronto!

Dopo aver completato la configurazione:

1. ✅ Gli utenti possono aprire Google Drive direttamente nell'app
2. ✅ Selezionare file visivamente
3. ✅ Analizzare fatture con 3 click
4. ✅ Fallback manuale sempre disponibile

**Ottima UX + Robustezza = Successo!** 🚀
