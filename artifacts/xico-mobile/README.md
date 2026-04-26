# XICO Mobile — React Native / Expo

App móvil de XICO, plataforma editorial cultural mexicana radicada en Madrid.
Réplica fiel de la web original, construida con Expo Go / React Native.

---

## Contenido del proyecto

```
artifacts/xico-mobile/
├── app/
│   ├── _layout.tsx          # Root layout: fuentes, QueryClient, SafeArea
│   ├── onboarding.tsx        # Pantalla de intereses iniciales
│   ├── +not-found.tsx        # 404
│   ├── article/
│   │   └── [id].tsx          # Vista detalle de artículo
│   └── (tabs)/
│       ├── _layout.tsx       # Tab bar (Índice / Cultura / Ahora / Mi XICO)
│       ├── index.tsx         # Portada (Índice / home)
│       ├── cultura.tsx       # Cultura con filtros por subcategoría
│       ├── mexico-ahora.tsx  # México Ahora: reloj dual, conversor, agenda
│       └── mi-xico.tsx       # Mi XICO: pasaporte, momentos, ruta, mapa, agenda, guardados
├── components/
│   ├── StampNotification.tsx # Toast de sello obtenido
│   ├── ErrorBoundary.tsx
│   ├── ErrorFallback.tsx
│   └── KeyboardAwareScrollViewCompat.tsx
├── constants/
│   ├── colors.ts             # Paleta de colores (magenta, cobalt, ochre, emerald)
│   ├── imageMap.ts           # Mapa de claves → require() de imágenes locales
│   └── interests.ts          # Categorías de interés del onboarding
├── hooks/
│   ├── usePassport.ts        # Sistema de sellos y niveles XICO
│   ├── useStreak.ts          # Racha de lectura diaria
│   └── useColors.ts          # Colores según tema
├── assets/
│   └── images/               # 14 imágenes JPEG/PNG locales (sin dependencia remota)
├── app.json                  # Config Expo (bundle ID: com.xico.app)
├── package.json
├── tsconfig.json
├── babel.config.js
├── metro.config.js
└── .env.example              # Variables necesarias para correr fuera de Replit
```

---

## Pantallas implementadas

| Pantalla | Ruta | Estado |
|---|---|---|
| Onboarding | `/onboarding` | ✅ Completo |
| Portada (Índice) | `/(tabs)/` | ✅ Completo |
| Cultura | `/(tabs)/cultura` | ✅ Completo |
| México Ahora | `/(tabs)/mexico-ahora` | ✅ Completo |
| Mi XICO | `/(tabs)/mi-xico` | ✅ Completo |
| Artículo | `/article/[id]` | ✅ Completo |

---

## Instalación

### Requisitos previos
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Expo CLI (`npm install -g expo`)
- Expo Go app en tu iPhone/Android

### Instalar dependencias

```bash
cd xico-mobile
pnpm install
```

### Variables de entorno

Copia `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Edita `.env.local` y apunta `EXPO_PUBLIC_DOMAIN` a donde corra la API:

```
EXPO_PUBLIC_DOMAIN=localhost:8080
```

### Correr localmente

```bash
# Opción 1 — Expo Go (recomendado para desarrollo)
EXPO_PUBLIC_DOMAIN=tu-ip:8080 npx expo start

# Opción 2 — Web (browser)
EXPO_PUBLIC_DOMAIN=localhost:8080 npx expo start --web
```

Escanea el QR con Expo Go (Android) o la app Cámara (iOS).

---

## Servidor API

La app consume datos de un API REST. En Replit está en `artifacts/api-server/`.
Fuera de Replit puedes levantar ese mismo servidor:

```bash
cd xico-mobile  # root del monorepo
pnpm --filter @workspace/api-server run dev
# Escucha en puerto 8080 por defecto
```

Endpoints que usa la app:
- `GET /api/articles?pillar=cultura`
- `GET /api/articles?pillar=mexico-ahora`
- `GET /api/momentos`
- `GET /api/spots`
- `GET /api/ruta`
- `GET /api/events`
- `GET /api/saved`
- `GET /api/profile`
- `POST /api/events/:id/rsvp`

---

## Stack tecnológico

| Librería | Uso |
|---|---|
| Expo ~54 | Plataforma base |
| Expo Router ~6 | Navegación basada en archivos |
| React Native 0.81 | UI nativa |
| @tanstack/react-query | Fetching y cache de datos |
| expo-linear-gradient | Gradientes |
| @expo-google-fonts | Fuentes Cormorant Garamond + Inter |
| expo-font | Carga de fuentes |
| @react-native-async-storage | Persistencia local (passport, intereses) |
| react-native-safe-area-context | Safe areas |
| react-native-reanimated | Animaciones (onboarding) |

---

## Identidad visual

- **Fondo**: `#0a0a0a` (negro editorial)
- **Magenta / primary**: `#9c2247`
- **Cobalt**: `#1a3fa0`
- **Ochre**: `#b3490e`
- **Emerald**: `#0a6b3a`
- **Tipografía serif**: Cormorant Garamond (300 Light, 300 Italic, 400, 500, 600)
- **Tipografía sans**: Inter (400, 500, 600, 700)

