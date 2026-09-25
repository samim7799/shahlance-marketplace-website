import { useState } from 'react';
import { Button } from './ui/button';
import StarRating from './StarRating';

/**
 * Additive: allows a buyer to submit a rating + review for a completed order.
 */
export default function ReviewForm({ onSubmit, submitting }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [err, setErr] = useState('');

  const submit = (e) => {
    e.preventDefault();
    setErr('');
    if (!rating || rating < 1) { setErr('Please select a rating'); return; }
    if (comment.trim().length < 5) { setErr('Please write at least 5 characters'); return; }
    onSubmit({ rating, comment: comment.trim() });
  };

  return (
    <form onSubmit={submit} className="card-surface rounded-2xl p-5 space-y-4" data-testid="review-form">
      <div>
        <label className="text-sm font-semibold text-white">Your rating</label>
        <div className="mt-2">
          <StarRating value={rating} onChange={setRating} size={24} />
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-white">Your review</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Share your experience — quality, delivery, communication..."
          className="mt-2 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/40 focus:outline-none"
          data-testid="review-form-comment"
        />
      </div>

      {err && <p className="text-xs text-rose-300">{err}</p>}

      <Button
        type="submit"
        disabled={submitting}
        className="w-full h-10 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold"
        data-testid="review-form-submit"
      >
        {submitting ? 'Submitting...' : 'Submit review'}
      </Button>
    </form>
  );
}
