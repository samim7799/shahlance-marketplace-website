import { Link } from 'react-router-dom';
import { Star, Clock, Shield } from 'lucide-react';
import * as Icons from 'lucide-react';

export default function ProductCard({ product }) {
  const Icon = Icons[product.icon] || Icons.Package;
  return (
    <Link
      to={`/product/${product.id}`}
      className="group card-surface card-hover rounded-2xl overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-emerald-500/5"
    >
      {/* Thumbnail */}
      <div className={`relative aspect-[16/10] bg-gradient-to-br ${product.color} flex items-center justify-center`}>
        <div className="absolute inset-0 bg-[radial-gradient(600px_200px_at_50%_-50%,rgba(255,255,255,0.2),transparent)]" />
        <Icon className="h-14 w-14 text-white drop-shadow-lg" strokeWidth={1.6} />
        {product.badge && (
          <span className="absolute top-3 left-3 rounded-full bg-black/40 backdrop-blur px-2.5 py-1 text-[11px] font-semibold text-white border border-white/20">
            {product.badge}
          </span>
        )}
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/40 backdrop-blur px-2 py-1 text-[11px] font-medium text-emerald-300 border border-emerald-400/30">
          <Shield size={10} /> Escrow
        </span>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-2">
          <img src={product.seller.avatar} alt={product.seller.name} className="h-6 w-6 rounded-full bg-slate-700 border border-white/10" />
          <span className="text-xs text-slate-300 font-medium">{product.seller.name}</span>
        </div>
        <h3 className="text-sm sm:text-[15px] font-semibold text-white leading-snug clamp-2 group-hover:text-emerald-300 btn-hover">
          {product.title}
        </h3>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Star size={13} className="text-amber-400 fill-amber-400" />
            <span className="text-slate-200 font-semibold">{product.rating.toFixed(1)}</span>
            <span>({product.reviews})</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={13} /> {product.deliveryDays} days
          </span>
        </div>
        <div className="mt-auto pt-3 border-t border-white/5 flex items-baseline justify-between">
          <span className="text-[11px] uppercase tracking-wider text-slate-500">{product.priceLabel}</span>
          <span className="text-lg font-bold text-white">${product.price.toFixed(2)}</span>
        </div>
      </div>
    </Link>
  );
}
