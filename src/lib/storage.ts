import { CountsMap, SyncRecord } from '../types/inventory';
import { LOCAL_STORAGE_KEY, SYNC_HISTORY_STORAGE_KEY } from './constants';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Lee un valor JSON de localStorage de forma segura.
 *
 * @param key Clave de localStorage.
 * @returns El valor parseado, o `null` si no existe, no se puede leer o el JSON es inválido.
 */
function readJSON(key: string): unknown {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.warn(`Error reading "${key}" from localStorage:`, e);
    return null;
  }
}

/**
 * Restaura el borrador de conteo. Solo conserva cantidades enteras positivas;
 * cualquier dato con forma inesperada se descarta.
 *
 * @returns Mapa de conteos válido (vacío si no hay borrador o está corrupto).
 */
export function readCounts(): CountsMap {
  const raw = readJSON(LOCAL_STORAGE_KEY);
  const result: CountsMap = {};
  if (!isPlainObject(raw)) return result;

  for (const [productId, colors] of Object.entries(raw)) {
    if (!isPlainObject(colors)) continue;
    const clean: Record<string, number> = {};
    for (const [colorId, qty] of Object.entries(colors)) {
      if (typeof qty === 'number' && Number.isFinite(qty) && qty > 0) {
        clean[colorId] = Math.floor(qty);
      }
    }
    result[productId] = clean;
  }
  return result;
}

/**
 * Persiste el borrador de conteo (escritura síncrona; los errores solo se registran).
 *
 * @param counts Mapa de conteos a guardar.
 */
export function writeCounts(counts: CountsMap): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(counts));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
}

/** Elimina el borrador de conteo de localStorage. */
export function clearCounts(): void {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing localStorage draft:', e);
  }
}

/**
 * Restaura el historial de sincronizaciones, descartando registros mal formados.
 *
 * @returns Lista de registros válidos (vacía si no hay historial o está corrupto).
 */
export function readHistory(): SyncRecord[] {
  const raw = readJSON(SYNC_HISTORY_STORAGE_KEY);
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (r): r is SyncRecord =>
      isPlainObject(r) &&
      typeof r.id === 'string' &&
      typeof r.timestamp === 'string' &&
      typeof r.totalUnits === 'number' &&
      Array.isArray(r.summary)
  );
}

/**
 * Persiste el historial de sincronizaciones.
 *
 * @param history Registros a guardar.
 */
export function writeHistory(history: SyncRecord[]): void {
  try {
    localStorage.setItem(SYNC_HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Error saving sync history to localStorage:', e);
  }
}
