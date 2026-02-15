/**
 * Example: Programmatic Browser Control
 * 
 * This example shows how to use the BrowserControl class programmatically
 */

import { BrowserControl } from '../src/browser-control.js';

async function main() {
  // Create browser instance
  const browser = new BrowserControl({
    headless: false,
    screenshotDir: './screenshots'
  });

  console.log('🦞 Starting browser...');
  
  // Start the browser
  const startResult = await browser.start();
  console.log(startResult);

  // Navigate to a website
  console.log('\n📍 Navigating to GitHub...');
  const navResult = await browser.navigate('https://github.com/openclaw/openclaw');
  console.log(navResult);

  // Wait for page to load
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Take a screenshot
  console.log('\n📸 Taking screenshot...');
  const screenshotResult = await browser.screenshot({
    filename: 'openclaw-github.png'
  });
  console.log(screenshotResult);

  // Get page snapshot with metadata
  console.log('\n📄 Getting page snapshot...');
  const snapshotResult = await browser.snapshot({
    includeText: true,
    includeMetadata: true,
    maxChars: 10000
  });
  console.log(`Title: ${snapshotResult.title}`);
  console.log(`Links found: ${snapshotResult.metadata?.links?.length || 0}`);
  console.log(`Headings found: ${snapshotResult.metadata?.headings?.length || 0}`);

  // Perform an action - scroll down
  console.log('\n⬇️ Scrolling down...');
  await browser.act('scroll', { y: 500 });
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Take another screenshot
  console.log('\n📸 Taking another screenshot after scroll...');
  const screenshot2Result = await browser.screenshot({
    filename: 'openclaw-github-scrolled.png'
  });
  console.log(screenshot2Result);

  // Open a new tab
  console.log('\n🗂️ Opening new tab...');
  const newTabResult = await browser.openTab('https://docs.openclaw.ai', 'docs-tab');
  console.log(newTabResult);

  await new Promise(resolve => setTimeout(resolve, 2000));

  // List all tabs
  console.log('\n📋 Listing all tabs...');
  const tabsResult = await browser.listTabs();
  console.log(tabsResult);

  // Save PDF
  console.log('\n💾 Saving as PDF...');
  const pdfResult = await browser.savePdf({
    filename: 'openclaw-docs.pdf'
  });
  console.log(pdfResult);

  // Get status
  console.log('\n📊 Browser status...');
  const statusResult = await browser.status();
  console.log(statusResult);

  // Wait a bit before closing
  console.log('\n⏳ Waiting 3 seconds before cleanup...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Stop the browser
  console.log('\n🛑 Stopping browser...');
  const stopResult = await browser.stop();
  console.log(stopResult);

  console.log('\n✅ Example complete!');
}

// Run the example
main().catch(console.error);
