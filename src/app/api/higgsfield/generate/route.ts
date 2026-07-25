import { generateShowcaseVideo } from '@/lib/higgsfield';

const MOTION_PRESETS = ['orbit', 'zoom', 'pan'];

export async function POST(req: Request) {
  try {
    const { imageUrl, prompt, motion } = await req.json();

    if (!imageUrl || typeof imageUrl !== 'string') {
      return Response.json(
        { error: 'imageUrl is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(imageUrl);
    } catch {
      return Response.json(
        { error: '올바른 이미지 URL을 입력하세요' },
        { status: 400 }
      );
    }

    if (prompt !== undefined && typeof prompt !== 'string') {
      return Response.json(
        { error: 'prompt는 문자열이어야 합니다' },
        { status: 400 }
      );
    }

    if (motion !== undefined && !MOTION_PRESETS.includes(motion)) {
      return Response.json(
        { error: '지원하지 않는 모션입니다' },
        { status: 400 }
      );
    }

    console.log(`[Higgsfield Generation] Starting for image: ${imageUrl}`);

    // Generate AI showcase video using Higgsfield (mock mode if no API key set)
    const { videoUrl, mock } = await generateShowcaseVideo(imageUrl, { prompt, motion });

    console.log(`[Higgsfield Generation] Complete: ${videoUrl} (mock: ${mock})`);

    return Response.json(
      { success: true, videoUrl, mock },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[Higgsfield Generation] Error:`, message);

    return Response.json(
      { error: message, status: 'failed' },
      { status: 500 }
    );
  }
}
