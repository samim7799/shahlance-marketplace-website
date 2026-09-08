// Seller applications + seller-uploaded products storage.
// LocalStorage backed. Backend-swap-ready (same shape as authService).

const APPS_KEY = 'shahlance_seller_applications';
const PRODS_KEY = 'shahlance_seller_products';
const WITHDRAWALS_KEY = 'shahlance_withdrawals';

function read(key) { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } }
function write(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

export const SELLER_TYPES = [
  { id: 'digital-marketplace', title: 'Digital Marketplace Seller', desc: 'Sell digital products — accounts, gift cards, subscriptions.', icon: 'Store', color: 'from-emerald-500 to-teal-500' },
  { id: 'freelancer', title: 'Hire A Freelancer Seller', desc: 'Offer 1:1 professional services with client communication.', icon: 'Users', color: 'from-blue-500 to-indigo-500' },
  { id: 'work-earn', title: 'Work & Earn Provider', desc: 'Launch micro-task campaigns for workers.', icon: 'Briefcase', color: 'from-violet-500 to-fuchsia-500' },
  { id: 'all-services', title: 'All Services Provider', desc: 'Deliver end-to-end packaged services across categories.', icon: 'Sparkles', color: 'from-orange-500 to-amber-500' },
  { id: 'custom', title: 'Custom Service Provider', desc: 'Offer a service that doesn’t fit existing categories.', icon: 'Settings', color: 'from-pink-500 to-rose-500' },
];

export const sellerService = {
  // ---------- Applications ----------
  async submitApplication(userId, data) {
    await sleep(500);
    const apps = read(APPS_KEY);
    // one pending/approved application per (user, sellerType)
    const existing = apps.find((a) => a.userId === userId && a.sellerType === data.sellerType && a.status !== 'rejected');
    if (existing) throw new Error('You already have a pending or approved application for this seller type.');
    const app = {
      id: `app_${Math.random().toString(36).slice(2, 10)}`,
      userId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...data,
    };
    apps.unshift(app);
    write(APPS_KEY, apps);
    return app;
  },
  async listApplications({ status } = {}) {
    await sleep(200);
    let apps = read(APPS_KEY);
    if (status) apps = apps.filter((a) => a.status === status);
    return apps;
  },
  async listUserApplications(userId) {
    await sleep(200);
    return read(APPS_KEY).filter((a) => a.userId === userId);
  },
  async decideApplication(appId, action /* 'approve' | 'reject' */, reason) {
    await sleep(300);
    const apps = read(APPS_KEY);
    const idx = apps.findIndex((a) => a.id === appId);
    if (idx === -1) throw new Error('Application not found.');
    apps[idx].status = action === 'approve' ? 'approved' : 'rejected';
    apps[idx].decidedAt = new Date().toISOString();
    if (reason) apps[idx].reason = reason;
    write(APPS_KEY, apps);
    return apps[idx];
  },

  isApprovedSeller(userId) {
    return read(APPS_KEY).some((a) => a.userId === userId && a.status === 'approved');
  },

  // ---------- Products ----------
  async submitProduct(userId, data) {
    await sleep(400);
    const prods = read(PRODS_KEY);
    const prod = {
      id: `sp_${Math.random().toString(36).slice(2, 10)}`,
      userId,
      status: 'pending', // pending | approved | rejected
      createdAt: new Date().toISOString(),
      ...data,
    };
    prods.unshift(prod);
    write(PRODS_KEY, prods);
    return prod;
  },
  async listProducts({ status, userId } = {}) {
    await sleep(200);
    let list = read(PRODS_KEY);
    if (status) list = list.filter((p) => p.status === status);
    if (userId) list = list.filter((p) => p.userId === userId);
    return list;
  },
  async decideProduct(productId, action, reason) {
    await sleep(250);
    const list = read(PRODS_KEY);
    const idx = list.findIndex((p) => p.id === productId);
    if (idx === -1) throw new Error('Product not found.');
    list[idx].status = action === 'approve' ? 'approved' : 'rejected';
    list[idx].decidedAt = new Date().toISOString();
    if (reason) list[idx].reason = reason;
    write(PRODS_KEY, list);
    return list[idx];
  },
  async updateProduct(productId, patch) {
    await sleep(200);
    const list = read(PRODS_KEY);
    const idx = list.findIndex((p) => p.id === productId);
    if (idx === -1) throw new Error('Product not found.');
    list[idx] = { ...list[idx], ...patch, updatedAt: new Date().toISOString() };
    write(PRODS_KEY, list);
    return list[idx];
  },

  // ---------- Withdrawals ----------
  async requestWithdrawal(userId, amount, method) {
    await sleep(300);
    const list = read(WITHDRAWALS_KEY);
    const w = {
      id: `wd_${Math.random().toString(36).slice(2, 8)}`,
      userId,
      amount: Number(amount),
      method: method || 'Bank transfer',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    list.unshift(w);
    write(WITHDRAWALS_KEY, list);
    return w;
  },
  async listWithdrawals({ status, userId } = {}) {
    await sleep(200);
    let list = read(WITHDRAWALS_KEY);
    if (status) list = list.filter((w) => w.status === status);
    if (userId) list = list.filter((w) => w.userId === userId);
    return list;
  },
  async decideWithdrawal(id, action) {
    await sleep(200);
    const list = read(WITHDRAWALS_KEY);
    const idx = list.findIndex((w) => w.id === id);
    if (idx === -1) throw new Error('Withdrawal not found.');
    list[idx].status = action === 'approve' ? 'approved' : 'rejected';
    list[idx].decidedAt = new Date().toISOString();
    write(WITHDRAWALS_KEY, list);
    return list[idx];
  },
};

export const SELLER_CATEGORIES = [
  'Accounts', 'Crypto', 'Gift Cards', 'Digital Marketing', 'Premium Subscriptions',
  'SMS Verification', 'Virtual SIM', 'eSIM', 'Hosting', 'VPS & Dedicated',
  'Payment Gateway', 'KYC Verification', 'Proxy & VPN', 'Software', 'Custom Category',
];
