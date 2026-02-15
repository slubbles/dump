-- SUPABASE DATABASE SCHEMA FOR AUTONOMOUS AGENT SYSTEM
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL CHECK (type IN ('research', 'build', 'test', 'deploy', 'market', 'analyze', 'plan')),
  priority INT DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued', 'assigned', 'in_progress', 'completed', 'failed', 'blocked')),
  title TEXT NOT NULL,
  description TEXT,
  requirements JSONB DEFAULT '{}'::jsonb,
  assigned_to VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  result JSONB,
  error TEXT,
  parent_task_id UUID REFERENCES tasks(id),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Agents table
CREATE TABLE agents (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'idle' CHECK (status IN ('idle', 'busy', 'offline', 'error')),
  current_task_id UUID REFERENCES tasks(id),
  capabilities TEXT[] NOT NULL,
  config JSONB DEFAULT '{}'::jsonb,
  last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
  total_tasks_completed INT DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity log
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id VARCHAR(50) REFERENCES agents(id),
  task_id UUID REFERENCES tasks(id),
  event_type VARCHAR(50) NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Shared memory/context
CREATE TABLE shared_memory (
  key VARCHAR(255) PRIMARY KEY,
  value JSONB NOT NULL,
  created_by VARCHAR(50) REFERENCES agents(id),
  expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'idea' CHECK (status IN ('idea', 'planning', 'building', 'testing', 'launched', 'revenue', 'paused', 'abandoned')),
  revenue DECIMAL(10,2) DEFAULT 0,
  costs DECIMAL(10,2) DEFAULT 0,
  url VARCHAR(500),
  metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  launched_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Budget tracking
CREATE TABLE budget (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL CHECK (type IN ('initial', 'revenue', 'expense', 'api_cost', 'infrastructure', 'refund', 'transfer')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  agent_id VARCHAR(50) REFERENCES agents(id),
  product_id UUID REFERENCES products(id),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- System metrics
CREATE TABLE system_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_type VARCHAR(50) NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_type ON tasks(type);
CREATE INDEX idx_tasks_priority ON tasks(priority DESC);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_activity_log_agent ON activity_log(agent_id);
CREATE INDEX idx_activity_log_timestamp ON activity_log(timestamp DESC);
CREATE INDEX idx_budget_timestamp ON budget(timestamp DESC);

-- Views for dashboard
CREATE VIEW agent_performance AS
SELECT 
  a.id,
  a.name,
  a.role,
  a.status,
  a.total_tasks_completed,
  a.success_rate,
  EXTRACT(EPOCH FROM (NOW() - a.last_heartbeat)) AS seconds_since_heartbeat,
  t.title AS current_task_title
FROM agents a
LEFT JOIN tasks t ON a.current_task_id = t.id;

CREATE VIEW task_queue_summary AS
SELECT 
  type,
  status,
  COUNT(*) as count,
  AVG(priority) as avg_priority
FROM tasks
GROUP BY type, status;

CREATE VIEW financial_summary AS
SELECT 
  SUM(CASE WHEN type IN ('revenue') THEN amount ELSE 0 END) as total_revenue,
  SUM(CASE WHEN type IN ('expense', 'api_cost', 'infrastructure') THEN amount ELSE 0 END) as total_costs,
  SUM(CASE WHEN type IN ('revenue') THEN amount ELSE 0 END) - 
  SUM(CASE WHEN type IN ('expense', 'api_cost', 'infrastructure') THEN amount ELSE 0 END) as net_profit
FROM budget;

-- Real-time subscriptions (enable for dashboard)
-- Run this in Supabase > Database > Replication
ALTER PUBLICATION supabase_realtime ADD TABLE agents;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;
ALTER PUBLICATION supabase_realtime ADD TABLE budget;

-- Row Level Security (RLS) - Enable if you want access control
-- ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
-- etc.

-- Stored procedures

-- Function to increment agent task count
CREATE OR REPLACE FUNCTION increment_agent_tasks(agent_id VARCHAR)
RETURNS void AS $$
BEGIN
  UPDATE agents 
  SET total_tasks_completed = total_tasks_completed + 1
  WHERE id = agent_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate agent success rate
CREATE OR REPLACE FUNCTION update_agent_success_rate(agent_id VARCHAR)
RETURNS void AS $$
DECLARE
  completed INT;
  succeeded INT;
BEGIN
  SELECT 
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*) FILTER (WHERE status = 'completed' AND (result->>'success')::boolean = true)
  INTO completed, succeeded
  FROM tasks
  WHERE assigned_to = agent_id;
  
  IF completed > 0 THEN
    UPDATE agents 
    SET success_rate = (succeeded::decimal / completed * 100)
    WHERE id = agent_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old activity logs (run this periodically)
CREATE OR REPLACE FUNCTION cleanup_old_logs(days_to_keep INT DEFAULT 30)
RETURNS INT AS $$
DECLARE
  deleted_count INT;
BEGIN
  DELETE FROM activity_log
  WHERE timestamp < NOW() - (days_to_keep || ' days')::interval;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Seed initial data

-- Insert initial budget
INSERT INTO budget (type, amount, description, timestamp)
VALUES 
  ('initial', 50.00, 'Initial USDT funding', NOW()),
  ('initial', 50.00, 'Initial API credits', NOW());

-- Insert system metrics
INSERT INTO system_metrics (metric_type, value, data, timestamp)
VALUES 
  ('budget_remaining', 100.00, '{"currency": "USD", "type": "total"}'::jsonb, NOW()),
  ('revenue_total', 0.00, '{}'::jsonb, NOW()),
  ('products_launched', 0, '{}'::jsonb, NOW());

-- Comments
COMMENT ON TABLE tasks IS 'Queue of tasks for agents to execute';
COMMENT ON TABLE agents IS 'Registered autonomous agents';
COMMENT ON TABLE activity_log IS 'Log of all agent actions and events';
COMMENT ON TABLE shared_memory IS 'Shared key-value store for agent coordination';
COMMENT ON TABLE products IS 'Products being built by the system';
COMMENT ON TABLE budget IS 'Financial transactions and tracking';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Database schema created successfully!';
  RAISE NOTICE 'Tables: tasks, agents, activity_log, shared_memory, products, budget, system_metrics';
  RAISE NOTICE 'Views: agent_performance, task_queue_summary, financial_summary';
  RAISE NOTICE 'Initial budget: $100 ($50 USDT + $50 API credits)';
END
$$;
