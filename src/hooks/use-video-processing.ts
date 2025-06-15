import { useState } from 'react';
import type { PipelineOptions, PipelineProgress } from '@/lib/videoProcessing';

interface UseVideoProcessingOptions {
  onProgress?: (progress: PipelineProgress) => void;
  onComplete?: (url: string) => void;
  onError?: (error: string) => void;
}

export function useVideoProcessing(options: UseVideoProcessingOptions = {}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<PipelineProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const processVideo = async (
    file: File,
    pipelineOptions?: Partial<PipelineOptions>
  ) => {
    setIsProcessing(true);
    setError(null);
    setVideoUrl(null);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('options', JSON.stringify(pipelineOptions || {}));

      // Set up event source for progress updates
      const eventSource = new EventSource('/api/video-processing');

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.error) {
          setError(data.error);
          options.onError?.(data.error);
          eventSource.close();
          setIsProcessing(false);
          return;
        }

        if (data.completed) {
          setVideoUrl(data.url);
          options.onComplete?.(data.url);
          eventSource.close();
          setIsProcessing(false);
          return;
        }

        // Update progress
        setProgress(data);
        options.onProgress?.(data);
      };

      eventSource.onerror = () => {
        const errorMessage = 'Connection to server lost';
        setError(errorMessage);
        options.onError?.(errorMessage);
        eventSource.close();
        setIsProcessing(false);
      };

      // Start processing by sending the file
      const response = await fetch('/api/video-processing', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Video processing failed');
      }

    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      options.onError?.(errorMessage);
      setIsProcessing(false);
    }
  };

  const cancelProcessing = () => {
    // TODO: Implement cancellation logic
    // This would involve sending a cancellation signal to the backend
    // and cleaning up any resources
  };

  return {
    processVideo,
    cancelProcessing,
    isProcessing,
    progress,
    error,
    videoUrl,
  };
}

// Helper types for better type inference
export type UseVideoProcessingReturn = ReturnType<typeof useVideoProcessing>;

// Example usage:
/*
const VideoProcessor: React.FC = () => {
  const {
    processVideo,
    isProcessing,
    progress,
    error,
    videoUrl,
  } = useVideoProcessing({
    onProgress: (progress) => {
      console.log('Processing progress:', progress);
    },
    onComplete: (url) => {
      console.log('Processing complete:', url);
    },
    onError: (error) => {
      console.error('Processing error:', error);
    },
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processVideo(file, {
        processing: {
          generateSubtitles: true,
          performContentAnalysis: true,
        },
        upload: {
          platform: 'youtube',
          visibility: 'private',
        },
      });
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileSelect} />
      {isProcessing && <div>Processing: {progress?.progress}%</div>}
      {error && <div>Error: {error}</div>}
      {videoUrl && <div>Complete! URL: {videoUrl}</div>}
    </div>
  );
};
*/
