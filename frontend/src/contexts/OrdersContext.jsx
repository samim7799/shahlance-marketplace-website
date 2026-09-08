import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { orderService } from '../services/orderService';
import { reviewService } from '../services/reviewService';

const OrdersContext = createContext(null);

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [o, r] = await Promise.all([orderService.list(), reviewService.listAll()]);
    setOrders(o);
    setReviews(r);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const createOrder = useCallback(async (payload) => {
    const created = await orderService.create(payload);
    setOrders((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateOrderStatus = useCallback(async (id, status) => {
    const updated = await orderService.updateStatus(id, status);
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    return updated;
  }, []);

  const updatePayment = useCallback(async (id, status) => {
    const updated = await orderService.updatePayment(id, status);
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    return updated;
  }, []);

  const submitReview = useCallback(async (payload) => {
    const created = await reviewService.create(payload);
    setReviews((prev) => [created, ...prev]);
    return created;
  }, []);

  const setReviewHidden = useCallback(async (id, hidden) => {
    const updated = await reviewService.setHidden(id, hidden);
    setReviews((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  }, []);

  const removeReview = useCallback(async (id) => {
    await reviewService.remove(id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const value = useMemo(() => ({
    orders,
    reviews,
    loading,
    refresh,
    createOrder,
    updateOrderStatus,
    updatePayment,
    submitReview,
    setReviewHidden,
    removeReview,
  }), [orders, reviews, loading, refresh, createOrder, updateOrderStatus, updatePayment, submitReview, setReviewHidden, removeReview]);

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error('useOrders must be used inside OrdersProvider');
  return ctx;
}
