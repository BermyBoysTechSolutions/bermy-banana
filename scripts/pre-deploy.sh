#!/bin/bash
# Pre-deployment script for Bermy Banana persistence features

echo "🚀 Starting pre-deployment setup..."

# Run database migrations
echo "📊 Running database migrations..."
npx drizzle-kit push

# Check if migrations were successful
if [ $? -eq 0 ]; then
    echo "✅ Database migrations completed successfully"
else
    echo "❌ Database migrations failed"
    exit 1
fi

echo "✅ Pre-deployment setup complete!"
exit 0