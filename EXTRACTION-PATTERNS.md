# 🔍 Pattern di Estrazione Dati Cliente

## 📋 Formato Evento Calendario

### Titolo
```
$ 1 - Alessandro Barbone - CHF 0.00
```

**Pattern:** `$ [numero] - [NOME CLIENTE] - CHF [importo]`

### Descrizione
```
Veicolo: N01 - Opel Vivaro (Losone)
Indirizzo: Via vincenzo d'alberti 17 Locarno 
Numero di cellulare: +41774070742
Whatsapp: https://wa.me/41774070742
Email: noleggiosemplice23@gmail.com
Prezzo: CHF 00.00
...
Numero di riferimento: 2967
```

---

## 🎯 Logica di Estrazione

### 1. Nome Cliente

**Strategia Principale:** Estrazione dal **titolo**

```javascript
// Formato titolo: "$ 1 - Alessandro Barbone - CHF 0.00"
// Split per " - " e prendi il secondo elemento (index 1)

const parts = title.split(' - ');
if (parts.length >= 2) {
  customerName = parts[1]
    .replace(/CHF\s*[\d,.]+/gi, '') // Rimuovi CHF amounts
    .replace(/\(.*?\)/g, '')         // Rimuovi parentesi
    .trim();
}
```

**Input:** `$ 1 - Alessandro Barbone - CHF 0.00`  
**Output:** `Alessandro Barbone`

**Fallback 1:** Cerca keywords nella descrizione
- `Cliente:`, `Name:`, `Nome:`, `Customer:`

**Fallback 2:** Pulisci titolo da simboli e numeri

---

### 2. Email

**Strategia Principale:** Cerca pattern `Email: [email]`

```javascript
const emailMatch = description.match(/Email:\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
if (emailMatch) {
  customerEmail = emailMatch[1].trim();
}
```

**Regex Breakdown:**
- `Email:\s*` - Keyword "Email:" seguito da spazi opzionali
- `[a-zA-Z0-9._%+-]+` - Username (lettere, numeri, punti, underscore, %, +, -)
- `@` - Simbolo chiocciola
- `[a-zA-Z0-9.-]+` - Dominio (lettere, numeri, punti, trattini)
- `\.[a-zA-Z]{2,}` - TLD (minimo 2 caratteri)

**Input:** `Email: noleggiosemplice23@gmail.com`  
**Output:** `noleggiosemplice23@gmail.com`

**Fallback:** Cerca email ovunque nella descrizione

```javascript
const emailFallback = description.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
```

---

### 3. Telefono

**Strategia Principale:** Cerca pattern `Numero di cellulare: [phone]`

```javascript
const phoneMatch = description.match(/(?:Numero di cellulare|Telefono|Phone|Cellulare):\s*([\+\d\s]+)/i);
if (phoneMatch) {
  customerPhone = phoneMatch[1].trim();
}
```

**Regex Breakdown:**
- `(?:...)` - Non-capturing group
- `Numero di cellulare|Telefono|Phone|Cellulare` - Keywords multiple
- `:\s*` - Due punti seguito da spazi opzionali
- `([\+\d\s]+)` - Cattura: +, numeri, spazi

**Input:** `Numero di cellulare: +41774070742`  
**Output:** `+41774070742`

**Fallback:** Formati svizzeri standard

```javascript
const phoneFallback = description.match(/(\+41|0041|0)\s?([67]\d)\s?(\d{3})\s?(\d{2})\s?(\d{2})/);
```

**Formati supportati:**
- `+41 76 123 45 67`
- `+41774070742`
- `0041 79 123 45 67`
- `076 123 45 67`
- `0791234567`

---

## 📊 Esempi Completi

### Esempio 1: Evento Reale (Ref 2967)

**Titolo:**
```
$ 1 - Alessandro Barbone - CHF 0.00
```

**Descrizione:**
```
Veicolo: N01 - Opel Vivaro (Losone)
Indirizzo: Via vincenzo d'alberti 17 Locarno 
Numero di cellulare: +41774070742
Whatsapp: https://wa.me/41774070742
Email: noleggiosemplice23@gmail.com
Prezzo: CHF 00.00
Trasferta: Ticino
Franchigia: No
Deposit Refund: CHF 0
Richieste: Servizio Marzio (Pierino)
Data di contratto: 2025-11-10
Numero di riferimento: 2967
```

**Output Atteso:**
```json
{
  "name": "Alessandro Barbone",
  "email": "noleggiosemplice23@gmail.com",
  "phone": "+41774070742"
}
```

---

### Esempio 2: Formato Alternativo

**Titolo:**
```
Prenotazione 12345 - Mario Rossi
```

**Descrizione:**
```
Cliente: Mario Rossi
Email: mario.rossi@example.com
Telefono: +41 79 123 45 67
Veicolo: N3 - Nissan X-Trail
```

**Output:**
```json
{
  "name": "Mario Rossi",
  "email": "mario.rossi@example.com",
  "phone": "+41 79 123 45 67"
}
```

---

### Esempio 3: Dati Parziali

**Titolo:**
```
$ 2 - Giovanni Bianchi - CHF 50.00
```

**Descrizione:**
```
Veicolo: N2 - Fiat Ducato
Prezzo: CHF 50.00
Numero di riferimento: 1234
```

**Output:**
```json
{
  "name": "Giovanni Bianchi",
  "email": "",
  "phone": ""
}
```

*(Email e telefono vuoti se non trovati)*

---

## 🔧 Codice Completo - extractCustomerFromEvent()

```javascript
function extractCustomerFromEvent(event) {
  try {
    const title = event.getTitle();
    const description = event.getDescription() || '';
    
    let customerEmail = '';
    let customerName = '';
    let customerPhone = '';
    
    // 1. Extract EMAIL from description
    const emailMatch = description.match(/Email:\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    if (emailMatch) {
      customerEmail = emailMatch[1].trim();
    } else {
      const emailFallback = description.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailFallback) {
        customerEmail = emailFallback[0];
      }
    }
    
    // 2. Extract PHONE from description
    const phoneMatch = description.match(/(?:Numero di cellulare|Telefono|Phone|Cellulare):\s*([\+\d\s]+)/i);
    if (phoneMatch) {
      customerPhone = phoneMatch[1].trim();
    } else {
      const phoneFallback = description.match(/(\+41|0041|0)\s?([67]\d)\s?(\d{3})\s?(\d{2})\s?(\d{2})/);
      if (phoneFallback) {
        customerPhone = phoneFallback[0];
      }
    }
    
    // 3. Extract NAME from title
    let nameFromTitle = '';
    if (title.includes(' - ')) {
      const parts = title.split(' - ');
      if (parts.length >= 2) {
        nameFromTitle = parts[1]
          .replace(/CHF\s*[\d,.]+/gi, '')
          .replace(/\(.*?\)/g, '')
          .trim();
      }
    }
    
    if (nameFromTitle) {
      customerName = nameFromTitle;
    }
    
    // Fallback: try description keywords
    if (!customerName) {
      const lines = description.split('\n');
      for (const line of lines) {
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes('cliente:') || 
            lowerLine.includes('name:') ||
            lowerLine.includes('nome:') ||
            lowerLine.includes('customer:')) {
          customerName = line.split(':')[1]?.trim() || '';
          break;
        }
      }
    }
    
    // Last fallback: clean title
    if (!customerName) {
      customerName = title
        .replace(/\$/g, '')
        .replace(/\d+\s*-\s*/g, '')
        .replace(/CHF\s*[\d,.]+/gi, '')
        .replace(/\(.*?\)/g, '')
        .split('-')[0]?.trim() || 'Cliente';
    }
    
    return {
      name: customerName || 'Cliente',
      email: customerEmail || '',
      phone: customerPhone || ''
    };
    
  } catch (error) {
    Logger.log('Error extracting customer data: ' + error);
    return {
      name: 'Cliente',
      email: '',
      phone: ''
    };
  }
}
```

---

## ✅ Test Checklist

### Test con Ref 2967 (Formato Standard)
- [x] Nome: `Alessandro Barbone` ✅
- [x] Email: `noleggiosemplice23@gmail.com` ✅
- [x] Telefono: `+41774070742` ✅

### Test Formati Alternativi
- [ ] Titolo con "Prenotazione" invece di "$"
- [ ] Keywords in descrizione (Cliente:, Nome:)
- [ ] Telefono con spazi: `+41 76 123 45 67`
- [ ] Telefono formato 0041: `0041791234567`
- [ ] Email senza keyword "Email:"

### Test Edge Cases
- [ ] Descrizione vuota
- [ ] Solo nome disponibile
- [ ] Telefono formato non standard
- [ ] Email multipli (prende il primo)
- [ ] Nome con caratteri speciali

---

## 🚀 Deployment

### 1. Aggiorna Backend
```bash
# Copia complete-secure-script-with-maintenance.gs
# Deploy in Google Apps Script
# Testa con: test-extraction-2967.html
```

### 2. Verifica Estrazione
```bash
# Apri: test-extraction-2967.html
# Inserisci AUTH_TOKEN
# Click: "Test Ricerca Booking 2967"
# Verifica: ✅ tutti i campi corretti
```

### 3. Test in Produzione
```bash
# Apri: payments.html
# Settings > Aggiorna Script URL
# Cerca booking: 2967
# Verifica card dati cliente
# Crea payment link
# Verifica email pre-compilata in Stripe
```

---

## 📚 Reference

### Regex Resources
- **Email Regex:** https://emailregex.com/
- **Phone Regex:** https://regex101.com/
- **Test Online:** https://regexr.com/

### Google Apps Script
- **Calendar API:** https://developers.google.com/apps-script/reference/calendar
- **Event Methods:** `getTitle()`, `getDescription()`, `getStartTime()`, `getEndTime()`

### Stripe Integration
- **Customer Email:** Pre-compila checkout con `customer_email`
- **Metadata:** Traccia `vehicle_id`, `booking_reference`, `payment_type`

---

**Autore:** GitHub Copilot  
**Data Aggiornamento:** 18 Novembre 2025  
**Versione:** 2.0.0 - Fixed Name Extraction
