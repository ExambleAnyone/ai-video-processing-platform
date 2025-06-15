export const VIDEO_PROCESSING_CONFIG = {
  // Supported video formats and constraints
  video: {
    maxSize: 1024 * 1024 * 1024, // 1GB
    supportedFormats: ['mp4', 'mov', 'avi', 'webm'],
    maxDuration: 3600, // 1 hour in seconds
    preferredCodec: 'h264',
    defaultResolution: {
      width: 1920,
      height: 1080,
    },
    defaultFps: 30,
  },

  // Speech-to-text configuration
  subtitles: {
    maxSegmentDuration: 5, // seconds
    minSegmentDuration: 1, // seconds
    mergeThreshold: 0.3, // seconds - merge segments if gap is smaller
    languages: ['en', 'es', 'fr', 'de', 'it'], // supported languages
  },

  // Content analysis settings
  analysis: {
    minConfidenceScore: 0.7,
    maxRetries: 3,
    retryDelay: 1000, // ms
    batchSize: 50, // number of segments to process at once
  },

  // Text-to-speech settings
  tts: {
    defaultVoice: 'en-US-Neural2-F',
    defaultPitch: 1.0,
    defaultSpeed: 1.0,
    maxTextLength: 5000, // characters per request
    supportedFormats: ['mp3', 'wav'],
  },

  // Video editing
  editing: {
    defaultTransitionDuration: 0.5, // seconds
    maxConcurrentProcesses: 2,
    tempDir: '/tmp/video-processing',
    outputFormats: {
      web: {
        format: 'mp4',
        codec: 'h264',
        quality: 85,
      },
      mobile: {
        format: 'mp4',
        codec: 'h264',
        quality: 75,
      },
    },
  },

  // Copyright check
  copyright: {
    minConfidenceThreshold: 0.8,
    checkInterval: 10, // seconds - interval for checking video frames
    similarityThreshold: 0.95, // for content matching
  },

  // Upload settings
  upload: {
    maxRetries: 3,
    chunkSize: 1024 * 1024 * 8, // 8MB chunks
    concurrentUploads: 3,
    platforms: {
      youtube: {
        maxTitleLength: 100,
        maxDescriptionLength: 5000,
        maxTags: 500,
        supportedVisibility: ['public', 'private', 'unlisted'],
      },
      vimeo: {
        maxTitleLength: 128,
        maxDescriptionLength: 5000,
        maxTags: 20,
        supportedVisibility: ['public', 'private', 'unlisted'],
      },
    },
  },

  // API endpoints
  endpoints: {
    speechToText: process.env.SPEECH_TO_TEXT_API_ENDPOINT,
    textToSpeech: process.env.TEXT_TO_SPEECH_API_ENDPOINT,
    contentAnalysis: process.env.CONTENT_ANALYSIS_API_ENDPOINT,
    copyrightCheck: process.env.COPYRIGHT_CHECK_API_ENDPOINT,
  },

  // Error handling
  errors: {
    maxRetries: 3,
    retryDelay: 1000, // ms
    exponentialBackoff: true,
  },

  // Monitoring and logging
  monitoring: {
    logLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    metricsEnabled: true,
    samplingRate: 0.1, // 10% of requests
    performanceMetrics: {
      enabled: true,
      interval: 60000, // 1 minute
    },
  },
} as const;

// Type definitions for the config
export type VideoProcessingConfig = typeof VIDEO_PROCESSING_CONFIG;

// Helper function to get config value with type safety
export function getConfig<
  K1 extends keyof VideoProcessingConfig,
  K2 extends keyof VideoProcessingConfig[K1]
>(key1: K1, key2: K2): VideoProcessingConfig[K1][K2] {
  return VIDEO_PROCESSING_CONFIG[key1][key2];
}

// Helper function to validate configuration
export function validateConfig(): void {
  const requiredEnvVars = [
    'SPEECH_TO_TEXT_API_ENDPOINT',
    'TEXT_TO_SPEECH_API_ENDPOINT',
    'CONTENT_ANALYSIS_API_ENDPOINT',
    'COPYRIGHT_CHECK_API_ENDPOINT',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

// Initialize configuration
export function initializeConfig(): void {
  validateConfig();
  console.log('Video processing configuration initialized');
}
