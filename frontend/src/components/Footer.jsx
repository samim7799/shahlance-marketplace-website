import { Link } from 'react-router-dom';
import { Shield, Send, Github, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/5 bg-[#070a15]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <span className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center font-bold text-slate-900">S</span>
              <span className="text-xl font-bold tracking-tight text-white">ShahLance</span>
            </Link>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              Your complete digital marketplace. Buy and sell digital services securely with escrow protection.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
              <Shield size={12} /> Escrow Protected
            </div>
          </div>

          <FooterCol title="Marketplace" links={[
            { label: 'Browse Categories', to: '/search?q=' },
            { label: 'Gmail Services', to: '/search?q=Gmail' },
            { label: 'Telegram Services', to: '/search?q=Telegram' },
            { label: 'WhatsApp Services', to: '/search?q=WhatsApp' },
            { label: 'AI Tools', to: '/search?q=AI' },
          ]} />

          <FooterCol title="Company" links={[
            { label: 'About Us', to: '/' },
            { label: 'Careers', to: '/' },
            { label: 'Trust & Safety', to: '/' },
            { label: 'Blog', to: '/' },
            { label: 'Contact', to: '/' },
          ]} />

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Stay Updated</h4>
            <p className="text-sm text-slate-400 mb-3">Weekly picks from top freelancers.</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2">
              <input type="email" placeholder="you@company.com" className="flex-1 h-10 rounded-lg bg-white/5 border border-white/10 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <button className="h-10 w-10 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 flex items-center justify-center btn-hover" aria-label="Subscribe">
                <Send size={16} />
              </button>
            </form>
            <div className="mt-6 flex items-center gap-3">
              <SocialIcon Icon={Twitter} />
              <SocialIcon Icon={Instagram} />
              <SocialIcon Icon={Github} />
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ShahLance. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link to="/" className="hover:text-slate-300">Terms</Link>
            <Link to="/" className="hover:text-slate-300">Privacy</Link>
            <Link to="/" className="hover:text-slate-300">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-white mb-4">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} className="text-sm text-slate-400 hover:text-emerald-400 btn-hover">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcon({ Icon }) {
  return (
    <a href="#" className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/10 flex items-center justify-center text-slate-300 hover:text-emerald-400 btn-hover">
      <Icon size={16} />
    </a>
  );
}
