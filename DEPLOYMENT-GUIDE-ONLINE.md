# 🚀 Deploy Van Fleet Calendar Online - Step by Step Guide

## 📋 Prerequisites Checklist

Before deploying online, ensure you have:
- ✅ Google Apps Script already deployed (you have the URL)
- ✅ Google Calendar permissions configured
- ✅ Web hosting service or GitHub account
- ✅ Domain name (optional but recommended)

## 🔧 Step 1: Verify Google Apps Script is Production Ready

### 1.1 Check Script Deployment
Your current script URL: `https://script.google.com/macros/s/AKfycbyoO-GlsISkbsD1kBWv0wnIXGKXja_VS0VVBei0aAikAJ2dIaCmjtj-1sGRRn1RCPN_/exec`

### 1.2 Test API Endpoints
```bash
# Test calendar names endpoint
curl "https://script.google.com/macros/s/AKfycbyoO-GlsISkbsD1kBWv0wnIXGKXja_VS0VVBei0aAikAJ2dIaCmjtj-1sGRRn1RCPN_/exec?function=getCalendarNamesAppJsonp&authToken=myAppToken2025&callback=test"

# Test events endpoint
curl "https://script.google.com/macros/s/AKfycbyoO-GlsISkbsD1kBWv0wnIXGKXja_VS0VVBei0aAikAJ2dIaCmjtj-1sGRRn1RCPN_/exec?function=getCalendarEvents&authToken=myAppToken2025&startDate=2025-06-01&endDate=2025-06-30"
```

## 🌐 Step 2: Choose Deployment Method

### Option A: GitHub Pages (Recommended - Free)
### Option B: Netlify (Free with custom domain)
### Option C: Your own web server

## 🎯 Option A: GitHub Pages Deployment

### 2.1 Create GitHub Repository
```bash
# If you don't have git initialized
git init
git add .
git commit -m "Initial van fleet calendar"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/van-fleet-calendar.git
git push -u origin main
```

### 2.2 Enable GitHub Pages
1. Go to your repository settings
2. Scroll to "Pages" section
3. Select "Deploy from a branch"
4. Choose "main" branch
5. Select "/ (root)" folder
6. Click "Save"

### 2.3 Access Your Live Application
Your app will be available at:
`https://YOUR_USERNAME.github.io/van-fleet-calendar/calendar-clean.html`

## 🎯 Option B: Netlify Deployment

### 2.1 Prepare for Netlify
1. Create account at netlify.com
2. Drag and drop your project folder to Netlify dashboard
3. Or connect your GitHub repository

### 2.2 Configure Domain (Optional)
1. Go to Domain settings in Netlify
2. Add your custom domain
3. Configure DNS records

## 🔒 Step 3: Security Enhancements for Production

### 3.1 Environment-Specific Configuration
Create a production configuration file:

```javascript
// config.prod.js
const PRODUCTION_CONFIG = {
    scriptUrl: 'https://script.google.com/macros/s/AKfycbyoO-GlsISkbsD1kBWv0wnIXGKXja_VS0VVBei0aAikAJ2dIaCmjtj-1sGRRn1RCPN_/exec',
    authToken: 'myAppToken2025',
    environment: 'production',
    enableAnalytics: true,
    corsMode: 'jsonp-primary' // Use JSONP as primary method for better reliability
};
```

### 3.2 Update Google Apps Script for Production

Add domain whitelist to your Google Apps Script:

```javascript
// Add to complete-fixed-script.gs
const ALLOWED_DOMAINS = [
    'https://yourusername.github.io',
    'https://your-custom-domain.com',
    'http://localhost:3000', // For development
    'file://' // For local testing
];

function validateOrigin(origin) {
    if (!origin) return true; // Allow requests without origin (like direct access)
    return ALLOWED_DOMAINS.some(domain => origin.startsWith(domain));
}

// Update doGet function
function doGet(e) {
    try {
        const origin = e.parameter.origin || e.headers?.origin;
        
        if (!validateOrigin(origin)) {
            return createJsonResponse({ error: "Origin not allowed" });
        }
        
        // ...existing code...
    } catch (error) {
        return createJsonResponse({ error: error.toString() });
    }
}
```

## 📊 Step 4: Enable Analytics (Optional)

### 4.1 Add Google Analytics
```html
<!-- Add to <head> section of calendar-clean.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 4.2 Track Calendar Events
```javascript
// Add to calendar-clean.html
function trackEvent(action, category = 'Calendar', label = '') {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label
        });
    }
}

// Use in functions
function selectEvent(event) {
    trackEvent('event_selected', 'Calendar', event.summary);
    // ...existing code...
}
```

## 🔄 Step 5: Performance Optimization

### 5.1 Enable Caching
Add to your HTML head:

```html
<meta http-equiv="Cache-Control" content="public, max-age=3600">
<link rel="preconnect" href="https://script.google.com">
<link rel="dns-prefetch" href="https://script.google.com">
```

### 5.2 Service Worker for Offline Support
Create `sw.js`:

```javascript
const CACHE_NAME = 'van-calendar-v1';
const urlsToCache = [
    '/',
    '/calendar-clean.html',
    'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
```

## 🧪 Step 6: Testing Production Deployment

### 6.1 Test Checklist
- [ ] Calendar loads and displays current month
- [ ] Van names load dynamically from Google Calendar
- [ ] Events display with correct colors and times
- [ ] Van selection checkboxes work
- [ ] Month navigation works
- [ ] Dashboard tab loads with analytics
- [ ] Mobile responsive design works
- [ ] HTTPS access works (no mixed content warnings)

### 6.2 Browser Testing
Test on:
- Chrome (desktop & mobile)
- Firefox (desktop & mobile)  
- Safari (desktop & mobile)
- Edge (desktop)

## 🔧 Step 7: Domain Configuration (Optional)

### 7.1 Custom Domain Setup
If using a custom domain:

1. **Purchase domain** from registrar (GoDaddy, Namecheap, etc.)
2. **Configure DNS** to point to your hosting service
3. **Enable HTTPS** through your hosting provider
4. **Update Google Apps Script** with new domain in ALLOWED_DOMAINS

### 7.2 SSL Certificate
Most hosting services provide free SSL certificates. Ensure:
- HTTPS is enabled
- HTTP redirects to HTTPS
- Mixed content warnings are resolved

## 📱 Step 8: Mobile App Capabilities

### 8.1 Progressive Web App (PWA)
Add to HTML head:

```html
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#7DBB35">
```

Create `manifest.json`:

```json
{
    "name": "Van Fleet Calendar & CRM",
    "short_name": "Van Calendar",
    "description": "Van rental booking calendar and CRM",
    "start_url": "/calendar-clean.html",
    "display": "standalone",
    "background_color": "#7DBB35",
    "theme_color": "#7DBB35",
    "icons": [
        {
            "src": "icon-192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "icon-512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ]
}
```

## 🎯 Quick Start Commands

### For GitHub Pages:
```bash
# 1. Create repository and upload files
git init
git add .
git commit -m "Deploy van fleet calendar"
git remote add origin https://github.com/YOUR_USERNAME/van-fleet-calendar.git
git push -u origin main

# 2. Enable GitHub Pages in repository settings
# 3. Access at: https://YOUR_USERNAME.github.io/van-fleet-calendar/calendar-clean.html
```

### For Netlify:
```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Deploy
netlify deploy --prod --dir=.

# 3. Access at provided URL
```

## 🚨 Troubleshooting

### Common Issues:
1. **CORS Errors**: Ensure Google Apps Script has proper CORS headers
2. **404 Errors**: Check file paths and hosting configuration
3. **API Timeouts**: Verify Google Apps Script is accessible
4. **Mobile Issues**: Test viewport meta tag and responsive CSS

### Debug Tools:
- Browser Developer Tools (F12)
- Google Apps Script Logs
- Network tab for API call monitoring

## 📞 Support

After deployment, monitor:
- Console errors in browser dev tools
- Google Apps Script execution logs
- Hosting service analytics
- User feedback

---

**🎉 Ready to go live!** Follow these steps to deploy your van fleet calendar with real Google Calendar data access.
