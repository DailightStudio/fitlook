// Tripo.AI API client for 3D model generation from images

const TRIPO_API_BASE = 'https://api.tripo3d.ai/v2';

function getTripoApiKey() {
  const key = process.env.TRIPO_API_KEY;
  if (!key) {
    throw new Error('TRIPO_API_KEY is not set in environment variables');
  }
  return key;
}

interface TripoTask {
  task_id: string;
  type: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  progress: number;
  result?: {
    model: {
      glb: string;
      mtl?: string;
      obj?: string;
      usdz?: string;
    };
  };
  error?: string;
}

export async function submitImageToTripo(imageUrl: string, productName: string): Promise<string> {
  const apiKey = getTripoApiKey();

  try {
    const response = await fetch(`${TRIPO_API_BASE}/openapi/task`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'image_to_3d',
        input: {
          image_url: imageUrl,
        },
        config: {
          model_name: productName.slice(0, 50), // Max 50 chars
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Tripo API error: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    return data.data.task_id;
  } catch (error) {
    console.error('Failed to submit image to Tripo:', error);
    throw error;
  }
}

export async function getTripoTaskStatus(taskId: string): Promise<TripoTask> {
  const apiKey = getTripoApiKey();

  try {
    const response = await fetch(`${TRIPO_API_BASE}/openapi/task/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Tripo API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Failed to get Tripo task status:', error);
    throw error;
  }
}

export async function waitForTripoTask(
  taskId: string,
  maxWaitTime = 120000, // 2 minutes
  checkInterval = 2000, // 2 seconds
): Promise<TripoTask> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    const task = await getTripoTaskStatus(taskId);

    if (task.status === 'success') {
      return task;
    }

    if (task.status === 'failed') {
      throw new Error(`Tripo task failed: ${task.error || 'Unknown error'}`);
    }

    // Wait before checking again
    await new Promise((resolve) => setTimeout(resolve, checkInterval));
  }

  throw new Error(`Tripo task timeout after ${maxWaitTime}ms`);
}

export async function downloadTripoModel(
  glbUrl: string,
): Promise<Buffer> {
  try {
    const response = await fetch(glbUrl);

    if (!response.ok) {
      throw new Error(`Failed to download model: ${response.statusText}`);
    }

    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    console.error('Failed to download Tripo model:', error);
    throw error;
  }
}

// Generate 3D model from image URL and return the model URL
export async function generateTripoModel(imageUrl: string, productName: string): Promise<string> {
  try {
    // Submit image for processing
    const taskId = await submitImageToTripo(imageUrl, productName);
    console.log(`[Tripo] Task submitted: ${taskId}`);

    // Wait for completion
    const task = await waitForTripoTask(taskId);
    console.log(`[Tripo] Task completed: ${taskId}`);

    if (!task.result?.model?.glb) {
      throw new Error('No GLB URL in Tripo response');
    }

    return task.result.model.glb;
  } catch (error) {
    console.error('Tripo model generation failed:', error);
    throw error;
  }
}
