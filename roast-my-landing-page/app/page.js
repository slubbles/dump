'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Zap,
  Target,
  MousePointer,
  Smartphone,
  Shield,
  Palette,
  Star,
  PenTool,
  BarChart3,
  ArrowRight,
  Check,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

// Magic UI Components
import { AnimatedGradientText } from '../components/magicui/animated-gradient-text';
import { ShimmerButton } from '../components/magicui/shimmer-button';
import { BorderBeam } from '../components/magicui/border-beam';
import { Particles } from '../components/magicui/particles';
import { MagicCard } from '../components/magicui/magic-card';
import { NumberTicker } from '../components/magicui/number-ticker';
import { BlurFade } from '../components/magicui/blur-fade';
import { Marquee } from '../components/magicui/marquee';
import { ShineBorder } from '../components/magicui/shine-border';
import { RetroGrid } from '../components/magicui/retro-grid';
import { WordPullUp } from '../components/magicui/word-animations';
import { AnimatedCircularProgressBar } from '../components/magicui/animated-circular-progress';
import { cn } from '../lib/utils';

const FEATURES = [
  { icon: Target, title: 'Hero Section', desc: 'Is your above-the-fold actually stopping the scroll?' },
  { icon: MousePointer, title: 'CTAs & Buttons', desc: 'Button copy, placement, color, urgency — all scored.' },
  { icon: PenTool, title: 'Copywriting', desc: 'Clarity, benefit-focus, power words, reading level.' },
  { icon: Star, title: 'Social Proof', desc: 'Testimonials, logos, numbers — all the trust signals.' },
  { icon: Smartphone, title: 'Mobile UX', desc: '60% of traffic is mobile. Is your page ready?' },
  { icon: Zap, title: 'Page Speed', desc: 'Load time, DOM readiness, first paint metrics.' },
  { icon: Shield, title: 'Trust Signals', desc: 'Guarantees, badges, privacy — all credibility checks.' },
  { icon: Palette, title: 'Design & Layout', desc: 'Visual hierarchy, whitespace, color psychology.' },
  { icon: BarChart3, title: 'Conversion Score', desc: '0-100 score with prioritized fixes and lift estimate.' },
];

const STEPS = [
  { num: '01', title: 'Paste your URL', desc: 'Drop any landing page URL into the box' },
  { num: '02', title: 'AI analyzes everything', desc: 'Screenshots, DOM analysis, mobile test, performance audit' },
  { num: '03', title: 'Get your roast', desc: 'Brutal scores, specific issues, and exact fixes to implement' },
];

// Sample roast scores for the marquee
const SAMPLE_SCORES = [
  { site: 'stripe.com', score: 72 },
  { site: 'linear.app', score: 42 },
  { site: 'notion.so', score: 65 },
  { site: 'vercel.com', score: 58 },
  { site: 'calendly.com', score: 78 },
  { site: 'dropbox.com', score: 51 },
  { site: 'figma.com', score: 69 },
  { site: 'slack.com', score: 61 },
];

function ScoreChip({ site, score }) {
  let color = 'text-red-400 border-red-500/30 bg-red-500/5';
  if (score >= 70) color = 'text-green-400 border-green-500/30 bg-green-500/5';
  else if (score >= 55) color = 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5';
  else if (score >= 40) color = 'text-orange-400 border-orange-500/30 bg-orange-500/5';
  return (
    <div className={cn('flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm', color)}>
      <span className="text-zinc-400">{site}</span>
      <span className="font-extrabold">{score}/100</span>
    </div>
  );
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingStep, setLoadingStep] = useState(0);
  const router = useRouter();

  const loadingSteps = [
    'Taking screenshots...',
    'Analyzing hero section...',
    'Checking CTAs...',
    'Testing mobile experience...',
    'Measuring performance...',
    'Scanning social proof...',
    'Generating your roast...',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http')) cleanUrl = 'https://' + cleanUrl;
    
    try { new URL(cleanUrl); } catch {
      setError('Enter a valid URL — like https://yoursite.com');
      return;
    }

    setLoading(true);
    setLoadingStep(0);

    const interval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % loadingSteps.length);
    }, 3000);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);

    try {
      const res = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl, email: email.trim() || undefined }),
        signal: controller.signal,
      });

      const data = await res.json();
      clearInterval(interval);
      clearTimeout(timeout);

      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      router.push(`/results/${data.id}`);
    } catch (err) {
      clearInterval(interval);
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        setError('That page is taking too long to analyze. Try a simpler page, or try again later.');
      } else {
        setError(err.message);
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ── Particles background ─────────────── */}
      <Particles
        className="fixed inset-0 z-0"
        quantity={80}
        color="#ff6b35"
        size={0.5}
        staticity={30}
      />

      {/* ── Nav ──────────────────────────────── */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-500" />
          <span className="font-bold text-lg tracking-tight">PageRoast</span>
        </div>
        <div className="flex items-center gap-5">
          <a href="/examples" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Examples
          </a>
          <a href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Pricing
          </a>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────── */}
      <section className="relative z-10 px-6 pt-20 pb-16 max-w-4xl mx-auto text-center">
        {/* Animated Gradient Badge */}
        <BlurFade delay={0.1}>
          <AnimatedGradientText className="mb-8">
            <Sparkles className="w-4 h-4 text-orange-500 mr-2" />
            <span className="text-sm text-zinc-300">
              Free AI-powered conversion analysis
            </span>
            <ChevronRight className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5 text-zinc-500" />
          </AnimatedGradientText>
        </BlurFade>

        {/* Headline with BlurFade */}
        <BlurFade delay={0.2}>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6">
            Your landing page is
            <br />
            <span className="gradient-text">leaking conversions</span>
          </h1>
        </BlurFade>

        {/* Subheadline */}
        <BlurFade delay={0.3}>
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Paste your URL and get a brutally honest AI teardown — hero,
            CTAs, copy, social proof, mobile, speed — scored and roasted in 30 seconds.
          </p>
        </BlurFade>

        {/* Input with BorderBeam */}
        <BlurFade delay={0.4}>
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
            <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm p-1.5 space-y-1.5">
              <BorderBeam size={250} duration={12} delay={9} />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-landing-page.com"
                  required
                  disabled={loading}
                  className="flex-1 px-4 py-3.5 bg-transparent text-white placeholder-zinc-600 outline-none text-base rounded-xl disabled:opacity-50"
                />
                <ShimmerButton
                  type="submit"
                  disabled={loading}
                  shimmerColor="#ff6b35"
                  background="linear-gradient(135deg, #ea580c, #dc2626)"
                  borderRadius="12px"
                  className={cn(
                    "px-6 py-3.5 font-semibold text-white text-base whitespace-nowrap",
                    loading && "opacity-50 cursor-wait"
                  )}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Roasting...
                    </>
                  ) : (
                    <>
                      <Flame className="w-4 h-4 mr-2" />
                      Roast it
                    </>
                  )}
                </ShimmerButton>
              </div>

              {/* Optional email */}
              <div className="flex items-center gap-2 px-3 pb-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com (optional — get results emailed)"
                  disabled={loading}
                  className="flex-1 px-2 py-2 bg-transparent text-sm text-zinc-300 placeholder-zinc-600 outline-none disabled:opacity-50"
                />
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-400 text-sm mt-3"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </form>
        </BlurFade>

        {/* Trust line */}
        <BlurFade delay={0.5}>
          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-zinc-600">
            <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-600" /> Free instant roast</span>
            <span className="hidden sm:flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-600" /> 30 second results</span>
            <span className="flex items-center gap-1"><Target className="w-3 h-3 text-blue-600" /> Actionable fixes</span>
          </div>
        </BlurFade>

        {/* Loading overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-10 max-w-md mx-auto"
            >
              <ShineBorder
                borderRadius={16}
                borderWidth={2}
                duration={8}
                color={["#ff6b35", "#e63946", "#ff9f43"]}
                className="p-8 bg-zinc-900/90 backdrop-blur-sm"
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">🔥</div>
                  <p className="font-semibold text-lg mb-1">Roasting your page...</p>
                  <motion.p
                    key={loadingStep}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-zinc-400 text-sm mb-6"
                  >
                    {loadingSteps[loadingStep]}
                  </motion.p>
                  <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-progress" />
                  </div>
                </div>
              </ShineBorder>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── Score Marquee ─────────────────────── */}
      <section className="relative z-10 py-8">
        <Marquee pauseOnHover className="[--duration:30s]">
          {SAMPLE_SCORES.map((s) => (
            <ScoreChip key={s.site} site={s.site} score={s.score} />
          ))}
        </Marquee>
      </section>

      {/* ── How it Works ─────────────────────── */}
      <section className="relative z-10 px-6 py-20 max-w-4xl mx-auto">
        <BlurFade delay={0.1}>
          <WordPullUp
            words="Three steps. Thirty seconds."
            className="text-3xl font-bold text-center mb-16 tracking-tight text-white"
          />
        </BlurFade>
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <BlurFade key={i} delay={0.2 + i * 0.15}>
              <MagicCard className="p-6 text-center" gradientColor="#ff6b3520">
                <div className="text-5xl font-black gradient-text mb-4">{step.num}</div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{step.desc}</p>
              </MagicCard>
            </BlurFade>
          ))}
        </div>
      </section>

      {/* ── Stats Section with NumberTicker ──── */}
      <section className="relative z-10 px-6 py-16 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Categories Analyzed', value: 9, suffix: '' },
            { label: 'Seconds to Results', value: 30, suffix: '' },
            { label: 'Issues Caught Avg', value: 14, suffix: '+' },
            { label: 'Conversion Lift', value: 27, suffix: '%' },
          ].map((stat, i) => (
            <BlurFade key={i} delay={i * 0.1}>
              <div className="text-center">
                <div className="text-4xl font-black text-white mb-1">
                  <NumberTicker value={stat.value} delay={300} />
                  <span className="gradient-text">{stat.suffix}</span>
                </div>
                <p className="text-zinc-500 text-sm">{stat.label}</p>
              </div>
            </BlurFade>
          ))}
        </div>
      </section>

      {/* ── What we analyze (Magic Cards) ────── */}
      <section className="relative z-10 px-6 py-20 max-w-5xl mx-auto">
        <BlurFade delay={0.1}>
          <h2 className="text-3xl font-bold text-center mb-4 tracking-tight">
            9 categories. Zero mercy.
          </h2>
          <p className="text-zinc-500 text-center mb-16 max-w-lg mx-auto">
            Every element that affects your conversion rate gets scored, roasted, and given specific fixes.
          </p>
        </BlurFade>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => (
            <BlurFade key={i} delay={0.15 + i * 0.05}>
              <MagicCard className="p-5" gradientColor="#ff6b3515">
                <feature.icon className="w-5 h-5 text-orange-500 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                <p className="text-zinc-500 text-xs leading-relaxed">{feature.desc}</p>
              </MagicCard>
            </BlurFade>
          ))}
        </div>
      </section>

      {/* ── Live Demo Score ──────────────────── */}
      <section className="relative z-10 px-6 py-20 max-w-4xl mx-auto">
        <BlurFade delay={0.1}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">See it in action</h2>
            <p className="text-zinc-500 max-w-lg mx-auto">
              Here&apos;s what we found when we roasted stripe.com
            </p>
          </div>
        </BlurFade>
        <BlurFade delay={0.2}>
          <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 overflow-hidden">
            <BorderBeam size={300} duration={20} />
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <AnimatedCircularProgressBar
                  value={72}
                  gaugeColor="#ff6b35"
                  className="w-32 h-32"
                />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <p className="text-sm text-zinc-500 mb-1">stripe.com</p>
                <p className="text-lg font-bold text-zinc-200 mb-3">
                  &ldquo;Impressively engineered but confusing — too many paths, not enough clarity.&rdquo;
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Hero: 7/10', 'CTA: 5/10', 'Copy: 8/10', 'Speed: 9/10', 'Design: 8/10'].map((cat) => (
                    <span key={cat} className="px-2.5 py-1 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-xs text-zinc-400">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-center mt-6">
              <a href="/examples" className="text-sm text-orange-400 hover:text-orange-300 transition-colors inline-flex items-center gap-1">
                See more examples <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </BlurFade>
      </section>

      {/* ── Pricing ──────────────────────────── */}
      <section id="pricing" className="relative z-10 px-6 py-20 max-w-4xl mx-auto">
        <BlurFade delay={0.1}>
          <h2 className="text-3xl font-bold text-center mb-4 tracking-tight">
            Simple pricing
          </h2>
          <p className="text-zinc-500 text-center mb-16">
            Start free. Upgrade when you need deeper analysis.
          </p>
        </BlurFade>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free */}
          <BlurFade delay={0.2}>
            <MagicCard className="p-8" gradientColor="#ffffff08">
              <div className="text-sm font-medium text-zinc-500 mb-2">Free Roast</div>
              <div className="text-4xl font-black mb-1">$0</div>
              <p className="text-zinc-500 text-sm mb-8">Per page analysis</p>
              <ul className="space-y-3 mb-8 text-sm">
                {['Overall conversion score', 'Hero section analysis', 'CTA review', 'Top 3 priority fixes', 'Desktop & mobile screenshots'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-zinc-300">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="w-full py-3 rounded-xl border border-zinc-700 text-sm font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Get Free Roast
              </button>
            </MagicCard>
          </BlurFade>

          {/* Pro */}
          <BlurFade delay={0.3}>
            <div className="relative">
              <ShineBorder
                borderRadius={16}
                borderWidth={2}
                duration={10}
                color={["#ff6b35", "#e63946", "#ff9f43"]}
                className="p-8 bg-zinc-900/50"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-xs font-bold z-10">
                  MOST POPULAR
                </div>
                <div className="text-sm font-medium text-orange-400 mb-2">Pro Roast</div>
                <div className="text-4xl font-black mb-1">$29</div>
                <p className="text-zinc-500 text-sm mb-8">Per deep-dive report</p>
                <ul className="space-y-3 mb-8 text-sm">
                  {[
                    'Everything in Free',
                    'Full 9-category breakdown',
                    'Competitor comparison (3 sites)',
                    'A/B test suggestions',
                    'Copywriting rewrites',
                    'Conversion lift estimate',
                    'Shareable report link',
                    'Priority email support',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-zinc-300">
                      <Check className="w-4 h-4 text-orange-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <ShimmerButton
                  shimmerColor="#ff6b35"
                  background="linear-gradient(135deg, #ea580c, #dc2626)"
                  borderRadius="12px"
                  className="w-full py-3 text-sm font-bold"
                  onClick={() => window.location.href = `/api/checkout?products=${process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID || ''}`}
                >
                  Get Pro Roast
                </ShimmerButton>
              </ShineBorder>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* ── Final CTA with RetroGrid ─────────── */}
      <section className="relative z-10 px-6 py-24 text-center overflow-hidden">
        <RetroGrid className="z-0" />
        <BlurFade delay={0.1}>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl font-black mb-4 tracking-tight">
              Stop guessing. Start converting.
            </h2>
            <p className="text-zinc-400 text-lg mb-8">
              Every hour your landing page stays unoptimized, you&apos;re leaving money on the table.
            </p>
            <ShimmerButton
              shimmerColor="#ff6b35"
              background="linear-gradient(135deg, #ea580c, #dc2626)"
              borderRadius="12px"
              shimmerDuration="2s"
              className="px-8 py-4 text-lg font-bold mx-auto"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <Flame className="w-5 h-5 mr-2" />
              Roast my page
              <ArrowRight className="w-5 h-5 ml-2" />
            </ShimmerButton>
          </div>
        </BlurFade>
      </section>

      {/* ── Footer ───────────────────────────── */}
      <footer className="relative z-10 px-6 py-6 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-zinc-600">
          <div className="flex items-center gap-2">
            <Flame className="w-3.5 h-3.5 text-orange-500/50" />
            <span>PageRoast</span>
          </div>
          <span>Built by an AI that never sleeps</span>
        </div>
      </footer>
    </div>
  );
}
