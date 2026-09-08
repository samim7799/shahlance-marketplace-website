import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ShieldCheck, Users, Package, Wallet, Star, FileText, CheckCircle2, XCircle,
  Clock, TrendingUp, BarChart3,
} from 'lucide-react';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { sellerService } from '../services/sellerService';
import { useToast } from '../hooks/use-toast';
import NotificationCenter from '../components/NotificationCenter';

const TABS = [
  { id: 'sellers', label: 'Seller Applications', Icon: ShieldCheck },
  { id: 'products', label: 'Product Approvals', Icon: Package },
  { id: 'withdrawals', label: 'Withdraw Management', Icon: Wallet },
  { id: 'sellerMgmt', label: 'Seller Management', Icon: Users },
  { id: 'reviews', label: 'Reviews Management', Icon: Star },
  { id: 'reports', label: 'Reports', Icon: FileText },
];

export default function AdminPanel() {
  const { user, isAuthenticated, loading } = useAuth();
  const { notifyUser } = useNotifications();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState('sellers');
  const [applications, setApplications] = useState([]);
  const [products, setProducts] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) navigate('/login', { state: { from: { pathname: '/admin' } } });
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    (async () => {
      setApplications(await sellerService.listApplications());
      setProducts(await sellerService.listProducts());
      setWithdrawals(await sellerService.listWithdrawals());
    })();
  }, [tab]);

  const counts = useMemo(() => ({
    pendingApps: applications.filter((a) => a.status === 'pending').length,
    pendingProds: products.filter((p) => p.status === 'pending').length,
    pendingWd: withdrawals.filter((w) => w.status === 'pending').length,
    approvedSellers: applications.filter((a) => a.status === 'approved').length,
  }), [applications, products, withdrawals]);

  const decideApp = async (a, action) => {
    const reason = action === 'reject' ? (prompt('Optional rejection reason?') || '') : '';
    await sellerService.decideApplication(a.id, action, reason);
    notifyUser(a.userId, {
      title: action === 'approve' ? 'Seller application approved' : 'Seller application rejected',
      message: action === 'approve' ? `You can now sell as “${a.sellerType.replace(/-/g, ' ')}”.` : (reason || 'Please review the requirements and reapply.'),
      kind: action === 'approve' ? 'success' : 'error',
      category: 'seller',
      link: action === 'approve' ? '/seller/upload' : '/become-seller',
    });
    setApplications(await sellerService.listApplications());
    toast({ title: `Application ${action}d` });
  };

  const decideProd = async (p, action) => {
    const reason = action === 'reject' ? (prompt('Optional rejection reason?') || '') : '';
    await sellerService.decideProduct(p.id, action, reason);
    notifyUser(p.userId, {
      title: action === 'approve' ? 'Product approved' : 'Product rejected',
      message: action === 'approve' ? `“${p.title}” is now live on the marketplace.` : (reason || 'Please revise and resubmit.'),
      kind: action === 'approve' ? 'success' : 'error',
      category: 'product',
      link: '/my-account',
    });
    setProducts(await sellerService.listProducts());
    toast({ title: `Product ${action}d` });
  };

  const decideWd = async (w, action) => {
    await sellerService.decideWithdrawal(w.id, action);
    notifyUser(w.userId, {
      title: action === 'approve' ? 'Withdrawal approved' : 'Withdrawal rejected',
      message: action === 'approve' ? `Your withdrawal of $${w.amount} has been approved and processed.` : 'Please check your payout details and try again.',
      kind: action === 'approve' ? 'success' : 'error',
      category: 'withdrawal',
    });
    setWithdrawals(await sellerService.listWithdrawals());
    toast({ title: `Withdrawal ${action}d` });
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-100">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0f1e]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center font-bold text-slate-900 shadow-lg shadow-emerald-500/20">S</span>
            <span className="text-lg font-bold tracking-tight text-white">ShahLance <span className="text-slate-500 font-normal">/ Admin</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <NotificationCenter trigger="bell" />
            <Link to="/my-account" className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-slate-200 btn-hover">
              My Account
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/my-account" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 btn-hover">
          <ArrowLeft size={14} /> Back to My Account
        </Link>
        <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-white">Admin Control Panel</h1>
        <p className="text-sm text-slate-400 mt-1">Approve sellers, review products, manage withdrawals and platform reports.</p>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Pending Applications" value={counts.pendingApps} Icon={ShieldCheck} color="from-orange-500 to-amber-500" />
          <Stat label="Pending Products" value={counts.pendingProds} Icon={Package} color="from-blue-500 to-indigo-500" />
          <Stat label="Pending Withdrawals" value={counts.pendingWd} Icon={Wallet} color="from-violet-500 to-fuchsia-500" />
          <Stat label="Approved Sellers" value={counts.approvedSellers} Icon={Users} color="from-emerald-500 to-green-500" />
        </div>

        {/* Tabs */}
        <div className="mt-6 flex flex-wrap gap-2">
          {TABS.map((t) => {
            const Icon = t.Icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold border btn-hover ${
                active ? 'bg-emerald-500 text-slate-900 border-emerald-500' : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
              }`}>
                <Icon size={13} /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="mt-5 card-surface rounded-2xl overflow-hidden">
          {tab === 'sellers' && <AppTable rows={applications} onDecide={decideApp} />}
          {tab === 'products' && <ProdTable rows={products} onDecide={decideProd} />}
          {tab === 'withdrawals' && <WdTable rows={withdrawals} onDecide={decideWd} />}
          {tab === 'sellerMgmt' && <SellerMgmtTable rows={applications.filter((a) => a.status === 'approved')} />}
          {tab === 'reviews' && <PlaceholderPanel Icon={Star} title="Reviews Management" desc="No new reviews flagged. Everything looks good." />}
          {tab === 'reports' && <ReportsPanel apps={applications} prods={products} wds={withdrawals} />}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Stat({ label, value, Icon, color }) {
  return (
    <div className="card-surface rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400">{label}</p>
          <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-white">{value}</p>
        </div>
        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}><Icon className="h-5 w-5 text-white" /></div>
      </div>
    </div>
  );
}

function Empty({ Icon, label }) {
  return (
    <div className="p-10 text-center text-sm text-slate-400">
      <div className="mx-auto h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500"><Icon size={16} /></div>
      <p className="mt-3">{label}</p>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    pending: 'text-amber-300 bg-amber-500/15 border-amber-500/30',
    approved: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
    rejected: 'text-rose-300 bg-rose-500/15 border-rose-500/30',
  };
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] capitalize ${map[status] || map.pending}`}>{status}</span>;
}

function AppTable({ rows, onDecide }) {
  if (rows.length === 0) return <Empty Icon={ShieldCheck} label="No seller applications yet." />;
  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-white/[0.03]">
          <tr><th className="text-left py-3 px-4">Applicant</th><th className="text-left">Type</th><th className="text-left">Category</th><th className="text-left">Submitted</th><th className="text-left">Status</th><th className="text-right px-4">Actions</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-white/5 align-middle">
              <td className="py-3 px-4"><p className="text-white font-medium">{r.fullName}</p><p className="text-[11px] text-slate-500">{r.email}</p></td>
              <td className="capitalize text-slate-200">{r.sellerType.replace(/-/g, ' ')}</td>
              <td className="text-slate-300">{r.category}</td>
              <td className="text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</td>
              <td><StatusPill status={r.status} /></td>
              <td className="text-right px-4">
                {r.status === 'pending' ? (
                  <div className="inline-flex gap-2">
                    <button onClick={() => onDecide(r, 'approve')} className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-xs font-semibold px-3 py-1.5 btn-hover"><CheckCircle2 size={12} /> Approve</button>
                    <button onClick={() => onDecide(r, 'reject')} className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 text-xs font-semibold px-3 py-1.5 btn-hover"><XCircle size={12} /> Reject</button>
                  </div>
                ) : <span className="text-xs text-slate-500">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProdTable({ rows, onDecide }) {
  if (rows.length === 0) return <Empty Icon={Package} label="No products submitted yet." />;
  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-white/[0.03]">
          <tr><th className="text-left py-3 px-4">Product</th><th className="text-left">Category</th><th className="text-left">Price</th><th className="text-left">Status</th><th className="text-right px-4">Actions</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-white/5">
              <td className="py-3 px-4"><p className="text-white font-medium">{r.title}</p><p className="text-[11px] text-slate-500 line-clamp-1">{r.description}</p></td>
              <td className="text-slate-200">{r.category}</td>
              <td className="text-slate-200">${r.price}</td>
              <td><StatusPill status={r.status} /></td>
              <td className="text-right px-4">
                {r.status === 'pending' ? (
                  <div className="inline-flex gap-2">
                    <button onClick={() => onDecide(r, 'approve')} className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-xs font-semibold px-3 py-1.5 btn-hover"><CheckCircle2 size={12} /> Approve</button>
                    <button onClick={() => onDecide(r, 'reject')} className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 text-xs font-semibold px-3 py-1.5 btn-hover"><XCircle size={12} /> Reject</button>
                  </div>
                ) : <span className="text-xs text-slate-500">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WdTable({ rows, onDecide }) {
  if (rows.length === 0) return <Empty Icon={Wallet} label="No withdrawal requests yet." />;
  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-white/[0.03]">
          <tr><th className="text-left py-3 px-4">Amount</th><th className="text-left">Method</th><th className="text-left">Requested</th><th className="text-left">Status</th><th className="text-right px-4">Actions</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-white/5">
              <td className="py-3 px-4 text-white font-semibold">${r.amount}</td>
              <td className="text-slate-200">{r.method}</td>
              <td className="text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</td>
              <td><StatusPill status={r.status} /></td>
              <td className="text-right px-4">
                {r.status === 'pending' ? (
                  <div className="inline-flex gap-2">
                    <button onClick={() => onDecide(r, 'approve')} className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-xs font-semibold px-3 py-1.5 btn-hover"><CheckCircle2 size={12} /> Approve</button>
                    <button onClick={() => onDecide(r, 'reject')} className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 text-xs font-semibold px-3 py-1.5 btn-hover"><XCircle size={12} /> Reject</button>
                  </div>
                ) : <span className="text-xs text-slate-500">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SellerMgmtTable({ rows }) {
  if (rows.length === 0) return <Empty Icon={Users} label="No approved sellers yet." />;
  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-white/[0.03]">
          <tr><th className="text-left py-3 px-4">Seller</th><th className="text-left">Type</th><th className="text-left">Country</th><th className="text-left">Approved</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-white/5">
              <td className="py-3 px-4"><p className="text-white font-medium">{r.fullName}</p><p className="text-[11px] text-slate-500">{r.email}</p></td>
              <td className="capitalize text-slate-200">{r.sellerType.replace(/-/g, ' ')}</td>
              <td className="text-slate-300">{r.country || '—'}</td>
              <td className="text-slate-400">{r.decidedAt ? new Date(r.decidedAt).toLocaleDateString() : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReportsPanel({ apps, prods, wds }) {
  const totals = {
    revenue: prods.filter((p) => p.status === 'approved').reduce((s, p) => s + Number(p.price || 0), 0),
    sellers: apps.filter((a) => a.status === 'approved').length,
    products: prods.filter((p) => p.status === 'approved').length,
    payouts: wds.filter((w) => w.status === 'approved').reduce((s, w) => s + Number(w.amount || 0), 0),
  };
  return (
    <div className="p-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <ReportCell label="Approved products value" value={`$${totals.revenue.toFixed(2)}`} Icon={TrendingUp} color="from-emerald-500 to-green-500" />
      <ReportCell label="Approved sellers" value={totals.sellers} Icon={Users} color="from-blue-500 to-indigo-500" />
      <ReportCell label="Live products" value={totals.products} Icon={Package} color="from-violet-500 to-fuchsia-500" />
      <ReportCell label="Payouts sent" value={`$${totals.payouts.toFixed(2)}`} Icon={BarChart3} color="from-orange-500 to-amber-500" />
    </div>
  );
}
function ReportCell({ label, value, Icon, color }) {
  return (
    <div className="card-surface rounded-xl p-5 flex items-start justify-between">
      <div><p className="text-xs text-slate-400">{label}</p><p className="mt-1 text-xl font-extrabold text-white">{value}</p></div>
      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}><Icon className="h-5 w-5 text-white" /></div>
    </div>
  );
}
function PlaceholderPanel({ Icon, title, desc }) {
  return (
    <div className="p-10 text-center">
      <div className="mx-auto h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400"><Icon size={18} /></div>
      <h3 className="mt-4 text-white font-semibold">{title}</h3>
      <p className="text-sm text-slate-400 mt-1">{desc}</p>
    </div>
  );
}
