import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { User, LayoutDashboard, MessageSquare, Bell, Settings as SettingsIcon, LogOut, Package, ShieldCheck, Store } from 'lucide-react';

/**
 * Reusable My Account menu (additive).
 * Renders horizontally on desktop, scrollable on mobile.
 * Highlights the active section based on current route.
 */
export default function AccountMenu() {
  const { user, logout } = useAuth();
  const { unread } = useNotifications();
  const navigate = useNavigate();

  // Compute the "Dashboard" destination based on account type
  const dashboardTo =
    user?.accountType === 'client' ? '/dashboard/buyer' : '/dashboard/worker';

  const items = [
    { to: '/profile', label: 'Profile', Icon: User },
    { to: dashboardTo, label: 'Dashboard', Icon: LayoutDashboard, match: '/dashboard' },
    { to: '/services', label: 'Marketplace', Icon: Store },
    { to: '/dashboard/buyer-orders', label: 'Buyer Orders', Icon: Package },
    { to: '/dashboard/seller-orders', label: 'Seller Orders', Icon: Package },
    { to: '/admin/orders', label: 'Admin Orders', Icon: ShieldCheck },
    { to: '/messages', label: 'Messages', Icon: MessageSquare },
    { to: '/notifications', label: 'Notifications', Icon: Bell, badge: unread },
    { to: '/settings', label: 'Settings', Icon: SettingsIcon },
  ];

  return (
    <div className="card-surface rounded-2xl px-2 py-2 overflow-x-auto">
      <div className="flex items-center gap-1 min-w-max">
        {items.map((it) => {
          const Icon = it.Icon;
          return (
            <NavLink
              key={it.label}
              to={it.to}
              end={it.to === '/profile' || it.to === '/settings' || it.to === '/messages'}
              className={({ isActive }) => {
                const active = isActive || (it.match && window.location.pathname.startsWith(it.match));
                return `relative inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm btn-hover ${
                  active
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                }`;
              }}
            >
              <Icon size={15} />
              <span className="font-medium">{it.label}</span>
              {it.badge > 0 && (
                <span className="min-w-[18px] h-4 px-1 rounded-full bg-emerald-500 text-slate-900 text-[10px] font-bold flex items-center justify-center">
                  {it.badge > 9 ? '9+' : it.badge}
                </span>
              )}
            </NavLink>
          );
        })}
        <button
          onClick={async () => { await logout(); navigate('/'); }}
          className="ml-auto inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 border border-transparent btn-hover"
        >
          <LogOut size={15} /> <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

/**
 * Small helper: role-based quick-action grid used inside My Account.
 * Buyer: Browse Services, My Orders, Posted Jobs, Hire History, Messages, Payments
 * Seller/Freelancer: My Services, My Products, Applications, Orders, Earnings, Withdrawal, Reviews
 */
export function AccountQuickActions({ isApprovedSeller }) {
  const { user } = useAuth();
  const t = user?.accountType;
  const showBuyer = t === 'client' || t === 'both';
  const showFreelancer = t === 'freelancer' || t === 'both' || isApprovedSeller;

  return (
    <div className="mt-6 space-y-6">
      {showBuyer && (
        <QuickBlock
          title="Buyer quick actions"
          items={[
            { label: 'Browse Services', to: '/marketplace', color: 'from-blue-500 to-indigo-500', Icon: 'Store' },
            { label: 'My Orders', to: '/dashboard/buyer', color: 'from-emerald-500 to-teal-500', Icon: 'Package' },
            { label: 'Posted Jobs', to: '/dashboard/buyer', color: 'from-amber-500 to-orange-500', Icon: 'Briefcase' },
            { label: 'Hire History', to: '/find-freelancers', color: 'from-fuchsia-500 to-purple-500', Icon: 'Users' },
            { label: 'Messages', to: '/messages', color: 'from-sky-500 to-blue-500', Icon: 'MessageSquare' },
            { label: 'Payments', to: '/settings', color: 'from-violet-500 to-fuchsia-500', Icon: 'CreditCard' },
          ]}
        />
      )}
      {showFreelancer && (
        <QuickBlock
          title="Seller / Freelancer quick actions"
          items={[
            { label: 'My Services', to: '/find-freelancers', color: 'from-emerald-500 to-green-500', Icon: 'Sparkles' },
            { label: 'My Products', to: '/seller/upload', color: 'from-blue-500 to-cyan-500', Icon: 'Package' },
            { label: 'Applications', to: '/become-seller', color: 'from-orange-500 to-amber-500', Icon: 'FileText' },
            { label: 'Orders', to: '/dashboard/worker', color: 'from-fuchsia-500 to-purple-500', Icon: 'ShoppingCart' },
            { label: 'Earnings', to: '/dashboard/worker', color: 'from-teal-500 to-cyan-500', Icon: 'Wallet' },
            { label: 'Withdrawal', to: '/settings', color: 'from-violet-500 to-fuchsia-500', Icon: 'ArrowDownToLine' },
            { label: 'Reviews', to: '/profile', color: 'from-amber-500 to-orange-500', Icon: 'Star' },
          ]}
        />
      )}
    </div>
  );
}

function QuickBlock({ title, items }) {
  // Lazy require to keep this file small & self-contained
  const Icons = require('lucide-react');
  return (
    <div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {items.map((it) => {
          const Icon = Icons[it.Icon] || Icons.Circle;
          return (
            <a
              key={it.label}
              href={it.to}
              onClick={(e) => { e.preventDefault(); window.location.href = it.to; }}
              className="card-surface card-hover rounded-2xl p-4 flex flex-col items-center text-center gap-2"
            >
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${it.color} flex items-center justify-center shadow-lg`}>
                <Icon className="h-5 w-5 text-white" strokeWidth={1.8} />
              </div>
              <span className="text-xs text-slate-200 font-medium leading-tight">{it.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
