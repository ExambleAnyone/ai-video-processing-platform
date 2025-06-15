import { SegmentData, AnalysisResult } from './types';
import { callGptAPI, GPT_MODELS } from '../gptApi';

export async function segmentVideo(
  videoPath: string,
  analysis: AnalysisResult
): Promise<SegmentData> {
  try {
    // Use GPT to suggest logical segmentation points based on content analysis
    const prompt = `Based on this content analysis, suggest logical video segments:
Summary: ${analysis.summary}
Topics: ${analysis.topics.join(', ')}

Provide segmentation points in this format:
- Segment 1: [start time]-[end time] - [type] - [description]
- Segment 2: [start time]-[end time] - [type] - [description]
etc.

Types should be one of: intro, main_content, transition, conclusion`;

    const response = await callGptAPI(prompt, {
      model: GPT_MODELS.GPT4,
      temperature: 0.7,
    });

    // Parse the GPT response into structured segments
    const segmentLines = response.text
      .split('\n')
      .filter(line => line.includes(':'));

    const segments = segmentLines.map(line => {
      const [timeRange, type, description] = line.split('-').map(s => s.trim());
      const [start, end] = timeRange
        .replace(/[^\d-]/g, '')
        .split('-')
        .map(Number);

      return {
        start,
        end,
        type: type.toLowerCase(),
        description: description || 'No description provided',
      };
    });

    return {
      segments: segments.sort((a, b) => a.start - b.start), // Ensure chronological order
    };
  } catch (error) {
    console.error('Error segmenting video:', error);
    throw new Error(`Failed to segment video: ${(error as Error).message}`);
  }
}

// Helper function to validate segment boundaries
export function validateSegments(segments: SegmentData['segments']): boolean {
  if (segments.length === 0) return false;

  // Check for overlapping segments
  for (let i = 1; i < segments.length; i++) {
    if (segments[i].start < segments[i - 1].end) {
      return false;
    }
  }

  // Check for invalid time values
  return segments.every(segment => 
    segment.start >= 0 && 
    segment.end > segment.start
  );
}

// Helper function to merge small segments
export function mergeSmallSegments(
  segments: SegmentData['segments'],
  minDuration: number = 5 // minimum segment duration in seconds
): SegmentData['segments'] {
  return segments.reduce((acc, curr) => {
    if (acc.length === 0) return [curr];

    const lastSegment = acc[acc.length - 1];
    
    // If current segment is too short, merge it with the previous one
    if (curr.end - curr.start < minDuration) {
      lastSegment.end = curr.end;
      lastSegment.description += ` + ${curr.description}`;
      return acc;
    }

    return [...acc, curr];
  }, [] as SegmentData['segments']);
}
