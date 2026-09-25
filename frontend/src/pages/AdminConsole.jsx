import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Users, Package, DollarSign, Clock, Search, Ban, CheckCircle2, Wallet,
  Server, Plus, Trash2, RefreshCw, ShieldCheck, X, CreditCard, Gift, ArrowDownCircle, ArrowUpCircle,
} from 'lucide-react';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { adminService } from '../services/adminService';
import BonusProtectionSection from '../components/admin/BonusProtectionSection';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'users', label: 'Users' },
  { id: 'bonus', label: 'Bonus Protection' },
  { id: 'sms', label: 'SMS API' },
  { id: 'payments', label: 'Payments' },
  { id: 'wallet', label: 'Wallet' },
];

export default function AdminConsole() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('tab') || 'overview';
    } catch (_) {
      return 'overview';
    }
  });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/admin/console' } } });
    } else if (user.role !== 'admin') {
      navigate('/');
    }
  }, [loading, user, navigate]);

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0f1e]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-white btn-hover">
            <ArrowLeft size={15} /> Admin Panel
          </Link>
          <span className="text-lg font-bold tracking-tight text-white">ShahLance <span className="text-slate-500 font-normal">/ Console</span></span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin Console</h1>
        <p className="text-sm text-slate-400 mt-1">Platform overview, users, SMS, payment gateways and wallet management.</p>

        <div className="mt-6 flex flex-wrap gap-2 border-b border-white/5 pb-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              data-testid={`admin-tab-${t.id}`}
              onClick={() => setTab(t.id)}
              aria-pressed={tab === t.id}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold btn-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 ${
                tab === t.id ? 'bg-emerald-500 text-slate-900' : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === 'overview' && <Overview toast={toast} />}
          {tab === 'users' && <UsersTab toast={toast} />}
          {tab === 'bonus' && <BonusProtectionSection toast={toast} />}
          {tab === 'sms' && <SmsTab toast={toast} />}
          {tab === 'payments' && <PaymentsTab toast={toast} />}
          {tab === 'wallet' && <WalletTab toast={toast} />}
        </div>
      </main>
      <Footer />
    </div>
  );
}

const TONES = {
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  sky: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
  green: 'bg-green-500/10 border-green-500/20 text-green-400',
  amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
};

function Card({ Icon, label, value, tone = 'emerald', testId }) {
  return (
    <div className="card-surface rounded-2xl p-4 flex items-center gap-3" data-testid={testId}>
      <div className={`h-11 w-11 rounded-xl border flex items-center justify-center ${TONES[tone] || TONES.emerald}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-xl font-extrabold text-white leading-none">{value}</div>
        <div className="text-[11px] text-slate-400 mt-1">{label}</div>
      </div>
    </div>
  );
}

function Overview({ toast }) {
  const [s, setS] = useState(null);
  useEffect(() => {
    adminService.stats().then(setS).catch(() => toast({ title: 'Could not load stats' }));
  }, [toast]);
  if (!s) return <Loading />;
  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card Icon={Users} label="Total Users" value={s.totalUsers} />
        <Card Icon={Package} label="Total Orders" value={s.totalOrders} tone="sky" />
        <Card Icon={DollarSign} label="Total Revenue" value={`$${(s.totalRevenue || 0).toLocaleString()}`} tone="green" />
        <Card Icon={Clock} label="Pending Actions" value={s.pendingActions} tone="amber" />
      </div>
      <h2 className="mt-8 text-lg font-bold text-white">Recent Activity</h2>
      <div className="mt-3 card-surface rounded-2xl divide-y divide-white/5">
        {(s.recentActivity || []).length === 0 && <div className="p-5 text-sm text-slate-400">No recent activity.</div>}
        {(s.recentActivity || []).map((a) => (
          <div key={a.id} className="p-4 flex items-center justify-between gap-3">
            <span className="text-sm text-slate-200 truncate">{a.label}</span>
            <span className="text-[11px] rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-slate-300 capitalize shrink-0">{a.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function UsersTab({ toast }) {
  const [q, setQ] = useState('');
  const [rows, setRows] = useState(null);
  const [detail, setDetail] = useState(null);

  const load = (search) => {
    setRows(null);
    adminService.users(search).then(setRows).catch(() => toast({ title: 'Could not load users' }));
  };
  useEffect(() => { load(''); }, []);

  const openUser = (id) => {
    setDetail('loading');
    adminService.userDetail(id).then(setDetail).catch(() => { setDetail(null); toast({ title: 'Could not load user' }); });
  };

  const toggleBlock = async (u) => {
    try {
      await adminService.setBlocked(u.id, !u.blocked);
      toast({ title: u.blocked ? 'User unblocked' : 'User blocked' });
      load(q);
      if (detail && detail.user && detail.user.id === u.id) openUser(u.id);
    } catch (e) {
      toast({ title: 'Action failed', description: e?.response?.data?.detail || 'Try again.' });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div>
        <form onSubmit={(e) => { e.preventDefault(); load(q); }} className="flex items-center gap-2 mb-4">
          <div className="flex-1 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 h-10">
            <Search size={15} className="text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, username or email"
              aria-label="Search users"
              className="flex-1 bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-500" />
          </div>
          <button className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold px-4 h-10 text-sm btn-hover">Search</button>
        </form>
        {!rows ? <Loading /> : (
          <div className="card-surface rounded-2xl divide-y divide-white/5">
            {rows.length === 0 && <div className="p-5 text-sm text-slate-400">No users found.</div>}
            {rows.map((u) => (
              <div key={u.id} className="p-3.5 flex items-center justify-between gap-3">
                <button onClick={() => openUser(u.id)} className="flex items-center gap-3 min-w-0 text-left btn-hover">
                  <span className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-xs font-bold text-slate-900 shrink-0">
                    {(u.fullName || u.username || 'U').charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-white truncate">{u.fullName || u.username}</span>
                    <span className="block text-[11px] text-slate-400 truncate">{u.email}</span>
                  </span>
                </button>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-slate-300 capitalize">{u.role}</span>
                  {u.blocked && <span className="text-[10px] rounded-full bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-rose-300">Blocked</span>}
                  <button onClick={() => toggleBlock(u)} title={u.blocked ? 'Unblock' : 'Block'}
                    className={`rounded-lg p-1.5 btn-hover ${u.blocked ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-rose-400 hover:bg-rose-500/10'}`}>
                    {u.blocked ? <CheckCircle2 size={16} /> : <Ban size={16} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User detail + wallet */}
      <aside>
        <div className="card-surface rounded-2xl p-5 lg:sticky lg:top-24">
          <h3 className="text-sm font-bold text-white flex items-center gap-2"><Wallet size={15} className="text-emerald-400" /> User details & wallet</h3>
          {!detail && <p className="mt-3 text-xs text-slate-400">Select a user to view details, wallet balance, deposits and transactions.</p>}
          {detail === 'loading' && <div className="mt-4"><Loading /></div>}
          {detail && detail !== 'loading' && (
            <div className="mt-4 space-y-4">
              <div>
                <div className="text-sm font-semibold text-white">{detail.user.fullName || detail.user.username}</div>
                <div className="text-[11px] text-slate-400">{detail.user.email} · <span className="capitalize">{detail.user.role}</span></div>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                <div className="text-[11px] text-emerald-300">Wallet balance</div>
                <div className="text-2xl font-extrabold text-white">${(detail.wallet.balance || 0).toLocaleString()}</div>
                <div className="text-[11px] text-slate-400 mt-1">{detail.ordersCount} orders placed</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200 mb-1.5">Deposit history</div>
                <TxnList items={detail.wallet.deposits} empty="No deposits yet." />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200 mb-1.5">Transaction history</div>
                <TxnList items={detail.wallet.transactions} empty="No transactions yet." />
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function TxnList({ items, empty }) {
  if (!items || items.length === 0) return <div className="text-[11px] text-slate-500 rounded-lg border border-white/5 bg-white/[0.02] p-3">{empty}</div>;
  return (
    <div className="rounded-lg border border-white/5 divide-y divide-white/5">
      {items.map((t) => (
        <div key={t.id} className="p-2.5 flex items-center justify-between text-xs">
          <span className="text-slate-300 capitalize truncate">{t.type || 'txn'}</span>
          <span className="text-white font-semibold">${Number(t.amount || 0).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

function SmsTab({ toast }) {
  const [providers, setProviders] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [config, setConfig] = useState(null);
  const [pForm, setPForm] = useState({ name: '', apiUrl: '', apiKey: '', apiSecret: '' });
  const [mForm, setMForm] = useState({ service: '', country: '', primaryProviderId: '', backupProviderId: '', cost: '', price: '' });

  const reload = () => {
    adminService.sms.providers().then(setProviders).catch(() => {});
    adminService.sms.mappings().then(setMappings).catch(() => {});
    adminService.sms.orders().then(setOrders).catch(() => {});
    adminService.sms.config().then(setConfig).catch(() => {});
  };
  useEffect(() => { reload(); }, []);

  const providerName = (id) => (providers.find((p) => p.id === id) || {}).name || '—';

  const addProvider = async (e) => {
    e.preventDefault();
    if (!pForm.name.trim()) return toast({ title: 'Provider name required' });
    await adminService.sms.createProvider(pForm);
    setPForm({ name: '', apiUrl: '', apiKey: '', apiSecret: '' });
    toast({ title: 'Provider added' });
    reload();
  };
  const toggleProvider = async (p) => { await adminService.sms.updateProvider(p.id, { status: !p.status }); reload(); };
  const delProvider = async (p) => { await adminService.sms.deleteProvider(p.id); reload(); };

  const addMapping = async (e) => {
    e.preventDefault();
    if (!mForm.service || !mForm.country) return toast({ title: 'Select service and country' });
    await adminService.sms.createMapping({ ...mForm, cost: Number(mForm.cost || 0), price: Number(mForm.price || 0) });
    setMForm({ service: '', country: '', primaryProviderId: '', backupProviderId: '', cost: '', price: '' });
    toast({ title: 'Mapping saved' });
    reload();
  };
  const toggleMapping = async (m) => { await adminService.sms.updateMapping(m.id, { enabled: !m.enabled }); reload(); };
  const delMapping = async (m) => { await adminService.sms.deleteMapping(m.id); reload(); };

  const toggleConfig = async (kind, key) => {
    if (!config) return;
    const next = { ...(config[kind] || {}) };
    next[key] = !next[key];
    const updated = await adminService.sms.updateConfig({ [kind]: next });
    setConfig(updated);
  };

  const services = config?.allServices || [];
  const countries = config?.allCountries || [];

  return (
    <div className="space-y-8">
      {/* Providers */}
      <section>
        <h2 className="text-lg font-bold text-white flex items-center gap-2"><Server size={17} className="text-emerald-400" /> SMS Providers</h2>
        <form onSubmit={addProvider} className="mt-3 card-surface rounded-2xl p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="Provider Name" value={pForm.name} onChange={(v) => setPForm({ ...pForm, name: v })} />
          <Input label="API URL" value={pForm.apiUrl} onChange={(v) => setPForm({ ...pForm, apiUrl: v })} />
          <Input label="API Key" value={pForm.apiKey} onChange={(v) => setPForm({ ...pForm, apiKey: v })} />
          <Input label="API Secret" value={pForm.apiSecret} onChange={(v) => setPForm({ ...pForm, apiSecret: v })} />
          <div className="sm:col-span-2 lg:col-span-4">
            <button className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold px-4 py-2 text-sm btn-hover"><Plus size={15} /> Add provider</button>
          </div>
        </form>
        <div className="mt-3 card-surface rounded-2xl divide-y divide-white/5">
          {providers.length === 0 && <div className="p-4 text-sm text-slate-400">No providers yet.</div>}
          {providers.map((p) => (
            <div key={p.id} className="p-3.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white truncate">{p.name}</div>
                <div className="text-[11px] text-slate-500 truncate">{p.apiUrl || 'No API URL'}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleProvider(p)} className={`text-[11px] rounded-full px-2.5 py-1 font-semibold btn-hover ${p.status ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-white/5 text-slate-400 border border-white/10'}`}>
                  {p.status ? 'ON' : 'OFF'}
                </button>
                <button onClick={() => delProvider(p)} className="text-rose-400 hover:bg-rose-500/10 rounded-lg p-1.5 btn-hover"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Manual mapping + pricing */}
      <section>
        <h2 className="text-lg font-bold text-white flex items-center gap-2"><ShieldCheck size={17} className="text-emerald-400" /> Manual Provider Mapping &amp; Pricing</h2>
        <p className="text-xs text-slate-400 mt-1">Assign Service + Country → Primary / Backup provider. Manual only — no auto routing.</p>
        <form onSubmit={addMapping} className="mt-3 card-surface rounded-2xl p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Select label="Service" value={mForm.service} onChange={(v) => setMForm({ ...mForm, service: v })} options={services} />
          <Select label="Country" value={mForm.country} onChange={(v) => setMForm({ ...mForm, country: v })} options={countries} />
          <Select label="Primary Provider" value={mForm.primaryProviderId} onChange={(v) => setMForm({ ...mForm, primaryProviderId: v })} options={providers.map((p) => ({ value: p.id, label: p.name }))} />
          <Select label="Backup Provider" value={mForm.backupProviderId} onChange={(v) => setMForm({ ...mForm, backupProviderId: v })} options={providers.map((p) => ({ value: p.id, label: p.name }))} />
          <Input label="Provider Cost ($)" type="number" value={mForm.cost} onChange={(v) => setMForm({ ...mForm, cost: v })} />
          <Input label="Customer Price ($)" type="number" value={mForm.price} onChange={(v) => setMForm({ ...mForm, price: v })} />
          <div className="sm:col-span-2 lg:col-span-3 flex items-center justify-between">
            <span className="text-xs text-slate-400">Profit margin: <span className="text-emerald-300 font-semibold">${(Number(mForm.price || 0) - Number(mForm.cost || 0)).toFixed(2)}</span></span>
            <button className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold px-4 py-2 text-sm btn-hover"><Plus size={15} /> Save mapping</button>
          </div>
        </form>
        <div className="mt-3 overflow-x-auto">
          <div className="card-surface rounded-2xl divide-y divide-white/5 min-w-[640px]">
            <div className="grid grid-cols-6 gap-2 p-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              <span>Service</span><span>Country</span><span>Primary</span><span>Backup</span><span>Cost / Price / Profit</span><span className="text-right">Actions</span>
            </div>
            {mappings.length === 0 && <div className="p-4 text-sm text-slate-400">No mappings yet.</div>}
            {mappings.map((m) => (
              <div key={m.id} className="grid grid-cols-6 gap-2 p-3 items-center text-sm">
                <span className="text-white font-medium">{m.service}</span>
                <span className="text-slate-300">{m.country}</span>
                <span className="text-slate-300 truncate">{providerName(m.primaryProviderId)}</span>
                <span className="text-slate-300 truncate">{providerName(m.backupProviderId)}</span>
                <span className="text-slate-300">${m.cost} / ${m.price} / <span className="text-emerald-300">${m.profit}</span></span>
                <span className="flex items-center justify-end gap-2">
                  <button onClick={() => toggleMapping(m)} className={`text-[11px] rounded-full px-2 py-0.5 font-semibold btn-hover ${m.enabled ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-white/5 text-slate-400 border border-white/10'}`}>{m.enabled ? 'On' : 'Off'}</button>
                  <button onClick={() => delMapping(m)} className="text-rose-400 hover:bg-rose-500/10 rounded-lg p-1 btn-hover"><Trash2 size={14} /></button>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enable/disable services & countries */}
      <section className="grid gap-6 sm:grid-cols-2">
        <ToggleGroup title="Services" kind="services" all={services} config={config} onToggle={toggleConfig} />
        <ToggleGroup title="Countries" kind="countries" all={countries} config={config} onToggle={toggleConfig} />
      </section>

      {/* Order tracking */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">SMS Order Tracking</h2>
          <button onClick={reload} className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white btn-hover"><RefreshCw size={13} /> Refresh</button>
        </div>
        <div className="mt-3 overflow-x-auto">
          <div className="card-surface rounded-2xl divide-y divide-white/5 min-w-[640px]">
            <div className="grid grid-cols-6 gap-2 p-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              <span>User</span><span>Service</span><span>Country</span><span>Provider</span><span>Status</span><span>OTP Status</span>
            </div>
            {orders.length === 0 && <div className="p-4 text-sm text-slate-400">No SMS orders yet.</div>}
            {orders.map((o) => (
              <div key={o.id} className="grid grid-cols-6 gap-2 p-3 text-sm">
                <span className="text-white truncate">{o.userName || o.userId || '—'}</span>
                <span className="text-slate-300">{o.service || '—'}</span>
                <span className="text-slate-300">{o.country || '—'}</span>
                <span className="text-slate-300 truncate">{providerName(o.providerId)}</span>
                <span className="text-slate-300 capitalize">{o.status || '—'}</span>
                <span className="text-slate-300 capitalize">{o.otpStatus || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const GATEWAY_PROVIDERS = [
  { value: 'cryptomus', label: 'Cryptomus' },
  { value: 'nowpayments', label: 'NOWPayments' },
];

const PAYMENT_STATUSES = ['pending', 'completed', 'failed', 'refunded'];

const STATUS_TONE = {
  pending: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
  completed: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
  failed: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
  refunded: 'bg-sky-500/15 border-sky-500/30 text-sky-300',
};

function StatusBadge({ status }) {
  return (
    <span data-testid={`payment-status-${status}`} className={`inline-block text-[11px] rounded-full px-2 py-0.5 font-semibold border capitalize ${STATUS_TONE[status] || 'bg-white/5 border-white/10 text-slate-300'}`}>
      {status}
    </span>
  );
}

function PaymentsTab({ toast }) {
  const [gateways, setGateways] = useState(null);
  const [gForm, setGForm] = useState({ provider: 'cryptomus', merchantId: '', apiKey: '', secretKey: '', webhookUrl: '' });
  const [monitor, setMonitor] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const loadGateways = () => adminService.payments.gateways().then(setGateways).catch(() => toast({ title: 'Could not load gateways' }));
  const loadMonitor = (status) => adminService.payments.transactions(status || undefined).then(setMonitor).catch(() => toast({ title: 'Could not load payments' }));

  useEffect(() => { loadGateways(); }, []);
  useEffect(() => { loadMonitor(statusFilter); }, [statusFilter]);

  const addGateway = async (e) => {
    e.preventDefault();
    if (!gForm.merchantId.trim() || !gForm.apiKey.trim()) return toast({ title: 'Merchant ID and API Key are required' });
    try {
      await adminService.payments.createGateway(gForm);
      setGForm({ provider: 'cryptomus', merchantId: '', apiKey: '', secretKey: '', webhookUrl: '' });
      toast({ title: 'Gateway saved' });
      loadGateways();
    } catch (err) {
      toast({ title: 'Could not save gateway', description: err?.response?.data?.detail || 'Try again.' });
    }
  };
  const toggleGateway = async (g) => { await adminService.payments.updateGateway(g.id, { enabled: !g.enabled }); loadGateways(); };
  const delGateway = async (g) => { await adminService.payments.deleteGateway(g.id); loadGateways(); };

  const markRefund = async (t) => {
    try {
      await adminService.payments.refund(t.id);
      toast({ title: 'Payment marked as refunded' });
      loadMonitor(statusFilter);
    } catch (err) {
      toast({ title: 'Refund failed', description: err?.response?.data?.detail || 'Try again.' });
    }
  };

  const summary = monitor?.summary || {};
  const txns = monitor?.transactions || [];

  return (
    <div className="space-y-8">
      {/* Gateway management */}
      <section>
        <h2 className="text-lg font-bold text-white flex items-center gap-2"><CreditCard size={17} className="text-emerald-400" /> Payment Gateways</h2>
        <p className="text-xs text-slate-400 mt-1">Cryptomus &amp; NOWPayments credentials. Config storage only — no live charges are processed yet.</p>
        <form onSubmit={addGateway} className="mt-3 card-surface rounded-2xl p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Select label="Provider" testId="gateway-form-provider" value={gForm.provider} onChange={(v) => setGForm({ ...gForm, provider: v })} options={GATEWAY_PROVIDERS} />
          <Input label="Merchant ID" testId="gateway-form-merchant-id" value={gForm.merchantId} onChange={(v) => setGForm({ ...gForm, merchantId: v })} />
          <Input label="API Key" testId="gateway-form-api-key" value={gForm.apiKey} onChange={(v) => setGForm({ ...gForm, apiKey: v })} />
          <Input label="Secret Key" testId="gateway-form-secret-key" value={gForm.secretKey} onChange={(v) => setGForm({ ...gForm, secretKey: v })} />
          <Input label="Webhook URL" testId="gateway-form-webhook" value={gForm.webhookUrl} onChange={(v) => setGForm({ ...gForm, webhookUrl: v })} />
          <div className="flex items-end">
            <button data-testid="gateway-submit-button" className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold px-4 py-2 text-sm btn-hover"><Plus size={15} /> Save gateway</button>
          </div>
        </form>
        <div className="mt-3 card-surface rounded-2xl divide-y divide-white/5" data-testid="gateway-list">
          {!gateways && <div className="p-4"><Loading /></div>}
          {gateways && gateways.length === 0 && <div className="p-4 text-sm text-slate-400">No gateways configured yet.</div>}
          {(gateways || []).map((g) => (
            <div key={g.id} data-testid={`gateway-item-${g.id}`} className="p-3.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{GATEWAY_PROVIDERS.find((p) => p.value === g.provider)?.label || g.provider}</span>
                  <span className="text-[10px] rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-slate-400">{g.provider}</span>
                </div>
                <div className="text-[11px] text-slate-500 truncate">Merchant: {g.merchantId || '—'} · Webhook: {g.webhookUrl || '—'}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleGateway(g)} data-testid={`gateway-toggle-${g.id}`}
                  className={`text-[11px] rounded-full px-2.5 py-1 font-semibold btn-hover ${g.enabled ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-white/5 text-slate-400 border border-white/10'}`}>
                  {g.enabled ? 'ON' : 'OFF'}
                </button>
                <button onClick={() => delGateway(g)} data-testid={`gateway-delete-${g.id}`} className="text-rose-400 hover:bg-rose-500/10 rounded-lg p-1.5 btn-hover"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Payment monitoring */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Payment Monitoring</h2>
          <button onClick={() => loadMonitor(statusFilter)} data-testid="payments-refresh-button" className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white btn-hover"><RefreshCw size={13} /> Refresh</button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2" data-testid="payments-summary">
          <button onClick={() => setStatusFilter('')} data-testid="payments-filter-all" aria-pressed={statusFilter === ''}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold border btn-hover ${statusFilter === '' ? 'bg-emerald-500 text-slate-900 border-emerald-500' : 'bg-white/5 text-slate-300 border-white/10'}`}>
            All ({Object.values(summary).reduce((a, b) => a + b, 0)})
          </button>
          {PAYMENT_STATUSES.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} data-testid={`payments-filter-${s}`} aria-pressed={statusFilter === s}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold border capitalize btn-hover ${statusFilter === s ? 'bg-emerald-500 text-slate-900 border-emerald-500' : STATUS_TONE[s]}`}>
              {s} ({summary[s] || 0})
            </button>
          ))}
        </div>
        <div className="mt-3 overflow-x-auto">
          <div className="card-surface rounded-2xl divide-y divide-white/5 min-w-[720px]" data-testid="payments-table">
            <div className="grid grid-cols-6 gap-2 p-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              <span>Order</span><span>Buyer</span><span>Amount</span><span>Status</span><span>Date</span><span className="text-right">Actions</span>
            </div>
            {!monitor && <div className="p-4"><Loading /></div>}
            {monitor && txns.length === 0 && <div className="p-4 text-sm text-slate-400">No payments found.</div>}
            {txns.map((t) => (
              <div key={t.id} data-testid={`payment-row-${t.id}`} className="grid grid-cols-6 gap-2 p-3 items-center text-sm">
                <span className="text-white truncate">{t.orderTitle}</span>
                <span className="text-slate-300 truncate">{t.userEmail}</span>
                <span className="text-white font-semibold">${Number(t.amount || 0).toLocaleString()} <span className="text-[10px] text-slate-500 uppercase">{t.currency}</span></span>
                <span><StatusBadge status={t.monitorStatus} /></span>
                <span className="text-[11px] text-slate-400">{t.created_at ? new Date(t.created_at).toLocaleDateString() : '—'}</span>
                <span className="flex justify-end">
                  {t.monitorStatus === 'completed' && (
                    <button onClick={() => markRefund(t)} data-testid={`payment-refund-button-${t.id}`}
                      className="text-[11px] rounded-full px-2.5 py-1 font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30 btn-hover">
                      Mark refunded
                    </button>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const WALLET_TYPES = [
  { value: 'credit', label: 'Credit (add funds)' },
  { value: 'debit', label: 'Debit (remove funds)' },
  { value: 'bonus', label: 'Bonus (promotional credit)' },
];

const WALLET_TYPE_TONE = {
  credit: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
  debit: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
  bonus: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
  deposit: 'bg-sky-500/15 border-sky-500/30 text-sky-300',
};

function WalletTab({ toast }) {
  const [report, setReport] = useState(null);
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ type: 'credit', amount: '', note: '' });
  const [busy, setBusy] = useState(false);

  const loadReport = () => adminService.wallet.report().then(setReport).catch(() => toast({ title: 'Could not load wallet report' }));
  useEffect(() => { loadReport(); }, []);

  const search = async (e) => {
    e.preventDefault();
    try {
      setResults(await adminService.users(q));
    } catch {
      toast({ title: 'User search failed' });
    }
  };

  const pickUser = async (u) => {
    try {
      const d = await adminService.userDetail(u.id);
      setSelected({ ...d.user, balance: d.wallet.balance });
      setResults([]);
      setQ('');
    } catch {
      toast({ title: 'Could not load user wallet' });
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!selected) return toast({ title: 'Select a user first' });
    if (!form.note.trim()) return toast({ title: 'A transaction note is required' });
    setBusy(true);
    try {
      const r = await adminService.wallet.adjust({ userId: selected.id, type: form.type, amount: Number(form.amount), note: form.note.trim() });
      toast({ title: 'Wallet updated', description: `New balance: $${Number(r.balance).toLocaleString()}` });
      setSelected({ ...selected, balance: r.balance });
      setForm({ type: 'credit', amount: '', note: '' });
      loadReport();
    } catch (err) {
      toast({ title: 'Adjustment failed', description: err?.response?.data?.detail || 'Try again.' });
    } finally {
      setBusy(false);
    }
  };

  const totals = report?.totals || {};
  const recent = report?.recent || [];

  return (
    <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
      {/* Manual adjustment */}
      <section className="card-surface rounded-2xl p-5 self-start">
        <h2 className="text-lg font-bold text-white flex items-center gap-2"><Wallet size={17} className="text-emerald-400" /> Adjust User Wallet</h2>
        <p className="text-xs text-slate-400 mt-1">Manual credit, debit or bonus. A note is recorded with every adjustment.</p>

        <form onSubmit={search} className="mt-4 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 h-10">
            <Search size={15} className="text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find user by name or email"
              aria-label="Search users for wallet adjustment" data-testid="wallet-user-search-input"
              className="flex-1 bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-500" />
          </div>
          <button data-testid="wallet-user-search-button" className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold px-4 h-10 text-sm btn-hover">Find</button>
        </form>

        {results.length > 0 && (
          <div className="mt-2 card-surface rounded-xl divide-y divide-white/5 max-h-48 overflow-y-auto" data-testid="wallet-user-results">
            {results.map((u) => (
              <button key={u.id} onClick={() => pickUser(u)} data-testid={`wallet-user-option-${u.id}`}
                className="w-full text-left p-2.5 hover:bg-white/5 btn-hover">
                <span className="block text-sm font-semibold text-white truncate">{u.fullName || u.username}</span>
                <span className="block text-[11px] text-slate-400 truncate">{u.email}</span>
              </button>
            ))}
          </div>
        )}

        {selected && (
          <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3" data-testid="wallet-selected-user">
            <div className="text-sm font-semibold text-white">{selected.fullName || selected.username}</div>
            <div className="text-[11px] text-slate-400">{selected.email}</div>
            <div className="mt-1 text-xl font-extrabold text-white">${Number(selected.balance || 0).toLocaleString()}</div>
          </div>
        )}

        <form onSubmit={submit} className="mt-4 space-y-3">
          <Select label="Adjustment type" testId="wallet-adjust-type" value={form.type} onChange={(v) => setForm({ ...form, type: v })} options={WALLET_TYPES} />
          <Input label="Amount ($)" testId="wallet-adjust-amount" type="number" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} />
          <Input label="Transaction note (required)" testId="wallet-adjust-note" value={form.note} onChange={(v) => setForm({ ...form, note: v })} />
          <button disabled={busy} data-testid="wallet-adjust-submit"
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-900 font-semibold px-4 py-2.5 text-sm btn-hover">
            {busy ? 'Applying…' : 'Apply adjustment'}
          </button>
        </form>
      </section>

      {/* Report */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Wallet Report</h2>
          <button onClick={loadReport} data-testid="wallet-report-refresh" className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white btn-hover"><RefreshCw size={13} /> Refresh</button>
        </div>
        <div className="mt-3 grid grid-cols-2 lg:grid-cols-3 gap-3">
          <Card Icon={Wallet} label="Total user balances" testId="wallet-report-total-balance" value={`$${Number(report?.totalBalance || 0).toLocaleString()}`} />
          <Card Icon={ArrowDownCircle} label="Deposits" testId="wallet-report-deposits" tone="sky" value={`$${Number(totals.deposit || 0).toLocaleString()}`} />
          <Card Icon={ArrowUpCircle} label="Manual credits" testId="wallet-report-credits" tone="green" value={`$${Number(totals.credit || 0).toLocaleString()}`} />
          <Card Icon={ArrowDownCircle} label="Manual debits" testId="wallet-report-debits" tone="rose" value={`$${Number(totals.debit || 0).toLocaleString()}`} />
          <Card Icon={Gift} label="Bonuses issued" testId="wallet-report-bonuses" tone="amber" value={`$${Number(totals.bonus || 0).toLocaleString()}`} />
        </div>

        <h3 className="mt-6 text-sm font-bold text-white">Recent wallet transactions</h3>
        <div className="mt-2 overflow-x-auto">
          <div className="card-surface rounded-2xl divide-y divide-white/5 min-w-[560px]" data-testid="wallet-recent-adjustments">
            <div className="grid grid-cols-5 gap-2 p-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              <span>User</span><span>Type</span><span>Amount</span><span>Note</span><span>Date</span>
            </div>
            {!report && <div className="p-4"><Loading /></div>}
            {report && recent.length === 0 && <div className="p-4 text-sm text-slate-400">No wallet transactions yet.</div>}
            {recent.map((t) => (
              <div key={t.id} className="grid grid-cols-5 gap-2 p-3 items-center text-sm" data-testid={`wallet-txn-${t.id}`}>
                <span className="text-slate-300 truncate">{t.userEmail}</span>
                <span><span className={`inline-block text-[11px] rounded-full px-2 py-0.5 font-semibold border capitalize ${WALLET_TYPE_TONE[t.type] || 'bg-white/5 border-white/10 text-slate-300'}`}>{t.type}</span></span>
                <span className={`font-semibold ${Number(t.amount) < 0 ? 'text-rose-300' : 'text-emerald-300'}`}>{Number(t.amount) < 0 ? '-' : '+'}${Math.abs(Number(t.amount || 0)).toLocaleString()}</span>
                <span className="text-slate-400 text-xs truncate">{t.note || '—'}</span>
                <span className="text-[11px] text-slate-400">{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '—'}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ToggleGroup({ title, kind, all, config, onToggle }) {
  const state = config?.[kind] || {};
  return (
    <div className="card-surface rounded-2xl p-4">
      <h3 className="text-sm font-bold text-white">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {all.map((k) => {
          const on = state[k] !== false;
          return (
            <button key={k} onClick={() => onToggle(kind, k)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium btn-hover border ${on ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-white/5 text-slate-400 border-white/10'}`}>
              {on ? <CheckCircle2 size={12} /> : <X size={12} />} {k}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', testId }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-medium text-slate-400 mb-1">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} data-testid={testId}
        className="w-full rounded-lg bg-white/5 border border-white/10 px-3 h-10 text-sm text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70" />
    </label>
  );
}

function Select({ label, value, onChange, options, testId }) {
  const opts = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  return (
    <label className="block">
      <span className="block text-[11px] font-medium text-slate-400 mb-1">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} data-testid={testId} style={{ colorScheme: 'dark' }}
        className="w-full rounded-lg bg-white/5 border border-white/10 px-3 h-10 text-sm text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70">
        <option value="" className="bg-[#0f1526]">Select…</option>
        {opts.map((o) => <option key={o.value} value={o.value} className="bg-[#0f1526]">{o.label}</option>)}
      </select>
    </label>
  );
}

function Loading() {
  return <div className="flex justify-center py-10"><div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" /></div>;
}
