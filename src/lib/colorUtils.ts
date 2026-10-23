/**
 * Calcula la luminancia aproximada (0–255) de un color HEX `#RRGGBB`.
 *
 * @param hex Color en formato HEX.
 * @returns Luminancia ponderada (fórmula Rec. 709).
 */
export function getLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Indica si un color es tan oscuro que necesita micro-anillo perimetral
 * para no fundirse con la superficie de la tarjeta (`#13161F`).
 * Cubre Preto, Vinho, Marrom y Azul Demin.
 *
 * @param hex Color en formato HEX.
 */
export function isDarkColor(hex: string): boolean {
  return getLuminance(hex) < 65;
}

/**
 * Indica si un color es muy claro (Off White, Rose, Areia...).
 *
 * @param hex Color en formato HEX.
 */
export function isLightColor(hex: string): boolean {
  return getLuminance(hex) > 200;
}
