import { CountsMap, Product, Color } from '../types/inventory';
import { INITIAL_PRODUCTS, INITIAL_COLORS } from './constants';

/**
 * Formatea una fecha en componentes de dos dígitos.
 */
function padZero(num: number): string {
  return num.toString().padStart(2, '0');
}

/**
 * Genera el nombre de archivo con formato: cece_stock_inventario_YYYY-MM-DD_HHmm.csv
 */
export function generateCSVFileName(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = padZero(date.getMonth() + 1);
  const day = padZero(date.getDate());
  const hours = padZero(date.getHours());
  const minutes = padZero(date.getMinutes());

  return `cece_stock_inventario_${year}-${month}-${day}_${hours}${minutes}.csv`;
}

/**
 * Genera una fecha/hora legible para el registro CSV: YYYY-MM-DD HH:mm:ss
 */
export function formatCSVTimestamp(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = padZero(date.getMonth() + 1);
  const day = padZero(date.getDate());
  const hours = padZero(date.getHours());
  const minutes = padZero(date.getMinutes());
  const seconds = padZero(date.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Exporta el conteo de inventario a formato CSV y dispara la descarga en el navegador.
 * Cabeceras: Referencia,Prenda,Abreviatura,Color,Cantidad,FechaHora
 * 
 * @param counts Mapa reactivo de conteos [productId][colorId] = quantity
 * @param products Lista de productos (por defecto INITIAL_PRODUCTS)
 * @param colors Lista de colores (por defecto INITIAL_COLORS)
 * @returns boolean true si se exportaron registros, false si el conteo estaba vacío
 */
export function exportInventoryToCSV(
  counts: CountsMap,
  products: Product[] = INITIAL_PRODUCTS,
  colors: Color[] = INITIAL_COLORS
): boolean {
  const now = new Date();
  const timestampStr = formatCSVTimestamp(now);
  const rows: string[] = [];

  // Cabecera oficial
  rows.push('Referencia,Prenda,Abreviatura,Color,Cantidad,FechaHora');

  let totalItemsCounted = 0;

  products.forEach((prod) => {
    colors.forEach((col) => {
      const qty = counts[prod.id]?.[col.id] ?? 0;
      if (qty > 0) {
        totalItemsCounted += qty;
        // Escapar comillas dobles en campos de texto
        const safeRef = prod.referenceCode.replace(/"/g, '""');
        const safeName = prod.name.replace(/"/g, '""');
        const safeAbbr = col.abbreviation.replace(/"/g, '""');
        const safeColor = col.name.replace(/"/g, '""');

        rows.push(`"${safeRef}","${safeName}","${safeAbbr}","${safeColor}",${qty},"${timestampStr}"`);
      }
    });
  });

  if (totalItemsCounted === 0) {
    return false;
  }

  // Agregar BOM UTF-8 (\uFEFF) para compatibilidad con Excel y Google Sheets
  const csvContent = '\uFEFF' + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const filename = generateCSVFileName(now);

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();

  // Limpieza de recursos
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 150);

  return true;
}
