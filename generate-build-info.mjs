import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
    // Get Git information
    const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
    const shortHash = execSync('git rev-parse --short=7 HEAD', { encoding: 'utf-8' }).trim();
    const commitDate = execSync('git log -1 --format=%ci', { encoding: 'utf-8' }).trim();

    let branch = 'unknown';
    try {
        branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
    } catch (e) {
        console.warn('Could not get branch name:', e.message);
    }

    const buildInfo = {
        commitHash,
        shortHash,
        commitDate,
        branch,
        buildDate: new Date().toISOString()
    };

    // Write to src/build-info.json
    const outputPath = join(__dirname, 'src', 'build-info.json');
    writeFileSync(outputPath, JSON.stringify(buildInfo, null, 2), 'utf-8');

    console.log('✓ Build info generated successfully');
    console.log(`  Commit: ${shortHash} (${branch})`);
    console.log(`  Date: ${commitDate}`);
} catch (error) {
    console.error('Error generating build info:', error.message);

    // Create a fallback build info if Git is not available
    const fallbackInfo = {
        commitHash: 'development',
        shortHash: 'dev',
        commitDate: new Date().toISOString(),
        branch: 'local',
        buildDate: new Date().toISOString()
    };

    const outputPath = join(__dirname, 'src', 'build-info.json');
    writeFileSync(outputPath, JSON.stringify(fallbackInfo, null, 2), 'utf-8');

    console.log('✓ Fallback build info created');
}
