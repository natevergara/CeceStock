import { useState, useCallback, useMemo } from 'react';
import { CountsMap, InventoryCountRow, SyncRecord, SyncRecordItem, SyncRecordColorBreakdown } from '../types/inventory';
import { LOCAL_STORAGE_KEY, SYNC_HISTORY_STORAGE_KEY, MAX_HISTORY_RECORDS, INITIAL_PRODUCTS, INITIAL_COLORS } from '../lib/constants';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { exportInventoryToCSV } from '../lib/csvExport';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

function formatDisplayTimestamp(date: Date = new Date()): string {
  const day = date.getDate();
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const month = months[date.getMonth()];
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day} ${month}, ${hours}:${minutes}`;
}

export function useInventory() {
  const [counts, setCounts] = useState<CountsMap>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error reading from localStorage:', e);
    }
    return {};
  });

  const [syncHistory, setSyncHistory] = useState<SyncRecord[]>(() => {
    try {
      const saved = localStorage.getItem(SYNC_HISTORY_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error reading sync history from localStorage:', e);
    }
    return [];
  });

  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [syncMessage, setSyncMessage] = useState<string>('');

  // Persistir en localStorage en cada actualización
  const persistCounts = useCallback((newCounts: CountsMap) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newCounts));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }, []);

  const getQuantity = useCallback((productId: string, colorId: string): number => {
    return counts[productId]?.[colorId] ?? 0;
  }, [counts]);

  const updateQuantity = useCallback((productId: string, colorId: string, value: number) => {
    setCounts((prev) => {
      const safeVal = isNaN(value) ? 0 : Math.max(0, Math.floor(value));
      const nextProductCounts = { ...(prev[productId] || {}) };
      
      if (safeVal === 0) {
        delete nextProductCounts[colorId];
      } else {
        nextProductCounts[colorId] = safeVal;
      }

      const nextCounts = { ...prev, [productId]: nextProductCounts };
      persistCounts(nextCounts);
      return nextCounts;
    });

    // Resetear status de sync si se vuelve a editar
    if (syncStatus !== 'idle') {
      setSyncStatus('idle');
      setSyncMessage('');
    }
  }, [persistCounts, syncStatus]);

  const getProductTotal = useCallback((productId: string): number => {
    const productCounts = counts[productId];
    if (!productCounts) return 0;
    return Object.values(productCounts).reduce((acc, curr) => acc + (curr || 0), 0);
  }, [counts]);

  const grandTotal = useMemo(() => {
    let total = 0;
    Object.values(counts).forEach((prodMap) => {
      if (prodMap) {
        Object.values(prodMap).forEach((val) => {
          total += val || 0;
        });
      }
    });
    return total;
  }, [counts]);

  const triggerHaptic = useCallback((duration: number = 10) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(duration);
      } catch {
        // Ignorar si el navegador bloquea la vibración sin interacción previa
      }
    }
  }, []);

  const syncToSupabase = async (): Promise<boolean> => {
    // Si no hay productos contados
    if (grandTotal === 0) {
      setSyncStatus('error');
      setSyncMessage('No hay prendas contadas para sincronizar.');
      return false;
    }

    setSyncStatus('syncing');
    setSyncMessage('Sincronizando con Supabase...');

    try {
      // Preparar payload
      const rows: InventoryCountRow[] = [];
      const now = new Date();
      const isoNow = now.toISOString();

      INITIAL_PRODUCTS.forEach((prod) => {
        INITIAL_COLORS.forEach((col) => {
          const qty = counts[prod.id]?.[col.id] ?? 0;
          if (qty > 0) {
            rows.push({
              product_id: prod.id,
              color_id: col.id,
              quantity: qty,
              timestamp: isoNow,
            });
          }
        });
      });

      if (isSupabaseConfigured) {
        const { error } = await supabase.from('inventory_counts').insert(rows);
        if (error) {
          throw error;
        }
      } else {
        // Simulación offline en caso de que falten credenciales
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      // Construir registro de historial local
      const recordSummary: SyncRecordItem[] = [];
      INITIAL_PRODUCTS.forEach((prod) => {
        const colorItems: SyncRecordColorBreakdown[] = [];
        let productSum = 0;
        INITIAL_COLORS.forEach((col) => {
          const qty = counts[prod.id]?.[col.id] ?? 0;
          if (qty > 0) {
            productSum += qty;
            colorItems.push({
              colorId: col.id,
              colorName: col.name,
              abbreviation: col.abbreviation,
              hex: col.hex,
              quantity: qty,
            });
          }
        });

        if (productSum > 0) {
          recordSummary.push({
            productId: prod.id,
            productName: prod.name,
            referenceCode: prod.referenceCode,
            totalQuantity: productSum,
            colors: colorItems,
          });
        }
      });

      const newRecord: SyncRecord = {
        id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `sync-${Date.now()}`,
        timestamp: formatDisplayTimestamp(now),
        isoDate: isoNow,
        totalUnits: grandTotal,
        summary: recordSummary,
      };

      const updatedHistory = [newRecord, ...syncHistory].slice(0, MAX_HISTORY_RECORDS);
      setSyncHistory(updatedHistory);
      try {
        localStorage.setItem(SYNC_HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
      } catch (histErr) {
        console.error('Error saving sync history to localStorage:', histErr);
      }

      // Éxito: Limpiar borrador en localStorage y emitir háptica
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      const unitsCounted = grandTotal;
      setCounts({});
      triggerHaptic(25);
      setSyncStatus('success');
      setSyncMessage(`¡Sincronizado con éxito! (${unitsCounted} pçs guardadas)`);
      return true;
    } catch (err: unknown) {
      console.error('Error during Supabase sync:', err);
      setSyncStatus('error');
      const msg = err instanceof Error ? err.message : 'Error al conectar con Supabase';
      setSyncMessage(`Fallo de sincronización: ${msg}`);
      return false;
    }
  };

  const exportCurrentToCSV = useCallback((): boolean => {
    return exportInventoryToCSV(counts, INITIAL_PRODUCTS, INITIAL_COLORS);
  }, [counts]);

  return {
    counts,
    getQuantity,
    updateQuantity,
    getProductTotal,
    grandTotal,
    syncStatus,
    syncMessage,
    syncToSupabase,
    triggerHaptic,
    syncHistory,
    exportCurrentToCSV,
  };
}
