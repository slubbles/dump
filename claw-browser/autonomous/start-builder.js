#!/usr/bin/env node
import dotenv from 'dotenv';
import { Agent, AgentPresets } from './agent-runtime.js';

dotenv.config();

const agentNum = process.env.AGENT_NUM || '1';

const agent = new Agent({
  id: process.env.AGENT_ID || `builder-00${agentNum}`,
  name: process.env.AGENT_NAME || `Builder ${agentNum === '1' ? 'Alpha' : 'Beta'}`,
  ...AgentPresets.BUILDER
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await agent.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await agent.stop();
  process.exit(0);
});

console.log(`🔨 Starting Builder agent ${agentNum}...`);
agent.start().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
