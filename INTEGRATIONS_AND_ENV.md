# XICO Mobile — Integraciones y Variables de Entorno

## Servicios Externos Activos

### 1. ElevenLabs — Text-to-Speech
| Campo | Valor |
|---|---|
| Usado en | `artifacts/api-server/src/routes/tts.ts` |
| Endpoint | `https://api.elevenlabs.io/v1/text-to-speech/:voiceId/stream` |
| Voice ID | `EXAVITQu4vr4xnSDxMaL` (Bella) |
| Modelo | `eleven_multilingual_v2` |
| Parámetros | stability=0.28, similarity_boost=0.88, style=0.42, use_speaker_boost=true |
| Variable de entorno | `ELEVENLABS_API_KEY` |
| Obligatoria | Sí (para que funcione TTS) |
| Si falta | El endpoint GET `/api/tts` retorna 500; el botón "Escuchar artículo" falla |
| Plan requerido | Free plan es suficiente — Bella es voz pre-hecha disponible en todos los planes |
| Límite free | ~10,000 caracteres/mes. Con textos de 2,000 chars máx por artículo, son ~5 artículos/mes gratis |
| Atado a Replit | No. El API key se pasa como env var; funciona en cualquier entorno |
| Reconfiguración fuera de Replit | Solo cambiar `ELEVENLABS_API_KEY` en el nuevo entorno de despliegue |

**Flujo completo:**
```
app → GET /api/tts?text=... → servidor → ElevenLabs API → audio stream → app → AudioPlayer
```

---

### 2. OpenStreetMap / Leaflet — Mapa
| Campo | Valor |
|---|---|
| Usado en | `artifacts/xico-mobile/components/LeafletMap.native.tsx` |
| Tipo | WebView con HTML inline que carga Leaflet desde CDN |
| CDN | `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js` |
| Tiles | `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` |
| Variable de entorno | Ninguna |
| API Key | No requerida |
| Si falta conexión | El mapa aparece en blanco (tiles no cargan) |
| Atado a Replit | No |
| Reconfiguración | Ninguna — funciona out of the box |

---

### 3. Google Fonts (via expo-google-fonts) — Tipografía
| Campo | Valor |
|---|---|
| Paquetes | `@expo-google-fonts/cormorant-garamond`, `@expo-google-fonts/inter` |
| Tipografías cargadas | CormorantGaramond (300Light, 300Light_Italic, 400Regular, 500Medium, 600SemiBold), Inter (400Regular, 500Medium, 600SemiBold, 700Bold) |
| Variable de entorno | Ninguna |
| Si no hay internet en 1er arranque | Las fuentes no se cachean → texto con fuente fallback del sistema |
| Atado a Replit | No — carga desde CDN de Google |
| Reconfiguración | Ninguna |

---

### 4. React Native Maps / expo-location — (No activo)
No se usa actualmente `expo-location`. El mapa no solicita permisos de ubicación del usuario.

---

### 5. AsyncStorage — Persistencia Local del Dispositivo
| Campo | Valor |
|---|---|
| Paquete | `@react-native-async-storage/async-storage` |
| Usado en | `hooks/usePassport.ts`, `hooks/useStreak.ts`, `hooks/useXicoCompanion.ts`, `app/(tabs)/index.tsx` (onboarding state, intereses) |
| Qué almacena | Sellos ganados, racha diaria, nombre del compañero XICO, intereses del usuario, flag de onboarding completado |
| Persistencia | Local en el dispositivo. Se borra al desinstalar la app |
| Variable de entorno | Ninguna |
| Atado a Replit | No — funciona en cualquier dispositivo con la app instalada |
| Reconfiguración | Ninguna |

---

## Variables de Entorno — Listado Completo

### API Server (`artifacts/api-server`)

| Variable | Obligatoria | Default | Descripción | Qué pasa si falta |
|---|---|---|---|---|
| `PORT` | SÍ | — | Puerto TCP del servidor Express | El servidor lanza error y no arranca |
| `ELEVENLABS_API_KEY` | Para TTS | — | API key de ElevenLabs | TTS endpoint retorna 500 |
| `NODE_ENV` | No | `development` | Modo de ejecución | Logs más verbosos en dev |
| `LOG_LEVEL` | No | `info` | Nivel de pino logger | Logs en nivel info por defecto |
| `SESSION_SECRET` | No (futuro) | — | Declarado en Replit Secrets pero no activo en código | Sin efecto actualmente |

### App Móvil (`artifacts/xico-mobile`)

| Variable | Obligatoria | Prefijo | Descripción | Qué pasa si falta |
|---|---|---|---|---|
| `EXPO_PUBLIC_DOMAIN` | SÍ | `EXPO_PUBLIC_` | Host:puerto del API server. Ej: `localhost:8080` o `api.midominio.com` | Todas las llamadas al API fallan; la app muestra pantallas vacías |

> **Nota**: Variables con prefijo `EXPO_PUBLIC_` quedan embebidas en el bundle en tiempo de build. No son secretas — no poner API keys aquí.

---

## Acoplamientos a Replit

| Dependencia | Dónde | Criticidad | Qué hacer fuera |
|---|---|---|---|
| `REPLIT_DEV_DOMAIN` en script `dev` del móvil | `package.json` → script `"dev"` | Alta en dev | Cambiar el script para usar IP local o dominio propio |
| `REPLIT_EXPO_DEV_DOMAIN` en script `dev` del móvil | `package.json` → script `"dev"` | Alta en dev | No aplica fuera de Replit; usar `expo start` directo |
| `expo-router` origin `"https://replit.com/"` en `app.json` | `app.json` → plugins | Media | Cambiar al dominio de producción antes del build nativo |
| Puerto asignado automáticamente (`$PORT`) | workflows de Replit | Alta en Replit | Fuera de Replit, pasar `PORT=8080` explícitamente |

### Script `dev` del móvil fuera de Replit

**Dentro de Replit (actual):**
```bash
EXPO_PACKAGER_PROXY_URL=https://$REPLIT_EXPO_DEV_DOMAIN \
EXPO_PUBLIC_DOMAIN=$REPLIT_DEV_DOMAIN \
EXPO_PUBLIC_REPL_ID=$REPL_ID \
REACT_NATIVE_PACKAGER_HOSTNAME=$REPLIT_DEV_DOMAIN \
pnpm exec expo start --localhost --port $PORT
```

**Fuera de Replit:**
```bash
EXPO_PUBLIC_DOMAIN=<IP_LAN>:8080 npx expo start
```

---

## Configuración App Store (Pasos Manuales)

### Antes del primer build nativo (EAS Build):

1. **Crear `eas.json`** en `artifacts/xico-mobile/`:
```json
{
  "cli": { "version": ">= 13.0.0" },
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview": { "distribution": "internal", "ios": { "simulator": false } },
    "production": { "autoIncrement": true }
  }
}
```

2. **Registrar Bundle ID** `com.xico.app` en Apple Developer Portal

3. **Cambiar el origin** en `app.json`:
```json
"plugins": [
  ["expo-router", { "origin": "https://tudominio.com/" }]
]
```

4. **Crear `.env.production`** (no commitearlo):
```
EXPO_PUBLIC_DOMAIN=api.tudominio.com
```

5. **Proveer secrets en EAS**:
```bash
eas secret:create --name EXPO_PUBLIC_DOMAIN --value api.tudominio.com --scope project
```

6. **Privacy Manifest** (iOS 17+): Ejecutar `npx expo install expo-privacy` y configurar según APIs utilizadas (AsyncStorage usa UserDefaults → debe declararse).

---

## Callbacks, Base URLs y Project IDs Importantes

| Servicio | Configuración | Valor actual |
|---|---|---|
| ElevenLabs | Voice ID | `EXAVITQu4vr4xnSDxMaL` (Bella) |
| ElevenLabs | Model ID | `eleven_multilingual_v2` |
| Expo | Slug | `xico` |
| Expo | Bundle ID iOS | `com.xico.app` |
| Expo | Package Android | `com.xico.app` |
| Expo Router | Origin | `https://replit.com/` ← cambiar |
| OpenStreetMap | Tiles URL | `https://{s}.tile.openstreetmap.org/...` (sin key) |

---

## Estado de Integraciones Reales vs Mocked

| Funcionalidad | Integración | Estado |
|---|---|---|
| Audio TTS artículos | ElevenLabs API real | ACTIVA |
| Mapa de spots | OpenStreetMap/Leaflet real | ACTIVA |
| Tipografías | Google Fonts via CDN | ACTIVA |
| Datos de artículos | Hardcoded en servidor | MOCKEADO |
| Tipo de cambio MXN/EUR | Hardcoded (21.2) | MOCKEADO |
| Guardados de artículos | In-memory en servidor | MOCKEADO |
| RSVP eventos | In-memory en servidor | MOCKEADO |
| Perfil de usuario | Hardcoded "Ana Sofía" | MOCKEADO |
| Autenticación | No existe | FALTANTE |
| Base de datos | No existe | FALTANTE |
| Push notifications | No existe | FALTANTE |


