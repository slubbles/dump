#!/bin/bash

# 💰 GITHUB REPOSITORY ANALYTICS
# 
# Uses: GitHub CLI + Data Processing
# NO browser automation needed!
# 
# REVENUE MODEL:
# - Free: 1 repo analysis
# - Solo: $29/month - 10 repos, weekly reports
# - Team: $99/month - Unlimited repos, daily reports, API
# - Enterprise: $499/month - Organization-wide, trends, predictions
# 
# MARKET:
# - 100M+ GitHub repositories
# - 100M+ developers
# - 10M+ companies
# 
# POTENTIAL:
# - 10,000 Solo users @ $29   = $290,000/month
# - 1,000 Team plans @ $99    = $99,000/month
# - 100 Enterprise @ $499     = $49,900/month
# TOTAL:                        $438,900/month = $5.2M/year

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 GITHUB REPOSITORY ANALYTICS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if gh is authenticated
if ! gh auth status > /dev/null 2>&1; then
    echo -e "${RED}❌ GitHub CLI not authenticated${NC}"
    echo "Run: gh auth login"
    exit 1
fi

# Get repo from argument or prompt
REPO=${1:-"facebook/react"}

echo -e "${BLUE}Analyzing repository: $REPO${NC}"
echo ""

# Create output directory
mkdir -p github-analytics

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 1. BASIC INFORMATION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "1️⃣  Fetching repository information..."
gh api repos/$REPO > github-analytics/repo-info.json

NAME=$(jq -r '.name' github-analytics/repo-info.json)
DESCRIPTION=$(jq -r '.description' github-analytics/repo-info.json)
STARS=$(jq -r '.stargazers_count' github-analytics/repo-info.json)
FORKS=$(jq -r '.forks_count' github-analytics/repo-info.json)
ISSUES=$(jq -r '.open_issues_count' github-analytics/repo-info.json)
WATCHERS=$(jq -r '.subscribers_count' github-analytics/repo-info.json)
CREATED=$(jq -r '.created_at' github-analytics/repo-info.json)
UPDATED=$(jq -r '.updated_at' github-analytics/repo-info.json)
LANGUAGE=$(jq -r '.language' github-analytics/repo-info.json)
SIZE=$(jq -r '.size' github-analytics/repo-info.json)

echo -e "${GREEN}✓ Basic info collected${NC}"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 2. CONTRIBUTOR STATISTICS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "2️⃣  Analyzing contributors..."
gh api repos/$REPO/contributors --paginate > github-analytics/contributors.json

CONTRIBUTOR_COUNT=$(jq 'length' github-analytics/contributors.json)
TOP_CONTRIBUTOR=$(jq -r '.[0].login' github-analytics/contributors.json)
TOP_CONTRIBUTIONS=$(jq -r '.[0].contributions' github-analytics/contributors.json)

echo -e "${GREEN}✓ Found $CONTRIBUTOR_COUNT contributors${NC}"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 3. COMMIT ACTIVITY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "3️⃣  Fetching commit activity..."
gh api repos/$REPO/stats/commit_activity > github-analytics/commit-activity.json

TOTAL_COMMITS=$(jq '[.[].total] | add' github-analytics/commit-activity.json)
LAST_WEEK_COMMITS=$(jq '.[-1].total' github-analytics/commit-activity.json)

echo -e "${GREEN}✓ Commit activity analyzed${NC}"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 4. LANGUAGE STATISTICS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "4️⃣  Analyzing languages..."
gh api repos/$REPO/languages > github-analytics/languages.json

LANGUAGES=$(jq -r 'keys | join(", ")' github-analytics/languages.json)

echo -e "${GREEN}✓ Languages detected${NC}"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 5. ISSUE STATISTICS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "5️⃣  Analyzing issues..."
gh api repos/$REPO/issues --paginate -f state=all --jq 'length' > github-analytics/issue-count.txt 2>/dev/null || echo "0" > github-analytics/issue-count.txt

TOTAL_ISSUES=$(cat github-analytics/issue-count.txt)

echo -e "${GREEN}✓ Issue statistics collected${NC}"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 6. PULL REQUEST STATISTICS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "6️⃣  Analyzing pull requests..."
gh api repos/$REPO/pulls --paginate -f state=all --jq 'length' > github-analytics/pr-count.txt 2>/dev/null || echo "0" > github-analytics/pr-count.txt

TOTAL_PRS=$(cat github-analytics/pr-count.txt)

echo -e "${GREEN}✓ Pull request statistics collected${NC}"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# GENERATE COMPREHENSIVE REPORT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 REPOSITORY ANALYSIS REPORT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Repository: $NAME"
echo "Description: $DESCRIPTION"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📈 POPULARITY METRICS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⭐ Stars:              $STARS"
echo "🍴 Forks:              $FORKS"
echo "👁  Watchers:          $WATCHERS"
echo "📂 Size:               $SIZE KB"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "👥 COMMUNITY ENGAGEMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Contributors:          $CONTRIBUTOR_COUNT"
echo "Top contributor:       $TOP_CONTRIBUTOR ($TOP_CONTRIBUTIONS commits)"
echo "Open issues:           $ISSUES"
echo "Total issues (all):    $TOTAL_ISSUES"
echo "Total PRs (all):       $TOTAL_PRS"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚡ ACTIVITY METRICS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Last week commits:     $LAST_WEEK_COMMITS"
echo "Last 52 weeks:         $TOTAL_COMMITS commits"
echo "Primary language:      $LANGUAGE"
echo "All languages:         $LANGUAGES"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📅 TIMELINE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Created:               $CREATED"
echo "Last updated:          $UPDATED"
echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CALCULATE HEALTH SCORE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HEALTH_SCORE=0

# Stars (max 30 points)
if [ "$STARS" -gt 50000 ]; then HEALTH_SCORE=$((HEALTH_SCORE + 30))
elif [ "$STARS" -gt 10000 ]; then HEALTH_SCORE=$((HEALTH_SCORE + 25))
elif [ "$STARS" -gt 1000 ]; then HEALTH_SCORE=$((HEALTH_SCORE + 20))
elif [ "$STARS" -gt 100 ]; then HEALTH_SCORE=$((HEALTH_SCORE + 15))
else HEALTH_SCORE=$((HEALTH_SCORE + 5))
fi

# Contributors (max 25 points)
if [ "$CONTRIBUTOR_COUNT" -gt 500 ]; then HEALTH_SCORE=$((HEALTH_SCORE + 25))
elif [ "$CONTRIBUTOR_COUNT" -gt 100 ]; then HEALTH_SCORE=$((HEALTH_SCORE + 20))
elif [ "$CONTRIBUTOR_COUNT" -gt 20 ]; then HEALTH_SCORE=$((HEALTH_SCORE + 15))
elif [ "$CONTRIBUTOR_COUNT" -gt 5 ]; then HEALTH_SCORE=$((HEALTH_SCORE + 10))
else HEALTH_SCORE=$((HEALTH_SCORE + 5))
fi

# Activity (max 25 points)
if [ "$LAST_WEEK_COMMITS" -gt 100 ]; then HEALTH_SCORE=$((HEALTH_SCORE + 25))
elif [ "$LAST_WEEK_COMMITS" -gt 50 ]; then HEALTH_SCORE=$((HEALTH_SCORE + 20))
elif [ "$LAST_WEEK_COMMITS" -gt 10 ]; then HEALTH_SCORE=$((HEALTH_SCORE + 15))
elif [ "$LAST_WEEK_COMMITS" -gt 1 ]; then HEALTH_SCORE=$((HEALTH_SCORE + 10))
else HEALTH_SCORE=$((HEALTH_SCORE + 2))
fi

# Issue resolution (max 20 points)
if [ "$ISSUES" -lt 50 ]; then HEALTH_SCORE=$((HEALTH_SCORE + 20))
elif [ "$ISSUES" -lt 200 ]; then HEALTH_SCORE=$((HEALTH_SCORE + 15))
elif [ "$ISSUES" -lt 500 ]; then HEALTH_SCORE=$((HEALTH_SCORE + 10))
else HEALTH_SCORE=$((HEALTH_SCORE + 5))
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💯 REPOSITORY HEALTH SCORE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "    Score: $HEALTH_SCORE / 100"
echo ""

if [ "$HEALTH_SCORE" -ge 80 ]; then
    echo -e "    ${GREEN}🎉 EXCELLENT${NC} - Highly active and healthy"
elif [ "$HEALTH_SCORE" -ge 60 ]; then
    echo -e "    ${BLUE}✅ GOOD${NC} - Active with strong community"
elif [ "$HEALTH_SCORE" -ge 40 ]; then
    echo -e "    ${YELLOW}⚠️  MODERATE${NC} - Room for improvement"
else
    echo -e "    ${RED}❌ NEEDS ATTENTION${NC} - Low activity or engagement"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# GENERATE JSON REPORT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

cat > github-analytics/full-report.json << EOF
{
  "repository": "$REPO",
  "name": "$NAME",
  "description": "$DESCRIPTION",
  "metrics": {
    "stars": $STARS,
    "forks": $FORKS,
    "watchers": $WATCHERS,
    "size_kb": $SIZE,
    "contributors": $CONTRIBUTOR_COUNT,
    "open_issues": $ISSUES,
    "total_issues": $TOTAL_ISSUES,
    "total_prs": $TOTAL_PRS,
    "commits_last_week": $LAST_WEEK_COMMITS,
    "commits_52_weeks": $TOTAL_COMMITS
  },
  "technology": {
    "primary_language": "$LANGUAGE",
    "all_languages": "$LANGUAGES"
  },
  "timeline": {
    "created": "$CREATED",
    "last_updated": "$UPDATED"
  },
  "health_score": $HEALTH_SCORE,
  "generated_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

echo "📊 Reports saved to: github-analytics/"
echo "   - repo-info.json"
echo "   - contributors.json"
echo "   - commit-activity.json"
echo "   - languages.json"
echo "   - full-report.json"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💰 MONETIZATION OPPORTUNITY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This analysis could be sold as:"
echo "  • Weekly reports:             \$29/month"
echo "  • Organization dashboard:     \$99/month"
echo "  • Competitive intelligence:   \$299/month"
echo "  • API access:                 \$999/month"
echo ""
echo "Target customers:"
echo "  • VCs evaluating investments"
echo "  • CTOs tracking competitors"
echo "  • Open source maintainers"
echo "  • Developer tool companies"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
