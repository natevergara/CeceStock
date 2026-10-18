import React from 'react';
import { CloudUpload, CheckCircle2, AlertCircle, Loader2, Eye } from 'lucide-react';
import { SyncStatus } from '../hooks/useInventory';

interface SyncButtonProps {
  status: SyncStatus;
  message: string;
  totalUnits: number;
  onSync: () => void;
  onOpenAudit?: () => void;
}

export const SyncButton: React.FC<SyncButtonProps> = ({
  status,
  message,
  totalUnits,
  onSync,
  onOpenAudit,
}) => {
  const isSyncing = status === 'syncing';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  const handleClickPrimary = () => {
    if (isSyncing) return;
    // Si hay unidades y handler de auditoría, abrir el modal de pre-sincronización
    if (totalUnits > 0 && onOpenAudit) {
      onOpenAudit();
    } else {
      onSync();
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      {message && (
        <div
          className={`text-[11px] font-medium text-center truncate px-2 py-0.5 rounded leading-tight ${
            isSuccess
              ? 'text-accent-success'
              : isError
              ? 'text-rose-400'
              : 'text-text-secondary'
          }`}
        >
          {message}
        </div>
      )}

      <div className="flex items-center gap-1.5 w-full">
        {/* Botón Principal Guardar / Sincronizar */}
        <button
          type="button"
          disabled={isSyncing}
          onClick={handleClickPrimary}
          className={`flex-1 h-11 sm:h-12 py-2 sm:py-2.5 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-between shadow-lg transition-all duration-200 active:scale-[0.97] cursor-pointer ${
            isSuccess
              ? 'bg-accent-success text-white shadow-emerald-950/40'
              : isError
              ? 'bg-rose-600 text-white shadow-rose-950/40'
              : 'bg-accent-sapphire text-white shadow-blue-950/50 hover:bg-blue-600'
          } ${isSyncing ? 'opacity-80 cursor-wait' : ''}`}
        >
          <div className="flex items-center gap-2">
            {isSyncing ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" strokeWidth={1.75} />
            ) : isSuccess ? (
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.75} />
            ) : isError ? (
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.75} />
            ) : (
              <CloudUpload className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.75} />
            )}
            <span className="tracking-tight text-xs sm:text-sm">
              {isSyncing
                ? 'Sincronizando...'
                : isSuccess
                ? '¡Inventario Guardado!'
                : 'Guardar / Sincronizar'}
            </span>
          </div>

          {/* Badge de Total de unidades */}
          <span className="px-2 py-0.5 rounded-md bg-black/30 text-white font-bold text-xs tabular-nums">
            {totalUnits} {totalUnits === 1 ? 'pç' : 'pçs'}
          </span>
        </button>

        {/* Botón de Inspección / Ojo para Auditoría Previa */}
        {onOpenAudit && (
          <button
            type="button"
            disabled={isSyncing || totalUnits === 0}
            onClick={onOpenAudit}
            title="Revisar auditoría de lote"
            aria-label="Revisar auditoría de lote"
            className="w-11 sm:w-12 h-11 sm:h-12 rounded-xl bg-input border border-border-subtle/80 hover:bg-slate-800 text-text-secondary hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0 transition-all duration-200 active:scale-[0.95]"
          >
            <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-accent-sapphire" strokeWidth={1.75} />
          </button>
        )}
      </div>
    </div>
  );
};

