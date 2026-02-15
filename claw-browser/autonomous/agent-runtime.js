/**
 * AUTONOMOUS AGENT RUNTIME
 * 
 * Each agent runs independently, connects to Supabase, claims tasks,
 * executes them autonomously, and reports results.
 */

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { BrowserControl } from '../src/browser-control.js';
import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class Agent {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.role = config.role;
    this.capabilities = config.capabilities || [];
    this.systemPrompt = config.systemPrompt || '';
    
    // Connections
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
    
    this.claude = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    
    this.browser = null; // Lazy init
    
    // State
    this.currentTask = null;
    this.isRunning = false;
    this.stats = {
      tasksCompleted: 0,
      tasksSucceeded: 0,
      tasksFailed: 0,
      startTime: new Date()
    };
  }
  
  /**
   * Start the agent
   */
  async start() {
    console.log(`🤖 [${this.name}] Starting...`);
    
    this.isRunning = true;
    
    // Register in database
    await this.register();
    
    // Start heartbeat
    this.startHeartbeat();
    
    // Log startup
    await this.log('startup', `Agent ${this.name} started with capabilities: ${this.capabilities.join(', ')}`);
    
    // Main event loop
    await this.mainLoop();
  }
  
  /**
   * Stop the agent gracefully
   */
  async stop() {
    console.log(`🛑 [${this.name}] Stopping...`);
    
    this.isRunning = false;
    
    // Close browser if open
    if (this.browser) {
      await this.browser.stop();
    }
    
    // Update status
    await this.supabase.from('agents').update({
      status: 'offline',
      last_heartbeat: new Date().toISOString()
    }).eq('id', this.id);
    
    await this.log('shutdown', 'Agent stopped');
  }
  
  /**
   * Register agent in database
   */
  async register() {
    const { error } = await this.supabase.from('agents').upsert({
      id: this.id,
      name: this.name,
      role: this.role,
      status: 'idle',
      capabilities: this.capabilities,
      last_heartbeat: new Date().toISOString(),
      total_tasks_completed: 0,
      success_rate: 0.0
    });
    
    if (error) {
      console.error('Failed to register agent:', error);
      throw error;
    }
  }
  
  /**
   * Send heartbeat every 10 seconds
   */
  startHeartbeat() {
    setInterval(async () => {
      try {
        await this.supabase.from('agents').update({
          last_heartbeat: new Date().toISOString(),
          status: this.currentTask ? 'busy' : 'idle',
          current_task_id: this.currentTask?.id || null
        }).eq('id', this.id);
      } catch (error) {
        console.error('Heartbeat failed:', error);
      }
    }, 10000);
  }
  
  /**
   * Main event loop
   */
  async mainLoop() {
    while (this.isRunning) {
      try {
        // Try to claim a task
        const task = await this.claimTask();
        
        if (!task) {
          // No tasks available, wait
          await this.sleep(30000); // 30 seconds
          continue;
        }
        
        this.currentTask = task;
        
        // Execute the task
        console.log(`📋 [${this.name}] Starting task: ${task.title}`);
        await this.log('task_started', `Starting task: ${task.title}`, { task_id: task.id });
        
        const result = await this.executeTask(task);
        
        // Complete the task
        await this.completeTask(task.id, result);
        
        console.log(`✅ [${this.name}] Completed task: ${task.title}`);
        await this.log('task_completed', `Completed task: ${task.title}`, { 
          task_id: task.id,
          result 
        });
        
        this.stats.tasksCompleted++;
        if (result.success) {
          this.stats.tasksSucceeded++;
        } else {
          this.stats.tasksFailed++;
        }
        
        this.currentTask = null;
        
      } catch (error) {
        console.error(`❌ [${this.name}] Error:`, error);
        await this.handleError(error);
      }
    }
  }
  
  /**
   * Claim next available task matching agent capabilities
   */
  async claimTask() {
    // Get highest priority task matching capabilities
    const { data: tasks, error } = await this.supabase
      .from('tasks')
      .select('*')
      .eq('status', 'queued')
      .in('type', this.capabilities)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(1);
    
    if (error || !tasks || tasks.length === 0) {
      return null;
    }
    
    const task = tasks[0];
    
    // Try to claim it (optimistic locking)
    const { data, error: claimError } = await this.supabase
      .from('tasks')
      .update({
        status: 'assigned',
        assigned_to: this.id,
        started_at: new Date().toISOString()
      })
      .eq('id', task.id)
      .eq('status', 'queued') // Only update if still queued
      .select();
    
    if (claimError || !data || data.length === 0) {
      // Another agent claimed it
      return null;
    }
    
    return data[0];
  }
  
  /**
   * Execute a task based on its type
   */
  async executeTask(task) {
    // Update status to in_progress
    await this.supabase.from('tasks').update({
      status: 'in_progress'
    }).eq('id', task.id);
    
    try {
      // Route to appropriate handler
      switch (task.type) {
        case 'research':
          return await this.handleResearch(task);
        case 'build':
          return await this.handleBuild(task);
        case 'test':
          return await this.handleTest(task);
        case 'deploy':
          return await this.handleDeploy(task);
        case 'market':
          return await this.handleMarketing(task);
        case 'analyze':
          return await this.handleAnalysis(task);
        case 'plan':
          return await this.handlePlanning(task);
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }
  
  /**
   * Handle research tasks
   */
  async handleResearch(task) {
    const { urls, query, depth } = task.requirements;
    
    // Init browser if needed
    if (!this.browser) {
      this.browser = new BrowserControl({ headless: true });
      await this.browser.start();
    }
    
    const results = [];
    
    // Visit each URL
    for (const url of urls || []) {
      try {
        await this.browser.navigate(url);
        await this.sleep(2000); // Wait for page load
        
        const snapshot = await this.browser.snapshot();
        results.push({
          url,
          snapshot,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        results.push({
          url,
          error: error.message
        });
      }
    }
    
    // Analyze with Claude
    const analysis = await this.callClaude(`
You are a research analyst. Analyze the following data and extract key insights.

Query: ${query || 'General research'}

Data from ${results.length} sources:
${results.map(r => `\nSOURCE: ${r.url}\n${r.snapshot || r.error}`).join('\n\n---\n\n')}

Provide:
1. Key findings
2. Trends identified
3. Actionable insights
4. Data quality assessment

Format as JSON with these keys.
    `);
    
    return {
      success: true,
      raw_results: results,
      analysis: this.tryParseJSON(analysis) || { text: analysis },
      sources_count: results.length,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Handle build/coding tasks
   */
  async handleBuild(task) {
    const { spec, language, framework } = task.requirements;
    
    // Generate code using Claude
    const prompt = `
You are an expert software engineer. Build the following:

TITLE: ${task.title}
DESCRIPTION: ${task.description}

SPECIFICATIONS:
${JSON.stringify(spec, null, 2)}

LANGUAGE: ${language || 'JavaScript'}
FRAMEWORK: ${framework || 'None'}

Generate complete, production-ready code with:
1. Proper error handling
2. Clear documentation
3. Tests if applicable
4. Deployment instructions

Output as JSON:
{
  "files": [
    { "path": "...", "content": "..." }
  ],
  "instructions": "How to deploy/run",
  "dependencies": ["..."]
}
    `;
    
    const response = await this.callClaude(prompt);
    const codePackage = this.tryParseJSON(response);
    
    if (!codePackage || !codePackage.files) {
      return {
        success: false,
        error: 'Failed to generate valid code package',
        raw_response: response
      };
    }
    
    // Write files (in a sandboxed directory)
    const buildDir = `/tmp/builds/${task.id}`;
    await fs.mkdir(buildDir, { recursive: true });
    
    for (const file of codePackage.files) {
      const filePath = `${buildDir}/${file.path}`;
      const fileDir = filePath.substring(0, filePath.lastIndexOf('/'));
      await fs.mkdir(fileDir, { recursive: true });
      await fs.writeFile(filePath, file.content);
    }
    
    return {
      success: true,
      build_dir: buildDir,
      files: codePackage.files.map(f => f.path),
      instructions: codePackage.instructions,
      dependencies: codePackage.dependencies,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Handle test/QA tasks
   */
  async handleTest(task) {
    const { target, test_types } = task.requirements;
    
    // Run tests based on type
    const results = [];
    
    if (test_types.includes('smoke')) {
      // Basic smoke test
      if (target.url) {
        if (!this.browser) {
          this.browser = new BrowserControl({ headless: true });
          await this.browser.start();
        }
        
        try {
          await this.browser.navigate(target.url);
          const snapshot = await this.browser.snapshot();
          results.push({
            type: 'smoke',
            status: 'passed',
            message: 'Site is accessible'
          });
        } catch (error) {
          results.push({
            type: 'smoke',
            status: 'failed',
            error: error.message
          });
        }
      }
    }
    
    if (test_types.includes('unit')) {
      // Run unit tests if they exist
      try {
        const { stdout, stderr } = await execAsync('npm test', {
          cwd: target.directory
        });
        results.push({
          type: 'unit',
          status: 'passed',
          output: stdout
        });
      } catch (error) {
        results.push({
          type: 'unit',
          status: 'failed',
          error: error.message
        });
      }
    }
    
    // Analyze results with Claude
    const analysis = await this.callClaude(`
Analyze these test results and determine overall quality:

${JSON.stringify(results, null, 2)}

Provide:
1. Overall status (pass/fail)
2. Issues found
3. Recommendations
4. Risk level (low/medium/high)

Format as JSON.
    `);
    
    const testAnalysis = this.tryParseJSON(analysis) || { text: analysis };
    
    return {
      success: testAnalysis.overall_status !== 'fail',
      test_results: results,
      analysis: testAnalysis,
      passed: results.filter(r => r.status === 'passed').length,
      failed: results.filter(r => r.status === 'failed').length,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Handle deployment tasks
   */
  async handleDeploy(task) {
    const { target, platform } = task.requirements;
    
    // This would integrate with actual deployment platforms
    // For now, just simulate
    
    return {
      success: true,
      deployed: true,
      platform,
      url: `https://${target.name}.example.com`,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Handle marketing tasks
   */
  async handleMarketing(task) {
    const { product, channels, message } = task.requirements;
    
    // Generate marketing content
    const content = await this.callClaude(`
Create marketing content for:

PRODUCT: ${product.name}
DESCRIPTION: ${product.description}
CHANNELS: ${channels.join(', ')}
MESSAGE: ${message || 'Default announcement'}

For each channel, create optimized content including:
1. Headline
2. Body copy
3. Call-to-action
4. Hashtags (if applicable)

Format as JSON with channel names as keys.
    `);
    
    const marketingContent = this.tryParseJSON(content);
    
    // Store content for manual posting or automated posting
    return {
      success: true,
      content: marketingContent,
      channels,
      ready_to_post: true,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Handle analysis tasks
   */
  async handleAnalysis(task) {
    const { data, analysis_type } = task.requirements;
    
    const prompt = `
Perform ${analysis_type} analysis on this data:

${JSON.stringify(data, null, 2)}

Provide detailed insights, trends, and recommendations.
Format as JSON.
    `;
    
    const analysis = await this.callClaude(prompt);
    
    return {
      success: true,
      analysis: this.tryParseJSON(analysis) || { text: analysis },
      analysis_type,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Handle planning tasks
   */
  async handlePlanning(task) {
    const { goal, constraints, timeline } = task.requirements;
    
    const prompt = `
${this.systemPrompt}

Create a detailed plan for:

GOAL: ${goal}
CONSTRAINTS: ${JSON.stringify(constraints)}
TIMELINE: ${timeline}

Break down into specific, actionable tasks. For each task include:
1. Title
2. Description
3. Type (research/build/test/deploy/market/analyze)
4. Priority (1-10)
5. Estimated time
6. Dependencies

Format as JSON array of tasks.
    `;
    
    const plan = await this.callClaude(prompt);
    const tasks = this.tryParseJSON(plan);
    
    if (!tasks || !Array.isArray(tasks)) {
      return {
        success: false,
        error: 'Failed to generate valid plan'
      };
    }
    
    // Create tasks in database
    for (const taskData of tasks) {
      await this.supabase.from('tasks').insert({
        type: taskData.type,
        priority: taskData.priority,
        title: taskData.title,
        description: taskData.description,
        requirements: {
          estimated_time: taskData.estimated_time,
          dependencies: taskData.dependencies
        },
        status: 'queued',
        parent_task_id: task.id
      });
    }
    
    return {
      success: true,
      tasks_created: tasks.length,
      plan: tasks,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Complete a task
   */
  async completeTask(taskId, result) {
    await this.supabase.from('tasks').update({
      status: result.success ? 'completed' : 'failed',
      completed_at: new Date().toISOString(),
      result
    }).eq('id', taskId);
    
    // Update agent stats
    const successRate = (this.stats.tasksSucceeded / this.stats.tasksCompleted) * 100;
    
    await this.supabase.from('agents').update({
      total_tasks_completed: this.stats.tasksCompleted,
      success_rate: successRate
    }).eq('id', this.id);
  }
  
  /**
   * Call Claude API
   */
  async callClaude(prompt, options = {}) {
    const response = await this.claude.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: options.max_tokens || 8000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });
    
    return response.content[0].text;
  }
  
  /**
   * Log activity
   */
  async log(event_type, message, data = {}) {
    await this.supabase.from('activity_log').insert({
      agent_id: this.id,
      task_id: this.currentTask?.id,
      event_type,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Handle errors
   */
  async handleError(error) {
    console.error(`❌ [${this.name}] Error:`, error);
    
    await this.log('error', error.message, {
      stack: error.stack,
      task: this.currentTask
    });
    
    if (this.currentTask) {
      await this.supabase.from('tasks').update({
        status: 'failed',
        error: error.message,
        completed_at: new Date().toISOString()
      }).eq('id', this.currentTask.id);
      
      this.currentTask = null;
      this.stats.tasksFailed++;
    }
  }
  
  /**
   * Utilities
   */
  tryParseJSON(str) {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = str.match(/```json\n([\s\S]*?)\n```/) || 
                       str.match(/```\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      return JSON.parse(str);
    } catch {
      return null;
    }
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Agent presets for different roles
 */
export const AgentPresets = {
  ARCHITECT: {
    role: 'architect',
    capabilities: ['research', 'analyze', 'plan'],
    systemPrompt: `You are The Architect, a strategic AI agent responsible for:
- Market research and opportunity identification
- Product strategy and planning
- Task decomposition and prioritization
- Resource allocation
- System monitoring

You have access to browser automation, APIs, and Claude AI.
Your goal is to maximize revenue while staying within budget.
Think strategically and create detailed, actionable plans.`
  },
  
  RESEARCHER: {
    role: 'researcher',
    capabilities: ['research'],
    systemPrompt: `You are The Researcher, responsible for:
- Web scraping and data collection
- Competitive analysis
- Market validation
- Trend detection
- Information synthesis

You have browser automation capabilities.
Be thorough, accurate, and cite sources.`
  },
  
  BUILDER: {
    role: 'builder',
    capabilities: ['build', 'deploy'],
    systemPrompt: `You are a Builder, responsible for:
- Code generation
- Application development
- API integration
- Deployment automation
- Technical implementation

Generate production-ready, well-documented code.
Follow best practices and include error handling.`
  },
  
  QA: {
    role: 'qa',
    capabilities: ['test', 'analyze'],
    systemPrompt: `You are Quality Assurance, responsible for:
- Testing and validation
- Bug detection
- Code review
- Performance assessment
- Security checks

Be thorough and critical. Quality is your priority.`
  },
  
  MARKETER: {
    role: 'marketer',
    capabilities: ['market'],
    systemPrompt: `You are The Marketer, responsible for:
- Marketing content creation
- Campaign execution
- Social media management
- Customer acquisition
- Growth strategies

Be creative, persuasive, and data-driven.`
  }
};

// Export for use in startup scripts
export default Agent;
