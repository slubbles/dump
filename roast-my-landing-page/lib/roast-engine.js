/**
 * LANDING PAGE ROAST ENGINE
 * 
 * Scrapes a landing page, extracts key elements, and generates
 * an AI-powered conversion analysis ("roast").
 */

import puppeteer from 'puppeteer';

/**
 * Capture screenshot and extract page data
 */
export async function scrapeLandingPage(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--single-process',
    ],
  });

  try {
    const page = await browser.newPage();
    
    // Set desktop viewport
    await page.setViewport({ width: 1440, height: 900 });
    
    // Set a realistic user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Navigate with timeout
    await page.goto(url, { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });

    // Wait for content to settle
    await new Promise(r => setTimeout(r, 2000));

    // Take full-page screenshot
    const screenshotBuffer = await page.screenshot({ 
      fullPage: true,
      type: 'png',
      encoding: 'base64'
    });

    // Take above-the-fold screenshot
    const heroScreenshot = await page.screenshot({
      type: 'png',
      encoding: 'base64',
      clip: { x: 0, y: 0, width: 1440, height: 900 }
    });

    // Extract page data
    const pageData = await page.evaluate(() => {
      const getData = () => {
        // Title
        const title = document.title || '';
        
        // Meta description
        const metaDesc = document.querySelector('meta[name="description"]')?.content || '';
        
        // Headings
        const headings = [];
        document.querySelectorAll('h1, h2, h3').forEach(h => {
          headings.push({ tag: h.tagName, text: h.textContent.trim().substring(0, 200) });
        });
        
        // CTA buttons
        const buttons = [];
        document.querySelectorAll('button, a[href], [role="button"], input[type="submit"]').forEach(el => {
          const text = (el.textContent || el.value || '').trim();
          if (text && text.length < 100) {
            const rect = el.getBoundingClientRect();
            const styles = window.getComputedStyle(el);
            buttons.push({
              text,
              tag: el.tagName,
              href: el.href || '',
              isAboveFold: rect.top < window.innerHeight,
              bgColor: styles.backgroundColor,
              color: styles.color,
              fontSize: styles.fontSize,
              width: rect.width,
              height: rect.height,
            });
          }
        });
        
        // Images
        const images = [];
        document.querySelectorAll('img').forEach(img => {
          images.push({
            src: img.src,
            alt: img.alt || '',
            width: img.naturalWidth,
            height: img.naturalHeight,
            hasAlt: !!img.alt,
          });
        });
        
        // Forms
        const forms = [];
        document.querySelectorAll('form').forEach(form => {
          const fields = [];
          form.querySelectorAll('input, textarea, select').forEach(field => {
            fields.push({
              type: field.type || field.tagName.toLowerCase(),
              name: field.name || '',
              placeholder: field.placeholder || '',
              required: field.required,
            });
          });
          forms.push({ action: form.action, method: form.method, fields });
        });
        
        // Social proof
        const bodyText = document.body.innerText || '';
        const socialProof = {
          hasTestimonials: /testimonial|review|said|quot/i.test(bodyText),
          hasNumbers: /\d+[,.]?\d*\s*(\+|customers|users|clients|companies|teams|downloads)/i.test(bodyText),
          hasLogos: document.querySelectorAll('img[alt*="logo"], img[class*="logo"], img[src*="logo"]').length > 0,
          hasTrustBadges: /trust|secure|ssl|guarantee|money.back|verified|certified/i.test(bodyText),
          hasStars: /★|⭐|star|rating/i.test(bodyText) || document.querySelectorAll('[class*="star"], [class*="rating"]').length > 0,
        };
        
        // Pricing
        const pricing = {
          hasPricing: /\$\d|€\d|£\d|pricing|price|plan|subscription|\/mo|\/month|\/year/i.test(bodyText),
          hasFreeOption: /free|trial|demo|freemium|no.credit.card/i.test(bodyText),
        };
        
        // Navigation
        const navLinks = [];
        document.querySelectorAll('nav a, header a').forEach(a => {
          navLinks.push(a.textContent.trim());
        });
        
        // Page metrics
        const allText = bodyText.replace(/\s+/g, ' ').trim();
        const wordCount = allText.split(/\s+/).length;
        
        // Colors (dominant)
        const bodyStyles = window.getComputedStyle(document.body);
        
        // Footer
        const footer = document.querySelector('footer');
        const footerLinks = [];
        if (footer) {
          footer.querySelectorAll('a').forEach(a => {
            footerLinks.push(a.textContent.trim());
          });
        }
        
        // Videos
        const hasVideo = document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"], iframe[src*="wistia"]').length > 0;
        
        // Chat widgets
        const hasChatWidget = document.querySelectorAll('[class*="chat"], [id*="chat"], [class*="intercom"], [class*="drift"], [class*="crisp"], [class*="zendesk"]').length > 0;
        
        return {
          title,
          metaDesc,
          headings,
          buttons: buttons.slice(0, 30), // Limit
          images: images.slice(0, 30),
          forms,
          socialProof,
          pricing,
          navLinks: navLinks.slice(0, 20),
          wordCount,
          footerLinks: footerLinks.slice(0, 20),
          hasVideo,
          hasChatWidget,
          bgColor: bodyStyles.backgroundColor,
          fontFamily: bodyStyles.fontFamily,
          url: window.location.href,
        };
      };
      
      return getData();
    });

    // Performance metrics
    const performance = await page.evaluate(() => {
      const timing = window.performance.timing;
      return {
        loadTime: timing.loadEventEnd - timing.navigationStart,
        domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
        firstPaint: performance.getEntriesByType('paint')?.[0]?.startTime || null,
      };
    });

    // Check mobile responsiveness
    await page.setViewport({ width: 375, height: 812 });
    await new Promise(r => setTimeout(r, 1000));
    
    const mobileScreenshot = await page.screenshot({
      type: 'png',
      encoding: 'base64',
      clip: { x: 0, y: 0, width: 375, height: 812 }
    });

    const mobileData = await page.evaluate(() => {
      const hasHorizontalScroll = document.documentElement.scrollWidth > window.innerWidth;
      const tooSmallText = [];
      document.querySelectorAll('p, span, a, li').forEach(el => {
        const size = parseFloat(window.getComputedStyle(el).fontSize);
        if (size < 14 && el.textContent.trim().length > 5) {
          tooSmallText.push({ text: el.textContent.trim().substring(0, 50), size });
        }
      });
      return {
        hasHorizontalScroll,
        tooSmallText: tooSmallText.slice(0, 10),
      };
    });

    return {
      screenshots: {
        full: screenshotBuffer,
        hero: heroScreenshot,
        mobile: mobileScreenshot,
      },
      pageData,
      performance,
      mobileData,
      scrapedAt: new Date().toISOString(),
    };

  } finally {
    await browser.close();
  }
}

/**
 * Generate the roast analysis using Claude API
 */
export async function generateRoast(scrapedData, tier = 'basic') {
  const { pageData, performance, mobileData } = scrapedData;
  
  const prompt = `You are "The Roast Master" — a brutally honest, world-class conversion rate optimization expert who has analyzed 10,000+ landing pages. You're known for your savage but actionable feedback.

ANALYZE THIS LANDING PAGE AND ROAST IT:

URL: ${pageData.url}
Title: "${pageData.title}"
Meta Description: "${pageData.metaDesc}"

HEADINGS:
${pageData.headings.map(h => `${h.tag}: "${h.text}"`).join('\n')}

CTA BUTTONS (${pageData.buttons.length} found):
${pageData.buttons.slice(0, 15).map(b => `- "${b.text}" (${b.tag}, above fold: ${b.isAboveFold}, size: ${Math.round(b.width)}x${Math.round(b.height)})`).join('\n')}

IMAGES: ${pageData.images.length} total, ${pageData.images.filter(i => !i.hasAlt).length} missing alt text

FORMS: ${pageData.forms.length} forms, ${pageData.forms.reduce((sum, f) => sum + f.fields.length, 0)} total fields

SOCIAL PROOF:
- Testimonials: ${pageData.socialProof.hasTestimonials ? 'YES' : 'NO'}
- Numbers/Stats: ${pageData.socialProof.hasNumbers ? 'YES' : 'NO'}
- Company Logos: ${pageData.socialProof.hasLogos ? 'YES' : 'NO'}
- Trust Badges: ${pageData.socialProof.hasTrustBadges ? 'YES' : 'NO'}
- Star Ratings: ${pageData.socialProof.hasStars ? 'YES' : 'NO'}

PRICING: ${pageData.pricing.hasPricing ? 'Visible' : 'Not visible'}, Free option: ${pageData.pricing.hasFreeOption ? 'YES' : 'NO'}

WORD COUNT: ${pageData.wordCount}
VIDEO: ${pageData.hasVideo ? 'YES' : 'NO'}
CHAT WIDGET: ${pageData.hasChatWidget ? 'YES' : 'NO'}
NAV LINKS: ${pageData.navLinks.join(', ')}

PERFORMANCE:
- Page Load: ${performance.loadTime}ms
- DOM Ready: ${performance.domReady}ms

MOBILE:
- Horizontal Scroll Issues: ${mobileData.hasHorizontalScroll ? 'YES ❌' : 'NO ✅'}
- Small Text Elements: ${mobileData.tooSmallText.length}

---

Generate a DETAILED roast with these sections. Be brutally honest but constructive. Use a scoring system from 1-10 for each category. Use 🔥 for burns and 💀 for fatal issues.

REQUIRED OUTPUT FORMAT (JSON):

{
  "overallScore": <1-100>,
  "verdict": "<one brutal sentence summary>",
  "heroSection": {
    "score": <1-10>,
    "roast": "<2-3 sentences roasting the hero/above-fold>",
    "issues": ["<issue 1>", "<issue 2>"],
    "fixes": ["<specific fix 1>", "<specific fix 2>"]
  },
  "headline": {
    "score": <1-10>,
    "roast": "<2-3 sentences>",
    "issues": ["..."],
    "fixes": ["..."],
    "suggestedHeadline": "<your better headline>"
  },
  "cta": {
    "score": <1-10>,
    "roast": "<2-3 sentences>",
    "issues": ["..."],
    "fixes": ["..."],
    "suggestedCTA": "<your better CTA text>"
  },
  "socialProof": {
    "score": <1-10>,
    "roast": "<2-3 sentences>",
    "issues": ["..."],
    "fixes": ["..."]
  },
  "copywriting": {
    "score": <1-10>,
    "roast": "<2-3 sentences about the overall copy>",
    "issues": ["..."],
    "fixes": ["..."]
  },
  "design": {
    "score": <1-10>,
    "roast": "<2-3 sentences>",
    "issues": ["..."],
    "fixes": ["..."]
  },
  "mobile": {
    "score": <1-10>,
    "roast": "<2-3 sentences>",
    "issues": ["..."],
    "fixes": ["..."]
  },
  "performance": {
    "score": <1-10>,
    "roast": "<2-3 sentences>",
    "issues": ["..."],
    "fixes": ["..."]
  },
  "trustAndCredibility": {
    "score": <1-10>,
    "roast": "<2-3 sentences>",
    "issues": ["..."],
    "fixes": ["..."]  
  },
  "topPriorities": [
    "<#1 thing to fix immediately>",
    "<#2 thing to fix>",
    "<#3 thing to fix>"
  ],
  "quickWins": [
    "<thing they can fix in 5 minutes>",
    "<another quick fix>",
    "<another quick fix>"
  ],
  "estimatedConversionLift": "<X-Y% if they implement all fixes>"
}

Be specific. Reference actual elements from the data. No generic advice. Every recommendation must be actionable and tied to what you see on the page.`;

  // Call Claude API
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error: ${response.status} — ${err}`);
  }

  const data = await response.json();
  const text = data.content[0].text;

  // Parse JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse roast analysis from AI response');
  }

  return JSON.parse(jsonMatch[0]);
}
