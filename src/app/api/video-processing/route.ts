import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const optionsString = formData.get('options') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Parse options safely
    let options = {};
    try {
      options = JSON.parse(optionsString || '{}');
    } catch (e) {
      console.error('Error parsing options:', e);
      options = {};
    }

    // Simulate video processing with progress updates
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Simulate processing stages
    const stages = [
      { stage: 'subtitles', progress: 15, status: 'processing' },
      { stage: 'analysis', progress: 30, status: 'processing' },
      { stage: 'segmentation', progress: 45, status: 'processing' },
      { stage: 'narration', progress: 60, status: 'processing' },
      { stage: 'editing', progress: 75, status: 'processing' },
      { stage: 'copyright', progress: 90, status: 'processing' },
      { stage: 'upload', progress: 100, status: 'completed' }
    ];

    // Start processing simulation
    (async () => {
      try {
        for (const stageData of stages) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
          const data = encoder.encode(`data: ${JSON.stringify(stageData)}\n\n`);
          await writer.write(data);
        }

        // Send completion message
        const completionData = encoder.encode(`data: ${JSON.stringify({ 
          completed: true, 
          url: 'https://example.com/processed-video.mp4' 
        })}\n\n`);
        await writer.write(completionData);
        await writer.close();
      } catch (error) {
        const errorData = encoder.encode(`data: ${JSON.stringify({ 
          error: (error as Error).message 
        })}\n\n`);
        await writer.write(errorData);
        await writer.close();
      }
    })();

    return new NextResponse(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Video processing error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  // For Server-Sent Events connection
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Send initial connection message
  const data = encoder.encode(`data: ${JSON.stringify({ 
    message: 'Video processing API connected' 
  })}\n\n`);
  await writer.write(data);

  return new NextResponse(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
