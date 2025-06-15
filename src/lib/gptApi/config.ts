import { GptApiConfig } from './types';

export const GPT_API_CONFIG: GptApiConfig = {
  models: [
    {
      id: 'gpt-4',
      name: 'gpt-4',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      apiKey: process.env.OPENAI_API_KEY || '',
      maxTokens: 8192,
      timeout: 30000,
      priority: 1
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'gpt-3.5-turbo',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      apiKey: process.env.OPENAI_API_KEY || '',
      maxTokens: 4096,
      timeout: 15000,
      priority: 2
    }
  ],
  quotaConfig: {
    dailyLimit: 100000,  // 100k tokens per day
    monthlyLimit: 2000000,  // 2M tokens per month
    resetDay: 1  // Reset monthly quota on the 1st of each month
  },
  retryConfig: {
    maxRetries: 3,
    baseDelay: 1000,  // 1 second
    maxDelay: 10000   // 10 seconds
  }
};

// Model selection strategies for different processing tasks
export const TASK_MODEL_PREFERENCES = {
  subtitles: ['gpt-3.5-turbo', 'gpt-4'],  // Subtitles can use faster model
  contentAnalysis: ['gpt-4', 'gpt-3.5-turbo'],  // Content analysis needs best model
  segmentation: ['gpt-3.5-turbo', 'gpt-4'],  // Segmentation can use faster model
  copyright: ['gpt-4', 'gpt-3.5-turbo']  // Copyright needs best model
} as const;

// Validation function for configuration
export function validateGptConfig(config: GptApiConfig): void {
  // Check if at least one model is configured
  if (config.models.length === 0) {
    throw new Error('At least one GPT model must be configured');
  }

  // Check for required environment variables
  config.models.forEach(model => {
    if (!model.apiKey) {
      throw new Error(`API key not configured for model ${model.id}`);
    }
  });

  // Validate quota limits
  if (config.quotaConfig.dailyLimit <= 0 || config.quotaConfig.monthlyLimit <= 0) {
    throw new Error('Quota limits must be positive numbers');
  }

  // Validate retry configuration
  if (config.retryConfig.maxRetries < 0 || 
      config.retryConfig.baseDelay < 0 || 
      config.retryConfig.maxDelay < config.retryConfig.baseDelay) {
    throw new Error('Invalid retry configuration');
  }
}

// Initialize and validate configuration
export function initializeGptConfig(): GptApiConfig {
  validateGptConfig(GPT_API_CONFIG);
  return GPT_API_CONFIG;
}
