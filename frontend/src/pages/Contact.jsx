import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import {
  Mail, MessageCircle, Send, User, Phone, MapPin, Clock, ShieldCheck,
  HelpCircle, LifeBuoy, Sparkles, ChevronRight, CheckCircle2, AlertCircle, MessageSquare,
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const TOPICS = ['General question', 'Billing & payments', 'Report an issue', 'Partnership', 'Press & media'];

export default function Contact() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', topic: 'General question', message: '' });
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Please enter your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return setError('Please enter a valid email.');
    if (form.message.trim().length < 10) return setError('Please add a bit more detail (at least 10 characters).');
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      toast({ title: 'Message sent', description: 'Our support team will reply within a few hours.' });
    }, 700);
  };

  return (
    <div>
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden hero-glow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8 sm:pt-20 sm:pb-12 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300">
            <LifeBuoy size={13} /> Contact & Support
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            We’re here to <span className="text-gradient-green">help</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Have a question, a partnership idea, or need a hand with your account? Reach out — real humans reply, 24/7.
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          {/* Contact form */}
          <form onSubmit={submit} className="card-surface rounded-2xl p-5 sm:p-8 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-white">Send us a message</h2>
              <p className="text-sm text-slate-400 mt-1">Fill in the form and we’ll get back to you shortly.</p>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                <AlertCircle size={16} className="text-rose-400 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {sent && (
              <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                <span>Thanks {form.name.split(' ')[0]}! Your message has been received. We’ll reply to <b>{form.email}</b> soon.</span>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Your name">
                <div className="input-wrap">
                  <User size={15} className="text-slate-400" />
                  <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Full name" className="input-plain" />
                </div>
              </Field>
              <Field label="Email address">
                <div className="input-wrap">
                  <Mail size={15} className="text-slate-400" />
                  <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" className="input-plain" autoComplete="email" />
                </div>
              </Field>
            </div>

            <Field label="What is your message about?">
              <div className="input-wrap">
                <HelpCircle size={15} className="text-slate-400" />
                <select value={form.topic} onChange={(e) => set('topic', e.target.value)} className="input-plain" style={{ colorScheme: 'dark' }}>
                  {TOPICS.map((t) => <option key={t} className="bg-[#0f1526]">{t}</option>)}
                </select>
              </div>
            </Field>

            <Field label="Message">
              <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 focus-within:border-emerald-500/60 px-3 py-3 btn-hover">
                <MessageSquare size={15} className="text-slate-400 mt-0.5" />
                <textarea
                  value={form.message}
                  onChange={(e) => set('message', e.target.value)}
                  rows={7}
                  placeholder="Share as much detail as you can — we love context."
                  className="w-full bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-500 resize-y min-h-[140px]"
                />
              </div>
            </Field>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <p className="text-xs text-slate-400 inline-flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-400" /> Your message is secure and private.
              </p>
              <Button disabled={sending} className="rounded-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-900 font-semibold px-6 h-11">
                {sending ? <span className="h-4 w-4 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" /> : <><Send size={15} className="mr-2" /> Send message</>}
              </Button>
            </div>
          </form>

          {/* Support info */}
          <div className="space-y-5">
            <div className="card-surface rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white">Support info</h3>
              <p className="text-sm text-slate-400 mt-1">Prefer a different channel? Reach us here.</p>
              <ul className="mt-5 space-y-4">
                <InfoRow Icon={Mail} label="Email" value="support@shahlance.com" />
                <InfoRow Icon={Phone} label="Phone" value="+1 (555) 010-2200" />
                <InfoRow Icon={Clock} label="Response time" value="Under 1 hour, 24/7" />
                <InfoRow Icon={MapPin} label="HQ" value="San Francisco, CA" />
              </ul>
              <button
                onClick={() => setChatOpen(true)}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold py-3 btn-hover shadow-lg shadow-emerald-500/20"
              >
                <MessageCircle size={16} /> Start live chat
              </button>
              <p className="mt-2 text-center text-[11px] text-slate-500 inline-flex items-center gap-1.5 justify-center w-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Support agents online now
              </p>
            </div>

            <div className="card-surface rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-white">Popular help topics</h3>
              <div className="mt-3 space-y-2">
                {[
                  ['How escrow payments work', '/'],
                  ['Verify my account', '/profile'],
                  ['Post a job in minutes', '/post-job'],
                  ['Find the right freelancer', '/find-freelancers'],
                ].map(([label, to]) => (
                  <Link key={label} to={to} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-emerald-500/30 px-3 py-2.5 text-sm text-slate-200 btn-hover">
                    <span className="inline-flex items-center gap-2"><Sparkles size={13} className="text-emerald-400" /> {label}</span>
                    <ChevronRight size={14} className="text-slate-500" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live chat mock panel */}
      {chatOpen && <LiveChatPanel onClose={() => setChatOpen(false)} />}

      <style>{`
        .input-wrap {
          display: flex; align-items: center; gap: 8px;
          height: 44px; padding: 0 12px;
          border-radius: 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.10);
          transition: border-color 200ms ease, background-color 200ms ease;
        }
        .input-wrap:focus-within { border-color: rgba(16,185,129,0.6); background: rgba(255,255,255,0.06); }
        .input-plain { width: 100%; background: transparent; outline: none; font-size: 14px; color: rgb(226 232 240); }
        .input-plain::placeholder { color: rgb(100 116 139); }
      `}</style>

      <Footer />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function InfoRow({ Icon, label, value }) {
  return (
    <li className="flex items-start gap-3">
      <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm text-white font-medium">{value}</p>
      </div>
    </li>
  );
}

function LiveChatPanel({ onClose }) {
  const [messages, setMessages] = useState([
    { from: 'agent', text: 'Hi 👋 I’m Alex from ShahLance support. How can I help today?' },
  ]);
  const [text, setText] = useState('');
  const send = (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setMessages((m) => [...m, { from: 'me', text: t }]);
    setText('');
    setTimeout(() => {
      setMessages((m) => [...m, { from: 'agent', text: 'Thanks for the details — an agent will jump in shortly. Meanwhile, could you share your account email?' }]);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:justify-end p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:w-[380px] max-h-[80vh] flex flex-col rounded-2xl border border-white/10 bg-[#0f1526] shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-white/5">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 text-slate-900 font-bold flex items-center justify-center">A</div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Alex · Support</p>
            <p className="text-[11px] text-emerald-300 inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online now</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 flex items-center justify-center" aria-label="Close chat">✕</button>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.from === 'me' ? 'bg-emerald-500 text-slate-900' : 'bg-white/5 border border-white/10 text-slate-100'}`}>{m.text}</div>
            </div>
          ))}
        </div>
        <form onSubmit={send} className="flex items-center gap-2 p-3 border-t border-white/5">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." className="flex-1 h-10 rounded-lg bg-white/5 border border-white/10 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60" />
          <button className="h-10 w-10 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 flex items-center justify-center btn-hover" aria-label="Send"><Send size={15} /></button>
        </form>
      </div>
    </div>
  );
}
