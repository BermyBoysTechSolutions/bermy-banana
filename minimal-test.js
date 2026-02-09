const { execSync } = require('child_process');

console.log('Testing with minimal TypeScript options...\n');

// Test 1: Very basic compilation
console.log('Test 1: Basic TypeScript check (no strict mode)');
try {
  const result = execSync('npx tsc --version', {
    timeout: 5000,
    encoding: 'utf8'
  });
  console.log('✅ TypeScript available:', result.trim());
} catch (error) {
  console.log('❌ TypeScript not available:', error.message);
}

// Test 2: Check if the issue is with better-auth
console.log('\nTest 2: Checking better-auth installation');
try {
  const betterAuthPath = require.resolve('better-auth');
  console.log('✅ better-auth found at:', betterAuthPath);
} catch (error) {
  console.log('❌ better-auth not found:', error.message);
}

// Test 3: Try to import the auth client directly
console.log('\nTest 3: Testing direct import');
try {
  const fs = require('fs');
  const authClientContent = fs.readFileSync('src/lib/auth-client.ts', 'utf8');
  console.log('✅ auth-client.ts content length:', authClientContent.length, 'chars');
  console.log('First 200 chars:', authClientContent.substring(0, 200));
} catch (error) {
  console.log('❌ Cannot read auth-client.ts:', error.message);
}

console.log('\nMinimal test completed');