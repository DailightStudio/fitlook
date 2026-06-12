import { NextRequest, NextResponse } from 'next/server';
import { extractImageFromUrl, extractProductName } from '@/lib/crawl';
import { generateTripoModel } from '@/lib/tripo';

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

    console.log(`[Generate 3D] Starting for URL: ${url}`);

    // Step 1: Extract image from URL
    const imageUrl = await extractImageFromUrl(url);
    console.log(`[Generate 3D] Image extracted: ${imageUrl}`);

    // Step 2: Extract product name
    const productName = await extractProductName(url);
    console.log(`[Generate 3D] Product name: ${productName}`);

    // Step 3: Generate 3D model using Tripo.AI
    const modelUrl = await generateTripoModel(imageUrl, productName);
    console.log(`[Generate 3D] Model generated: ${modelUrl}`);

    return NextResponse.json(
      {
        success: true,
        modelUrl,
        imageUrl,
        productName,
        sourceUrl: url,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Generate 3D] Error:', message);

    return NextResponse.json(
      {
        message: message || '3D 모델 생성에 실패했습니다',
        details: message,
      },
      { status: 500 }
    );
  }
}
