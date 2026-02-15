import { scrapeLandingPage, generateRoast } from '../../../lib/roast-engine.js';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { url, email } = await request.json();

    if (!url) {
      return Response.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL
    let cleanUrl;
    try {
      cleanUrl = new URL(url).href;
    } catch {
      return Response.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Generate unique ID for this roast
    const id = crypto.randomBytes(8).toString('hex');

    // Step 1: Scrape the landing page
    console.log(`[ROAST ${id}] Scraping ${cleanUrl}...`);
    const scrapedData = await scrapeLandingPage(cleanUrl);

    // Step 2: Generate the roast
    console.log(`[ROAST ${id}] Generating roast...`);
    const roast = await generateRoast(scrapedData);

    // Step 3: Save the results
    const resultDir = path.join(process.cwd(), 'data', 'roasts');
    await mkdir(resultDir, { recursive: true });

    const result = {
      id,
      url: cleanUrl,
      email: email || null,
      roast,
      screenshots: {
        hero: scrapedData.screenshots.hero,
        mobile: scrapedData.screenshots.mobile,
      },
      pageData: scrapedData.pageData,
      performance: scrapedData.performance,
      mobileData: scrapedData.mobileData,
      createdAt: new Date().toISOString(),
    };

    await writeFile(
      path.join(resultDir, `${id}.json`),
      JSON.stringify(result, null, 2)
    );

    console.log(`[ROAST ${id}] Complete! Score: ${roast.overallScore}/100`);

    return Response.json({ 
      id, 
      score: roast.overallScore,
      verdict: roast.verdict 
    });

  } catch (error) {
    console.error('Roast error:', error);
    return Response.json(
      { error: error.message || 'Failed to roast this page. Try again.' },
      { status: 500 }
    );
  }
}
