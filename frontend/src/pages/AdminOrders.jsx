import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AccountMenu from '../components/AccountMenu';
import OrderStatusBadge, { PaymentBadge } from '../components/OrderStatusBadge';
import StarRating from '../components/StarRating';
import { Package, CreditCard, Star, ShieldCheck, ChevronRight, Home as HomeIcon, Eye, EyeOff, Trash2, DollarSign } from 'lucide-react';
import { useOrders } from '../contexts/OrdersContext';
import { ORDER_STATUS } from '../services/orderService';
import { sellerService } from '../services/sellerService';
import { useToast } from '../hooks/use-toast';

const TABS = [
  { id: 'orders', label: 'Order Management', Icon: Package },
  { id: 'payments', label: 'Payment Monitoring', Icon: CreditCard },
  { id: 'reviews', label: 'Review Management', Icon: Star },
  { id: 'services', label: 'Service Approval', Icon: ShieldCheck },
];

export default function AdminOrders() {
  const { orders, reviews, updateOrderStatus, updatePayment, setReviewHidden, removeReview } = useOrders();
  const { toast } = useToast();
  const [tab, setTab] = useState('orders');

  const revenue = useMemo(
    () => orders.filter((o) => o.status === ORDER_STATUS.COMPLETED).reduce((s, o) => s + Number(o.price || 0), 0),
    [orders]
  );

  return (
    <div>
      <Header />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
          <Link to="/" className="hover:text-emerald-400 btn-hover inline-flex items-center gap-1"><HomeIcon size={12} /> Home</Link>
          <ChevronRight size={12} />
          <Link to="/admin" className="hover:text-emerald-400">Admin</Link>
          <ChevronRight size={12} />
          <span className="text-slate-300">Orders control</span>
        </nav>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin — orders & marketplace control</h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor orders, payments, moderate reviews and approve seller services.
          </p>
        </div>

        <div className="mt-6"><AccountMenu /></div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Orders" value={orders.length} Icon={Package} color="from-emerald-500 to-green-500" />
          <StatCard
            label="Active"
            value={orders.filter((o) => o.status === ORDER_STATUS.PENDING || o.status === ORDER_STATUS.PROCESSING).length}
            Icon={Package}
            color="from-orange-500 to-amber-500"
          />
          <StatCard label="Revenue Captured" value={`$${revenue.toFixed(2)}`} Icon={DollarSign} color="from-blue-500 to-indigo-500" />
          <StatCard label="Reviews" value={reviews.length} Icon={Star} color="from-violet-500 to-purple-500" />
        </div>

        {/* Tabs */}
        <div className="mt-6 card-surface rounded-2xl p-2 overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            {TABS.map((t) => {
              const Icon = t.Icon;
              const active = t.id === tab;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm btn-hover ${
                    active
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                  data-testid={`admin-orders-tab-${t.id}`}
                >
                  <Icon size={15} /> {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          {tab === 'orders' && (
            <AdminOrdersTable
              orders={orders}
              onSetStatus={async (o, s) => { await updateOrderStatus(o.id, s); toast({ title: 'Status updated' }); }}
            />
          )}
          {tab === 'payments' && (
            <AdminPaymentsTable
              orders={orders}
              onMarkPaid={async (o) => { await updatePayment(o.id, 'paid'); toast({ title: 'Marked as paid' }); }}
              onRefund={async (o) => { await updatePayment(o.id, 'refunded'); toast({ title: 'Refund recorded' }); }}
            />
          )}
          {tab === 'reviews' && (
            <AdminReviewsTable
              reviews={reviews}
              onHide={async (r) => { await setReviewHidden(r.id, !r.hidden); toast({ title: r.hidden ? 'Review unhidden' : 'Review hidden' }); }}
              onRemove={async (r) => { await removeReview(r.id); toast({ title: 'Review removed' }); }}
            />
          )}
          {tab === 'services' && <AdminServiceApproval />}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function StatCard({ label, value, Icon, color }) {
  return (
    <div className="card-surface rounded-2xl p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-slate-400">{label}</p>
          <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-white">{value}</p>
        </div>
        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function AdminOrdersTable({ orders, onSetStatus }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="card-surface rounded-2xl p-10 text-center" data-testid="admin-orders-empty">
        <p className="text-white font-semibold">No orders in the platform yet</p>
      </div>
    );
  }
  return (
    <ul className="space-y-3" data-testid="admin-orders-list">
      {orders.map((o) => (
        <li key={o.id} className="card-surface rounded-2xl p-4 sm:p-5" data-testid={`admin-order-${o.id}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Order #{o.id.slice(2, 8)}</p>
              <p className="mt-0.5 text-white font-semibold truncate">{o.title}</p>
              <p className="mt-1 text-xs text-slate-400">
                {o.buyerName} → {o.sellerName} · {new Date(o.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-extrabold text-white">${Number(o.price).toFixed(2)}</p>
              <div className="mt-1 flex items-center gap-2 justify-end">
                <OrderStatusBadge status={o.status} />
                <PaymentBadge status={o.paymentStatus} />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {Object.values(ORDER_STATUS).map((s) => (
              <button
                key={s}
                onClick={() => onSetStatus(o, s)}
                disabled={o.status === s}
                className={`rounded-lg border text-xs font-semibold px-3 py-1.5 btn-hover capitalize ${
                  o.status === s
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 cursor-not-allowed'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-200'
                }`}
                data-testid={`admin-order-${o.id}-set-${s}`}
              >
                Set {s}
              </button>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}

function AdminPaymentsTable({ orders, onMarkPaid, onRefund }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="card-surface rounded-2xl p-10 text-center" data-testid="admin-payments-empty">
        <p className="text-white font-semibold">No payments to monitor</p>
      </div>
    );
  }
  return (
    <ul className="divide-y divide-white/5 card-surface rounded-2xl" data-testid="admin-payments-list">
      {orders.map((o) => (
        <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4" data-testid={`admin-payment-${o.id}`}>
          <div className="min-w-0">
            <p className="text-sm text-white font-semibold truncate">{o.title}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {o.buyerName} → {o.sellerName} · {new Date(o.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm font-extrabold text-white">${Number(o.price).toFixed(2)}</p>
            <PaymentBadge status={o.paymentStatus} />
            {o.paymentStatus !== 'paid' && (
              <button
                onClick={() => onMarkPaid(o)}
                className="rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-xs font-semibold px-3 py-1.5 btn-hover"
                data-testid={`admin-payment-mark-paid-${o.id}`}
              >
                Mark paid
              </button>
            )}
            {o.paymentStatus !== 'refunded' && (
              <button
                onClick={() => onRefund(o)}
                className="rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/15 text-rose-300 text-xs font-semibold px-3 py-1.5 btn-hover"
                data-testid={`admin-payment-refund-${o.id}`}
              >
                Refund
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function AdminReviewsTable({ reviews, onHide, onRemove }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="card-surface rounded-2xl p-10 text-center" data-testid="admin-reviews-empty">
        <p className="text-white font-semibold">No reviews yet</p>
      </div>
    );
  }
  return (
    <ul className="space-y-3" data-testid="admin-reviews-list">
      {reviews.map((r) => (
        <li key={r.id} className="card-surface rounded-2xl p-4 sm:p-5" data-testid={`admin-review-${r.id}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-white font-semibold truncate">{r.buyerName} → {r.sellerName}</p>
              <p className="text-xs text-slate-400 mt-0.5 truncate">for {r.productTitle}</p>
              <div className="mt-2 flex items-center gap-2">
                <StarRating value={r.rating} size={13} />
                <span className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                {r.hidden && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-rose-500/40 bg-rose-500/10 text-rose-300 font-semibold uppercase">
                    Hidden
                  </span>
                )}
              </div>
              {r.comment && <p className="mt-2 text-sm text-slate-300 leading-relaxed">{r.comment}</p>}
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <button
                onClick={() => onHide(r)}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold px-3 py-1.5 btn-hover"
                data-testid={`admin-review-hide-${r.id}`}
              >
                {r.hidden ? <><Eye size={12} /> Unhide</> : <><EyeOff size={12} /> Hide</>}
              </button>
              <button
                onClick={() => onRemove(r)}
                className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/15 text-rose-300 text-xs font-semibold px-3 py-1.5 btn-hover"
                data-testid={`admin-review-remove-${r.id}`}
              >
                <Trash2 size={12} /> Remove
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function AdminServiceApproval() {
  const { toast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const list = await sellerService.listApplications();
    setApplications(list);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const setStatus = async (id, action) => {
    try {
      await sellerService.decideApplication(id, action);
      await refresh();
      toast({ title: `Application ${action === 'approve' ? 'approved' : 'rejected'}` });
    } catch (e) {
      toast({ title: 'Could not update', description: e.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return <div className="card-surface rounded-2xl p-10 text-center text-sm text-slate-400">Loading applications...</div>;
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="card-surface rounded-2xl p-10 text-center" data-testid="admin-services-empty">
        <p className="text-white font-semibold">No seller applications yet</p>
        <p className="text-sm text-slate-400 mt-2">
          When users apply to become sellers, their applications and service listings will appear here for review.
        </p>
        <Link
          to="/admin"
          className="mt-4 inline-flex items-center rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold px-5 py-2 text-sm btn-hover"
        >
          Go to full admin panel
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3" data-testid="admin-services-list">
      {applications.map((a) => (
        <li key={a.id} className="card-surface rounded-2xl p-4 sm:p-5" data-testid={`admin-service-${a.id}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-white font-semibold truncate">{a.fullName || a.userId}</p>
              <p className="text-xs text-slate-400 mt-0.5 truncate">applied {new Date(a.createdAt).toLocaleDateString()}</p>
              <p className="text-xs text-slate-300 mt-1">Type: {a.sellerType || 'general'}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                a.status === 'approved'
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : a.status === 'rejected'
                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}>
                {a.status || 'pending'}
              </span>
              {a.status !== 'approved' && (
                <button
                  onClick={() => setStatus(a.id, 'approve')}
                  className="rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-xs font-semibold px-3 py-1.5 btn-hover"
                  data-testid={`admin-service-approve-${a.id}`}
                >
                  Approve
                </button>
              )}
              {a.status !== 'rejected' && (
                <button
                  onClick={() => setStatus(a.id, 'reject')}
                  className="rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/15 text-rose-300 text-xs font-semibold px-3 py-1.5 btn-hover"
                  data-testid={`admin-service-reject-${a.id}`}
                >
                  Reject
                </button>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
