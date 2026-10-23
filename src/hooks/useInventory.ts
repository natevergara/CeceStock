import { useState, useCallback, useMemo, useRef } from 'react';
import { CountsMap, SyncRecord } from '../types/inventory';
import { MAX_HISTORY_RECORDS, INITIAL_PRODUCTS, INITIAL_COLORS } from '../lib/constants';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { exportInventoryToCSV } from '../lib/csvExport';
import { triggerHaptic } from '../lib/haptics';
import { readCounts, writeCounts, clearCounts, readHistory, writeHistory } from '../lib/storage';
import {
  buildInventorySummary,
  summaryToRows,
  summaryTotal,
  subtractCounts,
} from '../lib/inventorySummary';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

interface SyncState {
  status: SyncStatus;
  message: string;
}

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

/**
 * Formatea una fecha para mostrarla en el historial (ej. `18 Oct, 15:30`).
 *
 * @param date Fecha a formatear (por defecto, ahora).
 * @returns Texto legible en español.
 */
function formatDisplayTimestamp(date: Date = new Date()): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${date.getDate()} ${MONTHS[date.getMonth()]}, ${hours}:${minutes}`;
}

/**
 * Hook principal del inventario: conteo por producto/color, persistencia
 * offline-first en `localStorage` y sincronización con Supabase.
 *
 * - Cada cambio se persiste de forma síncrona e inmediata.
 * - El borrador solo se descuenta tras un INSERT exitoso en Supabase, y únicamente
 *   por lo que se envió: lo editado durante la sincronización se conserva.
 * - Sin credenciales de Supabase la sincronización falla de forma explícita y
 *   el borrador permanece intacto.
 */
export function useInventory() {
  const [counts, setCounts] = useState<CountsMap>(readCounts);
  const [syncHistory, setSyncHistory] = useState<SyncRecord[]>(readHistory);
  const [syncState, setSyncState] = useState<SyncState>({ status: 'idle', message: '' });

  // Espejo síncrono de `counts`: permite escrituras puras y sin pérdidas entre renders.
  const countsRef = useRef<CountsMap>(counts);
  const isSyncingRef = useRef(false);

  /** Aplica y persiste un nuevo mapa de conteos. */
  const commitCounts = useCallback((next: CountsMap) => {
    countsRef.current = next;
    writeCounts(next);
    setCounts(next);
  }, []);

  const getQuantity = useCallback(
    (productId: string, colorId: string): number => counts[productId]?.[colorId] ?? 0,
    [counts]
  );

  /**
   * Fija la cantidad de un color en un producto y la persiste de inmediato.
   * Valores negativos, decimales o NaN se sanean (>= 0, entero); 0 elimina la entrada.
   *
   * @param productId Id del producto.
   * @param colorId Id del color.
   * @param value Nueva cantidad.
   */
  const updateQuantity = useCallback(
    (productId: string, colorId: string, value: number) => {
      const safeVal = Number.isNaN(value) ? 0 : Math.max(0, Math.floor(value));
      const prev = countsRef.current;
      const nextProduct = { ...(prev[productId] || {}) };

      if (safeVal === 0) {
        delete nextProduct[colorId];
      } else {
        nextProduct[colorId] = safeVal;
      }

      commitCounts({ ...prev, [productId]: nextProduct });

      // Resetear el estado de sync (éxito/error) al volver a editar; no interrumpir un sync en curso.
      setSyncState((s) => (s.status === 'success' || s.status === 'error' ? { status: 'idle', message: '' } : s));
    },
    [commitCounts]
  );

  const getProductTotal = useCallback(
    (productId: string): number =>
      Object.values(counts[productId] ?? {}).reduce((acc, curr) => acc + (curr || 0), 0),
    [counts]
  );

  const grandTotal = useMemo(
    () =>
      Object.values(counts).reduce(
        (total, prodMap) => total + Object.values(prodMap ?? {}).reduce((a, v) => a + (v || 0), 0),
        0
      ),
    [counts]
  );

  /**
   * Envía el conteo actual a Supabase (tabla `inventory_counts`).
   *
   * @returns `true` si se guardó correctamente; `false` si no había datos, faltan
   * credenciales, hay otro sync en curso o Supabase devolvió un error. Nunca lanza.
   */
  const syncToSupabase = useCallback(async (): Promise<boolean> => {
    if (isSyncingRef.current) return false;

    const snapshot = countsRef.current;
    const summary = buildInventorySummary(snapshot, INITIAL_PRODUCTS, INITIAL_COLORS);
    const unitsSent = summaryTotal(summary);

    if (unitsSent === 0) {
      setSyncState({ status: 'error', message: 'No hay prendas contadas para sincronizar.' });
      return false;
    }

    if (!isSupabaseConfigured) {
      setSyncState({
        status: 'error',
        message: 'Supabase no está configurado. Tu conteo sigue guardado en este dispositivo.',
      });
      return false;
    }

    isSyncingRef.current = true;
    setSyncState({ status: 'syncing', message: 'Sincronizando con Supabase...' });

    try {
      const now = new Date();
      const isoNow = now.toISOString();

      const { error } = await supabase.from('inventory_counts').insert(summaryToRows(summary, isoNow));
      if (error) throw error;

      const newRecord: SyncRecord = {
        id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `sync-${Date.now()}`,
        timestamp: formatDisplayTimestamp(now),
        isoDate: isoNow,
        totalUnits: unitsSent,
        summary,
      };
      const updatedHistory = [newRecord, ...syncHistory].slice(0, MAX_HISTORY_RECORDS);
      setSyncHistory(updatedHistory);
      writeHistory(updatedHistory);

      // Descontar solo lo enviado: lo tecleado durante el await se conserva.
      const remaining = subtractCounts(countsRef.current, snapshot);
      if (Object.keys(remaining).length === 0) {
        countsRef.current = {};
        clearCounts();
        setCounts({});
      } else {
        commitCounts(remaining);
      }

      triggerHaptic(25);
      setSyncState({
        status: 'success',
        message: `¡Sincronizado con éxito! (${unitsSent} pçs guardadas)`,
      });
      return true;
    } catch (err: unknown) {
      console.error('Error during Supabase sync:', err);
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Error al conectar con Supabase';
      setSyncState({
        status: 'error',
        message: `Fallo de sincronización: ${msg}. Tu conteo sigue guardado.`,
      });
      return false;
    } finally {
      isSyncingRef.current = false;
    }
  }, [syncHistory, commitCounts]);

  /**
   * Descarga el borrador actual como CSV de respaldo.
   *
   * @returns `true` si se exportó algo; `false` si el conteo estaba vacío.
   */
  const exportCurrentToCSV = useCallback(
    (): boolean => exportInventoryToCSV(counts, INITIAL_PRODUCTS, INITIAL_COLORS),
    [counts]
  );

  return {
    counts,
    getQuantity,
    updateQuantity,
    getProductTotal,
    grandTotal,
    syncStatus: syncState.status,
    syncMessage: syncState.message,
    syncToSupabase,
    triggerHaptic,
    syncHistory,
    exportCurrentToCSV,
  };
}
