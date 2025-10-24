# 🚀 Vercel Deployment Guide - ASSERO Platform

## ✅ **SCHRITT-FÜR-SCHRITT DEPLOYMENT**

### 1. **Environment Variables in Vercel setzen**

Gehe zu deinem Vercel-Projekt → Settings → Environment Variables und füge hinzu:

```
NEXT_PUBLIC_SUPABASE_URL = deine_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY = dein_supabase_anon_key
```

**WICHTIG:** Keine `@`-Syntax verwenden! Direkte Werte eingeben.

### 2. **Git Repository vorbereiten**

```bash
# Alle Änderungen committen
git add .
git commit -m "Fix Vercel deployment configuration"
git push origin main
```

### 3. **Vercel-Projekt konfigurieren**

- **Root Directory:** `platform/`
- **Framework:** Next.js (automatisch erkannt)
- **Build Command:** `npm run build` (automatisch)
- **Output Directory:** `.next` (automatisch)

### 4. **Deployment testen**

Nach dem Push sollte Vercel automatisch deployen.

## 🔧 **TROUBLESHOOTING**

### Problem: "Environment Variable references Secret which does not exist"
**Lösung:** Environment Variables direkt in Vercel setzen, nicht als Secrets.

### Problem: Build-Fehler
**Lösung:** 
1. Node.js Version auf 20.x setzen
2. Build-Logs in Vercel prüfen
3. `npm install` lokal testen

### Problem: Supabase-Verbindung
**Lösung:**
1. Supabase-URL und Key prüfen
2. RLS-Policies in Supabase aktivieren
3. CORS-Einstellungen prüfen

## 📋 **CHECKLISTE FÜR DEPLOYMENT**

- [ ] Environment Variables in Vercel gesetzt
- [ ] Git Repository gepusht
- [ ] Vercel-Projekt mit korrektem Root Directory
- [ ] Supabase-Datenbank konfiguriert
- [ ] Build erfolgreich
- [ ] Website erreichbar
- [ ] Authentication funktioniert
- [ ] API-Endpoints funktionieren

## 🎯 **NEXT STEPS NACH DEPLOYMENT**

1. **Domain konfigurieren** (assero.io)
2. **SSL-Zertifikat** (automatisch bei Vercel)
3. **Monitoring** aktivieren
4. **Analytics** einrichten
