/**
 * PROOF OF CONCEPT: Multi-Site Price Comparison Engine
 * 
 * This demonstrates one of the 60+ possibilities:
 * - Parallel multi-site scraping
 * - Price extraction
 * - Comparison analysis
 * - JSON report generation
 * 
 * Real-world application: E-commerce price monitoring
 */

import { BrowserControl } from '../src/browser-control.js';
import { writeFile } from 'fs/promises';

class PriceComparisonEngine {
  constructor() {
    this.browsers = new Map();
    this.results = [];
  }

  async createBrowser(id) {
    const browser = new BrowserControl({
      headless: true,
      screenshotDir: './price-comparison'
    });
    await browser.start();
    this.browsers.set(id, browser);
    return browser;
  }

  async searchProduct(site, productQuery) {
    const strategies = {
      amazon: {
        searchUrl: `https://www.amazon.com/s?k=${encodeURIComponent(productQuery)}`,
        extract: () => {
          const products = [];
          document.querySelectorAll('[data-component-type="s-search-result"]').forEach((item, idx) => {
            if (idx < 5) {
              const title = item.querySelector('h2 a span')?.textContent;
              const price = item.querySelector('.a-price-whole')?.textContent;
              const rating = item.querySelector('.a-icon-star-small')?.textContent;
              const link = item.querySelector('h2 a')?.href;
              
              if (title && price) {
                products.push({
                  title: title.trim(),
                  price: parseFloat(price.replace(/[^0-9.]/g, '')),
                  rating: rating ? parseFloat(rating) : null,
                  link,
                  site: 'Amazon'
                });
              }
            }
          });
          return products;
        }
      },
      
      ebay: {
        searchUrl: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(productQuery)}`,
        extract: () => {
          const products = [];
          document.querySelectorAll('.s-item').forEach((item, idx) => {
            if (idx < 5 && idx > 0) { // Skip first item (usually ad)
              const title = item.querySelector('.s-item__title')?.textContent;
              const price = item.querySelector('.s-item__price')?.textContent;
              const link = item.querySelector('.s-item__link')?.href;
              
              if (title && price && !title.includes('Shop on eBay')) {
                products.push({
                  title: title.trim(),
                  price: parseFloat(price.replace(/[^0-9.]/g, '')),
                  rating: null,
                  link,
                  site: 'eBay'
                });
              }
            }
          });
          return products;
        }
      },

      walmart: {
        searchUrl: `https://www.walmart.com/search?q=${encodeURIComponent(productQuery)}`,
        extract: () => {
          const products = [];
          document.querySelectorAll('[data-item-id]').forEach((item, idx) => {
            if (idx < 5) {
              const title = item.querySelector('[data-automation-id="product-title"]')?.textContent;
              const price = item.querySelector('[data-automation-id="product-price"]')?.textContent;
              const link = item.querySelector('a')?.href;
              
              if (title && price) {
                products.push({
                  title: title.trim(),
                  price: parseFloat(price.replace(/[^0-9.]/g, '')),
                  rating: null,
                  link: link ? `https://www.walmart.com${link}` : null,
                  site: 'Walmart'
                });
              }
            }
          });
          return products;
        }
      }
    };

    return strategies[site] || null;
  }

  async compareProduct(productQuery, sites = ['amazon', 'ebay', 'walmart']) {
    console.log(`\n🔍 Searching for: "${productQuery}"\n`);
    console.log(`Sites: ${sites.join(', ')}`);
    console.log('━'.repeat(60));

    const searchPromises = sites.map(async (site, idx) => {
      try {
        // Create separate browser for each site
        const browserId = `${site}-${Date.now()}`;
        const browser = await this.createBrowser(browserId);
        
        const strategy = await this.searchProduct(site, productQuery);
        if (!strategy) {
          console.log(`⚠️  ${site}: No strategy defined`);
          return null;
        }

        console.log(`\n📌 Searching ${site}...`);
        
        // Navigate to search page
        await browser.navigate(strategy.searchUrl);
        await browser.act('wait', { duration: 3000 }); // Wait for results

        // Take screenshot
        await browser.screenshot({ 
          filename: `${site}-${productQuery.replace(/\s+/g, '-')}.png` 
        });

        // Extract product data
        const result = await browser.act('evaluate', {
          script: strategy.extract
        });

        console.log(`✓ ${site}: Found ${result.result?.length || 0} products`);

        // Cleanup this browser
        await browser.stop();
        this.browsers.delete(browserId);

        return {
          site,
          products: result.result || [],
          timestamp: new Date().toISOString()
        };

      } catch (error) {
        console.error(`❌ ${site}: ${error.message}`);
        return { site, products: [], error: error.message };
      }
    });

    // Wait for all searches to complete
    const results = await Promise.all(searchPromises);
    this.results = results.filter(r => r !== null);

    return this.analyze();
  }

  analyze() {
    console.log('\n━'.repeat(60));
    console.log('📊 PRICE COMPARISON ANALYSIS\n');

    // Flatten all products
    const allProducts = [];
    this.results.forEach(result => {
      result.products.forEach(product => {
        allProducts.push(product);
      });
    });

    if (allProducts.length === 0) {
      console.log('⚠️  No products found');
      return { analysis: 'no_data', results: this.results };
    }

    // Calculate statistics
    const prices = allProducts.map(p => p.price).filter(p => p > 0);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    // Find best deal
    const bestDeal = allProducts.find(p => p.price === minPrice);
    const worstDeal = allProducts.find(p => p.price === maxPrice);

    // Group by site
    const bySite = {};
    this.results.forEach(result => {
      bySite[result.site] = {
        count: result.products.length,
        avgPrice: result.products.length > 0 
          ? result.products.reduce((a, p) => a + p.price, 0) / result.products.length 
          : 0,
        minPrice: result.products.length > 0
          ? Math.min(...result.products.map(p => p.price))
          : 0
      };
    });

    // Console output
    console.log(`Total Products Found: ${allProducts.length}`);
    console.log(`Price Range: $${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`);
    console.log(`Average Price: $${avgPrice.toFixed(2)}`);
    console.log(`\n💰 BEST DEAL:`);
    console.log(`   ${bestDeal.title}`);
    console.log(`   ${bestDeal.site}: $${bestDeal.price.toFixed(2)}`);
    console.log(`   ${bestDeal.link}\n`);

    console.log(`💸 MOST EXPENSIVE:`);
    console.log(`   ${worstDeal.title}`);
    console.log(`   ${worstDeal.site}: $${worstDeal.price.toFixed(2)}\n`);

    console.log(`📈 BY SITE:`);
    Object.entries(bySite).forEach(([site, stats]) => {
      console.log(`   ${site}: ${stats.count} items, avg $${stats.avgPrice.toFixed(2)}`);
    });

    const analysis = {
      summary: {
        totalProducts: allProducts.length,
        priceRange: { min: minPrice, max: maxPrice },
        averagePrice: avgPrice,
        bestDeal,
        worstDeal,
        bySite
      },
      results: this.results,
      allProducts,
      timestamp: new Date().toISOString()
    };

    return analysis;
  }

  async cleanup() {
    for (const [id, browser] of this.browsers) {
      try {
        await browser.stop();
      } catch (e) {
        console.error(`Error cleaning up ${id}:`, e.message);
      }
    }
    this.browsers.clear();
  }
}

// Run the comparison
async function main() {
  const product = process.argv[2] || 'mechanical keyboard';
  const sites = process.argv.slice(3).length > 0 
    ? process.argv.slice(3) 
    : ['amazon', 'ebay'];

  console.log('🦞 PRICE COMPARISON ENGINE');
  console.log('━'.repeat(60));

  const engine = new PriceComparisonEngine();

  try {
    const analysis = await engine.compareProduct(product, sites);

    // Save report
    const reportPath = `price-comparison/${product.replace(/\s+/g, '-')}-report.json`;
    await writeFile(reportPath, JSON.stringify(analysis, null, 2));
    
    console.log(`\n━`.repeat(60));
    console.log(`✅ Report saved to: ${reportPath}`);
    console.log(`📸 Screenshots saved to: price-comparison/`);
    console.log('━'.repeat(60));

  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await engine.cleanup();
  }
}

main().catch(console.error);
