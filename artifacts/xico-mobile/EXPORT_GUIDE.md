# Guía de exportación — XICO Mobile

Instrucciones para sacar el proyecto de Replit y continuar el desarrollo localmente.

---

## 1. Qué exportar

La app móvil está en:

```
artifacts/xico-mobile/
```

El servidor API (datos mock) está en:

```
artifacts/api-server/
```

Exporta ambas carpetas. Si solo quieres la app móvil (con tu propia API), exporta solo `xico-mobile/`.

---

## 2. Qué NO incluir en el zip

Excluye siempre:

```
node_modules/
.expo/
dist/
.cache/
*.log
.DS_Store
```

### Comando correcto para comprimir (desde la raíz del monorepo):

```bash
zip -r xico-mobile-export.zip artifacts/xico-mobile \
  -x "*/node_modules/*" \
  -x "*/.expo/*" \
  -x "*/dist/*" \
  -x "*/.cache/*" \
  -x "*.log" \
  -x "*/.DS_Store"
```

Para incluir también el API server:

```bash
zip -r xico-export-completo.zip \
  artifacts/xico-mobile \
  artifacts/api-server \
  -x "*/node_modules/*" \
  -x "*/.expo/*" \
  -x "*/dist/*" \
  -x "*/.cache/*" \
  -x "*.log"
```

---

## 3. Abrir en VS Code / local

```bash
# 1. Descomprime
unzip xico-mobile-export.zip -d xico-mobile-local

# 2. Entra al proyecto
cd xico-mobile-local/artifacts/xico-mobile

# 3. Instala dependencias
npm install -g pnpm  # si no tienes pnpm
pnpm install

# 4. Configura variables de entorno
cp .env.example .env.local
# Edita .env.local con tu dominio/IP del servidor API

# 5. Levanta el servidor API (en otra terminal, si lo exportaste)
# cd ../api-server && pnpm install && pnpm run dev

# 6. Corre la app
EXPO_PUBLIC_DOMAIN=localhost:8080 npx expo start
```

---

## 4. Configuración de VS Code recomendada

Instala estas extensiones:
- **React Native Tools** (Microsoft)
- **Expo Tools** (expo.io)
- **Prettier** para formateo
- **TypeScript** (ya incluido en VS Code)

Crea `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

---

## 5. Eliminar dependencias de Replit

### `app.json` — origen del router

Actualmente tiene:
```json
"plugins": [
  ["expo-router", { "origin": "https://replit.com/" }]
]
```

Fuera de Replit, cambia a:
```json
"plugins": [
  ["expo-router", { "origin": "exp://localhost:19000" }]
]
```
O simplemente:
```json
"plugins": ["expo-router", "expo-font", "expo-web-browser"]
```

### `package.json` — script `dev`

El script actual tiene variables de Replit. Para desarrollo local, usa:
```bash
EXPO_PUBLIC_DOMAIN=localhost:8080 npx expo start
```

---

## 6. Primeros pasos de desarrollo fuera de Replit

1. **Verificar que el API funciona**: `curl http://localhost:8080/api/articles`
2. **Abrir la app en Expo Go**: escanea el QR que aparece en terminal
3. **Comprobar que se carga la pantalla home** con artículos reales
4. **Revisar onboarding**: borra AsyncStorage en dev tools si quieres verlo de nuevo
5. **Probar navegación**: Cultura → México Ahora → Mi XICO → artículo

---

## 7. Para build de producción (TestFlight / Play Store)

### Prerequisitos
- Cuenta de Apple Developer ($99/año) para iOS
- Cuenta de Google Play ($25 único) para Android
- EAS CLI: `npm install -g eas-cli`

### Pasos

```bash
# 1. Configura EAS
eas login
eas build:configure

# 2. Build iOS (TestFlight)
eas build --platform ios --profile preview

# 3. Build Android (APK para testeo)
eas build --platform android --profile preview

# 4. Submit a stores
eas submit --platform ios
eas submit --platform android
```

### Ajustes necesarios antes de producción

- Configurar `EXPO_PUBLIC_DOMAIN` con el dominio real de tu API desplegada
- Actualizar `app.json`: `bundleIdentifier`, `package`, `version`
- Agregar iconos y splash screen definitivos en `assets/images/`
- Revisar la pantalla MOBILE_STATUS.md para features incompletas

---

## 8. Estructura del monorepo (contexto)

Si exportas el monorepo completo, la estructura es:

```
workspace/
├── artifacts/
│   ├── xico-mobile/      ← App React Native (ESTA)
│   ├── xico/             ← Web app React/Vite (original)
│   ├── api-server/       ← API REST Express (datos)
│   └── mockup-sandbox/   ← Sandbox de componentes (solo Replit)
├── packages/             ← Paquetes compartidos
└── pnpm-workspace.yaml
```

La app móvil es **completamente independiente** de la web app.
Solo comparte el servidor API.

