# 🔍 Sistema di Ricerca Prenotazioni - Guida Completa

## 📋 Panoramica

Il sistema di ricerca prenotazioni permette di:
1. Cercare una prenotazione tramite numero di riferimento
2. Estrarre automaticamente i dati del cliente (email, telefono, nome)
3. Pre-compilare l'email del cliente nel checkout Stripe
4. Tracciare i pagamenti con metadata (veicolo, riferimento, tipo)

## 🏗️ Architettura

### Backend (complete-secure-script-with-maintenance.gs)

#### Nuove Funzioni

1. **findBookingByReference(referenceNumber)**
   - Cerca in tutti i calendari dei veicoli (12 mesi indietro + 6 mesi avanti)
   - Confronta il riferimento con titolo e descrizione dell'evento
   - Restituisce oggetto booking con tutti i dati

2. **extractCustomerFromEvent(event)**
   - Estrae email con regex: `/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/`
   - Estrae telefono svizzero con regex: `/(\+41|0041|0)\s?([67]\d)\s?(\d{3})\s?(\d{2})\s?(\d{2})/`
   - Cerca nome con keywords: "Cliente:", "Name:", "Nome:"
   - Fallback: usa il titolo dell'evento come nome cliente

3. **findBookingByReferenceJsonp(params)**
   - Wrapper JSONP per chiamate dal frontend
   - Parametri: `referenceNumber`, `callback`

#### Funzioni Modificate

1. **triggerStripePayment(amount, description, account, customerEmail, vehicleId, bookingRef)**
   - Aggiunti 3 nuovi parametri opzionali
   - Passa i dati a `createStripeCheckoutSession()`

2. **createStripeCheckoutSession()**
   - Aggiunto `customer_email` con `customer_creation=always`
   - Aggiunto `metadata` object:
     ```javascript
     metadata: {
       vehicle_id: vehicleId,
       booking_reference: bookingRef,
       payment_type: description,
       account: accountType,
       timestamp: new Date().toISOString()
     }
     ```
   - Updated success/cancel URLs to GitHub Pages

3. **triggerStripePaymentJsonp(params)**
   - Legge nuovi parametri: `customerEmail`, `vehicleId`, `bookingRef`
   - Passa tutto a `triggerStripePayment()`

### Frontend (payments.html)

#### Nuovi Elementi UI

```html
<!-- Campo Ricerca Booking -->
<div class="input-group">
    <label for="bookingRef">🔍 Numero Riferimento Prenotazione (opzionale)</label>
    <div style="display: flex; gap: 10px;">
        <input type="text" id="bookingRef" placeholder="Es: 12345 o N3-12345">
        <button onclick="searchBooking()">Cerca</button>
    </div>
    <small id="bookingStatus"></small>
</div>

<!-- Visualizzazione Dati Cliente -->
<div id="customerInfo" style="display: none;">
    <h4>✅ Dati Cliente Trovati</h4>
    <div id="customerDetails"></div>
</div>
```

#### Nuove Funzioni JavaScript

1. **searchBooking()**
   - Legge input `bookingRef`
   - Chiama `makeJsonpRequest('findBookingByReferenceJsonp', { referenceNumber })`
   - Salva risultato in `currentBooking`
   - Chiama `displayCustomerInfo()` se trovato

2. **displayCustomerInfo(booking)**
   - Mostra dati cliente in una card formattata
   - Visualizza: nome, email, telefono, veicolo, date, riferimento

3. **formatDate(isoString)**
   - Formatta date in formato italiano: `dd MMMM yyyy, HH:mm`
   - Usa `toLocaleDateString('it-CH')`

4. **makeJsonpRequest(functionName, params)**
   - Helper generico per chiamate JSONP
   - Crea callback univoco
   - Gestisce cleanup

#### Funzioni Modificate

1. **createPaymentLink()**
   - Legge dati da `currentBooking` se disponibile:
     ```javascript
     const customerEmail = currentBooking?.customerEmail || '';
     const vehicleId = currentBooking?.vehicleId || '';
     const bookingRef = currentBooking?.reference || '';
     ```
   - Include nuovi parametri in URL CORS e chiamata JSONP

2. **createPaymentLinkJsonp()**
   - Aggiunti 3 nuovi parametri: `customerEmail`, `vehicleId`, `bookingRef`
   - Inclusi in URLSearchParams

## 🚀 Deployment

### 1. Backend Update

1. Apri Google Apps Script:
   ```
   https://script.google.com/home/projects/YOUR_PROJECT_ID/edit
   ```

2. Sostituisci `Code.gs` con `complete-secure-script-with-maintenance.gs`

3. **Verifica le nuove funzioni** (linee 813-960):
   - `findBookingByReference()`
   - `extractCustomerFromEvent()`
   - `findBookingByReferenceJsonp()`

4. **Verifica modifiche esistenti**:
   - Linea 100: `case "findBookingByReferenceJsonp":`
   - Linea 1532: parametri `triggerStripePayment()`
   - Linea 1591: `customer_email` e `metadata` in `createStripeCheckoutSession()`
   - Linea 1893: parametri `triggerStripePaymentJsonp()`

5. **Deploy**:
   - Click: Deploy > New deployment
   - Select type: Web app
   - Execute as: Me
   - Who has access: Anyone
   - Click "Deploy"
   - **Copia il nuovo URL del deployment**

### 2. Frontend Update

1. Sostituisci `payments.html` con la nuova versione

2. **Verifica le modifiche**:
   - Campo booking reference (dopo account selector)
   - Div `customerInfo` (nascosto inizialmente)
   - Funzione `searchBooking()` (circa linea 690)
   - Funzione `displayCustomerInfo()` (circa linea 715)
   - Funzione `formatDate()` (circa linea 740)
   - Funzione `makeJsonpRequest()` (circa linea 750)
   - Parametri in `createPaymentLink()` (circa linea 485)
   - Parametri in `createPaymentLinkJsonp()` (circa linea 575)

3. **Aggiorna configurazione**:
   - Vai alla tab Settings
   - Incolla il nuovo Script URL
   - Salva

### 3. Testing

1. Apri `test-booking-lookup.html`

2. **Aggiorna le costanti**:
   ```javascript
   const SCRIPT_URL = 'YOUR_NEW_DEPLOYMENT_URL';
   const AUTH_TOKEN = 'YOUR_AUTH_TOKEN';
   ```

3. **Test 1: Ricerca Prenotazione**
   - Inserisci un numero di riferimento esistente (es: "12345")
   - Click "Cerca Prenotazione"
   - Verifica che mostri: nome, email, telefono, veicolo, date

4. **Test 2: Pagamento con Booking**
   - Inserisci stesso riferimento
   - Inserisci importo (es: 50.00)
   - Inserisci descrizione
   - Click "Crea Link Pagamento"
   - Verifica che:
     * Link Stripe venga creato
     * Email cliente sia pre-compilata nel checkout
     * Metadata sia presente in Stripe Dashboard

5. **Test 3: Pagamento Senza Booking**
   - Lascia campo riferimento vuoto
   - Crea pagamento normalmente
   - Verifica che funzioni anche senza booking data

## 📊 Struttura Dati

### Booking Object
```javascript
{
  reference: "12345",
  customerName: "Mario Rossi",
  customerEmail: "mario.rossi@example.com",
  customerPhone: "+41 76 123 45 67",
  vehicleName: "Nissan X-Trail N3",
  vehicleId: "N3",
  startDate: "2024-01-15T10:00:00.000Z",
  endDate: "2024-01-20T10:00:00.000Z",
  eventTitle: "Prenotazione 12345 - Mario Rossi"
}
```

### Stripe Metadata
```javascript
{
  vehicle_id: "N3",
  booking_reference: "12345",
  payment_type: "Pagamento prenotazione",
  account: "green",
  timestamp: "2024-01-15T14:30:00.000Z"
}
```

## 🔍 Regex Patterns

### Email Extraction
```javascript
/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
```
Matches: `example@domain.com`, `user.name@sub.domain.co.uk`

### Swiss Phone Extraction
```javascript
/(\+41|0041|0)\s?([67]\d)\s?(\d{3})\s?(\d{2})\s?(\d{2})/
```
Matches: 
- `+41 76 123 45 67`
- `0041 79 123 45 67`
- `076 123 45 67`
- `0791234567`

### Customer Name Extraction
Keywords: `Cliente:`, `Name:`, `Nome:`

## 🎯 Features

### ✅ Implementate
- [x] Ricerca prenotazione per numero riferimento
- [x] Estrazione automatica dati cliente
- [x] Pre-compilazione email Stripe
- [x] Metadata tracking completo
- [x] Supporto dual Stripe accounts
- [x] Fallback: funziona anche senza booking
- [x] UI responsive con feedback visivo
- [x] Sistema di logging migliorato

### 🔄 Opzionali (Future)
- [ ] Cache risultati ricerca
- [ ] Gestione multipli booking stesso riferimento
- [ ] Filtro per range date
- [ ] Auto-fill descrizione pagamento
- [ ] Validazione formato riferimento
- [ ] Ricerca fuzzy (typo tolerance)

## ⚠️ Note Importanti

1. **Formato Riferimento**: Sistema cerca match esatto nel titolo o descrizione evento
2. **Range Date**: Cerca 12 mesi passato + 6 mesi futuro
3. **Email Obbligatoria**: Se booking trovato, email cliente viene sempre inclusa
4. **Metadata Stripe**: Traccia fino a 50 chiavi (attualmente ne usiamo 5)
5. **Customer Creation**: Stripe crea automaticamente customer se email fornita

## 🐛 Troubleshooting

### Booking non trovato
- Verifica che riferimento sia esatto (case-sensitive)
- Controlla che evento sia nel range date (12 mesi ± 6 mesi)
- Verifica che calendario veicolo sia configurato in `VEHICLE_CALENDARS`

### Email non pre-compilata
- Verifica che `customerEmail` sia estratto correttamente
- Controlla log backend per errori estrazione regex
- Verifica che Stripe riceva parametro `customer_email`

### Metadata non visibile
- Vai in Stripe Dashboard > Payments > Click su transazione
- Scorri fino a "Metadata" section
- Dovrebbe mostrare: vehicle_id, booking_reference, payment_type, account, timestamp

### JSONP Errors
- Verifica che `authToken` sia corretto
- Controlla CORS policy del browser
- Usa test page per debugging isolato

## 📚 Reference Links

- Stripe Checkout API: https://stripe.com/docs/api/checkout/sessions
- Stripe Metadata: https://stripe.com/docs/api/metadata
- Google Calendar API: https://developers.google.com/calendar/api/v3/reference
- Regex101 (test regex): https://regex101.com/

## 🎉 Completed!

Sistema booking lookup completamente integrato e pronto per produzione! 🚀
