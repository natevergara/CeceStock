import React, { useMemo } from 'react';
import { X, CloudUpload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { CountsMap } from '../types/inventory';
import { buildInventorySummary } from '../lib/inventorySummary';
import { isDarkColor } from '../lib/colorUtils';

interface PreSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSync: () => void;
  counts: CountsMap;
  totalUnits: number;
  isSyncing: boolean;
}

export const PreSyncModal: React.FC<PreSyncModalProps> = ({
  isOpen,
  onClose,
  onConfirmSync,
  counts,
  totalUnits,
  isSyncing,
}) => {
  // Prendas y colores con cantidad > 0 (misma fuente que se envía a Supabase)
  const countedItems = useMemo(
    () =>
      buildInventorySummary(counts).map((item) => ({
        product: { id: item.productId, name: item.productName, referenceCode: item.referenceCode },
        colors: item.colors.map((c) => ({
          id: c.colorId,
          abbreviation: c.abbreviation,
          hex: c.hex,
          quantity: c.quantity,
        })),
        total: item.totalQuantity,
      })),
    [counts]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-sm transition-opacity duration-200"
      onClick={onClose}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      <div
        className="w-full max-w-md mx-auto max-h-[88dvh] flex flex-col bg-card border-t border-x border-border-subtle rounded-t-2xl shadow-2xl overflow-hidden select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Manija táctil superior */}
        <div className="w-full flex justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-600/60" />
        </div>

        {/* Encabezado del Modal */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle/70">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent-sapphire/20 border border-accent-sapphire/40 flex items-center justify-center text-accent-sapphire">
              <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-white leading-tight">
                Auditoría de Lote
              </h2>
              <p className="text-[10px] text-text-secondary leading-tight">
                Verifica las cantidades antes de enviar a Supabase
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-input hover:bg-slate-800 text-text-secondary hover:text-white flex items-center justify-center transition-colors active:scale-95"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* Lista Compacta de Prendas Contadas */}
        <div className="flex-1 overflow-y-auto px-3.5 py-2.5 space-y-2.5 min-h-[140px] max-h-[50dvh]">
          {countedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-text-secondary gap-2">
              <AlertCircle className="w-8 h-8 text-amber-400/80" strokeWidth={1.75} />
              <p className="text-xs font-medium text-slate-300">
                No hay prendas con cantidad mayor a cero.
              </p>
              <p className="text-[11px] text-slate-400">
                Ingresa cantidades en la tarjeta del producto antes de sincronizar.
              </p>
            </div>
          ) : (
            countedItems.map(({ product, colors, total }) => (
              <div
                key={product.id}
                className="bg-obsidian/70 border border-border-subtle/80 rounded-xl p-2.5 flex flex-col gap-1.5"
              >
                {/* Cabecera de la prenda */}
                <div className="flex items-center justify-between border-b border-border-subtle/40 pb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent-sapphire/20 text-accent-focus border border-accent-sapphire/30">
                      {product.referenceCode}
                    </span>
                    <span className="text-xs font-semibold text-white tracking-tight">
                      {product.name}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 tabular-nums bg-emerald-950/40 border border-emerald-800/40 px-1.5 py-0.5 rounded">
                    {total} {total === 1 ? 'pç' : 'pçs'}
                  </span>
                </div>

                {/* Chips de colores y cantidades */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {colors.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-input/90 border border-border-subtle/80 text-[11px]"
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          isDarkColor(c.hex)
                            ? 'ring-1 ring-slate-400/80 border border-slate-500'
                            : ''
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="font-bold text-slate-300 text-[10px]">
                        {c.abbreviation}
                      </span>
                      <span className="font-extrabold text-white tabular-nums text-xs">
                        {c.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Resumen Total y Acciones Inferiores con Safe Area */}
        <div className="border-t border-border-subtle/70 bg-card p-3.5 pb-[max(env(safe-area-inset-bottom,16px),16px)] flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-medium text-text-secondary">
              Total de piezas del lote:
            </span>
            <span className="text-base font-extrabold text-white tabular-nums">
              {totalUnits} {totalUnits === 1 ? 'prenda' : 'prendas'}
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              disabled={isSyncing}
              onClick={onClose}
              className="flex-1 h-11 py-2 px-3 rounded-xl border border-border-subtle bg-input/80 hover:bg-input text-xs font-semibold text-text-secondary hover:text-white transition-all active:scale-[0.97]"
            >
              Volver a editar
            </button>

            <button
              type="button"
              disabled={isSyncing || totalUnits === 0}
              onClick={onConfirmSync}
              className="flex-[2] h-11 py-2 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-accent-sapphire hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-950/40 flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <CloudUpload className="w-4 h-4" strokeWidth={2} />
                  <span>Confirmar y Enviar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
