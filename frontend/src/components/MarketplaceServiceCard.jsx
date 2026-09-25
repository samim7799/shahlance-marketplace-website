import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { Shield, Clock, ChevronRight } from 'lucide-react';
import StarRating from './StarRating';
import { CATEGORIES } from '../mock/data';

/**
 * Additive marketplace card - image placeholder, title, seller, rating, price,
 * category, and a View Details button. Uses the same gradient/icon pattern as
 * existing ProductCard so styling stays consistent with the ShahLance dark theme.
 */
export default function MarketplaceServiceCard({ product, avgRating, reviewCount }) {
  const Icon = Icons[product.icon] || Icons.Package;
  const category = CATEGORIES.find((c) => c.id === product.category);
  const rating = typeof avgRating === 'number' && avgRating > 0 ? avgRating : product.rating;
  const rCount = typeof reviewCount === 'number' && reviewCount > 0 ? reviewCount : product.reviews;

  return (
    <div
      className="group card-surface card-hover rounded-2xl overflow-hidden flex flex-col"
      data-testid={`service-card-${product.id}`}
    >
      {/* Thumbnail placeholder */}
      <Link to={`/services/${product.id}`} className="block">
        <div className={`relative aspect-[16/10] bg-gradient-to-br ${product.color} flex items-center justify-center`}>
          <div className="absolute inset-0 bg-[radial-gradient(600px_200px_at_50%_-50%,rgba(255,255,255,0.2),transparent)]" />
          <Icon className="h-14 w-14 text-white drop-shadow-lg" strokeWidth={1.6} />
          <span className="absolute top-3 left-3 rounded-full bg-black/40 backdrop-blur px-2.5 py-1 text-[10px] font-semibold text-white border border-white/20">
            {category?.name || 'Service'}
          </span>
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/40 backdrop-blur px-2 py-1 text-[11px] font-medium text-emerald-300 border border-emerald-400/30">
            <Shield size={10} /> Escrow
          </span>
        </div>
      </Link>

      {/* Body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-2">
          <img
            src={product.seller.avatar}
            alt={product.seller.name}
            className="h-6 w-6 rounded-full bg-slate-700 border border-white/10"
          />
          <span className="text-xs text-slate-300 font-medium" data-testid={`service-seller-${product.id}`}>
            {product.seller.name}
          </span>
        </div>
        <Link
          to={`/services/${product.id}`}
          className="text-sm sm:text-[15px] font-semibold text-white leading-snug clamp-2 group-hover:text-emerald-300 btn-hover"
          data-testid={`service-title-${product.id}`}
        >
          {product.title}
        </Link>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <StarRating value={rating} size={13} />
          <span className="text-slate-200 font-semibold">{Number(rating).toFixed(1)}</span>
          <span>({rCount})</span>
          <span className="inline-flex items-center gap-1 ml-auto">
            <Clock size={13} /> {product.deliveryDays}d
          </span>
        </div>

        <div className="mt-auto pt-3 border-t border-white/5 flex items-baseline justify-between">
          <span className="text-[11px] uppercase tracking-wider text-slate-500">
            {product.priceLabel}
          </span>
          <span className="text-lg font-bold text-white" data-testid={`service-price-${product.id}`}>
            ${Number(product.price).toFixed(2)}
          </span>
        </div>

        <Link
          to={`/services/${product.id}`}
          className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-xs font-semibold py-2 btn-hover"
          data-testid={`service-view-details-${product.id}`}
        >
          View Details <ChevronRight size={12} />
        </Link>
      </div>
    </div>
  );
}
