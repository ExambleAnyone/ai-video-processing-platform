# 🎬 AI Video Processing Platform

AI-powered video processing and analysis platform. Automatically process, analyze, and optimize your videos.

![AI Video Processing Platform](public/next.svg)

## 📋 Table of Contents

- [Features](#-features)
- [Requirements](#-requirements)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Reference](#-api-reference)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- 🎯 **Automatic Subtitle Generation**
  - Speech recognition technology
  - Multi-language support
  - Time-stamped synchronization

- 🧠 **GPT-Powered Content Analysis**
  - Video content analysis
  - Main topic detection
  - SEO optimization

- ✂️ **Smart Video Segmentation**
  - Automatic segmentation
  - Key moment detection
  - Highlight creation

- 🎙️ **AI Narration**
  - Natural language narration
  - Multi-language support
  - Customizable voices

- ⚖️ **Copyright Check**
  - Automatic content scanning
  - Risk analysis
  - Legal compliance

- 📤 **Platform Integrations**
  - YouTube auto-upload
  - Vimeo integration
  - Batch processing

## 💻 Requirements

- Node.js 18.0.0 or higher
- npm or yarn
- FFmpeg
- Google Cloud account (for Speech-to-Text and Text-to-Speech)
- OpenAI API key (for GPT integration)

## 🚀 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-video-processing.git
cd ai-video-processing
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Edit .env.local file:
```env
OPENAI_API_KEY=your_openai_api_key
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/credentials.json
YOUTUBE_API_KEY=your_youtube_api_key
```

5. Start the development server:
```bash
npm run dev
# or
yarn dev
```

6. Visit http://localhost:8000

## 📖 Usage

### Video Processing

1. Click "Upload Video" on the main page
2. Select video to process (max 1GB)
3. Choose processing options:
   - Subtitle generation
   - Content analysis
   - Narration
   - Platform upload
4. Start processing and monitor via progress bar

### API Usage

```typescript
import { processVideo } from '@/lib/videoProcessing';

// Process video
const result = await processVideo({
  video: {
    path: 'video.mp4',
    title: 'Test Video',
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
    visibility: 'private'
  }
});
```

## 📚 API Reference

### Video Processing API

#### POST /api/video-processing

Upload and start video processing.

**Request:**
```typescript
interface ProcessingRequest {
  file: File;
  options: {
    video: {
      title: string;
      description: string;
    };
    processing: {
      generateSubtitles: boolean;
      performContentAnalysis: boolean;
      generateNarration: boolean;
      performSegmentation: boolean;
      checkCopyright: boolean;
    };
    upload: {
      platform: 'youtube' | 'vimeo';
      visibility: 'public' | 'private' | 'unlisted';
    };
  };
}
```

**Response:**
```typescript
interface ProcessingResponse {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  url?: string;
  error?: string;
}
```

### Progress Tracking

Real-time progress tracking with Server-Sent Events:

```typescript
const eventSource = new EventSource('/api/video-processing');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Progress:', data.progress);
};
```

## 🔧 Configuration

### next.config.ts

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration settings
}

export default nextConfig;
```

### GPT Configuration

src/lib/gptApi/config.ts:
```typescript
export const GPT_CONFIG = {
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2000
};
```

## 🚢 Deployment

### Docker Deployment

1. Build Docker image:
```bash
docker build -t ai-video-processing .
```

2. Run container:
```bash
docker run -p 8000:8000 ai-video-processing
```

### Kubernetes Deployment

Deploy using k8s/deployment.yaml and k8s/service.yaml:

```bash
kubectl apply -f k8s/
```

### Docker Compose (Development)

```bash
docker-compose up -d
```

## 🧪 Testing

### Run Tests

```bash
npm test
# or
yarn test
```

### API Testing

Test the video processing endpoint:

```bash
curl -X POST http://localhost:8000/api/video-processing \
  -F "file=@test-video.mp4" \
  -F 'options={"processing":{"generateSubtitles":true}}'
```

## 🏗️ Project Structure

```
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── api/            # API routes
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/         # React components
│   │   └── ui/            # UI components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   │   ├── gptApi/        # GPT integration
│   │   └── videoProcessing/ # Video processing logic
├── public/                # Static assets
├── k8s/                   # Kubernetes manifests
├── .env.example          # Environment variables template
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose configuration
└── README.md            # This file
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for GPT integration | Yes |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to Google Cloud credentials | Yes |
| `YOUTUBE_API_KEY` | YouTube Data API key | Optional |
| `VIMEO_ACCESS_TOKEN` | Vimeo API access token | Optional |

## 🐛 Troubleshooting

### Common Issues

1. **FFmpeg not found**
   ```bash
   # Install FFmpeg
   # macOS
   brew install ffmpeg
   
   # Ubuntu/Debian
   sudo apt update && sudo apt install ffmpeg
   
   # Windows
   # Download from https://ffmpeg.org/download.html
   ```

2. **Google Cloud credentials error**
   - Ensure `GOOGLE_APPLICATION_CREDENTIALS` points to valid JSON file
   - Enable Speech-to-Text and Text-to-Speech APIs in Google Cloud Console

3. **OpenAI API rate limits**
   - Check your OpenAI usage limits
   - Consider upgrading your OpenAI plan

## 📊 Performance

- **Processing Speed**: ~2-5x video length depending on options
- **Supported Formats**: MP4, AVI, MOV, MKV
- **Max File Size**: 1GB (configurable)
- **Concurrent Processing**: Up to 5 videos simultaneously

## 🔄 Roadmap

- [ ] Real-time video streaming support
- [ ] Advanced AI video editing
- [ ] Multi-language subtitle translation
- [ ] Custom AI model training
- [ ] Mobile app development

## 👥 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for your changes
5. Ensure all tests pass (`npm test`)
6. Commit your changes (`git commit -m 'feat: add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [OpenAI](https://openai.com/) - GPT API
- [Google Cloud](https://cloud.google.com/) - Speech and TTS services
- [FFmpeg](https://ffmpeg.org/) - Video processing
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Radix UI](https://www.radix-ui.com/) - UI components

## 📞 Support

- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/ai-video-processing/issues)

---

© 2025 AI Video Processing Platform. All rights reserved.
