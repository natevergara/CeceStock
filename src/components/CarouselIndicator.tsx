import React from 'react';

interface CarouselIndicatorProps {
  total: number;
  activeIndex: number;
  onSelect: (index: number) => void;
}

export const CarouselIndicator: React.FC<CarouselIndicatorProps> = ({
  total,
  activeIndex,
  onSelect,
}) => {
  return (
    <div className="flex items-center justify-center gap-1.5 py-1">
      {Array.from({ length: total }).map((_, idx) => {
        const isActive = idx === activeIndex;
        return (
          <button
            key={idx}
            type="button"
            aria-label={`Ir al producto ${idx + 1}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onSelect(idx)}
            className={`relative after:absolute after:-inset-2 after:content-[''] h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer active:scale-[0.97] ${
              isActive
                ? 'w-6 bg-accent-sapphire shadow-[0_0_8px_rgba(59,130,246,0.6)]'
                : 'w-1.5 sm:w-2 bg-border-subtle hover:bg-text-secondary/50'
            }`}
          />
        );
      })}
    </div>
  );
};
