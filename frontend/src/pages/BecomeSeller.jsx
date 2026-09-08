import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import * as Icons from 'lucide-react';
import {
  User, Mail, Phone, MapPin, MessageSquare, Send, ArrowLeft, AlertCircle,
  CheckCircle2, Clock, ShieldCheck, Sparkles, ArrowRight, BookOpen,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { sellerService, SELLER_TYPES, SELLER_CATEGORIES } from '../services/sellerService';
import { COUNTRY_LIST } from '../mock/countries';
import { useToast } from '../hooks/use-toast';

const EXPERIENCE = ['0-1 years', '1-3 years', '3-5 years', '5+ years'];

export default function BecomeSeller() {
  const { user, isAuthenticated } = useAuth();
  const { push } = useNotifications();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [chosenType, setChosenType] = useState('');
  const [form, setForm] = useState({
    fullName: '',
    country: '',
    email: '',
    phone: '',
    telegram: '',
    whatsapp: '',
    profile: '',
    category: '',
    customCategory: '',
    experience: '1-3 years',
    description: '',
    portfolio: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [existing, setExisting] = useState([]);

  useEffect(() => {
    if (!user) return;
    (async () => setExisting(await sellerService.listUserApplications(user.id)))();
    setForm((f) => ({
      ...f,
      fullName: user.fullName || '',
      country: user.country || '',
      email: user.email || '',
      phone: user.phone || '',
    }));
  }, [user]);

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const pickType = (id) => {
    setChosenType(id);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validate = () => {
    if (!chosenType) return 'Please choose a seller type.';
    if (form.fullName.trim().length < 2) return 'Please enter your full name.';
    if (!form.country) return 'Please select your country.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Please enter a valid email.';
    if (form.phone && !/^[+()\-\d\s]{6,20}$/.test(form.phone.trim())) return 'Please enter a valid phone.';
    if (!form.category && !form.customCategory) return 'Choose a service category or add a custom one.';
    if (form.description.trim().length < 30) return 'Please describe your service in more detail (min 30 chars).';
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isAuthenticated) {
      toast({ title: 'Sign in to apply', description: 'Create an account to submit your seller application.' });
      navigate('/login', { state: { from: { pathname: '/become-seller' } } });
      return;
    }
    const v = validate();
    if (v) { setError(v); return; }
    setSubmitting(true);
    try {
      const category = form.customCategory ? form.customCategory : form.category;
      const app = await sellerService.submitApplication(user.id, {
        sellerType: chosenType,
        fullName: form.fullName,
        country: form.country,
        email: form.email,
        phone: form.phone,
        telegram: form.telegram,
        whatsapp: form.whatsapp,
        profile: form.profile,
        category,
        isCustomCategory: !!form.customCategory,
        experience: form.experience,
        description: form.description,
        portfolio: form.portfolio,
      });
      push({
        title: 'Seller application submitted',
        message: `We’ll review your ${chosenType.replace(/-/g, ' ')} application and get back to you within 24 hours.`,
        kind: 'success',
        category: 'seller',
        link: '/my-account',
      });
      toast({ title: 'Application submitted', description: `ID: ${app.id}` });
      setStep(3);
      setExisting(await sellerService.listUserApplications(user.id));
    } catch (err) {
      setError(err.message || 'Submission failed.');
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <Header />

      <section className="relative overflow-hidden hero-glow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8 sm:pt-20 sm:pb-12 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300">
            <Sparkles size={13} /> Become a Seller
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Start selling on <span className="text-gradient-green">ShahLance</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Apply once, get approved, and start listing your services or products to millions of buyers.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 btn-hover">
          <ArrowLeft size={14} /> Back to home
        </Link>

        <Stepper step={step} />

        {step === 1 && (
          <div>
            <h2 className="mt-6 text-xl font-bold text-white">Choose a seller type</h2>
            <p className="text-sm text-slate-400 mt-1">Pick the model that best fits what you’ll sell.</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {SELLER_TYPES.map((t) => {
                const Icon = Icons[t.icon] || Icons.Store;
                return (
                  <button
                    key={t.id}
                    onClick={() => pickType(t.id)}
                    className="text-left card-surface card-hover rounded-2xl p-5 group"
                  >
                    <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="mt-3 text-white font-semibold">{t.title}</h3>
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed">{t.desc}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm text-emerald-400 font-medium">
                      Apply <ArrowRight size={14} />
                    </span>
                  </button>
                );
              })}
            </div>

            {existing.length > 0 && (
              <div className="mt-8 card-surface rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-white">Your existing applications</h3>
                <ul className="mt-3 divide-y divide-white/5">
                  {existing.map((a) => (
                    <li key={a.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white">{a.sellerType.replace(/-/g, ' ')}</p>
                        <p className="text-[11px] text-slate-500">{new Date(a.createdAt).toLocaleString()}</p>
                      </div>
                      <StatusChip status={a.status} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <form onSubmit={submit} className="mt-6 card-surface rounded-2xl p-5 sm:p-8 space-y-5">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setStep(1)} className="text-xs text-slate-400 hover:text-emerald-300 inline-flex items-center gap-1 btn-hover">
                <ArrowLeft size={12} /> Change type
              </button>
              <span className="text-xs text-slate-300">Applying as: <span className="text-emerald-300 font-semibold">{SELLER_TYPES.find((t) => t.id === chosenType)?.title}</span></span>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                <AlertCircle size={16} className="text-rose-400 mt-0.5 shrink-0" /><span>{error}</span>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <F label="Full name"><IW Icon={User}><input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} className="ip" /></IW></F>
              <F label="Country">
                <label className="iw">
                  <MapPin size={15} className="text-slate-400" />
                  <select value={form.country} onChange={(e) => set('country', e.target.value)} className="ip" style={{ colorScheme: 'dark' }}>
                    <option value="" className="bg-[#0f1526]">Select country</option>
                    {COUNTRY_LIST.map((c) => <option key={c} value={c} className="bg-[#0f1526]">{c}</option>)}
                  </select>
                </label>
              </F>
              <F label="Email / Gmail"><IW Icon={Mail}><input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="ip" /></IW></F>
              <F label="Phone number"><IW Icon={Phone}><input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+1 555 0100" className="ip" /></IW></F>
              <F label="Telegram" hint="@username or full URL"><IW Icon={Send}><input value={form.telegram} onChange={(e) => set('telegram', e.target.value)} placeholder="@yourhandle" className="ip" /></IW></F>
              <F label="WhatsApp" hint="With country code"><IW Icon={MessageSquare}><input value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} placeholder="+1 555 0100" className="ip" /></IW></F>
            </div>

            <F label="Short profile / bio">
              <div className="iw-textarea">
                <BookOpen size={15} className="text-slate-400 mt-0.5" />
                <textarea value={form.profile} onChange={(e) => set('profile', e.target.value)} rows={3} placeholder="Tell buyers a bit about you..." className="ip resize-y min-h-[80px]" />
              </div>
            </F>

            <div className="grid gap-4 sm:grid-cols-2">
              <F label="Service category">
                <label className="iw">
                  <Sparkles size={15} className="text-slate-400" />
                  <select value={form.category} onChange={(e) => { set('category', e.target.value); set('customCategory', ''); }} className="ip" style={{ colorScheme: 'dark' }}>
                    <option value="" className="bg-[#0f1526]">Select a category</option>
                    {SELLER_CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#0f1526]">{c}</option>)}
                  </select>
                </label>
              </F>
              <F label="Or add a custom category" hint="Only used if none above fit">
                <IW Icon={Sparkles}><input value={form.customCategory} onChange={(e) => { set('customCategory', e.target.value); if (e.target.value) set('category', ''); }} placeholder="e.g. AI Prompt Engineering" className="ip" /></IW>
              </F>
              <F label="Experience">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {EXPERIENCE.map((x) => {
                    const active = form.experience === x;
                    return (
                      <button key={x} type="button" onClick={() => set('experience', x)} className={`h-10 rounded-lg text-xs font-medium btn-hover border ${active ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300' : 'bg-white/[0.03] border-white/10 text-slate-300 hover:border-white/20'}`}>{x}</button>
                    );
                  })}
                </div>
              </F>
              <F label="Portfolio link" hint="Optional — website, Behance, GitHub">
                <IW Icon={Icons.Link2}><input value={form.portfolio} onChange={(e) => set('portfolio', e.target.value)} placeholder="https://" className="ip" /></IW>
              </F>
            </div>

            <F label="Description of what you’ll sell">
              <div className="iw-textarea">
                <MessageSquare size={15} className="text-slate-400 mt-0.5" />
                <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={6} placeholder="Explain the service, deliverables, and typical turnaround..." className="ip resize-y min-h-[120px]" />
              </div>
            </F>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <p className="text-xs text-slate-400 inline-flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-400" /> Applications are reviewed within 24 hours.
              </p>
              <Button disabled={submitting} className="rounded-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-900 font-semibold px-6 h-11">
                {submitting ? <span className="h-4 w-4 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" /> : <>Submit application</>}
              </Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="mt-6 card-surface rounded-2xl p-10 text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 size={30} />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-white">Application <span className="text-gradient-green">submitted</span></h2>
            <p className="mt-3 text-slate-400">You’ll get a notification when an admin reviews your application.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/my-account" className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold px-5 py-2.5 btn-hover">Go to My Account</Link>
              <Link to="/" className="rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold px-5 py-2.5 btn-hover">Back to home</Link>
            </div>
          </div>
        )}
      </section>

      <style>{`
        .iw { display:flex; align-items:center; gap:8px; height:44px; padding:0 12px; border-radius:12px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.10); transition:border-color 200ms ease, background-color 200ms ease; }
        .iw:focus-within { border-color: rgba(16,185,129,0.6); background: rgba(255,255,255,0.06); }
        .iw-textarea { display:flex; align-items:flex-start; gap:8px; padding:12px; border-radius:12px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.10); }
        .iw-textarea:focus-within { border-color: rgba(16,185,129,0.6); background: rgba(255,255,255,0.06); }
        .ip { width:100%; background:transparent; outline:none; font-size:14px; color:rgb(226 232 240); }
        .ip::placeholder { color:rgb(100 116 139); }
      `}</style>

      <Footer />
    </div>
  );
}

function F({ label, hint, children }) {
  return (
    <label className="block">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
        {hint && <span className="text-[11px] text-slate-500">{hint}</span>}
      </div>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function IW({ Icon, children }) {
  return <label className="iw"><Icon size={15} className="text-slate-400" />{children}</label>;
}

function Stepper({ step }) {
  const s = [
    { n: 1, label: 'Choose type' },
    { n: 2, label: 'Application' },
    { n: 3, label: 'Submitted' },
  ];
  return (
    <div className="mt-6 flex items-center gap-2">
      {s.map((it, i) => {
        const active = step === it.n;
        const done = step > it.n;
        return (
          <div key={it.n} className="flex items-center gap-2">
            <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border ${
              done ? 'bg-emerald-500 text-slate-900 border-emerald-500'
              : active ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
              : 'bg-white/5 text-slate-400 border-white/10'
            }`}>{done ? <CheckCircle2 size={13} /> : it.n}</span>
            <span className={`text-xs ${active ? 'text-white font-semibold' : 'text-slate-400'}`}>{it.label}</span>
            {i < s.length - 1 && <span className="h-px w-6 bg-white/10 mx-1" />}
          </div>
        );
      })}
    </div>
  );
}

function StatusChip({ status }) {
  const map = { pending: { c: 'text-amber-300 bg-amber-500/15 border-amber-500/30', Icon: Clock, l: 'Pending' }, approved: { c: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30', Icon: CheckCircle2, l: 'Approved' }, rejected: { c: 'text-rose-300 bg-rose-500/15 border-rose-500/30', Icon: Icons.XCircle, l: 'Rejected' } };
  const m = map[status] || map.pending; const Icon = m.Icon;
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] ${m.c}`}><Icon size={11} /> {m.l}</span>;
}
