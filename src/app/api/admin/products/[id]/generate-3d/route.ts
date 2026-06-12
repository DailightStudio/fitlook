import { db } from '@/lib/db';
import { products } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { generateTripoModel } from '@/lib/tripo';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { imageUrl, productName } = await req.json();

    if (!imageUrl || !productName) {
      return Response.json(
        { error: 'imageUrl and productName are required' },
        { status: 400 }
      );
    }

    console.log(`[3D Generation] Starting for product ${id}: ${productName}`);

    // Generate 3D model using Tripo.AI
    const modelUrl = await generateTripoModel(imageUrl, productName);

    console.log(`[3D Generation] Complete for product ${id}: ${modelUrl}`);

    // Update product with model URL
    await db
      .update(products)
      .set({ model3dUrl: modelUrl })
      .where(eq(products.id, id));

    return Response.json(
      { success: true, modelUrl },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[3D Generation] Error:`, message);

    // Don't fail the request - just log the error
    // The product will still be created without a 3D model
    return Response.json(
      { error: message, status: 'failed' },
      { status: 500 }
    );
  }
}
