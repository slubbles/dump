#!/usr/bin/env node

/**
 * CLI for Browser Control
 * Inspired by OpenClaw's browser control interface
 */

import { Command } from 'commander';
import { BrowserControl } from './browser-control.js';

const program = new Command();

// Global browser instance
let browser = null;

const getBrowser = (options = {}) => {
  if (!browser) {
    browser = new BrowserControl({
      headless: options.headless !== false ? true : false, // Default to headless
      screenshotDir: './screenshots',
      ...options
    });
  }
  return browser;
};

program
  .name('claw-browser')
  .description('Browser control CLI inspired by OpenClaw')
  .version('1.0.0');

// Start browser
program
  .command('start')
  .description('Start the browser instance')
  .option('-h, --headless', 'Run in headless mode')
  .option('-d, --user-data-dir <path>', 'User data directory for profiles')
  .action(async (options) => {
    const browser = new BrowserControl({
      headless: options.headless || false,
      userDataDir: options.userDataDir
    });
    
    const result = await browser.start();
    console.log(JSON.stringify(result, null, 2));
    
    if (result.ok) {
      console.log('\n✅ Browser started! Use other commands to control it.');
      console.log('Keep this terminal open or the browser will close.\n');
      
      // Keep process alive
      await new Promise(() => {});
    }
  });

// Navigate
program
  .command('navigate <url>')
  .description('Navigate to a URL')
  .option('-t, --tab-id <id>', 'Tab ID (default: main)')
  .action(async (url, options) => {
    const browser = getBrowser();
    await browser.start();
    
    const result = await browser.navigate(url, {
      tabId: options.tabId
    });
    
    console.log(JSON.stringify(result, null, 2));
    await browser.stop();
  });

// Take screenshot
program
  .command('screenshot')
  .description('Take a screenshot of the current page')
  .option('-u, --url <url>', 'Navigate to URL before screenshot')
  .option('-f, --filename <name>', 'Screenshot filename')
  .option('-F, --full-page', 'Capture full page (default: true)', true)
  .option('-t, --tab-id <id>', 'Tab ID (default: main)')
  .option('--no-headless', 'Run with visible browser')
  .action(async (options) => {
    const browser = getBrowser({ headless: options.headless });
    await browser.start();
    
    if (options.url) {
      await browser.navigate(options.url);
      // Wait a bit for page to load
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    const result = await browser.screenshot({
      filename: options.filename,
      fullPage: options.fullPage,
      tabId: options.tabId
    });
    
    console.log(JSON.stringify(result, null, 2));
    
    if (result.ok) {
      console.log(`\n✅ Screenshot saved to: ${result.path}`);
    }
    
    await browser.stop();
  });

// Get snapshot
program
  .command('snapshot')
  .description('Get page snapshot (HTML and metadata)')
  .option('-u, --url <url>', 'Navigate to URL before snapshot')
  .option('-t, --include-text', 'Include visible text content')
  .option('-m, --include-metadata', 'Include metadata (links, headings)')
  .option('-c, --max-chars <number>', 'Maximum characters in content', '50000')
  .action(async (options) => {
    const browser = getBrowser();
    await browser.start();
    
    if (options.url) {
      await browser.navigate(options.url);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    const result = await browser.snapshot({
      includeText: options.includeText,
      includeMetadata: options.includeMetadata,
      maxChars: parseInt(options.maxChars)
    });
    
    console.log(JSON.stringify(result, null, 2));
    await browser.stop();
  });

// Perform action
program
  .command('act <action>')
  .description('Perform an action (click, type, scroll, wait, evaluate)')
  .option('-u, --url <url>', 'Navigate to URL first')
  .option('-s, --selector <selector>', 'CSS selector for action')
  .option('-x, --text <text>', 'Text to type')
  .option('-v, --value <value>', 'Value for select action')
  .option('-S, --script <script>', 'JavaScript to evaluate')
  .option('-y, --scroll-y <pixels>', 'Pixels to scroll')
  .option('-d, --duration <ms>', 'Wait duration in milliseconds')
  .action(async (action, options) => {
    const browser = getBrowser();
    await browser.start();
    
    if (options.url) {
      await browser.navigate(options.url);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    const actOptions = {
      selector: options.selector,
      text: options.text,
      value: options.value,
      script: options.script,
      y: options.scrollY ? parseInt(options.scrollY) : undefined,
      duration: options.duration ? parseInt(options.duration) : undefined
    };
    
    const result = await browser.act(action, actOptions);
    console.log(JSON.stringify(result, null, 2));
    await browser.stop();
  });

// Open tab
program
  .command('open-tab')
  .description('Open a new tab')
  .option('-u, --url <url>', 'URL to open in new tab')
  .option('-i, --id <id>', 'Custom tab ID')
  .action(async (options) => {
    const browser = getBrowser();
    await browser.start();
    
    const result = await browser.openTab(options.url, options.id);
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n✅ Tab opened! Keep this terminal open.');
    await new Promise(() => {});
  });

// List tabs
program
  .command('list-tabs')
  .description('List all open tabs')
  .action(async () => {
    const browser = getBrowser();
    await browser.start();
    
    const result = await browser.listTabs();
    console.log(JSON.stringify(result, null, 2));
    await browser.stop();
  });

// Status
program
  .command('status')
  .description('Get browser status')
  .action(async () => {
    const browser = getBrowser();
    const result = await browser.status();
    console.log(JSON.stringify(result, null, 2));
  });

// Save PDF
program
  .command('pdf')
  .description('Save current page as PDF')
  .option('-u, --url <url>', 'Navigate to URL before saving')
  .option('-f, --filename <name>', 'PDF filename')
  .option('-F, --format <format>', 'Page format (A4, Letter, etc.)', 'A4')
  .action(async (options) => {
    const browser = getBrowser();
    await browser.start();
    
    if (options.url) {
      await browser.navigate(options.url);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    const result = await browser.savePdf({
      filename: options.filename,
      format: options.format
    });
    
    console.log(JSON.stringify(result, null, 2));
    
    if (result.ok) {
      console.log(`\n✅ PDF saved to: ${result.path}`);
    }
    
    await browser.stop();
  });

// Interactive mode
program
  .command('interactive')
  .description('Start browser in interactive mode')
  .option('-u, --url <url>', 'Initial URL to open')
  .action(async (options) => {
    const browser = new BrowserControl({
      headless: false
    });
    
    await browser.start();
    
    if (options.url) {
      const navResult = await browser.navigate(options.url);
      console.log(`Navigated to: ${navResult.url}`);
    }
    
    console.log('\n🦞 Browser Control - Interactive Mode');
    console.log('=====================================');
    console.log('Browser is running. Press Ctrl+C to stop.\n');
    console.log('Commands you can run in another terminal:');
    console.log('  claw-browser navigate <url>');
    console.log('  claw-browser screenshot');
    console.log('  claw-browser snapshot --include-metadata');
    console.log('  claw-browser act click --selector "button"');
    console.log('  claw-browser pdf\n');
    
    // Handle cleanup
    process.on('SIGINT', async () => {
      console.log('\n\nStopping browser...');
      await browser.stop();
      process.exit(0);
    });
    
    // Keep alive
    await new Promise(() => {});
  });

program.parse();
