export interface Product {
  id: string;
  name: string;
  referenceCode: string; // e.g. 'REF-001'
  category?: string;
}

export interface Color {
  id: string;
  name: string;
  abbreviation: string; // e.g. 'PT', 'OW', 'VM'
  hex: string;
}

export interface InventoryCountRow {
  id?: string;
  product_id: string;
  color_id: string;
  quantity: number;
  timestamp?: string;
}

/**
 * Diccionario reactivo de conteo:
 * counts[productId][colorId] = quantity
 */
export type CountsMap = Record<string, Record<string, number>>;

export interface SyncRecordColorBreakdown {
  colorId: string;
  colorName: string;
  abbreviation: string;
  hex: string;
  quantity: number;
}

export interface SyncRecordItem {
  productId: string;
  productName: string;
  referenceCode: string;
  totalQuantity: number;
  colors: SyncRecordColorBreakdown[];
}

export interface SyncRecord {
  id: string;
  timestamp: string; // Fecha legible, ej: '18 Oct, 15:30'
  isoDate: string;
  totalUnits: number;
  summary: SyncRecordItem[];
}

