const { execSync } = require('child_process');

console.log('Testing TypeScript compilation with different options...\n');

const testOptions = [
  { name: 'No strict checks', cmd: 'npx tsc --noEmit --skipLibCheck src/lib/auth-client.ts' },
  { name: 'With lib only', cmd: 'npx tsc --noEmit --lib es2017,dom src/lib/auth-client.ts' },
  { name: 'With moduleResolution node', cmd: 'npx tsc --noEmit --moduleResolution node src/lib/auth-client.ts' },
  { name: 'Simple mode', cmd: 'npx tsc --noEmit --target es2017 --module esnext src/lib/auth-client.ts' }
];

for (const test of testOptions) {
  console.log(`Testing: ${test.name}`);
  try {
    const result = execSync(test.cmd, {
      timeout: 8000,
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log(`✅ ${test.name} - Success`);
  } catch (error) {
    console.log(`❌ ${test.name} - Failed:`, error.message.substring(0, 200));
  }
  console.log('');
}

console.log('TypeScript option testing completed');