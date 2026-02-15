# 🎨 DASHBOARD - Real-time Monitoring

Simple Next.js dashboard to monitor your autonomous agent collective.

---

## 🚀 QUICK SETUP

```bash
# From the autonomous/ directory
cd dashboard

# Install dependencies
npm install

# Configure environment
cp .env.template .env.local

# Add your Supabase credentials to .env.local

# Run development server
npm run dev

# Open http://localhost:3000
```

---

## 📊 FEATURES

### **Overview Dashboard**
- Real-time agent status (online/offline/busy)
- Task queue size
- Budget tracker
- Revenue counter
- System uptime

### **Agents View**
- Agent health and heartbeat indicators
- Current task for each agent
- Performance metrics (tasks completed, success rate)
- Activity timeline

### **Tasks View**
- Task queue (grouped by type and status)
- Task details and requirements
- Task history and results
- Dependency graph visualization

### **Products View**
- Active products and their status
- Metrics per product (users, revenue, costs)
- Launch timeline
- Product performance

### **Activity Feed**
- Real-time log of all agent actions
- Decisions made
- Errors and warnings
- Milestones achieved

### **Budget View**
- API credit usage
- Infrastructure costs
- Revenue streams
- Profit/Loss chart

---

## 🔧 TECH STACK

- **Next.js 15** - React framework
- **Supabase JS** - Real-time database
- **Recharts** - Data visualization
- **TailwindCSS** - Styling
- **shadcn/ui** - UI components (optional)

---

## 📱 REAL-TIME UPDATES

The dashboard subscribes to Supabase real-time channels:

```javascript
// Agents channel
supabase
  .channel('agents')
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public', 
    table: 'agents' 
  }, handleAgentUpdate)
  .subscribe();

// Tasks channel
supabase
  .channel('tasks')
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public', 
    table: 'tasks' 
  }, handleTaskUpdate)
  .subscribe();

// Activity log channel
supabase
  .channel('activity')
  .on('postgres_changes', { 
    event: 'INSERT', 
    schema: 'public', 
    table: 'activity_log' 
  }, handleNewActivity)
  .subscribe();

// Budget channel
supabase
  .channel('budget')
  .on('postgres_changes', { 
    event: 'INSERT', 
    schema: 'public', 
    table: 'budget' 
  }, handleBudgetUpdate)
  .subscribe();
```

---

## 🎨 PAGES

### `/` - Overview
```
┌─────────────────────────────────────────────────┐
│  🤖 AUTONOMOUS AGENT COLLECTIVE                  │
├─────────────────────────────────────────────────┤
│                                                  │
│  📊 SYSTEM STATUS                                │
│  ● 6 agents online                               │
│  ● 12 tasks queued                               │
│  ● $87.42 remaining                              │
│  ● $156.00 revenue                               │
│                                                  │
│  🤖 AGENTS                                       │
│  🧠 Architect       ● Idle       94.2% success   │
│  🔍 Researcher      ● Busy       100% success    │
│  🔨 Builder Alpha   ● Busy       88.5% success   │
│  🔨 Builder Beta    ● Idle       91.3% success   │
│  ✅ QA              ● Idle       100% success    │
│  📢 Marketer        ● Busy       75.0% success   │
│                                                  │
│  📋 RECENT ACTIVITY                              │
│  • Marketer: Posted to Product Hunt              │
│  • Builder Alpha: Deployed v1.2.0                │
│  • QA: All tests passed                          │
│  • Researcher: Found 3 opportunities             │
│                                                  │
└─────────────────────────────────────────────────┘
```

### `/agents` - Agent Details
- Individual agent cards
- Performance charts
- Task history per agent
- Error logs

### `/tasks` - Task Management
- Kanban board view (queued/in-progress/completed)
- Task filters
- Task details modal
- Create new task button (manual override)

### `/products` - Product Portfolio
- Product cards with metrics
- Revenue charts
- Launch timeline
- Product status workflow

### `/activity` - Activity Feed
- Real-time scrolling log
- Filter by agent/event type
- Search functionality
- Export logs

### `/budget` - Financial Dashboard
- Revenue vs. costs chart
- API usage breakdown
- Infrastructure costs
- Profit trend
- ROI calculator

---

## 🚀 DEPLOYMENT

### **Vercel (Recommended - Free)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables on Vercel dashboard
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY

# Production deployment
vercel --prod
```

### **Netlify**

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy

# Production
netlify deploy --prod
```

---

## 📈 MONITORING ALERTS (Optional)

Set up alerts for critical events:

```javascript
// In useEffect hook
if (agentOffline > 5 * 60 * 1000) { // 5 minutes
  sendAlert('🚨 Agent offline: ' + agentName);
}

if (budgetRemaining < 10) {
  sendAlert('💰 Low budget: $' + budgetRemaining);
}

if (taskQueueSize > 100) {
  sendAlert('📋 High task queue: ' + taskQueueSize);
}
```

Integrate with:
- Email (SendGrid)
- SMS (Twilio)
- Slack webhook
- Discord webhook
- Telegram bot

---

## 🎯 CUSTOMIZATION

Dashboard is fully customizable:

1. **Add new metrics**: Query Supabase in `useEffect`
2. **Add new charts**: Use Recharts components
3. **Add new pages**: Create in `app/[pagename]/page.js`
4. **Customize theme**: Edit `tailwind.config.js`

---

## 📱 MOBILE RESPONSIVE

Dashboard works on all devices:
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

---

## 🔒 SECURITY

- Uses Supabase RLS (Row Level Security)
- Anon key is safe for client-side use
- No service key exposed
- Optional: Add authentication with Supabase Auth

---

## 🎨 SCREENSHOTS (Conceptual)

```
OVERVIEW                    AGENTS                     TASKS
┌────────────┐            ┌────────────┐            ┌────────────┐
│ 6 ONLINE   │            │ 🧠 ARCHITECT│            │ QUEUED: 12 │
│ 12 TASKS   │            │ Status: ●  │            │ IN_PROG: 4 │
│ $87 LEFT   │            │ Tasks: 142 │            │ DONE: 1.2k │
│ $156 REV   │            │ Success:94%│            │            │
└────────────┘            └────────────┘            └────────────┘
```

---

## 🥊 vs. VOXYZ.SPACE

**Your Dashboard:**
- ✅ Real-time updates (Supabase)
- ✅ Financial tracking
- ✅ Task management
- ✅ Agent monitoring
- ✅ Free to deploy

**voxyz.space:**
- ❓ Unknown tech stack
- ❓ Limited visibility
- ❓ No financial tracking
- ❓ Closed source

**Your advantage:** Full transparency and control.

---

**Ready to monitor your autonomous empire?** 🚀

Deploy the dashboard and watch your agents work 24/7.
