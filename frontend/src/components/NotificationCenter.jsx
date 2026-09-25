import { useEffect, useRef, useState } from 'react';
import { Bell, Check, Trash2, ExternalLink, Info, ShieldCheck, Wallet, MessageCircle, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationsContext';

const KIND_STYLES = {
  info: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  error: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

const CATEGORY_ICON = {
  seller: ShieldCheck,
  product: Package,
  withdrawal: Wallet,
  message: MessageCircle,
  user: Info,
  general: Info,
};

function timeAgo(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function NotificationCenter({ trigger = 'bell' }) {
  const { items, unread, markRead, markAllRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div ref={ref} className="relative">
      {trigger === 'bell' ? (
        <button
          onClick={() => setOpen((v) => !v)}
          className="relative h-9 w-9 inline-flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-white/5 btn-hover"
          aria-label="Notifications"
        >
          <Bell size={16} />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-emerald-500 text-slate-900 text-[10px] font-bold flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      ) : (
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-slate-200 btn-hover relative"
        >
          <Bell size={13} /> Notifications
          {unread > 0 && <span className="ml-1 min-w-[16px] h-4 px-1 rounded-full bg-emerald-500 text-slate-900 text-[10px] font-bold flex items-center justify-center">{unread}</span>}
        </button>
      )}

      {open && (
        <div className="absolute right-0 mt-2 w-[340px] sm:w-[380px] max-h-[80vh] flex flex-col rounded-2xl border border-white/10 bg-[#0f1526] shadow-2xl shadow-black/50 z-[80] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <div>
              <p className="text-sm font-semibold text-white">Notifications</p>
              <p className="text-[11px] text-slate-400">{unread} unread</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={markAllRead} className="text-[11px] text-slate-400 hover:text-emerald-300 inline-flex items-center gap-1 btn-hover">
                <Check size={12} /> Mark all
              </button>
              <button onClick={clearAll} className="text-[11px] text-slate-400 hover:text-rose-300 inline-flex items-center gap-1 btn-hover">
                <Trash2 size={12} /> Clear
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {items.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">
                <div className="mx-auto h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500">
                  <Bell size={16} />
                </div>
                <p className="mt-3">You’re all caught up.</p>
              </div>
            ) : items.map((n) => {
              const Icon = CATEGORY_ICON[n.category] || Info;
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-white/5 ${n.read ? 'opacity-70' : 'bg-white/[0.03]'}`}
                >
                  <span className={`h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 ${KIND_STYLES[n.kind] || KIND_STYLES.info}`}>
                    <Icon size={14} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-white font-medium truncate">{n.title}</p>
                      <span className="text-[10px] text-slate-500 shrink-0">{timeAgo(n.createdAt)}</span>
                    </div>
                    {n.message && <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">{n.message}</p>}
                    <div className="mt-1.5 flex items-center gap-2">
                      {n.link && (
                        <Link
                          to={n.link}
                          onClick={() => { markRead(n.id); setOpen(false); }}
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 btn-hover"
                        >
                          Open <ExternalLink size={10} />
                        </Link>
                      )}
                      {!n.read && (
                        <button onClick={() => markRead(n.id)} className="text-[11px] text-slate-500 hover:text-slate-300 btn-hover">Mark read</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
