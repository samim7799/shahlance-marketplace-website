import React, { useState } from 'react';
import { Radio, ShieldCheck, Check, Clock, ChevronRight, Zap } from 'lucide-react';
import { RENTAL_CARDS } from './smsMarketplaceData';

export default function SmsRentTab({ onRentCreated }) {
  const [selectedRental, setSelectedRental] = useState(RENTAL_CARDS[1]); // Default to Multiple OTP Rent
  const [renting, setRenting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleConfirmRent = (card) => {
    setSelectedRental(card);
    setRenting(true);
    setTimeout(() => {
      setRenting(false);
      setSuccessMessage(`Dedicated ${card.title} leased successfully for ${card.duration}!`);
      setTimeout(() => setSuccessMessage(''), 4000);
      if (onRentCreated) {
        onRentCreated({
          id: `RENT-${Math.floor(1000 + Math.random() * 9000)}`,
          service: `Rental (${card.duration})`,
          serviceCode: 'rent',
          country: 'United States',
          countryCode: 'US',
          flag: '🇺🇸',
          phone: `+1 (${Math.floor(200 + Math.random() * 700)}) 555-${Math.floor(1000 + Math.random() * 9000)}`,
          numberType: card.title,
          code: '819-302',
          price: card.price,
          status: 'active',
          expiresInSeconds: 3600 * 4,
          timestamp: 'Just now',
        });
      }
    }, 700);
  };

  return (
    <div className="space-y-4" data-testid="sms-rent-view">
      {/* Header Info */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#10142a] to-slate-900 border border-purple-500/20 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
          <Radio size={14} /> Long-Term Dedicated Rental
        </div>
        <h3 className="text-sm font-black text-white">Lease Private Phone Numbers</h3>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Keep private numbers dedicated to you for hours or months. Receive unlimited SMS codes from any application.
        </p>
      </div>

      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-bold flex items-center gap-2">
          <Check size={14} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* RENTAL SERVICE CARDS:
          - One Time OTP Rent
          - Multiple OTP Rent
          - Premium One Time Rent
          - Premium Multiple Rent */}
      <div className="space-y-3" data-testid="sms-rental-cards-list">
        {RENTAL_CARDS.map((card) => {
          const isSelected = selectedRental?.id === card.id;

          return (
            <div
              key={card.id}
              data-testid={`rental-card-${card.id}`}
              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                card.popular
                  ? 'bg-gradient-to-br from-[#0e172e] to-[#0a1224] border-sky-500/40 shadow-lg shadow-sky-500/10'
                  : 'bg-white/[0.03] border-white/10 hover:border-white/20'
              }`}
            >
              {/* Card Top */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-white">{card.title}</h4>
                    <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold border ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock size={11} className="text-sky-400" />
                      {card.duration}
                    </span>
                    <span>•</span>
                    <span className="text-slate-300">{card.carrier}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-black text-emerald-400 font-mono">
                    ${card.price.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">USDT</span>
                </div>
              </div>

              {/* Card Features */}
              <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-white/5 text-[11px] text-slate-300">
                {card.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <Check size={11} className="text-emerald-400 shrink-0" />
                    <span className="truncate">{feat}</span>
                  </div>
                ))}
              </div>

              {/* Lease Action Button */}
              <div className="pt-1">
                <button
                  type="button"
                  data-testid={`rent-button-${card.id}`}
                  disabled={renting}
                  onClick={() => handleConfirmRent(card)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                    card.popular
                      ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/20'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                  } active:scale-95 disabled:opacity-50`}
                >
                  <Radio size={13} />
                  <span>{renting && selectedRental?.id === card.id ? 'Allocating Dedicated SIM...' : `Rent for ${card.duration} ($${card.price.toFixed(2)})`}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
