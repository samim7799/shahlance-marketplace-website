import { Search, X, Star } from 'lucide-react';
import { CATEGORIES } from '../mock/data';

/**
 * Additive filters panel: search, category, price range, min rating.
 * Controlled component — parent owns state.
 */
export default function MarketplaceFilters({
  q, setQ,
  category, setCategory,
  minPrice, setMinPrice,
  maxPrice, setMaxPrice,
  minRating, setMinRating,
  onClear,
}) {
  return (
    <div className="card-surface rounded-2xl p-5 space-y-5" data-testid="marketplace-filters">
      <div>
        <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
          Search
        </label>
        <div className="mt-2 relative">
          <Search size={15} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search services..."
            className="w-full pl-9 pr-9 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/40 focus:outline-none"
            data-testid="filter-search-input"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ('')}
              className="absolute top-1/2 -translate-y-1/2 right-2 h-6 w-6 rounded-md text-slate-400 hover:text-white hover:bg-white/5 flex items-center justify-center"
              aria-label="Clear"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-2 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-100 focus:border-emerald-500/40 focus:outline-none"
          style={{ colorScheme: 'dark' }}
          data-testid="filter-category-select"
        >
          <option value="all" className="bg-[#0f1526]">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id} className="bg-[#0f1526]">{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
          Price range (USD)
        </label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <input
            type="number"
            min="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/40 focus:outline-none"
            data-testid="filter-min-price"
          />
          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/40 focus:outline-none"
            data-testid="filter-max-price"
          />
        </div>
      </div>

      <div>
        <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
          Minimum rating
        </label>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[0, 3, 4, 4.5, 4.8].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setMinRating(r)}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold border btn-hover ${
                Number(minRating) === Number(r)
                  ? 'bg-emerald-500 border-emerald-500 text-slate-900'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
              }`}
              data-testid={`filter-rating-${r}`}
            >
              <Star size={11} className="fill-current" />
              {r === 0 ? 'Any' : `${r}+`}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onClear}
        className="w-full rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold py-2 btn-hover"
        data-testid="filter-clear-btn"
      >
        Clear all filters
      </button>
    </div>
  );
}
