import React from 'react';
import { Home, Grid, Clock, Radio } from 'lucide-react';

export default function SmsBottomNavigation({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home, testId: 'sms-nav-home' },
    { id: 'services', label: 'Services', icon: Grid, testId: 'sms-nav-services' },
    { id: 'orders', label: 'Orders', icon: Clock, testId: 'sms-nav-orders' },
    { id: 'rent', label: 'Rent', icon: Radio, testId: 'sms-nav-rent' },
  ];

  return (
    <nav
      className="sticky bottom-0 z-40 bg-[#090d18]/95 backdrop-blur-xl border-t border-white/10 px-4 py-2 mt-auto"
      data-testid="sms-bottom-navigation"
    >
      <div className="w-full grid grid-cols-4 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              data-testid={tab.testId}
              onClick={() => {
                setActiveTab(tab.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'text-emerald-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-colors ${
                  isActive ? 'bg-emerald-500/15' : 'bg-transparent'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
