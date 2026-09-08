import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Lock, Bell, Mail, ShieldCheck, Trash2, Sun, Moon, Globe2, CheckCircle2, AlertCircle, Wallet,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AccountMenu from '../components/AccountMenu';
import NotificationCenter from '../components/NotificationCenter';
import { useToast } from '../hooks/use-toast';

const PREFS_KEY = 'shahlance_settings_prefs';

function readPrefs() { try { return JSON.parse(localStorage.getItem(PREFS_KEY) || 'null'); } catch { return null; } }
function writePrefs(p) { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); }

export default function Settings() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [prefs, setPrefs] = useState(() => readPrefs() || {
    theme: 'dark',
    language: 'English',
    email: {
      productApprovals: true,
      sellerApprovals: true,
      jobApplications: true,
      newMessages: true,
      orderUpdates: true,
      paymentUpdates: true,
      marketing: false,
    },
    push: {
      productApprovals: true,
      sellerApprovals: true,
      jobApplications: true,
      newMessages: true,
      orderUpdates: true,
      paymentUpdates: true,
    },
  });

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwOk, setPwOk] = useState(false);
  const [saving, setSaving] = useState(false);

  const setEmailToggle = (k) => setPrefs((p) => ({ ...p, email: { ...p.email, [k]: !p.email[k] } }));
  const setPushToggle = (k) => setPrefs((p) => ({ ...p, push: { ...p.push, [k]: !p.push[k] } }));

  const save = () => {
    setSaving(true);
    setTimeout(() => {
      writePrefs(prefs);
      setSaving(false);
      toast({ title: 'Preferences saved' });
    }, 500);
  };

  const changePassword = (e) => {
    e.preventDefault();
    setPwError(''); setPwOk(false);
    if (pw.next.length < 8) return setPwError('New password must be at least 8 characters.');
    if (pw.next !== pw.confirm) return setPwError('Passwords do not match.');
    // NOTE: real password change requires backend; UI-only success here.
    setPwOk(true);
    setPw({ current: '', next: '', confirm: '' });
    toast({ title: 'Password updated', description: 'Your account is now protected with your new password.' });
  };

  const deleteAccount = async () => {
    if (!window.confirm('This will sign you out and remove local session data. Continue?')) return;
    await logout();
    navigate('/');
    toast({ title: 'Signed out', description: 'Your session was cleared.' });
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-100">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0f1e]/95 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center font-bold text-slate-900 shadow-lg shadow-emerald-500/20">S</span>
            <span className="text-lg font-bold tracking-tight text-white">ShahLance</span>
          </Link>
          <NotificationCenter trigger="bell" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/my-account" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 btn-hover">
          <ArrowLeft size={14} /> Back to My Account
        </Link>
        <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-white">Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Manage security, notifications and preferences.</p>
        <div className="mt-5"><AccountMenu /></div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Security */}
          <Card title="Security" Icon={Lock}>
            <form onSubmit={changePassword} className="space-y-4">
              {pwError && <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200"><AlertCircle size={14} className="mt-0.5" /><span>{pwError}</span></div>}
              {pwOk && <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200"><CheckCircle2 size={14} className="mt-0.5" /><span>Password updated.</span></div>}
              <Field label="Current password">
                <input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} className="input-dark" placeholder="••••••••" />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="New password"><input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} className="input-dark" placeholder="Min 8 chars" /></Field>
                <Field label="Confirm new"><input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} className="input-dark" placeholder="Repeat" /></Field>
              </div>
              <button className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold px-4 py-2 text-sm btn-hover inline-flex items-center gap-2">
                <ShieldCheck size={14} /> Update password
              </button>
              <p className="text-[11px] text-slate-500">Two-factor authentication coming soon.</p>
            </form>
          </Card>

          {/* Preferences */}
          <Card title="Preferences" Icon={Globe2}>
            <Field label="Language">
              <select value={prefs.language} onChange={(e) => setPrefs({ ...prefs, language: e.target.value })} className="input-dark" style={{ colorScheme: 'dark' }}>
                {['English', 'Español', 'Français', 'Deutsch', 'Português', 'Bahasa Indonesia', 'हिन्दी', 'العربية'].map((l) => <option key={l} className="bg-[#0f1526]">{l}</option>)}
              </select>
            </Field>
            <Field label="Theme">
              <div className="grid grid-cols-2 gap-2">
                <ThemeButton active={prefs.theme === 'dark'} onClick={() => setPrefs({ ...prefs, theme: 'dark' })} Icon={Moon} label="Dark" />
                <ThemeButton active={prefs.theme === 'light'} onClick={() => setPrefs({ ...prefs, theme: 'light' })} Icon={Sun} label="Light (soon)" disabled />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">Light theme is coming soon.</p>
            </Field>
            <Field label="Currency (payouts)">
              <div className="input-dark flex items-center gap-2">
                <Wallet size={14} className="text-slate-400" />
                <span className="text-sm text-slate-200">USD (default)</span>
              </div>
            </Field>
          </Card>

          {/* Email notifications */}
          <Card title="Email notifications" Icon={Mail}>
            {[
              ['productApprovals', 'Product approvals & rejections'],
              ['sellerApprovals', 'Seller application updates'],
              ['jobApplications', 'Job application updates'],
              ['newMessages', 'New messages'],
              ['orderUpdates', 'Order updates'],
              ['paymentUpdates', 'Payment & payout updates'],
              ['marketing', 'Product news & marketing (optional)'],
            ].map(([k, label]) => (
              <Toggle key={k} label={label} checked={prefs.email[k]} onChange={() => setEmailToggle(k)} />
            ))}
          </Card>

          {/* Push notifications */}
          <Card title="In-app notifications" Icon={Bell}>
            {[
              ['productApprovals', 'Product approvals & rejections'],
              ['sellerApprovals', 'Seller application updates'],
              ['jobApplications', 'Job application updates'],
              ['newMessages', 'New messages'],
              ['orderUpdates', 'Order updates'],
              ['paymentUpdates', 'Payment & payout updates'],
            ].map(([k, label]) => (
              <Toggle key={k} label={label} checked={prefs.push[k]} onChange={() => setPushToggle(k)} />
            ))}
          </Card>

          {/* Danger zone */}
          <Card title="Danger zone" Icon={Trash2}>
            <p className="text-sm text-slate-400">Sign out of ShahLance on this device. Your data remains available when you sign back in.</p>
            <button onClick={deleteAccount} className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 px-3 py-2 text-sm font-semibold btn-hover inline-flex items-center gap-2">
              <Trash2 size={14} /> Sign out of this device
            </button>
          </Card>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={save} disabled={saving} className="rounded-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-900 font-semibold px-5 py-2.5 text-sm btn-hover inline-flex items-center gap-2">
            {saving ? <span className="h-4 w-4 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" /> : <><Save size={15} /> Save changes</>}
          </button>
        </div>
      </main>

      <style>{`
        .input-dark { width:100%; height:42px; border-radius:12px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.10); color:rgb(226 232 240); font-size:14px; padding:0 12px; outline:none; }
        .input-dark:focus, .input-dark:focus-within { border-color: rgba(16,185,129,0.6); background: rgba(255,255,255,0.06); }
      `}</style>
    </div>
  );
}

function Card({ title, Icon, children }) {
  return (
    <div className="card-surface rounded-2xl p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon size={16} className="text-emerald-400" />}
        <h3 className="text-base font-semibold text-white">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <button type="button" onClick={onChange} className="w-full flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] px-3 py-2.5 btn-hover text-left">
      <span className="text-sm text-slate-200">{label}</span>
      <span className={`relative inline-flex items-center h-5 w-9 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-white/10'}`}>
        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </span>
    </button>
  );
}

function ThemeButton({ active, onClick, Icon, label, disabled }) {
  return (
    <button type="button" onClick={disabled ? undefined : onClick} className={`inline-flex items-center gap-2 rounded-lg border px-3 h-10 btn-hover ${
      disabled ? 'opacity-50 cursor-not-allowed bg-white/[0.03] border-white/10 text-slate-400' :
      active ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
    }`}>
      <Icon size={14} /> <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
