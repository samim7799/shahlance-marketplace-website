import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';

export default function CategoryIcon({ category }) {
  const Icon = Icons[category.icon] || Icons.Box;
  return (
    <Link
      to={`/search?category=${category.id}`}
      className="group flex flex-col items-center gap-2 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-emerald-500/30 p-4 card-hover"
    >
      <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg`}>
        <Icon className="h-6 w-6 text-white" strokeWidth={1.8} />
      </div>
      <span className="text-xs text-slate-300 text-center leading-tight font-medium group-hover:text-white btn-hover">
        {category.name}
      </span>
    </Link>
  );
}
