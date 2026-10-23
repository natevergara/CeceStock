import React, { useState, useRef, useEffect } from 'react';
import { X, History, Download, ChevronDown, ChevronUp, CheckCircle2, Clock } from 'lucide-react';
import { SyncRecord } from '../types/inventory';
import { MAX_HISTORY_RECORDS } from '../lib/constants';
import { isDarkColor } from '../lib/colorUtils';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  records: SyncRecord[];
  /** Descarga el CSV del borrador actual. Devuelve `false` si no hay nada que exportar. */
  onExportCSV: () => boolean;
  currentDraftUnits: number;
}

interface ExportFeedback {
  text: string;
  ok: boolean;
}

const FEEDBACK_DURATION_MS = 3000;

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  records,
  onExportCSV,
  currentDraftUnits,
}) => {
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
  const [exportFeedback, setExportFeedback] = useState<ExportFeedback | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Evita setState tras desmontar y timers superpuestos
  useEffect(
    () => () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    },
    []
  );

  if (!isOpen) return null;

  const toggleExpand = (id: string) => {
    setExpandedRecordId((prev) => (prev === id ? null : id));
  };

  const handleExportCSV = () => {
    const ok = onExportCSV();
    setExportFeedback({
      ok,
      text: ok ? '¡CSV descargado con éxito!' : 'Sin prendas contadas en el borrador actual.',
    });
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setExportFeedback(null), FEEDBACK_DURATION_MS);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-sm transition-opacity duration-200"
      onClick={onClose}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      <div
        className="w-full max-w-md mx-auto max-h-[90dvh] flex flex-col bg-card border-t border-x border-border-subtle rounded-t-2xl shadow-2xl overflow-hidden select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Manija táctil */}
        <div className="w-full flex justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-600/60" />
        </div>

        {/* Encabezado */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle/70">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent-sapphire/20 border border-accent-sapphire/40 flex items-center justify-center text-accent-sapphire">
              <History className="w-4 h-4" strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-bold text-sm sm:text-base text-white leading-tight">
                  Historial de Lotes
                </h2>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                  {records.length}/{MAX_HISTORY_RECORDS}
                </span>
              </div>
              <p className="text-[10px] text-text-secondary leading-tight">
                Últimas sincronizaciones guardadas en este dispositivo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-input hover:bg-slate-800 text-text-secondary hover:text-white flex items-center justify-center transition-colors active:scale-95"
            aria-label="Cerrar historial"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* Lista de Registros */}
        <div className="flex-1 overflow-y-auto px-3.5 py-2.5 space-y-2 min-h-[160px] max-h-[55dvh]">
          {records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-text-secondary gap-2">
              <Clock className="w-8 h-8 text-slate-500" strokeWidth={1.5} />
              <p className="text-xs font-medium text-slate-300">
                No hay lotes sincronizados todavía.
              </p>
              <p className="text-[11px] text-slate-400">
                Cada vez que sincronices un conteo con éxito, se guardará aquí.
              </p>
            </div>
          ) : (
            records.map((record) => {
              const isExpanded = expandedRecordId === record.id;
              return (
                <div
                  key={record.id}
                  className="bg-obsidian/70 border border-border-subtle/80 rounded-xl overflow-hidden transition-all"
                >
                  {/* Tarjeta de Resumen del Lote */}
                  <div
                    onClick={() => toggleExpand(record.id)}
                    className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-input/30 active:bg-input/60 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white tracking-tight">
                          {record.timestamp}
                        </span>
                        <span className="text-[10px] text-text-secondary">
                          {record.summary.length} {record.summary.length === 1 ? 'modelo' : 'modelos'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-md tabular-nums">
                        {record.totalUnits} pçs
                      </span>
                      <span className="text-text-secondary">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Desglose Expandible */}
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-border-subtle/50 bg-black/40 space-y-2">
                      {record.summary.map((item) => (
                        <div key={item.productId} className="text-xs space-y-1">
                          <div className="flex items-center justify-between text-slate-300 font-semibold pt-1">
                            <span className="flex items-center gap-1.5">
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-accent-sapphire/20 text-accent-focus border border-accent-sapphire/30">
                                {item.referenceCode}
                              </span>
                              <span>{item.productName}</span>
                            </span>
                            <span className="tabular-nums font-bold text-white text-[11px]">
                              {item.totalQuantity} pçs
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1 pl-1">
                            {item.colors.map((col) => (
                              <span
                                key={col.colorId}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-input/80 border border-border-subtle/70 text-[10px]"
                              >
                                <span
                                  className={`w-2 h-2 rounded-full shrink-0 ${
                                    isDarkColor(col.hex)
                                      ? 'ring-1 ring-slate-400/80 border border-slate-500'
                                      : ''
                                  }`}
                                  style={{ backgroundColor: col.hex }}
                                />
                                <span className="text-slate-300 font-bold">{col.abbreviation}</span>
                                <span className="tabular-nums font-semibold text-white">
                                  {col.quantity}
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pie de Página con Botón de Exportación CSV de Emergencia */}
        <div className="border-t border-border-subtle/70 bg-card p-3.5 pb-[max(env(safe-area-inset-bottom,16px),16px)] flex flex-col gap-2 shrink-0">
          {exportFeedback && (
            <div
              className={`text-[11px] font-semibold text-center px-2 py-1 rounded transition-all ${
                exportFeedback.ok
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                  : 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
              }`}
            >
              {exportFeedback.text}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={handleExportCSV}
              className="w-full h-11 py-2 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/80 hover:border-slate-600 flex items-center justify-between shadow-md transition-all active:scale-[0.97] cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-accent-sapphire" strokeWidth={2} />
                <span>Descargar CSV de Respaldo</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-slate-300 font-medium tabular-nums">
                {currentDraftUnits > 0 ? `${currentDraftUnits} pçs actuales` : 'Borrador'}
              </span>
            </button>
            <p className="text-[9px] text-text-secondary text-center leading-tight">
              Permite rescatar el conteo físico sin conexión ante caídas de servidor o red.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
