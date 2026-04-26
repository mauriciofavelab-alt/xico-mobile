export type Interest = {
  id: string;
  colorHex: string;
  subcategories: string[];
};

export const INTERESTS: Interest[] = [
  {
    id: "Arte Contemporáneo",
    colorHex: "hsl(335, 75%, 35%)",
    subcategories: ["Arte Contemporáneo", "Artes Visuales", "Arte Urbano"],
  },
  {
    id: "Arte Mesoamericano",
    colorHex: "hsl(30, 70%, 38%)",
    subcategories: ["Tradición"],
  },
  {
    id: "Fotografía y Memoria",
    colorHex: "hsl(220, 75%, 28%)",
    subcategories: ["Fotografía"],
  },
  {
    id: "Gastronomía",
    colorHex: "hsl(158, 75%, 20%)",
    subcategories: ["Gastronomía"],
  },
  {
    id: "Arte Popular y Artesanía",
    colorHex: "hsl(16, 68%, 35%)",
    subcategories: ["Arte Popular"],
  },
  {
    id: "Cine y Literatura",
    colorHex: "hsl(262, 52%, 30%)",
    subcategories: ["Cine", "Literatura"],
  },
  {
    id: "Artes Escénicas",
    colorHex: "hsl(330, 55%, 24%)",
    subcategories: ["Artes Escénicas"],
  },
  {
    id: "Diseño e Identidad",
    colorHex: "hsl(200, 55%, 25%)",
    subcategories: ["Moda"],
  },
];

export const INTEREST_TO_SUBCATEGORY: Record<string, string[]> = {
  "Arte Contemporáneo": ["Arte Contemporáneo", "Artes Visuales", "Arte Urbano"],
  "Arte Mesoamericano": ["Tradición"],
  "Fotografía y Memoria": ["Fotografía"],
  "Gastronomía": ["Gastronomía"],
  "Arte Popular y Artesanía": ["Arte Popular"],
  "Cine y Literatura": ["Cine", "Literatura"],
  "Artes Escénicas": ["Artes Escénicas"],
  "Diseño e Identidad": ["Moda"],
};

export function filterByInterests(
  articles: { subcategory?: string }[],
  selectedIds: string[]
): typeof articles {
  if (!selectedIds || selectedIds.length === 0) return articles;
  const allowedSubcats = new Set(
    selectedIds.flatMap(id => INTEREST_TO_SUBCATEGORY[id] ?? [])
  );
  if (allowedSubcats.size === 0) return articles;
  return articles.filter(a => !a.subcategory || allowedSubcats.has(a.subcategory));
}

