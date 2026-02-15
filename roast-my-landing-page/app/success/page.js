import { Polar } from '@polar-sh/sdk';
import { Flame, CheckCircle2, ArrowRight } from 'lucide-react';

export default async function SuccessPage({ searchParams }) {
  const { checkout_id } = await searchParams;

  let status = 'unknown';
  let metadata = {};

  if (checkout_id && process.env.POLAR_ACCESS_TOKEN) {
    try {
      const polar = new Polar({ accessToken: process.env.POLAR_ACCESS_TOKEN });
      const checkout = await polar.checkouts.get({ id: checkout_id });
      status = checkout.status;
      metadata = checkout.metadata || {};
    } catch (err) {
      console.error('[Success] Failed to verify checkout:', err.message);
    }
  }

  const isPaid = status === 'succeeded' || status === 'confirmed';

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {isPaid ? (
          <>
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-3xl font-black mb-3">Payment Confirmed!</h1>
            <p className="text-zinc-400 mb-8 leading-relaxed">
              Your PRO roast is being prepared. You&apos;ll receive the full deep-dive report
              at your email shortly.
            </p>
            {metadata.roastId && (
              <a
                href={`/results/${metadata.roastId}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 font-bold hover:from-orange-400 hover:to-red-400 transition-all"
              >
                View Your Roast <ArrowRight className="w-4 h-4" />
              </a>
            )}
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-6">
              <Flame className="w-8 h-8 text-orange-500" />
            </div>
            <h1 className="text-3xl font-black mb-3">Processing...</h1>
            <p className="text-zinc-400 mb-8 leading-relaxed">
              We&apos;re confirming your payment. This page will update automatically, or check your email.
            </p>
          </>
        )}
        <a href="/" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
          ← Back to PageRoast
        </a>
      </div>
    </main>
  );
}
