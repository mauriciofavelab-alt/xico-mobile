// `lugar_image_url` is the result of `require("@/assets/lugares/<file>.jpg")` ·
// Metro statically resolves that into an opaque numeric handle. The runtime
// type is `number` on native and `{ uri: string; width: number; height: number }`
// on web · Image's `source` prop accepts both shapes. We avoid pulling in the
// RN `ImageSourcePropType` import to keep this constants file
// platform-agnostic (it's imported by widget code that runs outside RN too).
export type LugarImageSource = number | { uri: string; width?: number; height?: number };

export type Despacho = {
  numero: string;
  subtitulo: string;
  color: { nombre: string; hex: string };
  pensamiento: string;
  palabra: { nahuatl: string; español: string; nota: string };
  lugar: { nombre: string; barrio: string; nota: string };
  hecho: string;
  pregunta: string;
  teaser: string;
  /**
   * Per-day full-bleed hero photograph · Phase B (Build #11).
   * `undefined` means no photo authored yet — every consumer must render a
   * gracefully degraded gradient fallback so the screen still reads on a
   * Despacho without a sourced photo. Sources + attribution recorded in
   * `assets/lugares/_credits.json` (see ADR-003).
   */
  lugar_image_url?: LugarImageSource;
};

export const DESPACHOS: Despacho[] = [
  {
    numero: "001",
    subtitulo: "Lo que Madrid tiene sin saberlo",
    color: { nombre: "Ocre Oaxaqueño", hex: "#B5860F" },
    pensamiento: "Madrid colecciona culturas como el Rastro colecciona objetos: sin saber exactamente qué tiene, pero sin querer deshacerse de nada. Esta ciudad lleva décadas acumulando México sin catalogarlo. Hoy nombramos lo que la ciudad ya posee.",
    palabra: { nahuatl: "Nepantla", español: "el espacio entre dos mundos", nota: "No el origen ni el destino: el tránsito mismo. La identidad como movimiento permanente." },
    lugar: { nombre: "Mercado de San Fernando", barrio: "Lavapiés", nota: "Puesto 12. Mole negro elaborado durante dos días. Sin carta de presentación y sin necesitarla." },
    hecho: "31 estados de México tienen representación activa en Madrid en 2026. No es diáspora: es presencia calculada.",
    pregunta: "¿Qué parte de ti vive en Nepantla hoy?",
    teaser: "Mañana: el color que México le regaló a España sin que España lo sepa.",
    lugar_image_url: require("@/assets/lugares/001-mercado-san-fernando.jpg"),
  },
  {
    numero: "002",
    subtitulo: "El color que no se discutió",
    color: { nombre: "Carmín Achiote", hex: "#C0392B" },
    pensamiento: "El rojo de los mantos barrocos en las iglesias de Castilla tiene un origen que nadie discutió en el siglo XVII. Llegó de México en el mismo barco que el chocolate. El achiote tiñó Europa antes de que Europa supiera que lo necesitaba.",
    palabra: { nahuatl: "Tlapalli", español: "color sagrado", nota: "De los tlacuilos, los pintores de códices. No describían el mundo: lo nombraban con color. Ver era pintar." },
    lugar: { nombre: "Iglesia de San Ginés", barrio: "Sol", nota: "Fíjate en el rojo de los mantos. Tiene cuatro siglos y origen mesoamericano. Nadie lo menciona." },
    hecho: "El 40% de los tintes rojos usados en Europa entre los siglos XVI y XVIII provenían de grana cochinilla mexicana. Un insecto de tres milímetros cambió la paleta de un continente.",
    pregunta: "¿Cuántos colores que ves hoy tienen un origen que no conoces?",
    teaser: "Mañana: lo que el cacao era antes de que llegara el azúcar.",
    lugar_image_url: require("@/assets/lugares/002-iglesia-san-gines.jpg"),
  },
  {
    numero: "003",
    subtitulo: "Antes de que llegara el azúcar",
    color: { nombre: "Teobromina Oscura", hex: "#5C3317" },
    pensamiento: "El chocolate que España popularizó en Europa era amargo, picante, y se bebía frío. Los mexicas lo llamaban xocolatl. Cuando los españoles le añadieron azúcar crearon algo nuevo, pero borraron el original. La versión que conoces es la adaptación, no el texto.",
    palabra: { nahuatl: "Xocolatl", español: "agua amarga", nota: "La bebida ritual de los mexicas. No dulce: intensa. No postre: conversación sagrada entre hombres y dioses." },
    lugar: { nombre: "Chocolatería San Ginés", barrio: "Ópera", nota: "Fundada en 1894. El chocolate que sirven tiene el mismo espesor que el azteca: no es bebida, es comida." },
    hecho: "Los aztecas usaban granos de cacao como moneda. Un esclavo valía 100 granos. Una canoa, 50. El chocolate era literalmente dinero.",
    pregunta: "¿Cuántas cosas consumes hoy que son radicalmente distintas de lo que fueron en origen?",
    teaser: "Mañana: el árbol que lleva dos mil años en el mismo sitio.",
    lugar_image_url: require("@/assets/lugares/003-chocolateria-san-gines.jpg"),
  },
  {
    numero: "004",
    subtitulo: "El árbol que es un testigo",
    color: { nombre: "Verde Centenario", hex: "#2D5A3D" },
    pensamiento: "En México, el ahuehuete —el viejo del agua— puede vivir más de dos mil años. El de Santa María del Tule, en Oaxaca, tiene doce metros de diámetro. En Mesoamérica los árboles no son decoración: son memoria viva. Un árbol que vio caer Tenochtitlán sigue en pie.",
    palabra: { nahuatl: "Ahuehuetl", español: "el viejo del agua", nota: "Árbol sagrado del pueblo mexica. En el Parque de Chapultepec hay ejemplares que vieron el fin del mundo conocido. Siguen ahí." },
    lugar: { nombre: "Jardín Botánico del Retiro", barrio: "El Retiro", nota: "Busca la colección de coníferas. Hay un ciprés que tiene la misma forma vertical que el ahuehuete. Primos que no se conocen." },
    hecho: "El árbol del Tule en Oaxaca tiene aproximadamente 2,000 años y es el árbol con mayor circunferencia del mundo: 58 metros. Ha visto más historia que cualquier monumento de Madrid.",
    pregunta: "¿Cuánto tiempo tiene la cosa más antigua que has tocado hoy?",
    teaser: "Mañana: la ciudad que se construyó sobre el agua y sigue hundiéndose.",
    lugar_image_url: require("@/assets/lugares/004-jardin-botanico-retiro.jpg"),
  },
  {
    numero: "005",
    subtitulo: "La ciudad que era un lago",
    color: { nombre: "Azul Lacustre", hex: "#1A4A6E" },
    pensamiento: "Ciudad de México se construyó sobre los restos de Tenochtitlán, que se construyó sobre un lago. El Centro Histórico se hunde entre 15 y 30 centímetros por año porque la ciudad pesa sobre agua que no pudo drenar. Madrid nunca tuvo que elegir entre el lago y la ciudad. CDMX elige cada día.",
    palabra: { nahuatl: "Atzintli", español: "en el agua", nota: "El sufijo que indica origen acuático en los topónimos mexicas. Aztlán, Tenochtitlán. El origen es siempre agua. Siempre movimiento." },
    lugar: { nombre: "Museo Nacional de Antropología", barrio: "Castellana", nota: "La sala mexica tiene una maqueta de Tenochtitlán. Nadie que la ve puede imaginar que debajo de CDMX existe ese plano completo." },
    hecho: "El Centro Histórico de Ciudad de México se hunde hasta 30 cm por año en algunas zonas. Es uno de los hundimientos urbanos más acelerados del planeta. La ciudad construida sobre el agua paga su deuda.",
    pregunta: "¿Qué está debajo del suelo donde vives?",
    teaser: "Mañana: el primer alimento sagrado que alimenta a dos mil millones de personas.",
    lugar_image_url: require("@/assets/lugares/005-museo-antropologia.jpg"),
  },
  {
    numero: "006",
    subtitulo: "El primer alimento sagrado",
    color: { nombre: "Amarillo Maíz", hex: "#D4A820" },
    pensamiento: "El maíz no es un cultivo: es una creación. Nadie sabe de qué planta silvestre desciende exactamente porque fue creado por el ser humano hace 9,000 años en el valle de Tehuacán. Lo que comes hoy no existe en la naturaleza sin nosotros. Fue diseñado.",
    palabra: { nahuatl: "Tlayolli", español: "maíz desgranado", nota: "La base. Lo que queda cuando se separa la planta del grano. Lo esencial sin el ornamento. El núcleo de una civilización en una semilla." },
    lugar: { nombre: "La Lucerna", barrio: "Chueca", nota: "Tlayudas oaxaqueñas auténticas. El comal está importado de Oaxaca. El maíz viene del mismo valle donde se cultivó por primera vez." },
    hecho: "México es el centro de diversidad genética del maíz con más de 59 razas nativas. Ningún país en el mundo tiene más variedades de un cultivo tan fundamental. Es un banco genético vivo.",
    pregunta: "¿Qué parte de tu dieta diaria vino de México sin que lo supieras?",
    teaser: "Mañana: la institución más antigua de América que Madrid no ha podido replicar.",
    lugar_image_url: require("@/assets/lugares/006-la-lucerna.jpg"),
  },
  {
    numero: "007",
    subtitulo: "La democracia sin elecciones",
    color: { nombre: "Terracota Mercado", hex: "#8B4513" },
    pensamiento: "El tianguis prehispánico funcionaba sin moneda oficial, sin propiedad privada registrada y sin horario fijo. La gente llegaba cuando podía. Los mercados de Madrid tienen la misma energía que los de Oaxaca: el intercambio no es solo de mercancía. Es de presencia.",
    palabra: { nahuatl: "Tianguis", español: "mercado", nota: "Del náhuatl tianquiztli. Uno de los pocos préstamos léxicos que sobrevivió en el español de México sin traducción. La palabra resistió la conquista." },
    lugar: { nombre: "Mercado de La Paz", barrio: "Salamanca", nota: "Menos turístico que La Boquería. El pescado llega de Huelva y hay un puesto de mezcal en la entrada que abre a las diez." },
    hecho: "En México se celebran más de 50,000 tianguis semanales. El Mercado de La Merced en CDMX ocupa 63,000 m² y mueve más productos en un día que algunos aeropuertos en una semana.",
    pregunta: "¿Cuándo fue la última vez que compraste algo mirando a los ojos de quien lo hizo?",
    teaser: "Mañana: lo que la muerte no cancela.",
    lugar_image_url: require("@/assets/lugares/007-mercado-la-paz.jpg"),
  },
  {
    numero: "008",
    subtitulo: "Lo que la muerte no cancela",
    color: { nombre: "Naranja Cempasúchil", hex: "#E05A00" },
    pensamiento: "El Día de Muertos no es el Halloween mexicano. Es una cosmovisión entera comprimida en dos días: la creencia de que los muertos regresan porque los vivos los llaman. La ofrenda no es decoración. Es una conversación con alguien que ya no puede responder de la manera usual.",
    palabra: { nahuatl: "Miquiztli", español: "muerte", nota: "También el nombre del decimosexto día del calendario azteca. La muerte como dato calendárico, no como tragedia. El tiempo incluye lo que termina." },
    lugar: { nombre: "Casa de México en España", barrio: "Serrano, 46", nota: "La ofrenda de noviembre suele ser la instalación más visitada del año. Y la más silenciosa. El silencio también es conversación." },
    hecho: "El Día de Muertos de 2024 en Madrid reunió a más de 40,000 personas en el Cementerio Civil. Es la celebración mexicana más grande fuera de México. La flor de cempasúchil tardó un mes en llegar desde Puebla.",
    pregunta: "¿A quién llamarías si creyeras que pudiera escucharte?",
    teaser: "Mañana: la música que nació en un puerto y llegó a dos continentes.",
    lugar_image_url: require("@/assets/lugares/008-casa-de-mexico.jpg"),
  },
  {
    numero: "009",
    subtitulo: "Cuando la música no tiene dueño",
    color: { nombre: "Azul Veracruz", hex: "#0B5E8F" },
    pensamiento: "El son jarocho nació en Veracruz del encuentro entre la música española, la africana y la indígena. Las fandangas, las reuniones donde se toca y canta, siguen siendo abiertas: cualquiera puede sumarse. La música que no tiene propietario no puede cerrar.",
    palabra: { nahuatl: "Fandango", español: "reunión bulliciosa", nota: "La palabra española posiblemente tiene raíz náhuatl. O la náhuatl tiene raíz española. El origen ya no importa: importa que nadie pide invitación." },
    lugar: { nombre: "La Corrala", barrio: "Lavapiés", nota: "Los jueves hay fandangos de son jarocho. Madrid lleva cinco años con esta tradición y todavía no aparece en ninguna guía." },
    hecho: "'La Bamba' de Ritchie Valens (1958) es una versión del son jarocho La Bamba Jarocha. El original lleva 200 años. La versión de 1958 llegó al número 1 en Estados Unidos. El original nunca salió de Veracruz.",
    pregunta: "¿Qué tienes que fue creado por nadie y pertenece a todos?",
    teaser: "Mañana: la escritura que el cuerpo lleva puesta.",
    lugar_image_url: require("@/assets/lugares/009-la-corrala.jpg"),
  },
  {
    numero: "010",
    subtitulo: "La escritura que el cuerpo lleva",
    color: { nombre: "Índigo Oaxaqueño", hex: "#2E1B69" },
    pensamiento: "Los textiles zapotecos de Oaxaca son una escritura que los arqueólogos todavía están aprendiendo a leer. Los colores no son decorativos: indican lugar de origen, estado civil, afiliación comunitaria. Una mujer de Teotitlán del Valle lleva su historia en la ropa.",
    palabra: { nahuatl: "Quachtli", español: "tela de algodón", nota: "En la economía mexica, la tela era moneda. El valor no era abstracto: era textil. Cada pieza era un argumento." },
    lugar: { nombre: "Tienda artesanal Casa de México", barrio: "Serrano, 46", nota: "Hay mantas zapotecas auténticas. Cada diseño tiene un nombre y un origen geográfico preciso. No es artesanía genérica." },
    hecho: "Teotitlán del Valle, Oaxaca, produce alfombras de lana con tintes naturales desde hace 2,500 años. El proceso no ha cambiado sustancialmente. Cada pieza requiere entre una semana y tres meses.",
    pregunta: "¿Qué lleva tu ropa de hoy que no pusiste tú?",
    teaser: "Mañana: el destilado que no pide permiso.",
    lugar_image_url: require("@/assets/lugares/010-tienda-casa-mexico.jpg"),
  },
  {
    numero: "011",
    subtitulo: "El destilado que no pide permiso",
    color: { nombre: "Ámbar Mezcal", hex: "#D4900A" },
    pensamiento: "El mezcal no es tequila. El tequila es un mezcal de una sola variedad de agave, de una sola región, regulado industrialmente desde 1974. El mezcal es de cualquier agave, de cualquier estado, hecho como cada maestro juzga. La diferencia no es de sabor: es de filosofía.",
    palabra: { nahuatl: "Metl", español: "agave", nota: "La planta sagrada. Los mexicas la llamaban 'las cuatro centenas de dioses'. Tiene 200 variedades con uso conocido. La mayoría aún sin nombre científico." },
    lugar: { nombre: "Bar Brutal", barrio: "Malasaña", nota: "La carta de mezcales más completa de Madrid. Tobaziche, cuishe, tepeztate. Variedades que tardan 25 años en madurar y se usan una sola vez." },
    hecho: "El agave tepeztate tarda entre 25 y 35 años en madurar antes de poder destilarse. Se cosecha una sola vez en toda su vida. Un mezcal de tepeztate es el resultado de tres décadas de espera.",
    pregunta: "¿Qué en tu vida requiere espera y no se puede acelerar?",
    teaser: "Mañana: el arquitecto que construyó con luz.",
    lugar_image_url: require("@/assets/lugares/011-bar-brutal.jpg"),
  },
  {
    numero: "012",
    subtitulo: "La casa que era una idea",
    color: { nombre: "Magenta Gilardi", hex: "#9C1A47" },
    pensamiento: "Luis Barragán construyó la Casa Gilardi en 1976 con una piscina interior magenta. Los muros son amarillo y azul. La luz entra controlada, calculada, como si el sol fuera un material más. Barragán no diseñaba casas: diseñaba experiencias de luz atrapada.",
    palabra: { nahuatl: "Tlapanhuia", español: "el que pinta de rojo", nota: "De tlapalli (color) y huia (hace). El nombre que los tlacuilos daban a los maestros del color. Barragán hubiera sido tlacuilo." },
    lugar: { nombre: "Fundación Juan March", barrio: "Castelló", nota: "Tienen fotografías de los interiores de Barragán en archivo. La escala de los colores hace pensar en México dentro de Madrid." },
    hecho: "La Casa Barragán fue declarada Patrimonio de la Humanidad por la UNESCO en 2004. Es la única casa del siglo XX en México con esa distinción. Tiene 250 m². El tamaño no importaba.",
    pregunta: "¿Qué espacio has habitado que te cambió sin que lo notaras en el momento?",
    teaser: "Mañana: la fotógrafa que convirtió la dignidad en técnica.",
    lugar_image_url: require("@/assets/lugares/012-fundacion-juan-march.jpg"),
  },
  {
    numero: "013",
    subtitulo: "La mirada que no pide disculpas",
    color: { nombre: "Plata Fotográfica", hex: "#8A8A9A" },
    pensamiento: "Graciela Iturbide fotografió a las mujeres zapotecas de Juchitán durante años antes de publicar una sola imagen. No llegó y disparó: llegó, vivió, escuchó. Sus fotografías no documentan: revelan. La diferencia entre el fotógrafo de paso y el testigo que permanece.",
    palabra: { nahuatl: "Ixiptla", español: "imagen sagrada", nota: "En la religión mexica la imagen no era una copia: era una presencia. La representación convocaba lo representado. Cada foto de Iturbide convoca." },
    lugar: { nombre: "PhotoEspaña", barrio: "Varios espacios, junio", nota: "El festival tiene siempre fotógrafos latinoamericanos. Los de México suelen ser los más radicales en la elección del tema y del sujeto." },
    hecho: "Graciela Iturbide ganó el Premio Princesa de Asturias de las Artes 2025. Tiene 82 años y sigue fotografiando. Su archivo contiene más de 40,000 negativos. Ha publicado 12 libros.",
    pregunta: "¿A quién has querido fotografiar sin atreverte a hacerlo?",
    teaser: "Mañana: el arte que salió a la calle antes de que la calle lo pidiera.",
    lugar_image_url: require("@/assets/lugares/013-photoespana.jpg"),
  },
  {
    numero: "014",
    subtitulo: "El arte que salió a la calle",
    color: { nombre: "Rojo Rivera", hex: "#C41E3A" },
    pensamiento: "El muralismo mexicano fue la primera vez en la historia del arte moderno que pintores de primer nivel eligieron las paredes públicas sobre los museos privados. Diego Rivera, Orozco, Siqueiros: no pintaron para coleccionistas. Pintaron para los que trabajaban debajo de las imágenes.",
    palabra: { nahuatl: "Tlacuilo", español: "el que pinta y escribe", nota: "Los pintores de códices prehispánicos no separaban escritura de imagen: todo era tlacuilolli. El mural es el códice del siglo XX." },
    lugar: { nombre: "Museo Reina Sofía", barrio: "Atocha", nota: "La colección tiene artistas mexicanos desde los muralistas hasta contemporáneos. La sala latinoamericana es la más subestimada del museo." },
    hecho: "El mural 'Sueño de una tarde dominical en la Alameda Central' de Rivera mide 15 metros de largo. Tardó cuatro años. Fue trasladado a un nuevo museo sin moverlo: construyeron el edificio a su alrededor.",
    pregunta: "¿Qué quieres decir en voz alta que solo te has atrevido a decir en privado?",
    teaser: "Mañana: el idioma que hablas sin saber que lo hablas.",
    lugar_image_url: require("@/assets/lugares/014-reina-sofia.jpg"),
  },
  {
    numero: "015",
    subtitulo: "El idioma que hablas sin saberlo",
    color: { nombre: "Verde Jade", hex: "#2D6A4F" },
    pensamiento: "El español tiene más de 1,500 palabras de origen náhuatl. No solo chocolate y tomate: también aguacate, chicle, chile, copal, papalote. Hablas náhuatl varias veces al día sin saberlo. El idioma de Moctezuma sobrevivió a la conquista escondiéndose dentro del conquistador.",
    palabra: { nahuatl: "Tomatl", español: "fruto redondo con ombligo", nota: "El tomate. No viene de Italia: viene de Mesoamérica. Italia lo adoptó en el siglo XVIII y lo convirtió en su identidad nacional. El origen fue otro." },
    lugar: { nombre: "Real Academia Española", barrio: "El Retiro", nota: "El Diccionario de Americanismos está disponible en línea. Busca cualquier palabra que crees que es puramente española y encuentra su raíz náhuatl." },
    hecho: "El náhuatl es hablado por aproximadamente 1.7 millones de personas en México hoy. Es la lengua indígena más hablada del país. Tiene escritura moderna, gramática formalizada y literatura contemporánea.",
    pregunta: "¿Qué parte de ti viene de donde no crees?",
    teaser: "Mañana: el límite que se movió sin que nadie votara.",
    lugar_image_url: require("@/assets/lugares/015-real-academia-espanola.jpg"),
  },
  {
    numero: "016",
    subtitulo: "El límite que se movió",
    color: { nombre: "Arena Fronteriza", hex: "#C4A55A" },
    pensamiento: "Hasta 1848, Texas, California, Arizona, Nuevo México y Colorado eran México. El Tratado de Guadalupe Hidalgo cedió el 55% del territorio mexicano a Estados Unidos. 'No cruzamos la frontera: la frontera nos cruzó' —dicen los chicanos. En Madrid la frontera también existe, pero es invisible.",
    palabra: { nahuatl: "Nahuatlato", español: "el intérprete", nota: "En la conquista, los nahuatlatos vivían en los dos lados de la frontera. La frontera siempre necesita a alguien que entienda ambos mundos para funcionar." },
    lugar: { nombre: "Museo de América", barrio: "Moncloa", nota: "La sala de la conquista tiene objetos de ambos lados: español y mexica. La vitrina no toma partido. El visitante sí, quiera o no." },
    hecho: "El Tratado de Guadalupe Hidalgo fue firmado en 1848 en el pueblo de Guadalupe Hidalgo, hoy parte de Ciudad de México. México perdió más de 1.3 millones de km² en un solo documento.",
    pregunta: "¿Qué límite tuyo es real y cuál es una historia que te contaron?",
    teaser: "Mañana: la megalópolis que no pide disculpas por su tamaño.",
    lugar_image_url: require("@/assets/lugares/016-museo-de-america.jpg"),
  },
  {
    numero: "017",
    subtitulo: "La ciudad que no pide disculpas",
    color: { nombre: "Gris Concreto", hex: "#5A5A6E" },
    pensamiento: "Ciudad de México tiene 22 millones de personas y sigue siendo la ciudad más caótica, más viva, más contradictoria y más creativa de América Latina. Los mejores restaurantes del continente están ahí. La mejor arquitectura nueva. La ciudad no apologiza por su tamaño: lo usa.",
    palabra: { nahuatl: "Altepetl", español: "ciudad", nota: "Literalmente: agua-montaña. Para los mexicas, una ciudad no se definía por sus edificios sino por sus recursos naturales. El agua primero. Siempre el agua primero." },
    lugar: { nombre: "Galería Elvira González", barrio: "Salamanca", nota: "Representa artistas mexicanos en Madrid. Programa exposiciones que mezclan CDMX con Europa sin hacer de ello un evento multicultural. Es simplemente arte." },
    hecho: "Ciudad de México tiene más de 150 museos, más museos per cápita que cualquier otra ciudad del mundo. La ciudad construida sobre un lago acumula más cultura por m² que cualquier capital europea.",
    pregunta: "¿Qué ciudad te ha cambiado más y por qué no hablas de ello?",
    teaser: "Mañana: el escritor que escribió dos libros y cambió una literatura entera.",
    lugar_image_url: require("@/assets/lugares/017-galeria-elvira-gonzalez.jpg"),
  },
  {
    numero: "018",
    subtitulo: "El silencio como método",
    color: { nombre: "Beige Polvoriento", hex: "#C8B89A" },
    pensamiento: "Juan Rulfo escribió dos libros en toda su vida: El Llano en llamas (1953) y Pedro Páramo (1955). Con ellos cambió la literatura latinoamericana. García Márquez dijo que los memorizó completos antes de escribir Cien años de soledad. Rulfo no publicó más. Sabía cuándo había terminado.",
    palabra: { nahuatl: "Tequitl", español: "trabajo y tributo", nota: "Para los mexicas, el trabajo no era opuesto al descanso: era una forma de relación con lo sagrado. Hacer y dar al mismo tiempo. Rulfo tardó lo que tardó." },
    lugar: { nombre: "Librería La Central del Reina Sofía", barrio: "Atocha", nota: "Tienen Pedro Páramo en la edición de aniversario de la UNAM. Es el libro que más se regala entre mexicanos en Madrid. Cabe en un bolsillo." },
    hecho: "Pedro Páramo fue rechazado por varios editores antes de publicarse en 1955. Hoy está traducido a más de 40 idiomas y es considerado uno de los diez mejores libros en español del siglo XX. Tiene 128 páginas.",
    pregunta: "¿Qué has dejado incompleto que en realidad ya está terminado?",
    teaser: "Mañana: la pintora que hizo del cuerpo un territorio.",
    lugar_image_url: require("@/assets/lugares/018-libreria-reina-sofia.jpg"),
  },
  {
    numero: "019",
    subtitulo: "El cuerpo como territorio",
    color: { nombre: "Cobalto Kahlo", hex: "#1A3D8A" },
    pensamiento: "Frida Kahlo pintó 55 autorretratos de los 143 cuadros que terminó. No era narcisismo: era metodología. 'Me pinto porque soy el tema que mejor conozco', dijo. El cuerpo como único territorio inviolable. La pintura como el único lenguaje sin intermediarios posibles.",
    palabra: { nahuatl: "Xochitl", español: "flor", nota: "El nombre que aparece en las trenzas de Frida. Sus flores no son decorativas: son referencias a la flora sagrada mexica. Cada elemento de sus cuadros tiene peso." },
    lugar: { nombre: "Círculo de Bellas Artes", barrio: "Gran Vía", nota: "Las exposiciones sobre arte mexicano suelen incluir a Kahlo. La última mostró sus autorretratos junto a radiografías médicas de su columna. El cuerpo como documento." },
    hecho: "'Dos Fridas' (1939) se pintó el año del divorcio de Rivera. Mide 173 × 173 cm. Es el más grande que pintó. Un año de dolor convertido en el lienzo más ambicioso de su carrera.",
    pregunta: "¿Qué dolor tuyo todavía no has convertido en algo?",
    teaser: "Mañana: el ingrediente que cambió la cocina de un continente sin que ese continente lo sepa.",
    lugar_image_url: require("@/assets/lugares/019-circulo-bellas-artes.jpg"),
  },
  {
    numero: "020",
    subtitulo: "El sabor que no tiene traducción",
    color: { nombre: "Rojo Chile", hex: "#CC3300" },
    pensamiento: "El chile llegó a Europa después de 1492 y sustituyó al caro azafrán y la pimienta en la cocina popular española en cincuenta años. El pimentón de La Vera que define la cocina extremeña viene de un chile mexicano criado en un monasterio. El chile español se olvidó de México.",
    palabra: { nahuatl: "Chilli", español: "el que pica", nota: "Una de las 15 palabras náhuatl que entraron directamente al inglés. En inglés: chili. En español: chile. En ambos casos México habla sin que nadie lo cite." },
    lugar: { nombre: "Taberna Carmencita", barrio: "Malasaña", nota: "El pimentón de La Vera que usan en sus guisos tiene el mismo linaje que el chile ancho oaxaqueño. Nadie en el menú lo menciona. Nadie pregunta tampoco." },
    hecho: "El pimiento se cultiva hoy en más de 70 países y es la especia fresca más consumida del mundo. Antes de 1492, Europa no conocía el picante. Todo el sabor picante de la cocina global viene de México y Centroamérica.",
    pregunta: "¿Qué cosa tuya, que ya no reconoces como tuya, empezó siendo de otro?",
    teaser: "Mañana: vivir en dos tiempos al mismo tiempo.",
    lugar_image_url: require("@/assets/lugares/020-taberna-carmencita.jpg"),
  },
  {
    numero: "021",
    subtitulo: "Vivir entre dos relojes",
    color: { nombre: "Plata Meridiana", hex: "#8C8C9C" },
    pensamiento: "En Madrid son las 8 de la mañana. En Ciudad de México son la 1 de la madrugada. Los mexicanos en Madrid viven en dos tiempos: el tiempo donde están y el tiempo de los que aman. Llamar a casa implica calcular. Calcular implica recordar. El amor a distancia es también aritmética temporal.",
    palabra: { nahuatl: "Cahuitl", español: "tiempo", nota: "Literalmente: 'lo que se va'. No el tiempo como contenedor: el tiempo como flujo que ya no tendrás. El náhuatl no tenía concepto del tiempo vacío." },
    lugar: { nombre: "Bar Matos", barrio: "La Latina", nota: "Lunes por la noche. Lleno de mexicanos en Madrid. La conversación oscila entre lo que pasó hoy aquí y lo que pasó ayer allá. Dos tiempos, una mesa." },
    hecho: "El desfase horario entre Madrid y Ciudad de México varía entre 6 y 7 horas según la época del año. Los mexicanos en Madrid son, según estudios de adaptación, el grupo que más tarda en regularizar su ciclo de sueño.",
    pregunta: "¿En qué momento del día piensas en alguien que está en otro huso horario?",
    teaser: "Mañana: el material que viene del volcán y corta más que el bisturí.",
    lugar_image_url: require("@/assets/lugares/021-bar-matos.jpg"),
  },
  {
    numero: "022",
    subtitulo: "El material que viene del volcán",
    color: { nombre: "Negro Obsidiana", hex: "#1A1A2E" },
    pensamiento: "La obsidiana es vidrio volcánico. Los mexicas la usaban para espejos, cuchillos y ornamentos rituales. El espejo de obsidiana de Tezcatlipoca —el dios del espejo humeante— era el objeto con el que los sacerdotes veían el futuro. Ver el porvenir en un espejo negro.",
    palabra: { nahuatl: "Itzli", español: "obsidiana", nota: "En náhuatl, la obsidiana era también el nombre de una deidad. El material y el dios tenían el mismo nombre. Lo sagrado era concreto, táctil, volcánico." },
    lugar: { nombre: "Museo Nacional de Ciencias Naturales", barrio: "Almagro", nota: "Tienen muestras de obsidiana volcánica. La diferencia entre la de Teotihuacán y la de Jalisco es visible a simple vista: cada volcán tiene su color." },
    hecho: "La obsidiana tiene un filo 10 veces más delgado que la hoja de bisturí más afilada. Algunos cirujanos modernos usan escalpelos de obsidiana para incisiones de precisión máxima. La tecnología prehistórica supera a la moderna.",
    pregunta: "¿Qué ves cuando te miras en un espejo que no quieres ver?",
    teaser: "Mañana: el estado que tiene 16 idiomas distintos y una sola cocina sin igual.",
    lugar_image_url: require("@/assets/lugares/022-museo-ciencias-naturales.jpg"),
  },
  {
    numero: "023",
    subtitulo: "El estado que no necesita capital",
    color: { nombre: "Amarillo Copal", hex: "#E8A020" },
    pensamiento: "Oaxaca tiene 16 grupos étnicos, 8 regiones con cocinas distintas, el mezcal y el chocolate, los textiles más sofisticados del continente y la única ciudad en México que no creció hacia afuera: creció hacia adentro. Cada barrio es un pueblo. La ciudad se intensificó sin expandirse.",
    palabra: { nahuatl: "Zapoteca", español: "los del lugar del zapote", nota: "Los mixtecos les daban otro nombre. Los españoles usaron el náhuatl. El nombre que te dan siempre viene del que tiene más poder. Los zapotecas se llaman a sí mismos 'Ben'Zaa'." },
    lugar: { nombre: "Mercado de Antón Martín", barrio: "Lavapiés", nota: "Hay un puesto oaxaqueño que vende tlayudas, tasajo y chapulines. No hay señal exterior. Solo los que saben lo encuentran. Así debe ser." },
    hecho: "Oaxaca tiene más de 35 razas nativas de maíz, la mayor biodiversidad de maíz del mundo. También tiene el mayor número de lenguas indígenas activas de México: 16 familias lingüísticas con más de 150 variantes.",
    pregunta: "¿Qué lugar conoces que nadie necesita saber que existe para que exista?",
    teaser: "Mañana: el incienso que abre el espacio antes de que llegues.",
    lugar_image_url: require("@/assets/lugares/023-mercado-anton-martin.jpg"),
  },
  {
    numero: "024",
    subtitulo: "El incienso que abre el espacio",
    color: { nombre: "Ámbar Copal", hex: "#D4780A" },
    pensamiento: "El copal es una resina que se quema en rituales mexicas desde hace 3,000 años. Los sacerdotes lo usaban para 'abrir' el espacio antes de una ceremonia. El humo sube, el tiempo cambia. La aromaterapia moderna redescubrió lo que Mesoamérica sabía: los olores cambian los estados interiores.",
    palabra: { nahuatl: "Copalli", español: "incienso", nota: "La raíz del español copal. Es posible que la palabra llegara a España antes de que España conociera el producto. El nombre viajó solo, adelantándose a la cosa." },
    lugar: { nombre: "Tienda Copal", barrio: "Malasaña", nota: "Venden copal oaxaqueño en bloques. El olor es inconfundible: tierra, resina, algo antiguo. Abre a las 11. El barrio huele diferente cuando la tienda está abierta." },
    hecho: "El copal fue uno de los primeros productos americanos en llegar a Europa tras la conquista. Los farmacéuticos españoles del siglo XVI lo documentaron como antiséptico y como regulador del estado de ánimo.",
    pregunta: "¿Qué olor te transforma sin que lo decidas?",
    teaser: "Mañana: los artistas que hacen arte de México sin hacer 'arte mexicano'.",
    lugar_image_url: require("@/assets/lugares/024-tienda-copal.jpg"),
  },
  {
    numero: "025",
    subtitulo: "Sin disculpas y sin etiquetas",
    color: { nombre: "Rosa Mexicano", hex: "#E91E8C" },
    pensamiento: "Gabriel Orozco, Francis Alÿs, Teresa Margolles: los artistas mexicanos más reconocidos mundialmente no hacen 'arte mexicano'. Hacen arte que parte de México pero no se queda ahí. La identidad como punto de partida, no como destino final. La diferencia entre un artista de su país y un artista en el mundo.",
    palabra: { nahuatl: "Itztli", español: "noche de obsidiana", nota: "El nombre que Abraham Cruzvillegas dio a una serie de esculturas. Los artistas mexicanos usan el náhuatl como gesto crítico: la lengua que la conquista no pudo borrar por completo." },
    lugar: { nombre: "Reina Sofía", barrio: "Atocha", nota: "La sala latinoamericana de la colección permanente es la más subestimada del museo. Los artistas mexicanos contemporáneos están ahí, junto a los muralistas, como un solo argumento." },
    hecho: "Gabriel Orozco estudió en Madrid, en la Escuela de Bellas Artes de San Fernando, antes de convertirse en el artista mexicano más cotizado del mercado secundario global, con obras vendidas por más de 4 millones de dólares.",
    pregunta: "¿Dónde termina el origen de alguien y dónde empieza lo que eligió ser?",
    teaser: "Mañana: el libro de piedra que casi no sobrevivió.",
    lugar_image_url: require("@/assets/lugares/025-reina-sofia-coleccion.jpg"),
  },
  {
    numero: "026",
    subtitulo: "El libro que casi no sobrevivió",
    color: { nombre: "Ocre Códice", hex: "#9C7A2D" },
    pensamiento: "Los códices mexicas no usaban alfabeto: usaban pictogramas, ideogramas y fonogramas mezclados. El sistema era tan complejo que los frailes españoles tardaron décadas en aprenderlo. Fray Bernardino de Sahagún pasó 40 años transcribiéndolos antes de que la corona española lo prohibiera.",
    palabra: { nahuatl: "Amoxtli", español: "libro", nota: "De amatl (papel de corteza de árbol) y oxtli (contenedor). El libro como contenedor de papel. El papel como árbol que continúa. La escritura como árbol que no termina de crecer." },
    lugar: { nombre: "Biblioteca Nacional", barrio: "Paseo de Recoletos", nota: "Tienen una reproducción facsimilar del Códice Tudela, un códice mexica del siglo XVI que llegó a España. El original está en el Museo de América, a diez minutos." },
    hecho: "De los aproximadamente 500 códices prehispánicos que existían en el momento de la conquista, solo 16 sobrevivieron completos. El resto fue quemado por órdenes eclesiásticas. Perdimos más del 96% del conocimiento.",
    pregunta: "¿Qué has destruido sin saber que no tenías derecho a hacerlo?",
    teaser: "Mañana: la música contemporánea que México hace sin pedir permiso.",
    lugar_image_url: require("@/assets/lugares/026-biblioteca-nacional.jpg"),
  },
  {
    numero: "027",
    subtitulo: "Lo que suena cuando no se imita",
    color: { nombre: "Violeta Electroacústico", hex: "#6B2D8B" },
    pensamiento: "La música mexicana contemporánea no es mariachi ni reguetón. Es Natalia Lafourcade combinando huapango con pop. Es Silvana Estrada en guitarra y voz sin adornos. Es Caifanes mezclando post-punk con rock en español. En los años 80, México decidió que no necesitaba imitar Londres: tenía suficiente con ser México.",
    palabra: { nahuatl: "Coyolxauhqui", español: "la de las cascabeles en las mejillas", nota: "La diosa mexica de la luna. También el nombre de un disco fundamental del rock mexicano de los 90. El mito como título. La historia como canción." },
    lugar: { nombre: "Sala Caracol", barrio: "Argüelles", nota: "Programación de indie latinoamericano. Artistas mexicanos en gira pasan por aquí antes de que el circuito grande los encuentre. Es donde la música llega sin escolta." },
    hecho: "Natalia Lafourcade ha ganado 12 Grammy Latinos, más que cualquier artista femenina latinoamericana en la historia del premio. Ha rechazado tres contratos con discográficas estadounidenses.",
    pregunta: "¿Qué música escuchas cuando necesitas volver a ser tú?",
    teaser: "Mañana: la memoria que casi nadie en España conoce.",
    lugar_image_url: require("@/assets/lugares/027-sala-caracol.jpg"),
  },
  {
    numero: "028",
    subtitulo: "Lo que no se perdona",
    color: { nombre: "Negro Tlatelolco", hex: "#0A0A14" },
    pensamiento: "El 2 de octubre de 1968, diez días antes de los Juegos Olímpicos de México, el ejército disparó contra estudiantes en la Plaza de las Tres Culturas. El número de muertos sigue siendo disputado: entre 25 y 300, según la fuente. El gobierno nunca lo reconoció completamente. La memoria en México también es disputa política.",
    palabra: { nahuatl: "Tlamatini", español: "el que sabe las cosas", nota: "El filósofo, el sabio en náhuatl. Los estudiantes de Tlatelolco eran tlamatinime: los que empezaron a saber lo que el poder no quería que supieran." },
    lugar: { nombre: "Centro Cultural Universitario Tlatelolco", barrio: "Ciudad de México", nota: "Cuando vayas a México: el memorial del 68 en Tlatelolco es uno de los espacios más honestos que tiene la ciudad. Llevar tiempo. No se hace en diez minutos." },
    hecho: "Elena Poniatowska documentó la masacre en 'La noche de Tlatelolco' (1971), con testimonios directos. Es considerado uno de los libros de periodismo más importantes en lengua española del siglo XX. Tardó tres años en recopilar los testimonios.",
    pregunta: "¿Qué verdad de tu país prefieres no saber?",
    teaser: "Mañana: lo que el mezcal no dijo pero el agave sí sabe.",
    lugar_image_url: require("@/assets/lugares/028-tlatelolco.jpg"),
  },
  {
    numero: "029",
    subtitulo: "Lo que el agave sabe",
    color: { nombre: "Verde Agave", hex: "#3D6B3D" },
    pensamiento: "El agave no es una planta: es un argumento. Tarda décadas en crecer, florece una sola vez y muere después de dar todo lo que tiene. Los maestros mezcaleros hablan del agave como si fuera un ser con criterio propio. En Oaxaca, cortar un agave joven se considera un error de carácter.",
    palabra: { nahuatl: "Mexcalli", español: "agave cocido", nota: "La raíz del español mezcal. Mex (maguey, agave) y calli (casa, lugar). El mezcal como el lugar donde vive el agave. La bebida como el hogar destilado de la planta." },
    lugar: { nombre: "Barra Tobalá", barrio: "Chueca", nota: "Bar especializado en mezcal artesanal de pequeños productores. Cada botella tiene el nombre del maestro mezcalero y el año de cosecha del agave. Es un vino con raíces más profundas." },
    hecho: "Un agave tobalá silvestre tarda entre 12 y 15 años en madurar. Solo se encuentra en las sierras de Oaxaca por encima de los 1,500 metros de altitud. No se cultiva: se cosecha en el lugar donde creció solo.",
    pregunta: "¿Qué en tu vida creció sin que nadie lo plantara?",
    teaser: "Mañana: lo que siempre queda pendiente.",
    lugar_image_url: require("@/assets/lugares/029-barra-tobala.jpg"),
  },
  {
    numero: "030",
    subtitulo: "Lo que siempre queda pendiente",
    color: { nombre: "Bronce Cierre", hex: "#8B6914" },
    pensamiento: "Hay una pregunta que los mexicanos en Madrid se hacen tarde o temprano: ¿me quedo o vuelvo? No es una pregunta sobre geografía: es sobre identidad. Quedarse en Madrid no significa dejar de ser mexicano. Volver no significa no haber cambiado. El país al que vuelves no es exactamente el que dejaste.",
    palabra: { nahuatl: "Ixtlahuatl", español: "llanura abierta", nota: "El espacio que te espera al otro lado. No la ciudad, no el barrio: el territorio que existe antes de que te instales en él. La pertenencia como territorio abierto." },
    lugar: { nombre: "Casa de México en España", barrio: "Serrano, 46", nota: "El lugar que existe para que los mexicanos en Madrid no tengan que elegir entre una cosa y la otra. Ni totalmente aquí ni totalmente allá. Nepantla institucionalizada." },
    hecho: "Se estima que 50,000 mexicanos viven en España, de los cuales aproximadamente 18,000 están en Madrid. Es la comunidad latinoamericana de mayor crecimiento en la capital en los últimos cinco años.",
    pregunta: "¿Dónde está tu lugar en el mundo?",
    teaser: "Mañana empieza de nuevo. El Despacho te espera.",
    lugar_image_url: require("@/assets/lugares/030-casa-de-mexico-cierre.jpg"),
  },
];

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86_400_000);
}

export function getDespachoForToday(): Despacho {
  const idx = getDayOfYear(new Date()) % DESPACHOS.length;
  return DESPACHOS[idx];
}

/**
 * Best-effort lookup of a Despacho photo by lugar name. Used by Stop screen
 * + StopCardFeatured to render lugar photography when the API doesn't carry
 * a structured `photo_url` yet. Matching strategy: case-insensitive,
 * accent-insensitive substring match on `lugar.nombre`. Returns the FIRST
 * Despacho whose `lugar.nombre` matches — multiple despachos share venues
 * (e.g. Casa de México appears 3×) but the same photo applies, so the first
 * match is correct. Returns `undefined` when no match is found.
 */
const stripDiacritics = (s: string): string =>
  s.normalize("NFD").replace(/\p{Diacritic}+/gu, "").toLowerCase();

export function findLugarImageByName(name: string | null | undefined): LugarImageSource | undefined {
  if (!name) return undefined;
  const needle = stripDiacritics(name).trim();
  if (!needle) return undefined;
  for (const d of DESPACHOS) {
    if (!d.lugar_image_url) continue;
    const hay = stripDiacritics(d.lugar.nombre);
    // Try exact, then either-direction substring (handles "Reina Sofía" ⇄
    // "Museo Reina Sofía" + "Librería La Central del Reina Sofía").
    if (hay === needle || hay.includes(needle) || needle.includes(hay)) {
      return d.lugar_image_url;
    }
  }
  return undefined;
}
