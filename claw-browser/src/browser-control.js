/**
 * Browser Control Module
 * Inspired by OpenClaw's browser control capabilities
 */

import puppeteer from 'puppeteer';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';

export class BrowserControl {
  constructor(options = {}) {
    this.browser = null;
    this.page = null;
    this.options = {
      headless: options.headless !== false,
      userDataDir: options.userDataDir || null,
      viewport: options.viewport || { width: 1280, height: 720 },
      timeout: options.timeout || 30000,
      screenshotDir: options.screenshotDir || './screenshots',
      ...options
    };
    this.tabs = new Map();
  }

  /**
   * Start the browser instance
   */
  async start() {
    if (this.browser) {
      return { ok: true, message: 'Browser already running' };
    }

    try {
      const launchOptions = {
        headless: this.options.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
        ]
      };

      if (this.options.userDataDir) {
        launchOptions.userDataDir = this.options.userDataDir;
      }

      this.browser = await puppeteer.launch(launchOptions);
      this.page = await this.browser.newPage();
      
      await this.page.setViewport(this.options.viewport);
      await this.page.setDefaultTimeout(this.options.timeout);

      // Store main tab
      this.tabs.set('main', this.page);

      return {
        ok: true,
        message: 'Browser started successfully',
        pid: this.browser.process()?.pid
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message
      };
    }
  }

  /**
   * Stop the browser instance
   */
  async stop() {
    if (!this.browser) {
      return { ok: false, message: 'Browser not running' };
    }

    try {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      this.tabs.clear();
      
      return {
        ok: true,
        message: 'Browser stopped successfully'
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message
      };
    }
  }

  /**
   * Navigate to a URL
   */
  async navigate(url, options = {}) {
    if (!this.page) {
      return { ok: false, error: 'Browser not started' };
    }

    try {
      const tabId = options.tabId || 'main';
      const targetPage = this.tabs.get(tabId) || this.page;

      const response = await targetPage.goto(url, {
        waitUntil: options.waitUntil || 'networkidle2',
        timeout: options.timeout || this.options.timeout
      });

      const title = await targetPage.title();

      return {
        ok: true,
        url: targetPage.url(),
        title,
        status: response.status()
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message
      };
    }
  }

  /**
   * Take a screenshot
   */
  async screenshot(options = {}) {
    if (!this.page) {
      return { ok: false, error: 'Browser not started' };
    }

    try {
      const tabId = options.tabId || 'main';
      const targetPage = this.tabs.get(tabId) || this.page;

      const timestamp = Date.now();
      const filename = options.filename || `screenshot-${timestamp}.png`;
      const filepath = join(this.options.screenshotDir, filename);

      // Ensure directory exists
      await mkdir(dirname(filepath), { recursive: true });

      const screenshotOptions = {
        path: filepath,
        fullPage: options.fullPage !== false,
        type: options.type || 'png'
      };

      if (options.clip) {
        screenshotOptions.clip = options.clip;
      }

      await targetPage.screenshot(screenshotOptions);

      return {
        ok: true,
        path: filepath,
        url: targetPage.url(),
        timestamp
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message
      };
    }
  }

  /**
   * Get page snapshot (HTML content and metadata)
   */
  async snapshot(options = {}) {
    if (!this.page) {
      return { ok: false, error: 'Browser not started' };
    }

    try {
      const tabId = options.tabId || 'main';
      const targetPage = this.tabs.get(tabId) || this.page;

      const [content, title, url] = await Promise.all([
        targetPage.content(),
        targetPage.title(),
        Promise.resolve(targetPage.url())
      ]);

      // Optionally extract text content
      let textContent = null;
      if (options.includeText) {
        textContent = await targetPage.evaluate(() => document.body.innerText);
      }

      // Get visible text and links if requested
      let metadata = {};
      if (options.includeMetadata) {
        metadata = await targetPage.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[href]')).map(a => ({
            text: a.textContent.trim(),
            href: a.href
          }));

          const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => ({
            level: h.tagName,
            text: h.textContent.trim()
          }));

          return { links, headings };
        });
      }

      const maxChars = options.maxChars || 50000;
      const truncatedContent = content.length > maxChars 
        ? content.substring(0, maxChars) + '...[truncated]'
        : content;

      return {
        ok: true,
        url,
        title,
        content: truncatedContent,
        textContent,
        metadata,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message
      };
    }
  }

  /**
   * Perform an action on the page (click, type, etc.)
   */
  async act(action, options = {}) {
    if (!this.page) {
      return { ok: false, error: 'Browser not started' };
    }

    try {
      const tabId = options.tabId || 'main';
      const targetPage = this.tabs.get(tabId) || this.page;

      switch (action) {
        case 'click':
          if (!options.selector) {
            return { ok: false, error: 'Selector required for click action' };
          }
          await targetPage.click(options.selector);
          break;

        case 'type':
          if (!options.selector || !options.text) {
            return { ok: false, error: 'Selector and text required for type action' };
          }
          await targetPage.type(options.selector, options.text, {
            delay: options.delay || 0
          });
          break;

        case 'select':
          if (!options.selector || !options.value) {
            return { ok: false, error: 'Selector and value required for select action' };
          }
          await targetPage.select(options.selector, options.value);
          break;

        case 'evaluate':
          if (!options.script) {
            return { ok: false, error: 'Script required for evaluate action' };
          }
          const result = await targetPage.evaluate(options.script);
          return { ok: true, result };

        case 'scroll':
          await targetPage.evaluate((y) => {
            window.scrollBy(0, y || window.innerHeight);
          }, options.y);
          break;

        case 'wait':
          if (options.selector) {
            await targetPage.waitForSelector(options.selector, {
              timeout: options.timeout || this.options.timeout
            });
          } else if (options.duration) {
            await new Promise(resolve => setTimeout(resolve, options.duration));
          }
          break;

        default:
          return { ok: false, error: `Unknown action: ${action}` };
      }

      return {
        ok: true,
        action,
        url: targetPage.url()
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
        action
      };
    }
  }

  /**
   * Open a new tab
   */
  async openTab(url, tabId) {
    if (!this.browser) {
      return { ok: false, error: 'Browser not started' };
    }

    try {
      const newPage = await this.browser.newPage();
      await newPage.setViewport(this.options.viewport);
      
      const id = tabId || `tab-${Date.now()}`;
      this.tabs.set(id, newPage);

      if (url) {
        await newPage.goto(url, { waitUntil: 'networkidle2' });
      }

      return {
        ok: true,
        tabId: id,
        url: newPage.url()
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message
      };
    }
  }

  /**
   * Close a tab
   */
  async closeTab(tabId) {
    if (!this.browser) {
      return { ok: false, error: 'Browser not started' };
    }

    if (tabId === 'main') {
      return { ok: false, error: 'Cannot close main tab' };
    }

    const targetPage = this.tabs.get(tabId);
    if (!targetPage) {
      return { ok: false, error: `Tab not found: ${tabId}` };
    }

    try {
      await targetPage.close();
      this.tabs.delete(tabId);

      return {
        ok: true,
        tabId
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message
      };
    }
  }

  /**
   * List all tabs
   */
  async listTabs() {
    if (!this.browser) {
      return { ok: false, error: 'Browser not started' };
    }

    try {
      const tabs = [];
      
      for (const [id, page] of this.tabs.entries()) {
        tabs.push({
          id,
          url: page.url(),
          title: await page.title()
        });
      }

      return {
        ok: true,
        tabs,
        count: tabs.length
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message
      };
    }
  }

  /**
   * Get browser status
   */
  async status() {
    return {
      running: this.browser !== null,
      connected: this.browser ? this.browser.isConnected() : false,
      pid: this.browser?.process()?.pid,
      tabs: this.tabs.size,
      currentUrl: this.page?.url() || null
    };
  }

  /**
   * Save page as PDF
   */
  async savePdf(options = {}) {
    if (!this.page) {
      return { ok: false, error: 'Browser not started' };
    }

    try {
      const tabId = options.tabId || 'main';
      const targetPage = this.tabs.get(tabId) || this.page;

      const timestamp = Date.now();
      const filename = options.filename || `page-${timestamp}.pdf`;
      const filepath = join(this.options.screenshotDir, filename);

      await mkdir(dirname(filepath), { recursive: true });

      await targetPage.pdf({
        path: filepath,
        format: options.format || 'A4',
        printBackground: options.printBackground !== false
      });

      return {
        ok: true,
        path: filepath,
        url: targetPage.url()
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message
      };
    }
  }
}

export default BrowserControl;
