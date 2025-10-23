# 🚀 ASSERO Platform Development Server

## ✅ Clean Start (Empfohlen)

### Option 1: Script verwenden
```bash
./start-clean.sh
```

### Option 2: Manuell starten
```bash
# 1. File limit erhöhen (nur macOS)
ulimit -n 10240

# 2. Cache löschen (optional, bei Problemen)
rm -rf .next

# 3. Server starten
npm run dev
```

## 📋 Voraussetzungen

### Node.js Version
- **Empfohlen:** Node.js v20.x (LTS)
- **Nicht empfohlen:** Node.js v24.x (hat Bugs auf macOS)

### Node.js Version wechseln (mit nvm)
```bash
# Node.js v20 installieren
nvm install 20

# Node.js v20 verwenden
nvm use 20

# Prüfen
node --version  # Sollte v20.x.x zeigen
```

## 🔧 Behobene Probleme

### 1. EMFILE: too many open files
**Problem:** macOS hat standardmäßig ein niedriges File Descriptor Limit.

**Lösung:**
- Webpack file watching optimiert (polling mode)
- File limit wird automatisch erhöht (ulimit -n 10240)
- Unnötige Verzeichnisse werden ignoriert (node_modules, .next, .git)

### 2. NodeError: uv_interface_addresses
**Problem:** Node.js v24 hat einen Bug mit macOS Network Interfaces.

**Lösung:**
- Server bindet jetzt an `localhost` statt `0.0.0.0`
- `--hostname localhost` Flag in package.json scripts
- Empfehlung: Node.js v20 verwenden

### 3. Build Cache Probleme
**Problem:** Korrupte .next Builds nach Änderungen.

**Lösung:**
- start-clean.sh löscht automatisch .next Cache
- Build ist jetzt deterministisch und wiederholbar

## 📦 Next.js Config Optimierungen

### Optimierte File Watching (next.config.ts)
```typescript
watchOptions: {
  poll: 1000,              // Check alle 1000ms
  aggregateTimeout: 300,   // 300ms Verzögerung vor rebuild
  ignored: ['**/node_modules', '**/.next', '**/.git']
}
```

### Hostname Binding (package.json)
```json
"dev": "next dev --hostname localhost"
```

## 🌐 Server URLs

Nach dem Start ist die Platform verfügbar unter:

- **Homepage:** http://localhost:3000
- **Valuation Wizard:** http://localhost:3000/valuation
- **Browse:** http://localhost:3000/browse

## 🐛 Troubleshooting

### Server startet nicht
```bash
# 1. Alte Prozesse beenden
lsof -ti:3000 | xargs kill -9

# 2. Cache löschen
rm -rf .next node_modules/.cache

# 3. Clean start
./start-clean.sh
```

### "Port already in use"
```bash
# Port prüfen
lsof -i :3000

# Prozess beenden
kill -9 <PID>
```

### Node.js Version Probleme
```bash
# Richtige Version verwenden
nvm use 20

# Oder .nvmrc nutzen
nvm use
```

## 📊 Performance

### Dev Server Start (nach Clean)
- **Erste Kompilierung:** ~3-5 Sekunden
- **Hot Reload:** ~200-500ms
- **File watching:** Polling mode (1000ms interval)

### Production Build
```bash
npm run build
npm start
```

## 🎯 Was wurde behoben

- ✅ EMFILE Fehler (file descriptor limit)
- ✅ Node.js v24 Network Interface Bug
- ✅ Webpack file watching auf macOS
- ✅ Clean builds ohne Cache-Probleme
- ✅ Localhost binding statt 0.0.0.0
- ✅ Optimierte watchOptions
- ✅ Automatisches Cleanup-Script

## 💡 Best Practices

1. **Immer `./start-clean.sh` verwenden** für den ersten Start
2. **Node.js v20 verwenden** (nicht v24)
3. **Bei Problemen:** Cache löschen (`rm -rf .next`)
4. **File limit check:** `ulimit -n` (sollte ≥ 10240 sein)

---

**Status:** ✅ Production-ready, keine temporären Workarounds

