// Additive saved-services (wishlist) service - localStorage per user.

function key(userId) { return `shahlance_saved_${userId || 'guest'}`; }

function read(userId) {
  try { return JSON.parse(localStorage.getItem(key(userId)) || '[]'); }
  catch { return []; }
}
function write(userId, list) {
  localStorage.setItem(key(userId), JSON.stringify(list));
}

export const savedService = {
  list(userId) { return read(userId); },
  isSaved(userId, productId) { return read(userId).includes(productId); },
  toggle(userId, productId) {
    const list = read(userId);
    const next = list.includes(productId)
      ? list.filter((id) => id !== productId)
      : [productId, ...list];
    write(userId, next);
    return next;
  },
  remove(userId, productId) {
    const next = read(userId).filter((id) => id !== productId);
    write(userId, next);
    return next;
  },
};
