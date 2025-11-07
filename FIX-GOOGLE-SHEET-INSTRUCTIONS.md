# 🔧 Istruzioni per Sistemare il Google Sheet "Difetti e Riparazioni"

## Problema Attuale
Il foglio Google Sheet ha questi problemi:
1. ❌ Mancano i titoli delle colonne (headers)
2. ❌ I dati della prima colonna (reportId) non ci sono
3. ❌ La colonna "completed" mostra "FALSE" invece di checkbox
4. ❌ Nessuna formattazione con colori

## Soluzione 1️⃣: Cancella e Ricrea (RACCOMANDATO)

### Opzione A - Cancella tutto e lascia che il codice ricrei
1. Apri il Google Sheet: https://docs.google.com/spreadsheets/d/1e4jz3L_hV5nAic6QwxW2D9BZYggvAPeLH9tcGpHAYA/edit
2. **ELIMINA** completamente il foglio "Difetti e Riparazioni"
3. Copia le funzioni aggiornate da `MAINTENANCE-FUNCTIONS-TO-ADD.gs` nel tuo `complete-secure-script.gs` in Google Apps Script
4. Fai un nuovo deployment (versione nuova)
5. Crea un nuovo report da `maintenance-new.html`
6. ✅ Il foglio verrà creato automaticamente con:
   - Headers in italiano con sfondo viola (#667eea)
   - Checkbox nella colonna "Completato"
   - Colori per urgenza (🟢 Bassa, 🟡 Media, 🟠 Alta, 🔴 Critica)
   - Link alle foto cliccabili
   - Prima riga congelata

### Opzione B - Crea il foglio manualmente con la struttura corretta

**Passo 1: Elimina il foglio attuale**
- Tasto destro su "Difetti e Riparazioni" → Elimina

**Passo 2: Crea nuovo foglio**
- Crea un nuovo foglio chiamato esattamente: `Difetti e Riparazioni`

**Passo 3: Aggiungi gli headers (prima riga)**
Copia e incolla questa riga nella ROW 1 (colonne A-S):
```
ID Report | Data Segnalazione | Nome Veicolo | ID Veicolo | Segnalato Da | Categoria | Descrizione Problema | Urgenza | Stato | Completato | Data Completamento | Tipo Riparazione | Costo (CHF) | Garage/Officina | N. Fattura | Link Foto | ID Foto Drive | N. Problema | Totale Problemi
```

**Passo 4: Formatta gli headers**
1. Seleziona la riga 1 (tutta)
2. Sfondo: **viola** (#667eea)
3. Testo: **bianco** (#ffffff)
4. Grassetto: **✓**
5. Allineamento: **centrato**

**Passo 5: Congela la prima riga**
- Visualizza → Blocca → 1 riga

**Passo 6: Aggiungi checkbox alla colonna J (Completato)**
1. Seleziona tutta la colonna J (dalla riga 2 in giù)
2. Inserisci → Casella di controllo

✅ Fatto! Ora quando salvi un report, i dati verranno inseriti correttamente.

---

## Soluzione 2️⃣: Sistema i Dati Esistenti (più complesso)

Se vuoi mantenere i dati già inseriti:

**Passo 1: Aggiungi colonna reportId**
1. Inserisci una colonna PRIMA della colonna A
2. Nella nuova colonna A, riga 1: scrivi `ID Report`
3. Nelle righe sotto, aggiungi manualmente un ID per ogni report (es: `RPT-001`, `RPT-002`)

**Passo 2: Aggiungi headers**
- Inserisci una riga PRIMA della riga 1
- Copia gli headers dalla Soluzione 1, Passo 3

**Passo 3: Converti FALSE in checkbox**
1. Seleziona tutta la colonna J (Completato)
2. Inserisci → Casella di controllo
3. Le celle con FALSE diventeranno checkbox vuote ☐

**Passo 4: Formatta urgenza**
Per ogni riga:
- Se urgenza = "medium" → scrivi `🟡 Media` e sfondo #fff9c4
- Se urgenza = "low" → scrivi `🟢 Bassa` e sfondo #c8e6c9
- Se urgenza = "high" → scrivi `🟠 Alta` e sfondo #ffccbc
- Se urgenza = "critical" → scrivi `🔴 Critica` e sfondo #ffcdd2

**Passo 5: Formatta stato**
- Celle "open" → scrivi `Aperto` con sfondo #e3f2fd
- Celle "completed" → scrivi `✅ Completato` con sfondo #c8e6c9

---

## 🚀 Prossimi Passi (IMPORTANTE!)

Dopo aver sistemato il foglio:

1. **Copia le funzioni backend aggiornate:**
   - Apri `MAINTENANCE-FUNCTIONS-TO-ADD.gs` 
   - Copia TUTTO il contenuto
   - Vai su Google Apps Script
   - Apri `complete-secure-script.gs`
   - Incolla ALLA FINE del file

2. **Deploy nuova versione:**
   - Distribuisci → Gestisci distribuzioni
   - Modifica → Nuova versione
   - Distribuisci

3. **Testa:**
   - Vai su `maintenance-new.html`
   - Crea un nuovo report
   - Controlla che:
     - ✅ Appare il reportId (RPT-...)
     - ✅ Gli headers sono visibili
     - ✅ La colonna "Completato" ha checkbox
     - ✅ I colori sono applicati
     - ✅ Le foto sono linkate (se caricate)

---

## 📸 Dove Vanno le Foto?

Le foto caricate vengono salvate in:
```
Google Drive → [TUA CARTELLA PRINCIPALE] → Maintenance Photos
```

- `PARENT_FOLDER_ID` è configurato nelle Script Properties
- Le foto sono visibili come link cliccabili nella colonna "Link Foto"
- Gli ID delle foto sono in "ID Foto Drive" (per riferimento)

---

## ⚠️ Note Importanti

1. **reportId mancante nei dati vecchi**: I report esistenti non hanno reportId perché il frontend non lo generava. Adesso sì (generato come `RPT-[timestamp]`)

2. **Checkbox vs FALSE**: Le checkbox sono molto più user-friendly. Il codice ora inserisce checkbox automaticamente.

3. **Formattazione automatica**: Il nuovo codice applica automaticamente:
   - Colori urgenza
   - Colori stato
   - Checkbox
   - Link foto
   - Headers formattati

4. **Colonna foto**: Mostra link cliccabili tipo "Foto 1 | Foto 2 | Foto 3" invece di URL lunghi

---

## 🆘 Se qualcosa non funziona

Controlla:
1. ✅ MAINTENANCE_SHEET_ID nelle Script Properties è corretto
2. ✅ Il nome del foglio è ESATTAMENTE "Difetti e Riparazioni"
3. ✅ Le funzioni da MAINTENANCE-FUNCTIONS-TO-ADD.gs sono copiate in Google Apps Script
4. ✅ Hai fatto un nuovo deployment
5. ✅ Il browser ha il token corretto (mySecureVanApp_2025)

---

**Consiglio finale**: Usa la **Soluzione 1 - Opzione A** (elimina e ricrea). È la più semplice e garantisce che tutto funzioni perfettamente! 🎯
