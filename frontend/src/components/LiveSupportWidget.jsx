import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Headphones, Send, X, MessageCircle, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Global "Live Support" chip — additive, doesn't touch Header or existing widgets.
 * - Bottom-left floating pill so it doesn't collide with AuthAccessWidget (bottom-right).
 * - Opens a compact chat panel with agent auto-reply (frontend-only MOCK).
 * - Hidden on auth pages and dashboard pages (which have their own layouts).
 */
export default function LiveSupportWidget() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'agent', text: 'Hi 👋 I\u2019m Alex from Live Support. How can I help today?' },
  ]);
  const [text, setText] = useState('');
  const scrollRef = useRef(null);

  const hidden =
    isAuthenticated ||
    ['/login', '/signup', '/forgot-password'].includes(location.pathname) ||
    location.pathname.startsWith('/dashboard');

  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  // Listen for global "open live support" trigger (from AuthAccessWidget menu)
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('shahlance:open-support', handler);
    return () => window.removeEventListener('shahlance:open-support', handler);
  }, []);

  if (hidden && !open) return null;  const send = (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setMessages((m) => [...m, { from: 'me', text: t }]);
    setText('');
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { from: 'agent', text: 'Thanks — an agent will jump in shortly. Meanwhile, could you share more context or your order ID?' },
      ]);
    }, 800);
  };

  return (
    <>
      {/* Fixed bottom-left pill (hidden when hidden condition met — panel can still open via event) */}
      {!hidden && (
      <div className="fixed z-[60] bottom-5 left-5 sm:bottom-6 sm:left-6 flex items-center gap-2">
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold pl-2 pr-4 py-2 shadow-2xl shadow-emerald-500/20 btn-hover"
          aria-label="Open live support"
        >
          <span className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center">
            <Headphones size={14} />
          </span>
          <span className="text-xs sm:text-sm">Live Support</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-900 animate-pulse" />
        </button>
        <button
          onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
          className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0f1526]/95 backdrop-blur-xl text-slate-100 hover:text-white pl-2 pr-3 py-1.5 shadow-2xl shadow-black/40 btn-hover"
          aria-label="Account"
        >
          <span className="h-6 w-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 text-slate-900 flex items-center justify-center">
            <User size={12} />
          </span>
          <span className="text-xs font-semibold">Account</span>
        </button>
      </div>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed z-[70] bottom-20 left-4 sm:left-6 w-[92%] sm:w-[360px] max-h-[70vh] flex flex-col rounded-2xl border border-white/10 bg-[#0f1526] shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-white/5">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 text-slate-900 font-bold flex items-center justify-center">A</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">Live Support</p>
              <p className="text-[11px] text-emerald-300 inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Agents online now
              </p>
            </div>
            <button onClick={() => setOpen(false)} className="h-8 w-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 flex items-center justify-center" aria-label="Close">
              <X size={15} />
            </button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-auto p-3 space-y-2.5">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.from === 'me' ? 'bg-emerald-500 text-slate-900' : 'bg-white/5 border border-white/10 text-slate-100'}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={send} className="flex items-center gap-2 p-3 border-t border-white/5">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={user ? `Message from ${user.fullName.split(' ')[0]}...` : 'Type a message...'}
              className="flex-1 h-10 rounded-lg bg-white/5 border border-white/10 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60"
            />
            <button className="h-10 w-10 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 flex items-center justify-center btn-hover" aria-label="Send">
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
