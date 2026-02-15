import { loadRoast } from '../../../lib/storage.js';
import RoastResults from './RoastResults';

export default async function ResultsPage({ params }) {
  const { id } = await params;
  
  const result = await loadRoast(id);

  if (!result) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center p-10">
          <h1 className="text-3xl font-bold mb-4">Roast Not Found</h1>
          <p className="text-zinc-500 mb-4">This roast doesn't exist or has expired.</p>
          <a href="/" className="text-orange-500 hover:text-orange-400 transition-colors">
            ← Get a new roast
          </a>
        </div>
      </main>
    );
  }

  return <RoastResults result={result} />;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const result = await loadRoast(id);

  if (!result) return { title: 'Roast Not Found' };
  
  const ogParams = new URLSearchParams({
    score: String(result.roast.overallScore),
    url: result.url,
    verdict: result.roast.verdict,
  });

  return {
    title: `Score: ${result.roast.overallScore}/100 — ${result.url} | PageRoast`,
    description: result.roast.verdict,
    openGraph: {
      title: `🔥 ${result.roast.overallScore}/100 — Landing Page Roast`,
      description: result.roast.verdict,
      type: 'article',
      images: [`/api/og?${ogParams.toString()}`],
    },
    twitter: {
      card: 'summary_large_image',
      title: `🔥 ${result.roast.overallScore}/100 — Landing Page Roast`,
      description: result.roast.verdict,
      images: [`/api/og?${ogParams.toString()}`],
    },
  };
}
