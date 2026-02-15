import { BrowserControl } from './src/browser-control.js';

async function test() {
  console.log('Creating browser instance...');
  const browser = new BrowserControl({
    headless: true
  });
  
  console.log('Starting browser...');
  const startResult = await browser.start();
  console.log('Start result:', startResult);
  
  console.log('Browser status:', await browser.status());
  
  console.log('Navigating...');
  const navResult = await browser.navigate('https://example.com');
  console.log('Nav result:', navResult);
  
  console.log('Taking screenshot...');
  const screenshotResult = await browser.screenshot({
    filename: 'test.png'
  });
  console.log('Screenshot result:', screenshotResult);
  
  console.log('Stopping browser...');
  await browser.stop();
  console.log('Test complete!');
}

test().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
