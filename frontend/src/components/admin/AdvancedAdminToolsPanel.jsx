import React, { useState, useEffect } from 'react';
import {
  Globe, BarChart3, Shield, Image as ImageIcon, Plus, Edit2, Trash2, X, RefreshCw,
  CheckCircle2, TrendingUp, DollarSign, Users, Activity, Lock, Eye, EyeOff
} from 'lucide-react';
import { adminService } from '../../services/adminService';

export default function AdvancedAdminToolsPanel({ defaultSection = 'cms', toast }) {
  const [section, setSection] = useState(defaultSection); // 'cms' | 'reports' | 'security'
  const [loading, setLoading] = useState(false);

  // --- CMS State ---
  const [cmsSettings, setCmsSettings] = useState({
    logo: { url: '', enabled: true },
    banner: { url: '', enabled: true, heading: '', subheading: '' },
    homepageContent: { heroTitle: '', heroSubtitle: '', ctaText: '', featuredBadge: '' }
  });
  const [savingCms, setSavingCms] = useState(false);
  const [pages, setPages] = useState([]);
  const [pageModalOpen, setPageModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [pageTitle, setPageTitle] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [pageContent, setPageContent] = useState('');
  const [pageStatus, setPageStatus] = useState('published');

  // --- Reports State ---
  const [reportsData, setReportsData] = useState(null);

  // --- Security Tools State ---
  const [activityLogs, setActivityLogs] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [secSettings, setSecSettings] = useState({ twoFactorAuthEnabled: false });
  const [savingSec, setSavingSec] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cms, pgs, rep, act, lgn, sec] = await Promise.all([
        adminService.cms.getSettings().catch(() => null),
        adminService.cms.listPages().catch(() => []),
        adminService.reports.getDashboard().catch(() => null),
        adminService.security.getActivityLogs().catch(() => []),
        adminService.security.getLoginHistory().catch(() => []),
        adminService.security.getSettings().catch(() => ({ twoFactorAuthEnabled: false })),
      ]);
      if (cms) setCmsSettings(cms);
      setPages(pgs);
      if (rep) setReportsData(rep);
      setActivityLogs(act);
      setLoginHistory(lgn);
      if (sec) setSecSettings(sec);
    } catch {
      toast({ title: 'Failed to load admin tools data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- CMS Handlers ---
  const handleSaveCmsSettings = async (e) => {
    e?.preventDefault();
    try {
      setSavingCms(true);
      const updated = await adminService.cms.updateSettings(cmsSettings);
      setCmsSettings(updated);
      toast({ title: 'CMS settings saved successfully' });
      await loadData();
    } catch (err) {
      toast({ title: 'Failed to save CMS settings', description: err.message, variant: 'destructive' });
    } finally {
      setSavingCms(false);
    }
  };

  const handleSavePage = async (e) => {
    e?.preventDefault();
    if (!pageTitle.trim()) return;
    try {
      const payload = {
        title: pageTitle.trim(),
        slug: pageSlug.trim() || pageTitle.trim().toLowerCase().replace(/\s+/g, '-'),
        content: pageContent.trim(),
        status: pageStatus,
      };
      if (editingPage) {
        await adminService.cms.updatePage(editingPage.id, payload);
        toast({ title: 'Page updated' });
      } else {
        await adminService.cms.createPage(payload);
        toast({ title: 'Page created' });
      }
      setPageModalOpen(false);
      await loadData();
    } catch (err) {
      toast({ title: 'Page action failed', description: err.message, variant: 'destructive' });
    }
  };

  const handleDeletePage = async (pageId) => {
    if (!window.confirm('Delete this page?')) return;
    try {
      await adminService.cms.deletePage(pageId);
      toast({ title: 'Page deleted' });
      await loadData();
    } catch (err) {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
    }
  };

  // --- Security Handlers ---
  const handleToggle2FA = async () => {
    try {
      setSavingSec(true);
      const newStatus = !secSettings.twoFactorAuthEnabled;
      const res = await adminService.security.updateSettings({ twoFactorAuthEnabled: newStatus });
      setSecSettings(res);
      toast({ title: newStatus ? 'Two-Factor Authentication Enabled' : 'Two-Factor Authentication Disabled' });
      await loadData();
    } catch (err) {
      toast({ title: 'Failed to update 2FA setting', description: err.message, variant: 'destructive' });
    } finally {
      setSavingSec(false);
    }
  };

  return (
    <div className="p-5 space-y-6" data-testid="advanced-admin-tools-panel">
      {/* Top Section Nav: CMS | Reports | Security */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-testid="admin-tools-tab-cms"
            onClick={() => setSection('cms')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              section === 'cms'
                ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-lg shadow-emerald-500/20'
                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            <Globe size={14} /> 1. CMS Management
          </button>
          <button
            type="button"
            data-testid="admin-tools-tab-reports"
            onClick={() => setSection('reports')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              section === 'reports'
                ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-lg shadow-emerald-500/20'
                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            <BarChart3 size={14} /> 2. Reports Dashboard
          </button>
          <button
            type="button"
            data-testid="admin-tools-tab-security"
            onClick={() => setSection('security')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              section === 'security'
                ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-lg shadow-emerald-500/20'
                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            <Shield size={14} /> 3. Security Tools
          </button>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white"
          title="Refresh"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. CMS MANAGEMENT */}
      {/* ========================================================================= */}
      {section === 'cms' && (
        <div className="space-y-6" data-testid="cms-management-section">
          <form onSubmit={handleSaveCmsSettings} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Logo Settings */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3" data-testid="cms-logo-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-emerald-400" /> Platform Logo
                </span>
                <button
                  type="button"
                  data-testid="cms-logo-toggle"
                  onClick={() => setCmsSettings({
                    ...cmsSettings,
                    logo: { ...cmsSettings.logo, enabled: !cmsSettings.logo?.enabled }
                  })}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    cmsSettings.logo?.enabled ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-slate-700 text-slate-400 border-slate-600'
                  }`}
                >
                  {cmsSettings.logo?.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Logo URL (Upload / Replace)</label>
                <input
                  type="text"
                  data-testid="cms-logo-url-input"
                  value={cmsSettings.logo?.url || ''}
                  onChange={(e) => setCmsSettings({
                    ...cmsSettings,
                    logo: { ...cmsSettings.logo, url: e.target.value }
                  })}
                  placeholder="https://..."
                  className="w-full bg-[#0a0f1e] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>

              {cmsSettings.logo?.url && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] text-slate-500">Preview:</span>
                  <img src={cmsSettings.logo.url} alt="Logo" className="h-7 w-auto object-contain rounded" />
                </div>
              )}
            </div>

            {/* Banner Settings */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3" data-testid="cms-banner-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Globe size={14} className="text-sky-400" /> Hero Banner
                </span>
                <button
                  type="button"
                  data-testid="cms-banner-toggle"
                  onClick={() => setCmsSettings({
                    ...cmsSettings,
                    banner: { ...cmsSettings.banner, enabled: !cmsSettings.banner?.enabled }
                  })}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    cmsSettings.banner?.enabled ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-slate-700 text-slate-400 border-slate-600'
                  }`}
                >
                  {cmsSettings.banner?.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Banner Image URL (Upload / Replace)</label>
                <input
                  type="text"
                  data-testid="cms-banner-url-input"
                  value={cmsSettings.banner?.url || ''}
                  onChange={(e) => setCmsSettings({
                    ...cmsSettings,
                    banner: { ...cmsSettings.banner, url: e.target.value }
                  })}
                  placeholder="https://..."
                  className="w-full bg-[#0a0f1e] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Banner Heading</label>
                <input
                  type="text"
                  data-testid="cms-banner-heading-input"
                  value={cmsSettings.banner?.heading || ''}
                  onChange={(e) => setCmsSettings({
                    ...cmsSettings,
                    banner: { ...cmsSettings.banner, heading: e.target.value }
                  })}
                  className="w-full bg-[#0a0f1e] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Homepage Content Sections */}
            <div className="col-span-1 md:col-span-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3" data-testid="cms-homepage-card">
              <span className="text-xs font-bold text-white block">Homepage Content Sections</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Hero Title</label>
                  <input
                    type="text"
                    data-testid="cms-hero-title-input"
                    value={cmsSettings.homepageContent?.heroTitle || ''}
                    onChange={(e) => setCmsSettings({
                      ...cmsSettings,
                      homepageContent: { ...cmsSettings.homepageContent, heroTitle: e.target.value }
                    })}
                    className="w-full bg-[#0a0f1e] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Hero Subtitle</label>
                  <input
                    type="text"
                    data-testid="cms-hero-subtitle-input"
                    value={cmsSettings.homepageContent?.heroSubtitle || ''}
                    onChange={(e) => setCmsSettings({
                      ...cmsSettings,
                      homepageContent: { ...cmsSettings.homepageContent, heroSubtitle: e.target.value }
                    })}
                    className="w-full bg-[#0a0f1e] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  data-testid="save-cms-settings-btn"
                  disabled={savingCms}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-all disabled:opacity-50"
                >
                  {savingCms ? 'Saving...' : 'Save CMS Settings'}
                </button>
              </div>
            </div>
          </form>

          {/* CMS Pages Section */}
          <div className="space-y-3 pt-2" data-testid="cms-pages-section">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Custom Pages Management</h3>
                <p className="text-[11px] text-slate-400">Manage terms, privacy, FAQ, and platform policy pages</p>
              </div>
              <button
                type="button"
                data-testid="create-page-btn"
                onClick={() => {
                  setEditingPage(null);
                  setPageTitle('');
                  setPageSlug('');
                  setPageContent('');
                  setPageStatus('published');
                  setPageModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400"
              >
                <Plus size={13} /> Create Page
              </button>
            </div>

            <div className="overflow-auto rounded-xl border border-white/5">
              <table className="w-full text-xs" data-testid="cms-pages-table">
                <thead className="text-[10px] uppercase font-mono tracking-wider text-slate-400 bg-white/[0.03]">
                  <tr>
                    <th className="text-left py-3 px-4">Page Title</th>
                    <th className="text-left">Slug</th>
                    <th className="text-left">Status</th>
                    <th className="text-left">Updated</th>
                    <th className="text-right px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {pages.map((pg) => (
                    <tr key={pg.id} className="hover:bg-white/[0.02]" data-testid={`page-row-${pg.id}`}>
                      <td className="py-3 px-4 font-medium text-white">{pg.title}</td>
                      <td className="text-slate-400 font-mono">/{pg.slug}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          pg.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
                        }`}>
                          {pg.status}
                        </span>
                      </td>
                      <td className="text-slate-500">{new Date(pg.updatedAt || pg.createdAt).toLocaleDateString()}</td>
                      <td className="text-right px-4">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            data-testid={`edit-page-${pg.id}`}
                            onClick={() => {
                              setEditingPage(pg);
                              setPageTitle(pg.title);
                              setPageSlug(pg.slug);
                              setPageContent(pg.content);
                              setPageStatus(pg.status);
                              setPageModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-white/5 text-slate-300 hover:text-white"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            type="button"
                            data-testid={`delete-page-${pg.id}`}
                            onClick={() => handleDeletePage(pg.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. REPORTS DASHBOARD */}
      {/* ========================================================================= */}
      {section === 'reports' && (
        <div className="space-y-6" data-testid="reports-dashboard-section">
          {reportsData ? (
            <div className="space-y-5">
              {/* Top 4 Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* 1. Sales Report */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1" data-testid="rep-metric-sales">
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Total Sales</span>
                    <TrendingUp size={13} className="text-emerald-400" />
                  </div>
                  <div className="text-xl font-extrabold text-white">
                    ${Number(reportsData.salesReport?.totalSales || 0).toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Order Count: <strong className="text-slate-300">{reportsData.salesReport?.orderCount || 0}</strong> ({reportsData.salesReport?.paidOrderCount || 0} paid)
                  </div>
                </div>

                {/* 2. Profit Report */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1" data-testid="rep-metric-profit">
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Platform Profit</span>
                    <DollarSign size={13} className="text-sky-400" />
                  </div>
                  <div className="text-xl font-extrabold text-emerald-400">
                    ${Number(reportsData.profitReport?.platformProfit || 0).toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Commission Rate: <strong className="text-slate-300">{reportsData.profitReport?.commissionPercentage || 0}%</strong>
                  </div>
                </div>

                {/* 3. User Growth */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1" data-testid="rep-metric-users">
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Total Users</span>
                    <Users size={13} className="text-purple-400" />
                  </div>
                  <div className="text-xl font-extrabold text-white">
                    {reportsData.userGrowth?.totalUsers || 0}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    New Users (30d): <strong className="text-emerald-400">{reportsData.userGrowth?.newUsers || 0}</strong>
                  </div>
                </div>

                {/* 4. Order Statistics */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1" data-testid="rep-metric-stats">
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Order Statistics</span>
                    <Activity size={13} className="text-amber-400" />
                  </div>
                  <div className="text-xl font-extrabold text-white">
                    {reportsData.salesReport?.paidOrderCount || 0} Completed
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Pending: <strong className="text-amber-400">{reportsData.serviceAnalytics?.orderStatistics?.pending || 0}</strong>
                  </div>
                </div>
              </div>

              {/* Service Analytics: Category Usage Breakdown */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3" data-testid="service-analytics-card">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Service Analytics: Usage by Category</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(reportsData.serviceAnalytics?.serviceUsageCount || {}).map(([cat, cnt]) => (
                    <div key={cat} className="p-3 rounded-lg bg-black/40 border border-white/5">
                      <div className="text-xs text-slate-300 font-medium truncate">{cat}</div>
                      <div className="text-base font-bold text-white mt-0.5">{cnt} products</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 text-xs">Loading reports data...</div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SECURITY TOOLS */}
      {/* ========================================================================= */}
      {section === 'security' && (
        <div className="space-y-6" data-testid="security-tools-section">
          {/* Two Factor Authentication Setting */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between" data-testid="two-factor-auth-card">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Lock size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Two-Factor Authentication (Admin 2FA)</h4>
                <p className="text-xs text-slate-400">Require secondary OTP authorization on admin portal logins.</p>
              </div>
            </div>
            <button
              type="button"
              data-testid="toggle-2fa-btn"
              onClick={handleToggle2FA}
              disabled={savingSec}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                secSettings.twoFactorAuthEnabled
                  ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              {secSettings.twoFactorAuthEnabled ? '2FA: ENABLED' : '2FA: DISABLED'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Admin Activity Logs */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3" data-testid="admin-activity-logs-card">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Admin Action History</h4>
                <span className="text-[10px] text-slate-500 font-mono">{activityLogs.length} events</span>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {activityLogs.map((log) => (
                  <div key={log.id} className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-xs space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{log.action}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{new Date(log.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{log.details}</p>
                    <div className="text-[10px] text-slate-500 font-mono">
                      IP: {log.ipAddress || '127.0.0.1'} | Admin: {log.adminEmail}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Login History & IP Tracking */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3" data-testid="login-history-card">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Login History & IP Tracking</h4>
                <span className="text-[10px] text-slate-500 font-mono">{loginHistory.length} logins</span>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {loginHistory.map((lgn) => (
                  <div key={lgn.id} className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">{lgn.adminEmail}</div>
                      <div className="text-[10px] text-slate-400 font-mono">IP: {lgn.ipAddress}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[200px]">{lgn.userAgent}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                        {lgn.status || 'success'}
                      </span>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">
                        {new Date(lgn.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Modal */}
      {pageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" data-testid="page-modal">
          <div className="w-full max-w-lg card-surface rounded-2xl border border-white/10 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-sm font-bold text-white">{editingPage ? 'Edit Page' : 'Create Custom Page'}</h3>
              <button type="button" onClick={() => setPageModalOpen(false)} className="text-slate-400 hover:text-white"><X size={16} /></button>
            </div>
            <form onSubmit={handleSavePage} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Page Title *</label>
                <input
                  type="text"
                  required
                  data-testid="page-title-input"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1">Slug</label>
                <input
                  type="text"
                  data-testid="page-slug-input"
                  value={pageSlug}
                  onChange={(e) => setPageSlug(e.target.value)}
                  placeholder="terms-of-service"
                  className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1">Content</label>
                <textarea
                  rows={4}
                  data-testid="page-content-input"
                  value={pageContent}
                  onChange={(e) => setPageContent(e.target.value)}
                  className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1">Status (Publish/Unpublish)</label>
                <button
                  type="button"
                  data-testid="page-status-toggle"
                  onClick={() => setPageStatus(pageStatus === 'published' ? 'draft' : 'published')}
                  className={`w-full py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    pageStatus === 'published' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-slate-700 text-slate-400 border-slate-600'
                  }`}
                >
                  Status: {pageStatus.toUpperCase()}
                </button>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setPageModalOpen(false)} className="px-3 py-1.5 rounded-lg text-xs text-slate-400">Cancel</button>
                <button type="submit" data-testid="save-page-btn" className="px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs">Save Page</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
