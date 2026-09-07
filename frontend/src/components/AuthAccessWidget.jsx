import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { LogIn, UserPlus, LogOut, LayoutDashboard, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Floating auth pill so users can access Login / Signup / Logout
 * WITHOUT modifying the existing Header component.
 * - Hidden on /login, /signup, /forgot-password and on dashboard pages (dashboard has its own account chip).
 */
export default function AuthAccessWidget() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const ref = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const hidden =
    ['/login', '/signup', '/forgot-password'].includes(location.pathname) ||
    location.pathname.startsWith('/dashboard');

  if (hidden || loading) return null;

  const goDashboard = () => {
    const role = user?.accountType === 'client' ? 'buyer' : 'worker';
    navigate(`/dashboard/${role}`);
  };

  return (
    <div ref={ref} className="fixed z-50 bottom-5 right-5 sm:bottom-6 sm:right-6">
      {!isAuthenticated ? (
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#0f1526]/95 backdrop-blur-xl shadow-2xl shadow-black/40 pl-1.5 pr-1.5 py-1.5">
          <Link to="/login" className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/5 btn-hover">
            <LogIn size={14} /> Sign In
          </Link>
          <Link to="/signup" className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-3.5 py-1.5 text-xs font-semibold btn-hover">
            <UserPlus size={14} /> Sign Up
          </Link>
        </div>
      ) : (
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-[#0f1526]/95 backdrop-blur-xl shadow-2xl shadow-black/40 pl-1 pr-3 py-1 btn-hover"
          >
            <Avatar user={user} size={30} />
            <span className="text-xs font-semibold text-slate-100 max-w-[120px] truncate hidden sm:inline">{user.fullName}</span>
            <ChevronDown size={13} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          {open && (
            <div className="absolute bottom-14 right-0 w-64 rounded-2xl border border-white/10 bg-[#0f1526] shadow-2xl shadow-black/60 overflow-hidden">
              <div className="p-3 flex items-center gap-3 border-b border-white/5">
                <Avatar user={user} size={38} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
                  <p className="text-[11px] text-slate-400 truncate">@{user.username}</p>
                </div>
              </div>
              <MenuItem Icon={User} label="My Profile" onClick={() => navigate('/profile')} />
              <MenuItem Icon={LayoutDashboard} label="Dashboard" onClick={goDashboard} />
              <div className="border-t border-white/5" />
              <MenuItem Icon={LogOut} label="Logout" danger onClick={async () => { await logout(); navigate('/'); }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Avatar({ user, size = 32 }) {
  const s = { width: size, height: size };
  if (user?.profilePhoto) {
    return <img src={user.profilePhoto} alt={user.fullName} style={s} className="rounded-full object-cover border border-white/10" />;
  }
  const initials = (user?.fullName || '').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() || 'U';
  return (
    <span
      style={s}
      className="rounded-full bg-gradient-to-br from-emerald-400 to-green-500 text-slate-900 font-bold flex items-center justify-center text-xs border border-white/10"
    >
      {initials}
    </span>
  );
}

function MenuItem({ Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm btn-hover ${
        danger ? 'text-rose-300 hover:bg-rose-500/10' : 'text-slate-200 hover:bg-white/5'
      }`}
    >
      <Icon size={15} /> {label}
    </button>
  );
}
