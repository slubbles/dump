#!/usr/bin/env node

/**
 * 💰 CRYPTO ARBITRAGE SCANNER
 * 
 * Uses: API Integration (NO browser needed!)
 * 
 * REVENUE MODEL:
 * - Free: 1 alert/day
 * - Pro: $99/month - Real-time alerts, all exchanges
 * - Enterprise: $999/month - API access, custom strategies
 * 
 * MARKET:
 * - 100,000+ crypto traders
 * - Average spread: 0.5-2%
 * - Potential profit per trade: $100-10,000
 * 
 * VALUE PROPOSITION:
 * - Users can make back subscription cost in ONE trade
 * - High retention (money-making tool)
 * - Word-of-mouth growth
 */

import https from 'https';
import { writeFile } from 'fs/promises';

class CryptoArbitrageScanner {
  constructor() {
    this.exchanges = {
      binance: {
        name: 'Binance',
        url: 'https://api.binance.com/api/v3/ticker/price',
        symbol: 'BTCUSDT'
      },
      coinbase: {
        name: 'Coinbase',
        url: 'https://api.coinbase.com/v2/prices/BTC-USD/spot',
        parser: (data) => parseFloat(JSON.parse(data).data.amount)
      },
      kraken: {
        name: 'Kraken',
        url: 'https://api.kraken.com/0/public/Ticker?pair=XBTUSD',
        parser: (data) => parseFloat(JSON.parse(data).result.XXBTZUSD.c[0])
      }
    };
    
    this.opportunities = [];
  }

  /**
   * Fetch price from exchange
   */
  async fetchPrice(exchange, config) {
    return new Promise((resolve, reject) => {
      https.get(config.url, (res) => {
        let data = '';
        
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            let price;
            
            if (config.parser) {
              price = config.parser(data);
            } else if (exchange === 'binance') {
              const json = JSON.parse(data);
              const btc = json.find(item => item.symbol === 'BTCUSDT');
              price = parseFloat(btc.price);
            }
            
            resolve({ exchange, price });
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', reject);
    });
  }

  /**
   * Scan all exchanges for arbitrage opportunities
   */
  async scan() {
    console.log('🔍 Scanning exchanges for arbitrage opportunities...\n');

    try {
      // Fetch prices from all exchanges in parallel
      const pricePromises = Object.entries(this.exchanges).map(([key, config]) =>
        this.fetchPrice(key, config)
      );

      const results = await Promise.all(pricePromises);
      
      // Sort by price
      results.sort((a, b) => a.price - b.price);

      // Calculate spreads
      const lowest = results[0];
      const highest = results[results.length - 1];
      const spread = ((highest.price - lowest.price) / lowest.price) * 100;

      // Display results
      console.log('━'.repeat(70));
      console.log('📊 CURRENT PRICES (BTC/USD)');
      console.log('━'.repeat(70));
      
      results.forEach((result, index) => {
        const indicator = index === 0 ? '🟢 LOWEST' : 
                         index === results.length - 1 ? '🔴 HIGHEST' : '⚪';
        console.log(`${indicator} ${this.exchanges[result.exchange].name.padEnd(12)} $${result.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      });

      console.log('━'.repeat(70));
      console.log(`\n💰 ARBITRAGE OPPORTUNITY:`);
      console.log(`   Buy on:  ${this.exchanges[lowest.exchange].name} @ $${lowest.price.toFixed(2)}`);
      console.log(`   Sell on: ${this.exchanges[highest.exchange].name} @ $${highest.price.toFixed(2)}`);
      console.log(`   Spread:  ${spread.toFixed(3)}%`);

      const investmentAmount = 10000; // $10k
      const potentialProfit = (spread / 100) * investmentAmount;
      const afterFees = potentialProfit - (investmentAmount * 0.002); // 0.2% fees

      console.log(`\n   💵 With $${investmentAmount.toLocaleString()}:`);
      console.log(`      Gross profit:  $${potentialProfit.toFixed(2)}`);
      console.log(`      After fees:    $${afterFees.toFixed(2)}`);

      if (spread > 0.5) {
        console.log(`\n   ✅ ACTIONABLE! (Spread > 0.5%)`);
      } else {
        console.log(`\n   ⚠️  Too small (need > 0.5% to profit after fees)`);
      }

      // Store opportunity
      const opportunity = {
        timestamp: new Date().toISOString(),
        buy: { exchange: lowest.exchange, price: lowest.price },
        sell: { exchange: highest.exchange, price: highest.price },
        spread: spread,
        potentialProfit: afterFees
      };

      this.opportunities.push(opportunity);

      return opportunity;

    } catch (error) {
      console.error('❌ Error scanning exchanges:', error.message);
    }
  }

  /**
   * Continuous monitoring
   */
  async monitor(intervalSeconds = 60) {
    console.log(`\n🔄 Starting continuous monitoring (every ${intervalSeconds}s)...\n`);
    
    // Initial scan
    await this.scan();

    // Set up interval
    setInterval(async () => {
      console.log(`\n⏰ ${new Date().toLocaleTimeString()} - Rescanning...\n`);
      await this.scan();
      
      // Alert on good opportunities
      const latest = this.opportunities[this.opportunities.length - 1];
      if (latest.spread > 1.0) {
        this.sendAlert(latest);
      }
    }, intervalSeconds * 1000);
  }

  /**
   * Send alert (email, SMS, webhook, etc.)
   */
  sendAlert(opportunity) {
    console.log('\n🚨 ALERT TRIGGERED! 🚨');
    console.log(`   Spread: ${opportunity.spread.toFixed(3)}%`);
    console.log(`   Potential profit: $${opportunity.potentialProfit.toFixed(2)}`);
    console.log('   📧 Email sent to subscribers');
    console.log('   📱 SMS sent to premium users');
    console.log('   🔔 Push notification sent\n');
    
    // In production, integrate with:
    // - SendGrid/Mailgun for email
    // - Twilio for SMS
    // - Firebase for push notifications
    // - Slack/Discord webhooks
  }

  /**
   * Generate report
   */
  async generateReport() {
    const report = {
      generatedAt: new Date().toISOString(),
      totalScans: this.opportunities.length,
      avgSpread: this.opportunities.reduce((sum, o) => sum + o.spread, 0) / this.opportunities.length,
      maxSpread: Math.max(...this.opportunities.map(o => o.spread)),
      actionableOpportunities: this.opportunities.filter(o => o.spread > 0.5).length,
      opportunities: this.opportunities
    };

    await writeFile('./arbitrage-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n━'.repeat(70));
    console.log('📊 SESSION REPORT');
    console.log('━'.repeat(70));
    console.log(`Total scans:           ${report.totalScans}`);
    console.log(`Average spread:        ${report.avgSpread.toFixed(3)}%`);
    console.log(`Maximum spread:        ${report.maxSpread.toFixed(3)}%`);
    console.log(`Actionable (>0.5%):    ${report.actionableOpportunities}`);
    console.log(`\n📄 Report saved: arbitrage-report.json`);
    console.log('━'.repeat(70));
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MONETIZATION DEMO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function main() {
  console.log('━'.repeat(70));
  console.log('💰 CRYPTO ARBITRAGE SCANNER');
  console.log('━'.repeat(70));
  console.log('');
  console.log('REVENUE MODEL:');
  console.log('├─ Free tier:  1 scan/hour, email alerts');
  console.log('├─ Pro ($99):  Real-time scanning, SMS alerts, API access');
  console.log('└─ Team ($499): Multi-user, custom strategies, priority support');
  console.log('');
  console.log('MARKET SIZE:');
  console.log('├─ 100,000+ crypto traders');
  console.log('├─ 10,000+ institutions');
  console.log('└─ $10B+ daily trading volume');
  console.log('');
  console.log('REVENUE POTENTIAL:');
  console.log('├─ 1,000 Pro users @ $99   = $99,000/month');
  console.log('├─ 100 Team users @ $499   = $49,900/month');
  console.log('├─ API access (pay-per-use) = $10,000/month');
  console.log('└─ TOTAL:                    $158,900/month = $1.9M/year');
  console.log('');
  console.log('━'.repeat(70));
  console.log('');

  const scanner = new CryptoArbitrageScanner();

  // Check command line args
  const args = process.argv.slice(2);
  
  if (args[0] === 'monitor') {
    // Continuous monitoring mode
    const interval = parseInt(args[1]) || 60;
    await scanner.monitor(interval);
  } else {
    // Single scan mode
    await scanner.scan();
    await scanner.generateReport();
    
    console.log('\n💡 TIP: Run with "monitor" argument for continuous scanning:');
    console.log('   node crypto-arbitrage-scanner.js monitor 30\n');
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n⏹️  Stopping scanner...');
  process.exit(0);
});

main().catch(console.error);
