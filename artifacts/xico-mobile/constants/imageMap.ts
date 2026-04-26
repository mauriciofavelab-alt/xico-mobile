const IMAGE_MAP: Record<string, any> = {
  "iturbide-iguanas": require("../assets/images/iturbide-iguanas.png"),
  "photo-editorial": require("../assets/images/photo-editorial.png"),
  "arte-mesoamerica": require("../assets/images/arte-mesoamerica.png"),
  "artesania-mexicana": require("../assets/images/artesania-mexicana.png"),
  "mezcal-destilados": require("../assets/images/mezcal-destilados.png"),
  "arte-contemporaneo": require("../assets/images/arte-contemporaneo.png"),
  "ciudad-editorial": require("../assets/images/ciudad-editorial.png"),
  "cine-film": require("../assets/images/cine-film.png"),
  "teatro-luces": require("../assets/images/teatro-luces.png"),
  "dia-de-muertos": require("../assets/images/dia-de-muertos.png"),
  "danza-escena": require("../assets/images/danza-escena.png"),
  "tela-colores": require("../assets/images/tela-colores.png"),
  "literatura-escritura": require("../assets/images/literatura-escritura.png"),
  "gastronomia-fina": require("../assets/images/gastronomia-fina.png"),
  "food": require("../assets/images/food.png"),
  // Aliases for original imageKeys we map to nearest image
  "culture": require("../assets/images/literatura-escritura.png"),
  "camara-vintage": require("../assets/images/photo-editorial.png"),
  "fotografia-retrato": require("../assets/images/photo-editorial.png"),
  "cine-rodaje": require("../assets/images/cine-film.png"),
  "cine-sala": require("../assets/images/cine-film.png"),
  "literatura-libros": require("../assets/images/literatura-escritura.png"),
  "moda-textil": require("../assets/images/tela-colores.png"),
  "moda-runway": require("../assets/images/tela-colores.png"),
  "danza-contemporanea": require("../assets/images/danza-escena.png"),
  "cocina-chef": require("../assets/images/gastronomia-fina.png"),
  "cocina-alta": require("../assets/images/gastronomia-fina.png"),
};

export function getImage(imageKey: string): any {
  if (imageKey && (imageKey.startsWith("http://") || imageKey.startsWith("https://"))) {
    return { uri: imageKey };
  }
  return IMAGE_MAP[imageKey] ?? IMAGE_MAP["gastronomia-fina"];
}

export default IMAGE_MAP;

