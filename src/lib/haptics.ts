/**
 * Emite una vibración táctil si el dispositivo la soporta.
 * Nunca lanza: algunos navegadores bloquean la vibración sin interacción previa.
 *
 * @param duration Duración en milisegundos (10 = cambio de tarjeta, 25 = sync exitoso).
 */
export function triggerHaptic(duration: number = 10): void {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
  try {
    navigator.vibrate(duration);
  } catch {
    // Ignorar si el navegador bloquea la vibración
  }
}
