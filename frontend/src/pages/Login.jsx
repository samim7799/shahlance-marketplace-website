import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, LogIn, AlertCircle, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim() || !password) {
      setError('Please enter your email/username and password.');
      return;
    }
    setSubmitting(true);
    try {
      const user = await login({ identifier, password, remember });
      toast({ title: 'Welcome back', description: `Signed in as ${user.fullName}.` });
      const from = location.state?.from?.pathname;
      if (from) return navigate(from, { replace: true });
      const role = user.accountType === 'client' ? 'buyer' : 'worker';
      navigate(`/dashboard/${role}`);
    } catch (err) {
      setError(err.message || 'Sign in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      right={<AuthBrandingPanel
        title="Welcome back to ShahLance"
        subtitle="Sign in to continue managing your projects, tasks, and payouts — all in one secure marketplace."
      />}
    >
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 btn-hover">
          <ArrowLeft size={14} /> Back to home
        </Link>
        <h1 className="mt-4 text-3xl font-extrabold text-white tracking-tight">Sign in</h1>
        <p className="mt-1.5 text-sm text-slate-400">
          Don’t have an account?{' '}
          <Link to="/signup" className="text-emerald-400 hover:text-emerald-300 font-semibold btn-hover">Create one</Link>
        </p>

        {error && <ErrorAlert message={error} />}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <FieldWithIcon Icon={Mail}>
            <input
              autoFocus
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Email or username"
              className="w-full bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-500"
              autoComplete="username"
            />
          </FieldWithIcon>

          <FieldWithIcon Icon={Lock}>
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-500"
              autoComplete="current-password"
            />
            <button type="button" onClick={() => setShowPw((v) => !v)} className="text-slate-400 hover:text-white" aria-label="Toggle password">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </FieldWithIcon>

          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-300">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-sm text-emerald-400 hover:text-emerald-300 btn-hover">Forgot password?</Link>
          </div>

          <button
            disabled={submitting}
            className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 font-semibold btn-hover inline-flex items-center justify-center gap-2"
          >
            {submitting ? <span className="h-4 w-4 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" /> : <><LogIn size={16} /> Sign in</>}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-3 text-xs text-slate-500">
          <span className="h-px flex-1 bg-white/10" /> Secure sign-in <span className="h-px flex-1 bg-white/10" />
        </div>
        <div className="mt-4 text-center text-xs text-slate-500 inline-flex items-center gap-1.5 justify-center w-full">
          <ShieldCheck size={13} className="text-emerald-400" /> Escrow-protected · SSL encrypted
        </div>
      </div>
    </AuthShell>
  );
}

/* ========= shared UI ========= */
export function AuthShell({ children, right }) {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-100">
      <div className="grid lg:grid-cols-2 min-h-screen">
        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <BrandRow />
            {children}
          </div>
        </div>
        <div className="hidden lg:block relative overflow-hidden">
          {right}
        </div>
      </div>
    </div>
  );
}

function BrandRow() {
  return (
    <Link to="/" className="flex items-center gap-2.5 mb-8">
      <span className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center font-bold text-slate-900 shadow-lg shadow-emerald-500/20">S</span>
      <span className="text-lg font-bold tracking-tight text-white">ShahLance</span>
    </Link>
  );
}

export function AuthBrandingPanel({ title, subtitle }) {
  return (
    <div
      className="relative h-full w-full flex flex-col justify-between p-10 xl:p-14"
      style={{
        background:
          'radial-gradient(700px 400px at 20% 20%, rgba(34,197,94,0.18), transparent 60%), radial-gradient(600px 300px at 90% 80%, rgba(59,130,246,0.12), transparent 60%), linear-gradient(180deg, #0b1220 0%, #060a15 100%)',
      }}
    >
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300">
          <ShieldCheck size={13} /> Escrow-protected marketplace
        </span>
        <h2 className="mt-5 text-4xl xl:text-5xl font-extrabold text-white leading-tight">{title}</h2>
        <p className="mt-4 text-slate-300 max-w-md">{subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 max-w-md">
        <StatCard value="120K+" label="Active Workers" />
        <StatCard value="$2.4M+" label="Paid to Freelancers" />
        <StatCard value="8.5K+" label="Active Campaigns" />
        <StatCard value="4.9★" label="Average Rating" />
      </div>
    </div>
  );
}

function StatCard({ value, label }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-4">
      <p className="text-2xl font-extrabold text-white">{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}

export function FieldWithIcon({ Icon, children }) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 focus-within:border-emerald-500/60 focus-within:bg-white/[0.06] px-3 h-11 btn-hover">
      <Icon size={16} className="text-slate-400 shrink-0" />
      {children}
    </label>
  );
}

export function ErrorAlert({ message }) {
  return (
    <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
      <AlertCircle size={16} className="text-rose-400 mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function SuccessAlert({ message }) {
  return (
    <div className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
      <ShieldCheck size={16} className="text-emerald-400 mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
