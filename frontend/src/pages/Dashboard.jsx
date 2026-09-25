import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { ChevronRight, Menu, X, Bell, Home as HomeIcon } from 'lucide-react';
import Footer from '../components/Footer';
import { DASHBOARDS } from '../mock/extendedData';

export default function Dashboard() {
  const { role } = useParams();
  const navigate = useNavigate();
  const key = ['buyer', 'worker', 'admin'].includes(role) ? role : 'buyer';
  const d = DASHBOARDS[key];
  const [activeItem, setActiveItem] = useState('Overview');
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      {/* Dashboard header */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0f1e]/95 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuOpen((v) => !v)} className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-white/5" aria-label="Menu">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link to="/" className="flex items-center gap-2.5">
              <span className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center font-bold text-slate-900 shadow-lg shadow-emerald-500/20">S</span>
              <span className="text-lg font-bold tracking-tight text-white">ShahLance</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-white/5 btn-hover relative" aria-label="Notifications">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-400" />
            </button>
            <div className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 pl-1 pr-3 py-1">
              <span className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-400 to-green-500" />
              <span className="text-sm text-slate-200 font-medium">Account</span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className={`${menuOpen ? 'block' : 'hidden'} lg:block border-r border-white/5 bg-[#080c17]/60 lg:min-h-[calc(100vh-4rem)]`}>
          <nav className="p-3 space-y-1">
            {d.sidebar.map((it) => {
              const Icon = Icons[it.icon] || Icons.Circle;
              const isActive = activeItem === it.label;
              return (
                <button
                  key={it.label}
                  onClick={() => { setActiveItem(it.label); setMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm btn-hover ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-emerald-400' : 'text-slate-400'} />
                  <span className="font-medium">{it.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
            <Link to="/" className="hover:text-emerald-400 btn-hover inline-flex items-center gap-1"><HomeIcon size={12} /> Home</Link>
            <ChevronRight size={12} />
            <span className="text-slate-300">{d.title}</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{d.title}</h1>
          <p className="text-sm text-slate-400 mt-1">{d.subtitle}</p>

          {/* Role switcher */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {['buyer', 'worker', 'admin'].map((r) => (
              <button
                key={r}
                onClick={() => navigate(`/dashboard/${r}`)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize btn-hover border ${
                  r === key
                    ? 'bg-emerald-500 text-slate-900 border-emerald-500'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                {r} view
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {d.stats.map((s) => {
              const Icon = Icons[s.icon] || Icons.CircleDot;
              return (
                <div key={s.label} className="card-surface rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-slate-400">{s.label}</p>
                      <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-white">{s.value}</p>
                      {s.delta && <p className="mt-1 text-[11px] text-emerald-400">{s.delta}</p>}
                    </div>
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg shrink-0`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Two columns */}
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <ListCard title={d.leftTitle} items={d.leftItems} showTag />
            <ListCard title={d.rightTitle} items={d.rightItems} />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

function ListCard({ title, items, showTag }) {
  const tagStyles = {
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    blue: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    rose: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  };
  return (
    <div className="card-surface rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <button className="text-xs text-emerald-400 hover:text-emerald-300 btn-hover">View all</button>
      </div>
      <ul className="mt-3 divide-y divide-white/5">
        {items.map((it, i) => (
          <li key={i} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="text-sm text-white font-medium truncate">{it.title}</p>
              <p className="text-xs text-slate-400 truncate">{it.sub}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {it.amount && <span className="text-sm font-semibold text-white">{it.amount}</span>}
              {showTag && it.tag && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${tagStyles[it.tagColor] || tagStyles.emerald}`}>
                  {it.tag}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
