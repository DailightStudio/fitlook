import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface Manifest {
  [key: string]: {
    category: string;
    imageUrl: string;
    productName: string;
    modelUrl: string;
    glbPath: string;
    sizeBytes: number;
    timestamp: string;
    error?: string;
  };
}

function log(msg: string) {
  console.log(`[WEIGHT TRANSFER] ${msg}`);
}

function main() {
  const samplesDir = path.join(__dirname, 'out', 'samples');
  const manifestPath = path.join(samplesDir, 'manifest.json');

  if (!fs.existsSync(manifestPath)) {
    log('✗ manifest.json not found. Run: npm run spike:download');
    process.exit(1);
  }

  const manifest: Manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  const mannequinPath = path.join(__dirname, 'assets', 'rigged-figure.glb');

  if (!fs.existsSync(mannequinPath)) {
    log('✗ mannequin not found: ' + mannequinPath);
    process.exit(1);
  }

  const blenderPath = process.env.BLENDER_PATH || 'blender';
  const results: Record<string, any> = {};

  for (const [sampleName, data] of Object.entries(manifest)) {
    if (data.error) {
      log(`⊘ Skipping ${sampleName} (download failed)`);
      continue;
    }

    try {
      const glbPath = path.join(samplesDir, data.glbPath);
      const sampleDir = path.dirname(glbPath);
      const outPath = path.join(sampleDir, 'fitted_garment.glb');

      log(`\n[${sampleName}]`);
      log(`  Input: ${glbPath}`);
      log(`  Category: ${data.category}`);

      const cmd = `blender -b -P spike/weight_transfer_spike.py -- "${glbPath}" "${outPath}" "${data.category}"`;

      log('  Running Blender...');
      execSync(cmd, { stdio: 'inherit' });

      if (!fs.existsSync(outPath)) {
        throw new Error(`Output not created: ${outPath}`);
      }

      const fileSize = fs.statSync(outPath).size;
      results[sampleName] = {
        status: 'success',
        outputPath: path.relative(__dirname, outPath),
        sizeBytes: fileSize,
      };

      log(`  ✓ Output: ${outPath} (${(fileSize / 1024).toFixed(2)}KB)`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      log(`  ✗ Failed: ${sampleName} - ${msg}`);
      results[sampleName] = { status: 'failed', error: msg };
    }
  }

  const resultsPath = path.join(samplesDir, 'fit_results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  log(`\n✓ Results saved: ${resultsPath}`);
}

main();
