# ⚠️ WICHTIG: Supabase Credentials fehlen!

## Das Problem (was du siehst):

```
❌ Session query timeout (10 Sekunden)
❌ User query timeout (10 Sekunden)
→ "No user found, showing registration"
```

## Die Ursache:

**`.env.local` fehlt oder ist falsch konfiguriert!**

---

## ✅ SO BEHEBEN (2 Minuten):

### **Schritt 1: `.env.local` erstellen**

1. Öffne `platform/.env.local` (ich habe ein Template erstellt)
2. **ODER** erstelle es manuell:

```bash
cd platform
touch .env.local
```

### **Schritt 2: Supabase Credentials einfügen**

1. Gehe zu https://supabase.com/dashboard
2. Wähle dein Project
3. **Settings** → **API**
4. Kopiere:

```
Project URL: https://abc123xyz.supabase.co
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

5. Füge in `.env.local` ein:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abc123xyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Schritt 3: Server neu starten**

```bash
# Stoppe aktuellen Server (Ctrl+C)
cd platform
npm run dev
```

### **Schritt 4: Testen**

1. Gehe zu http://localhost:3000/sign-in
2. Melde dich an
3. **Console prüfen** - sollte sehen:

```
✅ Cookie set: sb-...-auth-token  
✅ User authenticated: <ID>
✅ User verified - loading dealroom data
```

**OHNE Timeouts!**

---

## 🔍 Wie prüfe ich ob es funktioniert?

### **Test 1: Supabase erreichbar**

Öffne Browser-Console und führe aus:

```javascript
fetch('https://DEIN-PROJECT.supabase.co/rest/v1/')
  .then(r => console.log('✅ Supabase erreichbar:', r.status))
  .catch(e => console.error('❌ Supabase NICHT erreichbar:', e))
```

Ersetze `DEIN-PROJECT` mit deiner echten URL.

**Erwartetes Ergebnis:** `✅ Supabase erreichbar: 200`

---

### **Test 2: Environment Variables geladen**

In Browser-Console:

```javascript
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
```

**Erwartetes Ergebnis:**
```
URL: https://abc123xyz.supabase.co
Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**NICHT:**
```
URL: undefined
Key: undefined
```

---

## ❌ Häufige Fehler:

### Fehler 1: `.env.local` an falscher Stelle

```
❌ /Asseo/.env.local
✅ /Asseo/platform/.env.local
```

Die Datei MUSS in `/platform/` sein, nicht im Root!

---

###Fehler 2: Falsche Variable-Namen

```
❌ SUPABASE_URL=...
❌ REACT_APP_SUPABASE_URL=...
✅ NEXT_PUBLIC_SUPABASE_URL=...
```

Next.js benötigt `NEXT_PUBLIC_` Prefix für Frontend-Variablen!

---

### Fehler 3: Server nicht neu gestartet

Nach `.env.local` Änderungen **MUSS** der Server neu gestartet werden!

```bash
Ctrl+C  # Server stoppen
npm run dev  # Neu starten
```

---

### Fehler 4: Supabase Project pausiert

Free Tier pausiert nach 7 Tagen Inaktivität.

**Lösung:**
1. Gehe zu Supabase Dashboard
2. Klicke **"Restore Project"**
3. Warte 2-3 Minuten

---

## 🚀 Wenn alles funktioniert:

Du solltest sehen:

```
✅ Cookie set: sb-jbfmdooljpcbzfjcewjs-auth-token
🔍 === checkUserVerification START ===
✅ User authenticated: <UUID>
📧 Email confirmed: true
✅ Email check passed
🔍 Checking user_roles table as fallback...
✅ User has role - allowing access
=== SIGNED_IN EVENT ===
✅ User verified - loading dealroom data
```

**Timing:** < 1 Sekunde (NICHT 10 Sekunden!)

---

## 📞 Support

Wenn es immer noch nicht funktioniert:

1. **Console-Logs** komplett kopieren
2. **`.env.local`** Inhalt (mit geschwärztem Key!)
3. **Supabase Project Status** (aktiv/pausiert?)
4. Sende mir alles → ich helfe dir!

---

**TL;DR:**  
→ `.env.local` mit echten Supabase Credentials erstellen  
→ Server neu starten  
→ Sollte sofort funktionieren! 🎯

