# TestFlight Build #11 · "What's New" copy

App Store Connect → TestFlight → Build #11 → "Beta App Information" or "What's New" field. Paste either the short or long version below depending on the audience.

## Short (≤ 300 chars · the App Store Connect "What's New" field)

```
Build 11 · La Ruta Semanal inaugural.

María Vázquez publica 5 paradas en Madrid · una por barrio. Cinco rumbos del Pasaporte se llenan al caminar. El apunte in situ se abre solo cuando llegas al sitio. Sin streaks. Sin notificaciones. Solo paso.
```

(290 chars)

## Long (≤ 4000 chars · for Beta App Description or release notes blog)

```
Build 11 · 14 de mayo de 2026 · Madrid

Es la primera versión instalable de XICO con La Ruta Semanal funcionando
de extremo a extremo. La inaugural Ruta, escrita por la editora María
Vázquez, recorre cinco paradas en cinco barrios distintos de Madrid:

  1. Chamberí · Casa de México en España (Alberto Aguilera 20)
  2. Salamanca · Punto MX (Pardiñas 40)
  3. Retiro · Barracuda MX (Valenzuela 7)
  4. La Latina · Corazón Agavero (Humilladero 28)
  5. Malasaña · La Botica de la Condesa (La Palma 2)

Cada parada tiene dos capas:

· un despacho público que se lee desde el sofá, escrito por María
· un apunte in situ que solo se abre cuando físicamente llegas al sitio,
  detectado por geolocalización con un margen de 50 metros

Caminar las cinco llena los cuatro rumbos del Pasaporte de los Cuatro
Rumbos — Mictlampa (memoria), Tlapallan (luz), Huitzlampa (fuego),
Cihuatlampa (oficio). No hay puntos. No hay rachas. No hay notificaciones
que empujen. Solo el acto de estar ahí.

Otras cosas en este build:

· Modo hora — la tipografía cambia entre madrugada, día y atardecer
· Re-entrada emocional — si vuelves después de siete días, te recibe
  sin culpa
· El Despacho del día — nota cultural breve cada mañana
· Carta del Equipo — selección personalizada según tus intereses
· Audio narrado por IA (voz Bella, multilingüe español) — actualmente
  bloqueado por el límite del plan gratuito de ElevenLabs; se activa
  cuando se contrate el plan pagado

Lo que NO está en este build:

· La versión en inglés (manifestamos lanzar primero en español)
· Notificaciones push
· La galería de fotos por parada
· El archivo histórico de Rutas pasadas (esta es la primera)

XICO no informa. Revela.

— El equipo editorial XICO
```

## Subject lines (if you want to send a personal email to your TestFlight invitees)

Pick one:

- `XICO está listo. La primera Ruta de la semana se camina mañana.`
- `Cinco paradas en Madrid. Una llave por cada barrio. Comienza aquí.`
- `Esto que estás a punto de instalar es la versión 1.0 de XICO.`

## Note on App Store Connect's "Test Information" panel

The Test Information panel (not the same as What's New) wants:

- **Sign-in required**: Yes
- **Sign-in info**: "Solicita un magic-link al correo del invitado. El enlace caduca en 1 hora. No hay contraseña."
- **Contact info**:
  - Name: Mauricio Favela
  - Email: maufavela@hotmail.com
  - Phone: (optional)
- **Notes for review**: "App requires Spain location for La Ruta walking flow. Each stop has a 50m geo-fence. To test the sello earn flow without physically being in Madrid, use Xcode → Debug → Simulate Location → Custom Location → enter the latitude/longitude of any stop from /api/ruta/current."

Apple's TestFlight Beta App Review reviewers don't typically walk Madrid; they need the override path or they'll mark the geo-locked feature as "unable to verify."
