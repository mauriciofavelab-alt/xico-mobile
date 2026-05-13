// Seed the inaugural Ruta + 30 days of madrid_pulse + 8 time-mode companion
// rows. Runs over the direct Postgres connection (no Supabase JS SDK needed),
// to keep us out of the workspace dependency tangle.
//
// Usage:
//   SUPABASE_DB_URL="postgresql://..." node scripts/seed-ruta-rumbos-pg.mjs

import postgres from "postgres";

const url = process.env.SUPABASE_DB_URL;
if (!url) {
  console.error("SUPABASE_DB_URL is required");
  process.exit(1);
}

const sql = postgres(url, { ssl: "require", max: 1, idle_timeout: 5, connect_timeout: 15 });

// ─── Inaugural Ruta · 5 Madrid stops · rumbos: N/E/S/O/N ────────────────
const STOPS = [
  {
    id: "stop-001",
    lat: 40.4286,
    lng: -3.6885,
    rumbo_slug: "norte",
    despacho_text:
      "Casa de México lleva ocho años siendo la pieza institucional de México en Madrid, y eso es exactamente lo que la vuelve un punto de partida y no un destino. La colección de arte popular del primer piso está organizada por estado, no por género: una decisión curatorial que importa. Empieza por la sala de Oaxaca — los barros negros y las cerámicas vidriadas de Atzompa están firmadas por maestros vivos cuyos nombres figuran en las cédulas. Eso es lo que diferencia esta casa de un museo etnográfico: aquí los objetos no son piezas, son obras. Antes de salir, pasa por la tienda Hecho a Mano: no es souvenir, es comercio justo con cooperativas verificadas. La pieza que te lleves de aquí será el contexto para todo lo que sigue.",
    apunte_in_situ:
      "Estás de pie frente a la fachada. Fíjate en la cantera rosa importada de Querétaro — no es decoración, es la única piedra que se usó en la rehabilitación. Si entras antes de las seis, busca en la tienda los textiles de Teotitlán: los rojos vienen de grana cochinilla, el mismo tinte que pintó los mantos de San Ginés. Hoy aquí empieza una conversación que tu mezcal de las nueve va a continuar sin pedirte permiso.",
  },
  {
    id: "stop-002",
    lat: 40.4221,
    lng: -3.6741,
    rumbo_slug: "este",
    despacho_text:
      "Punto MX es la cocina mexicana más rigurosa de Europa, y Roberto Ruiz no permite que esa frase suene a publicidad. Las dos estrellas Michelin son consecuencia, no objetivo. Lo que aquí se cocina es una traducción precisa: Roberto entiende que España y México comparten despensa pero no gramática, y su menú resuelve esa distancia plato por plato. Pide el ensamble de Durango si tu nariz está despierta, o cualquiera de los espadín de los hermanos Méndez si quieres reconocer Oaxaca en estado puro. Las tostadas de aguacate con chapulín no son atrevimiento: son la confirmación de que el chapulín pertenece a esta mesa. Roberto sale a sala. Si está, pregúntale por su último viaje a Tlacolula — y escucha más de lo que hablas.",
    apunte_in_situ:
      "Pide al sommelier la lista de mezcales por tipo de agave, no por marca. Hay una línea de Tobalá de Santa Catarina Minas que no aparece en carta abierta — pregúntala. Y mira las paredes: el barro es de Mata Ortiz, no decorativo. Cada pieza tardó tres meses en hacerse a mano por familias específicas que Roberto cita por nombre en el dorso del menú.",
  },
  {
    id: "stop-003",
    lat: 40.4214,
    lng: -3.7006,
    rumbo_slug: "sur",
    despacho_text:
      "Barracuda MX es lo que pasa cuando la coctelería deja de imitar Nueva York y vuelve a su origen agavero. La barra propone una conversación entre el mezcal y los bitters que casi nadie en Madrid sabe sostener: chocolate oaxaqueño, hoja santa, sal de gusano. Pide el Mezcal Negroni si quieres entender cómo se transforma un clásico italiano cuando le quitas la ginebra y le devuelves la tierra. O el Spicy Margarita de habanero si quieres recordar que la coctelería mexicana nunca fue dulce: es picante, terrosa, ceremonial. Lo que aquí se sirve no se mide en grados de alcohol sino en grados de presencia. Bebes despacio porque la barra te obliga a hacerlo, y ese ritmo es la mitad del propósito.",
    apunte_in_situ:
      "La iluminación cambia a las nueve. Antes es ámbar — después es coral, casi rosa Barragán. Es deliberado. Pídele al bartender el cóctel que no está en carta esta semana — siempre hay uno. Mira el detrás de barra: las botellas no están ordenadas por precio sino por estado de origen. El mapa entero de México está en esa pared, si sabes leerlo.",
  },
  {
    id: "stop-004",
    lat: 40.4109,
    lng: -3.7036,
    rumbo_slug: "oeste",
    despacho_text:
      "Corazón de Agave es Lavapiés, y eso importa. No es un bar mexicano en Madrid: es Lavapiés haciendo mezcal con la misma seriedad con la que el barrio hace pan, lana y libros usados. Las 60 referencias en la carta no son acumulación, son curaduría: cada agave del menú tiene un nombre, una región, un productor y una historia familiar. Aquí el mezcal se bebe solo, en vaso de barro negro, con la naranja y la sal de gusano que México pide como acompañante — no como adorno. Las botanas son gratis y no son gesto comercial: son la lógica del mezcal entendida correctamente. Si te quedas dos horas, vas a ver pasar por la barra a tres generaciones distintas — y vas a entender por qué Lavapiés siempre supo lo que Salamanca tarda en aprender.",
    apunte_in_situ:
      "Mira las paredes: las botellas más viejas están arriba, no por jerarquía sino porque la luz del oeste les llega mejor por la tarde. El dueño se llama Andrés. Si está esta noche, pregúntale por el Tobalá silvestre de su tío — solo lo saca cuando alguien se lo pide bien. El barro de los vasos viene de San Bartolo Coyotepec, mismo pueblo que las piezas de Casa de México donde empezaste.",
  },
  {
    id: "stop-005",
    lat: 40.4264,
    lng: -3.7062,
    rumbo_slug: "norte",
    despacho_text:
      "La Tilica cierra esta Ruta con 85 referencias y un calendario que importa: los jueves abren cata con productores reales de Oaxaca — gente que viajó desde Santiago Matatlán, no representantes de marca. Eso es lo que diferencia a este bar de otros con cartas igual de largas. Aquí no hay filtro entre el bebedor y la persona que destila. Pide cualquier mezcal del valle de Sola de Vega si quieres terminar la noche en territorio salvaje, o un Cuishe si quieres recordar que algunos agaves tardan veinte años en madurar y eso explica por qué los bebes con respeto. La Tilica es el regreso al norte: la memoria del agave, el cierre de la conversación que empezó en Casa de México a las cinco de la tarde. Lo que llevas en el cuerpo a esta hora es Madrid traducida al español que tú hablas.",
    apunte_in_situ:
      "Si es jueves y hay productor en barra, te toca lotería editorial: siéntate sin hacer ruido. La iluminación a esta hora es la más cálida de toda la Ruta — fíjate cómo el rosa Barragán de Barracuda se ha transformado aquí en algo más íntimo, casi de vela. Mira la pizarra detrás de la barra: el agave del mes está escrito a tiza. Pídelo aunque ya hayas pedido otro — vale la pena cerrar con esa nota.",
  },
];

// ─── 30 days of madrid_pulse ─────────────────────────────────────────────
const PULSE_LINES = [
  "El Retiro está cubriéndose de tilos en flor — el olor entra hasta Lavapiés cuando sopla suroeste. Esta semana también: Museo Reina Sofía abrió sala nueva con Soriano.",
  "Lluvia inesperada en Atocha esta mañana. Las terrazas de Plaza Tirso recogieron toldos a las once. En la noche, todo volvió a salir.",
  "Concierto improvisado de mariachi en Plaza Olavide la noche del viernes — un grupo de Guadalajara de paso. Duró cuarenta minutos antes de que la policía llegara, amable.",
  "Casa de México estrena exposición de cerámica de Tlaquepaque mañana. Inauguración a las siete, abierto al público sin invitación. La tienda Hecho a Mano tendrá descuento doble este sábado.",
  "Calor seco subió a 29° en Sol. Las heladerías de Malasaña recuperaron el ritmo de junio. Llamoso volvió a poner el sabor de mamey en carta.",
  "La Casa Encendida programó ciclo de cine mexicano contemporáneo — empieza con Carlos Reygadas el jueves. Entrada libre. El bar de la azotea sirve mezcal hasta las dos.",
  "En El Rastro este domingo apareció un puesto nuevo de textil de Oaxaca — la dueña es de Teotitlán, lleva tres meses en Madrid. Está antes de la Plaza del Campillo del Mundo Nuevo.",
  "Punto MX cambia menú esta semana. Roberto Ruiz volvió de su viaje a Yucatán con receta nueva de cochinita. Reservar con dos semanas si es viernes.",
  "Mauricio Pino dio charla en Casa América sobre arte mexica el martes — sala llena. Repetirá el próximo mes. Su libro nuevo está en La Central.",
  "Sopló viento del norte y bajó la temperatura cinco grados de un día para otro. Los abrigos volvieron. Las terrazas de Conde Duque cubrieron mesas.",
  "Festival de Otoño-Primavera anunció función de Tania Solomonoff en abril. Su última obra mezcla danza y poesía mexica. La sala se llenará en horas.",
  "Inauguración en La Maja Galería: pintura contemporánea de Veracruz. La artista, Mónica Mayer hija, estará presente la noche del miércoles a partir de las ocho.",
  "El Mercado de San Fernando renovó tres puestos. Uno es de productos oaxaqueños: chocolate de metate, sal de gusano envasada, totopos azules. Está al fondo, a la izquierda.",
  "Filmoteca proyecta retrospectiva de Iván Trujillo. Empieza con su corto sobre Tlaltelolco. Funciones diarias a las seis. Entrada cuatro euros, bono diez.",
  "La librería del Centro Cultural de la Villa metió en mesa de novedades a Daniela Tarazona. Vino a Madrid el mes pasado, se queda hasta junio. Conferencia el viernes.",
  "Los jardines de Sabatini huelen a azahar este fin de semana. Es el momento del año. Si pasas, pasa por el lado oeste — la luz a las siete es del color que vuelve.",
  "Apertura de un nuevo restaurante yucateco en Conde Duque — pequeño, sin reservas. Se llama K'aax. El cocinero, Daniel Espinosa, viene del Punto MX.",
  "Concierto de Natalia Lafourcade confirmado para julio en La Riviera. Salida de entradas el lunes. Se va a agotar en horas — esto no es alarmismo, es histórico.",
  "Museo Cerralbo abre nocturno extraordinario el sábado: visita a la luz de vela. Solo la planta noble. Capacidad limitada, sin reserva, primero que llegue.",
  "El Reina Sofía presenta primera retrospectiva de Mariana Castillo Deball el próximo mes. La artista oaxaqueña vive entre Berlín y CDMX. Inauguración pública.",
  "Las primeras moras del año aparecieron en Mercado de Antón Martín — son de Almería, no mexicanas, pero el dueño del puesto las eligió pensando en clientes que recuerdan.",
  "Una librería nueva abrió en Argüelles especializada en literatura latinoamericana. Se llama Tornamesa. Los miércoles hacen lectura abierta con escritor invitado.",
  "Tropicana programa una temporada de mezcal en colaboración con Casa Cortés. Una semana cada mes, diferentes catas. Empieza el primer viernes de junio.",
  "El barrio de Tetuán está organizando un festival comunitario de cocinas migrantes — habrá puesto mexicano, peruano, marroquí, senegalés. Tercer sábado del mes.",
  "Casa América anunció charla con Élmer Mendoza sobre narcoliteratura. Es gratis pero requiere inscripción. La fila se forma una hora antes. Es así desde hace tres años.",
  "Una exposición de fotografía de Graciela Iturbide acaba de bajar del Reina Sofía y se va al Museo Nacional Centro de Arte. Última semana para verla aquí.",
  "Los chiringuitos del Manzanares abrieron por temporada. Tres de ellos sirven mezcal con sal de gusano. El mejor está al lado del Puente de Segovia.",
  "Sevilla manda lluvia esta semana — Madrid recibirá lunes y martes. Llévate la chamarra antes de salir. Después el clima vuelve a la primavera. El pronóstico es estable.",
  "Una imprenta artesanal en Embajadores está sacando una edición limitada de poesía mexicana traducida al italiano. Es bilingüe. Cuesta lo que vale.",
  "La Maja del Goya abrió de nuevo después de la rehabilitación. La sala restaurada huele a barniz fresco. Vale la pena ir antes de que la cubran de visitantes.",
];

// ─── 8 time-mode companion_phrases rows (40 phrases total) ───────────────
const COMPANION_ROWS = [
  { level: "Iniciado", narration_style: "intellectual", time_mode: "madrugada", phrases: [
    "A esta hora, los libros leen distinto. No tengas prisa.",
    "Las preguntas de las tres de la mañana son las más honestas.",
    "Lo que importa a esta hora no importa igual mañana — y eso está bien.",
    "El despacho lleva horas ahí. Te esperaba sin saber que te esperaba.",
    "Lo escrito a esta hora se queda. Mañana lo vas a reconocer.",
  ]},
  { level: "Iniciado", narration_style: "visual", time_mode: "madrugada", phrases: [
    "Madrid duerme. Tú estás despierta. Mira despacio.",
    "La luz del teléfono es la única vela que tienes ahora. Suficiente.",
    "Los colores cambian de noche. Vas a verlos de otra forma.",
    "El detalle que ignoraste ayer, a esta hora se hace visible.",
    "El encuadre nocturno tiene otra honestidad. Confía en lo que aparece.",
  ]},
  { level: "Conocedor", narration_style: "intellectual", time_mode: "madrugada", phrases: [
    "Pocas cosas se sienten verdaderas a las cuatro. Esto sí.",
    "Lo que guardas a esta hora pesa distinto. Guárdalo igual.",
    "El criterio nocturno suele ser el que importa por la mañana.",
    "Madrid en la madrugada es otra ciudad. Estás en ella sola.",
    "El insomnio también es una forma de curaduría. Estás eligiendo qué pensar.",
  ]},
  { level: "Cronista", narration_style: "conceptual", time_mode: "madrugada", phrases: [
    "La crónica que importa se escribe a esta hora. Sin testigos.",
    "Lo que documentas en la madrugada lleva otra densidad.",
    "El cronista nocturno acepta que la objetividad es una ilusión diurna.",
    "Lo no fotografiado a esta hora suele ser lo único que ocurrió de verdad.",
    "Madrid de madrugada es el archivo que nadie te pidió hacer. Hazlo igual.",
  ]},
  { level: "Iniciado", narration_style: "visual", time_mode: "atardecer", phrases: [
    "Madrid se está poniendo del color que recuerdas de algún piso en Coyoacán.",
    "La hora dorada en Lavapiés tiene textura. Mira el suelo.",
    "El cielo a esta hora pide algo de tu atención. Dáselo cinco minutos.",
    "Los muros respiran distinto a las ocho. Pasa cerca de uno.",
    "Cihuatlampa — el oeste mexica — está dejando su lectura en Madrid ahora mismo.",
  ]},
  { level: "Iniciado", narration_style: "kinesthetic", time_mode: "atardecer", phrases: [
    "El día se está acomodando. Tú también puedes.",
    "Si vas a salir, sal ahora. La luz de las ocho es la única que importa hoy.",
    "El cuerpo a esta hora pide caminar. Hazle caso.",
    "Sentarte en una terraza antes de las nueve no es derroche. Es disciplina.",
    "El paso cambia al atardecer. Más lento, más atento.",
  ]},
  { level: "Conocedor", narration_style: "material", time_mode: "atardecer", phrases: [
    "El mezcal a esta hora tiene otra densidad. Pídelo despacio.",
    "La piedra de Madrid se calienta al atardecer y suelta lo que guardó del día.",
    "El barro de Mata Ortiz a la luz de las ocho es otra pieza. Mírala otra vez.",
    "Los textiles guardan la temperatura. Toca uno antes de cenar.",
    "El pan a esta hora ya no es desayuno. Es ceremonia.",
  ]},
  { level: "Cronista", narration_style: "conceptual", time_mode: "atardecer", phrases: [
    "El atardecer es la única hora del día en que México y España coinciden de verdad.",
    "Lo que se documenta a esta hora suele convertirse en archivo sin esfuerzo.",
    "El cronista del atardecer trabaja con luz prestada. Aprovéchala.",
    "Cierra el día con una pieza, no con una lista. Te va a quedar mejor.",
    "La hora dorada es estructural, no decorativa. Está cambiando lo que estás viendo.",
  ]},
];

console.log("→ seed-ruta-rumbos-pg: starting");

try {
  // 0. Verify rumbos seeded by migration
  const rumbos = await sql`SELECT id, slug FROM rumbos`;
  if (rumbos.length !== 4) {
    throw new Error(`Expected 4 rumbos, got ${rumbos.length}. Migration not applied?`);
  }
  const rumboBySlug = Object.fromEntries(rumbos.map((r) => [r.slug, r.id]));
  console.log("  ✓ rumbos present (4 rows)");

  // 1. Update ruta-001
  await sql`
    UPDATE ruta SET
      week_key = '2026-W19',
      editor_name = 'María Vázquez',
      published_at = '2026-05-10T09:00:00+02:00'
    WHERE id = 'ruta-001'
  `;
  console.log("  ✓ ruta-001 marked as Semana 19 inaugural (María Vázquez)");

  // 2. Update 5 stops
  for (const s of STOPS) {
    await sql`
      UPDATE ruta_stops SET
        lat = ${s.lat},
        lng = ${s.lng},
        rumbo_id = ${rumboBySlug[s.rumbo_slug]},
        despacho_text = ${s.despacho_text},
        apunte_in_situ = ${s.apunte_in_situ}
      WHERE id = ${s.id}
    `;
  }
  console.log("  ✓ 5 ruta_stops enriched with geo + rumbo + dual text layer");

  // 3. madrid_pulse · 30 rolling days
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateKey = d.toISOString().slice(0, 10);
    const text = PULSE_LINES[i % PULSE_LINES.length];
    await sql`
      INSERT INTO madrid_pulse (date_key, text, editor_name)
      VALUES (${dateKey}, ${text}, 'María Vázquez')
      ON CONFLICT (date_key) DO UPDATE SET
        text = EXCLUDED.text,
        editor_name = EXCLUDED.editor_name
    `;
  }
  console.log("  ✓ madrid_pulse seeded (30 rows)");

  // 4. companion_phrases time-mode rows
  let phraseCount = 0;
  for (const r of COMPANION_ROWS) {
    await sql`
      INSERT INTO companion_phrases (level, narration_style, time_mode, phrases)
      VALUES (${r.level}, ${r.narration_style}, ${r.time_mode}, ${r.phrases})
      ON CONFLICT (level, narration_style, time_mode) DO UPDATE SET
        phrases = EXCLUDED.phrases
    `;
    phraseCount += r.phrases.length;
  }
  console.log(`  ✓ companion_phrases time-mode variants seeded (${COMPANION_ROWS.length} rows, ${phraseCount} phrases)`);

  console.log("→ seed-ruta-rumbos-pg: done\n");
} catch (e) {
  console.error("✗ Seed failed:");
  console.error("  code:", e.code);
  console.error("  message:", e.message);
  if (e.detail) console.error("  detail:", e.detail);
  process.exit(1);
} finally {
  await sql.end();
}
