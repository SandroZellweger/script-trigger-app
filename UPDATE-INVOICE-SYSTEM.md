# 🔄 Aggiornamento Sistema Fatture - Piano Implementazione

## 🎯 Nuove Funzionalità Richieste

### 1️⃣ **Bottone "Sposta in Storico"**
- Posizione: Nelle Liste Officina
- Funzione: Archivia lavori completati una volta arrivata la fattura
- Azione: Cambia "Stato Lavoro" da "In Officina" a "Completato"

### 2️⃣ **Estrazione Costi Singoli**
- AI estrae costo per ogni lavoro (non solo totale)
- Formato JSON modificato per includere oggetti con {description, cost}
- Salva costi singoli in "Storico Lavori"

### 3️⃣ **Gestione Officine con Match Automatico**
- Sheet "Anagrafica Officine" con:
  - Nome officina
  - Nomi alternativi (per il matching)
  - Indirizzo
  - Telefono
  - Email
  - Note
- AI cerca nome in lista esistente
- Se trova match → associa automaticamente
- Se nuovo → propone di aggiungere

### 4️⃣ **Storico per Officina**
Per ogni officina mostrare:
- Elenco veicoli portati
- Date degli interventi
- Kilometraggi
- Totali fatture
- Statistiche (costo medio, frequenza, ecc.)

---

## 📝 Modifiche da Fare

### **BACKEND (complete-secure-script-with-maintenance.gs)**

#### A. Aggiorna prompt AI (3 funzioni)
```javascript
// In analyzeInvoiceImageWithAI, analyzeInvoiceWithAI, analyzeInvoiceTextWithAI
// Nuovo formato JSON:
{
  "invoiceData": {
    "totalCost": "874.79 CHF",
    "invoiceDate": "2025-06-30",
    "workshopName": "Garage XYZ SA",  // Nome ESATTO
    "invoiceNumber": "250254",
    "vehicleKm": 45000,                // NUOVO
    "worksDone": [                     // MODIFICATO: ora oggetti
      {
        "description": "Cambio olio motore",
        "cost": "120.00 CHF"           // NUOVO
      }
    ]
  },
  "comparison": {
    "worksCompleted": [                // MODIFICATO: ora oggetti
      {
        "description": "Cambio olio",
        "cost": "120.00 CHF"
      }
    ],
    "worksAdded": [                    // MODIFICATO: ora oggetti
      {
        "description": "Servizio annuale",
        "cost": "250.00 CHF"
      }
    ],
    "worksMissing": ["Controllo freni"] // Resta array stringhe
  }
}
```

#### B. Crea Sheet "Anagrafica Officine"
```javascript
function createWorkshopsSheet() {
  // Headers: Nome | Nomi Alternativi | Indirizzo | Telefono | Email | Note | Ultimo Intervento | Totale Fatture
}
```

#### C. Funzione Match Officina
```javascript
function findOrCreateWorkshop(workshopName) {
  // 1. Cerca in "Anagrafica Officine"
  // 2. Match fuzzy su nome e alternativi
  // 3. Se trova → return workshopId
  // 4. Se non trova → proponi creazione
}
```

#### D. Aggiorna saveInvoiceToHistory
```javascript
// Salva anche:
// - Costi singoli per lavoro
// - Kilometraggio veicolo
// - Link a officina (ID)
```

#### E. Funzione Storico Officina
```javascript
function getWorkshopHistory(workshopName) {
  // Return:
  // - Veicoli portati
  // - Date interventi
  // - Km per intervento
  // - Totali fatture
  // - Statistiche
}
```

#### F. Funzione "Sposta in Storico"
```javascript
function archiveWorkshopList(listId) {
  // 1. Trova lista in "Liste Officina"
  // 2. Cambia "Stato Lavoro" → "Completato"
  // 3. Aggiorna "Data Completamento"
  // 4. Opzionale: sposta in sheet "Liste Archiviate"
}
```

---

### **FRONTEND (maintenance-new.html)**

#### A. Bottone "Sposta in Storico"
```html
<!-- In ogni lista officina -->
<button onclick="archiveList('${listId}')" class="btn-archive">
  📦 Sposta in Storico
</button>
```

```javascript
async function archiveList(listId) {
  // Conferma utente
  if (!confirm('Archiviare questa lista officina?')) return;
  
  // Call backend
  const result = await callJsonp('archiveWorkshopListJsonp', {listId});
  
  // Success feedback
  showNotification('✅ Lista archiviata!', 'success');
  loadWorkshopLists(); // Reload
}
```

#### B. Mostra Costi Singoli
```javascript
function showInvoiceAnalysisResults(result) {
  // Modifica per mostrare costo per ogni lavoro
  // Esempio:
  // ✅ Cambio olio motore - 120.00 CHF
  // ➕ Servizio annuale - 250.00 CHF
}
```

#### C. Modal Storico Officina
```javascript
function showWorkshopHistory(workshopName) {
  // Apre modal con:
  // - Tabella interventi
  // - Grafici statistiche
  // - Totali
}
```

#### D. Gestione Officine Nuove
```javascript
function handleNewWorkshop(workshopName) {
  // Se AI trova officina nuova
  // Mostra modal: "Aggiungi a Anagrafica Officine?"
  // Form: Nome | Indirizzo | Telefono | Email
}
```

---

## 🎨 UI Mockup

### Liste Officina (con nuovo bottone)
```
┌────────────────────────────────────────┐
│ 📋 Lista N1 - Garage ABC               │
│ ────────────────────────────────────── │
│ Stato: In Officina                     │
│ Data Creazione: 2025-11-01             │
│                                        │
│ [🤖 Analizza Fattura]                  │
│ [📁 Seleziona da Drive]                │
│ [📦 Sposta in Storico] ← NUOVO         │
└────────────────────────────────────────┘
```

### Analisi Fattura (con costi singoli)
```
┌────────────────────────────────────────┐
│ 🤖 Analisi Fattura AI                  │
│ 📷 Vedi Foto │ 🏢 Garage ABC SA        │
│ 💰 Totale: 874.79 CHF │ 📅 2025-06-30 │
│ 🚗 Kilometri: 45,000 km                │
│ ────────────────────────────────────── │
│ ✅ Completati:                         │
│   • Cambio olio - 120.00 CHF           │
│   • Filtro olio - 45.00 CHF            │
│ ➕ Aggiunti:                           │
│   • Servizio annuale - 250.00 CHF      │
│   • Filtro aria - 35.00 CHF            │
│ ❌ Mancanti:                           │
│   • Controllo freni                    │
│ ────────────────────────────────────── │
│ [💾 Salvato in Storico Lavori]         │
│ [✅ 4 problemi completati]             │
└────────────────────────────────────────┘
```

### Storico Officina
```
┌────────────────────────────────────────┐
│ 🏢 Garage ABC SA - Storico             │
│ ────────────────────────────────────── │
│ 📊 Statistiche:                        │
│   • Interventi totali: 12              │
│   • Costo medio: CHF 650               │
│   • Ultimo intervento: 2025-11-01      │
│ ────────────────────────────────────── │
│ 📋 Interventi:                         │
│                                        │
│ 2025-11-01 │ N1 │ 45,000 km │ 874 CHF │
│ 2025-09-15 │ N2 │ 32,000 km │ 450 CHF │
│ 2025-07-20 │ N1 │ 42,000 km │ 320 CHF │
│                                        │
│ [📊 Vedi Report Dettagliato]           │
└────────────────────────────────────────┘
```

---

## 📊 Struttura Dati Aggiornata

### Sheet "Storico Lavori" (colonne modificate)
```
| Data | ID Veicolo | Nome Veicolo | Tipo | Descrizione | Costo CHF | Km Veicolo | Officina | ID Officina | N° Fattura | Link | Note |
```

### Sheet "Anagrafica Officine" (NUOVO)
```
| ID | Nome | Nomi Alternativi | Indirizzo | Telefono | Email | Note | Ultimo Intervento | Totale Fatture | N° Interventi |
```

### Sheet "Liste Officina" (colonna aggiunta)
```
| ... esistenti ... | Km Veicolo | ID Officina | ...
```

---

## 🚀 Priorità Implementazione

1. **PRIORITÀ ALTA**
   - ✅ Estrazione costi singoli (AI prompt)
   - ✅ Bottone "Sposta in Storico"
   - ✅ Salvataggio costi in Storico Lavori

2. **PRIORITÀ MEDIA**
   - ⭕ Sheet Anagrafica Officine
   - ⭕ Match automatico officina
   - ⭕ Salvataggio Km veicolo

3. **PRIORITÀ BASSA**
   - ⭕ Storico per officina
   - ⭕ Statistiche e report
   - ⭕ Modal gestione officine nuove

---

## ✅ Implementare Ora

Vuoi che implementi:
1. **Solo Priorità Alta** (veloce, 15 min)
2. **Alta + Media** (completo, 30 min)
3. **Tutto** (sistema completo, 45 min)

Cosa preferisci? 🎯
