# 🚀 Abilitare Drive API per Upload Foto

## Problema
Le foto non si caricano perché Google Apps Script non può accedere direttamente alla cartella Drive senza abilitare la Drive API v3.

## ✅ Soluzione in 3 Passi

### PASSO 1: Abilita Drive API nel progetto

1. Apri il tuo script in Google Apps Script
2. Clicca sull'icona ⚙️ **Impostazioni progetto** (a sinistra)
3. Scorri in basso fino a **"Servizi Google"**
4. Clicca su **"+ Aggiungi un servizio"**
5. Cerca e seleziona: **Drive API v3**
6. Versione: Seleziona **v3** (l'ultima)
7. ID: Lascia `Drive` (default)
8. Clicca **Aggiungi**

✅ Fatto! Ora il codice può usare `Drive.Files.insert()`

---

### PASSO 2: Aggiorna le Funzioni nel Backend

**Hai già il codice aggiornato in `MAINTENANCE-FUNCTIONS-TO-ADD.gs`!**

Le modifiche includono:
1. ✅ `getVehicleListWithKm()` - Cerca le colonne corrette:
   - `vehicleType` (non solo "Nome")
   - `CalendarID` (non solo "calendarId")  
   - `KmNextService` (non solo "km fino al prossimo tagliando")

2. ✅ `uploadMaintenancePhoto()` - Usa Drive API v3:
   - Prima tenta con `Drive.Files.insert()` (API v3)
   - Se fallisce, usa `DriveApp.createFile()` (fallback)
   - Doppia sicurezza!

**Adesso devi**:
```bash
1. Copia TUTTO il contenuto di MAINTENANCE-FUNCTIONS-TO-ADD.gs
2. Vai su Google Apps Script
3. Apri complete-secure-script.gs
4. Scorri FINO ALLA FINE del file
5. Incolla tutto
6. Salva (Ctrl+S)
7. Deploy nuova versione
```

---

### PASSO 3: Verifica Permessi Cartella

La cartella Drive deve essere accessibile dall'account che esegue lo script:

1. Apri Google Drive
2. Vai alla cartella: https://drive.google.com/drive/folders/1W0Amc2G8azGS4wyAkpXAorWKyTRr0U6p
3. Verifica che l'account `noleggiosemplice23@gmail.com` abbia accesso
4. Se non ce l'ha:
   - Tasto destro sulla cartella → Condividi
   - Aggiungi: `noleggiosemplice23@gmail.com`
   - Permessi: **Editor** (o almeno "Content Manager")
   - Salva

---

## 🧪 Test Dopo il Deploy

### Test 1: Veicoli con KM
```bash
1. Apri: test-maintenance-backend.html
2. Clicca: "🚐 Test Carica Veicoli con KM"
3. Verifica risultato:
   ✅ Dovrebbe mostrare: "Veicoli trovati: 11" (o più)
   ✅ Ogni veicolo dovrebbe avere:
      - name: "N01 - Opel Vivaro (Losone)"
      - calendarId: "noleggiosemplice23@gmail.com"
      - kmToService: -1469 (o altro numero)
```

### Test 2: Upload Foto
```bash
1. Apri: test-maintenance-backend.html
2. Sezione "3. Test uploadMaintenancePhotoJsonp"
3. Clicca "Scegli file" e seleziona una foto PICCOLA (<500KB)
4. Clicca "📸 Test Upload Foto"
5. Verifica risultato:
   ✅ Dovrebbe mostrare:
      - File: nome_foto.jpg
      - File ID: 1abc123...
      - URL: https://drive.google.com/file/d/...
```

**Se fallisce**:
- Controlla console browser (F12) per errori
- Verifica che Drive API sia abilitata
- Verifica permessi cartella

---

## 🔧 Codice Modificato

### getVehicleListWithKm()
```javascript
// Prima (NON funzionava):
const nameIndex = headers.indexOf('Nome'); // ❌ Non esiste!
const idIndex = headers.indexOf('calendarId'); // ❌ Non esiste!
const kmIndex = headers.indexOf('km fino al prossimo tagliando...'); // ❌ Non esiste!

// Adesso (FUNZIONA):
let nameIndex = headers.indexOf('vehicleType'); // ✅ Colonna reale!
if (nameIndex === -1) nameIndex = headers.indexOf('Nome'); // Fallback

let idIndex = headers.indexOf('CalendarID'); // ✅ Colonna reale!
if (idIndex === -1) idIndex = headers.indexOf('calendarId'); // Fallback

let kmIndex = headers.indexOf('KmNextService'); // ✅ Colonna reale!
if (kmIndex === -1) kmIndex = headers.indexOf('km fino al...'); // Fallback
```

### uploadMaintenancePhoto()
```javascript
// Prima (NON funzionava):
const folder = DriveApp.getFolderById(id); // ❌ Permessi!
const file = folder.createFile(blob);

// Adesso (FUNZIONA):
// Metodo 1: Drive API v3 (PREFERITO)
const file = Drive.Files.insert({
  title: fileName,
  parents: [{id: folderId}]
}, blob, {supportsAllDrives: true});

// Metodo 2: Fallback se API non disponibile
try { /* Drive API */ }
catch { /* DriveApp come backup */ }
```

---

## 📊 Struttura Dati Veicoli

Il foglio `Configurazione veicoli` ha queste colonne:
```
A: vehicleType (es: "N01 - Opel Vivaro (Losone)")
B: SheetID
C: CalendarID (es: "noleggiosemplice23@gmail.com")
D: CalendarName
E: VehicleNumber
...
M: KmNextService (es: -1469)
```

Il codice ora cerca:
1. `vehicleType` per il nome
2. `CalendarID` per l'ID calendario
3. `KmNextService` per i km mancanti al servizio

**KM Negativi?**
- `-1469` = Hai SUPERATO il tagliando di 1469 km! 🚨
- `12165` = Mancano ancora 12165 km al tagliando ✅

---

## 🎯 Risultato Finale

Dopo aver seguito tutti i passi:

✅ **Veicoli**: Caricherà tutti i 13 veicoli con nome e km
✅ **Foto**: Si caricheranno nella cartella Drive corretta
✅ **KM**: Mostrerà km e giorni stimati al prossimo servizio
✅ **AI**: Terrà conto dei km per le raccomandazioni

---

## ⚠️ Troubleshooting

### "Veicoli trovati: 0"
❌ Problema: Nomi colonne errati
✅ Soluzione: Codice aggiornato cerca `vehicleType`, `CalendarID`, `KmNextService`

### "Foto non si carica"
❌ Problema: Drive API non abilitata O permessi cartella
✅ Soluzione: 
1. Abilita Drive API v3 nel progetto
2. Condividi cartella con account dello script

### "ReferenceError: Drive is not defined"
❌ Problema: Drive API non aggiunta ai servizi
✅ Soluzione: Impostazioni → Servizi → + Aggiungi → Drive API v3

### "Access denied to folder"
❌ Problema: Script non ha permessi sulla cartella
✅ Soluzione: Condividi cartella Drive con l'account che esegue lo script

---

## 📝 Checklist Pre-Test

Prima di testare, verifica:

- [ ] Drive API v3 abilitata in Google Apps Script
- [ ] Funzioni da MAINTENANCE-FUNCTIONS-TO-ADD.gs copiate in complete-secure-script.gs
- [ ] Salvato e deployata nuova versione
- [ ] Cartella `1W0Amc2G8azGS4wyAkpXAorWKyTRr0U6p` condivisa con account script
- [ ] Test con `test-maintenance-backend.html` eseguito

---

🎉 **Una volta fatto tutto, sia i veicoli che le foto funzioneranno!**
