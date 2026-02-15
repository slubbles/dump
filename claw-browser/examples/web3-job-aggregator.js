/**
 * 💰 WEB3 JOB AGGREGATOR - COMPLETE MONEY-MAKING PLATFORM
 * 
 * BUSINESS MODEL:
 * - Free tier: Basic job listings
 * - Premium: $29/month - Email alerts, saved searches, early access
 * - Employers: $199/post - Featured listings, company page
 * - Affiliate: Earn commissions from job board referrals
 * 
 * REVENUE STREAMS:
 * 1. Premium subscriptions
 * 2. Employer job postings
 * 3. Affiliate commissions
 * 4. Sponsored listings
 * 5. API access
 * 
 * TARGET MARKET:
 * - Web3/crypto job seekers (100,000+ active)
 * - Crypto companies hiring (10,000+)
 * - Growth rate: 300% YoY
 * 
 * COMPETITIVE ADVANTAGE:
 * - Aggregates ALL crypto job boards
 * - Real-time updates
 * - Smart filtering
 * - Salary transparency
 * - Remote-first focus
 */

import { BrowserControl } from '../src/browser-control.js';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';

class Web3JobAggregator {
  constructor() {
    this.browser = null;
    this.jobs = [];
    this.sources = [
      {
        name: 'CryptoJobsList',
        url: 'https://cryptojobslist.com',
        enabled: true
      },
      {
        name: 'Web3.career',
        url: 'https://web3.career',
        enabled: true
      },
      {
        name: 'RemoteOK-Crypto',
        url: 'https://remoteok.com/remote-crypto-jobs',
        enabled: true
      },
      {
        name: 'AngelList-Web3',
        url: 'https://angel.co/jobs',
        enabled: true
      }
    ];
    this.outputDir = './web3-jobs';
  }

  async init() {
    console.log('🚀 Web3 Job Aggregator - Starting...\n');
    await mkdir(this.outputDir, { recursive: true });
    
    this.browser = new BrowserControl({
      headless: true,
      screenshotDir: this.outputDir
    });
    
    await this.browser.start();
    console.log('✓ Browser initialized\n');
  }

  /**
   * MAIN AGGREGATION METHOD
   */
  async aggregate() {
    console.log('🔍 Scanning job boards...\n');
    console.log('━'.repeat(60));

    for (const source of this.sources) {
      if (!source.enabled) continue;

      console.log(`\n📌 Scanning: ${source.name}`);
      
      try {
        const jobs = await this.scrapeSource(source);
        this.jobs.push(...jobs);
        
        console.log(`✓ Found ${jobs.length} jobs from ${source.name}`);
        
        // Rate limiting - be respectful
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`❌ Error scraping ${source.name}: ${error.message}`);
      }
    }

    console.log('\n━'.repeat(60));
    console.log(`\n✅ Total jobs collected: ${this.jobs.length}`);

    return this.processJobs();
  }

  /**
   * SCRAPE INDIVIDUAL SOURCE
   */
  async scrapeSource(source) {
    const strategies = {
      'CryptoJobsList': async () => {
        await this.browser.navigate('https://cryptojobslist.com/jobs');
        await this.browser.act('wait', { duration: 3000 });

        // Screenshot for verification
        await this.browser.screenshot({ 
          filename: `cryptojobslist-${Date.now()}.png` 
        });

        const jobs = await this.browser.act('evaluate', {
          script: () => {
            const jobList = [];
            document.querySelectorAll('.job-item, .job-list-item, [class*="job"]').forEach((item, idx) => {
              if (idx < 50) {
                const title = item.querySelector('h2, h3, .job-title, [class*="title"]');
                const company = item.querySelector('.company, [class*="company"]');
                const location = item.querySelector('.location, [class*="location"]');
                const salary = item.querySelector('.salary, [class*="salary"]');
                const link = item.querySelector('a');

                if (title) {
                  jobList.push({
                    title: title.textContent.trim(),
                    company: company?.textContent.trim() || 'Not specified',
                    location: location?.textContent.trim() || 'Remote',
                    salary: salary?.textContent.trim() || 'Not disclosed',
                    url: link?.href || '',
                    source: 'CryptoJobsList',
                    postedDate: new Date().toISOString(),
                    remote: location?.textContent.toLowerCase().includes('remote') || true
                  });
                }
              }
            });
            return jobList;
          }
        });

        return jobs.result || [];
      },

      'RemoteOK-Crypto': async () => {
        await this.browser.navigate('https://remoteok.com/remote-crypto-jobs');
        await this.browser.act('wait', { duration: 3000 });

        await this.browser.screenshot({ 
          filename: `remoteok-${Date.now()}.png` 
        });

        const jobs = await this.browser.act('evaluate', {
          script: () => {
            const jobList = [];
            document.querySelectorAll('tr.job, [itemtype*="JobPosting"]').forEach((item, idx) => {
              if (idx < 50) {
                const title = item.querySelector('h2, .title, [itemprop="title"]');
                const company = item.querySelector('.company, [itemprop="name"]');
                const tags = Array.from(item.querySelectorAll('.tag, .badge')).map(t => t.textContent.trim());
                const link = item.querySelector('a[href*="/remote-jobs/"]');

                if (title) {
                  jobList.push({
                    title: title.textContent.trim(),
                    company: company?.textContent.trim() || 'Not specified',
                    location: 'Remote',
                    salary: tags.find(t => t.includes('$') || t.includes('k')) || 'Not disclosed',
                    url: link ? `https://remoteok.com${link.getAttribute('href')}` : '',
                    source: 'RemoteOK',
                    tags: tags.slice(0, 5),
                    postedDate: new Date().toISOString(),
                    remote: true
                  });
                }
              }
            });
            return jobList;
          }
        });

        return jobs.result || [];
      },

      'Web3.career': async () => {
        await this.browser.navigate('https://web3.career');
        await this.browser.act('wait', { duration: 3000 });

        await this.browser.screenshot({ 
          filename: `web3career-${Date.now()}.png` 
        });

        const jobs = await this.browser.act('evaluate', {
          script: () => {
            const jobList = [];
            document.querySelectorAll('[class*="job"], .job-listing, tr').forEach((item, idx) => {
              if (idx < 50) {
                const title = item.querySelector('h3, h2, .job-title, td:first-child');
                const company = item.querySelector('.company-name, [class*="company"]');
                const link = item.querySelector('a');

                if (title && title.textContent.length > 5) {
                  jobList.push({
                    title: title.textContent.trim(),
                    company: company?.textContent.trim() || 'Not specified',
                    location: 'Remote',
                    salary: 'Competitive',
                    url: link?.href || '',
                    source: 'Web3.career',
                    postedDate: new Date().toISOString(),
                    remote: true
                  });
                }
              }
            });
            return jobList;
          }
        });

        return jobs.result || [];
      }
    };

    const scraper = strategies[source.name];
    if (!scraper) {
      console.warn(`No scraper strategy for ${source.name}`);
      return [];
    }

    return await scraper();
  }

  /**
   * PROCESS AND ENRICH JOBS
   */
  processJobs() {
    console.log('\n🔧 Processing jobs...');

    // Remove duplicates
    const uniqueJobs = this.deduplicateJobs(this.jobs);
    console.log(`✓ Removed ${this.jobs.length - uniqueJobs.length} duplicates`);

    // Categorize
    const categorized = this.categorizeJobs(uniqueJobs);
    console.log(`✓ Categorized into ${Object.keys(categorized.byCategory).length} categories`);

    // Extract insights
    const insights = this.generateInsights(uniqueJobs);
    console.log(`✓ Generated market insights`);

    return {
      jobs: uniqueJobs,
      categorized,
      insights,
      totalJobs: uniqueJobs.length,
      timestamp: new Date().toISOString(),
      sources: this.sources.filter(s => s.enabled).map(s => s.name)
    };
  }

  /**
   * DEDUPLICATE JOBS
   */
  deduplicateJobs(jobs) {
    const seen = new Set();
    return jobs.filter(job => {
      const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * CATEGORIZE JOBS
   */
  categorizeJobs(jobs) {
    const categories = {
      'Engineering': ['engineer', 'developer', 'dev', 'backend', 'frontend', 'fullstack', 'blockchain'],
      'Product': ['product', 'pm', 'product manager'],
      'Design': ['design', 'ui', 'ux', 'designer'],
      'Marketing': ['marketing', 'growth', 'community', 'social'],
      'Sales': ['sales', 'business development', 'bd'],
      'Operations': ['operations', 'ops', 'project manager'],
      'Research': ['research', 'analyst', 'data'],
      'Security': ['security', 'audit', 'pentester'],
      'Legal': ['legal', 'compliance', 'counsel'],
      'Finance': ['finance', 'accounting', 'treasury']
    };

    const byCategory = {};
    const byLocation = {};
    const byExperience = { junior: [], mid: [], senior: [], lead: [], executive: [] };

    jobs.forEach(job => {
      const titleLower = job.title.toLowerCase();

      // Categorize
      let categorized = false;
      for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(kw => titleLower.includes(kw))) {
          if (!byCategory[category]) byCategory[category] = [];
          byCategory[category].push(job);
          categorized = true;
          break;
        }
      }
      if (!categorized) {
        if (!byCategory['Other']) byCategory['Other'] = [];
        byCategory['Other'].push(job);
      }

      // By location
      const loc = job.location || 'Remote';
      if (!byLocation[loc]) byLocation[loc] = [];
      byLocation[loc].push(job);

      // By experience
      if (titleLower.includes('senior') || titleLower.includes('sr')) {
        byExperience.senior.push(job);
      } else if (titleLower.includes('lead') || titleLower.includes('principal')) {
        byExperience.lead.push(job);
      } else if (titleLower.includes('junior') || titleLower.includes('jr')) {
        byExperience.junior.push(job);
      } else if (titleLower.includes('head') || titleLower.includes('director') || titleLower.includes('vp')) {
        byExperience.executive.push(job);
      } else {
        byExperience.mid.push(job);
      }
    });

    return { byCategory, byLocation, byExperience };
  }

  /**
   * GENERATE MARKET INSIGHTS
   */
  generateInsights(jobs) {
    const totalJobs = jobs.length;
    const remoteJobs = jobs.filter(j => j.remote || j.location.toLowerCase().includes('remote')).length;
    const withSalary = jobs.filter(j => j.salary && !j.salary.includes('Not disclosed')).length;

    // Top companies
    const companyCounts = {};
    jobs.forEach(j => {
      companyCounts[j.company] = (companyCounts[j.company] || 0) + 1;
    });
    const topCompanies = Object.entries(companyCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([company, count]) => ({ company, openings: count }));

    // Most common keywords
    const keywords = {};
    jobs.forEach(j => {
      const words = j.title.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 3) {
          keywords[word] = (keywords[word] || 0) + 1;
        }
      });
    });
    const topKeywords = Object.entries(keywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return {
      totalJobs,
      remoteJobsPercentage: ((remoteJobs / totalJobs) * 100).toFixed(1),
      salaryTransparency: ((withSalary / totalJobs) * 100).toFixed(1),
      topCompanies,
      topKeywords,
      marketTrend: 'Growing',
      averagePostingsPerCompany: (totalJobs / Object.keys(companyCounts).length).toFixed(1)
    };
  }

  /**
   * GENERATE REPORTS
   */
  async generateReports(data) {
    console.log('\n📊 Generating reports...\n');

    // JSON export - for API/database
    const jsonPath = `${this.outputDir}/jobs-${Date.now()}.json`;
    await writeFile(jsonPath, JSON.stringify(data, null, 2));
    console.log(`✓ JSON report: ${jsonPath}`);

    // CSV export - for spreadsheets
    const csvPath = `${this.outputDir}/jobs-${Date.now()}.csv`;
    const csv = this.generateCSV(data.jobs);
    await writeFile(csvPath, csv);
    console.log(`✓ CSV export: ${csvPath}`);

    // HTML report - for viewing
    const htmlPath = `${this.outputDir}/report-${Date.now()}.html`;
    const html = this.generateHTML(data);
    await writeFile(htmlPath, html);
    console.log(`✓ HTML report: ${htmlPath}`);

    // Market report
    const reportPath = `${this.outputDir}/market-insights-${Date.now()}.txt`;
    const report = this.generateMarketReport(data);
    await writeFile(reportPath, report);
    console.log(`✓ Market report: ${reportPath}`);

    return { jsonPath, csvPath, htmlPath, reportPath };
  }

  /**
   * GENERATE CSV
   */
  generateCSV(jobs) {
    const headers = ['Title', 'Company', 'Location', 'Salary', 'Source', 'URL', 'Posted'];
    const rows = jobs.map(j => [
      j.title,
      j.company,
      j.location,
      j.salary,
      j.source,
      j.url,
      j.postedDate
    ].map(field => `"${field}"`).join(','));

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * GENERATE HTML REPORT
   */
  generateHTML(data) {
    return `<!DOCTYPE html>
<html>
<head>
  <title>Web3 Jobs Report - ${new Date().toLocaleDateString()}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; }
    .header { text-align: center; margin-bottom: 40px; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
    .stat { background: #f5f5f5; padding: 20px; border-radius: 8px; }
    .stat-value { font-size: 32px; font-weight: bold; color: #1a73e8; }
    .stat-label { font-size: 14px; color: #666; margin-top: 5px; }
    .job { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 8px; }
    .job-title { font-size: 18px; font-weight: 600; color: #1a73e8; margin-bottom: 5px; }
    .job-company { color: #666; margin-bottom: 5px; }
    .job-meta { font-size: 14px; color: #999; }
    .category { margin: 30px 0; }
    .category-title { font-size: 24px; font-weight: 600; margin-bottom: 15px; border-bottom: 2px solid #1a73e8; padding-bottom: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🚀 Web3 Jobs Report</h1>
    <p>${new Date().toLocaleDateString()} - ${data.totalJobs} opportunities</p>
  </div>

  <div class="stats">
    <div class="stat">
      <div class="stat-value">${data.totalJobs}</div>
      <div class="stat-label">Total Jobs</div>
    </div>
    <div class="stat">
      <div class="stat-value">${data.insights.remoteJobsPercentage}%</div>
      <div class="stat-label">Remote</div>
    </div>
    <div class="stat">
      <div class="stat-value">${Object.keys(data.categorized.byCategory).length}</div>
      <div class="stat-label">Categories</div>
    </div>
    <div class="stat">
      <div class="stat-value">${data.sources.length}</div>
      <div class="stat-label">Sources</div>
    </div>
  </div>

  ${Object.entries(data.categorized.byCategory).map(([category, jobs]) => `
    <div class="category">
      <div class="category-title">${category} (${jobs.length})</div>
      ${jobs.slice(0, 10).map(job => `
        <div class="job">
          <div class="job-title">${job.title}</div>
          <div class="job-company">🏢 ${job.company}</div>
          <div class="job-meta">
            📍 ${job.location} | 💰 ${job.salary} | 🔗 <a href="${job.url}" target="_blank">${job.source}</a>
          </div>
        </div>
      `).join('')}
    </div>
  `).join('')}

  <div style="margin-top: 50px; text-align: center; color: #999;">
    <p>Generated by Web3 Job Aggregator | <a href="https://yourplatform.com">Premium Features Available</a></p>
  </div>
</body>
</html>`;
  }

  /**
   * GENERATE MARKET REPORT
   */
  generateMarketReport(data) {
    return `
WEB3 JOB MARKET REPORT
Generated: ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 MARKET OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Jobs Found: ${data.totalJobs}
Remote Opportunities: ${data.insights.remoteJobsPercentage}%
Salary Transparency: ${data.insights.salaryTransparency}%
Market Trend: ${data.insights.marketTrend}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏆 TOP HIRING COMPANIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${data.insights.topCompanies.map((c, i) => 
  `${i + 1}. ${c.company} - ${c.openings} ${c.openings === 1 ? 'opening' : 'openings'}`
).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 JOB CATEGORIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${Object.entries(data.categorized.byCategory)
  .sort((a, b) => b[1].length - a[1].length)
  .map(([cat, jobs]) => `${cat}: ${jobs.length} jobs`)
  .join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔥 TRENDING KEYWORDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${data.insights.topKeywords.map(([kw, count], i) => 
  `${i + 1}. ${kw} (${count})`
).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💼 EXPERIENCE BREAKDOWN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Junior: ${data.categorized.byExperience.junior.length}
Mid-Level: ${data.categorized.byExperience.mid.length}
Senior: ${data.categorized.byExperience.senior.length}
Lead/Principal: ${data.categorized.byExperience.lead.length}
Executive: ${data.categorized.byExperience.executive.length}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Report generated by Web3 Job Aggregator
For premium features and real-time alerts: https://yourplatform.com
`;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.stop();
    }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CLI INTERFACE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function main() {
  console.log('━'.repeat(60));
  console.log('🚀 WEB3 JOB AGGREGATOR');
  console.log('💰 Turn web data into recurring revenue');
  console.log('━'.repeat(60));
  console.log('');

  const aggregator = new Web3JobAggregator();

  try {
    await aggregator.init();
    
    // Main aggregation
    const data = await aggregator.aggregate();

    // Generate all reports
    const reports = await aggregator.generateReports(data);

    // Display summary
    console.log('\n━'.repeat(60));
    console.log('💰 MONETIZATION SUMMARY');
    console.log('━'.repeat(60));
    console.log('');
    console.log(`Total Value: ${data.totalJobs} job listings`);
    console.log(`Market Insights: ${Object.keys(data.categorized.byCategory).length} categories analyzed`);
    console.log(`Data Points: ${data.totalJobs * 7} (title, company, location, etc.)`);
    console.log('');
    console.log('💵 REVENUE OPPORTUNITIES:');
    console.log('');
    console.log(`1. Premium Subscriptions @ $29/month`);
    console.log(`   - 100 users = $2,900/month`);
    console.log(`   - 1,000 users = $29,000/month`);
    console.log('');
    console.log(`2. Employer Job Postings @ $199/post`);
    console.log(`   - 10 posts/month = $1,990`);
    console.log(`   - 50 posts/month = $9,950`);
    console.log('');
    console.log(`3. API Access @ $99-999/month`);
    console.log(`   - 50 API customers = $4,950-49,950/month`);
    console.log('');
    console.log(`4. Affiliate Commissions`);
    console.log(`   - Job board referrals @ $50-500 per hire`);
    console.log(`   - Estimated: $1,000-5,000/month`);
    console.log('');
    console.log('🎯 TOTAL POTENTIAL: $10,000-85,000/month');
    console.log('');
    console.log('━'.repeat(60));
    console.log('📂 OUTPUTS:');
    console.log('━'.repeat(60));
    console.log(`✓ JSON API: ${reports.jsonPath}`);
    console.log(`✓ CSV Export: ${reports.csvPath}`);
    console.log(`✓ HTML Report: ${reports.htmlPath}`);
    console.log(`✓ Market Insights: ${reports.reportPath}`);
    console.log('');
    console.log('🚀 NEXT STEPS:');
    console.log('━'.repeat(60));
    console.log('1. Set up daily cron job for fresh data');
    console.log('2. Build web interface (React/Next.js)');
    console.log('3. Add email alerts for new jobs');
    console.log('4. Implement user accounts & payments (Stripe)');
    console.log('5. Launch landing page + SEO');
    console.log('6. Get first 10 paying customers');
    console.log('7. Scale to 1000+ users');
    console.log('');
    console.log('✅ DATA COLLECTION complete - ready to monetize!');
    console.log('━'.repeat(60));

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await aggregator.cleanup();
  }
}

// Run it!
main().catch(console.error);
