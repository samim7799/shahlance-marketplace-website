import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, Lock, User, AtSign, Phone, Globe2, UserPlus, Eye, EyeOff, Camera, ArrowLeft,
  Briefcase, Users, Repeat, CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AuthShell, AuthBrandingPanel, FieldWithIcon, ErrorAlert } from './Login';
import { COUNTRY_LIST } from '../mock/countries';
import { useToast } from '../hooks/use-toast';

const ACCOUNT_TYPES = [
  { id: 'freelancer', title: 'Find Work', desc: 'I want to offer services and earn.', Icon: Briefcase, color: 'from-emerald-500 to-green-500' },
  { id: 'client', title: 'Hire People', desc: 'I want to hire experts for my projects.', Icon: Users, color: 'from-blue-500 to-indigo-500' },
  { id: 'both', title: 'Both', desc: 'I want to hire and work on projects.', Icon: Repeat, color: 'from-violet-500 to-fuchsia-500' },
];

function passwordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0..4
}

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    fullName: '', username: '', email: '', phone: '', country: '',
    password: '', confirmPassword: '', accountType: 'freelancer',
    profilePhoto: '', agree: false,
  });
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const strength = useMemo(() => passwordStrength(form.password), [form.password]);

  const onPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError('Profile photo must be under 2MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => set('profilePhoto', reader.result);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    if (!form.fullName.trim() || form.fullName.trim().length < 2) return 'Please enter your full name.';
    if (!/^[a-z0-9_]{3,20}$/i.test(form.username.trim())) return 'Username must be 3-20 chars (letters, numbers, underscore).';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Please enter a valid email address.';
    if (form.phone && !/^[+()\-\d\s]{6,20}$/.test(form.phone.trim())) return 'Please enter a valid phone number.';
    if (!form.country) return 'Please select your country.';
    if (form.password.length < 8) return 'Password must be at least 8 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    if (!form.agree) return 'You must agree to the Terms & Conditions.';
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const v = validate();
    if (v) { setError(v); return; }
    setSubmitting(true);
    try {
      const u = await signUp(form);
      toast({ title: 'Account created', description: `Welcome to ShahLance, ${u.fullName}!` });
      // route based on account type
      const role = u.accountType === 'client' ? 'buyer' : 'worker';
      navigate(`/dashboard/${role}`);
    } catch (err) {
      setError(err.message || 'Signup failed.');
    } finally { setSubmitting(false); }
  };

  return (
    <AuthShell right={<AuthBrandingPanel title="Join a marketplace built on trust." subtitle="Create your profile in under a minute. Choose to work, hire, or do both — all with escrow-protected payments." />}>
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 btn-hover">
          <ArrowLeft size={14} /> Back to home
        </Link>
        <h1 className="mt-4 text-3xl font-extrabold text-white tracking-tight">Create your account</h1>
        <p className="mt-1.5 text-sm text-slate-400">
          Already have one?{' '}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold btn-hover">Sign in</Link>
        </p>

        {error && <ErrorAlert message={error} />}

        <form onSubmit={submit} className="mt-6 space-y-4">
          {/* Account type */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">I want to</label>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {ACCOUNT_TYPES.map((t) => {
                const active = form.accountType === t.id;
                const Icon = t.Icon;
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => set('accountType', t.id)}
                    className={`text-left rounded-xl border p-3 btn-hover ${
                      active
                        ? 'border-emerald-500/60 bg-emerald-500/10'
                        : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-8 w-8 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center`}>
                        <Icon size={15} className="text-white" />
                      </span>
                      <span className="text-sm font-semibold text-white">{t.title}</span>
                      {active && <CheckCircle2 size={14} className="ml-auto text-emerald-400" />}
                    </div>
                    <p className="mt-1.5 text-[11px] text-slate-400 leading-snug">{t.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Profile photo */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative h-16 w-16 rounded-full border border-white/10 bg-white/5 overflow-hidden flex items-center justify-center btn-hover"
              aria-label="Upload profile photo"
            >
              {form.profilePhoto ? (
                <img src={form.profilePhoto} alt="profile" className="h-full w-full object-cover" />
              ) : (
                <Camera size={20} className="text-slate-400" />
              )}
            </button>
            <div>
              <p className="text-sm font-semibold text-white">Profile photo</p>
              <p className="text-xs text-slate-400">Optional — max 2MB, JPG or PNG</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhoto} />
              {form.profilePhoto && (
                <button type="button" onClick={() => set('profilePhoto', '')} className="text-[11px] mt-1 text-rose-300 hover:text-rose-200">Remove</button>
              )}
            </div>
          </div>

          {/* Names */}
          <div className="grid gap-3 sm:grid-cols-2">
            <FieldWithIcon Icon={User}>
              <input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Full name" className="w-full bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-500" />
            </FieldWithIcon>
            <FieldWithIcon Icon={AtSign}>
              <input value={form.username} onChange={(e) => set('username', e.target.value.replace(/\s/g, ''))} placeholder="Username" className="w-full bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-500" autoComplete="username" />
            </FieldWithIcon>
          </div>

          {/* Contact */}
          <div className="grid gap-3 sm:grid-cols-2">
            <FieldWithIcon Icon={Mail}>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="Email address" className="w-full bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-500" autoComplete="email" />
            </FieldWithIcon>
            <FieldWithIcon Icon={Phone}>
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="Phone (optional)" className="w-full bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-500" autoComplete="tel" />
            </FieldWithIcon>
          </div>

          {/* Country */}
          <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 focus-within:border-emerald-500/60 px-3 h-11 btn-hover">
            <Globe2 size={16} className="text-slate-400 shrink-0" />
            <select
              value={form.country}
              onChange={(e) => set('country', e.target.value)}
              className="w-full bg-transparent outline-none text-sm text-slate-100"
              style={{ colorScheme: 'dark' }}
            >
              <option value="" className="bg-[#0f1526]">Select country</option>
              {COUNTRY_LIST.map((c) => <option key={c} value={c} className="bg-[#0f1526]">{c}</option>)}
            </select>
          </label>

          {/* Passwords */}
          <div className="grid gap-3 sm:grid-cols-2">
            <FieldWithIcon Icon={Lock}>
              <input type={showPw ? 'text' : 'password'} value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="Password" className="w-full bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-500" autoComplete="new-password" />
              <button type="button" onClick={() => setShowPw((v) => !v)} className="text-slate-400 hover:text-white" aria-label="Toggle password">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </FieldWithIcon>
            <FieldWithIcon Icon={Lock}>
              <input type={showPw2 ? 'text' : 'password'} value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} placeholder="Confirm password" className="w-full bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-500" autoComplete="new-password" />
              <button type="button" onClick={() => setShowPw2((v) => !v)} className="text-slate-400 hover:text-white" aria-label="Toggle confirm">
                {showPw2 ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </FieldWithIcon>
          </div>
          <StrengthMeter score={strength} pw={form.password} />

          {/* Terms */}
          <label className="flex items-start gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.agree}
              onChange={(e) => set('agree', e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500"
            />
            <span className="text-sm text-slate-300">
              I agree to the <a href="#" className="text-emerald-400 hover:text-emerald-300 font-semibold">Terms & Conditions</a> and{' '}
              <a href="#" className="text-emerald-400 hover:text-emerald-300 font-semibold">Privacy Policy</a>.
            </span>
          </label>

          <button
            disabled={submitting}
            className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 font-semibold btn-hover inline-flex items-center justify-center gap-2"
          >
            {submitting ? <span className="h-4 w-4 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" /> : <><UserPlus size={16} /> Create account</>}
          </button>
        </form>
      </div>
    </AuthShell>
  );
}

function StrengthMeter({ score, pw }) {
  if (!pw) return null;
  const colors = ['bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-400'];
  const labels = ['Very weak', 'Weak', 'Fair', 'Strong', 'Excellent'];
  const pct = (score / 4) * 100;
  return (
    <div className="space-y-1.5">
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full ${colors[score]}`} style={{ width: `${pct}%`, transition: 'width 300ms ease' }} />
      </div>
      <p className="text-[11px] text-slate-400">Password strength: <span className="text-slate-200 font-medium">{labels[score]}</span></p>
    </div>
  );
}
