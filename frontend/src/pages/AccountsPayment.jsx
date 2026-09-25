import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import * as Icons from 'lucide-react';
import {
  ArrowLeft, ShieldCheck, QrCode, Copy, Upload, CheckCircle2, Wallet, Coins,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import { PAYMENT_METHODS, PAYMENT_DETAILS, getAccountListing } from '../mock/accountsData';

const SUCCESS_MESSAGE = `Thank you for your payment to ShahLance.
Your payment has been submitted successfully. Transaction is currently under verification.
Our team will verify your transaction and update your order shortly.
Thank you for trust & Business With Us.
ShahLance — A Most Complete Trusted Marketplace for Digital Assets ⭐`;

export default function AccountsPayment() {
  const [sp] = useSearchParams();
  const { toast } = useToast();
  const item = useMemo(() => getAccountListing(sp.get('item')) , [sp]);

  const [method, setMethod] = useState(null); // {id, name, group}
  const [txId, setTxId] = useState('');
  const [fileName, setFileName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const details = method ? PAYMENT_DETAILS[method.id] : null;

  const copy = (val) => {
    navigator.clipboard?.writeText(val);
    toast({ title: 'Copied', description: 'Payment detail copied to clipboard.' });
  };

  const submit = (e) => {
    e.preventDefault();
    if (!txId.trim()) {
      toast({ title: 'Transaction ID required', description: 'Please enter your transaction ID before submitting.' });
      return;
    }
    setSubmitted(true);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (submitted) {
    return (
      <div>
        <Header />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="card-surface rounded-3xl p-6 sm:p-10 text-center" role="status">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 size={34} aria-hidden="true" />
            </div>
            <h1 className="mt-5 text-xl sm:text-2xl font-bold text-white">Payment submitted</h1>
            <p className="mt-4 text-sm sm:text-[15px] text-slate-300 leading-relaxed whitespace-pre-line">{SUCCESS_MESSAGE}</p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/accounts" className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold px-6 py-2.5 text-sm btn-hover">Continue browsing</Link>
              <Link to="/my-account" className="rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 font-semibold px-6 py-2.5 text-sm btn-hover">My account</Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Link to={item ? `/accounts/${item.id}` : '/accounts'} className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-white btn-hover rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70">
          <ArrowLeft size={15} aria-hidden="true" /> Back
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-white">Checkout — choose payment</h1>
        <p className="text-sm text-slate-400 mt-1 inline-flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-400" aria-hidden="true" /> Escrow protected · payment held until you confirm delivery</p>

        {/* Order summary */}
        {item && (
          <div className="mt-5 card-surface rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wider text-slate-500">Order</div>
              <div className="text-sm font-semibold text-white truncate">{item.title}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[11px] text-slate-500">{item.priceLabel}</div>
              <div className="text-lg font-extrabold text-white">{item.price === 0 ? 'Custom' : `$${item.price.toFixed(2)}`}</div>
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          {/* Method selection */}
          <div>
            <PaymentGroup title="Crypto" Icon={Coins} methods={PAYMENT_METHODS.crypto} group="crypto" active={method} onPick={setMethod} />
            <div className="mt-5">
              <PaymentGroup title="Manual / Fiat" Icon={Wallet} methods={PAYMENT_METHODS.fiat} group="fiat" active={method} onPick={setMethod} />
            </div>
          </div>

          {/* Manual payment flow */}
          <div>
            {!method ? (
              <div className="card-surface rounded-2xl p-8 text-center text-sm text-slate-400 h-full flex flex-col items-center justify-center">
                <QrCode size={30} className="text-slate-500" aria-hidden="true" />
                <p className="mt-3">Select a payment method to see the payment details and complete your order.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="card-surface rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white">Pay with {method.name}</h2>
                  {method.note && <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">{method.note}</span>}
                </div>

                {/* QR area */}
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex items-center gap-4">
                  <div className="h-24 w-24 shrink-0 rounded-lg bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center text-slate-500">
                    <QrCode size={30} aria-hidden="true" />
                    <span className="text-[9px] mt-1">QR code</span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-slate-500">{details?.label || 'Payment address'}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="text-xs text-slate-200 break-all">{details?.value}</code>
                      <button type="button" onClick={() => copy(details?.value)} aria-label="Copy payment detail" className="shrink-0 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 p-1.5 text-slate-300 btn-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70">
                        <Copy size={13} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">Send the exact amount, then upload your payment screenshot and enter the transaction ID below.</p>

                {/* Upload screenshot */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Payment screenshot</label>
                  <label className="flex items-center gap-2 rounded-lg border border-dashed border-white/15 bg-white/[0.03] px-3 py-3 cursor-pointer hover:bg-white/[0.05] btn-hover">
                    <Upload size={15} className="text-emerald-400" aria-hidden="true" />
                    <span className="text-xs text-slate-300 truncate">{fileName || 'Tap to upload screenshot (PNG/JPG)'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name || '')} />
                  </label>
                </div>

                {/* Transaction ID */}
                <div>
                  <label htmlFor="tx-id" className="block text-xs font-medium text-slate-300 mb-1.5">Transaction ID</label>
                  <input
                    id="tx-id"
                    value={txId}
                    onChange={(e) => setTxId(e.target.value)}
                    placeholder="Enter your transaction / reference ID"
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-3 h-11 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
                  />
                </div>

                <Button type="submit" className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-base btn-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300">
                  Submit payment
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function PaymentGroup({ title, Icon, methods, group, active, onPick }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-white flex items-center gap-2"><Icon size={15} className="text-emerald-400" aria-hidden="true" /> {title}</h3>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {methods.map((m) => {
          const MIcon = Icons[m.icon] || Icons.CreditCard;
          const selected = active?.id === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onPick({ ...m, group })}
              aria-pressed={selected}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left btn-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 ${
                selected ? 'border-emerald-500/60 bg-emerald-500/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
              }`}
            >
              <MIcon size={16} className={selected ? 'text-emerald-400' : 'text-slate-400'} aria-hidden="true" />
              <span className="text-xs font-medium text-slate-200 truncate">{m.name}</span>
              {m.note && <span className="ml-auto text-[9px] text-emerald-400 shrink-0">{m.note}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
