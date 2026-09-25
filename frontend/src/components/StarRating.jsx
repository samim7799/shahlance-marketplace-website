import { Star } from 'lucide-react';

/**
 * Additive: displays a 1-5 star rating (read-only or interactive).
 * Props:
 *  - value: current rating number (0-5)
 *  - onChange?: (n) => void — if provided, becomes interactive
 *  - size?: pixel size for stars (default 16)
 *  - showValue?: boolean
 */
export default function StarRating({ value = 0, onChange, size = 16, showValue = false }) {
  const rounded = Math.round(value * 10) / 10;
  const interactive = typeof onChange === 'function';

  return (
    <div className="inline-flex items-center gap-1" data-testid="star-rating">
      <div className="inline-flex items-center">
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = n <= Math.round(value);
          const Cmp = interactive ? 'button' : 'span';
          return (
            <Cmp
              key={n}
              type={interactive ? 'button' : undefined}
              onClick={interactive ? () => onChange(n) : undefined}
              className={`inline-flex ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
              data-testid={interactive ? `star-rating-${n}` : undefined}
              aria-label={interactive ? `Rate ${n} star${n > 1 ? 's' : ''}` : undefined}
            >
              <Star
                size={size}
                className={filled ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}
                strokeWidth={1.8}
              />
            </Cmp>
          );
        })}
      </div>
      {showValue && (
        <span className="text-xs font-semibold text-white ml-1">{rounded.toFixed(1)}</span>
      )}
    </div>
  );
}
