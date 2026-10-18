import React from 'react';
import { Shirt } from 'lucide-react';
import { Product, Color } from '../types/inventory';
import { ColorInput } from './ColorInput';

interface ProductCardProps {
  product: Product;
  colors: Color[];
  totalProductCount: number;
  getQuantity: (productId: string, colorId: string) => number;
  onUpdateQuantity: (productId: string, colorId: string, qty: number) => void;
  setInputRef: (colorIndex: number, el: HTMLInputElement | null) => void;
  onEnterNext: (colorIndex: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  colors,
  totalProductCount,
  getQuantity,
  onUpdateQuantity,
  setInputRef,
  onEnterNext,
}) => {
  return (
    <div className="flex flex-col w-full bg-card/90 rounded-2xl border border-border-subtle p-2.5 sm:p-3 shadow-xl backdrop-blur-sm">
      {/* Cabecera Compacta de la Tarjeta */}
      <div className="flex items-center justify-between pb-2 border-b border-border-subtle/70 mb-2">
        {/* Izquierda: Silueta + REF */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-input flex items-center justify-center text-accent-sapphire border border-border-subtle shrink-0">
            <Shirt className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.75} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary leading-none">
              {product.referenceCode}
            </span>
            <span className="text-[10px] text-text-secondary/80 leading-tight">
              {product.category || 'Cece Boutique'}
            </span>
          </div>
        </div>

        {/* Derecha: Nombre del producto + Badge Suma Total */}
        <div className="flex items-center gap-2 text-right">
          <h2 className="text-sm sm:text-base font-bold text-text-primary tracking-tight truncate max-w-[130px] sm:max-w-[170px]">
            {product.name}
          </h2>
          <div className="px-2 py-0.5 rounded-full bg-accent-sapphire/20 border border-accent-sapphire/40 text-accent-sapphire font-bold text-xs sm:text-sm tabular-nums flex items-center gap-1">
            <span>{totalProductCount}</span>
            <span className="text-[9px] font-normal uppercase text-text-secondary">pçs</span>
          </div>
        </div>
      </div>

      {/* Cuerpo: Cuadrícula Compacta de 2 Columnas de Colores (Entra sin forzar scroll) */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
        {colors.map((color, idx) => (
          <ColorInput
            key={color.id}
            color={color}
            quantity={getQuantity(product.id, color.id)}
            onChange={(qty) => onUpdateQuantity(product.id, color.id, qty)}
            onEnterNext={() => onEnterNext(idx)}
            inputRef={(el) => setInputRef(idx, el)}
          />
        ))}
      </div>
    </div>
  );
};
