#!/bin/bash

echo "=== Build Issue Diagnosis ==="

echo "1. Checking Node.js and npm versions..."
node --version
npm --version

echo -e "\n2. Checking if all dependencies are installed..."
if [ ! -d "node_modules" ]; then
  echo "❌ node_modules directory missing - running npm install"
  npm install
else
  echo "✅ node_modules exists"
fi

echo -e "\n3. Checking TypeScript configuration..."
if [ -f "tsconfig.json" ]; then
  echo "✅ tsconfig.json exists"
else
  echo "❌ tsconfig.json missing"
fi

echo -e "\n4. Checking Next.js configuration..."
if [ -f "next.config.ts" ] || [ -f "next.config.js" ]; then
  echo "✅ Next.js config exists"
else
  echo "❌ Next.js config missing"
fi

echo -e "\n5. Testing basic TypeScript compilation..."
timeout 10s npx tsc --noEmit --skipLibCheck || echo "❌ TypeScript compilation timed out or failed"

echo -e "\n6. Testing basic ESLint..."
timeout 10s npx eslint --version || echo "❌ ESLint check failed"

echo -e "\n7. Testing Next.js build with verbose logging..."
timeout 30s NEXT_TELEMETRY_DISABLED=1 NEXT_LOG_LEVEL=debug npx next build 2>&1 | head -20

echo -e "\n=== Diagnosis Complete ==="