'use client';

import { useVideoProcessing } from '@/hooks/use-video-processing';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, CheckCircle, AlertCircle } from 'lucide-react';

export default function VideoProcessingPage() {
  const {
    processVideo,
    isProcessing,
    progress,
    error,
    videoUrl,
  } = useVideoProcessing({
    onComplete: (url) => {
      console.log('Video processing completed:', url);
    },
    onError: (error) => {
      console.error('Video processing failed:', error);
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await processVideo(file, {
      video: {
        path: URL.createObjectURL(file),
        title: file.name,
        description: `AI tarafından işlenmiş video: ${file.name}`
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
        title: file.name,
        description: `AI tarafından işlenmiş video: ${file.name}`,
        tags: ['ai-processed', 'enhanced'],
        visibility: 'private'
      }
    });
  };

  const getStageLabel = (stage: string) => {
    const labels: Record<string, string> = {
      subtitles: 'Altyazı Oluşturma',
      analysis: 'İçerik Analizi',
      segmentation: 'Video Bölümleme',
      narration: 'Seslendirme',
      editing: 'Video Düzenleme',
      copyright: 'Telif Hakkı Kontrolü',
      upload: 'Platform Yükleme'
    };
    return labels[stage] || stage;
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Video İşleme</h1>
        <p className="text-gray-600">
          Yapay zeka destekli video işleme ve analiz platformu
        </p>
      </div>

      <Card className="p-8 mb-8">
        <div className="text-center mb-8">
          <Button asChild size="lg" className="w-64" disabled={isProcessing}>
            <label className="cursor-pointer flex items-center justify-center gap-2">
              <Upload className="w-5 h-5" />
              Video Yükle
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isProcessing}
              />
            </label>
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            Maksimum dosya boyutu: 1GB
          </p>
        </div>

        {isProcessing && progress && (
          <div className="space-y-6 bg-blue-50 p-6 rounded-lg border">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Video İşleniyor
              </h3>
              <p className="text-blue-700 text-sm mb-4">
                Lütfen bekleyin, videonuz işleniyor...
              </p>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="font-medium text-blue-900">
                  {getStageLabel(progress.stage)}
                </span>
              </div>
              <span className="text-sm font-bold text-blue-900 bg-blue-200 px-2 py-1 rounded">
                {Math.round(progress.progress)}%
              </span>
            </div>
            
            <div className="space-y-2">
              <Progress value={progress.progress} className="h-3" />
              <div className="flex justify-between text-xs text-blue-600">
                <span>Başladı</span>
                <span className="capitalize">
                  {progress.status === 'processing' ? 'İşleniyor...' : progress.status}
                </span>
                <span>Tamamlanacak</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className={`p-2 rounded text-center ${progress.progress >= 15 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                ✓ Altyazı
              </div>
              <div className={`p-2 rounded text-center ${progress.progress >= 45 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                ✓ Analiz
              </div>
              <div className={`p-2 rounded text-center ${progress.progress >= 75 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                ✓ Düzenleme
              </div>
              <div className={`p-2 rounded text-center ${progress.progress >= 100 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                ✓ Yükleme
              </div>
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertCircle className="w-5 h-5" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {videoUrl && (
          <div className="mt-6">
            <Alert className="bg-green-50">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <AlertDescription className="text-green-800">
                  Video işleme tamamlandı!{' '}
                  <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline"
                  >
                    Videoyu görüntüle
                  </a>
                </AlertDescription>
              </div>
            </Alert>
          </div>
        )}
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Özellikler</h2>
          <ul className="space-y-3">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Otomatik altyazı oluşturma
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              GPT ile içerik analizi
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Akıllı video bölümleme
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              AI seslendirme
            </li>
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Desteklenen Platformlar</h2>
          <ul className="space-y-3">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              YouTube otomatik yükleme
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Vimeo entegrasyonu
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Özel platform desteği
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Batch işleme desteği
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
