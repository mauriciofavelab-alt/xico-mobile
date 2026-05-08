-- XICO Supabase seed
-- Run this in the Supabase SQL editor: https://supabase.com/dashboard/project/jrnsodwpdupybxjlzybv/sql
-- This populates all tables with real XICO content.
-- Safe to run multiple times (uses ON CONFLICT DO NOTHING).

-- ─────────────────────────────────────────
-- ARTICLES
-- ─────────────────────────────────────────
INSERT INTO articles (id, slug, is_published, pillar, subcategory, category, tag, title, subtitle, body, author_name, institution, image_key, read_time_minutes, accent_color, featured, published_at)
VALUES

('art-001','cuando-habla-la-luz',true,'portada','Fotografía','PHotoESPAÑA 2025','Fotografía',
'Cuando habla la luz',
'La mirada insobornable de Graciela Iturbide llega a Madrid tras recibir el Premio Princesa de Asturias de las Artes.',
'La cámara nunca mintió a Graciela Iturbide. Durante seis décadas apuntó el objetivo hacia todo lo que México prefería no ver: las mujeres de Juchitán, los muertos de Oaxaca, la frontera con su apocalipsis cotidiano. Y la cámara le devolvió algo verdadero. No siempre cómodo. Siempre verdadero.

Su retrospectiva en Casa de México llega con el peso del Premio Princesa de Asturias de las Artes 2025, el primero que recibe una fotógrafa mexicana. Pero para entender a Iturbide ayuda olvidar los premios. Ayuda detenerse frente a una de sus fotografías durante cinco minutos y preguntarse: ¿qué sabe esta mujer que el resto de nosotros no sabemos?

La primera sala presenta la serie de Juchitán. Cuarenta y siete imágenes realizadas entre 1979 y 1992 en una comunidad de Oaxaca donde las mujeres han tenido siempre un poder económico y social que desafía los relatos habituales sobre México. Iturbide no llegó allí con una tesis. Llegó con una invitación del pintor Francisco Toledo, que era de la región, y se quedó años. Aprendió el mercado, aprendió las fiestas, aprendió los nombres de las mujeres que le permitían fotografiarlas.

Lo que encontró no fue el noble salvaje de la imaginación antropológica. Encontró algo más difícil de fotografiar: mujeres que eran ordinarias y extraordinarias al mismo tiempo. Mujeres que controlaban los mercados y cargaban iguanas en la cabeza no como ritual sino como vida cotidiana. La célebre Nuestra Señora de las Iguanas es una de las imágenes más reproducidas en la historia de la fotografía latinoamericana. Iturbide la hizo en 1979. Dice que no sabía que era una fotografía excepcional cuando la tomó. Dice que solo estaba prestando atención.

Prestar atención es lo más cerca que Iturbide llega de un método. Fotografía despacio, de forma intuitiva, sin un plan definido. Pasó años en Juchitán antes de tener una exposición. Pasó siete años trabajando en su serie sobre el pueblo Seri de Sonora antes de sentir que estaba lista para mostrarse. No trabaja por encargo. Sigue la curiosidad, que es algo diferente.

La segunda sala presenta la serie de la frontera: imágenes realizadas en la línea entre México y Estados Unidos durante los años ochenta, cuando la frontera no era todavía la obsesión política que se convertiría. Muestran migrantes en el desierto, cuerpos en movimiento por el paisaje, la soledad particular de un viaje sin final garantizado. Son fotografías de antes del argumento, y eso les da una claridad que es difícil encontrar en el trabajo documental contemporáneo.

La tercera sala reúne el trabajo de Oaxaca: los cementerios del Día de Muertos, las instalaciones de cráneos pintados, las mujeres del mercado, los chivos, los niños. Estas son las fotografías que hicieron famosa a Iturbide en México, pero han sido malleídas en Europa como exotismo. La propia Iturbide es impaciente con esa lectura. Ha dicho, repetidamente, que no fotografiaba lo exótico. Fotografiaba su país. La diferencia no es semántica.

"Me encanta Casa de México. Me parece maravilloso que dé a conocer nuestro país en España y a todas las personas del resto del mundo. La relación que tiene México con España es muy importante por el mestizaje." — Graciela Iturbide

La muestra fue comisariada por Juan Rafael Coronel Rivera en colaboración con Fomento Cultural Banamex. El catálogo incluye ensayos de Coronel Rivera, del crítico Jean-François Chevrier, y una conversación entre Iturbide y Elena Poniatowska: dos mujeres que han pasado la vida prestando atención a México.',
'Ximena Caraza Campos','Casa de México en España','iturbide-iguanas',8,'magenta',true,'2026-03-01'),

('art-002','la-mitad-del-mundo',true,'cultura','Artes Visuales','Exposición INAH','Arte Mesoamericano',
'La mitad del mundo',
'La mujer en el México indígena: un centenar de piezas mesoamericanas dialogan con el presente en Madrid.',
'La exposición La mitad del mundo. La mujer en el México indígena no fue simplemente una muestra de piezas excepcionales, sino un relato vivo sobre nuestras raíces, nuestras tradiciones y, especialmente, sobre la mujer como portadora de memoria, conocimiento y continuidad cultural.

Organizada junto con el Instituto Nacional de Antropología e Historia y el Gobierno de México, reunimos casi un centenar de piezas provenientes de veinticuatro museos de diferentes regiones de México. La curadora Karina Romero Blanco trazó un recorrido que revelaba la presencia poderosa de lo femenino en la cosmovisión mesoamericana: como madre, diosa, energía vital o cueva primigenia.

La Venus de Tamtoc —monumento 33, cultura tének, 150 d. C.— detuvo el tiempo en una sala. A su lado, vasijas rituales para pulque de la diosa Mayahuel y tablas nierika wixárikas del siglo XXI completaron un diálogo atemporal entre tradición y mirada contemporánea.

Esta exposición fue la más relevante de arte mesoamericano organizada en España hasta la fecha. Formó parte de la conmemoración del Año de la Mujer Indígena, con sedes en el Thyssen-Bornemisza, el Museo Arqueológico Nacional y el Instituto Cervantes.

Lo que hace singular a esta muestra no es la rareza de las piezas sino la honestidad del marco curatorial. Romero Blanco rechazó la tentación del exotismo. Propuso algo más difícil: leer estas figuras de barro y piedra como contemporáneas. Como interlocutoras. Como respuestas a preguntas que todavía no sabemos formular bien.',
'Karina Romero Blanco','Casa de México / INAH','arte-mesoamerica',8,'ochre',false,'2026-01-15'),

('art-003','sello-copil-guia',true,'cultura','Gastronomía','Guía Culinaria','Gastronomía',
'Sello Copil',
'El distintivo a la excelencia en la cocina mexicana en España reconoce ya a cerca de cien restaurantes en Madrid.',
'La gastronomía continuó siendo un eje esencial de las actividades de Casa de México. El Sello Copil, nuestro distintivo a la excelencia en la cocina mexicana en España, reconoce ya a cerca de cien restaurantes, afianzándose como un referente que impulsa altos estándares y promueve una representación respetuosa de nuestras tradiciones culinarias.

El programa Entre Sabores reunió a chefs y cocineras tradicionales en talleres especializados. La segunda edición de México Enlaza – Destilados Mexicanos congregó cerca de medio millar de marcas. Chefmex Gourmet reunió a más de 600 profesionales del sector gastronómico.

El maíz nixtamalizado, la vainilla de Papantla, el mole y los destilados artesanales de Querétaro son solo algunos de los protagonistas de esta revolución culinaria silenciosa. Una revolución que ocurre en los mejores restaurantes de Madrid, noche tras noche, plato a plato.

El Sello Copil no es una guía turística. Es un acto de posición. Dice que hay una diferencia entre un restaurante que sirve comida mexicana y un restaurante que la entiende. Que esa diferencia importa. Que los madrileños merecen saber cuál es cuál.',
'María Elena Torres Ramírez','Casa de México','gastronomia-fina',5,'emerald',false,'2026-02-01'),

('art-004','maestria-popotillo',true,'cultura','Arte Popular','Arte Popular','Hecho a Mano',
'Maestría en Popotillo',
'Martha Patricia García Aguilar preserva la técnica ancestral del teñido con anilinas. Una pieza que es devoción y arte.',
'El Programa de Rescate y Fortalecimiento del Arte Popular Mexicano fue creado para preservar técnicas y procesos mediante el acompañamiento directo a maestras y maestros artesanos: un paso esencial para salvaguardar nuestro patrimonio vivo.

Martha Patricia García Aguilar elabora sus piezas con popotillo teñido con anilinas. Sus obras de la Virgen de Guadalupe desdibujan la línea entre devoción popular y arte contemporáneo. Su trabajo es parte de las 1,500 piezas que conforman la colección más completa de arte popular mexicano fuera de México.

La tienda Hecho a Mano celebró dos ediciones en 2025 —primavera e invierno— con más de 3,500 piezas procedentes de Tlaxcala, Hidalgo, Puebla, Ciudad de México, Querétaro, Michoacán, Guanajuato y Jalisco.

Los 59 talleres acercaron alrededor de 1,200 personas a oficios tradicionales: teñido natural de lana, plata, tapetes de Huamantla, pepenado, tenango, cerámica artística, plumaria, repujado, cestería, chaquira wixárika, grabado y elaboración de velas artesanales.',
'Ximena López Ruiz','Casa de México','artesania-mexicana',5,'cobalt',false,'2026-01-20'),

('art-005','eramos-felices',true,'cultura','Artes Visuales','Arte Contemporáneo','Coleccionismo',
'Éramos felices y no lo sabíamos',
'La Colección Jumex replantea la mirada sobre el arte mexicano de los noventa en el contexto europeo.',
'Comisariada por Ixel Rion Lora, la exposición Éramos felices y no lo sabíamos reunió piezas de veintiocho artistas en video, instalación, fotografía y escultura realizadas entre mediados de los años noventa y principios de la década del 2000.

Ale de la Puente propuso Turbulencias del vacío: dos alfombras, un haz de luz y el sonido del clarinete pulsando al ritmo del vacío y su turbulencia. Minerva Cuevas exhibió Target Shell. Jose Dávila, una pieza sin título que habla del peso de lo que no se nombra.

La muestra mostró un recorrido por la memoria visual de toda una generación, un periodo de búsqueda y experimentación en el que la juventud tomó riesgos y generó nuevas formas de expresión. Arte mexicano que no se exhibe como rareza, sino como parte activa del diálogo cultural europeo.

"Carlos Cuarón dijo de esta casa: nos ayuda a difundir nuestro trabajo y a que lo conozcan bien en España. Somos hermanos."',
'Ixel Rion Lora','Casa de México / Colección Jumex','arte-contemporaneo',5,'magenta',false,'2026-01-10'),

('art-006','altar-de-muertos-octava-edicion',true,'mexico-ahora','Tradición','Tradición y Arte Popular','Día de Muertos',
'El cabaret de los que ya no están',
'Guillermo González diseñó la octava edición del Altar de Muertos: doce catrinas que bailan en terciopelo, esferas de vidrio soplado y lentejuelas.',
'El Altar de Muertos de la Fundación Casa de México es ya, en su octava edición, una de las citas más esperadas del otoño cultural de Madrid. Este año superó los 100,000 visitantes en un solo mes: más que cualquier edición anterior, más que cualquier otra celebración del Día de Muertos en Europa.

Guillermo González lleva ocho años imaginando altares distintos para esta sala. Este año concibió el cabaret de los años cuarenta y cincuenta en la Ciudad de México. El cabaret El Recuerdo. Doce catrinas de tamaño natural que bailan, beben, cantan y continúan divirtiéndose después de la muerte.

Terciopelo negro y granate. Esferas de vidrio soplado. Lentejuelas que brillan bajo la iluminación calculada al milímetro. Cada material elegido con criterio: no para hacer bonito, sino para hacer verdadero.

González trabaja con artesanos de Guanajuato para las figuras de papel maché, con sopladores de vidrio de Jalisco para las esferas, con talleres de bordado de Ciudad de México para los vestuarios. El altar no es una pieza de un solo autor: es una colaboración que atraviesa cuatro estados y más de veinte pares de manos.

"El cabaret era el lugar donde la Ciudad de México procesaba sus alegrías y sus duelos al mismo tiempo. Las catrinas lo saben. Por eso siguen bailando." — Guillermo González

El Día de Muertos tiende un puente simbólico entre el mundo de los vivos y el de los muertos. El cempasúchil guía el camino de regreso. El copal limpia el aire. Los platillos favoritos del difunto le dicen que alguien lo recuerda con suficiente amor para cocinar.

A lo largo del edificio, una selección de la colección de arte popular acompañó el altar: piezas que recuerdan que la muerte en México no es el fin del mundo. Es parte de él.',
'Adriana Vilchis Nava','Casa de México','dia-de-muertos',6,'ochre',true,'2025-11-01'),

('art-007','coreograf-ia',true,'cultura','Artes Escénicas','Artes Escénicas','Danza e IA',
'Coreograf-IA',
'Victoria Riva Palacio combina movimiento humano e inteligencia artificial para recrear la magia y el canto de las aves.',
'La coreógrafa y bailarina Victoria Riva Palacio interpretó Coreograf-IA en Casa de México: una propuesta en la que el movimiento humano y la inteligencia artificial se combinaron para recrear la magia y el canto de las aves.

El resultado no fue tecnología disfrazada de arte. Fue arte que usó la tecnología como músculo. La diferencia es todo. El cuerpo de Palacio trazó trayectorias que la IA aprendía a reconocer, predecir y transformar. Un diálogo entre lo orgánico y lo computado que reveló algo inesperado: la IA no imita; desvía.

Esta propuesta se inscribió dentro de la programación de artes escénicas de la Fundación, que durante 2025 albergó también bailes regionales del Ensamble Folclórico Mexicano, teatro de Jorge Volpi y Cristina Rivera Garza, y pastorelas navideñas coordinadas por Leopoldo Falcón.

En el ámbito de XICO, Coreograf-IA es un recordatorio: la IA no debe dominar la interfaz cultural. Debe mejorar relevancia y orden. El criterio humano sigue siendo el eje.',
'Ana Paula Oviedo Reyes','Casa de México','danza-escena',5,'cobalt',false,'2026-01-05'),

('art-008','becas-casa-de-mexico-2025',true,'portada','Formación','Formación y Talento','Becas',
'Sembrar futuro',
'El Programa de Becas triplicó solicitudes y otorgó un 260% más de becas que en 2024. Prado, Thyssen, Teatro Real.',
'El Programa de Becas Casa de México tiene como objetivo consolidarse como un detonador de oportunidades para el talento mexicano. En 2025, el crecimiento fue notable: la convocatoria triplicó el número de solicitudes, atrayendo perfiles de 31 estados de la República. Se otorgó un 260% más de becas que el año anterior.

La modalidad de Formación Académica colabora con las universidades más reconocidas de España: Complutense, Navarra, Carlos III, IE University, ECAM, MADS. Jóvenes mexicanos formándose en las mejores instituciones de un continente distinto. No como turistas culturales: como profesionales en formación.

La nueva modalidad Desarrollo de Talento fue aún más exigente. Profesionales mexicanos del ámbito cultural con experiencia comprobada, colaborando con el Museo Nacional del Prado, el Thyssen-Bornemisza, el Teatro Real, el MACBA y el Guggenheim Bilbao.

"El Programa de Becas se ha convertido en un puente sólido entre los dos países, no solo en términos académicos, sino también como plataforma para la creación de redes profesionales y culturales."

Este año también comenzó el Programa Mexicouture: tres diseñadoras de moda —Denisse Kuri, Concepción Orvañanos y Arizbeth Fierro— realizaron una estancia en Madrid en el ecosistema creativo español.',
'Luis Fernando Garza Bravo','Casa de México','arte-contemporaneo',6,'emerald',false,'2026-02-15'),

('art-009','destilados-mexicanos-en-madrid',true,'cultura','Gastronomía','México Enlaza','Destilados',
'El alma destilada de México',
'Más de 450 marcas de mezcal, tequila y destilados artesanales toman Madrid. Una cata que es también una declaración de identidad.',
'La segunda edición de México Enlaza – Destilados Mexicanos reunió a más de 450 marcas, distribuidoras, comercializadores y profesionales del sector restaurantero. El propósito: fomentar la distribución, la comercialización y el consumo responsable de bebidas y destilados mexicanos en España.

El mezcal de Oaxaca lleva el humo de tierra quemada. El tequila de Jalisco lleva el agave azul y el sol seco. La Xalte de Colima —flor de sal artesanal— encontró su lugar en la coctelería de autor del chef Roberto Ruiz.

Los destilados mexicanos han llegado a España después de décadas de confusión y olvido. Hoy, los mejores bares de Madrid sirven raicilla, sotol, tepache y kombucha de maíz morado. El sommelier español ya pronuncia "Papalomex" con reverencia.

Chefmex Gourmet completó el ecosistema: más de 600 profesionales del sector restaurantero explorando la diversidad y la riqueza de la cocina mexicana. No como exotismo. Como referencia.',
'Ricardo Salgado Peña','Casa de México','mezcal-destilados',5,'ochre',false,'2025-10-01'),

('art-010','primavera-mariposas-fachada',true,'mexico-ahora','Arte Urbano','Intervención Urbana','Arte e Identidad',
'30,000 flores para la primavera',
'Cristina Faesler y Mateo Holmes cubrieron la fachada de Casa de México con diecisiete mariposas elaboradas con flores vivas.',
'México alberga el 9% de las especies de mariposas conocidas en el planeta. Y para celebrarlo, Cristina Faesler y el arquitecto Mateo Holmes presentaron en la fachada de Casa de México diecisiete mariposas de gran tamaño elaboradas con flores vivas.

La mariposa azufre. El morpho azul. La mariposa cometa. La baronia mexicana. La monarca, viajera incansable que cruza América del Norte. A su alrededor, más de 30,000 flores naturales recrearon la riqueza de los árboles florales mexicanos: la flor de la pasión, la vainilla, la flor de mayo y el vibrante tabachín.

En los pasillos del edificio se exhibió Flora y fauna por manos mexicanas: cuarenta y tres piezas entre nahuales tallados en madera de copal de Oaxaca, baúles y bateas de Guerrero y cerámica de Chiapas, Jalisco, Michoacán y Veracruz.

La primavera de México llegó a Madrid en forma de arte efímero. Las flores se secan. Los colores permanecen.',
'Fernanda Castillo Ortega','Casa de México','artesania-mexicana',4,'emerald',false,'2025-03-20'),

('art-011','mexicouture-moda-contemporanea',true,'cultura','Moda','Diseño de Moda','Moda',
'Mexicouture',
'Denisse Kuri, Concepción Orvañanos y Arizbeth Fierro llevan el diseño mexicano contemporáneo al corazón del ecosistema creativo de Madrid.',
'Tres diseñadoras mexicanas. Una ciudad europea que empieza a entender que la moda también puede ser política cultural. El Programa Mexicouture nació para llevar el diseño mexicano contemporáneo al ecosistema creativo español sin necesidad de explicarlo como curiosidad folclórica.

Denisse Kuri trabaja en la intersección entre artesanía y arquitectura textil. Sus piezas no son ropa; son proposiciones formales. Concepción Orvañanos lleva el teñido natural a la haute couture: índigo de Oaxaca, cochinilla de Tlaxcala, añil de Chiapas. Arizbeth Fierro diseña para el cuerpo que se mueve, que trabaja, que existe en el espacio urbano.

Las tres realizaron una estancia en Madrid dentro del marco del Programa de Becas. No vinieron a aprender de España. Vinieron a mostrar lo que México sabe hacer y aún no se ha visto aquí.

"La moda mexicana no necesita pedir permiso. Necesita espacio. Y ese espacio empieza a existir." — Denisse Kuri',
'Isabel Morales Vega','Casa de México','tela-colores',5,'magenta',false,'2025-09-01'),

('art-012','voces-escena-volpi-rivera',true,'cultura','Literatura','Artes Escénicas','Teatro',
'Las voces que no callan',
'Jorge Volpi y Cristina Rivera Garza llevan la narrativa mexicana más contemporánea a los escenarios de Madrid.',
'Hay algo que el teatro puede hacer que la novela no puede: obligarte a estar presente. Jorge Volpi y Cristina Rivera Garza lo saben. Por eso sus propuestas escénicas en Casa de México no fueron adaptaciones: fueron actos de pensamiento en tiempo real.

Volpi trajo una pieza sobre la memoria histórica y el presente latinoamericano. Rivera Garza —Premio Pulitzer 2024 por la versión en inglés de El invencible verano de Liliana— propuso algo más difícil de clasificar: un texto que se leía, se escuchaba y se veía al mismo tiempo.

La programación de artes escénicas de 2025 fue la más ambiciosa en la historia de Casa de México. Más de 40 funciones. Más de 3,500 espectadores. Una lista de creadoras y creadores que incluía al Ensamble Folclórico Mexicano y pastorelas coordinadas por Leopoldo Falcón.

"Cristina Rivera Garza convierte el escenario en un lugar donde leer es también mirar." — Crítica literaria en La Lectura',
'Diego Restrepo Arévalo','Casa de México','literatura-escritura',6,'cobalt',false,'2026-01-25'),

('art-013','maiz-que-madrid-no-conoce',true,'mexico-ahora','Gastronomía','México Ahora','Gastronomía',
'El maíz que Madrid no conoce',
'La nixtamalización está transformando la escena gastronómica de Madrid. De la tortilla artesanal a la alta cocina: una revolución silenciosa.',
'Madrid lleva años enamorándose de la cocina mexicana. Pero hay un ingrediente que la ciudad todavía no comprende del todo: el maíz. No el maíz de la lata. El maíz vivo, diverso, político. El maíz que es civilización.

La nixtamalización —el proceso de cocer el maíz con cal para liberar sus nutrientes— llegó a Madrid en los últimos tres años de la mano de chefs mexicanos que decidieron no simplificar su cocina. Tortillas azules de maíz criollo. Tlayudas de maíz bolita de Oaxaca. Tamales de maíz cacahuazintle del Estado de México.

El chef Roberto Ruiz fue el primero en llevar la tortilla de maíz nixtamalizado a la alta cocina española. Hoy, una docena de restaurantes certificados con el Sello Copil trabajan con maíces criollos importados directamente de productores en Oaxaca, Jalisco y Puebla.

"Servir una tortilla industrial es mentir sobre México. Servir una tortilla de maíz criollo es un acto político." — Chef en conversación con XICO

La Xalte de Colima encontró su lugar en la coctelería de autor. La vainilla de Papantla perfuma postres en restaurantes con estrella Michelin. Y el mole negro de Oaxaca es ahora tema de conversación en las mejores mesas de la capital española.',
'Alejandra Mota Díaz','XICO Madrid','arte-contemporaneo',5,'emerald',true,'2026-03-10'),

('art-014','cinco-artistas-que-madrid-deberia-conocer',true,'mexico-ahora','Arte Contemporáneo','México Ahora','Arte Contemporáneo',
'Cinco artistas que Madrid debería conocer',
'Una nueva generación de creadoras mexicanas instala su práctica en España. Nombres para seguir ahora.',
'No vinieron a quedarse para siempre. Vinieron a trabajar. Y en ese proceso, sin buscarlo, se convirtieron en parte del tejido cultural de Madrid. Cinco creadoras mexicanas cuya práctica merece atención inmediata.

Fernanda Laguna trabaja la cerámica como si fuera escritura: piezas que cuentan historias sin necesitar un título. Mariana Castillo Deball, seleccionada para representar a México en la Bienal de Venecia, tiene una obra que merece una lectura más lenta, más atenta.

Yolanda Gutiérrez lleva años construyendo instalaciones con materiales naturales que dialogan con la ecología y el tiempo. Paula Flores, diseñadora gráfica, ha creado identidades visuales para algunas de las marcas culturales más interesantes de ambas ciudades. Y Sofía Táboas, cuya propuesta escultórica sobre los materiales industriales sigue siendo una de las más rigurosas de su generación.',
'Valeria Montoya Ríos','XICO Madrid','arte-contemporaneo',6,'magenta',false,'2026-03-05'),

('art-015','la-temporada-que-se-abre',true,'mexico-ahora','Agenda','Agenda Cultural','Agenda',
'La temporada que se abre',
'PHotoESPAÑA 2026, el nuevo ciclo de Jumex en Europa y la agenda de Casa de México: lo que no te puedes perder en Madrid este mes.',
'Marzo llega cargado. Si vives en Madrid y te importa la cultura mexicana contemporánea, este mes tienes excusas de sobra para salir.

PHotoESPAÑA 2026 arranca su convocatoria con dos artistas mexicanas en las secciones oficiales: Flor Garduño y Daniela Edburg. La primera trae un trabajo sobre el cuerpo femenino y la naturaleza que nunca ha tenido una muestra retrospectiva en Europa.

La Colección Jumex confirma que su nuevo programa de exposiciones itinerantes por Europa pasará por Madrid en mayo. El anticipo —tres piezas de Francis Alÿs y una instalación de Abraham Cruzvillegas— se puede ver ya en la galería del Paseo de Recoletos.

Casa de México abre su nueva temporada con Frontera/Border: una exposición fotográfica colectiva sobre la experiencia migratoria entre México y España. Doce fotógrafas. Doce miradas. Una sola pregunta: ¿qué se pierde y qué se gana cuando cruzas un océano?

Y si buscas algo para este fin de semana: la cata de mezcales artesanales en colaboración con México Enlaza vuelve el próximo sábado. Entrada libre con inscripción previa.',
'Sofía Leal Noriega','XICO Madrid','gastronomia-fina',4,'cobalt',true,'2026-03-01'),

('art-016','cine-mexicano-en-europa',true,'cultura','Cine','Cine','Cine',
'La pantalla como frontera',
'Cinco directoras mexicanas cuyo cine llega a Europa este año y redefine lo que significa filmar desde el margen.',
'Hay un cine mexicano que no llega a los multiplex pero que transforma festivales. Este año, cinco directoras consolidan una presencia que ya no puede ignorarse en Europa.

Tatiana Huezo presenta en San Sebastián su tercer largometraje, una coproducción con Dinamarca rodada en Oaxaca. Lila Avilés regresa después del éxito de Tótem con un proyecto documental sobre las mujeres que sostienen los mercados de la Ciudad de México. Fernanda Valadez, cuya Sin señas particulares recorrió treinta festivales, lleva ahora su nueva película directamente a Cannes.

En Madrid, la programación de Casa de México estrena este mes un ciclo dedicado al Nuevo Cine Mexicano: ocho películas, cuatro directoras, cero condescendencia. No son joyas del pasado ni rareza etnográfica. Son obras del presente que hablan sobre migración, cuerpo y poder con una lucidez que el cine europeo todavía está aprendiendo.',
'Sofía Leal Noriega','XICO Madrid','cine-film',5,'cobalt',false,'2026-03-08'),

('art-017','cocinera-sabores-olvidados',true,'cultura','Gastronomía','Cocina Tradicional','Gastronomía',
'La cocinera de los sabores olvidados',
'Doña Esperanza Cruz cruzó el Atlántico con sus semillas de chile pasilla, su comal y cuarenta recetas que nadie más en Madrid sabe preparar.',
'Hay sabores que no caben en un menú de restaurante. Sabores que requieren tiempo, paciencia y el conocimiento que solo se transmite de mano a mano, de generación en generación. Doña Esperanza Cruz los tiene todos.

Llegó a Madrid hace doce años desde Tlaxiaco, Oaxaca, con una maleta pequeña y tres cosas que nadie le pudo quitar en la aduana: sus semillas de chile pasilla negro guardadas en un sobre de papel, su comal de barro y la memoria de cuarenta recetas que no existen en ningún libro.

Sus manos conocen el tiempo exacto del mole negro: cuatro horas de comal, dos de molienda, una de espera. Sabe cuándo el chile pasilla está listo por el olor, no por el reloj. Sabe que la tortilla de maíz criollo bolita tiene que sonar diferente a la de maíz híbrido cuando se palmea. Sabe que el tasajo oaxaqueño se abre con la mano, no con cuchillo, porque el filo del acero cambia la fibra.

Estos conocimientos no están en internet. Están en las manos de unas pocas mujeres que aprendieron de sus madres que aprendieron de las suyas, en una cadena que puede romperse en una generación si nadie la cuida.

"Cocinar aquí es como hablar un idioma que nadie conoce. Pero cuando alguien lo prueba, lo entiende sin necesitar palabras." — Doña Esperanza Cruz

El chef Roberto Ruiz fue el primero en invitarla a cocinar en su restaurante de dos estrellas Michelin, certificado con el Sello Copil. No como demostración folclórica. Como colaboración entre iguales. El resultado fue una cena de diez tiempos que los críticos describieron como la experiencia culinaria más perturbadora y más honesta que habían tenido en años.

Desde entonces, tres cocineras tradicionales más han encontrado espacio en cocinas de alta gama de Madrid. Ninguna tiene una estrella Michelin. Todas tienen algo más difícil: saberes que no se estudian, no se compran y no se replican.

Doña Esperanza sigue cocinando en Lavapiés los martes y los jueves. La lista de espera para su próxima cena en casa tiene cuarenta personas.',
'Alejandra Mota Díaz','XICO Madrid','gastronomia-fina',7,'ochre',false,'2026-03-12'),

('art-018','folclore-no-es-nostalgia',true,'cultura','Artes Escénicas','Danza y Tradición','Folclore Contemporáneo',
'Cuando el folclore no es nostalgia',
'El Ensamble Folclórico Mexicano lleva años demostrando que la danza regional es arte contemporáneo cuando se ejecuta con rigor y honestidad.',
'Hay una trampa en la que cae fácilmente la danza folclórica mexicana fuera de México: volverse postal. El Ensamble Folclórico Mexicano lleva años resistiendo esa trampa.

Su presentación en Madrid fue una demostración de que la danza regional puede ser contemporánea sin perder su raíz. Los trajes de Jalisco, los sones de la Tierra Caliente de Guerrero y la danza de los Viejitos de Michoacán no fueron puestos en escena como museum pieces: fueron presentados como lo que son, prácticas vivas, cambiantes, disputadas.

El director Ernesto Fragoso habló antes de la función sobre la diferencia entre preservar y embalsamar. "Preservar una danza significa seguir bailándola. Embalsamarla significa convertirla en espectáculo turístico." La diferencia, en escena, es inmediata. Se siente en los pies.

El público de Madrid respondió con una ovación que no tenía nada de condescendiente. Reconocieron arte, no curiosidad.',
'Ana Paula Oviedo Reyes','XICO Madrid','danza-escena',5,'cobalt',false,'2026-01-18'),

('art-019','teatro-en-el-umbral',true,'cultura','Artes Escénicas','Teatro','Teatro Mexicano',
'Teatro en el umbral',
'Leopoldo Falcón lleva treinta años construyendo un teatro donde la tradición mexicana y la herencia española se reconocen sin necesitar traducción.',
'Leopoldo Falcón llegó a Madrid en 1994. Treinta años después, nadie en el teatro madrileño lo considera un extranjero. Tampoco lo considera completamente local. Vive en ese umbral que solo habitan quienes han decidido no elegir entre sus dos culturas.

Su propuesta teatral parte siempre del texto, pero termina siempre en el cuerpo. Sus montajes de pastorela han conseguido algo difícil: hacer que el público español encuentre en ellos algo familiar sin que el texto haya sido modificado para explicarles nada.

"El teatro que me interesa no necesita que el espectador sepa de dónde viene. Necesita que lo sienta. Y lo que se siente en una pastorela del siglo XVII o en una del XXI es lo mismo: la ansiedad de la espera, el asombro del nacimiento, la pregunta de si algo nuevo es posible."

En 2025, su Pastorela navideña reunió a más de 1,200 espectadores en Casa de México. Fue la función con mayor asistencia del año. Y no por nostalgia: por teatro.',
'Marcos Villanueva Soto','Casa de México','teatro-luces',6,'emerald',false,'2025-12-10'),

('art-020','flor-garduno-cuerpo-es-jardin',true,'cultura','Fotografía','PHotoESPAÑA 2026','Fotografía',
'Flor Garduño: el cuerpo es jardín',
'La fotógrafa oaxaqueña llega a PHotoESPAÑA 2026 con una retrospectiva que reúne 35 años de imágenes donde naturaleza, cuerpo y rito son una sola cosa.',
'Flor Garduño nunca ha fotografiado lo que no conoce. Y lo que conoce —la mujer, la naturaleza, el ritual, la luz que entra oblicua en un cuarto de adobe— lo ha fotografiado con una fidelidad que roza lo sagrado.

Su retrospectiva en PHotoESPAÑA 2026 es la primera vez que su obra completa se presenta en Europa. Ciento veinte imágenes en blanco y negro que recorren desde sus primeros trabajos en Guatemala en los años ochenta hasta sus series más recientes sobre los cuerpos y los jardines de Oaxaca.

Lo que más sorprende a quienes ven la retrospectiva es la constancia. En cuarenta años, la gramática visual de Garduño no ha cambiado: siempre esa luz lateral, esa composición que parece encontrada antes que construida, ese instante en que el cuerpo humano y la naturaleza dejan de ser dos cosas distintas.

"No soy fotógrafa de documentación. Soy fotógrafa de transformación. Lo que me interesa es el momento en que algo se convierte en otra cosa."

La retrospectiva incluye también una selección de sus fotografías de niños mayas de Chiapas, imágenes que forman parte de la colección permanente del MoMA de Nueva York y que nunca habían viajado a España.',
'Carmen Solís Jiménez','XICO Madrid','photo-editorial',7,'magenta',false,'2026-05-01'),

('art-021','lourdes-grobet-lucha-libre',true,'cultura','Fotografía','Fotografía Documental','Fotografía',
'Lourdes Grobet: la lucha libre como archivo',
'Sus imágenes de la lucha libre mexicana son ahora canon de la fotografía latinoamericana. En Madrid se exhiben por primera vez en Europa.',
'Cuando Lourdes Grobet comenzó a fotografiar la lucha libre mexicana en los años setenta, nadie en el mundo del arte la tomó en serio. Era demasiado popular, demasiado kitsch, demasiado mexicana. Cincuenta años después, su archivo es estudiado en las mejores universidades de Estados Unidos y Europa como uno de los documentos más completos sobre la cultura popular urbana del siglo XX.

La exhibición en Casa de México presenta 80 imágenes seleccionadas del archivo de más de 10,000 fotografías que Grobet realizó entre 1975 y 1994. El Santo, El Perro Aguayo, Blue Demon: máscaras que son personajes, personajes que son mitología, mitología que es México.

Lo que convierte las fotografías de Grobet en arte y no solo en documento es la mirada. Ella no fotografió la lucha libre como espectáculo; la fotografió como ritual. Como el espacio donde la ciudad proyectaba sus miedos, sus deseos y su sentido del humor colectivo.

"La lucha libre es el teatro barroco de México. Tiene héroes, villanos, transformaciones y muerte fingida. Todo lo que el arte necesita."

La muestra incluye testimonios en video de luchadores que conocieron a Grobet, y un catálogo con textos de Carlos Monsiváis y Susan Sontag.',
'Pablo Hernández Brito','Casa de México','photo-editorial',7,'cobalt',false,'2026-04-01'),

('art-022','alinka-echeverria-fronteras-visibles',true,'cultura','Fotografía','Fotografía Contemporánea','Fotografía',
'Alinka Echeverría: fronteras visibles',
'La fotógrafa mexicana radicada en Londres llega a Madrid con una serie sobre los cuerpos que cruzan océanos y la huella que ese cruce deja en la piel.',
'Alinka Echeverría nació en la Ciudad de México, estudió en Londres, ha vivido en Berlín, París y Lagos. Si alguien sabe lo que significa vivir con una frontera dentro, es ella.

Su nueva serie, Entre dos mares, fue fotografiada en Madrid, Ciudad de México y la costa de Veracruz durante tres años. Las imágenes muestran cuerpos de mujeres mexicanas en España: cómo visten, cómo se mueven en el espacio, qué llevan consigo, qué han dejado atrás.

El trabajo de Echeverría no es sociología ilustrada. Es fotografía que parte de una pregunta: ¿cuánto del cuerpo cambia cuando cambia el país? La respuesta, en sus imágenes, no es nunca simple. Hay pérdida y hay ganancia. Hay adaptación que es traición y adaptación que es inteligencia.

"No fotografío la migración. Fotografío la supervivencia. Y la supervivencia tiene una estética particular: es práctica, es ingeniosa y es siempre más hermosa de lo que parece."',
'Sofía Leal Noriega','Casa de México','ciudad-editorial',6,'magenta',false,'2026-02-10'),

('art-023','tatiana-huezo-dolor-que-no-prescribe',true,'cultura','Cine','Documental','Cine',
'Tatiana Huezo y el dolor que no prescribe',
'Con tres largometrajes, ya es la directora de cine documental más importante de México. Su nuevo trabajo llega a San Sebastián.',
'Tatiana Huezo hace películas sobre cosas que México prefiere no ver. El crimen organizado en Tempestad. Los años perdidos en Noche de fuego. El dolor colectivo que no tiene nombre oficial.

Su tercer largometraje se rodó durante dieciocho meses en la Sierra Juárez de Oaxaca. Es una coproducción con el Instituto Danés de Cine: un dato que dice mucho sobre dónde está dispuesto a financiarse el cine más valiente que se hace en México.

La película sigue a tres mujeres de diferentes generaciones en un pueblo que ha sido abandonado por la mitad de sus habitantes. No es una película sobre la migración: es una película sobre lo que queda. Sobre los que se quedan.

"El documental no es un género menor. Es el género más honesto que existe, porque no puede esconderse detrás de la ficción cuando miente."',
'Rodrigo Pacheco Reyes','XICO Madrid','cine-film',6,'magenta',false,'2026-09-01'),

('art-024','lila-aviles-el-presente-es-el-archivo',true,'cultura','Cine','Nuevo Cine Mexicano','Cine',
'Lila Avilés: el presente es el archivo',
'Después del éxito de Tótem en la Berlinale, la directora presenta su nuevo documental sobre las mujeres que sostienen los mercados de la Ciudad de México.',
'Cuando Tótem se estrenó en la Berlinale de 2023, Lila Avilés ya tenía en mente su siguiente proyecto. No otro drama íntimo sobre una familia. Algo más grande, más ruidoso, más colectivo: los mercados de la Ciudad de México.

Durante dos años filmó en el Mercado de Jamaica, el de la Merced y el de Artesanías de Tepito. Sus cámaras siguieron a treinta y dos mujeres que empiezan a trabajar antes de que amanezca y terminan cuando ya no hay luz.

El resultado es un documental de dos horas sin narración en off, sin entrevistas a cámara, sin música incidental. Solo las voces, los movimientos y las transacciones de un espacio que es al mismo tiempo mercado, comunidad, historia y caos.

"Los mercados mexicanos son el lugar donde más cosas pasan al mismo tiempo. Son la versión acelerada de lo que es México: diverso, contradictorio, generoso y brutal."',
'Valentina Cruz Morales','XICO Madrid','cine-film',7,'cobalt',false,'2026-06-01'),

('art-025','natalia-toledo-limite-de-dos-lenguas',true,'cultura','Literatura','Poesía','Literatura',
'Natalia Toledo: escribir en el límite de dos lenguas',
'La poeta zapoteca de Juchitán es la voz más singular de la poesía mexicana contemporánea. Su obra se traduce ahora al catalán, al vasco y al galés.',
'Natalia Toledo escribe en dos idiomas que no se parecen en nada. El zapoteco de Juchitán —su lengua primera, la que aprendió antes que el español— y el español de México, que es también una lengua conquistada y luego conquistada de vuelta.

Sus poemas no son traducibles en el sentido habitual. No porque sean crípticos, sino porque contienen sonidos que no existen en otras lenguas. Cuando dice en zapoteco la palabra que significa "la luz de la tarde sobre el río justo antes de que oscurezca", ninguna traducción puede capturar exactamente eso.

En Madrid, su lectura en Casa de México fue uno de los eventos literarios más comentados del año. El público escuchó poemas en zapoteco sin entender una sola palabra. Y los entendió de todas formas.

"Escribo en zapoteco para no olvidar. Escribo en español para que el mundo pueda entrar. Pero lo más interesante está siempre en el umbral entre las dos lenguas. Ahí vivo yo."

Las traducciones al catalán fueron realizadas por la poeta Maria Cabeza de Vaca, y las versiones al vasco por Bernardo Atxaga. El galés lo hizo un estudiante de poesía comparada en Cardiff que leyó sus poemas por accidente y no pudo parar.',
'Isabel Morales Vega','XICO Madrid','literatura-escritura',7,'emerald',false,'2026-04-10'),

('art-026','narrativa-mexicana-que-europa-lee',true,'cultura','Literatura','Literatura Contemporánea','Literatura',
'La narrativa mexicana que Europa está aprendiendo a leer',
'Más allá de Rulfo: seis voces de la literatura mexicana contemporánea que se traducen al alemán, al francés y al italiano este año.',
'Durante décadas, la literatura mexicana que llegaba a Europa llegaba tarde. Primero Rulfo, después Fuentes, eventualmente Paz. Todos hombres, todos del siglo XX, todos con un barniz de exotismo prehispánico que las editoriales europeas encontraban vendible.

Algo está cambiando. Las editoriales alemanas, francesas e italianas están apostando por una nueva generación de autoras mexicanas que no les ofrecen exotismo: les ofrecen literatura.

Valeria Luiselli, cuya obra ya se publica en treinta idiomas. Fernanda Melchor, cuya Temporada de huracanes fue finalista del International Booker Prize. Yuri Herrera, cuya trilogía sobre la frontera norte se ha convertido en texto de referencia en Oxford y la Sorbona.

Y las más jóvenes: Daniela Tarazona, Brenda Lozano, Andrea Chapela. Escritoras que trabajan con la ciencia ficción, el terror y el ensayo literario de una manera que no tiene equivalente en la literatura española contemporánea.

La literatura mexicana ya no necesita que Europa la descubra. Solo necesita que Europa tenga la honestidad de reconocer que llegó tarde.',
'Diego Restrepo Arévalo','XICO Madrid','literatura-escritura',8,'magenta',false,'2026-02-20'),

('art-027','indigo-cochinilla-anil',true,'cultura','Moda','Tintes Naturales','Moda',
'Índigo, cochinilla, añil: el color que viene de la tierra',
'Tres tintoreras naturales de Oaxaca radicadas en Madrid explican por qué sus colores no se pueden reproducir en laboratorio.',
'El azul índigo de Oaxaca tarda tres semanas en desarrollarse. El rojo cochinilla requiere 70,000 insectos secos para producir medio kilo de tinte. El añil de Chiapas tiene un olor que los tintoreros describen como "lluvia en tierra de barro" y que ningún proceso industrial ha podido sintetizar.

Estas tres mujeres —Xóchitl Méndez, Lucía de la Cruz y Amparo Jiménez— llegaron a Madrid en los últimos cinco años. Las tres son tintoreras naturales formadas en la tradición zapoteca e ikojts de Oaxaca.

Los diseñadores de moda sostenible de España están buscando exactamente lo que ellas saben hacer: colores que no se marchitan, técnicas que tienen siglos de depuración y materiales que no contaminan ríos ni pulmones.

"El problema de la industria de la moda no es estético. Es ético. Y la solución más antigua que existe es también la más hermosa."',
'Fernanda Castillo Ortega','XICO Madrid','tela-colores',6,'cobalt',false,'2026-01-22'),

('art-028','el-tejido-como-manifiesto',true,'cultura','Moda','Diseño Contemporáneo','Moda',
'El tejido como manifiesto',
'Una nueva generación de diseñadoras mexicanas demuestra que el huipil puede coexistir con el streetwear.',
'No hay nada más contemporáneo que un huipil bien cortado. Eso es lo que dice Xochiquetzal Domínguez, diseñadora de 29 años nacida en Oaxaca y radicada en Madrid desde 2022. Y lo dice mientras muestra un huipil de algodón orgánico con bordado zapoteca que ella misma diseñó junto con artesanas de Tehuantepec.

La nueva generación del diseño mexicano no siente contradicción entre lo tradicional y lo contemporáneo. Para ellas el problema no es cómo modernizar la artesanía. El problema es cómo hacer que la industria de la moda respete lo que la artesanía ya sabe.

Las cuatro diseñadoras que comparten espacio en Madrid tienen en común el rechazo a la moda rápida. El rechazo a fabricar en Bangladesh lo que se puede fabricar en Oaxaca.

"El lujo verdadero no es lo que cuesta más. Es lo que no se puede fabricar dos veces igual."

Su primera colección colectiva se presentó en el Festival de Moda Sostenible de Madrid en enero de 2026. Vendieron todo en dos horas.',
'Valentina Cruz Morales','XICO Madrid','tela-colores',5,'magenta',false,'2026-01-28')

ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────
-- MOMENTOS
-- ─────────────────────────────────────────
INSERT INTO momentos (id, headline, caption, category, accent_color, image_url)
VALUES
('m-001','Retrospectiva Iturbide bate récord de asistencia en Casa de México','Más de 12,000 visitantes en el primer mes. La exposición permanece abierta hasta el 30 de junio.','fotografía','magenta',null),
('m-002','Tres nuevos restaurantes obtienen el Sello Copil en mayo','Barro, Mezcalito y La Palapa se suman a los cerca de cien establecimientos certificados en Madrid.','gastronomía','ochre',null),
('m-003','PHotoESPAÑA 2026 confirma a Flor Garduño como artista protagonista','Primera retrospectiva europea de la fotógrafa oaxaqueña. Inauguración el 12 de junio en el Círculo de Bellas Artes.','fotografía','magenta',null),
('m-004','Lista de espera para la cata de mezcales: 200 personas inscritas','La cata de Mexico Enlaza del 15 de mayo se llena en 48 horas. Hay lista de espera abierta.','gastronomía','ochre',null),
('m-005','Natalia Toledo lee en Casa de México: todas las sillas ocupadas','La poeta zapoteca leyó en zapoteco y español durante 90 minutos. El silencio en la sala fue absoluto.','literatura','emerald',null),
('m-006','La Colección Jumex trae tres Francis Alÿs a Madrid en mayo','Anticipo del programa de exposiciones itinerantes. Las piezas ya están en la galería de Paseo de Recoletos.','artes visuales','cobalt',null),
('m-007','Victoria Riva Palacio actúa en el Reina Sofía el 20 de junio','La coreógrafa mexicana lleva Coreograf-IA al museo más importante de arte contemporáneo de España.','danza','cobalt',null),
('m-008','El maíz azul nixtamalizado llega a cinco nuevos restaurantes de Madrid','Productores de Oaxaca envían partidas directas. La tortilla de maíz criollo empieza a ser parte del paisaje gastronómico.','gastronomía','ochre',null),
('m-009','Fernanda Melchor: su segunda novela se publica en España en septiembre','Editorial Penguin Random House confirma la traducción de Páradais. Presentación en la Casa del Libro en octubre.','literatura','emerald',null),
('m-010','Casa de México abre Frontera/Border el 10 de junio','Doce fotógrafas, doce miradas sobre la experiencia migratoria entre México y España. Entrada libre.','fotografía','magenta',null)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────
-- EVENTS
-- ─────────────────────────────────────────
INSERT INTO events (id, title, starts_at, venue_name, description, category, price)
VALUES
('ev-001','Cata de Mezcales Artesanales · Mexico Enlaza','2026-05-15T20:00:00Z','Casa de México en España · Serrano 46','Segunda edición de la cata mensual de Mexico Enlaza. Doce mezcales artesanales de Oaxaca, Guerrero y Durango presentados por sus productores. Maridaje con botanas tradicionales. Cupos limitados a 60 personas.','gastronomia','€15'),
('ev-002','Coloquio: Literatura Mexicana en Europa Hoy','2026-05-22T19:30:00Z','Casa de México en España · Serrano 46','Encuentro con tres editores europeos que han apostado por la literatura mexicana contemporánea: Anagrama, Periférica y Sexto Piso. Moderado por Diego Restrepo.','literatura','Gratuito'),
('ev-003','Taller de Tintes Naturales Oaxaqueños','2026-06-05T17:00:00Z','Taller Tintes Naturales · Carabanchel Alto 14','Taller de tres horas con Xóchitl Méndez y Lucía de la Cruz. Proceso completo del teñido con cochinilla e índigo. Materiales incluidos. Cada participante se lleva su pieza.','artes-visuales','€35'),
('ev-004','Inauguración PHotoESPAÑA · Flor Garduño','2026-06-12T20:00:00Z','Círculo de Bellas Artes · Calle de Alcalá 42','Inauguración oficial de la primera retrospectiva europea de Flor Garduño. Ciento veinte fotografías en blanco y negro de cuatro décadas de trabajo. La artista estará presente. Acceso libre hasta completar aforo.','artes-visuales','Gratuito'),
('ev-005','Ciclo Nuevo Cine Mexicano · Lila Avilés','2026-06-18T20:30:00Z','Casa de México en España · Serrano 46','Proyección de Tótem y presentación del nuevo documental de Lila Avilés sobre los mercados de Ciudad de México. Coloquio posterior vía videoconferencia con la directora.','artes-visuales','€5'),
('ev-006','Lectura de Poesía · Natalia Toledo','2026-07-03T20:00:00Z','Casa de México en España · Serrano 46','La poeta zapoteca de Juchitán lee en zapoteco y español durante noventa minutos. Conversación con la traductora catalana Maria Cabeza de Vaca.','literatura','Gratuito'),
('ev-007','Chefmex Gourmet 2026','2026-09-18T12:00:00Z','IFEMA · Pabellón 14','Tercera edición del encuentro profesional de gastronomía mexicana en España. Más de 700 profesionales: chefs, distribuidores, productores y críticos. Ponencias, talleres y catas.','gastronomia','€45'),
('ev-008','Noche de Museos · Arte Mexicano Contemporáneo','2026-10-17T20:00:00Z','Casa de México en España · Serrano 46','Apertura nocturna especial con visita guiada. Actuación del Ensamble Folclórico Mexicano a las 21:30. Entrada libre hasta completar aforo.','artes-visuales','Gratuito')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────
-- SPOTS
-- ─────────────────────────────────────────
INSERT INTO spots (id, name, type, description, address, neighborhood, lat, lng, is_copil, accent_color, tags)
VALUES
('sp-001','Punto MX','restaurant','El primer restaurante mexicano de alta gama en Madrid. Roberto Ruiz reinterpreta la cocina mexicana con tortillas de maíz nixtamalizado, mole negro y mezcales de autor. Dos estrellas Michelin. Sello Copil certificado.','Calle del Doctor Castelo, 26','Retiro',40.4183,-3.6904,true,'ochre',ARRAY['alta cocina','mole','maíz nixtamalizado','mezcal','Michelin']),
('sp-002','Tepic','restaurant','Cocina mexicana de mercado en el corazón de Recoletos. Tacos de canasta, tostadas de atún y margaritas de jalapeño. Sello Copil certificado.','Calle de la Reina, 3','Recoletos',40.4218,-3.6897,true,'ochre',ARRAY['tacos','cocina de mercado','margaritas','casual']),
('sp-003','Barracuda MX','restaurant','El más irreverente de los restaurantes mexicanos de Madrid. Ceviche de habanero, tostadas de pulpo y una carta de mezcales con 40 referencias. Sello Copil certificado.','Calle de las Infantas, 27','Chueca',40.4202,-3.6975,true,'magenta',ARRAY['ceviche','mezcal','coctelería']),
('sp-004','Corazón de Agave','bar','Mezcalería y cantina en Lavapiés. 60 referencias de mezcal artesanal de Oaxaca, Guerrero y Durango. Botanas gratuitas con cada copa. Sello Copil certificado.','Calle del Amparo, 50','Lavapiés',40.4079,-3.7035,true,'ochre',ARRAY['mezcal','cantina','artesanal','botanas']),
('sp-005','La Lupita','restaurant','Cocina popular mexicana con ingredientes de primera. Enchiladas verdes, pozole rojo de domingo y horchata hecha a mano. Sello Copil certificado.','Calle de Fuencarral, 43','Chueca',40.4237,-3.6992,true,'emerald',ARRAY['tacos','enchiladas','pozole','horchata']),
('sp-006','Barro','restaurant','El restaurante más íntimo de la escena mexicana. Jorge Muñoz trabaja con productores locales desde una perspectiva mexicana. Sello Copil certificado.','Calle de Almagro, 19','Almagro',40.4302,-3.6933,true,'cobalt',ARRAY['fusión','temporada','íntimo','alta cocina']),
('sp-007','Casa de México en España','cultural','La institución cultural mexicana más importante de Europa. Exposiciones, conciertos, teatro, talleres. La colección de arte popular mexicano más completa fuera de México.','Calle de Serrano, 46','Salamanca',40.4259,-3.6861,false,'magenta',ARRAY['cultura','exposiciones','arte popular','eventos']),
('sp-008','La Tilica Mezcalería','bar','La mezcalería de referencia de Malasaña. 85 referencias y catas los jueves con productores de Oaxaca.','Calle de la Palma, 40','Malasaña',40.4276,-3.7058,false,'ochre',ARRAY['mezcal','catas','coctelería']),
('sp-009','El Burladero','restaurant','Antojería mexicana en Barrio de las Letras. Los mejores tlayudas de Madrid. Maíz negro de Oaxaca, frijoles de olla y tasajo importado. Sello Copil certificado.','Calle de las Huertas, 52','Barrio de las Letras',40.4142,-3.6987,true,'ochre',ARRAY['tlayudas','oaxaqueño','antojería','terraza']),
('sp-010','Taller Tintes Naturales','workshop','El taller de Xóchitl Méndez, Lucía de la Cruz y Amparo Jiménez en Carabanchel. Tintes naturales de tradición oaxaqueña: índigo, cochinilla, añil. Con cita previa.','Calle de Carabanchel Alto, 14','Carabanchel',40.3861,-3.7214,false,'cobalt',ARRAY['tintes naturales','taller','moda sostenible','artesanía'])
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────
-- RUTA
-- ─────────────────────────────────────────
INSERT INTO ruta (id, title, subtitle, month, is_active)
VALUES
('ruta-001','La Ruta del Mezcal','Cinco paradas por el mejor mezcal artesanal de Madrid. Desde Serrano hasta Malasaña: una tarde que empieza con cultura y termina con humo de agave.','Mayo',true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO ruta_stops (id, ruta_id, order_num, name, address, description, category, accent_color, time_suggestion, distance_to_next)
VALUES
('stop-001','ruta-001',1,'Casa de México en España','Calle de Serrano, 46','Empieza en la institución. La colección de arte popular incluye piezas de maestros artesanos de Oaxaca, los mismos estados que producen el mejor mezcal. Visita la tienda Hecho a Mano antes de salir.','cultural','magenta','17:00','2.1 km en metro o 25 min a pie'),
('stop-002','ruta-001',2,'Punto MX','Calle del Doctor Castelo, 26','Roberto Ruiz tiene la carta de mezcales más respetada de Madrid. Pide el ensamble de Durango y las tostadas de aguacate con chapulín. Son dos estrellas Michelin, pero el mezcal se toma sin protocolo.','restaurant','ochre','18:00','1.4 km en metro o 18 min a pie'),
('stop-003','ruta-001',3,'Barracuda MX','Calle de las Infantas, 27','La coctelería de mezcal más creativa de la ciudad. Pide el Mezcal Negroni con bitters de chocolate oaxaqueño o el Spicy Margarita de habanero.','bar','magenta','19:30','0.9 km a pie'),
('stop-004','ruta-001',4,'Corazón de Agave','Calle del Amparo, 50','La mezcalería de Lavapiés tiene 60 referencias. Aquí el mezcal se bebe solo, en vaso de barro, con naranja y sal de gusano. Botanas gratis con cada copa.','bar','ochre','21:00','1.8 km a pie o en metro'),
('stop-005','ruta-001',5,'La Tilica Mezcalería','Calle de la Palma, 40','El cierre perfecto. 85 referencias y los jueves con productores de Oaxaca para catas abiertas. Sin filtros.','bar','ochre','22:30',null)
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------
-- PROFILES -- add narration_style column
-- -----------------------------------------
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS narration_style TEXT DEFAULT 'intellectual';

-- -----------------------------------------
-- DESPACHO tables
-- -----------------------------------------
CREATE TABLE IF NOT EXISTS despacho (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rotation_key INTEGER UNIQUE NOT NULL,
  subtitulo TEXT NOT NULL,
  color_nombre TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  nahuatl_word TEXT NOT NULL,
  nahuatl_meaning TEXT NOT NULL,
  nahuatl_nota TEXT NOT NULL,
  lugar_nombre TEXT NOT NULL,
  lugar_barrio TEXT NOT NULL,
  lugar_nota TEXT NOT NULL,
  hecho TEXT NOT NULL,
  pensamiento TEXT NOT NULL,
  pregunta TEXT NOT NULL,
  teaser TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS despacho_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  despacho_id UUID REFERENCES despacho(id) ON DELETE CASCADE,
  narration_style TEXT NOT NULL CHECK (narration_style IN ('visual','material','intellectual','kinesthetic','conceptual')),
  pensamiento_variant TEXT NOT NULL,
  pregunta_variant TEXT NOT NULL,
  teaser_variant TEXT NOT NULL,
  UNIQUE (despacho_id, narration_style)
);

-- Seed first 7 days (rotation keys 1-7). API falls back to TypeScript constants for 8-30.
INSERT INTO despacho (rotation_key, subtitulo, color_nombre, color_hex, nahuatl_word, nahuatl_meaning, nahuatl_nota, lugar_nombre, lugar_barrio, lugar_nota, hecho, pensamiento, pregunta, teaser)
VALUES
(1,'Lo que Madrid tiene sin saberlo','Ocre Oaxaqueno','#B5860F','Nepantla','el espacio entre dos mundos','No el origen ni el destino: el transito mismo.','Mercado de San Fernando','Lavapies','Puesto 12. Mole negro elaborado durante dos dias.','31 estados de Mexico tienen representacion activa en Madrid en 2026.','Madrid colecciona culturas como el Rastro colecciona objetos: sin saber exactamente que tiene. Esta ciudad lleva decadas acumulando Mexico sin catalogarlo.','Que parte de ti vive en Nepantla hoy?','Manana: el color que Mexico le regalo a Espana.'),
(2,'El color que no se discutio','Carmin Achiote','#C0392B','Tlapalli','color sagrado','De los tlacuilos. No describían el mundo: lo nombraban con color.','Iglesia de San Gines','Sol','Fijate en el rojo de los mantos. Tiene cuatro siglos y origen mesoamericano.','El 40% de los tintes rojos usados en Europa provenian de grana cochinilla mexicana.','El rojo de los mantos barrocos tiene un origen que nadie discutio en el siglo XVII. Llego de Mexico en el mismo barco que el chocolate.','Cuantos colores que ves hoy tienen un origen que no conoces?','Manana: lo que el cacao era antes del azucar.'),
(3,'Antes de que llegara el azucar','Teobromina Oscura','#5C3317','Xocolatl','agua amarga','La bebida ritual de los mexicas. No dulce: intensa.','Chocolateria San Gines','Opera','Fundada en 1894. El chocolate que sirven tiene el mismo espesor que el azteca.','Los aztecas usaban granos de cacao como moneda. Un esclavo valia 100 granos.','El chocolate era amargo, picante, y se bebia frio. Cuando los espanoles le anadieron azucar crearon algo nuevo, pero borraron el original.','Cuantas cosas consumes hoy que son distintas de lo que fueron en origen?','Manana: el arbol que lleva dos mil anos en el mismo sitio.'),
(4,'El arbol que es un testigo','Verde Centenario','#2D5A3D','Ahuehuetl','el viejo del agua','Arbol sagrado del pueblo mexica. En Chapultepec hay ejemplares que vieron el fin del mundo conocido.','Jardin Botanico del Retiro','El Retiro','Busca la coleccion de coniferas. Hay un cipres que tiene la misma forma vertical que el ahuehuete.','El arbol del Tule en Oaxaca tiene 2,000 anos y es el de mayor circunferencia del mundo: 58 metros.','En Mexico, el ahuehuete puede vivir mas de dos mil anos. En Mesoamerica los arboles son memoria viva. Un arbol que vio caer Tenochtitlan sigue en pie.','Cuanto tiempo tiene la cosa mas antigua que has tocado hoy?','Manana: la ciudad que se construyo sobre el agua.'),
(5,'La ciudad que era un lago','Azul Lacustre','#1A4A6E','Atzintli','en el agua','El sufijo que indica origen acuatico en los toponimos mexicas. Aztlan, Tenochtitlan.','Museo Nacional de Antropologia','Castellana','La sala mexica tiene una maqueta de Tenochtitlan.','El Centro Historico de CDMX se hunde hasta 30 cm por ano. La ciudad construida sobre el agua paga su deuda.','Ciudad de Mexico se construyo sobre los restos de Tenochtitlan, que se construyo sobre un lago. El Centro Historico se hunde cada ano. CDMX elige cada dia entre el lago y la ciudad.','Que esta debajo del suelo donde vives?','Manana: el primer alimento sagrado.'),
(6,'El primer alimento sagrado','Amarillo Maiz','#D4A820','Tlayolli','maiz desgranado','La base. Lo esencial sin el ornamento. El nucleo de una civilizacion en una semilla.','La Lucerna','Chueca','Tlayudas oaxaquenas autenticas. El maiz viene del mismo valle donde se cultivo por primera vez.','Mexico es el centro de diversidad genetica del maiz con mas de 59 razas nativas.','El maiz no es un cultivo: es una creacion. Fue disenado por el ser humano hace 9,000 anos en el valle de Tehuacan.','Que parte de tu dieta diaria vino de Mexico sin que lo supieras?','Manana: la institucion mas antigua de America.'),
(7,'La democracia sin elecciones','Terracota Mercado','#8B4513','Tianguis','mercado','Del nahuatl tianquiztli. La palabra resistio la conquista.','Mercado de La Paz','Salamanca','Menos turistico. El pescado llega de Huelva y hay un puesto de mezcal en la entrada.','En Mexico se celebran mas de 50,000 tianguis semanales.','El tianguis funcionaba sin moneda oficial, sin propiedad privada y sin horario fijo. El intercambio no es solo de mercancia. Es de presencia.','Cuando fue la ultima vez que compraste algo mirando a los ojos de quien lo hizo?','Manana: lo que la muerte no cancela.')
ON CONFLICT (rotation_key) DO NOTHING;
