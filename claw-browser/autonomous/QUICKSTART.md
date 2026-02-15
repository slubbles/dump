# 🚀 AUTONOMOUS AGENT SYSTEM - QUICK START

Get your autonomous AI collective running in **15 minutes**.

---

## 📋 PREREQUISITES

1. **Supabase Account** (free tier)
   - Sign up: https://supabase.com
   - Create new project
   - Note your project URL and anon key

2. **Anthropic API Key**
   - Get from: https://console.anthropic.com
   - $50 in API credits (part of your $100 budget)

3. **Hosting** (choose one):
   - Railway.app (easiest, $25/month)
   - Render.com ($25/month)
   - Fly.io ($10-20/month)
   - VPS (DigitalOcean, $12/month)

---

## ⚡ SETUP STEPS

### **Step 1: Set Up Supabase Database**

1. Go to your Supabase project dashboard
2. Click "SQL Editor" in sidebar
3. Create new query
4. Copy contents of `supabase-schema.sql` and paste
5. Click "Run" to execute

You should see:
```
✅ Database schema created successfully!
Tables: tasks, agents, activity_log, shared_memory, products, budget, system_metrics
Initial budget: $100 ($50 USDT + $50 API credits)
```

### **Step 2: Configure Environment**

1. Copy `.env.template` to `.env`:
   ```bash
   cp autonomous/.env.template autonomous/.env
   ```

2. Fill in your credentials:
   ```env
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
   ```

### **Step 3: Test Locally (Optional)**

```bash
# Install dependencies (already done)
npm install

# Start one agent to test
node autonomous/start-architect.js
```

You should see:
```
🧠 Starting Architect agent...
🤖 [The Architect] Starting...
Agent registered successfully
```

Press `Ctrl+C` to stop.

### **Step 4: Deploy Agents**

#### **Option A: Railway.app (Recommended - Easiest)**

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login:
   ```bash
   railway login
   ```

3. Create project:
   ```bash
   railway init
   ```

4. Add environment variables:
   ```bash
   railway variables set SUPABASE_URL="https://xxxxx.supabase.co"
   railway variables set SUPABASE_KEY="eyJh..."
   railway variables set ANTHROPIC_API_KEY="sk-ant..."
   ```

5. Deploy each agent:
   ```bash
   # Architect
   railway up --service architect --dockerfile autonomous/Dockerfile

   # Researcher
   railway up --service researcher --dockerfile autonomous/Dockerfile
   
   # Repeat for all 6 agents
   ```

#### **Option B: Docker Compose (Local/VPS)**

```bash
cd autonomous
docker-compose up -d
```

View logs:
```bash
docker-compose logs -f
```

Stop all:
```bash
docker-compose down
```

#### **Option C: Individual Processes (Simple VPS)**

```bash
# Install PM2 for process management
npm install -g pm2

# Start all agents
pm2 start autonomous/start-architect.js --name architect
pm2 start autonomous/start-researcher.js --name researcher
pm2 start autonomous/start-builder.js --name builder-1 -- AGENT_NUM=1
pm2 start autonomous/start-builder.js --name builder-2 -- AGENT_NUM=2
pm2 start autonomous/start-qa.js --name qa
pm2 start autonomous/start-marketer.js --name marketer

# View status
pm2 status

# View logs
pm2 logs

# Configure auto-restart on reboot
pm2 startup
pm2 save
```

---

## 🎯 SEED INITIAL TASK

Once agents are running, seed the first task manually:

### **Method 1: Supabase Dashboard**

1. Go to Supabase > Table Editor > `tasks`
2. Insert new row:
   ```
   type: plan
   title: Execute $100 Challenge
   description: Research, plan, and build products to turn $100 into $10,000 in 90 days
   priority: 10
   status: queued
   requirements: {
     "goal": "Turn $100 into $10,000 in 90 days",
     "constraints": {
       "initial_budget": 100,
       "api_budget": 50,
       "infrastructure_budget": 50
     },
     "timeline": "90 days"
   }
   ```

### **Method 2: Quick SQL**

```sql
INSERT INTO tasks (type, title, description, priority, status, requirements)
VALUES (
  'plan',
  'Execute $100 Challenge',
  'Research, plan, and build products to turn $100 into $10,000 in 90 days',
  10,
  'queued',
  '{
    "goal": "Turn $100 into $10,000 in 90 days",
    "constraints": {
      "initial_budget": 100,
      "api_budget": 50,
      "infrastructure_budget": 50
    },
    "timeline": "90 days"
  }'::jsonb
);
```

---

## 📊 MONITOR SYSTEM

### **Check Agent Status**

```sql
SELECT * FROM agents ORDER BY last_heartbeat DESC;
```

Expected output:
```
id              | name            | status | tasks_completed | success_rate
----------------|-----------------|--------|-----------------|-------------
architect-001   | The Architect   | idle   | 1               | 100.0
researcher-001  | The Researcher  | idle   | 0               | 0.0
builder-001     | Builder Alpha   | idle   | 0               | 0.0
...
```

### **Check Task Queue**

```sql
SELECT type, status, COUNT(*) 
FROM tasks 
GROUP BY type, status 
ORDER BY type, status;
```

### **View Activity Log**

```sql
SELECT 
  timestamp,
  agent_id,
  event_type,
  message
FROM activity_log
ORDER BY timestamp DESC
LIMIT 20;
```

### **Check Budget**

```sql
SELECT * FROM financial_summary;
```

---

## 🎨 BUILD DASHBOARD (Optional)

Create a Next.js dashboard to visualize:

```bash
npx create-next-app@latest agent-dashboard
cd agent-dashboard
npm install @supabase/supabase-js recharts
```

Connect to Supabase real-time:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Subscribe to agent updates
supabase
  .channel('agents')
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public', 
    table: 'agents' 
  }, (payload) => {
    console.log('Agent update:', payload);
  })
  .subscribe();
```

Deploy to Vercel (free):
```bash
vercel deploy
```

---

## 🔥 WHAT HAPPENS NEXT

1. **Architect** claims the initial task
2. Creates detailed plan with subtasks
3. **Researcher** validates market demand
4. **Builders** start coding first product
5. **QA** tests everything
6. **Marketer** launches on Product Hunt

**All automatically. 24/7. No human intervention.**

---

## 💰 COST BREAKDOWN

**Monthly Hosting:**
- Railway.app: $25
- Supabase: $0 (free tier)
- Total: **$25/month**

**API Usage:**
- Claude API: ~$0.50 per 1000 tasks
- Budget: $50 initial credits
- Estimated: **1-2 weeks** before breaking even

**Total Initial Investment:** $100
- $50 infrastructure (covers 2 months)
- $50 API credits

**Break-even:** Day 5 (if following $100 challenge plan)

---

## 🚨 TROUBLESHOOTING

### Agents Not Starting

1. Check environment variables:
   ```bash
   railway variables
   # or
   cat .env
   ```

2. Check logs:
   ```bash
   railway logs
   # or
   pm2 logs
   ```

3. Verify database connection:
   ```bash
   node -e "
   import { createClient } from '@supabase/supabase-js';
   const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
   sb.from('agents').select('*').then(console.log);
   "
   ```

### No Tasks Being Claimed

1. Check task queue:
   ```sql
   SELECT * FROM tasks WHERE status = 'queued';
   ```

2. Check agent capabilities match task types
3. Verify agent heartbeats are recent (< 30 seconds)

### High API Costs

1. Check API usage:
   ```sql
   SELECT 
     SUM(amount) as total_api_cost,
     COUNT(*) as api_calls
   FROM budget 
   WHERE type = 'api_cost';
   ```

2. Reduce max_tokens in `agent-runtime.js` (line with `max_tokens: 8000`)

3. Add rate limiting:
   ```javascript
   // In agent-runtime.js, add before callClaude():
   await this.sleep(2000); // 2 second delay between API calls
   ```

---

## 📈 SCALING UP

Once profitable, scale horizontally:

```bash
# Add more builders
railway up --service builder-3
railway up --service builder-4

# Add specialized agents
railway up --service deployer
railway up --service support
```

---

## 🎯 SUCCESS METRICS

**Day 1:**
- [ ] All 6 agents online
- [ ] Heartbeats every 10 seconds
- [ ] First task claimed

**Day 3:**
- [ ] 10+ tasks completed
- [ ] First product planned
- [ ] Research completed

**Day 7:**
- [ ] First product built
- [ ] First revenue
- [ ] System self-sustaining

**Day 30:**
- [ ] $1,000+ revenue
- [ ] 3+ products launched
- [ ] Positive ROI

**Day 90:**
- [ ] $10,000+ revenue goal
- [ ] System fully autonomous
- [ ] Multiple revenue streams

---

## 🤖 AUTONOMOUS OPERATION

The system is designed to run **completely autonomously**:

1. **Self-healing**: Agents restart on crashes
2. **Self-organizing**: Agents claim tasks based on capabilities
3. **Self-optimizing**: Success rates improve over time
4. **Self-sustaining**: Revenue covers costs after break-even

**You just watch the dashboard and collect profits.** 💰

---

## 🚀 LAUNCH CHECKLIST

- [ ] Supabase project created
- [ ] Database schema executed
- [ ] Environment variables configured
- [ ] Agents deployed (6 total)
- [ ] All agents showing "idle" status in database
- [ ] Initial task seeded
- [ ] Activity log showing agent registrations
- [ ] Budget tracking initialized ($100 initial)
- [ ] Dashboard deployed (optional)
- [ ] Monitoring alerts set up (optional)

**Ready to launch? Run the seed task and watch the magic happen!** ✨

---

**Questions?**
- Check the main documentation: `AUTONOMOUS-AGENT-SYSTEM.md`
- View agent implementation: `agent-runtime.js`
- Inspect database schema: `supabase-schema.sql`

**Let's turn $100 into $10,000. Autonomously.** 🚀
