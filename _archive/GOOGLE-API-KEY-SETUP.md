# 🔑 Come ottenere la Google Drive API Key

## Problema
Il Google Drive Picker richiede due credenziali:
1. ✅ **OAuth Client ID** - già configurato
2. ❌ **API Key** - MANCANTE (causa l'errore "API developer key is invalid")

## Soluzione: Creare API Key

### Passo 1: Vai alla Google Cloud Console
1. Apri: https://console.cloud.google.com/
2. Seleziona il tuo progetto (quello dove hai creato l'OAuth Client ID)

### Passo 2: Abilita Google Picker API
1. Nel menu laterale: **APIs & Services** → **Library**
2. Cerca: `Google Picker API`
3. Clicca su **Google Picker API**
4. Clicca **Enable** (se non è già abilitato)

### Passo 3: Crea API Key
1. Nel menu laterale: **APIs & Services** → **Credentials**
2. Clicca **+ CREATE CREDENTIALS** in alto
3. Seleziona **API Key**
4. La tua API Key verrà generata (es: `AIzaSyA...`)
5. **OPZIONALE ma raccomandato:** Clicca su **RESTRICT KEY**
   - Nome: `Drive Picker API Key`
   - **API restrictions** → Seleziona:
     - ✅ Google Picker API
     - ✅ Google Drive API (se vuoi usare Drive per altri scopi)
   - **Application restrictions** → Seleziona **HTTP referrers**
     - Aggiungi: `https://*.github.io/*` (per GitHub Pages)
     - Aggiungi: `http://localhost:*` (per test locale)
     - Aggiungi: `http://127.0.0.1:*` (per test locale)
   - Clicca **SAVE**

### Passo 4: Copia la tua API Key
1. Copia la stringa API Key (inizia con `AIzaSy...`)

### Passo 5: Aggiorna i file di configurazione

#### 📝 File: `config.private.js` (per sviluppo locale)
```javascript
driveApiKey: 'AIzaSy...TUA_VERA_API_KEY',
```

#### 📝 File: `config.public.js` (per GitHub Pages)
```javascript
driveApiKey: 'AIzaSy...TUA_VERA_API_KEY',
```

⚠️ **NOTA:** Anche se l'API Key non è "segreta" come l'OAuth Client Secret, è comunque buona pratica limitarla ai tuoi domini.

### Passo 6: Test
1. Salva i file
2. Ricarica la pagina (Ctrl+F5 per forzare refresh)
3. Prova ad aprire il modal "Carica Fattura"
4. Clicca "📁 Scegli da Google Drive"
5. Dovrebbe aprirsi il picker senza errori!

## Verifica configurazione

Apri la Console del browser (F12) e verifica:

```javascript
console.log('API Key configurata:', window.APP_CONFIG.driveApiKey);
console.log('OAuth Client ID:', window.APP_CONFIG.driveOauthClientId);
```

Entrambi devono mostrare valori validi (non undefined).

## Risoluzione problemi

### Errore: "The API developer key is invalid"
- ❌ API Key mancante o errata
- ✅ Crea/copia la API Key corretta dalla Google Cloud Console

### Errore: "Access blocked: This app's request is invalid"
- ❌ OAuth Client ID non ha i redirect URIs corretti
- ✅ Vai su Google Cloud Console → Credentials → OAuth 2.0 Client IDs
- ✅ Aggiungi come "Authorized JavaScript origins":
  - `https://sandroz ellweger.github.io`
  - `http://localhost`
  - `http://127.0.0.1`

### Picker si apre ma non carica file
- ❌ Google Picker API non abilitata
- ✅ Vai su APIs & Services → Library → Cerca "Google Picker API" → Enable

### Errore: "API key not valid"
- ❌ Restrizioni troppo severe sulla API Key
- ✅ Vai su Google Cloud Console → Credentials → Clicca sulla tua API Key
- ✅ In "Application restrictions" verifica che i tuoi URL siano inclusi
- ✅ In "API restrictions" verifica che "Google Picker API" sia selezionata

## Link Utili

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Picker API Documentation](https://developers.google.com/picker)
- [API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)

## Sicurezza

✅ **L'API Key PUÒ essere pubblica** (è usata dal browser)
✅ **Limita sempre l'API Key** ai tuoi domini (HTTP referrers)
✅ **Limita sempre l'API Key** alle API necessarie (Google Picker API)
❌ **NON condividere mai OAuth Client Secret** (ma qui usi solo Client ID che è pubblico)

---

**Status:** Una volta configurata l'API Key, il Drive Picker funzionerà perfettamente! 🚀
