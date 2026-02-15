'use client';

import { motion } from 'framer-motion';
import {
  Flame,
  Target,
  MousePointer,
  Star,
  PenTool,
  Palette,
  Smartphone,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Share2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

// Magic UI Components
import { MagicCard } from '../../../components/magicui/magic-card';
import { BlurFade } from '../../../components/magicui/blur-fade';
import { BorderBeam } from '../../../components/magicui/border-beam';
import { ShimmerButton } from '../../../components/magicui/shimmer-button';
import { ShineBorder } from '../../../components/magicui/shine-border';
import { NumberTicker } from '../../../components/magicui/number-ticker';
import { AnimatedCircularProgressBar } from '../../../components/magicui/animated-circular-progress';
import { cn } from '../../../lib/utils';

/* ── helpers ─────────────────────────────────────────── */

function scoreColor(score, max = 100) {
  const pct = max === 10 ? score * 10 : score;
  if (pct >= 80) return 'text-green-400';
  if (pct >= 60) return 'text-yellow-400';
  if (pct >= 40) return 'text-orange-400';
  return 'text-red-400';
}

function scoreBg(score, max = 100) {
  const pct = max === 10 ? score * 10 : score;
  if (pct >= 80) return 'bg-green-500/10 border-green-500/20';
  if (pct >= 60) return 'bg-yellow-500/10 border-yellow-500/20';
  if (pct >= 40) return 'bg-orange-500/10 border-orange-500/20';
  return 'bg-red-500/10 border-red-500/20';
}

function rawHex(score, max = 100) {
  const pct = max === 10 ? score * 10 : score;
  if (pct >= 80) return '#22c55e';
  if (pct >= 60) return '#eab308';
  if (pct >= 40) return '#f97316';
  return '#ef4444';
}

/* ── CategoryCard ────────────────────────────────────── */

const CATEGORY_ICONS = {
  heroSection: Target,
  headline: PenTool,
  cta: MousePointer,
  socialProof: Star,
  copywriting: PenTool,
  design: Palette,
  mobile: Smartphone,
  performance: Zap,
  trustAndCredibility: Shield,
};

function CategoryCard({ id, title, data, index }) {
  if (!data) return null;
  const Icon = CATEGORY_ICONS[id] || Target;

  return (
    <BlurFade delay={0.08 * index}>
      <MagicCard className="overflow-hidden" gradientColor="#ff6b3510">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/40">
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-base">{title}</h3>
          </div>
          <span
            className={cn(
              'px-3 py-1 rounded-full text-sm font-extrabold border',
              scoreBg(data.score, 10),
              scoreColor(data.score, 10)
            )}
          >
            {data.score}/10
          </span>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Roast */}
          <p className="text-zinc-300 italic leading-relaxed text-sm">
            <Flame className="w-4 h-4 text-orange-500 inline mr-1.5 -mt-0.5" />
            &ldquo;{data.roast}&rdquo;
          </p>

          {/* Issues */}
          {data.issues?.length > 0 && (
            <div>
              <h4 className="flex items-center gap-1.5 text-xs font-bold text-red-400 uppercase tracking-wider mb-2">
                <AlertTriangle className="w-3.5 h-3.5" /> Issues Found
              </h4>
              <ul className="space-y-1.5">
                {data.issues.map((issue, i) => (
                  <li
                    key={i}
                    className="px-3 py-2 bg-red-500/5 border-l-2 border-red-500 rounded-r-lg text-red-300 text-sm"
                  >
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Fixes */}
          {data.fixes?.length > 0 && (
            <div>
              <h4 className="flex items-center gap-1.5 text-xs font-bold text-green-400 uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" /> How to Fix
              </h4>
              <ul className="space-y-1.5">
                {data.fixes.map((fix, i) => (
                  <li
                    key={i}
                    className="px-3 py-2 bg-green-500/5 border-l-2 border-green-500 rounded-r-lg text-green-300 text-sm"
                  >
                    {fix}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {(data.suggestedHeadline || data.suggestedCTA) && (
            <div className="space-y-2">
              {data.suggestedHeadline && (
                <div className="px-4 py-3 bg-orange-500/5 border-l-2 border-orange-500 rounded-r-lg">
                  <span className="text-xs font-bold text-orange-400 flex items-center gap-1 mb-1">
                    <Lightbulb className="w-3 h-3" /> SUGGESTED HEADLINE
                  </span>
                  <p className="text-orange-200 text-sm">&ldquo;{data.suggestedHeadline}&rdquo;</p>
                </div>
              )}
              {data.suggestedCTA && (
                <div className="px-4 py-3 bg-orange-500/5 border-l-2 border-orange-500 rounded-r-lg">
                  <span className="text-xs font-bold text-orange-400 flex items-center gap-1 mb-1">
                    <Lightbulb className="w-3 h-3" /> SUGGESTED CTA
                  </span>
                  <p className="text-orange-200 text-sm">&ldquo;{data.suggestedCTA}&rdquo;</p>
                </div>
              )}
            </div>
          )}
        </div>
      </MagicCard>
    </BlurFade>
  );
}

/* ── Main ────────────────────────────────────────────── */

export default function RoastResults({ result }) {
  const { roast, url, screenshots, createdAt } = result;

  const categories = [
    { id: 'heroSection', title: 'Hero Section', data: roast.heroSection },
    { id: 'headline', title: 'Headline', data: roast.headline },
    { id: 'cta', title: 'Call-to-Action', data: roast.cta },
    { id: 'socialProof', title: 'Social Proof', data: roast.socialProof },
    { id: 'copywriting', title: 'Copywriting', data: roast.copywriting },
    { id: 'design', title: 'Design & UX', data: roast.design },
    { id: 'mobile', title: 'Mobile Experience', data: roast.mobile },
    { id: 'performance', title: 'Performance', data: roast.performance },
    { id: 'trustAndCredibility', title: 'Trust & Credibility', data: roast.trustAndCredibility },
  ];

  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 max-w-5xl mx-auto">
        <a href="/" className="flex items-center gap-2 text-white hover:text-orange-400 transition-colors">
          <Flame className="w-5 h-5 text-orange-500" />
          <span className="font-bold tracking-tight">PageRoast</span>
        </a>
        <ShimmerButton
          shimmerColor="#ff6b35"
          background="linear-gradient(135deg, #ea580c, #dc2626)"
          borderRadius="8px"
          className="px-4 py-2 text-sm font-semibold"
          onClick={() => window.location.href = '/'}
        >
          <Flame className="w-3.5 h-3.5 mr-1.5" /> Roast Another
        </ShimmerButton>
      </nav>

      <div className="max-w-4xl mx-auto px-5 py-12">
        {/* ── Overall Score ─────────────────── */}
        <BlurFade delay={0.1}>
          <section className="text-center mb-14">
            <p className="text-zinc-600 text-sm mb-2">
              Roast for <span className="text-zinc-400">{url}</span>
            </p>
            <div className="flex justify-center mb-6">
              <div className="relative">
                <AnimatedCircularProgressBar
                  value={roast.overallScore}
                  gaugeColor={rawHex(roast.overallScore)}
                  gaugeBgColor="#27272a"
                  className="w-36 h-36"
                />
              </div>
            </div>
            <BlurFade delay={0.4}>
              <h1 className="text-xl sm:text-2xl font-extrabold max-w-xl mx-auto leading-snug mb-3">
                {roast.verdict}
              </h1>
            </BlurFade>
            <p className="text-zinc-600 text-xs">
              Analyzed{' '}
              {new Date(createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </section>
        </BlurFade>

        {/* ── Screenshots ───────────────────── */}
        <BlurFade delay={0.2}>
          <section className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-4 mb-14">
            <div>
              <p className="text-xs text-zinc-600 mb-2">Desktop</p>
              <div className="relative rounded-xl border border-zinc-800 overflow-hidden">
                <BorderBeam size={200} duration={15} />
                <img
                  src={`data:image/png;base64,${screenshots.hero}`}
                  alt="Desktop screenshot"
                  className="w-full"
                />
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-600 mb-2">Mobile</p>
              <div className="relative rounded-xl border border-zinc-800 overflow-hidden">
                <BorderBeam size={150} duration={15} delay={5} />
                <img
                  src={`data:image/png;base64,${screenshots.mobile}`}
                  alt="Mobile screenshot"
                  className="w-full"
                />
              </div>
            </div>
          </section>
        </BlurFade>

        {/* ── Top Priorities ─────────────────── */}
        {roast.topPriorities && (
          <BlurFade delay={0.3}>
            <ShineBorder
              borderRadius={16}
              borderWidth={2}
              duration={12}
              color={["#ef4444", "#dc2626", "#ef4444"]}
              className="bg-red-500/5 p-6 mb-8"
            >
              <div className="w-full">
                <h2 className="flex items-center gap-2 text-lg font-extrabold text-red-400 mb-4">
                  <AlertTriangle className="w-5 h-5" /> Fix These FIRST
                </h2>
                <ol className="list-decimal list-inside space-y-2">
                  {roast.topPriorities.map((p, i) => (
                    <li key={i} className="text-red-200 text-sm leading-relaxed">
                      {p}
                    </li>
                  ))}
                </ol>
              </div>
            </ShineBorder>
          </BlurFade>
        )}

        {/* ── Quick Wins ─────────────────────── */}
        {roast.quickWins && (
          <BlurFade delay={0.35}>
            <ShineBorder
              borderRadius={16}
              borderWidth={2}
              duration={12}
              color={["#22c55e", "#16a34a", "#22c55e"]}
              className="bg-green-500/5 p-6 mb-12"
            >
              <div className="w-full">
                <h2 className="flex items-center gap-2 text-lg font-extrabold text-green-400 mb-4">
                  <Zap className="w-5 h-5" /> Quick Wins (5 min fixes)
                </h2>
                <ul className="space-y-2">
                  {roast.quickWins.map((win, i) => (
                    <li key={i} className="flex items-start gap-2 text-green-200 text-sm leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      {win}
                    </li>
                  ))}
                </ul>
              </div>
            </ShineBorder>
          </BlurFade>
        )}

        {/* ── Category Breakdowns ────────────── */}
        <BlurFade delay={0.1}>
          <h2 className="text-2xl font-extrabold text-center mb-8">Detailed Breakdown</h2>
        </BlurFade>
        <div className="space-y-4">
          {categories.map((cat, i) => (
            <CategoryCard key={cat.id} {...cat} index={i} />
          ))}
        </div>

        {/* ── Estimated Lift ──────────────────── */}
        {roast.estimatedConversionLift && (
          <BlurFade delay={0.2}>
            <div className="relative text-center p-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 mt-10 overflow-hidden">
              <BorderBeam size={250} duration={20} colorFrom="#22c55e" colorTo="#16a34a" />
              <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-zinc-500 text-sm mb-1">Estimated Conversion Lift</p>
              <p className="text-4xl font-black text-green-400">{roast.estimatedConversionLift}</p>
            </div>
          </BlurFade>
        )}

        {/* ── CTA / Share ─────────────────────── */}
        <section className="text-center py-14">
          <BlurFade delay={0.1}>
            <h2 className="text-2xl font-extrabold mb-3">Want an Even Deeper Analysis?</h2>
            <p className="text-zinc-500 max-w-md mx-auto mb-8 text-sm leading-relaxed">
              Get a PRO roast with competitor comparisons, A/B test suggestions, and a full conversion audit report.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <ShimmerButton
                shimmerColor="#ff6b35"
                background="linear-gradient(135deg, #ea580c, #dc2626)"
                borderRadius="12px"
                className="px-7 py-3.5 font-bold"
                onClick={() => window.location.href = `/api/checkout?products=${process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID || ''}`}
              >
                Get PRO Roast — $29 <ArrowRight className="w-4 h-4 ml-2" />
              </ShimmerButton>
              <button
                onClick={() => {
                  const text = `My landing page just got roasted 🔥 Score: ${roast.overallScore}/100\n\n${url}\n\nGet yours roasted:`;
                  if (navigator.share) {
                    navigator.share({ title: 'My Landing Page Roast', text, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(`${text} ${window.location.href}`);
                    alert('Link copied!');
                  }
                }}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 transition-colors font-semibold cursor-pointer"
              >
                <Share2 className="w-4 h-4" /> Share Results
              </button>
            </div>
          </BlurFade>
        </section>

        {/* Footer */}
        <footer className="text-center py-5 border-t border-zinc-900 text-xs text-zinc-600">
          <a href="/" className="inline-flex items-center gap-1.5 hover:text-zinc-400 transition-colors">
            <Flame className="w-3 h-3 text-orange-500/50" /> PageRoast
          </a>
          <span className="mx-2">·</span>
          <span>Built by an AI that never sleeps</span>
        </footer>
      </div>
    </main>
  );
}
