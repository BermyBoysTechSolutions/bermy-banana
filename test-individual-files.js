const { execSync } = require('child_process');

const filesToTest = [
  'src/lib/utils.ts',
  'src/lib/auth-client.ts',
  'src/lib/types/persistence.ts',
  'src/hooks/use-generation-persistence.ts',
  'src/hooks/use-persistence.tsx'
];

console.log('Testing individual file compilation...\n');

for (const file of filesToTest) {
  console.log(`Testing: ${file}`);
  try {
    const result = execSync(`npx tsc --noEmit --skipLibCheck --strict ${file}`, {
      timeout: 10000,
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log(`✅ ${file} compiles successfully`);
  } catch (error) {
    console.log(`❌ ${file} compilation failed:`);
    console.log(error.stdout || error.stderr || error.message);
  }
  console.log('');
}

console.log('Individual file testing completed');