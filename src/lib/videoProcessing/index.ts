// Configuration
export { 
  VIDEO_PROCESSING_CONFIG,
  type VideoProcessingConfig,
  getConfig,
  validateConfig,
  initializeConfig,
} from './config';

// Core types
export {
  type SubtitleData,
  type AudioData,
  type SegmentData,
} from './types';

// Pipeline
export {
  type PipelineOptions,
  type PipelineProgress,
  VideoProcessingPipeline,
  createPipeline,
} from './pipeline';

// Individual modules
export { generateSubtitles } from './autoSubtitles';
export { analyzeContent } from './contentAnalysis';
export { segmentVideo } from './segmentation';
export { generateNarration } from './textToSpeech';
export { editVideo } from './videoEditing';
export { checkCopyright } from './copyrightCheck';
export { 
  uploadToPlatform,
  type UploadOptions,
  type UploadProgress,
  UploadProgressTracker,
} from './platformUpload';

// Example usage:
/*
import { 
  createPipeline, 
  initializeConfig,
  type PipelineOptions 
} from './videoProcessing';

// Initialize the configuration
initializeConfig();

// Create pipeline options
const options: PipelineOptions = {
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
};

// Create and run the pipeline
const pipeline = createPipeline(options);

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
