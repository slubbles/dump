'use client';

import { Flame, ArrowRight, ExternalLink } from 'lucide-react';
import { MagicCard } from '../../components/magicui/magic-card';
import { BlurFade } from '../../components/magicui/blur-fade';
import { BorderBeam } from '../../components/magicui/border-beam';
import { ShimmerButton } from '../../components/magicui/shimmer-button';
import { NumberTicker } from '../../components/magicui/number-ticker';
import { Particles } from '../../components/magicui/particles';
import { DotPattern } from '../../components/magicui/dot-pattern';
import { AnimatedCircularProgressBar } from '../../components/magicui/animated-circular-progress';
import { cn } from '../../lib/utils';

const SAMPLE_ROASTS = [
  {
    url: 'stripe.com',
    score: 72,
    verdict: "Impressively engineered but confusing — too many paths, not enough clarity on what you're actually buying.",
    highlights: ['Hero lacks a single clear CTA', 'Navigation overload — 20+ links above the fold', 'Social proof buried below 3 scrolls'],
    categories: { hero: 7, cta: 5, copy: 8, social: 6, mobile: 8, speed: 9, trust: 8, design: 8 },
  },
  {
    url: 'linear.app',
    score: 42,
    verdict: "Beautiful design hiding a conversion-killing mess — gorgeous visuals can't save you from a confusing value proposition.",
    highlights: ['Headline doesn\'t explain what Linear does for non-developers', 'No pricing visible — forces users to dig', 'Zero social proof above the fold'],
    categories: { hero: 5, cta: 3, copy: 4, social: 3, mobile: 5, speed: 7, trust: 4, design: 8 },
  },
  {
    url: 'notion.so',
    score: 65,
    verdict: "The Swiss Army knife problem — tries to be everything for everyone and ends up convincing no one they need it right now.",
    highlights: ['CTA copy "Get Notion free" is solid but buried in visual noise', 'Too many use cases shown simultaneously', 'Social proof could be stronger — just logos, no numbers'],
    categories: { hero: 7, cta: 6, copy: 6, social: 5, mobile: 7, speed: 7, trust: 7, design: 8 },
  },
  {
    url: 'vercel.com',
    score: 58,
    verdict: "Developer-focused dark magic — looks incredible but speaks in jargon that alienates 80% of decision-makers writing the checks.",
    highlights: ['Headline assumes you know what a frontend cloud is', 'CTA "Start Deploying" — deploy what exactly?', 'Impressive tech demos but no business outcome messaging'],
    categories: { hero: 6, cta: 5, copy: 5, social: 6, mobile: 7, speed: 9, trust: 6, design: 8 },
  },
  {
    url: 'calendly.com',
    score: 78,
    verdict: "One of the better landing pages out there — clear value prop, strong CTA, but leaves conversion lift on the table with weak social proof.",
    highlights: ['Clean hero with immediate benefit: "Easy scheduling ahead"', 'Free tier CTA is prominent and low-friction', 'Could 2x trust with customer count or testimonials above fold'],
    categories: { hero: 8, cta: 8, copy: 7, social: 6, mobile: 8, speed: 8, trust: 7, design: 8 },
  },
  {
    url: 'dropbox.com',
    score: 51,
    verdict: "A legacy brand coasting on name recognition — this landing page hasn't had a serious conversion audit in years.",
    highlights: ['Hero image dominates but says nothing about the product', 'Multiple competing CTAs create decision paralysis', 'No urgency, no scarcity, no reason to act today'],
    categories: { hero: 5, cta: 4, copy: 5, social: 5, mobile: 6, speed: 7, trust: 7, design: 6 },
  },
];

function scoreColor(score) {
  if (score >= 8) return '#22c55e';
  if (score >= 6) return '#eab308';
  if (score >= 4) return '#f97316';
  return '#ef4444';
}

function MiniBar({ label, value }) {
  let barColor = 'bg-red-500';
  if (value >= 8) barColor = 'bg-green-500';
  else if (value >= 6) barColor = 'bg-yellow-500';
  else if (value >= 4) barColor = 'bg-orange-500';

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-zinc-500 w-12 shrink-0 uppercase tracking-wider">{label}</span>
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor} transition-all duration-1000`} style={{ width: `${value * 10}%` }} />
      </div>
      <span className="text-[10px] text-zinc-500 w-4 text-right">{value}</span>
    </div>
  );
}

export default function ExamplesPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Particles */}
      <Particles
        className="fixed inset-0 z-0"
        quantity={40}
        color="#ff6b35"
        size={0.4}
        staticity={40}
      />

      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <a href="/" className="flex items-center gap-2 text-white hover:text-orange-400 transition-colors">
          <Flame className="w-6 h-6 text-orange-500" />
          <span className="font-bold text-lg tracking-tight">PageRoast</span>
        </a>
        <ShimmerButton
          shimmerColor="#ff6b35"
          background="linear-gradient(135deg, #ea580c, #dc2626)"
          borderRadius="8px"
          className="px-4 py-2 text-sm font-semibold"
          onClick={() => window.location.href = '/'}
        >
          <Flame className="w-3.5 h-3.5 mr-1.5" /> Roast Your Page
        </ShimmerButton>
      </nav>

      {/* Header */}
      <section className="relative z-10 px-6 pt-16 pb-12 max-w-4xl mx-auto text-center">
        <BlurFade delay={0.1}>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            The <span className="gradient-text">Wall of Roasts</span>
          </h1>
        </BlurFade>
        <BlurFade delay={0.2}>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Real landing pages. Real scores. See what a PageRoast teardown looks like
            before you submit your own.
          </p>
        </BlurFade>
      </section>

      {/* Gallery */}
      <section className="relative z-10 px-6 pb-20 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-5">
          {SAMPLE_ROASTS.map((roast, i) => (
            <BlurFade key={roast.url} delay={0.15 + i * 0.08}>
              <MagicCard className="p-6" gradientColor="#ff6b3512">
                {/* Top row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-sm font-semibold text-zinc-300">{roast.url}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AnimatedCircularProgressBar
                      value={roast.score}
                      gaugeColor={scoreColor(roast.score / 10)}
                      className="w-12 h-12"
                    />
                  </div>
                </div>

                {/* Verdict */}
                <p className="text-sm text-zinc-400 leading-relaxed mb-5 italic">
                  &ldquo;{roast.verdict}&rdquo;
                </p>

                {/* Mini category bars */}
                <div className="space-y-1.5 mb-5">
                  <MiniBar label="Hero" value={roast.categories.hero} />
                  <MiniBar label="CTA" value={roast.categories.cta} />
                  <MiniBar label="Copy" value={roast.categories.copy} />
                  <MiniBar label="Social" value={roast.categories.social} />
                  <MiniBar label="Mobile" value={roast.categories.mobile} />
                  <MiniBar label="Speed" value={roast.categories.speed} />
                  <MiniBar label="Trust" value={roast.categories.trust} />
                  <MiniBar label="Design" value={roast.categories.design} />
                </div>

                {/* Key issues */}
                <div className="space-y-1">
                  {roast.highlights.map((h, j) => (
                    <p key={j} className="text-xs text-zinc-500 flex items-start gap-1.5">
                      <span className="text-orange-500 mt-0.5 shrink-0">&#x2022;</span>
                      {h}
                    </p>
                  ))}
                </div>
              </MagicCard>
            </BlurFade>
          ))}
        </div>

        {/* Bottom CTA */}
        <BlurFade delay={0.6}>
          <div className="text-center mt-16">
            <p className="text-zinc-500 mb-4">Think your page can beat these scores?</p>
            <ShimmerButton
              shimmerColor="#ff6b35"
              background="linear-gradient(135deg, #ea580c, #dc2626)"
              borderRadius="12px"
              shimmerDuration="2s"
              className="px-8 py-4 text-lg font-bold mx-auto"
              onClick={() => window.location.href = '/'}
            >
              <Flame className="w-5 h-5 mr-2" />
              Roast my page
              <ArrowRight className="w-5 h-5 ml-2" />
            </ShimmerButton>
          </div>
        </BlurFade>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-6 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-zinc-600">
          <a href="/" className="flex items-center gap-2 hover:text-zinc-400 transition-colors">
            <Flame className="w-3.5 h-3.5 text-orange-500/50" />
            <span>PageRoast</span>
          </a>
          <span>Built by an AI that never sleeps</span>
        </div>
      </footer>
    </div>
  );
}
