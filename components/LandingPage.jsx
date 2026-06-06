'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const PROGRAMS = [
  {
    title: 'Education and Quality',
    desc: 'We improve equitable access to quality education by strengthening school infrastructure, enhancing teaching quality, providing learning materials, supporting vulnerable children, and promoting community engagement.',
    gradient: 'program-gradient-education',
    icon: '📚',
  },
  {
    title: 'Health and Eye Care',
    desc: 'Essential health services through facility construction, maternal and child health care, nutrition programs, and cataract and low-vision treatments for healthier communities.',
    gradient: 'program-gradient-health',
    icon: '🏥',
  },
  {
    title: 'Water, Sanitation & Hygiene',
    desc: 'Safe drinking water, sanitation facilities, hygiene promotion, and community-managed systems to reduce waterborne diseases and improve wellbeing.',
    gradient: 'program-gradient-wash',
    icon: '💧',
  },
  {
    title: 'Women & Children Empowerment',
    desc: 'Sustainable livelihoods, income-generating activities, and comprehensive support for orphans and vulnerable children with life skills and protection.',
    gradient: 'program-gradient-women',
    icon: '🤝',
  },
  {
    title: 'Anti-Human Trafficking',
    desc: 'Prevention through awareness, education, and safe migration, plus protection, recovery, and reintegration support for survivors.',
    gradient: 'program-gradient-traffic',
    icon: '🛡️',
  },
];

const IMPACT_STATS = [
  { value: 1.5, suffix: 'M+', label: 'Total beneficiaries served across Africa', decimals: 1 },
  { value: 3929, suffix: '', label: 'Cataract and low vision surgeries provided', decimals: 0 },
  { value: 5395, suffix: '+', label: 'Women supported with income generating activities', decimals: 0 },
  { value: 700, suffix: 'K+', label: 'People reached with anti-trafficking awareness', decimals: 0 },
  { value: 9, suffix: ' Systems', label: '5 shallow well pumps & 4 deep well water systems', decimals: 0 },
  { value: 4747, suffix: '+', label: 'Orphans and vulnerable children supported', decimals: 0 },
  { value: 71, suffix: ' Facilities', label: '47 schools and 24 health posts constructed', decimals: 0 },
  { value: 9, suffix: ' Health Posts', label: '7 Maternal & Child Health facilities and 2 pharmacies', decimals: 0 },
];

const GOVERNMENT_PARTNERS = [
  'Ministry of Finance',
  'Ministry of Water and Energy',
  'Ministry of Women and Children Affairs',
  'Ministry of Justice',
];

function PartnerLogo({ type }) {
  if (type === 'sunriders') {
    return (
      <span className="partner-text-logo" style={{ fontFamily: 'Georgia, serif', fontWeight: 900, fontSize: '2rem', color: '#1a1a2e' }}>
        Sunriders
      </span>
    );
  }
  if (type === 'edward') {
    return (
      <span className="partner-text-logo" style={{ fontFamily: "'Trebuchet MS', sans-serif", fontWeight: 900, fontSize: '1.8rem', letterSpacing: '0.05em', color: '#0f3460', textTransform: 'uppercase' }}>
        Edward Hsu
      </span>
    );
  }
  if (type === 'finote') {
    return (
      <div className="partner-text-logo text-center" style={{ fontFamily: 'Georgia, serif', fontWeight: 800, lineHeight: 1.25, color: '#1b1b2f', fontSize: '0.85rem', letterSpacing: '0.04em' }}>
        <div>FINOTE TEHADSO</div>
        <div>LEAKAL GUDATEGNA</div>
        <div>SETOCH MAHIBER</div>
      </div>
    );
  }
  return (
    <span className="partner-text-logo text-lg font-bold text-slate-700 whitespace-nowrap px-2">{type}</span>
  );
}

const MARQUEE_PARTNERS = [
  { type: 'The Stirling Foundation' },
  { type: 'Forever Young Foundation' },
  { type: 'LDS Charities' },
  { type: 'sunriders' },
  { type: 'Cure Blindness' },
  { type: 'Thinking Schools International' },
  { type: 'Chris and Shoko Trust' },
  { type: 'edward' },
  { type: 'finote' },
];

function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const max = scrollHeight - clientHeight;
      setProgress(max > 0 ? (scrollTop / max) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return progress;
}

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function AnimatedStat({ stat, active }) {
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!active) return;
    const duration = 1800;
    const start = performance.now();
    const target = stat.value;

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - t) ** 3;
      const current = target * eased;
      if (stat.decimals > 0) {
        setDisplay(current.toFixed(stat.decimals));
      } else {
        setDisplay(Math.floor(current).toLocaleString());
      }
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, stat]);

  return (
    <>
      {display}
      {stat.suffix}
    </>
  );
}

function Reveal({ children, className = '', delay = 0 }) {
  const [ref, visible] = useInView(0.12);
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'reveal-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const scrollProgress = useScrollProgress();
  const [impactRef, impactVisible] = useInView(0.2);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goLogin = useCallback(() => router.push('/login'), [router]);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileOpen(false);
  };

  const navLinks = [
    ['Home', 'hero'],
    ['About', 'about'],
    ['Programs', 'programs'],
    ['Impact', 'impact'],
    ['Partners', 'partners'],
    ['Contact', 'contact-footer'],
  ];

  return (
    <div id="landing-root" className="min-h-screen bg-white text-slate-900 font-sans antialiased overflow-x-hidden">
      {/* Scroll progress */}
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} aria-hidden />

      {/* Navigation */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'nav-scrolled' : 'bg-white/70 backdrop-blur-lg border-b border-white/50'}`}>
        <div className="max-w-[1400px] mx-auto px-6 h-20 md:h-24 flex items-center justify-between">
          <button type="button" onClick={() => scrollTo('hero')} className="flex items-center gap-3 group">
            <img src="/engage.svg" alt="Engage Now Africa" className="h-14 md:h-16 w-auto object-contain transition-transform group-hover:scale-105" />
            <span className="hidden sm:block text-sm font-bold text-slate-800 tracking-tight">Engage Now Africa</span>
          </button>

          <nav className="hidden lg:flex items-center gap-8 text-[15px] font-semibold text-slate-700">
            {navLinks.map(([label, id]) => (
              <button key={id} type="button" onClick={() => scrollTo(id)} className="nav-link hover:text-[#1273de] transition-colors">
                {label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button type="button" onClick={goLogin} className="text-[15px] font-semibold text-slate-600 hover:text-[#1273de] px-4 py-2 transition">
              Sign In
            </button>
            <button type="button" onClick={goLogin} className="ui-button-primary text-[15px] px-7 py-3">
              Get Started →
            </button>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button type="button" onClick={goLogin} className="ui-button-primary text-sm px-4 py-2">Start</button>
            <button type="button" onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-slate-800" aria-label="Menu">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-6 py-5 space-y-1 shadow-xl animate-fade-up">
            {navLinks.map(([label, id]) => (
              <button key={id} type="button" onClick={() => scrollTo(id)} className="block w-full text-left py-3 text-base font-semibold text-slate-800 hover:text-[#1273de] border-b border-slate-50 last:border-0">
                {label}
              </button>
            ))}
            <button type="button" onClick={goLogin} className="ui-button-primary w-full mt-4 py-3">Get Started</button>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="hero" className="relative min-h-screen pt-28 pb-20 hero-gradient flex items-center overflow-hidden">
        <div className="hero-grid absolute inset-0 pointer-events-none" aria-hidden />
        <div className="glow-orb w-[28rem] h-[28rem] bg-[#1273de]/25 -top-32 -left-32 animate-pulse-glow" />
        <div className="glow-orb w-80 h-80 bg-teal-400/20 top-40 right-0 animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        <div className="glow-orb w-64 h-64 bg-indigo-400/15 bottom-20 left-1/3 animate-pulse-glow" style={{ animationDelay: '0.8s' }} />

        <div
          className="animated-map absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'url(/brand/world-map.svg)',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: '70%',
          }}
        />

        <div className="max-w-[1400px] mx-auto px-6 w-full relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <div className="hero-badge mb-6 animate-fade-up">
                <span className="w-2 h-2 rounded-full bg-[#1273de] animate-pulse" />
                Heal · Rescue · Lift — Since 2002
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.08] font-extrabold text-slate-900 tracking-tight animate-fade-up" style={{ animationDelay: '0.1s' }}>
                Empowering Communities.
                <span className="block mt-2 bg-gradient-to-r from-[#1273de] via-teal-500 to-[#6366f1] bg-clip-text text-transparent hero-shimmer">
                  Creating Lasting Change.
                </span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed animate-fade-up" style={{ animationDelay: '0.2s' }}>
                Sustainable development, education, healthcare, clean water, and economic opportunities — restoring hope and dignity across Ethiopia, Ghana, Namibia, and Sierra Leone.
              </p>
              <div className="mt-10 flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
                <button type="button" onClick={() => scrollTo('about')} className="ui-button-primary px-8 py-4 text-base">
                  Learn More
                </button>
                <button type="button" onClick={goLogin} className="ui-button-outline px-8 py-4 text-base">
                  Get Started
                </button>
              </div>
              <div className="mt-12 flex flex-wrap gap-8 text-sm text-slate-500 font-medium animate-fade-up" style={{ animationDelay: '0.4s' }}>
                {[
                  ['4', 'Countries'],
                  ['1.5M+', 'Lives Touched'],
                  ['20+', 'Years of Impact'],
                ].map(([num, label]) => (
                  <div key={label} className="hero-stat-pill">
                    <span className="block text-2xl font-extrabold text-[#1273de]">{num}</span>
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 hidden lg:flex justify-center relative">
              <div className="relative w-full max-w-lg">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#1273de]/30 to-teal-400/25 blur-3xl scale-110 animate-pulse-glow" />
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/25 border border-white/90 bg-white/80 backdrop-blur-sm p-4 collage-image">
                  <img src="/africa-collage.svg" alt="Africa communities collage" className="w-full h-auto object-contain rounded-2xl" />
                  <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-100 shadow-lg">
                    <p className="text-sm font-bold text-slate-800">ENA Project Management Platform</p>
                    <p className="text-xs text-slate-500 mt-1">Track impact · Manage programs · Report outcomes</p>
                  </div>
                </div>
                <div className="floating-chip floating-chip-1">Education</div>
                <div className="floating-chip floating-chip-2">Clean Water</div>
                <div className="floating-chip floating-chip-3">Healthcare</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 md:py-32 bg-white relative section-with-bg">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <Reveal className="lg:sticky lg:top-28">
              <p className="text-[#1273de] font-bold uppercase tracking-widest text-sm mb-4">About Us</p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">Who We Are</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Engage Now Africa (ENA) is an international NGO founded in 2002, committed to restoring hope and dignity to vulnerable communities across Africa. Through integrated programs in education, health, clean water, livelihoods, OVC support, and anti-human trafficking, ENA works to lift, heal and rescue lives. Today, ENA serves communities in Ethiopia, Ghana, Namibia, and Sierra Leone, creating lasting change together with local partners.
              </p>
            </Reveal>

            <Reveal delay={120}>
              <div className="bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 p-8 md:p-10 space-y-8 about-card-glow">
                {[
                  ['Mission', 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z', "ENA's mission is to heal, rescue, and lift our brothers and sisters in Africa. Our purpose is to provide resources and training to vulnerable populations, enabling them to become self-reliant through clean water, sanitation, health, education, micro-credit, and income-generating activities."],
                  ['Vision', 'M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z', 'Envisioning a world free of poverty with happy, self-reliant communities made of virtuous individuals and families.'],
                  ['Our Theory of Change', 'M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.656 48.656 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3M3 12c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M3 12l-3 3m3-3 3 3', 'We design projects focused on individuals and families vulnerable to poverty, mobilizing local assets with global partners, government ministers, and tribal leaders to align projects with community needs.'],
                ].map(([title, iconPath, text], i) => (
                  <div key={title}>
                    {i > 0 && <div className="section-divider mb-8" />}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1273de]/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#1273de]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                          <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                        </svg>
                      </div>
                      <h3 className="text-xl font-extrabold text-slate-900">{title}</h3>
                    </div>
                    <p className="text-slate-600 leading-relaxed pl-[52px]">{text}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Programs */}
      <section id="programs" className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(18,115,222,0.06),transparent_50%)] pointer-events-none" />
        <div className="max-w-[1400px] mx-auto px-6 relative z-10">
          <Reveal>
            <p className="text-[#1273de] font-bold uppercase tracking-widest text-sm mb-3">What We Do</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-14">Program Focus Areas</h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {PROGRAMS.map((p, i) => (
              <Reveal key={p.title} delay={i * 80}>
                <article className="interactive-card bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-[#1273de]/40 hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col group h-full">
                  <div className={`h-48 ${p.gradient} flex items-center justify-center relative overflow-hidden`}>
                    <span className="text-7xl drop-shadow-lg group-hover:scale-125 transition-transform duration-500">{p.icon}</span>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-6 flex-1">
                    <h4 className="font-extrabold text-slate-900 text-xl group-hover:text-[#1273de] transition-colors">{p.title}</h4>
                    <p className="text-slate-600 mt-3 leading-relaxed text-[15px]">{p.desc}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section id="impact" ref={impactRef} className="py-24 bg-white relative">
        <div className="max-w-[1400px] mx-auto px-6">
          <Reveal>
            <p className="text-[#1273de] font-bold uppercase tracking-widest text-sm mb-3">Measurable Change</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-14">Our Impact</h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {IMPACT_STATS.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 60}>
                <div className="stat-card interactive-card ui-panel p-7 text-center relative">
                  <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#1273de] to-teal-600 bg-clip-text text-transparent">
                    <AnimatedStat stat={stat} active={impactVisible} />
                  </div>
                  <p className="text-[15px] text-slate-600 mt-3 font-medium leading-snug">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section id="partners" className="py-24 bg-slate-50 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6">
          <Reveal>
            <p className="text-[#1273de] font-bold uppercase tracking-widest text-sm mb-3">Collaboration</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-12">Partners</h2>
          </Reveal>

          <Reveal delay={80}>
            <h3 className="text-lg font-bold text-[#1273de] uppercase tracking-widest mb-6">Government Partners</h3>
            <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mb-16">
              {GOVERNMENT_PARTNERS.map((name) => (
                <div key={name} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-[#1273de]/30 hover:shadow-md transition-all group">
                  <div className="w-1 h-10 bg-slate-200 group-hover:bg-[#1273de] rounded-full transition-colors" />
                  <div>
                    <p className="font-semibold text-slate-800 group-hover:text-[#1273de] transition-colors">{name}</p>
                    <p className="text-sm text-slate-400">At Regional Levels</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <h3 className="text-lg font-bold text-[#1273de] uppercase tracking-widest mb-8">Our Partners</h3>
            <div
              className="relative overflow-hidden py-6 partner-marquee-wrap"
              style={{
                maskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
              }}
            >
              <div className="marquee-track flex items-center gap-12 w-max">
                {[0, 1].map((pass) => (
                  <div key={pass} className="flex items-center gap-16 px-4">
                    {MARQUEE_PARTNERS.map((partner) => (
                      <div key={`${pass}-${partner.type}`} className="flex-shrink-0 h-28 min-w-[180px] px-6 flex items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-[#1273de]/30 transition-all opacity-90 hover:opacity-100">
                        <PartnerLogo type={partner.type} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 cta-aurora relative overflow-hidden">
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'url(/brand/world-map.svg)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="max-w-[1400px] mx-auto px-6 text-center relative z-10">
          <Reveal>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">Ready to manage your impact?</h2>
            <p className="text-white/85 text-lg max-w-2xl mx-auto mb-10">
              Access the ENA Project Management workspace — track projects, budgets, beneficiaries, and team collaboration in one secure platform.
            </p>
            <button type="button" onClick={goLogin} className="cta-button inline-flex items-center gap-2 bg-white text-[#1273de] px-10 py-4 rounded-full font-bold text-lg shadow-2xl">
              Get Started →
            </button>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact-footer" className="bg-gradient-to-br from-[#0a3a8c] via-[#1157c9] to-[#1e6fe0] text-white">
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        <div className="max-w-[1400px] mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <img src="/logo.svg" alt="Engage Now Africa" className="h-16 w-auto object-contain mb-4 brightness-0 invert" />
              <p className="text-white/80 leading-relaxed text-[15px]">
                Restoring hope and dignity to vulnerable communities across Africa — through education, health, clean water, and self-reliance.
              </p>
              <p className="text-sm text-white/50 mt-3 font-semibold uppercase tracking-wider">Heal · Rescue · Lift</p>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-white/60 mb-4">Quick Links</h4>
              <ul className="space-y-3">
                {[['About', 'about'], ['Program Focus Areas', 'programs'], ['Our Impact', 'impact'], ['Partners', 'partners']].map(([label, id]) => (
                  <li key={id}>
                    <button type="button" onClick={() => scrollTo(id)} className="text-white/80 hover:text-white hover:pl-1 transition-all flex items-center gap-2 group text-[15px]">
                      <span className="w-4 h-px bg-white/30 group-hover:w-6 group-hover:bg-white transition-all" />
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-white/60 mb-4">Contact</h4>
              <div className="space-y-3 text-[15px] text-white/80">
                <p>Oromia, Bishoftu City<br />Kebele 02, House no.134<br />P.O.Box: 1607</p>
                <p>0114372727</p>
                <p>engagenowafrica.tenkir@gmail.com</p>
                <p>www.engagenowafrica.org</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-white/60 mb-4">Follow Us</h4>
              <div className="flex flex-col gap-3 mb-6">
                {[
                  { label: 'Facebook', letter: 'f' },
                  { label: 'Twitter / X', letter: '𝕏' },
                  { label: 'Instagram', letter: 'ig' },
                ].map(({ label, letter }) => (
                  <a key={label} href="#" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-sm font-bold group-hover:bg-white/20 group-hover:border-white/40 transition-all">
                      {letter}
                    </div>
                    <span className="text-base text-white/70 group-hover:text-white transition-colors">{label}</span>
                  </a>
                ))}
              </div>
              <button type="button" onClick={goLogin} className="ui-button-primary bg-white text-[#1273de] hover:bg-slate-100 shadow-none px-6 py-3 w-full sm:w-auto">
                Sign In to Platform
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-[1400px] mx-auto px-6 py-5 flex flex-col sm:flex-row justify-between gap-2 text-sm text-white/50">
            <span>© {new Date().getFullYear()} Engage Now Africa. All rights reserved.</span>
            <span>Oromia, Ethiopia · West Africa · Southern Africa</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
