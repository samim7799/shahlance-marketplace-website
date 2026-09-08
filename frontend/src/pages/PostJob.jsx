import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HowItWorks3Step from '../components/HowItWorks3Step';
import { Button } from '../components/ui/button';
import {
  Briefcase, Tag, Wallet, FileText, Clock, MapPin, ShieldCheck, ArrowRight,
  CheckCircle2, AlertCircle, Send, Sparkles,
} from 'lucide-react';
import { JOB_CATEGORIES, BUDGET_RANGES } from '../mock/freelancers';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';

const DURATIONS = ['Less than a week', '1 - 2 weeks', '2 - 4 weeks', '1 - 3 months', '3+ months'];
const EXPERIENCE = ['Entry', 'Intermediate', 'Expert'];

export default function PostJob() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    category: '',
    budgetRange: '',
    budgetAmount: '',
    duration: '',
    experience: 'Intermediate',
    location: 'Remote',
    description: '',
    skills: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [error, setError] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const wordCount = useMemo(() => form.description.trim().split(/\s+/).filter(Boolean).length, [form.description]);

  const validate = () => {
    if (form.title.trim().length < 6) return 'Give your job a clear title (at least 6 characters).';
    if (!form.category) return 'Please choose a category.';
    if (!form.budgetRange) return 'Please select a budget range.';
    if (form.description.trim().length < 40) return 'Please describe the project in more detail (at least 40 characters).';
    return null;
  };

  const submit = (e) => {
    e.preventDefault();
    setError('');
    const v = validate();
    if (v) { setError(v); return; }
    setSubmitting(true);
    setTimeout(() => {
      const jobId = `job_${Math.random().toString(36).slice(2, 8)}`;
      // Save to local storage so it feels real; ready to be swapped for a real API.
      try {
        const jobs = JSON.parse(localStorage.getItem('shahlance_jobs') || '[]');
        jobs.unshift({
          id: jobId,
          ...form,
          skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
          postedBy: user?.username || 'guest',
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem('shahlance_jobs', JSON.stringify(jobs));
      } catch {}
      setSubmitted({ id: jobId, title: form.title });
      setSubmitting(false);
      toast({ title: 'Job posted', description: 'Freelancers will start applying shortly.' });
    }, 800);
  };

  if (submitted) {
    return (
      <div>
        <Header />
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 size={30} />
          </div>
          <h1 className="mt-6 text-3xl sm:text-4xl font-extrabold text-white">Your job is <span className="text-gradient-green">live</span></h1>
          <p className="mt-3 text-slate-400">“<span className="text-slate-200 font-semibold">{submitted.title}</span>” is now visible to matching freelancers.</p>
          <p className="mt-2 text-xs text-slate-500">Job ID: {submitted.id}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/find-freelancers" className="inline-flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold px-5 py-2.5 btn-hover">
              Browse freelancers <ArrowRight size={15} />
            </Link>
            <Link to="/dashboard/buyer" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold px-5 py-2.5 btn-hover">
              Go to dashboard
            </Link>
            <button onClick={() => { setSubmitted(null); setForm({ ...form, title: '', description: '', skills: '' }); }} className="text-sm text-slate-400 hover:text-white btn-hover">
              Post another job
            </button>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden hero-glow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8 sm:pt-20 sm:pb-12 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300">
            <Sparkles size={13} /> Post a job
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Hire the right <span className="text-gradient-green">expert</span> in minutes
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Describe your project once. Matching freelancers will start applying within hours.
          </p>
        </div>
      </section>

      {/* Form + sidebar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <form onSubmit={submit} className="card-surface rounded-2xl p-5 sm:p-8 space-y-6">
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                <AlertCircle size={16} className="text-rose-400 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Field label="Job title" hint="Be specific — e.g. 'Design a mobile app onboarding flow'">
              <div className="input-wrap">
                <Briefcase size={15} className="text-slate-400" />
                <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Build a Shopify theme for our brand" className="input-plain" />
              </div>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category">
                <div className="input-wrap">
                  <Tag size={15} className="text-slate-400" />
                  <select value={form.category} onChange={(e) => set('category', e.target.value)} className="input-plain" style={{ colorScheme: 'dark' }}>
                    <option value="" className="bg-[#0f1526]">Select category</option>
                    {JOB_CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#0f1526]">{c}</option>)}
                  </select>
                </div>
              </Field>
              <Field label="Experience level">
                <div className="grid grid-cols-3 gap-2">
                  {EXPERIENCE.map((x) => {
                    const active = form.experience === x;
                    return (
                      <button key={x} type="button" onClick={() => set('experience', x)} className={`h-11 rounded-xl border text-sm btn-hover ${active ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300' : 'bg-white/[0.03] border-white/10 text-slate-300 hover:border-white/20'}`}>{x}</button>
                    );
                  })}
                </div>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Budget range">
                <div className="input-wrap">
                  <Wallet size={15} className="text-slate-400" />
                  <select value={form.budgetRange} onChange={(e) => set('budgetRange', e.target.value)} className="input-plain" style={{ colorScheme: 'dark' }}>
                    <option value="" className="bg-[#0f1526]">Select a range</option>
                    {BUDGET_RANGES.map((b) => <option key={b.id} value={b.id} className="bg-[#0f1526]">{b.label}</option>)}
                  </select>
                </div>
              </Field>
              <Field label="Or specific amount (USD)" hint="Optional — gives freelancers a clearer picture">
                <div className="input-wrap">
                  <span className="text-slate-400">$</span>
                  <input inputMode="decimal" value={form.budgetAmount} onChange={(e) => set('budgetAmount', e.target.value.replace(/[^0-9.]/g, ''))} placeholder="e.g. 1200" className="input-plain" />
                </div>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Estimated duration">
                <div className="input-wrap">
                  <Clock size={15} className="text-slate-400" />
                  <select value={form.duration} onChange={(e) => set('duration', e.target.value)} className="input-plain" style={{ colorScheme: 'dark' }}>
                    <option value="" className="bg-[#0f1526]">Select duration</option>
                    {DURATIONS.map((d) => <option key={d} value={d} className="bg-[#0f1526]">{d}</option>)}
                  </select>
                </div>
              </Field>
              <Field label="Location">
                <div className="input-wrap">
                  <MapPin size={15} className="text-slate-400" />
                  <input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Remote or city" className="input-plain" />
                </div>
              </Field>
            </div>

            <Field label="Skills required" hint="Comma-separated list, e.g. 'Figma, Illustrator, Branding'">
              <div className="input-wrap">
                <Sparkles size={15} className="text-slate-400" />
                <input value={form.skills} onChange={(e) => set('skills', e.target.value)} placeholder="React, Tailwind, Framer Motion" className="input-plain" />
              </div>
            </Field>

            <Field label="Project description" hint={`${wordCount} words · include goals, deliverables, timeline`}>
              <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 focus-within:border-emerald-500/60 px-3 py-3 btn-hover">
                <FileText size={15} className="text-slate-400 mt-0.5" />
                <textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  rows={7}
                  placeholder="Describe your project, goals, and what a great outcome looks like..."
                  className="w-full bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-500 resize-y min-h-[140px]"
                />
              </div>
            </Field>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <p className="text-xs text-slate-400 inline-flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-400" /> Escrow-protected payments · 100% money-back guarantee
              </p>
              <Button disabled={submitting} className="rounded-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-900 font-semibold px-6 h-11">
                {submitting ? <span className="h-4 w-4 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" /> : <><Send size={15} className="mr-2" /> Post job</>}
              </Button>
            </div>
          </form>

          {/* Sidebar tips */}
          <aside className="space-y-4">
            <div className="card-surface rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white">Tips for a great post</h3>
              <ul className="mt-3 space-y-2.5 text-sm text-slate-300">
                <Tip>Be specific about goals and deliverables.</Tip>
                <Tip>Share examples of work you love.</Tip>
                <Tip>Set a realistic budget and timeline.</Tip>
                <Tip>Reply quickly to keep momentum.</Tip>
              </ul>
            </div>
            <div className="card-surface rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white">Why ShahLance</h3>
              <ul className="mt-3 space-y-2.5 text-sm text-slate-300">
                <Tip>Verified, top-rated professionals</Tip>
                <Tip>Escrow keeps your money safe</Tip>
                <Tip>Real 24/7 human support</Tip>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <HowItWorks3Step
        eyebrow="How it works"
        title={<>Post project, hire, and </>}
        titleAccent="pay securely"
        subtitle="A streamlined workflow so you can focus on outcomes, not logistics."
      />

      <style>{`
        .input-wrap {
          display: flex; align-items: center; gap: 8px;
          height: 44px; padding: 0 12px;
          border-radius: 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.10);
          transition: border-color 200ms ease, background-color 200ms ease;
        }
        .input-wrap:focus-within { border-color: rgba(16,185,129,0.6); background: rgba(255,255,255,0.06); }
        .input-plain { width: 100%; background: transparent; outline: none; font-size: 14px; color: rgb(226 232 240); }
        .input-plain::placeholder { color: rgb(100 116 139); }
      `}</style>

      <Footer />
    </div>
  );
}

function Field({ label, hint, children }) {
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

function Tip({ children }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle2 size={15} className="text-emerald-400 mt-0.5 shrink-0" /> <span>{children}</span>
    </li>
  );
}
