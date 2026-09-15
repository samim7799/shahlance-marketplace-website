import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { ArrowLeft, Star, BadgeCheck, ShieldCheck, Users } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getSocialListings, SOCIAL_PLATFORMS, getSellerMeta } from '../mock/accountsData';

const PLATFORM_ICON = {
  Instagram: 'Instagram', TikTok: 'Music2', YouTube: 'Youtube', Facebook: 'Facebook',
  X: 'Twitter', LinkedIn: 'Linkedin', Discord: 'MessageCircle', Telegram: 'Send', Other: 'Globe',
};

export default function SocialMediaAccounts() {
  const all = useMemo(() => getSocialListings(), []);
  const [platform, setPlatform] = useState('All');

  const list = useMemo(
    () => (platform === 'All' ? all : all.filter((l) => l.platform === platform)),
    [all, platform]
  );

  const filters = ['All', ...SOCIAL_PLATFORMS];

  return (
    <div>
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Link to="/accounts" className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-white btn-hover rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70">
          <ArrowLeft size={15} aria-hidden="true" /> Accounts Marketplace
        </Link>

        <div className="mt-3 flex items-center gap-3">
          <span className="h-11 w-11 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
            <Users className="h-6 w-6 text-white" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">Social Media Accounts</h1>
            <p className="text-xs sm:text-sm text-slate-400">Aged & verified profiles — escrow protected.</p>
          </div>
        </div>

        {/* Platform filters */}
        <div className="mt-5 -mx-1 flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-none">
          {filters.map((p) => {
            const active = platform === p;
            const PIcon = p === 'All' ? Icons.LayoutGrid : (Icons[PLATFORM_ICON[p]] || Icons.Globe);
            return (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                aria-pressed={active}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium btn-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 ${
                  active ? 'bg-emerald-500 border-emerald-500 text-slate-900' : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <PIcon size={13} aria-hidden="true" /> {p}
              </button>
            );
          })}
        </div>

        <div className="mt-4 text-sm text-slate-300">
          <span className="text-white font-semibold">{list.length}</span> {platform === 'All' ? 'accounts' : `${platform} accounts`}
        </div>

        {/* Compact card grid — up to 4 per row */}
        {list.length === 0 ? (
          <div className="mt-8 card-surface rounded-2xl p-10 text-center">
            <h3 className="text-lg font-bold text-white">No {platform} accounts right now</h3>
            <p className="mt-1 text-sm text-slate-400">Try another platform.</p>
            <button onClick={() => setPlatform('All')} className="mt-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold px-5 py-2 text-sm btn-hover">Show all</button>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {list.map((l) => <SocialCard key={l.id} listing={l} />)}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function SocialCard({ listing }) {
  const PIcon = Icons[PLATFORM_ICON[listing.platform]] || Icons.Globe;
  const seller = getSellerMeta(listing);
  return (
    <Link
      to={`/accounts/${listing.id}`}
      aria-label={`View ${listing.title}`}
      className="group card-surface card-hover rounded-2xl overflow-hidden flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
    >
      <div className={`relative aspect-square bg-gradient-to-br ${listing.color} flex items-center justify-center`}>
        <PIcon className="h-9 w-9 sm:h-11 sm:w-11 text-white drop-shadow-lg" strokeWidth={1.7} aria-hidden="true" />
        {listing.verified && (
          <span className="absolute top-2 right-2 inline-flex items-center gap-0.5 rounded-full bg-black/40 backdrop-blur px-1.5 py-0.5 text-[9px] font-semibold text-emerald-300 border border-emerald-400/30">
            <BadgeCheck size={9} aria-hidden="true" /> Verified
          </span>
        )}
        {listing.badge && (
          <span className="absolute top-2 left-2 rounded-full bg-black/40 backdrop-blur px-1.5 py-0.5 text-[9px] font-semibold text-white border border-white/20">{listing.badge}</span>
        )}
      </div>
      <div className="p-2.5 sm:p-3 flex flex-col gap-1.5 flex-1">
        <span className="text-[10px] font-medium text-slate-400">{listing.platform}</span>
        <h3 className="text-[12px] sm:text-[13px] font-semibold text-white leading-snug clamp-2 group-hover:text-emerald-300 btn-hover">{listing.title}</h3>
        {listing.followers && <span className="inline-flex items-center gap-1 text-[11px] text-slate-300"><Users size={11} aria-hidden="true" /> {listing.followers}</span>}
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="inline-flex items-center gap-0.5"><Star size={11} className="text-amber-400 fill-amber-400" aria-hidden="true" /> {seller.rating.toFixed(1)}</span>
          <span className="inline-flex items-center gap-0.5"><ShieldCheck size={11} className="text-emerald-400" aria-hidden="true" /> Escrow</span>
        </div>
        <div className="mt-auto pt-2 flex items-center justify-between border-t border-white/5">
          <span className="text-sm font-bold text-white">{listing.price === 0 ? 'Quote' : `$${listing.price.toFixed(2)}`}</span>
          <span className="rounded-lg bg-emerald-500 group-hover:bg-emerald-400 text-slate-900 text-[11px] font-semibold px-2.5 py-1 btn-hover">View</span>
        </div>
      </div>
    </Link>
  );
}
