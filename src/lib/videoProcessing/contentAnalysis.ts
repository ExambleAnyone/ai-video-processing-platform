import { AnalysisResult, SubtitleData } from './types';
import { callGptAPI, GPT_MODELS } from '../gptApi';

export async function analyzeContent(
  videoPath: string,
  subtitles: SubtitleData
): Promise<AnalysisResult> {
  try {
    // Combine all subtitle text for analysis
    const transcriptText = subtitles.timestamps
      .map(t => t.text)
      .join(' ');

    // Generate prompt for content analysis
    const prompt = `Analyze the following video transcript and provide:
1. A brief summary
2. Main topics discussed
3. Overall sentiment
4. Content rating
5. Recommendations for improvements

Transcript:
${transcriptText}`;

    const response = await callGptAPI(prompt, {
      model: GPT_MODELS.GPT4,
      temperature: 0.7,
    });

    // Parse GPT response into structured format
    // This is a simplified example - in production you'd want more robust parsing
    const lines = response.text.split('\n');
    
    return {
      summary: lines.find(l => l.includes('summary'))?.split(':')[1]?.trim() || '',
      topics: lines
        .find(l => l.includes('topics'))
        ?.split(':')[1]
        ?.split(',')
        .map(t => t.trim()) || [],
      sentiment: lines.find(l => l.includes('sentiment'))?.split(':')[1]?.trim() || '',
      contentRating: lines.find(l => l.includes('rating'))?.split(':')[1]?.trim() || '',
      recommendations: lines
        .find(l => l.includes('recommendations'))
        ?.split(':')[1]
        ?.split(',')
        .map(r => r.trim()) || [],
    };
  } catch (error) {
    console.error('Error analyzing content:', error);
    throw new Error(`Failed to analyze content: ${(error as Error).message}`);
  }
}

// Helper function to detect potentially sensitive content
export async function detectSensitiveContent(
  transcriptText: string
): Promise<boolean> {
  try {
    const prompt = `Analyze this text for any sensitive, inappropriate, or offensive content:
${transcriptText}

Respond with either "SENSITIVE" or "SAFE" followed by a brief explanation.`;

    const response = await callGptAPI(prompt, {
      model: GPT_MODELS.GPT35TURBO,
      temperature: 0.3,
    });

    return response.text.toLowerCase().includes('sensitive');
  } catch (error) {
    console.error('Error detecting sensitive content:', error);
    // In case of error, err on the side of caution
    return true;
  }
}
