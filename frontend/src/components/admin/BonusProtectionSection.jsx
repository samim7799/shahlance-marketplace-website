import React, { useEffect, useState, useMemo } from 'react';
import {
  ShieldCheck, ShieldAlert, Gift, Settings, History, Users, AlertTriangle,
  CheckCircle2, XCircle, Search, RefreshCw, Smartphone, Mail, AlertOctagon, UserX
} from 'lucide-react';
import { adminService } from '../../services/adminService';

const STATUS_BADGES = {
  credited: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
  pending_review: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
  rejected: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
  unclaimed: 'bg-slate-700/30 border-slate-600/30 text-slate-400',
  pending_email_verification: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
  pending_phone_verification: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
  requires_purchase: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400',
};

export default function BonusProtectionSection({ toast }) {
  const [subTab, setSubTab] = useState('settings'); // 'settings' | 'history' | 'users' | 'suspicious'
  const [loading, setLoading] = useState(false);

  // Settings State
  const [settings, setSettings] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);

  // History State
  const [historyList, setHistoryList] = useState([]);
  const [historyFilter, setHistoryFilter] = useState('all');
  const [historySearch, setHistorySearch] = useState('');

  // User Status State
  const [userStatusList, setUserStatusList] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all');

  // Suspicious Users State
  const [suspiciousList, setSuspiciousList] = useState([]);
  const [reviewNote, setReviewNote] = useState('');
  const [actionInProgress, setActionInProgress] = useState(null);

  // Load Settings
  const loadSettings = async () => {
    try {
      const res = await adminService.bonus.getSettings();
      setSettings(res);
    } catch {
      toast({ title: 'Failed to load bonus settings', variant: 'destructive' });
    }
  };

  // Load History
  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await adminService.bonus.history({
        status: historyFilter,
        search: historySearch,
      });
      setHistoryList(res || []);
    } catch {
      toast({ title: 'Failed to load bonus history' });
    } finally {
      setLoading(false);
    }
  };

  // Load User Status
  const loadUserStatus = async () => {
    try {
      setLoading(true);
      const res = await adminService.bonus.userStatus({
        status: userFilter,
        search: userSearch,
      });
      setUserStatusList(res || []);
    } catch {
      toast({ title: 'Failed to load user bonus status' });
    } finally {
      setLoading(false);
    }
  };

  // Load Suspicious Users
  const loadSuspiciousUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.bonus.suspiciousUsers();
      setSuspiciousList(res || []);
    } catch {
      toast({ title: 'Failed to load suspicious users' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
    loadSuspiciousUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (subTab === 'settings') loadSettings();
    if (subTab === 'history') loadHistory();
    if (subTab === 'users') loadUserStatus();
    if (subTab === 'suspicious') loadSuspiciousUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subTab, historyFilter, userFilter]);

  // Save Settings Handler
  const handleSaveSettings = async (e) => {
    e?.preventDefault();
    if (!settings) return;
    try {
      setSavingSettings(true);
      const updated = await adminService.bonus.updateSettings(settings);
      setSettings(updated);
      toast({ title: 'Bonus settings updated successfully' });
    } catch (err) {
      toast({ title: 'Failed to update bonus settings', variant: 'destructive' });
    } finally {
      setSavingSettings(false);
    }
  };

  // Review Suspicious User Handler
  const handleReviewAction = async (action, bonusId, userId) => {
    try {
      setActionInProgress(`${action}-${bonusId || userId}`);
      await adminService.bonus.review({
        action,
        bonusId,
        userId,
        note: reviewNote || `Admin action: ${action}`,
      });
      toast({
        title: action === 'approve'
          ? 'Bonus approved and credited to wallet'
          : action === 'reject'
          ? 'Bonus rejected'
          : 'Suspicious flag cleared',
      });
      setReviewNote('');
      await loadSuspiciousUsers();
      if (subTab === 'history') loadHistory();
      if (subTab === 'users') loadUserStatus();
    } catch (err) {
      toast({ title: 'Action failed', description: err?.response?.data?.detail || 'An error occurred', variant: 'destructive' });
    } finally {
      setActionInProgress(null);
    }
  };

  // Stats calculation
  const totalCreditedAmount = useMemo(() => {
    return historyList
      .filter((h) => h.status === 'credited')
      .reduce((sum, h) => sum + (Number(h.amount) || 0), 0);
  }, [historyList]);

  return (
    <div className="space-y-6" data-testid="bonus-protection-section">
      {/* Top Banner & Quick Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card-surface rounded-2xl p-4 flex items-center gap-3 border border-white/5" data-testid="bonus-metric-status">
          <div className="h-11 w-11 rounded-xl border flex items-center justify-center bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
            <Gift className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-white">
              {settings?.enabled ? 'Active' : 'Disabled'}
            </div>
            <div className="text-[11px] text-slate-400">System Status</div>
          </div>
        </div>

        <div className="card-surface rounded-2xl p-4 flex items-center gap-3 border border-white/5" data-testid="bonus-metric-amount">
          <div className="h-11 w-11 rounded-xl border flex items-center justify-center bg-sky-500/10 border-sky-500/20 text-sky-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-white">
              ${settings ? Number(settings.bonusAmount || 0).toFixed(2) : '10.00'}
            </div>
            <div className="text-[11px] text-slate-400">Signup Bonus Amount</div>
          </div>
        </div>

        <div className="card-surface rounded-2xl p-4 flex items-center gap-3 border border-white/5" data-testid="bonus-metric-purchase-req">
          <div className="h-11 w-11 rounded-xl border flex items-center justify-center bg-purple-500/10 border-purple-500/20 text-purple-400">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-white">
              {settings?.requireFirstPurchase ? `Min $${Number(settings.minPurchaseAmount || 0).toFixed(0)}` : 'None'}
            </div>
            <div className="text-[11px] text-slate-400">First Purchase Gate</div>
          </div>
        </div>

        <div className="card-surface rounded-2xl p-4 flex items-center gap-3 border border-white/5" data-testid="bonus-metric-suspicious">
          <div className="h-11 w-11 rounded-xl border flex items-center justify-center bg-amber-500/10 border-amber-500/20 text-amber-400 relative">
            <ShieldAlert className="h-5 w-5" />
            {suspiciousList.length > 0 && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-rose-500 rounded-full animate-ping" />
            )}
          </div>
          <div>
            <div className="text-xl font-extrabold text-white flex items-center gap-2">
              {suspiciousList.length}
              {suspiciousList.length > 0 && (
                <span className="text-[10px] bg-rose-500/20 border border-rose-500/30 text-rose-400 px-1.5 py-0.5 rounded-full font-mono">
                  ACTION
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400">Suspicious Flagged</div>
          </div>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex flex-wrap gap-2">
          <button
            data-testid="bonus-tab-settings"
            onClick={() => setSubTab('settings')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              subTab === 'settings'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20'
                : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
            }`}
          >
            <Settings size={14} /> Bonus Settings
          </button>
          <button
            data-testid="bonus-tab-history"
            onClick={() => setSubTab('history')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              subTab === 'history'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20'
                : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
            }`}
          >
            <History size={14} /> Bonus History
          </button>
          <button
            data-testid="bonus-tab-users"
            onClick={() => setSubTab('users')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              subTab === 'users'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20'
                : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
            }`}
          >
            <Users size={14} /> User Bonus Status
          </button>
          <button
            data-testid="bonus-tab-suspicious"
            onClick={() => setSubTab('suspicious')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              subTab === 'suspicious'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
            }`}
          >
            <AlertTriangle size={14} /> Suspicious User List
            {suspiciousList.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                {suspiciousList.length}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={() => {
            if (subTab === 'settings') loadSettings();
            if (subTab === 'history') loadHistory();
            if (subTab === 'users') loadUserStatus();
            if (subTab === 'suspicious') loadSuspiciousUsers();
          }}
          className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors"
          title="Refresh Data"
          data-testid="bonus-refresh-btn"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* SUB-TAB 1: BONUS SETTINGS */}
      {subTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-testid="bonus-settings-view">
          {/* Main Settings Form */}
          <div className="lg:col-span-2 card-surface rounded-2xl p-5 border border-white/5 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings className="text-emerald-400 h-5 w-5" /> Bonus Settings (Admin only)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure signup incentives and financial safeguards for new platform registrations.
              </p>
            </div>

            {settings ? (
              <form onSubmit={handleSaveSettings} className="space-y-5">
                {/* 1. Enable / Disable Signup Bonus */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <label className="text-sm font-semibold text-white block">
                      Enable/Disable Signup Bonus
                    </label>
                    <span className="text-xs text-slate-400">
                      When enabled, qualifying users receive a welcome reward into their wallet.
                    </span>
                  </div>
                  <button
                    type="button"
                    data-testid="bonus-toggle-enabled"
                    onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                      settings.enabled ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* 2. Bonus Amount */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <label className="text-sm font-semibold text-white block">
                    Bonus Amount ($)
                  </label>
                  <p className="text-xs text-slate-400">
                    The monetary reward amount credited to the user's wallet balance upon qualification.
                  </p>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 text-sm">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      data-testid="bonus-input-amount"
                      value={settings.bonusAmount ?? ''}
                      onChange={(e) =>
                        setSettings({ ...settings, bonusAmount: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl pl-8 pr-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                      required
                    />
                  </div>
                </div>

                {/* 3. Require First Purchase (ON/OFF) */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <label className="text-sm font-semibold text-white block">
                      Require First Purchase (ON/OFF)
                    </label>
                    <span className="text-xs text-slate-400">
                      Withhold bonus until the user completes their initial purchase on ShahLance.
                    </span>
                  </div>
                  <button
                    type="button"
                    data-testid="bonus-toggle-first-purchase"
                    onClick={() =>
                      setSettings({
                        ...settings,
                        requireFirstPurchase: !settings.requireFirstPurchase,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                      settings.requireFirstPurchase ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.requireFirstPurchase ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* 4. Minimum Purchase Amount */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <label className="text-sm font-semibold text-white block">
                    Minimum Purchase Amount ($)
                  </label>
                  <p className="text-xs text-slate-400">
                    Minimum order amount required to trigger the bonus when "Require First Purchase" is ON.
                  </p>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 text-sm">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      data-testid="bonus-input-min-purchase"
                      value={settings.minPurchaseAmount ?? ''}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          minPurchaseAmount: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl pl-8 pr-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                      required
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    data-testid="bonus-save-settings-btn"
                    disabled={savingSettings}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {savingSettings && <RefreshCw size={14} className="animate-spin" />}
                    Save Bonus Settings
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-8 text-center text-slate-400 text-sm">Loading settings…</div>
            )}
          </div>

          {/* Fraud Protection Rules Panel */}
          <div className="card-surface rounded-2xl p-5 border border-white/5 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="text-amber-400 h-5 w-5" /> Bonus Fraud Protection
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every bonus evaluation runs strict backend security checks prior to crediting the user wallet:
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                <Smartphone className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-white">One device, one bonus</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Hardware and browser fingerprint checked against device ledger.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                <Mail className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-white">Verified Email Required</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Accounts must confirm valid email before bonus release.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                <AlertOctagon className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-white">Duplicate Account Detection</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Scans phone, IP subnet, alias (+), disposable domains, and full name clusters.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                <ShieldAlert className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-white">Mark Suspicious Accounts</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Flagged accounts have bonus withheld pending Admin triage.
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
              Suspicious activity does not lock normal buyer/seller browsing, but protects platform wallet reserves.
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: BONUS HISTORY */}
      {subTab === 'history' && (
        <div className="card-surface rounded-2xl p-5 border border-white/5 space-y-4" data-testid="bonus-history-view">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="text-emerald-400 h-5 w-5" /> Bonus History
              </h2>
              <p className="text-xs text-slate-400">
                Log of all signup bonus evaluations, dispatches, and fraud reviews.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user, email, device..."
                  data-testid="bonus-history-search"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadHistory()}
                  className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <select
                data-testid="bonus-history-filter"
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value)}
                className="bg-[#0a0f1e] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="credited">Credited</option>
                <option value="pending_review">Pending Review</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-xs" data-testid="bonus-history-table">
              <thead className="bg-white/5 text-slate-400 uppercase font-mono text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Device & IP</th>
                  <th className="p-3">Fraud Flags</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {historyList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-slate-500">
                      No bonus records found matching filters.
                    </td>
                  </tr>
                ) : (
                  historyList.map((row) => (
                    <tr key={row.id} className="hover:bg-white/5 transition-colors" data-testid={`bonus-row-${row.id}`}>
                      <td className="p-3">
                        <div className="font-semibold text-white">{row.fullName || row.username || 'User'}</div>
                        <div className="text-slate-400 font-mono text-[11px]">{row.userEmail}</div>
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-400">
                        ${Number(row.amount || 0).toFixed(2)}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                            STATUS_BADGES[row.status] || 'bg-slate-700 text-slate-300'
                          }`}
                          data-testid={`bonus-status-${row.id}`}
                        >
                          {row.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 font-mono text-[11px]">
                        <div>Dev: {row.deviceId ? row.deviceId.substring(0, 14) + '...' : '—'}</div>
                        <div>IP: {row.ipAddress || '—'}</div>
                      </td>
                      <td className="p-3 max-w-xs">
                        {row.suspiciousReasons && row.suspiciousReasons.length > 0 ? (
                          <div className="space-y-1">
                            {row.suspiciousReasons.map((r, i) => (
                              <div key={i} className="text-amber-400 text-[11px] flex items-center gap-1">
                                <AlertTriangle size={11} className="shrink-0" />
                                <span className="truncate">{r}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                            <CheckCircle2 size={12} /> Clean
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-400 text-[11px] whitespace-nowrap">
                        {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: USER BONUS STATUS */}
      {subTab === 'users' && (
        <div className="card-surface rounded-2xl p-5 border border-white/5 space-y-4" data-testid="bonus-user-status-view">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="text-emerald-400 h-5 w-5" /> User Bonus Status
              </h2>
              <p className="text-xs text-slate-400">
                Live inspection of all registered accounts, wallet balances, and bonus entitlements.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user by name, email..."
                  data-testid="bonus-user-search"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadUserStatus()}
                  className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <select
                data-testid="bonus-user-filter"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="bg-[#0a0f1e] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="all">All Users</option>
                <option value="credited">Bonus Credited</option>
                <option value="pending_review">Pending Review</option>
                <option value="suspicious">Suspicious Accounts</option>
                <option value="unclaimed">Unclaimed</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-xs" data-testid="bonus-user-status-table">
              <thead className="bg-white/5 text-slate-400 uppercase font-mono text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">User & Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Verifications</th>
                  <th className="p-3">Wallet Balance</th>
                  <th className="p-3">Bonus Status</th>
                  <th className="p-3">Account Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {userStatusList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-slate-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  userStatusList.map((u) => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors" data-testid={`user-row-${u.id}`}>
                      <td className="p-3">
                        <div className="font-semibold text-white">{u.fullName || u.username}</div>
                        <div className="text-slate-400 font-mono text-[11px]">{u.email}</div>
                      </td>
                      <td className="p-3">
                        <span className="capitalize px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px]">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] border ${
                              u.isEmailVerified
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-slate-800 border-slate-700 text-slate-500'
                            }`}
                          >
                            <Mail size={10} /> {u.isEmailVerified ? 'Email Verified' : 'Unverified'}
                          </span>
                          {u.phone && (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] border ${
                                u.isPhoneVerified
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                  : 'bg-slate-800 border-slate-700 text-slate-500'
                              }`}
                            >
                              <Smartphone size={10} /> {u.isPhoneVerified ? 'Phone Verified' : 'Phone Set'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 font-mono font-bold text-white">
                        ${Number(u.walletBalance || 0).toFixed(2)}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                            STATUS_BADGES[u.bonusStatus] || 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {u.bonusStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        {u.isSuspicious ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 border border-rose-500/30 text-rose-400">
                            <AlertTriangle size={11} /> Suspicious
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Normal</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: SUSPICIOUS USER LIST & TRIAGE */}
      {subTab === 'suspicious' && (
        <div className="card-surface rounded-2xl p-5 border border-white/5 space-y-4" data-testid="bonus-suspicious-list-view">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="text-rose-400 h-5 w-5" /> Suspicious User List & Triage
              </h2>
              <p className="text-xs text-slate-400">
                Accounts flagged by device reuse, duplicate attributes, or bot patterns. Review and approve or reject bonuses.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 border border-rose-500/30 text-rose-400">
              {suspiciousList.length} Flagged
            </span>
          </div>

          {suspiciousList.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-white/5 border border-white/10 space-y-2">
              <ShieldCheck className="mx-auto h-8 w-8 text-emerald-400" />
              <div className="text-sm font-bold text-white">No Suspicious Accounts Detected</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                All platform registrations are passing device fingerprinting and duplicate account checks.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {suspiciousList.map((user) => {
                const bonusRecord = user.bonusRecord;
                const bonusId = bonusRecord?.id;
                const isPending = bonusRecord?.status === 'pending_review';

                return (
                  <div
                    key={user.userId}
                    className="p-4 rounded-xl bg-slate-900/90 border border-rose-500/30 space-y-3"
                    data-testid={`suspicious-card-${user.userId}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">
                            {user.fullName || user.username || 'Suspicious User'}
                          </span>
                          <span className="font-mono text-xs text-slate-400">({user.email})</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold uppercase">
                            FLAGGED
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          User ID: <span className="font-mono">{user.userId}</span> | Wallet: ${Number(user.walletBalance || 0).toFixed(2)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded-md border ${user.isEmailVerified ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-slate-400 border-slate-700'}`}>
                          {user.isEmailVerified ? 'Email Verified' : 'Unverified Email'}
                        </span>
                        {bonusRecord && (
                          <span className="font-mono font-bold text-amber-400">
                            Hold: ${Number(bonusRecord.amount || 0).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Reasons list */}
                    <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1.5">
                      <div className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
                        Detected Fraud Triggers:
                      </div>
                      {(user.suspiciousReasons || []).length > 0 ? (
                        user.suspiciousReasons.map((r, i) => (
                          <div key={i} className="text-xs text-rose-300 flex items-start gap-1.5">
                            <AlertCircleIcon className="shrink-0 mt-0.5" />
                            <span>{r}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-amber-300">
                          {bonusRecord?.reviewNote || 'Flagged for security review.'}
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    {bonusRecord && (
                      <div className="text-[11px] font-mono text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                        <span>Device: {bonusRecord.deviceId || 'None'}</span>
                        <span>IP: {bonusRecord.ipAddress || 'None'}</span>
                        <span>Flagged At: {new Date(bonusRecord.createdAt).toLocaleString()}</span>
                      </div>
                    )}

                    {/* Action Controls */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/5">
                      <div className="text-[11px] text-slate-400">
                        Admin Action Required:
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {isPending && (
                          <>
                            <button
                              type="button"
                              data-testid={`approve-bonus-${user.userId}`}
                              onClick={() => handleReviewAction('approve', bonusId, user.userId)}
                              disabled={actionInProgress !== null}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-all flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <CheckCircle2 size={13} /> Approve Bonus
                            </button>

                            <button
                              type="button"
                              data-testid={`reject-bonus-${user.userId}`}
                              onClick={() => handleReviewAction('reject', bonusId, user.userId)}
                              disabled={actionInProgress !== null}
                              className="px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:bg-rose-500/30 font-bold text-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <XCircle size={13} /> Reject Bonus
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          data-testid={`clear-suspicious-${user.userId}`}
                          onClick={() => handleReviewAction('clear_suspicious', bonusId, user.userId)}
                          disabled={actionInProgress !== null}
                          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white text-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <UserX size={13} /> Clear Suspicion Flag
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AlertCircleIcon({ className }) {
  return (
    <svg className={`h-3.5 w-3.5 text-rose-400 ${className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
      <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
    </svg>
  );
}
