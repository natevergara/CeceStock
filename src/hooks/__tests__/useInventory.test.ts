import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useInventory } from '../useInventory';
import { LOCAL_STORAGE_KEY } from '../../lib/constants';

// Mock de Supabase para controlar las respuestas en los tests
vi.mock('../../lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

describe('useInventory hook', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  // Test 1: Comprobar inicialización limpia y restauración correcta desde un borrador mockeado en localStorage
  it('inicializa con estado vacío y restaura correctamente desde un borrador mockeado en localStorage', () => {
    // 1. Inicialización limpia
    const { result: cleanResult } = renderHook(() => useInventory());
    expect(cleanResult.current.counts).toEqual({});
    expect(cleanResult.current.grandTotal).toBe(0);

    // 2. Restauración desde borrador mockeado en localStorage
    const mockDraft = {
      'prod-001': {
        'col-pt': 8,
        'col-ow': 4,
      },
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mockDraft));

    const { result: restoredResult } = renderHook(() => useInventory());
    expect(restoredResult.current.counts).toEqual(mockDraft);
    expect(restoredResult.current.getQuantity('prod-001', 'col-pt')).toBe(8);
    expect(restoredResult.current.getQuantity('prod-001', 'col-ow')).toBe(4);
    expect(restoredResult.current.getProductTotal('prod-001')).toBe(12);
    expect(restoredResult.current.grandTotal).toBe(12);
  });

  // Test 2: Comprobar que updateQuantity actualiza el estado y persiste en localStorage inmediatamente
  it('actualiza el estado y persiste en localStorage inmediatamente al invocar updateQuantity', () => {
    const { result } = renderHook(() => useInventory());

    // Actualizar cantidad a 15 para Preto en Conjunto Soie
    act(() => {
      result.current.updateQuantity('prod-001', 'col-pt', 15);
    });

    // Verificar estado en memoria
    expect(result.current.getQuantity('prod-001', 'col-pt')).toBe(15);
    expect(result.current.getProductTotal('prod-001')).toBe(15);
    expect(result.current.grandTotal).toBe(15);

    // Verificar persistencia inmediata en localStorage
    const savedInStorage = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
    expect(savedInStorage).toEqual({
      'prod-001': {
        'col-pt': 15,
      },
    });

    // Si se actualiza a 0, debe eliminarse de la clave y persistirse
    act(() => {
      result.current.updateQuantity('prod-001', 'col-pt', 0);
    });
    expect(result.current.getQuantity('prod-001', 'col-pt')).toBe(0);
    expect(result.current.grandTotal).toBe(0);

    const savedAfterZero = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
    expect(savedAfterZero['prod-001']).toEqual({});
  });

  // Test 3: Comprobar que getProductTotal y grandTotal calculan sumas exactas ignorando valores NaN o negativos
  it('calcula sumas exactas con getProductTotal y grandTotal ignorando valores NaN o negativos', () => {
    const { result } = renderHook(() => useInventory());

    act(() => {
      // Valores negativos se sanean a 0
      result.current.updateQuantity('prod-001', 'col-pt', -10);
      // Valores NaN se sanean a 0
      result.current.updateQuantity('prod-001', 'col-ow', NaN);
      // Valores válidos
      result.current.updateQuantity('prod-001', 'col-rs', 6);
      result.current.updateQuantity('prod-001', 'col-ro', 4);
      result.current.updateQuantity('prod-002', 'col-vm', 12);
    });

    // prod-001: 6 + 4 = 10 (los negativos y NaN deben dar 0)
    expect(result.current.getProductTotal('prod-001')).toBe(10);
    // prod-002: 12
    expect(result.current.getProductTotal('prod-002')).toBe(12);
    // Producto inexistente: 0
    expect(result.current.getProductTotal('prod-999')).toBe(0);
    // grandTotal: 10 + 12 = 22
    expect(result.current.grandTotal).toBe(22);
  });

  // Test 4: Comprobar que tras una sincronización exitosa a Supabase, localStorage se limpia y el estado se restablece a 0
  it('limpia localStorage y restablece el estado a 0 tras una sincronización exitosa a Supabase', async () => {
    const { result } = renderHook(() => useInventory());

    // Cargar datos en el inventario
    act(() => {
      result.current.updateQuantity('prod-001', 'col-pt', 5);
      result.current.updateQuantity('prod-002', 'col-ro', 3);
    });

    expect(result.current.grandTotal).toBe(8);
    expect(localStorage.getItem(LOCAL_STORAGE_KEY)).not.toBeNull();

    // Ejecutar sincronización
    let success = false;
    await act(async () => {
      success = await result.current.syncToSupabase();
    });

    expect(success).toBe(true);
    expect(result.current.syncStatus).toBe('success');

    // Comprobar que localStorage se limpió
    expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toBeNull();

    // Comprobar que los conteos se restablecieron a 0
    expect(result.current.counts).toEqual({});
    expect(result.current.grandTotal).toBe(0);
    expect(result.current.getQuantity('prod-001', 'col-pt')).toBe(0);
  });
});
