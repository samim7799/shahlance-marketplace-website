import { Link } from 'react-router-dom';
import {
  Search, Briefcase, ArrowRight, Star, ShieldCheck, Zap, Users, CheckCircle2,
  Code2, Palette, Megaphone, Video, PenLine, Sparkles, FileEdit, UserPlus,
  Send, Wallet, TrendingUp, MessageCircle, CreditCard, Award, Headphones,
  Lock, BadgeCheck,
} from 'lucide-react';

/* ============================================================
   Premium Home Sections (additive)
   - Rendered ABOVE existing homepage content.
   - Uses the app's existing dark navy + emerald design language.
   ============================================================ */

export default function PremiumHomeSections() {
  return (
    <>
      <PremiumHero />
      <ServiceCategories />
      <HowItWorks />
      <WorkAndEarnSteps />
      <TrustSection />
    </>
  );
}

/* ---------- 1. Premium Hero ---------- */
function PremiumHero() {
  return (
    <section className="relative overflow-hidden">
      {/* soft glow */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(900px 400px at 15% 10%, rgba(34,197,94,0.14), transparent 60%), radial-gradient(700px 350px at 85% 0%, rgba(59,130,246,0.10), transparent 60%)',
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-14 sm:pt-24 sm:pb-20">
        <div className="grid gap-10 lg:gap-14 lg:grid-cols-2 items-center">
          {/* Left — copy */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300">
              <Sparkles size={13} /> Trusted by 120K+ professionals
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.05]">
              Find Skills.
              <br />
              Hire Experts.
              <br />
              <span className="text-gradient-green">Earn From Your Talent.</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-xl">
              A premium marketplace where clients meet verified freelancers. Post a job,
              hire top talent, or turn your skills into income — all secured with escrow.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/dashboard/worker"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold px-6 py-3 btn-hover shadow-lg shadow-emerald-500/20"
              >
                <Briefcase size={17} /> Find Work
              </Link>
              <Link
                to="/dashboard/buyer"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-white font-semibold px-6 py-3 btn-hover"
              >
                <Users size={17} /> Hire Talent
              </Link>
            </div>

            {/* Trust chips */}
            <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-400" /> Escrow secured
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck size={14} className="text-emerald-400" /> Verified pros
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Zap size={14} className="text-emerald-400" /> Fast delivery
              </span>
            </div>
          </div>

          {/* Right — illustration collage */}
          <div className="relative">
            <HeroIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroIllustration() {
  const talents = [
    { name: 'Ava · UI Designer', rate: '$45/hr', color: 'from-pink-500 to-rose-500', tag: 'Design' },
    { name: 'Noah · Full-Stack Dev', rate: '$75/hr', color: 'from-blue-500 to-indigo-500', tag: 'Web Dev' },
    { name: 'Zoe · Video Editor', rate: '$35/hr', color: 'from-fuchsia-500 to-purple-500', tag: 'Video' },
  ];
  return (
    <div className="relative mx-auto w-full max-w-lg aspect-[5/4]">
      {/* Central card */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[78%] rounded-3xl p-6 card-surface shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Live projects
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> 8.5K+ active
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {talents.map((t) => (
              <div key={t.name} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3">
                <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${t.color} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{t.name}</p>
                  <span className="text-[10px] text-slate-400">{t.tag}</span>
                </div>
                <span className="text-sm text-emerald-300 font-semibold">{t.rate}</span>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold py-2 btn-hover inline-flex items-center justify-center gap-1">
            Browse experts <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Floating stat top-left */}
      <div className="absolute -top-2 -left-2 sm:top-2 sm:left-2 rounded-2xl card-surface p-3 shadow-xl shadow-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
            <Star size={16} className="text-slate-900 fill-slate-900" />
          </div>
          <div>
            <p className="text-lg font-bold text-white leading-none">4.9</p>
            <p className="text-[10px] text-slate-400">Avg rating</p>
          </div>
        </div>
      </div>

      {/* Floating stat bottom-right */}
      <div className="absolute -bottom-2 -right-2 sm:bottom-4 sm:right-2 rounded-2xl card-surface p-3 shadow-xl shadow-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
            <TrendingUp size={16} className="text-white" />
          </div>
          <div>
            <p className="text-lg font-bold text-white leading-none">$2.4M+</p>
            <p className="text-[10px] text-slate-400">Paid to freelancers</p>
          </div>
        </div>
      </div>

      {/* Tag pill top-right */}
      <div className="hidden sm:flex absolute top-4 right-6 items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-300 font-medium shadow-lg">
        <Zap size={11} /> Instant match
      </div>

      {/* Tag pill bottom-left */}
      <div className="hidden sm:flex absolute bottom-6 left-4 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-slate-200 font-medium shadow-lg">
        <ShieldCheck size={11} className="text-emerald-400" /> Escrow protected
      </div>
    </div>
  );
}

/* ---------- 2. Service Categories ---------- */
const SERVICE_CATS = [
  { title: 'Web Development', desc: 'Websites, apps & full-stack builds', icon: Code2, color: 'from-blue-500 to-indigo-500', to: '/search?q=Development' },
  { title: 'Graphic Design', desc: 'Logos, branding & visual identity', icon: Palette, color: 'from-pink-500 to-rose-500', to: '/search?q=Design' },
  { title: 'Digital Marketing', desc: 'SEO, ads & growth campaigns', icon: Megaphone, color: 'from-emerald-500 to-teal-500', to: '/search?category=digital-marketing' },
  { title: 'Video Editing', desc: 'Reels, explainers & post-production', icon: Video, color: 'from-fuchsia-500 to-purple-500', to: '/search?q=Video' },
  { title: 'Content Writing', desc: 'Blogs, copy & technical writing', icon: PenLine, color: 'from-orange-500 to-amber-500', to: '/search?q=Writing' },
  { title: 'AI Services', desc: 'Chatbots, automations & LLMs', icon: Sparkles, color: 'from-violet-500 to-fuchsia-500', to: '/search?q=AI' },
];

function ServiceCategories() {
  return (
    <section className="relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300">
            Explore Services
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Popular <span className="text-gradient-green">Service Categories</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400">
            From code to creative — hire pros or offer your skills in the categories businesses hire for every day.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_CATS.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.title}
                to={c.to}
                className="group card-surface card-hover rounded-2xl p-5 flex items-start gap-4 hover:shadow-xl hover:shadow-emerald-500/5"
              >
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center shadow-lg shrink-0`}>
                  <Icon className="h-6 w-6 text-white" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white group-hover:text-emerald-300 btn-hover">{c.title}</h3>
                  <p className="mt-1 text-sm text-slate-400 leading-relaxed">{c.desc}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm text-emerald-400 font-medium">
                    Explore <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- 3. How It Works (3 steps) ---------- */
const HIW_STEPS = [
  { step: '01', title: 'Post Your Work', desc: 'Describe the job you need done. Set your budget and timeline in minutes.', icon: FileEdit, color: 'from-emerald-500 to-teal-500' },
  { step: '02', title: 'Find Skilled People', desc: 'Get matched with vetted freelancers. Review portfolios, ratings, and offers.', icon: Users, color: 'from-blue-500 to-indigo-500' },
  { step: '03', title: 'Complete Work & Get Paid', desc: 'Approve deliverables and release escrowed funds. Simple, safe, done.', icon: CheckCircle2, color: 'from-violet-500 to-fuchsia-500' },
];

function HowItWorks() {
  return (
    <section className="relative section-glow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300">
            How It Works
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Three steps to <span className="text-gradient-green">get things done</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400">
            Whether you're hiring or delivering, ShahLance keeps the process simple, secure and fast.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3 relative">
          {/* connector line on desktop */}
          <div aria-hidden className="hidden md:block absolute top-16 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          {HIW_STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="relative card-surface card-hover rounded-2xl p-6 text-center">
                <div className={`mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-xl`}>
                  <Icon className="h-7 w-7 text-white" strokeWidth={1.6} />
                </div>
                <span className="mt-3 inline-block rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold text-slate-400 tracking-wider">
                  STEP {s.step}
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

/* ---------- 4. Work & Earn (5 steps) ---------- */
const EARN_STEPS = [
  { title: 'Create Profile', desc: 'Sign up and build your professional profile in minutes.', icon: UserPlus, color: 'from-emerald-500 to-green-500' },
  { title: 'Show Skills', desc: 'Add your services, portfolio, and pricing to stand out.', icon: Sparkles, color: 'from-blue-500 to-indigo-500' },
  { title: 'Apply Jobs', desc: 'Browse open jobs and send tailored proposals to clients.', icon: Send, color: 'from-fuchsia-500 to-purple-500' },
  { title: 'Complete Work', desc: 'Deliver quality work on time and communicate clearly.', icon: CheckCircle2, color: 'from-amber-500 to-orange-500' },
  { title: 'Receive Payment', desc: 'Get paid securely once the client approves the delivery.', icon: Wallet, color: 'from-teal-500 to-cyan-500' },
];

function WorkAndEarnSteps() {
  return (
    <section className="relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300">
            Work & Earn
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Turn your <span className="text-gradient-green">skills into income</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400">
            Five simple steps from creating your profile to receiving your first payout.
          </p>
        </div>

        <div className="mt-10 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {EARN_STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="relative card-surface card-hover rounded-2xl p-5 text-center">
                <span className="absolute top-3 right-3 text-[10px] font-bold text-slate-500">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className={`mx-auto h-12 w-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="h-6 w-6 text-white" strokeWidth={1.7} />
                </div>
                <h3 className="mt-3 text-[15px] font-semibold text-white">{s.title}</h3>
                <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            to="/dashboard/worker"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold px-6 py-3 btn-hover"
          >
            Start earning today <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- 5. Trust Section ---------- */
const TRUST_ITEMS = [
  { title: 'Verified Users', desc: 'Every freelancer and client is identity-verified before joining.', icon: BadgeCheck, color: 'from-emerald-500 to-green-500' },
  { title: 'Secure Payment', desc: 'Escrow-protected transactions with SSL encryption end-to-end.', icon: Lock, color: 'from-blue-500 to-indigo-500' },
  { title: 'Quality Services', desc: 'Top-rated pros, portfolio-reviewed and community-ranked.', icon: Award, color: 'from-amber-500 to-orange-500' },
  { title: '24/7 Support', desc: 'Real humans on call around the clock to help you succeed.', icon: Headphones, color: 'from-fuchsia-500 to-purple-500' },
];

function TrustSection() {
  return (
    <section className="relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300">
            Why ShahLance
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Built on <span className="text-gradient-green">trust and quality</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400">
            A safer marketplace so you can focus on the work, not the worry.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_ITEMS.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.title} className="card-surface card-hover rounded-2xl p-6">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="h-6 w-6 text-white" strokeWidth={1.8} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{t.title}</h3>
                <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">{t.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- 6. Footer Top Strip (improves footer without editing Footer.jsx) ---------- */
export function FooterTopStrip() {
  return (
    <section className="relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/5 bg-gradient-to-r from-white/[0.03] to-white/[0.01] p-6 sm:p-8">
          <div className="grid gap-6 md:grid-cols-4">
            <StripItem Icon={ShieldCheck} title="Escrow Protected" desc="Every payment is held safely until delivery is approved." />
            <StripItem Icon={CreditCard} title="Secure Checkout" desc="Cards, wallets and crypto — 100% PCI-DSS compliant." />
            <StripItem Icon={MessageCircle} title="Real-time Chat" desc="Talk to your freelancer instantly, in-app or on mobile." />
            <StripItem Icon={Headphones} title="24/7 Support" desc="A real team ready to help whenever you need us." />
          </div>
        </div>
      </div>
    </section>
  );
}

function StripItem({ Icon, title, desc }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-white font-semibold text-sm">{title}</p>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
