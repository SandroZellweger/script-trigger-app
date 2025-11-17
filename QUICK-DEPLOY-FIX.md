# 🚀 DEPLOYMENT IMMEDIATO - Fix Estrazione Dati

## 📋 Cosa è Stato Risolto

**Problema:** Il sistema non estraeva correttamente nome, email e telefono dalla prenotazione 2967

**Soluzione:** Aggiornata funzione `extractCustomerFromEvent()` per:
1. ✅ Estrarre nome dal titolo (formato: `$ 1 - Alessandro Barbone - CHF 0.00`)
2. ✅ Estrarre email con pattern specifico (`Email: [email]`)
3. ✅ Estrarre telefono con pattern specifico (`Numero di cellulare: [phone]`)

---

## ⚡ Quick Deploy (5 Minuti)

### Step 1: Deploy Backend (2 minuti)

1. **Apri Google Apps Script**
   ```
   https://script.google.com/home/projects/YOUR_PROJECT_ID/edit
   ```

2. **Sostituisci il contenuto di Code.gs**
   - Seleziona TUTTO il contenuto attuale
   - Elimina
   - Copia TUTTO da `complete-secure-script-with-maintenance.gs`
   - Incolla

3. **Deploy**
   - Click: **Deploy** > **Manage deployments**
   - Click: **✏️ Edit** (sull'ultimo deployment)
   - **Version**: New version
   - **Description**: "Fixed customer data extraction from calendar events"
   - Click: **Deploy**
   - ⚠️ **NON COPIARE IL NUOVO URL** - usa lo stesso deployment URL di prima!

### Step 2: Test Immediato (2 minuti)

1. **Apri la tua app payments.html**
   ```
   https://sandrozellweger.github.io/script-trigger-app/payments.html
   ```

2. **Test Ricerca Booking**
   - Campo "Numero Riferimento": `2967`
   - Click: **Cerca**

3. **Verifica Risultato Atteso**
   ```
   ✅ Dati Cliente Trovati
   👤 Nome: Alessandro Barbone
   📧 Email: noleggiosemplice23@gmail.com
   📱 Telefono: +41774070742
   🚗 Veicolo: N01 - Opel Vivaro (Losone)
   📅 Dal: 28 novembre 2025 alle ore 01:00
   📅 Al: 28 novembre 2025 alle ore 23:59
   🔢 Riferimento: 2967
   ```

### Step 3: Test Payment Link (1 minuto)

1. **Con i dati trovati, crea un pagamento**
   - Importo: `50.00`
   - Descrizione: `Test pagamento prenotazione 2967`
   - Click: **Create Payment Link**

2. **Verifica Stripe Checkout**
   - Click sul link Stripe generato
   - ✅ Verifica che email sia pre-compilata: `noleggiosemplice23@gmail.com`

---

## 🧪 Test Avanzato (Opzionale)

### Usa Test Page Dedicata

1. **Apri `test-extraction-2967.html`**
   - Aggiorna le costanti:
     ```javascript
     const SCRIPT_URL = 'TUO_DEPLOYMENT_URL';
     const AUTH_TOKEN = 'TUO_AUTH_TOKEN';
     ```

2. **Esegui Test**
   - Click: "🔍 Test Ricerca Booking 2967"
   - Verifica checkmarks verdi ✅ su tutti i campi

3. **Verifica Raw Response**
   - Controlla JSON response completo
   - Conferma tutti i dati estratti

---

## 📂 File Aggiornati

### Backend
- ✅ `complete-secure-script-with-maintenance.gs`
  - Funzione `extractCustomerFromEvent()` (linee 891-990)
  - Pattern specifici per nome, email, telefono
  - Fallback multipli

### Frontend
- ✅ `payments.html` (già aggiornato in precedenza)
- ✅ `test-extraction-2967.html` (nuovo file test)

### Documentazione
- ✅ `EXTRACTION-PATTERNS.md` - Pattern regex dettagliati
- ✅ `FIX-EXTRACTION-2967.md` - Descrizione fix applicato
- ✅ `QUICK-DEPLOY-FIX.md` - Questa guida

---

## 🔍 Cosa Controlla il Fix

### Formato Titolo Evento
```
$ [numero] - [NOME CLIENTE] - CHF [importo]
```
**Esempio:** `$ 1 - Alessandro Barbone - CHF 0.00`

### Formato Descrizione Evento
```
Numero di cellulare: +41774070742
Email: noleggiosemplice23@gmail.com
Numero di riferimento: 2967
```

### Pattern Regex

**Nome (dal titolo):**
```javascript
title.split(' - ')[1]
  .replace(/CHF\s*[\d,.]+/gi, '')
  .trim()
```

**Email (dalla descrizione):**
```regex
/Email:\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i
```

**Telefono (dalla descrizione):**
```regex
/(?:Numero di cellulare|Telefono|Phone|Cellulare):\s*([\+\d\s]+)/i
```

---

## ✅ Checklist Verifica

### Prima del Deploy
- [x] File `.gs` aggiornato con nuova funzione
- [x] Pattern regex testati
- [x] No errori di sintassi
- [x] Fallback implementati

### Dopo il Deploy
- [ ] Backend deployment riuscito
- [ ] Endpoint risponde correttamente
- [ ] Test booking 2967: nome estratto ✅
- [ ] Test booking 2967: email estratta ✅
- [ ] Test booking 2967: telefono estratto ✅
- [ ] Payment link creato con dati
- [ ] Email pre-compilata in Stripe ✅

### Test Produzione
- [ ] Test con altri booking reference
- [ ] Test con formati titolo diversi
- [ ] Test con dati parziali (solo nome, no email)
- [ ] Test funzionamento normale (senza booking)

---

## 🐛 Troubleshooting

### Problema: Nome ancora "N/A"

**Causa:** Formato titolo diverso da quello atteso

**Soluzione:**
1. Apri Google Calendar
2. Trova evento booking 2967
3. Copia il titolo completo
4. Verifica che contenga ` - ` (spazio-trattino-spazio)
5. Se formato diverso, contattami con esempio

### Problema: Email ancora "N/A"

**Causa:** Keyword "Email:" non trovata

**Soluzione:**
1. Controlla descrizione evento
2. Verifica presenza di `Email: [indirizzo]`
3. Se formato diverso (es: "E-mail:" o "Email:"), aggiorna regex

### Problema: Telefono ancora "N/A"

**Causa:** Keyword diversa o formato non standard

**Soluzione:**
1. Controlla descrizione evento
2. Verifica keyword esatta (es: "Numero di cellulare:")
3. Verifica formato numero (+41, 0041, 07x)

---

## 📞 Support

### Debugging

1. **Console Browser (F12)**
   ```javascript
   // Controlla logs
   console.log('📅 Booking search result:', data);
   ```

2. **Google Apps Script Logs**
   ```
   https://script.google.com/home/executions
   ```

3. **Test Isolato**
   - Usa `test-extraction-2967.html`
   - Verifica raw response JSON
   - Identifica quale campo manca

### Contatti

- Documentazione: `EXTRACTION-PATTERNS.md`
- Fix Details: `FIX-EXTRACTION-2967.md`
- Full Guide: `BOOKING-LOOKUP-GUIDE.md`

---

## 🎉 FATTO!

Dopo aver completato Step 1-3, il sistema dovrebbe estrarre correttamente tutti i dati cliente! 🚀

**Tempo Totale:** ~5 minuti  
**Difficoltà:** ⭐ Facile  
**Impatto:** ⭐⭐⭐⭐⭐ Critico

---

**Data:** 18 Novembre 2025  
**Versione:** 2.0.0  
**Status:** ✅ Ready to Deploy
