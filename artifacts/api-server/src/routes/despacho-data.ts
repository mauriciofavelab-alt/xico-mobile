import type { NarrationStyle } from "../utils/narrationStyle.js";

export type DespachoVariantContent = {
  pensamiento: string;
  pregunta: string;
  teaser: string;
};

export type DespachoEntry = {
  rotation_key: number;
  subtitulo: string;
  color: { nombre: string; hex: string };
  nahuatl_word: string;
  nahuatl_meaning: string;
  nahuatl_nota: string;
  lugar: { nombre: string; barrio: string; nota: string };
  hecho: string;
  // Base content doubles as the intellectual variant
  pensamiento: string;
  pregunta: string;
  teaser: string;
  variants: Record<Exclude<NarrationStyle, "intellectual">, DespachoVariantContent>;
};

const DESPACHOS: DespachoEntry[] = [
  {
    rotation_key: 1,
    subtitulo: "Lo que Madrid tiene sin saberlo",
    color: { nombre: "Ocre Oaxaqueño", hex: "#B5860F" },
    nahuatl_word: "Nepantla",
    nahuatl_meaning: "el espacio entre dos mundos",
    nahuatl_nota: "No el origen ni el destino: el tránsito mismo. La identidad como movimiento permanente.",
    lugar: { nombre: "Mercado de San Fernando", barrio: "Lavapiés", nota: "Puesto 12. Mole negro elaborado durante dos días. Sin carta de presentación y sin necesitarla." },
    hecho: "31 estados de México tienen representación activa en Madrid en 2026. No es diáspora: es presencia calculada.",
    pensamiento: "Madrid colecciona culturas como el Rastro colecciona objetos: sin saber exactamente qué tiene, pero sin querer deshacerse de nada. Esta ciudad lleva décadas acumulando México sin catalogarlo. Hoy nombramos lo que la ciudad ya posee.",
    pregunta: "¿Qué parte de ti vive en Nepantla hoy?",
    teaser: "Mañana: el color que México le regaló a España sin que España lo sepa.",
    variants: {
      visual: {
        pensamiento: "En la luz de Madrid a las seis de la tarde hay algo que no es de aquí. El ocre de las fachadas de Lavapiés tiene el mismo ángulo que el polvo de Oaxaca en agosto. La ciudad acumula presencias sin archivarlas, y eso las mantiene vivas.",
        pregunta: "¿Qué ves hoy en Madrid que reconoces sin saber exactamente de dónde?",
        teaser: "Mañana: el rojo de las iglesias de Castilla tiene un origen que nadie menciona en los carteles.",
      },
      material: {
        pensamiento: "El mole negro que sirven en el Puesto 12 de San Fernando tardó dos días en hacerse. Treinta ingredientes, cuatro horas de comal, una hora de espera antes de servir. Madrid lo come sin saber que está probando un saber que se transmite de mano a mano desde hace cuatro siglos.",
        pregunta: "¿Qué has comido hoy que no podrías describir de dónde viene exactamente?",
        teaser: "Mañana: el color que tiñó Europa viene de un insecto de tres milímetros.",
      },
      kinesthetic: {
        pensamiento: "Hay momentos en Lavapiés donde el cuerpo reconoce algo antes de que la mente lo nombre. El ritmo del mercado, la manera de ocupar la acera, el gesto de vender sin cartel. La presencia mexicana en Madrid se siente en los pies antes de verse con los ojos.",
        pregunta: "¿En qué lugar de tu cuerpo guardas la ciudad que dejaste?",
        teaser: "Mañana: el rojo que viajó de México a Europa en los barcos de la conquista.",
      },
      conceptual: {
        pensamiento: "Nepantla no es nostalgia ni asimilación: es la tercera posición. Madrid acumula México sin clasificarlo, y esa acumulación sin catalogar es la más honesta de las presencias. Lo que no se nombra persiste intacto.",
        pregunta: "¿Qué parte de tu identidad existe solo en el umbral entre dos culturas?",
        teaser: "Mañana: el color como argumento — el rojo que llegó de México sin pedir permiso.",
      },
    },
  },
  {
    rotation_key: 2,
    subtitulo: "El color que no se discutió",
    color: { nombre: "Carmín Achiote", hex: "#C0392B" },
    nahuatl_word: "Tlapalli",
    nahuatl_meaning: "color sagrado",
    nahuatl_nota: "De los tlacuilos, los pintores de códices. No describían el mundo: lo nombraban con color. Ver era pintar.",
    lugar: { nombre: "Iglesia de San Ginés", barrio: "Sol", nota: "Fíjate en el rojo de los mantos. Tiene cuatro siglos y origen mesoamericano. Nadie lo menciona." },
    hecho: "El 40% de los tintes rojos usados en Europa entre los siglos XVI y XVIII provenían de grana cochinilla mexicana. Un insecto de tres milímetros cambió la paleta de un continente.",
    pensamiento: "El rojo de los mantos barrocos en las iglesias de Castilla tiene un origen que nadie discutió en el siglo XVII. Llegó de México en el mismo barco que el chocolate. El achiote tiñó Europa antes de que Europa supiera que lo necesitaba.",
    pregunta: "¿Cuántos colores que ves hoy tienen un origen que no conoces?",
    teaser: "Mañana: lo que el cacao era antes de que llegara el azúcar.",
    variants: {
      visual: {
        pensamiento: "Detente frente al manto rojo de cualquier imagen barroca en una iglesia madrileña. Ese rojo no es europeo: es grana cochinilla, insecto oaxaqueño, color que viajó en barco. La mirada que cree ver España está viendo también México.",
        pregunta: "¿Qué color has visto hoy que tenga un origen que no sospechas?",
        teaser: "Mañana: el chocolate antes del azúcar, antes del dulce.",
      },
      material: {
        pensamiento: "La grana cochinilla se cosecha aplastando insectos secos contra paños de lana. Setenta mil insectos por kilo de tinte. El rojo que ves en las iglesias de Madrid fue fabricado por manos oaxaqueñas que nunca verían el lugar donde llegaría su trabajo.",
        pregunta: "¿Qué has usado hoy que requirió trabajo que no puedes imaginar?",
        teaser: "Mañana: el cacao antes de que alguien le pusiera azúcar.",
      },
      kinesthetic: {
        pensamiento: "El rojo llega antes de que la mente lo procese. En San Ginés, los mantos barrocos entran por los ojos como calor. Ese color viene de México, de manos que aplastaban insectos en Oaxaca, de un comercio que cruzó el Atlántico antes de que existiera la palabra globalización.",
        pregunta: "¿Qué color te mueve físicamente antes de que pienses en él?",
        teaser: "Mañana: la bebida que era ritual antes de ser postre.",
      },
      conceptual: {
        pensamiento: "El tlapalli no era decoración: era un sistema de significado. Los tlacuilos mexicas usaban el color como escritura. El rojo de los mantos barrocos que ves en Madrid es una cita no reconocida de ese sistema. Europa adoptó el color y olvidó el lenguaje.",
        pregunta: "¿Cuántas cosas usas como decoración que originalmente eran significado?",
        teaser: "Mañana: el xocolatl, antes del azúcar que lo domesticó.",
      },
    },
  },
  {
    rotation_key: 3,
    subtitulo: "Antes de que llegara el azúcar",
    color: { nombre: "Teobromina Oscura", hex: "#5C3317" },
    nahuatl_word: "Xocolatl",
    nahuatl_meaning: "agua amarga",
    nahuatl_nota: "La bebida ritual de los mexicas. No dulce: intensa. No postre: conversación sagrada entre hombres y dioses.",
    lugar: { nombre: "Chocolatería San Ginés", barrio: "Ópera", nota: "Fundada en 1894. El chocolate que sirven tiene el mismo espesor que el azteca: no es bebida, es comida." },
    hecho: "Los aztecas usaban granos de cacao como moneda. Un esclavo valía 100 granos. Una canoa, 50. El chocolate era literalmente dinero.",
    pensamiento: "El chocolate que España popularizó en Europa era amargo, picante, y se bebía frío. Los mexicas lo llamaban xocolatl. Cuando los españoles le añadieron azúcar crearon algo nuevo, pero borraron el original. La versión que conoces es la adaptación, no el texto.",
    pregunta: "¿Cuántas cosas consumes hoy que son radicalmente distintas de lo que fueron en origen?",
    teaser: "Mañana: el árbol que lleva dos mil años en el mismo sitio.",
    variants: {
      visual: {
        pensamiento: "El cacao molido tiene un color que no existe en la paleta europea: entre el marrón y el negro, con una superficie que absorbe la luz en vez de reflejarla. Antes del azúcar, el xocolatl era eso: oscuro, denso, sin concesiones visuales. La belleza antes del embellecimiento.",
        pregunta: "¿Qué ves en su forma original que resulta más hermoso que la versión procesada?",
        teaser: "Mañana: el árbol más viejo del continente sigue en pie en Oaxaca.",
      },
      material: {
        pensamiento: "El xocolatl se preparaba moliendo cacao en metate de piedra, mezclando con agua fría, chiles y vainilla, y vertiéndolo de vasija en vasija hasta hacer espuma. El proceso era físico, táctil, laborioso. El azúcar lo volvió instantáneo y borró el trabajo.",
        pregunta: "¿Qué has simplificado tanto que ya no recuerdas lo que requería?",
        teaser: "Mañana: el árbol que vio caer Tenochtitlán y sigue siendo testigo.",
      },
      kinesthetic: {
        pensamiento: "Beber el xocolatl frío y amargo era un acto corporal de otra escala. El picante activaba la lengua. La espuma exigía tiempo. El frío contrastaba con el calor del copal. El cuerpo participaba en el ritual antes de que la mente lo entendiera como tal.",
        pregunta: "¿Qué experiencia de sabor o tacto has tenido hoy que te cambió el estado?",
        teaser: "Mañana: el árbol que define el tiempo en México.",
      },
      conceptual: {
        pensamiento: "El azúcar no mejoró el xocolatl: lo convirtió en otra cosa. La adaptación como borrado del original es un patrón que se repite: España tomó el cacao, le añadió dulzura europea, y exportó la versión adaptada como si fuera el original. El texto siempre pierde ante la traducción popular.",
        pregunta: "¿Qué texto conoces solo a través de sus adaptaciones?",
        teaser: "Mañana: la memoria que vive en los árboles.",
      },
    },
  },
  {
    rotation_key: 4,
    subtitulo: "El árbol que es un testigo",
    color: { nombre: "Verde Centenario", hex: "#2D5A3D" },
    nahuatl_word: "Ahuehuetl",
    nahuatl_meaning: "el viejo del agua",
    nahuatl_nota: "Árbol sagrado del pueblo mexica. En el Parque de Chapultepec hay ejemplares que vieron el fin del mundo conocido. Siguen ahí.",
    lugar: { nombre: "Jardín Botánico del Retiro", barrio: "El Retiro", nota: "Busca la colección de coníferas. Hay un ciprés que tiene la misma forma vertical que el ahuehuete. Primos que no se conocen." },
    hecho: "El árbol del Tule en Oaxaca tiene aproximadamente 2,000 años y es el árbol con mayor circunferencia del mundo: 58 metros. Ha visto más historia que cualquier monumento de Madrid.",
    pensamiento: "En México, el ahuehuete puede vivir más de dos mil años. El de Santa María del Tule, en Oaxaca, tiene doce metros de diámetro. En Mesoamérica los árboles no son decoración: son memoria viva. Un árbol que vio caer Tenochtitlán sigue en pie.",
    pregunta: "¿Cuánto tiempo tiene la cosa más antigua que has tocado hoy?",
    teaser: "Mañana: la ciudad que se construyó sobre el agua y sigue hundiéndose.",
    variants: {
      visual: {
        pensamiento: "El ahuehuete de Santa María del Tule tiene una corteza que parece tallada por siglos de luz y lluvia. Desde cerca, la superficie es un mapa en relieve: cada grieta es una década, cada bifurcación es una historia que el árbol no puede contar con palabras.",
        pregunta: "¿Qué objeto cercano tiene en su superficie la historia que no dice con palabras?",
        teaser: "Mañana: la ciudad construida sobre el agua, vista desde arriba.",
      },
      material: {
        pensamiento: "La madera del ahuehuete no se pudre. Los indígenas de Oaxaca la usaban para construir porque sabían que duraría más que quien la cortara. Hay vigas de ahuehuete en edificios coloniales que llevan cuatrocientos años sin un solo signo de deterioro.",
        pregunta: "¿Qué material has tocado hoy que resiste el tiempo mejor que tú?",
        teaser: "Mañana: la ciudad que se construyó sobre el agua.",
      },
      kinesthetic: {
        pensamiento: "Abrazar el árbol del Tule requiere quince personas con los brazos extendidos. Quince pares de manos para rodear dos mil años. El cuerpo tiene que moverse, organizarse, cooperar para entender la escala de algo que no se puede ver completo desde ningún punto.",
        pregunta: "¿Qué has intentado abarcar con el cuerpo que no cupo en los brazos?",
        teaser: "Mañana: la ciudad que flota y se hunde al mismo tiempo.",
      },
      conceptual: {
        pensamiento: "Un árbol de dos mil años no es un árbol más viejo: es un sistema de registro diferente. Lo que el ahuehuete sabe sobre el tiempo, el clima y la historia de un lugar no tiene equivalente en ningún archivo humano. La memoria orgánica como alternativa a la memoria documental.",
        pregunta: "¿Qué tipo de memoria es la más confiable y por qué no es la escrita?",
        teaser: "Mañana: Tenochtitlán, la ciudad que construyeron sobre el agua.",
      },
    },
  },
  {
    rotation_key: 5,
    subtitulo: "La ciudad que era un lago",
    color: { nombre: "Azul Lacustre", hex: "#1A4A6E" },
    nahuatl_word: "Atzintli",
    nahuatl_meaning: "en el agua",
    nahuatl_nota: "El sufijo que indica origen acuático en los topónimos mexicas. Aztlán, Tenochtitlán. El origen es siempre agua. Siempre movimiento.",
    lugar: { nombre: "Museo Nacional de Antropología", barrio: "Castellana", nota: "La sala mexica tiene una maqueta de Tenochtitlán. Nadie que la ve puede imaginar que debajo de CDMX existe ese plano completo." },
    hecho: "El Centro Histórico de Ciudad de México se hunde hasta 30 cm por año en algunas zonas. Es uno de los hundimientos urbanos más acelerados del planeta. La ciudad construida sobre el agua paga su deuda.",
    pensamiento: "Ciudad de México se construyó sobre los restos de Tenochtitlán, que se construyó sobre un lago. El Centro Histórico se hunde entre 15 y 30 centímetros por año porque la ciudad pesa sobre agua que no pudo drenar. Madrid nunca tuvo que elegir entre el lago y la ciudad. CDMX elige cada día.",
    pregunta: "¿Qué está debajo del suelo donde vives?",
    teaser: "Mañana: el primer alimento sagrado que alimenta a dos mil millones de personas.",
    variants: {
      visual: {
        pensamiento: "Vista desde el Templo Mayor, Tenochtitlán era una ciudad de canales con la luz del lago reflejando en cada calle. Las chinampas flotaban como jardines imposibles. Madrid es seca; CDMX lleva el agua en los cimientos aunque nadie la vea.",
        pregunta: "¿Qué ciudad te parece más bella cuando imaginas lo que fue antes de ser lo que es?",
        teaser: "Mañana: el maíz, primera creación de la humanidad.",
      },
      material: {
        pensamiento: "Los cimientos del Centro Histórico de CDMX son madera de ahuehuete clavada en el fondo del antiguo lago. Esa madera lleva siglos bajo el peso de la ciudad colonial, hundiéndose año tras año porque el agua que la sostenía fue drenada. La ciudad pesa sobre lo que vació.",
        pregunta: "¿Qué apoyo has eliminado sin notar que seguías construyendo sobre él?",
        teaser: "Mañana: el maíz como civilización.",
      },
      kinesthetic: {
        pensamiento: "En el Zócalo de Ciudad de México, si te quedas quieto el tiempo suficiente, puedes sentir el ligero hundimiento diferencial: el suelo no es uniforme, porque la ciudad no se hunde igual en todas partes. Es la sensación del lago que todavía existe debajo.",
        pregunta: "¿Qué terreno bajo tus pies es más inestable de lo que parece?",
        teaser: "Mañana: el maíz que alimenta a dos mil millones.",
      },
      conceptual: {
        pensamiento: "Construir una ciudad sobre un lago es un acto de negación. Los españoles drenaron el lago de Texcoco porque el agua les daba miedo. Tenochtitlán convivía con el agua; CDMX la borró. El hundimiento es la consecuencia de esa negación: el lago que vuelve.",
        pregunta: "¿Qué realidad has intentado borrar que vuelve de todas formas?",
        teaser: "Mañana: el maíz, diseñado por el ser humano hace nueve mil años.",
      },
    },
  },
  {
    rotation_key: 6,
    subtitulo: "El primer alimento sagrado",
    color: { nombre: "Amarillo Maíz", hex: "#D4A820" },
    nahuatl_word: "Tlayolli",
    nahuatl_meaning: "maíz desgranado",
    nahuatl_nota: "La base. Lo que queda cuando se separa la planta del grano. Lo esencial sin el ornamento. El núcleo de una civilización en una semilla.",
    lugar: { nombre: "La Lucerna", barrio: "Chueca", nota: "Tlayudas oaxaqueñas auténticas. El comal está importado de Oaxaca. El maíz viene del mismo valle donde se cultivó por primera vez." },
    hecho: "México es el centro de diversidad genética del maíz con más de 59 razas nativas. Ningún país en el mundo tiene más variedades de un cultivo tan fundamental. Es un banco genético vivo.",
    pensamiento: "El maíz no es un cultivo: es una creación. Nadie sabe de qué planta silvestre desciende exactamente porque fue creado por el ser humano hace 9,000 años en el valle de Tehuacán. Lo que comes hoy no existe en la naturaleza sin nosotros. Fue diseñado.",
    pregunta: "¿Qué parte de tu dieta diaria vino de México sin que lo supieras?",
    teaser: "Mañana: la institución más antigua de América que Madrid no ha podido replicar.",
    variants: {
      visual: {
        pensamiento: "El maíz criollo tiene colores que el maíz comercial no tiene: azul, morado, rojo, negro jaspeado. Cada color es una variedad, cada variedad es una historia de selección humana durante milenios. El maíz morado de Oaxaca no es exótico: es el resultado de nueve mil años de criterio.",
        pregunta: "¿Qué color has visto hoy en un alimento que no esperabas encontrar?",
        teaser: "Mañana: el tianguis, la democracia sin elecciones.",
      },
      material: {
        pensamiento: "La nixtamalización —cocer el maíz con cal— no solo cambia el sabor: transforma la estructura molecular del grano y libera nutrientes que de otro modo son inaccesibles. Es un proceso que los mesoamericanos descubrieron hace tres mil años y que la ciencia tardó siglos en entender.",
        pregunta: "¿Qué proceso cotidiano estás haciendo sin entender por qué funciona?",
        teaser: "Mañana: el mercado como democracia.",
      },
      kinesthetic: {
        pensamiento: "Tortear —palmear la masa de maíz entre las manos para hacer una tortilla— es una destreza que se aprende desde niña y que el cuerpo memoriza antes que la mente. Hay cocineras que hacen quince tortillas por minuto. El ritmo de las palmas es el ritmo de la comida.",
        pregunta: "¿Qué destreza física tiene tu cuerpo que aprendió solo, sin que tú lo decidieras conscientemente?",
        teaser: "Mañana: el tianguis como institución.",
      },
      conceptual: {
        pensamiento: "El maíz no existe en la naturaleza: es un artefacto cultural. El teosinte silvestre del que desciende es irreconocible como maíz. Lo que comemos es el resultado de nueve mil años de diseño intencional sin teoría escrita. El mayor proyecto de ingeniería genética de la historia lo hicieron sin saber que era ingeniería genética.",
        pregunta: "¿Qué cosa consideras natural que en realidad fue diseñada?",
        teaser: "Mañana: el tianguis — intercambio sin propietario.",
      },
    },
  },
  {
    rotation_key: 7,
    subtitulo: "La democracia sin elecciones",
    color: { nombre: "Terracota Mercado", hex: "#8B4513" },
    nahuatl_word: "Tianguis",
    nahuatl_meaning: "mercado",
    nahuatl_nota: "Del náhuatl tianquiztli. Uno de los pocos préstamos léxicos que sobrevivió en el español de México sin traducción. La palabra resistió la conquista.",
    lugar: { nombre: "Mercado de La Paz", barrio: "Salamanca", nota: "Menos turístico que La Boquería. El pescado llega de Huelva y hay un puesto de mezcal en la entrada que abre a las diez." },
    hecho: "En México se celebran más de 50,000 tianguis semanales. El Mercado de La Merced en CDMX ocupa 63,000 m² y mueve más productos en un día que algunos aeropuertos en una semana.",
    pensamiento: "El tianguis prehispánico funcionaba sin moneda oficial, sin propiedad privada registrada y sin horario fijo. La gente llegaba cuando podía. Los mercados de Madrid tienen la misma energía que los de Oaxaca: el intercambio no es solo de mercancía. Es de presencia.",
    pregunta: "¿Cuándo fue la última vez que compraste algo mirando a los ojos de quien lo hizo?",
    teaser: "Mañana: lo que la muerte no cancela.",
    variants: {
      visual: {
        pensamiento: "El tianguis de Tlacolula los domingos es un paisaje de colores superpuestos: los textiles zapotecos, los chiles en montón, los pétalos de cempasúchil, el barro negro de Oaxaca. No hay diseñador: la composición la hace el azar y la tradición. Es el mercado como imagen involuntaria.",
        pregunta: "¿Qué espacio urbano te parece más bello precisamente porque nadie lo diseñó?",
        teaser: "Mañana: el Día de Muertos, conversación con los que ya no están.",
      },
      material: {
        pensamiento: "En el tianguis se puede saber de dónde viene un producto por el olor, el tacto y el peso antes de preguntar el precio. El queso de Oaxaca se distingue por cómo se estira. El copal por cómo perfuma el aire antes de verlo. El mercado como educación sensorial que los supermercados eliminaron.",
        pregunta: "¿Qué compraste hoy sin usar ninguno de los sentidos?",
        teaser: "Mañana: lo que no se cancela con la muerte.",
      },
      kinesthetic: {
        pensamiento: "En el tianguis el cuerpo no puede detenerse: el espacio es demasiado pequeño, el ritmo demasiado rápido, el ruido demasiado presente. El mercado mexicano se experimenta en movimiento. La comprensión viene del tránsito, no de la observación estática.",
        pregunta: "¿Cuándo fue la última vez que un espacio te obligó a moverte de una manera que no elegiste?",
        teaser: "Mañana: el Día de Muertos como conversación.",
      },
      conceptual: {
        pensamiento: "El tianguis funcionó durante siglos sin Estado que lo regulara, sin moneda oficial, sin contrato escrito. Es la economía como relación directa entre personas. La institución más antigua de México no fue el gobierno ni la iglesia: fue el mercado. Y sobrevivió a todos los que intentaron controlarlo.",
        pregunta: "¿Qué institución funciona mejor precisamente porque nadie la controla?",
        teaser: "Mañana: la muerte como institución, no como tragedia.",
      },
    },
  },
  {
    rotation_key: 8,
    subtitulo: "Lo que la muerte no cancela",
    color: { nombre: "Naranja Cempasúchil", hex: "#E05A00" },
    nahuatl_word: "Miquiztli",
    nahuatl_meaning: "muerte",
    nahuatl_nota: "También el nombre del decimosexto día del calendario azteca. La muerte como dato calendárico, no como tragedia. El tiempo incluye lo que termina.",
    lugar: { nombre: "Casa de México en España", barrio: "Serrano, 46", nota: "La ofrenda de noviembre suele ser la instalación más visitada del año. Y la más silenciosa. El silencio también es conversación." },
    hecho: "El Día de Muertos de 2024 en Madrid reunió a más de 40,000 personas en el Cementerio Civil. Es la celebración mexicana más grande fuera de México. La flor de cempasúchil tardó un mes en llegar desde Puebla.",
    pensamiento: "El Día de Muertos no es el Halloween mexicano. Es una cosmovisión entera comprimida en dos días: la creencia de que los muertos regresan porque los vivos los llaman. La ofrenda no es decoración. Es una conversación con alguien que ya no puede responder de la manera usual.",
    pregunta: "¿A quién llamarías si creyeras que pudiera escucharte?",
    teaser: "Mañana: la música que nació en un puerto y llegó a dos continentes.",
    variants: {
      visual: {
        pensamiento: "El altar del Día de Muertos es una imagen construida para los ojos del difunto, no para los de los vivos. La foto, las flores, la comida favorita: cada elemento compone un retrato del ausente hecho de objetos presentes. La ofrenda como fotografía invertida.",
        pregunta: "¿Qué imagen conservas de alguien que ya no está?",
        teaser: "Mañana: la música del son jarocho que no tiene propietario.",
      },
      material: {
        pensamiento: "La ofrenda huele a cempasúchil, a copal, a la comida que preparó el difunto en vida. El olfato llega a la memoria antes que la vista. El Día de Muertos es un ritual olfativo: los muertos regresan guiados por el olor de lo que amaban.",
        pregunta: "¿Qué olor te devuelve más rápido a alguien que ya no está?",
        teaser: "Mañana: la música que nadie posee.",
      },
      kinesthetic: {
        pensamiento: "Colocar una ofrenda es un acto físico que dura horas: arreglar las flores, disponer los platillos, encender el copal, ajustar la foto. El cuerpo trabaja en el recuerdo. La memoria se activa a través de las manos antes de activarse a través de las palabras.",
        pregunta: "¿Qué has construido con las manos para honrar a alguien que ya no está?",
        teaser: "Mañana: el son jarocho, la música de todos.",
      },
      conceptual: {
        pensamiento: "El Día de Muertos no acepta la muerte como final: la trata como pausa. La relación con el difunto continúa, cambia de forma, requiere mantenimiento ritual. Es una ontología distinta: los muertos no desaparecen, se transforman en deudores de atención anual.",
        pregunta: "¿Con quién tienes una conversación pendiente que ya no puede responderte?",
        teaser: "Mañana: el son jarocho como arquitectura de encuentro.",
      },
    },
  },
  {
    rotation_key: 9,
    subtitulo: "Cuando la música no tiene dueño",
    color: { nombre: "Azul Veracruz", hex: "#0B5E8F" },
    nahuatl_word: "Fandango",
    nahuatl_meaning: "reunión bulliciosa",
    nahuatl_nota: "La palabra española posiblemente tiene raíz náhuatl. O la náhuatl tiene raíz española. El origen ya no importa: importa que nadie pide invitación.",
    lugar: { nombre: "La Corrala", barrio: "Lavapiés", nota: "Los jueves hay fandangos de son jarocho. Madrid lleva cinco años con esta tradición y todavía no aparece en ninguna guía." },
    hecho: "'La Bamba' de Ritchie Valens (1958) es una versión del son jarocho La Bamba Jarocha. El original lleva 200 años. La versión de 1958 llegó al número 1 en Estados Unidos. El original nunca salió de Veracruz.",
    pensamiento: "El son jarocho nació en Veracruz del encuentro entre la música española, la africana y la indígena. Las fandangas, las reuniones donde se toca y canta, siguen siendo abiertas: cualquiera puede sumarse. La música que no tiene propietario no puede cerrar.",
    pregunta: "¿Qué tienes que fue creado por nadie y pertenece a todos?",
    teaser: "Mañana: la escritura que el cuerpo lleva puesta.",
    variants: {
      visual: {
        pensamiento: "En una fandanga de son jarocho no hay escenario: el círculo de músicos y bailarines es el mismo espacio. La tarima en el centro, los zapatos golpeando el ritmo, las jaranas en arco alrededor. La imagen cambia con cada canción y nadie la dirige.",
        pregunta: "¿Qué imagen colectiva has sido parte de que nadie organizó?",
        teaser: "Mañana: los textiles como escritura.",
      },
      material: {
        pensamiento: "La jarana veracruzana se construye con madera de cedro o de palo de rosa. El cedro le da brillo; el palo de rosa, profundidad. Los lutiers de Veracruz transmiten el oficio de generación en generación, y cada instrumento tiene el sonido particular de las manos que lo hicieron.",
        pregunta: "¿Qué objeto usas cuya fabricación no podrías describir?",
        teaser: "Mañana: los textiles zapotecos como lenguaje.",
      },
      kinesthetic: {
        pensamiento: "El son jarocho se baila en una tarima de madera elevada que amplifica el zapateado. El cuerpo percute el suelo, el suelo responde, los demás escuchan el cuerpo como instrumento. La danza no es ornamento: es la percusión principal de la música.",
        pregunta: "¿Cuándo fue la última vez que tu cuerpo fue el instrumento?",
        teaser: "Mañana: los textiles que se leen con el tacto.",
      },
      conceptual: {
        pensamiento: "La fandanga es un protocolo de encuentro sin propietario. Cualquiera que sepa tocar puede sumarse. Cualquiera que no sepa puede aprender mirando. La propiedad intelectual es incompatible con esta forma: la música que no puede cerrarse tampoco puede venderse.",
        pregunta: "¿Qué forma de conocimiento crees que funciona mejor cuando no tiene propietario?",
        teaser: "Mañana: el textil como código.",
      },
    },
  },
  {
    rotation_key: 10,
    subtitulo: "La escritura que el cuerpo lleva",
    color: { nombre: "Índigo Oaxaqueño", hex: "#2E1B69" },
    nahuatl_word: "Quachtli",
    nahuatl_meaning: "tela de algodón",
    nahuatl_nota: "En la economía mexica, la tela era moneda. El valor no era abstracto: era textil. Cada pieza era un argumento.",
    lugar: { nombre: "Tienda artesanal Casa de México", barrio: "Serrano, 46", nota: "Hay mantas zapotecas auténticas. Cada diseño tiene un nombre y un origen geográfico preciso. No es artesanía genérica." },
    hecho: "Teotitlán del Valle, Oaxaca, produce alfombras de lana con tintes naturales desde hace 2,500 años. El proceso no ha cambiado sustancialmente. Cada pieza requiere entre una semana y tres meses.",
    pensamiento: "Los textiles zapotecos de Oaxaca son una escritura que los arqueólogos todavía están aprendiendo a leer. Los colores no son decorativos: indican lugar de origen, estado civil, afiliación comunitaria. Una mujer de Teotitlán del Valle lleva su historia en la ropa.",
    pregunta: "¿Qué lleva tu ropa de hoy que no pusiste tú?",
    teaser: "Mañana: el destilado que no pide permiso.",
    variants: {
      visual: {
        pensamiento: "Los tapetes de Teotitlán del Valle tienen una geometría que parece abstracta hasta que alguien te explica que el rombo doble es el símbolo del cosmos zapoteca, que la línea en zigzag es el relámpago, que el color rojo en ese contexto específico indica el este. El ojo aprende a leer después de ver.",
        pregunta: "¿Qué patrón visual has mirado muchas veces sin saber que era un texto?",
        teaser: "Mañana: el mezcal — filosofía en botella.",
      },
      material: {
        pensamiento: "El índigo que tiñe los textiles zapotecos se fermenta durante semanas en recipientes de barro. El olor es penetrante y particular: tierra mojada, fermentación, algo vegetal. Los tintoreros de Oaxaca distinguen el punto exacto de la fermentación por el olor, no por el color.",
        pregunta: "¿Qué proceso requiere que esperes el momento exacto que solo tu cuerpo reconoce?",
        teaser: "Mañana: el mezcal, filosofía destilada.",
      },
      kinesthetic: {
        pensamiento: "Tejer en telar de cintura requiere que el cuerpo entero sea parte de la tensión: la espalda mantiene el hilo, las manos trabajan la trama, los pies controlan la base. El telar no es una máquina que el cuerpo usa: el cuerpo y el telar son una sola cosa mientras se teje.",
        pregunta: "¿Cuándo fue la última vez que tu cuerpo entero participó en una sola tarea?",
        teaser: "Mañana: el mezcal y la filosofía del agave.",
      },
      conceptual: {
        pensamiento: "En la economía mexica, el quachtli —la tela de algodón— era moneda de cambio. El valor era textil, no abstracto. La tela como equivalente universal antes de que existiera el dinero como concepto. Los europeos trajeron las monedas de metal; México ya tenía un sistema más sofisticado.",
        pregunta: "¿Qué valor asignas a cosas que no tienen precio pero sí peso?",
        teaser: "Mañana: el mezcal como sistema de pensamiento.",
      },
    },
  },
  {
    rotation_key: 11,
    subtitulo: "El destilado que no pide permiso",
    color: { nombre: "Ámbar Mezcal", hex: "#D4900A" },
    nahuatl_word: "Metl",
    nahuatl_meaning: "agave",
    nahuatl_nota: "La planta sagrada. Los mexicas la llamaban 'las cuatro centenas de dioses'. Tiene 200 variedades con uso conocido. La mayoría aún sin nombre científico.",
    lugar: { nombre: "Bar Brutal", barrio: "Malasaña", nota: "La carta de mezcales más completa de Madrid. Tobaziche, cuishe, tepeztate. Variedades que tardan 25 años en madurar y se usan una sola vez." },
    hecho: "El agave tepeztate tarda entre 25 y 35 años en madurar antes de poder destilarse. Se cosecha una sola vez en toda su vida. Un mezcal de tepeztate es el resultado de tres décadas de espera.",
    pensamiento: "El mezcal no es tequila. El tequila es un mezcal de una sola variedad de agave, de una sola región, regulado industrialmente desde 1974. El mezcal es de cualquier agave, de cualquier estado, hecho como cada maestro juzga. La diferencia no es de sabor: es de filosofía.",
    pregunta: "¿Qué en tu vida requiere espera y no se puede acelerar?",
    teaser: "Mañana: el arquitecto que construyó con luz.",
    variants: {
      visual: {
        pensamiento: "El mezcal artesanal tiene un color que varía según el agave y el tiempo en barricas: desde el blanco cristalino del joven hasta el ámbar profundo del añejo. Cada botella etiquetada a mano tiene una composición visual que es también un documento de origen.",
        pregunta: "¿Qué color asocias con la paciencia?",
        teaser: "Mañana: Barragán, el arquitecto de la luz atrapada.",
      },
      material: {
        pensamiento: "El proceso del mezcal artesanal es completamente manual: cortar el agave con machete, cocinar las piñas en horno de tierra durante días, moler en tahona de piedra jalada por burro, fermentar en tinas de madera, destilar en alambiques de barro. El mezcal es el olor de ese proceso completo.",
        pregunta: "¿Cuántos pasos tiene el proceso más largo que conoces de principio a fin?",
        teaser: "Mañana: la casa que era un argumento de luz.",
      },
      kinesthetic: {
        pensamiento: "Beber mezcal artesanal en caballito de barro a temperatura ambiente no es lo mismo que beberlo frío en copa de cristal. El barro altera la temperatura y la textura. El cuerpo percibe el mezcal diferente según el recipiente. El ritual importa tanto como el contenido.",
        pregunta: "¿Cómo cambia tu experiencia de algo según el recipiente o el contexto en que lo recibes?",
        teaser: "Mañana: Barragán y la arquitectura como experiencia del cuerpo.",
      },
      conceptual: {
        pensamiento: "El mezcal artesanal representa un modelo económico alternativo: producción pequeña, conocimiento transmitido sin patentes, precio justo para el maestro mezcalero, sabor imposible de replicar industrialmente. Es lo opuesto del tequila industrial, que estandarizó y escaló hasta perder casi todo lo que lo hacía interesante.",
        pregunta: "¿Qué cosa pierdes inevitablemente cuando escala?",
        teaser: "Mañana: Barragán y el color como filosofía.",
      },
    },
  },
  {
    rotation_key: 12,
    subtitulo: "La casa que era una idea",
    color: { nombre: "Magenta Gilardi", hex: "#9C1A47" },
    nahuatl_word: "Tlapanhuia",
    nahuatl_meaning: "el que pinta de rojo",
    nahuatl_nota: "De tlapalli (color) y huia (hace). El nombre que los tlacuilos daban a los maestros del color. Barragán hubiera sido tlacuilo.",
    lugar: { nombre: "Fundación Juan March", barrio: "Castelló", nota: "Tienen fotografías de los interiores de Barragán en archivo. La escala de los colores hace pensar en México dentro de Madrid." },
    hecho: "La Casa Barragán fue declarada Patrimonio de la Humanidad por la UNESCO en 2004. Es la única casa del siglo XX en México con esa distinción. Tiene 250 m². El tamaño no importaba.",
    pensamiento: "Luis Barragán construyó la Casa Gilardi en 1976 con una piscina interior magenta. Los muros son amarillo y azul. La luz entra controlada, calculada, como si el sol fuera un material más. Barragán no diseñaba casas: diseñaba experiencias de luz atrapada.",
    pregunta: "¿Qué espacio has habitado que te cambió sin que lo notaras en el momento?",
    teaser: "Mañana: la fotógrafa que convirtió la dignidad en técnica.",
    variants: {
      visual: {
        pensamiento: "Barragán calculaba el recorrido de la luz solar a lo largo del día antes de trazar un solo muro. El magenta de la Casa Gilardi no es un color de pared: es el color de la luz a las tres de la tarde filtrada por ese muro a esa altura en esa latitud. La arquitectura como control del espectro.",
        pregunta: "¿Qué espacio has visto que pareciera construido específicamente para la luz de un momento del día?",
        teaser: "Mañana: Iturbide, la mirada que no miente.",
      },
      material: {
        pensamiento: "Los muros de Barragán son de adobe o concreto pintado con cal. La textura no es perfectamente lisa: se nota la mano del albañil, las capas de pintura, el tiempo. El color no es industrial: envejece, se descasca, se vuelve más rico. La materia como parte del diseño.",
        pregunta: "¿Qué superficie has tocado hoy que mejora con el tiempo en vez de deteriorarse?",
        teaser: "Mañana: la mirada de Graciela Iturbide.",
      },
      kinesthetic: {
        pensamiento: "Atravesar la Casa Gilardi es una experiencia de cambio constante: luz que cambia, temperatura que varía, el sonido del agua en la piscina interior que te oyes antes de verla. Barragán diseñaba secuencias para el cuerpo en movimiento, no espacios para ser fotografiados.",
        pregunta: "¿En qué espacio has sentido que el arquitecto diseñó para tu cuerpo en movimiento?",
        teaser: "Mañana: Iturbide y el método de prestar atención.",
      },
      conceptual: {
        pensamiento: "Barragán decía que la arquitectura que no produce silencio ha fracasado. Sus colores son tan saturados que en foto parecen irreales, pero en el espacio producen calma. Hay una contradicción productiva en eso: el exceso visual que genera paz interior. El concepto que solo funciona habitado.",
        pregunta: "¿Qué cosa extrema te produce exactamente el efecto contrario al que parecería lógico?",
        teaser: "Mañana: Graciela Iturbide y el ojo que no traiciona.",
      },
    },
  },
  {
    rotation_key: 13,
    subtitulo: "La mirada que no pide disculpas",
    color: { nombre: "Plata Fotográfica", hex: "#8A8A9A" },
    nahuatl_word: "Ixiptla",
    nahuatl_meaning: "imagen sagrada",
    nahuatl_nota: "En la religión mexica la imagen no era una copia: era una presencia. La representación convocaba lo representado. Cada foto de Iturbide convoca.",
    lugar: { nombre: "PhotoEspaña", barrio: "Varios espacios, junio", nota: "El festival tiene siempre fotógrafos latinoamericanos. Los de México suelen ser los más radicales en la elección del tema y del sujeto." },
    hecho: "Graciela Iturbide ganó el Premio Princesa de Asturias de las Artes 2025. Tiene 82 años y sigue fotografiando. Su archivo contiene más de 40,000 negativos. Ha publicado 12 libros.",
    pensamiento: "Graciela Iturbide fotografió a las mujeres zapotecas de Juchitán durante años antes de publicar una sola imagen. No llegó y disparó: llegó, vivió, escuchó. Sus fotografías no documentan: revelan. La diferencia entre el fotógrafo de paso y el testigo que permanece.",
    pregunta: "¿A quién has querido fotografiar sin atreverte a hacerlo?",
    teaser: "Mañana: el arte que salió a la calle antes de que la calle lo pidiera.",
    variants: {
      visual: {
        pensamiento: "Iturbide trabaja en blanco y negro porque elimina el color como distracción y obliga a ver la forma, la luz y la sombra. Sus encuadres son absolutamente precisos: cada elemento está donde debe estar. Pero la imagen nunca se siente construida. Se siente encontrada.",
        pregunta: "¿Cuándo has visto algo tan bien compuesto que parecía imposible que fuera real?",
        teaser: "Mañana: el muralismo, el arte que eligió las paredes.",
      },
      material: {
        pensamiento: "Iturbide usa película analógica, revelada en cuarto oscuro. El proceso es químico, físico, con olor a fijador y papel mojado. Cada negativo es único. No hay respaldo digital. La fotografía como objeto material con sus propias fragilidades.",
        pregunta: "¿Qué proceso en tu vida produce algo que no puede ser copiado exactamente?",
        teaser: "Mañana: los murales de Rivera y la pared pública.",
      },
      kinesthetic: {
        pensamiento: "Iturbide dice que fotografía lento: espera, observa, deja que la relación con el sujeto se establezca antes de levantar la cámara. La foto es el resultado de horas de presencia física en un lugar. El cuerpo aprende el espacio antes de que el ojo decida el encuadre.",
        pregunta: "¿Cuándo fue la última vez que esperaste lo suficiente para que algo se revelara solo?",
        teaser: "Mañana: el mural como política.",
      },
      conceptual: {
        pensamiento: "El ixiptla mexica convocaba al dios con la imagen. Iturbide dice que sus fotos no son de ella: son del lugar y de quien fue fotografiado. La autoría disuelta en la presencia. Una fotografía que no pertenece al fotógrafo sino al instante en que ocurrió.",
        pregunta: "¿Qué has creado que sientes que no te pertenece del todo?",
        teaser: "Mañana: el muralismo y la autoría colectiva.",
      },
    },
  },
  {
    rotation_key: 14,
    subtitulo: "El arte que salió a la calle",
    color: { nombre: "Rojo Rivera", hex: "#C41E3A" },
    nahuatl_word: "Tlacuilo",
    nahuatl_meaning: "el que pinta y escribe",
    nahuatl_nota: "Los pintores de códices prehispánicos no separaban escritura de imagen: todo era tlacuilolli. El mural es el códice del siglo XX.",
    lugar: { nombre: "Museo Reina Sofía", barrio: "Atocha", nota: "La colección tiene artistas mexicanos desde los muralistas hasta contemporáneos. La sala latinoamericana es la más subestimada del museo." },
    hecho: "El mural 'Sueño de una tarde dominical en la Alameda Central' de Rivera mide 15 metros de largo. Tardó cuatro años. Fue trasladado a un nuevo museo sin moverlo: construyeron el edificio a su alrededor.",
    pensamiento: "El muralismo mexicano fue la primera vez en la historia del arte moderno que pintores de primer nivel eligieron las paredes públicas sobre los museos privados. Diego Rivera, Orozco, Siqueiros: no pintaron para coleccionistas. Pintaron para los que trabajaban debajo de las imágenes.",
    pregunta: "¿Qué quieres decir en voz alta que solo te has atrevido a decir en privado?",
    teaser: "Mañana: el idioma que hablas sin saber que lo hablas.",
    variants: {
      visual: {
        pensamiento: "Los murales de Rivera no se ven: se recorren. Son demasiado grandes para verse de una vez, y su composición exige movimiento. El ojo sigue el relato de izquierda a derecha, de arriba a abajo, como un códice. La imagen que solo se entiende en movimiento.",
        pregunta: "¿Qué obra de arte has recorrido con el cuerpo en vez de verla desde un punto fijo?",
        teaser: "Mañana: el náhuatl que hablas sin saberlo.",
      },
      material: {
        pensamiento: "El fresco —la técnica de Rivera— se pinta sobre yeso húmedo que se seca en horas. Hay que saber exactamente qué cantidad de pared se puede pintar en un día, y no equivocarse. La pintura se integra al muro: no puede despegarse sin destruirlo. El material como compromiso definitivo.",
        pregunta: "¿Qué has hecho que no tenía vuelta atrás y eso lo hizo mejor?",
        teaser: "Mañana: las palabras que vienen de Mesoamérica.",
      },
      kinesthetic: {
        pensamiento: "Siqueiros pintaba con pistola de aire comprimido mientras sus ayudantes movían andamios. El cuerpo en movimiento como parte de la técnica. Sus murales tienen una energía cinética que los de Rivera no tienen: se siente el movimiento del pintor en la imagen.",
        pregunta: "¿Qué has creado que lleva la energía del movimiento con que fue hecho?",
        teaser: "Mañana: el idioma que llevas sin saberlo.",
      },
      conceptual: {
        pensamiento: "El muralismo como proyecto cultural tenía una tesis: el arte debe ser público o no es arte para todos. Rivera, Orozco y Siqueiros estaban en desacuerdo en casi todo excepto en eso. La pared del edificio público como único lienzo legítimo en una democracia.",
        pregunta: "¿Qué crees que debería ser accesible para todos y no lo es?",
        teaser: "Mañana: el náhuatl escondido en el español.",
      },
    },
  },
  {
    rotation_key: 15,
    subtitulo: "El idioma que hablas sin saberlo",
    color: { nombre: "Verde Jade", hex: "#2D6A4F" },
    nahuatl_word: "Tomatl",
    nahuatl_meaning: "fruto redondo con ombligo",
    nahuatl_nota: "El tomate. No viene de Italia: viene de Mesoamérica. Italia lo adoptó en el siglo XVIII y lo convirtió en su identidad nacional. El origen fue otro.",
    lugar: { nombre: "Real Academia Española", barrio: "El Retiro", nota: "El Diccionario de Americanismos está disponible en línea. Busca cualquier palabra que crees que es puramente española y encuentra su raíz náhuatl." },
    hecho: "El náhuatl es hablado por aproximadamente 1.7 millones de personas en México hoy. Es la lengua indígena más hablada del país. Tiene escritura moderna, gramática formalizada y literatura contemporánea.",
    pensamiento: "El español tiene más de 1,500 palabras de origen náhuatl. No solo chocolate y tomate: también aguacate, chicle, chile, copal, papalote. Hablas náhuatl varias veces al día sin saberlo. El idioma de Moctezuma sobrevivió a la conquista escondiéndose dentro del conquistador.",
    pregunta: "¿Qué parte de ti viene de donde no crees?",
    teaser: "Mañana: el límite que se movió sin que nadie votara.",
    variants: {
      visual: {
        pensamiento: "Los códices mexicas mezclaban pictogramas, ideogramas y fonogramas en una sola página. El náhuatl escrito no era alfabético: era visual, espacial, relacional. La escritura europea que lo sustituyó era más eficiente. Y menos hermosa.",
        pregunta: "¿Qué sistema de comunicación visual te parece más rico que la escritura?",
        teaser: "Mañana: el límite que cambia de lugar.",
      },
      material: {
        pensamiento: "Chocolate, tomate, aguacate, chile, vainilla, maíz: seis palabras náhuatl que describen seis ingredientes sin los cuales la cocina del mundo moderno no existiría. La lengua de los mexicas sobrevivió en los alimentos que el mundo no pudo rechazar.",
        pregunta: "¿Qué idioma habla tu cocina hoy?",
        teaser: "Mañana: la frontera que se movió sin pedir permiso.",
      },
      kinesthetic: {
        pensamiento: "Chilpayate, papalote, chocolatl: hay palabras náhuatl que el cuerpo reconoce antes de que la mente las analice. La memoria del idioma se guarda en la boca, en la lengua literalmente. El español mexicano tiene sonidos que el español peninsular nunca tuvo.",
        pregunta: "¿Qué palabra suena exactamente como lo que significa?",
        teaser: "Mañana: la frontera que el mapa no pudo fijar.",
      },
      conceptual: {
        pensamiento: "El náhuatl sobrevivió la conquista infiltrándose en el español. No resistió de frente: resistió por dentro. 1,500 palabras en el idioma del conquistador. La supervivencia como infiltración es una estrategia que el náhuatl ejecutó durante cinco siglos sin un plan.",
        pregunta: "¿Qué sobrevive mejor: lo que resiste de frente o lo que se adapta por dentro?",
        teaser: "Mañana: la frontera como argumento político.",
      },
    },
  },
  {
    rotation_key: 16,
    subtitulo: "El límite que se movió",
    color: { nombre: "Arena Fronteriza", hex: "#C4A55A" },
    nahuatl_word: "Nahuatlato",
    nahuatl_meaning: "el intérprete",
    nahuatl_nota: "En la conquista, los nahuatlatos vivían en los dos lados de la frontera. La frontera siempre necesita a alguien que entienda ambos mundos para funcionar.",
    lugar: { nombre: "Museo de América", barrio: "Moncloa", nota: "La sala de la conquista tiene objetos de ambos lados: español y mexica. La vitrina no toma partido. El visitante sí, quiera o no." },
    hecho: "El Tratado de Guadalupe Hidalgo fue firmado en 1848 en el pueblo de Guadalupe Hidalgo, hoy parte de Ciudad de México. México perdió más de 1.3 millones de km² en un solo documento.",
    pensamiento: "Hasta 1848, Texas, California, Arizona, Nuevo México y Colorado eran México. El Tratado de Guadalupe Hidalgo cedió el 55% del territorio mexicano a Estados Unidos. 'No cruzamos la frontera: la frontera nos cruzó' —dicen los chicanos. En Madrid la frontera también existe, pero es invisible.",
    pregunta: "¿Qué límite tuyo es real y cuál es una historia que te contaron?",
    teaser: "Mañana: la megalópolis que no pide disculpas por su tamaño.",
    variants: {
      visual: {
        pensamiento: "El Río Bravo —Río Grande en inglés— es la frontera entre México y Estados Unidos en Texas. El mismo río tiene dos nombres, dos países. Vista desde el aire, la frontera no existe. Vista desde el suelo, lo es todo.",
        pregunta: "¿Qué límite que ves es invisible desde otro ángulo?",
        teaser: "Mañana: Ciudad de México, la megalópolis sin disculpa.",
      },
      material: {
        pensamiento: "El muro fronterizo entre México y Estados Unidos tiene materiales diferentes según el tramo: acero, hormigón, alambres de navaja. Cada administración ha construido un tramo con su propia tecnología del miedo. La frontera como colección de materiales de la historia reciente.",
        pregunta: "¿Con qué material construirías o derribarías un límite que conoces?",
        teaser: "Mañana: CDMX, la ciudad sin excusas.",
      },
      kinesthetic: {
        pensamiento: "Cruzar una frontera a pie es una experiencia corporal específica: la cola, el nervio, el movimiento que se detiene por decisión de otro, la continuación que también es permiso de otro. El cuerpo aprende que la frontera existe antes de ver el cartel.",
        pregunta: "¿Qué frontera has cruzado que sentiste en el cuerpo antes de verla marcada?",
        teaser: "Mañana: la ciudad más grande de América Latina.",
      },
      conceptual: {
        pensamiento: "El nahuatlato no era traductor: era puente vivo. Vivía en dos mundos sin pertenecer completamente a ninguno. La frontera siempre crea nahuatlatos, personas que la habitan en vez de cruzarla. Los mexicanos en Madrid son nahuatlatos del Atlántico.",
        pregunta: "¿Cuántos mundos puedes habitar sin pertenecer completamente a ninguno?",
        teaser: "Mañana: Ciudad de México sin apologías.",
      },
    },
  },
  {
    rotation_key: 17,
    subtitulo: "La ciudad que no pide disculpas",
    color: { nombre: "Gris Concreto", hex: "#5A5A6E" },
    nahuatl_word: "Altepetl",
    nahuatl_meaning: "ciudad",
    nahuatl_nota: "Literalmente: agua-montaña. Para los mexicas, una ciudad no se definía por sus edificios sino por sus recursos naturales. El agua primero. Siempre el agua primero.",
    lugar: { nombre: "Galería Elvira González", barrio: "Salamanca", nota: "Representa artistas mexicanos en Madrid. Programa exposiciones que mezclan CDMX con Europa sin hacer de ello un evento multicultural. Es simplemente arte." },
    hecho: "Ciudad de México tiene más de 150 museos, más museos per cápita que cualquier otra ciudad del mundo. La ciudad construida sobre un lago acumula más cultura por m² que cualquier capital europea.",
    pensamiento: "Ciudad de México tiene 22 millones de personas y sigue siendo la ciudad más caótica, más viva, más contradictoria y más creativa de América Latina. Los mejores restaurantes del continente están ahí. La mejor arquitectura nueva. La ciudad no apologiza por su tamaño: lo usa.",
    pregunta: "¿Qué ciudad te ha cambiado más y por qué no hablas de ello?",
    teaser: "Mañana: el escritor que escribió dos libros y cambió una literatura entera.",
    variants: {
      visual: {
        pensamiento: "Ciudad de México desde el aire es un manto gris interrumpido por manchas verdes: los parques, los jardines, los camellones arbolados. La ciudad que parece caos desde el suelo tiene desde arriba la densidad visual de un tejido. Un tejido de 22 millones de puntos.",
        pregunta: "¿Qué ciudad te parece más hermosa a distancia y más contradictoria de cerca?",
        teaser: "Mañana: Rulfo y el silencio como método.",
      },
      material: {
        pensamiento: "El concreto de CDMX tiene proporciones distintas al de Madrid porque el suelo es diferente: arcilla lacustre que se mueve. Los arquitectos mexicanos calculan flexibilidad donde los europeos calculan rigidez. El material se adapta al territorio. El territorio no se adapta al material.",
        pregunta: "¿Qué has construido con materiales que no eran los indicados porque eran los únicos disponibles?",
        teaser: "Mañana: Rulfo, 128 páginas que cambiaron la literatura.",
      },
      kinesthetic: {
        pensamiento: "Moverse en CDMX requiere un conocimiento corporal de la ciudad que tarda años en adquirirse: saber qué metro tomar a qué hora, cuándo la Insurgentes está imposible, qué colonias cambian de carácter después de las diez. La ciudad se aprende con los pies antes que con el mapa.",
        pregunta: "¿Cuánto tiempo te tomó aprender a moverte en la ciudad donde vives?",
        teaser: "Mañana: Pedro Páramo, el libro que se memorizó.",
      },
      conceptual: {
        pensamiento: "CDMX es una ciudad que no tiene escala humana y no quiere tenerla. 22 millones de personas no caben en una escala humana: requieren otra lógica. La megalópolis como forma urbana distinta a la ciudad europea, no como ciudad europea fallida.",
        pregunta: "¿Qué cosa grande funciona mejor precisamente porque acepta su tamaño en vez de disculparse por él?",
        teaser: "Mañana: Rulfo y la precisión como filosofía.",
      },
    },
  },
  {
    rotation_key: 18,
    subtitulo: "El silencio como método",
    color: { nombre: "Beige Polvoriento", hex: "#C8B89A" },
    nahuatl_word: "Tequitl",
    nahuatl_meaning: "trabajo y tributo",
    nahuatl_nota: "Para los mexicas, el trabajo no era opuesto al descanso: era una forma de relación con lo sagrado. Hacer y dar al mismo tiempo. Rulfo tardó lo que tardó.",
    lugar: { nombre: "Librería La Central del Reina Sofía", barrio: "Atocha", nota: "Tienen Pedro Páramo en la edición de aniversario de la UNAM. Es el libro que más se regala entre mexicanos en Madrid. Cabe en un bolsillo." },
    hecho: "Pedro Páramo fue rechazado por varios editores antes de publicarse en 1955. Hoy está traducido a más de 40 idiomas y es considerado uno de los diez mejores libros en español del siglo XX. Tiene 128 páginas.",
    pensamiento: "Juan Rulfo escribió dos libros en toda su vida: El Llano en llamas (1953) y Pedro Páramo (1955). Con ellos cambió la literatura latinoamericana. García Márquez dijo que los memorizó completos antes de escribir Cien años de soledad. Rulfo no publicó más. Sabía cuándo había terminado.",
    pregunta: "¿Qué has dejado incompleto que en realidad ya está terminado?",
    teaser: "Mañana: la pintora que hizo del cuerpo un territorio.",
    variants: {
      visual: {
        pensamiento: "La prosa de Rulfo tiene la calidad visual del paisaje seco de Jalisco: sin adornos, sin árboles que interrumpan el horizonte, con una luz que hace las cosas más claras y más duras al mismo tiempo. Sus frases cortas son como fotografías: encuadre exacto, sin nada que sobre.",
        pregunta: "¿Qué prosa te parece más visual que muchas fotografías?",
        teaser: "Mañana: Frida Kahlo y el cuerpo como único territorio.",
      },
      material: {
        pensamiento: "Rulfo vivía en Jalisco, tierra de tequila, de tierra roja y de llano seco. Decía que escribía lo que oía, no lo que imaginaba. Sus personajes hablan como habla la gente del campo jaliscience: con economía, con dureza, con la precisión de quien no tiene palabras de sobra.",
        pregunta: "¿Qué escuchas en tu entorno que nadie más parece oír?",
        teaser: "Mañana: Kahlo y la pintura como único lenguaje sin intermediarios.",
      },
      kinesthetic: {
        pensamiento: "Pedro Páramo es un libro que se lee en dos o tres horas pero que requiere releerlo para entenderlo. El primer paso es desorientarse. El segundo es aceptar la desorientación como parte de la experiencia. El tercer paso es dejar que el libro mueva al lector en vez de que el lector mueva el libro.",
        pregunta: "¿Qué experiencia tuvo que descolocarte primero para poder enseñarte algo?",
        teaser: "Mañana: Kahlo, cincuenta y cinco autorretratos.",
      },
      conceptual: {
        pensamiento: "Rulfo dijo que dejó de escribir porque no tenía más que decir. La mayoría de los escritores siguen publicando mucho después de haber terminado. La diferencia entre saber cuándo terminar y no poder parar es una pregunta sobre el ego, no sobre el talento.",
        pregunta: "¿En qué momento de algo has sabido que terminó aunque nadie lo hubiera declarado?",
        teaser: "Mañana: Kahlo y el cuerpo como territorio inviolable.",
      },
    },
  },
  {
    rotation_key: 19,
    subtitulo: "El cuerpo como territorio",
    color: { nombre: "Cobalto Kahlo", hex: "#1A3D8A" },
    nahuatl_word: "Xochitl",
    nahuatl_meaning: "flor",
    nahuatl_nota: "El nombre que aparece en las trenzas de Frida. Sus flores no son decorativas: son referencias a la flora sagrada mexica. Cada elemento de sus cuadros tiene peso.",
    lugar: { nombre: "Círculo de Bellas Artes", barrio: "Gran Vía", nota: "Las exposiciones sobre arte mexicano suelen incluir a Kahlo. La última mostró sus autorretratos junto a radiografías médicas de su columna. El cuerpo como documento." },
    hecho: "'Dos Fridas' (1939) se pintó el año del divorcio de Rivera. Mide 173 × 173 cm. Es el más grande que pintó. Un año de dolor convertido en el lienzo más ambicioso de su carrera.",
    pensamiento: "Frida Kahlo pintó 55 autorretratos de los 143 cuadros que terminó. No era narcisismo: era metodología. 'Me pinto porque soy el tema que mejor conozco', dijo. El cuerpo como único territorio inviolable. La pintura como el único lenguaje sin intermediarios posibles.",
    pregunta: "¿Qué dolor tuyo todavía no has convertido en algo?",
    teaser: "Mañana: el ingrediente que cambió la cocina de un continente sin que ese continente lo sepa.",
    variants: {
      visual: {
        pensamiento: "Kahlo pintaba con la columna rota, en cama, con un espejo fijado sobre ella para verse. La imagen que pinta es siempre una imagen mediada, reflejada, invertida. Sus autorretratos tienen la doble distancia del espejo: la imagen que ella ve no es exactamente ella.",
        pregunta: "¿Cuándo fue la última vez que te viste como si fueras otro?",
        teaser: "Mañana: el chile, el ingrediente que Europa no tenía.",
      },
      material: {
        pensamiento: "Kahlo pintaba en Masonite o tela pequeña, con pinceles finos, desde una posición recostada. El dolor físico limitaba el tamaño y el tiempo de trabajo. Sus cuadros son pequeños porque el cuerpo no daba para más. El tamaño como consecuencia de la resistencia.",
        pregunta: "¿Qué has creado bajo condiciones físicas que limitaron y definieron el resultado?",
        teaser: "Mañana: el pimentón de La Vera y su origen mexicano.",
      },
      kinesthetic: {
        pensamiento: "Kahlo pintó durante treinta y cinco operaciones y décadas de corsés ortopédicos. Su relación con el cuerpo era extrema: lo estudió desde dentro, desde el dolor, desde la inmovilidad. El cuerpo que no puede moverse se vuelve el único tema posible.",
        pregunta: "¿Qué parte de tu cuerpo conoces mejor por haberla perdido o limitado?",
        teaser: "Mañana: el chile que llegó a Europa en los barcos.",
      },
      conceptual: {
        pensamiento: "El autorretrato como metodología es una declaración epistemológica: el único conocimiento válido es el que proviene del yo como objeto de estudio. Kahlo no pintó el mundo: pintó su experiencia del mundo. La diferencia es toda la diferencia.",
        pregunta: "¿Qué parte de ti es el único sujeto que puedes conocer con certeza?",
        teaser: "Mañana: el chile y la identidad que adoptó otro.",
      },
    },
  },
  {
    rotation_key: 20,
    subtitulo: "El sabor que no tiene traducción",
    color: { nombre: "Rojo Chile", hex: "#CC3300" },
    nahuatl_word: "Chilli",
    nahuatl_meaning: "el que pica",
    nahuatl_nota: "Una de las 15 palabras náhuatl que entraron directamente al inglés. En inglés: chili. En español: chile. En ambos casos México habla sin que nadie lo cite.",
    lugar: { nombre: "Taberna Carmencita", barrio: "Malasaña", nota: "El pimentón de La Vera que usan en sus guisos tiene el mismo linaje que el chile ancho oaxaqueño. Nadie en el menú lo menciona. Nadie pregunta tampoco." },
    hecho: "El pimiento se cultiva hoy en más de 70 países y es la especia fresca más consumida del mundo. Antes de 1492, Europa no conocía el picante. Todo el sabor picante de la cocina global viene de México y Centroamérica.",
    pensamiento: "El chile llegó a Europa después de 1492 y sustituyó al caro azafrán y la pimienta en la cocina popular española en cincuenta años. El pimentón de La Vera que define la cocina extremeña viene de un chile mexicano criado en un monasterio. El chile español se olvidó de México.",
    pregunta: "¿Qué cosa tuya, que ya no reconoces como tuya, empezó siendo de otro?",
    teaser: "Mañana: vivir en dos tiempos al mismo tiempo.",
    variants: {
      visual: {
        pensamiento: "Los chiles secos de México tienen colores que van del rojo carmín del chile ancho al negro del chile pasilla. En los mercados oaxaqueños se exhiben por color, no por nombre. La taxonomía visual es tan precisa como la botánica.",
        pregunta: "¿Qué has identificado por el color antes de saber el nombre?",
        teaser: "Mañana: dos relojes, dos ciudades.",
      },
      material: {
        pensamiento: "La capsaicina —el compuesto que produce el picante— no daña la boca: activa los receptores del dolor. El chile no quema: convence al cuerpo de que quema. Es un engaño químico que el ser humano lleva tres mil años aprendiendo a desear.",
        pregunta: "¿Qué sensación buscas que en realidad es tu cuerpo procesando algo que no es lo que parece?",
        teaser: "Mañana: el tiempo que separa dos ciudades.",
      },
      kinesthetic: {
        pensamiento: "El picante del chile se siente en la lengua, en la garganta, en la frente que suda, en los ojos que lagrimean. El cuerpo entero responde. La cocina mexicana es una experiencia total del cuerpo, no solo del paladar. El picante como interruptor del sistema nervioso.",
        pregunta: "¿Qué sensación física te despierta completamente cuando el resto del día no lo logró?",
        teaser: "Mañana: el tiempo de los mexicanos en Madrid.",
      },
      conceptual: {
        pensamiento: "El chile transformó la cocina europea sin que Europa reconociera el origen. El pimentón español, la paprika húngara, el curry indio: todos tienen en su base variedades de chile americano. La influencia sin cita es la forma de influencia más profunda.",
        pregunta: "¿Qué has incorporado tanto que ya no recuerdas de dónde viene?",
        teaser: "Mañana: el tiempo doble.",
      },
    },
  },
  {
    rotation_key: 21,
    subtitulo: "Vivir entre dos relojes",
    color: { nombre: "Plata Meridiana", hex: "#8C8C9C" },
    nahuatl_word: "Cahuitl",
    nahuatl_meaning: "tiempo",
    nahuatl_nota: "Literalmente: 'lo que se va'. No el tiempo como contenedor: el tiempo como flujo que ya no tendrás. El náhuatl no tenía concepto del tiempo vacío.",
    lugar: { nombre: "Bar Matos", barrio: "La Latina", nota: "Lunes por la noche. Lleno de mexicanos en Madrid. La conversación oscila entre lo que pasó hoy aquí y lo que pasó ayer allá. Dos tiempos, una mesa." },
    hecho: "El desfase horario entre Madrid y Ciudad de México varía entre 6 y 7 horas según la época del año. Los mexicanos en Madrid son, según estudios de adaptación, el grupo que más tarda en regularizar su ciclo de sueño.",
    pensamiento: "En Madrid son las 8 de la mañana. En Ciudad de México son la 1 de la madrugada. Los mexicanos en Madrid viven en dos tiempos: el tiempo donde están y el tiempo de los que aman. Llamar a casa implica calcular. Calcular implica recordar. El amor a distancia es también aritmética temporal.",
    pregunta: "¿En qué momento del día piensas en alguien que está en otro huso horario?",
    teaser: "Mañana: el material que viene del volcán y corta más que el bisturí.",
    variants: {
      visual: {
        pensamiento: "Hay apps que muestran dos relojes en la pantalla del teléfono: Madrid y Ciudad de México. Dos círculos con agujas en posiciones distintas, mostrando que el mismo instante es de día en un lugar y de noche en el otro. La imagen más honesta de lo que significa vivir entre dos ciudades.",
        pregunta: "¿Cómo visualizas la distancia con alguien que quieres y que está lejos?",
        teaser: "Mañana: la obsidiana, el vidrio que viene del fuego.",
      },
      material: {
        pensamiento: "El pan dulce que se come en Madrid para el desayuno es casi imposible de conseguir igual que en México. Los mexicanos en Madrid saben exactamente lo que les falta: no es comida, es textura. La concha de la panadería del barrio donde creciste tiene un peso específico que ninguna otra tiene.",
        pregunta: "¿Qué alimento de tu infancia nunca has podido encontrar igual fuera de su lugar?",
        teaser: "Mañana: la obsidiana y el filo que no tiene equivalente.",
      },
      kinesthetic: {
        pensamiento: "El jet lag emocional de vivir entre dos ciudades no tiene cura con pastillas. El cuerpo se adapta al huso horario donde está; la mente sigue operando en el otro. Hay un momento del día —siempre el mismo— en que los dos tiempos se superponen y durante un instante todo parece lejos.",
        pregunta: "¿En qué momento del día sientes más intensamente la distancia de algo que amas?",
        teaser: "Mañana: la obsidiana.",
      },
      conceptual: {
        pensamiento: "El cahuitl náhuatl no era tiempo vacío: era tiempo que se va, tiempo que se usa o se pierde. El tiempo como recurso que se consume, no como contenedor neutral. Para alguien entre dos ciudades, el tiempo siempre tiene dos precios: lo que cuesta aquí y lo que cuesta allá.",
        pregunta: "¿Cuánto de tu tiempo va hacia donde no estás?",
        teaser: "Mañana: la obsidiana como tecnología y como símbolo.",
      },
    },
  },
  {
    rotation_key: 22,
    subtitulo: "El material que viene del volcán",
    color: { nombre: "Negro Obsidiana", hex: "#1A1A2E" },
    nahuatl_word: "Itzli",
    nahuatl_meaning: "obsidiana",
    nahuatl_nota: "En náhuatl, la obsidiana era también el nombre de una deidad. El material y el dios tenían el mismo nombre. Lo sagrado era concreto, táctil, volcánico.",
    lugar: { nombre: "Museo Nacional de Ciencias Naturales", barrio: "Almagro", nota: "Tienen muestras de obsidiana volcánica. La diferencia entre la de Teotihuacán y la de Jalisco es visible a simple vista: cada volcán tiene su color." },
    hecho: "La obsidiana tiene un filo 10 veces más delgado que la hoja de bisturí más afilada. Algunos cirujanos modernos usan escalpelos de obsidiana para incisiones de precisión máxima. La tecnología prehistórica supera a la moderna.",
    pensamiento: "La obsidiana es vidrio volcánico. Los mexicas la usaban para espejos, cuchillos y ornamentos rituales. El espejo de obsidiana de Tezcatlipoca —el dios del espejo humeante— era el objeto con el que los sacerdotes veían el futuro. Ver el porvenir en un espejo negro.",
    pregunta: "¿Qué ves cuando te miras en un espejo que no quieres ver?",
    teaser: "Mañana: el estado que tiene 16 idiomas distintos y una sola cocina sin igual.",
    variants: {
      visual: {
        pensamiento: "La obsidiana negra tiene un brillo que cambia según el ángulo de la luz. Vista de frente es opaca; vista en diagonal refleja todo. Los espejos de obsidiana de Tezcatlipoca funcionaban mejor en penumbra, donde la imagen es menos nítida y más sugestiva.",
        pregunta: "¿Qué ves más claramente cuando hay menos luz?",
        teaser: "Mañana: Oaxaca y sus 16 lenguas.",
      },
      material: {
        pensamiento: "La obsidiana no se talla: se fractura con precisión. El filo surge de la rotura controlada del vidrio volcánico. Los artesanos de Teotihuacán sabían exactamente qué ángulo de golpe producía qué tipo de filo. El conocimiento táctil acumulado durante generaciones sin ningún instrumento de medición.",
        pregunta: "¿Qué conocimiento tienes que solo existe en tus manos?",
        teaser: "Mañana: Oaxaca.",
      },
      kinesthetic: {
        pensamiento: "Cortar con un escalpelo de obsidiana es diferente a cortar con acero: el filo es tan agudo que los nervios no registran el corte inmediatamente. Hay un instante de disociación entre el acto y la sensación. La tecnología prehispánica que le gana a la moderna precisamente en lo que más importa.",
        pregunta: "¿Cuándo has tenido que esperar para saber el impacto de algo que ya había ocurrido?",
        teaser: "Mañana: Oaxaca, el estado que no necesita capital.",
      },
      conceptual: {
        pensamiento: "Tezcatlipoca —el dios del espejo humeante— veía el pasado y el futuro en la obsidiana. No separaba el instrumento del poder: el espejo era el dios, el dios era el espejo. En occidente separamos la tecnología del significado. En Mesoamérica eran la misma cosa.",
        pregunta: "¿Qué herramienta usas que tiene más significado del que le asignas?",
        teaser: "Mañana: el estado donde viven 16 idiomas.",
      },
    },
  },
  {
    rotation_key: 23,
    subtitulo: "El estado que no necesita capital",
    color: { nombre: "Amarillo Copal", hex: "#E8A020" },
    nahuatl_word: "Zapoteca",
    nahuatl_meaning: "los del lugar del zapote",
    nahuatl_nota: "Los mixtecos les daban otro nombre. Los españoles usaron el náhuatl. El nombre que te dan siempre viene del que tiene más poder. Los zapotecas se llaman a sí mismos 'Ben'Zaa'.",
    lugar: { nombre: "Mercado de Antón Martín", barrio: "Lavapiés", nota: "Hay un puesto oaxaqueño que vende tlayudas, tasajo y chapulines. No hay señal exterior. Solo los que saben lo encuentran. Así debe ser." },
    hecho: "Oaxaca tiene más de 35 razas nativas de maíz, la mayor biodiversidad de maíz del mundo. También tiene el mayor número de lenguas indígenas activas de México: 16 familias lingüísticas con más de 150 variantes.",
    pensamiento: "Oaxaca tiene 16 grupos étnicos, 8 regiones con cocinas distintas, el mezcal y el chocolate, los textiles más sofisticados del continente y la única ciudad en México que no creció hacia afuera: creció hacia adentro. Cada barrio es un pueblo. La ciudad se intensificó sin expandirse.",
    pregunta: "¿Qué lugar conoces que nadie necesita saber que existe para que exista?",
    teaser: "Mañana: el incienso que abre el espacio antes de que llegues.",
    variants: {
      visual: {
        pensamiento: "El barro negro de San Bartolo Coyotepec tiene un brillo que no viene del barniz: viene de bruñir la pieza a mano con una piedra de cuarzo antes de cocerla. Es un negro que absorbe la luz de una manera distinta a cualquier otro material. Solo se puede ver en Oaxaca.",
        pregunta: "¿Qué color o textura has visto que no has podido encontrar en ningún otro lugar?",
        teaser: "Mañana: el copal y el olor que abre los espacios.",
      },
      material: {
        pensamiento: "La tlayuda oaxaqueña se hace con tortilla de maíz bolita, tostada en comal hasta quedar crujiente y untada con asiento de cerdo. El tasajo se seca al sol durante días en tiras que absorben el aire de la sierra. Hay sabores de Oaxaca que solo existen porque el aire de Oaxaca los hace posibles.",
        pregunta: "¿Qué sabor de tu infancia tiene en parte el sabor del lugar donde creciste?",
        teaser: "Mañana: el copal.",
      },
      kinesthetic: {
        pensamiento: "Monte Albán, la ciudad zapoteca sobre el cerro que domina el valle de Oaxaca, requiere subir a pie. La vista desde arriba integra sierra, valle y ciudad en un solo movimiento del ojo. El cuerpo entiende la escala de la civilización zapoteca antes de que la mente la procese.",
        pregunta: "¿Qué lugar has entendido con el cuerpo antes de entenderlo con la mente?",
        teaser: "Mañana: el copal, el olor del ritual.",
      },
      conceptual: {
        pensamiento: "Los ben'Zaa —los zapotecos— construyeron Monte Albán en el siglo V a.C. y lo abandonaron en el siglo VIII d.C. sin que nadie sepa exactamente por qué. La ciudad que nadie sabe por qué se fundó ni por qué se abandonó es la más honesta de las ciudades: no necesita justificación.",
        pregunta: "¿Qué has comenzado y terminado sin poder explicar completamente por qué lo hiciste?",
        teaser: "Mañana: el copal como tecnología del estado interior.",
      },
    },
  },
  {
    rotation_key: 24,
    subtitulo: "El incienso que abre el espacio",
    color: { nombre: "Ámbar Copal", hex: "#D4780A" },
    nahuatl_word: "Copalli",
    nahuatl_meaning: "incienso",
    nahuatl_nota: "La raíz del español copal. Es posible que la palabra llegara a España antes de que España conociera el producto. El nombre viajó solo, adelantándose a la cosa.",
    lugar: { nombre: "Tienda Copal", barrio: "Malasaña", nota: "Venden copal oaxaqueño en bloques. El olor es inconfundible: tierra, resina, algo antiguo. Abre a las 11. El barrio huele diferente cuando la tienda está abierta." },
    hecho: "El copal fue uno de los primeros productos americanos en llegar a Europa tras la conquista. Los farmacéuticos españoles del siglo XVI lo documentaron como antiséptico y como regulador del estado de ánimo.",
    pensamiento: "El copal es una resina que se quema en rituales mexicas desde hace 3,000 años. Los sacerdotes lo usaban para 'abrir' el espacio antes de una ceremonia. El humo sube, el tiempo cambia. La aromaterapia moderna redescubrió lo que Mesoamérica sabía: los olores cambian los estados interiores.",
    pregunta: "¿Qué olor te transforma sin que lo decidas?",
    teaser: "Mañana: los artistas que hacen arte de México sin hacer 'arte mexicano'.",
    variants: {
      visual: {
        pensamiento: "El humo del copal sube en columnas que se doblan con la corriente de aire. En los templos mexicas los sacerdotes leían el humo como señal: su dirección indicaba la disposición de los dioses. El ojo entrenado veía mensajes donde el ojo común veía solo humo.",
        pregunta: "¿Qué ves en algo aparentemente aleatorio que te parece una señal?",
        teaser: "Mañana: el arte sin etiqueta de procedencia.",
      },
      material: {
        pensamiento: "El copal blanco de Oaxaca tiene un olor diferente al copal negro de Guerrero: el blanco es más dulce y resinoso; el negro es más terroso y profundo. Los curanderos oaxaqueños distinguen cuándo usar cada uno para propósitos distintos. La farmacopea olfativa que los laboratorios farmacéuticos del siglo XVI empezaron a documentar.",
        pregunta: "¿Qué diferencia pequeña en un material produce una experiencia completamente distinta?",
        teaser: "Mañana: el arte mexicano que no se anuncia como mexicano.",
      },
      kinesthetic: {
        pensamiento: "El ritual del copal en una ceremonia indígena requiere que el cuerpo esté en determinada posición: de pie, girado hacia los cuatro puntos cardinales, con el brazo que sostiene el sahumerio extendido. El olor es la mitad del ritual; el movimiento del cuerpo es la otra mitad.",
        pregunta: "¿En qué posición física cambias tu estado interior de manera consistente?",
        teaser: "Mañana: el arte que no pide ser reconocido como de ningún lugar.",
      },
      conceptual: {
        pensamiento: "El copal 'abre' el espacio: lo transforma de espacio cotidiano en espacio ritual. La misma habitación antes y después del copal es una habitación diferente. El olor como tecnología de transformación del contexto. Lo sagrado como estado inducido, no como categoría fija.",
        pregunta: "¿Qué marca el momento en que un espacio ordinario se convierte en uno extraordinario?",
        teaser: "Mañana: el arte que sale de México sin cargar México como peso.",
      },
    },
  },
  {
    rotation_key: 25,
    subtitulo: "Sin disculpas y sin etiquetas",
    color: { nombre: "Rosa Mexicano", hex: "#E91E8C" },
    nahuatl_word: "Itztli",
    nahuatl_meaning: "noche de obsidiana",
    nahuatl_nota: "El nombre que Abraham Cruzvillegas dio a una serie de esculturas. Los artistas mexicanos usan el náhuatl como gesto crítico: la lengua que la conquista no pudo borrar por completo.",
    lugar: { nombre: "Reina Sofía", barrio: "Atocha", nota: "La sala latinoamericana de la colección permanente es la más subestimada del museo. Los artistas mexicanos contemporáneos están ahí, junto a los muralistas, como un solo argumento." },
    hecho: "Gabriel Orozco estudió en Madrid, en la Escuela de Bellas Artes de San Fernando, antes de convertirse en el artista mexicano más cotizado del mercado secundario global, con obras vendidas por más de 4 millones de dólares.",
    pensamiento: "Gabriel Orozco, Francis Alÿs, Teresa Margolles: los artistas mexicanos más reconocidos mundialmente no hacen 'arte mexicano'. Hacen arte que parte de México pero no se queda ahí. La identidad como punto de partida, no como destino final. La diferencia entre un artista de su país y un artista en el mundo.",
    pregunta: "¿Dónde termina el origen de alguien y dónde empieza lo que eligió ser?",
    teaser: "Mañana: el libro de piedra que casi no sobrevivió.",
    variants: {
      visual: {
        pensamiento: "Gabriel Orozco trabaja con objetos cotidianos intervenidos mínimamente: un yogur, una caja de zapatos, una calavera de plástico cubierta de hojas de oro. Lo que cambia no es el objeto sino la distancia a la que lo colocas y la luz con que lo miras.",
        pregunta: "¿Qué objeto cotidiano cambia completamente cuando lo colocas en un contexto diferente?",
        teaser: "Mañana: los códices, el libro de piedra.",
      },
      material: {
        pensamiento: "Francis Alÿs cruza fronteras empujando un bloque de hielo hasta que se derrite. Camina por Ciudad de México con un zapato magnético que va recogiendo objetos metálicos del suelo. Sus piezas son acciones físicas en materiales reales: el arte como proceso, no como objeto.",
        pregunta: "¿Qué proceso conoces que es más interesante que el resultado que produce?",
        teaser: "Mañana: los códices y lo que no sobrevivió.",
      },
      kinesthetic: {
        pensamiento: "Teresa Margolles trabaja con agua en la que se han lavado cadáveres, con ropa de personas asesinadas, con polvo de morgue. Sus instalaciones son experiencias físicas del duelo: el aire que respiras en la sala tiene historia, el suelo que pisas carga algo. El arte como presencia corporal del horror.",
        pregunta: "¿Cuándo has sentido físicamente algo que normalmente se experimenta solo como concepto?",
        teaser: "Mañana: el libro que casi desapareció.",
      },
      conceptual: {
        pensamiento: "Orozco, Alÿs y Margolles operan desde México sin hacer 'arte mexicano' como categoría de consumo. Usan la identidad como herramienta, no como producto. La diferencia es la de quien lleva su origen como punto de vista y quien lo lleva como tema.",
        pregunta: "¿Usas tu origen como punto de partida o como destino final?",
        teaser: "Mañana: el conocimiento que casi no llegó.",
      },
    },
  },
  {
    rotation_key: 26,
    subtitulo: "El libro que casi no sobrevivió",
    color: { nombre: "Ocre Códice", hex: "#9C7A2D" },
    nahuatl_word: "Amoxtli",
    nahuatl_meaning: "libro",
    nahuatl_nota: "De amatl (papel de corteza de árbol) y oxtli (contenedor). El libro como contenedor de papel. El papel como árbol que continúa. La escritura como árbol que no termina de crecer.",
    lugar: { nombre: "Biblioteca Nacional", barrio: "Paseo de Recoletos", nota: "Tienen una reproducción facsimilar del Códice Tudela, un códice mexica del siglo XVI que llegó a España. El original está en el Museo de América, a diez minutos." },
    hecho: "De los aproximadamente 500 códices prehispánicos que existían en el momento de la conquista, solo 16 sobrevivieron completos. El resto fue quemado por órdenes eclesiásticas. Perdimos más del 96% del conocimiento.",
    pensamiento: "Los códices mexicas no usaban alfabeto: usaban pictogramas, ideogramas y fonogramas mezclados. El sistema era tan complejo que los frailes españoles tardaron décadas en aprenderlo. Fray Bernardino de Sahagún pasó 40 años transcribiéndolos antes de que la corona española lo prohibiera.",
    pregunta: "¿Qué has destruido sin saber que no tenías derecho a hacerlo?",
    teaser: "Mañana: la música contemporánea que México hace sin pedir permiso.",
    variants: {
      visual: {
        pensamiento: "El Códice Dresde —el más antiguo que sobrevive— tiene páginas de papel amate pintadas en rojo, negro y azul maya. Los glifos son figuras pequeñas y densas que llenan cada centímetro del espacio disponible. Es una de las imágenes más complejas que ha producido el ser humano.",
        pregunta: "¿Qué imagen densa has contemplado sabiendo que no la entiendes del todo y sin importarte?",
        teaser: "Mañana: la música que no imita.",
      },
      material: {
        pensamiento: "El papel amate se hacía golpeando la corteza interior del árbol fig hasta obtener láminas flexibles. El proceso requería agua, piedras planas y días de trabajo. Fray Juan de Zumárraga quemó miles de libros hechos de ese papel en Texcoco en 1531. Lo que se perdió no fue solo información: fue un tipo de objeto que no puede replicarse.",
        pregunta: "¿Qué objeto has perdido cuya pérdida fue también la pérdida de todo lo que contenía?",
        teaser: "Mañana: la música sin propietario.",
      },
      kinesthetic: {
        pensamiento: "Leer un códice mexica requería girar el libro, seguir el recorrido con el dedo, entender la dirección del relato. No es lineal como la lectura europea: es espacial. El lector se mueve alrededor del texto. El texto no avanza: se despliega.",
        pregunta: "¿Qué texto has leído que requirió que muevas el cuerpo para seguirlo?",
        teaser: "Mañana: la música que nació sin pedir permiso.",
      },
      conceptual: {
        pensamiento: "El 96% de los códices destruidos representan la mayor pérdida de conocimiento deliberada de la historia de América. No fue accidente: fue política. El conocimiento que no se registra en el sistema del conquistador es el conocimiento que el conquistador destruye. La escritura como poder.",
        pregunta: "¿Qué conocimiento crees que está desapareciendo ahora mismo sin que nadie lo registre?",
        teaser: "Mañana: la música que no necesita permiso.",
      },
    },
  },
  {
    rotation_key: 27,
    subtitulo: "Lo que suena cuando no se imita",
    color: { nombre: "Violeta Electroacústico", hex: "#6B2D8B" },
    nahuatl_word: "Coyolxauhqui",
    nahuatl_meaning: "la de las cascabeles en las mejillas",
    nahuatl_nota: "La diosa mexica de la luna. También el nombre de un disco fundamental del rock mexicano de los 90. El mito como título. La historia como canción.",
    lugar: { nombre: "Sala Caracol", barrio: "Argüelles", nota: "Programación de indie latinoamericano. Artistas mexicanos en gira pasan por aquí antes de que el circuito grande los encuentre. Es donde la música llega sin escolta." },
    hecho: "Natalia Lafourcade ha ganado 12 Grammy Latinos, más que cualquier artista femenina latinoamericana en la historia del premio. Ha rechazado tres contratos con discográficas estadounidenses.",
    pensamiento: "La música mexicana contemporánea no es mariachi ni reguetón. Es Natalia Lafourcade combinando huapango con pop. Es Silvana Estrada en guitarra y voz sin adornos. Es Caifanes mezclando post-punk con rock en español. En los años 80, México decidió que no necesitaba imitar Londres: tenía suficiente con ser México.",
    pregunta: "¿Qué música escuchas cuando necesitas volver a ser tú?",
    teaser: "Mañana: la memoria que casi nadie en España conoce.",
    variants: {
      visual: {
        pensamiento: "Los videoclips de Natalia Lafourcade son tratados de fotografía documental: mercados de Oaxaca, milpas, costas de Veracruz. La música y la imagen hacen el mismo argumento desde ángulos distintos. Lo contemporáneo que no reniega de lo que fue.",
        pregunta: "¿Qué imagen visual asocias con la canción que más te define?",
        teaser: "Mañana: Tlatelolco, la memoria del 68.",
      },
      material: {
        pensamiento: "El huapango se toca con violín de madera, jarana huasteca y huapanguera de cinco cuerdas dobles. Son instrumentos que requieren ajustarse con la humedad y la temperatura. El sonido cambia con el clima. La acústica como respuesta al ambiente.",
        pregunta: "¿Qué instrumento musical tiene para ti el sonido más físico, más concreto?",
        teaser: "Mañana: Tlatelolco.",
      },
      kinesthetic: {
        pensamiento: "El zapateado del huapango se realiza en tarimas de madera que amplifican el ritmo de los pies. El cuerpo es percusión. El baile no es decoración de la música: es parte de la partitura. En México hay géneros musicales que no existen sin el movimiento del cuerpo.",
        pregunta: "¿Qué música no puedes escuchar sin que tu cuerpo responda de alguna forma?",
        teaser: "Mañana: el 2 de octubre.",
      },
      conceptual: {
        pensamiento: "Silvana Estrada graba sola, con guitarra y voz, sin producción que llene el silencio. La decisión de no llenar los espacios es también una declaración: el silencio como parte de la composición. Lo que no está es tan importante como lo que está.",
        pregunta: "¿Qué has dicho con menos que con más?",
        teaser: "Mañana: la memoria que no prescribe.",
      },
    },
  },
  {
    rotation_key: 28,
    subtitulo: "Lo que no se perdona",
    color: { nombre: "Negro Tlatelolco", hex: "#0A0A14" },
    nahuatl_word: "Tlamatini",
    nahuatl_meaning: "el que sabe las cosas",
    nahuatl_nota: "El filósofo, el sabio en náhuatl. Los estudiantes de Tlatelolco eran tlamatinime: los que empezaron a saber lo que el poder no quería que supieran.",
    lugar: { nombre: "Centro Cultural Universitario Tlatelolco", barrio: "Ciudad de México", nota: "Cuando vayas a México: el memorial del 68 en Tlatelolco es uno de los espacios más honestos que tiene la ciudad. Llevar tiempo. No se hace en diez minutos." },
    hecho: "Elena Poniatowska documentó la masacre en 'La noche de Tlatelolco' (1971), con testimonios directos. Es considerado uno de los libros de periodismo más importantes en lengua española del siglo XX. Tardó tres años en recopilar los testimonios.",
    pensamiento: "El 2 de octubre de 1968, diez días antes de los Juegos Olímpicos de México, el ejército disparó contra estudiantes en la Plaza de las Tres Culturas. El número de muertos sigue siendo disputado: entre 25 y 300, según la fuente. El gobierno nunca lo reconoció completamente. La memoria en México también es disputa política.",
    pregunta: "¿Qué verdad de tu país prefieres no saber?",
    teaser: "Mañana: lo que el mezcal no dijo pero el agave sí sabe.",
    variants: {
      visual: {
        pensamiento: "En la Plaza de las Tres Culturas de Tlatelolco conviven tres épocas en un solo campo visual: las pirámides tlatelolcas al fondo, el convento de Santiago al centro y los edificios del conjunto Tlatelolco al frente. En ese espacio ocurrió la masacre. Las tres culturas que da nombre a la plaza son también tres capas de un mismo silencio.",
        pregunta: "¿Qué lugar conoces donde la historia es visible en la arquitectura?",
        teaser: "Mañana: el agave y el tiempo que no se acelera.",
      },
      material: {
        pensamiento: "Elena Poniatowska recopiló los testimonios del 68 en grabaciones, cartas y entrevistas. La materia prima del libro fue el papel, la tinta, la voz grabada. El periodismo como trabajo manual de conservación de voces. 'La noche de Tlatelolco' existe porque alguien guardó físicamente lo que el Estado quería destruir.",
        pregunta: "¿Qué has conservado físicamente que de otro modo se habría perdido?",
        teaser: "Mañana: el agave.",
      },
      kinesthetic: {
        pensamiento: "Los sobrevivientes del 2 de octubre describen el mismo sonido: disparos que se confunden con cohetes, la gente que corre, el cuerpo que decide antes de que la mente procese lo que ocurre. El trauma vive en el cuerpo antes de tener nombre. La memoria corporal como el archivo más difícil de borrar.",
        pregunta: "¿Qué recuerdo tienes que vive en el cuerpo antes de estar en las palabras?",
        teaser: "Mañana: el agave y la paciencia.",
      },
      conceptual: {
        pensamiento: "La disputa sobre el número de muertos en Tlatelolco —entre 25 y 300— es también una disputa sobre la autoridad de los hechos. El Estado controla el número; los testimonios dicen otra cosa. La memoria como campo de poder donde el dato nunca es neutral.",
        pregunta: "¿Qué número oficial no te crees y por qué?",
        teaser: "Mañana: el agave como argumento.",
      },
    },
  },
  {
    rotation_key: 29,
    subtitulo: "Lo que el agave sabe",
    color: { nombre: "Verde Agave", hex: "#3D6B3D" },
    nahuatl_word: "Mexcalli",
    nahuatl_meaning: "agave cocido",
    nahuatl_nota: "La raíz del español mezcal. Mex (maguey, agave) y calli (casa, lugar). El mezcal como el lugar donde vive el agave. La bebida como el hogar destilado de la planta.",
    lugar: { nombre: "Barra Tobalá", barrio: "Chueca", nota: "Bar especializado en mezcal artesanal de pequeños productores. Cada botella tiene el nombre del maestro mezcalero y el año de cosecha del agave. Es un vino con raíces más profundas." },
    hecho: "Un agave tobalá silvestre tarda entre 12 y 15 años en madurar. Solo se encuentra en las sierras de Oaxaca por encima de los 1,500 metros de altitud. No se cultiva: se cosecha en el lugar donde creció solo.",
    pensamiento: "El agave no es una planta: es un argumento. Tarda décadas en crecer, florece una sola vez y muere después de dar todo lo que tiene. Los maestros mezcaleros hablan del agave como si fuera un ser con criterio propio. En Oaxaca, cortar un agave joven se considera un error de carácter.",
    pregunta: "¿Qué en tu vida creció sin que nadie lo plantara?",
    teaser: "Mañana: lo que siempre queda pendiente.",
    variants: {
      visual: {
        pensamiento: "El agave maduro tiene una geometría perfecta: hojas en espiral que siguen la secuencia de Fibonacci, espinas exactamente simétricas, el quiote —el tallo floral— que crece en días hasta alcanzar cinco metros. Es la planta que más cambia de forma en el momento de morir.",
        pregunta: "¿Qué forma en la naturaleza encuentras más difícil de creer que no fue diseñada?",
        teaser: "Mañana: lo pendiente.",
      },
      material: {
        pensamiento: "La piña del agave —el corazón que se cuece para hacer mezcal— pesa entre 40 y 200 kilos. Se corta con hacha o con machete, se transporta a burro o a hombros, se cocina en horno de tierra durante días. El mezcal artesanal carga el peso físico de cada uno de esos pasos.",
        pregunta: "¿Cuánto peso físico tiene algo que consumes sin pensarlo?",
        teaser: "Mañana: la pregunta pendiente.",
      },
      kinesthetic: {
        pensamiento: "El maestro mezcalero corta el agave cuando lleva veinte años esperando ese momento. El golpe del machete tiene que ser preciso: demasiado bajo y pierdes fibra, demasiado alto y pierdes azúcar. Décadas de espera y segundos de ejecución. El cuerpo que aprende a actuar en el momento exacto.",
        pregunta: "¿Para qué has esperado mucho tiempo y cómo supiste cuándo actuar?",
        teaser: "Mañana: lo que queda.",
      },
      conceptual: {
        pensamiento: "El agave que florece muere inmediatamente después. Su única flor, su única semilla, su final y su reproducción en un solo acto. Los mexicas llamaban al agave 'las cuatro centenas de dioses' porque veían en él un sistema completo de relaciones entre la vida, la muerte y la continuación.",
        pregunta: "¿Qué has dado completamente sabiendo que no lo recuperarías?",
        teaser: "Mañana: la pregunta que queda.",
      },
    },
  },
  {
    rotation_key: 30,
    subtitulo: "Lo que siempre queda pendiente",
    color: { nombre: "Bronce Cierre", hex: "#8B6914" },
    nahuatl_word: "Ixtlahuatl",
    nahuatl_meaning: "llanura abierta",
    nahuatl_nota: "El espacio que te espera al otro lado. No la ciudad, no el barrio: el territorio que existe antes de que te instales en él. La pertenencia como territorio abierto.",
    lugar: { nombre: "Casa de México en España", barrio: "Serrano, 46", nota: "El lugar que existe para que los mexicanos en Madrid no tengan que elegir entre una cosa y la otra. Ni totalmente aquí ni totalmente allá. Nepantla institucionalizada." },
    hecho: "Se estima que 50,000 mexicanos viven en España, de los cuales aproximadamente 18,000 están en Madrid. Es la comunidad latinoamericana de mayor crecimiento en la capital en los últimos cinco años.",
    pensamiento: "Hay una pregunta que los mexicanos en Madrid se hacen tarde o temprano: ¿me quedo o vuelvo? No es una pregunta sobre geografía: es sobre identidad. Quedarse en Madrid no significa dejar de ser mexicano. Volver no significa no haber cambiado. El país al que vuelves no es exactamente el que dejaste.",
    pregunta: "¿Dónde está tu lugar en el mundo?",
    teaser: "Mañana empieza de nuevo. El Despacho te espera.",
    variants: {
      visual: {
        pensamiento: "El ixtlahuatl —la llanura— es el espacio antes de que la mirada encuentre un punto de referencia. Horizonte sin interrupción. El paisaje de la pregunta abierta. Los mexicanos en Madrid viven en ese horizonte: ni la Ciudad de México ni Madrid como destino definitivo.",
        pregunta: "¿Qué imagen tienes de tu lugar en el mundo?",
        teaser: "Mañana: el Despacho comienza de nuevo.",
      },
      material: {
        pensamiento: "Los objetos que los mexicanos en Madrid guardan de México tienen el mismo peso específico que cuando los trajeron, pero un peso emocional que ha crecido. La fotografía, el chile seco en la maleta, el copal que ya no se puede conseguir igual aquí. Los objetos como medida de la distancia.",
        pregunta: "¿Qué objeto de tu origen llevas contigo y pesa cada vez más?",
        teaser: "Mañana: el Despacho vuelve.",
      },
      kinesthetic: {
        pensamiento: "Volver a México después de años en Madrid es un reajuste corporal: el olor del aire es diferente, la altitud cambia la respiración, el ritmo de la calle no coincide con el que el cuerpo aprendió en Europa. El cuerpo que vivió entre dos ciudades lleva las dos y no pertenece completamente a ninguna.",
        pregunta: "¿Qué ciudad sientes en el cuerpo aunque no estés en ella?",
        teaser: "Mañana: el Despacho sigue.",
      },
      conceptual: {
        pensamiento: "La pregunta '¿me quedo o vuelvo?' no tiene respuesta definitiva porque está mal planteada. No es una elección entre dos lugares: es una negociación constante entre dos versiones de uno mismo. El que se fue y el que hubiera sido si no se hubiera ido son personas distintas que viven en el mismo cuerpo.",
        pregunta: "¿Cuántas versiones posibles de ti mismo puedes identificar?",
        teaser: "Mañana: el Despacho continúa. Como siempre.",
      },
    },
  },
];

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86_400_000);
}

export function getRotationIndex(date: Date = new Date()): number {
  return (getDayOfYear(date) % 30) + 1;
}

export function getDespachoForDate(date: Date = new Date()): DespachoEntry {
  const idx = getRotationIndex(date) - 1;
  return DESPACHOS[idx];
}

export default DESPACHOS;
