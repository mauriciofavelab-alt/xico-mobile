// Editorial calendar constants
//
// Locked values that anchor "this is the inaugural week" / "this is the
// current week" decisions. Extracted to one place so a future rename or
// pivot doesn't require grepping the codebase for ISO-week strings.

/**
 * The ISO week of XICO's inaugural La Ruta publication. Used by Hoy +
 * Ruta listing to surface the "INAUGURAL" kicker as a one-time editorial
 * marker. After 2026-W19 ships and the next Ruta drops, this stays as
 * the historical anchor but the surfaces stop showing the kicker.
 */
export const INAUGURAL_WEEK_KEY = "2026-W19";

/**
 * True iff `weekKey` is the inaugural week. Centralized so screens don't
 * each implement the comparison.
 */
export function isInauguralWeek(weekKey: string | undefined | null): boolean {
  return weekKey === INAUGURAL_WEEK_KEY;
}
