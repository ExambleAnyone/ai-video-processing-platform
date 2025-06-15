import { GptModelConfig, GptApiConfig, GptRequestOptions, GptResponse, GptQuotaInfo } from './types';

class GptApiManager {
  private config: GptApiConfig;
  private quotaHistory: GptQuotaInfo[] = [];
  private modelStatus: Map<string, { isAvailable: boolean; lastError?: string }> = new Map();

  constructor(config: GptApiConfig) {
    this.config = config;
    this.initializeModelStatus();
  }

  private initializeModelStatus(): void {
    this.config.models.forEach(model => {
      this.modelStatus.set(model.id, { isAvailable: true });
    });
  }

  private async callModel(
    model: GptModelConfig,
    prompt: string,
    options: GptRequestOptions
  ): Promise<GptResponse> {
    try {
      const response = await fetch(model.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${model.apiKey}`,
        },
        body: JSON.stringify({
          model: model.name,
          messages: [{ role: 'user', content: prompt }],
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? model.maxTokens,
        }),
        signal: options.timeout ? AbortSignal.timeout(options.timeout) : undefined,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Update quota tracking
      this.updateQuotaUsage({
        modelId: model.id,
        tokensUsed: data.usage.total_tokens,
        timestamp: Date.now(),
      });

      return {
        text: data.choices[0].message.content,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        },
        model: model.id,
      };
    } catch (error) {
      this.modelStatus.set(model.id, { 
        isAvailable: false, 
        lastError: (error as Error).message 
      });
      throw error;
    }
  }

  private updateQuotaUsage(usage: GptQuotaInfo): void {
    this.quotaHistory.push(usage);
    
    // Clean up old quota history (older than 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    this.quotaHistory = this.quotaHistory.filter(
      record => record.timestamp > thirtyDaysAgo
    );
  }

  private checkQuota(modelId: string): boolean {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ).getTime();

    const dailyUsage = this.quotaHistory
      .filter(record => record.modelId === modelId && record.timestamp >= startOfDay)
      .reduce((sum, record) => sum + record.tokensUsed, 0);

    const startOfMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      this.config.quotaConfig.resetDay
    ).getTime();

    const monthlyUsage = this.quotaHistory
      .filter(record => record.modelId === modelId && record.timestamp >= startOfMonth)
      .reduce((sum, record) => sum + record.tokensUsed, 0);

    return (
      dailyUsage < this.config.quotaConfig.dailyLimit &&
      monthlyUsage < this.config.quotaConfig.monthlyLimit
    );
  }

  private async retryWithExponentialBackoff<T>(
    operation: () => Promise<T>,
    retryCount: number = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retryCount >= this.config.retryConfig.maxRetries) {
        throw error;
      }

      const delay = Math.min(
        this.config.retryConfig.baseDelay * Math.pow(2, retryCount),
        this.config.retryConfig.maxDelay
      );

      await new Promise(resolve => setTimeout(resolve, delay));
      return this.retryWithExponentialBackoff(operation, retryCount + 1);
    }
  }

  public async processPrompt(
    prompt: string,
    options: GptRequestOptions = {}
  ): Promise<GptResponse> {
    // Sort models by priority
    const availableModels = this.config.models
      .filter(model => {
        const status = this.modelStatus.get(model.id);
        return status?.isAvailable && this.checkQuota(model.id);
      })
      .sort((a, b) => {
        // If there's a preferred model, prioritize it
        if (options.modelPreference === a.id) return -1;
        if (options.modelPreference === b.id) return 1;
        // Otherwise sort by priority
        return a.priority - b.priority;
      });

    if (availableModels.length === 0) {
      throw new Error('No available models found');
    }

    // Try models in order until one succeeds
    let lastError: Error | null = null;
    for (const model of availableModels) {
      try {
        return await this.retryWithExponentialBackoff(() =>
          this.callModel(model, prompt, options)
        );
      } catch (error) {
        lastError = error as Error;
        console.error(`Failed to process with model ${model.id}:`, error);
        // Continue to next model
      }
    }

    throw new Error(
      `All available models failed. Last error: ${lastError?.message}`
    );
  }

  public getModelStatus(): Map<string, { isAvailable: boolean; lastError?: string }> {
    return new Map(this.modelStatus);
  }

  public getQuotaStatus(): Record<string, { daily: number; monthly: number }> {
    const status: Record<string, { daily: number; monthly: number }> = {};
    
    this.config.models.forEach(model => {
      const today = new Date();
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      ).getTime();
      
      const startOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        this.config.quotaConfig.resetDay
      ).getTime();

      const daily = this.quotaHistory
        .filter(record => record.modelId === model.id && record.timestamp >= startOfDay)
        .reduce((sum, record) => sum + record.tokensUsed, 0);

      const monthly = this.quotaHistory
        .filter(record => record.modelId === model.id && record.timestamp >= startOfMonth)
        .reduce((sum, record) => sum + record.tokensUsed, 0);

      status[model.id] = { daily, monthly };
    });

    return status;
  }
}

export const createGptManager = (config: GptApiConfig): GptApiManager => {
  return new GptApiManager(config);
};

export type { GptApiManager };
