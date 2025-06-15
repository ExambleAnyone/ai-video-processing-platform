interface GptOptions {
  model: string;
  maxRetries?: number;
  temperature?: number;
}

interface GptResponse {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

class GptApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'GptApiError';
  }
}

export async function callGptAPI(
  prompt: string,
  options: GptOptions
): Promise<GptResponse> {
  const maxRetries = options.maxRetries || 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // TODO: Replace with actual GPT API implementation
      const response = await fetch(process.env.GPT_API_ENDPOINT!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GPT_API_KEY}`,
        },
        body: JSON.stringify({
          model: options.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: options.temperature || 0.7,
        }),
      });

      if (!response.ok) {
        throw new GptApiError(`API request failed: ${response.statusText}`, response.status);
      }

      const data = await response.json();
      
      return {
        text: data.choices[0].message.content,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        },
      };
    } catch (error) {
      lastError = error as Error;
      
      // If we've exhausted all retries, throw the last error
      if (attempt === maxRetries - 1) {
        throw new GptApiError(
          `Failed after ${maxRetries} attempts: ${lastError.message}`
        );
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }

  // This should never be reached due to the throw in the loop
  throw new Error('Unexpected error in GPT API call');
}

export const GPT_MODELS = {
  GPT4: 'gpt-4',
  GPT35TURBO: 'gpt-3.5-turbo',
} as const;
