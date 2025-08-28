// src/lib/ai/usage-tracker.js
/**
 * AI Model Usage Tracking System
 * Tracks API calls, tokens, costs, and performance metrics
 */

import { createClient } from '@/lib/supabase/client';

class UsageTracker {
  constructor() {
    this.cache = new Map();
    this.batchQueue = [];
    this.batchTimeout = null;
    this.BATCH_SIZE = 10;
    this.BATCH_DELAY = 5000; // 5 seconds
  }

  /**
   * Track a single AI model usage
   */
  async trackUsage({
    userId,
    chatbotId,
    model,
    provider,
    inputTokens,
    outputTokens,
    totalTokens,
    responseTime,
    success = true,
    error = null,
    metadata = {}
  }) {
    const usage = {
      user_id: userId,
      chatbot_id: chatbotId,
      model,
      provider,
      input_tokens: inputTokens || 0,
      output_tokens: outputTokens || 0,
      total_tokens: totalTokens || (inputTokens + outputTokens) || 0,
      response_time_ms: responseTime,
      success,
      error_message: error,
      metadata,
      created_at: new Date().toISOString()
    };

    // Add to batch queue
    this.batchQueue.push(usage);

    // Process batch if size reached
    if (this.batchQueue.length >= this.BATCH_SIZE) {
      await this.processBatch();
    } else {
      // Schedule batch processing
      this.scheduleBatch();
    }

    // Update cache for quick access
    this.updateCache(userId, usage);

    return usage;
  }

  /**
   * Schedule batch processing
   */
  scheduleBatch() {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = setTimeout(() => {
      this.processBatch();
    }, this.BATCH_DELAY);
  }

  /**
   * Process batch of usage records
   */
  async processBatch() {
    if (this.batchQueue.length === 0) return;

    const batch = [...this.batchQueue];
    this.batchQueue = [];

    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('ai_usage')
        .insert(batch);

      if (error) {
        console.error('Failed to save usage batch:', error);
        // Retry logic could be added here
      }
    } catch (error) {
      console.error('Batch processing error:', error);
    }
  }

  /**
   * Update local cache
   */
  updateCache(userId, usage) {
    const key = `${userId}-${new Date().toISOString().split('T')[0]}`;
    
    if (!this.cache.has(key)) {
      this.cache.set(key, {
        totalCalls: 0,
        totalTokens: 0,
        totalResponseTime: 0,
        errors: 0,
        models: {}
      });
    }

    const stats = this.cache.get(key);
    stats.totalCalls++;
    stats.totalTokens += usage.total_tokens;
    stats.totalResponseTime += usage.response_time_ms;
    
    if (!usage.success) {
      stats.errors++;
    }

    // Track per-model stats
    if (!stats.models[usage.model]) {
      stats.models[usage.model] = {
        calls: 0,
        tokens: 0,
        avgResponseTime: 0
      };
    }

    const modelStats = stats.models[usage.model];
    modelStats.calls++;
    modelStats.tokens += usage.total_tokens;
    modelStats.avgResponseTime = 
      (modelStats.avgResponseTime * (modelStats.calls - 1) + usage.response_time_ms) / modelStats.calls;
  }

  /**
   * Get usage statistics for a user
   */
  async getUserStats(userId, period = 'day') {
    const supabase = createClient();
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'hour':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const { data, error } = await supabase
      .from('ai_usage')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch usage stats:', error);
      return null;
    }

    // Calculate aggregated stats
    const stats = {
      period,
      totalCalls: data.length,
      totalTokens: data.reduce((sum, u) => sum + u.total_tokens, 0),
      avgResponseTime: data.reduce((sum, u) => sum + u.response_time_ms, 0) / data.length || 0,
      errorRate: (data.filter(u => !u.success).length / data.length) * 100 || 0,
      byModel: {},
      byHour: {},
      recentCalls: data.slice(0, 10)
    };

    // Group by model
    data.forEach(usage => {
      if (!stats.byModel[usage.model]) {
        stats.byModel[usage.model] = {
          calls: 0,
          tokens: 0,
          errors: 0
        };
      }
      
      stats.byModel[usage.model].calls++;
      stats.byModel[usage.model].tokens += usage.total_tokens;
      if (!usage.success) {
        stats.byModel[usage.model].errors++;
      }
    });

    // Group by hour for chart data
    data.forEach(usage => {
      const hour = new Date(usage.created_at).getHours();
      if (!stats.byHour[hour]) {
        stats.byHour[hour] = 0;
      }
      stats.byHour[hour]++;
    });

    return stats;
  }

  /**
   * Check rate limits
   */
  async checkRateLimit(userId, model) {
    const modelConfig = await import('@/lib/ai/models-config').then(m => m.getModelConfig(model));
    if (!modelConfig) return { allowed: false, error: 'Invalid model' };

    const stats = await this.getUserStats(userId, 'minute');
    if (!stats) return { allowed: true }; // Allow if can't fetch stats

    const modelStats = stats.byModel[model] || { calls: 0 };
    const rpm = modelConfig.limits.rateLimit.rpm;

    if (modelStats.calls >= rpm) {
      return {
        allowed: false,
        error: `Rate limit exceeded: ${rpm} requests per minute`,
        resetIn: 60 - new Date().getSeconds()
      };
    }

    // Check daily limit
    const dailyStats = await this.getUserStats(userId, 'day');
    const dailyModelStats = dailyStats?.byModel[model] || { calls: 0 };
    const rpd = modelConfig.limits.rateLimit.rpd;

    if (dailyModelStats.calls >= rpd) {
      return {
        allowed: false,
        error: `Daily limit exceeded: ${rpd} requests per day`,
        resetIn: (24 - new Date().getHours()) * 60 * 60
      };
    }

    return { allowed: true };
  }

  /**
   * Get cost estimation
   */
  estimateCost(usage) {
    // Since we're using free tier, cost is 0
    // This is placeholder for future paid tier implementation
    return {
      inputCost: 0,
      outputCost: 0,
      totalCost: 0,
      currency: 'USD'
    };
  }

  /**
   * Performance metrics
   */
  async getPerformanceMetrics(chatbotId, period = 'day') {
    const supabase = createClient();
    
    const now = new Date();
    const startDate = period === 'day' 
      ? new Date(now.getTime() - 24 * 60 * 60 * 1000)
      : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('ai_usage')
      .select('response_time_ms, success, model')
      .eq('chatbot_id', chatbotId)
      .gte('created_at', startDate.toISOString());

    if (error || !data) return null;

    return {
      avgResponseTime: data.reduce((sum, u) => sum + u.response_time_ms, 0) / data.length || 0,
      successRate: (data.filter(u => u.success).length / data.length) * 100 || 0,
      totalRequests: data.length,
      byModel: data.reduce((acc, u) => {
        if (!acc[u.model]) {
          acc[u.model] = { count: 0, avgTime: 0 };
        }
        acc[u.model].count++;
        acc[u.model].avgTime = 
          (acc[u.model].avgTime * (acc[u.model].count - 1) + u.response_time_ms) / acc[u.model].count;
        return acc;
      }, {})
    };
  }
}

// Singleton instance
let instance = null;

export const getUsageTracker = () => {
  if (!instance) {
    instance = new UsageTracker();
  }
  return instance;
};

export default UsageTracker;