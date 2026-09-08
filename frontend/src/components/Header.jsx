import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Search, Bell, Menu, X, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const NAV = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/#featured' },
  { label: 'Find Freelancers', to: '/find-freelancers' },
  { label: 'Find Work', to: '/dashboard/worker' },
  { label: 'Post a Job', to: '/post-job' },
  { label: 'Work & Earn', to: '/#work-earn' },
  { label: 'Become a Seller', to: '/search?q=Freelancer' },
  { label: 'Contact', to: '/contact' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setSearchOpen(false); }, [location.pathname, location.search]);

  const submit = (e) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setQ('');
  };

  return (
    <header className={`sticky top-0 z-50 w-full backdrop-blur-xl transition-colors duration-300 ${scrolled ? 'bg-[#0a0f1e]/90 border-b border-white/5' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <span className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center font-bold text-slate-900 shadow-lg shadow-emerald-500/20">S</span>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-white">ShahLance</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV.map((n) => (
              <Link
                key={n.label}
                to={n.to}
                className={`text-sm font-medium btn-hover ${location.pathname === '/' && n.label === 'Home' ? 'text-white' : 'text-slate-300 hover:text-white'}`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              aria-label="Search"
              onClick={() => setSearchOpen((s) => !s)}
              className="h-9 w-9 hidden sm:inline-flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-white/5 btn-hover"
            >
              <Search size={18} />
            </button>
            <button
              aria-label="Notifications"
              className="h-9 w-9 hidden sm:inline-flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-white/5 btn-hover relative"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-400" />
            </button>
            <Button className="h-9 sm:h-10 px-4 sm:px-5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold">
              My Account
            </Button>
            <button
              aria-label="Menu"
              onClick={() => setMobileOpen((s) => !s)}
              className="md:hidden h-9 w-9 inline-flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-white/5"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Search dropdown (desktop) */}
        {searchOpen && (
          <div className="hidden sm:block pb-3">
            <form onSubmit={submit} className="flex items-center gap-2 max-w-xl ml-auto">
              <div className="relative w-full">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search Gmail, Telegram, WhatsApp..."
                  className="pl-9 bg-white/5 border-white/10 text-slate-100 placeholder:text-slate-500 focus-visible:ring-emerald-500"
                />
              </div>
              <Button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold">Search</Button>
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <form onSubmit={submit} className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search services..."
                className="pl-9 bg-white/5 border-white/10 text-slate-100 placeholder:text-slate-500"
              />
            </form>
            <div className="grid divide-y divide-white/5 rounded-lg border border-white/5 bg-white/[0.02]">
              {NAV.map((n) => (
                <Link key={n.label} to={n.to} className="flex items-center justify-between px-4 py-3 text-slate-200 hover:bg-white/5">
                  <span>{n.label}</span>
                  <ChevronRight size={16} className="text-slate-500" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
