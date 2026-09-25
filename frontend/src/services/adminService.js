// Admin console API (admin-only). Reuses the central axios client (auth token attached).
import api from './apiClient';

export const adminService = {
  stats: () => api.get('/admin/stats').then((r) => r.data),
  users: (search) => api.get('/admin/users', { params: search ? { search } : {} }).then((r) => r.data),
  userDetail: (id) => api.get(`/admin/users/${id}`).then((r) => r.data),
  setBlocked: (id, blocked) => api.patch(`/admin/users/${id}/block`, { blocked }).then((r) => r.data),

  sms: {
    providers: () => api.get('/admin/sms/providers').then((r) => r.data),
    createProvider: (body) => api.post('/admin/sms/providers', body).then((r) => r.data),
    updateProvider: (id, body) => api.put(`/admin/sms/providers/${id}`, body).then((r) => r.data),
    deleteProvider: (id) => api.delete(`/admin/sms/providers/${id}`).then((r) => r.data),
    mappings: () => api.get('/admin/sms/mappings').then((r) => r.data),
    createMapping: (body) => api.post('/admin/sms/mappings', body).then((r) => r.data),
    updateMapping: (id, body) => api.put(`/admin/sms/mappings/${id}`, body).then((r) => r.data),
    deleteMapping: (id) => api.delete(`/admin/sms/mappings/${id}`).then((r) => r.data),
    orders: () => api.get('/admin/sms/orders').then((r) => r.data),
    config: () => api.get('/admin/sms/config').then((r) => r.data),
    updateConfig: (body) => api.put('/admin/sms/config', body).then((r) => r.data),
  },

  payments: {
    gateways: () => api.get('/admin/payments/gateways').then((r) => r.data),
    createGateway: (body) => api.post('/admin/payments/gateways', body).then((r) => r.data),
    updateGateway: (id, body) => api.put(`/admin/payments/gateways/${id}`, body).then((r) => r.data),
    deleteGateway: (id) => api.delete(`/admin/payments/gateways/${id}`).then((r) => r.data),
    transactions: (status) => api.get('/admin/payments/transactions', { params: status ? { status } : {} }).then((r) => r.data),
    refund: (id) => api.patch(`/admin/payments/transactions/${id}/refund`).then((r) => r.data),
  },

  wallet: {
    adjust: (body) => api.post('/admin/wallet/adjust', body).then((r) => r.data),
    report: () => api.get('/admin/wallet/report').then((r) => r.data),
  },

  bonus: {
    getSettings: () => api.get('/admin/bonus/settings').then((r) => r.data),
    updateSettings: (body) => api.put('/admin/bonus/settings', body).then((r) => r.data),
    history: (params) => api.get('/admin/bonus/history', { params }).then((r) => r.data),
    userStatus: (params) => api.get('/admin/bonus/user-status', { params }).then((r) => r.data),
    suspiciousUsers: () => api.get('/admin/bonus/suspicious-users').then((r) => r.data),
    review: (body) => api.post('/admin/bonus/review', body).then((r) => r.data),
  },

  sellers: {
    list: () => api.get('/admin/sellers').then((r) => r.data),
    summary: (id) => api.get(`/admin/sellers/${id}/summary`).then((r) => r.data),
    suspend: (id, suspended, reason) => api.post(`/admin/sellers/${id}/suspend`, { suspended, reason: reason || '' }).then((r) => r.data),
  },

  products: {
    list: (params) => api.get('/admin/products', { params }).then((r) => r.data),
    create: (body) => api.post('/admin/products', body).then((r) => r.data),
    update: (id, body) => api.put(`/admin/products/${id}`, body).then((r) => r.data),
    delete: (id) => api.delete(`/admin/products/${id}`).then((r) => r.data),
  },

  commission: {
    getSettings: () => api.get('/admin/commission/settings').then((r) => r.data),
    updateSettings: (body) => api.put('/admin/commission/settings', body).then((r) => r.data),
    getOverview: () => api.get('/admin/commission/overview').then((r) => r.data),
    calculate: (body) => api.post('/admin/commission/calculate', body).then((r) => r.data),
  },

  digital: {
    // Subscriptions
    listSubCategories: () => api.get('/admin/digital/subscription-categories').then((r) => r.data),
    createSubCategory: (b) => api.post('/admin/digital/subscription-categories', b).then((r) => r.data),
    updateSubCategory: (id, b) => api.put(`/admin/digital/subscription-categories/${id}`, b).then((r) => r.data),
    deleteSubCategory: (id) => api.delete(`/admin/digital/subscription-categories/${id}`).then((r) => r.data),

    listSubProducts: () => api.get('/admin/digital/subscription-products').then((r) => r.data),
    createSubProduct: (b) => api.post('/admin/digital/subscription-products', b).then((r) => r.data),
    updateSubProduct: (id, b) => api.put(`/admin/digital/subscription-products/${id}`, b).then((r) => r.data),
    deleteSubProduct: (id) => api.delete(`/admin/digital/subscription-products/${id}`).then((r) => r.data),

    listSubOrders: () => api.get('/admin/digital/subscription-orders').then((r) => r.data),

    // Gift Cards
    listGcBrands: () => api.get('/admin/digital/gift-card-brands').then((r) => r.data),
    createGcBrand: (b) => api.post('/admin/digital/gift-card-brands', b).then((r) => r.data),
    updateGcBrand: (id, b) => api.put(`/admin/digital/gift-card-brands/${id}`, b).then((r) => r.data),
    deleteGcBrand: (id) => api.delete(`/admin/digital/gift-card-brands/${id}`).then((r) => r.data),

    listGiftCards: () => api.get('/admin/digital/gift-cards').then((r) => r.data),
    createGiftCard: (b) => api.post('/admin/digital/gift-cards', b).then((r) => r.data),
    updateGiftCard: (id, b) => api.put(`/admin/digital/gift-cards/${id}`, b).then((r) => r.data),
    deleteGiftCard: (id) => api.delete(`/admin/digital/gift-cards/${id}`).then((r) => r.data),

    listGcOrders: () => api.get('/admin/digital/gift-card-orders').then((r) => r.data),
  },

  cms: {
    getSettings: () => api.get('/admin/cms/settings').then((r) => r.data),
    updateSettings: (b) => api.put('/admin/cms/settings', b).then((r) => r.data),
    listPages: () => api.get('/admin/cms/pages').then((r) => r.data),
    createPage: (b) => api.post('/admin/cms/pages', b).then((r) => r.data),
    updatePage: (id, b) => api.put(`/admin/cms/pages/${id}`, b).then((r) => r.data),
    deletePage: (id) => api.delete(`/admin/cms/pages/${id}`).then((r) => r.data),
  },

  reports: {
    getDashboard: () => api.get('/admin/reports/dashboard').then((r) => r.data),
  },

  security: {
    getActivityLogs: () => api.get('/admin/security/activity-logs').then((r) => r.data),
    logActivity: (b) => api.post('/admin/security/activity-logs', b).then((r) => r.data),
    getLoginHistory: () => api.get('/admin/security/login-history').then((r) => r.data),
    getSettings: () => api.get('/admin/security/settings').then((r) => r.data),
    updateSettings: (b) => api.put('/admin/security/settings', b).then((r) => r.data),
  },
};
