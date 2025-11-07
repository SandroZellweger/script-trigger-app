# 🚀 DEPLOY BACKEND - Istruzioni Veloci

## Problema Attuale
- ❌ I veicoli si caricano ma NON mostrano i KM
- ❌ Le foto richiedono permessi Drive

## ✅ Soluzione: Deploy Backend Functions

### PASSO 1: Copia le Funzioni

1. **Apri** `MAINTENANCE-FUNCTIONS-TO-ADD.gs` in questo progetto
2. **Seleziona TUTTO** (Ctrl+A)
3. **Copia** (Ctrl+C)

### PASSO 2: Vai su Google Apps Script

1. Vai su: https://script.google.com/home
2. Trova il progetto: **complete-secure-script**
3. Apri il file: `complete-secure-script.gs`

### PASSO 3: Incolla le Funzioni

1. **Scorri FINO ALLA FINE** del file
2. **Incolla** (Ctrl+V) tutto il contenuto copiato
3. **Salva** (Ctrl+S)

### PASSO 4: Abilita Drive API

1. Nel menu a sinistra, clicca su **⚙️ Servizi**
2. Clicca **+ Aggiungi un servizio**
3. Cerca: **Drive API**
4. Seleziona: **Drive API v3**
5. Identificatore: `Drive` (lascia default)
6. Clicca **Aggiungi**

### PASSO 5: Deploy Nuova Versione

1. Clicca **Distribuisci** (in alto a destra)
2. Seleziona **Gestisci distribuzioni**
3. Clicca l'icona **✏️** (Modifica) sulla distribuzione attiva
4. In "Versione", seleziona **Nuova versione**
5. Descrizione: `Added maintenance functions with KM tracking`
6. Clicca **Distribuisci**

---

## 🧪 Verifica che Funzioni

### Test 1: Veicoli con KM
```
1. Apri: test-maintenance-backend.html
2. Clicca: "🚐 Test Carica Veicoli con KM"
3. Verifica: Dovrebbe mostrare veicoli con kmToService
```

**Esempio risultato atteso:**
```json
{
  "success": true,
  "vehicles": [
    {
      "name": "N01 - Opel Vivaro (Losone)",
      "calendarId": "noleggiosemplice23@gmail.com",
      "kmToService": -1469
    },
    {
      "name": "N04 - Fiat Ducato (Locarno)",
      "calendarId": "d4bcd20c...",
      "kmToService": 12165
    }
  ]
}
```

### Test 2: Maintenance App
```
1. Ricarica: maintenance-new.html
2. Seleziona un veicolo dal dropdown
3. Verifica: Dovrebbe mostrare box con:
   - "KM fino al prossimo servizio: 12,165 km"
   - "Giorni stimati: 121 giorni"
```

---

## 📸 Upload Foto - Nuovo Comportamento

Dopo il fix:
1. Clicca "📷 Clicca per caricare foto"
2. **PRIMA** si apre popup Google per permessi Drive
3. Accetta i permessi
4. **POI** si apre file chooser
5. Scegli foto
6. Upload automatico su Drive!

**Perché?** Google blocca i popup OAuth quando il file chooser è già aperto.

---

## ❓ Troubleshooting

### "Veicoli trovati: 0"
- ❌ Funzioni backend non deployate
- ✅ Segui PASSO 1-5

### "kmToService: 0" per tutti i veicoli
- ❌ Colonna KM non trovata nel foglio
- ✅ Verifica che il foglio "Configurazione veicoli" abbia colonna `KmNextService`

### "Popup blocked" per foto
- ❌ Browser blocca popup
- ✅ Ora risolto: chiediamo permessi PRIMA del file chooser

### "Drive API error"
- ❌ Drive API non abilitata
- ✅ Segui PASSO 4

---

## 🎯 Risultato Finale

Dopo il deploy:
- ✅ Lista veicoli con KM mancanti al servizio
- ✅ Box info KM quando selezioni veicolo
- ✅ Upload foto diretto su Drive (con OAuth)
- ✅ AI considera i KM per raccomandazioni
- ✅ Report salvati con tutte le info

---

## ⏱️ Tempo Necessario

- Deploy backend: **2-3 minuti**
- Test completo: **1 minuto**
- **Totale: 5 minuti** 🚀

---

**Ora vai su Google Apps Script e copia le funzioni!** 💪
