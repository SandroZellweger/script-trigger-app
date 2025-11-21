# Piano Implementazione: Analisi AI Fatture Officina

## Obiettivo
Permettere di caricare foto di fatture officina e analizzarle automaticamente con AI per estrarre:
- Costo totale
- Lista lavori effettuati
- Data fattura
- Confronto con lavori preventivati nella lista officina

## Componenti da Implementare

### 1. Frontend - Upload Fattura
- [x] Pulsante "📷 Carica Fattura" già presente nelle liste officina
- [ ] Modal per upload foto fattura
- [ ] Preview della foto prima dell'invio
- [ ] Indicatore di caricamento durante analisi AI
- [ ] Mostra risultati analisi in un pannello dedicato

### 2. Backend - Gestione Upload
- [ ] Endpoint `uploadInvoicePhotoJsonp` per ricevere foto
- [ ] Salvataggio foto nella cartella Drive delle fatture
- [ ] Collegamento foto al listId nella colonna "Foto Fattura"

### 3. AI Integration - Analisi Fattura
- [ ] Integrazione con Google Gemini Vision API (già abbiamo la chiave)
- [ ] Prompt engineering per estrarre dati strutturati:
  ```
  {
    "totalCost": "CHF 450.00",
    "worksDone": ["Cambio olio motore", "Sostituzione filtro aria"],
    "invoiceDate": "2025-11-08",
    "workshopName": "Garage Marzio Vosti"
  }
  ```
- [ ] Gestione errori se foto illeggibile o non è una fattura

### 4. Confronto e Report
- [ ] Confronta lavori fatturati vs lavori preventivati
- [ ] Calcola differenze:
  - Lavori aggiunti non preventivati
  - Lavori preventivati ma non eseguiti
- [ ] Visualizza report in formato chiaro con colori:
  - Verde: Lavori completati come previsto
  - Giallo: Lavori aggiunti
  - Rosso: Lavori mancanti

### 5. Storico Fatture
- [ ] Nuova colonna nel sheet "Liste Officina": "Foto Fattura URL"
- [ ] Mostra data upload e link alla fattura
- [ ] Possibilità di ricaricare/aggiornare fattura

### 6. Dashboard Analytics (Bonus)
- [ ] Statistiche costi per officina
- [ ] Media costi per tipo di lavoro
- [ ] Affidabilità officine (% lavori eseguiti vs preventivati)

## Struttura Dati

### Sheet "Liste Officina" - Nuove Colonne
- Colonna 15: "Foto Fattura URL" (link alla foto su Drive)
- Colonna 16: "Analisi Fattura JSON" (risultato AI)
- Colonna 17: "Data Caricamento Fattura"
- Colonna 18: "Stato Analisi" (Pending/Success/Error)

### Formato JSON Analisi
```json
{
  "invoiceData": {
    "totalCost": "CHF 450.00",
    "invoiceDate": "2025-11-08",
    "workshopName": "Garage Marzio Vosti",
    "invoiceNumber": "INV-2025-1234",
    "worksDone": [
      "Cambio olio motore",
      "Sostituzione filtro aria",
      "Controllo freni"
    ]
  },
  "comparison": {
    "worksCompleted": ["Cambio olio motore", "Sostituzione filtro aria"],
    "worksAdded": ["Controllo freni"],
    "worksMissing": [],
    "costDifference": "+50 CHF"
  },
  "aiConfidence": 0.95,
  "analysisDate": "2025-11-09T15:30:00Z"
}
```

## Ordine di Implementazione

1. **Step 1**: Aggiorna struttura database (4 nuove colonne)
2. **Step 2**: Modal upload fattura nel frontend
3. **Step 3**: Backend upload foto su Drive
4. **Step 4**: Integrazione Gemini Vision API
5. **Step 5**: Visualizzazione risultati analisi
6. **Step 6**: Report di confronto
7. **Step 7**: Testing e refinement

## Note Tecniche

### Google Gemini Vision API
- Già abbiamo una chiave API (GEMINI_API_KEY nelle Script Properties)
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`
- Supporta analisi immagini + prompt strutturato
- Rate limit: 15 richieste/minuto (sufficiente per nostro uso)

### Prompt Engineering per Fatture
```
Analizza questa fattura di officina meccanica e estrai le seguenti informazioni in formato JSON:
1. Costo totale (includi valuta)
2. Lista completa dei lavori effettuati
3. Data della fattura
4. Nome dell'officina/garage
5. Numero fattura se presente

Rispondi SOLO con JSON valido nel seguente formato:
{
  "totalCost": "importo con valuta",
  "worksDone": ["lavoro1", "lavoro2"],
  "invoiceDate": "YYYY-MM-DD",
  "workshopName": "nome officina",
  "invoiceNumber": "numero se presente"
}

Se qualche informazione non è leggibile, usa null.
```

## Sicurezza
- Validare che il file caricato sia un'immagine (JPEG/PNG)
- Limite dimensione: 5MB max
- Validare che listId esista prima di processare
- Sanitize output AI prima di salvare nel database

## UI/UX
- Mostrare preview thumbnail della fattura
- Indicatore progress durante analisi (può richiedere 3-5 secondi)
- Messaggi di errore chiari se analisi fallisce
- Possibilità di modificare manualmente i dati estratti se AI sbaglia
