import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, Send, Paperclip, ShieldCheck, MessageSquare, Users, Star, Check, X, MoreVertical,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';
import AccountMenu from '../components/AccountMenu';
import NotificationCenter from '../components/NotificationCenter';
import { Avatar } from '../components/AuthAccessWidget';

// Seed threads (frontend MOCK)
const SEED_THREADS = [
  {
    id: 'th-1',
    with: 'Isabella Rossi',
    role: 'Freelancer',
    color: 'from-violet-500 to-fuchsia-500',
    last: 'Sure, I can start on Monday. Want me to send a small SOW first?',
    unread: 2,
    online: true,
    project: 'Custom AI Model Training',
    messages: [
      { from: 'them', text: 'Hi! Thanks for reaching out about the AI model — happy to help.', at: '10:12' },
      { from: 'me', text: 'Great! Timeline is 2 weeks. Budget flexible up to $1500.', at: '10:14' },
      { from: 'them', text: 'Sure, I can start on Monday. Want me to send a small SOW first?', at: '10:16' },
    ],
  },
  {
    id: 'th-2',
    with: 'Sofia Chen',
    role: 'UX Designer',
    color: 'from-pink-500 to-rose-500',
    last: 'Attached the mid-fi wireframes for review ✏️',
    unread: 0,
    online: true,
    project: 'UI/UX Design for Mobile App',
    messages: [
      { from: 'them', text: 'Attached the mid-fi wireframes for review ✏️', at: 'Yesterday' },
      { from: 'me', text: 'Looks great. Can we tighten the onboarding to 3 steps?', at: 'Yesterday' },
    ],
  },
  {
    id: 'th-3',
    with: 'Alex Morgan',
    role: 'Full-Stack Dev',
    color: 'from-blue-500 to-indigo-500',
    last: 'Deployed a preview build — link in the thread.',
    unread: 0,
    online: false,
    project: 'Full-Stack Web App',
    messages: [
      { from: 'me', text: 'How’s the API integration coming?', at: 'Mon' },
      { from: 'them', text: 'Deployed a preview build — link in the thread.', at: 'Mon' },
    ],
  },
];

export default function Messages() {
  const { user } = useAuth();
  const { push } = useNotifications();
  const navigate = useNavigate();
  const [threads, setThreads] = useState(SEED_THREADS);
  const [activeId, setActiveId] = useState(SEED_THREADS[0].id);
  const [q, setQ] = useState('');
  const [text, setText] = useState('');
  const scrollRef = useRef(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return threads;
    return threads.filter((t) => `${t.with} ${t.project} ${t.last}`.toLowerCase().includes(term));
  }, [threads, q]);

  const active = threads.find((t) => t.id === activeId) || threads[0];

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [active?.messages?.length, activeId]);

  const openThread = (id) => {
    setActiveId(id);
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, unread: 0 } : t)));
  };

  const send = (e) => {
    e.preventDefault();
    const v = text.trim();
    if (!v) return;
    setText('');
    setThreads((prev) => prev.map((t) => t.id === activeId ? {
      ...t,
      last: v,
      messages: [...t.messages, { from: 'me', text: v, at: 'now' }],
    } : t));
    // Simulated reply
    setTimeout(() => {
      setThreads((prev) => prev.map((t) => t.id === activeId ? {
        ...t,
        last: 'Thanks — I’ll get back to you shortly.',
        messages: [...t.messages, { from: 'them', text: 'Thanks — I’ll get back to you shortly.', at: 'now' }],
      } : t));
      push({
        title: `New message from ${active?.with || 'a contact'}`,
        message: 'Thanks — I’ll get back to you shortly.',
        kind: 'info',
        category: 'message',
        link: '/messages',
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-100">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0f1e]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center font-bold text-slate-900 shadow-lg shadow-emerald-500/20">S</span>
            <span className="text-lg font-bold tracking-tight text-white">ShahLance</span>
          </Link>
          <div className="flex items-center gap-2"><NotificationCenter trigger="bell" /></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/my-account" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 btn-hover">
          <ArrowLeft size={14} /> Back to My Account
        </Link>
        <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-white">Messages</h1>
        <p className="text-sm text-slate-400 mt-1">Chat with your freelancers and buyers. All conversations are private.</p>

        <div className="mt-5"><AccountMenu /></div>

        <div className="mt-6 card-surface rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-[320px_1fr] min-h-[560px]">
          {/* Left: thread list */}
          <aside className="border-b md:border-b-0 md:border-r border-white/5 flex flex-col">
            <div className="p-3 border-b border-white/5">
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 h-9">
                <Search size={14} className="text-slate-400" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search conversations" className="flex-1 bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-500" />
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              {filtered.length === 0 && (
                <div className="p-6 text-center text-sm text-slate-400">No conversations match.</div>
              )}
              {filtered.map((t) => {
                const isActive = t.id === activeId;
                return (
                  <button key={t.id} onClick={() => openThread(t.id)} className={`w-full text-left px-3 py-3 flex items-start gap-3 border-b border-white/5 btn-hover ${isActive ? 'bg-emerald-500/5' : 'hover:bg-white/[0.03]'}`}>
                    <div className={`relative h-10 w-10 rounded-full bg-gradient-to-br ${t.color} text-white font-bold text-sm flex items-center justify-center shrink-0`}>
                      {t.with.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                      {t.online && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[#0a0f1e]" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-white font-medium truncate">{t.with}</p>
                        {t.unread > 0 && <span className="min-w-[18px] h-4 px-1 rounded-full bg-emerald-500 text-slate-900 text-[10px] font-bold flex items-center justify-center">{t.unread}</span>}
                      </div>
                      <p className="text-[11px] text-slate-500">{t.role} · {t.project}</p>
                      <p className="mt-1 text-xs text-slate-400 truncate">{t.last}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right: conversation */}
          <section className="flex flex-col min-h-[400px]">
            <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
              <div className={`relative h-10 w-10 rounded-full bg-gradient-to-br ${active.color} text-white font-bold text-sm flex items-center justify-center`}>
                {active.with.split(' ').map((p) => p[0]).slice(0, 2).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{active.with}</p>
                <p className="text-[11px] text-slate-400 inline-flex items-center gap-1.5">
                  {active.online ? <><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online</> : 'Offline'} · {active.project}
                </p>
              </div>
              <button className="h-8 w-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 flex items-center justify-center" aria-label="More"><MoreVertical size={15} /></button>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-auto p-4 space-y-3">
              {active.messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${m.from === 'me' ? 'bg-emerald-500 text-slate-900' : 'bg-white/5 border border-white/10 text-slate-100'}`}>
                    {m.text}
                    <span className={`block mt-1 text-[10px] ${m.from === 'me' ? 'text-emerald-900/70' : 'text-slate-500'}`}>{m.at}</span>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={send} className="flex items-center gap-2 p-3 border-t border-white/5">
              <button type="button" className="h-10 w-10 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 flex items-center justify-center" aria-label="Attach"><Paperclip size={15} /></button>
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Message ${active.with}...`} className="flex-1 h-10 rounded-lg bg-white/5 border border-white/10 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60" />
              <button className="h-10 w-10 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 flex items-center justify-center btn-hover" aria-label="Send"><Send size={15} /></button>
            </form>
          </section>
        </div>

        <div className="mt-4 text-xs text-slate-500 inline-flex items-center gap-1.5">
          <ShieldCheck size={12} className="text-emerald-400" /> Conversations are private and stored securely.
        </div>
      </main>
    </div>
  );
}
