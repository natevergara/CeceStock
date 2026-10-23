import React from 'react';
import { Color } from '../types/inventory';
import { isDarkColor, isLightColor } from '../lib/colorUtils';

interface ColorInputProps {
  color: Color;
  quantity: number;
  onChange: (value: number) => void;
  onEnterNext: () => void;
  inputRef: (el: HTMLInputElement | null) => void;
  className?: string;
}

const ColorInputBase: React.FC<ColorInputProps> = ({
  color,
  quantity,
  onChange,
  onEnterNext,
  inputRef,
  className = '',
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
      if (e.repeat) return;
      e.preventDefault();
      onEnterNext();
    }
  };

  const hasStock = quantity > 0;

  // Contraste cromático para evitar que tonos oscuros se fundan con #13161F
  const darkColor = isDarkColor(color.hex);
  const lightColor = isLightColor(color.hex);

  return (
    <div
      className={`flex items-center justify-between py-1.5 px-2 rounded-xl transition-[border-color,box-shadow,background-color] duration-150 border focus-within:border-accent-focus focus-within:ring-1 focus-within:ring-accent-focus ${
        hasStock
          ? 'bg-emerald-500/[0.07] border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.06)]'
          : 'bg-card border-border-subtle'
      } ${className}`}
    >
      {/* Indicador de Color y Abreviatura */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 pr-1">
        <div
          className={`w-6 h-6 rounded-full shrink-0 transition-all duration-200 ${
            hasStock
              ? 'ring-2 ring-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]'
              : darkColor
              ? 'ring-1 ring-slate-500/80 border border-slate-600/90 shadow-[0_0_4px_rgba(255,255,255,0.1)]'
              : lightColor
              ? 'ring-1 ring-border-subtle shadow-sm'
              : 'shadow-sm'
          }`}
          style={{ backgroundColor: color.hex }}
          title={color.name}
        />
        <div className="flex flex-col min-w-0">
          <span
            className={`text-xs font-bold tracking-wider uppercase leading-tight transition-colors ${
              hasStock ? 'text-emerald-300' : 'text-text-primary'
            }`}
          >
            {color.abbreviation}
          </span>
          <span className="text-[10px] text-text-secondary truncate leading-tight">
            {color.name}
          </span>
        </div>
      </div>

      {/* Input Numérico con Tabular Nums, Centrado, Auto-Select en WebKit y Auto-Scroll */}
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        enterKeyHint="next"
        pattern="[0-9]*"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        aria-label={`${color.name} (${color.abbreviation})`}
        value={quantity === 0 ? '' : quantity}
        placeholder="0"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={(e) => {
          e.currentTarget.select();
          e.currentTarget.scrollIntoView({ behavior: 'auto', block: 'nearest' });
        }}
        className={`w-11 sm:w-12 h-9 text-center font-bold text-sm sm:text-base bg-input rounded-lg border focus:outline-none focus:border-accent-focus tabular-nums transition-[border-color,background-color,transform] active:scale-[0.97] placeholder:text-text-secondary/40 select-text ${
          hasStock ? 'border-emerald-500/40 text-emerald-300 font-extrabold' : 'border-border-subtle text-text-primary'
        }`}
      />
    </div>
  );
};

export const ColorInput = React.memo(ColorInputBase);
