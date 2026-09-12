import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Home as HomeIcon, Search, Store, ChevronLeft } from 'lucide-react';

/**
 * Additive: 404 page for unmatched routes. Matches the ShahLance premium
 * dark theme (bg-[#0a0f1e], emerald accents, card-surface, hero-glow).
 */
export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div>
      <Header />

      <section className="relative overflow-hidden hero-glow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center" data-testid="not-found-page">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300">
            Error 404
          </span>

          <h1 className="mt-6 text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-white leading-none">
            <span className="text-gradient-green">Lost</span> in the marketplace
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-xl mx-auto">
            The page you're looking for doesn't exist or may have been moved. Let's get you back to something useful.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="rounded-full h-11 px-5 bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:text-white"
              data-testid="not-found-back-btn"
            >
              <ChevronLeft size={16} className="mr-1.5" /> Go back
            </Button>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-full h-11 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold btn-hover"
              data-testid="not-found-home-btn"
            >
              <HomeIcon size={16} /> Back to home
            </Link>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-3 max-w-3xl mx-auto text-left">
            <SuggestionCard
              to="/services"
              Icon={Store}
              title="Browse services"
              desc="Explore the buyer marketplace"
              testId="not-found-suggest-services"
            />
            <SuggestionCard
              to="/marketplace"
              Icon={Search}
              title="Digital marketplace"
              desc="Accounts, subscriptions & more"
              testId="not-found-suggest-marketplace"
            />
            <SuggestionCard
              to="/find-freelancers"
              Icon={Search}
              title="Find freelancers"
              desc="Hire verified pros"
              testId="not-found-suggest-freelancers"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function SuggestionCard({ to, Icon, title, desc, testId }) {
  return (
    <Link
      to={to}
      className="card-surface card-hover rounded-2xl p-5 flex items-start gap-3 group"
      data-testid={testId}
    >
      <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-white font-semibold text-sm group-hover:text-emerald-300 transition-colors">{title}</p>
        <p className="text-xs text-slate-400 mt-1">{desc}</p>
      </div>
    </Link>
  );
}
