import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Globe, ChevronRight, Check, Sparkles, Filter, X } from 'lucide-react';
import { MOCK_SERVICES, MOCK_COUNTRIES, NUMBER_TYPES } from './smsMarketplaceData';

export default function SmsServicesTab({ onSelectService, onOrderCreated }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const serviceQueryParam = searchParams.get('service');
  const numberTypeParam = searchParams.get('numberType');

  const [searchService, setSearchService] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [searchCountry, setSearchCountry] = useState('');
  const [showCountryModal, setShowCountryModal] = useState(false);

  // Modal for Number Type Selection when a service is selected
  const [activeServiceForOrder, setActiveServiceForOrder] = useState(null);
  const [selectedNumberType, setSelectedNumberType] = useState(NUMBER_TYPES[0]);
  const [orderConfirming, setOrderConfirming] = useState(false);

  // Sync with service query param if provided
  useEffect(() => {
    if (serviceQueryParam) {
      const match = MOCK_SERVICES.find((s) => s.code === serviceQueryParam);
      if (match) {
        setActiveServiceForOrder(match);
      }
    }
  }, [serviceQueryParam]);

  // Filtered countries for the country picker modal
  const filteredCountries = useMemo(() => {
    return MOCK_COUNTRIES.filter((c) =>
      c.name.toLowerCase().includes(searchCountry.toLowerCase()) ||
      c.code.toLowerCase().includes(searchCountry.toLowerCase())
    );
  }, [searchCountry]);

  // Filtered services
  const filteredServices = useMemo(() => {
    return MOCK_SERVICES.filter((s) => {
      const matchName = s.name.toLowerCase().includes(searchService.toLowerCase()) ||
                        s.code.toLowerCase().includes(searchService.toLowerCase());
      const matchCountry = selectedCountry === 'ALL' || s.countryCode === selectedCountry;
      return matchName && matchCountry;
    });
  }, [searchService, selectedCountry]);

  // Handle service select button
  const handleOpenNumberTypeSelection = (service) => {
    setActiveServiceForOrder(service);
    setSelectedNumberType(NUMBER_TYPES[0]);
    setSearchParams({ tab: 'services', service: service.code });
  };

  const handleCloseNumberTypeModal = () => {
    setActiveServiceForOrder(null);
    setSearchParams({ tab: 'services' });
  };

  // Confirm order (UI mock only)
  const handleConfirmOrder = () => {
    if (!activeServiceForOrder) return;
    setOrderConfirming(true);
    setTimeout(() => {
      const newOrder = {
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        service: activeServiceForOrder.name,
        serviceCode: activeServiceForOrder.code,
        country: activeServiceForOrder.country,
        countryCode: activeServiceForOrder.countryCode,
        flag: activeServiceForOrder.flag,
        phone: `+1 (${Math.floor(200 + Math.random() * 700)}) 555-${Math.floor(1000 + Math.random() * 9000)}`,
        numberType: selectedNumberType.title,
        code: `${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`,
        price: parseFloat((activeServiceForOrder.lowestPrice * selectedNumberType.priceMultiplier).toFixed(2)),
        status: 'active',
        expiresInSeconds: 1200,
        timestamp: 'Just now',
      };
      setOrderConfirming(false);
      setActiveServiceForOrder(null);
      if (onOrderCreated) {
        onOrderCreated(newOrder);
      }
    }, 600);
  };

  const currentCountryObj = MOCK_COUNTRIES.find((c) => c.code === selectedCountry) || MOCK_COUNTRIES[0];

  return (
    <div className="space-y-4" data-testid="sms-services-view">
      {/* 1. Search Service Bar & Search Country Bar */}
      <div className="space-y-2.5">
        {/* Search Service input */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            data-testid="search-service-input"
            value={searchService}
            onChange={(e) => setSearchService(e.target.value)}
            placeholder="Search Service (e.g. Telegram, WhatsApp, OpenAI)..."
            className="w-full bg-[#0d1426] border border-white/10 rounded-2xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
          />
          {searchService && (
            <button
              type="button"
              onClick={() => setSearchService('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Search Country bar / Trigger */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-testid="search-country-bar"
            onClick={() => setShowCountryModal(true)}
            className="flex-1 flex items-center justify-between bg-[#0d1426] border border-white/10 hover:border-white/20 rounded-2xl px-3.5 py-2 text-xs text-slate-200 transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{currentCountryObj.flag}</span>
              <span className="font-semibold text-white truncate max-w-[190px]">
                {currentCountryObj.name}
              </span>
            </div>
            <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-0.5">
              Change Country
              <ChevronRight size={13} />
            </span>
          </button>

          {selectedCountry !== 'ALL' && (
            <button
              type="button"
              data-testid="reset-country-filter-btn"
              onClick={() => setSelectedCountry('ALL')}
              className="px-2.5 py-2 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-300 hover:text-white"
              title="Reset country filter"
            >
              All
            </button>
          )}
        </div>
      </div>

      {/* Services List Count info */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
        <span>Available Services ({filteredServices.length})</span>
        <span className="text-emerald-400 font-medium">Auto-renew & Instant Refund</span>
      </div>

      {/* 2. Service Cards containing:
          - Service logo
          - Service name
          - Lowest price
          - Country
          - Select button */}
      <div className="space-y-2.5" data-testid="sms-services-list">
        {filteredServices.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <Globe className="mx-auto h-8 w-8 text-slate-500" />
            <p className="text-xs text-slate-400">No services found matching filters.</p>
            <button
              type="button"
              onClick={() => { setSearchService(''); setSelectedCountry('ALL'); }}
              className="text-xs text-emerald-400 font-semibold"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          filteredServices.map((service) => (
            <div
              key={service.id}
              className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 hover:border-emerald-500/30 transition-all flex items-center justify-between gap-3 shadow-sm"
              data-testid={`service-card-${service.code}`}
            >
              {/* Service Logo & Name & Country */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={service.icon}
                    alt={service.name}
                    className="h-11 w-11 rounded-2xl object-cover border border-white/10 shadow"
                    loading="lazy"
                  />
                  <span className="absolute -bottom-1 -right-1 text-xs">
                    {service.flag}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="font-bold text-sm text-white truncate" data-testid={`service-name-${service.code}`}>
                    {service.name}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span className="truncate" data-testid={`service-country-${service.code}`}>
                      {service.country}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-400 font-medium">{service.successRate}</span>
                  </div>
                </div>
              </div>

              {/* Lowest Price & Select button */}
              <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                <div>
                  <div className="text-[10px] text-slate-400 font-mono">Lowest Price</div>
                  <div
                    className="text-sm font-extrabold text-emerald-400 font-mono"
                    data-testid={`service-price-${service.code}`}
                  >
                    ${service.lowestPrice.toFixed(2)}
                  </div>
                </div>

                <button
                  type="button"
                  data-testid={`select-service-btn-${service.code}`}
                  onClick={() => handleOpenNumberTypeSelection(service)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow shadow-emerald-500/20 active:scale-95"
                >
                  Select
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ========================================================================= */}
      {/* NUMBER TYPE UI MODAL (When service is selected)
          Selection cards:
          - One Time OTP
          - Multiple OTP
          - Premium One Time OTP
          - Premium Multiple OTP */}
      {/* ========================================================================= */}
      {activeServiceForOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={handleCloseNumberTypeModal}
          data-testid="number-type-selection-modal"
        >
          <div
            className="w-full max-w-md bg-[#0c1322] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2.5">
                <img
                  src={activeServiceForOrder.icon}
                  alt={activeServiceForOrder.name}
                  className="h-9 w-9 rounded-xl object-cover border border-white/10"
                />
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    {activeServiceForOrder.name}
                    <span className="text-sm">{activeServiceForOrder.flag}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Select Number Type to continue</p>
                </div>
              </div>
              <button
                type="button"
                data-testid="close-number-type-modal-btn"
                onClick={handleCloseNumberTypeModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Selection cards list */}
            <div className="space-y-2.5" data-testid="number-type-cards-list">
              {NUMBER_TYPES.map((type) => {
                const isSelected = selectedNumberType.id === type.id;
                const computedPrice = (activeServiceForOrder.lowestPrice * type.priceMultiplier).toFixed(2);

                return (
                  <div
                    key={type.id}
                    data-testid={`number-type-card-${type.id}`}
                    onClick={() => setSelectedNumberType(type)}
                    className={`cursor-pointer p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                        : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{type.title}</span>
                        <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold border ${type.badgeColor}`}>
                          {type.badge}
                        </span>
                      </div>
                      <div className="text-right font-mono font-bold text-sm text-emerald-400">
                        ${computedPrice}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {type.description}
                    </p>

                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 pt-2 border-t border-white/5 text-[10px] text-slate-400">
                      {type.features.map((feat, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <Check size={10} className="text-emerald-400" />
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Checkout Action Button */}
            <div className="pt-2 border-t border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Price (USDT):</span>
                <span className="text-base font-extrabold text-white font-mono">
                  ${(activeServiceForOrder.lowestPrice * selectedNumberType.priceMultiplier).toFixed(2)} USDT
                </span>
              </div>

              <button
                type="button"
                data-testid="confirm-buy-number-btn"
                disabled={orderConfirming}
                onClick={handleConfirmOrder}
                className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wide transition-all shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50"
              >
                {orderConfirming ? 'Provisioning Carrier Line...' : `Confirm & Get ${selectedNumberType.title}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Country Selection Modal */}
      {showCountryModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowCountryModal(false)}
          data-testid="country-selection-modal"
        >
          <div
            className="w-full max-w-sm bg-[#0c1322] border border-white/10 rounded-2xl p-5 space-y-3 max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="font-bold text-sm text-white">Select Country</h3>
              <button
                type="button"
                onClick={() => setShowCountryModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                data-testid="search-country-input"
                value={searchCountry}
                onChange={(e) => setSearchCountry(e.target.value)}
                placeholder="Search country..."
                className="w-full bg-[#080d1a] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 divide-y divide-white/5 pr-1">
              {filteredCountries.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  data-testid={`country-option-${c.code}`}
                  onClick={() => {
                    setSelectedCountry(c.code);
                    setShowCountryModal(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                    selectedCountry === c.code
                      ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{c.flag}</span>
                    <span>{c.name}</span>
                  </span>
                  {selectedCountry === c.code && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
