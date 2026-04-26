# XICO Mobile — Final Handoff

## Resumen de Arquitectura

Monorepo pnpm con dos artifacts activos:

| Artifact | Tecnología | Función |
|---|---|---|
| `artifacts/xico-mobile` | Expo SDK ~54, React Native, Expo Router, TypeScript | App móvil (iOS/Android/Web) |
| `artifacts/api-server` | Express.js + TypeScript, esbuild, pino | API REST — datos, TTS, estado |

La app móvil consume el API server vía HTTP. El dominio del servidor se inyecta como variable de entorno en tiempo de build.

---

## Estructura de Carpetas (primer y segundo nivel)

```
artifacts/
  xico-mobile/
    app/                   # Rutas Expo Router (file-based)
      (tabs)/              # Tabs principales
        index.tsx          # Índice / Portada
        cultura.tsx        # Sección Cultura
        mexico-ahora.tsx   # México Ahora (reloj, divisas, agenda)
        mi-xico.tsx        # Archivo personal + Pasaporte + Mapa + Guardados
      article/
        [id].tsx           # Vista de artículo individual
      onboarding.tsx       # Pantalla de onboarding (primera vez)
      _layout.tsx          # Root layout + carga de fuentes
    assets/
      images/              # Todas las imágenes estáticas del app
    components/            # Componentes compartidos
    constants/             # Colors, imageMap, interests
    hooks/                 # usePassport, useStreak, useXicoCompanion
    scripts/               # build.js para web
    server/                # serve.js para web export
    app.json               # Configuración Expo
    package.json
    tsconfig.json

  api-server/
    src/
      index.ts             # Entry point — lee PORT, inicia servidor
      app.ts               # Express app — CORS, JSON, rutas
      routes/
        index.ts           # Router principal → monta todas las rutas bajo /api
        articles.ts        # GET /api/articles, GET /api/articles/:id
        articles-data.ts   # Datos estáticos de artículos (hardcoded)
        tts.ts             # GET /api/tts?text=... → ElevenLabs audio stream
        events.ts          # GET/POST/DELETE /api/events, /api/events/:id/voy
        ruta.ts            # GET /api/ruta — Ruta del Fin de Semana
        momentos.ts        # GET /api/momentos
        spots.ts           # GET /api/spots — Mapa Copil
        saved.ts           # GET/POST/DELETE /api/saved/:articleId
        profile.ts         # GET/PUT /api/profile
        edicion.ts         # GET /api/edicion — metadata de edición
        health.ts          # GET /api/health
      lib/
        logger.ts          # Pino logger
    build.mjs              # esbuild bundler script
    package.json
    tsconfig.json
```

---

## Puntos de Entrada

### App Móvil (Expo)
- **Entry**: `expo-router/entry` (definido en `package.json` → `"main"`)
- **Root layout**: `app/_layout.tsx` — carga fuentes, contexto de queries, SafeArea
- **Primer tab**: `app/(tabs)/index.tsx`
- **Esquema URL**: `xico://` (deeplinks)
- **Bundle identifier iOS**: `com.xico.app`
- **Package Android**: `com.xico.app`

### API Server
- **Entry**: `artifacts/api-server/src/index.ts`
- **Puerto**: variable de entorno `PORT` (obligatoria)
- **Prefijo rutas**: todas las rutas bajo `/api`

---

## Cómo Correr Fuera de Replit

### API Server

```bash
cd artifacts/api-server
pnpm install
pnpm run build          # compila TypeScript → dist/ con esbuild
PORT=8080 ELEVENLABS_API_KEY=<tu_key> pnpm run start
```

Para desarrollo con hot-rebuild:
```bash
PORT=8080 ELEVENLABS_API_KEY=<tu_key> pnpm run dev
```

### App Móvil — Expo Go (desarrollo)

```bash
cd artifacts/xico-mobile
pnpm install
EXPO_PUBLIC_DOMAIN=<IP_O_HOST_DEL_SERVIDOR>:8080 npx expo start
```

Luego escanear el QR con Expo Go en el dispositivo físico. Asegurarse de que el dispositivo y el servidor estén en la misma red local, o usar un túnel ngrok.

### App Móvil — Build iOS (EAS Build)

```bash
npm install -g eas-cli
cd artifacts/xico-mobile
eas login
eas build --platform ios --profile preview   # para TestFlight
eas build --platform ios --profile production # para App Store
```

Requiere cuenta Expo, cuenta Apple Developer, y certificados configurados en `eas.json` (que no existe aún — hay que crearlo).

---

## Variables de Entorno

| Variable | Dónde se usa | Obligatoria | Descripción |
|---|---|---|---|
| `EXPO_PUBLIC_DOMAIN` | `artifacts/xico-mobile` | SÍ | Host y puerto del API server. Ej: `192.168.1.10:8080` o `mi-api.railway.app` |
| `PORT` | `artifacts/api-server` | SÍ | Puerto en que escucha el servidor Express |
| `ELEVENLABS_API_KEY` | `artifacts/api-server/src/routes/tts.ts` | Para TTS | Sin ella el botón "Escuchar artículo" falla con 500 |
| `SESSION_SECRET` | Referenciado en Replit Secrets | No activo | Reservado para futura autenticación; no se usa actualmente en código |
| `NODE_ENV` | `artifacts/api-server` | No | `development` | `production`. Afecta nivel de logs |
| `LOG_LEVEL` | `artifacts/api-server` | No | Nivel de pino logger (`info`, `debug`, `warn`) |

---

## Qué Funciona

- Índice editorial con artículos, portada destacada, nota del editor personalizada por día
- Vista de artículo completo con imagen hero, drop cap, body text
- Audio TTS de artículo vía ElevenLabs (voz Bella, multilingual v2)
- Sección Cultura con fichas de artículos por pillar
- México Ahora: reloj dual Madrid/CDMX, conversor MXN↔EUR, agenda editorial
- Mi XICO / Archivo: perfil de usuario (hardcoded), intereses, nivel XICO
- Pasaporte XICO: sistema de sellos/logros almacenados en AsyncStorage del dispositivo
- Criaturas XICO con SVG único por nivel (Semilla, Guardián, Anciano, Supremo)
- Sellos de colección estilo Lotería mexicana con ilustraciones SVG
- Racha diaria (streak) guardada en AsyncStorage
- XICO Companion: compañero con nombre generado, guardado localmente
- Mapa de spots Copil (Leaflet en WebView)
- Agenda de eventos con botón VOY (RSVP POST/DELETE)
- Ruta del Fin de Semana con paradas e imágenes por categoría
- Momentos XICO (formato stories)
- Guardados de artículos (state en memoria del servidor)
- Onboarding con selección de intereses

---

## Qué Está Mockeado / En Memoria

| Dato | Estado |
|---|---|
| Artículos, eventos, ruta, spots, momentos | Hardcoded en `articles-data.ts` y demás archivos de rutas |
| Artículos guardados (`/api/saved`) | Set en memoria — se pierde al reiniciar el servidor |
| RSVP de eventos (`/api/events/:id/voy`) | Map en memoria — se pierde al reiniciar |
| Perfil de usuario | Hardcoded: "Ana Sofía", sin autenticación real |
| Tipo de cambio MXN↔EUR | Hardcoded (1 EUR = 21.2 MXN) |
| Pasaporte, sellos, streak, companion | AsyncStorage del dispositivo (local, por usuario) |

---

## Qué Falta para TestFlight / App Store

1. **`eas.json`** — Configuración de EAS Build (profiles: development, preview, production)
2. **Cuenta Apple Developer** ($99/año) con Bundle ID `com.xico.app` registrado
3. **Certificados y provisioning profiles** — gestionados por EAS o manualmente
4. **Cambiar `expo-router` origin** en `app.json` — actualmente apunta a `replit.com`, debe cambiarse al dominio de producción
5. **Privacy Manifest** (`PrivacyInfo.xcprivacy`) — requerido por Apple desde iOS 17; Expo puede generarlo
6. **Push notifications** — no implementadas; necesarias para retención
7. **Autenticación real** — actualmente no hay sistema de auth; perfil es hardcoded
8. **Base de datos persistente** — PostgreSQL, SQLite o similar para guardar artículos, RSVP, perfil real
9. **App Store metadata** — screenshots (6.7", 5.5", iPad), descripción, keywords, categoría
10. **Splash screen y icon** — los assets existen pero deben ser PNG a resoluciones correctas

---

## Partes Frágiles — Revisar Primero

### Crítico
- **`EXPO_PUBLIC_DOMAIN`** — Si no apunta al servidor correcto, toda la app falla silenciosamente (pantallas vacías). En Replit se inyecta automático; fuera hay que configurarlo explícitamente.
- **`expo-router` origin en `app.json`** — Está hardcodeado como `"https://replit.com/"`. Si se mantiene así en un build de producción, puede romper el routing en builds nativos. Cambiarlo al dominio real o quitar la clave.
- **In-memory state** — El servidor no persiste guardados ni RSVPs. Un restart limpia todo.

### Moderado
- **ElevenLabs plan** — La voz "Bella" está disponible en el plan gratuito. Si el plan cambia o la API key expira, el TTS falla. Manejar el error en el cliente (ya existe manejo visual del loading, pero hay que verificar el fallback).
- **Leaflet map en WebView** — Requiere conexión a internet para cargar los tiles de OpenStreetMap. Sin conexión el mapa aparece en blanco.
- **Tipos de cambio hardcoded** — No se conecta a ningún API de divisas real.
- **`SESSION_SECRET`** en Replit Secrets — Está declarado como secret pero no se usa en código actualmente. Si se añade autenticación futura, se necesitará.

### Menor
- **Assets de imágenes** — Todas las imágenes son PNG estáticas en el bundle. Hay que asegurarse de que `iturbide-iguanas.png` (foto de Graciela Iturbide) tenga los derechos correctos antes de publicar.
- **Fonts cargadas** — CormorantGaramond e Inter se cargan desde `expo-google-fonts`. Requieren conexión en primer arranque si no están en caché.

