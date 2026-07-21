import { generateTripoModel } from '../src/lib/tripo';
import { extractImageFromUrl, extractProductName } from '../src/lib/crawl';
import * as fs from 'fs';
import * as path from 'path';

interface Sample {
  category: string;
  name: string;
  url: string;
}

async function downloadSamples() {
  const samplesPath = path.join(__dirname, 'samples.json');
  const samples: { samples: Sample[] } = JSON.parse(fs.readFileSync(samplesPath, 'utf-8'));
  const outDir = path.join(__dirname, 'out', 'samples');

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const manifest: Record<string, any> = {};

  for (const sample of samples.samples) {
    try {
      console.log(`\n[${sample.category}] ${sample.name}`);
      console.log(`URL: ${sample.url}`);

      // Extract image
      const imageUrl = await extractImageFromUrl(sample.url);
      const productName = await extractProductName(sample.url);
      console.log(`Image: ${imageUrl}`);
      console.log(`Product: ${productName}`);

      // Generate 3D model
      console.log('Generating 3D model via Tripo...');
      const modelUrl = await generateTripoModel(imageUrl, productName);
      console.log(`Model: ${modelUrl}`);

      // Download GLB
      const sampleDir = path.join(outDir, sample.name.replace(/\s+/g, '_'));
      if (!fs.existsSync(sampleDir)) {
        fs.mkdirSync(sampleDir, { recursive: true });
      }

      const response = await fetch(modelUrl);
      const buffer = await response.arrayBuffer();
      const glbPath = path.join(sampleDir, 'model.glb');
      fs.writeFileSync(glbPath, Buffer.from(buffer));

      manifest[sample.name] = {
        category: sample.category,
        imageUrl,
        productName,
        modelUrl,
        glbPath: path.relative(__dirname, glbPath),
        sizeBytes: buffer.byteLength,
        timestamp: new Date().toISOString(),
      };

      console.log(`✓ Saved: ${(buffer.byteLength / 1024).toFixed(2)} KB`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`✗ Failed: ${sample.name} - ${msg}`);
      manifest[sample.name] = { error: msg };
    }
  }

  // Save manifest
  const manifestPath = path.join(outDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n✓ Manifest saved: ${manifestPath}`);
}

downloadSamples().catch(console.error);
