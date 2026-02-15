#!/bin/bash

# 🦞 Claw Browser - Live Demo Script
# This script demonstrates all the key features

echo "🦞 CLAW BROWSER - LIVE DEMO"
echo "================================"
echo ""
echo "Inspired by OpenClaw's browser control capabilities"
echo ""

# Test 1: Simple screenshot
echo "📸 Test 1: Taking a screenshot..."
node src/cli.js screenshot --url https://example.com --filename demo-example.png
echo ""

# Test 2: Page snapshot with metadata  
echo "📄 Test 2: Getting page snapshot with metadata..."
node src/cli.js snapshot --url https://news.ycombinator.com --include-metadata --max-chars 1000 | head -50
echo ""

# Test 3: Navigate and take screenshot
echo "🌐 Test 3: Navigate to GitHub..."
node src/cli.js screenshot --url https://github.com/openclaw/openclaw --filename demo-github.png
echo ""

# Test 4: Web scraping
echo "🕷️ Test 4: Web scraping example..."
node examples/web-scraping.js
echo ""

# Test 5: Research assistant
echo "🔬 Test 5: Research assistant (multi-tab)..."
node examples/research-assistant.js "puppeteer"
echo ""

# Show generated files
echo "📂 Generated files:"
ls -lh screenshots/ research-output/ 2>/dev/null | grep -E '\.png|\.json'
echo ""

echo "✅ All tests complete!"
echo ""
echo "Key features demonstrated:"
echo "  ✓ Screenshot capture"
echo "  ✓ Page snapshots with metadata"
echo "  ✓ Navigation"
echo "  ✓ Web scraping (JavaScript execution)"
echo "  ✓ Multi-tab management"
echo "  ✓ Research automation"
echo ""
echo "EXFOLIATE! EXFOLIATE! 🦞"
