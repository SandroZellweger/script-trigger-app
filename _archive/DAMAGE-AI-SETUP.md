# 🚀 Setup Rapido - Sistema AI Riconoscimento Danni

## 📋 Prerequisiti
- Account Google con accesso a Google Apps Script
- Chiave API OpenAI (con accesso a GPT-4 Vision)
- Cartelle Drive organizzate: `/Zoko Images/+41XXX/`

---

## 1️⃣ Deploy Google Apps Script

### Passo 1: Apri Google Apps Script
1. Vai su [script.google.com](https://script.google.com)
2. Crea un nuovo progetto o apri quello esistente
3. Copia tutto il contenuto di `complete-secure-script.gs`
4. Incolla nel tuo progetto Apps Script

### Passo 2: Configura Script Properties
1. Click sull'icona **⚙️ Project Settings** (nella sidebar)
2. Scroll giù fino a **Script Properties**
3. Click **Add script property**
4. Aggiungi:
   ```
   Property: OPENAI_API_KEY
   Value: sk-proj-[tua-chiave-openai]
   ```
5. Click **Save script properties**

### Passo 3: Deploy come Web App
1. Click **Deploy** → **New deployment**
2. Click sulla rotella ⚙️ → Seleziona **Web app**
3. Configura:
   - **Description**: "AI Damage Recognition System"
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click **Deploy**
5. **COPIA IL WEB APP URL** (simile a: `https://script.google.com/macros/s/AKfycby.../exec`)

---

## 2️⃣ Configura Frontend

### Passo 1: Aggiorna damage-ai-test.html
1. Apri `damage-ai-test.html`
2. Trova la riga ~225:
   ```javascript
   scriptUrl: 'YOUR_GOOGLE_SCRIPT_URL_HERE',
   ```
3. Sostituisci con il tuo URL copiato:
   ```javascript
   scriptUrl: 'https://script.google.com/macros/s/AKfycby.../exec',
   ```
4. Salva il file

### Passo 2: Testa la Connessione
1. Apri `damage-ai-test.html` nel browser
2. Se vedi "⚠️ Configura Script URL prima!" → ricontrolla il passo 1
3. Se vedi la lista dei veicoli → ✅ Tutto OK!

---

## 3️⃣ Verifica Cartelle Drive

Assicurati che le cartelle siano organizzate così:

```
📁 Zoko Images/
   📁 +41787228385/
      📷 2024-01-15_photo1.jpg
      📷 2024-01-15_photo2.jpg
      📁 documenti/          ← ignorata dall'AI
         📄 id_card.jpg
   📁 +41791234567/
      📷 2024-01-20_photo1.jpg
```

**Importante:**
- Nomi cartelle devono essere numeri di telefono con `+`
- Le foto devono essere nella cartella root (non in sottocartelle)
- La cartella "documenti" viene automaticamente esclusa

---

## 4️⃣ Test Sistema

### Test Completo:

1. **Apri `damage-ai-test.html`**
2. **Carica una foto** di un danno (anche una foto di test)
3. **Seleziona un veicolo** dalla lista
4. **Scegli notifiche:**
   - ✅ Email (automatica per confidenza > 70%)
   - ✅ Dashboard Live (consigliato!)
   - 📱 WhatsApp (opzionale)
5. **Click "🔍 Analizza"**

### Cosa aspettarsi:

- ⏱️ **Tempo di analisi**: 30 secondi - 2 minuti (dipende dalle foto)
- 📊 **Dashboard**: Si apre in nuova finestra con risultati live
- 📧 **Email**: Ricevi email solo se trova match > 70% confidenza
- ✅ **Risultati**: Lista completa con foto e spiegazione AI

---

## 5️⃣ Troubleshooting

### Errore: "Cannot read properties of undefined"
**Causa:** Script URL non configurato
**Soluzione:** Verifica step 2.1 sopra

### Errore: "Veicoli non caricati"
**Causa:** Script non deployato o URL sbagliato
**Soluzione:** Ricontrolla il deploy e l'URL copiato

### Errore: "OpenAI API key not configured"
**Causa:** Chiave OpenAI non nelle Script Properties
**Soluzione:** Verifica step 1.2 sopra

### Nessun risultato trovato
**Possibili cause:**
1. ✅ Nessun cliente precedente ha causato il danno (è nuovo!)
2. 📁 Cartelle Drive non organizzate correttamente
3. 📷 Foto dei clienti assenti o in sottocartelle sbagliate
4. 🔍 AI non riconosce il danno come significativo

### Email non arrivano
**Causa:** Confidenza < 70% o email Gmail bloccata
**Soluzione:** 
- Controlla spam/promozioni
- Verifica che lo script abbia permessi per inviare email
- Controlla i risultati nella Dashboard

---

## 6️⃣ Funzionalità Avanzate

### Modifica Soglia Email
Nel file `complete-secure-script.gs`, trova:
```javascript
if (analysis.confidence > 0.7 && analysis.isResponsible) {
```
Cambia `0.7` per modificare la soglia (0.7 = 70%)

### Modifica Numero Prenotazioni
Nel file `damage-ai-test.html`, trova:
```javascript
const bookings = await getLastBookings(vehicleInfo, 20);
```
Cambia `20` per analizzare più/meno prenotazioni

### Aggiungi WhatsApp Notifications
(Da implementare - chiedi se ti serve!)

---

## 📞 Supporto

Se hai problemi:
1. Controlla la **Console del Browser** (F12) per errori
2. Controlla **Logs** in Google Apps Script (View → Logs)
3. Verifica che tutte le cartelle Drive esistano
4. Assicurati che OpenAI API key sia valida

---

## 🎯 Prossimi Passi

Una volta che tutto funziona:
1. Testa con vari tipi di danni (graffi, ammaccature, ecc.)
2. Verifica l'accuratezza dell'AI
3. Considera di aggiungere notifiche WhatsApp automatiche
4. Integra in `foto.html` per workflow completo

---

**Fatto!** 🎉 Il sistema è pronto per trovare i responsabili dei danni!
