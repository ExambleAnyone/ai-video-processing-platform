export interface GptModelConfig {
  id: string;
  name: string;
  endpoint: string;
  apiKey: string;
  maxTokens: number;
  timeout: number;
  priority: number;
}

export interface GptApiConfig {
  models: GptModelConfig[];
  quotaConfig: {
    dailyLimit: number;
    monthlyLimit: number;
    resetDay: number;
  };
  retryConfig: {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
  };
}

export interface GptRequestOptions {
  modelPreference?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

export interface GptResponse {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

export interface GptQuotaInfo {
  modelId: string;
  tokensUsed: number;
  timestamp: number;
}
