import { createGptManager } from './gptManager';
import { initializeGptConfig } from './config';
import { GptRequestOptions } from './types';

// Initialize the GPT manager with config
const gptManager = createGptManager(initializeGptConfig());

// GPT model identifiers
export const GPT_MODELS = {
  GPT4: 'gpt-4',
  GPT35TURBO: 'gpt-3.5-turbo',
  GPT4_BACKUP: 'gpt-4-backup',
} as const;

// Main API function for making GPT calls
export async function callGptAPI(
  prompt: string,
  options: GptRequestOptions = {}
) {
  try {
    return await gptManager.processPrompt(prompt, options);
  } catch (error) {
    console.error('GPT API call failed:', error);
    throw error;
  }
}

// Export types and other utilities
export type { GptRequestOptions };
export { gptManager };
