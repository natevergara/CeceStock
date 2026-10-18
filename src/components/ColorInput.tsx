import React from 'react';
import { Color } from '../types/inventory';

interface ColorInputProps {
  color: Color;
  quantity: number;
  onChange: (value: number) => void;
  onEnterNext: () => void;
  inputRef: (el: HTMLInputElement | null) => void;
}

export const ColorInput: React.FC<ColorInputProps> = ({
  color,
  quantity,
  onChange,
  onEnterNext,
  inputRef,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange(0);
      return;
    }
    const parsed = parseInt(raw.replace(/\D/g, ''), 10);
    onChange(isNaN(parsed) ? 0 : parsed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onEnterNext();
    }
  };

  // Cálculo de contraste cromático para evitar que tonos oscuros se fundan con #13161F
  const isDarkColor = (() => {
    const hex = color.hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance < 65;
  })();

  const isLightColor = (() => {
    const hex = color.hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance > 200;
  })();

  return (
    <div className="flex items-center justify-between py-1.5 px-2 rounded-xl bg-card border border-border-subtle focus-within:border-accent-focus focus-within:ring-1 focus-within:ring-accent-focus transition-all duration-150 active:scale-[0.98]">
      {/* Indicador de Color y Abreviatura */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 pr-1">
        <div
          className={`w-6 h-6 rounded-full shrink-0 shadow-sm transition-transform ${
            isDarkColor
              ? 'ring-1 ring-slate-500/80 border border-slate-600/90 shadow-[0_0_4px_rgba(255,255,255,0.1)]'
              : isLightColor
              ? 'ring-1 ring-border-subtle'
              : ''
          }`}
          style={{ backgroundColor: color.hex }}
          title={color.name}
        />
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold tracking-wider text-text-primary uppercase leading-tight">
            {color.abbreviation}
          </span>
          <span className="text-[10px] text-text-secondary truncate leading-tight">
            {color.name}
          </span>
        </div>
      </div>

      {/* Input Numérico con Tabular Nums, Centrado y Auto-Select */}
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={quantity === 0 ? '' : quantity}
        placeholder="0"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={(e) => e.target.select()}
        className="w-11 sm:w-12 h-9 text-center font-bold text-sm sm:text-base text-text-primary bg-input rounded-lg border border-border-subtle focus:outline-none focus:border-accent-focus tabular-nums transition-colors placeholder:text-text-secondary/40 select-text"
      />
    </div>
  );
};
