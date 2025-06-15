export interface SubtitleData {
  id: string;
  timestamps: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}

export interface AnalysisResult {
  summary: string;
  topics: string[];
  sentiment: string;
  contentRating: string;
  recommendations: string[];
}

export interface SegmentData {
  segments: Array<{
    start: number;
    end: number;
    type: string;
    description: string;
  }>;
}

export interface AudioData {
  url: string;
  duration: number;
  format: string;
}

export interface UploadResult {
  url: string;
  status: 'success' | 'failed';
  message?: string;
}

export interface ProcessingStatus {
  jobId: string;
  stage: 'subtitles' | 'analysis' | 'segmentation' | 'tts' | 'editing' | 'copyright' | 'upload';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
}
