// Server-side allowlist of valid `profiles.interests` slugs.
//
// Two taxonomies coexist while the v1 walkthrough/legacy harmonization is
// deferred (see walkthrough commit c1af822's open-question note):
//
//   1. Legacy 8-category taxonomy used by the editorial filter
//      (filterByInterests in mobile constants/interests.ts).
//   2. New 5-pillar taxonomy used by the walkthrough's step-5 chips
//      (PILLAR_CHIPS in app/onboarding.tsx).
//
// Both are stored verbatim in profiles.interests · downstream code that
// expects subcategory matches will degrade gracefully (no match = unfiltered
// list, no crash). When the taxonomies are harmonized this whitelist
// shrinks to one set.

export const ALLOWED_INTERESTS = new Set<string>([
  // Legacy 8-category
  "Arte Contemporáneo",
  "Arte Mesoamericano",
  "Fotografía y Memoria",
  "Gastronomía",
  "Arte Popular y Artesanía",
  "Cine y Literatura",
  "Artes Escénicas",
  "Diseño e Identidad",
  // New 5-pillar (walkthrough step 5)
  "Despacho",
  "Cultura",
  "México Ahora",
  "La Ruta",
  "Archivo",
]);

export function validateInterests(input: unknown): { ok: true; value: string[] } | { ok: false; error: string } {
  if (!Array.isArray(input)) return { ok: false, error: "interests must be an array" };
  if (input.length > 20) return { ok: false, error: "interests array too long" };
  for (const item of input) {
    if (typeof item !== "string") return { ok: false, error: "interests must be strings" };
    if (item.length > 64) return { ok: false, error: "interest slug too long" };
    if (!ALLOWED_INTERESTS.has(item)) {
      return { ok: false, error: `unknown interest: ${item}` };
    }
  }
  return { ok: true, value: input };
}
