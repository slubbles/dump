/**
 * Example: Web Scraping with Browser Control
 */

import { BrowserControl } from '../src/browser-control.js';

async function scrapeHackerNews() {
  const browser = new BrowserControl({ headless: true });

  console.log('🦞 Starting headless browser...');
  await browser.start();

  console.log('📍 Navigating to Hacker News...');
  await browser.navigate('https://news.ycombinator.com');

  // Wait for content to load
  await browser.act('wait', { duration: 2000 });

  console.log('📊 Extracting top stories...');
  const result = await browser.act('evaluate', {
    script: () => {
      const stories = [];
      const items = document.querySelectorAll('.athing');
      
      items.forEach((item, index) => {
        if (index < 10) { // Top 10 stories
          const titleElement = item.querySelector('.titleline > a');
          const title = titleElement?.textContent || 'N/A';
          const url = titleElement?.href || 'N/A';
          
          stories.push({ rank: index + 1, title, url });
        }
      });
      
      return stories;
    }
  });

  console.log('\n🔥 Top 10 Hacker News Stories:\n');
  result.result.forEach(story => {
    console.log(`${story.rank}. ${story.title}`);
    console.log(`   ${story.url}\n`);
  });

  await browser.stop();
  console.log('✅ Scraping complete!');
}

scrapeHackerNews().catch(console.error);
