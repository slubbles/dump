#!/usr/bin/env node
import dotenv from 'dotenv';
import { Agent, AgentPresets } from './agent-runtime.js';

dotenv.config();

const agent = new Agent({
  id: process.env.AGENT_ID || 'qa-001',
  name: process.env.AGENT_NAME || 'Quality Checker',
  ...AgentPresets.QA
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

console.log('✅ Starting QA agent...');
agent.start().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
