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
};
