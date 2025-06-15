import { generateSubtitles } from './autoSubtitles';
import { analyzeContent } from './contentAnalysis';
import { segmentVideo } from './segmentation';
import { generateNarration } from './textToSpeech';
import { editVideo } from './videoEditing';
import { checkCopyright } from './copyrightCheck';
import { uploadToPlatform, UploadOptions, UploadProgressTracker } from './platformUpload';
import { SubtitleData, AudioData, SegmentData } from './types';

export interface PipelineOptions {
  video: {
    path: string;
    title: string;
    description?: string;
  };
  processing: {
    generateSubtitles?: boolean;
    performContentAnalysis?: boolean;
    generateNarration?: boolean;
    performSegmentation?: boolean;
    checkCopyright?: boolean;
  };
  upload: UploadOptions;
}

export interface PipelineProgress {
  stage: 'subtitles' | 'analysis' | 'segmentation' | 'narration' | 'editing' | 'copyright' | 'upload';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
}

export class VideoProcessingPipeline {
  private options: PipelineOptions;
  private progressListeners: ((progress: PipelineProgress) => void)[] = [];
  private currentProgress: PipelineProgress;

  constructor(options: PipelineOptions) {
    this.options = options;
    this.currentProgress = {
      stage: 'subtitles',
      status: 'pending',
      progress: 0,
    };
  }

  onProgress(callback: (progress: PipelineProgress) => void): void {
    this.progressListeners.push(callback);
  }

  private updateProgress(update: Partial<PipelineProgress>): void {
    this.currentProgress = { ...this.currentProgress, ...update };
    this.notifyProgressListeners();
  }

  private notifyProgressListeners(): void {
    this.progressListeners.forEach(listener => listener(this.currentProgress));
  }

  async process(): Promise<string> {
    try {
      let subtitles: SubtitleData | undefined;
      let contentAnalysis: any | undefined;
      let segments: SegmentData | undefined;
      let narration: AudioData | undefined;

      // Step 1: Generate Subtitles
      if (this.options.processing.generateSubtitles) {
        this.updateProgress({ stage: 'subtitles', status: 'processing' });
        subtitles = await generateSubtitles(this.options.video.path);
        this.updateProgress({ status: 'completed', progress: 15 });
      }

      // Step 2: Content Analysis
      if (this.options.processing.performContentAnalysis && subtitles) {
        this.updateProgress({ stage: 'analysis', status: 'processing' });
        contentAnalysis = await analyzeContent(this.options.video.path, subtitles);
        this.updateProgress({ status: 'completed', progress: 30 });
      }

      // Step 3: Segmentation
      if (this.options.processing.performSegmentation && contentAnalysis) {
        this.updateProgress({ stage: 'segmentation', status: 'processing' });
        segments = await segmentVideo(this.options.video.path, contentAnalysis);
        this.updateProgress({ status: 'completed', progress: 45 });
      }

      // Step 4: Generate Narration
      if (this.options.processing.generateNarration && contentAnalysis) {
        this.updateProgress({ stage: 'narration', status: 'processing' });
        narration = await generateNarration(contentAnalysis.summary);
        this.updateProgress({ status: 'completed', progress: 60 });
      }

      // Step 5: Video Editing
      this.updateProgress({ stage: 'editing', status: 'processing' });
      const editedVideoPath = await editVideo(
        this.options.video.path,
        subtitles || { id: '', timestamps: [] },
        narration || { url: '', duration: 0, format: 'mp3' },
        segments || { segments: [] }
      );
      this.updateProgress({ status: 'completed', progress: 75 });

      // Step 6: Copyright Check
      if (this.options.processing.checkCopyright && subtitles) {
        this.updateProgress({ stage: 'copyright', status: 'processing' });
        const copyrightResult = await checkCopyright(editedVideoPath, subtitles.timestamps.map(t => t.text).join(' '));
        if (!copyrightResult.isValid) {
          throw new Error(`Copyright check failed: ${copyrightResult.issues.join(', ')}`);
        }
        this.updateProgress({ status: 'completed', progress: 90 });
      }

      // Step 7: Upload
      this.updateProgress({ stage: 'upload', status: 'processing' });
      const uploadTracker = new UploadProgressTracker();
      uploadTracker.onProgress(progress => {
        this.updateProgress({
          progress: 90 + (progress.percentage * 0.1), // Scale to remaining 10%
        });
      });

      const uploadResult = await uploadToPlatform(editedVideoPath, this.options.upload);
      
      if (!uploadResult.success) {
        throw new Error(`Upload failed: ${uploadResult.error}`);
      }

      this.updateProgress({ status: 'completed', progress: 100 });

      return uploadResult.url || '';

    } catch (error) {
      this.updateProgress({
        status: 'failed',
        error: (error as Error).message,
      });
      throw error;
    }
  }
}

// Helper function to create a new pipeline instance
export function createPipeline(options: PipelineOptions): VideoProcessingPipeline {
  return new VideoProcessingPipeline(options);
}

// Example usage:
/*
const pipeline = createPipeline({
  video: {
    path: '/path/to/video.mp4',
    title: 'My Video',
    description: 'Video description'
  },
  processing: {
    generateSubtitles: true,
    performContentAnalysis: true,
    generateNarration: true,
    performSegmentation: true,
    checkCopyright: true
  },
  upload: {
    platform: 'youtube',
    title: 'My Video',
    description: 'Processed video',
    tags: ['processed', 'ai'],
    visibility: 'public'
  }
});

pipeline.onProgress(progress => {
  console.log(\`Stage: \${progress.stage}, Status: \${progress.status}, Progress: \${progress.progress}%\`);
});

try {
  const videoUrl = await pipeline.process();
  console.log(\`Video processing complete. URL: \${videoUrl}\`);
} catch (error) {
  console.error('Pipeline failed:', error);
}
*/
