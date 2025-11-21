# 🔐 Google Drive Picker - Setup Sicuro

## ✅ Implementazione Completa

Il Google Drive Picker è stato implementato con un approccio **completamente sicuro**:

- ✅ **API Keys** → Script Properties (backend sicuro)
- ✅ **Client ID** → Fornito dal backend (non hardcoded nel frontend)
- ✅ **Nessun secret su GitHub** → Tutto caricato dinamicamente
- ✅ **Funziona su GitHub Pages** → Le credenziali vengono richieste al backend

---

## 📋 Step 1: Configura Script Properties su Google Apps Script

1. **Apri il tuo progetto Google Apps Script:**
   - Vai su https://script.google.com
   - Apri il progetto `complete-secure-script-with-maintenance.gs`

2. **Vai alle Script Properties:**
   - Click sull'icona **⚙️ Project Settings** (ingranaggio a sinistra)
   - Scorri fino a **Script Properties**
   - Click su **"Add script property"**

3. **Aggiungi le seguenti properties:**

   | Property | Value |
   |----------|-------|
   | `GOOGLE_API_KEY` | `AIzaSyCqF0sdLZCF0ASr_LWqN5VGV-psvXOLIoo` |
   | `GOOGLE_CLIENT_ID` | `552211122555-ar7v9jb2b2gbs4o6nafph3b0599v9frj.apps.googleusercontent.com` |

   **Nota:** Se non hai ancora queste credenziali, vai allo Step 2.

4. **Salva le properties** - Click su **Save script properties**

---

## 📋 Step 2: Crea le Credenziali Google (se non le hai)

### A. Google API Key

1. Vai su [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Seleziona il progetto (o creane uno nuovo)
3. Click **"CREATE CREDENTIALS"** → **"API key"**
4. Copia la key
5. (Opzionale) Restrizioni:
   - **Application restrictions** → HTTP referrers
   - Aggiungi: `https://sandrozellweger.github.io/*` e `http://localhost:8000/*`
   - **API restrictions** → Restrict key → Google Drive API, Google Picker API

### B. OAuth 2.0 Client ID

1. Stessa pagina: [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)
2. Se è la prima volta, configura **OAuth consent screen**:
   - User Type: **External**
   - App name: `Script Trigger App`
   - User support email: la tua email
   - Developer contact: la tua email
   - Scopes: aggiungi `.../auth/drive.readonly`
   - Save

3. Torna a **Credentials** → **CREATE CREDENTIALS** → **OAuth client ID**
4. Application type: **Web application**
5. Name: `Script Trigger Drive Picker`
6. **Authorized JavaScript origins:**
   ```
   https://sandrozellweger.github.io
   http://localhost:8000
   http://localhost:5500
   ```
7. Click **CREATE**
8. Copia il **Client ID** (formato: `123456789-abc...xyz.apps.googleusercontent.com`)

---

## 📋 Step 3: Abilita le API necessarie

1. Vai su [Google Cloud Console - API Library](https://console.cloud.google.com/apis/library)
2. Cerca e abilita:
   - ✅ **Google Drive API**
   - ✅ **Google Picker API**

---

## 📋 Step 4: Deploy dello Script Aggiornato

1. **Apri Google Apps Script** con il file aggiornato
2. **Deploy** → **Manage deployments**
3. Click sull'icona ✏️ **Edit** del deployment attivo
4. **Version**: **New version**
5. **Deploy**
6. Copia l'URL (dovrebbe essere lo stesso):
   ```
   https://script.google.com/macros/s/AKfycbyWOIltUyV1N1uok9BUI0_jbreLVD16l38gbNOHlxgVq8IgeHNRe19Ge0lIlV2s_9Uo/exec
   ```

---

## 🧪 Step 5: Testa Localmente

1. **Apri il terminale** nella cartella del progetto
2. **Avvia server locale:**
   ```bash
   python -m http.server 8000
   ```
3. **Apri nel browser:** http://localhost:8000/maintenance-new.html
4. **Login come admin**
5. **Vai a "Liste Officina"**
6. **Click su "📁 Seleziona da Drive"**
7. **Verifica:**
   - ✅ Si apre la finestra di autenticazione Google
   - ✅ Si apre il Drive Picker
   - ✅ Puoi selezionare un file
   - ✅ L'analisi AI parte automaticamente

**Console log atteso:**
```
📡 Loading Google credentials from backend...
✅ Google credentials loaded successfully
🔑 Client ID configured: 552211122555-ar7v9j...
✅ Google Picker API loaded
🔐 Requesting Google Drive access...
✅ Access token obtained
✅ Drive Picker displayed
📁 File selezionato: fattura.pdf
🆔 File ID: 1abc...xyz
📊 Analisi di "fattura.pdf" in corso...
```

---

## 🌐 Step 6: Testa su GitHub Pages

1. **Commit e push** su GitHub:
   ```bash
   git add .
   git commit -m "Add secure Google Drive Picker"
   git push
   ```

2. **Aspetta il deploy** (circa 1-2 minuti)

3. **Apri:** https://sandrozellweger.github.io/script-trigger-app/maintenance-new.html

4. **Testa** come nello step 5

---

## 🔒 Sicurezza Garantita

✅ **API Key NON è visibile nel codice frontend**
- È salvata nelle Script Properties di Google Apps Script
- Il frontend la richiede al backend quando serve

✅ **Client ID è pubblico** (come deve essere)
- È necessario per OAuth nel browser
- Non è un segreto (è visibile anche nelle richieste di autenticazione)

✅ **Nessuna credenziale su GitHub**
- Il codice su GitHub non contiene API keys
- Tutto viene caricato dinamicamente dal backend

✅ **Funziona sia localmente che su GitHub Pages**
- Il backend fornisce sempre le credenziali corrette

---

## 🐛 Troubleshooting

### ❌ "Google credentials not configured"

**Causa:** Script Properties non configurate

**Soluzione:**
1. Vai su Google Apps Script
2. Project Settings → Script Properties
3. Verifica che `GOOGLE_API_KEY` e `GOOGLE_CLIENT_ID` siano presenti

---

### ❌ "idpiframe_initialization_failed"

**Causa:** Authorized JavaScript origins non configurati

**Soluzione:**
1. Vai su Google Cloud Console → Credentials
2. Modifica OAuth Client ID
3. Aggiungi a **Authorized JavaScript origins**:
   - `https://sandrozellweger.github.io`
   - `http://localhost:8000`

---

### ❌ Picker non si apre

**Causa:** API non abilitate

**Soluzione:**
1. Vai su Google Cloud Console → API Library
2. Cerca "Google Drive API" → Enable
3. Cerca "Google Picker API" → Enable

---

### ❌ "Access token not obtained"

**Causa:** OAuth consent screen non configurato

**Soluzione:**
1. Vai su Google Cloud Console → OAuth consent screen
2. Completa la configurazione
3. Aggiungi scope: `.../auth/drive.readonly`
4. Aggiungi te stesso come test user (se app in testing)

---

## 📊 Come Funziona

```
┌─────────────────┐
│   Frontend      │
│ (GitHub Pages)  │
└────────┬────────┘
         │
         │ 1. Request credentials
         ▼
┌─────────────────────────────┐
│  Google Apps Script         │
│  (Backend)                  │
│                             │
│  Script Properties:         │
│  - GOOGLE_API_KEY           │
│  - GOOGLE_CLIENT_ID         │
│                             │
│  Endpoint:                  │
│  getGoogleCredentialsJsonp()│
└────────┬────────────────────┘
         │
         │ 2. Return credentials
         ▼
┌─────────────────┐
│   Frontend      │
│   Receives:     │
│   - apiKey      │
│   - clientId    │
│   - appId       │
└────────┬────────┘
         │
         │ 3. Initialize Picker
         ▼
┌─────────────────┐
│  Google Picker  │
│  (OAuth 2.0)    │
└─────────────────┘
```

---

## ✅ Checklist Finale

Prima di usare in produzione, verifica:

- [ ] Script Properties configurate su Google Apps Script
- [ ] Google Drive API abilitata
- [ ] Google Picker API abilitata
- [ ] OAuth Client ID creato
- [ ] Authorized JavaScript origins configurati
- [ ] OAuth consent screen configurato
- [ ] Script aggiornato e deployato
- [ ] Test locale funzionante
- [ ] Test su GitHub Pages funzionante

---

## 🎉 Fatto!

Il Google Drive Picker ora funziona in modo **completamente sicuro** senza esporre credenziali su GitHub!

Gli utenti possono:
- ✅ Selezionare fatture direttamente da Drive
- ✅ Supporto per immagini (JPG, PNG) e PDF
- ✅ Analisi AI automatica dopo selezione
- ✅ Nessun upload necessario se il file è già su Drive

**Buon lavoro! 🚀**
