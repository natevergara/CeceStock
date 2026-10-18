import { useState, useRef, useCallback } from 'react';
import { Sparkles, Layers, WifiOff, History } from 'lucide-react';
import { INITIAL_PRODUCTS, INITIAL_COLORS, SWIPE_THRESHOLD_PX } from './lib/constants';
import { useInventory } from './hooks/useInventory';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { ProductCard } from './components/ProductCard';
import { CarouselIndicator } from './components/CarouselIndicator';
import { SyncButton } from './components/SyncButton';
import { PreSyncModal } from './components/PreSyncModal';
import { HistoryDrawer } from './components/HistoryDrawer';

export function App() {
  const [activeProductIndex, setActiveProductIndex] = useState(0);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const isOnline = useOnlineStatus();

  const {
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
  } = useInventory();


  // Matriz de referencias para auto-avance con Enter
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const setInputRef = useCallback((index: number, el: HTMLInputElement | null) => {
    inputRefs.current[index] = el;
  }, []);

  const handleEnterNext = useCallback((currentIndex: number) => {
    const nextIndex = (currentIndex + 1) % INITIAL_COLORS.length;
    const nextEl = inputRefs.current[nextIndex];
    if (nextEl) {
      nextEl.focus();
      nextEl.select();
    }
  }, []);

  // Navegación de producto con háptica
  const goToProduct = useCallback(
    (index: number) => {
      if (index >= 0 && index < INITIAL_PRODUCTS.length && index !== activeProductIndex) {
        triggerHaptic(10);
        setActiveProductIndex(index);
      }
    },
    [activeProductIndex, triggerHaptic]
  );

  // Manejo de Gestos Táctiles (Swipe Horizontal >= 50px)
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Solo considerar swipe si el movimiento horizontal supera al vertical y es >= 50px
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) >= SWIPE_THRESHOLD_PX) {
      if (deltaX < 0) {
        // Deslizar hacia la izquierda -> Siguiente producto
        if (activeProductIndex < INITIAL_PRODUCTS.length - 1) {
          goToProduct(activeProductIndex + 1);
        }
      } else {
        // Deslizar hacia la derecha -> Producto anterior
        if (activeProductIndex > 0) {
          goToProduct(activeProductIndex - 1);
        }
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleConfirmAuditSync = async () => {
    const success = await syncToSupabase();
    if (success) {
      setIsAuditModalOpen(false);
    }
  };

  const currentProduct = INITIAL_PRODUCTS[activeProductIndex];
  const currentTotal = getProductTotal(currentProduct.id);

  return (
    <div
      className="flex flex-col justify-between w-full h-[100dvh] max-w-md mx-auto px-3 pt-[env(safe-area-inset-top,8px)] pb-[env(safe-area-inset-bottom,8px)] bg-obsidian text-text-primary select-none overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Barra Superior / Header de Marca Compacto */}
      <header className="flex items-center justify-between py-1.5 border-b border-border-subtle/50 mb-1 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-accent-sapphire/20 border border-accent-sapphire/40 flex items-center justify-center text-accent-sapphire shrink-0">
            <Sparkles className="w-3.5 h-3.5" strokeWidth={1.75} />
          </div>
          <div className="flex flex-col">
            <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-white leading-none">
              CeceStock
            </h1>
            <span className="text-[9px] sm:text-[10px] text-text-secondary leading-tight mt-0.5">
              Cece Boutique • Conteo Físico
            </span>
          </div>
        </div>

        {/* Indicador de Estado, Historial y Contador Global */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {!isOnline && (
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-400 font-medium animate-pulse"
              title="Modo sin conexión"
            >
              <WifiOff className="w-2.5 h-2.5 shrink-0" strokeWidth={2} />
              <span>Offline</span>
            </div>
          )}

          {/* Botón Discreto de Historial de Sincronizaciones */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              setIsHistoryDrawerOpen(true);
            }}
            className="w-7 h-7 rounded-lg bg-card hover:bg-input border border-border-subtle flex items-center justify-center text-text-secondary hover:text-white transition-all active:scale-95 cursor-pointer relative"
            title="Historial de sincronizaciones recientes"
            aria-label="Ver historial de sincronizaciones"
          >
            <History className="w-3.5 h-3.5" strokeWidth={1.75} />
            {syncHistory.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-accent-sapphire text-[8px] font-bold text-white flex items-center justify-center border border-obsidian">
                {syncHistory.length}
              </span>
            )}
          </button>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-card border border-border-subtle text-[11px] text-text-secondary">
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="font-semibold text-white tabular-nums">{grandTotal}</span>
            <span className="text-[10px]">total</span>
          </div>
        </div>
      </header>

      {/* Zona Central: Tarjeta Autónoma de Producto con Swipe (Sin scroll vertical forzado) */}
      <main className="flex-1 flex flex-col justify-center min-h-0 py-1">
        <ProductCard
          product={currentProduct}
          colors={INITIAL_COLORS}
          totalProductCount={currentTotal}
          getQuantity={getQuantity}
          onUpdateQuantity={updateQuantity}
          setInputRef={setInputRef}
          onEnterNext={handleEnterNext}
        />
      </main>

      {/* Zona Inferior: Paginación y Botón de Sincronización */}
      <footer className="flex flex-col gap-1.5 pt-1.5 border-t border-border-subtle/40 shrink-0">
        {/* Indicador de 7 Dots con píldora expandida */}
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] sm:text-[11px] font-bold text-text-secondary flex items-center gap-1">
            <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={1.75} />
            {activeProductIndex + 1} / {INITIAL_PRODUCTS.length}
          </span>

          <CarouselIndicator
            total={INITIAL_PRODUCTS.length}
            activeIndex={activeProductIndex}
            onSelect={goToProduct}
          />

          <span className="text-[10px] sm:text-[11px] text-text-secondary font-medium truncate max-w-[80px] text-right">
            {currentProduct.referenceCode}
          </span>
        </div>

        {/* Botón Principal de Sincronización con notch awareness */}
        <SyncButton
          status={syncStatus}
          message={syncMessage}
          totalUnits={grandTotal}
          onSync={syncToSupabase}
          onOpenAudit={() => {
            triggerHaptic(10);
            setIsAuditModalOpen(true);
          }}
        />
      </footer>

      {/* Modal de Resumen de Auditoría Pre-Sincronización */}
      <PreSyncModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        onConfirmSync={handleConfirmAuditSync}
        counts={counts}
        totalUnits={grandTotal}
        isSyncing={syncStatus === 'syncing'}
      />

      {/* Hoja Deslizante de Historial de Sincronizaciones y Respaldo CSV */}
      <HistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        records={syncHistory}
        onExportCSV={exportCurrentToCSV}
        currentDraftUnits={grandTotal}
      />
    </div>
  );
};


export default App;
