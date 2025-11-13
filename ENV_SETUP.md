# ⚙️ ENVIRONMENT SETUP - KRITISCH!

## 🚨 PROBLEM: Internal Server Error

**Ursache:** Fehlende Supabase Environment-Variablen!

Der Server kann sich nicht mit Supabase verbinden, weil `.env` Variablen fehlen.

---

## ✅ LÖSUNG: Environment-Variablen setzen

### **Schritt 1: Supabase-Credentials holen**

1. Öffne [supabase.com/dashboard](https://supabase.com/dashboard)
2. Wähle dein Projekt
3. Klicke **Settings** (Zahnrad-Icon unten links)
4. Klicke **API**
5. Kopiere:
   - **Project URL** (z.B. `https://xyz.supabase.co`)
   - **anon/public key** (langer String)

---

### **Schritt 2: .env.local erstellen**

1. Im Projekt-Root (`platform/`):

```bash
touch .env.local
```

2. Öffne `.env.local` und füge ein:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://dein-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key-hier
```

3. ✏️ **Ersetze die Werte** mit deinen echten Supabase-Credentials

4. ✅ **Speichern**

---

### **Schritt 3: Server neu starten**

```bash
# Kill alten Server
lsof -ti:3000 | xargs kill -9

# Cache löschen
rm -rf .next

# Neu starten
npm run dev
```

---

## 🔍 VERIFIKATION

### Test 1: Env-Vars geladen?

```bash
# Im Terminal:
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

**Erwartete Ausgabe:** `https://dein-project.supabase.co`

**Falls `undefined`:** `.env.local` nicht korrekt erstellt

---

### Test 2: Server läuft ohne Errors?

```bash
curl http://localhost:3000/sign-in/
```

**Erwartete Ausgabe:** HTML (keine "Internal Server Error")

---

## 📁 WELCHE ENV-DATEI?

| Datei | Zweck | Git |
|-------|-------|-----|
| `.env.local` | ✅ Lokale Entwicklung | ❌ Ignoriert |
| `.env` | ⚠️ Kann committed werden | ✅ Optional |
| `.env.example` | 📝 Template für Team | ✅ Ja |

**Empfehlung:** Nutze `.env.local` für lokale Entwicklung!

---

## 🎯 QUICK FIX (wenn du keine Supabase hast)

**Falls du Supabase noch nicht eingerichtet hast:**

1. Erstelle kostenloses Projekt: [supabase.com/dashboard](https://supabase.com/dashboard)
2. Führe SQL aus: `platform/database/user_auth_schema.sql`
3. Hole Credentials (siehe Schritt 1 oben)
4. Erstelle `.env.local` (siehe Schritt 2 oben)
5. Server neu starten

**Total-Zeit:** 5-10 Minuten

---

## ⚠️ COMMON ERRORS

### Error: "fetch failed" oder "network error"
**Ursache:** Falsche SUPABASE_URL  
**Lösung:** Prüfe URL in Supabase Dashboard → Settings → API

### Error: "Invalid API key"
**Ursache:** Falscher ANON_KEY  
**Lösung:** Kopiere "anon public" key (nicht service_role!)

### Error: "CORS error"
**Ursache:** Supabase-Projekt nicht erreichbar  
**Lösung:** Prüfe ob Projekt aktiv ist im Dashboard

---

## ✅ STATUS-CHECK

**Nach dem Setup:**

1. ✅ `.env.local` existiert
2. ✅ NEXT_PUBLIC_SUPABASE_URL gesetzt
3. ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY gesetzt
4. ✅ Server läuft ohne "Internal Server Error"
5. ✅ `/sign-in` lädt

**Dann kannst du weiter mit der Registrierung!**

---

## 🚀 NÄCHSTE SCHRITTE

Nach dem Env-Setup:

1. Folge `START_HERE.md` für Auth-Setup
2. Email-Confirmation deaktivieren
3. Neu registrieren
4. Login testen

---

**JETZT:** Erstelle `.env.local` mit deinen Supabase-Credentials!

