import { db } from '@/lib/db';
import { products } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return Response.json(
        { error: '파일이 필요합니다' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.glb') && !file.name.endsWith('.gltf')) {
      return Response.json(
        { error: '.glb 또는 .gltf 파일만 허용됩니다' },
        { status: 400 }
      );
    }

    // For production, upload to R2
    // For now, we'll use a CDN URL pattern
    const modelUrl = `https://models.fitlook.org/${id}/${file.name}`;

    // Update product with model URL
    await db
      .update(products)
      .set({ model3dUrl: modelUrl })
      .where(eq(products.id, id));

    return Response.json(
      { success: true, modelUrl },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Model upload error:', error);
    return Response.json(
      { error: '모델 업로드 실패' },
      { status: 500 }
    );
  }
}
