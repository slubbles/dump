/**
 * PROOF OF CONCEPT: Website Change Detection & Monitoring System
 * 
 * Demonstrates:
 * - Continuous monitoring
 * - Change detection via screenshots
 * - Alert system
 * - Historical archival
 * - Visual diff generation
 * 
 * Real-world: Monitor competitor sites, detect outages, track updates
 */

import { BrowserControl } from '../src/browser-control.js';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { createHash } from 'crypto';

class WebsiteMonitor {
  constructor(options = {}) {
    this.monitorDir = options.monitorDir || './monitoring';
    this.checkInterval = options.checkInterval || 60000; // 1 minute
    this.browser = null;
    this.monitoring = new Map();
    this.running = false;
  }

  async init() {
    await mkdir(this.monitorDir, { recursive: true });
    this.browser = new BrowserControl({
      headless: true,
      screenshotDir: this.monitorDir
    });
    await this.browser.start();
    console.log('🦞 Website Monitor initialized');
  }

  hashContent(content) {
    return createHash('md5').update(content).digest('hex');
  }

  async captureBaseline(url, name) {
    console.log(`\n📊 Capturing baseline for ${name}...`);
    
    try {
      // Navigate
      await this.browser.navigate(url);
      await this.browser.act('wait', { duration: 2000 });

      // Get snapshot
      const snapshot = await this.browser.snapshot({
        includeText: true,
        includeMetadata: true
      });

      // Take screenshot
      const screenshot = await this.browser.screenshot({
        filename: `${name}-baseline.png`
      });

      const baseline = {
        url,
        name,
        capturedAt: new Date().toISOString(),
        contentHash: this.hashContent(snapshot.content),
        textHash: this.hashContent(snapshot.textContent || ''),
        title: snapshot.title,
        screenshotPath: screenshot.path,
        linkCount: snapshot.metadata?.links?.length || 0,
        headingCount: snapshot.metadata?.headings?.length || 0
      };

      // Save baseline
      const baselinePath = `${this.monitorDir}/${name}-baseline.json`;
      await writeFile(baselinePath, JSON.stringify(baseline, null, 2));

      console.log(`✓ Baseline captured: ${baselinePath}`);
      console.log(`  Content hash: ${baseline.contentHash.substring(0, 8)}...`);
      console.log(`  Links: ${baseline.linkCount}, Headings: ${baseline.headingCount}`);

      return baseline;

    } catch (error) {
      console.error(`❌ Failed to capture baseline: ${error.message}`);
      return null;
    }
  }

  async checkForChanges(url, name) {
    const baselinePath = `${this.monitorDir}/${name}-baseline.json`;
    
    if (!existsSync(baselinePath)) {
      console.log(`⚠️  No baseline found for ${name}, creating one...`);
      return await this.captureBaseline(url, name);
    }

    try {
      // Load baseline
      const baselineData = await readFile(baselinePath, 'utf-8');
      const baseline = JSON.parse(baselineData);

      // Navigate to current state
      await this.browser.navigate(url);
      await this.browser.act('wait', { duration: 2000 });

      // Get current snapshot
      const snapshot = await this.browser.snapshot({
        includeText: true,
        includeMetadata: true
      });

      const currentContentHash = this.hashContent(snapshot.content);
      const currentTextHash = this.hashContent(snapshot.textContent || '');

      const changes = {
        url,
        name,
        checkedAt: new Date().toISOString(),
        contentChanged: currentContentHash !== baseline.contentHash,
        textChanged: currentTextHash !== baseline.textHash,
        titleChanged: snapshot.title !== baseline.title,
        linkCountChanged: (snapshot.metadata?.links?.length || 0) !== baseline.linkCount,
        headingCountChanged: (snapshot.metadata?.headings?.length || 0) !== baseline.headingCount,
        currentHash: currentContentHash,
        baselineHash: baseline.contentHash,
        currentTitle: snapshot.title,
        baselineTitle: baseline.title,
        currentLinks: snapshot.metadata?.links?.length || 0,
        baselineLinks: baseline.linkCount,
        currentHeadings: snapshot.metadata?.headings?.length || 0,
        baselineHeadings: baseline.headingCount
      };

      // If any changes detected, take screenshot
      if (changes.contentChanged || changes.titleChanged) {
        const timestamp = Date.now();
        const screenshot = await this.browser.screenshot({
          filename: `${name}-${timestamp}.png`
        });
        changes.screenshotPath = screenshot.path;

        // Log changes
        console.log(`\n🚨 CHANGES DETECTED: ${name}`);
        if (changes.titleChanged) {
          console.log(`  Title: "${baseline.title}" → "${snapshot.title}"`);
        }
        if (changes.contentChanged) {
          console.log(`  Content hash changed`);
        }
        if (changes.linkCountChanged) {
          console.log(`  Links: ${baseline.linkCount} → ${snapshot.metadata?.links?.length || 0}`);
        }
        if (changes.headingCountChanged) {
          console.log(`  Headings: ${baseline.headingCount} → ${snapshot.metadata?.headings?.length || 0}`);
        }
        console.log(`  Screenshot: ${screenshot.path}`);

        // Save change record
        const changePath = `${this.monitorDir}/${name}-change-${timestamp}.json`;
        await writeFile(changePath, JSON.stringify(changes, null, 2));

      } else {
        console.log(`✓ ${name}: No changes (${new Date().toLocaleTimeString()})`);
      }

      return changes;

    } catch (error) {
      console.error(`❌ Error checking ${name}: ${error.message}`);
      return null;
    }
  }

  async addSite(url, name, captureBaseline = true) {
    this.monitoring.set(name, {
      url,
      name,
      addedAt: new Date().toISOString(),
      checks: 0,
      lastCheck: null,
      changes: []
    });

    if (captureBaseline) {
      await this.captureBaseline(url, name);
    }

    console.log(`✓ Added ${name} to monitoring`);
  }

  async startMonitoring() {
    if (this.running) {
      console.log('⚠️  Already monitoring');
      return;
    }

    this.running = true;
    console.log('\n🔄 Starting continuous monitoring...');
    console.log(`   Interval: ${this.checkInterval / 1000}s`);
    console.log(`   Sites: ${this.monitoring.size}`);
    console.log('   Press Ctrl+C to stop\n');

    // Monitor loop
    while (this.running) {
      for (const [name, site] of this.monitoring) {
        if (!this.running) break;

        const changes = await this.checkForChanges(site.url, name);
        
        site.checks++;
        site.lastCheck = new Date().toISOString();
        
        if (changes && (changes.contentChanged || changes.titleChanged)) {
          site.changes.push(changes);
        }
      }

      // Wait before next check
      if (this.running) {
        await new Promise(resolve => setTimeout(resolve, this.checkInterval));
      }
    }
  }

  async stopMonitoring() {
    console.log('\n🛑 Stopping monitoring...');
    this.running = false;
    
    // Generate summary report
    const report = {
      stoppedAt: new Date().toISOString(),
      totalSites: this.monitoring.size,
      sites: Array.from(this.monitoring.values())
    };

    const reportPath = `${this.monitorDir}/monitoring-report-${Date.now()}.json`;
    await writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📊 Report saved: ${reportPath}`);
  }

  async cleanup() {
    this.running = false;
    if (this.browser) {
      await this.browser.stop();
    }
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];
  
  const monitor = new WebsiteMonitor({
    checkInterval: 30000 // 30 seconds for demo
  });

  await monitor.init();

  // Handle Ctrl+C
  process.on('SIGINT', async () => {
    await monitor.stopMonitoring();
    await monitor.cleanup();
    process.exit(0);
  });

  if (command === 'baseline') {
    // Capture baselines only
    const sites = [
      { url: 'https://news.ycombinator.com', name: 'hackernews' },
      { url: 'https://github.com/trending', name: 'github-trending' },
      { url: 'https://example.com', name: 'example' }
    ];

    for (const site of sites) {
      await monitor.captureBaseline(site.url, site.name);
    }

    await monitor.cleanup();

  } else if (command === 'check') {
    // One-time check
    const name = process.argv[3] || 'hackernews';
    const url = process.argv[4] || 'https://news.ycombinator.com';
    
    await monitor.addSite(url, name, false);
    await monitor.checkForChanges(url, name);
    await monitor.cleanup();

  } else {
    // Continuous monitoring
    console.log('🦞 WEBSITE CHANGE DETECTOR\n');
    
    // Add sites to monitor
    await monitor.addSite('https://news.ycombinator.com', 'hackernews');
    await monitor.addSite('https://github.com/trending', 'github-trending');
    await monitor.addSite('https://example.com', 'example');

    // Start monitoring
    await monitor.startMonitoring();
    
    await monitor.cleanup();
  }
}

main().catch(async (err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
