import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

const NotificationsContext = createContext(null);

function storageKey(userId) { return `shahlance_notifications_${userId || 'guest'}`; }
function read(key) { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } }

export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => { setItems(read(storageKey(user?.id))); }, [user?.id]);

  const persist = useCallback((next) => {
    setItems(next);
    localStorage.setItem(storageKey(user?.id), JSON.stringify(next));
  }, [user?.id]);

  const push = useCallback((payload) => {
    const n = {
      id: `n_${Math.random().toString(36).slice(2, 10)}`,
      title: payload.title,
      message: payload.message || '',
      kind: payload.kind || 'info', // info | success | warning | error
      category: payload.category || 'general', // seller | product | withdrawal | message | general | user
      link: payload.link || null,
      read: false,
      createdAt: new Date().toISOString(),
    };
    const next = [n, ...items].slice(0, 100);
    persist(next);
    return n;
  }, [items, persist]);

  const markRead = useCallback((id) => {
    persist(items.map((i) => i.id === id ? { ...i, read: true } : i));
  }, [items, persist]);

  const markAllRead = useCallback(() => {
    persist(items.map((i) => ({ ...i, read: true })));
  }, [items, persist]);

  const clearAll = useCallback(() => persist([]), [persist]);

  // Helper to notify ANY user by id (used by admin actions)
  const notifyUser = useCallback((userId, payload) => {
    if (!userId) return;
    const key = storageKey(userId);
    const list = read(key);
    const n = {
      id: `n_${Math.random().toString(36).slice(2, 10)}`,
      title: payload.title,
      message: payload.message || '',
      kind: payload.kind || 'info',
      category: payload.category || 'general',
      link: payload.link || null,
      read: false,
      createdAt: new Date().toISOString(),
    };
    const next = [n, ...list].slice(0, 100);
    localStorage.setItem(key, JSON.stringify(next));
    // if it's the current user, update state too
    if (userId === user?.id) setItems(next);
  }, [user?.id]);

  const unread = items.filter((i) => !i.read).length;

  const value = useMemo(() => ({ items, unread, push, markRead, markAllRead, clearAll, notifyUser }),
    [items, unread, push, markRead, markAllRead, clearAll, notifyUser]);

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationsProvider');
  return ctx;
}
