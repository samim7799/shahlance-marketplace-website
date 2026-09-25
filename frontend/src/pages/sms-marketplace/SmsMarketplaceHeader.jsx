import React, { useState } from 'react';
import { Bell, Menu, X, Shield, ExternalLink, HelpCircle, Smartphone, Wallet, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SmsMarketplaceHeader({ activeTab, setActiveTab, notificationsCount = 3 }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  return (
    <>
      <header
        className="sticky top-0 z-40 bg-[#090d18]/90 backdrop-blur-md border-b border-white/5 px-4 py-3"
        data-testid="sms-top-nav"
      >
        <div className="max-w-md mx-auto flex items-center justify-between">
          {/* Brand/Logo Area */}
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <Smartphone size={18} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white">ShahSMS</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  FAST
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">SMS Verification Marketplace</p>
            </div>
          </div>

          {/* Top Right: Notification icon & Three-line menu icon (Profile button removed) */}
          <div className="flex items-center gap-2">
            {/* Notification Icon */}
            <button
              type="button"
              data-testid="sms-notification-icon"
              onClick={() => setShowNotificationModal(true)}
              className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
              aria-label="SMS Notifications"
            >
              <Bell size={18} />
              {notificationsCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#090d18] animate-pulse" />
              )}
            </button>

            {/* Three-line menu icon */}
            <button
              type="button"
              data-testid="sms-menu-icon"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
              aria-label="Menu"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Drawer Dropdown from Three-Line Menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end"
          onClick={() => setMenuOpen(false)}
          data-testid="sms-menu-drawer"
        >
          <div
            className="w-72 bg-[#0c1222] border-l border-white/10 h-full p-5 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <Shield size={16} />
                  </div>
                  <span className="font-bold text-sm text-white">SMS Hub Menu</span>
                </div>
                <button
                  type="button"
                  data-testid="sms-menu-close-btn"
                  onClick={() => setMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation links inside menu */}
              <div className="space-y-1">
                {[
                  { id: 'home', label: 'Home Dashboard' },
                  { id: 'services', label: 'Browse Services' },
                  { id: 'orders', label: 'My SMS Orders' },
                  { id: 'rent', label: 'Rent Phone Numbers' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    data-testid={`sms-drawer-nav-${item.id}`}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === item.id
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* System status & fast info */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Routes Status</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> 100% Online
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Carrier Response</span>
                  <span className="text-slate-200 font-mono">~4.8s Avg</span>
                </div>
              </div>
            </div>

            {/* Back to marketplace link */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <Link
                to="/marketplace"
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 text-slate-300 hover:text-white text-xs border border-white/10 transition-colors"
                data-testid="sms-back-to-main-link"
              >
                <span>Return to Main Marketplace</span>
                <ExternalLink size={12} />
              </Link>
              <p className="text-[10px] text-center text-slate-500">ShahLance Secure SMS Hub v2.6</p>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotificationModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowNotificationModal(false)}
          data-testid="sms-notifications-modal"
        >
          <div
            className="w-full max-w-sm bg-[#0d1426] border border-white/10 rounded-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-emerald-400" />
                <h3 className="font-bold text-sm text-white">SMS System Alerts</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNotificationModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-slate-300 space-y-1">
                <div className="font-bold text-emerald-400">Telegram US Carrier Pool Replenished</div>
                <div className="text-[11px] text-slate-400">Over 2,400 fresh physical SIM numbers added at $0.45.</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 space-y-1">
                <div className="font-bold text-white">Instant Auto-Refund Active</div>
                <div className="text-[11px] text-slate-400">Any code not received within 20 minutes is refunded to USDT wallet automatically.</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 space-y-1">
                <div className="font-bold text-white">USDT TRC20 & Polygon Ready</div>
                <div className="text-[11px] text-slate-400">Add funds with zero platform commission.</div>
              </div>
            </div>

            <button
              type="button"
              data-testid="sms-close-notif-btn"
              onClick={() => setShowNotificationModal(false)}
              className="w-full py-2 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/20 transition-colors"
            >
              Close Alerts
            </button>
          </div>
        </div>
      )}
    </>
  );
}
