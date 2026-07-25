// Higgsfield AI API client for AI showcase video generation (image-to-video)
//
// NOTE: This is a MOCKUP integration, not the real 3D pipeline (see tripo.ts for that).
// If HIGGSFIELD_API_KEY is not set in environment variables, every call runs in mock
// mode: a sample video URL is returned after a simulated delay instead of calling the
// real Higgsfield API. Set HIGGSFIELD_API_KEY to switch to real API calls.

const HIGGSFIELD_API_BASE = 'https://api.higgsfield.ai/v1';

const MOCK_VIDEO_URL =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

function getApiKey(): string | null {
  return process.env.HIGGSFIELD_API_KEY || null;
}

export function isMockMode(): boolean {
  return getApiKey() === null;
}

interface HiggsfieldGeneration {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  output?: {
    video_url?: string;
  };
  error?: string;
}

export async function submitImageToVideo(
  imageUrl: string,
  opts?: { prompt?: string; motion?: string },
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('HIGGSFIELD_API_KEY is not set in environment variables');
  }

  try {
    // NOTE: the exact request schema for image-to-video (field names such as
    // image_url / motion / model, and the response shape) is NOT verified against
    // the official docs (cloud.higgsfield.ai). Confirm before relying on this in
    // production - this body is a best-effort guess based on common conventions.
    const response = await fetch(`${HIGGSFIELD_API_BASE}/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task: 'image-to-video',
        model: 'higgsfield-dop',
        image_url: imageUrl,
        prompt: opts?.prompt,
        motion: opts?.motion,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Higgsfield API error: ${error.message || response.statusText}`);
    }

    // NOTE: response schema (field names, wrapping such as top-level id vs data.id)
    // is unverified against the official docs (cloud.higgsfield.ai).
    const data = await response.json();
    const id = data.id || data.data?.id;

    if (!id) {
      throw new Error('No generation id in Higgsfield response');
    }

    return id;
  } catch (error) {
    console.error('Failed to submit image to Higgsfield:', error);
    throw error;
  }
}

export async function getGenerationStatus(id: string): Promise<HiggsfieldGeneration> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('HIGGSFIELD_API_KEY is not set in environment variables');
  }

  try {
    const response = await fetch(`${HIGGSFIELD_API_BASE}/generations/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Higgsfield API error: ${response.statusText}`);
    }

    // NOTE: response schema (field names, wrapping such as top-level vs data.data,
    // status enum values) is unverified against the official docs (cloud.higgsfield.ai).
    const data = await response.json();
    return data.data ?? data;
  } catch (error) {
    console.error('Failed to get Higgsfield generation status:', error);
    throw error;
  }
}

export async function waitForGeneration(
  id: string,
  maxWaitTime = 180000, // 3 minutes
  checkInterval = 3000, // 3 seconds
): Promise<HiggsfieldGeneration> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    const generation = await getGenerationStatus(id);

    if (generation.status === 'completed') {
      return generation;
    }

    if (generation.status === 'failed') {
      throw new Error(`Higgsfield generation failed: ${generation.error || 'Unknown error'}`);
    }

    // NOTE: the status enum ('queued' | 'processing' | 'completed' | 'failed') is
    // unverified against the official docs (cloud.higgsfield.ai) - warn if the API
    // returns something outside the known set so it's easy to spot during testing.
    if (generation.status !== 'queued' && generation.status !== 'processing') {
      console.warn(`[Higgsfield] Unknown status: ${generation.status}`);
    }

    // Wait before checking again
    await new Promise((resolve) => setTimeout(resolve, checkInterval));
  }

  throw new Error(`Higgsfield generation timeout after ${maxWaitTime}ms`);
}

export interface ShowcaseVideoResult {
  videoUrl: string;
  mock: boolean;
}

// Generate an AI showcase video from a product image URL. Returns a mock sample
// video (after a short simulated delay) when HIGGSFIELD_API_KEY is not configured.
export async function generateShowcaseVideo(
  imageUrl: string,
  opts?: { prompt?: string; motion?: string },
): Promise<ShowcaseVideoResult> {
  if (isMockMode()) {
    console.log('[Higgsfield] HIGGSFIELD_API_KEY not set - running in mock mode');
    const delay = 800 + Math.random() * 700; // 800~1500ms simulated latency
    await new Promise((resolve) => setTimeout(resolve, delay));
    return { videoUrl: MOCK_VIDEO_URL, mock: true };
  }

  try {
    // Submit image for processing
    const id = await submitImageToVideo(imageUrl, opts);
    console.log(`[Higgsfield] Generation submitted: ${id}`);

    // Wait for completion
    const generation = await waitForGeneration(id);
    console.log(`[Higgsfield] Generation completed: ${id}`);

    // NOTE: response schema (output.video_url field name/location) is unverified
    // against the official docs (cloud.higgsfield.ai).
    const videoUrl = generation.output?.video_url;

    if (!videoUrl) {
      throw new Error('No video_url in Higgsfield response');
    }

    return { videoUrl, mock: false };
  } catch (error) {
    console.error('Higgsfield showcase video generation failed:', error);
    throw error;
  }
}
