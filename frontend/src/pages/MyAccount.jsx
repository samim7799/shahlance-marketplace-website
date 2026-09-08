import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, LayoutDashboard, LogOut, Briefcase, Users, ShieldCheck, Store,
  Package, Wallet, Upload, Sparkles, ArrowRight, CheckCircle2, Clock, XCircle,
  BadgeCheck,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { sellerService } from '../services/sellerService';
import NotificationCenter from '../components/NotificationCenter';
import AccountMenu, { AccountQuickActions } from '../components/AccountMenu';
import { Avatar } from '../components/AuthAccessWidget';

export default function MyAccount() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const a = await sellerService.listUserApplications(user.id);
      const p = await sellerService.listProducts({ userId: user.id });
      setApps(a); setProducts(p);
    })();
  }, [user]);

  const isApprovedSeller = apps.some((a) => a.status === 'approved');
  const hasPending = apps.some((a) => a.status === 'pending');

  // Available dashboards for this user based on accountType
  const dashboards = [];
  const t = user?.accountType;
  if (t === 'client' || t === 'both') dashboards.push({ role: 'buyer', title: 'Buyer Dashboard', desc: 'Manage orders, payments and campaigns.', icon: Briefcase, color: 'from-blue-500 to-indigo-500' });
  if (t === 'freelancer' || t === 'both') dashboards.push({ role: 'worker', title: 'Worker Dashboard', desc: 'Browse tasks and track earnings.', icon: Users, color: 'from-emerald-500 to-green-500' });
  if (isApprovedSeller) dashboards.push({ role: 'worker', title: 'Seller Dashboard', desc: 'Manage products and sales as a seller.', icon: Store, color: 'from-orange-500 to-amber-500', seller: true });

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-100">
      {/* header */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0f1e]/95 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center font-bold text-slate-900 shadow-lg shadow-emerald-500/20">S</span>
            <span className="text-lg font-bold tracking-tight text-white">ShahLance</span>
          </Link>
          <div className="flex items-center gap-2">
            <NotificationCenter trigger="bell" />
            <button onClick={async () => { await logout(); navigate('/'); }} className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-3.5 py-1.5 text-xs font-semibold text-rose-200 btn-hover">
              <LogOut size={13} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 btn-hover">
          <ArrowLeft size={14} /> Back to home
        </Link>

        {/* Identity strip */}
        <div className="mt-4 card-surface rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-5">
          <Avatar user={user} size={64} />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white truncate">My Account</h1>
            <p className="text-sm text-slate-400 mt-1 truncate">
              Welcome back — manage your dashboards, applications and notifications from one place.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-200">
                <BadgeCheck size={11} className="text-emerald-400" /> {user?.accountType === 'both' ? 'Freelancer + Client' : (user?.accountType || '').charAt(0).toUpperCase() + (user?.accountType || '').slice(1)}
              </span>
              {isApprovedSeller && <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-300"><Store size={11}/> Approved Seller</span>}
              {hasPending && <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] text-amber-300"><Clock size={11}/> Application pending</span>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/profile" className="rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 px-4 py-2 text-sm btn-hover">Edit profile</Link>
            <Link to="/become-seller" className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-4 py-2 text-sm font-semibold btn-hover inline-flex items-center gap-1">
              <Sparkles size={13} /> Become a seller
            </Link>
          </div>
        </div>

        {/* Account menu (Profile / Dashboard / Messages / Notifications / Settings / Logout) */}
        <div className="mt-5"><AccountMenu /></div>

        {/* Role-based quick actions */}
        <AccountQuickActions isApprovedSeller={isApprovedSeller} />

        {/* Dashboards */}
        <h2 className="mt-8 text-lg font-bold text-white">Your dashboards</h2>
        <p className="text-sm text-slate-400 mt-0.5">Open any dashboard available to your account.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dashboards.map((d, i) => {
            const Icon = d.icon;
            const dest = d.seller ? '/seller/upload' : `/dashboard/${d.role}`;
            return (
              <Link key={i} to={dest} className="card-surface card-hover rounded-2xl overflow-hidden">
                <div className={`bg-gradient-to-r ${d.color} px-5 py-3 flex items-center gap-3`}>
                  <div className="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center"><Icon className="h-5 w-5 text-white" /></div>
                  <h3 className="text-white font-bold">{d.title}</h3>
                </div>
                <div className="p-5 flex items-center justify-between">
                  <p className="text-sm text-slate-300">{d.desc}</p>
                  <ArrowRight size={16} className="text-slate-400" />
                </div>
              </Link>
            );
          })}

          <Link to="/admin" className="card-surface card-hover rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-3 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center"><ShieldCheck className="h-5 w-5 text-white" /></div>
              <h3 className="text-white font-bold">Admin Panel</h3>
            </div>
            <div className="p-5 flex items-center justify-between">
              <p className="text-sm text-slate-300">Approve sellers, products and withdrawals.</p>
              <ArrowRight size={16} className="text-slate-400" />
            </div>
          </Link>
        </div>

        {/* Applications + products */}
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="card-surface rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">My seller applications</h3>
              <Link to="/become-seller" className="text-xs text-emerald-400 hover:text-emerald-300 btn-hover">Apply</Link>
            </div>
            {apps.length === 0 ? (
              <p className="mt-4 text-sm text-slate-400">You haven’t applied to become a seller yet.</p>
            ) : (
              <ul className="mt-3 divide-y divide-white/5">
                {apps.map((a) => (
                  <li key={a.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{a.sellerType.replace(/-/g, ' ')}</p>
                      <p className="text-[11px] text-slate-500">Submitted {new Date(a.createdAt).toLocaleDateString()}</p>
                    </div>
                    <StatusPill status={a.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card-surface rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">My products</h3>
              {isApprovedSeller && (
                <Link to="/seller/upload" className="text-xs text-emerald-400 hover:text-emerald-300 btn-hover inline-flex items-center gap-1">
                  <Upload size={12} /> Upload
                </Link>
              )}
            </div>
            {products.length === 0 ? (
              <p className="mt-4 text-sm text-slate-400">{isApprovedSeller ? 'Upload your first product.' : 'Approved sellers can upload products.'}</p>
            ) : (
              <ul className="mt-3 divide-y divide-white/5">
                {products.slice(0, 5).map((p) => (
                  <li key={p.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{p.title}</p>
                      <p className="text-[11px] text-slate-500">${p.price} · {p.category}</p>
                    </div>
                    <StatusPill status={p.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    pending: { color: 'bg-amber-500/15 text-amber-300 border-amber-500/30', Icon: Clock, label: 'Pending' },
    approved: { color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', Icon: CheckCircle2, label: 'Approved' },
    rejected: { color: 'bg-rose-500/15 text-rose-300 border-rose-500/30', Icon: XCircle, label: 'Rejected' },
  };
  const m = map[status] || map.pending;
  const Icon = m.Icon;
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] ${m.color}`}><Icon size={11} /> {m.label}</span>;
}
