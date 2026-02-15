# 🦞 Claw Browser

Browser control capabilities inspired by [OpenClaw](https://github.com/openclaw/openclaw).

A powerful, easy-to-use browser automation tool with both CLI and programmatic interfaces.

## Features

✅ **Full Browser Control**
- Start/stop browser instances
- Navigate to URLs
- Take screenshots (full page or clipped)
- Get page snapshots with metadata
- Extract content and analyze pages

✅ **Page Interactions**
- Click elements
- Type text
- Scroll pages
- Evaluate JavaScript
- Wait for elements or timeouts

✅ **Tab Management**
- Open multiple tabs
- Switch between tabs
- Close tabs
- List all open tabs

✅ **Export Capabilities**
- Save pages as PDF
- Capture screenshots (PNG)
- Extract HTML content
- Get visible text and metadata

✅ **Easy to Use**
- Simple CLI commands
- Clean programmatic API
- Headless or visible mode
- Profile support

## Installation

```bash
cd claw-browser
npm install
```

## Quick Start

### CLI Usage

```bash
# Make CLI executable
chmod +x src/cli.js

# Take a screenshot of a website
node src/cli.js screenshot --url https://github.com/openclaw/openclaw

# Get page snapshot with metadata
node src/cli.js snapshot --url https://news.ycombinator.com --include-metadata

# Navigate and interact
node src/cli.js navigate https://example.com

# Start interactive mode
node src/cli.js interactive --url https://docs.openclaw.ai
```

### Programmatic Usage

```javascript
import { BrowserControl } from './src/browser-control.js';

const browser = new BrowserControl({
  headless: false,
  screenshotDir: './screenshots'
});

// Start browser
await browser.start();

// Navigate
await browser.navigate('https://github.com/openclaw/openclaw');

// Take screenshot
await browser.screenshot({ filename: 'openclaw.png' });

// Get page content
const snapshot = await browser.snapshot({
  includeText: true,
  includeMetadata: true
});

console.log(snapshot.title);
console.log(snapshot.metadata.links);

// Perform actions
await browser.act('click', { selector: 'button.primary' });
await browser.act('type', { selector: 'input', text: 'Hello' });
await browser.act('scroll', { y: 500 });

// Save as PDF
await browser.savePdf({ filename: 'page.pdf' });

// Clean up
await browser.stop();
```

## CLI Commands

### Browser Control

```bash
# Start browser (keeps running)
node src/cli.js start

# Get browser status
node src/cli.js status

# Interactive mode
node src/cli.js interactive --url https://example.com
```

### Navigation

```bash
# Navigate to URL
node src/cli.js navigate https://example.com

# Navigate specific tab
node src/cli.js navigate https://example.com --tab-id my-tab
```

### Screenshots

```bash
# Screenshot current page
node src/cli.js screenshot

# Screenshot with navigation
node src/cli.js screenshot --url https://example.com

# Custom filename
node src/cli.js screenshot --filename my-screenshot.png

# Partial screenshot (viewport only)
node src/cli.js screenshot --no-full-page
```

### Page Snapshots

```bash
# Basic snapshot
node src/cli.js snapshot --url https://example.com

# With text content
node src/cli.js snapshot --url https://example.com --include-text

# With metadata (links, headings)
node src/cli.js snapshot --url https://example.com --include-metadata

# Limit content size
node src/cli.js snapshot --url https://example.com --max-chars 10000
```

### Actions

```bash
# Click element
node src/cli.js act click --url https://example.com --selector "button"

# Type text
node src/cli.js act type --url https://example.com --selector "input" --text "Hello"

# Scroll page
node src/cli.js act scroll --url https://example.com --scroll-y 500

# Wait for element
node src/cli.js act wait --url https://example.com --selector ".content"

# Wait duration
node src/cli.js act wait --duration 3000

# Evaluate JavaScript
node src/cli.js act evaluate --url https://example.com --script "document.title"
```

### Tab Management

```bash
# Open new tab
node src/cli.js open-tab --url https://example.com --id custom-tab

# List all tabs
node src/cli.js list-tabs
```

### Export

```bash
# Save as PDF
node src/cli.js pdf --url https://example.com

# Custom filename
node src/cli.js pdf --url https://example.com --filename my-page.pdf

# Different format
node src/cli.js pdf --url https://example.com --format Letter
```

## Examples

### Example 1: Basic Usage

```bash
node examples/basic-usage.js
```

This example demonstrates:
- Starting the browser
- Navigating to GitHub
- Taking screenshots
- Getting page snapshots
- Opening multiple tabs
- Saving as PDF

### Example 2: Web Scraping

```bash
node examples/web-scraping.js
```

This example shows:
- Headless browser mode
- Extracting data from Hacker News
- Using JavaScript evaluation
- Scraping top stories

## API Reference

### BrowserControl Class

#### Constructor Options

```javascript
{
  headless: false,           // Run in headless mode
  userDataDir: null,          // Custom profile directory
  viewport: {                 // Browser viewport size
    width: 1280,
    height: 720
  },
  timeout: 30000,            // Default timeout (ms)
  screenshotDir: './screenshots'  // Screenshot output directory
}
```

#### Methods

- `start()` - Start browser instance
- `stop()` - Stop browser instance
- `navigate(url, options)` - Navigate to URL
- `screenshot(options)` - Take screenshot
- `snapshot(options)` - Get page content and metadata
- `act(action, options)` - Perform page action
- `openTab(url, tabId)` - Open new tab
- `closeTab(tabId)` - Close tab
- `listTabs()` - List all tabs
- `status()` - Get browser status
- `savePdf(options)` - Save page as PDF

## Comparison with OpenClaw

This implementation is inspired by OpenClaw's browser control capabilities:

| Feature | OpenClaw | Claw Browser |
|---------|----------|--------------|
| Browser Start/Stop | ✅ | ✅ |
| Navigation | ✅ | ✅ |
| Screenshots | ✅ | ✅ |
| Page Actions | ✅ | ✅ |
| Tab Management | ✅ | ✅ |
| PDF Export | ✅ | ✅ |
| Page Snapshots | ✅ | ✅ |
| CLI Interface | ✅ | ✅ |
| Programmatic API | ✅ | ✅ |
| Profile Support | ✅ | ✅ |
| Multi-Agent Integration | ✅ | ⚠️ (Can be extended) |
| Gateway WebSocket | ✅ | ❌ |

## Requirements

- Node.js 18+
- npm or pnpm
- Chrome/Chromium (automatically installed with Puppeteer)

## License

MIT

## Acknowledgments

Inspired by [OpenClaw](https://github.com/openclaw/openclaw) - the personal AI assistant platform.

Built with [Puppeteer](https://pptr.dev/) and [Commander.js](https://github.com/tj/commander.js).

---

**EXFOLIATE! EXFOLIATE!** 🦞
