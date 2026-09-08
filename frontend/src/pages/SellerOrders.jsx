import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AccountMenu from '../components/AccountMenu';
import OrderStatusBadge, { PaymentBadge } from '../components/OrderStatusBadge';
import ReviewList from '../components/ReviewList';
import { Button } from '../components/ui/button';
import { Inbox, PlayCircle, CheckCircle2, XCircle, Star, BarChart3, ChevronRight, Home as HomeIcon, TrendingUp, DollarSign, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useOrders } from '../contexts/OrdersContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { ORDER_STATUS, computeSellerAnalytics } from '../services/orderService';
import { summarize } from '../services/reviewService';
import { useToast } from '../hooks/use-toast';

const TABS = [
  { id: 'new', label: 'New Orders', Icon: Inbox },
  { id: 'accepted', label: 'Accepted', Icon: PlayCircle },
  { id: 'completed', label: 'Completed', Icon: CheckCircle2 },
  { id: 'cancelled', label: 'Cancelled', Icon: XCircle },
  { id: 'reviews', label: 'Reviews', Icon: Star },
  { id: 'analytics', label: 'Analytics', Icon: BarChart3 },
];

/**
 * Seller Orders Management page (additive).
 * Uses the logged-in user's fullName/username as the seller-name key.
 * Also allows filtering by any seller for demo purposes if the user has no
 * assigned identity yet.
 */
export default function SellerOrders() {
  const { user } = useAuth();
  const { orders, reviews, updateOrderStatus, updatePayment } = useOrders();
  const { push } = useNotifications();
  const { toast } = useToast();
  const [tab, setTab] = useState('new');

  // Since demo orders will typically be placed against seed sellers (Isabella Rossi, etc.),
  // this page shows all orders for the current session — the demo simulates a seller inbox.
  // Real backend implementation will filter by authenticated sellerId.
  const sellerOrders = orders; // Show all orders in demo mode
  const sellerName = user?.fullName || user?.username || 'You';

  const filtered = useMemo(() => {
    switch (tab) {
      case 'new':
        return sellerOrders.filter((o) => o.status === ORDER_STATUS.PENDING);
      case 'accepted':
        return sellerOrders.filter((o) => o.status === ORDER_STATUS.PROCESSING);
      case 'completed':
        return sellerOrders.filter((o) => o.status === ORDER_STATUS.COMPLETED);
      case 'cancelled':
        return sellerOrders.filter((o) => o.status === ORDER_STATUS.CANCELLED);
      default:
        return [];
    }
  }, [tab, sellerOrders]);

  const analytics = computeSellerAnalytics(sellerOrders);
  const summary = summarize(reviews);

  const accept = async (o) => {
    await updateOrderStatus(o.id, ORDER_STATUS.PROCESSING);
    await updatePayment(o.id, 'paid'); // mock: mark payment captured after acceptance
    push({
      title: 'Order accepted',
      message: `You accepted "${o.title}".`,
      kind: 'success',
      category: 'product',
      link: '/dashboard/seller-orders',
    });
    toast({ title: 'Order accepted' });
  };

  const complete = async (o) => {
    await updateOrderStatus(o.id, ORDER_STATUS.COMPLETED);
    push({
      title: 'Order completed',
      message: `"${o.title}" marked as delivered.`,
      kind: 'success',
      category: 'product',
    });
    toast({ title: 'Order marked completed' });
  };

  const decline = async (o) => {
    await updateOrderStatus(o.id, ORDER_STATUS.CANCELLED);
    toast({ title: 'Order cancelled' });
  };

  return (
    <div>
      <Header />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
          <Link to="/" className="hover:text-emerald-400 btn-hover inline-flex items-center gap-1"><HomeIcon size={12} /> Home</Link>
          <ChevronRight size={12} />
          <Link to="/dashboard/worker" className="hover:text-emerald-400">Seller Dashboard</Link>
          <ChevronRight size={12} />
          <span className="text-slate-300">Order management</span>
        </nav>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Seller order management</h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage new orders, deliveries and customer reviews for <span className="text-slate-200">{sellerName}</span>.
            </p>
          </div>
        </div>

        <div className="mt-6"><AccountMenu /></div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Orders" value={analytics.total} Icon={Package} color="from-emerald-500 to-green-500" />
          <StatCard label="Pending" value={analytics.pending} Icon={Inbox} color="from-orange-500 to-amber-500" />
          <StatCard label="Revenue" value={`$${analytics.revenue.toFixed(2)}`} Icon={DollarSign} color="from-blue-500 to-indigo-500" />
          <StatCard label="Reviews" value={summary.count} Icon={Star} color="from-violet-500 to-purple-500" />
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
                  data-testid={`seller-orders-tab-${t.id}`}
                >
                  <Icon size={15} /> {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          {['new', 'accepted', 'completed', 'cancelled'].includes(tab) && (
            <SellerTable
              orders={filtered}
              tab={tab}
              onAccept={accept}
              onComplete={complete}
              onDecline={decline}
            />
          )}

          {tab === 'reviews' && (
            <ReviewList reviews={reviews} showProduct emptyText="No customer reviews yet." />
          )}

          {tab === 'analytics' && (
            <AnalyticsPanel analytics={analytics} summary={summary} orders={sellerOrders} />
          )}
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

function SellerTable({ orders, tab, onAccept, onComplete, onDecline }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="card-surface rounded-2xl p-10 text-center" data-testid={`seller-orders-empty-${tab}`}>
        <p className="text-white font-semibold">Nothing here yet</p>
        <p className="text-sm text-slate-400 mt-2">Orders in this state will appear as they come in.</p>
      </div>
    );
  }
  return (
    <ul className="space-y-3" data-testid={`seller-orders-list-${tab}`}>
      {orders.map((o) => (
        <li key={o.id} className="card-surface rounded-2xl p-4 sm:p-5" data-testid={`seller-order-${o.id}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Order #{o.id.slice(2, 8)}</p>
              <p className="mt-0.5 text-white font-semibold truncate">{o.title}</p>
              <p className="mt-1 text-xs text-slate-400">
                Buyer: <span className="text-slate-200">{o.buyerName}</span> · Placed {new Date(o.createdAt).toLocaleDateString()}
              </p>
              {o.note && (
                <p className="mt-2 text-xs text-slate-300 italic">Buyer note: "{o.note}"</p>
              )}
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
            {tab === 'new' && (
              <>
                <Button
                  onClick={() => onAccept(o)}
                  className="rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-xs font-semibold px-3 py-1.5 h-auto"
                  data-testid={`seller-order-accept-${o.id}`}
                >
                  Accept order
                </Button>
                <button
                  onClick={() => onDecline(o)}
                  className="rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/15 text-rose-300 text-xs font-semibold px-3 py-1.5 btn-hover"
                  data-testid={`seller-order-decline-${o.id}`}
                >
                  Decline
                </button>
              </>
            )}
            {tab === 'accepted' && (
              <Button
                onClick={() => onComplete(o)}
                className="rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-xs font-semibold px-3 py-1.5 h-auto"
                data-testid={`seller-order-complete-${o.id}`}
              >
                Mark as delivered
              </Button>
            )}
            <Link
              to={`/services/${o.productId}`}
              className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold px-3 py-1.5 btn-hover"
            >
              View service
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}

function AnalyticsPanel({ analytics, summary, orders }) {
  const byMonth = useMemo(() => {
    const m = {};
    orders
      .filter((o) => o.status === ORDER_STATUS.COMPLETED)
      .forEach((o) => {
        const d = new Date(o.createdAt);
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        m[k] = (m[k] || 0) + Number(o.price || 0);
      });
    return Object.entries(m).sort(([a], [b]) => a.localeCompare(b));
  }, [orders]);

  const max = byMonth.length ? Math.max(...byMonth.map(([, v]) => v)) : 0;

  return (
    <div className="grid gap-5 lg:grid-cols-2" data-testid="seller-analytics-panel">
      <div className="card-surface rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white">Performance summary</h3>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <MiniStat label="Completion rate" value={`${analytics.total ? Math.round((analytics.completed / analytics.total) * 100) : 0}%`} Icon={TrendingUp} />
          <MiniStat label="Avg rating" value={summary.avg ? summary.avg.toFixed(1) : '—'} Icon={Star} />
          <MiniStat label="Completed" value={analytics.completed} Icon={CheckCircle2} />
          <MiniStat label="Cancelled" value={analytics.cancelled} Icon={XCircle} />
        </div>
      </div>

      <div className="card-surface rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white">Revenue by month</h3>
        {byMonth.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No completed orders yet — analytics will appear after your first sale.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {byMonth.map(([month, value]) => (
              <li key={month}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300">{month}</span>
                  <span className="text-white font-semibold">${value.toFixed(2)}</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-400"
                    style={{ width: max ? `${(value / max) * 100}%` : '0%' }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function MiniStat({ label, value, Icon }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 flex items-center gap-3">
      <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-slate-400">{label}</p>
        <p className="text-lg font-extrabold text-white truncate">{value}</p>
      </div>
    </div>
  );
}
