import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Camera, Save, LogOut, LayoutDashboard, Check, Plus, X,
  Briefcase, Users, Repeat, Star, Building2, Mail, Phone, Globe2, AtSign, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { computeProfileCompletion } from '../services/authService';
import { COUNTRY_LIST } from '../mock/countries';
import { useToast } from '../hooks/use-toast';
import { Avatar } from '../components/AuthAccessWidget';

const TYPE_META = {
  freelancer: { label: 'Freelancer', Icon: Briefcase, color: 'from-emerald-500 to-green-500' },
  client: { label: 'Client', Icon: Users, color: 'from-blue-500 to-indigo-500' },
  both: { label: 'Freelancer + Client', Icon: Repeat, color: 'from-violet-500 to-fuchsia-500' },
};

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [form, setForm] = useState(() => hydrate(user));
  const [saving, setSaving] = useState(false);
  const [skillDraft, setSkillDraft] = useState('');
  const [serviceDraft, setServiceDraft] = useState('');

  useEffect(() => { setForm(hydrate(user)); }, [user]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setCompany = (k, v) => setForm((f) => ({ ...f, company: { ...f.company, [k]: v } }));

  const showFreelancer = form.accountType === 'freelancer' || form.accountType === 'both';
  const showClient = form.accountType === 'client' || form.accountType === 'both';

  const onPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'Image too large', description: 'Please upload an image under 2MB.' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => set('profilePhoto', reader.result);
    reader.readAsDataURL(file);
  };

  const addSkill = () => {
    const v = skillDraft.trim();
    if (!v || form.skills.includes(v)) { setSkillDraft(''); return; }
    set('skills', [...form.skills, v]);
    setSkillDraft('');
  };
  const removeSkill = (s) => set('skills', form.skills.filter((x) => x !== s));

  const addService = () => {
    const v = serviceDraft.trim();
    if (!v || form.services.includes(v)) { setServiceDraft(''); return; }
    set('services', [...form.services, v]);
    setServiceDraft('');
  };
  const removeService = (s) => set('services', form.services.filter((x) => x !== s));

  const save = async () => {
    setSaving(true);
    try {
      await updateProfile({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        country: form.country,
        profilePhoto: form.profilePhoto,
        skills: form.skills,
        services: form.services,
        company: form.company,
        accountType: form.accountType,
      });
      toast({ title: 'Profile saved', description: 'Your changes are live.' });
    } catch (err) {
      toast({ title: 'Save failed', description: err.message || 'Please try again.' });
    } finally { setSaving(false); }
  };

  const completion = computeProfileCompletion({ ...user, ...form });
  const meta = TYPE_META[form.accountType] || TYPE_META.freelancer;
  const HeaderIcon = meta.Icon;
  const dashboardRole = form.accountType === 'client' ? 'buyer' : 'worker';

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-100">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0f1e]/95 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center font-bold text-slate-900 shadow-lg shadow-emerald-500/20">S</span>
            <span className="text-lg font-bold tracking-tight text-white">ShahLance</span>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(`/dashboard/${dashboardRole}`)} className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-slate-200 btn-hover">
              <LayoutDashboard size={13} /> Dashboard
            </button>
            <button onClick={async () => { await logout(); navigate('/'); }} className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-3.5 py-1.5 text-xs font-semibold text-rose-200 btn-hover">
              <LogOut size={13} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 btn-hover">
          <ArrowLeft size={14} /> Back to home
        </Link>

        <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-white">My Profile</h1>
        <p className="text-sm text-slate-400 mt-1">Complete your profile to unlock the full ShahLance experience.</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Left: identity card */}
          <div className="space-y-5">
            <div className="card-surface rounded-2xl p-6 text-center">
              <div className="relative mx-auto w-24 h-24">
                <div className="h-24 w-24 rounded-full overflow-hidden border border-white/10 bg-white/5">
                  {form.profilePhoto ? (
                    <img src={form.profilePhoto} alt={form.fullName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center"><Avatar user={form} size={96} /></div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 flex items-center justify-center shadow-lg btn-hover"
                  aria-label="Change photo"
                >
                  <Camera size={15} />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhoto} />
              </div>
              <h2 className="mt-4 text-lg font-bold text-white">{form.fullName || 'Your name'}</h2>
              <p className="text-xs text-slate-400">@{form.username}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-slate-200">
                <span className={`h-5 w-5 rounded-md bg-gradient-to-br ${meta.color} flex items-center justify-center`}>
                  <HeaderIcon size={11} className="text-white" />
                </span>
                {meta.label}
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Profile completion</span>
                  <span className="text-emerald-300 font-semibold">{completion}%</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400" style={{ width: `${completion}%`, transition: 'width 400ms ease' }} />
                </div>
                {completion < 100 && (
                  <p className="mt-2 text-[11px] text-slate-500">Add missing details below to reach 100%.</p>
                )}
              </div>
            </div>

            <div className="card-surface rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-white">Verification</h3>
              <VerifyRow Icon={Mail} label="Email" ok done={!!form.email}>{form.email || '—'}</VerifyRow>
              <VerifyRow Icon={Phone} label="Phone" done={!!form.phone}>{form.phone || 'Add phone'}</VerifyRow>
              <VerifyRow Icon={ShieldCheck} label="Identity" done={false}>Not verified</VerifyRow>
            </div>
          </div>

          {/* Right: forms */}
          <div className="space-y-6">
            {/* Basic */}
            <Section title="Basic information">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Full name">
                  <input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} className="input-dark" />
                </Field>
                <Field label="Username" hint="Cannot be changed">
                  <div className="input-dark flex items-center gap-2 opacity-70">
                    <AtSign size={14} className="text-slate-400" />
                    <span className="text-sm text-slate-200">{form.username}</span>
                  </div>
                </Field>
                <Field label="Email" hint="Cannot be changed">
                  <div className="input-dark flex items-center gap-2 opacity-70">
                    <Mail size={14} className="text-slate-400" />
                    <span className="text-sm text-slate-200">{form.email}</span>
                  </div>
                </Field>
                <Field label="Phone">
                  <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+1 555 0100" className="input-dark" />
                </Field>
                <Field label="Country">
                  <select value={form.country} onChange={(e) => set('country', e.target.value)} className="input-dark" style={{ colorScheme: 'dark' }}>
                    <option value="" className="bg-[#0f1526]">Select country</option>
                    {COUNTRY_LIST.map((c) => <option key={c} value={c} className="bg-[#0f1526]">{c}</option>)}
                  </select>
                </Field>
                <Field label="Account type">
                  <select value={form.accountType} onChange={(e) => set('accountType', e.target.value)} className="input-dark" style={{ colorScheme: 'dark' }}>
                    <option value="freelancer" className="bg-[#0f1526]">Freelancer (Find Work)</option>
                    <option value="client" className="bg-[#0f1526]">Client (Hire People)</option>
                    <option value="both" className="bg-[#0f1526]">Both</option>
                  </select>
                </Field>
              </div>
            </Section>

            {/* Freelancer */}
            {showFreelancer && (
              <Section title="Freelancer profile" icon={<Star size={14} className="text-amber-400" />}>
                <TagInput
                  label="Skills"
                  hint="Press Enter to add. Add at least 3 for better matching."
                  value={skillDraft}
                  onChange={setSkillDraft}
                  onSubmit={addSkill}
                  tags={form.skills}
                  onRemove={removeSkill}
                  placeholder="e.g. React, Figma, Copywriting"
                />
                <TagInput
                  label="Services offered"
                  hint="What services do you provide?"
                  value={serviceDraft}
                  onChange={setServiceDraft}
                  onSubmit={addService}
                  tags={form.services}
                  onRemove={removeService}
                  placeholder="e.g. Logo Design, WordPress Setup"
                />
              </Section>
            )}

            {/* Client */}
            {showClient && (
              <Section title="Company information" icon={<Building2 size={14} className="text-blue-400" />}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Company name">
                    <input value={form.company.name} onChange={(e) => setCompany('name', e.target.value)} className="input-dark" placeholder="Acme Inc." />
                  </Field>
                  <Field label="Industry">
                    <input value={form.company.industry} onChange={(e) => setCompany('industry', e.target.value)} className="input-dark" placeholder="SaaS, E-commerce..." />
                  </Field>
                  <Field label="Website">
                    <div className="input-dark flex items-center gap-2">
                      <Globe2 size={14} className="text-slate-400" />
                      <input value={form.company.website} onChange={(e) => setCompany('website', e.target.value)} className="w-full bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-500" placeholder="https://acme.com" />
                    </div>
                  </Field>
                </div>
              </Section>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3">
              <button onClick={() => navigate(`/dashboard/${dashboardRole}`)} className="rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 font-semibold px-5 py-2.5 text-sm btn-hover inline-flex items-center gap-2">
                <LayoutDashboard size={15} /> Go to dashboard
              </button>
              <button onClick={save} disabled={saving} className="rounded-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-900 font-semibold px-5 py-2.5 text-sm btn-hover inline-flex items-center gap-2">
                {saving ? <span className="h-4 w-4 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" /> : <><Save size={15} /> Save changes</>}
              </button>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .input-dark {
          width: 100%;
          height: 42px;
          border-radius: 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.10);
          color: rgb(226 232 240);
          font-size: 14px;
          padding: 0 12px;
          outline: none;
        }
        .input-dark:focus-within, .input-dark:focus { border-color: rgba(16, 185, 129, 0.6); background: rgba(255,255,255,0.06); }
      `}</style>
    </div>
  );
}

function hydrate(u) {
  return {
    fullName: u?.fullName || '',
    username: u?.username || '',
    email: u?.email || '',
    phone: u?.phone || '',
    country: u?.country || '',
    accountType: u?.accountType || 'freelancer',
    profilePhoto: u?.profilePhoto || '',
    skills: u?.skills || [],
    services: u?.services || [],
    company: {
      name: u?.company?.name || '',
      website: u?.company?.website || '',
      industry: u?.company?.industry || '',
    },
  };
}

function Section({ title, icon, children }) {
  return (
    <div className="card-surface rounded-2xl p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-base font-semibold text-white">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-400">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="mt-1 block text-[11px] text-slate-500">{hint}</span>}
    </label>
  );
}

function VerifyRow({ Icon, label, done, children }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${done ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-slate-400 border border-white/10'}`}>
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm text-slate-200 truncate">{children}</p>
      </div>
      {done && <Check size={14} className="text-emerald-400" />}
    </div>
  );
}

function TagInput({ label, hint, value, onChange, onSubmit, tags, onRemove, placeholder }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400">{label}</span>
        {hint && <span className="text-[11px] text-slate-500">{hint}</span>}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onSubmit(); } }}
          placeholder={placeholder}
          className="input-dark"
        />
        <button type="button" onClick={onSubmit} className="h-[42px] px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 btn-hover flex items-center gap-1 text-sm font-semibold">
          <Plus size={14} /> Add
        </button>
      </div>
      {tags?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 pl-3 pr-1 py-1 text-xs text-slate-200">
              {t}
              <button onClick={() => onRemove(t)} className="h-5 w-5 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white" aria-label={`Remove ${t}`}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
