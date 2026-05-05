/**
 * @fileoverview Bangladeshi phone number utilities.
 *
 * Validates and normalises phone numbers to the E.164 format expected by
 * sms.net.bd (`+8801XXXXXXXXX`).
 *
 * Accepted input formats:
 *  - `01XXXXXXXXX`   (local 11-digit)
 *  - `8801XXXXXXXXX` (without leading `+`)
 *  - `+8801XXXXXXXXX` (E.164 — returned as-is after validation)
 *
 * Operator prefixes accepted: 013, 014, 015, 016, 017, 018, 019.
 */

/** E.164 regex for Bangladeshi numbers (+8801XXXXXXXXX). */
const BD_E164_RE = /^\+8801[3-9]\d{8}$/;

/**
 * Normalise an input phone string to `+8801XXXXXXXXX`.
 * Returns `null` if the input cannot be resolved to a valid BD number.
 *
 * @param raw - Raw phone string from user input.
 */
export function normalisePhone(raw: string): string | null {
  const stripped = raw.replace(/[\s\-().]/g, '');

  if (/^\+8801[3-9]\d{8}$/.test(stripped)) return stripped;
  if (/^8801[3-9]\d{8}$/.test(stripped)) return `+${stripped}`;
  if (/^01[3-9]\d{8}$/.test(stripped)) return `+88${stripped}`;

  return null;
}

/**
 * Returns `true` when the normalised phone string passes the BD E.164 regex.
 *
 * @param normalised - Output of {@link normalisePhone}.
 */
export function isValidBdPhone(normalised: string): boolean {
  return BD_E164_RE.test(normalised);
}
