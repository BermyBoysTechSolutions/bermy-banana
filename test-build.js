const { execSync } = require('child_process');

try {
  console.log('Testing basic Node.js functionality...');
  
  console.log('1. Testing TypeScript compilation on specific files...');
  try {
    execSync('npx tsc --noEmit --skipLibCheck src/hooks/use-generation-persistence.ts', { 
      stdio: 'inherit',
      timeout: 10000 
    });
    console.log('✅ use-generation-persistence.ts compiles successfully');
  } catch (error) {
    console.log('❌ use-generation-persistence.ts has errors:', error.message);
  }
  
  try {
    execSync('npx tsc --noEmit --skipLibCheck src/hooks/use-persistence.tsx', { 
      stdio: 'inherit',
      timeout: 10000 
    });
    console.log('✅ use-persistence.tsx compiles successfully');
  } catch (error) {
    console.log('❌ use-persistence.tsx has errors:', error.message);
  }
  
  console.log('2. Testing imports...');
  const { authClient } = require('./src/lib/auth-client.ts');
  console.log('✅ Auth client imports successfully');
  
  console.log('3. Testing ESLint on fixed files...');
  try {
    execSync('npx eslint src/hooks/use-generation-persistence.ts --fix --max-warnings=0', { 
      stdio: 'inherit',
      timeout: 5000 
    });
    console.log('✅ use-generation-persistence.ts passes ESLint');
  } catch (error) {
    console.log('❌ ESLint errors in use-generation-persistence.ts');
  }
  
  console.log('\n✅ Basic build test completed');
  
} catch (error) {
  console.error('❌ Build test failed:', error.message);
  process.exit(1);
}