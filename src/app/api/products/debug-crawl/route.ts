// Temporary debug endpoint: extracts image from URL without calling Tripo API
import { NextRequest, NextResponse } from 'next/server';
import { extractImageFromUrl } from '@/lib/crawl';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { message: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { message: '올바른 URL이 아닙니다' },
        { status: 400 }
      );
    }

    const imageUrl = await extractImageFromUrl(url);

    const imageUrlAfterQstrip = imageUrl.split('?')[0];
    const fileType = imageUrlAfterQstrip.split('.').pop()?.toLowerCase().replace('jpeg', 'jpg') || 'jpg';

    return NextResponse.json(
      { imageUrl, fileType, imageUrlAfterQstrip },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Debug Crawl] Error:', message);

    return NextResponse.json(
      { message, details: message },
      { status: 500 }
    );
  }
}
