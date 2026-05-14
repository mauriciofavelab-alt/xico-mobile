/**
 * XICO · seed-ruta-rumbos.ts
 *
 * Week 1 typed seed for La Ruta Semanal v1:
 *   1. Update ruta-001 with week_key / editor_name / published_at
 *   2. UPDATE each of 5 ruta_stops with name/address/description/lat/lng/rumbo_id/despacho_text/apunte_in_situ
 *   3. Seed 30 rolling days of madrid_pulse
 *   4. Seed ~20 time-mode-specific companion_phrases (madrugada + atardecer)
 *
 * Run via seed-all.ts. Idempotent: uses UPDATE for ruta data, UPSERT for new rows.
 *
 * 2026-05-14 pre-TestFlight coord audit:
 *   - All 5 stop coords previously off by 400m-3km (one was 3km wrong). Corrected
 *     against Google Maps + OpenStreetMap Nominatim. Verified to within 20m.
 *   - Stop 5 ("La Tilica Mezcalería") didn't exist as a Madrid venue. Replaced
 *     with La Botica de la Condesa (Calle La Palma 2, Malasaña) — the documented
 *     "first mezcalería in Europe" with a real editorial story.
 *   - Stop 4 ("Corazón Agavero") despacho previously claimed Lavapiés but the
 *     real venue is in La Latina (Humilladero 28). Despacho rewritten.
 *
 * Rumbo assignment for the inaugural Ruta (5 stops across 4 cardinal directions
 * so the user's first walk distributes sellos across the pasaporte):
 *   Stop 1 · Casa de México         → Norte / Mictlampa (memoria institucional)
 *   Stop 2 · Punto MX               → Este  / Tlapallan (amanecer · cocina renovada)
 *   Stop 3 · Barracuda MX           → Sur   / Huitzlampa (fuego · coctelería)
 *   Stop 4 · Corazón Agavero        → Oeste / Cihuatlampa (atardecer · oficio del mezcal)
 *   Stop 5 · La Botica de la Condesa → Norte / Mictlampa (regreso al origen · primera mezcalería de Europa)
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabase: SupabaseClient = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_ANON_KEY as string,
);

type RumboSlug = "norte" | "sur" | "este" | "oeste";

type StopSeed = {
  id: string;
  lat: number;
  lng: number;
  rumbo_slug: RumboSlug;
  despacho_text: string;
  apunte_in_situ: string;
  // Optional · only set when the audit corrects an upstream value from seed.sql.
  // When present, the row's existing column is overwritten.
  name?: string;
  address?: string;
  description?: string;
};

// ─── Inaugural Ruta · ruta-001 · Semana 19 · 2026-05-13 ───────────────────
const STOPS: StopSeed[] = [
  {
    id: "stop-001",
    // Casa de México en España · Alberto Aguilera 20, Chamberí.
    // Verified via Google Maps 2026-05-14. Previous seed was 1.8km off.
    lat: 40.4301,
    lng: -3.7095,
    rumbo_slug: "norte",
    address: "Calle de Alberto Aguilera, 20, Chamberí",
    despacho_text:
      "Casa de México lleva ocho años siendo la pieza institucional de México en Madrid, y eso es exactamente lo que la vuelve un punto de partida y no un destino. La colección de arte popular del primer piso está organizada por estado, no por género: una decisión curatorial que importa. Empieza por la sala de Oaxaca — los barros negros y las cerámicas vidriadas de Atzompa están firmadas por maestros vivos cuyos nombres figuran en las cédulas. Eso es lo que diferencia esta casa de un museo etnográfico: aquí los objetos no son piezas, son obras. Antes de salir, pasa por la tienda Hecho a Mano: no es souvenir, es comercio justo con cooperativas verificadas. La pieza que te lleves de aquí será el contexto para todo lo que sigue.",
    apunte_in_situ:
      "Estás de pie frente a la fachada. Fíjate en la cantera rosa importada de Querétaro — no es decoración, es la única piedra que se usó en la rehabilitación. Si entras antes de las seis, busca en la tienda los textiles de Teotitlán: los rojos vienen de grana cochinilla, el mismo tinte que pintó los mantos de San Ginés. Hoy aquí empieza una conversación que tu mezcal de las nueve va a continuar sin pedirte permiso.",
  },
  {
    id: "stop-002",
    // Punto MX · Calle del General Pardiñas 40 B, Salamanca.
    // Verified via Nominatim 2026-05-14. Previous seed was 700m off.
    lat: 40.4277,
    lng: -3.6783,
    rumbo_slug: "este",
    address: "Calle del General Pardiñas, 40 B, Salamanca",
    despacho_text:
      "Punto MX es la cocina mexicana más rigurosa de Europa, y Roberto Ruiz no permite que esa frase suene a publicidad. Las dos estrellas Michelin son consecuencia, no objetivo. Lo que aquí se cocina es una traducción precisa: Roberto entiende que España y México comparten despensa pero no gramática, y su menú resuelve esa distancia plato por plato. Pide el ensamble de Durango si tu nariz está despierta, o cualquiera de los espadín de los hermanos Méndez si quieres reconocer Oaxaca en estado puro. Las tostadas de aguacate con chapulín no son atrevimiento: son la confirmación de que el chapulín pertenece a esta mesa. Roberto sale a sala. Si está, pregúntale por su último viaje a Tlacolula — y escucha más de lo que hablas.",
    apunte_in_situ:
      "Pide al sommelier la lista de mezcales por tipo de agave, no por marca. Hay una línea de Tobalá de Santa Catarina Minas que no aparece en carta abierta — pregúntala. Y mira las paredes: el barro es de Mata Ortiz, no decorativo. Cada pieza tardó tres meses en hacerse a mano por familias específicas que Roberto cita por nombre en el dorso del menú.",
  },
  {
    id: "stop-003",
    // Barracuda MX · Calle de Valenzuela 7, Retiro (NOT Calle del Almirante 26
    // as the original seed.sql address implied). Verified via Apple Maps
    // 2026-05-14. Previous seed was in a different block of central Madrid.
    lat: 40.4190,
    lng: -3.6893,
    rumbo_slug: "sur",
    address: "Calle de Valenzuela, 7, Retiro",
    despacho_text:
      "Barracuda MX es lo que pasa cuando la coctelería deja de imitar Nueva York y vuelve a su origen agavero. La barra propone una conversación entre el mezcal y los bitters que casi nadie en Madrid sabe sostener: chocolate oaxaqueño, hoja santa, sal de gusano. Pide el Mezcal Negroni si quieres entender cómo se transforma un clásico italiano cuando le quitas la ginebra y le devuelves la tierra. O el Spicy Margarita de habanero si quieres recordar que la coctelería mexicana nunca fue dulce: es picante, terrosa, ceremonial. Lo que aquí se sirve no se mide en grados de alcohol sino en grados de presencia. Bebes despacio porque la barra te obliga a hacerlo, y ese ritmo es la mitad del propósito.",
    apunte_in_situ:
      "La iluminación cambia a las nueve. Antes es ámbar — después es coral, casi rosa Barragán. Es deliberado. Pídele al bartender el cóctel que no está en carta esta semana — siempre hay uno. Mira el detrás de barra: las botellas no están ordenadas por precio sino por estado de origen. El mapa entero de México está en esa pared, si sabes leerlo.",
  },
  {
    id: "stop-004",
    // Corazón Agavero Mezcaloteca · Calle del Humilladero 28, La Latina.
    // Verified via Nominatim 2026-05-14. Previous seed was 700m off and the
    // despacho text incorrectly claimed Lavapiés as the neighborhood.
    lat: 40.4094,
    lng: -3.7104,
    rumbo_slug: "oeste",
    address: "Calle del Humilladero, 28, La Latina",
    despacho_text:
      "Corazón Agavero es La Latina, y eso importa. No es un bar mexicano en Madrid: es La Latina haciendo mezcal con la misma seriedad con la que el barrio hace tabernas castizas, anticuarios y librerías de viejo. Las más de 300 referencias entre tequila, mezcal, sotol, raicilla y bacanora no son acumulación, son curaduría: cada agave del menú tiene un nombre, una región, un productor y una historia familiar. Aquí el mezcal se bebe solo, en vaso de barro negro, con la naranja y la sal de gusano que México pide como acompañante — no como adorno. Las botanas no son gesto comercial: son la lógica del mezcal entendida correctamente. Si te quedas dos horas, vas a ver pasar por la barra a tres generaciones distintas — y vas a entender por qué La Latina siempre supo lo que Salamanca tarda en aprender.",
    apunte_in_situ:
      "Mira las paredes: las botellas más viejas están arriba, no por jerarquía sino porque la luz del oeste les llega mejor por la tarde. Pregunta por el agave del mes — siempre hay uno que no está en carta abierta. El barro de los vasos viene de San Bartolo Coyotepec, mismo pueblo que las piezas de Casa de México donde empezaste esta tarde.",
  },
  {
    id: "stop-005",
    // La Botica de la Condesa · Calle de La Palma 2, Malasaña.
    // Replaces the fictional "La Tilica Mezcalería" with a real venue:
    // La Botica de la Condesa is documented as the first mezcalería to open
    // in Europe — a strong editorial anchor for the Ruta's closing stop.
    // Verified via Nominatim 2026-05-14.
    lat: 40.4261,
    lng: -3.7015,
    rumbo_slug: "norte",
    name: "La Botica de la Condesa",
    address: "Calle de La Palma, 2, Malasaña",
    description:
      "La primera mezcalería que se abrió en Europa. Cierra la Ruta con la memoria del agave intacta — el regreso al norte después de cuatro paradas en cuatro barrios.",
    despacho_text:
      "La Botica de la Condesa cierra esta Ruta donde tenía que cerrarse: en la primera mezcalería que se abrió en Europa, antes que cualquier otra. La carta no compite por número de referencias — compite por procedencia. Cada agave del menú tiene comunidad, palenque y maestro mezcalero firmado, y eso importa más que las 85 etiquetas presumidas en otras barras. Pide un espadín de Santa Catarina Minas si quieres terminar la noche en tierra firme, o un Tobalá silvestre si quieres recordar que algunos agaves tardan veinticinco años en madurar — y eso explica por qué se beben en silencio. La Botica es el regreso al norte: la memoria del agave, el cierre de la conversación que empezó en Casa de México a las cinco de la tarde. Lo que llevas en el cuerpo a esta hora es Madrid traducida al español que tú hablas.",
    apunte_in_situ:
      "Pregunta por el pizarrón del mes — el agave que están destacando esta semana suele no estar en la carta abierta. La iluminación a esta hora es la más cálida de toda la Ruta: fíjate cómo el rosa Barragán que viste en Barracuda se ha transformado aquí en algo más íntimo, casi de vela. Si están abiertos los frascos de chapulín y sal de gusano detrás de barra, pide que te los acerquen aunque ya hayas comido. Cerrar con esa nota es la diferencia entre haber bebido y haber escuchado.",
  },
];

// ─── 30 days of madrid_pulse · editorial atmospheric line per day ─────────
// Used by the re-entrada welcome screen when days_since_last_open >= 7.
// Voice: María Vázquez. ~40 words. Specific, not generic. Names places/people.
function buildMadridPulse(): Array<{ date_key: string; text: string; editor_name: string }> {
  const lines = [
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

  const today = new Date();
  const out: Array<{ date_key: string; text: string; editor_name: string }> = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateKey = d.toISOString().slice(0, 10);
    out.push({
      date_key: dateKey,
      text: lines[i % lines.length]!,
      editor_name: "María Vázquez",
    });
  }
  return out;
}

// ─── Time-mode-specific companion phrases ─────────────────────────────────
// Schema: companion_phrases stores `phrases TEXT[]` per (level, narration_style,
// time_mode) row. Existing 'dia' rows are seeded by seed-all.ts at line 251.
// Here we add the 'madrugada' and 'atardecer' variants on a curated subset of
// (level, narration_style) cells — full coverage comes in v1.1.
//
// Total: 4 madrugada rows + 4 atardecer rows = 8 rows × 5 phrases = 40 phrases.
// Companion API at routes/companion.ts is still time-mode-blind in Week 1; it
// reads time_mode in Week 4 (Modo hora pass).
type CompanionRowSeed = {
  level: string;
  narration_style: string;
  time_mode: "madrugada" | "atardecer";
  phrases: string[];
};

const COMPANION_ROWS: CompanionRowSeed[] = [
  // ─── Madrugada (00:00–05:59) · quieter, slower, lower saturation ──────
  {
    level: "Iniciado",
    narration_style: "intellectual",
    time_mode: "madrugada",
    phrases: [
      "A esta hora, los libros leen distinto. No tengas prisa.",
      "Las preguntas de las tres de la mañana son las más honestas.",
      "Lo que importa a esta hora no importa igual mañana — y eso está bien.",
      "El despacho lleva horas ahí. Te esperaba sin saber que te esperaba.",
      "Lo escrito a esta hora se queda. Mañana lo vas a reconocer.",
    ],
  },
  {
    level: "Iniciado",
    narration_style: "visual",
    time_mode: "madrugada",
    phrases: [
      "Madrid duerme. Tú estás despierta. Mira despacio.",
      "La luz del teléfono es la única vela que tienes ahora. Suficiente.",
      "Los colores cambian de noche. Vas a verlos de otra forma.",
      "El detalle que ignoraste ayer, a esta hora se hace visible.",
      "El encuadre nocturno tiene otra honestidad. Confía en lo que aparece.",
    ],
  },
  {
    level: "Conocedor",
    narration_style: "intellectual",
    time_mode: "madrugada",
    phrases: [
      "Pocas cosas se sienten verdaderas a las cuatro. Esto sí.",
      "Lo que guardas a esta hora pesa distinto. Guárdalo igual.",
      "El criterio nocturno suele ser el que importa por la mañana.",
      "Madrid en la madrugada es otra ciudad. Estás en ella sola.",
      "El insomnio también es una forma de curaduría. Estás eligiendo qué pensar.",
    ],
  },
  {
    level: "Cronista",
    narration_style: "conceptual",
    time_mode: "madrugada",
    phrases: [
      "La crónica que importa se escribe a esta hora. Sin testigos.",
      "Lo que documentas en la madrugada lleva otra densidad.",
      "El cronista nocturno acepta que la objetividad es una ilusión diurna.",
      "Lo no fotografiado a esta hora suele ser lo único que ocurrió de verdad.",
      "Madrid de madrugada es el archivo que nadie te pidió hacer. Hazlo igual.",
    ],
  },

  // ─── Atardecer (18:00–20:59) · warmer, more atmospheric ───────────────
  {
    level: "Iniciado",
    narration_style: "visual",
    time_mode: "atardecer",
    phrases: [
      "Madrid se está poniendo del color que recuerdas de algún piso en Coyoacán.",
      "La hora dorada en Lavapiés tiene textura. Mira el suelo.",
      "El cielo a esta hora pide algo de tu atención. Dáselo cinco minutos.",
      "Los muros respiran distinto a las ocho. Pasa cerca de uno.",
      "Cihuatlampa — el oeste mexica — está dejando su lectura en Madrid ahora mismo.",
    ],
  },
  {
    level: "Iniciado",
    narration_style: "kinesthetic",
    time_mode: "atardecer",
    phrases: [
      "El día se está acomodando. Tú también puedes.",
      "Si vas a salir, sal ahora. La luz de las ocho es la única que importa hoy.",
      "El cuerpo a esta hora pide caminar. Hazle caso.",
      "Sentarte en una terraza antes de las nueve no es derroche. Es disciplina.",
      "El paso cambia al atardecer. Más lento, más atento.",
    ],
  },
  {
    level: "Conocedor",
    narration_style: "material",
    time_mode: "atardecer",
    phrases: [
      "El mezcal a esta hora tiene otra densidad. Pídelo despacio.",
      "La piedra de Madrid se calienta al atardecer y suelta lo que guardó del día.",
      "El barro de Mata Ortiz a la luz de las ocho es otra pieza. Mírala otra vez.",
      "Los textiles guardan la temperatura. Toca uno antes de cenar.",
      "El pan a esta hora ya no es desayuno. Es ceremonia.",
    ],
  },
  {
    level: "Cronista",
    narration_style: "conceptual",
    time_mode: "atardecer",
    phrases: [
      "El atardecer es la única hora del día en que México y España coinciden de verdad.",
      "Lo que se documenta a esta hora suele convertirse en archivo sin esfuerzo.",
      "El cronista del atardecer trabaja con luz prestada. Aprovéchala.",
      "Cierra el día con una pieza, no con una lista. Te va a quedar mejor.",
      "La hora dorada es estructural, no decorativa. Está cambiando lo que estás viendo.",
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// Runners
// ═══════════════════════════════════════════════════════════════════════════

export async function seedRutaRumbos() {
  console.log("→ seed-ruta-rumbos: starting");

  // 0. Sanity: rumbos must already be seeded by the migration SQL.
  const { data: rumbos, error: rumbosErr } = await supabase
    .from("rumbos")
    .select("id, slug");
  if (rumbosErr || !rumbos || rumbos.length !== 4) {
    throw new Error(
      `Expected 4 rumbos rows after migration, got ${rumbos?.length ?? 0}. ` +
        `Did you apply migrations/2026-05-14-ruta-rumbos.sql in Supabase? ` +
        `Error: ${rumbosErr?.message ?? "none"}`,
    );
  }
  const rumboBySlug = Object.fromEntries(rumbos.map((r) => [r.slug, r.id])) as Record<RumboSlug, string>;
  console.log("  ✓ rumbos present (4 rows)");

  // 1. Update ruta-001 with week_key + editor_name + published_at
  const { error: rutaUpdateErr } = await supabase
    .from("ruta")
    .update({
      week_key: "2026-W19",
      editor_name: "María Vázquez",
      published_at: new Date("2026-05-10T09:00:00+02:00").toISOString(),
    })
    .eq("id", "ruta-001");
  if (rutaUpdateErr) throw new Error(`Failed to update ruta-001: ${rutaUpdateErr.message}`);
  console.log("  ✓ ruta-001 marked as Semana 19 inaugural (María Vázquez)");

  // 2. UPDATE each of 5 stops with lat/lng/rumbo_id/despacho_text/apunte_in_situ.
  // Optional name/address/description fields override the values from seed.sql
  // when a 2026-05-14 audit found them stale.
  for (const s of STOPS) {
    const payload: Record<string, unknown> = {
      lat: s.lat,
      lng: s.lng,
      rumbo_id: rumboBySlug[s.rumbo_slug],
      despacho_text: s.despacho_text,
      apunte_in_situ: s.apunte_in_situ,
    };
    if (s.name) payload.name = s.name;
    if (s.address) payload.address = s.address;
    if (s.description) payload.description = s.description;

    const { error } = await supabase
      .from("ruta_stops")
      .update(payload)
      .eq("id", s.id);
    if (error) throw new Error(`Failed to update ${s.id}: ${error.message}`);
  }
  console.log("  ✓ 5 ruta_stops enriched with geo + rumbo + dual text layer");

  // 3. madrid_pulse · 30 rolling days
  const pulseRows = buildMadridPulse();
  const { error: pulseErr } = await supabase
    .from("madrid_pulse")
    .upsert(pulseRows, { onConflict: "date_key" });
  if (pulseErr) throw new Error(`Failed to upsert madrid_pulse: ${pulseErr.message}`);
  console.log(`  ✓ madrid_pulse seeded (${pulseRows.length} rows)`);

  // 4. companion_phrases · time-mode-specific rows
  // After the migration the unique key is (level, narration_style, time_mode).
  // seed-all.ts wipes companion_phrases at clear time, then seeds the 20 'dia'
  // rows at line 251; we add the madrugada + atardecer variants alongside.
  const phraseRows = COMPANION_ROWS.map((r) => ({
    level: r.level,
    narration_style: r.narration_style,
    time_mode: r.time_mode,
    phrases: r.phrases,
  }));
  const { error: phrasesErr } = await supabase
    .from("companion_phrases")
    .upsert(phraseRows, { onConflict: "level,narration_style,time_mode" });
  if (phrasesErr) throw new Error(`Failed to upsert companion_phrases: ${phrasesErr.message}`);
  const totalPhrases = COMPANION_ROWS.reduce((sum, r) => sum + r.phrases.length, 0);
  console.log(
    `  ✓ companion_phrases time-mode variants seeded (${phraseRows.length} rows, ${totalPhrases} phrases)`,
  );

  console.log("→ seed-ruta-rumbos: done\n");
}

// Allow running standalone: `npx tsx src/seed-ruta-rumbos.ts`
if (import.meta.url === `file://${process.argv[1]}`) {
  seedRutaRumbos().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
