// Additive review service - localStorage-based mock.
// Ratings/reviews are keyed by productId. Admin can moderate (hide) reviews.

const REVIEWS_KEY = 'shahlance_reviews';

function read() {
  try { return JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]'); }
  catch { return []; }
}
function write(list) {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(list));
}
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

export const reviewService = {
  async list() {
    await sleep(120);
    return read().filter((r) => !r.hidden);
  },

  async listAll() {
    await sleep(120);
    return read();
  },

  async listByProduct(productId) {
    await sleep(80);
    return read().filter((r) => r.productId === productId && !r.hidden);
  },

  async listBySeller(sellerName) {
    await sleep(120);
    return read().filter((r) => r.sellerName === sellerName && !r.hidden);
  },

  async create(payload) {
    await sleep(250);
    const list = read();
    const review = {
      id: `r_${Math.random().toString(36).slice(2, 10)}`,
      productId: payload.productId,
      productTitle: payload.productTitle,
      sellerName: payload.sellerName,
      orderId: payload.orderId,
      buyerId: payload.buyerId,
      buyerName: payload.buyerName || 'Buyer',
      rating: Math.max(1, Math.min(5, Number(payload.rating) || 5)),
      comment: (payload.comment || '').trim(),
      hidden: false,
      createdAt: new Date().toISOString(),
    };
    list.unshift(review);
    write(list);
    return review;
  },

  async setHidden(reviewId, hidden) {
    await sleep(150);
    const list = read();
    const idx = list.findIndex((r) => r.id === reviewId);
    if (idx === -1) throw new Error('Review not found');
    list[idx] = { ...list[idx], hidden };
    write(list);
    return list[idx];
  },

  async remove(reviewId) {
    await sleep(150);
    const list = read().filter((r) => r.id !== reviewId);
    write(list);
    return true;
  },
};

export function summarize(reviews) {
  if (!reviews || reviews.length === 0) return { avg: 0, count: 0 };
  const total = reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
  return {
    avg: Math.round((total / reviews.length) * 10) / 10,
    count: reviews.length,
  };
}
