import React, { useState } from 'react';
import {
  Wallet, Plus, ArrowUpRight, ShieldCheck, Zap, Bookmark,
  Radio, Clock, Smartphone, ChevronRight, Copy, Check, Sparkles
} from 'lucide-react';

export default function SmsHomeTab({ onNavigate, walletBalance = '42.50', onAddFunds }) {
  const [copiedPromo, setCopiedPromo] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText('SHAHSMS20');
    setCopiedPromo(true);
    setTimeout(() => setCopiedPromo(false), 2000);
  };

  return (
    <div className="space-y-4" data-testid="sms-home-view">
      {/* 1. USDT Wallet Balance Card (UI only) */}
      <div
        className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-[#0e1628] via-[#111e38] to-[#0d1627] border border-white/10 shadow-2xl transition-all"
        data-testid="usdt-wallet-balance-card"
      >
        {/* Decorative backdrop glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Wallet size={15} />
              </div>
              <span className="text-xs font-semibold text-slate-300 tracking-wide uppercase font-mono">
                USDT Wallet Balance
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Instant Escrow
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black tracking-tight text-white font-mono" data-testid="usdt-balance-amount">
                  {walletBalance}
                </span>
                <span className="text-sm font-bold text-emerald-400 font-mono">USDT</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">≈ ${(parseFloat(walletBalance) * 1.0).toFixed(2)} USD available</p>
            </div>

            {/* Add Funds button (UI only) */}
            <button
              type="button"
              data-testid="add-funds-btn"
              onClick={onAddFunds}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/25 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 cursor-pointer"
            >
              <Plus size={15} strokeWidth={3} />
              <span>Add Funds</span>
            </button>
          </div>

          {/* Quick stats ribbon */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5 text-[11px]">
            <div>
              <span className="text-slate-400 block text-[10px]">Avg Speed</span>
              <span className="text-slate-200 font-semibold font-mono">3.2 Sec</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Carrier Rate</span>
              <span className="text-emerald-400 font-semibold font-mono">99.4%</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Refund</span>
              <span className="text-slate-200 font-semibold">Automatic</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Quick Action Buttons:
          - Buy Number
          - Saved Services
          - Rent Numbers
          - My Orders */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono px-1">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-3" data-testid="sms-quick-actions-grid">
          {/* Buy Number */}
          <button
            type="button"
            data-testid="quick-action-buy-number"
            onClick={() => onNavigate('services')}
            className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-emerald-500/40 transition-all text-left group active:scale-[0.98] shadow-sm flex flex-col justify-between h-28 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Smartphone size={20} />
              </div>
              <ArrowUpRight size={16} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </div>
            <div>
              <div className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">
                Buy Number
              </div>
              <p className="text-[11px] text-slate-400">Instant OTP from $0.35</p>
            </div>
          </button>

          {/* Saved Services */}
          <button
            type="button"
            data-testid="quick-action-saved-services"
            onClick={() => onNavigate('services')}
            className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-sky-500/40 transition-all text-left group active:scale-[0.98] shadow-sm flex flex-col justify-between h-28 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Bookmark size={20} />
              </div>
              <ArrowUpRight size={16} className="text-slate-500 group-hover:text-sky-400 transition-colors" />
            </div>
            <div>
              <div className="font-bold text-sm text-white group-hover:text-sky-400 transition-colors">
                Saved Services
              </div>
              <p className="text-[11px] text-slate-400">Telegram, WA, Google</p>
            </div>
          </button>

          {/* Rent Numbers */}
          <button
            type="button"
            data-testid="quick-action-rent-numbers"
            onClick={() => onNavigate('rent')}
            className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-purple-500/40 transition-all text-left group active:scale-[0.98] shadow-sm flex flex-col justify-between h-28 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Radio size={20} />
              </div>
              <ArrowUpRight size={16} className="text-slate-500 group-hover:text-purple-400 transition-colors" />
            </div>
            <div>
              <div className="font-bold text-sm text-white group-hover:text-purple-400 transition-colors">
                Rent Numbers
              </div>
              <p className="text-[11px] text-slate-400">4 Hours to 30 Days</p>
            </div>
          </button>

          {/* My Orders */}
          <button
            type="button"
            data-testid="quick-action-my-orders"
            onClick={() => onNavigate('orders')}
            className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-amber-500/40 transition-all text-left group active:scale-[0.98] shadow-sm flex flex-col justify-between h-28 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock size={20} />
              </div>
              <ArrowUpRight size={16} className="text-slate-500 group-hover:text-amber-400 transition-colors" />
            </div>
            <div>
              <div className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                My Orders
              </div>
              <p className="text-[11px] text-slate-400">Active OTP codes & log</p>
            </div>
          </button>
        </div>
      </div>

      {/* Featured Service Spotlight Bar */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-emerald-400" />
            <span className="text-xs font-bold text-white">Popular Carrier Pools Today</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('services')}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-0.5 cursor-pointer"
          >
            <span>View all</span>
            <ChevronRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { name: 'Telegram', price: '$0.45', code: 'tg', flag: '🇺🇸' },
            { name: 'WhatsApp', price: '$0.65', code: 'wa', flag: '🇬🇧' },
            { name: 'OpenAI', price: '$0.35', code: 'oa', flag: '🇳🇱' },
          ].map((item) => (
            <button
              key={item.code}
              type="button"
              data-testid={`spotlight-service-${item.code}`}
              onClick={() => onNavigate('services')}
              className="p-2.5 rounded-xl bg-black/40 border border-white/5 hover:border-emerald-500/30 text-left transition-all cursor-pointer hover:bg-black/60"
            >
              <div className="text-base">{item.flag}</div>
              <div className="font-bold text-xs text-white truncate mt-1">{item.name}</div>
              <div className="text-[11px] font-mono text-emerald-400 font-semibold">{item.price}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Small Professional Promotional Banner above the footer */}
      <div
        className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-r from-emerald-950/60 via-[#0d2218] to-slate-900 border border-emerald-500/25 shadow-lg"
        data-testid="sms-promotional-banner"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles size={11} /> Limited Promo
            </div>
            <h4 className="text-sm font-black text-white tracking-tight">
              Get +15% Extra on USDT Deposits
            </h4>
            <p className="text-[11px] text-slate-300 leading-snug">
              Use code <strong className="text-emerald-400 font-mono">SHAHSMS20</strong> on your first crypto refill today.
            </p>
          </div>

          <button
            type="button"
            data-testid="copy-promo-code-btn"
            onClick={handleCopyCode}
            className="shrink-0 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors inline-flex items-center gap-1 cursor-pointer active:scale-95 shadow-md shadow-emerald-500/20"
          >
            {copiedPromo ? <Check size={13} strokeWidth={3} /> : <Copy size={13} />}
            <span>{copiedPromo ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
