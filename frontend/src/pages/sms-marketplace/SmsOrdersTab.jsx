import React, { useState } from 'react';
import { Clock, CheckCircle2, XCircle, Copy, Check, RefreshCw, Smartphone, AlertCircle, ShieldCheck } from 'lucide-react';

export default function SmsOrdersTab({ orders = [] }) {
  const [activeStatusTab, setActiveStatusTab] = useState('active'); // active | completed | cancelled
  const [copiedId, setCopiedId] = useState(null);

  const statusTabs = [
    { id: 'active', label: 'Active', badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { id: 'completed', label: 'Completed', badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
    { id: 'cancelled', label: 'Cancelled', badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  ];

  const filteredOrders = orders.filter((o) => o.status === activeStatusTab);

  const handleCopy = (text, id) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4" data-testid="sms-orders-view">
      {/* 1. Order Status Tabs:
          - Active
          - Completed
          - Cancelled */}
      <div
        className="grid grid-cols-3 gap-1 bg-[#0d1426] p-1.5 rounded-2xl border border-white/5"
        data-testid="sms-order-status-tabs"
      >
        {statusTabs.map((tab) => {
          const isActive = activeStatusTab === tab.id;
          const count = orders.filter((o) => o.status === tab.id).length;
          return (
            <button
              key={tab.id}
              type="button"
              data-testid={`sms-order-tab-${tab.id}`}
              onClick={() => setActiveStatusTab(tab.id)}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${isActive ? 'bg-black/20 text-slate-950 font-black' : 'bg-white/5 text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Sample Order Cards using mock data */}
      <div className="space-y-3" data-testid="sms-orders-list">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <Clock className="mx-auto h-8 w-8 text-slate-500" />
            <p className="text-xs text-slate-400 font-medium">
              No {activeStatusTab} orders found.
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isCopied = copiedId === order.id;

            return (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-[#0d1426] border border-white/10 hover:border-white/15 transition-all space-y-3 shadow-md"
                data-testid={`order-card-${order.id}`}
              >
                {/* Top: Service name, Number Type & Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{order.flag}</span>
                    <div>
                      <div className="font-bold text-xs text-white flex items-center gap-1.5">
                        {order.service}
                        <span className="text-[10px] text-slate-400 font-normal">({order.numberType})</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {order.id} • {order.timestamp}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      order.status === 'active'
                        ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                        : order.status === 'completed'
                        ? 'bg-sky-500/20 border-sky-500/30 text-sky-400'
                        : 'bg-rose-500/20 border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Middle: Phone number & Copy button */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      Assigned Number
                    </span>
                    <span className="font-mono font-bold text-sm text-white tracking-wide">
                      {order.phone}
                    </span>
                  </div>

                  <button
                    type="button"
                    data-testid={`copy-phone-btn-${order.id}`}
                    onClick={() => handleCopy(order.phone, order.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white border border-white/10 flex items-center gap-1 transition-colors cursor-pointer active:scale-95"
                  >
                    {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Bottom: OTP Code box & countdown / price */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">SMS Verification Code:</span>
                    {order.status === 'active' ? (
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-lg font-black font-mono tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {order.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(order.code, `code-${order.id}`)}
                          className="text-slate-400 hover:text-white p-1 cursor-pointer"
                          title="Copy Code"
                        >
                          {copiedId === `code-${order.id}` ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-mono font-semibold text-slate-300">
                        {order.code}
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-mono">Price Paid:</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      ${order.price.toFixed(2)} USDT
                    </span>
                  </div>
                </div>

                {order.status === 'active' && (
                  <div className="flex items-center justify-between text-[10px] text-slate-400 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Listening for carrier SMS...
                    </span>
                    <span className="font-mono text-slate-300">Auto-expires in 14m</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
