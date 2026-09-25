import { Link } from 'react-router-dom';
import { Star, Clock } from 'lucide-react';

export default function FreelancerServiceCard({ service }) {
  const seed = encodeURIComponent(service.seller);
  const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  return (
    <Link
      to={`/search?q=${encodeURIComponent(service.title)}`}
      className="group card-surface card-hover rounded-2xl overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-emerald-500/5"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-800">
        <img
          src={service.image}
          alt={service.title}
          loading="lazy"
          className="h-full w-full object-cover"
          style={{ transition: 'transform 400ms ease' }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-2">
          <img src={avatar} alt={service.seller} className="h-6 w-6 rounded-full bg-slate-700 border border-white/10" />
          <span className="text-xs text-slate-300 font-medium">{service.seller}</span>
        </div>
        <h3 className="text-[15px] font-semibold text-white leading-snug clamp-2 group-hover:text-emerald-300 btn-hover">
          {service.title}
        </h3>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Star size={13} className="text-amber-400 fill-amber-400" />
            <span className="text-slate-200 font-semibold">{service.rating.toFixed(1)}</span>
          </span>
          <span className="inline-flex items-center gap-1"><Clock size={13} /> {service.days} days</span>
        </div>
        <div className="mt-auto pt-3 border-t border-white/5 flex items-baseline justify-between">
          <span className="text-[11px] uppercase tracking-wider text-slate-500">Starting at</span>
          <span className="text-lg font-bold text-white">${service.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>
    </Link>
  );
}
