import api, { getDeviceId } from './apiClient';

export const bonusService = {
  getStatus: () => api.get('/bonus/status').then((r) => r.data),
  evaluate: (deviceId) =>
    api.post('/bonus/evaluate', { deviceId: deviceId || getDeviceId() }).then((r) => r.data),
  verifyEmail: (deviceId) =>
    api.post('/bonus/verify-email', { deviceId: deviceId || getDeviceId() }).then((r) => r.data),
  verifyPhone: (phone, deviceId) =>
    api.post('/bonus/verify-phone', { phone, deviceId: deviceId || getDeviceId() }).then((r) => r.data),
};
