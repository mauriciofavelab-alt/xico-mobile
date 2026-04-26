# Estado del proyecto XICO Mobile

Inventario completo del estado de implementación, pantalla por pantalla y componente por componente.

---

## Pantallas

### ✅ Onboarding (`/onboarding`)
**Estado: Completo y funcional**

- Pantalla de bienvenida con tipografía editorial
- Selección de hasta 4 intereses culturales (8 opciones)
- Persiste en `AsyncStorage` con clave `xico_interests`
- Marca onboarding como completo (`xico_onboarding_done`)
- Animación de entrada con `react-native-reanimated`
- Primer lanzamiento muestra onboarding; re-entradas van directo al Índice
- Passport track: no aplica

---

### ✅ Índice / Portada (`/(tabs)/index.tsx`)
**Estado: Completo — pantalla más fiel al original**

- Masthead editorial con "XICO · Madrid" + "Índice" en Cormorant Garamond 300 Light
- Hero article con ImageBackground + gradient + metadatos
- Sección Momentos: burbujas de stories circulares con ring de color
- StoryViewer: modal fullscreen con progress bars, tap izquierda/derecha, 5s por story
- Sección "Lo más leído": artículos con número de orden
- Sección destacada de largo aliento (dark block)
- RefreshControl con colores de marca
- Navega a `/article/[id]` al presionar cualquier artículo
- Passport track: `primera-lectura`, `explorador`, `conocedor`, `momentos`

---

### ✅ Cultura (`/(tabs)/cultura.tsx`)
**Estado: Completo — fiel al original web**

- Masthead: cobalt dot + "SELECCIÓN CULTURAL" + "Cultura" en 48px Light
- Filtros por subcategoría: `Gastronomía | Artes Visuales | Artes Escénicas | Fotografía | Cine | Literatura | Moda`
- Default filter: **Gastronomía** (igual que el original)
- NO hay filtro "Todas" (fiel al original)
- Filtro "Artes Visuales" incluye subcategoría "Arte Popular" (exacto al original)
- Hero article con ImageBackground de 400px
- Lista de artículos con thumbnail 72x72 + serif title + italic subtitle
- **Bloque "Sello Copil"** (dark magenta, fondo `Colors.primary`): aparece únicamente cuando filter = Gastronomía
  - Label SELLO COPIL en emerald
  - Título serif grande + subtítulo italic
  - Botón "Ver guía →" que navega a `/article/art-003`
- NO hay sección de eventos (fiel al original)
- `stickyHeaderIndices={[1]}` para el scroll de filtros

---

### ✅ México Ahora (`/(tabs)/mexico-ahora.tsx`)
**Estado: Completo — estructura exacta del original**

- Masthead: pulsing ochre dot + "En vivo · Madrid" + "México / *Ahora*" (italic con Cormorant 300 Light Italic)
- **DualClock** (reloj dual real-time): Madrid ↔ CDMX, actualización cada 1 segundo
  - Bloque oscuro `Colors.primary`, con HH:MM + :SS separados
  - Indicador de línea de color por ciudad (ochre Madrid, magenta CDMX)
- **ConvertidorMXN**: MXN ↔ EUR con presets y toggle de dirección
- Sección label "ESTA SEMANA" con "Madrid" a la derecha
- **Agenda Highlight**: bloque oscuro con artículo de subcategoría Agenda
  - Label AGENDA · ESTE MES en cobalt
  - "Ver agenda completa →"
- Sección "LO QUE IMPORTA AHORA" + lista de artículos
- **Featured Long Read**: imagen 4:3 con overlay gradient + body oscuro
  - Tag "Para leer sin prisa"
  - Título grande + subtítulo italic + CTA "Leer [tiempo] →"
- Footer strip "México Ahora · XICO Madrid · 2026"
- NO hay Ruta del Mes aquí (movida a Mi XICO, fiel al original)

---

### ✅ Mi XICO (`/(tabs)/mi-xico.tsx`)
**Estado: Completo — 4 tabs implementados**

#### Header de identidad (oscuro, `Colors.primary`)
- Decoraciones geométricas (3 rectángulos rotados 45°, bordes semitransparentes)
- Label "XICO · Archivo" + dot emerald
- Botón de configuración (gear) → Alert para volver al onboarding
- "Cuenta de" + Nombre "Ana Sofía" en 38px Light
- Línea magenta + tipo de miembro "Círculo Casa de México"
- Badge nivel: "XICO | [nombre del nivel]" con color del nivel
- Tags de intereses (borde blanco semitransparente)

#### Tab: Mi lectura
1. **PassportSection**: header oscuro `#141414`
   - Nombre nivel + pts en box bordeado del color del nivel
   - Progress bar hacia siguiente nivel
   - Fila racha 🔥 + sellos obtenidos ✦
   - Scroll horizontal de sellos: dashed border, emoji, "OBTENIDO" diagonal (rotate -25deg, opacity 0.35)
2. **MomentosInTab**: stories en formato burbuja circular
   - Ring con color acento de cada momento
   - Modal fullscreen StoryViewer (progress bars, 5s, tap para navegar)
3. **RutaSection**: tarjeta oscura `Colors.primary`
   - Timeline con puntos de color por tipo (comida/cultura/paseo/mezcal)
   - Expandible si hay más de 2 paradas
4. **RecomendacionesSection**: artículos filtrados por intereses del usuario
   - Muestra "Personaliza tus intereses" si no hay intereses configurados

#### Tab: Mapa
- Filtros: Todos / Cocina / Cultural / Mezcal / Galerías
- Lista de spots con stripe lateral de color por tipo
- Badge "✦ SELLO COPIL" en amarillo para spots certificados
- Nombre, dirección y descripción de cada spot
- Nota: sin mapa interactivo (Leaflet no disponible en RN; adaptado a lista)

#### Tab: Agenda
- Lista de eventos culturales
- Categoría + precio (Gratis / precio)
- Fecha, hora, venue con emojis de referencia
- Botón **"Voy →"** con RSVP optimista (useMutation + rollback)
- Estado activo "✓ Voy" en emerald
- Passport track: sello "agenda" al hacer primer RSVP

#### Tab: Guardados
- Lista de artículos guardados con thumbnail + título
- Estado vacío: texto editorial + instrucción para guardar
- Nota: el guardado desde artículo funciona si la API lo soporta

---

### ✅ Artículo (`/article/[id].tsx`)
**Estado: Completo**

- Header con imagen hero + gradiente
- Breadcrumb: pillar / subcategoría
- Título en Cormorant Garamond 600 SemiBold
- Subtítulo italic
- Autor + institución + tiempo de lectura
- Cuerpo del artículo en párrafos
- Botón guardar (bookmark)
- Passport track: lectura incrementa contadores

---

## Sistema Passport (gameificación)

**Estado: Completo y funcional**

| Sello | ID | Condición | Pts |
|---|---|---|---|
| Primera Lectura | `primera-lectura` | Leer 1 artículo | 15 |
| Explorador | `explorador` | Leer 3 artículos | 35 |
| Conocedor | `conocedor` | Leer 7 artículos | 80 |
| Flash Cultural | `momentos` | Ver un Momento | 20 |
| Agendado | `agenda` | RSVP a un evento | 30 |
| En Ruta | `ruta` | Ver la Ruta del Mes | 25 |
| Curador | `guardado` | Guardar un artículo | 25 |
| Madrugador | `madrugador` | Entrar antes de las 9h | 20 |

**Niveles XICO:**
- Semilla (0–49 pts) — verde
- Guardián (50–124 pts) — azul
- Anciano (125–199 pts) — ochre
- Supremo (200+ pts) — magenta

**Persistencia**: `AsyncStorage` con clave `xico_passport`
**Toast**: `StampNotification` aparece al ganar un sello (3.5s, auto-dismiss)

---

## Qué faltaría para TestFlight / App Store

### Bloqueante
- [ ] API real desplegada (actualmente mock local)
- [ ] Variables de entorno para producción (`EXPO_PUBLIC_DOMAIN` → dominio real)
- [ ] Iconos definitivos (icon.png 1024×1024, splash-icon.png)
- [ ] Cuenta de Apple Developer / Google Play

### Importante
- [ ] Guardar artículos desde la pantalla de artículo (endpoint `/api/save` con autenticación)
- [ ] Sistema de autenticación real (actualmente perfil es mock "Ana Sofía")
- [ ] Notificaciones push (agenda, nuevos artículos)
- [ ] Accesibilidad (accessibilityLabel en botones clave)

### Deseable
- [ ] Mapa real de spots (react-native-maps) en tab Mapa
- [ ] Búsqueda de artículos
- [ ] Modo offline básico (caché de react-query)
- [ ] Haptic feedback en interacciones clave
- [ ] Analytics (Expo Insights / Amplitude)

---

## Conectividad actual

| Dato | Endpoint | Estado |
|---|---|---|
| Artículos cultura | `GET /api/articles?pillar=cultura` | ✅ Conectado |
| Artículos México Ahora | `GET /api/articles?pillar=mexico-ahora` | ✅ Conectado |
| Momentos | `GET /api/momentos` | ✅ Conectado |
| Spots | `GET /api/spots` | ✅ Conectado |
| Ruta del mes | `GET /api/ruta` | ✅ Conectado |
| Eventos | `GET /api/events` | ✅ Conectado |
| RSVP eventos | `POST /api/events/:id/rsvp` | ✅ Conectado |
| Artículos guardados | `GET /api/saved` | ✅ Conectado |
| Perfil de usuario | `GET /api/profile` | ✅ Conectado |
| Passport (sellos) | AsyncStorage local | ✅ Funcional |
| Racha de lectura | AsyncStorage local | ✅ Funcional |
| Intereses | AsyncStorage local | ✅ Funcional |
