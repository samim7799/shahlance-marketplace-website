import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SmsMarketplaceHeader from './SmsMarketplaceHeader';
import SmsBottomNavigation from './SmsBottomNavigation';
import SmsHomeTab from './SmsHomeTab';
import SmsServicesTab from './SmsServicesTab';
import SmsOrdersTab from './SmsOrdersTab';
import SmsRentTab from './SmsRentTab';
import { INITIAL_ORDERS } from './smsMarketplaceData';
import { Plus, X, ArrowRight, ShieldCheck, Check } from 'lucide-react';

export default function SmsMarketplaceLayout() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'home';
  const showModalParam = searchParams.get('modal');

  const [walletBalance, setWalletBalance] = useState('42.50');
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [addFundsAmount, setAddFundsAmount] = useState('25');
  const [selectedNetwork, setSelectedNetwork] = useState('TRC20');
  const [depositSuccess, setDepositSuccess] = useState(false);

  const setActiveTab = (tabId) => {
    setSearchParams({ tab: tabId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (tabId) => {
    setActiveTab(tabId);
  };

  const handleNewOrder = (newOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    setWalletBalance((prev) => Math.max(0, parseFloat(prev) - newOrder.price).toFixed(2));
    setActiveTab('orders');
  };

  const handleConfirmDeposit = () => {
    setDepositSuccess(true);
    setTimeout(() => {
      setWalletBalance((prev) => (parseFloat(prev) + parseFloat(addFundsAmount || 0)).toFixed(2));
      setDepositSuccess(false);
      setSearchParams({ tab: currentTab });
    }, 700);
  };

  const isAddFundsOpen = showModalParam === 'add-funds';

  return (
    <div
      className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950"
      data-testid="sms-marketplace-page"
    >
      <div className="w-full max-w-md mx-auto min-h-screen bg-[#090d18] border-x border-white/5 flex flex-col relative shadow-2xl">
        <SmsMarketplaceHeader
          activeTab={currentTab}
          setActiveTab={setActiveTab}
          notificationsCount={3}
        />

        <main className="flex-1 px-4 pt-4 pb-28">
          {currentTab === 'home' && (
            <SmsHomeTab
              onNavigate={handleNavigate}
              walletBalance={walletBalance}
              onAddFunds={() => setSearchParams({ tab: 'home', modal: 'add-funds' })}
            />
          )}

          {currentTab === 'services' && (
            <SmsServicesTab
              onOrderCreated={handleNewOrder}
            />
          )}

          {currentTab === 'orders' && (
            <SmsOrdersTab
              orders={orders}
            />
          )}

          {currentTab === 'rent' && (
            <SmsRentTab
              onRentCreated={handleNewOrder}
            />
          )}
        </main>

        <SmsBottomNavigation
          activeTab={currentTab}
          setActiveTab={setActiveTab}
        />
      </div>

      {isAddFundsOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSearchParams({ tab: currentTab })}
          data-testid="add-funds-modal"
        >
          <div
            className="w-full max-w-sm bg-[#0c1322] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Top-up USDT Balance</h3>
                  <p className="text-[11px] text-slate-400">Zero commission crypto refill</p>
                </div>
              </div>
              <button
                type="button"
                data-testid="close-add-funds-btn"
                onClick={() => setSearchParams({ tab: currentTab })}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold">Select Network</label>
              <div className="grid grid-cols-3 gap-2">
                {['TRC20', 'Polygon', 'BEP20'].map((net) => (
                  <button
                    key={net}
                    type="button"
                    onClick={() => setSelectedNetwork(net)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedNetwork === net
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {net}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold">Deposit Amount</label>
              <div className="grid grid-cols-4 gap-1.5">
                {['10', '25', '50', '100'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAddFundsAmount(amt)}
                    className={`py-1.5 rounded-xl text-xs font-mono font-bold border ${
                      addFundsAmount === amt
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black'
                        : 'bg-white/5 border-white/10 text-slate-300'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
              <div className="relative mt-2">
                <input
                  type="number"
                  data-testid="deposit-amount-input"
                  value={addFundsAmount}
                  onChange={(e) => setAddFundsAmount(e.target.value)}
                  className="w-full bg-[#080d1a] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  placeholder="Custom amount..."
                />
                <span className="absolute right-3 top-2 text-xs font-mono text-emerald-400 font-bold">
                  USDT
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
              <span>Funds are credited instantly via smart escrow verification.</span>
            </div>

            <button
              type="button"
              data-testid="confirm-deposit-btn"
              disabled={depositSuccess || !addFundsAmount}
              onClick={handleConfirmDeposit}
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wide transition-all shadow-lg shadow-emerald-500/25 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {depositSuccess ? (
                <>
                  <Check size={16} strokeWidth={3} />
                  <span>Deposit Added!</span>
                </>
              ) : (
                <>
                  <span>Deposit ${addFundsAmount || 0} USDT ({selectedNetwork})</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
