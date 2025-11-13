# 📁 Route-Struktur - WICHTIG

## ✅ KORREKTE Struktur

```
src/app/
├── (auth)/              ← Route Group (kein URL-Teil)
│   ├── confirm/
│   │   └── page.tsx     → /confirm
│   ├── register/
│   │   └── page.tsx     → /register
│   └── sign-in/
│       └── page.tsx     → /sign-in
├── dealroom/
│   └── page.tsx         → /dealroom
└── ...
```

## ❌ FALSCHE Struktur (verursacht Konflikte)

```
src/app/
├── (auth)/
│   └── sign-in/
│       └── page.tsx     → /sign-in
├── sign-in/             ← DOPPELT! Konflikt!
│   └── page.tsx         → /sign-in (gleiche URL)
└── ...
```

## 🚫 NIE ERSTELLEN:

- ❌ `src/app/sign-in/` (außerhalb von (auth))
- ❌ `src/app/register/` (außerhalb von (auth))
- ❌ `src/app/confirm/` (außerhalb von (auth))

## ✅ IMMER NUTZEN:

- ✅ `src/app/(auth)/sign-in/`
- ✅ `src/app/(auth)/register/`
- ✅ `src/app/(auth)/confirm/`

## 🔧 Falls Konflikt auftritt:

```bash
# Doppelte Routes löschen
rm -rf src/app/sign-in src/app/register src/app/confirm

# Cache löschen
rm -rf .next

# Server neu starten
npm run dev
```

## 📚 Warum (auth)?

Route Groups `(folder)` in Next.js:
- Klammern = nicht Teil der URL
- Organisiert Routes logisch
- `/sign-in` kommt von `(auth)/sign-in/page.tsx`
- Nicht von `sign-in/page.tsx`!

## ✅ Status

- ✅ Doppelte Routes gelöscht
- ✅ Cache cleared
- ✅ Server läuft sauber
- ✅ Keine Konflikte mehr

