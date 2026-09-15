import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as Icons from 'lucide-react';
import {
  ArrowLeft, ChevronRight, Star, Clock, ShieldCheck, CheckCircle2, Package,
  BadgeCheck, Zap, Store, MessageCircle, Lock, Users, ShoppingCart, HelpCircle,
  Timer, CalendarDays, TrendingUp, ListChecks, Info, Compass,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import {
  getAccountListing, getAccountCategory, getListingFeatures, ACCOUNT_LISTINGS, ACCOUNT_CATEGORIES,
  getSellerMeta, getListingStats, ACCOUNTS_ESCROW_STEPS, ACCOUNTS_GUARANTEES, ACCOUNTS_FAQ,
} from '../mock/accountsData';

export default function AccountDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const listing = getAccountListing(id);
  const category = listing ? getAccountCategory(listing.category) : null;

  const related = useMemo(() => {
    if (!listing) return [];
    return ACCOUNT_LISTINGS.filter((l) => l.category === listing.category && l.id !== listing.id).slice(0, 4);
  }, [listing]);

  const alsoLike = useMemo(() => {
    if (!listing) return [];
    return ACCOUNT_LISTINGS
      .filter((l) => l.category !== listing.category)
      .slice()
      .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
      .slice(0, 4);
  }, [listing]);

  if (!listing) {
    return (
      <div>
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"><Package className="text-slate-400" /></div>
          <h1 className="mt-4 text-2xl font-bold text-white">Account not found</h1>
          <p className="mt-1 text-sm text-slate-400">This listing may have been sold or removed.</p>
          <Link to="/accounts" className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold px-5 py-2.5 text-sm btn-hover">
            <ArrowLeft size={15} /> Back to Accounts Marketplace
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const Icon = Icons[listing.icon] || Icons.Package;
  const features = getListingFeatures(listing);
  const seller = getSellerMeta(listing);
  const stats = getListingStats(listing);

  const buyNow = () => {
    toast({
      title: 'Reserved via escrow',
      description: 'Secure checkout for account listings is launching soon — contact the seller to complete this purchase.',
    });
  };

  return (
    <div>
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 flex-wrap">
          <Link to="/accounts" className="hover:text-emerald-400 btn-hover">Accounts Marketplace</Link>
          <ChevronRight size={12} />
          <Link to={`/accounts?category=${listing.category}`} className="hover:text-emerald-400 btn-hover">{category?.name}</Link>
          <ChevronRight size={12} />
          <span className="text-slate-300 truncate max-w-[220px]">{listing.title}</span>
        </nav>

        <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* LEFT */}
          <div>
            <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${listing.color} aspect-[16/8] flex items-center justify-center`}>
              <div className="absolute inset-0 bg-[radial-gradient(800px_260px_at_50%_-40%,rgba(255,255,255,0.25),transparent)]" />
              <Icon className="h-24 w-24 text-white drop-shadow-lg" strokeWidth={1.4} />
              {listing.badge && (
                <span className="absolute top-4 left-4 rounded-full bg-black/40 backdrop-blur px-3 py-1 text-xs font-semibold text-white border border-white/20">{listing.badge}</span>
              )}
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-emerald-300 font-medium">
                <ShieldCheck size={12} /> Escrow protected
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
                <Store size={12} /> {category?.name}
              </span>
            </div>

            <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold text-white leading-tight">{listing.title}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <Star size={15} className="text-amber-400 fill-amber-400" />
                <span className="font-semibold text-white">{listing.rating.toFixed(1)}</span>
                <span className="text-slate-400">({listing.reviews} reviews)</span>
              </span>
              <span className="inline-flex items-center gap-1.5"><Clock size={15} className="text-slate-400" /> {listing.deliveryDays}-day delivery</span>
              <span className="inline-flex items-center gap-1.5"><Package size={15} className="text-slate-400" /> {listing.stock} in stock</span>
            </div>

            {/* Social proof */}
            <div className="mt-3 flex flex-wrap items-center gap-2.5 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-slate-300"><ShoppingCart size={12} className="text-emerald-400" /> {stats.sold} sold</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-slate-300"><Users size={12} className="text-sky-400" /> {stats.viewing} viewing now</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-slate-300"><TrendingUp size={12} className="text-fuchsia-400" /> Last sold {stats.lastSoldHrs}h ago</span>
              {stats.lowStock && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 text-amber-300 font-medium">Only {listing.stock} left</span>
              )}
            </div>

            <div className="mt-6">
              <h2 className="text-base font-bold text-white flex items-center gap-2"><Info size={16} className="text-emerald-400" /> Overview</h2>
              <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">{listing.description}</p>
            </div>

            {/* Seller trust card */}
            <div className="mt-6 card-surface rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-lg font-bold text-slate-900">
                  {seller.name.charAt(0)}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white truncate">{seller.name}</span>
                    <BadgeCheck size={15} className="text-emerald-400 shrink-0" />
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-400">
                    <span className="inline-flex items-center gap-1"><Star size={11} className="text-amber-400 fill-amber-400" /> {seller.rating.toFixed(1)} seller rating</span>
                    <span>·</span>
                    <span>{seller.sales.toLocaleString()} sales</span>
                  </div>
                </div>
              </div>
              <div className="sm:ml-auto grid grid-cols-3 gap-4 text-center">
                <SellerStat Icon={Timer} value={`~${seller.responseHours}h`} label="Responds" />
                <SellerStat Icon={CalendarDays} value={seller.memberSince} label="Member since" />
                <SellerStat Icon={ShieldCheck} value="KYC" label="Verified" />
              </div>
            </div>


            {/* At a glance — comparison-friendly quick facts */}
            <div className="mt-8 card-surface rounded-2xl p-5 sm:p-6">
              <h2 className="text-base font-bold text-white flex items-center gap-2"><ListChecks size={16} className="text-emerald-400" /> At a glance</h2>
              <dl className="mt-4 grid gap-x-8 sm:grid-cols-2">
                <FactRow label="Account type" value={category?.name} />
                <FactRow label="Price" value={listing.price === 0 ? 'Custom quote' : `$${listing.price.toFixed(2)} ${listing.priceLabel}`} />
                <FactRow label="Delivery time" value={`${listing.deliveryDays} day(s)`} />
                <FactRow label="Availability" value={`${listing.stock} in stock`} />
                <FactRow label="Ownership" value={features[0]} />
                <FactRow label="Warranty" value="Replacement included" />
                <FactRow label="Buyer protection" value="Escrow protected" />
                <FactRow label="Seller rating" value={`${seller.rating.toFixed(1)} / 5 · ${seller.sales.toLocaleString()} sales`} />
              </dl>
            </div>

            {/* What you get */}
            <div className="mt-8 card-surface rounded-2xl p-5 sm:p-6">
              <h2 className="text-base font-bold text-white flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400" /> What you get</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Seller / trust */}
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <TrustBox Icon={BadgeCheck} title="Verified seller" desc={listing.seller} />
              <TrustBox Icon={Lock} title="Secure handover" desc="Credentials shared safely" />
              <TrustBox Icon={Zap} title="Support included" desc="Post-sale assistance" />
            </div>

            {/* How escrow protects you */}
            <div className="mt-8 card-surface rounded-2xl p-5 sm:p-6">
              <h2 className="text-base font-bold text-white flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-400" /> How escrow protects you</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {ACCOUNTS_ESCROW_STEPS.map((s, i) => {
                  const SIcon = Icons[s.icon] || Icons.Circle;
                  return (
                    <div key={i} className="relative rounded-xl border border-white/5 bg-white/[0.02] p-4">
                      <span className="absolute top-3 right-3 text-[11px] font-bold text-slate-600">0{i + 1}</span>
                      <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"><SIcon size={17} className="text-emerald-400" /></div>
                      <h4 className="mt-3 text-sm font-semibold text-white">{s.title}</h4>
                      <p className="mt-1 text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Buyer guarantees */}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {ACCOUNTS_GUARANTEES.map((g, i) => {
                const GIcon = Icons[g.icon] || Icons.Shield;
                return (
                  <div key={i} className="card-surface rounded-2xl p-5 flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0"><GIcon size={18} className="text-emerald-400" /></div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{g.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{g.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* FAQ */}
            <div className="mt-8">
              <h2 className="text-base font-bold text-white flex items-center gap-2"><HelpCircle size={16} className="text-emerald-400" /> Frequently asked</h2>
              <div className="mt-4 space-y-2.5">
                {ACCOUNTS_FAQ.map((f, i) => (
                  <details key={i} className="group card-surface rounded-xl px-4 py-3">
                    <summary className="flex items-center justify-between cursor-pointer list-none text-sm font-medium text-slate-100">
                      <span>{f.q}</span>
                      <ChevronRight size={16} className="text-slate-400 transition-transform group-open:rotate-90 shrink-0 ml-3" />
                    </summary>
                    <p className="mt-2.5 text-sm text-slate-400 leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — purchase card */}
          <aside className="order-first lg:order-none">
            <div className="lg:sticky lg:top-24 card-surface rounded-2xl p-5 sm:p-6">
              <div className="flex items-baseline justify-between">
                <span className="text-xs uppercase tracking-wider text-slate-500">{listing.priceLabel}</span>
                <span className="text-3xl font-extrabold text-white">{listing.price === 0 ? 'Custom' : `$${listing.price.toFixed(2)}`}</span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 text-emerald-300 font-medium"><BadgeCheck size={11} /> Verified seller</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-slate-300"><ShoppingCart size={11} /> {stats.sold} sold</span>
                {stats.lowStock && <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-amber-300 font-medium">Only {listing.stock} left</span>}
              </div>

              <div className="mt-4 space-y-2.5 text-sm">
                <Row Icon={Clock} label="Delivery" value={`${listing.deliveryDays} day(s)`} />
                <Row Icon={Package} label="Availability" value={`${listing.stock} in stock`} />
                <Row Icon={ShieldCheck} label="Protection" value="Escrow held" />
              </div>

              <Button onClick={buyNow} className="mt-5 w-full rounded-xl h-12 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-base btn-hover">
                {listing.price === 0 ? 'Request a quote' : 'Buy now'}
              </Button>
              <Link to="/contact" className="mt-2.5 w-full inline-flex items-center justify-center gap-2 rounded-xl h-11 border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-semibold btn-hover">
                <MessageCircle size={15} /> Contact seller
              </Link>
              <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                <AssureRow Icon={ShieldCheck} text="Escrow protected — released only when you confirm" />
                <AssureRow Icon={Lock} text="Private, secure credential handover" />
                <AssureRow Icon={Zap} text="Replacement warranty included" />
              </div>
            </div>
          </aside>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-14">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">More in {category?.name}</h2>
              <Link to={`/accounts?category=${listing.category}`} className="text-sm text-emerald-400 hover:text-emerald-300 btn-hover inline-flex items-center gap-1">
                View all <ChevronRight size={14} />
              </Link>
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => {
                const RIcon = Icons[r.icon] || Icons.Package;
                return (
                  <Link key={r.id} to={`/accounts/${r.id}`} className="group card-surface card-hover rounded-2xl overflow-hidden flex flex-col">
                    <div className={`relative aspect-[16/10] bg-gradient-to-br ${r.color} flex items-center justify-center`}>
                      <RIcon className="h-12 w-12 text-white drop-shadow-lg" strokeWidth={1.6} />
                    </div>
                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <h3 className="text-sm font-semibold text-white leading-snug clamp-2 group-hover:text-emerald-300 btn-hover">{r.title}</h3>
                      <div className="mt-auto pt-2 flex items-baseline justify-between border-t border-white/5">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400"><Star size={12} className="text-amber-400 fill-amber-400" /> {r.rating.toFixed(1)}</span>
                        <span className="text-base font-bold text-white">{r.price === 0 ? 'Quote' : `$${r.price.toFixed(2)}`}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* You may also like — cross-category discovery */}
        {alsoLike.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">You may also like</h2>
              <Link to="/accounts" className="text-sm text-emerald-400 hover:text-emerald-300 btn-hover inline-flex items-center gap-1">
                Explore all <ChevronRight size={14} />
              </Link>
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {alsoLike.map((r) => {
                const RIcon = Icons[r.icon] || Icons.Package;
                return (
                  <Link key={r.id} to={`/accounts/${r.id}`} className="group card-surface card-hover rounded-2xl overflow-hidden flex flex-col">
                    <div className={`relative aspect-[16/10] bg-gradient-to-br ${r.color} flex items-center justify-center`}>
                      <RIcon className="h-12 w-12 text-white drop-shadow-lg" strokeWidth={1.6} />
                      <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-black/40 backdrop-blur px-2 py-0.5 text-[10px] font-medium text-emerald-300 border border-emerald-400/30"><Star size={9} className="fill-amber-400 text-amber-400" /> {r.rating.toFixed(1)}</span>
                    </div>
                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <span className="text-[10px] text-slate-500">{(getAccountCategory(r.category) || {}).name}</span>
                      <h3 className="text-sm font-semibold text-white leading-snug clamp-2 group-hover:text-emerald-300 btn-hover">{r.title}</h3>
                      <div className="mt-auto pt-2 flex items-baseline justify-between border-t border-white/5">
                        <span className="text-[11px] uppercase tracking-wider text-slate-500">{r.priceLabel}</span>
                        <span className="text-base font-bold text-white">{r.price === 0 ? 'Quote' : `$${r.price.toFixed(2)}`}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Explore more categories */}
        <section className="mt-12">
          <h2 className="text-base font-bold text-white flex items-center gap-2"><Compass size={16} className="text-emerald-400" /> Explore more account categories</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {ACCOUNT_CATEGORIES.filter((c) => c.id !== listing.category).map((c) => {
              const CIcon = Icons[c.icon] || Icons.Box;
              return (
                <Link
                  key={c.id}
                  to={`/accounts?category=${c.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-emerald-500/30 px-3 py-1.5 text-xs text-slate-300 btn-hover"
                >
                  <CIcon size={12} className="text-emerald-400" /> {c.name}
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function Row({ Icon, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="inline-flex items-center gap-2 text-slate-400"><Icon size={15} /> {label}</span>
      <span className="text-slate-200 font-medium">{value}</span>
    </div>
  );
}

function FactRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-white/5">
      <dt className="text-sm text-slate-400 shrink-0">{label}</dt>
      <dd className="text-sm text-slate-100 font-medium text-right">{value}</dd>
    </div>
  );
}

function AssureRow({ Icon, text }) {
  return (
    <div className="flex items-start gap-2 text-[11px] text-slate-400 leading-relaxed">
      <Icon size={13} className="text-emerald-400 mt-0.5 shrink-0" />
      <span>{text}</span>
    </div>
  );
}

function SellerStat({ Icon, value, label }) {
  return (
    <div className="min-w-[64px]">
      <Icon size={14} className="mx-auto text-slate-400" />
      <div className="mt-1 text-sm font-bold text-white leading-none">{value}</div>
      <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}

function TrustBox({ Icon, title, desc }) {
  return (
    <div className="card-surface rounded-2xl p-4 flex items-start gap-3">
      <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
        <Icon className="h-4.5 w-4.5 text-emerald-400" size={18} />
      </div>
      <div className="min-w-0">
        <h4 className="text-sm font-semibold text-white truncate">{title}</h4>
        <p className="text-xs text-slate-400 mt-0.5 truncate">{desc}</p>
      </div>
    </div>
  );
}
