// Additive Order service - localStorage-based mock.
// Structure mirrors existing authService/sellerService so it can later be swapped
// for real backend calls without changing any UI consumers.

const ORDERS_KEY = 'shahlance_orders';

function read() {
  try { return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]'); }
  catch { return []; }
}
function write(list) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
}
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

// Order statuses: pending | processing | completed | cancelled
// Payment statuses: pending | paid | refunded
// Admin approval (services): pending | approved | rejected

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const orderService = {
  async list() {
    await sleep(150);
    return read();
  },

  async listByBuyer(userId) {
    await sleep(120);
    return read().filter((o) => o.buyerId === userId);
  },

  async listBySeller(sellerName) {
    await sleep(120);
    return read().filter((o) => o.sellerName === sellerName);
  },

  async getById(orderId) {
    await sleep(80);
    return read().find((o) => o.id === orderId) || null;
  },

  async create(payload) {
    await sleep(300);
    const list = read();
    const order = {
      id: `o_${Math.random().toString(36).slice(2, 10)}`,
      productId: payload.productId,
      title: payload.title,
      sellerName: payload.sellerName,
      sellerAvatar: payload.sellerAvatar || '',
      buyerId: payload.buyerId,
      buyerName: payload.buyerName || 'Buyer',
      price: payload.price,
      priceLabel: payload.priceLabel || '',
      category: payload.category || '',
      deliveryDays: payload.deliveryDays || 3,
      status: ORDER_STATUS.PENDING,
      paymentStatus: 'pending',
      note: payload.note || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.unshift(order);
    write(list);
    return order;
  },

  async updateStatus(orderId, status) {
    await sleep(200);
    const list = read();
    const idx = list.findIndex((o) => o.id === orderId);
    if (idx === -1) throw new Error('Order not found');
    list[idx] = { ...list[idx], status, updatedAt: new Date().toISOString() };
    write(list);
    return list[idx];
  },

  async updatePayment(orderId, paymentStatus) {
    await sleep(200);
    const list = read();
    const idx = list.findIndex((o) => o.id === orderId);
    if (idx === -1) throw new Error('Order not found');
    list[idx] = { ...list[idx], paymentStatus, updatedAt: new Date().toISOString() };
    write(list);
    return list[idx];
  },
};

// Aggregated seller analytics helper
export function computeSellerAnalytics(orders) {
  const total = orders.length;
  const completed = orders.filter((o) => o.status === ORDER_STATUS.COMPLETED).length;
  const cancelled = orders.filter((o) => o.status === ORDER_STATUS.CANCELLED).length;
  const revenue = orders
    .filter((o) => o.status === ORDER_STATUS.COMPLETED)
    .reduce((sum, o) => sum + (Number(o.price) || 0), 0);
  const pending = orders.filter(
    (o) => o.status === ORDER_STATUS.PENDING || o.status === ORDER_STATUS.PROCESSING
  ).length;
  return { total, completed, cancelled, revenue, pending };
}
