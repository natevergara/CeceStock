import { Color, CountsMap, InventoryCountRow, Product, SyncRecordItem } from '../types/inventory';
import { INITIAL_COLORS, INITIAL_PRODUCTS } from './constants';

/**
 * Construye el resumen de prendas contadas (solo cantidades > 0), en el orden del catálogo.
 *
 * @param counts Mapa de conteos [productId][colorId].
 * @param products Catálogo de productos.
 * @param colors Catálogo de colores.
 * @returns Un ítem por producto con al menos una unidad contada.
 */
export function buildInventorySummary(
  counts: CountsMap,
  products: Product[] = INITIAL_PRODUCTS,
  colors: Color[] = INITIAL_COLORS
): SyncRecordItem[] {
  const summary: SyncRecordItem[] = [];

  products.forEach((prod) => {
    const items: SyncRecordItem['colors'] = [];
    let total = 0;

    colors.forEach((col) => {
      const qty = counts[prod.id]?.[col.id] ?? 0;
      if (qty > 0) {
        total += qty;
        items.push({
          colorId: col.id,
          colorName: col.name,
          abbreviation: col.abbreviation,
          hex: col.hex,
          quantity: qty,
        });
      }
    });

    if (total > 0) {
      summary.push({
        productId: prod.id,
        productName: prod.name,
        referenceCode: prod.referenceCode,
        totalQuantity: total,
        colors: items,
      });
    }
  });

  return summary;
}

/**
 * Convierte un resumen en filas listas para insertar en `inventory_counts`.
 *
 * @param summary Resultado de {@link buildInventorySummary}.
 * @param isoTimestamp Fecha/hora ISO común a todas las filas del lote.
 */
export function summaryToRows(summary: SyncRecordItem[], isoTimestamp: string): InventoryCountRow[] {
  return summary.flatMap((item) =>
    item.colors.map((c) => ({
      product_id: item.productId,
      color_id: c.colorId,
      quantity: c.quantity,
      timestamp: isoTimestamp,
    }))
  );
}

/**
 * Suma todas las unidades de un resumen.
 *
 * @param summary Resultado de {@link buildInventorySummary}.
 */
export function summaryTotal(summary: SyncRecordItem[]): number {
  return summary.reduce((acc, item) => acc + item.totalQuantity, 0);
}

/**
 * Resta de `current` lo que ya fue enviado en `sent`, sin tocar nada más.
 * Así, lo que el operario tecleó mientras se sincronizaba no se pierde.
 *
 * @param current Conteo actual en memoria.
 * @param sent Instantánea que se envió a Supabase.
 * @returns Nuevo mapa sin productos vacíos (`{}` si no queda nada).
 */
export function subtractCounts(current: CountsMap, sent: CountsMap): CountsMap {
  const result: CountsMap = {};

  for (const [productId, colors] of Object.entries(current)) {
    const remaining: Record<string, number> = {};
    for (const [colorId, qty] of Object.entries(colors)) {
      const left = qty - (sent[productId]?.[colorId] ?? 0);
      if (left > 0) remaining[colorId] = left;
    }
    if (Object.keys(remaining).length > 0) result[productId] = remaining;
  }

  return result;
}
