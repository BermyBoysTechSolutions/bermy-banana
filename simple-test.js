// Simple test to identify what's causing the build to hang
console.log('Starting simple test...');

// Test 1: Basic require
try {
  const path = require('path');
  console.log('✅ Basic require works');
} catch (error) {
  console.log('❌ Basic require failed:', error.message);
}

// Test 2: TypeScript transpilation
try {
  const { execSync } = require('child_process');
  console.log('Testing TypeScript version...');
  const result = execSync('npx tsc --version', { timeout: 5000, encoding: 'utf8' });
  console.log('✅ TypeScript version:', result.trim());
} catch (error) {
  console.log('❌ TypeScript check failed:', error.message);
}

// Test 3: Next.js CLI
try {
  const { execSync } = require('child_process');
  console.log('Testing Next.js version...');
  const result = execSync('npx next --version', { timeout: 5000, encoding: 'utf8' });
  console.log('✅ Next.js version:', result.trim());
} catch (error) {
  console.log('❌ Next.js check failed:', error.message);
}

console.log('Simple test completed successfully');