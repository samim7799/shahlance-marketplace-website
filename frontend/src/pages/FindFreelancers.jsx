import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HowItWorks3Step from '../components/HowItWorks3Step';
import { Button } from '../components/ui/button';
import {
  Search, Star, MapPin, Briefcase, Clock, Filter, X, ChevronRight, Sparkles,
  MessageCircle, Zap, ShieldCheck, ArrowRight,
} from 'lucide-react';
import { FREELANCERS, FREELANCER_SKILL_TAGS } from '../mock/freelancers';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';

const SORTS = [
  { id: 'top', label: 'Top rated' },
  { id: 'jobs', label: 'Most jobs completed' },
  { id: 'rate-asc', label: 'Rate: Low to High' },
  { id: 'rate-desc', label: 'Rate: High to Low' },
];

export default function FindFreelancers() {
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState(sp.get('q') || '');
  const [skill, setSkill] = useState('All');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState('top');
  const [maxRate, setMaxRate] = useState(200);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = FREELANCERS.filter((f) => {
      if (term) {
        const hay = `${f.name} ${f.title} ${f.tagline} ${f.skills.join(' ')} ${f.country}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      if (skill !== 'All' && !f.skills.includes(skill)) return false;
      if (availableOnly && f.availability !== 'Available now') return false;
      if (f.hourlyRate > maxRate) return false;
      return true;
    });
    switch (sort) {
      case 'jobs': list.sort((a, b) => b.jobs - a.jobs); break;
      case 'rate-asc': list.sort((a, b) => a.hourlyRate - b.hourlyRate); break;
      case 'rate-desc': list.sort((a, b) => b.hourlyRate - a.hourlyRate); break;
      case 'top':
      default: list.sort((a, b) => (b.rating - a.rating) || (b.jobs - a.jobs));
    }
    return list;
  }, [q, skill, availableOnly, sort, maxRate]);

  const submit = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(sp);
    if (q.trim()) next.set('q', q.trim()); else next.delete('q');
    setSp(next);
  };

  return (
    <div>
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden hero-glow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10 sm:pt-20 sm:pb-14 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300">
            <Sparkles size={13} /> Verified Freelancer Marketplace
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Find the perfect <span className="text-gradient-green">freelancer</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Hire vetted professionals for any project. Filter by skill, rate and availability — hire in minutes.
          </p>

          <form onSubmit={submit} className="mt-8 mx-auto max-w-2xl">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur px-2 py-2 shadow-xl shadow-black/20">
              <div className="pl-4 pr-2 text-slate-400"><Search size={18} /></div>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Try 'React developer', 'brand designer', 'SEO expert'..."
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

          {/* Skill chips */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {FREELANCER_SKILL_TAGS.map((t) => (
              <button
                key={t}
                onClick={() => setSkill(t)}
                className={`rounded-full border px-3 py-1.5 text-xs btn-hover ${
                  skill === t
                    ? 'bg-emerald-500 text-slate-900 border-emerald-500 font-semibold'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:text-white hover:border-emerald-500/40'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CONTROLS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-slate-300">
              <span className="text-white font-semibold">{filtered.length}</span> freelancers found
              {skill !== 'All' && <> in <span className="text-emerald-300">{skill}</span></>}
            </span>
            <button
              onClick={() => setAvailableOnly((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs btn-hover ${
                availableOnly
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${availableOnly ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              Available now
            </button>
          </div>
          <div className="flex items-center gap-2">
            <label className="hidden md:inline-flex items-center gap-2 text-xs text-slate-400">
              Max rate
              <input type="range" min={20} max={200} step={5} value={maxRate} onChange={(e) => setMaxRate(Number(e.target.value))} className="accent-emerald-500" />
              <span className="text-slate-200 font-medium w-14">${maxRate}/hr</span>
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 pl-3 pr-2 h-9">
              <Filter size={13} className="text-slate-400" />
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-transparent outline-none text-sm text-slate-200" style={{ colorScheme: 'dark' }}>
                {SORTS.map((s) => <option key={s.id} value={s.id} className="bg-[#0f1526]">{s.label}</option>)}
              </select>
            </label>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filtered.length === 0 ? (
          <EmptyState onReset={() => { setQ(''); setSkill('All'); setAvailableOnly(false); setMaxRate(200); }} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((f) => <FreelancerCard key={f.id} freelancer={f} />)}
          </div>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
          <p className="text-sm text-slate-300"><span className="text-white font-semibold">Can’t find the right expert?</span> Post a job and let matching freelancers apply to you.</p>
          <Link to="/post-job" className="inline-flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold px-5 py-2.5 btn-hover">
            Post a job <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <HowItWorks3Step
        eyebrow="Hiring on ShahLance"
        title={<>How hiring </>}
        titleAccent="works"
        subtitle="From posting your project to releasing payment — secure, simple, and fast."
      />

      <Footer />
    </div>
  );
}

function FreelancerCard({ freelancer: f }) {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const initials = f.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const onHire = () => {
    if (!isAuthenticated) {
      toast({ title: 'Sign in to hire', description: 'Create an account to send a hire request.' });
      navigate('/login', { state: { from: { pathname: '/find-freelancers' } } });
      return;
    }
    toast({ title: `Hire request sent to ${f.name}`, description: 'They’ll respond within a few hours.' });
  };

  const availabilityColor = f.availability === 'Available now'
    ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
    : 'text-amber-300 bg-amber-500/15 border-amber-500/30';

  return (
    <div className="card-surface card-hover rounded-2xl p-5 flex flex-col">
      <div className="flex items-start gap-4">
        <div className={`relative h-14 w-14 rounded-full bg-gradient-to-br ${f.color} flex items-center justify-center text-white font-bold text-lg shadow-lg shrink-0`}>
          {initials}
          {f.availability === 'Available now' && (
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-[#0a0f1e]" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-white font-semibold truncate">{f.name}</h3>
              <p className="text-xs text-slate-400 truncate">{f.title}</p>
            </div>
            {f.top && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 shrink-0">
                <Sparkles size={10} /> Top
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Star size={13} className="text-amber-400 fill-amber-400" />
              <span className="text-slate-200 font-semibold">{f.rating.toFixed(1)}</span>
            </span>
            <span className="inline-flex items-center gap-1"><Briefcase size={12} /> {f.jobs} jobs</span>
            <span className="inline-flex items-center gap-1 truncate"><MapPin size={12} /> {f.country}</span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-300 leading-relaxed clamp-3">{f.tagline}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {f.skills.slice(0, 4).map((s) => (
          <span key={s} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300">{s}</span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${availabilityColor}`}>
          <Clock size={11} /> {f.availability}
        </span>
        <span className="text-slate-400">Replies in {f.responseTime}</span>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between gap-2">
        <div>
          <span className="block text-[11px] uppercase tracking-wider text-slate-500">Starting from</span>
          <span className="text-lg font-bold text-white">${f.hourlyRate}<span className="text-xs text-slate-400">/hr</span></span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { toast({ title: `Message sent to ${f.name}` }); }}
            className="h-9 w-9 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center btn-hover"
            aria-label={`Message ${f.name}`}
          >
            <MessageCircle size={15} />
          </button>
          <Button onClick={onHire} className="rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold h-9 px-4 btn-hover">
            <Zap size={14} className="mr-1.5" /> Hire
          </Button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onReset }) {
  return (
    <div className="card-surface rounded-3xl p-10 sm:p-16 text-center">
      <div className="mx-auto h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
        <Search size={28} />
      </div>
      <h3 className="mt-6 text-2xl font-bold text-white">No freelancers match your filters</h3>
      <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">Try broadening your search or resetting the filters to see all available experts.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button onClick={onReset} className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold">Reset filters</Button>
        <Link to="/post-job" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold px-5 py-2.5 btn-hover">
          Post a job <ChevronRight size={15} />
        </Link>
      </div>
      <p className="mt-8 text-xs text-slate-500 inline-flex items-center gap-1.5 justify-center w-full">
        <ShieldCheck size={13} className="text-emerald-400" /> All freelancers are identity-verified
      </p>
    </div>
  );
}
