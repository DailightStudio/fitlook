import { NextRequest, NextResponse } from 'next/server';
import { extractImageFromUrl, extractProductName } from '@/lib/crawl';
import { generateTripoModel } from '@/lib/tripo';
import { db } from '@/lib/db';
import { products } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  let imageUrl = '';
  try {
    const { url, imageUrl: directImageUrl } = await request.json();

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

    // Step 1: Use direct image URL if provided, otherwise extract from page
    if (directImageUrl && typeof directImageUrl === 'string') {
      try {
        new URL(directImageUrl);
      } catch {
        return NextResponse.json(
          { message: '올바른 이미지 URL이 아닙니다' },
          { status: 400 }
        );
      }
      imageUrl = directImageUrl;
      console.log(`[Generate 3D] Using direct image URL: ${imageUrl}`);
    } else {
      imageUrl = await extractImageFromUrl(url);
      console.log(`[Generate 3D] Image extracted: ${imageUrl}`);
    }

    // Step 2: Extract product name
    const productName = await extractProductName(url);
    console.log(`[Generate 3D] Product name: ${productName}`);

    // Step 3: Generate 3D model using Tripo.AI
    console.log(`[Generate 3D] Submitting image to Tripo: ${imageUrl}`);
    const tripoModelUrl = await generateTripoModel(imageUrl, productName);
    console.log(`[Generate 3D] Model generated: ${tripoModelUrl}`);

    // Step 4: Get or create product in database
    let product = await db.query.products.findFirst({
      where: eq(products.name, productName),
    });

    let productId: string;
    if (!product) {
      const result = await db
        .insert(products)
        .values({
          name: productName,
          brand: 'Generated',
          price: 0,
          imageUrl,
          shopUrl: url,
          shopName: new URL(url).hostname,
        })
        .returning({ id: products.id });

      productId = result[0].id.toString();
      console.log(`[Generate 3D] Created product: ${productId}`);
    } else {
      productId = product.id.toString();
      console.log(`[Generate 3D] Found existing product: ${productId}`);
    }

    // Step 5: Store model URL in database
    await db
      .update(products)
      .set({ model3dUrl: tripoModelUrl })
      .where(eq(products.id, productId));

    console.log(`[Generate 3D] Updated product ${productId} with model URL`);

    return NextResponse.json(
      {
        success: true,
        modelUrl: tripoModelUrl,
        imageUrl,
        productName,
        sourceUrl: url,
        productId,
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
        debug: { imageUrl, fileType: imageUrl ? imageUrl.split('?')[0].split('.').pop()?.toLowerCase() || 'unknown' : 'no-url' }
      },
      { status: 500 }
    );
  }
}
