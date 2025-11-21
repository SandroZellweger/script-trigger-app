# 🔧 MODIFICHE SISTEMA MANUTENZIONE - 08/11/2025

## ✅ Modifiche Implementate

### 1. **Filtro Veicoli - Solo con "N" davanti**

#### Frontend (maintenance-new.html)
**Funzione `loadVehicles()` modificata:**
```javascript
// Filter vehicles: only include those starting with "N"
const filteredVehicles = response.vehicles.filter(vehicle => {
    const vehicleName = vehicle.name || vehicle.vehicleType || '';
    return vehicleName.trim().toUpperCase().startsWith('N');
});

currentVehicles = filteredVehicles;
```

**Risultato:**
- ✅ Nel dropdown "Seleziona Veicolo" appaiono SOLO veicoli con nome che inizia con "N"
- ✅ Esempio: "N001 Sprinter", "N002 Ducato" → INCLUSI
- ✅ Esempio: "Auto Alessandro", "T001 Trailer" → ESCLUSI
- ✅ Log console: "✅ Loaded X vehicles (filtered with "N")"

#### Backend (MAINTENANCE-FUNCTIONS-TO-ADD.gs)
**Funzione `getVehicleListWithKm()` modificata:**
```javascript
// Check if vehicle has name and calendar ID (skip empty rows)
// AND filter: only include vehicles starting with "N"
if (row[nameIndex] && row[idIndex] && vehicleName.toString().trim().toUpperCase().startsWith('N')) {
    vehicles.push({
        name: row[nameIndex],
        calendarId: row[idIndex],
        id: row[idIndex],
        kmToService: parseInt(row[kmIndex]) || 0
    });
}
```

**Risultato:**
- ✅ Il backend filtra già i veicoli prima di inviarli al frontend
- ✅ Riduce il carico di dati trasferiti
- ✅ Coerente con filtro frontend

---

### 2. **KM Negativi - Visualizzazione "FUORI SERVIZIO"**

#### Frontend (maintenance-new.html)
**Funzione `handleVehicleChange()` modificata:**

**Comportamento PRIMA:**
```javascript
if (kmToService > 0) {
    // Mostrava solo se KM > 0
    document.getElementById('kmInfo').style.display = 'grid';
} else {
    document.getElementById('kmInfo').style.display = 'none'; // Nascondeva se <= 0
}
```

**Comportamento DOPO:**
```javascript
if (kmToService !== 0) {
    // Mostra per qualsiasi valore non-zero (positivo O negativo)
    
    if (kmToService < 0) {
        // KM NEGATIVI - Veicolo fuori servizio
        document.getElementById('kmInfo').style.borderColor = '#ff6b6b';
        document.getElementById('kmInfo').style.background = '#fff0f0';
        document.getElementById('kmToService').innerHTML = 
            `⚠️ ${Math.abs(kmToService).toLocaleString('it-IT')} km 
             <span style="color: #ff6b6b; font-weight: bold;">FUORI SERVIZIO</span>`;
        document.getElementById('daysToService').innerHTML = 
            `⚠️ ${daysToService} giorni di ritardo`;
    } else {
        // KM POSITIVI - Veicolo ok
        document.getElementById('kmInfo').style.borderColor = '#667eea';
        document.getElementById('kmInfo').style.background = 'transparent';
        document.getElementById('kmToService').textContent = 
            kmToService.toLocaleString('it-IT') + ' km';
        document.getElementById('daysToService').textContent = 
            daysToService + ' giorni';
    }
}
```

**Risultato Visivo:**

**Esempio 1 - KM Positivi (veicolo OK):**
```
┌─────────────────────────────────────────┐
│ KM fino al prossimo servizio            │
│ 5,250 km                                │
│                                          │
│ Giorni stimati (100km/giorno)           │
│ 52 giorni                               │
└─────────────────────────────────────────┘
```
- Bordo blu (#667eea)
- Sfondo trasparente
- Testo normale

**Esempio 2 - KM Negativi (veicolo FUORI SERVIZIO):**
```
┌─────────────────────────────────────────┐ ⬅️ Bordo ROSSO
│ KM fino al prossimo servizio            │ ⬅️ Sfondo ROSA CHIARO
│ ⚠️ 1,200 km FUORI SERVIZIO             │ ⬅️ ROSSO GRASSETTO
│                                          │
│ Giorni stimati (100km/giorno)           │
│ ⚠️ 12 giorni di ritardo                 │ ⬅️ Simbolo attenzione
└─────────────────────────────────────────┘
```
- Bordo rosso (#ff6b6b)
- Sfondo rosa chiaro (#fff0f0)
- Testo "FUORI SERVIZIO" in rosso grassetto
- Simbolo ⚠️ su entrambe le righe
- Calcolo giorni di ritardo (valore assoluto)

---

## 📋 File Modificati

### 1. maintenance-new.html
**Righe modificate:**
- `loadVehicles()` funzione (circa riga 1180-1210)
- `handleVehicleChange()` funzione (circa riga 1230-1260)

**Totale righe file:** 2546 righe

### 2. MAINTENANCE-FUNCTIONS-TO-ADD.gs
**Righe modificate:**
- `getVehicleListWithKm()` funzione (circa riga 25-45)

**Totale righe file:** 662 righe

---

## 🧪 Test da Eseguire

### Test 1: Filtro Veicoli con "N"
1. ✅ Apri `maintenance-new.html`
2. ✅ Guarda il dropdown "Seleziona Veicolo"
3. ✅ Verifica che ci siano SOLO veicoli con "N" davanti
4. ✅ Console: Vedi "✅ Loaded X vehicles (filtered with "N")"

**Veicoli da VEDERE:**
- ✅ N001 Sprinter
- ✅ N002 Ducato
- ✅ N003 Transit

**Veicoli da NON VEDERE:**
- ❌ Auto Alessandro
- ❌ T001 Trailer
- ❌ Furgone Vecchio

### Test 2: KM Negativi - Fuori Servizio
1. ✅ Apri `maintenance-new.html`
2. ✅ Seleziona un veicolo con KM NEGATIVI (es: -1200)
3. ✅ Verifica che appare il box rosso con:
   - ⚠️ simbolo attenzione
   - Testo "FUORI SERVIZIO" in rosso
   - Bordo rosso
   - Sfondo rosa chiaro
   - Giorni di ritardo calcolati
4. ✅ Seleziona un veicolo con KM POSITIVI (es: 5250)
5. ✅ Verifica che appare il box blu normale

### Test 3: PDF Wizard - Veicoli Filtrati
1. ✅ Vai su tab "Report Attivi"
2. ✅ Clicca "📄 Crea Lista Manutenzione (PDF)"
3. ✅ Step 1: Dropdown veicoli mostra SOLO quelli con "N"
4. ✅ Seleziona veicolo e procedi

### Test 4: Filtro Report Attivi
1. ✅ Vai su tab "Report Attivi"
2. ✅ Dropdown filtro veicoli mostra SOLO quelli con "N"
3. ✅ Filtra per un veicolo specifico
4. ✅ Verifica che mostra solo i report di quel veicolo

---

## 🚀 Deployment Backend

**⚠️ IMPORTANTE:** Devi deployare le modifiche al backend!

### Step 1: Copia Functions
1. Apri `MAINTENANCE-FUNCTIONS-TO-ADD.gs`
2. Copia TUTTO il contenuto (Ctrl+A, Ctrl+C)
3. Vai su https://script.google.com/home
4. Apri `complete-secure-script.gs`
5. Scroll fino alla FINE del file
6. Incolla (Ctrl+V)

### Step 2: Deploy Nuova Versione
1. Click "Distribuisci" → "Gestisci distribuzioni"
2. Click ✏️ (Edit) sulla distribuzione attiva
3. Versione → "Nuova versione"
4. Descrizione: "Filtro veicoli con N + KM negativi visualizzati"
5. Click "Distribuisci"

### Step 3: Verifica
1. Apri `maintenance-new.html`
2. Console: Verifica che carica veicoli filtrati
3. Test selezione veicolo con KM negativi

---

## 📝 Note Tecniche

### Logica Filtro "N"
```javascript
vehicleName.trim().toUpperCase().startsWith('N')
```
- `trim()` - Rimuove spazi bianchi all'inizio/fine
- `toUpperCase()` - Converte in maiuscolo (case-insensitive)
- `startsWith('N')` - Controlla se inizia con "N"

**Esempi:**
- ✅ "N001 Sprinter" → TRUE
- ✅ "n002 Ducato" → TRUE (minuscolo convertito)
- ✅ " N003 Transit" → TRUE (spazio trimmed)
- ❌ "Auto N001" → FALSE (N non all'inizio)
- ❌ "Sprinter" → FALSE (non inizia con N)

### Calcolo KM Negativi
```javascript
const daysToService = Math.floor(Math.abs(kmToService) / 100);
```
- `Math.abs()` - Valore assoluto (rimuove segno negativo)
- Calcolo giorni di ritardo basato su 100 km/giorno
- Esempio: -1200 km → 12 giorni di ritardo

### Stili Condizionali
```javascript
// KM negativi
borderColor: '#ff6b6b'   // Rosso
background: '#fff0f0'    // Rosa chiaro
color: '#ff6b6b'         // Testo rosso

// KM positivi
borderColor: '#667eea'   // Blu
background: 'transparent' // Trasparente
color: normal            // Testo nero
```

---

## ✅ Checklist Finale

- [x] Filtro veicoli "N" implementato nel frontend
- [x] Filtro veicoli "N" implementato nel backend
- [x] KM negativi visualizzati con stile rosso
- [x] Simbolo ⚠️ aggiunto per KM negativi
- [x] Testo "FUORI SERVIZIO" in rosso grassetto
- [x] Calcolo giorni di ritardo per KM negativi
- [x] Compatibilità con wizard PDF
- [x] Compatibilità con filtro report attivi
- [ ] **PENDING:** Deploy backend su Google Apps Script

---

## 🎯 Riepilogo Modifiche

| Funzionalità | Prima | Dopo |
|--------------|-------|------|
| **Veicoli nel dropdown** | Tutti i veicoli | Solo veicoli con "N" davanti |
| **KM = 0** | Nascosto | Nascosto |
| **KM > 0** | Mostrato (blu) | Mostrato (blu) |
| **KM < 0** | Nascosto | ⚠️ Mostrato ROSSO "FUORI SERVIZIO" |

---

**Data:** 08 Novembre 2025  
**Versione:** 1.2  
**Autore:** GitHub Copilot
