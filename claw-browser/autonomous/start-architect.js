#!/usr/bin/env node

/**
 * Start an Architect agent
 * The brain of the system - strategic planning and task decomposition
 */

import dotenv from 'dotenv';
import { Agent, AgentPresets } from './agent-runtime.js';

dotenv.config();

const agent = new Agent({
  id: process.env.AGENT_ID || 'architect-001',
  name: process.env.AGENT_NAME || 'The Architect',
  ...AgentPresets.ARCHITECT
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await agent.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await agent.stop();
  process.exit(0);
});

// Start agent
console.log('🧠 Starting Architect agent...');
agent.start().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
