import { Link } from 'react-router-dom';
import { ArrowLeft, Bell, Check, Trash2, ExternalLink, Info, ShieldCheck, Wallet, MessageCircle, Package } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationsContext';
import AccountMenu from '../components/AccountMenu';
import NotificationCenter from '../components/NotificationCenter';

const KIND_STYLES = {
  info: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  error: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};
const CATEGORY_ICON = { seller: ShieldCheck, product: Package, withdrawal: Wallet, message: MessageCircle, user: Info, general: Info };

function timeAgo(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationsPage() {
  const { items, unread, markRead, markAllRead, clearAll } = useNotifications();
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-100">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0f1e]/95 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center font-bold text-slate-900 shadow-lg shadow-emerald-500/20">S</span>
            <span className="text-lg font-bold tracking-tight text-white">ShahLance</span>
          </Link>
          <NotificationCenter trigger="bell" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/my-account" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 btn-hover">
          <ArrowLeft size={14} /> Back to My Account
        </Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Notifications</h1>
            <p className="text-sm text-slate-400 mt-1">{unread} unread of {items.length} total.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={markAllRead} className="rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 px-3.5 py-1.5 text-xs btn-hover inline-flex items-center gap-1.5"><Check size={12} /> Mark all read</button>
            <button onClick={clearAll} className="rounded-full border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 px-3.5 py-1.5 text-xs btn-hover inline-flex items-center gap-1.5"><Trash2 size={12} /> Clear</button>
          </div>
        </div>
        <div className="mt-5"><AccountMenu /></div>

        <div className="mt-6 card-surface rounded-2xl overflow-hidden">
          {items.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400"><Bell size={20} /></div>
              <p className="mt-4 text-slate-300 font-semibold">You're all caught up</p>
              <p className="text-sm text-slate-500 mt-1">Notifications for seller and product approvals, messages and payments will appear here.</p>
            </div>
          ) : items.map((n) => {
            const Icon = CATEGORY_ICON[n.category] || Info;
            return (
              <div key={n.id} className={`flex items-start gap-3 px-5 py-4 border-b border-white/5 ${n.read ? 'opacity-70' : 'bg-white/[0.02]'}`}>
                <span className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 ${KIND_STYLES[n.kind] || KIND_STYLES.info}`}><Icon size={16} /></span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-white font-semibold">{n.title}</p>
                    <span className="text-[11px] text-slate-500 shrink-0">{timeAgo(n.createdAt)}</span>
                  </div>
                  {n.message && <p className="mt-0.5 text-sm text-slate-400 leading-relaxed">{n.message}</p>}
                  <div className="mt-2 flex items-center gap-2">
                    {n.link && (
                      <Link to={n.link} onClick={() => markRead(n.id)} className="text-xs text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 btn-hover">
                        Open <ExternalLink size={11} />
                      </Link>
                    )}
                    {!n.read && (
                      <button onClick={() => markRead(n.id)} className="text-xs text-slate-500 hover:text-slate-300 btn-hover">Mark read</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
