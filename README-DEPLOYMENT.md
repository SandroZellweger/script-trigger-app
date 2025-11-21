# 🚀 Van Fleet Calendar - Production Deployment

## 📋 Quick Deployment Checklist

### ✅ Files Ready for Deployment:
- **`calendar-production.html`** - Main production application
- **`manifest.json`** - PWA manifest for mobile app features
- **`sw.js`** - Service worker for offline support
- **`complete-fixed-script.gs`** - Google Apps Script backend (already deployed)

### 🎯 Choose Your Deployment Method:

## Option A: GitHub Pages (Recommended - FREE)

### Step 1: Create GitHub Repository
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Deploy van fleet calendar to production"

# Create repository on GitHub (github.com/new)
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/van-fleet-calendar.git
git branch -M main
git push -u origin main
```

### Step 2: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll to **Pages** section
4. Under **Source**, select **"Deploy from a branch"**
5. Choose **"main"** branch and **"/ (root)"** folder
6. Click **Save**

### Step 3: Access Your Live App
🌐 **Your app will be live at:**
```
https://YOUR_USERNAME.github.io/van-fleet-calendar/calendar-production.html
```

## Option B: Netlify (FREE with Custom Domain)

### Step 1: Deploy to Netlify
1. Go to [netlify.com](https://netlify.com) and create account
2. Click **"New site from Git"**
3. Connect your GitHub repository
4. Set build settings:
   - Build command: (leave empty)
   - Publish directory: `/`
5. Click **Deploy site**

### Step 2: Custom Domain (Optional)
1. In Netlify dashboard, go to **Domain settings**
2. Click **Add custom domain**
3. Follow DNS configuration instructions

## Option C: Your Own Server

### Upload Files
Upload these files to your web server:
- `calendar-production.html`
- `manifest.json`
- `sw.js`

### HTTPS Required
Ensure your server supports HTTPS for PWA features to work.

## 🔧 Google Apps Script Configuration

Your backend is already deployed at:
```
https://script.google.com/macros/s/AKfycbzUtXeqja87wTaEEq8Q5Su1utBJnm3z4kj7ub3OCx1RB95Yh0wwVbwLmdSGpTPy08hY/exec
```

### Update Domain Whitelist (Important!)
Add your domain to the Google Apps Script for CORS:

```javascript
// In complete-fixed-script.gs, update:
const ALLOWED_DOMAINS = [
    'https://yourusername.github.io',           // GitHub Pages
    'https://your-custom-domain.com',           // Netlify/Custom
    'http://localhost:3000',                    // Development
    'file://'                                   // Local testing
];
```

## 📱 Mobile App Features

### Progressive Web App (PWA)
Your calendar will work like a native mobile app:
- **Add to Home Screen** on mobile devices
- **Offline support** with cached data
- **Fast loading** with service worker
- **Push notifications** ready (future feature)

### How Users Install:
1. **iOS Safari**: Share → Add to Home Screen
2. **Android Chrome**: Three dots → Add to Home Screen
3. **Desktop**: Install button in address bar

## 🧪 Testing Your Deployment

### 1. Basic Functionality Test
- [ ] Calendar loads and displays current month
- [ ] Van names load from Google Calendar
- [ ] Events display with correct colors
- [ ] Month navigation works
- [ ] Van selection checkboxes work
- [ ] Dashboard shows analytics

### 2. Connection Test
- [ ] Online indicator shows green when connected
- [ ] Data loads from Google Calendar API
- [ ] Error handling works when offline
- [ ] Retry mechanisms function properly

### 3. Mobile Test
- [ ] Responsive design works on mobile
- [ ] Touch interactions work smoothly
- [ ] PWA installation works
- [ ] Offline mode functions

### 4. Browser Compatibility
Test on:
- [ ] Chrome (desktop & mobile)
- [ ] Firefox (desktop & mobile)
- [ ] Safari (desktop & mobile)
- [ ] Edge (desktop)

## 🚨 Troubleshooting

### CORS Errors
If you see CORS errors:
1. Verify your domain is in `ALLOWED_DOMAINS` in Google Apps Script
2. Redeploy the Google Apps Script
3. Clear browser cache

### 404 Errors
- Check file paths in your deployment
- Ensure `calendar-production.html` is in the root directory
- Verify hosting service configuration

### API Timeouts
- Check Google Apps Script execution logs
- Verify calendar permissions
- Test API endpoints directly

### Mobile Issues
- Ensure HTTPS is enabled
- Check viewport meta tag
- Test PWA manifest

## 📊 Analytics (Optional)

### Add Google Analytics
Replace `GA_MEASUREMENT_ID` in the HTML with your ID:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🔒 Security Best Practices

### Authentication Token
- Keep `authToken` secure
- Consider rotating tokens periodically
- Monitor for unauthorized access

### HTTPS Only
- Always use HTTPS in production
- HTTP will cause PWA features to fail
- Browsers may block mixed content

### API Rate Limits
- Google Apps Script has execution limits
- Implement client-side caching
- Consider upgrading to Google Workspace if needed

## 🎯 Performance Optimization

### Already Implemented:
- Service worker caching
- Resource preloading
- Optimized API calls
- Graceful error handling
- Offline support

### Additional Optimizations:
- CDN for static assets (if using custom domain)
- Gzip compression on server
- Browser caching headers

## 📱 Custom Domain Setup

### For Professional Use:
1. **Buy domain**: GoDaddy, Namecheap, etc.
2. **Point DNS** to your hosting service
3. **Enable HTTPS** (usually automatic)
4. **Update Google Apps Script** with new domain

### DNS Configuration Example (Netlify):
```
Type: CNAME
Name: www
Value: your-netlify-subdomain.netlify.app

Type: A
Name: @
Value: 75.2.60.5
```

## 🎉 Go Live Commands

### GitHub Pages One-Liner:
```bash
git add . && git commit -m "Deploy production calendar" && git push origin main
```

### Netlify CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=.
```

## 📞 Post-Deployment

### Monitor:
- Check browser console for errors
- Monitor Google Apps Script execution logs
- Watch for user feedback
- Track performance metrics

### Maintenance:
- Update calendar data regularly
- Monitor API quotas
- Update service worker cache versions
- Keep dependencies current

---

## 🎯 Success Criteria - Production Ready ✅

Your van fleet calendar is now:
- ✅ **Accessible online** 24/7
- ✅ **Connected to real Google Calendar data**
- ✅ **Mobile-optimized** with PWA features
- ✅ **Offline-capable** with service worker
- ✅ **Professional-grade** error handling
- ✅ **Scalable** for business growth

**🚀 Ready to go live!** Your van fleet calendar is production-ready with real Google Calendar integration.
