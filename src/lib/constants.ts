import { Product, Color } from '../types/inventory';

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'prod-001', name: 'Conjunto Soie', referenceCode: 'REF-001', category: 'Conjuntos' },
  { id: 'prod-002', name: 'Conjunto Venus', referenceCode: 'REF-002', category: 'Conjuntos' },
  { id: 'prod-003', name: 'Macaquino Gola', referenceCode: 'REF-003', category: 'Macaquinos' },
  { id: 'prod-004', name: 'Macaquino Channel', referenceCode: 'REF-004', category: 'Macaquinos' },
  { id: 'prod-005', name: 'Macaquino Paris', referenceCode: 'REF-005', category: 'Macaquinos' },
  { id: 'prod-006', name: 'Macaquino Yan', referenceCode: 'REF-006', category: 'Macaquinos' },
  { id: 'prod-007', name: 'Conjunto Moly', referenceCode: 'REF-007', category: 'Conjuntos' },
];

export const INITIAL_COLORS: Color[] = [
  { id: 'col-pt', name: 'Preto', abbreviation: 'PT', hex: '#18181B' },
  { id: 'col-ow', name: 'Off White', abbreviation: 'OW', hex: '#FAF5EF' },
  { id: 'col-rs', name: 'Rosa', abbreviation: 'RS', hex: '#F472B6' },
  { id: 'col-ro', name: 'Rose', abbreviation: 'RO', hex: '#FECDD3' },
  { id: 'col-vm', name: 'Verde Menta', abbreviation: 'VM', hex: '#6EE7B7' },
  { id: 'col-vo', name: 'Verde Oliva', abbreviation: 'VO', hex: '#4D7C0F' },
  { id: 'col-ve', name: 'Vermelho', abbreviation: 'VE', hex: '#DC2626' },
  { id: 'col-ll', name: 'Lilás', abbreviation: 'LL', hex: '#C084FC' },
  { id: 'col-am', name: 'Amarelo', abbreviation: 'AM', hex: '#FACC15' },
  { id: 'col-az', name: 'Azul', abbreviation: 'AZ', hex: '#3B82F6' },
  { id: 'col-vn', name: 'Vinho', abbreviation: 'VN', hex: '#831843' },
  { id: 'col-mr', name: 'Marrom', abbreviation: 'MR', hex: '#78350F' },
  { id: 'col-ar', name: 'Areia', abbreviation: 'AR', hex: '#E7D8B0' },
];

export const LOCAL_STORAGE_KEY = 'cece_stock_inventory_draft_v1';
export const SYNC_HISTORY_STORAGE_KEY = 'cece_stock_sync_history_v1';
export const MAX_HISTORY_RECORDS = 10;
export const SWIPE_THRESHOLD_PX = 50;

