import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { ArrowRight, Briefcase, ArrowRightCircle } from 'lucide-react';
import { TASK_CATEGORIES, WORK_STATS, HOW_IT_WORKS, DASHBOARDS } from '../mock/extendedData';

export default function WorkAndEarnSection() {
  return (
    <section id="work-earn" className="relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300">
            <Briefcase size={13} /> Micro Task Marketplace
          </span>
          <h2 className="mt-5 text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Work & <span className="text-gradient-green">Earn</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Complete simple online tasks and earn secure rewards. Businesses can launch campaigns, while workers complete verified tasks and receive payments safely through ShahLance.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link to="/dashboard/worker" className="inline-flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold px-5 py-2.5 btn-hover">
              Start Earning <ArrowRight size={16} />
            </Link>
            <Link to="/dashboard/buyer" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-white font-semibold px-5 py-2.5 btn-hover">
              <Briefcase size={16} /> Launch Campaign
            </Link>
          </div>
        </div>

        {/* Task Categories */}
        <div className="mt-14">
          <h3 className="text-center text-2xl sm:text-3xl font-bold text-white">Task Categories</h3>
          <p className="text-center mt-1 text-sm text-slate-400">28 verified task types ready for workers to complete</p>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {TASK_CATEGORIES.map((t) => {
              const Icon = Icons[t.icon] || Icons.CheckCircle2;
              return (
                <div key={t.name} className="card-surface card-hover rounded-xl p-4 flex flex-col items-center text-center gap-2">
                  <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="h-5 w-5 text-white" strokeWidth={1.8} />
                  </div>
                  <span className="text-xs text-slate-300 font-medium leading-tight">{t.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {WORK_STATS.map((s) => {
            const Icon = Icons[s.icon] || Icons.Users;
            return (
              <div key={s.label} className="card-surface rounded-2xl p-5 text-center">
                <div className={`mx-auto h-11 w-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-white">{s.value}</div>
                <div className="text-xs text-slate-400 mt-1">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Dashboard Cards */}
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {(['buyer', 'worker', 'admin']).map((key) => {
            const d = DASHBOARDS[key];
            const HeaderIcon = key === 'buyer' ? Icons.Briefcase : key === 'worker' ? Icons.Users : Icons.Settings;
            return (
              <div key={key} className="card-surface rounded-2xl overflow-hidden flex flex-col">
                <div className={`bg-gradient-to-r ${d.accent} px-6 py-4 flex items-center gap-3`}>
                  <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <HeaderIcon className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-white">{d.title}</h4>
                </div>
                <div className="p-6 flex-1">
                  <div className="flex flex-wrap gap-2">
                    {d.features.map((f) => (
                      <span key={f} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300">
                        <Icons.CheckCircle2 size={10} className="text-emerald-400" /> {f}
                      </span>
                    ))}
                  </div>
                  <Link to={`/dashboard/${key}`} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-emerald-400 hover:text-emerald-300 btn-hover">
                    Open dashboard <ArrowRightCircle size={15} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* How It Works */}
        <div className="mt-16">
          <h3 className="text-center text-2xl sm:text-3xl font-bold text-white">How It Works</h3>
          <p className="text-center mt-1 text-sm text-slate-400">From campaign creation to worker payout — a secure, verified workflow</p>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {HOW_IT_WORKS.map((h) => {
              const Icon = Icons[h.icon] || Icons.CheckCircle2;
              return (
                <div key={h.step} className="relative card-surface rounded-2xl p-4 flex flex-col items-center text-center gap-2">
                  <span className="absolute top-2 right-3 text-[10px] font-bold text-slate-500">{h.step}</span>
                  <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${h.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs text-slate-200 font-medium leading-tight mt-1">{h.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
