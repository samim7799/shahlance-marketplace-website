import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import * as Icons from 'lucide-react';
import {
  Search, ArrowUpDown, ShieldCheck, Sparkles, Store, X, Grid3x3, Star, Clock,
  ArrowRight, Zap, BadgeCheck, Layers,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { ACCOUNT_CATEGORIES, ACCOUNT_LISTINGS, ACCOUNTS_MARKETPLACE_STATS, getListingStats, getAccountCategory, getListingFeatures, getSellerMeta } from '../mock/accountsData';

const SORTS = [
  { id: 'popular', label: 'Most Popular' },
  { id: 'newest', label: 'Newest' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'rating', label: 'Top Rated' },
];

const POPULAR = ['Instagram', 'Gmail', 'Stripe', 'Binance', 'ChatGPT', 'YouTube'];

export default function AccountsMarketplace() {
  const [sp, setSp] = useSearchParams();
  const initialCat = sp.get('category') || 'all';
  const initialQ = sp.get('q') || '';

  const [q, setQ] = useState(initialQ);
  const [activeCat, setActiveCat] = useState(initialCat);
  const [sort, setSort] = useState('popular');
  const [visibleCount, setVisibleCount] = useState(12);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = ACCOUNT_LISTINGS.filter((p) => {
      if (activeCat !== 'all' && p.category !== activeCat) return false;
      if (term) {
        const hay = `${p.title} ${p.description} ${p.category}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
    switch (sort) {
      case 'newest': list = list.slice().reverse(); break;
      case 'price-asc': list = list.slice().sort((a, b) => a.price - b.price); break;
      case 'price-desc': list = list.slice().sort((a, b) => b.price - a.price); break;
      case 'rating': list = list.slice().sort((a, b) => b.rating - a.rating); break;
      case 'popular':
      default: list = list.slice().sort((a, b) => b.reviews - a.reviews);
    }
    return list;
  }, [q, activeCat, sort]);

  const visible = filtered.slice(0, visibleCount);
  const canLoadMore = visibleCount < filtered.length;
  const activeCatMeta = ACCOUNT_CATEGORIES.find((c) => c.id === activeCat);

  const submit = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(sp);
    if (q.trim()) next.set('q', q.trim()); else next.delete('q');
    setSp(next);
    setVisibleCount(12);
  };

  const pickCategory = (id) => {
    setActiveCat(id);
    setVisibleCount(12);
    const next = new URLSearchParams(sp);
    if (id === 'all') next.delete('category'); else next.set('category', id);
    setSp(next);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const countFor = (id) => ACCOUNT_LISTINGS.filter((l) => l.category === id).length;

  return (
    <div>
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden hero-glow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8 sm:pt-20 sm:pb-12 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300">
            <Layers size={13} /> Accounts Marketplace
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Buy verified <span className="text-gradient-green">accounts</span> with escrow
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Social, email, advertising, payment, crypto, gaming, creator and more — every account identity-checked and protected until delivery.
          </p>

          <form onSubmit={submit} className="mt-8 mx-auto max-w-2xl">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur px-2 py-2 shadow-xl shadow-black/20">
              <div className="pl-4 pr-2 text-slate-400"><Search size={18} /></div>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search accounts — 'Instagram', 'Stripe', 'Binance'..."
                className="flex-1 bg-transparent outline-none text-sm sm:text-base text-slate-100 placeholder:text-slate-500 py-2"
              />
              {q && (
                <button type="button" onClick={() => setQ('')} className="h-8 w-8 rounded-full text-slate-400 hover:text-white hover:bg-white/5 flex items-center justify-center" aria-label="Clear">
                  <X size={14} />
                </button>
              )}
              <Button type="submit" className="rounded-full h-11 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold">Search</Button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-500">Popular:</span>
            {POPULAR.map((t) => (
              <button
                key={t}
                onClick={() => { setQ(t); const next = new URLSearchParams(sp); next.set('q', t); setSp(next); setVisibleCount(12); }}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300 hover:text-white hover:border-emerald-500/40 btn-hover"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF STATS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/5">
          {ACCOUNTS_MARKETPLACE_STATS.map((s, i) => {
            const SIcon = Icons[s.icon] || Icons.Star;
            return (
              <div key={i} className={`flex items-center gap-3 px-4 py-4 ${i >= 2 ? 'border-t sm:border-t-0 border-white/5' : ''}`}>
                <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0"><SIcon size={17} className="text-emerald-400" /></div>
                <div className="min-w-0">
                  <div className="text-base font-extrabold text-white leading-none">{s.value}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CATEGORY GRID */}
      <section className="relative section-glow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Browse account categories</h2>
              <p className="text-sm text-slate-400 mt-0.5">Pick a category to jump straight to what you need</p>
            </div>
            <button
              onClick={() => pickCategory('all')}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold btn-hover border ${
                activeCat === 'all'
                  ? 'bg-emerald-500 border-emerald-500 text-slate-900'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
              }`}
            >
              <Grid3x3 size={13} /> All categories
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {ACCOUNT_CATEGORIES.map((c) => {
              const Icon = Icons[c.icon] || Icons.Box;
              const active = activeCat === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => pickCategory(c.id)}
                  className={`group flex items-start gap-3 rounded-2xl border p-3.5 text-left btn-hover ${
                    active
                      ? 'border-emerald-500/50 bg-emerald-500/10'
                      : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-emerald-500/30'
                  }`}
                >
                  <div className={`h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="h-5 w-5 text-white" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs font-semibold text-slate-100 leading-tight truncate group-hover:text-white">{c.name}</span>
                    <span className="text-[11px] text-slate-500">{countFor(c.id)} listings</span>
                    <span className="hidden lg:block text-[11px] text-slate-500 leading-snug clamp-2 mt-1">{c.blurb}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONTROLS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mt-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-white">
              {activeCat === 'all' ? 'All accounts' : activeCatMeta?.name}
            </h3>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-sm text-slate-300"><span className="text-white font-semibold">{filtered.length}</span> results</span>
            {(activeCat !== 'all' || q) && (
              <button
                onClick={() => { setQ(''); pickCategory('all'); const next = new URLSearchParams(sp); next.delete('q'); setSp(next); }}
                className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-2.5 py-0.5 text-xs text-slate-300 btn-hover"
              >
                Clear filter <X size={11} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 pl-3 pr-2 h-9">
              <ArrowUpDown size={13} className="text-slate-400" />
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-transparent outline-none text-sm text-slate-200" style={{ colorScheme: 'dark' }}>
                {SORTS.map((s) => <option key={s.id} value={s.id} className="bg-[#0f1526]">{s.label}</option>)}
              </select>
            </label>
          </div>
        </div>
        {activeCat !== 'all' && activeCatMeta?.blurb && (
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">{activeCatMeta.blurb}</p>
        )}
      </section>

      {/* LISTINGS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-16 max-w-lg mx-auto">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"><Search className="text-slate-400" /></div>
            <h3 className="mt-4 text-lg font-bold text-white">
              No accounts match{q ? ` “${q}”` : ' your filters'}{activeCat !== 'all' && activeCatMeta ? ` in ${activeCatMeta.name}` : ''}
            </h3>
            <p className="mt-1.5 text-sm text-slate-400">Try removing a filter, checking your spelling, or browse a popular category below.</p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {ACCOUNT_CATEGORIES.slice(0, 6).map((c) => {
                const CIcon = Icons[c.icon] || Icons.Box;
                return (
                  <button
                    key={c.id}
                    onClick={() => { setQ(''); const next = new URLSearchParams(sp); next.delete('q'); setSp(next); pickCategory(c.id); }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-emerald-500/30 px-3 py-1.5 text-xs text-slate-300 btn-hover"
                  >
                    <CIcon size={12} className="text-emerald-400" /> {c.name}
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {q && (
                <button onClick={() => { setQ(''); const next = new URLSearchParams(sp); next.delete('q'); setSp(next); setVisibleCount(12); }} className="rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 font-semibold px-5 py-2 text-sm btn-hover">Clear search</button>
              )}
              <button onClick={() => { setQ(''); pickCategory('all'); const next = new URLSearchParams(sp); next.delete('q'); setSp(next); }} className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold px-5 py-2 text-sm btn-hover">Browse all accounts</button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((p) => <AccountCard key={p.id} listing={p} />)}
            </div>
            {canLoadMore && (
              <div className="mt-10 flex justify-center">
                <Button onClick={() => setVisibleCount((n) => n + 12)} className="rounded-full h-11 px-8 bg-white/5 hover:bg-white/10 border border-white/10 text-white">
                  Load more accounts
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {/* TRUST STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="rounded-3xl border border-white/5 bg-gradient-to-r from-white/[0.03] to-white/[0.01] p-6 sm:p-8 grid gap-6 sm:grid-cols-3">
          <TrustCell Icon={ShieldCheck} title="Escrow protected" desc="Funds held safely until you confirm delivery" />
          <TrustCell Icon={BadgeCheck} title="Verified sellers" desc="Every seller identity-checked" />
          <TrustCell Icon={Zap} title="Fast handover" desc="Most accounts delivered within 1-2 days" />
        </div>
      </section>

      <Footer />
    </div>
  );
}

function AccountCard({ listing }) {
  const Icon = Icons[listing.icon] || Icons.Package;
  const stats = getListingStats(listing);
  const sellerMeta = getSellerMeta(listing);
  const typeName = (getAccountCategory(listing.category) || {}).name || 'Account';
  const topBenefit = (getListingFeatures(listing) || [])[0];
  return (
    <Link
      to={`/accounts/${listing.id}`}
      className="group card-surface card-hover rounded-2xl overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-emerald-500/5"
    >
      <div className={`relative aspect-[16/10] bg-gradient-to-br ${listing.color} flex items-center justify-center`}>
        <div className="absolute inset-0 bg-[radial-gradient(600px_200px_at_50%_-50%,rgba(255,255,255,0.2),transparent)]" />
        <Icon className="h-14 w-14 text-white drop-shadow-lg" strokeWidth={1.6} />
        {listing.badge && (
          <span className="absolute top-3 left-3 rounded-full bg-black/40 backdrop-blur px-2.5 py-1 text-[11px] font-semibold text-white border border-white/20">
            {listing.badge}
          </span>
        )}
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/40 backdrop-blur px-2 py-1 text-[11px] font-medium text-emerald-300 border border-emerald-400/30">
          <ShieldCheck size={10} /> Escrow
        </span>
        {stats.lowStock && (
          <span className="absolute bottom-3 left-3 rounded-full bg-amber-500/90 px-2.5 py-1 text-[11px] font-bold text-slate-900">
            Only {listing.stock} left
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="h-6 w-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-[10px] font-bold text-slate-900 shrink-0">
            {listing.seller.charAt(0)}
          </span>
          <span className="text-xs text-slate-300 font-medium truncate">{listing.seller}</span>
          <BadgeCheck size={13} className="text-emerald-400 shrink-0" />
          <span className="ml-auto inline-flex items-center gap-0.5 text-[11px] text-slate-400 shrink-0" title="Seller rating">
            <Star size={11} className="text-amber-400 fill-amber-400" /> {sellerMeta.rating.toFixed(1)}
          </span>
        </div>
        <h3 className="text-sm sm:text-[15px] font-semibold text-white leading-snug clamp-2 group-hover:text-emerald-300 btn-hover">
          {listing.title}
        </h3>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-medium text-slate-300">{typeName}</span>
          <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300 inline-flex items-center gap-1">
            <Icons.Truck size={10} /> {listing.deliveryDays}-day delivery
          </span>
        </div>
        {topBenefit && (
          <div className="flex items-start gap-1.5 text-[11px] text-slate-400">
            <Icons.CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" />
            <span className="clamp-1">{topBenefit}</span>
          </div>
        )}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Star size={13} className="text-amber-400 fill-amber-400" />
            <span className="text-slate-200 font-semibold">{listing.rating.toFixed(1)}</span>
            <span>({listing.reviews})</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={13} /> {listing.deliveryDays}d
          </span>
          <span className="inline-flex items-center gap-1 text-slate-500">· {stats.sold} sold</span>
        </div>
        <div className="mt-auto pt-3 border-t border-white/5 flex items-baseline justify-between">
          <span className="text-[11px] uppercase tracking-wider text-slate-500">{listing.priceLabel}</span>
          <span className="text-lg font-bold text-white">{listing.price === 0 ? 'Quote' : `$${listing.price.toFixed(2)}`}</span>
        </div>
      </div>
    </Link>
  );
}

function TrustCell({ Icon, title, desc }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-emerald-400" />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-white">{title}</h4>
        <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
