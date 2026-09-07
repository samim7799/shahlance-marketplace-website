// Pluggable auth service.
// Current backend: browser localStorage (frontend-only, demo/mock).
// Swap this file's implementation later for Firebase / Supabase / MongoDB REST
// without changing any callers (AuthContext + pages import from here only).

const USERS_KEY = 'shahlance_users';
const SESSION_KEY = 'shahlance_session';
const PERSIST_KEY = 'shahlance_persist'; // 'local' | 'session'

function readUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch { return []; }
}
function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function sessionStore(persist) {
  return persist === 'session' ? sessionStorage : localStorage;
}

// naive obfuscation for demo only. REAL backend will hash server-side.
function obfuscate(s) {
  try { return btoa(unescape(encodeURIComponent(`sl::${s}`))); } catch { return s; }
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

export const authService = {
  async signUp(payload) {
    await sleep(600); // simulate network
    const users = readUsers();
    const email = payload.email.trim().toLowerCase();
    const username = payload.username.trim().toLowerCase();
    if (users.some((u) => u.email === email)) {
      throw new Error('An account with this email already exists.');
    }
    if (users.some((u) => u.username === username)) {
      throw new Error('This username is already taken.');
    }
    const now = new Date().toISOString();
    const user = {
      id: `u_${Math.random().toString(36).slice(2, 10)}`,
      fullName: payload.fullName.trim(),
      username,
      email,
      phone: payload.phone || '',
      country: payload.country || '',
      accountType: payload.accountType, // 'freelancer' | 'client' | 'both'
      profilePhoto: payload.profilePhoto || '',
      passwordHash: obfuscate(payload.password),
      skills: [],
      services: [],
      company: { name: '', website: '', industry: '' },
      createdAt: now,
      updatedAt: now,
    };
    users.push(user);
    writeUsers(users);
    return sanitize(user);
  },

  async login({ identifier, password, remember }) {
    await sleep(500);
    const users = readUsers();
    const id = identifier.trim().toLowerCase();
    const user = users.find((u) => u.email === id || u.username === id);
    if (!user) throw new Error('No account found with that email or username.');
    if (user.passwordHash !== obfuscate(password)) {
      throw new Error('Incorrect password. Please try again.');
    }
    const persist = remember ? 'local' : 'session';
    // remove opposing store
    (persist === 'local' ? sessionStorage : localStorage).removeItem(SESSION_KEY);
    localStorage.setItem(PERSIST_KEY, persist);
    sessionStore(persist).setItem(SESSION_KEY, JSON.stringify({ userId: user.id, ts: Date.now() }));
    return sanitize(user);
  },

  async logout() {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(PERSIST_KEY);
  },

  getCurrentUser() {
    const persist = localStorage.getItem(PERSIST_KEY) || 'local';
    const raw = sessionStore(persist).getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      const { userId } = JSON.parse(raw);
      const user = readUsers().find((u) => u.id === userId);
      return user ? sanitize(user) : null;
    } catch { return null; }
  },

  async updateProfile(userId, patch) {
    await sleep(400);
    const users = readUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error('User not found.');
    users[idx] = { ...users[idx], ...patch, updatedAt: new Date().toISOString() };
    writeUsers(users);
    return sanitize(users[idx]);
  },

  async requestPasswordReset(email) {
    await sleep(600);
    const users = readUsers();
    const exists = users.some((u) => u.email === email.trim().toLowerCase());
    // Always return ok to avoid enumeration (industry standard). Backend will send email.
    return { ok: true, exists };
  },
};

function sanitize(u) {
  // strip password hash from what we expose to UI/context
  const { passwordHash, ...rest } = u;
  return rest;
}

// Utility: compute profile completion %
export function computeProfileCompletion(user) {
  if (!user) return 0;
  const checks = [
    !!user.fullName,
    !!user.username,
    !!user.email,
    !!user.phone,
    !!user.country,
    !!user.profilePhoto,
    (user.skills && user.skills.length > 0) || (user.services && user.services.length > 0) || !!(user.company && user.company.name),
    !!user.accountType,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}
