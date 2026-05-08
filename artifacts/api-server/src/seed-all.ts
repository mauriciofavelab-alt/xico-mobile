/**
 * XICO — Full Supabase seed script
 * Run once to populate all tables:
 *   cd artifacts/api-server
 *   SUPABASE_URL=https://jrnsodwpdupybxjlzybv.supabase.co \
 *   SUPABASE_ANON_KEY=eyJhbGci... \
 *   npx tsx src/seed-all.ts
 *
 * Uses upsert with onConflict so it is safe to run multiple times.
 */

import { createClient } from "@supabase/supabase-js";
import articlesData from "./routes/articles-data.js";
import momentosData from "./routes/momentos-data.js";
import eventsData from "./routes/events-data.js";
import spotsData from "./routes/spots-data.js";
import rutaData from "./routes/ruta-data.js";
import DESPACHOS from "./routes/despacho-data.js";

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_ANON_KEY as string,
);

async function run(label: string, fn: () => Promise<void>) {
  process.stdout.write(`Seeding ${label}... `);
  try {
    await fn();
    console.log("done");
  } catch (e) {
    console.error("FAILED", e);
    process.exit(1);
  }
}

// Clear existing data before seeding (order matters for FK constraints)
await run("clearing tables", async () => {
  await supabase.from("saved_articles").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("event_rsvps").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("ruta_stops").delete().neq("id", "placeholder");
  await supabase.from("ruta").delete().neq("id", "placeholder");
  await supabase.from("articles").delete().neq("id", "placeholder");
  await supabase.from("momentos").delete().neq("id", "placeholder");
  await supabase.from("events").delete().neq("id", "placeholder");
  await supabase.from("spots").delete().neq("id", "placeholder");
  await supabase.from("despacho_variants").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("despacho").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("companion_phrases").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("personalization_contexts").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("notas_editor").delete().neq("id", "00000000-0000-0000-0000-000000000000");
});

// ─────────────────────────────────────────
// Articles
// ─────────────────────────────────────────
await run("articles", async () => {
  const rows = (articlesData as any[]).map((a) => ({
    id: a.id,
    slug: a.slug,
    is_published: true,
    pillar: a.pillar,
    subcategory: a.subcategory,
    category: a.category,
    tag: a.tag,
    title: a.title,
    subtitle: a.subtitle,
    body: a.body,
    author_name: a.author ?? a.author_name,
    institution: a.institution,
    image_key: a.imageKey ?? a.image_key,
    read_time_minutes: a.read_time_minutes ?? parseInt(a.readTime ?? "5"),
    accent_color: a.accentColor ?? a.accent_color,
    featured: a.featured ?? false,
    published_at: new Date().toISOString(),
  }));
  const { error } = await supabase
    .from("articles")
    .upsert(rows, { onConflict: "id" });
  if (error) throw error;
});

// ─────────────────────────────────────────
// Momentos
// ─────────────────────────────────────────
await run("momentos", async () => {
  const rows = (momentosData as any[]).map((m) => ({
    id: m.id,
    headline: m.headline,
    caption: m.caption,
    category: m.category,
    accent_color: m.accentColor ?? m.accent_color,
    image_url: m.imageUrl ?? m.image_url ?? null,
  }));
  const { error } = await supabase
    .from("momentos")
    .upsert(rows, { onConflict: "id" });
  if (error) throw error;
});

// ─────────────────────────────────────────
// Events
// ─────────────────────────────────────────
await run("events", async () => {
  const rows = (eventsData as any[]).map((e) => ({
    id: e.id,
    title: e.title,
    starts_at: e.starts_at,
    venue_name: e.venue_name,
    description: e.description,
    category: e.category,
    price: e.price ?? "Gratuito",
  }));
  const { error } = await supabase
    .from("events")
    .upsert(rows, { onConflict: "id" });
  if (error) throw error;
});

// ─────────────────────────────────────────
// Spots
// ─────────────────────────────────────────
await run("spots", async () => {
  const rows = (spotsData as any[]).map((s) => ({
    id: s.id,
    name: s.name,
    type: s.type,
    description: s.description,
    address: s.address,
    neighborhood: s.neighborhood,
    lat: s.lat,
    lng: s.lng,
    is_copil: s.copil ?? s.is_copil ?? false,
    accent_color: s.accentColor ?? s.accent_color ?? "ochre",
    tags: s.tags ?? [],
  }));
  const { error } = await supabase
    .from("spots")
    .upsert(rows, { onConflict: "id" });
  if (error) throw error;
});

// ─────────────────────────────────────────
// Ruta + ruta_stops
// ─────────────────────────────────────────
await run("ruta", async () => {
  const r = rutaData as any;
  const { error: re } = await supabase
    .from("ruta")
    .upsert(
      [{ id: r.id, title: r.title, subtitle: r.subtitle, month: r.month, is_active: true }],
      { onConflict: "id" },
    );
  if (re) throw re;

  const stops = (r.stops as any[]).map((s, i) => ({
    id: s.id,
    ruta_id: r.id,
    order_num: s.order ?? i + 1,
    name: s.name,
    address: s.address,
    description: s.description,
    category: s.category,
    accent_color: s.accentColor ?? s.accent_color,
    time_suggestion: s.time,
    distance_to_next: s.distanceToNext ?? null,
  }));
  const { error: se } = await supabase
    .from("ruta_stops")
    .upsert(stops, { onConflict: "id" });
  if (se) throw se;
});

// ─────────────────────────────────────────
// Despacho + despacho_variants
// ─────────────────────────────────────────
await run("despacho (30 days)", async () => {
  // Upsert all 30 despacho base rows
  const despachoRows = DESPACHOS.map((d) => ({
    rotation_key: d.rotation_key,
    subtitulo: d.subtitulo,
    color_nombre: d.color.nombre,
    color_hex: d.color.hex,
    nahuatl_word: d.nahuatl_word,
    nahuatl_meaning: d.nahuatl_meaning,
    nahuatl_nota: d.nahuatl_nota,
    lugar_nombre: d.lugar.nombre,
    lugar_barrio: d.lugar.barrio,
    lugar_nota: d.lugar.nota,
    hecho: d.hecho,
    pensamiento: d.pensamiento,
    pregunta: d.pregunta,
    teaser: d.teaser,
  }));

  const { error: de } = await supabase
    .from("despacho")
    .upsert(despachoRows, { onConflict: "rotation_key" });
  if (de) throw de;
});

await run("despacho_variants (30 × 5 = 150 rows)", async () => {
  // Fetch the newly inserted despacho rows to get their UUIDs
  const { data: dbDespachos, error: fe } = await supabase
    .from("despacho")
    .select("id, rotation_key");
  if (fe) throw fe;

  const keyToId = new Map<number, string>(
    (dbDespachos ?? []).map((r: any) => [r.rotation_key, r.id]),
  );

  const variantRows: any[] = [];
  for (const d of DESPACHOS) {
    const despachoId = keyToId.get(d.rotation_key);
    if (!despachoId) continue;

    const styles = ["visual", "material", "kinesthetic", "conceptual"] as const;
    for (const style of styles) {
      const v = d.variants[style];
      variantRows.push({
        despacho_id: despachoId,
        narration_style: style,
        pensamiento_variant: v.pensamiento,
        pregunta_variant: v.pregunta,
        teaser_variant: v.teaser,
      });
    }
    // Also store intellectual variant explicitly (uses base text)
    variantRows.push({
      despacho_id: despachoId,
      narration_style: "intellectual",
      pensamiento_variant: d.pensamiento,
      pregunta_variant: d.pregunta,
      teaser_variant: d.teaser,
    });
  }

  // Upsert in batches of 50 (Supabase row limit per request)
  for (let i = 0; i < variantRows.length; i += 50) {
    const batch = variantRows.slice(i, i + 50);
    const { error: ve } = await supabase
      .from("despacho_variants")
      .upsert(batch, { onConflict: "despacho_id,narration_style" });
    if (ve) throw ve;
  }
});

// ─────────────────────────────────────────
// Companion phrases (4 levels × 5 styles = 20 rows, each with 7 phrases)
// ─────────────────────────────────────────
await run("companion_phrases", async () => {
  const rows = [
    { level: "Iniciado", narration_style: "intellectual", phrases: ["Hoy, lo que buscas ya empezó a buscarte.","La raíz no se ve, pero es lo que sostiene.","Todo comienzo guarda en sí el final.","El silencio antes de la música también es música.","No hace falta estar listo. Solo presente.","Hay saberes que vienen antes del lenguaje.","Una semilla no sabe que será árbol. Y eso está bien."] },
    { level: "Iniciado", narration_style: "visual",       phrases: ["La luz entra primero por los ojos. Luego por el resto.","Mira despacio. Lo que parece simple, raramente lo es.","Hay imágenes que el ojo recoge antes que la mente las nombre.","Hoy, busca lo que brilla sin llamar la atención.","Lo que ves depende de desde dónde miras.","El detalle que ignoraste ayer, hoy es el protagonista.","Todo marco decide qué queda dentro y qué afuera."] },
    { level: "Iniciado", narration_style: "material",     phrases: ["Empieza por lo que puedes tocar. El resto viene solo.","Cada material tiene una temperatura. El barro, el pan, la madera.","Las manos recuerdan lo que la cabeza olvida.","Hoy, haz algo con las manos. Cualquier cosa.","Lo que se hace despacio, dura.","El primer intento siempre tiene una textura distinta al resto.","Hay un conocimiento que solo existe en el gesto."] },
    { level: "Iniciado", narration_style: "kinesthetic",  phrases: ["El cuerpo sabe cosas que la mente todavía no ha formulado.","Empieza moviéndote. El pensamiento te seguirá.","Lo que cuesta trabajo entrar al cuerpo, entra para quedarse.","Hoy, siente el peso de algo antes de juzgarlo.","Estar presente es un acto físico, no mental.","El ritmo no se entiende. Se siente.","La experiencia empieza siempre en el cuerpo."] },
    { level: "Iniciado", narration_style: "conceptual",   phrases: ["Toda forma es una respuesta a una pregunta no formulada.","El principio de algo ya contiene su lógica entera.","Antes del objeto, existe la idea del objeto.","Hoy, pregúntate por qué las cosas tienen la forma que tienen.","Lo que parece arbitrario casi nunca lo es.","Los sistemas más complejos tienen reglas muy simples.","Nombrar algo es ya una forma de poseerlo."] },
    { level: "Conocedor", narration_style: "intellectual", phrases: ["Lo que proteges te define tanto como lo que persigues.","El cuidado también es una forma de poder.","Hoy cuida algo que vale la pena cuidar.","No todo lo que se pierde, se olvida.","La memoria más honda es la del cuerpo.","Guardar es un acto de amor disfrazado de orden.","Tu criterio es la mejor brújula que tienes."] },
    { level: "Conocedor", narration_style: "visual",       phrases: ["El ojo entrenado ve la composición antes que el contenido.","Guarda imágenes mentales de lo que no quieres olvidar.","La manera en que la luz cae sobre algo cambia su significado.","Hoy, busca la foto que nadie más está tomando.","Lo que encuadras ya es una interpretación.","El contraste revela lo que la uniformidad oculta.","Ver bien es un hábito. Como leer. Como escuchar."] },
    { level: "Conocedor", narration_style: "material",     phrases: ["El origen de un ingrediente cambia su sabor.","Lo hecho a mano guarda la temperatura de quien lo hizo.","Hoy, toca algo viejo. La pátina es información.","El oficio es la disciplina del detalle aplicada al tiempo.","Un material bien elegido se defiende solo.","Lo que se produce con cuidado, se consume con otro ritmo.","La calidad del proceso siempre aparece en el resultado."] },
    { level: "Conocedor", narration_style: "kinesthetic",  phrases: ["Lo que aprendes moviéndote no lo aprendes de otra manera.","El escenario cambia cuando uno lo ha pisado.","Hoy, ve a algún lado que no conozcas. El cuerpo aprende más rápido.","La práctica repetida no aburre. Profundiza.","Hay lugares que solo se entienden desde adentro.","El gesto correcto llega cuando el cuerpo ya lo conoce.","Participar es distinto a observar. Siempre."] },
    { level: "Conocedor", narration_style: "conceptual",   phrases: ["El sistema en el que estás, también te define.","Hoy, identifica la estructura detrás del problema.","Lo que parece una excepción generalmente revela la regla.","Cuidar algo es entender su lógica interna.","El concepto que falta siempre está más cerca de lo que parece.","Todo tiene un porqué. Encontrarlo cambia cómo lo ves.","La memoria que más vale es la que conecta puntos distantes."] },
    { level: "Curador",   narration_style: "intellectual", phrases: ["Caminar es una forma de pensar.","Lo que escondes de ti mismo, el arte lo nombra.","Este día es un texto que solo tú escribes.","La experiencia no pesa. Ilumina.","Saber esperar es también un talento.","Lo que guardas dentro es lo que das afuera.","El tiempo que diste a algo, te lo devuelve distinto."] },
    { level: "Curador",   narration_style: "visual",       phrases: ["Curar es decidir qué merece ser visto. Y desde dónde.","El ojo del curador no elige lo más bonito. Elige lo más necesario.","Hoy, edita. Quita lo que sobra hasta que solo quede lo que importa.","Lo que no se muestra también es una decisión.","La secuencia importa tanto como las piezas.","Un archivo bien organizado es una forma de ver.","La imagen que persiste es la que tenía algo que decir."] },
    { level: "Curador",   narration_style: "material",     phrases: ["Lo que cuidas con las manos, lo entiendes de otra manera.","El restaurador sabe que tocar es intervenir.","Hoy, repara algo en lugar de reemplazarlo.","La materia tiene memoria. El daño también.","Preservar no es congelar. Es entender qué puede cambiar y qué no.","La pátina del tiempo también es parte de la obra.","Lo hecho para durar tiene una densidad distinta."] },
    { level: "Curador",   narration_style: "kinesthetic",  phrases: ["El curador que no ha visto la pieza en vivo, adivina.","Hoy, camina por una exposición sin leer los textos. Primero el cuerpo.","La distancia física frente a una obra ya es una interpretación.","Los espacios que habitamos, nos habitan.","Montar una muestra es coreografiar un recorrido.","La experiencia que ofreces comienza antes de que alguien entre.","Lo que el visitante siente en el cuerpo, lo recuerda sin esfuerzo."] },
    { level: "Curador",   narration_style: "conceptual",   phrases: ["La curaduría es argumentar con objetos.","Hoy, piensa en qué conversación quieres que tengan dos cosas.","El relato que construyes es tan importante como lo que muestras.","Cada pieza fuera de contexto pierde la mitad de su sentido.","La colección que armas dice quién eres, no solo qué tienes.","Clasificar es ya una forma de interpretar.","El espacio vacío entre piezas también comunica."] },
    { level: "Cronista",  narration_style: "intellectual", phrases: ["Eres la suma de todo lo que elegiste atender.","El cronista no registra: interpreta.","Lo extraordinario vive en la precisión de lo cotidiano.","Hoy, tu presencia es suficiente argumento.","La grandeza no grita. Permanece.","Desde aquí la vista es otra. Úsala.","El mundo necesita personas que ya saben quiénes son."] },
    { level: "Cronista",  narration_style: "visual",       phrases: ["El cronista visual sabe que la imagen más honesta no es la más bella.","Hoy, mira lo que todos están mirando. Luego mira lo que no están mirando.","El archivo de imágenes que cargas en la memoria es irrepetible.","El encuadre definitivo llega después de haber descartado los anteriores.","Lo que fue fotografiado existió de una manera que lo no fotografiado no pudo.","El testigo visual no interrumpe. Atestigua.","La mirada larga es la que construye el archivo que importa."] },
    { level: "Cronista",  narration_style: "material",     phrases: ["El cronista que conoce los materiales, entiende las decisiones.","Lo que se hizo a mano tiene una historia en cada marca.","Hoy, busca el origen de algo que consumes habitualmente.","La materia que persiste dice más sobre una época que los discursos.","Describir la textura de algo ya es interpretarlo.","Los archivos materiales sobreviven a los conceptuales. Siempre.","El cronista toca antes de escribir."] },
    { level: "Cronista",  narration_style: "kinesthetic",  phrases: ["El cronista que no estuvo ahí, trabaja con lo que otros sintieron.","Hoy, ve a un lugar que vale la pena registrar antes de que cambie.","La memoria del cuerpo es el archivo más antiguo que tienes.","Lo que viviste en presencia, lo recuerdas distinto a lo que leíste.","El movimiento genera perspectiva. La inmovilidad, profundidad.","Haber estado ahí es un argumento que ningún texto puede reemplazar.","El cronista camina antes de escribir."] },
    { level: "Cronista",  narration_style: "conceptual",   phrases: ["La crónica que importa conecta lo particular con lo estructural.","Hoy, pregúntate qué sistema produce lo que estás observando.","Nombrar bien un fenómeno es ya la mitad del análisis.","Lo que documentas hoy, alguien lo interpretará distinto en veinte años.","El cronista sabe que el marco es tan importante como lo enmarcado.","La coherencia interna de un relato no garantiza que sea verdad.","Lo que decides no registrar también es una posición."] },
  ];
  const { error } = await supabase.from("companion_phrases").upsert(rows, { onConflict: "level,narration_style" });
  if (error) throw error;
});

// ─────────────────────────────────────────
// Personalization contexts (8 interests × 5 styles = 40 rows)
// ─────────────────────────────────────────
await run("personalization_contexts", async () => {
  const rows = [
    { interest: "Arte Contemporáneo",    narration_style: "intellectual", text: "Esto conecta con la práctica que has estado siguiendo." },
    { interest: "Arte Contemporáneo",    narration_style: "visual",       text: "Una imagen que necesita ser vista antes de ser leída." },
    { interest: "Arte Contemporáneo",    narration_style: "material",     text: "Lo que el artista hizo con sus manos, lo ves con las tuyas." },
    { interest: "Arte Contemporáneo",    narration_style: "kinesthetic",  text: "Hay que estar delante de esta pieza. No solo verla." },
    { interest: "Arte Contemporáneo",    narration_style: "conceptual",   text: "El concepto aquí antecede a cualquier forma visible." },
    { interest: "Arte Mesoamericano",    narration_style: "intellectual", text: "Una pieza que amplía la raíz que te interesa." },
    { interest: "Arte Mesoamericano",    narration_style: "visual",       text: "Una arqueología de lo visual: cada línea tiene memoria." },
    { interest: "Arte Mesoamericano",    narration_style: "material",     text: "Arcilla, jade, obsidiana. Materia que habla." },
    { interest: "Arte Mesoamericano",    narration_style: "kinesthetic",  text: "Lo que estos objetos hicieron en el cuerpo de quien los usó." },
    { interest: "Arte Mesoamericano",    narration_style: "conceptual",   text: "Un sistema de pensamiento expresado en piedra y barro." },
    { interest: "Fotografía y Memoria",  narration_style: "intellectual", text: "Para cuando tengas veinte minutos y buena luz." },
    { interest: "Fotografía y Memoria",  narration_style: "visual",       text: "Una fotografía que cambia lo que ves cuando la cierras." },
    { interest: "Fotografía y Memoria",  narration_style: "material",     text: "Sal de plata, papel, tiempo. La química de la memoria." },
    { interest: "Fotografía y Memoria",  narration_style: "kinesthetic",  text: "El instante que el fotógrafo detuvo con el cuerpo, no con la cámara." },
    { interest: "Fotografía y Memoria",  narration_style: "conceptual",   text: "El archivo como argumento. Lo que se guarda, define." },
    { interest: "Gastronomía",           narration_style: "intellectual", text: "Vuelve a esto antes de tu próxima visita a algún Copil." },
    { interest: "Gastronomía",           narration_style: "visual",       text: "El plato que entró por los ojos antes de entrar por la boca." },
    { interest: "Gastronomía",           narration_style: "material",     text: "El ingrediente que lo cambia todo. Está aquí." },
    { interest: "Gastronomía",           narration_style: "kinesthetic",  text: "Lo que se aprende en el fogón no se aprende en ningún otro lugar." },
    { interest: "Gastronomía",           narration_style: "conceptual",   text: "La cocina como sistema de conocimiento acumulado." },
    { interest: "Arte Popular y Artesanía", narration_style: "intellectual", text: "El oficio que guardaste merece este contexto." },
    { interest: "Arte Popular y Artesanía", narration_style: "visual",       text: "El color que el artesano eligió dice todo sobre su mundo." },
    { interest: "Arte Popular y Artesanía", narration_style: "material",     text: "Palma, barro, lana. Materiales que tienen idioma propio." },
    { interest: "Arte Popular y Artesanía", narration_style: "kinesthetic",  text: "El gesto repetido miles de veces hasta que la mano sabe sola." },
    { interest: "Arte Popular y Artesanía", narration_style: "conceptual",   text: "Una técnica ancestral es también una epistemología." },
    { interest: "Cine y Literatura",     narration_style: "intellectual", text: "Una lectura que completa lo que ya tienes marcado." },
    { interest: "Cine y Literatura",     narration_style: "visual",       text: "Una imagen literaria que es también imagen cinematográfica." },
    { interest: "Cine y Literatura",     narration_style: "material",     text: "La página, el plano, el fotograma. Soportes que no son neutros." },
    { interest: "Cine y Literatura",     narration_style: "kinesthetic",  text: "Lo que la historia hace con el cuerpo del lector." },
    { interest: "Cine y Literatura",     narration_style: "conceptual",   text: "La narrativa como estructura de pensamiento, no de entretenimiento." },
    { interest: "Artes Escénicas",       narration_style: "intellectual", text: "Lo que el cuerpo sabe antes que la mente." },
    { interest: "Artes Escénicas",       narration_style: "visual",       text: "La imagen en escena que no puede ser reproducida ni recordada igual." },
    { interest: "Artes Escénicas",       narration_style: "material",     text: "Madera de escenario, luz de frente. Presencia física." },
    { interest: "Artes Escénicas",       narration_style: "kinesthetic",  text: "El escenario solo existe cuando hay un cuerpo que lo habita." },
    { interest: "Artes Escénicas",       narration_style: "conceptual",   text: "La representación como un sistema que interroga lo real." },
    { interest: "Diseño e Identidad",    narration_style: "intellectual", text: "El hilo entre lo que usas y lo que te importa." },
    { interest: "Diseño e Identidad",    narration_style: "visual",       text: "La forma que resuelve el problema sin que lo parezca." },
    { interest: "Diseño e Identidad",    narration_style: "material",     text: "El objeto bien diseñado habla desde su peso y su textura." },
    { interest: "Diseño e Identidad",    narration_style: "kinesthetic",  text: "El diseño que no se piensa: se usa y se entiende en el uso." },
    { interest: "Diseño e Identidad",    narration_style: "conceptual",   text: "La identidad como proyecto, no como herencia." },
  ];
  const { error } = await supabase.from("personalization_contexts").upsert(rows, { onConflict: "interest,narration_style" });
  if (error) throw error;
});

// ─────────────────────────────────────────
// Notas del editor (7 rows, rotation_key 0–6 = Sunday–Saturday)
// ─────────────────────────────────────────
await run("notas_editor", async () => {
  const rows = [
    { rotation_key: 0, lugar: "El Retiro, Madrid",        texto: "Domingo de Retiro. Un grupo de estudiantes becados discute a Rulfo en un banco frente al estanque. México le habla a Madrid en voz baja y con precisión." },
    { rotation_key: 1, lugar: "Serrano 46, Madrid",       texto: "Esta mañana en el Rastro encontré una cerámica Talavera de Puebla entre chatarra alemana y loza inglesa. Madrid colecciona sin saber que colecciona. Esta edición intenta nombrar lo que la ciudad ya tiene sin saberlo." },
    { rotation_key: 2, lugar: "Malasaña, Madrid",         texto: "Tres restaurantes con Sello Copil en Malasaña. Los madrileños piden mole negro sin pestañear. Algo ha cambiado aquí en diez años. Esta edición lo documenta." },
    { rotation_key: 3, lugar: "Barrio de las Letras, Madrid", texto: "Martes de vernissage en el barrio de las letras. Cuatro galerías, un catálogo de artista mexicano en cada una. La presencia es geográfica antes que simbólica." },
    { rotation_key: 4, lugar: "Casa de México, Madrid",   texto: "El Prado cierra los lunes. Casa de México, no. Hay días en que la única pintura viva de Madrid está en Serrano 46. Esta semana cerramos con esa certeza." },
    { rotation_key: 5, lugar: "Lavapiés, Madrid",         texto: "Llueve en Lavapiés y el olor del comal de Doña Esperanza se mezcla con el café de la esquina. Hay olores que no necesitan traducción. Esta edición tampoco." },
    { rotation_key: 6, lugar: "Complutense, Madrid",      texto: "La Complutense abre convocatorias. Treinta y un estados de México miran hacia Madrid este mes. El talento tiene dirección postal. Lo seguimos." },
  ];
  const { error } = await supabase.from("notas_editor").upsert(rows, { onConflict: "rotation_key" });
  if (error) throw error;
});

console.log("\n✓ All data seeded into Supabase.");
