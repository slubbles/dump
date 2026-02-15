import { readFile } from 'fs/promises';
import path from 'path';
import RoastResults from './RoastResults';

export default async function ResultsPage({ params }) {
  const { id } = await params;
  
  let result;
  try {
    const dataPath = path.join(process.cwd(), 'data', 'roasts', `${id}.json`);
    const raw = await readFile(dataPath, 'utf-8');
    result = JSON.parse(raw);
  } catch {
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
  try {
    const dataPath = path.join(process.cwd(), 'data', 'roasts', `${id}.json`);
    const raw = await readFile(dataPath, 'utf-8');
    const result = JSON.parse(raw);
    return {
      title: `Roast Score: ${result.roast.overallScore}/100 — ${result.url}`,
      description: result.roast.verdict,
    };
  } catch {
    return { title: 'Roast Not Found' };
  }
}
