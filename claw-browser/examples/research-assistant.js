/**
 * Advanced Example: Multi-Tab Browse & Research Assistant
 * 
 * This demonstrates using multiple browser features together:
 * - Multiple tabs
 * - Navigation
 * - Screenshots
 * - Content extraction
 * - Actions
 */

import { BrowserControl } from '../src/browser-control.js';
import { writeFile } from 'fs/promises';

async function researchTopic(topic) {
  console.log(`🔬 Researching: ${topic}\n`);
  
  const browser = new BrowserControl({
    headless: true,
    screenshotDir: './research-output'
  });

  try {
    // Start browser
    console.log('🦞 Starting browser...');
    await browser.start();

    // Search on GitHub
    console.log('\n📌 Step 1: Searching GitHub...');
    const searchUrl = `https://github.com/search?q=${encodeURIComponent(topic)}&type=repositories`;
    await browser.navigate(searchUrl);
    await browser.act('wait', { duration: 3000 });

    // Take screenshot of search results
    await browser.screenshot({ filename: `${topic}-github-search.png` });
    console.log('   ✓ Screenshot saved');

    // Extract top repositories
    const repoData = await browser.act('evaluate', {
      script: () => {
        const repos = [];
        document.querySelectorAll('.search-title').forEach((title, idx) => {
          if (idx < 5) {
            const link = title.querySelector('a');
            if (link) {
              repos.push({
                name: link.textContent.trim(),
                url: link.href
              });
            }
          }
        });
        return repos;
      }
    });

    console.log(`   ✓ Found ${repoData.result?.length || 0} repositories`);

    // Open documentation in new tab
    console.log('\n📌 Step 2: Opening documentation...');
    const docsUrl = `https://www.google.com/search?q=${encodeURIComponent(topic + ' documentation')}`;
    const docsTab = await browser.openTab(docsUrl, 'docs');
    console.log(`   ✓ Opened docs tab: ${docsTab.tabId}`);

    await browser.act('wait', { duration: 2000 });
    await browser.screenshot({ 
      filename: `${topic}-docs.png`,
      tabId: 'docs'
    });

    // Open news/articles in another tab
    console.log('\n📌 Step 3: Checking recent news...');
    const newsUrl = `https://news.ycombinator.com`;
    const newsTab = await browser.openTab(newsUrl, 'news');
    console.log(`   ✓ Opened news tab: ${newsTab.tabId}`);

    await browser.act('wait', { duration: 2000 });

    // Get page snapshots from all tabs
    console.log('\n📌 Step 4: Extracting content from all tabs...');
    const tabs = await browser.listTabs();
    
    const research = {
      topic,
      timestamp: new Date().toISOString(),
      tabs: []
    };

    for (const tab of tabs.tabs) {
      console.log(`   Processing tab: ${tab.id}`);
      const snapshot = await browser.snapshot({
        tabId: tab.id,
        includeText: true,
        includeMetadata: true,
        maxChars: 5000
      });

      research.tabs.push({
        id: tab.id,
        url: snapshot.url,
        title: snapshot.title,
        linkCount: snapshot.metadata?.links?.length || 0,
        headingCount: snapshot.metadata?.headings?.length || 0
      });
    }

    // Save research data
    console.log('\n📌 Step 5: Saving research data...');
    const outputFile = `research-output/${topic}-research.json`;
    await writeFile(outputFile, JSON.stringify(research, null, 2));
    console.log(`   ✓ Research data saved to: ${outputFile}`);

    // Generate summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESEARCH SUMMARY');
    console.log('='.repeat(60));
    console.log(`Topic: ${topic}`);
    console.log(`Tabs opened: ${tabs.count}`);
    console.log(`\nTab Details:`);
    
    research.tabs.forEach((tab, idx) => {
      console.log(`\n${idx + 1}. ${tab.title}`);
      console.log(`   URL: ${tab.url}`);
      console.log(`   Links: ${tab.linkCount}, Headings: ${tab.headingCount}`);
    });

    if (repoData.result?.length > 0) {
      console.log(`\n📦 Top GitHub Repositories:`);
      repoData.result.forEach((repo, idx) => {
        console.log(`\n${idx + 1}. ${repo.name}`);
        console.log(`   ${repo.url}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Research complete!');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    // Cleanup
    console.log('🧹 Cleaning up...');
    await browser.stop();
  }
}

// Run research
const topic = process.argv[2] || 'openclaw';
researchTopic(topic).catch(console.error);
