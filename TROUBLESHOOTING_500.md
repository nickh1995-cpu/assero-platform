# 🚨 500 INTERNAL SERVER ERROR - TROUBLESHOOTING

## Problem: Sign-In Page gibt 500 Error

---

## ✅ SCHRITT-FÜR-SCHRITT DIAGNOSE

### **1. Server Status prüfen**

```bash
# Im Terminal:
lsof -i :3000
```

**Erwartete Ausgabe:** Prozess läuft auf Port 3000  
**Falls leer:** Server läuft nicht → `npm run dev`

---

### **2. Env-Variablen prüfen**

```bash
# Prüfen ob .env existiert:
ls -la .env*

# Prüfen ob Supabase-Vars drin sind:
grep NEXT_PUBLIC_SUPABASE .env
```

**Erwartete Ausgabe:**
```
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**Falls fehlt:** ENV-Variablen nicht gesetzt!

---

### **3. Browser Console prüfen**

1. Öffne `http://localhost:3000/sign-in`
2. Drücke F12 (DevTools)
3. Gehe zu **Console** Tab
4. Suche nach Errors

**Häufige Errors:**
- `Missing Supabase configuration` → ENV-Vars fehlen
- `fetch failed` → Supabase-URL falsch
- `CORS error` → Supabase-Projekt nicht erreichbar

---

### **4. Test-Page prüfen**

```
http://localhost:3000/test-simple
```

**Falls lädt:** Next.js funktioniert, Problem ist in sign-in Page  
**Falls 500:** Next.js selbst hat Problem

---

## 🔧 LÖSUNGEN

### **Lösung 1: Server komplett neu starten**

```bash
# Alle Next.js Prozesse killen
pkill -f "next dev"
lsof -ti:3000 | xargs kill -9

# Cache löschen
rm -rf .next

# Neu starten
npm run dev
```

**Warten bis "Ready" erscheint, dann testen!**

---

### **Lösung 2: ENV-Variablen neu setzen**

1. **Prüfe ob .env existiert:**
   ```bash
   cat .env
   ```

2. **Falls NEXT_PUBLIC_SUPABASE_ fehlt, hinzufügen:**
   ```bash
   # Supabase Dashboard → Settings → API
   echo "NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co" >> .env
   echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-key" >> .env
   ```

3. **Server neu starten** (siehe Lösung 1)

---

### **Lösung 3: Supabase-Verbindung testen**

```bash
# Test ob Supabase erreichbar ist:
curl -I https://dein-project.supabase.co
```

**Erwartete Ausgabe:** `HTTP/2 200`  
**Falls 404/500:** Supabase-URL falsch

---

### **Lösung 4: Fallback ohne Supabase**

**Falls Supabase nicht verfügbar:**

1. Erstelle lokales Supabase:
   ```bash
   npx supabase init
   npx supabase start
   ```

2. Nutze lokale URL:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
   ```

---

## 🎯 QUICK-FIX CHECKLIST

- [ ] Server läuft (`lsof -i :3000`)
- [ ] `.env` existiert
- [ ] NEXT_PUBLIC_SUPABASE_URL gesetzt
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY gesetzt
- [ ] Cache gelöscht (`.next/` weg)
- [ ] Server neu gestartet
- [ ] Browser-Cache gelöscht (Shift+Reload)
- [ ] `http://localhost:3000/test-simple` lädt

**Falls ALLE checked und immer noch 500:**

→ Kopiere die **komplette Error-Message** aus Browser Console  
→ Kopiere den **Server-Output** aus Terminal  
→ Poste beides hier

---

## 📋 DEBUG-COMMANDS

```bash
# 1. Server-Prozess finden
ps aux | grep "next dev"

# 2. Port prüfen
lsof -i :3000

# 3. ENV-Vars prüfen
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"

# 4. Supabase-Connection testen
curl -H "apikey: dein-anon-key" https://dein-project.supabase.co/rest/v1/

# 5. Build-Errors prüfen
npm run build
```

---

## ❓ HÄUFIGE URSACHEN

| Error | Ursache | Lösung |
|-------|---------|--------|
| 500 auf /sign-in | Supabase Client null | ENV-Vars prüfen |
| 500 auf alle Pages | Next.js Build-Error | `npm run build` checken |
| "fetch failed" | Supabase URL falsch | Dashboard → Settings → API |
| "CORS error" | Supabase unreachbar | Projekt-Status prüfen |
| "Missing configuration" | ENV-Vars nicht geladen | Server neu starten |

---

## ✅ NACH DEM FIX

**Wenn sign-in lädt:**

1. Email-Confirmation deaktivieren (Supabase Dashboard)
2. Folge `START_HERE.md`
3. Registriere dich neu
4. Login testen

---

**JETZT:** Führe die Quick-Fix Checklist durch!

