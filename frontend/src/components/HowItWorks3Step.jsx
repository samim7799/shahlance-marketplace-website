import { FileEdit, Users, CheckCircle2 } from 'lucide-react';

/**
 * Reusable premium 3-step "How It Works" section.
 * Additive: safe to drop into any page.
 */
export default function HowItWorks3Step({
  eyebrow = 'How It Works',
  title,
  titleAccent,
  subtitle,
  steps,
}) {
  const S = steps || [
    { title: 'Post project', desc: 'Share a clear brief with your budget, timeline and requirements.', icon: FileEdit, color: 'from-emerald-500 to-teal-500' },
    { title: 'Hire professionals', desc: 'Review proposals from verified experts and pick the perfect match.', icon: Users, color: 'from-blue-500 to-indigo-500' },
    { title: 'Complete work & payment', desc: 'Approve deliverables and release escrow-protected funds. Simple, safe, done.', icon: CheckCircle2, color: 'from-violet-500 to-fuchsia-500' },
  ];

  return (
    <section className="relative section-glow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300">
            {eyebrow}
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {title || 'Three steps to '}
            {titleAccent ? <span className="text-gradient-green">{titleAccent}</span> : <span className="text-gradient-green">get things done</span>}
          </h2>
          {subtitle && <p className="mt-3 text-sm sm:text-base text-slate-400">{subtitle}</p>}
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3 relative">
          <div aria-hidden className="hidden md:block absolute top-16 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          {S.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="relative card-surface card-hover rounded-2xl p-6 text-center">
                <div className={`mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-xl`}>
                  <Icon className="h-7 w-7 text-white" strokeWidth={1.6} />
                </div>
                <span className="mt-3 inline-block rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold text-slate-400 tracking-wider">
                  STEP {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
