import StarRating from './StarRating';

/**
 * Additive: display list of reviews. Optional `showProduct` shows the linked
 * product/service title (used on seller profile or admin panels).
 */
export default function ReviewList({ reviews, showProduct = false, emptyText = 'No reviews yet' }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-8 text-center text-sm text-slate-400"
           data-testid="review-list-empty">
        {emptyText}
      </div>
    );
  }
  return (
    <ul className="space-y-3" data-testid="review-list">
      {reviews.map((r) => (
        <li key={r.id} className="card-surface rounded-2xl p-4" data-testid={`review-item-${r.id}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{r.buyerName}</p>
              {showProduct && (
                <p className="text-[11px] text-slate-400 truncate">for {r.productTitle}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <StarRating value={r.rating} size={13} />
              <span className="text-xs text-slate-400">
                {new Date(r.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          {r.comment && (
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">{r.comment}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
