import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { CheckCircle2, Home, Package, ChevronRight } from 'lucide-react';
import { orderService } from '../services/orderService';
import OrderStatusBadge, { PaymentBadge } from '../components/OrderStatusBadge';

export default function OrderSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const o = await orderService.getById(id);
      setOrder(o);
      setLoading(false);
    })();
  }, [id]);

  return (
    <div>
      <Header />

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="card-surface rounded-3xl p-8 sm:p-10 text-center" data-testid="order-success-panel">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center">
            <CheckCircle2 size={32} className="text-emerald-400" />
          </div>
          <h1 className="mt-6 text-2xl sm:text-3xl font-bold text-white">Order placed successfully</h1>
          <p className="mt-2 text-slate-400 text-sm">
            Your order is now pending seller confirmation. You will be notified when it moves forward.
          </p>

          {loading ? (
            <p className="mt-6 text-sm text-slate-400">Loading order...</p>
          ) : order ? (
            <div className="mt-8 text-left rounded-2xl border border-white/5 bg-white/[0.03] p-5 space-y-3">
              <Row label="Order ID" value={order.id} />
              <Row label="Service" value={order.title} />
              <Row label="Seller" value={order.sellerName} />
              <Row label="Amount" value={`$${Number(order.price).toFixed(2)}`} />
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Status</span>
                <div className="flex items-center gap-2">
                  <OrderStatusBadge status={order.status} />
                  <PaymentBadge status={order.paymentStatus} />
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-rose-300">Order not found.</p>
          )}

          <div className="mt-8 grid sm:grid-cols-2 gap-3">
            <Button
              onClick={() => navigate('/dashboard/buyer-orders')}
              className="h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold inline-flex items-center justify-center gap-2"
              data-testid="order-success-view-orders"
            >
              <Package size={16} /> View my orders <ChevronRight size={14} />
            </Button>
            <Link
              to="/services"
              className="h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-semibold inline-flex items-center justify-center gap-2"
            >
              <Home size={16} /> Continue browsing
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="text-white font-semibold truncate max-w-[240px]">{value}</span>
    </div>
  );
}
