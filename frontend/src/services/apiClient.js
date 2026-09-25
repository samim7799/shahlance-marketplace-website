// Central axios client for the ShahLance backend.
// Attaches the JWT bearer token (if present) to every request.
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const TOKEN_KEY = 'shahlance_token';
const DEVICE_KEY = 'shahlance_device_id';

export function getDeviceId() {
  let devId = localStorage.getItem(DEVICE_KEY);
  if (!devId) {
    devId = 'dev_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    localStorage.setItem(DEVICE_KEY, devId);
  }
  return devId;
}

export function getToken() {
  if (typeof window !== 'undefined') {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const queryToken = urlParams.get('auth_token');
      if (queryToken) {
        localStorage.setItem(TOKEN_KEY, queryToken);
        return queryToken;
      }
    } catch (_) {}
  }
  return localStorage.getItem(TOKEN_KEY) || '';
}
export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const deviceId = getDeviceId();
  if (deviceId) config.headers['x-device-id'] = deviceId;
  return config;
});

// Normalise FastAPI error payloads into a readable string.
export function apiError(e) {
  const detail = e?.response?.data?.detail;
  if (detail == null) return e?.message || 'Something went wrong. Please try again.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map((d) => d?.msg || JSON.stringify(d)).join(' ');
  if (detail?.msg) return detail.msg;
  return String(detail);
}

export default api;
